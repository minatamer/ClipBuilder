import { FIXED_COMPOSITION_POLICY } from "@clipbuilder/contracts";
import { OWNER_FPS } from "../../contracts/local/policy.ts";
import type { OwnerOverlay } from "../../contracts/local/clips.ts";
import { ownerVisualMotion } from "./visual-motion.ts";

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
  const texts = (overlay.texts ?? []).filter(
    (layer) => layer.startFrame <= frame && frame < layer.endFrame,
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
    texts,
    key: JSON.stringify([
      captionIndex,
      texts.map((layer) => layer.id),
      caption && overlay.captionStyle?.animation === "bounce"
        ? caption.wordCues
            .filter((cue) => cue.startMs <= ms && ms < cue.endMs)
            .map((cue) => Math.min(1, (ms - cue.startMs) / 220))
        : null,
      caption && overlay.captionStyle?.animation === "reveal"
        ? caption.wordCues.filter((cue) => cue.startMs <= ms).length
        : null,
      overlay.captionStyle?.animation === "fade" && caption
        ? Math.min(1, (ms - caption.startMs) / 120)
        : null,
      highlights,
      visuals.map((cue) => [cue.id, ownerVisualMotion(cue, frame)]),
    ]),
  };
}
