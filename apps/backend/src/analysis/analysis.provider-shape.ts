import { z } from "zod";
import {
  transcriptWordSchema,
  transcriptUtteranceSchema,
  PUBLIC_LIMITS,
} from "@clipbuilder/contracts";
import { geminiAnalysisSchema } from "./analysis.reconciliation.js";

// Compact tuples avoid repeating long field names and IDs for every word.
// Only deterministic code assigns ordinal IDs and unavailable confidence.
export const geminiWireSchema = z
  .object({
    words: z
      .array(
        z.tuple([
          transcriptWordSchema.shape.punctuatedText,
          transcriptWordSchema.shape.startMs,
          transcriptWordSchema.shape.endMs,
          transcriptWordSchema.shape.speakerId,
        ]),
      )
      .min(1)
      .max(PUBLIC_LIMITS.maxTranscriptWords),
    turns: z
      .array(
        z.tuple([
          transcriptUtteranceSchema.shape.startWordId,
          transcriptUtteranceSchema.shape.endWordId,
          transcriptUtteranceSchema.shape.speakerId,
        ]),
      )
      .max(10_000),
    candidates: geminiAnalysisSchema.shape.candidates,
  })
  .strict();
export function normalizeGeminiAnalysis(value: unknown) {
  const wire = geminiWireSchema.parse(value);
  return geminiAnalysisSchema.parse({
    words: wire.words.map(
      ([punctuatedText, startMs, endMs, speakerId], index) => ({
        id: `w_${String(index + 1).padStart(6, "0")}`,
        text: punctuatedText.replace(/^\p{P}+|\p{P}+$/gu, ""),
        punctuatedText,
        startMs,
        endMs,
        speakerId,
        confidence: null,
      }),
    ),
    turns: wire.turns.map(([startWordId, endWordId, speakerId], index) => ({
      id: `utt_${String(index + 1).padStart(6, "0")}`,
      startWordId,
      endWordId,
      speakerId,
    })),
    candidates: wire.candidates,
  });
}
