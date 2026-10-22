import { z } from "zod";
import {
  clipCandidateSchema,
  candidateEvidenceSchema,
  candidateCaveatSchema,
  PUBLIC_LIMITS,
  type TranscriptWord,
} from "@clipbuilder/contracts";

export const CANDIDATE_GENERATION_SCHEMA_POLICY = "json_only";
// Owner selection can propose ten manual overlaps plus four additional moments.
// Public callers retain the four-candidate default below.
const MAX_CANDIDATE_PROPOSALS = 14;
export const candidateNormalizationDiagnosticSchema = z
  .object({
    inputShape: z.enum(["array", "envelope", "unsupported"]),
    returnedCount: z.number().int().min(0).max(1_000_000),
    consideredCount: z.number().int().min(0).max(MAX_CANDIDATE_PROPOSALS),
    acceptedCount: z.number().int().min(0).max(MAX_CANDIDATE_PROPOSALS),
    droppedCount: z.number().int().min(0).max(1_000_000),
    adjustmentCount: z.number().int().min(0).max(1_000_000),
    dropReasons: z
      .array(
        z
          .object({
            reason: z.enum([
              "candidate_limit",
              "candidate_not_decodable",
              "range_unavailable",
            ]),
            count: z.number().int().positive().max(1_000_000),
          })
          .strict(),
      )
      .max(3),
    emptyReason: z
      .enum(["model_empty", "unsupported_shape", "all_candidates_dropped"])
      .optional(),
  })
  .strict();
export type CandidateNormalizationDiagnostic = z.infer<
  typeof candidateNormalizationDiagnosticSchema
>;
const caveatNotes: Record<
  z.infer<typeof candidateCaveatSchema>["code"],
  string
> = {
  "needs-earlier-context": "Needs earlier context.",
  "speaker-overlap": "Speaker overlap.",
  "weak-ending": "Weak ending.",
  "speaker-framing-risk": "Framing risk.",
  "low-transcript-confidence": "Transcript attribution is uncertain.",
  "similar-to-another-candidate": "Similar to another candidate.",
};
export function normalizeCandidateSelection(
  value: unknown,
  words: readonly TranscriptWord[],
  maximum: number = PUBLIC_LIMITS.maxCandidateCount,
) {
  if (
    !Number.isInteger(maximum) ||
    maximum < 1 ||
    maximum > MAX_CANDIDATE_PROPOSALS
  )
    throw new Error("candidate_policy_rejected");
  const envelope = z
    .object({ candidates: z.array(z.unknown()) })
    .safeParse(value);
  const inputShape: CandidateNormalizationDiagnostic["inputShape"] =
    Array.isArray(value)
      ? "array"
      : envelope.success
        ? "envelope"
        : "unsupported";
  const received: unknown[] = Array.isArray(value)
    ? value
    : envelope.success
      ? envelope.data.candidates
      : [];
  const dropCounts = {
    candidate_limit: Math.max(0, received.length - maximum),
    candidate_not_decodable: 0,
    range_unavailable: 0,
  };
  const proposalSchema = z.object({
    startWordId: z.string().catch(""),
    endWordId: z.string().catch(""),
    titleWordIds: z.array(z.string()).catch([]),
    hookWordIds: z.array(z.string()).catch([]),
    evidence: z.array(z.unknown()).catch([]),
    caveats: z.array(z.unknown()).catch([]),
  });
  const indexes = new Map(words.map((word, index) => [word.id, index]));
  const adjustments: {
    candidateIndex: number;
    field: string;
    reason: string;
  }[] = [];
  const candidates = received
    .slice(0, maximum)
    .flatMap((item, candidateIndex) => {
      const decoded = proposalSchema.safeParse(item);
      if (!decoded.success) {
        dropCounts.candidate_not_decodable++;
        adjustments.push({
          candidateIndex,
          field: "candidate",
          reason: "candidate_not_decodable",
        });
        return [];
      }
      const candidate = decoded.data;
      const start = indexes.get(candidate.startWordId),
        end = indexes.get(candidate.endWordId);
      if (start === undefined || end === undefined) {
        dropCounts.range_unavailable++;
        adjustments.push({
          candidateIndex,
          field: "range",
          reason: "range_unavailable",
        });
        return [];
      }
      const quote = (ids: string[], maximum: number, field: string) => {
        const positions = ids.flatMap((id) => {
          const index = indexes.get(id);
          if (index !== undefined) return [index];
          adjustments.push({
            candidateIndex,
            field,
            reason: "reference_unavailable",
          });
          return [];
        });
        let text = "";
        for (const position of positions) {
          const next = [text, words[position!]!.punctuatedText]
            .filter(Boolean)
            .join(" ");
          if (next.length > maximum) {
            adjustments.push({
              candidateIndex,
              field,
              reason: "extractive_copy_shortened",
            });
            break;
          }
          text = next;
        }
        return text;
      };
      const evidence = candidate.evidence.slice(0, 8).flatMap((item, index) => {
        const decoded = z
          .object({
            signal: candidateEvidenceSchema.shape.signal,
            wordIds: z.array(z.string()),
          })
          .safeParse(item);
        if (!decoded.success) {
          adjustments.push({
            candidateIndex,
            field: `evidence_${index}`,
            reason: "evidence_not_decodable",
          });
          return [];
        }
        const wordIds = decoded.data.wordIds
          .filter((id) => indexes.has(id))
          .slice(0, 8);
        const note = quote(wordIds, 160, `evidence_${index}`);
        if (!wordIds.length || !note) return [];
        return [{ signal: decoded.data.signal, wordIds, note }];
      });
      const caveats = candidate.caveats.slice(0, 3).flatMap((item) => {
        const decoded = candidateCaveatSchema.shape.code.safeParse(item);
        if (!decoded.success) return [];
        return [{ code: decoded.data, note: caveatNotes[decoded.data] }];
      });
      const fallback = words[Math.min(start, end)]!.punctuatedText;
      const title = quote(candidate.titleWordIds, 80, "title");
      const hook = quote(candidate.hookWordIds, 140, "hook");
      if (!title || !hook)
        adjustments.push({
          candidateIndex,
          field: "copy",
          reason: "source_word_fallback",
        });
      return [
        z
          .object(clipCandidateSchema.shape)
          .omit({ version: true, id: true, rank: true })
          .parse({
            startWordId: candidate.startWordId,
            endWordId: candidate.endWordId,
            title: title || fallback,
            hook: hook || fallback,
            rationale: "Self-contained opening and complete ending.",
            evidence,
            caveats,
          }),
      ];
    });
  const diagnostic: CandidateNormalizationDiagnostic = {
    inputShape,
    returnedCount: received.length,
    consideredCount: Math.min(received.length, maximum),
    acceptedCount: candidates.length,
    droppedCount: received.length - candidates.length,
    adjustmentCount: adjustments.length,
    dropReasons: [],
    ...(candidates.length
      ? {}
      : {
          emptyReason:
            inputShape === "unsupported"
              ? ("unsupported_shape" as const)
              : received.length
                ? ("all_candidates_dropped" as const)
                : ("model_empty" as const),
        }),
  };
  for (const reason of [
    "candidate_limit",
    "candidate_not_decodable",
    "range_unavailable",
  ] as const)
    if (dropCounts[reason])
      diagnostic.dropReasons.push({ reason, count: dropCounts[reason] });
  return { candidates, adjustments, diagnostic };
}
