import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import {
  TEMPORARY_MEDIA_LIMITS,
  type MediaBinding,
  type MediaPrepareRequest,
  type MediaRenderRequest,
  mediaPrepareResponseSchema,
  mediaRenderResponseSchema,
} from "@clipbuilder/contracts";
import { MediaSessions } from "../expiry/media-sessions.js";
import { MediaFailure } from "./media.failure.js";
import type { MediaPipeline } from "./node-pipeline.js";
import { measureScratchBytes } from "./scratch-usage.js";
export class MediaOperations {
  private active: {
    binding: MediaBinding;
    controller: AbortController;
    done: Promise<unknown>;
  } | null = null;
  private dispatches = 0;
  private pendingScratch: string | null = null;
  private scratchRemoval: Promise<void> | null = null;
  constructor(
    readonly sessions: MediaSessions,
    private readonly pipeline: MediaPipeline,
    private readonly maxDispatches: number,
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
  assertIntakeReady() {
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
      throw new MediaFailure("cleanup_pending");
    }
  }
  async shutdown() {
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
    work: (directory: string, signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    this.assertIntakeReady();
    if (this.active) throw new MediaFailure("busy");
    if (this.dispatches >= this.maxDispatches || this.sessions.blocked)
      throw new MediaFailure("budget");
    const controller = new AbortController();
    const externalAbort = () => controller.abort();
    signal.addEventListener("abort", externalAbort, { once: true });
    if (signal.aborted) controller.abort();
    let directory: string | undefined,
      timer: ReturnType<typeof setTimeout> | undefined,
      monitor: ReturnType<typeof setInterval> | undefined;
    let check: Promise<void> | undefined;
    const promise = this.sessions.store.withSignal(
      controller.signal,
      async () => {
        const record = await this.sessions.store.getIntent(binding.sessionId);
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
        this.dispatches++;
        try {
          controller.signal.throwIfAborted();
          return await work(directory, controller.signal);
        } catch {
          await this.sessions.store.withSignal(
            AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.sweepDeadlineMs),
            () => this.sessions.terminate(binding),
          );
          throw new MediaFailure(
            controller.signal.aborted ? "canceled" : "media_failed",
          );
        }
      },
    );
    this.active = { binding, controller, done: promise };
    try {
      return await promise;
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
      async (directory, innerSignal) => {
        const record = await this.sessions.claimPrepare(request),
          input = join(directory, "source"),
          proxy = join(directory, "proxy.mp4");
        await this.sessions.store.download(
          request.binding.sessionId,
          record.intent.sourceId,
          request.generation,
          input,
          innerSignal,
        );
        const source = await this.pipeline.inspect(input, innerSignal);
        if (
          source.fingerprint !== request.binding.fingerprint ||
          source.bytes !== record.intent.expectedBytes
        )
          throw new MediaFailure("invalid");
        await this.pipeline.proxy(input, proxy, innerSignal);
        const analysisProxy = await this.sessions.store.upload(
          request.binding.sessionId,
          randomUUID(),
          proxy,
          record.intent.expiresAtMs,
          innerSignal,
        );
        const result = mediaPrepareResponseSchema.parse({
          source,
          analysisProxy,
        });
        innerSignal.throwIfAborted();
        await this.sessions.prepared(request.binding, request.nonce, result);
        return result;
      },
    );
  }
  render(request: MediaRenderRequest, signal: AbortSignal) {
    return this.owned(
      request.binding,
      signal,
      async (directory, innerSignal) => {
        const record = await this.sessions.claimRender(request),
          input = join(directory, "source"),
          output = join(directory, "output.mp4");
        await this.sessions.store.download(
          request.binding.sessionId,
          record.intent.sourceId,
          record.intent.sourceGeneration!,
          input,
          innerSignal,
        );
        const source = await this.pipeline.inspect(input, innerSignal);
        if (source.fingerprint !== request.binding.fingerprint)
          throw new MediaFailure("invalid");
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
        await this.sessions.publish(request.binding, request.nonce, result);
        return result;
      },
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
