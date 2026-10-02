import { LocalMediaError } from "./media.errors";
import { audioMessageSchema, audioRequestSchema } from "./audio.protocol";
import {
  AUDIO_LIFETIME,
  AUDIO_PROFILES,
  type AudioProgress,
} from "./audio.profile";
import type {
  SourceCommand,
  SourceMessage,
  SourceResult,
} from "./source.protocol";

export interface SourceProcessor {
  run(
    command: Omit<SourceCommand, "jobId">,
    signal: AbortSignal,
    progress?: (bytes: number) => void,
    audioProgress?: (value: AudioProgress) => void,
  ): Promise<SourceResult>;
  stop(): Promise<void>;
}

export class BrowserSourceProcessor implements SourceProcessor {
  private worker: Worker | null = null;
  private active: {
    id: string;
    settled: Promise<void>;
    stop: () => void;
    reject: (error: unknown) => void;
  } | null = null;
  private stopping: Promise<void> | null = null;
  constructor(
    private readonly create: () => Worker = () =>
      new Worker(new URL("./source.worker.ts", import.meta.url), {
        type: "module",
      }),
  ) {}

  run(
    command: Omit<SourceCommand, "jobId">,
    signal: AbortSignal,
    progress?: (bytes: number) => void,
    audioProgress?: (value: AudioProgress) => void,
  ): Promise<SourceResult> {
    if (this.active || this.stopping)
      return Promise.reject(new LocalMediaError("busy"));
    if (signal.aborted) return Promise.reject(new LocalMediaError("canceled"));
    const id = crypto.randomUUID();
    const isAudio = command.action === "extract-audio";
    const audioRequest = isAudio
      ? audioRequestSchema.safeParse({ ...command, jobId: id })
      : null;
    if (audioRequest && !audioRequest.success)
      return Promise.reject(new LocalMediaError("unsupported"));
    const audioCeiling = audioRequest?.success
      ? AUDIO_PROFILES[audioRequest.data.profile].maxBytes
      : 0;
    let worker: Worker;
    try {
      worker = this.worker ?? (this.worker = this.create());
    } catch {
      return Promise.reject(new LocalMediaError("unavailable"));
    }
    let stopped: () => void = () => {};
    const settled = new Promise<void>((resolve) => {
      stopped = resolve;
    });
    return new Promise((resolve, reject) => {
      let draining = false;
      const rejectWork = (reason: unknown) => {
        draining = true;
        reject(reason);
      };
      let result: SourceResult | undefined;
      let error: LocalMediaError | undefined;
      let lastBytes = 0;
      let lastPhase: AudioProgress["phase"] = "encoding";
      let lastProcessedMs = 0;
      let lastActivity = Date.now();
      let stall: ReturnType<typeof setTimeout> | undefined;
      const armStall = () => {
        if (stall) clearTimeout(stall);
        if (isAudio) stall = setTimeout(failure, AUDIO_LIFETIME.stallMs);
      };
      const deadline = setTimeout(
        () => {
          rejectWork(new LocalMediaError("unavailable"));
          void this.stop();
        },
        isAudio ? AUDIO_LIFETIME.deadlineMs : 120_000,
      );
      const abort = () => {
        rejectWork(new LocalMediaError("canceled"));
        try {
          worker.postMessage({ action: "abort", jobId: id });
        } catch {
          void this.stop();
        }
        void this.stop();
      };
      const message = ({ data }: MessageEvent<SourceMessage>) => {
        if (!data || typeof data !== "object") {
          failure();
          return;
        }
        if (data.jobId !== id) return;
        if (draining && data.type !== "stopped") return;
        if (
          isAudio &&
          (!audioMessageSchema.safeParse(data).success ||
            (!draining && Date.now() - lastActivity >= AUDIO_LIFETIME.stallMs))
        ) {
          failure();
          return;
        }
        if (data.type === "audio-progress" && isAudio && !signal.aborted) {
          const value = data.progress;
          if (
            result !== undefined ||
            (lastPhase === "validating" && value.phase !== "validating") ||
            value.processedMs > (command.sourceDurationMs ?? 0) ||
            value.bytes > audioCeiling ||
            value.bytes < lastBytes ||
            (value.phase === lastPhase && value.processedMs < lastProcessedMs)
          ) {
            failure();
            return;
          }
          const advanced =
            value.phase !== lastPhase ||
            value.processedMs > lastProcessedMs ||
            value.bytes > lastBytes;
          lastBytes = value.bytes;
          lastPhase = value.phase;
          lastProcessedMs = value.processedMs;
          if (advanced) {
            lastActivity = Date.now();
            armStall();
          }
          try {
            audioProgress?.(value);
          } catch {
            failure();
          }
        }
        if (
          data.type === "progress" &&
          !signal.aborted &&
          Number.isSafeInteger(data.bytes) &&
          data.bytes >= lastBytes &&
          data.bytes <= (command.file?.size ?? 0)
        ) {
          lastBytes = data.bytes;
          progress?.(data.bytes);
        }
        if (data.type === "result") {
          if (
            isAudio &&
            (result !== undefined ||
              data.result.audio?.profile !== command.profile ||
              data.result.audio?.sourceDurationMs !==
                command.sourceDurationMs ||
              lastPhase !== "validating")
          ) {
            failure();
            return;
          }
          result = data.result;
        }
        if (data.type === "failed") error = new LocalMediaError(data.code);
        if (data.type === "stopped") {
          clearTimeout(deadline);
          if (stall) clearTimeout(stall);
          signal.removeEventListener("abort", abort);
          worker.removeEventListener("message", message);
          worker.removeEventListener("error", failure);
          if (isAudio && typeof document !== "undefined")
            document.removeEventListener("freeze", abort);
          if (isAudio && typeof window !== "undefined")
            window.removeEventListener("pagehide", abort);
          if (this.active?.id === id) this.active = null;
          stopped();
          if (signal.aborted) reject(new LocalMediaError("canceled"));
          else if (error) reject(error);
          else if (result) resolve(result);
          else reject(new LocalMediaError("unavailable"));
        }
      };
      const failure = () => {
        rejectWork(new LocalMediaError("unavailable"));
        void this.stop();
      };
      this.active = {
        id,
        settled,
        stop: () => {
          clearTimeout(deadline);
          if (stall) clearTimeout(stall);
          signal.removeEventListener("abort", abort);
          worker.removeEventListener("message", message);
          worker.removeEventListener("error", failure);
          if (isAudio && typeof document !== "undefined")
            document.removeEventListener("freeze", abort);
          if (isAudio && typeof window !== "undefined")
            window.removeEventListener("pagehide", abort);
          stopped();
        },
        reject: rejectWork,
      };
      worker.addEventListener("message", message);
      worker.addEventListener("error", failure);
      signal.addEventListener("abort", abort, { once: true });
      if (isAudio && typeof document !== "undefined")
        document.addEventListener("freeze", abort);
      if (isAudio && typeof window !== "undefined")
        window.addEventListener("pagehide", abort);
      armStall();
      try {
        if (signal.aborted) abort();
        else worker.postMessage({ ...command, jobId: id });
      } catch {
        rejectWork(new LocalMediaError("unavailable"));
        void this.stop();
      }
    });
  }

  stop(): Promise<void> {
    if (this.stopping) return this.stopping;
    this.stopping = this.stopWorker().finally(() => {
      this.stopping = null;
    });
    return this.stopping;
  }

  private async stopWorker(): Promise<void> {
    const active = this.active;
    if (active) {
      active.reject(new LocalMediaError("canceled"));
      try {
        this.worker?.postMessage({ action: "abort", jobId: active.id });
      } catch {
        active.stop();
      }
      let timer: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([
        active.settled,
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 1000);
        }),
      ]);
      if (timer) clearTimeout(timer);
      active.stop();
    }
    this.worker?.terminate();
    this.worker = null;
    this.active = null;
  }
}
