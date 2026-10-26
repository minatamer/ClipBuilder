import type { OwnerClip } from "../../../../../packages/contracts/local/clips.ts";

/** Retained playback never makes queued/exporting or failed work editable. */
export function isLocalClipEditable(clip: OwnerClip): boolean {
  return Boolean(
    clip.base &&
    (clip.preview?.frames === clip.base.overlay.frames ||
      clip.outputs.length > 0) &&
    (clip.state === "review-ready" ||
      clip.state === "ready" ||
      clip.state === "validated-revision"),
  );
}
