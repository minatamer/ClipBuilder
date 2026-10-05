import { afterEach, describe, expect, it, vi } from "vitest";
import {
  attachMomentThumbnail,
  decodeMomentFrame,
  decodeMomentFrames,
} from "./moment-thumbnail";

function media(readyState = 0) {
  const events = new EventTarget();
  const video = Object.assign(events, {
    src: "",
    currentTime: 0,
    duration: 60,
    readyState,
    seeking: false,
    muted: false,
    preload: "metadata",
    load: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    removeAttribute: vi.fn(),
  });
  return {
    video: video as unknown as HTMLVideoElement,
    event: (name: string) => events.dispatchEvent(new Event(name)),
  };
}

describe("paused candidate-start thumbnail decoding", () => {
  it("loads actual data, seeks after metadata and waits for a decoded completed seek", () => {
    const f = media(),
      report = vi.fn();
    const stop = attachMomentThumbnail(
      f.video,
      "blob:synthetic",
      23_500,
      report,
    );
    expect(f.video.preload).toBe("auto");
    expect(f.video.muted).toBe(true);
    expect(f.video.src).toBe("blob:synthetic");
    expect(f.video.load).toHaveBeenCalledOnce();
    expect(report).toHaveBeenLastCalledWith("loading");
    Object.assign(f.video, { readyState: 1 });
    f.event("loadedmetadata");
    expect(f.video.currentTime).toBe(23.5);
    expect(report).toHaveBeenCalledTimes(1);
    Object.assign(f.video, { readyState: 2, seeking: true });
    f.event("loadeddata");
    expect(report).toHaveBeenCalledTimes(1);
    Object.assign(f.video, { seeking: false });
    f.event("seeked");
    expect(report).toHaveBeenLastCalledWith("ready");
    expect(f.video.play).not.toHaveBeenCalled();
    stop();
  });
  it("uses cached metadata even if the metadata event happened before attachment", () => {
    const f = media(2),
      report = vi.fn();
    const stop = attachMomentThumbnail(
      f.video,
      "blob:synthetic",
      12_000,
      report,
    );
    expect(f.video.currentTime).toBe(12);
    expect(report).toHaveBeenLastCalledWith("ready");
    stop();
  });
  it("decodes time zero without needing a seek event", () => {
    const f = media(),
      report = vi.fn();
    const stop = attachMomentThumbnail(f.video, "blob:synthetic", 0, report);
    Object.assign(f.video, { readyState: 2 });
    f.event("loadeddata");
    expect(report).toHaveBeenLastCalledWith("ready");
    stop();
  });
  it("does not expose an unrelated source frame as the candidate thumbnail", () => {
    const f = media(),
      report = vi.fn();
    const stop = attachMomentThumbnail(
      f.video,
      "blob:synthetic",
      20_000,
      report,
    );
    Object.assign(f.video, { readyState: 2, currentTime: 0 });
    f.event("canplay");
    expect(report).toHaveBeenLastCalledWith("loading");
    stop();
  });
  it("clamps a media-tail boundary to a decodable frame and reports decode failure", () => {
    const f = media(1),
      report = vi.fn();
    const stop = attachMomentThumbnail(
      f.video,
      "blob:synthetic",
      60_000,
      report,
    );
    expect(f.video.currentTime).toBe(59.999);
    f.event("error");
    expect(report).toHaveBeenLastCalledWith("unavailable");
    stop();
  });
  it("releases the source once and removes all listeners on session exit/replacement", () => {
    const f = media(2),
      report = vi.fn();
    const stop = attachMomentThumbnail(
      f.video,
      "blob:synthetic",
      12_000,
      report,
    );
    stop();
    stop();
    expect(f.video.pause).toHaveBeenCalledOnce();
    expect(f.video.removeAttribute).toHaveBeenCalledExactlyOnceWith("src");
    expect(f.video.load).toHaveBeenCalledTimes(2);
    report.mockClear();
    for (const name of [
      "loadedmetadata",
      "loadeddata",
      "seeked",
      "canplay",
      "error",
    ])
      f.event(name);
    expect(report).not.toHaveBeenCalled();
  });
});

describe("serialized memory-only thumbnail frames", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  it("captures the requested frame at bounded resolution and releases its native source", async () => {
    const f = media(2);
    Object.assign(f.video, { videoWidth: 1920, videoHeight: 1080 });
    const drawImage = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
    };
    vi.stubGlobal("document", { createElement: vi.fn(() => canvas) });
    expect(
      await decodeMomentFrame(
        f.video,
        "blob:synthetic",
        23_500,
        new AbortController().signal,
      ),
    ).toBe(canvas);
    expect(f.video.currentTime).toBe(23.5);
    expect(canvas).toMatchObject({ width: 640, height: 360 });
    expect(drawImage).toHaveBeenCalledExactlyOnceWith(f.video, 0, 0, 640, 360);
    expect(f.video.removeAttribute).toHaveBeenCalledExactlyOnceWith("src");
    expect(f.video.pause).toHaveBeenCalledOnce();
  });
  it.each(["abort", "timeout"])(
    "releases listeners and source after %s",
    async (reason) => {
      vi.useFakeTimers();
      const f = media(),
        controller = new AbortController();
      const pending = decodeMomentFrame(
        f.video,
        "blob:synthetic",
        20_000,
        controller.signal,
      );
      const rejected = expect(pending).rejects.toThrow();
      if (reason === "abort") controller.abort();
      else await vi.advanceTimersByTimeAsync(30_000);
      await rejected;
      expect(f.video.removeAttribute).toHaveBeenCalledExactlyOnceWith("src");
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it("does not start another stream while the preceding frame is decoding", async () => {
    const f = media(),
      controller = new AbortController(),
      publish = vi.fn();
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const canvas = { width: 640, height: 360 } as HTMLCanvasElement;
    const decode = vi.fn(async () => {
      await gate;
      return canvas;
    });
    const work = decodeMomentFrames(
      f.video,
      "blob:synthetic",
      [
        { id: "one", startMs: 1000 },
        { id: "two", startMs: 2000 },
        { id: "three", startMs: 3000 },
      ],
      controller.signal,
      publish,
      decode,
    );
    expect(decode).toHaveBeenCalledOnce();
    release();
    await work;
    expect(decode).toHaveBeenCalledTimes(3);
    expect(publish).toHaveBeenCalledTimes(3);
  });
  it("continues after a failed frame and never publishes or starts queued work after exit", async () => {
    const f = media(),
      controller = new AbortController(),
      publish = vi.fn();
    const canvas = { width: 640, height: 360 } as HTMLCanvasElement;
    const decode = vi
      .fn(async () => canvas)
      .mockRejectedValueOnce(new Error("synthetic"));
    await decodeMomentFrames(
      f.video,
      "blob:synthetic",
      [
        { id: "one", startMs: 1000 },
        { id: "two", startMs: 2000 },
      ],
      controller.signal,
      publish,
      decode,
    );
    expect(publish).toHaveBeenNthCalledWith(1, "one", "unavailable");
    expect(publish).toHaveBeenNthCalledWith(2, "two", canvas);
    decode.mockImplementationOnce(async () => {
      controller.abort();
      return canvas;
    });
    publish.mockClear();
    await decodeMomentFrames(
      f.video,
      "blob:synthetic",
      [
        { id: "one", startMs: 1000 },
        { id: "two", startMs: 2000 },
      ],
      controller.signal,
      publish,
      decode,
    );
    expect(publish).not.toHaveBeenCalled();
    expect(decode).toHaveBeenCalledTimes(3);
    expect(canvas.width).toBe(0);
  });
});
