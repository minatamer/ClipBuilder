import { ownerCameraEffectsSchema } from "./camera-motion.ts";
import { z } from "zod";
import { ownerCameraTracksSchema } from "./camera-follow.ts";
import { ownerAudioEditSchema } from "./audio.ts";
import {
  normalizedBoxSchema,
  compositionManifestV3Schema,
} from "@clipbuilder/contracts";
import { ownerWordsSchema } from "./selection.ts";
import { OWNER_FPS, ownerIdSchema } from "./policy.ts";
import {
  ownerDigestSchema,
  ownerVisualEditSchema,
  OWNER_PICTURE_LIMITS,
} from "./assets.ts";
import { ownerVideoLookSchema, ownerVideoLooksSchema } from "./video-look.ts";
import { ownerFocusSchema } from "./focus.ts";
import { boundedPlainTextSchema } from "../src/text.schema.ts";
import {
  ownerTypographySchema,
  OWNER_SOCIAL_TEXT_PRESETS,
} from "./text-style.ts";
import { ownerTextLayersSchema } from "./text-layers.ts";
import { ownerCaptionSpeakersSchema } from "./caption-speakers.ts";
import { ownerHookSchema } from "./hook.ts";
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
    material: z.literal("glass").optional(),
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
export const OWNER_CAPTION_DEFAULT_CENTER_Y = 1032 / 1920;
const captionBox = {
  x: 80 / 1080,
  y: OWNER_CAPTION_DEFAULT_CENTER_Y - 100 / 1920,
  width: 920 / 1080,
  height: 200 / 1920,
};
export const OWNER_CAPTION_PRESETS: Record<
  OwnerCaptionStyle["preset"],
  OwnerCaptionStyle
