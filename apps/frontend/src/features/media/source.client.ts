import { LocalMediaError } from "./media.errors";
import { reportBrowserDiagnostic } from "../diagnostics/browser.diagnostics";
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
    private readonly reportWorkerFailure: () => void = () => {
      void reportBrowserDiagnostic({
        kind: "browser-console",
        level: "error",
        source: "worker-error",
        argumentCount: 0,
      });
    },
  ) {}

  run(
    command: Omit<SourceCommand, "jobId">,
    signal: AbortSignal,
    progress?: (bytes: number) => void,
  ): Promise<SourceResult> {
    if (this.active || this.stopping)
      return Promise.reject(new LocalMediaError("busy"));
    if (signal.aborted) return Promise.reject(new LocalMediaError("canceled"));
    const id = crypto.randomUUID();
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
      const deadline = setTimeout(() => {
        rejectWork(new LocalMediaError("unavailable"));
        void this.stop();
      }, 120_000);
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
          worker.removeEventListener("error", workerError);
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
      const workerError = (event: Event) => {
        event.preventDefault();
        try {
          this.reportWorkerFailure();
        } catch {
          // A failed private sink cannot change the failure or strand the worker.
        }
        failure();
      };
      this.active = {
        id,
        settled,
        stop: () => {
          clearTimeout(deadline);
          signal.removeEventListener("abort", abort);
          worker.removeEventListener("message", message);
          worker.removeEventListener("error", workerError);
          stopped();
        },
        reject: rejectWork,
      };
      worker.addEventListener("message", message);
      worker.addEventListener("error", workerError);
      signal.addEventListener("abort", abort, { once: true });
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
