export type ScreenBeat = "intake" | "analysis" | "choose" | "review";
import { FILM_WORKSPACE } from "./film-workspace";
export const FILM_CAPTURE_SIZE = { width: 1440, height: 1000 } as const;

type Point = { x: number; y: number };
type Action = { from: number; click: number; to: Point };
export type CameraFraming = {
  anchorX: number;
  anchorY: number;
  lens: number;
  focus?: Point;
  focusWeight?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
// Zero velocity and acceleration at both ends, without spring overshoot.
const progress = (frame: number, from: number, to: number) => {
  const t = clamp((frame - from) / (to - from), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** A continuous path through the current source, jump-to and top-toolbar actions. */
function actionAt(beat: ScreenBeat, frame: number, duration: number) {
  if (beat === "analysis") return null;
  const actions: Action[] =
    beat === "intake"
      ? [
          { from: 0, click: 34, to: FILM_WORKSPACE.upload },
          { from: 36, click: 86, to: FILM_WORKSPACE.analyze },
        ]
      : beat === "choose"
        ? [
            { from: 0, click: 28, to: FILM_WORKSPACE.jump },
            { from: 36, click: duration - 14, to: FILM_WORKSPACE.process },
          ]
        : [{ from: 32, click: 80, to: FILM_WORKSPACE.download }];
  let from: Point =
    beat === "intake"
      ? { x: 805, y: 430 }
      : beat === "choose"
        ? { x: 470, y: 430 }
        : { x: 1050, y: 680 };
  let current = actions[0]!;
  for (const action of actions.slice(1)) {
    if (action.from > frame) break;
    from = current.to;
    current = action;
  }
  const travel = progress(frame, current.from, current.click - 2);
  return {
    x: from.x + (current.to.x - from.x) * travel,
    y: from.y + (current.to.y - from.y) * travel,
    opacity: progress(frame, 0, 8),
    origin: from,
    destination: current.to,
    travel,
    ring:
      frame < current.click
        ? 0
        : 1 - progress(frame, current.click, current.click + 18),
  };
}

export function screenCamera(
  beat: ScreenBeat,
  frame: number,
  duration: number,
  width: number,
  height: number,
  framing?: CameraFraming,
) {
  const cover = Math.max(
    width / FILM_CAPTURE_SIZE.width,
    height / FILM_CAPTURE_SIZE.height,
  );
  const actor = actionAt(beat, frame, duration);
  const cursor = actor
    ? { x: actor.x, y: actor.y, opacity: actor.opacity, ring: actor.ring }
    : null;
  const targetAt = (sample: number) => {
    const pointer = actionAt(beat, sample, duration);
    const zoom =
      beat === "analysis"
        ? 1.04
        : 1.1 + 0.12 * progress(sample, 0, duration - 1);
    const scale = cover * zoom * (framing?.lens ?? 1);
    const focusWeight = framing?.focusWeight ?? 0;
    const pointPose = (point: Point) => ({
      x: clamp(
        width * (framing?.anchorX ?? 0.5) -
          (point.x * (1 - focusWeight) +
            (framing?.focus?.x ?? 720) * focusWeight) *
            scale,
        width - 1440 * scale,
        0,
      ),
      y: clamp(
        height * (framing?.anchorY ?? 0.5) -
          (point.y * (1 - focusWeight) +
            (framing?.focus?.y ?? 500) * focusWeight) *
            scale,
        height - 1000 * scale,
        0,
      ),
    });
    const from = pointPose(pointer?.origin ?? { x: 720, y: 500 });
    const to = pointPose(pointer?.destination ?? { x: 720, y: 500 });
    const travel = pointer?.travel ?? 0;
    return {
      scale,
      x: from.x + (to.x - from.x) * travel,
      y: from.y + (to.y - from.y) * travel,
    };
  };
  // Symmetric finite filtering is seek-safe and anticipates the same eased mouse
  // path. Averaging bounded poses also preserves image coverage at the edges.
  let weight = 0,
    x = 0,
    y = 0,
    scale = 0;
  const filterSpan =
    progress(frame, 0, 24) * progress(duration - 1 - frame, 0, 24);
  for (let offset = -12; offset <= 12; offset++) {
    const influence = Math.exp(-(offset * offset) / 50);
    const pose = targetAt(clamp(frame + offset * filterSpan, 0, duration - 1));
    x += pose.x * influence;
    y += pose.y * influence;
    scale += pose.scale * influence;
    weight += influence;
  }
  scale /= weight;
  x /= weight;
  y /= weight;
  // Fade a travelling pointer at the edge rather than snapping the filtered camera.
  // Settled toolbar actions remain visible; a cut never reveals image edges.
  const room = cursor
    ? Math.min(
        x + cursor.x * scale,
        y + cursor.y * scale,
        width - x - (cursor.x + 40) * scale,
        height - y - (cursor.y + 48) * scale,
      )
    : 0;
  return {
    x,
    y,
    scale,
    zoom: scale / cover,
    cursor: cursor
      ? { ...cursor, opacity: cursor.opacity * progress(room, 0, 20) }
      : null,
  };
}
