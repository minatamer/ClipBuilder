import { CanvasSink, Input, MP4, UrlSource } from "mediabunny";
import { thumbnailZoom } from "./thumbnail-framing";

export type VideoThumbnailRequest = {
  source: string;
  kind?: "video" | "image";
  /** Omit to choose a representative source frame after metadata is available. */
  timeMs?: number;
  width?: number;
  height?: number;
};
export type VideoThumbnailSnapshot = {
  state: "loading" | "ready" | "unavailable";
  url?: string;
};
export const EMPTY_VIDEO_THUMBNAIL: VideoThumbnailSnapshot = {
  state: "loading",
};
const unavailable: VideoThumbnailSnapshot = { state: "unavailable" };

type Entry = {
  snapshot: VideoThumbnailSnapshot;
  controller: AbortController;
  listeners: Set<() => void>;
};
const entries = new Map<string, Entry>();
let queue = Promise.resolve();

export function videoThumbnailKey(request: VideoThumbnailRequest) {
  return JSON.stringify([
    request.source,
    request.kind ?? "video",
    request.timeMs ?? null,
    request.width ?? 160,
    request.height ?? 90,
  ]);
}

function paintThumbnail(
  media: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
) {
  const sample = document.createElement("canvas"),
    output = document.createElement("canvas");
  sample.width = 128;
  sample.height = 72;
  output.width = width;
  output.height = height;
  try {
    const context = sample.getContext("2d", { willReadFrequently: true }),
      target = output.getContext("2d");
    if (!context || !target) throw Error("thumbnail_unavailable");
    context.drawImage(media, 0, 0, 128, 72);
    const zoom = thumbnailZoom(
      context.getImageData(0, 0, 128, 72),
      sourceWidth / sourceHeight,
      width / height,
    );
    const scale = Math.max(width / sourceWidth, height / sourceHeight) * zoom;
    target.drawImage(
      media,
      (width - sourceWidth * scale) / 2,
      (height - sourceHeight * scale) / 2,
      sourceWidth * scale,
      sourceHeight * scale,
    );
    return output;
  } catch (error) {
    output.width = output.height = 0;
    throw error;
  } finally {
    sample.width = sample.height = 0;
  }
}

/** Native playback remains a supported decoder when WebCodecs cannot read a codec. */
async function nativeThumbnail(
  request: VideoThumbnailRequest,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const media = document.createElement("video");
  media.muted = true;
  media.playsInline = true;
  media.preload = "auto";
  const url = new URL(request.source, location.href);
  if (url.origin !== location.origin) media.crossOrigin = "anonymous";
  let detach = () => {};
  try {
    await new Promise<void>((done, fail) => {
      let target: number | undefined,
        stopped = false;
      const finish = (error?: Error) => {
        if (stopped) return;
        stopped = true;
        detach();
        if (error) fail(error);
        else done();
      };
      const ready = () => {
        if (
          target !== undefined &&
          media.readyState >= 2 &&
          !media.seeking &&
          Math.abs(media.currentTime - target) < 0.05
        )
          finish();
      };
      const metadata = () => {
        if (!Number.isFinite(media.duration) || media.duration <= 0) {
          finish(Error("thumbnail_unavailable"));
          return;
        }
        target = Math.max(
          0,
          Math.min(
            media.duration - 0.001,
            request.timeMs === undefined
              ? Math.min(10, media.duration / 4)
              : request.timeMs / 1000,
          ),
        );
        media.currentTime = target === 0 ? 0.001 : target;
      };
      const error = () => finish(Error("thumbnail_unavailable")),
        abort = () => finish(Error("thumbnail_cancelled"));
      detach = () => {
        for (const event of ["loadeddata", "seeked", "canplay"])
          media.removeEventListener(event, ready);
        media.removeEventListener("loadedmetadata", metadata);
        media.removeEventListener("error", error);
        signal.removeEventListener("abort", abort);
      };
      for (const event of ["loadeddata", "seeked", "canplay"])
        media.addEventListener(event, ready);
      media.addEventListener("loadedmetadata", metadata);
      media.addEventListener("error", error);
      signal.addEventListener("abort", abort, { once: true });
      media.src = request.source;
      media.load();
    });
    signal.throwIfAborted();
    // The seek is decoded; allow its texture to settle before copying pixels.
    await new Promise<void>((done, fail) => {
      let frame: number | undefined;
      const finish = (error?: Error) => {
        if (frame !== undefined) cancelAnimationFrame(frame);
        signal.removeEventListener("abort", cancel);
        if (error) fail(error);
        else done();
      };
      const cancel = () => finish(Error("thumbnail_cancelled"));
      signal.addEventListener("abort", cancel, { once: true });
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => finish());
      });
    });
    signal.throwIfAborted();
    return paintThumbnail(
      media,
      media.videoWidth,
      media.videoHeight,
      request.width ?? 160,
      request.height ?? 90,
    );
  } finally {
    detach();
    media.pause();
    media.removeAttribute("src");
    media.load();
  }
}

