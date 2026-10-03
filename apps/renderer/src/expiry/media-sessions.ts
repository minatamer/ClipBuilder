import { createHash, randomUUID } from "node:crypto";
import {
  TEMPORARY_MEDIA_LIMITS,
  mediaUploadRequestSchema,
  mediaPrepareRequestSchema,
  mediaRenderRequestSchema,
  mediaSelectRequestSchema,
  mediaPreviewRequestSchema,
  mediaPreviewResponseSchema,
  mediaPreviewAccessSchema,
  type MediaPreviewRequest,
  type MediaPreviewResponse,
  type MediaPreviewAccess,
  type MediaSelectRequest,
  type MediaSelectResponse,
  type MediaBinding,
  type MediaUploadRequest,
  type MediaPrepareRequest,
  type MediaRenderRequest,
  type MediaPrepareResponse,
  type MediaRenderResponse,
} from "@clipbuilder/contracts";
import { MediaFailure } from "../media/media.failure.js";
import { UploadCapabilityCipher } from "./upload-capability.js";
import type { IntentRecord, TemporaryMediaStore } from "./temporary-intent.js";

function sameBinding(a: MediaBinding, b: MediaBinding) {
  return (
    a.sessionId === b.sessionId &&
    a.sourceRevision === b.sourceRevision &&
    a.fingerprint === b.fingerprint
  );
}
export class MediaSessions {
  private cleanupBlocked = false;
  constructor(
    readonly store: TemporaryMediaStore,
    private readonly cipher: UploadCapabilityCipher,
    private readonly now: () => number,
  ) {}
  get blocked() {
    return this.cleanupBlocked;
  }
  async admit(input: MediaUploadRequest) {
    const request = mediaUploadRequestSchema.parse(input);
    if (this.cleanupBlocked) throw new MediaFailure("cleanup_pending");
    const entries = await this.store.listIntents();
    if (
      entries.some(
        (e) =>
          e.intent.cleanupPending ||
          e.intent.expiresAtMs <= this.now() ||
          (e.intent.phase === "complete" &&
            (e.intent.outputExpiresAtMs ?? 0) <= this.now()),
      )
    ) {
      this.cleanupBlocked = true;
      throw new MediaFailure("cleanup_pending");
    }
    if (entries.length >= TEMPORARY_MEDIA_LIMITS.maxSessions)
      throw new MediaFailure("busy");
    if (await this.store.getIntent(request.binding.sessionId))
      throw new MediaFailure("conflict");
    let record = await this.store.saveIntent(
      {
        version: 1,
        binding: request.binding,
        expiresAtMs: this.now() + TEMPORARY_MEDIA_LIMITS.sessionTtlMs,
        expectedBytes: request.bytes,
        contentType: request.contentType,
        sourceId: randomUUID(),
        preview: null,
        phase: "uploading",
        encryptedUpload: null,
        nonce: null,
        manifestHash: null,
        source: null,
        sourceGeneration: null,
        analysisProxy: null,
        selectedRange: null,
        output: null,
        outputExpiresAtMs: null,
        cleanupPending: false,
        cleanupAttempts: 0,
        nextCleanupAtMs: 0,
      },
      "0",
    );
    let url: string | undefined;
    try {
      url = await this.store.beginUpload(record.intent);
      record = await this.store.saveIntent(
        {
          ...record.intent,
          encryptedUpload: this.cipher.encrypt(url, request.binding.sessionId),
        },
        record.generation,
      );
      return { uploadUrl: url, expiresAtMs: record.intent.expiresAtMs };
    } catch {
      if (url) {
        try {
          await this.store.cancelUpload(url);
        } catch {
          this.cleanupBlocked = true;
        }
      }
      await this.terminate(request.binding);
      throw new MediaFailure("media_failed");
    }
  }
  private async active(binding: MediaBinding): Promise<IntentRecord> {
    const record = await this.store.getIntent(binding.sessionId);
    if (!record || !sameBinding(record.intent.binding, binding))
      throw new MediaFailure("conflict");
    if (record.intent.expiresAtMs <= this.now())
      throw new MediaFailure("expired");
    if (record.intent.phase === "terminal") throw new MediaFailure("canceled");
    return record;
  }
  async claimPrepare(input: MediaPrepareRequest): Promise<IntentRecord> {
    const request = mediaPrepareRequestSchema.parse(input),
      record = await this.active(request.binding);
    if (this.cleanupBlocked) throw new MediaFailure("cleanup_pending");
    if (record.intent.phase !== "uploading") throw new MediaFailure("conflict");
    const metadata = await this.store.artifactMetadata(
      request.binding.sessionId,
      record.intent.sourceId,
      request.generation,
    );
    if (
      metadata.bytes !== record.intent.expectedBytes ||
      metadata.contentType !== record.intent.contentType
    )
      throw new MediaFailure("invalid");
    if (record.intent.encryptedUpload)
      await this.store.cancelUpload(
        this.cipher.decrypt(
          record.intent.encryptedUpload,
          request.binding.sessionId,
        ),
      );
    return this.store.saveIntent(
      {
        ...record.intent,
        phase: "preparing",
        nonce: request.nonce,
        sourceGeneration: request.generation,
        encryptedUpload: null,
      },
      record.generation,
    );
  }
  async prepared(
    binding: MediaBinding,
    nonce: string,
    result: MediaPrepareResponse,
  ): Promise<void> {
    const record = await this.active(binding);
    if (
      record.intent.phase !== "preparing" ||
      record.intent.nonce !== nonce ||
      result.source.fingerprint !== binding.fingerprint ||
      result.source.bytes !== record.intent.expectedBytes
    )
      throw new MediaFailure("conflict");
    await this.store.saveIntent(
      {
        ...record.intent,
        phase: "prepared",
        source: result.source,
        analysisProxy: result.analysisProxy,
      },
      record.generation,
    );
  }
  async claimPreview(input: MediaPreviewRequest) {
    const request = mediaPreviewRequestSchema.parse(input),
      record = await this.active(request.binding),
      intent = record.intent;
    if (
      intent.phase !== "prepared" ||
      !intent.source ||
      intent.analysisProxy ||
      intent.preview ||
      intent.sourceGeneration !== request.generation ||
      JSON.stringify(intent.selectedRange) !== JSON.stringify(request.range)
    )
      throw new MediaFailure("conflict");
    return this.store.saveIntent(
      {
        ...intent,
        phase: "previewing",
        nonce: request.nonce,
        manifestHash: request.manifestHash,
      },
      record.generation,
    );
  }
  async previewed(request: MediaPreviewRequest, value: MediaPreviewResponse) {
    const response = mediaPreviewResponseSchema.parse(value),
      record = await this.active(request.binding);
    if (
      record.intent.phase !== "previewing" ||
      record.intent.nonce !== request.nonce ||
      record.intent.manifestHash !== response.manifestHash ||
      !sameBinding(response.binding, request.binding) ||
      JSON.stringify(response.range) !==
        JSON.stringify(record.intent.selectedRange) ||
      response.expiresAtMs !== record.intent.expiresAtMs
    )
      throw new MediaFailure("conflict");
    await this.store.saveIntent(
      { ...record.intent, phase: "prepared", preview: response.artifact },
      record.generation,
    );
  }
  async previewArtifact(input: MediaPreviewAccess) {
    const request = mediaPreviewAccessSchema.parse(input),
      record = await this.active(request.binding),
      intent = record.intent;
    if (
      intent.phase !== "prepared" ||
      !intent.preview ||
      !intent.selectedRange ||
      intent.manifestHash !== request.manifestHash
    )
      throw new MediaFailure("conflict");
    const meta = await this.store.artifactMetadata(
      request.binding.sessionId,
      intent.preview.artifactId,
      intent.preview.generation,
    );
    if (meta.bytes !== intent.preview.bytes || meta.contentType !== "video/mp4")
      throw new MediaFailure("invalid");
    return mediaPreviewResponseSchema.parse({
      ...request,
      artifact: intent.preview,
      range: intent.selectedRange,
      expiresAtMs: intent.expiresAtMs,
    });
  }
  async claimRender(input: MediaRenderRequest): Promise<IntentRecord> {
    const request = mediaRenderRequestSchema.parse(input),
      record = await this.active(request.binding);
    if (this.cleanupBlocked) throw new MediaFailure("cleanup_pending");
    const source = record.intent.source,
      planned = request.manifest.source;
    if (
      record.intent.phase !== "prepared" ||
      !source ||
      !record.intent.sourceGeneration ||
      source.fingerprint !== planned.fingerprint ||
      source.width !== planned.width ||
      source.height !== planned.height ||
      source.durationMs !== planned.durationMs ||
      createHash("sha256")
        .update(JSON.stringify(request.manifest))
        .digest("hex") !== request.manifestHash
    )
      throw new MediaFailure("conflict");
    return this.store.saveIntent(
      {
        ...record.intent,
        phase: "rendering",
        nonce: request.nonce,
        manifestHash: request.manifestHash,
      },
      record.generation,
    );
  }
  async claimSelected(input: MediaSelectRequest): Promise<IntentRecord> {
    const request = mediaSelectRequestSchema.parse(input),
      record = await this.active(request.binding);
    if (this.cleanupBlocked) throw new MediaFailure("cleanup_pending");
    if (
      record.intent.phase !== "prepared" ||
      !record.intent.source ||
      record.intent.analysisProxy ||
      record.intent.selectedRange ||
      record.intent.sourceGeneration !== request.generation ||
      request.range.endMs > record.intent.source.durationMs
    )
      throw new MediaFailure("conflict");
    return this.store.saveIntent(
      {
        ...record.intent,
        phase: "selecting",
        selectedRange: request.range,
        nonce: request.nonce,
      },
      record.generation,
    );
  }
  async selected(
    binding: MediaBinding,
    nonce: string,
    result: MediaSelectResponse,
  ) {
    const record = await this.active(binding);
    if (
      record.intent.phase !== "selecting" ||
      record.intent.nonce !== nonce ||
      JSON.stringify(record.intent.selectedRange) !==
        JSON.stringify(result.range) ||
      JSON.stringify(record.intent.source) !== JSON.stringify(result.source)
    )
      throw new MediaFailure("conflict");
    await this.store.saveIntent(
      {
        ...record.intent,
        phase: "prepared",
        analysisProxy: result.analysisProxy,
      },
      record.generation,
    );
  }
  async analysisProxy(binding: MediaBinding) {
    const record = await this.active(binding);
    if (record.intent.phase !== "prepared" || !record.intent.analysisProxy)
      throw new MediaFailure("conflict");
    return record.intent.analysisProxy;
  }
  async releaseAnalysisProxy(binding: MediaBinding) {
    const record = await this.active(binding);
    if (record.intent.phase !== "prepared") throw new MediaFailure("conflict");
    const proxy = record.intent.analysisProxy;
    if (!proxy) return;
    try {
      await this.store.deleteArtifact(
        binding.sessionId,
        proxy.artifactId,
        proxy.generation,
      );
      await this.store.saveIntent(
        { ...record.intent, analysisProxy: null },
        record.generation,
      );
    } catch {
      this.cleanupBlocked = true;
      await this.terminate(binding);
      throw new MediaFailure("cleanup_pending");
    }
  }
  async publish(
    binding: MediaBinding,
    nonce: string,
    result: MediaRenderResponse,
  ): Promise<void> {
    const record = await this.active(binding);
    if (
      record.intent.phase !== "rendering" ||
      record.intent.nonce !== nonce ||
      record.intent.manifestHash !== result.manifestHash ||
      result.expiresAtMs >
        Math.min(
          this.now() + TEMPORARY_MEDIA_LIMITS.outputTtlMs,
          record.intent.expiresAtMs,
        )
    )
      throw new MediaFailure("conflict");
    const published = await this.store.saveIntent(
      {
        ...record.intent,
        phase: "complete",
        output: result.output,
        outputExpiresAtMs: result.expiresAtMs,
        encryptedUpload: null,
        cleanupPending: true,
      },
      record.generation,
    );
    await this.cleanup(published);
  }
  async terminate(binding: MediaBinding): Promise<void> {
    const record = await this.store.getIntent(binding.sessionId);
    if (!record) return;
    if (!sameBinding(record.intent.binding, binding))
      throw new MediaFailure("conflict");
    if (record.intent.phase === "terminal") {
      await this.cleanup(record);
      return;
    }
    const terminal = await this.store.saveIntent(
      { ...record.intent, phase: "terminal", cleanupPending: true },
      record.generation,
    );
    await this.cleanup(terminal);
  }
  private async cleanup(record: IntentRecord): Promise<void> {
    const { intent } = record,
      sessionId = intent.binding.sessionId;
    try {
      if (intent.encryptedUpload)
        await this.store.cancelUpload(
          this.cipher.decrypt(intent.encryptedUpload, sessionId),
        );
      const keepOutput =
        intent.phase === "complete" &&
        intent.expiresAtMs > this.now() &&
        (intent.outputExpiresAtMs ?? 0) > this.now();
      const objects = await this.store.listArtifacts(sessionId);
      if (objects.length > TEMPORARY_MEDIA_LIMITS.maxObjectsPerSession)
        throw new MediaFailure("cleanup_pending");
      for (const object of objects) {
        if (
          keepOutput &&
          object.artifactId === intent.output?.artifactId &&
          object.generation === intent.output.generation
        )
          continue;
        await this.store.deleteArtifact(
          sessionId,
          object.artifactId,
          object.generation,
        );
      }
      const remaining = await this.store.listArtifacts(sessionId);
      if (
        remaining.some(
          (o) =>
            !keepOutput ||
            o.artifactId !== intent.output?.artifactId ||
            o.generation !== intent.output.generation,
        )
      )
        throw new MediaFailure("cleanup_pending");
      const current = await this.store.getIntent(sessionId);
      if (!current || current.generation !== record.generation)
        throw new MediaFailure("conflict");
      if (
        intent.expiresAtMs <= this.now() ||
        (intent.phase === "complete" && !keepOutput)
      )
        await this.store.deleteIntent(sessionId, record.generation);
      else
        await this.store.saveIntent(
          {
            ...intent,
            encryptedUpload: null,
            cleanupPending: false,
            cleanupAttempts: 0,
            nextCleanupAtMs: 0,
          },
          record.generation,
        );
    } catch {
      this.cleanupBlocked = true;
      try {
        await this.store.saveIntent(
          {
            ...intent,
            cleanupPending: true,
            cleanupAttempts: Math.min(1_000_000, intent.cleanupAttempts + 1),
            nextCleanupAtMs:
              this.now() + (intent.cleanupAttempts === 0 ? 900_000 : 1_800_000),
          },
          record.generation,
        );
      } catch {
        /* A concurrent fence or unavailable storage never counts as cleanup. */
      }
      throw new MediaFailure("cleanup_pending");
    }
  }
  async sweep(): Promise<{ sessions: number; unresolved: number }> {
    const entries = await this.store.listIntents();
    if (entries.length > TEMPORARY_MEDIA_LIMITS.maxSessions) {
      this.cleanupBlocked = true;
      throw new MediaFailure("cleanup_pending");
    }
    let unresolved = 0;
    try {
      await this.store.assertDisposable();
    } catch {
      unresolved++;
    }
    for (const entry of entries) {
      const intent = entry.intent;
      // A preparing/rendering intent after restart is uncertain, never replayed.
      if (
        intent.cleanupPending ||
        intent.expiresAtMs <= this.now() ||
        (intent.phase === "complete" &&
          (intent.outputExpiresAtMs ?? 0) <= this.now()) ||
        intent.phase === "terminal"
      ) {
        if (intent.nextCleanupAtMs > this.now()) {
          unresolved++;
          continue;
        }
        try {
          await this.cleanup(entry);
        } catch {
          unresolved++;
        }
      }
    }
    try {
      for (const object of await this.store.expiredArtifacts(this.now())) {
        await this.store.deleteArtifact(
          object.sessionId,
          object.artifactId,
          object.generation,
        );
      }
    } catch {
      unresolved++;
    }
    this.cleanupBlocked = unresolved > 0;
    return { sessions: entries.length, unresolved };
  }
}
