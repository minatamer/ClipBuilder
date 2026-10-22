import { FIXED_COMPOSITION_POLICY } from "../../contracts/src/edit-plan.schema.ts";
import { OWNER_FPS } from "../../contracts/owner/policy.ts";
import type { OwnerOverlay } from "../../contracts/owner/clips.ts";

/** Exact frame-driven overlay state, including owner caption animation. */
export function ownerOverlayFrame(overlay: OwnerOverlay, frame: number) {
  const ms = (frame * 1000) / OWNER_FPS;
  const captionIndex = overlay.captions.findIndex(
    (cue) => cue.startMs <= ms && ms < cue.endMs,
  );
  const caption = overlay.captions[captionIndex];
  const visuals = overlay.visuals.filter(
    (cue) => cue.startFrame <= frame && frame < cue.endFrame,
  );
  const highlights =
    caption?.wordCues
      .filter((cue) => cue.startMs <= ms && ms < cue.endMs)
      .map((cue) => [
        cue.wordId,
        Math.min(
          1,
          Math.max(
            0,
            (ms - cue.startMs) / FIXED_COMPOSITION_POLICY.spokenWordOnsetMs,
          ),
        ),
      ]) ?? [];
  return {
    ms,
    caption,
    visuals,
    key: JSON.stringify([
      captionIndex,
      overlay.captionStyle?.animation === "fade" && caption
        ? Math.min(1, (ms - caption.startMs) / 120)
        : null,
      highlights,
      visuals.map((cue) => cue.id),
    ]),
  };
}
