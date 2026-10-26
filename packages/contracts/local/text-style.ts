import { z } from "zod";

export const OWNER_TEXT_FONTS = [
  "Arial",
  "Verdana",
  "Georgia",
  "Courier New",
] as const;
export const OWNER_TEXT_PRESET_LABELS = {
  clean: "Clean",
  classic: "Classic",
  bold: "Bold",
  boxed: "Rounded highlight",
  typewriter: "Typewriter",
  tiktok: "TikTok style",
  solid: "Solid background",
  translucent: "Translucent background",
} as const;
export const ownerTypographySchema = z
  .object({
    preset: z.enum([
      "clean",
      "classic",
      "bold",
      "boxed",
      "typewriter",
      "tiktok",
      "solid",
      "translucent",
    ]),
    fontSize: z.number().int().min(24).max(120),
    font: z.enum(OWNER_TEXT_FONTS).optional(),
    fontWeight: z
      .union([
        z.literal(400),
        z.literal(600),
        z.literal(700),
        z.literal(800),
        z.literal(900),
      ])
      .optional(),
    color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
    align: z.enum(["left", "center", "right"]),
    verticalAlign: z.enum(["center", "bottom"]).optional(),
    outlineColor: z
      .string()
      .regex(/^#[a-fA-F0-9]{6}$/)
      .optional(),
    outlineWidth: z.number().int().min(0).max(12).optional(),
    backgroundColor: z
      .string()
      .regex(/^#[a-fA-F0-9]{6}$/)
      .optional(),
    backgroundOpacity: z.number().min(0).max(1).optional(),
  })
  .strict();
export type OwnerTypography = z.infer<typeof ownerTypographySchema>;

/** New treatments are shared by free text and captions; older defaults stay intact. */
export const OWNER_SOCIAL_TEXT_PRESETS = {
  tiktok: {
    preset: "tiktok",
    font: "Arial",
    fontSize: 64,
    fontWeight: 700,
    color: "#ffffff",
    align: "center",
    verticalAlign: "center",
    outlineColor: "#000000",
    outlineWidth: 5,
    backgroundColor: "#171717",
    backgroundOpacity: 0,
  },
  solid: {
    preset: "solid",
    font: "Arial",
    fontSize: 64,
    fontWeight: 700,
    color: "#111111",
    align: "center",
    verticalAlign: "center",
    outlineColor: "#000000",
    outlineWidth: 0,
    backgroundColor: "#ffffff",
    backgroundOpacity: 1,
  },
  translucent: {
    preset: "translucent",
    font: "Arial",
    fontSize: 56,
    fontWeight: 700,
    color: "#ffffff",
    align: "center",
    verticalAlign: "center",
    outlineColor: "#000000",
    outlineWidth: 0,
    backgroundColor: "#171717",
    backgroundOpacity: 0.6,
  },
} as const satisfies Record<string, OwnerTypography>;

export function ownerTypographyWeight(style: OwnerTypography): number {
  return (
    style.fontWeight ??
    (
      {
        clean: 800,
        classic: 700,
        bold: 900,
        boxed: 800,
        typewriter: 700,
        tiktok: 700,
        solid: 700,
        translucent: 700,
      } as const
    )[style.preset]
  );
}

export function ownerTextBackground(style: OwnerTypography) {
  return {
    color:
      style.backgroundColor ??
      (style.preset === "solid"
        ? "#ffffff"
        : style.preset === "boxed"
          ? "#101726"
          : "#171717"),
    opacity:
      style.backgroundOpacity ??
      (style.preset === "solid" || style.preset === "boxed"
        ? 1
        : style.preset === "translucent"
          ? 0.6
          : 0),
  };
}
