import type { OwnerAudioCue } from "../../../../../packages/contracts/local/audio.ts";
import type { OwnerVisualTiming } from "../../../../../packages/contracts/local/visual-clock.ts";

/** Library and newly uploaded sounds use the same source-bound picture link. */
export function pictureLinkedAudio(
  cue: OwnerAudioCue,
  visual: OwnerVisualTiming,
  endFrame: number,
  durationFrames: number,
): OwnerAudioCue {
  return {
    ...cue,
    visualId: visual.id,
    placement: "clip",
    startFrame: visual.startFrame,
    endFrame: Math.min(
      endFrame,
      visual.startFrame + Math.max(1, durationFrames),
    ),
    offsetFrame: 0,
    loop: false,
  };
}
