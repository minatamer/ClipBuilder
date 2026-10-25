import {
  ownerFocusSchema,
  type OwnerFocus,
} from "../../../packages/contracts/local/focus.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import type { OwnerSource } from "../../../packages/contracts/local/index.ts";
import {
  ownerOriginalFocusCrop,
  type OwnerOutputProfile,
} from "./export-profile.ts";

/** Only validated numeric camera shots can enter the fixed native filter graph. */
export function ownerNativeFocusFilter(
  value: OwnerFocus | undefined,
  source: OwnerSource,
  profile: OwnerOutputProfile,
): string {
  if (!value)
    return `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
  const focus = ownerFocusSchema.parse(value);
  if (
    focus.source.width !== source.width ||
    focus.source.height !== source.height
  )
    throw new Error("stale_focus_source");
  const first = ownerOriginalFocusCrop(focus, focus.shots[0]!);
  const commands = focus.shots.slice(1).map((shot) => {
    const crop = ownerOriginalFocusCrop(focus, shot);
    return `${(shot.startFrame / OWNER_FPS).toFixed(6)} crop@focus w ${crop.width}, crop@focus h ${crop.height}, crop@focus x ${crop.x}, crop@focus y ${crop.y}`;
  });
  return `${commands.length ? `sendcmd=c='${commands.join(";")}',` : ""}crop@focus=${first.width}:${first.height}:${first.x}:${first.y},scale=${profile.width}:${profile.height}:eval=frame,setsar=1`;
}
