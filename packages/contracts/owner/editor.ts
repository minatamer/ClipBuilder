import { z } from "zod";
import { normalizedBoxSchema } from "../src/edit-plan.schema.ts";
import { ownerIdSchema } from "./policy.ts";
import { ownerDigestSchema, ownerVisualEditSchema } from "./assets.ts";
import { CONTEXTUAL_PICTURE_POLICY } from "../src/contextual-picture.schema.ts";
import { ownerVideoLookSchema } from "./video-look.ts";

export const OWNER_CAPTION_FONTS = [
  "Arial",
  "Verdana",
  "Georgia",
  "Courier New",
] as const;
export const OWNER_CAPTION_ANIMATIONS = [
  "highlight",
  "pop",
  "fade",
  "none",
] as const;

export const ownerCaptionStyleSchema = z
  .object({
    preset: z.enum(["clean", "classic", "bold"]),
    fontSize: z.number().int().min(24).max(120),
    font: z.enum(OWNER_CAPTION_FONTS).optional(),
    animation: z.enum(OWNER_CAPTION_ANIMATIONS).optional(),
    color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
    highlight: z.string().regex(/^#[a-fA-F0-9]{6}$/),
    align: z.enum(["left", "center", "right"]),
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
};
export const ownerEditDocumentSchema = z
  .object({
    version: z.literal(1),
    clipId: ownerIdSchema,
    fingerprint: ownerDigestSchema,
    baseHash: ownerDigestSchema,
    revision: z.number().int().nonnegative(),
    captions: ownerCaptionStyleSchema.nullable(),
    videoLook: ownerVideoLookSchema.optional(),
    visuals: z
      .array(ownerVisualEditSchema)
      .max(CONTEXTUAL_PICTURE_POLICY.maxPictures),
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
      panel: z.enum(["captions", "visuals", "video"]),
    })
    .strict(),
]);
export const ownerEditRequestSchema = z
  .object({
    operationId: ownerIdSchema,
    expectedRevision: z.number().int().nonnegative(),
    baseHash: ownerDigestSchema,
    operations: z.array(ownerEditOperationSchema).min(1).max(10),
  })
  .strict();
export type OwnerEditRequest = z.infer<typeof ownerEditRequestSchema>;
