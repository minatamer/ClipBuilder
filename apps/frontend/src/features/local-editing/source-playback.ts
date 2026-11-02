import type { OwnerSourceWindow } from "../../../../../packages/contracts/local/source-window.ts";

/** A padded master stays intact; the preview plays only its requested interval. */
export function constrainSourcePlayback(
  video: Pick<HTMLVideoElement, "currentTime" | "pause">,
  window: OwnerSourceWindow | undefined,
  phase: "loaded" | "seeking" | "time" | "play",
) {
  if (!window) return;
  const start = window.startMs / 1000,
    end = window.endMs / 1000;
  if (phase === "play" && video.currentTime >= end) video.currentTime = start;
  else if (video.currentTime < start) video.currentTime = start;
  else if (video.currentTime > end) video.currentTime = end;
  if (phase === "time" && video.currentTime >= end) video.pause();
}
