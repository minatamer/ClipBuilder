import { z } from "zod";
import { transcriptWordSchema } from "../src/transcript.schema.ts";
import { clipCandidateSchema } from "../src/candidate.schema.ts";
import { OWNER_VALIDATION_LIMITS } from "../src/constants.ts";
import {
  OWNER_LIMITS,
  ownerIdSchema,
  OWNER_FPS,
  ownerCutSchema,
  ownerAiModeSchema,
  type OwnerCut,
} from "./policy.ts";
export { OWNER_FPS, ownerCutSchema, type OwnerCut } from "./policy.ts";
export const ownerAiDurationSchema = z
  .object({
    minMs: z.number().int().min(10_000).max(60_000),
    maxMs: z.number().int().min(10_000).max(60_000),
  })
  .strict()
  .refine(
    (policy) =>
      policy.minMs <= policy.maxMs &&
      Math.ceil((policy.minMs * OWNER_FPS) / 1000) <=
        Math.floor((policy.maxMs * OWNER_FPS) / 1000),
    { message: "AI duration bounds must contain a supported 30fps duration." },
  );
export const ownerRangeSchema = z
  .object({
    id: ownerIdSchema,
    startMs: z.number().int().nonnegative().max(OWNER_LIMITS.sourceMs),
    endMs: z.number().int().positive().max(OWNER_LIMITS.sourceMs),
  })
  .strict()
  .refine(
    (range) =>
      range.endMs - range.startMs >= 1000 &&
      range.endMs - range.startMs <= OWNER_LIMITS.clipMs,
    { message: "Manual ranges must last 1–300 seconds with start before end." },
  );
export const ownerAiCountSchema = z
  .number()
  .int()
  .min(1)
  .max(OWNER_LIMITS.suggestions);
export const ownerAnalysisInputsSchema = z
  .object({
    sourceRevision: z.number().int().nonnegative(),
    policyRevision: z.number().int().nonnegative(),
    ranges: z.array(ownerRangeSchema).max(OWNER_LIMITS.ranges),
    aiDuration: ownerAiDurationSchema,
    aiCount: ownerAiCountSchema.optional(),
    manualOnly: z.boolean(),
  })
  .strict()
  .refine(
    (input) =>
      new Set(input.ranges.map((range) => range.id)).size ===
      input.ranges.length,
    { message: "Range row IDs must be unique." },
  );
export type OwnerAnalysisInputs = z.infer<typeof ownerAnalysisInputsSchema>;
export type OwnerRange = z.infer<typeof ownerRangeSchema>;
export const ownerWordsSchema = z
  .array(transcriptWordSchema)
  .max(OWNER_VALIDATION_LIMITS.maxTranscriptWords);
export type OwnerWord = z.infer<typeof transcriptWordSchema>;
export const ownerAiEvidenceSchema = clipCandidateSchema.omit({
  version: true,
  id: true,
  rank: true,
});
export type OwnerAiEvidence = z.infer<typeof ownerAiEvidenceSchema>;
export const ownerMomentSchema = z
  .object({
    id: ownerIdSchema,
    processingIdentity: z.string().regex(/^[a-f0-9]{64}$/),
    cut: ownerCutSchema,
    rangeIds: z.array(ownerIdSchema).max(OWNER_LIMITS.ranges),
    evidence: ownerAiEvidenceSchema.nullable(),
    cues: ownerWordsSchema,
  })
  .strict();
export type OwnerMoment = z.infer<typeof ownerMomentSchema>;
export const ownerAnalysisSchema = z
  .object({
    id: ownerIdSchema,
    inputs: ownerAnalysisInputsSchema,
    mode: ownerAiModeSchema,
    words: ownerWordsSchema,
    manual: z.array(ownerMomentSchema).max(OWNER_LIMITS.ranges),
    suggestions: z.array(ownerMomentSchema).max(OWNER_LIMITS.suggestions),
    calls: z
      .object({
        transcription: z.number().int().min(0).max(1),
        selection: z.number().int().min(0).max(1),
      })
      .strict(),
  })
  .strict();
export type OwnerAnalysis = z.infer<typeof ownerAnalysisSchema>;
export const ownerMomentExportSchema = z
  .object({
    analysisId: ownerIdSchema,
    momentId: ownerIdSchema,
    policyRevision: z.number().int().nonnegative(),
  })
  .strict();
export type OwnerMomentExport = z.infer<typeof ownerMomentExportSchema>;

/** Canonical [start,end) frame conversion. End rounding never extends beyond source. */
export function ownerCut(
  range: Pick<OwnerRange, "startMs" | "endMs">,
  sourceMs: number,
): OwnerCut {
  if (
    !Number.isSafeInteger(sourceMs) ||
    sourceMs < 1000 ||
    sourceMs > OWNER_LIMITS.sourceMs
  )
    throw new Error("The source duration is unsupported.");
  if (
    !Number.isSafeInteger(range.startMs) ||
    !Number.isSafeInteger(range.endMs)
  )
    throw new Error("Manual timestamps must be finite integer milliseconds.");
  if (range.startMs < 0)
    throw new Error("Start must be at or after the beginning of the source.");
  if (range.endMs > sourceMs)
    throw new Error("End exceeds the source duration.");
  if (range.endMs <= range.startMs) throw new Error("End must be after start.");
  if (range.endMs - range.startMs < 1000)
    throw new Error("Manual ranges must last at least one second.");
  if (range.endMs - range.startMs > OWNER_LIMITS.clipMs)
    throw new Error("Manual ranges cannot exceed 300 seconds.");
  return ownerCutSchema.parse({
    startFrame: Math.round((range.startMs * OWNER_FPS) / 1000),
    endFrame: Math.min(
      Math.round((range.endMs * OWNER_FPS) / 1000),
      Math.floor((sourceMs * OWNER_FPS) / 1000),
    ),
  });
}
export function ownerTimestamp(milliseconds: number): string {
  const value = Math.max(0, Math.round(milliseconds));
  return `${String(Math.floor(value / 3_600_000)).padStart(2, "0")}:${String(Math.floor(value / 60_000) % 60).padStart(2, "0")}:${String(Math.floor(value / 1000) % 60).padStart(2, "0")}.${String(value % 1000).padStart(3, "0")}`;
}
export function parseOwnerTimestamp(value: string): number {
  const match = /^(\d{2}):([0-5]\d):([0-5]\d)(?:\.(\d{1,3}))?$/.exec(value);
  if (!match) throw new Error("Use HH:MM:SS.mmm source timestamps.");
  const result =
    Number(match[1]) * 3_600_000 +
    Number(match[2]) * 60_000 +
    Number(match[3]) * 1000 +
    Number((match[4] ?? "").padEnd(3, "0"));
  if (result > OWNER_LIMITS.sourceMs)
    throw new Error("Timestamp exceeds the local source limit.");
  return result;
}
