import { z } from "zod";
import { ownerDigestSchema } from "./assets.ts";
import { OWNER_LIMITS, ownerIdSchema } from "./policy.ts";
import { ownerSourceSchema } from "./index.ts";
import { OWNER_ACQUISITION_LIMITS } from "./acquisition-profile.ts";
export {
  OWNER_ACQUISITION_LIMITS,
  ownerAcquisitionDescriptorSchema,
  type OwnerAcquisitionDescriptor,
} from "./acquisition-profile.ts";

export const ownerAcquisitionModeSchema = z.enum([
  "synthetic-source",
  "provider-source",
]);
export type OwnerAcquisitionMode = z.infer<typeof ownerAcquisitionModeSchema>;
export const ownerYoutubeVideoIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{11}$/);
export const ownerYoutubePreviewSchema = z
  .object({
    videoId: ownerYoutubeVideoIdSchema,
    title: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .refine((value) =>
        Array.from(value).every(
          (char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127,
        ),
      ),
  })
  .strict();
export const ownerYoutubeFormatIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/);
const codec = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/);
const bytes = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER)
  .nullable();
const bitrate = z.number().finite().nonnegative().max(10_000_000).nullable();
const protocol = z.enum(["https", "unsupported"]);
const stream = {
  formatId: ownerYoutubeFormatIdSchema,
  codec,
  protocol,
  drm: z.boolean(),
  bytes,
  bytesEstimated: z.boolean(),
  bitrateKbps: bitrate,
};
export const ownerYoutubeVideoSchema = z
  .object({
    ...stream,
    width: z.number().int().positive().max(131_072),
    height: z.number().int().positive().max(131_072),
    fps: z.number().finite().positive().max(1000),
    dynamicRange: z.enum(["sdr", "hdr", "unknown"]),
    quality: z.number().finite().min(-10_000).max(10_000).nullable(),
    preference: z.number().finite().min(-10_000).max(10_000).nullable(),
  })
  .strict();
export type OwnerYoutubeVideo = z.infer<typeof ownerYoutubeVideoSchema>;
export const ownerYoutubeAudioSchema = z
  .object({
    ...stream,
    channels: z.number().int().positive().max(64).nullable(),
    sampleRate: z.number().int().positive().max(768_000).nullable(),
    language: z
      .string()
      .regex(/^[A-Za-z0-9-]{1,35}$/)
      .nullable(),
    trackId: z
      .string()
      .regex(/^[A-Za-z0-9._-]{1,80}$/)
      .nullable(),
    role: z.enum(["original", "default", "other", "unknown"]),
  })
  .strict();
export type OwnerYoutubeAudio = z.infer<typeof ownerYoutubeAudioSchema>;
export const ownerYoutubeSelectionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("best") }).strict(),
  z
    .object({
      kind: z.literal("tier"),
      tier: z.number().int().positive().max(131_072),
    })
    .strict(),
  z.object({ kind: z.literal("variant") }).strict(),
]);
export type OwnerYoutubeSelection = z.infer<typeof ownerYoutubeSelectionSchema>;
export const ownerYoutubeSupportReasonSchema = z.enum([
  "video-codec",
  "audio-codec",
  "hdr",
  "dynamic-range-unknown",
  "drm",
  "protocol",
  "resolution",
  "frame-rate",
  "audio-layout",
  "duration",
  "source-unavailable",
  "bytes",
  "audio-ambiguous",
  "audio-missing",
]);
export type OwnerYoutubeSupportReason = z.infer<
  typeof ownerYoutubeSupportReasonSchema
>;
export const ownerYoutubeChoiceSchema = z
  .object({
    id: ownerDigestSchema,
    video: ownerYoutubeVideoSchema,
    audio: ownerYoutubeAudioSchema.nullable(),
    tier: z.number().int().positive().max(131_072),
    preferredAudio: z.boolean(),
    supported: z.boolean(),
    reason: ownerYoutubeSupportReasonSchema.nullable(),
    bytes,
    bytesEstimated: z.boolean(),
  })
  .strict()
  .refine(
    (choice) =>
      choice.tier === Math.min(choice.video.width, choice.video.height) &&
      choice.supported === (choice.reason === null) &&
      (!choice.supported || choice.audio !== null),
  );
