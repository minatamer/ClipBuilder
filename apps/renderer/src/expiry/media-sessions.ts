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
  mediaOutputResponseSchema,
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
import {
  CleanupDiagnostics,
  type CleanupTrace,
} from "./cleanup-diagnostics.js";

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
    private readonly diagnostics = new CleanupDiagnostics(),
  ) {}
  get blocked() {
    return this.cleanupBlocked;
  }
  async admit(
    input: MediaUploadRequest,
    signal?: AbortSignal,
    uploadOrigin?: string,
  ) {
    const trace = this.diagnostics.trace("admission");
    return trace.step("admission", () =>
      this.admitReady(input, trace, signal, uploadOrigin),
    );
  }
  private async admitReady(
    input: MediaUploadRequest,
    trace: CleanupTrace,
    signal?: AbortSignal,
    uploadOrigin?: string,
  ) {
    const request = mediaUploadRequestSchema.parse(input);
    signal?.throwIfAborted();
    let entries = await trace.step("intent_list", () =>
      this.store.listIntents(),
    );
    if (this.cleanupBlocked || this.cleanupRequired(entries)) {
      trace.record("intake_check", "blocked", {
        ...this.inventory(entries),
        reason: this.cleanupBlocked
          ? "process_cleanup_blocked"
          : "cleanup_required",
      });
      const result = await trace.step(
        "recovery",
        () => this.sweep(trace),
        (summary) => summary,
      );
      if (result.unresolved) {
        trace.record("intake_check", "blocked", {
          ...result,
          reason: "cleanup_unresolved",
        });
        throw new MediaFailure("cleanup_pending");
      }
      entries = await trace.step("intent_list", () => this.store.listIntents());
    }
    signal?.throwIfAborted();
    if (this.cleanupRequired(entries)) {
      this.cleanupBlocked = true;
      trace.record("intake_check", "blocked", {
        ...this.inventory(entries),
        reason: "cleanup_required",
      });
      throw new MediaFailure("cleanup_pending");
    }
    if (entries.length >= TEMPORARY_MEDIA_LIMITS.maxSessions) {
      trace.record("intake_check", "blocked", {
        sessions: entries.length,
        reason: "capacity_limit",
      });
      throw new MediaFailure("busy");
    }
    trace.record("intake_check", "succeeded", this.inventory(entries));
    if (
      await trace.step("duplicate_check", () =>
        this.store.getIntent(request.binding.sessionId),
      )
    )
      throw new MediaFailure("conflict");
    let record = await trace.step("intent_create", () =>
      this.store.saveIntent(
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
          mediaOperationsUsed: 0,
        },
        "0",
      ),
    );
    let url: string | undefined;
    try {
      signal?.throwIfAborted();
      url = await trace.step("upload_allocate", () =>
        this.store.beginUpload(record.intent, uploadOrigin),
      );
      signal?.throwIfAborted();
      const capability = url;
      record = await trace.step("intent_update", () =>
        this.store.saveIntent(
          {
            ...record.intent,
            encryptedUpload: this.cipher.encrypt(
              capability,
              request.binding.sessionId,
            ),
          },
          record.generation,
        ),
      );
      signal?.throwIfAborted();
      return { uploadUrl: url, expiresAtMs: record.intent.expiresAtMs };
    } catch {
      await this.store.withSignal(
        AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.sweepDeadlineMs),
        async () => {
          if (url) {
            try {
              const capability = url;
              await trace.step("upload_cancel", () =>
                this.store.cancelUpload(capability),
              );
            } catch {
              this.cleanupBlocked = true;
            }
          }
          await this.terminate(request.binding);
        },
      );
      throw new MediaFailure("media_failed");
    }
  }
  private inventory(entries: IntentRecord[]) {
    const now = this.now();
    return {
      sessions: entries.length,
      expired: entries.filter(({ intent }) => intent.expiresAtMs <= now).length,
      pending: entries.filter(({ intent }) => intent.cleanupPending).length,
      outputExpired: entries.filter(
        ({ intent }) =>
          intent.phase === "complete" && (intent.outputExpiresAtMs ?? 0) <= now,
      ).length,
      terminal: entries.filter(({ intent }) => intent.phase === "terminal")
        .length,
    };
  }
  private cleanupRequired(entries: IntentRecord[]) {
    const counts = this.inventory(entries);
    return counts.expired > 0 || counts.pending > 0 || counts.outputExpired > 0;
  }
  private async active(binding: MediaBinding): Promise<IntentRecord> {
    const record = await this.store.getIntent(binding.sessionId);
    if (!record || !sameBinding(record.intent.binding, binding))
      throw new MediaFailure("conflict");
    if (record.intent.contentType !== "video/mp4")
      throw new MediaFailure("invalid");
    if (record.intent.expiresAtMs <= this.now())
      throw new MediaFailure("expired");
    if (record.intent.phase === "terminal") throw new MediaFailure("canceled");
    return record;
  }
  private claimOperation(record: IntentRecord, next: IntentRecord["intent"]) {
    if (
      record.intent.mediaOperationsUsed >=
      TEMPORARY_MEDIA_LIMITS.maxOperationsPerSession
    )
      throw new MediaFailure("budget");
    return this.store.saveIntent(
      {
        ...next,
        mediaOperationsUsed: record.intent.mediaOperationsUsed + 1,
      },
      record.generation,
    );
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
    return this.claimOperation(record, {
      ...record.intent,
      phase: "preparing",
      nonce: request.nonce,
      sourceGeneration: request.generation,
      encryptedUpload: null,
    });
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
        analysisProxy: result.analysisAudio,
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
    return this.claimOperation(record, {
      ...intent,
      phase: "previewing",
      nonce: request.nonce,
      manifestHash: request.manifestHash,
    });
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
      (record.intent.manifestHash !== null &&
        record.intent.manifestHash !== request.manifestHash) ||
      (record.intent.selectedRange !== null &&
        JSON.stringify(record.intent.selectedRange) !==
          JSON.stringify(request.manifest.range)) ||
      source.fingerprint !== planned.fingerprint ||
      source.width !== planned.width ||
      source.height !== planned.height ||
      source.durationMs !== planned.durationMs ||
      createHash("sha256")
        .update(JSON.stringify(request.manifest))
        .digest("hex") !== request.manifestHash
    )
      throw new MediaFailure("conflict");
    return this.claimOperation(record, {
      ...record.intent,
      phase: "rendering",
      nonce: request.nonce,
      manifestHash: request.manifestHash,
    });
  }
  async outputArtifact(input: MediaPreviewAccess) {
    const request = mediaPreviewAccessSchema.parse(input),
      record = await this.active(request.binding),
      intent = record.intent;
    if (
      intent.phase !== "complete" ||
      intent.cleanupPending ||
      !intent.output ||
      intent.manifestHash !== request.manifestHash ||
      (intent.outputExpiresAtMs ?? 0) <= this.now()
    )
      throw new MediaFailure("conflict");
    const metadata = await this.store.artifactMetadata(
      request.binding.sessionId,
      intent.output.artifactId,
      intent.output.generation,
    );
    if (
      metadata.contentType !== "video/mp4" ||
      metadata.bytes !== intent.output.bytes
    )
      throw new MediaFailure("invalid");
    return mediaOutputResponseSchema.parse({
      ...request,
      output: intent.output,
      expiresAtMs: intent.outputExpiresAtMs,
    });
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
    return this.claimOperation(record, {
      ...record.intent,
      phase: "selecting",
      selectedRange: request.range,
      nonce: request.nonce,
    });
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
  async analysisProxy(binding: MediaBinding, kind: "audio" | "video") {
    const record = await this.active(binding);
    if (
      record.intent.phase !== "prepared" ||
      !record.intent.analysisProxy ||
      (kind === "video") !== (record.intent.selectedRange !== null)
    )
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
  private async cleanup(
    record: IntentRecord,
    trace = this.diagnostics.trace("cleanup"),
  ): Promise<void> {
    return trace.step("cleanup", () => this.cleanupReady(record, trace));
  }
  private async cleanupReady(
    record: IntentRecord,
    trace: CleanupTrace,
  ): Promise<void> {
    const { intent } = record,
      sessionId = intent.binding.sessionId;
    try {
      if (intent.encryptedUpload) {
        const encryptedUpload = intent.encryptedUpload;
        await trace.step("upload_cancel", () =>
          this.store.cancelUpload(
            this.cipher.decrypt(encryptedUpload, sessionId),
          ),
        );
      }
      const keepOutput =
        intent.phase === "complete" &&
        intent.expiresAtMs > this.now() &&
        (intent.outputExpiresAtMs ?? 0) > this.now();
      const objects = await trace.step("artifact_list", () =>
        this.store.listArtifacts(sessionId),
      );
      trace.record("artifact_list", "succeeded", { artifacts: objects.length });
      if (objects.length > TEMPORARY_MEDIA_LIMITS.maxObjectsPerSession) {
        trace.record("artifact_list", "blocked", {
          artifacts: objects.length,
          reason: "artifact_limit",
        });
        throw new MediaFailure("cleanup_pending");
      }
      for (const object of objects) {
        if (
          keepOutput &&
          object.artifactId === intent.output?.artifactId &&
          object.generation === intent.output.generation
        )
          continue;
        await trace.step("artifact_delete", () =>
          this.store.deleteArtifact(
            sessionId,
            object.artifactId,
            object.generation,
          ),
        );
      }
      const remaining = await trace.step("artifact_verify", () =>
        this.store.listArtifacts(sessionId),
      );
      if (
        remaining.some(
          (o) =>
            !keepOutput ||
            o.artifactId !== intent.output?.artifactId ||
            o.generation !== intent.output.generation,
        )
      ) {
        trace.record("artifact_verify", "blocked", {
          artifacts: remaining.length,
          reason: "remaining_artifacts",
        });
        throw new MediaFailure("cleanup_pending");
      }
      const current = await trace.step("intent_fence", () =>
        this.store.getIntent(sessionId),
      );
      if (!current || current.generation !== record.generation) {
        trace.record("intent_fence", "blocked", {
          reason: "generation_conflict",
        });
        throw new MediaFailure("conflict");
      }
      if (
        intent.expiresAtMs <= this.now() ||
        (intent.phase === "complete" && !keepOutput)
      )
        await trace.step("intent_delete", () =>
          this.store.deleteIntent(sessionId, record.generation),
        );
      else
        await trace.step("intent_update", () =>
          this.store.saveIntent(
            {
              ...intent,
              encryptedUpload: null,
              cleanupPending: false,
              cleanupAttempts: 0,
              nextCleanupAtMs: 0,
            },
            record.generation,
          ),
        );
    } catch {
      this.cleanupBlocked = true;
      try {
        await trace.step("retry_journal", () =>
          this.store.saveIntent(
            {
              ...intent,
              cleanupPending: true,
              cleanupAttempts: Math.min(1_000_000, intent.cleanupAttempts + 1),
              nextCleanupAtMs:
                this.now() +
                (intent.cleanupAttempts === 0 ? 900_000 : 1_800_000),
            },
            record.generation,
          ),
        );
      } catch {
        /* A concurrent fence or unavailable storage never counts as cleanup. */
      }
      throw new MediaFailure("cleanup_pending");
    }
  }
  async sweep(
    trace = this.diagnostics.trace("sweep"),
  ): Promise<{ sessions: number; unresolved: number }> {
    return trace.step(
      "sweep",
      () => this.sweepReady(trace),
      (summary) => summary,
    );
  }
  private async sweepReady(
    trace: CleanupTrace,
  ): Promise<{ sessions: number; unresolved: number }> {
    const entries = await trace.step("intent_list", () =>
      this.store.listIntents(),
    );
    trace.record("intent_list", "succeeded", this.inventory(entries));
    if (entries.length > TEMPORARY_MEDIA_LIMITS.maxSessions) {
      this.cleanupBlocked = true;
      trace.record("intake_check", "blocked", {
        sessions: entries.length,
        reason: "journal_limit",
      });
      throw new MediaFailure("cleanup_pending");
    }
    let unresolved = 0;
    try {
      await trace.step("disposable_policy", () =>
        this.store.assertDisposable(),
      );
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
          trace.record("retry_wait", "deferred", {
            reason: "retry_deferred",
            retryAfterMs: Math.min(
              1_800_000,
              intent.nextCleanupAtMs - this.now(),
            ),
          });
          continue;
        }
        try {
          await this.cleanup(entry, trace);
        } catch {
          unresolved++;
        }
      }
    }
    try {
      const orphans = await trace.step("orphan_list", () =>
        this.store.expiredArtifacts(this.now()),
      );
      trace.record("orphan_list", "succeeded", { artifacts: orphans.length });
      for (const object of orphans) {
        await trace.step("orphan_delete", () =>
          this.store.deleteArtifact(
            object.sessionId,
            object.artifactId,
            object.generation,
          ),
        );
      }
    } catch {
      unresolved++;
    }
    this.cleanupBlocked = unresolved > 0;
    return { sessions: entries.length, unresolved };
  }
}
