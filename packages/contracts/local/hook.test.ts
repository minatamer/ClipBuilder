import { expect, it } from "vitest";
import {
  ownerHookSchema,
  ownerHookCaption,
  ownerPresentationFrame,
  ownerPresentationFrames,
  ownerSourceFrame,
  decodeOwnerHookSuggestion,
} from "./hook.ts";
import { ownerOverlaySchema } from "./clips.ts";
it("fits optional AI advice to physical Hook bounds without rejecting usable plans", () => {
  expect(
    decodeOwnerHookSuggestion({ startFrame: 30.4, endFrame: 600 }, 120),
  ).toEqual({ startFrame: 30, endFrame: 120 });
  expect(
    decodeOwnerHookSuggestion({ startFrame: -2, endFrame: 900 }, 1000),
  ).toEqual({ startFrame: 0, endFrame: 300 });
  expect(decodeOwnerHookSuggestion({ startFrame: 0, endFrame: 1 }, 1)).toEqual({
    startFrame: 0,
    endFrame: 1,
  });
  for (const value of [
    null,
    undefined,
    {},
    { startFrame: 40, endFrame: 30 },
    { startFrame: 120, endFrame: 150 },
    { startFrame: NaN, endFrame: 10 },
    { startFrame: 0, endFrame: Infinity },
  ])
    expect(decodeOwnerHookSuggestion(value, 120)).toBeUndefined();
});
it("bounds a single source-contained hook and maps prefix and complete body without changing source clocks", () => {
  const overlay = {
    version: 1 as const,
    frames: 90,
    captions: [],
    visuals: [],
    hook: { startFrame: 30, endFrame: 60 },
  };
  expect(ownerPresentationFrames(overlay)).toBe(120);
  expect([0, 29, 30, 119].map((f) => ownerSourceFrame(overlay, f))).toEqual([
    30, 59, 0, 89,
  ]);
  expect(ownerPresentationFrame(overlay, 45)).toBe(75);
  expect(ownerSourceFrame({}, 5)).toBe(5);
  expect(
    ownerHookSchema.safeParse({ startFrame: 0, endFrame: 1 }).success,
  ).toBe(true);
  for (const hook of [
    { startFrame: 0, endFrame: 301 },
    { startFrame: 5, endFrame: 5 },
    { startFrame: -1, endFrame: 3 },
    { startFrame: 0.5, endFrame: 4 },
    { startFrame: 0, endFrame: Infinity },
  ])
    expect(ownerHookSchema.safeParse(hook).success).toBe(false);
  expect(
    ownerOverlaySchema.safeParse({
      ...overlay,
      hook: { startFrame: 80, endFrame: 91 },
    }).success,
  ).toBe(false);
});
it("trims hook words at partial boundaries, retaining original IDs and line partition, while leaving normal captions intact", () => {
  const caption = {
    startMs: 0,
    endMs: 2000,
    text: "one two three four",
    lines: ["one two", "three four"],
    wordIds: ["w_000001", "w_000002", "w_000003", "w_000004"],
    wordCues: ["one", "two", "three", "four"].map((text, i) => ({
      wordId: `w_00000${i + 1}`,
      text,
      startMs: i * 500,
      endMs: (i + 1) * 500,
    })),
  };
  const copy = JSON.stringify(caption);
  const clipped = ownerHookCaption(caption, { startFrame: 24, endFrame: 36 })!;
  expect(clipped.lines).toEqual(["two", "three"]);
  expect(clipped.wordCues).toEqual([
    { wordId: "w_000002", text: "two", startMs: 800, endMs: 1000 },
    { wordId: "w_000003", text: "three", startMs: 1000, endMs: 1200 },
  ]);
  expect(
    ownerHookCaption(caption, { startFrame: 60, endFrame: 61 }),
  ).toBeUndefined();
  expect(JSON.stringify(caption)).toBe(copy);
});
