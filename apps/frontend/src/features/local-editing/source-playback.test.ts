import { expect, it, vi } from "vitest";
import { constrainSourcePlayback } from "./source-playback.ts";
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
