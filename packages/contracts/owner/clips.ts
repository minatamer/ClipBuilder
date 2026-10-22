import { z } from "zod";
import { compositionManifestV3Schema } from "../src/edit-plan.schema.ts";
import {
  ownerAssetSchema,
  ownerVisualSchema,
  OWNER_PICTURE_LIMITS,
} from "./assets.ts";
import { ownerCaptionStyleSchema, ownerEditDocumentSchema } from "./editor.ts";
export {
  ownerAssetSchema,
  ownerVisualSchema,
  type OwnerAsset,
} from "./assets.ts";
import {
  OWNER_FPS,
  OWNER_LIMITS,
  ownerCutSchema,
  ownerIdSchema,
  ownerAiModeSchema,
} from "./policy.ts";
import { ownerWordsSchema } from "./selection.ts";
import { ownerVideoLookSchema } from "./video-look.ts";
import { CONTEXTUAL_PICTURE_POLICY } from "../src/contextual-picture.schema.ts";

export const OWNER_BATCH_POLICY = {
  workers: 1,
  imageAttemptsPerClip: CONTEXTUAL_PICTURE_POLICY.maxPictures,
  overlayBytes: 2 * 1024 ** 3,
  clipReservationBytes: 384 * 1024 ** 2,
  outputs: 20,
  operations: 200,
} as const;
export const ownerOutputRevisionSchema = z
  .number()
  .int()
  .min(0)
  .max(OWNER_BATCH_POLICY.outputs - 1);
export const ownerOverlaySchema = z
  .object({
    version: z.literal(1),
    frames: z
      .number()
      .int()
      .min(1)
      .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
    captions: compositionManifestV3Schema.shape.captions,
    captionStyle: ownerCaptionStyleSchema.optional(),
    videoLook: ownerVideoLookSchema.optional(),
    visuals: z
      .array(ownerVisualSchema)
      .max(OWNER_BATCH_POLICY.imageAttemptsPerClip),
  })
  .strict()
  .superRefine((overlay, ctx) => {
    if (
      overlay.captions.some(
        (caption) =>
          caption.startMs < 0 ||
          caption.endMs <= caption.startMs ||
          caption.endMs > Math.round((overlay.frames * 1000) / OWNER_FPS),
      ) ||
      overlay.visuals.some(
        (cue) =>
          cue.endFrame <= cue.startFrame || cue.endFrame > overlay.frames,
      ) ||
      new Set(overlay.visuals.map((cue) => cue.id)).size !==
        overlay.visuals.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Overlay clocks or cue IDs are invalid.",
      });
  });
export type OwnerOverlay = z.infer<typeof ownerOverlaySchema>;
export const ownerClipBaseSchema = z
  .object({
    version: z.literal(1),
    analysisId: ownerIdSchema,
    momentId: ownerIdSchema,
    sourceRevision: z.number().int().nonnegative(),
    fingerprint: ownerAssetSchema.shape.digest,
    processingIdentity: ownerAssetSchema.shape.digest,
    cut: ownerCutSchema,
    words: ownerWordsSchema,
    overlay: ownerOverlaySchema,
  })
  .strict()
  .refine(
    (base) => base.overlay.frames === base.cut.endFrame - base.cut.startFrame,
  );
export type OwnerClipBase = z.infer<typeof ownerClipBaseSchema>;
export const ownerClipOutputSchema = z
  .object({
    id: ownerAssetSchema.shape.digest,
    revision: ownerOutputRevisionSchema,
    editRevision: z.number().int().nonnegative(),
    frames: ownerOverlaySchema.shape.frames,
    bytes: z.number().int().positive().max(OWNER_LIMITS.outputBytes),
  })
  .strict();
export const ownerClipSchema = z
  .object({
    id: ownerIdSchema,
    momentId: ownerIdSchema,
    mode: ownerAiModeSchema,
    analysisId: ownerIdSchema,
    sourceRevision: z.number().int().nonnegative(),
    revision: z.number().int().nonnegative(),
    assemblyRevision: z.number().int().nonnegative(),
    baseHash: ownerAssetSchema.shape.digest.nullable(),
    state: z.enum([
      "selected",
      "queued",
      "preparing",
      "review-ready",
      "validated-revision",
      "rendering",
      "ready",
      "canceling",
      "canceled",
      "failed",
    ]),
    base: ownerClipBaseSchema.nullable(),
    edit: ownerEditDocumentSchema.nullable().default(null),
    assets: z.array(ownerAssetSchema).max(OWNER_PICTURE_LIMITS.assetsPerClip),
    outputs: z.array(ownerClipOutputSchema).max(OWNER_BATCH_POLICY.outputs),
    calls: z
      .object({
        plan: z.number().int().min(0).max(1),
        image: z
          .number()
          .int()
          .min(0)
          .max(OWNER_BATCH_POLICY.imageAttemptsPerClip),
        render: z.number().int().nonnegative(),
      })
      .strict(),
    error: z.enum(["local_clip_failed", "canceled"]).nullable(),
  })
  .strict();
export type OwnerClip = z.infer<typeof ownerClipSchema>;
export const ownerClipListSchema = z
  .object({
    clips: z.array(ownerClipSchema).max(OWNER_LIMITS.clips),
    active: z.boolean(),
    workers: z.literal(1),
  })
  .strict();
export type OwnerClipList = z.infer<typeof ownerClipListSchema>;
export const ownerBatchRequestSchema = z
  .object({
    operationId: ownerIdSchema,
    analysisId: ownerIdSchema,
    sourceRevision: z.number().int().nonnegative(),
    policyRevision: z.number().int().nonnegative(),
    momentIds: z.array(ownerIdSchema).min(1).max(OWNER_LIMITS.clips),
  })
  .strict()
  .refine(
    (request) => new Set(request.momentIds).size === request.momentIds.length,
  );
export type OwnerBatchRequest = z.infer<typeof ownerBatchRequestSchema>;
export const ownerClipRenderRequestSchema = z
  .object({
    operationId: ownerIdSchema,
    expectedRevision: z.number().int().nonnegative(),
  })
  .strict();
export type OwnerClipRenderRequest = z.infer<
  typeof ownerClipRenderRequestSchema
>;
