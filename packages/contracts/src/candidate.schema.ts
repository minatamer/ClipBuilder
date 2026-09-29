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
    wordIds: z
      .array(wordIdSchema)
      .min(1)
      .max(8)
      .refine((wordIds) => new Set(wordIds).size === wordIds.length, {
        message: "Evidence word references must be unique.",
      }),
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
    rank: z.number().int().min(1).max(OWNER_VALIDATION_LIMITS.candidateCount),
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
    title: boundedPlainTextSchema(80),
    hook: boundedPlainTextSchema(140),
    rationale: boundedPlainTextSchema(320),
    evidence: z.array(candidateEvidenceSchema).min(2).max(8),
    caveats: z.array(candidateCaveatSchema).max(3),
  })
  .strict()
  .superRefine((candidate, context) => {
    if (candidate.startWordId === candidate.endWordId) {
      context.addIssue({
        code: "custom",
        message: "Candidate range must contain more than one word boundary.",
        path: ["endWordId"],
      });
    }

    const evidenceSignals = candidate.evidence.map((item) => item.signal);
    if (new Set(evidenceSignals).size !== evidenceSignals.length) {
      context.addIssue({
        code: "custom",
        message: "Candidate evidence signals must be distinct.",
        path: ["evidence"],
      });
    }

    const caveatCodes = candidate.caveats.map((item) => item.code);
    if (new Set(caveatCodes).size !== caveatCodes.length) {
      context.addIssue({
        code: "custom",
        message: "Candidate caveats must be distinct.",
        path: ["caveats"],
      });
    }
  });

export type ShareabilitySignal = z.infer<typeof shareabilitySignalSchema>;
export type CandidateEvidence = z.infer<typeof candidateEvidenceSchema>;
export type ClipCandidateV1 = z.infer<typeof clipCandidateSchema>;
