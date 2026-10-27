import { z } from "zod";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { ownerIdSchema } from "./policy.ts";
import {
  ownerDigestSchema,
  ownerVisualEditSchema,
  OWNER_PICTURE_LIMITS,
} from "./assets.ts";
import { ownerVideoLookSchema } from "./video-look.ts";
import { ownerFocusSchema } from "./focus.ts";
import { boundedPlainTextSchema } from "../src/text.schema.ts";
import {
  ownerTypographySchema,
  OWNER_SOCIAL_TEXT_PRESETS,
} from "./text-style.ts";
import { ownerTextLayersSchema } from "./text-layers.ts";
export { OWNER_TEXT_FONTS as OWNER_CAPTION_FONTS } from "./text-style.ts";

export const OWNER_CAPTION_ANIMATIONS = [
  "highlight",
  "pop",
  "slide",
  "bounce",
  "reveal",
  "single-word",
  "fade",
  "none",
] as const;

export const ownerCaptionStyleSchema = ownerTypographySchema
  .extend({
    animation: z.enum(OWNER_CAPTION_ANIMATIONS).optional(),
    highlight: z.string().regex(/^#[a-fA-F0-9]{6}$/),
    box: normalizedBoxSchema,
  })
  .strict()
  .refine(
    (style) =>
      style.box.x >= 0.05 &&
      style.box.y >= 0.05 &&
      style.box.x + style.box.width <= 0.95 + 1e-9 &&
      style.box.y + style.box.height <= 0.95 + 1e-9 &&
      style.box.width >= 0.6 &&
      style.box.height * 1920 >= 2 * (style.fontSize * 1.2 + 8),
    { message: "Caption text must fit inside the portrait safe area." },
  );
export type OwnerCaptionStyle = z.infer<typeof ownerCaptionStyleSchema>;
export const ownerCaptionTextSchema = z
  .array(
    z
      .object({
        wordId: z.string().min(1).max(64),
        text: boundedPlainTextSchema(80),
      })
      .strict(),
  )
  .max(12000)
  .refine((words) => new Set(words.map((w) => w.wordId)).size === words.length);
const captionBox = {
  x: 80 / 1080,
  y: 1500 / 1920,
  width: 920 / 1080,
  height: 200 / 1920,
};
export const OWNER_CAPTION_PRESETS: Record<
  OwnerCaptionStyle["preset"],
  OwnerCaptionStyle
> = {
  tiktok: {
    ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
    highlight: "#7652d8",
    animation: "none",
    box: captionBox,
  },
  solid: {
    ...OWNER_SOCIAL_TEXT_PRESETS.solid,
    highlight: "#7652d8",
    animation: "none",
    box: captionBox,
  },
  "solid-block": {
    ...OWNER_SOCIAL_TEXT_PRESETS["solid-block"],
    highlight: "#7652d8",
    animation: "none",
    box: captionBox,
  },
  translucent: {
    ...OWNER_SOCIAL_TEXT_PRESETS.translucent,
    highlight: "#7652d8",
    animation: "none",
    box: captionBox,
  },
  clean: {
    preset: "clean",
    fontSize: 64,
    color: "#ffffff",
    highlight: "#7652d8",
    align: "center",
    box: captionBox,
  },
  classic: {
    preset: "classic",
    fontSize: 56,
    color: "#ffffff",
    highlight: "#245f78",
    align: "center",
    box: captionBox,
  },
  bold: {
    preset: "bold",
    fontSize: 80,
    color: "#fff160",
    highlight: "#222222",
    align: "center",
    box: { ...captionBox, height: 240 / 1920, y: 1460 / 1920 },
  },
  boxed: {
    preset: "boxed",
    fontSize: 64,
    font: "Verdana",
    animation: "highlight",
    color: "#ffffff",
    highlight: "#e43e92",
    align: "center",
    verticalAlign: "center",
    box: captionBox,
  },
  typewriter: {
    preset: "typewriter",
    fontSize: 60,
    font: "Courier New",
    animation: "reveal",
    color: "#ffffff",
    highlight: "#3173e8",
    align: "center",
    verticalAlign: "center",
    box: captionBox,
  },
};
export const ownerEditDocumentSchema = z
  .object({
    version: z.literal(1),
    clipId: ownerIdSchema,
    fingerprint: ownerDigestSchema,
    baseHash: ownerDigestSchema,
    revision: z.number().int().nonnegative(),
    captions: ownerCaptionStyleSchema.nullable(),
    captionText: ownerCaptionTextSchema.optional(),
    texts: ownerTextLayersSchema.optional(),
    videoLook: ownerVideoLookSchema.optional(),
    focus: ownerFocusSchema.optional(),
    visuals: z
      .array(ownerVisualEditSchema)
      .max(OWNER_PICTURE_LIMITS.cuesPerClip),
  })
  .strict()
  .refine(
    (document) =>
      new Set(document.visuals.map((cue) => cue.id)).size ===
      document.visuals.length,
  );
export type OwnerEditDocument = z.infer<typeof ownerEditDocumentSchema>;
export const ownerEditOperationSchema = z.discriminatedUnion("kind", [
  z
    .object({ kind: z.literal("text-layers"), layers: ownerTextLayersSchema })
    .strict(),
  z
    .object({ kind: z.literal("caption-text"), words: ownerCaptionTextSchema })
    .strict(),
  z.object({ kind: z.literal("focus"), focus: ownerFocusSchema }).strict(),
  z
    .object({ kind: z.literal("video-look"), look: ownerVideoLookSchema })
    .strict(),
  z
    .object({ kind: z.literal("caption"), style: ownerCaptionStyleSchema })
    .strict(),
  z
    .object({ kind: z.literal("visual-upsert"), cue: ownerVisualEditSchema })
    .strict(),
  z.object({ kind: z.literal("visual-remove"), cueId: ownerIdSchema }).strict(),
  z
    .object({
      kind: z.literal("reset"),
      panel: z.enum(["captions", "visuals", "video", "focus"]),
    })
    .strict(),
]);
export const ownerEditRequestSchema = z
  .object({
    operationId: ownerIdSchema,
    expectedRevision: z.number().int().nonnegative(),
    baseHash: ownerDigestSchema,
    operations: z
      .array(ownerEditOperationSchema)
      .min(1)
      .max(2 * OWNER_PICTURE_LIMITS.cuesPerClip + 5),
  })
  .strict();
export type OwnerEditRequest = z.infer<typeof ownerEditRequestSchema>;
