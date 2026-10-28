export type ScreenBeat = "intake" | "analysis" | "choose" | "review";
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

/** A single continuous path: pick, then proceed. The camera never invents a move. */
function actionAt(beat: ScreenBeat, frame: number, duration: number) {
  if (beat === "analysis") return null;
  const actions: Action[] =
    beat === "intake"
      ? [
          { from: 0, click: 25, to: { x: 650, y: 590 } },
          { from: 32, click: 76, to: { x: 1256, y: 945 } },
        ]
      : beat === "choose"
        ? [
            { from: 0, click: 28, to: { x: 307, y: 575 } },
            { from: 36, click: duration - 14, to: { x: 1264, y: 945 } },
          ]
        : [{ from: 32, click: 80, to: { x: 1240, y: 945 } }];
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
  const cursor = actionAt(beat, frame, duration);
  const targetAt = (sample: number) => {
    const pointer = actionAt(beat, sample, duration);
    const zoom =
      beat === "analysis"
        ? 1.04
        : 1.1 + 0.12 * progress(sample, 0, duration - 1);
    const scale = cover * zoom * (framing?.lens ?? 1);
    const focusWeight = framing?.focusWeight ?? 0;
    const focusX =
      (pointer?.x ?? 720) * (1 - focusWeight) +
      (framing?.focus?.x ?? 720) * focusWeight;
    const focusY =
      (pointer?.y ?? 500) * (1 - focusWeight) +
      (framing?.focus?.y ?? 500) * focusWeight;
    return {
      scale,
      x: clamp(
        width * (framing?.anchorX ?? 0.5) - focusX * scale,
        width - 1440 * scale,
        0,
      ),
      y: clamp(
        height * (framing?.anchorY ?? 0.5) - focusY * scale,
        height - 1000 * scale,
        0,
      ),
    };
  };
  // Symmetric finite filtering is seek-safe and anticipates the same eased mouse
  // path. Averaging bounded poses also preserves image coverage at the edges.
  let weight = 0,
    x = 0,
    y = 0,
    scale = 0;
  for (let offset = -12; offset <= 12; offset++) {
    const influence = Math.exp(-(offset * offset) / 50);
    const pose = targetAt(clamp(frame + offset, 0, duration - 1));
    x += pose.x * influence;
    y += pose.y * influence;
    scale += pose.scale * influence;
    weight += influence;
  }
  scale /= weight;
  x /= weight;
  y /= weight;
  if (cursor && (framing?.focusWeight ?? 0) < 0.01) {
    // Retain the complete pointer and nearby control label during a close-up.
    const left = Math.max(0, cursor.x - 120);
    const right = Math.min(1440, cursor.x + 120);
    const top = Math.max(0, cursor.y - 60);
    const bottom = Math.min(1000, cursor.y + 52);
    x = clamp(
      x,
      Math.max(width - 1440 * scale, -left * scale),
      Math.min(0, width - right * scale),
    );
    y = clamp(
      y,
      Math.max(height - 1000 * scale, -top * scale),
      Math.min(0, height - bottom * scale),
    );
  }
  return { x, y, scale, zoom: scale / cover, cursor };
}
