import { Html5Video, Sequence, useCurrentFrame } from "remotion";
import type { OwnerOverlayImageProps } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { ownerVideoFrameSampleTime } from "../../../../../packages/contracts/local/video-assets.ts";

/** Audio is deliberately absent: the shared audio mixer owns enabled cue sound. */
export function BrollVideo({
  workspaceId,
  cue,
  frame,
  props,
  onError,
}: {
  workspaceId: string;
  cue: OwnerVisualEdit;
  frame: number;
  props: OwnerOverlayImageProps;
  onError: () => void;
}) {
  const presentationFrame = useCurrentFrame();
  // Keep playback and paused seeks inside the same logical frame as export.
  const previewOffset =
    ownerVideoFrameSampleTime(cue.video?.offsetFrame ?? 0) * OWNER_FPS;
  return (
    <Sequence
      from={Math.round(presentationFrame - frame + cue.startFrame)}
      durationInFrames={cue.endFrame - cue.startFrame}
      layout="none"
    >
      <Html5Video
        src={`/api/local/workspace/${workspaceId}/video-assets/${cue.assetId}`}
        trimBefore={previewOffset}
        muted
        volume={0}
        style={props.style}
        pauseWhenBuffering
        onError={onError}
      />
    </Sequence>
  );
}
