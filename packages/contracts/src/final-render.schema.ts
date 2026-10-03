import { z } from "zod";
import {
  selectedAssemblyRequestSchema,
  selectedAssemblyResultSchema,
  type SelectedAssemblyResult,
} from "./selected-assembly.schema.js";
import { mediaOutputResponseSchema } from "./cloud-media.schema.js";
export const finalRenderRequestSchema = z
  .object({
    assembly: selectedAssemblyResultSchema,
    turnstileToken: selectedAssemblyRequestSchema.shape.turnstileToken,
  })
  .strict();
export const finalRenderResultSchema = mediaOutputResponseSchema
  .extend({
    version: z.literal(1),
    receipt: z.string().min(1).max(4096),
  })
  .strict();
export type FinalRenderRequest = z.infer<typeof finalRenderRequestSchema>;
export type FinalRenderResult = z.infer<typeof finalRenderResultSchema>;
export function hasSameRenderedAssembly(
  result: FinalRenderResult,
  assembly: SelectedAssemblyResult,
) {
  return (
    result.binding.sessionId === assembly.binding.sessionId &&
    result.binding.sourceRevision === assembly.binding.sourceRevision &&
    result.binding.fingerprint === assembly.binding.fingerprint &&
    result.manifestHash === assembly.manifestHash
  );
}
