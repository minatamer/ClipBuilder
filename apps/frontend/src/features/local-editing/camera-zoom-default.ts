import type { OwnerCameraEffect } from "../../../../../packages/contracts/local/camera-motion.ts";
import type { OwnerFocus } from "../../../../../packages/contracts/local/focus.ts";
import {
  ownerHookFrames,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";

/** A creation default only: existing effects retain their authored timing. */
export function defaultCameraZoom({
  focus,
  hook,
  frame,
  positionIndex,
}: {
  focus: OwnerFocus;
  hook: OwnerHook | undefined;
  frame: number;
  positionIndex?: number | undefined;
}):
  | { effect: Omit<OwnerCameraEffect, "id"> }
  | { error: "position" | "duration" } {
  const prefix = ownerHookFrames({ hook });
  if (
    !Number.isSafeInteger(frame) ||
    frame < 0 ||
    frame >= prefix + focus.frames
  )
    return { error: "position" };
  const occurrence = hook && frame < prefix ? "hook" : "body",
    startFrame = occurrence === "hook" ? frame : frame - prefix,
    sourceStart = occurrence === "hook" ? hook!.startFrame : 0,
    sourceEnd = occurrence === "hook" ? hook!.endFrame : focus.frames,
    sourceFrame = sourceStart + startFrame;
  const position =
    positionIndex === undefined
      ? focus.shots.find(
          (shot) =>
            shot.startFrame <= sourceFrame && sourceFrame < shot.endFrame,
        )
      : focus.shots[positionIndex];
  if (
    !position ||
    sourceFrame < Math.max(sourceStart, position.startFrame) ||
    sourceFrame >= Math.min(sourceEnd, position.endFrame)
  )
    return { error: "position" };
  const zoomFrames = Math.min(sourceEnd, position.endFrame) - sourceFrame;
  if (zoomFrames < 2) return { error: "duration" };
  return {
    effect: {
      occurrence,
      startFrame,
      zoomFrames,
      holdFrames: 0,
      returnFrames: 0,
      target: {
        centerX: position.centerX,
        centerY: position.centerY,
        zoom: 1.5,
      },
    },
  };
}
