import { z } from "zod";
import { ownerAcquisitionModeSchema } from "./acquisition.ts";
import { ownerAiModeSchema } from "./policy.ts";

/** Content-free capabilities for the shared editing workflow. */
const localRuntimeCapabilitiesSchema = z
  .object({
    aiMode: z.union([ownerAiModeSchema, z.literal("unavailable")]),
    sourceMode: ownerAcquisitionModeSchema.nullable(),
    planningAvailable: z.boolean(),
    visualDiscovery: z.boolean().optional(),
    captionGeneration: z.boolean().optional(),
    youtubeAudio: z.boolean().optional(),
    aiProvider: z.enum(["gemini", "codex"]).optional(),
    aiSetup: z
      .enum(["ready", "speech-missing", "codex-missing", "disabled"])
      .optional(),
    captionProvider: z.enum(["gemini", "local-speech"]).optional(),
    localMedia: z.literal(true),
    cloud: z.literal(false),
  })
  .strict();
export const ownerRuntimeCapabilitiesSchema = z.union([
  localRuntimeCapabilitiesSchema,
  z
    .object({
      execution: z.literal("hosted"),
      aiMode: z.union([ownerAiModeSchema, z.literal("unavailable")]),
      sourceMode: z.null(),
      planningAvailable: z.boolean(),
      visualDiscovery: z.boolean().optional(),
      captionGeneration: z.boolean().optional(),
      localMedia: z.literal(false),
      cloud: z.literal(true),
      processingSiteKey: z.string().min(1).max(500).optional(),
      demoClipLimit: z.literal(3).nullable().optional(),
    })
    .strict(),
]);
export type OwnerRuntimeCapabilities = z.infer<
  typeof ownerRuntimeCapabilitiesSchema
>;
