import { z } from "zod";
import { ownerBlackBarCameraWindow } from "./black-bars.ts";
import { OWNER_FPS, OWNER_LIMITS, ownerIdSchema } from "./policy.ts";
import { ownerHookFrames, type OwnerHook } from "./hook.ts";
import {
  ownerFocusAt,
  ownerFocusCrop,
  ownerSourceContent,
  type OwnerFocus,
} from "./focus.ts";
import {
  ownerCameraFollowCrop,
  type OwnerCameraTrack,
} from "./camera-follow.ts";

export const OWNER_CAMERA_MOTION = {
  effects: 60,
  returnFrames: 12,
  settleFrames: 3,
} as const;
const frame = z
  .number()
  .int()
  .nonnegative()
  .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000);
export const ownerCameraTargetSchema = z
  .object({
    centerX: z.number().finite().min(0).max(1),
    centerY: z.number().finite().min(0).max(1),
    zoom: z.number().finite().min(1).max(8),
  })
  .strict();
export const ownerCameraEffectSchema = z
  .object({
    id: ownerIdSchema,
    kind: z.literal("pan").optional(),
    occurrence: z.enum(["hook", "body"]),
    startFrame: frame,
    zoomFrames: frame.refine((value) => value > 0),
    holdFrames: frame,
    returnFrames: z.union([
      z.literal(0),
      z.literal(OWNER_CAMERA_MOTION.returnFrames),
    ]),
    target: ownerCameraTargetSchema,
  })
  .strict();
export type OwnerCameraEffect = z.infer<typeof ownerCameraEffectSchema>;
export const ownerCameraEffectsSchema = z
  .array(ownerCameraEffectSchema)
  .max(OWNER_CAMERA_MOTION.effects)
  .refine(
    (items) => {
      if (new Set(items.map((item) => item.id)).size !== items.length)
        return false;
      return items.every((item, index) =>
        items.every(
          (other, next) =>
            next === index ||
            item.occurrence !== other.occurrence ||
            ownerCameraEffectEnd(item) <= other.startFrame ||
            ownerCameraEffectEnd(other) <= item.startFrame,
        ),
      );
    },
    { message: "Zoom effects cannot overlap in the same occurrence." },
  );
