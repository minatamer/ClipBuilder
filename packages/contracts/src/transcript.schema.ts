import { z } from "zod";

import { OWNER_VALIDATION_LIMITS } from "./constants.js";
import {
  revisionIdSchema,
  speakerIdSchema,
  transcriptUtteranceIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import { boundedPlainTextSchema } from "./text.schema.js";

export const transcriptWordSpanSchema = z
  .object({ startWordId: wordIdSchema, endWordId: wordIdSchema })
  .strict();

export const transcriptWordSchema = z
  .object({
    id: wordIdSchema,
    startMs: z.number().int().min(0),
    endMs: z.number().int().min(0),
    text: boundedPlainTextSchema(80),
    punctuatedText: boundedPlainTextSchema(80),
    speakerId: speakerIdSchema.nullable(),
    confidence: z.number().finite().min(0).max(1).nullable(),
  })
  .strict();

export const transcriptUtteranceSchema = z
  .object({
    id: transcriptUtteranceIdSchema,
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
    speakerId: speakerIdSchema.nullable(),
  })
  .strict();

export const transcriptBundleSchema = z
  .object({
    version: z.literal(1),
    revision: revisionIdSchema,
    language: boundedPlainTextSchema(16),
    durationMs: z
      .number()
      .int()
      .min(1)
      .max(OWNER_VALIDATION_LIMITS.maxSourceSeconds * 1_000),
    words: z
      .array(transcriptWordSchema)
      .max(OWNER_VALIDATION_LIMITS.maxTranscriptWords),
    utterances: z.array(transcriptUtteranceSchema).max(10_000),
    providerMetadata: z
      .object({
        provider: z.enum(["fake", "google-gemini"]),
        modelConfigId: boundedPlainTextSchema(80),
        diarizationAvailable: z.boolean(),
      })
      .strict(),
  })
  .strict();

export type TranscriptWord = z.infer<typeof transcriptWordSchema>;
export type TranscriptUtterance = z.infer<typeof transcriptUtteranceSchema>;
export type TranscriptBundleV1 = z.infer<typeof transcriptBundleSchema>;
