import { z } from "zod";
import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import { ApplicationError } from "../http/errorMapper.js";

const pathSegment = z.union([
  z.enum([
    "words",
    "turns",
    "candidates",
    "transcript",
    "utterances",
    "media",
    "id",
    "text",
    "punctuatedText",
    "startMs",
    "endMs",
    "speakerId",
    "confidence",
    "startWordId",
    "endWordId",
    "title",
    "hook",
    "rationale",
    "evidence",
    "wordIds",
    "signal",
    "note",
    "caveats",
    "code",
    "rank",
    "durationMs",
    "providerMetadata",
    "diarizationAvailable",
    "outcome",
    "unrecognized",
  ]),
  z.number().int().min(0).max(PUBLIC_LIMITS.maxTranscriptWords),
]);
const pathSchema = z.array(pathSegment).max(8);

// Match only fixed contract messages; never serialize messages or issue values.
const customConstraints = [
  ["Transcript word identifiers must be unique.", "word_ids_unique"],
  ["Transcript word starts must be nondecreasing.", "word_start_order"],
  [
    "Transcript word extends beyond the media tolerance.",
    "word_media_tolerance",
  ],
  [
    "Transcript text exceeds the character limit.",
    "transcript_character_limit",
  ],
  ["Utterance identifiers must be unique.", "turn_ids_unique"],
  ["Utterance word references are not valid.", "turn_word_reference"],
  [
    "Candidate range must contain more than one word boundary.",
    "candidate_word_count",
  ],
  ["Candidate evidence signals must be distinct.", "evidence_signals_unique"],
  ["Candidate caveats must be distinct.", "caveat_codes_unique"],
  ["Evidence word references must be unique.", "evidence_words_unique"],
  [
    "The analysis outcome must match candidate availability.",
    "outcome_consistency",
  ],
  [
    "Analysis candidates must have distinct identifiers and ranks.",
    "candidate_ids_ranks_unique",
  ],
  [
    "Analysis candidate ranks must be contiguous from one.",
    "candidate_rank_order",
  ],
  [
    "Candidate ranges and evidence must reference transcript words.",
    "candidate_word_reference",
  ],
  ["Candidate transcript range must be ordered.", "candidate_range_order"],
  [
    "Candidate evidence must remain inside its candidate range.",
    "evidence_inside_candidate",
  ],
  [
    "Candidate duration must remain within 10 to 60 seconds.",
    "candidate_duration",
  ],
  [
    "Candidate overlap cannot exceed 35 percent of the shorter range.",
    "candidate_overlap",
  ],
  [
    "Media and transcript durations exceed the allowed tolerance.",
    "media_transcript_duration",
  ],
] as const;
const constraintSchema = z.enum([
  ...customConstraints.map(([, code]) => code),
  "unclassified",
]);
const constraints = new Map<string, z.infer<typeof constraintSchema>>(
  customConstraints,
);
const issueCode = z.enum([
  "invalid_type",
  "too_big",
  "too_small",
  "invalid_format",
  "not_multiple_of",
  "unrecognized_keys",
  "invalid_union",
  "invalid_key",
  "invalid_element",
  "invalid_value",
  "custom",
  "unrecognized",
]);

export const reconciliationDiagnosticSchema = z
  .object({
    rule: z.enum([
      "provider_schema",
      "transcript_character_limit",
      "word_id_sequence",
      "word_outside_media",
      "word_overlap",
      "turn_id_sequence",
      "turn_word_reference",
      "turn_range_order",
      "turn_partition_gap",
      "turn_speaker_mismatch",
      "turn_partition_incomplete",
      "missing_diarization",
      "analysis_bundle_schema",
      "candidate_start_boundary",
      "candidate_word_reference",
      "candidate_quote_reference",
      "evidence_reference_order",
      "candidate_title_quote",
      "candidate_hook_quote",
      "candidate_evidence_quote",
      "forbidden_copy",
      "candidate_rationale_grounding",
      "candidate_caveat_grounding",
      "quoted_claim_grounding",
      "candidate_end_boundary",
      "unexpected_error",
    ]),
    path: pathSchema,
    issues: z
      .array(
        z
          .object({
            code: issueCode,
            constraint: constraintSchema,
            path: pathSchema,
          })
          .strict(),
      )
      .max(4)
      .optional(),
    issueCount: z.number().int().min(0).max(1_000_000).optional(),
    truncated: z.boolean().optional(),
  })
  .strict();
export type ReconciliationDiagnostic = z.infer<
  typeof reconciliationDiagnosticSchema
>;

// Private diagnostic metadata; public mapping retains the same code and message.
export class ReconciliationFailure extends ApplicationError {
  constructor(readonly reconciliation: ReconciliationDiagnostic) {
    super({ code: "MODEL_OUTPUT_REJECTED" });
  }
}

export function reconciliationSchemaDiagnostic(
  rule: "provider_schema" | "analysis_bundle_schema" | "unexpected_error",
  error: unknown,
): ReconciliationDiagnostic {
  if (!(error instanceof z.ZodError))
    return { rule: "unexpected_error", path: [] };
  const boundedPath = (path: readonly PropertyKey[]) =>
    path.slice(0, 8).map((segment) => {
      const parsed = pathSegment.safeParse(segment);
      return parsed.success ? parsed.data : ("unrecognized" as const);
    });
  return {
    rule,
    path: [],
    issues: error.issues.slice(0, 4).map((issue) => ({
      code: issueCode.safeParse(issue.code).success
        ? issue.code
        : "unrecognized",
      constraint: constraints.get(issue.message) ?? "unclassified",
      path: boundedPath(issue.path),
    })),
    issueCount: Math.min(error.issues.length, 1_000_000),
    truncated:
      error.issues.length > 4 ||
      error.issues.some((issue) => issue.path.length > 8),
  };
}
