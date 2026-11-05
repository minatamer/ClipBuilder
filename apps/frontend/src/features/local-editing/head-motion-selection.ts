import {
  ownerFocusAt,
  type OwnerFocus,
} from "../../../../../packages/contracts/local/focus.ts";
import type { OwnerCameraTrack } from "../../../../../packages/contracts/local/camera-follow.ts";

/** A camera row can precede a partial path; match its whole position, not frame zero. */
export function motionForCameraPosition<
  T extends Pick<
    OwnerCameraTrack,
    "id" | "personId" | "sourceStartFrame" | "startFrame" | "endFrame"
  >,
>(
  focus: OwnerFocus,
  tracks: readonly T[],
  frame: number,
  preferred: string | null,
): T | undefined {
  if (!Number.isInteger(frame) || frame < 0 || frame >= focus.frames)
    return undefined;
  const shot = ownerFocusAt(focus, frame);
  const matching = tracks.filter(
    (track) =>
      track.personId === shot.personId &&
      track.sourceStartFrame < shot.endFrame &&
      shot.startFrame <
        track.sourceStartFrame + track.endFrame - track.startFrame,
  );
  return matching.find((track) => track.id === preferred) ?? matching[0];
}
