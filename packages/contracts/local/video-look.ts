import { z } from "zod";
import { OWNER_FPS, OWNER_LIMITS } from "./policy.ts";

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
export const OWNER_VIDEO_LOOK_LABELS: Record<OwnerVideoLook["preset"], string> =
  {
    original: "Original",
    vivid: "Vivid",
    warm: "Warm",
    cool: "Cool",
    mono: "Black and white",
  };
export const OWNER_VIDEO_LOOK_RANGE_LIMIT = 32;
export const ownerVideoLookRangeSchema = ownerVideoLookSchema
  .extend({
    startFrame: z.number().int().nonnegative(),
    endFrame: z
      .number()
      .int()
      .positive()
      .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
  })
  .strict()
  .refine((range) => range.endFrame > range.startFrame);
export type OwnerVideoLookRange = z.infer<typeof ownerVideoLookRangeSchema>;
export const ownerVideoLooksSchema = z
  .array(ownerVideoLookRangeSchema)
  .max(OWNER_VIDEO_LOOK_RANGE_LIMIT)
  .refine(
    (ranges) =>
      ranges.every(
        (range, index) =>
          index === 0 || ranges[index - 1]!.endFrame <= range.startFrame,
      ),
    { message: "Keep filter ranges ordered and separate." },
  );
type Window = { startFrame: number; endFrame: number };
export type OwnerVideoLookContent = {
  videoLook?: OwnerVideoLook | undefined;
  videoLooks?: OwnerVideoLookRange[] | undefined;
};
export function ownerVideoLooksFit(
  ranges: readonly OwnerVideoLookRange[],
  window: Window,
) {
  return ranges.every(
    (range) =>
      range.startFrame >= window.startFrame &&
      range.endFrame <= window.endFrame,
  );
}
export function ownerVideoLookAt(
  content: OwnerVideoLookContent,
  frame: number,
) {
  const range = content.videoLooks?.find(
    (range) => range.startFrame <= frame && frame < range.endFrame,
  );
  return range
    ? { preset: range.preset, strength: range.strength }
    : content.videoLook;
}
export function clipOwnerVideoLooks(
  ranges: readonly OwnerVideoLookRange[],
  window: Window,
): OwnerVideoLookRange[] {
  return ranges.flatMap((range) => {
    const startFrame = Math.max(range.startFrame, window.startFrame),
      endFrame = Math.min(range.endFrame, window.endFrame);
    return startFrame < endFrame ? [{ ...range, startFrame, endFrame }] : [];
  });
}
/** Subtract coverage without stacking filters or changing surviving styles. */
export function subtractOwnerVideoLookWindow(
  ranges: readonly OwnerVideoLookRange[],
  window: Window,
): OwnerVideoLookRange[] {
  return ranges.flatMap((range) => {
    if (
      range.endFrame <= window.startFrame ||
      range.startFrame >= window.endFrame
    )
      return [range];
    return [
      ...(range.startFrame < window.startFrame
        ? [{ ...range, endFrame: window.startFrame }]
        : []),
      ...(range.endFrame > window.endFrame
        ? [{ ...range, startFrame: window.endFrame }]
        : []),
    ];
  });
}
/** Current is removed first, so moving a range restores its legacy fallback. */
export function replaceOwnerVideoLookRange(
  ranges: readonly OwnerVideoLookRange[],
  current: Window | undefined,
  value: OwnerVideoLookRange,
): OwnerVideoLookRange[] {
  const next = ownerVideoLookRangeSchema.parse(value),
    retained = ranges.filter(
      (range) =>
        !current ||
        !Object.is(range.startFrame, current.startFrame) ||
        !Object.is(range.endFrame, current.endFrame),
    );
  return ownerVideoLooksSchema.parse(
    [...subtractOwnerVideoLookWindow(retained, next), next].sort(
      (a, b) => a.startFrame - b.startFrame,
    ),
  );
}
/** Complete, non-overlapping coverage for native branches and legacy fallback. */
export function ownerVideoLookSegments(
  content: OwnerVideoLookContent,
  window: Window,
): OwnerVideoLookRange[] {
  const fallback = content.videoLook ?? {
      preset: "original" as const,
      strength: 100,
    },
    ranges = clipOwnerVideoLooks(content.videoLooks ?? [], window),
    result: OwnerVideoLookRange[] = [];
  let at = window.startFrame;
  for (const range of ranges) {
    if (at < range.startFrame)
      result.push({ ...fallback, startFrame: at, endFrame: range.startFrame });
    result.push(range);
    at = range.endFrame;
  }
  if (at < window.endFrame)
    result.push({ ...fallback, startFrame: at, endFrame: window.endFrame });
  return result;
}
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
