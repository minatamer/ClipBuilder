import { z } from "zod";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { ownerIdSchema } from "./policy.ts";

export const OWNER_PICTURE_LIMITS = {
  inputBytes: 4 * 1024 ** 2,
  inputPixels: 16_000_000,
  dimension: 1920,
  bytes: 3 * 1024 ** 2,
  assetsPerClip: 20,
} as const;
export const ownerDigestSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const ownerAssetSchema = z
  .object({
    id: ownerIdSchema,
    digest: ownerDigestSchema,
    width: z.number().int().positive().max(OWNER_PICTURE_LIMITS.dimension),
    height: z.number().int().positive().max(OWNER_PICTURE_LIMITS.dimension),
    bytes: z.number().int().positive().max(OWNER_PICTURE_LIMITS.bytes),
    origin: z.enum(["synthetic", "generated", "owner-supplied"]),
  })
  .strict();
export type OwnerAsset = z.infer<typeof ownerAssetSchema>;
export const ownerVisualSchema = z
  .object({
    id: ownerIdSchema,
    assetId: ownerIdSchema,
    digest: ownerDigestSchema,
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
    box: normalizedBoxSchema,
    fit: z.enum(["contain", "cover"]),
    origin: ownerAssetSchema.shape.origin,
  })
  .strict();
export const ownerVisualEditSchema = ownerVisualSchema.omit({
  digest: true,
  origin: true,
});
export type OwnerVisualEdit = z.infer<typeof ownerVisualEditSchema>;
