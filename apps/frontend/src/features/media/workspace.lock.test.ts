import { describe, expect, it, vi } from "vitest";
import { BrowserWorkspaceLock } from "./workspace.lock";

function fixture(available: boolean, beforeGrant?: Promise<void>) {
  const events = new EventTarget();
  const channel = Object.assign(events, {
    postMessage: vi.fn(),
    close: vi.fn(),
  });
  const manager = {
    request: vi.fn(
      async (
        _name: string,
        _options: LockOptions,
        use: (lock: Lock | null) => Promise<void>,
      ) => {
        if (beforeGrant) await beforeGrant;
        await use(
          available
            ? { name: "clipbuilder.workspace.v1", mode: "exclusive" }
            : null,
        );
      },
    ),
  };
  const notified = vi.fn();
  const controller = new AbortController();
  const lock = new BrowserWorkspaceLock(
    () => manager as unknown as LockManager,
    notified,
    () => channel as unknown as BroadcastChannel,
  );
  return { lock, controller, notified, channel, manager };
}
describe("exclusive workspace lock and advisory notifications", () => {
  it("keeps one lease until release and closes its content-free notification channel", async () => {
    const f = fixture(true);
    const lease = await f.lock.acquire(f.controller.signal);
    expect(f.channel.close).not.toHaveBeenCalled();
    lease.release();
    lease.release();
    expect(f.channel.postMessage).toHaveBeenCalledExactlyOnceWith("released");
    expect(f.channel.close).toHaveBeenCalledOnce();
  });
  it("never treats a notification as ownership, and stops listening on disposal", async () => {
    const f = fixture(false);
    await expect(f.lock.acquire(f.controller.signal)).rejects.toMatchObject({
      code: "busy",
    });
    f.channel.dispatchEvent(new MessageEvent("message", { data: "released" }));
    expect(f.notified).toHaveBeenCalledOnce();
    f.controller.abort();
    f.channel.dispatchEvent(new MessageEvent("message", { data: "released" }));
    expect(f.notified).toHaveBeenCalledOnce();
    expect(f.channel.close).toHaveBeenCalledOnce();
    expect(f.channel.postMessage).not.toHaveBeenCalled();
  });
  it("keeps a granted lease when its acquisition signal aborts, until explicit idempotent release", async () => {
    const f = fixture(true);
    const lease = await f.lock.acquire(f.controller.signal);
    f.controller.abort();
    expect(f.channel.close).not.toHaveBeenCalled();
    expect(f.channel.postMessage).not.toHaveBeenCalled();
    lease.release();
    lease.release();
    expect(f.channel.postMessage).toHaveBeenCalledExactlyOnceWith("released");
    expect(f.channel.close).toHaveBeenCalledOnce();
  });
  it("cancels a pending acquisition without retaining a lock delivered afterward", async () => {
    let grant = () => {};
    const pending = new Promise<void>((resolve) => {
      grant = resolve;
    });
    const f = fixture(true, pending);
    const acquisition = f.lock.acquire(f.controller.signal);
    const canceled = expect(acquisition).rejects.toMatchObject({
      code: "canceled",
    });
    f.controller.abort();
    await canceled;
    expect(f.channel.close).toHaveBeenCalledOnce();
    grant();
    await f.manager.request.mock.results[0]!.value;
    expect(f.channel.close).toHaveBeenCalledOnce();
    expect(f.channel.postMessage).not.toHaveBeenCalled();
  });
  it("does not request a lock for an already-aborted acquisition", async () => {
    const f = fixture(true);
    f.controller.abort();
    await expect(f.lock.acquire(f.controller.signal)).rejects.toMatchObject({
      code: "canceled",
    });
    expect(f.manager.request).not.toHaveBeenCalled();
    expect(f.channel.close).toHaveBeenCalledOnce();
    expect(f.channel.postMessage).not.toHaveBeenCalled();
  });
});
