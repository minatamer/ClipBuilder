import { LocalMediaError } from "./media.errors";

export interface WorkspaceLease {
  release(): void;
}
export interface WorkspaceLock {
  acquire(signal: AbortSignal): Promise<WorkspaceLease>;
}

export class BrowserWorkspaceLock implements WorkspaceLock {
  constructor(
    private readonly manager: () => LockManager = () => navigator.locks,
    private readonly onReleased: () => void = () => {},
    private readonly notifications: () => BroadcastChannel | null = () =>
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel("clipbuilder.workspace.v1"),
  ) {}
  acquire(signal: AbortSignal): Promise<WorkspaceLease> {
    return new Promise((resolve, reject) => {
      let release: (() => void) | undefined;
      let channel: BroadcastChannel | null = null;
      try {
        channel = this.notifications();
      } catch {
        /* Notifications are never lock authority. */
      }
      const notified = (event: MessageEvent) => {
        if (event.data === "released" && !release && !signal.aborted)
          this.onReleased();
      };
      channel?.addEventListener("message", notified);
      const close = () => {
        channel?.removeEventListener("message", notified);
        channel?.close();
        channel = null;
      };
      const abort = () => {
        signal.removeEventListener("abort", abort);
        close();
        reject(new LocalMediaError("canceled"));
      };
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) {
        abort();
        return;
      }
      let manager: LockManager;
      try {
        manager = this.manager();
      } catch {
        close();
        signal.removeEventListener("abort", abort);
        reject(new LocalMediaError("unavailable"));
        return;
      }
      if (!manager?.request) {
        close();
        signal.removeEventListener("abort", abort);
        reject(new LocalMediaError("unavailable"));
        return;
      }
      void manager
        .request(
          "clipbuilder.workspace.v1",
          { mode: "exclusive", ifAvailable: true },
          async (lock) => {
            if (!lock || signal.aborted) {
              if (signal.aborted) {
                close();
                signal.removeEventListener("abort", abort);
              }
              reject(new LocalMediaError(signal.aborted ? "canceled" : "busy"));
              return;
            }
            // Acquisition cancellation must not release an already owned workspace.
            signal.removeEventListener("abort", abort);
            await new Promise<void>((done) => {
              let released = false;
              release = () => {
                if (released) return;
                released = true;
                try {
                  channel?.postMessage("released");
                } catch {
                  /* Advisory only. */
                }
                close();
                done();
              };
              resolve({ release });
            });
            signal.removeEventListener("abort", abort);
          },
        )
        .catch(() => {
          close();
          signal.removeEventListener("abort", abort);
          reject(new LocalMediaError("unavailable"));
        });
    });
  }
}
