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
  ownerCameraEffectEnd,
  type OwnerCameraEffect,
} from "./camera-motion.ts";
import { ownerOverlaySchema, ownerClipBaseSchema } from "./clips.ts";
import { OWNER_FPS, OWNER_LIMITS } from "./policy.ts";
const effect: OwnerCameraEffect = {
  id: "11111111-1111-4111-8111-111111111111",
  occurrence: "body",
  startFrame: 3,
  zoomFrames: 12,
  holdFrames: 9,
  returnFrames: 12,
  target: { centerX: 0.7, centerY: 0.4, zoom: 2.4 },
};
it("holds the target until the actual camera cut, including legacy implicit-return documents", () => {
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
    expect(at(30)[key]).toBeCloseTo(baseline[key], 10);
  expect(at(29)).toEqual(target);
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
    { ...effect, holdFrames: -1 },
    { ...effect, holdFrames: 1.5 },
    { ...effect, holdFrames: Infinity },
    { ...effect, returnFrames: 1 },
    { ...effect, holdFrames: (OWNER_LIMITS.clipMs * OWNER_FPS) / 1000 + 1 },
  ])
    expect(ownerCameraEffectsSchema.safeParse([invalid]).success).toBe(false);
  expect(ownerCameraEffectsFit([effect], { frames: 36 })).toBe(true);
  expect(ownerCameraEffectsFit([effect], { frames: 35 })).toBe(false);
  expect(
    ownerCameraEffectsFit([{ ...effect, occurrence: "hook" }], { frames: 60 }),
  ).toBe(false);
  expect(
    ownerCameraEffectsFit([{ ...effect, occurrence: "hook" }], {
      frames: 60,
      hook: { startFrame: 15, endFrame: 51 },
    }),
  ).toBe(true);
});
it("retains legacy holds and renders variable holds through the exact occurrence boundary", () => {
  const focus = defaultOwnerFocus({ width: 1920, height: 1080 }, 90);
  for (const holdFrames of [0, 9, 63]) {
    const next = { ...effect, holdFrames };
    expect(ownerCameraEffectsSchema.parse([next])).toEqual([next]);
    const end = ownerCameraEffectEnd(next);
    expect(ownerCameraEffectsFit([next], { frames: end })).toBe(true);
    expect(ownerCameraEffectsFit([next], { frames: end - 1 })).toBe(false);
    expect(ownerCameraCropAt(focus, [next], 15, "body", 15)).toEqual(
      ownerCameraTargetCrop(focus, next.target),
    );
    expect(ownerCameraCropAt(focus, [next], end, "body", end)).toEqual(
      end < focus.frames
        ? ownerCameraTargetCrop(focus, next.target)
        : ownerFocusCrop(focus, ownerFocusAt(focus, end)),
    );
  }
});
it("holds an early arrival through every remaining frame and separates repeated camera rows", () => {
  const focus = defaultOwnerFocus({ width: 640, height: 360 }, 120);
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 60 },
    { ...focus.shots[0]!, startFrame: 60, endFrame: 120 },
  ];
  for (const returnFrames of [0, 12] as const) {
    const early = {
      ...effect,
      startFrame: 3,
      zoomFrames: 9,
      holdFrames: 0,
      returnFrames,
      target: { ...effect.target, zoom: 1.5 },
    };
    const target = ownerCameraTargetCrop(focus, early.target);
    for (const frame of [12, 24, 40, 59, 59.99])
      expect(ownerCameraCropAt(focus, [early], frame, "body", frame)).toEqual(
        target,
      );
    expect(ownerCameraCropAt(focus, [early], 60, "body", 60)).toEqual(
      ownerFocusCrop(focus, focus.shots[1]!),
    );
    const hook = { ...early, occurrence: "hook" as const, startFrame: 0 };
    for (const local of [9, 20, 29])
      expect(
        ownerCameraCropAt(focus, [hook], 30 + local, "hook", local),
      ).toEqual(target);
    expect(ownerCameraCropAt(focus, [hook], 60, "hook", 30)).toEqual(
      ownerFocusCrop(focus, focus.shots[1]!),
    );
  }
});
it("hands off to later Zoom and Motion without reviving old held targets", () => {
  const focus = defaultOwnerFocus({ width: 640, height: 360 }, 120);
  const first = {
    ...effect,
    startFrame: 0,
    zoomFrames: 10,
    holdFrames: 0,
    returnFrames: 0 as const,
  };
  const next = {
    ...first,
    id: crypto.randomUUID(),
    startFrame: 30,
    target: { ...first.target, zoom: 3 },
  };
  expect(ownerCameraCropAt(focus, [first, next], 30, "body", 30)).toEqual(
    ownerCameraTargetCrop(focus, first.target),
  );
  expect(ownerCameraCropAt(focus, [next, first], 39, "body", 39)).toEqual(
    ownerCameraTargetCrop(focus, next.target),
  );
  const track = {
    id: crypto.randomUUID(),
    occurrence: "body" as const,
    startFrame: 50,
    endFrame: 70,
    sourceStartFrame: 50,
    personId: null,
    focusKey: "f".repeat(64),
    seed: { x: 0.2, y: 0.2, width: 0.1, height: 0.1 },
    outcome: "complete" as const,
    points: [
      { frame: 0, x: 0.25, y: 0.25 },
      { frame: 19, x: 0.3, y: 0.25 },
    ],
  };
  for (const at of [50, 60, 70, 90])
    expect(
      ownerCameraCropAt(focus, [first, next], at, "body", at, [track]),
    ).toEqual(ownerCameraCropAt(focus, [], at, "body", at, [track]));
});
it("gradually reaches the exact target on the last visible frame and resets only for the next position", () => {
  const focus = defaultOwnerFocus({ width: 1920, height: 1080 }, 90);
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 60 },
    { ...focus.shots[0]!, startFrame: 60, endFrame: 90, centerX: 0.8 },
  ];
  const gradual = {
    ...effect,
    startFrame: 9,
    zoomFrames: 51,
    holdFrames: 0,
    returnFrames: 0 as const,
    target: { ...effect.target, zoom: 1.5 },
  };
  expect(ownerCameraEffectsSchema.parse([gradual])).toEqual([gradual]);
  const start = ownerFocusCrop(focus, focus.shots[0]!),
    target = ownerCameraTargetCrop(focus, gradual.target);
  expect(ownerCameraCropAt(focus, [gradual], 9, "body", 9)).toEqual(start);
  const half = ownerCameraCropAt(focus, [gradual], 34, "body", 34);
  for (const key of ["x", "y", "width", "height"] as const)
    expect(half[key]).toBeCloseTo((start[key] + target[key]) / 2, 9);
  expect(ownerCameraCropAt(focus, [gradual], 59, "body", 59)).toEqual(target);
  expect(ownerCameraCropAt(focus, [gradual], 60, "body", 60)).toEqual(
    ownerFocusCrop(focus, focus.shots[1]!),
  );
  const hookEffect = {
    ...gradual,
    occurrence: "hook" as const,
    startFrame: 0,
    zoomFrames: 30,
  };
  expect(ownerCameraCropAt(focus, [hookEffect], 59, "hook", 29)).toEqual(
    target,
  );
  expect(
    ownerCameraEffectsFit([hookEffect], {
      frames: 90,
      hook: { startFrame: 30, endFrame: 60 },
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
