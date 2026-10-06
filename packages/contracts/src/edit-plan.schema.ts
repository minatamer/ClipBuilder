import { z } from "zod";
import { ASSEMBLY_LIMITS, PUBLIC_LIMITS } from "./constants.js";
import { boundedPlainTextSchema } from "./text.schema.js";
import { wordIdSchema } from "./ids.schema.js";
import {
  contextualPictureSchema,
  CONTEXTUAL_PICTURE_POLICY,
} from "./contextual-picture.schema.js";

const LEGACY_FIXED_COMPOSITION_POLICY = {
  version: "fixed-composition-v1",
  captionProfile: "clean-emphasis",
  captionWords: 7,
  captionLineCharacters: 32,
  captionGroupMs: 3500,
  captionPauseMs: 400,
  openingBeatMs: 2000,
  cardSeparationMs: 1000,
  rasterCalls: 0,
  maxSelectedWords: 2000,
  selectedContextBytes: 256 * 1024,
} as const;
export const FIXED_COMPOSITION_POLICY = {
  ...LEGACY_FIXED_COMPOSITION_POLICY,
  version: "fixed-composition-v2",
  captionProfile: "spoken-word-v1",
  captionWords: 5,
  captionLineCharacters: 24,
  captionGroupMs: 2200,
  captionFontSize: 64,
  maxCaptionGroups: 500,
  spokenWordOnsetMs: 80,
  maxFocusSegments: 600,
  maxTransitionMs: 6000,
} as const;

export const normalizedBoxSchema = z
  .object({
    x: z.number().finite().min(0).max(1),
    y: z.number().finite().min(0).max(1),
    width: z.number().finite().positive().max(1),
    height: z.number().finite().positive().max(1),
  })
  .strict()
  .refine((b) => b.x + b.width <= 1 && b.y + b.height <= 1);

const timeRange = {
  startMs: z.number().int().min(0),
  endMs: z.number().int().positive(),
};
export const selectedMediaRangeSchema = z
  .object(timeRange)
  .strict()
  .refine(
    (range) =>
      range.endMs - range.startMs >= PUBLIC_LIMITS.minClipSeconds * 1000 &&
      range.endMs - range.startMs <= PUBLIC_LIMITS.maxClipSeconds * 1000,
  );
export type SelectedMediaRange = z.infer<typeof selectedMediaRangeSchema>;
export const focusSegmentSchema = z.discriminatedUnion("mode", [
  z.object({ ...timeRange, mode: z.literal("wide") }).strict(),
  z
    .object({
      ...timeRange,
      mode: z.literal("speaker"),
      box: normalizedBoxSchema,
      fromBox: normalizedBoxSchema.optional(),
      confidence: z.number().finite().min(0).max(1),
      speaker: boundedPlainTextSchema(32),
    })
    .strict(),
]);
export const compositionManifestV2Schema = z
  .object({
    version: z.literal(2),
    source: z
      .object({
        fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
        durationMs: z.number().int().min(15_000).max(1_200_000),
        width: z.number().int().positive().max(3840),
        height: z.number().int().positive().max(3840),
      })
      .strict(),
    range: z.object(timeRange).strict(),
    output: z
      .object({
        width: z.literal(1080),
        height: z.literal(1920),
        fps: z.literal(30),
      })
      .strict(),
    focus: z
      .array(focusSegmentSchema)
      .min(1)
      .max(ASSEMBLY_LIMITS.maxFocusSegments),
    captions: z
      .array(
        z
          .object({
            ...timeRange,
            text: boundedPlainTextSchema(80),
            wordIds: z
              .array(wordIdSchema)
              .min(1)
              .max(LEGACY_FIXED_COMPOSITION_POLICY.captionWords)
              .optional(),
            lines: z.array(boundedPlainTextSchema(80)).min(1).max(2).optional(),
            emphasisWordIndex: z
              .number()
              .int()
              .min(0)
              .max(LEGACY_FIXED_COMPOSITION_POLICY.captionWords - 1)
              .optional(),
          })
          .strict(),
      )
      .max(500),
    cards: z
      .array(
        z
          .object({
            ...timeRange,
            kind: z.enum(["statement", "comparison", "steps"]),
            title: boundedPlainTextSchema(64),
            lines: z.array(boundedPlainTextSchema(80)).min(1).max(3),
          })
          .strict(),
      )
      .max(ASSEMBLY_LIMITS.maxVisualCues),
  })
  .strict()
  .superRefine((plan, ctx) => {
    const duration = plan.range.endMs - plan.range.startMs;
    if (
      duration < PUBLIC_LIMITS.minClipSeconds * 1000 ||
      duration > PUBLIC_LIMITS.maxClipSeconds * 1000 ||
      plan.range.endMs > plan.source.durationMs
    )
      ctx.addIssue({
        code: "custom",
        message: "Selected range is outside source or clip limits.",
      });
    let cursor = 0;
    for (const segment of plan.focus) {
      if (
        segment.startMs !== cursor ||
        segment.endMs <= cursor ||
        segment.endMs > duration
      )
        ctx.addIssue({
          code: "custom",
          message:
            "Focus must cover the selected range without gaps or overlaps.",
        });
      cursor = segment.endMs;
    }
    if (cursor !== duration)
      ctx.addIssue({
        code: "custom",
        message: "Focus does not cover selected duration.",
      });
    for (const items of [plan.captions, plan.cards]) {
      let previous = 0;
      for (const item of items) {
        if (
          item.startMs < previous ||
          item.endMs <= item.startMs ||
          item.endMs > duration
        )
          ctx.addIssue({
            code: "custom",
            message: "Timed content is outside its selected range or overlaps.",
          });
        previous = item.endMs;
      }
    }
    for (const caption of plan.captions) {
      if (
        (caption.lines && caption.lines.join(" ") !== caption.text) ||
        (caption.emphasisWordIndex !== undefined &&
          caption.emphasisWordIndex >= caption.text.split(" ").length)
      )
        ctx.addIssue({
          code: "custom",
          message: "Caption layout does not preserve its text.",
        });
    }
    let coverage = 0;
    for (const card of plan.cards) {
      const length = card.endMs - card.startMs;
      coverage += length;
      if (
        length < ASSEMBLY_LIMITS.minVisualCueMilliseconds ||
        length > ASSEMBLY_LIMITS.maxVisualCueMilliseconds
      )
        ctx.addIssue({
          code: "custom",
          message: "Contextual card duration exceeds the fixed bounds.",
        });
    }
    if (coverage * 100 > duration * ASSEMBLY_LIMITS.maxVisualCoveragePercent)
      ctx.addIssue({
        code: "custom",
        message: "Contextual card coverage exceeds the fixed limit.",
      });
  });
