import { z } from "zod";
import { PUBLIC_LIMITS, MEDIA_LIMITS } from "./constants.js";
import {
  sessionIdSchema,
  revisionIdSchema,
  uuidV4Schema,
} from "./ids.schema.js";
import { sha256DigestSchema } from "./boundary-primitives.schema.js";
import {
  compositionManifestV3Schema,
  selectedMediaRangeSchema,
} from "./edit-plan.schema.js";
import {
  mediaDescriptorSchema,
  sourceContentTypeSchema,
} from "./media.schema.js";

export const TEMPORARY_MEDIA_LIMITS = {
  sessionTtlMs: 7_200_000,
  outputTtlMs: 600_000,
  maxSessions: 16,
  maxObjects: 256,
  maxObjectsPerSession: 8,
  maxOperationsPerSession: 4,
  proxyBytes: 24 * 1024 * 1024,
  descriptorBytes: 128 * 1024,
  renderDescriptorBytes: 1024 * 1024,
  workDeadlineMs: 840_000,
  sweepDeadlineMs: 180_000,
  scratchBytes: 2 * 1024 * 1024 * 1024,
} as const;
export const rendererFailureCodeSchema = z.enum([
  "invalid",
  "unauthorized",
  "busy",
  "expired",
  "conflict",
  "budget",
  "canceled",
  "cleanup_pending",
  "media_failed",
]);
export const rendererFailureStageSchema = z.enum([
  "request_parse",
  "claim",
  "scratch",
  "download",
  "inspect",
  "audio_extract",
  "proxy_encode",
  "render",
  "artifact_upload",
  "intent_commit",
  "cleanup",
]);
export type RendererFailureStage = z.infer<typeof rendererFailureStageSchema>;
export const rendererFailureResponseSchema = z
  .object({
    code: rendererFailureCodeSchema,
    stage: rendererFailureStageSchema.optional(),
    underlyingCode: rendererFailureCodeSchema.optional(),
  })
  .strict();
export type RendererFailureCode = z.infer<typeof rendererFailureCodeSchema>;
export const mediaBindingSchema = z
  .object({
    sessionId: sessionIdSchema,
    sourceRevision: revisionIdSchema,
    fingerprint: sha256DigestSchema,
  })
  .strict();
export const objectGenerationSchema = z.string().regex(/^[1-9][0-9]{0,24}$/);
export const artifactReferenceSchema = z
  .object({
    artifactId: uuidV4Schema,
    generation: objectGenerationSchema,
    bytes: z.number().int().positive().max(PUBLIC_LIMITS.maxSourceBytes),
    checksum: sha256DigestSchema,
  })
  .strict();
export const mediaUploadRequestSchema = z
  .object({
    binding: mediaBindingSchema,
    bytes: z.number().int().positive().max(PUBLIC_LIMITS.maxSourceBytes),
    contentType: sourceContentTypeSchema,
    rightsAcknowledged: z.literal(true),
    dataTransferAcknowledged: z.literal(true),
  })
  .strict();
export const mediaPrepareRequestSchema = z
  .object({
    binding: mediaBindingSchema,
    generation: objectGenerationSchema,
    nonce: uuidV4Schema,
  })
  .strict();
export const mediaSelectRequestSchema = mediaPrepareRequestSchema.extend({
  range: selectedMediaRangeSchema,
});
export const inspectedSourceSchema = z
  .object({
    fingerprint: sha256DigestSchema,
    bytes: z.number().int().positive().max(PUBLIC_LIMITS.maxSourceBytes),
    durationMs: z
      .number()
      .int()
      .min(PUBLIC_LIMITS.minSourceSeconds * 1000)
      .max(PUBLIC_LIMITS.maxSourceSeconds * 1000),
    width: z.number().int().positive().max(MEDIA_LIMITS.maxVideoWidth),
    height: z.number().int().positive().max(MEDIA_LIMITS.maxVideoHeight),
    audioStartMs: z.number().int().min(-1000).max(10_000),
    profile: z
      .object({
        container: mediaDescriptorSchema.shape.container,
        videoCodec: mediaDescriptorSchema.shape.videoCodec,
        audioCodec: mediaDescriptorSchema.shape.audioCodec,
        averageFrameRate: mediaDescriptorSchema.shape.averageFrameRate,
        rotationDegrees: mediaDescriptorSchema.shape.rotationDegrees,
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((s) => s.width * s.height <= MEDIA_LIMITS.maxFramePixels);
export const mediaRenderRequestSchema = z
  .object({
    binding: mediaBindingSchema,
    nonce: uuidV4Schema,
    manifestHash: sha256DigestSchema,
    manifest: compositionManifestV3Schema,
  })
  .strict();
export const mediaCancelRequestSchema = z
  .object({ binding: mediaBindingSchema })
  .strict();
export const mediaUploadResponseSchema = z
  .object({
    // A runtime-only bearer capability; never persist it or use it as renderer authority.
    uploadUrl: z
      .url()
      .max(8192)
      .regex(/^https:\/\/storage\.googleapis\.com\//),
    expiresAtMs: z.number().int().positive(),
  })
  .strict();
export const ANALYSIS_AUDIO_PROFILE = {
  contentType: "audio/m4a",
  codec: "aac",
  sampleRate: 16000,
  channels: 1,
} as const;
const analysisArtifactSchema = artifactReferenceSchema.extend({
  bytes: z.number().int().positive().max(TEMPORARY_MEDIA_LIMITS.proxyBytes),
});
export const mediaPrepareResponseSchema = z
  .object({
    source: inspectedSourceSchema,
    analysisAudio: analysisArtifactSchema,
    audioProfile: z
      .object({
        contentType: z.literal(ANALYSIS_AUDIO_PROFILE.contentType),
        codec: z.literal(ANALYSIS_AUDIO_PROFILE.codec),
        sampleRate: z.literal(ANALYSIS_AUDIO_PROFILE.sampleRate),
        channels: z.literal(ANALYSIS_AUDIO_PROFILE.channels),
      })
      .strict(),
  })
  .strict();
export const mediaSelectResponseSchema = z
  .object({
    source: inspectedSourceSchema,
    analysisProxy: analysisArtifactSchema,
    range: selectedMediaRangeSchema,
  })
  .strict();
export const mediaRenderResponseSchema = z
  .object({
    manifestHash: sha256DigestSchema,
    output: artifactReferenceSchema.extend({
      bytes: z.number().int().positive().max(PUBLIC_LIMITS.maxOutputBytes),
    }),
    expiresAtMs: z.number().int().positive(),
  })
  .strict();
export const mediaOutputResponseSchema = mediaRenderResponseSchema
  .extend({ binding: mediaBindingSchema })
  .strict();
export type MediaOutputResponse = z.infer<typeof mediaOutputResponseSchema>;
export type MediaBinding = z.infer<typeof mediaBindingSchema>;
export type MediaUploadRequest = z.infer<typeof mediaUploadRequestSchema>;
export type MediaPrepareRequest = z.infer<typeof mediaPrepareRequestSchema>;
export type MediaSelectRequest = z.infer<typeof mediaSelectRequestSchema>;
export type MediaSelectResponse = z.infer<typeof mediaSelectResponseSchema>;
export type MediaRenderRequest = z.infer<typeof mediaRenderRequestSchema>;
export type MediaPrepareResponse = z.infer<typeof mediaPrepareResponseSchema>;
export type MediaRenderResponse = z.infer<typeof mediaRenderResponseSchema>;
export type ArtifactReference = z.infer<typeof artifactReferenceSchema>;
export type InspectedSource = z.infer<typeof inspectedSourceSchema>;
