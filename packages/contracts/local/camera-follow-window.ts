import {
  ownerFocusAt,
  ownerFocusCrop,
  ownerSourceContent,
  type OwnerFocus,
} from "./focus.ts";
import type { OwnerCameraTrack } from "./camera-follow.ts";

/** A framing tolerance, separate from the pixels selected for head tracking. */
export function ownerFollowWindow(
  focus: OwnerFocus,
  track: Pick<OwnerCameraTrack, "seed" | "sourceStartFrame" | "followWindow">,
  squarePosition?: number,
) {
  const content = ownerSourceContent(focus.source);
  const crop = ownerFocusCrop(
    focus,
    ownerFocusAt(focus, track.sourceStartFrame),
    squarePosition,
  );
  const anchor = {
    x: (crop.x + crop.width / 2 - content.x) / content.width,
    y: (crop.y + crop.height / 2 - content.y) / content.height,
  };
  const head = {
    x: track.seed.x + track.seed.width / 2,
    y: track.seed.y + track.seed.height / 2,
  };
  const width = crop.width / content.width,
    height = crop.height / content.height;
  const radius = {
    x: Math.max(
      0,
      Math.min(
        (width * (track.followWindow ?? 0)) / 200,
        (width - track.seed.width) / 2 - Math.abs(head.x - anchor.x) - 0.005,
      ),
    ),
    y: Math.max(
      0,
      Math.min(
        (height * (track.followWindow ?? 0)) / 200,
        (height - track.seed.height) / 2 - Math.abs(head.y - anchor.y) - 0.005,
      ),
    ),
  };
  return {
    anchor,
    radius,
    box: {
      x: track.seed.x - radius.x,
      y: track.seed.y - radius.y,
      width: track.seed.width + radius.x * 2,
      height: track.seed.height + radius.y * 2,
    },
  };
}

/** Hysteresis holds small movements still; larger translation has no smoothing lag. */
export function steadyCameraCenter(
  focus: OwnerFocus,
  chain: readonly OwnerCameraTrack[],
  at: number,
  squarePosition?: number,
) {
  const first = chain[0]!;
  const { anchor, radius } = ownerFollowWindow(focus, first, squarePosition);
  const head = {
    x: first.seed.x + first.seed.width / 2,
    y: first.seed.y + first.seed.height / 2,
  };
  let offset = { x: 0, y: 0 },
    previous = { frame: first.startFrame, ...offset };
  const hold = (value: number, before: number, tolerance: number) =>
    Math.max(value - tolerance, Math.min(value + tolerance, before));
  for (const track of chain)
    for (const point of track.points) {
      const frame = track.startFrame + point.frame;
      offset = {
        x: hold(point.x - head.x, offset.x, radius.x),
        y: hold(point.y - head.y, offset.y, radius.y),
      };
      if (frame >= at) {
        const fraction =
          frame === previous.frame
            ? 1
            : Math.max(
                0,
                Math.min(1, (at - previous.frame) / (frame - previous.frame)),
              );
        return {
          x: anchor.x + previous.x + (offset.x - previous.x) * fraction,
          y: anchor.y + previous.y + (offset.y - previous.y) * fraction,
        };
      }
      previous = { frame, ...offset };
    }
  return { x: anchor.x + offset.x, y: anchor.y + offset.y };
}

/** Change a linked interval family together so chunk boundaries stay continuous. */
export function setOwnerFollowWindow(
  tracks: readonly OwnerCameraTrack[],
  id: string,
  value: number,
): OwnerCameraTrack[] {
  const family = new Set([id]);
  for (let i = 0; i < tracks.length; i++)
    for (const t of tracks) {
      if (t.continues && (family.has(t.id) || family.has(t.continues))) {
        family.add(t.id);
        family.add(t.continues);
      }
    }
  return tracks.map((t) =>
    family.has(t.id) ? { ...t, followWindow: value } : t,
  );
}

/** Keep stationary/in-frame cameras fixed; never infer another person's target. */
export function headEscapesCamera(focus: OwnerFocus, track: OwnerCameraTrack) {
  const content = ownerSourceContent(focus.source);
  const first = track.points[0]!;
  return track.points.some((point) => {
    const shot = ownerFocusAt(focus, track.sourceStartFrame + point.frame);
    if (
      shot.personId !== track.personId ||
      Math.hypot(point.x - first.x, point.y - first.y) < 0.002
    )
      return false;
    const crop = ownerFocusCrop(focus, shot);
    const left = (crop.x - content.x) / content.width,
      top = (crop.y - content.y) / content.height;
    return (
      point.x - track.seed.width / 2 < left ||
      point.x + track.seed.width / 2 > left + crop.width / content.width ||
      point.y - track.seed.height / 2 < top ||
      point.y + track.seed.height / 2 > top + crop.height / content.height
    );
  });
}