export type CompositionManifestV2 = z.infer<typeof compositionManifestV2Schema>;

export const heldFramingReasonSchema = z.enum([
  "visible-face",
  "opening-default",
  "pause",
  "uncertain",
  "switch-pending",
  "observation-gap",
]);
export const wideFramingReasonSchema = z.enum([
  "initial",
  "shot-reset",
  "hold-expired",
  "absent",
  "offscreen",
]);
export const contextualCardOriginSchema = z.enum([
  "planner",
  "transcript-fallback",
]);
const motionClock = {
  fromBox: normalizedBoxSchema.optional(),
  transitionStartMs: z.number().int().nonnegative().optional(),
  transitionMs: z
    .number()
    .int()
    .positive()
    .max(FIXED_COMPOSITION_POLICY.maxTransitionMs)
    .optional(),
};
export const focusSegmentV3Schema = z.discriminatedUnion("mode", [
  focusSegmentSchema.options[0].extend({ reason: wideFramingReasonSchema }),
  focusSegmentSchema.options[1].extend(motionClock),
  z
    .object({
      ...timeRange,
      ...motionClock,
      mode: z.literal("held"),
      box: normalizedBoxSchema,
      reason: heldFramingReasonSchema,
    })
    .strict(),
]);
export const captionWordCueSchema = z
  .object({
    ...timeRange,
    endMs: z.number().int().nonnegative(),
    wordId: wordIdSchema,
    text: boundedPlainTextSchema(80),
  })
  .strict();