export type OwnerCameraRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
/** Serialized interval bound; visual hold ends at its camera/successor instead. */
export function ownerCameraEffectEnd(effect: OwnerCameraEffect) {
  return (
    effect.startFrame +
    effect.zoomFrames +
    effect.holdFrames +
    effect.returnFrames
  );
}
export function ownerCameraEffectsFit(
  items: readonly OwnerCameraEffect[],
  clock: {
    frames: number;
    hook?: OwnerHook | undefined;
    cameraTracks?: readonly OwnerCameraTrack[] | undefined;
  },
) {
  return items.every(
    (item) =>
      ownerCameraEffectEnd(item) <=
        (item.occurrence === "hook" ? ownerHookFrames(clock) : clock.frames) &&
      !clock.cameraTracks?.some(
        (track) =>
          track.occurrence === item.occurrence &&
          track.startFrame < ownerCameraEffectEnd(item) &&
          item.startFrame < track.endFrame,
      ),
  );
}
/** Continuous 9:16 geometry; only the native projection rounds to codec pixels. */
export function ownerCameraTargetCrop(
  focus: Pick<OwnerFocus, "source">,
  target: OwnerCameraEffect["target"],
  squarePosition?: number,
): OwnerCameraRect {
  const content = ownerSourceContent(focus.source);
  const unit = Math.min(content.width / 18, content.height / 32) / target.zoom;
  const width = 18 * unit;
  const { height, offsetY } = ownerBlackBarCameraWindow(
    width,
    32 * unit,
    squarePosition,
  );
  return {
    x: Math.max(
      content.x,
      Math.min(
        content.x + content.width - width,
        content.x + target.centerX * content.width - width / 2,
      ),
    ),
    y: Math.max(
      content.y,
      Math.min(
        content.y + content.height - height,
        content.y + target.centerY * content.height + offsetY - height / 2,
      ),
    ),
    width,
    height,
  };
}
const ease = (value: number) => {
  const p = Math.max(0, Math.min(1, value));
  return p * p * (3 - 2 * p);
};
const blend = (
  left: OwnerCameraRect,
  right: OwnerCameraRect,
  p: number,
): OwnerCameraRect => ({
  x: left.x + (right.x - left.x) * p,
  y: left.y + (right.y - left.y) * p,
  width: left.width + (right.width - left.width) * p,
  height: left.height + (right.height - left.height) * p,
});
/** Pan changes center while retaining the preceding camera magnification. */
export function ownerCameraPanCrop(
  focus: Pick<OwnerFocus, "source">,
  target: OwnerCameraEffect["target"],
  start: OwnerCameraRect,
  squarePosition?: number,
): OwnerCameraRect {
  const content = ownerSourceContent(focus.source);
  return {
    ...start,
    x: Math.max(
      content.x,
      Math.min(
        content.x + content.width - start.width,
        content.x + target.centerX * content.width - start.width / 2,
      ),
    ),
    y: Math.max(
      content.y,
      Math.min(
        content.y + content.height - start.height,
        content.y +
          target.centerY * content.height +
          ownerBlackBarCameraWindow(
            start.width,
            (start.width * 16) / 9,
            squarePosition,
          ).offsetY -
          start.height / 2,
      ),
    ),
  };
}
/** Shared by the Player and native frame sampler. Baseline shots are never rewritten. */
export function ownerCameraCropAt(
  focus: OwnerFocus,
  effects: readonly OwnerCameraEffect[],
  sourceFrame: number,
  occurrence: "hook" | "body",
  occurrenceFrame: number,
  tracks: readonly OwnerCameraTrack[] = [],
  squarePosition?: number,
): OwnerCameraRect {
  const baseline = ownerCameraFollowCrop(
    focus,
    tracks,
    sourceFrame,
    occurrence,
    occurrenceFrame,
    squarePosition,
  );
  const sourceOffset = Math.round(sourceFrame - occurrenceFrame);
  // Arrival/legacy pulse clocks never release a position's zoom. A later camera
  // row or explicit Zoom/Motion owns the next framing, including repeated people.
  const zoomAt = (at: number) => {
    let chosen: OwnerCameraEffect | undefined;
    for (const item of effects) {
      if (item.occurrence !== occurrence || at < item.startFrame) continue;
      const position = ownerFocusAt(focus, sourceOffset + item.startFrame);
      const sourceAt = sourceOffset + at;
      if (sourceAt < position.startFrame || sourceAt >= position.endFrame)
        continue;
      if (
        tracks.some(
          (track) =>
            track.occurrence === occurrence &&
            track.startFrame >= item.startFrame &&
            track.startFrame <= at,
        )
      )
        continue;
      if (!chosen || item.startFrame > chosen.startFrame) chosen = item;
    }
    return chosen;
  };
  const effect = zoomAt(occurrenceFrame);
  if (!effect) return baseline;
  const targetFor = (item: OwnerCameraEffect): OwnerCameraRect => {
    if (item.kind !== "pan")
      return ownerCameraTargetCrop(focus, item.target, squarePosition);
    const position = ownerFocusAt(focus, sourceOffset + item.startFrame);
    const previous = zoomAt(item.startFrame - 1);
    const start =
      previous &&
      ownerFocusAt(focus, sourceOffset + previous.startFrame) === position
        ? targetFor(previous)
        : ownerFocusCrop(focus, position, squarePosition);
    return ownerCameraPanCrop(focus, item.target, start, squarePosition);
  };
  const at = occurrenceFrame - effect.startFrame,
    target = targetFor(effect);
  if (at < effect.zoomFrames) {
    const position = ownerFocusAt(focus, sourceOffset + effect.startFrame);
    const previous = zoomAt(effect.startFrame - 1);
    const start =
      previous &&
      ownerFocusAt(focus, sourceOffset + previous.startFrame) === position
        ? targetFor(previous)
        : ownerFocusCrop(focus, position, squarePosition);
    const duration =
      effect.returnFrames === 0 ? effect.zoomFrames - 1 : effect.zoomFrames;
    return blend(start, target, duration > 0 ? ease(at / duration) : 1);
  }
  return target;
}
