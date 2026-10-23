import { z } from "zod";

export const OWNER_VIDEO_LOOKS = [
  "original",
  "vivid",
  "warm",
  "cool",
  "mono",
] as const;
export const ownerVideoLookSchema = z
  .object({
    preset: z.enum(OWNER_VIDEO_LOOKS),
    strength: z.number().int().min(0).max(100),
  })
  .strict();
export type OwnerVideoLook = z.infer<typeof ownerVideoLookSchema>;
type Matrix = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];
const identity: Matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const mono: Matrix = [
  0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722,
];
const looks: Record<OwnerVideoLook["preset"], Matrix> = {
  original: identity,
  vivid: [
    1.141732, -0.128736, -0.012996, -0.038268, 1.051264, -0.012996, -0.038268,
    -0.128736, 1.167004,
  ],
  warm: [1.06, 0, 0, 0, 1.01, 0, 0, 0, 0.94],
  cool: [0.94, 0, 0, 0, 1.01, 0, 0, 0, 1.06],
  mono,
};

/** Fixed sRGB transform before overlays. No supplied CSS, LUT or expressions. */
export function ownerVideoLookMatrix(value?: OwnerVideoLook): number[] {
  if (!value) return [...identity];
  const look = ownerVideoLookSchema.parse(value);
  return identity.map((start, index) =>
    Number(
      (
        start +
        ((looks[look.preset][index]! - start) * look.strength) / 100
      ).toFixed(6),
    ),
  );
}
