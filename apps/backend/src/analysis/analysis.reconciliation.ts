import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  analysisBundleSchema,
  clipCandidateSchema,
  transcriptWordSchema,
  transcriptUtteranceSchema,
  PUBLIC_LIMITS,
  type MediaDescriptor,
  type AnalysisBundleV1,
} from "@clipbuilder/contracts";
import { AnalysisDiagnostics } from "./analysis.diagnostics.js";
import {
  ReconciliationFailure,
  reconciliationSchemaDiagnostic,
} from "./analysis.reconciliation-diagnostics.js";

// Internal normalized analysis; provider raw types stay inside adapters.
export const normalizedAnalysisSchema = z
  .object({
    words: z.array(transcriptWordSchema).max(PUBLIC_LIMITS.maxTranscriptWords),
    turns: z.array(transcriptUtteranceSchema).max(10_000),
    candidates: z
      .array(
        z
          .object(clipCandidateSchema.shape)
          .omit({ version: true, id: true, rank: true })
          .strict(),
      )
      .max(PUBLIC_LIMITS.maxCandidateCount),
  })
  .strict();

function opaque(prefix: string) {
  return `${prefix}_${randomBytes(16).toString("base64url")}`;
}
// Find moments packages decoded output; editorial quality is prompt guidance.
// Keep this name for callers and historical diagnostics, without quality gates.
export function reconcileAnalysis(
  value: unknown,
  media: MediaDescriptor,
  provider: "fake" | "google-gemini",
  diagnostics = new AnalysisDiagnostics(),
): AnalysisBundleV1 {
  let schemaStage: "provider_schema" | "analysis_bundle_schema" =
    "provider_schema";
  try {
    const raw = normalizedAnalysisSchema.parse(value);
    const revision = opaque("rev");
    schemaStage = "analysis_bundle_schema";
    const analysis = analysisBundleSchema.parse({
      version: 1,
      analysisId: opaque("ana"),
      revision,
      media,
      transcript: {
        version: 1,
        revision,
        language: "en",
        durationMs: media.durationMs,
        words: raw.words,
        utterances: raw.turns,
        providerMetadata: {
          provider,
          modelConfigId: "transcribe-text-selection-v1",
          diarizationAvailable: raw.turns.some((t) => t.speakerId !== null),
        },
      },
      candidates: raw.candidates.map((candidate, index) => ({
        ...candidate,
        version: 1,
        id: opaque("cand"),
        rank: index + 1,
      })),
      outcome: raw.candidates.length ? "candidates" : "no-strong-candidates",
      warnings: [],
    });
    diagnostics.privateStageOutput("validated_analysis", analysis);
    return analysis;
  } catch (error) {
    throw new ReconciliationFailure(
      reconciliationSchemaDiagnostic(schemaStage, error),
    );
  }
}
