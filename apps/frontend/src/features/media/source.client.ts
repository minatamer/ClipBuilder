import { LocalMediaError } from "./media.errors";
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
  ): Promise<SourceResult> {
    if (this.active || this.stopping)
      return Promise.reject(new LocalMediaError("busy"));
    if (signal.aborted) return Promise.reject(new LocalMediaError("canceled"));
    let worker: Worker;
    try {
      worker = this.worker ?? (this.worker = this.create());
    } catch {
      return Promise.reject(new LocalMediaError("unavailable"));
    }
    const id = crypto.randomUUID();
    let stopped: () => void = () => {};
    const settled = new Promise<void>((resolve) => {
      stopped = resolve;
    });
    return new Promise((resolve, reject) => {
      let result: SourceResult | undefined;
      let error: LocalMediaError | undefined;
      let lastBytes = 0;
      const deadline = setTimeout(() => {
        reject(new LocalMediaError("unavailable"));
        void this.stop();
      }, 120_000);
      const abort = () => {
        reject(new LocalMediaError("canceled"));
        try {
          worker.postMessage({ action: "abort", jobId: id });
        } catch {
          void this.stop();
        }
      };
      const message = ({ data }: MessageEvent<SourceMessage>) => {
        if (data.jobId !== id) return;
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
        if (data.type === "result") result = data.result;
        if (data.type === "failed") error = new LocalMediaError(data.code);
        if (data.type === "stopped") {
          clearTimeout(deadline);
          signal.removeEventListener("abort", abort);
          worker.removeEventListener("message", message);
          worker.removeEventListener("error", failure);
          if (this.active?.id === id) this.active = null;
          stopped();
          if (signal.aborted) reject(new LocalMediaError("canceled"));
          else if (error) reject(error);
          else if (result) resolve(result);
          else reject(new LocalMediaError("unavailable"));
        }
      };
      const failure = () => {
        reject(new LocalMediaError("unavailable"));
        void this.stop();
      };
      this.active = {
        id,
        settled,
        stop: () => {
          clearTimeout(deadline);
          signal.removeEventListener("abort", abort);
          worker.removeEventListener("message", message);
          worker.removeEventListener("error", failure);
          stopped();
        },
        reject,
      };
      worker.addEventListener("message", message);
      worker.addEventListener("error", failure);
      signal.addEventListener("abort", abort, { once: true });
      try {
        if (signal.aborted) abort();
        else worker.postMessage({ ...command, jobId: id });
      } catch {
        reject(new LocalMediaError("unavailable"));
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
