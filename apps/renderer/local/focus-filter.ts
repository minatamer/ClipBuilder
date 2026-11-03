import {
  ownerFocusSchema,
  type OwnerFocus,
} from "../../../packages/contracts/local/focus.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import {
  ownerCameraCropAt,
  type OwnerCameraEffect,
} from "../../../packages/contracts/local/camera-motion.ts";
import type { OwnerHook } from "../../../packages/contracts/local/hook.ts";
import type { OwnerSource } from "../../../packages/contracts/local/index.ts";
import type { OwnerCameraTrack } from "../../../packages/contracts/local/camera-follow.ts";
import {
  ownerOriginalFocusCrop,
  ownerOriginalCameraCrop,
  type OwnerOutputProfile,
} from "./export-profile.ts";

/** Only validated numeric camera shots can enter the fixed native filter graph. */
export function ownerNativeFocusFilter(
  value: OwnerFocus | undefined,
  source: OwnerSource,
  profile: OwnerOutputProfile,
  target: "focus" | "body" | "hook" = "focus",
  motion?: {
    effects: readonly OwnerCameraEffect[];
    tracks?: readonly OwnerCameraTrack[];
    occurrence: "hook" | "body";
    hook?: OwnerHook | undefined;
    hookStartFrame?: number;
  },
): string {
  if (!value)
    return `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
  const focus = ownerFocusSchema.parse(value);
  if (
    focus.source.width !== source.width ||
    focus.source.height !== source.height
  )
    throw new Error("stale_focus_source");
  const moving =
    motion?.tracks?.some((track) => track.occurrence === motion.occurrence) ||
    motion?.effects.some((effect) => effect.occurrence === motion.occurrence);
  const cropAt = (index: number) => {
    const phaseFrame =
      ((index -
        (motion?.occurrence === "hook" ? (motion.hookStartFrame ?? 0) : 0)) *
        OWNER_FPS) /
      profile.fps;
    const sourceFrame =
      motion?.occurrence === "hook"
        ? (motion.hook?.startFrame ?? 0) + phaseFrame
        : phaseFrame;
    return ownerOriginalCameraCrop(
      focus,
      ownerCameraCropAt(
        focus,
        motion?.effects ?? [],
        sourceFrame,
        motion?.occurrence ?? "body",
        phaseFrame,
        motion?.tracks ?? [],
      ),
    );
  };
  const first = moving
    ? cropAt(0)
    : ownerOriginalFocusCrop(focus, focus.shots[0]!);
  const commands = moving
    ? []
    : focus.shots.slice(1).map((shot) => {
        const crop = ownerOriginalFocusCrop(focus, shot);
        return `${(shot.startFrame / OWNER_FPS).toFixed(6)} crop@${target} w ${crop.width}, crop@${target} h ${crop.height}, crop@${target} x ${crop.x}, crop@${target} y ${crop.y}`;
      });
  if (moving) {
    let previous = first;
    for (let index = 1; index < profile.frames; index++) {
      const crop = cropAt(index);
      if (
        crop.x === previous.x &&
        crop.y === previous.y &&
        crop.width === previous.width &&
        crop.height === previous.height
      )
        continue;
      const at = Math.max(0, index / profile.fps - 1e-7).toFixed(9);
      commands.push(
        `${at} crop@${target} w ${crop.width}, crop@${target} h ${crop.height}, crop@${target} x ${crop.x}, crop@${target} y ${crop.y}`,
      );
      previous = crop;
    }
  }
  // Keep the scaler input aspect stable when crop dimensions change. FFmpeg 5.1
  // can otherwise stop delivering frames to the downstream overlay at a zoom.
  return `${commands.length ? `sendcmd=c='${commands.join(";")}',` : ""}crop@${target}=${first.width}:${first.height}:${first.x}:${first.y},setsar=1,scale=${profile.width}:${profile.height}:eval=frame,setsar=1`;
}
