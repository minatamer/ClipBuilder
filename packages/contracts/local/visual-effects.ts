import { z } from "zod";
import type { OwnerVisualTracking } from "./visual-tracking.ts";

const point = z.number().finite().min(0).max(1);
export const ownerVisualEffectSchema = z
  .object({
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
    zoom: z.number().finite().min(1).max(3),
    fromX: point,
    fromY: point,
    toX: point,
    toY: point,
    progressStart: point.optional(),
    progressEnd: point.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.endFrame > value.startFrame &&
      (value.progressStart ?? 0) <= (value.progressEnd ?? 1),
  );
export type OwnerVisualEffect = z.infer<typeof ownerVisualEffectSchema>;

/** Stateless crop/zoom shared by browser media and native decoded frames. */
export function ownerVisualTransform(
  cue: {
    focal?: { x: number; y: number } | undefined;
    effect?: OwnerVisualEffect | undefined;
    tracking?: OwnerVisualTracking | undefined;
    box?: { width: number; height: number } | undefined;
    fit?: "contain" | "cover" | undefined;
    presentation?: "inset" | "full-frame" | undefined;
    endFrame?: number | undefined;
  },
  frame: number,
  source?: { width: number; height: number } | undefined,
) {
  const effect = cue.effect;
  const progress = effect
    ? Math.max(
        0,
        Math.min(
          1,
          (frame - effect.startFrame) / (effect.endFrame - effect.startFrame),
        ),
      )
    : 0;
  const sampled = effect
    ? (effect.progressStart ?? 0) +
      ((effect.progressEnd ?? 1) - (effect.progressStart ?? 0)) * progress
    : 0;
  const eased = sampled * sampled * (3 - 2 * sampled);
  const result = {
    zoom: effect ? 1 + (effect.zoom - 1) * eased : 1,
    x: effect
      ? effect.fromX + (effect.toX - effect.fromX) * eased
      : (cue.focal?.x ?? 0.5),
    y: effect
      ? effect.fromY + (effect.toY - effect.fromY) * eased
      : (cue.focal?.y ?? 0.5),
  };
  const track = cue.tracking;
  if (
    !track ||
    !source ||
    !cue.box ||
    frame < track.startFrame ||
    frame >= track.endFrame
  )
    return result;
  const full = cue.presentation === "full-frame";
  const width = full ? 1080 : cue.box.width * 1080;
  const height = full ? 1920 : cue.box.height * 1920;
  const scale =
    (full || cue.fit === "cover" ? Math.max : Math.min)(
      width / source.width,
      height / source.height,
    ) * result.zoom;
  const crop = {
    x: width / (source.width * scale),
    y: height / (source.height * scale),
  };
  const at = frame - track.startFrame;
  const right = track.points.findIndex((point) => point.frame >= at);
  const after = track.points[right < 0 ? track.points.length - 1 : right]!;
  const before = track.points[Math.max(0, right - 1)]!;
  const fraction =
    after.frame === before.frame
      ? 1
      : (at - before.frame) / (after.frame - before.frame);
  const edge = Math.max(
    0,
    Math.min(
      1,
      at / 3,
      cue.endFrame !== undefined && track.endFrame < cue.endFrame
        ? (track.endFrame - 1 - frame) / 3
        : 1,
    ),
  );
  for (const axis of ["x", "y"] as const) {
    if (crop[axis] >= 1) continue;
    const head = before[axis] + (after[axis] - before[axis]) * fraction;
    const delta = head - track.points[0]![axis];
    result[axis] = Math.max(
      0,
      Math.min(1, result[axis] + (delta * edge) / (1 - crop[axis])),
    );
  }
  return result;
}
