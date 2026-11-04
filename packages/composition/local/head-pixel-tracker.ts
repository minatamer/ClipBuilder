/** Classical region-seeded image motion. No detector, model or identity data. */
export type GrayFrame = { width: number; height: number; pixels: Float32Array };
export type HeadBox = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };
const sample = (f: GrayFrame, x: number, y: number) => {
  x = Math.max(0, Math.min(f.width - 1.001, x));
  y = Math.max(0, Math.min(f.height - 1.001, y));
  const ix = Math.floor(x),
    iy = Math.floor(y),
    dx = x - ix,
    dy = y - iy;
  const at = iy * f.width + ix;
  return (
    f.pixels[at]! * (1 - dx) * (1 - dy) +
    f.pixels[at + 1]! * dx * (1 - dy) +
    f.pixels[at + f.width]! * (1 - dx) * dy +
    f.pixels[at + f.width + 1]! * dx * dy
  );
};
export function grayHeadFrame(
  width: number,
  height: number,
  rgba: Uint8ClampedArray,
): GrayFrame {
  const pixels = new Float32Array(width * height);
  for (let i = 0; i < pixels.length; i++)
    pixels[i] =
      rgba[i * 4]! * 0.299 +
      rgba[i * 4 + 1]! * 0.587 +
      rgba[i * 4 + 2]! * 0.114;
  return { width, height, pixels };
}
function pyramid(frame: GrayFrame) {
  const levels = [frame];
  while (levels.length < 3) {
    const previous = levels.at(-1)!,
      width = Math.floor(previous.width / 2),
      height = Math.floor(previous.height / 2);
    const pixels = new Float32Array(width * height);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const i = y * 2 * previous.width + x * 2;
        pixels[y * width + x] =
          (previous.pixels[i]! +
            previous.pixels[i + 1]! +
            previous.pixels[i + previous.width]! +
            previous.pixels[i + previous.width + 1]!) /
          4;
      }
    levels.push({ width, height, pixels });
  }
  return levels;
}
function corners(frame: GrayFrame, box: HeadBox): Point[] {
  const candidates: (Point & { score: number })[] = [];
  const left = Math.max(5, Math.ceil(box.x)),
    right = Math.min(frame.width - 6, Math.floor(box.x + box.width));
  const top = Math.max(5, Math.ceil(box.y)),
    bottom = Math.min(frame.height - 6, Math.floor(box.y + box.height));
  for (let y = top; y <= bottom; y += 2)
    for (let x = left; x <= right; x += 2) {
      let xx = 0,
        xy = 0,
        yy = 0;
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const dx =
            (sample(frame, x + i + 1, y + j) -
              sample(frame, x + i - 1, y + j)) /
            2;
          const dy =
            (sample(frame, x + i, y + j + 1) -
              sample(frame, x + i, y + j - 1)) /
            2;
          xx += dx * dx;
          xy += dx * dy;
          yy += dy * dy;
        }
      const score = (xx + yy - Math.sqrt((xx - yy) ** 2 + 4 * xy * xy)) / 2;
      if (score > 80) candidates.push({ x, y, score });
    }
  candidates.sort((a, b) => b.score - a.score);
  const chosen: Point[] = [];
  for (const p of candidates) {
    if (chosen.every((q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 >= 25))
      chosen.push({ x: p.x, y: p.y });
    if (chosen.length === 32) break;
  }
  return chosen;
}
/** Inverse-compositional pyramidal Lucas–Kanade, checked in both directions. */
function flow(
  before: GrayFrame[],
  after: GrayFrame[],
  point: Point,
): Point | null {
  let dx = 0,
    dy = 0;
  for (let level = before.length - 1; level >= 0; level--) {
    if (level < before.length - 1) {
      dx *= 2;
      dy *= 2;
    }
    const a = before[level]!,
      b = after[level]!,
      scale = 2 ** level,
      x = point.x / scale,
      y = point.y / scale;
    if (x < 4 || y < 4 || x >= a.width - 5 || y >= a.height - 5) continue;
    let xx = 0,
      xy = 0,
      yy = 0;
    const patch: {
      x: number;
      y: number;
      value: number;
      gx: number;
      gy: number;
    }[] = [];
    for (let j = -3; j <= 3; j++)
      for (let i = -3; i <= 3; i++) {
        const gx =
          (sample(a, x + i + 1, y + j) - sample(a, x + i - 1, y + j)) / 2;
        const gy =
          (sample(a, x + i, y + j + 1) - sample(a, x + i, y + j - 1)) / 2;
        patch.push({
          x: x + i,
          y: y + j,
          value: sample(a, x + i, y + j),
          gx,
          gy,
        });
        xx += gx * gx;
        xy += gx * gy;
        yy += gy * gy;
      }
    const determinant = xx * yy - xy * xy;
    if (determinant < 100) return null;
    for (let iteration = 0; iteration < 12; iteration++) {
      if (
        x + dx < 4 ||
        y + dy < 4 ||
        x + dx >= b.width - 5 ||
        y + dy >= b.height - 5
      )
        return null;
      let rx = 0,
        ry = 0;
      for (const p of patch) {
        const residual = p.value - sample(b, p.x + dx, p.y + dy);
        rx += p.gx * residual;
        ry += p.gy * residual;
      }
      const sx = (yy * rx - xy * ry) / determinant,
        sy = (xx * ry - xy * rx) / determinant;
      if (!Number.isFinite(sx + sy) || Math.abs(sx) > 5 || Math.abs(sy) > 5)
        return null;
      dx += sx;
      dy += sy;
      if (sx * sx + sy * sy < 0.0025) break;
    }
  }
  if (Math.hypot(dx, dy) > 40) return null;
  let error = 0;
  for (let j = -3; j <= 3; j++)
    for (let i = -3; i <= 3; i++)
      error += Math.abs(
        sample(before[0]!, point.x + i, point.y + j) -
          sample(after[0]!, point.x + dx + i, point.y + dy + j),
      );
  return error / 49 > 28 ? null : { x: point.x + dx, y: point.y + dy };
}
const median = (values: number[]) =>
  values.sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
