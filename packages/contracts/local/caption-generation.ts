import { z } from "zod";
import { ownerIdSchema } from "./policy.ts";
export const OWNER_CAPTION_GENERATION_ATTEMPTS = 3;
export const ownerCaptionGenerationRequestSchema = z
  .object({
    operationId: ownerIdSchema,
    expectedRevision: z.number().int().nonnegative(),
    paidConsent: z.literal(true),
  })
  .strict();
export const ownerFakeCaptionGenerationRequestSchema =
  ownerCaptionGenerationRequestSchema.omit({ paidConsent: true });
/** Explicit local CPU transcription has no provider-spend consent field. */
export const ownerLocalCaptionGenerationRequestSchema =
  ownerFakeCaptionGenerationRequestSchema;
