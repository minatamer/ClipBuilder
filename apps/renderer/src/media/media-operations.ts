import { mkdtemp, rm, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import type { Writable } from "node:stream";
import {
  TEMPORARY_MEDIA_LIMITS,
  ANALYSIS_AUDIO_PROFILE,
  type MediaBinding,
  type MediaPrepareRequest,
  type MediaRenderRequest,
  mediaPrepareResponseSchema,
  mediaRenderResponseSchema,
  mediaSelectResponseSchema,
  type MediaSelectRequest,
  type MediaPreviewRequest,
  mediaPreviewResponseSchema,
  type MediaPreviewAccess,
  mediaByteRange,
  type RendererFailureStage,
} from "@clipbuilder/contracts";
import { MediaSessions } from "../expiry/media-sessions.js";
import type { IntentRecord } from "../expiry/temporary-intent.js";
import { MediaFailure } from "./media.failure.js";
import type { MediaPipeline } from "./node-pipeline.js";
import { measureScratchBytes } from "./scratch-usage.js";
import { fileChecksum } from "./inspection.js";
export class MediaOperations {
  private active: {
    binding: MediaBinding;
    controller: AbortController;
    done: Promise<unknown>;
  } | null = null;
  private dispatches = 0;
  private stopped = false;
  private pendingScratch: string | null = null;
  private scratchRemoval: Promise<void> | null = null;
  private readonly streams = new Map<
    string,
    { binding: MediaBinding; controller: AbortController; done: Promise<void> }
  >();
  constructor(
    readonly sessions: MediaSessions,
    private readonly pipeline: MediaPipeline,
    private readonly now: () => number,
    private readonly removeScratch: (directory: string) => Promise<void> = (
      directory,
    ) =>
      rm(directory, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 100,
      }),
  ) {}
  get counts() {
    return { media: this.dispatches, ai: 0 };
  }
  async preview(request: MediaPreviewRequest, signal: AbortSignal) {
    return this.owned(
      request.binding,
      signal,
      async (directory, owned, record, stage) => {
        const intent = record.intent,
          input = join(directory, "source"),
          output = join(directory, "preview.mp4");
        stage("download");
        await this.sessions.store.download(
          request.binding.sessionId,
          intent.sourceId,
          request.generation,
          input,
          owned,
        );
        stage("inspect");
        const source = await this.pipeline.inspect(input, owned);
        if (JSON.stringify(source) !== JSON.stringify(intent.source))
          throw new MediaFailure("invalid");
        stage("proxy_encode");
        await this.pipeline.proxy(input, output, owned, request.range);
        stage("artifact_upload");
        const artifact = await this.sessions.store.upload(
          request.binding.sessionId,
          randomUUID(),
          output,
          intent.expiresAtMs,
          owned,
        );
        const result = mediaPreviewResponseSchema.parse({
          binding: request.binding,
          manifestHash: request.manifestHash,
          range: request.range,
          artifact,
          expiresAtMs: intent.expiresAtMs,
        });
        owned.throwIfAborted();
        stage("intent_commit");
        await this.sessions.previewed(request, result);
        return result;
      },
      () => this.sessions.claimPreview(request),
    );
  }
  previewContent(
    input: MediaPreviewAccess,
    range: string | undefined,
    destination: Writable,
    signal: AbortSignal,
    headers: (status: number, fields: Record<string, string>) => void,
  ) {
    return this.artifactContent(
      "preview",
      input,
      range,
      destination,
      signal,
      headers,
    );
  }
  outputContent(
    input: MediaPreviewAccess,
    range: string | undefined,
    destination: Writable,
    signal: AbortSignal,
    headers: (status: number, fields: Record<string, string>) => void,
  ) {
    return this.artifactContent(
      "output",
      input,
      range,
      destination,
      signal,
      headers,
    );
  }
  private async artifactContent(
    kind: "preview" | "output",
    input: MediaPreviewAccess,
    range: string | undefined,
    destination: Writable,
    signal: AbortSignal,
    headers: (status: number, fields: Record<string, string>) => void,
  ) {
    const key = randomUUID(),
      sessionId = input.binding.sessionId;
    this.assertIntakeReady();
    if (
      [...this.streams.values()].filter(
        (s) => s.binding.sessionId === sessionId,
      ).length >= 4 ||
      this.streams.size >= TEMPORARY_MEDIA_LIMITS.maxSessions * 4
    )
      throw new MediaFailure("busy");
    const controller = new AbortController();
    let finished = () => {};
    const done = new Promise<void>((resolve) => {
      finished = resolve;
    });
    this.streams.set(key, { binding: input.binding, controller, done });
    try {
      const descriptor =
          kind === "preview"
            ? await this.sessions.previewArtifact(input)
            : await this.sessions.outputArtifact(input),
        artifact =
          "artifact" in descriptor ? descriptor.artifact : descriptor.output,
        bytes = artifact.bytes;
      let selected;
      try {
        selected = mediaByteRange(range, bytes);
      } catch {
        throw new MediaFailure("invalid");
      }
      const owned = AbortSignal.any([
        signal,
        controller.signal,
        AbortSignal.timeout(
          Math.max(1, Math.min(60_000, descriptor.expiresAtMs - this.now())),
        ),
      ]);
      owned.throwIfAborted();
      headers(selected.partial ? 206 : 200, {
        "Content-Type": "video/mp4",
        "Content-Length": String(selected.end - selected.start + 1),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...(selected.partial
          ? {
              "Content-Range": `bytes ${selected.start}-${selected.end}/${bytes}`,
            }
          : {}),
      });
      await this.sessions.store.stream(
        sessionId,
        artifact.artifactId,
        artifact.generation,
        selected,
        destination,
        owned,
      );
    } finally {
      this.streams.delete(key);
      finished();
    }
  }
  assertIntakeReady() {
    if (this.stopped) throw new MediaFailure("busy");
    if (this.pendingScratch) throw new MediaFailure("cleanup_pending");
  }
  private async retryScratchCleanup() {
    if (this.scratchRemoval) return this.scratchRemoval;
    const directory = this.pendingScratch;
    if (!directory) return;
    this.scratchRemoval = Promise.resolve()
      .then(() => this.removeScratch(directory))
      .then(() => {
        if (this.pendingScratch === directory) this.pendingScratch = null;
      })
      .catch(() => {
        throw new MediaFailure("cleanup_pending");
      })
      .finally(() => {
        this.scratchRemoval = null;
      });
    return this.scratchRemoval;
  }
  async sweep() {
    let scratchUnresolved = 0;
    try {
      await this.retryScratchCleanup();
    } catch {
      scratchUnresolved = 1;
    }
    const result = await this.sessions.sweep();
    return { ...result, unresolved: result.unresolved + scratchUnresolved };
  }
  private async finishScratchCleanup(directory: string, binding: MediaBinding) {
    this.pendingScratch = directory;
    try {
      await this.retryScratchCleanup();
    } catch {
      await this.sessions.store
        .withSignal(
          AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.sweepDeadlineMs),
          () => this.sessions.terminate(binding),
        )
        .catch(() => undefined);
      throw new MediaFailure("cleanup_pending", "cleanup");
    }
  }
  async shutdown() {
    this.stopped = true;
    const streams = [...this.streams.values()];
    for (const stream of streams) stream.controller.abort();
    await Promise.allSettled(streams.map((stream) => stream.done));
    const active = this.active;
    if (active) {
      active.controller.abort();
      try {
        await active.done;
      } catch {
        /* already fenced */
      }
      await this.sessions.terminate(active.binding);
    }
    await this.retryScratchCleanup();
  }
  private async owned<T>(
    binding: MediaBinding,
    signal: AbortSignal,
    work: (
      directory: string,
      signal: AbortSignal,
      record: IntentRecord,
      stage: (value: RendererFailureStage) => void,
    ) => Promise<T>,
    claim?: () => Promise<IntentRecord>,
  ): Promise<T> {
    this.assertIntakeReady();
    if (this.active) throw new MediaFailure("busy");
    if (this.sessions.blocked) throw new MediaFailure("cleanup_pending");
    const controller = new AbortController();
    const externalAbort = () => controller.abort();
    signal.addEventListener("abort", externalAbort, { once: true });
    if (signal.aborted) controller.abort();
    let stage: RendererFailureStage = "claim";
    let directory: string | undefined,
      timer: ReturnType<typeof setTimeout> | undefined,
      monitor: ReturnType<typeof setInterval> | undefined;
    let check: Promise<void> | undefined;
    const promise = this.sessions.store.withSignal(
      controller.signal,
      async () => {
        const record = claim
          ? await claim()
          : await this.sessions.store.getIntent(binding.sessionId);
        if (!record) throw new MediaFailure("conflict");
        timer = setTimeout(
          () => controller.abort(),
          Math.max(
            1,
            Math.min(
              TEMPORARY_MEDIA_LIMITS.workDeadlineMs,
              record.intent.expiresAtMs - this.now(),
            ),
          ),
        );
        if (claim) this.dispatches++;
        try {
          stage = "scratch";
          controller.signal.throwIfAborted();
          directory = await mkdtemp(join(tmpdir(), "clipbuilder-media-"));
          monitor = setInterval(() => {
            if (check || !directory) return;
            check = measureScratchBytes(directory)
              .then((bytes) => {
                if (bytes > TEMPORARY_MEDIA_LIMITS.scratchBytes)
                  controller.abort();
              })
              .catch(() => controller.abort())
              .finally(() => {
                check = undefined;
              });
          }, 250);
          return await work(directory, controller.signal, record, (value) => {
            stage = value;
          });
        } catch (error) {
          await this.sessions.store.withSignal(
            AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.sweepDeadlineMs),
            () => this.sessions.terminate(binding),
          );
          throw new MediaFailure(
            controller.signal.aborted ? "canceled" : "media_failed",
            stage,
            error instanceof MediaFailure ? error.code : undefined,
          );
        }
      },
    );
    this.active = { binding, controller, done: promise };
    try {
      return await promise;
    } catch (error) {
      if (error instanceof MediaFailure && !error.stage)
        throw new MediaFailure(error.code, stage, error.underlyingCode);
      if (error instanceof MediaFailure) throw error;
      throw new MediaFailure("media_failed", stage);
    } finally {
      if (timer) clearTimeout(timer);
      if (monitor) clearInterval(monitor);
      signal.removeEventListener("abort", externalAbort);
      await check;
      try {
        if (directory) await this.finishScratchCleanup(directory, binding);
      } finally {
        this.active = null;
      }
    }
  }
  prepare(request: MediaPrepareRequest, signal: AbortSignal) {
    return this.owned(
      request.binding,
      signal,
      async (directory, innerSignal, record, stage) => {
        const input = join(directory, "source"),
          proxy = join(directory, "analysis.m4a");
        stage("download");
        await this.sessions.store.download(
          request.binding.sessionId,
          record.intent.sourceId,
          request.generation,
          input,
          innerSignal,
        );
        stage("inspect");
        const source = await this.pipeline.inspect(input, innerSignal);
        if (
          source.fingerprint !== request.binding.fingerprint ||
          source.bytes !== record.intent.expectedBytes
        )
          throw new MediaFailure("invalid");
        stage("audio_extract");
        await this.pipeline.audio(input, proxy, innerSignal);
        stage("artifact_upload");
        const analysisProxy = await this.sessions.store.upload(
          request.binding.sessionId,
          randomUUID(),
          proxy,
          record.intent.expiresAtMs,
          innerSignal,
          ANALYSIS_AUDIO_PROFILE.contentType,
        );
        const result = mediaPrepareResponseSchema.parse({
          source,
          analysisAudio: analysisProxy,
          audioProfile: ANALYSIS_AUDIO_PROFILE,
        });
        innerSignal.throwIfAborted();
        stage("intent_commit");
        await this.sessions.prepared(request.binding, request.nonce, result);
        return result;
      },
      () => this.sessions.claimPrepare(request),
    );
  }
  analysisProxy(
    binding: MediaBinding,
    signal: AbortSignal,
    kind: "audio" | "video",
  ) {
    return this.owned(
      binding,
      signal,
      async (directory, innerSignal, _record, stage) => {
        stage("claim");
        const reference = await this.sessions.analysisProxy(binding, kind);
        if (reference.bytes > TEMPORARY_MEDIA_LIMITS.proxyBytes)
          throw new MediaFailure("invalid");
        const path = join(directory, "analysis.mp4");
        stage("download");
        await this.sessions.store.download(
          binding.sessionId,
          reference.artifactId,
          reference.generation,
          path,
          innerSignal,
        );
        stage("inspect");
        if (
          (await stat(path)).size !== reference.bytes ||
          (await fileChecksum(path, innerSignal)) !== reference.checksum
        )
          throw new MediaFailure("invalid");
        return readFile(path, { signal: innerSignal });
      },
    );
  }
  select(request: MediaSelectRequest, signal: AbortSignal) {
    return this.owned(
      request.binding,
      signal,
      async (directory, innerSignal, record, stage) => {
        const input = join(directory, "source"),
          proxy = join(directory, "selected-proxy.mp4");
        stage("download");
        await this.sessions.store.download(
          request.binding.sessionId,
          record.intent.sourceId,
          request.generation,
          input,
          innerSignal,
        );
        stage("inspect");
        const source = await this.pipeline.inspect(input, innerSignal);
        if (JSON.stringify(source) !== JSON.stringify(record.intent.source))
          throw new MediaFailure("invalid");
        stage("proxy_encode");
        await this.pipeline.proxy(input, proxy, innerSignal, request.range);
        stage("artifact_upload");
        const analysisProxy = await this.sessions.store.upload(
          request.binding.sessionId,
          randomUUID(),
          proxy,
          record.intent.expiresAtMs,
          innerSignal,
        );
        const result = mediaSelectResponseSchema.parse({
          source,
          analysisProxy,
          range: request.range,
        });
        innerSignal.throwIfAborted();
        stage("intent_commit");
        await this.sessions.selected(request.binding, request.nonce, result);
        return result;
      },
      () => this.sessions.claimSelected(request),
    );
  }
  releaseAnalysisProxy(binding: MediaBinding, signal: AbortSignal) {
    return this.sessions.store.withSignal(signal, () =>
      this.sessions.releaseAnalysisProxy(binding),
    );
  }
  render(request: MediaRenderRequest, signal: AbortSignal) {
    return this.owned(
      request.binding,
      signal,
      async (directory, innerSignal, record, stage) => {
        const input = join(directory, "source"),
          output = join(directory, "output.mp4");
        stage("download");
        await this.sessions.store.download(
          request.binding.sessionId,
          record.intent.sourceId,
          record.intent.sourceGeneration!,
          input,
          innerSignal,
        );
        stage("inspect");
        const source = await this.pipeline.inspect(input, innerSignal);
        if (source.fingerprint !== request.binding.fingerprint)
          throw new MediaFailure("invalid");
        stage("render");
        await this.pipeline.render(
          input,
          output,
          request.manifest,
          directory,
          innerSignal,
        );
        const expiresAtMs = Math.min(
          record.intent.expiresAtMs,
          this.now() + TEMPORARY_MEDIA_LIMITS.outputTtlMs,
        );
        stage("artifact_upload");
        const artifact = await this.sessions.store.upload(
          request.binding.sessionId,
          randomUUID(),
          output,
          expiresAtMs,
          innerSignal,
        );
        const result = mediaRenderResponseSchema.parse({
          manifestHash: request.manifestHash,
          output: artifact,
          expiresAtMs,
        });
        innerSignal.throwIfAborted();
        stage("intent_commit");
        await this.sessions.publish(request.binding, request.nonce, result);
        return result;
      },
      () => this.sessions.claimRender(request),
    );
  }
  async cancel(binding: MediaBinding) {
    const active = this.active;
    const matching =
      active &&
      active.binding.sessionId === binding.sessionId &&
      active.binding.sourceRevision === binding.sourceRevision &&
      active.binding.fingerprint === binding.fingerprint;
    try {
      await this.sessions.terminate(binding);
    } finally {
      if (matching) active.controller.abort();
      // Capture after the terminal commit: streams may arrive while storage awaits.
      const streams = [...this.streams.values()].filter(
        (stream) =>
          stream.binding.sessionId === binding.sessionId &&
          stream.binding.sourceRevision === binding.sourceRevision &&
          stream.binding.fingerprint === binding.fingerprint,
      );
      for (const stream of streams) stream.controller.abort();
      await Promise.allSettled(streams.map((stream) => stream.done));
    }
    if (matching) {
      try {
        await active.done;
      } catch {
        /* failure is already fenced */
      }
      await this.sessions.terminate(binding);
    }
  }
}
