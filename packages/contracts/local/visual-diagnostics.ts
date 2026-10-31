import { z } from "zod";

export const visualDiagnosticFieldSchema = z.enum([
  "pictures",
  "startFrame",
  "endFrame",
  "evidenceWordIds",
  "brief",
  "brief.scene",
  "brief.searchQuery",
  "brief.requiredTerms",
  "brief.avoidTerms",
  "alternateBriefs",
  "alternateBriefs.scene",
  "alternateBriefs.searchQuery",
  "alternateBriefs.requiredTerms",
  "alternateBriefs.avoidTerms",
  "illustration",
  "illustration.layout",
  "illustration.heading",
  "illustration.items",
  "illustration.items.label",
  "illustration.items.icon",
  "unknown",
]);
export const visualDiagnosticSchema = z
  .object({
    stage: z.enum(["decode", "search", "fallback"]),
    outcome: z.enum([
      "accepted",
      "repaired",
      "dropped",
      "found",
      "miss",
      "failed",
      "generated",
      "omitted",
    ]),
    index: z.number().int().min(0).max(2).optional(),
    received: z.number().int().min(0).max(1000).optional(),
    retained: z.number().int().min(0).max(3).optional(),
    dropped: z.number().int().min(0).max(1000).optional(),
    queries: z.number().int().min(0).max(3).optional(),
    requests: z.number().int().min(0).max(3).optional(),
    httpStatus: z.number().int().min(100).max(599).optional(),
    candidates: z.number().int().min(0).max(60).optional(),
    downloads: z.number().int().min(0).max(12).optional(),
    reason: z
      .enum([
        "no_candidates",
        "search_failed",
        "search_not_attempted",
        "asset_unavailable",
        "unsupported_format",
        "raster_limit",
        "address_blocked",
        "download_failed",
        "download_limit",
        "decode_failed",
        "page_without_images",
        "deadline",
        "candidate_shape",
        "asset_shape",
        "provenance",
        "digest_mismatch",
        "generation_failed",
      ])
      .optional(),
    issues: z
      .array(
        z
          .object({
            field: visualDiagnosticFieldSchema,
            item: z.number().int().min(0).max(1000).optional(),
            rule: z.enum([
              "type",
              "minimum",
              "maximum",
              "format",
              "shape",
              "value",
              "clock",
              "unsafe_search",
              "repair",
            ]),
            limit: z.number().finite().min(0).max(1000000).optional(),
          })
          .strict(),
      )
      .max(12)
      .optional(),
  })
  .strict();
export type VisualDiagnostic = z.infer<typeof visualDiagnosticSchema>;
