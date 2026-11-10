import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  EMPTY_VIDEO_THUMBNAIL,
  subscribeVideoThumbnail,
  videoThumbnailSnapshot,
  type VideoThumbnailRequest,
} from "./video-thumbnail";

export function useVideoThumbnail(request: VideoThumbnailRequest | null) {
  const source = request?.source,
    kind = request?.kind ?? "video",
    timeMs = request?.timeMs,
    width = request?.width ?? 160,
    height = request?.height ?? 90;
  const stable = useMemo<VideoThumbnailRequest | null>(
    () =>
      source
        ? {
            source,
            kind,
            width,
            height,
            ...(timeMs === undefined ? {} : { timeMs }),
          }
        : null,
    [source, kind, timeMs, width, height],
  );
  const subscribe = useCallback(
    (listener: () => void) =>
      stable ? subscribeVideoThumbnail(stable, listener) : () => {},
    [stable],
  );
  const snapshot = useCallback(() => videoThumbnailSnapshot(stable), [stable]);
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY_VIDEO_THUMBNAIL);
}
