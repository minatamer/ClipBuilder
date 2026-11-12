export const MEDIA_PREVIEW_ATTEMPT_MS = 30_000;
const RETRY_LIMIT_MS = 30_000;
const FAILURE_WINDOW_MS = 60_000;

const watchers = new Set<() => void>();
const wake = () => {
  for (const watcher of watchers) watcher();
};
function watch(callback: () => void) {
  if (!watchers.size && typeof window !== "undefined") {
    window.addEventListener("online", wake);
    window.addEventListener("focus", wake);
    document.addEventListener("visibilitychange", wake);
  }
  watchers.add(callback);
  return () => {
    watchers.delete(callback);
    if (!watchers.size && typeof window !== "undefined") {
      window.removeEventListener("online", wake);
      window.removeEventListener("focus", wake);
      document.removeEventListener("visibilitychange", wake);
    }
  };
}

/** Retry only existing media reads. One pending timer, capped backoff, no AI work. */
export function createPreviewRecovery(retry: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unwatch: (() => void) | undefined;
  let pending = false,
    disposed = false,
    failures = 0;
  let lastFailure = -Infinity,
    due = 0;
  const clear = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  const available = () =>
    (typeof document === "undefined" ||
      document.visibilityState !== "hidden") &&
    (typeof navigator === "undefined" || navigator.onLine !== false);
  const arm = () => {
    clear();
    if (disposed || !pending || !available()) return;
    timer = setTimeout(
      () => {
        timer = undefined;
        if (disposed || !pending || !available()) return;
        pending = false;
        unwatch?.();
        unwatch = undefined;
        retry();
      },
      Math.max(0, due - Date.now()),
    );
  };
  return {
    fail() {
      if (disposed || pending) return;
      const now = Date.now();
      if (now - lastFailure > FAILURE_WINDOW_MS) failures = 0;
      lastFailure = now;
      const delay = Math.min(
        RETRY_LIMIT_MS,
        1000 * 2 ** Math.min(failures++, 5),
      );
      due = now + delay;
      pending = true;
      unwatch = watch(arm);
      arm();
    },
    ready() {
      pending = false;
      clear();
      unwatch?.();
      unwatch = undefined;
    },
    dispose() {
      disposed = true;
      pending = false;
      clear();
      unwatch?.();
      unwatch = undefined;
    },
  };
}
