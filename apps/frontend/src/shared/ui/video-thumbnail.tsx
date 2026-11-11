import { ActivityIndicator } from "./activity-indicator";
import { forwardRef, useState, type VideoHTMLAttributes } from "react";
import { Film } from "lucide-react";
import { useVideoThumbnail } from "../../features/media/use-video-thumbnail";
import type { VideoThumbnailRequest } from "../../features/media/video-thumbnail";
import styles from "./video-thumbnail.module.css";
import { thumbnailSize } from "../../features/media/thumbnail-framing";

export function VideoThumbnail({
  request,
  className,
}: {
  request: VideoThumbnailRequest | null;
  className?: string;
}) {
  const thumbnail = useVideoThumbnail(request);
  const [presented, setPresented] = useState<string>();
  const [failed, setFailed] = useState<string>();
  const state =
    thumbnail.state === "unavailable" ||
    (thumbnail.url && failed === thumbnail.url)
      ? "unavailable"
      : thumbnail.url && presented === thumbnail.url
        ? "ready"
        : "loading";
  return (
    <span
      className={`${styles.frame} ${className ?? ""}`}
      data-thumbnail-state={state}
      aria-hidden="true"
    >
      {thumbnail.url && failed !== thumbnail.url && (
        // eslint-disable-next-line @next/next/no-img-element -- locally decoded, bounded blob still.
        <img
          key={thumbnail.url}
          src={thumbnail.url}
          alt=""
          onLoad={() => setPresented(thumbnail.url)}
          onError={() => setFailed(thumbnail.url)}
          style={{ opacity: state === "ready" ? 1 : 0 }}
        />
      )}
      {state === "loading" ? (
        <ActivityIndicator size={20} />
      ) : state === "unavailable" ? (
        <Film size={24} />
      ) : null}
    </span>
  );
}

/** A playable source keeps its own clocks; the same still service supplies its poster. */
export const ThumbnailVideo = forwardRef<
  HTMLVideoElement,
  VideoHTMLAttributes<HTMLVideoElement> & {
    thumbnailSource?: string | undefined;
    thumbnailTimeMs?: number | undefined;
    thumbnailAspectRatio?: number | undefined;
  }
>(function ThumbnailVideo(
  { thumbnailSource, thumbnailTimeMs, thumbnailAspectRatio, ...props },
  ref,
) {
  const thumbnail = useVideoThumbnail(
    thumbnailSource
      ? {
          source: thumbnailSource,
          ...thumbnailSize(thumbnailAspectRatio),
          ...(thumbnailTimeMs === undefined ? {} : { timeMs: thumbnailTimeMs }),
        }
      : null,
  );
  return <video {...props} ref={ref} poster={thumbnail.url} />;
});
