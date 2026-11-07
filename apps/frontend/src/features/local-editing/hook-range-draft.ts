import {
  ownerHookSchema,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";

/** Incomplete endpoints belong only to the editor, never persisted media contracts. */
export type OwnerHookDraft = {
  startFrame: number | null;
  endFrame: number | null;
};
export function changeOwnerHookEndpoint(
  current: OwnerHookDraft,
  endpoint: keyof OwnerHookDraft,
  frame: number,
): OwnerHookDraft {
  const next = {
    ...current,
    [endpoint]: Number.isFinite(frame) ? frame : null,
  };
  if (
    endpoint === "startFrame" &&
    next.startFrame !== null &&
    next.endFrame !== null &&
    next.startFrame >= next.endFrame
  )
    next.endFrame = null;
  return next;
}
export function completeOwnerHookDraft(
  draft: OwnerHookDraft,
  frames: number,
  maxFrames = 10 * OWNER_FPS,
): OwnerHook | undefined {
  const parsed = ownerHookSchema.safeParse(draft);
  return parsed.success &&
    parsed.data.endFrame <= frames &&
    parsed.data.endFrame - parsed.data.startFrame <= maxFrames
    ? parsed.data
    : undefined;
}
