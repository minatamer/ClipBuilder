import { FIXED_COMPOSITION_POLICY } from "@clipbuilder/contracts";

type Cue = { wordId: string; startMs: number; endMs: number };
export type SlidingWordBox = {
  wordId: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Logical DOM coordinates, animated only by the supplied media clock. */
export function slidingHighlight(
  boxes: readonly SlidingWordBox[],
  cues: readonly Cue[],
  ms: number,
): Omit<SlidingWordBox, "wordId"> | null {
  let active: Cue | undefined;
  for (const cue of cues) {
    if (
      cue.startMs <= ms &&
      ms < cue.endMs &&
      (!active || cue.startMs >= active.startMs)
    )
      active = cue;
  }
  if (!active) return null;
  const target = boxes.find((box) => box.wordId === active.wordId);
  if (!target) return null;
  let previous: Cue | undefined;
  for (const cue of cues) {
    if (
      cue.startMs < active.startMs &&
      (!previous || cue.startMs >= previous.startMs)
    )
      previous = cue;
  }
  const from =
    previous && previous.endMs >= active.startMs - 150
      ? boxes.find((box) => box.wordId === previous.wordId)
      : undefined;
  const duration = Math.min(
    FIXED_COMPOSITION_POLICY.spokenWordOnsetMs,
    active.endMs - active.startMs,
  );
  const progress = Math.min(1, Math.max(0, (ms - active.startMs) / duration));
  const eased = progress * progress * (3 - 2 * progress);
  const start = from && from.top === target.top ? from : target;
  return {
    left: start.left + (target.left - start.left) * eased,
    top: target.top,
    width: start.width + (target.width - start.width) * eased,
    height: start.height + (target.height - start.height) * eased,
  };
}
