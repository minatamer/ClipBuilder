import { z } from "zod";
import { ownerAcquisitionModeSchema } from "./acquisition.ts";
import { ownerAiModeSchema } from "./policy.ts";

/** Public capabilities of the separate local composition, never configuration. */
export const ownerRuntimeCapabilitiesSchema = z
  .object({
    aiMode: z.union([ownerAiModeSchema, z.literal("unavailable")]),
    sourceMode: ownerAcquisitionModeSchema.nullable(),
    planningAvailable: z.boolean(),
    localMedia: z.literal(true),
    cloud: z.literal(false),
  })
  .strict();
export type OwnerRuntimeCapabilities = z.infer<
  typeof ownerRuntimeCapabilitiesSchema
>;
