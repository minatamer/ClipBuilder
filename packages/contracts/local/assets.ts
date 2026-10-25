import { z } from "zod";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { ownerIdSchema } from "./policy.ts";

export const OWNER_PICTURE_LIMITS = {
  inputBytes: 4 * 1024 ** 2,
  inputPixels: 16_000_000,
  dimension: 1920,
  bytes: 3 * 1024 ** 2,
  assetsPerClip: 20,
  cuesPerClip: 20,
} as const;
export const OWNER_VISUAL_ANIMATIONS = [
  "none",
  "fade",
  "pop",
  "slide",
] as const;
export const ownerDigestSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const ownerPictureFormatSchema = z.enum(["jpeg", "png"]);
export type OwnerPictureFormat = z.infer<typeof ownerPictureFormatSchema>;
export const ownerPictureExtension = (format: OwnerPictureFormat = "jpeg") =>
  format === "png" ? "png" : "jpg";
export const ownerPictureMime = (format: OwnerPictureFormat = "jpeg") =>
  format === "png" ? "image/png" : "image/jpeg";
export const ownerAssetSchema = z
  .object({
    id: ownerIdSchema,
    digest: ownerDigestSchema,
    width: z.number().int().positive().max(OWNER_PICTURE_LIMITS.dimension),
    height: z.number().int().positive().max(OWNER_PICTURE_LIMITS.dimension),
    bytes: z.number().int().positive().max(OWNER_PICTURE_LIMITS.bytes),
    origin: z.enum(["synthetic", "generated", "owner-supplied"]),
    format: ownerPictureFormatSchema.optional(),
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
    entrance: z.enum(OWNER_VISUAL_ANIMATIONS).optional(),
    exit: z.enum(OWNER_VISUAL_ANIMATIONS).optional(),
    animationFrames: z.number().int().min(1).max(30).optional(),
    origin: ownerAssetSchema.shape.origin,
    format: ownerPictureFormatSchema.optional(),
  })
  .strict();
export const ownerVisualEditSchema = ownerVisualSchema.omit({
  digest: true,
  origin: true,
  format: true,
});
export type OwnerVisualEdit = z.infer<typeof ownerVisualEditSchema>;
