import { z } from "zod";

import { OWNER_VALIDATION_LIMITS } from "./constants.js";
import {
  revisionIdSchema,
  speakerIdSchema,
  transcriptUtteranceIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import { boundedPlainTextSchema } from "./text.schema.js";

export const transcriptWordSchema = z
  .object({
    id: wordIdSchema,
    startMs: z.number().int().min(0),
    endMs: z.number().int().min(1),
    text: boundedPlainTextSchema(80),
    punctuatedText: boundedPlainTextSchema(80),
    speakerId: speakerIdSchema.nullable(),
    confidence: z.number().finite().min(0).max(1).nullable(),
  })
  .strict()
  .refine((word) => word.startMs < word.endMs, {
    message: "Transcript word start must precede its end.",
    path: ["endMs"],
  });

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
      .min(1)
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
  .strict()
  .superRefine((transcript, context) => {
    const wordIndexes = new Map<string, number>();
    let previousStart = -1;
    let totalCharacters = 0;

    transcript.words.forEach((word, index) => {
      if (wordIndexes.has(word.id)) {
        context.addIssue({
          code: "custom",
          message: "Transcript word identifiers must be unique.",
          path: ["words", index, "id"],
        });
      }
      wordIndexes.set(word.id, index);

      if (word.startMs < previousStart) {
        context.addIssue({
          code: "custom",
          message: "Transcript word starts must be nondecreasing.",
          path: ["words", index, "startMs"],
        });
      }
      previousStart = word.startMs;

      if (word.endMs > transcript.durationMs + 250) {
        context.addIssue({
          code: "custom",
          message: "Transcript word extends beyond the media tolerance.",
          path: ["words", index, "endMs"],
        });
      }
      totalCharacters += word.punctuatedText.length;
    });

    if (totalCharacters > OWNER_VALIDATION_LIMITS.maxTranscriptCharacters) {
      context.addIssue({
        code: "custom",
        message: "Transcript text exceeds the character limit.",
        path: ["words"],
      });
    }

    const utteranceIds = new Set<string>();
    transcript.utterances.forEach((utterance, index) => {
      if (utteranceIds.has(utterance.id)) {
        context.addIssue({
          code: "custom",
          message: "Utterance identifiers must be unique.",
          path: ["utterances", index, "id"],
        });
      }
      utteranceIds.add(utterance.id);

      const startIndex = wordIndexes.get(utterance.startWordId);
      const endIndex = wordIndexes.get(utterance.endWordId);
      if (
        startIndex === undefined ||
        endIndex === undefined ||
        startIndex > endIndex
      ) {
        context.addIssue({
          code: "custom",
          message: "Utterance word references are not valid.",
          path: ["utterances", index],
        });
      }
    });
  });

export type TranscriptWord = z.infer<typeof transcriptWordSchema>;
export type TranscriptUtterance = z.infer<typeof transcriptUtteranceSchema>;
export type TranscriptBundleV1 = z.infer<typeof transcriptBundleSchema>;
