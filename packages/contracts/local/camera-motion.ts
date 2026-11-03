import { z } from "zod";
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
  holdFrames: 9,
  returnFrames: 12,
  settleFrames: 3,
  defaultZoomFrames: 15,
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
    occurrence: z.enum(["hook", "body"]),
    startFrame: frame,
    zoomFrames: frame.refine((value) => value > 0),
    holdFrames: z.literal(OWNER_CAMERA_MOTION.holdFrames),
    returnFrames: z.literal(OWNER_CAMERA_MOTION.returnFrames),
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
      ownerCameraEffectEnd(item) + OWNER_CAMERA_MOTION.settleFrames <=
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
): OwnerCameraRect {
  const content = ownerSourceContent(focus.source);
  const unit = Math.min(content.width / 18, content.height / 32) / target.zoom;
  const width = 18 * unit,
    height = 32 * unit;
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
        content.y + target.centerY * content.height - height / 2,
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
/** Shared by the Player and native frame sampler. Baseline shots are never rewritten. */
export function ownerCameraCropAt(
  focus: OwnerFocus,
  effects: readonly OwnerCameraEffect[],
  sourceFrame: number,
  occurrence: "hook" | "body",
  occurrenceFrame: number,
  tracks: readonly OwnerCameraTrack[] = [],
): OwnerCameraRect {
  const baseline = ownerCameraFollowCrop(
    focus,
    tracks,
    sourceFrame,
    occurrence,
    occurrenceFrame,
  );
  const effect = effects.find(
    (item) =>
      item.occurrence === occurrence &&
      occurrenceFrame >= item.startFrame &&
      occurrenceFrame < ownerCameraEffectEnd(item),
  );
  if (!effect) return baseline;
  const at = occurrenceFrame - effect.startFrame,
    target = ownerCameraTargetCrop(focus, effect.target);
  if (at < effect.zoomFrames) {
    const start = ownerFocusCrop(focus, ownerFocusAt(focus, sourceFrame - at));
    return blend(start, target, ease(at / effect.zoomFrames));
  }
  if (at < effect.zoomFrames + effect.holdFrames) return target;
  return blend(
    target,
    baseline,
    ease((at - effect.zoomFrames - effect.holdFrames) / effect.returnFrames),
  );
}
