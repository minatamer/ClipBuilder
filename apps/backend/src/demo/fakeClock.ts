export interface Clock {
  now(): Date;
  sleep(milliseconds: number, signal?: AbortSignal): Promise<void>;
}

type Waiter = {
  deadline: number;
  resolve: () => void;
  reject: (error: Error) => void;
  signal?: AbortSignal;
  onAbort?: () => void;
};

function abortError(): Error {
  const error = new Error("The deterministic operation was stopped.");
  error.name = "AbortError";
  return error;
}

export class FakeClock implements Clock {
  #nowMs: number;
  readonly #waiters = new Set<Waiter>();

  constructor(start = new Date("2026-09-29T10:00:00.000Z")) {
    this.#nowMs = start.getTime();
  }

  now(): Date {
    return new Date(this.#nowMs);
  }

  sleep(milliseconds: number, signal?: AbortSignal): Promise<void> {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      return Promise.reject(new Error("Fake-clock delay must be nonnegative."));
    }
    if (signal?.aborted === true) return Promise.reject(abortError());
    if (milliseconds === 0) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const waiter: Waiter = {
        deadline: this.#nowMs + milliseconds,
        resolve,
        reject,
        ...(signal === undefined ? {} : { signal }),
      };
      if (signal !== undefined) {
        waiter.onAbort = () => {
          this.#waiters.delete(waiter);
          reject(abortError());
        };
        signal.addEventListener("abort", waiter.onAbort, { once: true });
      }
      this.#waiters.add(waiter);
    });
  }

  advanceBy(milliseconds: number): void {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      throw new Error("Fake-clock advance must be nonnegative.");
    }
    this.#nowMs += milliseconds;
    const due = [...this.#waiters]
      .filter((waiter) => waiter.deadline <= this.#nowMs)
      .sort((left, right) => left.deadline - right.deadline);
    for (const waiter of due) {
      this.#waiters.delete(waiter);
      if (waiter.onAbort !== undefined && waiter.signal !== undefined) {
        waiter.signal.removeEventListener("abort", waiter.onAbort);
      }
      waiter.resolve();
    }
  }

  get pendingWaitCount(): number {
    return this.#waiters.size;
  }
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  sleep(milliseconds: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted === true) {
        reject(abortError());
        return;
      }
      const timeout = setTimeout(resolve, milliseconds);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timeout);
          reject(abortError());
        },
        { once: true },
      );
    });
  }
}
