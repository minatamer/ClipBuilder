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
  const create = vi.fn(() => worker as unknown as Worker);
  const processor = new BrowserSourceProcessor(create);
  const emit = (data: SourceMessage) =>
    events.dispatchEvent(new MessageEvent("message", { data }));
  const job = () => worker.postMessage.mock.calls[0]![0].jobId as string;
  return { processor, worker, emit, job, create };
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
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

const audioCommand = {
  action: "extract-audio",
  file: new Blob([new Uint8Array(4)]),
  profile: "opus-webm",
  sourceDurationMs: 15_000,
} as const;
const audioResult = {
  profile: "opus-webm",
  file: new Blob([new Uint8Array(4)], { type: "audio/webm" }),
  sourceDurationMs: 15_000,
  sourceFirstSampleMs: 0,
  sourceLastSampleMs: 15_000,
  presentationDurationMs: 15_000,
  decodedFirstSampleMs: 0,
  decodedLastSampleMs: 15_000,
  decodedSampleRate: 48_000,
  bytes: 4,
} as const;

describe("strict audio worker lifecycle", () => {
  it("rejects extra fields before sending an extraction request", async () => {
    const f = fixture();
    const command = { ...audioCommand, url: "https://invalid.example" };
    await expect(
      f.processor.run(command, new AbortController().signal),
    ).rejects.toMatchObject({ code: "unsupported" });
    expect(f.worker.postMessage).not.toHaveBeenCalled();
    expect(f.create).not.toHaveBeenCalled();
    await f.processor.stop();
  });
  it("receives measured phases and resolves only after scratch cleanup acknowledgement", async () => {
    const f = fixture();
    const progress = vi.fn();
    const result = f.processor.run(
      audioCommand,
      new AbortController().signal,
      undefined,
      progress,
    );
    f.emit({
      jobId: f.job(),
      type: "audio-progress",
      progress: { phase: "encoding", processedMs: 15_000, bytes: 4 },
    });
    f.emit({
      jobId: f.job(),
      type: "audio-progress",
      progress: { phase: "validating", processedMs: 15_000, bytes: 4 },
    });
    f.emit({ jobId: f.job(), type: "result", result: { audio: audioResult } });
    f.emit({ jobId: f.job(), type: "stopped" });
    expect((await result).audio).toEqual(audioResult);
    expect(progress).toHaveBeenCalledTimes(2);
    await f.processor.stop();
  });
  it("rejects valid-looking evidence for a different source duration", async () => {
    vi.useFakeTimers();
    const f = fixture();
    const result = f.processor.run(audioCommand, new AbortController().signal);
    const rejected = expect(result).rejects.toMatchObject({
      code: "unavailable",
    });
    f.emit({
      jobId: f.job(),
      type: "audio-progress",
      progress: { phase: "validating", processedMs: 15_000, bytes: 4 },
    });
    f.emit({
      jobId: f.job(),
      type: "result",
      result: {
        audio: {
          ...audioResult,
          sourceDurationMs: 30_000,
          sourceLastSampleMs: 30_000,
          decodedLastSampleMs: 30_000,
          presentationDurationMs: 30_000,
        },
      },
    });
    await vi.advanceTimersByTimeAsync(1000);
    await rejected;
    await f.processor.stop();
    expect(f.worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not let duplicate progress conceal a stall and terminates the worker", async () => {
    vi.useFakeTimers();
    const f = fixture();
    const result = f.processor.run(audioCommand, new AbortController().signal);
    const rejected = expect(result).rejects.toMatchObject({
      code: "unavailable",
    });
    for (let index = 0; index < 3; index++) {
      await vi.advanceTimersByTimeAsync(5000);
      f.emit({
        jobId: f.job(),
        type: "audio-progress",
        progress: { phase: "encoding", processedMs: 0, bytes: 0 },
      });
    }
    await vi.advanceTimersByTimeAsync(6000);
    await rejected;
    await f.processor.stop();
    expect(f.worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("bounds cancellation even when the worker ignores the abort command", async () => {
    vi.useFakeTimers();
    const f = fixture();
    const controller = new AbortController();
    const progress = vi.fn();
    const result = f.processor.run(
      audioCommand,
      controller.signal,
      undefined,
      progress,
    );
    const rejected = expect(result).rejects.toMatchObject({ code: "canceled" });
    controller.abort();
    f.emit({
      jobId: f.job(),
      type: "audio-progress",
      progress: { phase: "validating", processedMs: 15_000, bytes: 4 },
    });
    expect(progress).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    await rejected;
    await f.processor.stop();
    expect(f.worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("rejects a second result before the worker acknowledges cleanup", async () => {
    vi.useFakeTimers();
    const f = fixture();
    const work = f.processor.run(audioCommand, new AbortController().signal);
    const rejected = expect(work).rejects.toMatchObject({
      code: "unavailable",
    });
    f.emit({
      jobId: f.job(),
      type: "audio-progress",
      progress: { phase: "validating", processedMs: 15_000, bytes: 4 },
    });
    f.emit({ jobId: f.job(), type: "result", result: { audio: audioResult } });
    f.emit({ jobId: f.job(), type: "result", result: { audio: audioResult } });
    await vi.advanceTimersByTimeAsync(1000);
    await rejected;
    await f.processor.stop();
    expect(f.worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("enforces the overall deadline even while measured progress advances", async () => {
    vi.useFakeTimers();
    const f = fixture();
    const work = f.processor.run(audioCommand, new AbortController().signal);
    const rejected = expect(work).rejects.toMatchObject({
      code: "unavailable",
    });
    for (let index = 1; index <= 15; index++) {
      await vi.advanceTimersByTimeAsync(19_000);
      f.emit({
        jobId: f.job(),
        type: "audio-progress",
        progress: { phase: "encoding", processedMs: index * 10, bytes: 0 },
      });
    }
    await vi.advanceTimersByTimeAsync(16_000);
    await rejected;
    await f.processor.stop();
    expect(f.worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("fails closed on a freeze and removes suspension listeners after draining", async () => {
    vi.useFakeTimers();
    const page = new EventTarget();
    vi.stubGlobal("document", page);
    vi.stubGlobal("window", new EventTarget());
    const f = fixture();
    const work = f.processor.run(audioCommand, new AbortController().signal);
    const rejected = expect(work).rejects.toMatchObject({ code: "canceled" });
    page.dispatchEvent(new Event("freeze"));
    await vi.advanceTimersByTimeAsync(1000);
    await rejected;
    await f.processor.stop();
    const count = f.worker.postMessage.mock.calls.length;
    page.dispatchEvent(new Event("freeze"));
    expect(f.worker.postMessage).toHaveBeenCalledTimes(count);
    expect(f.worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
