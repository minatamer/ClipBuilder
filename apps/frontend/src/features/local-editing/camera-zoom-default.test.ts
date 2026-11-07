import { expect, it } from "vitest";
import { defaultOwnerFocus } from "../../../../../packages/contracts/local/focus.ts";
import {
  ownerCameraEffectEnd,
  ownerCameraEffectsFit,
  ownerCameraEffectsSchema,
} from "../../../../../packages/contracts/local/camera-motion.ts";
import { defaultCameraZoom } from "./camera-zoom-default.ts";

function fixture() {
  const focus = defaultOwnerFocus({ width: 640, height: 360 }, 300);
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 90, centerX: 0.25 },
    { ...focus.shots[0]!, startFrame: 90, endFrame: 210, centerX: 0.75 },
    { ...focus.shots[0]!, startFrame: 210, endFrame: 300, centerX: 0.25 },
  ];
  return focus;
}
const hook = { startFrame: 60, endFrame: 240 };
it("gradually reaches 1.5x at its selected position's end without changing camera data", () => {
  const focus = fixture(),
    original = structuredClone(focus);
  for (const [positionIndex, frame, end] of [
    [0, 29, 90],
    [1, 100, 210],
    [2, 220, 300],
  ] as const) {
    const result = defaultCameraZoom({
      focus,
      hook: undefined,
      frame,
      positionIndex,
    });
    expect("effect" in result).toBe(true);
    if (!("effect" in result)) throw new Error("missing_default");
    const effect = { id: crypto.randomUUID(), ...result.effect };
    expect(effect.startFrame).toBe(frame);
    expect(effect.zoomFrames).toBe(end - frame);
    expect(effect.returnFrames).toBe(0);
    expect(effect.holdFrames).toBe(0);
    expect(effect.target.zoom).toBe(1.5);
    expect(effect.target.centerX).toBe(focus.shots[positionIndex]!.centerX);
    expect(ownerCameraEffectEnd(effect)).toBe(end);
    expect(ownerCameraEffectsSchema.safeParse([effect]).success).toBe(true);
    expect(ownerCameraEffectsFit([effect], { frames: focus.frames })).toBe(
      true,
    );
  }
  expect(focus).toEqual(original);
});
it("maps the selected Hook slice and body once, clipping at the occurrence tail", () => {
  const focus = fixture();
  for (const [positionIndex, frame, occurrence, startFrame, end] of [
    [0, 0, "hook", 0, 30],
    [1, 40, "hook", 40, 150],
    [2, 150, "hook", 150, 180],
    [0, 180, "body", 0, 90],
    [2, 400, "body", 220, 300],
  ] as const) {
    const result = defaultCameraZoom({ focus, hook, frame, positionIndex });
    if (!("effect" in result)) throw new Error("missing_default");
    const effect = { id: crypto.randomUUID(), ...result.effect };
    expect(effect.occurrence).toBe(occurrence);
    expect(effect.startFrame).toBe(startFrame);
    expect(ownerCameraEffectEnd(effect)).toBe(end);
    expect(
      ownerCameraEffectsFit([effect], { frames: focus.frames, hook }),
    ).toBe(true);
  }
});
it("uses the actual position at the playhead when no selection was supplied", () => {
  const result = defaultCameraZoom({ focus: fixture(), hook, frame: 40 });
  expect(result).toMatchObject({ effect: { target: { centerX: 0.75 } } });
});
it("uses the whole short interval, requiring two frames for a gradual change", () => {
  const focus = fixture();
  expect(
    defaultCameraZoom({ focus, hook: undefined, frame: 70, positionIndex: 0 }),
  ).toMatchObject({
    effect: { startFrame: 70, zoomFrames: 20, holdFrames: 0, returnFrames: 0 },
  });
  expect(
    defaultCameraZoom({ focus, hook: undefined, frame: 88, positionIndex: 0 }),
  ).toMatchObject({
    effect: { zoomFrames: 2, holdFrames: 0 },
  });
  expect(
    defaultCameraZoom({ focus, hook: undefined, frame: 89, positionIndex: 0 }),
  ).toEqual({ error: "duration" });
});
it("defaults to an absolute 1.5x target even if the camera's initial zoom differs", () => {
  const focus = fixture();
  focus.shots[0]!.zoom = 1.2;
  expect(
    defaultCameraZoom({ focus, hook: undefined, frame: 0, positionIndex: 0 }),
  ).toMatchObject({ effect: { target: { zoom: 1.5 } } });
});
it("rejects an out-of-selection playhead even for repeated identical people/positions", () => {
  const focus = fixture();
  for (const frame of [90, 100, 220])
    expect(
      defaultCameraZoom({ focus, hook: undefined, frame, positionIndex: 0 }),
    ).toEqual({ error: "position" });
  for (const frame of [-1, 300, NaN, Infinity, 1.5])
    expect(defaultCameraZoom({ focus, hook: undefined, frame })).toEqual({
      error: "position",
    });
  for (const positionIndex of [-1, 3, 0.5])
    expect(
      defaultCameraZoom({ focus, hook: undefined, frame: 0, positionIndex }),
    ).toEqual({ error: "position" });
});
