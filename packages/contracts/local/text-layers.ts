import { z } from "zod";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { wordIdSchema } from "@clipbuilder/contracts";
import { boundedPlainTextSchema } from "../src/text.schema.ts";
import { OWNER_FPS, OWNER_LIMITS, ownerIdSchema } from "./policy.ts";
import { ownerTypographySchema } from "./text-style.ts";

export const OWNER_TEXT_LIMITS = {
  layers: 10,
  characters: 500,
  lines: 10,
  titleCharacters: 80,
} as const;
export const OWNER_PLANNED_TEXT_LIMIT = 3;
export const ownerPlannedTextSchema = z
  .array(
    z
      .object({
        startFrame: z
          .number()
          .int()
          .nonnegative()
          .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
        endFrame: z
          .number()
          .int()
          .positive()
          .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
        wordIds: z.array(wordIdSchema).min(1).max(12),
      })
      .strict(),
  )
  .max(OWNER_PLANNED_TEXT_LIMIT);
export const ownerClipTitleSchema = boundedPlainTextSchema(
  OWNER_TEXT_LIMITS.titleCharacters,
);
export const ownerLayerTextSchema = z
  .string()
  .max(OWNER_TEXT_LIMITS.characters)
  .transform((value) => value.replace(/\r\n?/gu, "\n").normalize("NFC").trim())
  .refine(
    (value) =>
      boundedPlainTextSchema(OWNER_TEXT_LIMITS.characters).safeParse(
        value.replace(/\n/gu, " "),
      ).success,
    { message: "Use 1–500 plain-text characters." },
  )
  .refine((value) => value.split("\n").length <= OWNER_TEXT_LIMITS.lines, {
    message: "Use up to 10 text lines.",
  });
export const ownerTextStyleSchema = ownerTypographySchema
  .extend({ box: normalizedBoxSchema })
  .strict()
  .refine(
    (style) =>
      style.box.x >= 0.05 &&
      style.box.y >= 0.05 &&
      style.box.x + style.box.width <= 0.95 + 1e-9 &&
      style.box.y + style.box.height <= 0.95 + 1e-9 &&
      style.box.width >= 0.2 &&
      style.box.height * 1920 >= style.fontSize * 1.2 + 32,
    {
      message:
        "Keep text inside the portrait safe area with room for one line.",
    },
  );
export type OwnerTextStyle = z.infer<typeof ownerTextStyleSchema>;
export const ownerTextLayerSchema = z
  .object({
    id: ownerIdSchema,
    text: ownerLayerTextSchema,
    startFrame: z.number().int().nonnegative(),
    endFrame: z
      .number()
      .int()
      .positive()
      .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
    style: ownerTextStyleSchema,
  })
  .strict()
  .refine((layer) => layer.endFrame > layer.startFrame, {
    message: "Text must end after it starts.",
  });
export const ownerTextLayersSchema = z
  .array(ownerTextLayerSchema)
  .max(OWNER_TEXT_LIMITS.layers)
  .refine(
    (layers) => new Set(layers.map((layer) => layer.id)).size === layers.length,
    { message: "Text layer IDs must be unique." },
  );
export type OwnerTextLayer = z.infer<typeof ownerTextLayerSchema>;
