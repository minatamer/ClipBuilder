import { z } from "zod";

const reasons = [
  "schema_invalid",
  "invalid_json",
  "invalid-card-evidence",
  "unsafe-card-evidence",
  "speaker_plan_rejected",
  "speaker_evidence_rejected",
  "assembly_candidate_missing",
  "assembly_word_range_invalid",
  "assembly_context_limit",
  "assembly_source_mismatch",
  "assembly_proxy_mismatch",
  "assembly_preview_mismatch",
  "unsupported-caption-overlap",
  "unsupported-caption-word",
  "grounded_visual_unavailable",
  "contextual_picture_unavailable",
  "contextual_picture_target_unmet",
  "duplicate_contextual_picture",
  "invalid-picture-evidence",
] as const;
const issueCodes = [
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
] as const;
export const validationDiagnosticSchema = z
  .object({
    reason: z.enum(reasons),
    issueCount: z.number().int().min(0).max(1_000_000),
    issues: z
      .array(
        z
          .object({
            code: z.enum(issueCodes),
            path: z
              .string()
              .max(160)
              .regex(/^(?:[a-zA-Z0-9_.]|\[|\])*$/)
              .refine(isValidationPath),
          })
          .strict(),
      )
      .max(6),
  })
  .strict();

// Issue messages, object keys and values may contain private content. Only known
// contract property names and structural array markers are allowed in stderr.
const fields = new Set([
  "version",
  "speaker",
  "cards",
  "pictures",
  "brief",
  "scene",
  "searchQuery",
  "requiredTerms",
  "avoidTerms",
  "age",
  "sequence",
  "openingFace",
  "durationMs",
  "shots",
  "faces",
  "observations",
  "speakerId",
  "wordId",
  "startWordId",
  "endWordId",
  "startMs",
  "endMs",
  "box",
  "x",
  "y",
  "width",
  "height",
  "confidence",
  "kind",
  "anchorWordId",
  "title",
  "lines",
  "source",
  "range",
  "output",
  "focus",
  "captions",
  "segments",
  "text",
  "trackId",
  "faceId",
  "shotId",
  "speaking",
  "atMs",
  "centerX",
  "centerY",
  "evidenceWordIds",
  "visiblePeople",
  "association",
  "coordinateSpace",
]);
function isValidationPath(path: string) {
  return (
    path === "" ||
    path
      .split(".")
      .every(
        (part) =>
          fields.has(part) ||
          part === "[field]" ||
          (/^\d{1,7}$/.test(part) && Number(part) <= 1_000_000),
      )
  );
}
export function describeValidationFailure(error: unknown) {
  if (error instanceof z.ZodError)
    return {
      reason: "schema_invalid" as const,
      issueCount: Math.min(1_000_000, error.issues.length),
      issues: error.issues.slice(0, 6).map((issue) => ({
        code: issue.code,
        path: issue.path
          .slice(0, 8)
          .map((part) =>
            typeof part === "number" &&
            Number.isInteger(part) &&
            part >= 0 &&
            part <= 1_000_000
              ? String(part)
              : typeof part === "string" && fields.has(part)
                ? part
                : "[field]",
          )
          .join("."),
      })),
    };
  const reason =
    error instanceof SyntaxError
      ? "invalid_json"
      : error instanceof Error
        ? reasons.find((value) => value === error.message)
        : undefined;
  return reason ? { reason, issueCount: 0, issues: [] } : undefined;
}
