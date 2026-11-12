import { z } from "zod";

export const ownerBlackBarPositionSchema = z.number().finite().min(0).max(1);
export const OWNER_BLACK_BAR_FRAME = {
  width: 1080,
  height: 1920,
  inset: 420,
} as const;

/** Square source bounds are independent of the discarded portrait extent.
 * Retain the optional legacy vertical offset without constraining the square.
 */
export function ownerBlackBarCameraWindow(
  width: number,
  portraitHeight: number,
  position?: number,
) {
  return position === undefined
    ? { height: portraitHeight, offsetY: 0 }
    : { height: width, offsetY: (portraitHeight - width) * (position - 0.5) };
}

/** Fixed square viewing window inside the unchanged 1080 × 1920 canvas. */
export function ownerBlackBarRects(enabled = false) {
  return enabled
    ? [
        {
          x: 0,
          y: 0,
          width: OWNER_BLACK_BAR_FRAME.width,
          height: OWNER_BLACK_BAR_FRAME.inset,
        },
        {
          x: 0,
          y: OWNER_BLACK_BAR_FRAME.height - OWNER_BLACK_BAR_FRAME.inset,
          width: OWNER_BLACK_BAR_FRAME.width,
          height: OWNER_BLACK_BAR_FRAME.inset,
        },
      ]
    : [];
}

/** Clip each scene visual independently so escaping media keeps its layer order. */
export function ownerVisualBlackBarClip(
  enabled = false,
  ignoreBlackBars = false,
) {
  return enabled && !ignoreBlackBars
    ? `inset(${OWNER_BLACK_BAR_FRAME.inset}px 0 ${OWNER_BLACK_BAR_FRAME.inset}px 0)`
    : undefined;
}
