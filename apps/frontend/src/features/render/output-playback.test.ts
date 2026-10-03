import { afterEach, describe, expect, it, vi } from "vitest";
import { observeOutputPlayback } from "./output-playback";

function video() {
  return Object.assign(new EventTarget(), {
    readyState: 0,
    videoWidth: 1080,
    videoHeight: 1920,
    duration: 15,
  }) as HTMLVideoElement;
}
afterEach(() => vi.useRealTimers());
describe("bounded output decode and cleanup", () => {
  it("fails a stalled first frame once and removes the deadline on disposal", () => {
    vi.useFakeTimers();
    const element = video(),
      ready = vi.fn(),
      failed = vi.fn();
    const stop = observeOutputPlayback(element, 15_000, ready, failed);
    vi.advanceTimersByTime(30_000);
    element.dispatchEvent(new Event("loadeddata"));
    expect(failed).toHaveBeenCalledTimes(1);
    expect(ready).toHaveBeenCalledTimes(0);
    stop();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("accepts one matching frame but invalidates it on a later media error", () => {
    vi.useFakeTimers();
    const element = video(),
      ready = vi.fn(),
      failed = vi.fn();
    const stop = observeOutputPlayback(element, 15_000, ready, failed);
    Object.assign(element, { readyState: 2 });
    element.dispatchEvent(new Event("loadeddata"));
    element.dispatchEvent(new Event("loadeddata"));
    expect(ready).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    element.dispatchEvent(new Event("error"));
    expect(failed).toHaveBeenCalledTimes(1);
    stop();
  });
  it("rejects the wrong profile without waiting and never announces after cleanup", () => {
    vi.useFakeTimers();
    const element = video(),
      ready = vi.fn(),
      failed = vi.fn();
    Object.assign(element, { readyState: 2, videoWidth: 720 });
    const stop = observeOutputPlayback(element, 15_000, ready, failed);
    expect(failed).toHaveBeenCalledTimes(1);
    stop();
    Object.assign(element, { videoWidth: 1080 });
    element.dispatchEvent(new Event("loadeddata"));
    element.dispatchEvent(new Event("error"));
    vi.advanceTimersByTime(60_000);
    expect(ready).not.toHaveBeenCalled();
    expect(failed).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("disposes a pending wait before unmount, with no later notification", () => {
    vi.useFakeTimers();
    const element = video(),
      failed = vi.fn();
    const stop = observeOutputPlayback(element, 15_000, vi.fn(), failed);
    stop();
    stop();
    element.dispatchEvent(new Event("error"));
    vi.advanceTimersByTime(60_000);
    expect(failed).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
