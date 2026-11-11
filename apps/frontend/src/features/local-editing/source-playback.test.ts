import { expect, it, vi } from "vitest";
import {
  constrainSourcePlayback,
  SourcePlayRequests,
} from "./source-playback.ts";
import { manualPreviewJumpSeconds } from "./manual-time.ts";

function pendingPlay() {
  let resolve!: () => void, reject!: (reason: unknown) => void;
  const promise = new Promise<void>((ready, failed) => {
    resolve = ready;
    reject = failed;
  });
  return { promise, resolve, reject };
}

it("ignores an interrupted play without retrying or turning it into an autoplay warning", async () => {
  const request = pendingPlay(),
    play = vi.fn(() => request.promise),
    report = vi.fn();
  const controller = new SourcePlayRequests();
  controller.play({ play }, report);
  request.reject(new DOMException("interrupted by pause", "AbortError"));
  await Promise.resolve();
  expect(play).toHaveBeenCalledTimes(1);
  expect(report).not.toHaveBeenCalled();
  controller.play({ play: async () => {} }, report);
  await Promise.resolve();
  expect(report).not.toHaveBeenCalled();
});

it("ignores an older failed Jump after a newer Jump has started successfully", async () => {
  const older = pendingPlay(),
    newer = pendingPlay(),
    report = vi.fn();
  const play = vi
    .fn()
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  const controller = new SourcePlayRequests();
  controller.play({ play }, report);
  controller.play({ play }, report);
  newer.resolve();
  older.reject(new DOMException("old request", "NotAllowedError"));
  await Promise.resolve();
  expect(report).not.toHaveBeenCalled();
  expect(play).toHaveBeenCalledTimes(2);
});

it("invalidates pending failures on pause/lifecycle cancellation without resuming playback", async () => {
  const request = pendingPlay(),
    report = vi.fn(),
    play = vi.fn(() => request.promise);
  const controller = new SourcePlayRequests();
  controller.play({ play }, report);
  controller.cancel();
  request.reject(new DOMException("obsolete", "NotAllowedError"));
  await Promise.resolve();
  expect(report).not.toHaveBeenCalled();
  expect(play).toHaveBeenCalledTimes(1);
});

it.each([
  ["NotAllowedError", "blocked"],
  ["NotSupportedError", "failed"],
  ["NetworkError", "failed"],
] as const)(
  "reports the current %s failure accurately and never retries",
  async (name, reason) => {
    const request = pendingPlay(),
      report = vi.fn(),
      play = vi.fn(() => request.promise);
    new SourcePlayRequests().play({ play }, report);
    request.reject(new DOMException("synthetic failure", name));
    await Promise.resolve();
    expect(report).toHaveBeenCalledExactlyOnceWith(reason);
    expect(play).toHaveBeenCalledTimes(1);
  },
);

it("handles synchronous player failures and preserves a later explicit attempt", async () => {
  const report = vi.fn(),
    controller = new SourcePlayRequests();
  controller.play(
    {
      play() {
        throw Error("synthetic media failure");
      },
    },
    report,
  );
  expect(report).toHaveBeenCalledExactlyOnceWith("failed");
  const pending = pendingPlay();
  controller.play({ play: () => pending.promise }, report);
  pending.reject(new DOMException("needs gesture", "NotAllowedError"));
  await Promise.resolve();
  expect(report.mock.calls.map(([reason]) => reason)).toEqual([
    "failed",
    "blocked",
  ]);
});
it("clamps requested-section playback, stops at its end, restarts explicitly and preserves full sources", () => {
  const video = { currentTime: 0, pause: vi.fn() },
    window = { startMs: 3200, endMs: 6900 };
  constrainSourcePlayback(video, window, "loaded");
  expect(video.currentTime).toBe(3.2);
  video.currentTime = 8;
  constrainSourcePlayback(video, window, "seeking");
  expect(video.currentTime).toBe(6.9);
  constrainSourcePlayback(video, window, "time");
  expect(video.pause).toHaveBeenCalledTimes(1);
  constrainSourcePlayback(video, window, "play");
  expect(video.currentTime).toBe(3.2);
  video.currentTime = 4;
  constrainSourcePlayback(video, window, "time");
  expect(video.currentTime).toBe(4);
  video.currentTime = 0;
  constrainSourcePlayback(video, undefined, "loaded");
  expect(video.currentTime).toBe(0);
});

it("previews a requested-section End without wrapping to its beginning", () => {
  const availableWindow = { startMs: 5000, endMs: 12000 };
  const currentTime = manualPreviewJumpSeconds(
    12000,
    { durationMs: 20000, availableWindow },
    "end",
  )!;
  const video = { currentTime, pause: vi.fn() };
  constrainSourcePlayback(video, availableWindow, "play");
  expect(video.currentTime).toBeCloseTo(11.9666667);
  video.currentTime = 12;
  constrainSourcePlayback(video, availableWindow, "time");
  expect(video.pause).toHaveBeenCalledTimes(1);
});
