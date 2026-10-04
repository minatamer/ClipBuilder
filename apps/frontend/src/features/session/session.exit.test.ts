import { describe, expect, it, vi } from "vitest";
import { exitClippingSession, finishPendingExit } from "./session.exit";
import {
  SESSION_CLEANUP_KEY,
  SESSION_PROJECTION_KEY,
  SESSION_ABANDONED_KEY,
} from "./session.persistence";

function fixture() {
  const values = new Map([
    [SESSION_PROJECTION_KEY, "synthetic"],
    [SESSION_CLEANUP_KEY, "required"],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  const transport = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 204 }),
  );
  return { values, storage, transport, stop: vi.fn(), navigate: vi.fn() };
}

describe("visitor session exit", () => {
  it("returns home and resets the session while deletion remains pending", async () => {
    const f = fixture();
    let finish = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const cleanup = vi.fn(() => pending);
    await exitClippingSession({ ...f, cleanup });
    expect(f.stop).toHaveBeenCalledOnce();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(f.navigate).toHaveBeenCalledOnce();
    expect(f.values.size).toBe(0);
    expect(f.transport).toHaveBeenCalledWith(
      "/api/session/exit",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
      }),
    );
    finish();
  });
  it("failed deletion and failed cookie transport never require visitor recovery", async () => {
    const f = fixture();
    f.transport.mockRejectedValueOnce(new Error("offline"));
    await exitClippingSession({
      ...f,
      cleanup: async () => {
        throw new Error("storage");
      },
    });
    expect(f.navigate).toHaveBeenCalledOnce();
    expect(f.values.has(SESSION_PROJECTION_KEY)).toBe(false);
    expect(f.values.has(SESSION_CLEANUP_KEY)).toBe(false);
    await finishPendingExit(f.storage, f.transport);
    expect(f.transport).toHaveBeenCalledTimes(2);
    expect(f.values.size).toBe(0);
  });
  it("retains a private epoch fence when physical cleanup cannot persist its tombstone", async () => {
    const f = fixture();
    await exitClippingSession({
      ...f,
      workspaceEpoch: "synthetic-epoch",
      cleanup: async () => {
        throw new Error("storage-denied");
      },
    });
    expect(f.values.get(SESSION_ABANDONED_KEY)).toBe("synthetic-epoch");
    expect(f.values.has(SESSION_PROJECTION_KEY)).toBe(false);
    expect(f.navigate).toHaveBeenCalledOnce();
  });
  it("storage denial and rejected cookie reset still navigate", async () => {
    const f = fixture();
    f.transport.mockResolvedValueOnce(new Response(null, { status: 503 }));
    const storage = {
      ...f.storage,
      setItem: () => {
        throw new Error("denied");
      },
    };
    await exitClippingSession({ ...f, storage, cleanup: async () => {} });
    expect(f.navigate).toHaveBeenCalledOnce();
    expect(f.values.has(SESSION_PROJECTION_KEY)).toBe(false);
    expect(f.values.has(SESSION_CLEANUP_KEY)).toBe(false);
  });
});
