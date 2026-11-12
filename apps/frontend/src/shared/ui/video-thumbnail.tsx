import { ActivityIndicator } from "./activity-indicator";
import { forwardRef, useState, type VideoHTMLAttributes } from "react";
import { Film } from "lucide-react";
import { useVideoThumbnail } from "../../features/media/use-video-thumbnail";
import {
  invalidateVideoThumbnail,
  type VideoThumbnailRequest,
} from "../../features/media/video-thumbnail";
import styles from "./video-thumbnail.module.css";
import { thumbnailSize } from "../../features/media/thumbnail-framing";

export function VideoThumbnail({
  request,
  className,
  recovering = false,
}: {
  request: VideoThumbnailRequest | null;
  className?: string;
  recovering?: boolean;
}) {
  const thumbnail = useVideoThumbnail(request);
  const [presented, setPresented] = useState<string>();
  const state =
    thumbnail.state === "unavailable" || thumbnail.state === "retrying"
      ? thumbnail.state
      : thumbnail.url && presented === thumbnail.url
        ? "ready"
        : "loading";
  return (
    <span
      className={`${styles.frame} ${className ?? ""}`}
      data-thumbnail-state={state}
      aria-hidden="true"
    >
      {thumbnail.url && (
        // eslint-disable-next-line @next/next/no-img-element -- locally decoded, bounded blob still.
        <img
          key={thumbnail.url}
          src={thumbnail.url}
          alt=""
          onLoad={() => setPresented(thumbnail.url)}
          onError={() => {
            if (request && thumbnail.url)
              invalidateVideoThumbnail(request, thumbnail.url);
          }}
          style={{ opacity: state === "ready" ? 1 : 0 }}
        />
      )}
      {state === "loading" ? (
        <ActivityIndicator size={20} />
      ) : state === "retrying" || (state === "unavailable" && recovering) ? (
        <span className={styles.recovery} title="Reconnecting preview">
          <Film size={24} />
          <ActivityIndicator size={14} />
        </span>
      ) : state === "unavailable" ? (
        <Film size={24} />
      ) : null}
      {state === "ready" && recovering && (
        <span className={styles.pending} title="Reconnecting preview">
          <ActivityIndicator size={14} />
        </span>
      )}
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
