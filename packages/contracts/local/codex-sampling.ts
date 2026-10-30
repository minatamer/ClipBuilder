import { LOCAL_CODEX_POLICY } from "./codex.ts";
import { OWNER_FPS, OWNER_LIMITS } from "./policy.ts";
import type { OwnerWord } from "./selection.ts";

/** Spread a bounded set of temporal hints across the entire selected interval. */
function spreadChanges(changes: readonly number[], count: number): number[] {
  if (count <= 0) return [];
  if (changes.length <= count) return [...changes];
  if (count === 1) return [changes[Math.floor(changes.length / 2)]!];
  return Array.from(
    { length: count },
    (_, index) =>
      changes[Math.round((index * (changes.length - 1)) / (count - 1))]!,
  );
}

/** Clip-relative numeric hints only; unknown or overlapping words break continuity. */
export function codexSpeakerChangeFrames(
  words: readonly Pick<OwnerWord, "startMs" | "endMs" | "speakerId">[],
  frames: number,
): number[] {
  const changes: number[] = [];
  let previous: (typeof words)[number] | undefined;
  let occupiedUntil = 0;
  for (const word of [...words].sort(
    (a, b) => a.startMs - b.startMs || a.endMs - b.endMs,
  )) {
    const overlaps = word.startMs < occupiedUntil;
    occupiedUntil = Math.max(occupiedUntil, word.endMs);
    if (!word.speakerId || overlaps) {
      previous = undefined;
      continue;
    }
    const frame = Math.round((word.startMs * OWNER_FPS) / 1000);
    if (
      previous &&
      previous.speakerId !== word.speakerId &&
      frame > 0 &&
      frame < frames
    )
      changes.push(frame);
    previous = word;
  }
  return spreadChanges([...new Set(changes)], LOCAL_CODEX_POLICY.frames);
}

/** Keep the original image count, reserving at least half for uniform coverage. */
export function planCodexFrameSamples(
  frames: number,
  speakerChanges: readonly number[] = [],
): number[] {
  if (
    !Number.isInteger(frames) ||
    frames <= 0 ||
    frames > (OWNER_LIMITS.clipMs * OWNER_FPS) / 1000
  )
    throw new Error("codex_input_invalid");
  const count = Math.min(
    LOCAL_CODEX_POLICY.frames,
    Math.max(1, Math.floor(frames / OWNER_FPS)),
  );
  const uniform = (size: number) =>
    Array.from({ length: size }, (_, index) =>
      Math.round((index * frames) / size),
    );
  const changes = [
    ...new Set(
      speakerChanges
        .filter(
          (frame) => Number.isInteger(frame) && frame > 0 && frame < frames,
        )
        .map((frame) => Math.max(0, frame - OWNER_FPS / 5)),
    ),
  ].sort((a, b) => a - b);
  const targeted = spreadChanges(changes, Math.floor(count / 2));
  const anchors = new Set([...uniform(count - targeted.length), ...targeted]);
  // An opening/transition collision frees its slot for the original uniform grid.
  for (const frame of uniform(count)) {
    if (anchors.size >= count) break;
    anchors.add(frame);
  }
  return [...anchors].sort((a, b) => a - b);
}
