import { z } from "zod";

import { turnstileTokenSchema } from "./boundary-primitives.schema.js";
import { ASSEMBLY_LIMITS, EDIT_LIMITS } from "./constants.js";
import {
  analysisIdSchema,
  assemblyIdSchema,
  candidateIdSchema,
  proposalIdSchema,
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

export const captionThemeSchema = z.enum([
  "clean-emphasis",
  "editorial-block",
  "minimal-subtitle",
]);
export const captionDensitySchema = z.enum(["comfortable", "compact"]);

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

export const captionCorrectionSchema = z
  .object({
    wordId: wordIdSchema,
    text: boundedPlainTextSchema(80),
  })
  .strict();

export const editManifestSchema = z
  .object({
    version: z.literal(1),
    baseCandidateId: z.union([candidateIdSchema, z.literal("manual")]),
    analysisRevision: revisionIdSchema,
    assemblyRevision: revisionIdSchema,
    revision: z.number().int().min(0),
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
    captions: z
      .object({
        theme: captionThemeSchema,
        density: captionDensitySchema,
        corrections: z
          .array(captionCorrectionSchema)
          .max(EDIT_LIMITS.maxCaptionCorrections),
        emphasizedWordIds: z.array(wordIdSchema).max(200),
      })
      .strict(),
    headline: z
      .object({
        text: boundedPlainTextSchema(
          EDIT_LIMITS.maxHeadlineCharacters,
        ).nullable(),
        placement: z.literal("top-safe"),
      })
      .strict(),
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
        message: "Edit range must contain more than one word boundary.",
        path: ["range", "endWordId"],
      });
    }

    const correctionWordIds = manifest.captions.corrections.map(
      (correction) => correction.wordId,
    );
    if (new Set(correctionWordIds).size !== correctionWordIds.length) {
      context.addIssue({
        code: "custom",
        message: "Caption corrections must reference distinct words.",
        path: ["captions", "corrections"],
      });
    }

    const correctionCharacters = manifest.captions.corrections.reduce(
      (total, correction) => total + correction.text.length,
      0,
    );
    if (correctionCharacters > EDIT_LIMITS.maxCaptionCorrectionCharacters) {
      context.addIssue({
        code: "custom",
        message: "Caption corrections exceed the total character limit.",
        path: ["captions", "corrections"],
      });
    }

    if (
      new Set(manifest.captions.emphasizedWordIds).size !==
      manifest.captions.emphasizedWordIds.length
    ) {
      context.addIssue({
        code: "custom",
        message: "Emphasized word references must be unique.",
        path: ["captions", "emphasizedWordIds"],
      });
    }

    const visualCueIds = manifest.visuals.cues.map((cue) => cue.id);
    if (new Set(visualCueIds).size !== visualCueIds.length) {
      context.addIssue({
        code: "custom",
        message: "Visual cue identifiers must be unique.",
        path: ["visuals", "cues"],
      });
    }
  });

const setInOperationSchema = z
  .object({ type: z.literal("set-in"), wordId: wordIdSchema })
  .strict();
const setOutOperationSchema = z
  .object({ type: z.literal("set-out"), wordId: wordIdSchema })
  .strict();
const setCaptionThemeOperationSchema = z
  .object({ type: z.literal("set-caption-theme"), theme: captionThemeSchema })
  .strict();
const setCaptionDensityOperationSchema = z
  .object({
    type: z.literal("set-caption-density"),
    density: captionDensitySchema,
  })
  .strict();
const setHeadlineOperationSchema = z
  .object({
    type: z.literal("set-headline"),
    text: boundedPlainTextSchema(EDIT_LIMITS.maxHeadlineCharacters).nullable(),
  })
  .strict();
const removeVisualCueOperationSchema = z
  .object({ type: z.literal("remove-visual-cue"), cueId: visualCueIdSchema })
  .strict();
const setVisualCueRangeOperationSchema = z
  .object({
    type: z.literal("set-visual-cue-range"),
    cueId: visualCueIdSchema,
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
  })
  .strict();
const setVisualCueLayoutOperationSchema = z
  .object({
    type: z.literal("set-visual-cue-layout"),
    cueId: visualCueIdSchema,
    layout: visualLayoutSchema,
  })
  .strict();
const setEmphasizedWordsOperationSchema = z
  .object({
    type: z.literal("set-emphasized-words"),
    wordIds: z.array(wordIdSchema).max(200),
  })
  .strict();

export const editOperationSchema = z.discriminatedUnion("type", [
  setInOperationSchema,
  setOutOperationSchema,
  setCaptionThemeOperationSchema,
  setCaptionDensityOperationSchema,
  setHeadlineOperationSchema,
  removeVisualCueOperationSchema,
  setVisualCueRangeOperationSchema,
  setVisualCueLayoutOperationSchema,
  setEmphasizedWordsOperationSchema,
]);

export const editProposalSchema = z
  .object({
    version: z.literal(1),
    proposalId: proposalIdSchema,
    baseRevision: z.number().int().min(0),
    operations: z
      .array(editOperationSchema)
      .min(1)
      .max(EDIT_LIMITS.maxOperations),
    explanation: boundedPlainTextSchema(320),
    limitations: z.array(boundedPlainTextSchema(160)).max(3),
  })
  .strict();

export const editorProposalRequestSchema = z
  .object({
    analysisId: analysisIdSchema,
    assemblyId: assemblyIdSchema,
    manifest: editManifestSchema,
    instruction: boundedPlainTextSchema(EDIT_LIMITS.maxInstructionCharacters),
    turnstileToken: turnstileTokenSchema,
  })
  .strict();

export type VisualCueV1 = z.infer<typeof visualCueSchema>;
export type EditManifestV1 = z.infer<typeof editManifestSchema>;
export type EditOperation = z.infer<typeof editOperationSchema>;
export type EditProposalV1 = z.infer<typeof editProposalSchema>;
