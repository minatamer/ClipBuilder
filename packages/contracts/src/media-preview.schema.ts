import { z } from "zod";
import {
  mediaSelectRequestSchema,
  mediaBindingSchema,
  artifactReferenceSchema,
  TEMPORARY_MEDIA_LIMITS,
} from "./cloud-media.schema.js";
import { selectedMediaRangeSchema } from "./edit-plan.schema.js";
export const mediaPreviewRequestSchema = mediaSelectRequestSchema
  .extend({ manifestHash: z.string().regex(/^[a-f0-9]{64}$/) })
  .strict();
export const mediaPreviewAccessSchema = z
  .object({
    binding: mediaBindingSchema,
    manifestHash: mediaPreviewRequestSchema.shape.manifestHash,
  })
  .strict();
export const mediaPreviewResponseSchema = mediaPreviewAccessSchema
  .extend({
    range: selectedMediaRangeSchema,
    artifact: artifactReferenceSchema.extend({
      bytes: z.number().int().positive().max(TEMPORARY_MEDIA_LIMITS.proxyBytes),
    }),
    expiresAtMs: z.number().int().positive(),
  })
  .strict();
export type MediaPreviewRequest = z.infer<typeof mediaPreviewRequestSchema>;
export type MediaPreviewAccess = z.infer<typeof mediaPreviewAccessSchema>;
export type MediaPreviewResponse = z.infer<typeof mediaPreviewResponseSchema>;
// Invalid/multiple ranges never fall back to an entire file.
export function mediaByteRange(header: string | undefined, bytes: number) {
  if (!Number.isSafeInteger(bytes) || bytes <= 0)
    throw new Error("invalid-range");
  if (header === undefined) return { start: 0, end: bytes - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) throw new Error("invalid-range");
  const first = Number(match[1]),
    last = Number(match[2]);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last))
    throw new Error("invalid-range");
  const start = match[1] ? first : Math.max(0, bytes - last);
  const end = match[1] && match[2] ? Math.min(last, bytes - 1) : bytes - 1;
  if (start >= bytes || end < start || (!match[1] && last === 0))
    throw new Error("invalid-range");
  return { start, end, partial: true };
}
