import { z } from "zod";
import {
  candidateEvidenceSchema,
  candidateCaveatSchema,
  wordIdSchema,
  PUBLIC_LIMITS,
} from "@clipbuilder/contracts";

// Historical structured-output regression support; never used by production transport.
// Selection only supplies references into an already validated transcript.
const quoteIds = z.array(wordIdSchema).min(1).max(40);
export const candidateSelectionSchema = z
  .object({
    candidates: z
      .array(
        z
          .object({
            startWordId: wordIdSchema,
            endWordId: wordIdSchema,
            titleWordIds: quoteIds,
            hookWordIds: quoteIds,
            evidence: z
              .array(
                candidateEvidenceSchema.pick({ signal: true, wordIds: true }),
              )
              .min(2)
              .max(8),
            caveats: z.array(candidateCaveatSchema.shape.code).max(3),
          })
          .strict(),
      )
      .max(PUBLIC_LIMITS.maxCandidateCount),
  })
  .strict();

export function candidateGenerationJsonSchema() {
  const schema = z.toJSONSchema(candidateSelectionSchema, { io: "input" });
  // The earlier investigation isolated evidence.maxItems (not wordIds.maxItems).
  // Preserve that confirmed transport remedy while enforcing eight items locally.
  const candidates = schema.properties?.candidates;
  if (typeof candidates === "object") {
    const candidate = candidates.items;
    if (typeof candidate === "object" && !Array.isArray(candidate)) {
      const evidence = candidate.properties?.evidence;
      if (typeof evidence === "object") delete evidence.maxItems;
    }
  }
  return schema;
}