export type OwnerYoutubeChoice = z.infer<typeof ownerYoutubeChoiceSchema>;
export const ownerYoutubeOfferSchema = z
  .object({
    sourceId: ownerDigestSchema,
    revision: ownerIdSchema,
    mode: ownerAcquisitionModeSchema,
    durationMs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    preview: ownerYoutubePreviewSchema.optional(),
    choices: z
      .array(ownerYoutubeChoiceSchema)
      .max(OWNER_ACQUISITION_LIMITS.maxChoices),
    bestChoiceId: ownerDigestSchema.nullable(),
    bestReason: ownerYoutubeSupportReasonSchema.nullable(),
  })
  .strict()
  .refine(
    (offer) =>
      new Set(offer.choices.map((choice) => choice.id)).size ===
        offer.choices.length &&
      (offer.bestChoiceId === null ||
        offer.choices.some((choice) => choice.id === offer.bestChoiceId)),
  );
export type OwnerYoutubeOffer = z.infer<typeof ownerYoutubeOfferSchema>;
export const ownerYoutubeLinkRequestSchema = z
  .object({ url: z.string().min(1).max(2048) })
  .strict();
export const ownerYoutubeImportRequestSchema = z
  .object({
    sourceId: ownerDigestSchema,
    revision: ownerIdSchema,
    choiceId: ownerDigestSchema,
    selection: ownerYoutubeSelectionSchema,
  })
  .strict();
export type OwnerYoutubeImportRequest = z.infer<
  typeof ownerYoutubeImportRequestSchema
>;
export const ownerAcquisitionFailureCodeSchema = z.enum([
  "acquisition_selection_changed",
  "acquisition_streams_invalid",
  "acquisition_component_invalid",
  "acquisition_progress_invalid",
  "acquisition_bytes_invalid",
  "acquisition_transfer_incomplete",
  "acquisition_stale_format",
  "acquisition_metadata_invalid",
  "acquisition_process_failed",
  "media_unavailable",
  "unknown",
]);
export const ownerAcquisitionProgressSchema = z
  .object({
    id: ownerIdSchema,
    mode: ownerAcquisitionModeSchema,
    stage: z.enum([
      "queued",
      "video",
      "audio",
      "merging",
      "inspecting",
      "publishing",
      "ready",
      "canceling",
      "canceled",
      "failed",
    ]),
    downloadedBytes: z
      .number()
      .int()
      .nonnegative()
      .max(OWNER_LIMITS.scratchBytes),
    totalBytes: z
      .number()
      .int()
      .positive()
      .max(OWNER_LIMITS.scratchBytes)
      .nullable(),
    variantId: ownerIdSchema.nullable(),
    error: z
      .enum([
        "unavailable",
        "unsupported",
        "stale",
        "capacity",
        "invalid",
        "canceled",
        "failed",
      ])
      .nullable(),
    diagnostic: ownerAcquisitionFailureCodeSchema.optional(),
  })
  .strict()
  .refine(
    (progress) =>
      (progress.totalBytes === null ||
        progress.downloadedBytes <= progress.totalBytes) &&
      (progress.stage !== "ready" || progress.variantId !== null),
  );
export type OwnerAcquisitionProgress = z.infer<
  typeof ownerAcquisitionProgressSchema
>;
export const ownerSavedSourceVariantSchema = z
  .object({
    id: ownerIdSchema,
    sourceId: ownerDigestSchema,
    mode: ownerAcquisitionModeSchema,
    acquiredAt: z.string().datetime(),
    selection: ownerYoutubeSelectionSchema,
    video: ownerYoutubeVideoSchema,
    audio: ownerYoutubeAudioSchema,
    actual: z.lazy(() => ownerSourceSchema),
    offsetMs: z.literal(0),
    state: z.enum(["ready", "missing", "damaged", "unsupported"]),
  })
  .strict();
export type OwnerSavedSourceVariant = z.infer<
  typeof ownerSavedSourceVariantSchema
>;
export const ownerSavedSourceListSchema = z
  .array(ownerSavedSourceVariantSchema)
  .max(OWNER_ACQUISITION_LIMITS.catalogRecords);
export const ownerSavedSourceOpenRequestSchema = z
  .object({ variantId: ownerIdSchema })
  .strict();
