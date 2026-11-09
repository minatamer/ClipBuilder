import { z } from "zod";
import { ownerHeadPathSchema, ownerHeadPathCovers } from "./head-path.ts";
import { ownerIdSchema, OWNER_FPS, OWNER_LIMITS } from "./policy.ts";

const frame = z
  .number()
  .int()
  .nonnegative()
  .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000);
export const ownerVisualTrackingSchema = ownerHeadPathSchema
  .omit({ followWindow: true })
  .extend({
    assetId: ownerIdSchema,
    startFrame: frame,
    endFrame: frame,
    sourceStartFrame: frame,
  })
  .refine(ownerHeadPathCovers, {
    message: "Face tracking needs a complete, bounded path.",
  });
export type OwnerVisualTracking = z.infer<typeof ownerVisualTrackingSchema>;

/** Bind a saved path to the same raw source clocks, even after Hook clipping. */
export function ownerVisualTrackingFits(cue: {
  assetId: string;
  startFrame: number;
  endFrame: number;
  video?: { offsetFrame: number } | undefined;
  tracking?: OwnerVisualTracking | undefined;
}) {
  const track = cue.tracking;
  return (
    !track ||
    (!!cue.video &&
      track.assetId === cue.assetId &&
      track.startFrame < cue.endFrame &&
      track.endFrame > cue.startFrame &&
      track.sourceStartFrame ===
        cue.video.offsetFrame + track.startFrame - cue.startFrame)
  );
}