/** New frozen policy; v2 remains unchanged for explicit stale-result rejection. */
export const compositionManifestV3Schema = z
  .object({
    ...compositionManifestV2Schema.shape,
    version: z.literal(3),
    pictures: z
      .array(contextualPictureSchema)
      .max(CONTEXTUAL_PICTURE_POLICY.maxPictures)
      .optional(),
    focus: z
      .array(focusSegmentV3Schema)
      .min(1)
      .max(FIXED_COMPOSITION_POLICY.maxFocusSegments),
    captions: z
      .array(
        compositionManifestV2Schema.shape.captions.element
          .omit({ emphasisWordIndex: true })
          .extend({
            wordIds: z
              .array(wordIdSchema)
              .min(1)
              .max(FIXED_COMPOSITION_POLICY.captionWords),
            lines: z.array(boundedPlainTextSchema(80)).min(1).max(2),
            wordCues: z
              .array(captionWordCueSchema)
              .min(1)
              .max(FIXED_COMPOSITION_POLICY.captionWords),
          }),
      )
      .max(FIXED_COMPOSITION_POLICY.maxCaptionGroups),
    cards: z
      .array(
        compositionManifestV2Schema.shape.cards.element.extend({
          origin: contextualCardOriginSchema,
        }),
      )
      .max(ASSEMBLY_LIMITS.maxVisualCues),
  })
  .strict()
  .superRefine((plan, ctx) => {
    // Reuse the original immutable source/coverage/text/clock rules. New metadata
    // is projected away, and held geometry has already passed its strict schema.
    const { pictures: _pictures, ...legacyPlan } = plan;
    void _pictures;
    const clockCheck = compositionManifestV2Schema.safeParse({
      ...legacyPlan,
      version: 2,
      focus: [
        {
          startMs: 0,
          endMs: plan.range.endMs - plan.range.startMs,
          mode: "wide",
        },
      ],
      captions: plan.captions.map((caption) => ({
        startMs: caption.startMs,
        endMs: caption.endMs,
        text: caption.text,
        wordIds: caption.wordIds,
        lines: caption.lines,
      })),
      cards: plan.cards.map((card) => ({
        startMs: card.startMs,
        endMs: card.endMs,
        kind: card.kind,
        title: card.title,
        lines: card.lines,
      })),
    });
    if (!clockCheck.success)
      ctx.addIssue({
        code: "custom",
        message: "Composition clocks or source bounds are invalid.",
      });
    const visuals = [...plan.cards, ...(plan.pictures ?? [])].sort(
      (a, b) => a.startMs - b.startMs,
    );
    if (
      visuals.length > ASSEMBLY_LIMITS.maxVisualCues ||
      visuals.reduce((sum, item) => sum + item.endMs - item.startMs, 0) * 100 >
        (plan.range.endMs - plan.range.startMs) *
          ASSEMBLY_LIMITS.maxVisualCoveragePercent ||
      visuals.some((item, index) => {
        const previous = visuals[index - 1];
        const adjacentPictures =
          previous && "asset" in previous && "asset" in item;
        return (
          item.startMs < FIXED_COMPOSITION_POLICY.openingBeatMs ||
          item.endMs > plan.range.endMs - plan.range.startMs ||
          item.endMs - item.startMs <
            ("asset" in item
              ? CONTEXTUAL_PICTURE_POLICY.minDurationMs
              : ASSEMBLY_LIMITS.minVisualCueMilliseconds) ||
          item.endMs - item.startMs >
            ASSEMBLY_LIMITS.maxVisualCueMilliseconds ||
          (previous &&
            item.startMs <
              previous.endMs +
                (adjacentPictures
                  ? 0
                  : FIXED_COMPOSITION_POLICY.cardSeparationMs))
        );
      })
    )
      ctx.addIssue({
        code: "custom",
        message: "Contextual visual windows are invalid.",
      });
    let cursor = 0;
    for (const focus of plan.focus) {
      if (
        focus.startMs !== cursor ||
        focus.endMs <= cursor ||
        focus.endMs > plan.range.endMs - plan.range.startMs
      )
        ctx.addIssue({
          code: "custom",
          message: "Focus coverage has a gap, overlap or invalid clock.",
        });
      cursor = focus.endMs;
    }
    if (cursor !== plan.range.endMs - plan.range.startMs)
      ctx.addIssue({
        code: "custom",
        message: "Focus does not cover the clip.",
      });
    for (const caption of plan.captions) {
      if (
        caption.wordCues.map((cue) => cue.text).join(" ") !== caption.text ||
        JSON.stringify(caption.wordIds) !==
          JSON.stringify(caption.wordCues.map((cue) => cue.wordId))
      )
        ctx.addIssue({
          code: "custom",
          message: "Caption word cues do not preserve its text and IDs.",
        });
      let previous = caption.startMs;
      for (const cue of caption.wordCues) {
        if (
          cue.startMs < previous ||
          cue.endMs < cue.startMs ||
          cue.endMs > caption.endMs
        )
          ctx.addIssue({
            code: "custom",
            message: "Caption word cue is outside its display clock.",
          });
        previous = cue.startMs;
      }
    }
    for (const focus of plan.focus)
      if (focus.mode !== "wide") {
        const fields = [
          focus.fromBox,
          focus.transitionMs,
          focus.transitionStartMs,
        ];
        if (
          (fields.some((field) => field !== undefined) &&
            fields.some((field) => field === undefined)) ||
          (focus.transitionStartMs !== undefined &&
            focus.transitionStartMs > focus.startMs) ||
          (focus.mode === "held" &&
            focus.reason !== "pause" &&
            focus.fromBox !== undefined)
        )
          ctx.addIssue({
            code: "custom",
            message: "Framing transition clock is invalid.",
          });
      }
  });
export type CompositionManifestV3 = z.infer<typeof compositionManifestV3Schema>;
