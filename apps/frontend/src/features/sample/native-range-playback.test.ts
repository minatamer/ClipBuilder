import { describe, expect, it, vi } from "vitest";
import {
  attachNativeRangePlayback,
  playbackPosition,
} from "./native-range-playback";

function player() {
  const events = new EventTarget();
  let time = 0;
  const writes: number[] = [];
  const frames = new Map<number, VideoFrameRequestCallback>();
  const video = Object.assign(events, {
    src: "",
    paused: true,
    ended: false,
    load: vi.fn(),
    removeAttribute: vi.fn(),
    pause: vi.fn(() => {
      video.paused = true;
      events.dispatchEvent(new Event("pause"));
    }),
    play: vi.fn(async () => {
      video.paused = false;
      events.dispatchEvent(new Event("play"));
    }),
    requestVideoFrameCallback: vi.fn((callback: VideoFrameRequestCallback) => {
      const id = frames.size + 1;
      frames.set(id, callback);
      return id;
    }),
    cancelVideoFrameCallback: vi.fn((id: number) => frames.delete(id)),
  });
  Object.defineProperty(video, "currentTime", {
    get: () => time,
    set: (value: number) => {
      time = value;
      writes.push(value);
    },
  });
  return {
    video: video as unknown as HTMLVideoElement,
    frames,
    writes,
    clock: (value: number) => {
      time = value;
    },
    event: (name: string) => events.dispatchEvent(new Event(name)),
  };
}

describe("actual video clock and immutable range ownership", () => {
  it("keeps nonfinite seek commands and clock values out of the native timeline", () => {
    const range = { startMs: 10_000, endMs: 25_000 };
    for (const value of [NaN, Infinity, -Infinity])
      expect(playbackPosition(value, range)).toBe(range.startMs);
    expect(playbackPosition(-1, range)).toBe(range.startMs);
    expect(playbackPosition(99_000, range)).toBe(range.endMs);
    const f = player(),
      report = vi.fn();
    const stop = attachNativeRangePlayback(
      f.video,
      "blob:synthetic",
      range,
      NaN,
      false,
      report,
      vi.fn(),
    );
    f.event("loadedmetadata");
    expect(f.video.currentTime).toBe(10);
    f.clock(NaN);
    f.event("timeupdate");
    expect(f.video.currentTime).toBe(10);
    expect(report).toHaveBeenLastCalledWith(10_000);
    stop();
  });
  it("seeks to the source boundary, follows the native clock, and stops exactly at the end without a seek loop", () => {
    const f = player();
    const report = vi.fn();
    const stop = attachNativeRangePlayback(
      f.video,
      "blob:synthetic",
      { startMs: 600_000, endMs: 660_000 },
      600_000,
      true,
      report,
      vi.fn(),
    );
    f.event("loadedmetadata");
    expect(f.video.currentTime).toBe(600);
    expect(f.video.play).toHaveBeenCalledOnce();
    f.clock(615.25);
    f.event("timeupdate");
    expect(report).toHaveBeenLastCalledWith(615_250);
    f.clock(660.2);
    f.event("timeupdate");
    expect(f.video.currentTime).toBe(660);
    expect(f.video.paused).toBe(true);
    const writes = f.writes.length;
    f.event("seeking");
    f.event("timeupdate");
    expect(f.writes).toHaveLength(writes);
    expect(f.frames.size).toBe(0);
    stop();
  });
  it("clamps native seeks before the beginning and releases callbacks/listeners/source once", () => {
    const f = player();
    const report = vi.fn();
    const stop = attachNativeRangePlayback(
      f.video,
      "blob:synthetic",
      { startMs: 10_000, endMs: 25_000 },
      0,
      false,
      report,
      vi.fn(),
    );
    f.event("loadedmetadata");
    expect(f.video.currentTime).toBe(10);
    f.clock(1);
    f.event("seeking");
    expect(f.video.currentTime).toBe(10);
    void f.video.play();
    stop();
    stop();
    expect(f.frames.size).toBe(0);
    expect(f.video.removeAttribute).toHaveBeenCalledExactlyOnceWith("src");
    expect(f.video.load).toHaveBeenCalledTimes(2);
    report.mockClear();
    f.event("timeupdate");
    expect(report).not.toHaveBeenCalled();
  });
  it("replaces a source/range from a clean paused start instead of retaining the previous playback", () => {
    const f = player();
    attachNativeRangePlayback(
      f.video,
      "blob:first",
      { startMs: 0, endMs: 15_000 },
      0,
      true,
      vi.fn(),
      vi.fn(),
    )();
    const stop = attachNativeRangePlayback(
      f.video,
      "blob:second",
      { startMs: 20_000, endMs: 40_000 },
      20_000,
      false,
      vi.fn(),
      vi.fn(),
    );
    f.event("loadedmetadata");
    expect(f.video.src).toBe("blob:second");
    expect(f.video.currentTime).toBe(20);
    expect(f.video.paused).toBe(true);
    stop();
  });
});