function patch(frame: GrayFrame, box: HeadBox) {
  const values = new Float32Array(16 * 16);
  let mean = 0;
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const value = sample(
        frame,
        box.x + ((x + 0.5) * box.width) / 16,
        box.y + ((y + 0.5) * box.height) / 16,
      );
      values[y * 16 + x] = value;
      mean += value;
    }
  mean /= values.length;
  let norm = 0;
  for (let i = 0; i < values.length; i++) {
    values[i] = values[i]! - mean;
    norm += values[i]! ** 2;
  }
  norm = Math.sqrt(norm);
  if (norm < 100) return null;
  for (let i = 0; i < values.length; i++) values[i] = values[i]! / norm;
  return values;
}
const correlation = (a: Float32Array, b: Float32Array) =>
  a.reduce((sum, value, i) => sum + value * b[i]!, 0);

export class HeadPixelTracker {
  private previous: GrayFrame[];
  private points: Point[];
  private box: HeadBox;
  private readonly original: Float32Array;
  private count = 0;
  private center: Point;
  constructor(
    frame: GrayFrame,
    normalized: HeadBox,
    private readonly options: {
      immediate?: boolean;
      recoverTranslation?: boolean;
    } = {},
  ) {
    if (
      !Number.isInteger(frame.width) ||
      !Number.isInteger(frame.height) ||
      frame.width < 32 ||
      frame.height < 32 ||
      frame.width > 512 ||
      frame.height > 512 ||
      frame.pixels.length !== frame.width * frame.height
    )
      throw Error("head_frame_invalid");
    this.previous = pyramid(frame);
    this.box = {
      x: normalized.x * frame.width,
      y: normalized.y * frame.height,
      width: normalized.width * frame.width,
      height: normalized.height * frame.height,
    };
    this.points = corners(frame, this.box);
    const initial = patch(frame, this.box);
    if (this.points.length < 6 || !initial) throw Error("head_not_clear");
    this.original = initial;
    this.center = {
      x: this.box.x + this.box.width / 2,
      y: this.box.y + this.box.height / 2,
    };
  }
  /** Reacquire a unique translated copy of the same recent pixels, never a detector. */
  private recover(frame: GrayFrame): Point | null {
    if (!this.options.recoverTranslation) return null;
    const previous = patch(this.previous[0]!, this.box);
    if (!previous) return null;
    const radius = Math.min(128, Math.floor(frame.width * 0.3));
    const candidates: { box: HeadBox; score: number }[] = [];
    const score = (x: number, y: number) => {
      if (
        x < 0 ||
        y < 0 ||
        x + this.box.width > frame.width ||
        y + this.box.height > frame.height
      )
        return;
      const box = { ...this.box, x, y },
        appearance = patch(frame, box);
      if (!appearance || correlation(this.original, appearance) < 0.35) return;
      candidates.push({ box, score: correlation(previous, appearance) });
    };
    for (let dy = -radius; dy <= radius; dy += 2)
      for (let dx = -radius; dx <= radius; dx += 2)
        score(this.box.x + dx, this.box.y + dy);
    candidates.sort((a, b) => b.score - a.score);
    const coarse = candidates[0];
    if (!coarse) return null;
    for (let dy = -2; dy <= 2; dy += 0.5)
      for (let dx = -2; dx <= 2; dx += 0.5)
        score(coarse.box.x + dx, coarse.box.y + dy);
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0]!;
    const other = candidates.find(
      (candidate) =>
        Math.hypot(candidate.box.x - best.box.x, candidate.box.y - best.box.y) >
        Math.max(this.box.width, this.box.height) * 0.5,
    );
    if (best.score < 0.85 || (other && best.score - other.score < 0.1))
      return null;
    const points = corners(frame, best.box);
    if (points.length < 6) return null;
    this.box = best.box;
    this.previous = pyramid(frame);
    this.points = points;
    this.center = {
      x: best.box.x + best.box.width / 2,
      y: best.box.y + best.box.height / 2,
    };
    return {
      x: Number((this.center.x / frame.width).toFixed(6)),
      y: Number((this.center.y / frame.height).toFixed(6)),
    };
  }
  step(frame: GrayFrame): Point | null {
    const old = this.previous[0]!;
    if (
      frame.width !== old.width ||
      frame.height !== old.height ||
      frame.pixels.length !== old.pixels.length
    )
      return null;
    const next = pyramid(frame);
    const candidates: { point: Point; dx: number; dy: number }[] = [];
    for (const p of this.points) {
      const q = flow(this.previous, next, p);
      if (!q) continue;
      const back = flow(next, this.previous, q);
      if (back && Math.hypot(back.x - p.x, back.y - p.y) <= 1.5)
        candidates.push({ point: q, dx: q.x - p.x, dy: q.y - p.y });
    }
    if (candidates.length < 5 || candidates.length < this.points.length * 0.45)
      return this.recover(frame);
    const dx = median(candidates.map((p) => p.dx)),
      dy = median(candidates.map((p) => p.dy));
    const inliers = candidates.filter(
      (p) => Math.hypot(p.dx - dx, p.dy - dy) < 2.5,
    );
    if (
      inliers.length < 5 ||
      inliers.length < candidates.length * 0.6 ||
      Math.hypot(dx, dy) > Math.max(this.box.width, this.box.height) * 0.6
    )
      return this.recover(frame);
    const moved = { ...this.box, x: this.box.x + dx, y: this.box.y + dy };
    const appearance = patch(frame, moved),
      previous = patch(old, this.box);
    if (
      !appearance ||
      !previous ||
      correlation(previous, appearance) < 0.5 ||
      correlation(this.original, appearance) < 0.22
    )
      return this.recover(frame);
    const x = moved.x + moved.width / 2,
      y = moved.y + moved.height / 2;
    if (x < 0 || y < 0 || x > frame.width || y > frame.height) return null;
    this.box = moved;
    this.previous = next;
    this.points = inliers.map((p) => p.point);
    if (++this.count % 8 === 0) {
      const refreshed = corners(frame, {
        x: moved.x + moved.width * 0.1,
        y: moved.y + moved.height * 0.1,
        width: moved.width * 0.8,
        height: moved.height * 0.8,
      });
      if (refreshed.length >= 8) this.points = refreshed;
    }
    this.center = {
      x:
        this.center.x +
        (x - this.center.x) * (this.options.immediate ? 1 : 0.7),
      y:
        this.center.y +
        (y - this.center.y) * (this.options.immediate ? 1 : 0.7),
    };
    return {
      x: Number((this.center.x / frame.width).toFixed(6)),
      y: Number((this.center.y / frame.height).toFixed(6)),
    };
  }
}
