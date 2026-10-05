export type ThumbnailState = "loading" | "ready" | "unavailable";

/** Decode a paused source frame without autoplay or retaining a second image. */
export function attachMomentThumbnail(
  video: HTMLVideoElement,
  sourceUrl: string,
  startMs: number,
  report: (state: ThumbnailState) => void,
) {
  let stopped = false;
  const target = () =>
    Math.max(
      0,
      Math.min(
        startMs / 1000,
        Number.isFinite(video.duration)
          ? Math.max(0, video.duration - 0.001)
          : startMs / 1000,
      ),
    );
  const frameReady = () => {
    if (stopped || video.readyState < 2 || video.seeking) return;
    if (Math.abs(video.currentTime - target()) <= 0.05) report("ready");
  };
  const seek = () => {
    if (stopped || video.readyState < 1) return;
    if (Math.abs(video.currentTime - target()) > 0.001)
      video.currentTime = target();
    frameReady();
  };
  const unavailable = () => {
    if (!stopped) report("unavailable");
  };
  video.addEventListener("loadedmetadata", seek);
  video.addEventListener("loadeddata", frameReady);
  video.addEventListener("seeked", frameReady);
  video.addEventListener("canplay", frameReady);
  video.addEventListener("error", unavailable);
  report("loading");
  video.muted = true;
  video.preload = "auto";
  video.src = sourceUrl;
  video.load();
  // A cached source can already have metadata when the listeners attach.
  seek();
  return () => {
    if (stopped) return;
    stopped = true;
    video.removeEventListener("loadedmetadata", seek);
    video.removeEventListener("loadeddata", frameReady);
    video.removeEventListener("seeked", frameReady);
    video.removeEventListener("canplay", frameReady);
    video.removeEventListener("error", unavailable);
    video.pause();
    video.removeAttribute("src");
    video.load();
  };
}

/** One bounded decoder, released before the next frame; no files or URLs retained. */
export async function decodeMomentFrame(
  video: HTMLVideoElement,
  sourceUrl: string,
  startMs: number,
  signal: AbortSignal,
): Promise<HTMLCanvasElement> {
  signal.throwIfAborted();
  let stop = () => {};
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let abort = () => {};
  try {
    await new Promise<void>((resolve, reject) => {
      abort = () =>
        reject(new DOMException("Thumbnail cancelled", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      timeout = setTimeout(
        () => reject(new Error("thumbnail-decode-timeout")),
        30_000,
      );
      stop = attachMomentThumbnail(video, sourceUrl, startMs, (state) => {
        if (state === "ready") resolve();
        else if (state === "unavailable")
          reject(new Error("thumbnail-media-error"));
      });
    });
    signal.throwIfAborted();
    if (!video.videoWidth || !video.videoHeight)
      throw new Error("thumbnail-no-frame");
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(640, video.videoWidth);
    canvas.height = Math.max(
      1,
      Math.round((canvas.width * video.videoHeight) / video.videoWidth),
    );
    const context = canvas.getContext("2d");
    if (!context) throw new Error("thumbnail-canvas-unavailable");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
    stop();
  }
}

export async function decodeMomentFrames(
  video: HTMLVideoElement,
  sourceUrl: string,
  entries: readonly { id: string; startMs: number }[],
  signal: AbortSignal,
  publish: (id: string, frame: HTMLCanvasElement | "unavailable") => void,
  decode = decodeMomentFrame,
) {
  for (const entry of entries) {
    if (signal.aborted) return;
    let frame: HTMLCanvasElement | "unavailable";
    try {
      frame = await decode(video, sourceUrl, entry.startMs, signal);
    } catch {
      if (signal.aborted) return;
      frame = "unavailable";
    }
    if (signal.aborted) {
      if (frame !== "unavailable") {
        frame.width = 0;
        frame.height = 0;
      }
      return;
    }
    publish(entry.id, frame);
  }
}
