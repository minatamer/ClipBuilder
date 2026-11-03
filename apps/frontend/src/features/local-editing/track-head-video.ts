import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  OWNER_CAMERA_FOLLOW,
  ownerHeadBoxSchema,
} from "../../../../../packages/contracts/local/camera-follow.ts";
import {
  ownerSourceContent,
  type OwnerFocus,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  HeadPixelTracker,
  grayHeadFrame,
  type HeadBox,
} from "./head-pixel-tracker";

function mediaReady(
  video: HTMLVideoElement,
  ready: () => boolean,
  signal: AbortSignal,
  change: () => void,
) {
  return new Promise<void>((resolve, reject) => {
    const events = ["loadedmetadata", "loadeddata", "seeked", "canplay"];
    const finish = (error?: Error) => {
      clearTimeout(timer);
      for (const event of events) video.removeEventListener(event, check);
      video.removeEventListener("error", failed);
      signal.removeEventListener("abort", aborted);
      if (error) reject(error);
      else resolve();
    };
    const check = () => {
      if (ready()) finish();
    };
    const failed = () => finish(Error("head_video_unavailable"));
    const aborted = () => finish(Error("head_tracking_canceled"));
    const timer = setTimeout(failed, 10000);
    for (const event of events) video.addEventListener(event, check);
    video.addEventListener("error", failed);
    signal.addEventListener("abort", aborted, { once: true });
    if (signal.aborted) {
      aborted();
      return;
    }
    try {
      change();
      check();
    } catch {
      failed();
    }
  });
}

/** Decode only the explicit interval, using full-width prepared source content. */
export async function trackHeadVideo({
  sourceUrl,
  source,
  seed,
  startFrame,
  frames,
  signal,
  progress,
}: {
  sourceUrl: string;
  source: OwnerFocus["source"];
  seed: HeadBox;
  startFrame: number;
  frames: number;
  signal: AbortSignal;
  progress: (done: number, total: number) => void;
}) {
  ownerHeadBoxSchema.parse(seed);
  if (
    !Number.isInteger(startFrame) ||
    startFrame < 0 ||
    !Number.isInteger(frames) ||
    frames < 6 ||
    frames > OWNER_CAMERA_FOLLOW.frames
  )
    throw Error("head_range_invalid");
  const video = document.createElement("video"),
    canvas = document.createElement("canvas");
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  const content = ownerSourceContent(source),
    longest = Math.max(source.width, source.height);
  canvas.width = Math.max(32, Math.round((source.width / longest) * 512));
  canvas.height = Math.max(32, Math.round((source.height / longest) * 512));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw Error("head_video_unavailable");
  try {
    await mediaReady(
      video,
      () => video.readyState >= 1 && video.videoWidth > 0,
      signal,
      () => {
        video.src = sourceUrl;
        video.load();
      },
    );
    if (
      !Number.isFinite(video.duration) ||
      (startFrame + frames) / OWNER_FPS > video.duration + 1 / OWNER_FPS
    )
      throw Error("head_range_invalid");
    const indices: number[] = [];
    for (
      let frame = 0;
      frame < frames;
      frame += OWNER_CAMERA_FOLLOW.sampleFrames
    )
      indices.push(frame);
    if (indices.at(-1) !== frames - 1) indices.push(frames - 1);
    let tracker: HeadPixelTracker | undefined;
    const points: { frame: number; x: number; y: number }[] = [];
    for (const [index, frame] of indices.entries()) {
      const time = (startFrame + frame + 0.25) / OWNER_FPS;
      await mediaReady(
        video,
        () =>
          video.readyState >= 2 &&
          !video.seeking &&
          Math.abs(video.currentTime - time) < 1 / 300,
        signal,
        () => {
          video.currentTime = time;
        },
      );
      signal.throwIfAborted();
      context.drawImage(
        video,
        (content.x * video.videoWidth) / 1080,
        (content.y * video.videoHeight) / 1920,
        (content.width * video.videoWidth) / 1080,
        (content.height * video.videoHeight) / 1920,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const image = grayHeadFrame(
        canvas.width,
        canvas.height,
        context.getImageData(0, 0, canvas.width, canvas.height).data,
      );
      if (!tracker) {
        tracker = new HeadPixelTracker(image, seed);
        points.push({
          frame: 0,
          x: Number((seed.x + seed.width / 2).toFixed(6)),
          y: Number((seed.y + seed.height / 2).toFixed(6)),
        });
      } else {
        const center = tracker.step(image);
        if (!center) return { points, outcome: "lost" as const };
        points.push({ frame, ...center });
      }
      progress(index + 1, indices.length);
    }
    return { points, outcome: "complete" as const };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    canvas.width = 0;
    canvas.height = 0;
  }
}
