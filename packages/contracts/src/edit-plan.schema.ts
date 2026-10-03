import { z } from "zod";
import { ASSEMBLY_LIMITS, PUBLIC_LIMITS } from "./constants.js";
import { boundedPlainTextSchema } from "./text.schema.js";
import { wordIdSchema } from "./ids.schema.js";

export const FIXED_COMPOSITION_POLICY = {
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
              .max(FIXED_COMPOSITION_POLICY.captionWords)
              .optional(),
            lines: z.array(boundedPlainTextSchema(80)).min(1).max(2).optional(),
            emphasisWordIndex: z
              .number()
              .int()
              .min(0)
              .max(FIXED_COMPOSITION_POLICY.captionWords - 1)
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
