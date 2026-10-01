import { afterEach, describe, expect, it, vi } from "vitest";
import { BrowserSourceProcessor } from "./source.client";
import type { SourceMessage } from "./source.protocol";

function fixture() {
  const events = new EventTarget();
  const worker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  };
  const processor = new BrowserSourceProcessor(
    () => worker as unknown as Worker,
  );
  const emit = (data: SourceMessage) =>
    events.dispatchEvent(new MessageEvent("message", { data }));
  const job = () => worker.postMessage.mock.calls[0]![0].jobId as string;
  return { processor, worker, emit, job };
}
afterEach(() => vi.useRealTimers());
describe("source worker fencing and cancellation", () => {
  it("waits for stopped before resolving and allows the next command only then", async () => {
    const f = fixture();
    let resolved = false;
    const result = f.processor
      .run({ action: "probe" }, new AbortController().signal)
      .then((value) => {
        resolved = true;
        return value;
      });
    f.emit({ type: "result", jobId: f.job(), result: {} });
    await Promise.resolve();
    expect(resolved).toBe(false);
    await expect(
      f.processor.run({ action: "probe" }, new AbortController().signal),
    ).rejects.toMatchObject({ code: "busy" });
    f.emit({ type: "stopped", jobId: f.job() });
    expect(await result).toEqual({});
    await f.processor.stop();
    expect(f.worker.terminate).toHaveBeenCalledOnce();
  });
  it("ignores stale and non-monotonic progress, fences results after abort", async () => {
    const f = fixture();
    const controller = new AbortController();
    const progress = vi.fn();
    const result = f.processor.run(
      { action: "copy", file: new Blob([new Uint8Array(10)]) },
      controller.signal,
      progress,
    );
    const rejected = expect(result).rejects.toMatchObject({ code: "canceled" });
    f.emit({ type: "progress", jobId: "stale", bytes: 5 });
    for (const bytes of [5, 3, 11, NaN])
      f.emit({ type: "progress", jobId: f.job(), bytes });
    expect(progress.mock.calls).toEqual([[5]]);
    controller.abort();
    f.emit({ type: "result", jobId: f.job(), result: {} });
    f.emit({ type: "stopped", jobId: f.job() });
    await rejected;
    await f.processor.stop();
  });
  it("terminates an unresponsive worker once and removes its listeners/timers", async () => {
    vi.useFakeTimers();
    const f = fixture();
    const result = f.processor.run(
      { action: "probe" },
      new AbortController().signal,
    );
    const rejected = expect(result).rejects.toThrow();
    const a = f.processor.stop();
    const b = f.processor.stop();
    expect(a).toBe(b);
    await vi.advanceTimersByTimeAsync(1000);
    await a;
    await rejected;
    expect(f.worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
