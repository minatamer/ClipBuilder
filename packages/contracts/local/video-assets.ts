import { z } from "zod";
import { ownerDigestSchema } from "./assets.ts";
import { ownerIdSchema, OWNER_FPS } from "./policy.ts";

export const OWNER_VIDEO_LIMITS = {
  inputBytes: 64 * 1024 ** 2,
  bytes: 64 * 1024 ** 2,
  durationMs: 120_000,
  inputPixels: 3840 * 2160,
  dimension: 1280,
  assets: 8,
  active: 2,
} as const;
export const ownerVideoAssetSchema = z
  .object({
    id: ownerIdSchema,
    digest: ownerDigestSchema,
    bytes: z.number().int().positive().max(OWNER_VIDEO_LIMITS.bytes),
    width: z.number().int().positive().max(OWNER_VIDEO_LIMITS.dimension),
    height: z.number().int().positive().max(OWNER_VIDEO_LIMITS.dimension),
    frames: z
      .number()
      .int()
      .positive()
      .max((OWNER_VIDEO_LIMITS.durationMs * OWNER_FPS) / 1000),
    hasAudio: z.boolean(),
    audioAssetId: ownerIdSchema.optional(),
  })
  .strict()
  .refine((asset) => asset.hasAudio === Boolean(asset.audioAssetId));
export type OwnerVideoAsset = z.infer<typeof ownerVideoAssetSchema>;

/** Sample inside a logical CFR frame, avoiding decoder boundary rounding. */
export const ownerVideoFrameSampleTime = (
  frame: number,
  fps: number = OWNER_FPS,
) => (frame + 0.25) / fps;

/** Exclusive cue ends release the decoder before another cue starts. */
export function ownerVideoOverlapFits(
  cues: readonly {
    startFrame: number;
    endFrame: number;
    video?: unknown;
  }[],
) {
  const edges = cues
    .filter((cue) => cue.video)
    .flatMap((cue) => [
      { frame: cue.startFrame, delta: 1 },
      { frame: cue.endFrame, delta: -1 },
    ])
    .sort((a, b) => a.frame - b.frame || a.delta - b.delta);
  let active = 0;
  return edges.every(
    (edge) => (active += edge.delta) <= OWNER_VIDEO_LIMITS.active,
  );
}
