import type { OwnerClip } from "../../../../../packages/contracts/local/clips.ts";

/** A retained base/output is also present while an existing clip re-exports. */
export function isLocalClipEditable(clip: OwnerClip): boolean {
  return Boolean(
    clip.base &&
    clip.outputs.length > 0 &&
    (clip.state === "ready" || clip.state === "validated-revision"),
  );
}