/** One bounded reader per still. Playback, audio, persistence and providers are independent. */
export async function decodeVideoThumbnail(
  request: VideoThumbnailRequest,
  signal: AbortSignal,
): Promise<Blob> {
  signal.throwIfAborted();
  const width = request.width ?? 160,
    height = request.height ?? 90;
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 640 ||
    height > 640 ||
    (request.timeMs !== undefined &&
      (!Number.isFinite(request.timeMs) || request.timeMs < 0))
  )
    throw Error("thumbnail_request_invalid");
  let input: Input | undefined;
  let image: HTMLImageElement | undefined;
  let objectUrl: string | undefined;
  let canvas: HTMLCanvasElement | undefined;
  const abort = () => {
    input?.dispose();
    image?.removeAttribute("src");
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    if (request.kind === "image") {
      const response = await fetch(request.source, {
        signal,
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      });
      if (!response.ok || !response.body) throw Error("thumbnail_unavailable");
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      const reader = response.body.getReader();
      let size = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 4 * 1024 ** 2) throw Error("thumbnail_capacity");
          chunks.push(new Uint8Array(value));
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      signal.throwIfAborted();
      objectUrl = URL.createObjectURL(new Blob(chunks));
      image = new Image();
      image.src = objectUrl;
      await image.decode();
      signal.throwIfAborted();
      canvas = paintThumbnail(
        image,
        image.naturalWidth,
        image.naturalHeight,
        width,
        height,
      );
    } else if (typeof VideoDecoder === "undefined") {
      canvas = await nativeThumbnail(request, signal);
    } else {
      const url = new URL(request.source, location.href);
      input = new Input({
        formats: [MP4],
        source: new UrlSource(url, {
          maxCacheSize: 4 * 1024 ** 2,
          parallelism: 1,
          getRetryDelay: () => null,
          requestInit: {
            credentials: "same-origin",
            mode: url.origin === location.origin ? "same-origin" : "cors",
            cache: "no-store",
          },
        }),
      });
      const track = await input.getPrimaryVideoTrack();
      if (!track) throw Error("thumbnail_unavailable");
      if (!(await track.canDecode())) {
        input.dispose();
        input = undefined;
        canvas = await nativeThumbnail(request, signal);
      } else {
        const first = await track.getFirstTimestamp();
        const duration = await track.computeDuration();
        const time = Math.min(
          Math.max(first, duration - 0.001),
          Math.max(
            first,
            request.timeMs === undefined
              ? first + Math.min(10, (duration - first) / 4)
              : request.timeMs / 1000,
          ),
        );
        const sw = await track.getSquarePixelWidth(),
          sh = await track.getSquarePixelHeight(),
          rotation = await track.getRotation();
        const displayWidth = rotation === 90 || rotation === 270 ? sh : sw,
          displayHeight = rotation === 90 || rotation === 270 ? sw : sh;
        const scale = Math.min(1, 640 / Math.max(displayWidth, displayHeight));
        const sample = await new CanvasSink(track, {
          width: Math.max(1, Math.round(displayWidth * scale)),
          height: Math.max(1, Math.round(displayHeight * scale)),
          fit: "fill",
          poolSize: 1,
        }).getCanvas(time);
        const decoded = sample?.canvas;
        try {
          signal.throwIfAborted();
          if (!decoded) throw Error("thumbnail_unavailable");
          canvas = paintThumbnail(
            decoded,
            decoded.width,
            decoded.height,
            width,
            height,
          );
        } finally {
          if (decoded) decoded.width = decoded.height = 0;
        }
      }
    }
    const painted = canvas;
    const blob = await new Promise<Blob>((done, fail) =>
      painted.toBlob(
        (value) => (value ? done(value) : fail(Error("thumbnail_unavailable"))),
        "image/jpeg",
        0.8,
      ),
    );
    signal.throwIfAborted();
    return blob;
  } finally {
    signal.removeEventListener("abort", abort);
    abort();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (canvas) canvas.width = canvas.height = 0;
  }
}

export function videoThumbnailSnapshot(
  request: VideoThumbnailRequest | null,
): VideoThumbnailSnapshot {
  return request
    ? (entries.get(videoThumbnailKey(request))?.snapshot ??
        EMPTY_VIDEO_THUMBNAIL)
    : EMPTY_VIDEO_THUMBNAIL;
}

/** Only subscribed surfaces retain stills; all surfaces share one serial queue. */
export function subscribeVideoThumbnail(
  request: VideoThumbnailRequest,
  listener: () => void,
) {
  const key = videoThumbnailKey(request);
  let entry = entries.get(key);
  if (!entry) {
    entry = {
      snapshot: EMPTY_VIDEO_THUMBNAIL,
      controller: new AbortController(),
      listeners: new Set(),
    };
    entries.set(key, entry);
    const created = entry;
    queue = queue.then(async () => {
      if (created.controller.signal.aborted) return;
      const timer = setTimeout(() => created.controller.abort(), 30_000);
      try {
        const blob = await decodeVideoThumbnail(
          request,
          created.controller.signal,
        );
        if (!created.controller.signal.aborted)
          created.snapshot = { state: "ready", url: URL.createObjectURL(blob) };
      } catch {
        created.snapshot = unavailable;
      } finally {
        clearTimeout(timer);
        for (const notify of created.listeners) notify();
      }
    });
  }
  const owned = entry;
  const notify = () => listener();
  owned.listeners.add(notify);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    owned.listeners.delete(notify);
    if (owned.listeners.size) return;
    owned.controller.abort();
    if (owned.snapshot.url) URL.revokeObjectURL(owned.snapshot.url);
    if (entries.get(key) === owned) entries.delete(key);
  };
}
