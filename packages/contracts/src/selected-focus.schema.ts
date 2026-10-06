import { z } from "zod";
import {
  compositionManifestV3Schema,
  normalizedBoxSchema,
  selectedMediaRangeSchema,
} from "./edit-plan.schema.js";
import {
  candidateIdSchema,
  revisionIdSchema,
  speakerIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import { groundedAnalysisResultSchema } from "./grounded-analysis.schema.js";
import {
  mediaBindingSchema,
  objectGenerationSchema,
} from "./cloud-media.schema.js";

export const SELECTED_FOCUS_POLICY = {
  version: "selected-focus-v2",
  minimumConfidence: 0.85,
  switchHoldMs: 1000,
  maximumEvidenceGapMs: 2000,
  videoSamplingFps: 5,
  maxShots: 30,
  maxObservations: 120,
} as const;
export const speakerObservationSchema = z
  .object({
    startMs: z.number().int().nonnegative(),
    endMs: z.number().int().positive(),
    speakerId: speakerIdSchema.nullable(),
    evidenceWordIds: z.array(wordIdSchema).max(8),
    visiblePeople: z.number().int().min(0).max(4),
    association: z.enum([
      "matched",
      "overlap",
      "offscreen",
      "absent",
      "ambiguous",
    ]),
    box: normalizedBoxSchema.nullable(),
    confidence: z.number().finite().min(0).max(1),
  })
  .strict();
// Provider boxes use the upright, decoded display coordinates. Times are clip-relative.
export const speakerPlanSchema = z
  .object({
    version: z.literal(1),
    coordinateSpace: z.literal("upright-display"),
    durationMs: z.number().int().min(10_000).max(60_000),
    shots: z
      .array(
        z
          .object({
            startMs: z.number().int().nonnegative(),
            endMs: z.number().int().positive(),
            openingFace: z
              .object({
                box: normalizedBoxSchema,
                confidence: z.number().finite().min(0).max(1),
              })
              .strict()
              .optional(),
            observations: z
              .array(speakerObservationSchema)
              .max(SELECTED_FOCUS_POLICY.maxObservations),
          })
          .strict(),
      )
      .min(1)
      .max(SELECTED_FOCUS_POLICY.maxShots),
  })
  .strict()
  .superRefine((plan, ctx) => {
    let cursor = 0,
      count = 0;
    for (const shot of plan.shots) {
      if (
        shot.startMs !== cursor ||
        shot.endMs <= cursor ||
        shot.endMs > plan.durationMs
      )
        ctx.addIssue({
          code: "custom",
          message: "Shots must cover the clip without gaps or overlap.",
        });
      let previous = shot.startMs;
      for (const item of shot.observations) {
        count++;
        if (
          item.startMs < previous ||
          item.endMs <= item.startMs ||
          item.endMs > shot.endMs
        )
          ctx.addIssue({
            code: "custom",
            message: "Observation crosses a shot or overlaps.",
          });
        if (new Set(item.evidenceWordIds).size !== item.evidenceWordIds.length)
          ctx.addIssue({ code: "custom", message: "Duplicate word evidence." });
        if (
          item.association === "matched" &&
          (!item.speakerId ||
            !item.box ||
            !item.evidenceWordIds.length ||
            !item.visiblePeople)
        )
          ctx.addIssue({
            code: "custom",
            message:
              "Matched association requires visible geometry and anonymous word evidence.",
          });
        if (item.association !== "matched" && item.box !== null)
          ctx.addIssue({
            code: "custom",
            message: "Ambiguous association cannot provide a crop.",
          });
        previous = item.endMs;
      }
      cursor = shot.endMs;
    }
    if (
      cursor !== plan.durationMs ||
      count > SELECTED_FOCUS_POLICY.maxObservations
    )
      ctx.addIssue({
        code: "custom",
        message: "Plan duration or observation bound is invalid.",
      });
  });
export const selectedFocusRequestSchema = z
  .object({
    analysis: groundedAnalysisResultSchema,
    candidateId: candidateIdSchema,
    turnstileToken: z.string().min(1).max(2048),
  })
  .strict();
export const selectedFocusResultSchema = z
  .object({
    version: z.literal(1),
    binding: mediaBindingSchema,
    generation: objectGenerationSchema,
    analysisRevision: revisionIdSchema,
    candidateId: candidateIdSchema,
    range: selectedMediaRangeSchema,
    policy: z.literal(SELECTED_FOCUS_POLICY.version),
    provider: z.enum(["fake", "google-gemini"]),
    focus: compositionManifestV3Schema.shape.focus,
    receipt: z.string().min(1).max(4096),
  })
  .strict()
  .superRefine((result, ctx) => {
    let cursor = 0;
    for (const item of result.focus) {
      if (
        item.startMs !== cursor ||
        item.endMs <= cursor ||
        item.endMs > result.range.endMs - result.range.startMs
      )
        ctx.addIssue({ code: "custom", message: "Focus coverage is invalid." });
      cursor = item.endMs;
    }
    if (cursor !== result.range.endMs - result.range.startMs)
      ctx.addIssue({
        code: "custom",
        message: "Focus does not cover the clip.",
      });
  });
export type SpeakerPlan = z.infer<typeof speakerPlanSchema>;
export type SelectedFocusRequest = z.infer<typeof selectedFocusRequestSchema>;
export type SelectedFocusResult = z.infer<typeof selectedFocusResultSchema>;
