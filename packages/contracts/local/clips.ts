import { z } from "zod";
import {
  OWNER_AUDIO_LIMITS,
  ownerAudioAssetSchema,
  ownerAudioTrackSchema,
} from "./audio.ts";
import { compositionManifestV3Schema } from "@clipbuilder/contracts";
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
import { ownerWordsSchema, ownerMomentSchema } from "./selection.ts";
import { ownerVideoLookSchema } from "./video-look.ts";
import { ownerFocusSchema } from "./focus.ts";
import { ownerIllustrationSchema } from "./illustration.ts";
import { ownerTextLayersSchema, ownerClipTitleSchema } from "./text-layers.ts";
import { OWNER_CAPTION_GENERATION_ATTEMPTS } from "./caption-generation.ts";
import { ownerCaptionSpeakersSchema } from "./caption-speakers.ts";
import { ownerHookSchema, OWNER_PRESENTATION_MAX_FRAMES } from "./hook.ts";
import {
  CONTEXTUAL_PICTURE_POLICY,
  contextualPictureBriefSchema,
} from "@clipbuilder/contracts";

export const OWNER_BATCH_POLICY = {
  workers: 1,
  imageAttemptsPerClip: CONTEXTUAL_PICTURE_POLICY.maxPictures,
  imageSearchAlternatives: 2,
  overlayBytes: 2 * 1024 ** 3,
  clipReservationBytes: 384 * 1024 ** 2,
  outputs: 20,
  operations: 200,
  visualDiscoveryAttempts: 5,
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
    audio: ownerAudioTrackSchema.optional(),
    captionStyle: ownerCaptionStyleSchema.optional(),
    captionSpeakers: ownerCaptionSpeakersSchema.optional(),
    hook: ownerHookSchema.optional(),
    texts: ownerTextLayersSchema.optional(),
    videoLook: ownerVideoLookSchema.optional(),
    focus: ownerFocusSchema.optional(),
    visuals: z.array(ownerVisualSchema).max(OWNER_PICTURE_LIMITS.cuesPerClip),
  })
  .strict()
  .superRefine((overlay, ctx) => {
    if (
      (overlay.hook && overlay.hook.endFrame > overlay.frames) ||
      (overlay.focus && overlay.focus.frames !== overlay.frames) ||
      overlay.audio?.cues.some(
        (cue) => cue.placement === "clip" && cue.endFrame > overlay.frames,
      ) ||
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
      overlay.texts?.some((layer) => layer.endFrame > overlay.frames) ||
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
    hookSuggestion: ownerHookSchema.optional(),
    overlay: ownerOverlaySchema,
  })
  .strict()
  .refine(
    (base) =>
      base.overlay.frames === base.cut.endFrame - base.cut.startFrame &&
      (!base.hookSuggestion ||
        base.hookSuggestion.endFrame <= base.overlay.frames),
  );
export type OwnerClipBase = z.infer<typeof ownerClipBaseSchema>;
export const ownerClipOutputSchema = z
  .object({
    id: ownerAssetSchema.shape.digest,
    revision: ownerOutputRevisionSchema,
    editRevision: z.number().int().nonnegative(),
    frames: z.number().int().positive().max(OWNER_PRESENTATION_MAX_FRAMES),
    bytes: z.number().int().positive().max(OWNER_LIMITS.outputBytes),
  })
  .strict();
/** Measured playback media; a completed final export is a separate artifact. */
export const ownerClipPreviewSchema = ownerClipOutputSchema
  .pick({
    frames: true,
    bytes: true,
  })
  .extend({ frames: ownerOverlaySchema.shape.frames });
export const ownerClipPlanSchema = z
  .array(
    z.object({
      startFrame: z.number().finite(),
      endFrame: z.number().finite(),
      brief: contextualPictureBriefSchema,
      alternateBriefs: z
        .array(contextualPictureBriefSchema)
        .max(OWNER_BATCH_POLICY.imageSearchAlternatives)
        .optional(),
      illustration: ownerIllustrationSchema.optional(),
      evidenceWordIds: z
        .array(z.string().max(64))
        .max(CONTEXTUAL_PICTURE_POLICY.maxSupportingPhraseWords),
    }),
  )
  .max(OWNER_BATCH_POLICY.imageAttemptsPerClip);
export const ownerClipPreparationSchema = z
  .object({
    moment: ownerMomentSchema,
    focus: ownerFocusSchema.optional(),
    hookSuggestion: ownerHookSchema.optional(),
    plan: ownerClipPlanSchema.nullable(),
    texts: ownerTextLayersSchema.optional(),
    // Decode legacy partial drafts only; new preparation never generates titles.
    title: ownerClipTitleSchema.optional(),
    pictures: z
      .array(
        z
          .object({
            index: z
              .number()
              .int()
              .min(0)
              .max(OWNER_BATCH_POLICY.imageAttemptsPerClip - 1),
            visual: ownerVisualSchema.nullable(),
          })
          .strict(),
      )
      .max(OWNER_BATCH_POLICY.imageAttemptsPerClip),
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
    captionAttempts: z
      .number()
      .int()
      .min(0)
      .max(OWNER_CAPTION_GENERATION_ATTEMPTS)
      .optional(),
    visualAttempts: z
      .number()
      .int()
      .min(0)
      .max(OWNER_BATCH_POLICY.visualDiscoveryAttempts)
      .optional(),
    visualOperations: z
      .array(
        z
          .object({
            operationId: ownerIdSchema,
            requestHash: ownerAssetSchema.shape.digest,
          })
          .strict(),
      )
      .max(OWNER_BATCH_POLICY.visualDiscoveryAttempts)
      .refine(
        (values) =>
          new Set(values.map((value) => value.operationId)).size ===
          values.length,
      )
      .optional(),
    visualDiscovery: z
      .object({
        operationId: ownerIdSchema,
        requestHash: ownerAssetSchema.shape.digest,
        outcome: z.enum(["pending", "found", "miss", "failed"]),
      })
      .strict()
      .optional(),
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
    preparationStage: z
      .enum(["speakers", "planning", "pictures", "captions", "preview"])
      .optional(),
    base: ownerClipBaseSchema.nullable(),
    preview: ownerClipPreviewSchema.optional(),
    preparation: ownerClipPreparationSchema.optional(),
    edit: ownerEditDocumentSchema.nullable().default(null),
    assets: z.array(ownerAssetSchema).max(OWNER_PICTURE_LIMITS.assetsPerClip),
    audioAssets: z
      .array(ownerAudioAssetSchema)
      .max(OWNER_AUDIO_LIMITS.assets)
      .optional(),
    outputs: z.array(ownerClipOutputSchema).max(OWNER_BATCH_POLICY.outputs),
    calls: z
      .object({
        plan: z.number().int().min(0).max(OWNER_BATCH_POLICY.operations),
        image: z
          .number()
          .int()
          .min(0)
          .max(
            OWNER_BATCH_POLICY.imageAttemptsPerClip *
              OWNER_BATCH_POLICY.operations,
          ),
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
    pictureAssetId: ownerIdSchema.optional(),
    audioAssetId: ownerIdSchema.optional(),
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
