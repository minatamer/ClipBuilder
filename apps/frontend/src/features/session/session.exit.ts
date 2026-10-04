import {
  clearSessionProjection,
  SESSION_CLEANUP_KEY,
  SESSION_ABANDONED_KEY,
  type SessionStoragePort,
} from "./session.persistence";

const EXIT_KEY = "clipbuilder.exit.v1";
function browserStorage(): SessionStoragePort | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

async function resetCookie(
  storage: SessionStoragePort | null,
  transport: typeof fetch,
) {
  const response = await transport("/api/session/exit", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    keepalive: true,
    signal: AbortSignal.timeout(2000),
  });
  try {
    if (!response.ok) throw new Error("exit-unavailable");
  } finally {
    await response.body?.cancel().catch(() => undefined);
  }
  try {
    storage?.removeItem(EXIT_KEY);
  } catch {
    /* Cookie reset already succeeded. */
  }
}

export async function finishPendingExit(
  storage = browserStorage(),
  transport: typeof fetch = fetch,
) {
  let pending = false;
  try {
    pending = !!storage?.getItem(EXIT_KEY);
  } catch {
    // Browser storage denial does not prevent intake.
  }
  // Keep the intent and availability screen until cookie reset is reachable.
  if (pending) await resetCookie(storage, transport);
}

export async function exitClippingSession(input: {
  storage: SessionStoragePort | null;
  stop(): void;
  cleanup(): Promise<void>;
  navigate(): void;
  transport?: typeof fetch;
  workspaceEpoch?: string | undefined;
}) {
  try {
    input.stop();
  } catch {
    /* Workspace cleanup also stops owned work. */
  }
  if (input.storage) {
    const storage = input.storage;
    const operations = [
      () => storage.setItem(EXIT_KEY, "requested"),
      () => {
        if (input.workspaceEpoch)
          storage.setItem(SESSION_ABANDONED_KEY, input.workspaceEpoch);
      },
      () => clearSessionProjection(storage),
      () => storage.removeItem(SESSION_CLEANUP_KEY),
    ];
    for (const operation of operations) {
      try {
        operation();
      } catch {
        /* Attempt the remaining reset operations. */
      }
    }
  }
  // The workspace owns deletion and releases its lease after bounded cleanup.
  void input.cleanup().catch(() => undefined);
  try {
    await resetCookie(input.storage, input.transport ?? fetch);
  } catch {
    // Navigation still works offline. The next entry retries cookie reset.
  } finally {
    input.navigate();
  }
}
