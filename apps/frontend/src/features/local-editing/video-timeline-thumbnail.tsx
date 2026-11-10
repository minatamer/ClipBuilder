import { useCallback, useSyncExternalStore } from "react";
import { CanvasSink, Input, MP4, UrlSource } from "mediabunny";
import { Video } from "lucide-react";
import { ownerVideoFrameSampleTime } from "../../../../../packages/contracts/local/video-assets.ts";

type Thumbnail = {
  image: string;
  listeners: Set<() => void>;
  controller: AbortController;
};

// Only mounted rows retain stills. Repeated placements share the same source
// frame, while one serial decoder serves the entire timeline without audio.
const thumbnails = new Map<string, Thumbnail>();
let work = Promise.resolve();
const pending = () => "pending";

async function decodeThumbnail(
  source: string,
  frame: number,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const input = new Input({
    formats: [MP4],
    source: new UrlSource(new URL(source, location.href), {
      maxCacheSize: 4 * 1024 ** 2,
      parallelism: 1,
      getRetryDelay: () => null,
      requestInit: {
        credentials: "same-origin",
        mode: "same-origin",
        cache: "no-store",
      },
    }),
  });
  const abort = () => input.dispose();
  signal.addEventListener("abort", abort, { once: true });
  let canvas: HTMLCanvasElement | OffscreenCanvas | undefined;
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw Error("thumbnail_unavailable");
    const sample = await new CanvasSink(track, {
      width: 160,
      height: 120,
      fit: "cover",
      poolSize: 1,
    }).getCanvas(ownerVideoFrameSampleTime(frame));
    canvas = sample?.canvas;
    signal.throwIfAborted();
    if (!sample) throw Error("thumbnail_unavailable");
    const painted = sample.canvas;
    const blob =
      painted instanceof HTMLCanvasElement
        ? await new Promise<Blob>((done, fail) =>
            painted.toBlob(
              (value) =>
                value ? done(value) : fail(Error("thumbnail_unavailable")),
              "image/jpeg",
              0.8,
            ),
          )
        : await painted.convertToBlob({ type: "image/jpeg", quality: 0.8 });
    signal.throwIfAborted();
    return blob;
  } finally {
    signal.removeEventListener("abort", abort);
    input.dispose();
    if (canvas) canvas.width = canvas.height = 0;
  }
}

function subscribeThumbnail(
  key: string,
  source: string,
  frame: number,
  listener: () => void,
) {
  let entry = thumbnails.get(key);
  if (!entry) {
    entry = {
      image: "pending",
      listeners: new Set(),
      controller: new AbortController(),
    };
    thumbnails.set(key, entry);
    const created = entry;
    work = work.then(async () => {
      if (created.controller.signal.aborted) return;
      const timer = setTimeout(() => created.controller.abort(), 10_000);
      try {
        const blob = await decodeThumbnail(
          source,
          frame,
          created.controller.signal,
        );
        if (!created.controller.signal.aborted)
          created.image = URL.createObjectURL(blob);
      } catch {
        created.image = "unavailable";
      } finally {
        clearTimeout(timer);
        for (const notify of created.listeners) notify();
      }
    });
  }
  entry.listeners.add(listener);
  const owned = entry;
  return () => {
    owned.listeners.delete(listener);
    if (owned.listeners.size) return;
    owned.controller.abort();
    if (owned.image.startsWith("blob:")) URL.revokeObjectURL(owned.image);
    thumbnails.delete(key);
  };
}

/** A still from the admitted raw source trim, independent of main playback. */
export function VideoTimelineThumbnail({
  workspaceId,
  assetId,
  frame,
}: {
  workspaceId: string;
  assetId: string;
  frame: number;
}) {
  const source = `/api/local/workspace/${workspaceId}/video-assets/${assetId}`;
  const key = `${source}:${frame}`;
  const subscribe = useCallback(
    (listener: () => void) => subscribeThumbnail(key, source, frame, listener),
    [key, source, frame],
  );
  const snapshot = useCallback(
    () => thumbnails.get(key)?.image ?? "pending",
    [key],
  );
  const image = useSyncExternalStore(subscribe, snapshot, pending);
  const ready = image.startsWith("blob:");
  return (
    <span
      className="picture-thumb video-timeline-thumb"
      aria-hidden="true"
      data-video-thumbnail={ready ? "ready" : image}
      data-source-frame={frame}
      style={{ backgroundImage: ready ? `url(${image})` : undefined }}
    >
      {!ready && <Video size={16} />}
    </span>
  );
}
