import { expect, it } from "vitest";
import {
  defaultOwnerFocus,
  ownerFocusAt,
  ownerFocusCrop,
  ownerSourceContent,
} from "./focus.ts";
import {
  ownerCameraCropAt,
  ownerCameraTargetCrop,
  ownerCameraEffectsSchema,
  ownerCameraEffectsFit,
  type OwnerCameraEffect,
} from "./camera-motion.ts";
import { ownerOverlaySchema, ownerClipBaseSchema } from "./clips.ts";
const effect: OwnerCameraEffect = {
  id: "11111111-1111-4111-8111-111111111111",
  occurrence: "body",
  startFrame: 3,
  zoomFrames: 12,
  holdFrames: 9,
  returnFrames: 12,
  target: { centerX: 0.7, centerY: 0.4, zoom: 2.4 },
};
it("arrives exactly, dwells, and returns to the advancing baseline across a camera cut", () => {
  const focus = defaultOwnerFocus({ width: 1920, height: 1080 }, 60);
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 30, centerX: 0.2 },
    { ...focus.shots[0]!, startFrame: 30, endFrame: 60, centerX: 0.8 },
  ];
  const at = (n: number) => ownerCameraCropAt(focus, [effect], n, "body", n),
    start = ownerFocusCrop(focus, focus.shots[0]!),
    target = ownerCameraTargetCrop(focus, effect.target);
  expect(at(2)).toEqual(start);
  expect(at(3)).toEqual(start);
  for (const key of ["x", "y", "width", "height"] as const)
    expect(at(9)[key]).toBeCloseTo((start[key] + target[key]) / 2, 10);
  expect(at(15)).toEqual(target);
  expect(at(23)).toEqual(target);
  const baseline = ownerFocusCrop(focus, ownerFocusAt(focus, 30));
  for (const key of ["x", "y", "width", "height"] as const)
    expect(at(30)[key]).toBeCloseTo((baseline[key] + target[key]) / 2, 10);
  expect(at(36)).toEqual(baseline);
  expect(at(59)).toEqual(baseline);
  expect(ownerCameraCropAt(focus, [effect], 9, "hook", 9)).toEqual(start);
  const hook = { ...effect, occurrence: "hook" as const };
  expect(ownerCameraCropAt(focus, [hook], 24, "hook", 9)).toEqual(at(9));
  expect(focus.shots[1]!.startFrame).toBe(30);
});
it.each([
  { width: 3840, height: 2160 },
  { width: 2160, height: 3840 },
  { width: 720, height: 720 },
])("keeps smooth 9:16 geometry inside real image bounds: %o", (source) => {
  const focus = defaultOwnerFocus(source, 60),
    bounds = ownerSourceContent(source);
  for (const centerX of [0, 0.5, 1])
    for (const centerY of [0, 0.5, 1])
      for (const zoom of [1, 2.4, 8]) {
        const crop = ownerCameraTargetCrop(focus, { centerX, centerY, zoom });
        expect(crop.width / crop.height).toBeCloseTo(9 / 16, 12);
        expect(crop.x).toBeGreaterThanOrEqual(bounds.x);
        expect(crop.y).toBeGreaterThanOrEqual(bounds.y);
        expect(crop.x + crop.width).toBeLessThanOrEqual(
          bounds.x + bounds.width + 1e-8,
        );
        expect(crop.y + crop.height).toBeLessThanOrEqual(
          bounds.y + bounds.height + 1e-8,
        );
      }
});
it("rejects overlap, duplicate IDs, invalid clocks/targets and end-bound effects independently in each occurrence", () => {
  expect(
    ownerCameraEffectsSchema.safeParse([
      effect,
      { ...effect, id: crypto.randomUUID(), startFrame: 35 },
    ]).success,
  ).toBe(false);
  expect(
    ownerCameraEffectsSchema.safeParse([
      effect,
      { ...effect, id: crypto.randomUUID(), startFrame: 36 },
    ]).success,
  ).toBe(true);
  expect(
    ownerCameraEffectsSchema.safeParse([
      effect,
      { ...effect, id: crypto.randomUUID(), occurrence: "hook" },
    ]).success,
  ).toBe(true);
  expect(ownerCameraEffectsSchema.safeParse([effect, effect]).success).toBe(
    false,
  );
  for (const invalid of [
    { ...effect, startFrame: NaN },
    { ...effect, zoomFrames: 0 },
    { ...effect, target: { ...effect.target, zoom: 9 } },
    { ...effect, holdFrames: 0 },
  ])
    expect(ownerCameraEffectsSchema.safeParse([invalid]).success).toBe(false);
  expect(ownerCameraEffectsFit([effect], { frames: 39 })).toBe(true);
  expect(ownerCameraEffectsFit([effect], { frames: 38 })).toBe(false);
  expect(
    ownerCameraEffectsFit([{ ...effect, occurrence: "hook" }], { frames: 60 }),
  ).toBe(false);
  expect(
    ownerCameraEffectsFit([{ ...effect, occurrence: "hook" }], {
      frames: 60,
      hook: { startFrame: 15, endFrame: 54 },
    }),
  ).toBe(true);
});
it("keeps legacy overlays exact and forbids motion in generated base documents", () => {
  const overlay = { version: 1, frames: 60, captions: [], visuals: [] };
  expect(ownerOverlaySchema.parse(overlay)).toEqual(overlay);
  expect(
    ownerOverlaySchema.safeParse({ ...overlay, cameraEffects: [effect] })
      .success,
  ).toBe(false);
  const withFocus = {
    ...overlay,
    focus: defaultOwnerFocus({ width: 1920, height: 1080 }, 60),
    cameraEffects: [effect],
  };
  expect(ownerOverlaySchema.safeParse(withFocus).success).toBe(true);
  const base = {
    version: 1,
    analysisId: crypto.randomUUID(),
    momentId: crypto.randomUUID(),
    sourceRevision: 0,
    fingerprint: "a".repeat(64),
    processingIdentity: "b".repeat(64),
    cut: { startFrame: 0, endFrame: 60 },
    words: [],
    overlay: withFocus,
  };
  expect(ownerClipBaseSchema.safeParse(base).success).toBe(false);
});
