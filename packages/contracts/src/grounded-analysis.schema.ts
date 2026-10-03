import { z } from "zod";
import { analysisBundleSchema } from "./api.schema.js";
import { mediaDescriptorSchema } from "./media.schema.js";
import {
  mediaBindingSchema,
  objectGenerationSchema,
} from "./cloud-media.schema.js";
import { sha256DigestSchema } from "./boundary-primitives.schema.js";
import { PUBLIC_LIMITS } from "./constants.js";

export const GROUNDED_ANALYSIS_LIMITS = {
  requestBytes: 8192,
  responseBytes: 4 * 1024 * 1024,
  wordOverlapMs: 250,
  maxFilePolls: 90,
  filePollMs: 1000,
  cleanupMs: 30_000,
} as const;
export const sourceAnalysisUploadSchema = z
  .object({
    media: mediaDescriptorSchema,
    fingerprint: sha256DigestSchema,
    rightsAcknowledged: z.literal(true),
    dataTransferAcknowledged: z.literal(true),
    turnstileToken: z.string().min(1).max(2048),
  })
  .strict()
  .refine(
    (value) =>
      value.media.bytes <= PUBLIC_LIMITS.maxSourceBytes &&
      value.media.durationMs <= PUBLIC_LIMITS.maxSourceSeconds * 1000,
    { message: "Source exceeds public analysis bounds." },
  );
export const sourceAnalysisRequestSchema = z
  .object({
    generation: objectGenerationSchema,
    turnstileToken: z.string().min(1).max(2048),
  })
  .strict();
export const groundedAnalysisResultSchema = z
  .object({
    binding: mediaBindingSchema,
    generation: objectGenerationSchema,
    analysis: analysisBundleSchema,
    receipt: z.string().min(1).max(4096),
  })
  .strict()
  .superRefine((result, context) => {
    if (result.binding.sourceRevision !== result.analysis.media.sourceRevision)
      context.addIssue({
        code: "custom",
        message: "Source revision mismatch.",
      });
  });
export type SourceAnalysisUpload = z.infer<typeof sourceAnalysisUploadSchema>;
export type SourceAnalysisRequest = z.infer<typeof sourceAnalysisRequestSchema>;
export type GroundedAnalysisResult = z.infer<
  typeof groundedAnalysisResultSchema
>;