> & { glass: OwnerCaptionStyle } = {
  glass: {
    preset: "clean",
    material: "glass",
    font: "Arial",
    fontSize: 120,
    fontWeight: 900,
    color: "#ffffff",
    highlight: "#7652d8",
    animation: "single-word",
    align: "center",
    verticalAlign: "center",
    outlineColor: "#10243b",
    outlineWidth: 0,
    backgroundColor: "#171717",
    backgroundOpacity: 0,
    box: {
      ...captionBox,
      y: OWNER_CAPTION_DEFAULT_CENTER_Y - 160 / 1920,
      height: 320 / 1920,
    },
  },
  tiktok: {
    ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
    highlight: "#7652d8",
    animation: "pop",
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
    verticalAlign: "center",
    box: captionBox,
  },
  classic: {
    preset: "classic",
    fontSize: 56,
    color: "#ffffff",
    highlight: "#245f78",
    align: "center",
    verticalAlign: "center",
    box: captionBox,
  },
  bold: {
    preset: "bold",
    fontSize: 80,
    color: "#fff160",
    highlight: "#222222",
    align: "center",
    verticalAlign: "center",
    box: {
      ...captionBox,
      height: 240 / 1920,
      y: OWNER_CAPTION_DEFAULT_CENTER_Y - 120 / 1920,
    },
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
export type OwnerCaptionPreset = keyof typeof OWNER_CAPTION_PRESETS;
export const ownerContentEditSchema = z
  .object({
    captions: ownerCaptionStyleSchema.nullable(),
    audio: ownerAudioEditSchema.optional(),
    captionText: ownerCaptionTextSchema.optional(),
    captionSpeakers: ownerCaptionSpeakersSchema.optional(),
    texts: ownerTextLayersSchema.optional(),
    videoLook: ownerVideoLookSchema.optional(),
    videoLooks: ownerVideoLooksSchema.optional(),
    focus: ownerFocusSchema.optional(),
    cameraEffects: ownerCameraEffectsSchema.optional(),
    cameraTracks: ownerCameraTracksSchema.optional(),
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
export type OwnerContentEdit = z.infer<typeof ownerContentEditSchema>;
export const ownerHookContentSchema = z
  .object({
    window: ownerHookSchema,
    captions: compositionManifestV3Schema.shape.captions,
    words: ownerWordsSchema,
    edits: ownerContentEditSchema,
  })
  .strict()
  .superRefine((content, ctx) => {
    const start = Math.floor((content.window.startFrame * 1000) / OWNER_FPS),
      end = Math.ceil((content.window.endFrame * 1000) / OWNER_FPS);
    const words = new Set(content.words.map((word) => word.id));
    if (
      content.words.some(
        (word) => word.startMs < start - 1e-6 || word.endMs > end + 1e-6,
      ) ||
      content.captions.some(
        (caption) =>
          caption.startMs < start - 1e-6 ||
          caption.endMs > end + 1e-6 ||
          caption.wordIds.some((id) => !words.has(id)),
      ) ||
      content.edits.visuals.some(
        (cue) =>
          cue.startFrame < content.window.startFrame ||
          cue.endFrame > content.window.endFrame,
      ) ||
      content.edits.videoLooks?.some(
        (range) =>
          range.startFrame < content.window.startFrame ||
          range.endFrame > content.window.endFrame,
      ) ||
      content.edits.texts?.some((layer) =>
        layer.role === "opening-title"
          ? layer.endFrame > content.window.endFrame - content.window.startFrame
          : layer.startFrame < content.window.startFrame ||
            layer.endFrame > content.window.endFrame,
      ) ||
      content.edits.cameraEffects?.some(
        (effect) => effect.occurrence !== "hook",
      ) ||
      content.edits.cameraTracks?.some((track) => track.occurrence !== "hook")
    )
      ctx.addIssue({
        code: "custom",
        message: "Hook content must stay inside its occurrence.",
      });
  });
export type OwnerHookContent = z.infer<typeof ownerHookContentSchema>;
export const ownerEditDocumentSchema = ownerContentEditSchema
  .safeExtend({
    version: z.literal(1),
    clipId: ownerIdSchema,
    fingerprint: ownerDigestSchema,
    baseHash: ownerDigestSchema,
    revision: z.number().int().nonnegative(),
    hook: ownerHookSchema.optional(),
    hookContent: ownerHookContentSchema.optional(),
  })
  .refine(
    (document) =>
      !document.hookContent ||
      (document.hook &&
        document.hook.startFrame === document.hookContent.window.startFrame &&
        document.hook.endFrame === document.hookContent.window.endFrame),
    { message: "Hook content must match the selected Hook." },
  );
export type OwnerEditDocument = z.infer<typeof ownerEditDocumentSchema>;
export const ownerEditOperationSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("visual-order"),
      ids: z.array(ownerIdSchema).max(OWNER_PICTURE_LIMITS.cuesPerClip),
    })
    .strict(),
  z
    .object({
      kind: z.literal("hook-content"),
      content: ownerHookContentSchema.nullable(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("camera-tracks"),
      tracks: ownerCameraTracksSchema,
    })
    .strict(),
  z.object({ kind: z.literal("audio"), audio: ownerAudioEditSchema }).strict(),
  z
    .object({ kind: z.literal("hook"), hook: ownerHookSchema.nullable() })
    .strict(),
  z
    .object({
      kind: z.literal("caption-speakers"),
      speakers: ownerCaptionSpeakersSchema.nullable(),
    })
    .strict(),
  z
    .object({ kind: z.literal("text-layers"), layers: ownerTextLayersSchema })
    .strict(),
  z
    .object({ kind: z.literal("caption-text"), words: ownerCaptionTextSchema })
    .strict(),
  z.object({ kind: z.literal("focus"), focus: ownerFocusSchema }).strict(),
  z
    .object({
      kind: z.literal("camera-effects"),
      effects: ownerCameraEffectsSchema,
    })
    .strict(),
  z
    .object({ kind: z.literal("video-look"), look: ownerVideoLookSchema })
    .strict(),
  z
    .object({ kind: z.literal("video-looks"), looks: ownerVideoLooksSchema })
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
      .max(2 * OWNER_PICTURE_LIMITS.cuesPerClip + 8),
  })
  .strict();
export type OwnerEditRequest = z.infer<typeof ownerEditRequestSchema>;
