import { z } from "zod";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { OWNER_FPS } from "./policy.ts";

export const OWNER_HEAD_PATH = {
  frames: 30 * OWNER_FPS,
  sampleFrames: 2,
  samples: 451,
} as const;
export const ownerHeadBoxSchema = normalizedBoxSchema.refine(
  (box) =>
    box.width >= 0.02 &&
    box.height >= 0.02 &&
    box.width <= 0.7 &&
    box.height <= 0.7 &&
    box.x + box.width <= 1 &&
    box.y + box.height <= 1,
);
const point = z.number().finite().min(0).max(1);
export const ownerHeadPathSchema = z
  .object({
    seed: ownerHeadBoxSchema,
    outcome: z.enum(["complete", "lost"]),
    followWindow: z.number().int().min(0).max(60).optional(),
    points: z
      .array(
        z
          .object({
            frame: z
              .number()
              .int()
              .nonnegative()
              .max(OWNER_HEAD_PATH.frames - 1),
            x: point,
            y: point,
          })
          .strict(),
      )
      .min(2)
      .max(OWNER_HEAD_PATH.samples),
  })
  .strict();
export type OwnerHeadPath = z.infer<typeof ownerHeadPathSchema>;
/** One coverage rule for original and uploaded-video pixel tracks. */
export function ownerHeadPathCovers(
  track: OwnerHeadPath & { startFrame: number; endFrame: number },
) {
  const duration = track.endFrame - track.startFrame;
  return (
    duration >= 6 &&
    duration <= OWNER_HEAD_PATH.frames &&
    track.points[0]?.frame === 0 &&
    Math.abs(track.points[0].x - track.seed.x - track.seed.width / 2) <=
      0.000002 &&
    Math.abs(track.points[0].y - track.seed.y - track.seed.height / 2) <=
      0.000002 &&
    track.points.at(-1)?.frame === duration - 1 &&
    track.points.every(
      (p, i) =>
        i === 0 ||
        (p.frame > track.points[i - 1]!.frame &&
          p.frame - track.points[i - 1]!.frame <= OWNER_HEAD_PATH.sampleFrames),
    )
  );
}
