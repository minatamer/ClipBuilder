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
          transcriptWordSchema.shape.punctuatedText.describe(
            "One audible English word with attached punctuation; preserve source wording, at most 80 characters.",
          ),
          transcriptWordSchema.shape.startMs.describe(
            "Audible word onset in integer milliseconds from full-source start, including leading silence.",
          ),
          transcriptWordSchema.shape.endMs.describe(
            "Audible word end in full-source milliseconds, greater than startMs and within source duration.",
          ),
          transcriptWordSchema.shape.speakerId.describe(
            "Stable anonymous audible-voice label spk_0 through spk_15, or null when uncertain.",
          ),
        ]),
      )
      .min(1)
      .max(PUBLIC_LIMITS.maxTranscriptWords)
      .describe(
        "Full-source transcript in onset order; tuples [punctuatedText, startMs, endMs, speakerId]. Ordinal IDs w_000001 onward derive from array position.",
      ),
    turns: z
      .array(
        z.tuple([
          transcriptUtteranceSchema.shape.startWordId.describe(
            "Inclusive first ordinal word reference in this turn.",
          ),
          transcriptUtteranceSchema.shape.endWordId.describe(
            "Inclusive last ordinal word reference in this turn.",
          ),
          transcriptUtteranceSchema.shape.speakerId.describe(
            "Same anonymous label or null as every word in this turn.",
          ),
        ]),
      )
      .max(10_000)
      .describe(
        "Ordered complete partition of transcript words as [startWordId, endWordId, speakerId], or [] if every word has null speakerId and diarization is unavailable.",
      ),
    candidates: geminiAnalysisSchema.shape.candidates.describe(
      "Strongest recommendation first, 0 to 4 distinct contiguous 10–60 second source-word ranges; exact source quotations in public copy. Empty when none qualifies. Never output IDs, ranks or timestamps here.",
    ),
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
