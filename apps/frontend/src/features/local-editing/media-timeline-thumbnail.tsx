import { ownerVideoFrameSampleTime } from "../../../../../packages/contracts/local/video-assets.ts";
import { VideoThumbnail } from "../../shared/ui/video-thumbnail";

/** Timeline adapter; decoding, framing, caching and cleanup are shared with intake. */
export function MediaTimelineThumbnail({
  workspaceId,
  assetId,
  frame,
}: {
  workspaceId: string;
  assetId: string;
  frame?: number | undefined;
}) {
  const video = frame !== undefined;
  return (
    <span
      className="picture-thumb"
      aria-hidden="true"
      data-video-thumbnail={video ? "" : undefined}
      data-picture-thumbnail={video ? undefined : ""}
      data-source-frame={frame}
    >
      <VideoThumbnail
        request={{
          source: `/api/local/workspace/${workspaceId}/${video ? "video-assets" : "assets"}/${assetId}`,
          kind: video ? "video" : "image",
          ...(frame === undefined
            ? {}
            : { timeMs: ownerVideoFrameSampleTime(frame) * 1000 }),
          width: 160,
          height: 120,
        }}
      />
    </span>
  );
}
