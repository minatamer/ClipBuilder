import type { OwnerVisualEdit } from "./assets.ts";
import {
  ownerFocusCrop,
  ownerSourceContent,
  type OwnerFocus,
} from "./focus.ts";

type Box = OwnerVisualEdit["box"];
type Interval = { startFrame: number; endFrame: number };
const initialBox: Box = {
  x: 80 / 1080,
  y: 900 / 1920,
  width: 920 / 1080,
  height: 520 / 1920,
};
const intersects = (a: Interval, b: Interval) =>
  a.startFrame < b.endFrame && b.startFrame < a.endFrame;
const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

/** Protect all observed people in every camera crop intersecting the cue. */
export function ownerVisualProtectedBoxes(
  focus: OwnerFocus,
  interval: Interval,
): Box[] {
  const content = ownerSourceContent(focus.source),
    boxes: Box[] = [];
  for (const shot of focus.shots.filter((s) => intersects(s, interval))) {
    const crop = ownerFocusCrop(focus, shot);
    for (const person of focus.people)
      for (const observation of person.observations) {
        if (
          !intersects(observation, {
            startFrame: Math.max(shot.startFrame, interval.startFrame),
            endFrame: Math.min(shot.endFrame, interval.endFrame),
          })
        )
          continue;
        const box = observation.box,
          left = (content.x + box.x * content.width - crop.x) / crop.width,
          top = (content.y + box.y * content.height - crop.y) / crop.height,
          right = left + (box.width * content.width) / crop.width,
          bottom = top + (box.height * content.height) / crop.height;
        if (right <= 0 || bottom <= 0 || left >= 1 || top >= 1) continue;
        // Boxes may include upper bodies; protect the full supplied rectangle
        // rather than guessing where a face ends. Include a small safe margin.
        const x = Math.max(0, left - 0.025),
          y = Math.max(0, top - 0.025);
        boxes.push({
          x,
          y,
          width: Math.min(1, right + 0.025) - x,
          height: Math.min(1, bottom + 0.025) - y,
        });
      }
  }
  return boxes;
}

/** Initial AI-picture geometry only; saved/manual coordinates are authoritative. */
export function placeOwnerPlannedVisual(
  focus: OwnerFocus | undefined,
  interval: Interval,
): Box {
  if (!focus) return { ...initialBox };
  const protectedBoxes = ownerVisualProtectedBoxes(focus, interval);
  if (!protectedBoxes.length) return { ...initialBox };
  const candidates: Box[] = [];
  for (const width of [initialBox.width, 0.7, 0.56, 0.44]) {
    const height = (width * initialBox.height) / initialBox.width;
    for (const y of [0.86 - height, 0.04, 0.96 - height, (1 - height) / 2])
      for (const x of [(1 - width) / 2, 0.04, 0.96 - width])
        candidates.push({ x, y, width, height });
  }
  const covered = (box: Box) =>
    protectedBoxes.reduce((area, face) => area + overlap(box, face), 0);
  const clear = candidates.find((box) => covered(box) === 0);
  if (clear) return clear;
  // Fully occupied portraits still retain usable, editable output. Minimize
  // proportional overlap; ties retain the first, largest/readable placement.
  return candidates.reduce((best, box) =>
    covered(box) / (box.width * box.height) <
    covered(best) / (best.width * best.height) - 1e-9
      ? box
      : best,
  );
}
