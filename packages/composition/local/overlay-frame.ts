import { FIXED_COMPOSITION_POLICY } from "@clipbuilder/contracts";
import { OWNER_FPS } from "../../contracts/local/policy.ts";
import type { OwnerOverlay } from "../../contracts/local/clips.ts";
import { ownerVisualMotion } from "./visual-motion.ts";
import { captionSpeakerFrame } from "../../contracts/local/caption-speakers.ts";
import { OWNER_CAPTION_PRESETS } from "../../contracts/local/editor.ts";
import type { OwnerOverlayClock } from "../../contracts/local/visual-clock.ts";
import {
  ownerSourceFrame,
  ownerHookFrames,
  ownerHookCaption,
} from "../../contracts/local/hook.ts";

/** Exact frame-driven overlay state, including owner caption animation. */
export function ownerOverlayFrame(
  overlay: OwnerOverlay,
  frame: number,
  clock?: OwnerOverlayClock,
) {
  const inHook =
    clock?.hook ?? (!!overlay.hook && frame < ownerHookFrames(overlay));
  frame = clock
    ? clock.sourceStartFrame + frame
    : ownerSourceFrame(overlay, frame);
  const ms = (frame * 1000) / OWNER_FPS;
  const captionIndex = overlay.captions.findIndex(
    (cue) => cue.startMs <= ms && ms < cue.endMs,
  );
  const resolved = captionSpeakerFrame(
    overlay.captions[captionIndex],
    ms,
    overlay.captionSpeakers,
    overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean,
  );
  const caption = inHook
    ? ownerHookCaption(
        resolved.caption,
        clock
          ? {
              startFrame: clock.sourceStartFrame,
              endFrame: clock.sourceEndFrame,
            }
          : overlay.hook!,
      )
    : resolved.caption;
  const colors = resolved.colors;
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
    frame,
    caption,
    colors,
    visuals,
    texts,
    key: JSON.stringify([
      inHook,
      captionIndex,
      caption?.wordIds,
      colors?.speakerId,
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
