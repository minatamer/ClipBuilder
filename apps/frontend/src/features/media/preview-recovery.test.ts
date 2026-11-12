import { expect, it, vi } from "vitest";
import { createPreviewRecovery } from "./preview-recovery";

it("deduplicates failures, backs off continuously to thirty seconds and cancels cleanly", async () => {
  vi.useFakeTimers();
  const retry = vi.fn();
  const recovery = createPreviewRecovery(retry);
  try {
    for (const [index, delay] of [
      1000, 2000, 4000, 8000, 16000, 30000, 30000,
    ].entries()) {
      recovery.fail();
      recovery.fail();
      expect(vi.getTimerCount()).toBe(1);
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(retry).toHaveBeenCalledTimes(index);
      await vi.advanceTimersByTimeAsync(1);
      expect(retry).toHaveBeenCalledTimes(index + 1);
    }
    recovery.fail();
    recovery.dispose();
    await vi.advanceTimersByTimeAsync(60000);
    expect(retry).toHaveBeenCalledTimes(7);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    recovery.dispose();
    vi.useRealTimers();
  }
});

it("suspends offline/hidden recovery and resumes when visible and online", async () => {
  vi.useFakeTimers();
  const windowEvents = new EventTarget();
  const documentEvents = Object.assign(new EventTarget(), {
    visibilityState: "hidden",
  });
  const network = { onLine: false };
  vi.stubGlobal("window", windowEvents);
  vi.stubGlobal("document", documentEvents);
  vi.stubGlobal("navigator", network);
  const retry = vi.fn();
  const recovery = createPreviewRecovery(retry);
  try {
    recovery.fail();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(5000);
    documentEvents.visibilityState = "visible";
    documentEvents.dispatchEvent(new Event("visibilitychange"));
    expect(vi.getTimerCount()).toBe(0);
    network.onLine = true;
    windowEvents.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);
    expect(retry).toHaveBeenCalledTimes(1);
    recovery.fail();
    recovery.ready();
    windowEvents.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(10000);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    recovery.dispose();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  }
});
