import { z } from "zod";

import { OWNER_VALIDATION_LIMITS } from "./constants.js";
import { candidateIdSchema, wordIdSchema } from "./ids.schema.js";
import { boundedPlainTextSchema } from "./text.schema.js";

export const SHAREABILITY_SIGNALS = [
  "immediate-hook",
  "self-contained",
  "clear-payoff",
  "specific",
  "human-energy",
  "clean-boundaries",
  "appropriate-length",
  "visual-feasibility",
] as const;

export const shareabilitySignalSchema = z.enum(SHAREABILITY_SIGNALS);

export const candidateEvidenceSchema = z
  .object({
    signal: shareabilitySignalSchema,
    wordIds: z.array(wordIdSchema).min(1).max(8),
    note: boundedPlainTextSchema(160),
  })
  .strict();

export const candidateCaveatSchema = z
  .object({
    code: z.enum([
      "needs-earlier-context",
      "speaker-overlap",
      "weak-ending",
      "speaker-framing-risk",
      "low-transcript-confidence",
      "similar-to-another-candidate",
    ]),
    note: boundedPlainTextSchema(160),
  })
  .strict();

export const clipCandidateSchema = z
  .object({
    version: z.literal(1),
    id: candidateIdSchema,
    rank: z
      .number()
      .int()
      .min(1)
      .max(OWNER_VALIDATION_LIMITS.maxCandidateCount),
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
    title: boundedPlainTextSchema(80),
    hook: boundedPlainTextSchema(140),
    rationale: boundedPlainTextSchema(320),
    evidence: z.array(candidateEvidenceSchema).max(8),
    caveats: z.array(candidateCaveatSchema).max(3),
  })
  .strict();

export type ShareabilitySignal = z.infer<typeof shareabilitySignalSchema>;
export type CandidateEvidence = z.infer<typeof candidateEvidenceSchema>;
export type ClipCandidateV1 = z.infer<typeof clipCandidateSchema>;
