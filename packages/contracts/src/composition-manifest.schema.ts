import { z } from "zod";

import { ASSEMBLY_LIMITS } from "./constants.js";
import {
  candidateIdSchema,
  revisionIdSchema,
  trackIdSchema,
  visualAssetIdSchema,
  visualCueIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import { boundedPlainTextSchema } from "./text.schema.js";
import {
  visualAssetKindSchema,
  visualLayoutSchema,
  visualMotionSchema,
  visualTransitionSchema,
} from "./visual-plan.schema.js";

export const visualCueSchema = z
  .object({
    id: visualCueIdSchema,
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
    kind: visualAssetKindSchema,
    assetId: visualAssetIdSchema,
    layout: visualLayoutSchema,
    motion: visualMotionSchema,
    transition: visualTransitionSchema,
    rationale: boundedPlainTextSchema(320),
  })
  .strict()
  .refine((cue) => cue.startWordId !== cue.endWordId, {
    message: "Visual cue range must contain more than one word boundary.",
    path: ["endWordId"],
  });

export const compositionManifestSchema = z
  .object({
    version: z.literal(1),
    baseCandidateId: candidateIdSchema,
    analysisRevision: revisionIdSchema,
    assemblyRevision: revisionIdSchema,
    range: z
      .object({
        startWordId: wordIdSchema,
        endWordId: wordIdSchema,
      })
      .strict(),
    speakerFraming: z
      .object({
        mode: z.literal("active-speaker"),
        focusTrackId: trackIdSchema,
        shotTrackId: trackIdSchema,
        smoothingProfile: z.literal("editorial"),
      })
      .strict(),
    captions: z.object({ profile: z.literal("clean-emphasis") }).strict(),
    visuals: z
      .object({
        planRevision: revisionIdSchema,
        cues: z.array(visualCueSchema).max(ASSEMBLY_LIMITS.maxVisualCues),
      })
      .strict(),
    audio: z.object({ normalization: z.literal("speech-safe") }).strict(),
  })
  .strict()
  .superRefine((manifest, context) => {
    if (manifest.range.startWordId === manifest.range.endWordId) {
      context.addIssue({
        code: "custom",
        message: "Composition range must contain more than one word boundary.",
        path: ["range", "endWordId"],
      });
    }

    const cueIds = manifest.visuals.cues.map((cue) => cue.id);
    if (new Set(cueIds).size !== cueIds.length) {
      context.addIssue({
        code: "custom",
        message: "Visual cue identifiers must be unique.",
        path: ["visuals", "cues"],
      });
    }
  });

export type VisualCueV1 = z.infer<typeof visualCueSchema>;
export type CompositionManifestV1 = z.infer<typeof compositionManifestSchema>;
