import { expect, it } from "vitest";
import {
  ownerVideoLooksSchema,
  ownerVideoLooksFit,
  ownerVideoLookAt,
  replaceOwnerVideoLookRange,
  ownerVideoLookSegments,
  clipOwnerVideoLooks,
  type OwnerVideoLookRange,
} from "./video-look.ts";

const warm = { preset: "warm" as const, strength: 60 },
  mono = { preset: "mono" as const, strength: 100 };
const range = (startFrame: number, endFrame: number): OwnerVideoLookRange => ({
  ...warm,
  startFrame,
  endFrame,
});

it("rejects invalid, overlapping and over-budget timed looks before rendering", () => {
  for (const ranges of [
    [range(0, 0)],
    [range(-1, 30)],
    [range(0.5, 30)],
    [range(0, Infinity)],
    [range(0, 40), range(30, 60)],
    [range(30, 60), range(0, 20)],
    [{ ...range(0, 30), css: "url(anything)" }],
    Array.from({ length: 33 }, (_, i) => range(i, i + 1)),
  ])
    expect(ownerVideoLooksSchema.safeParse(ranges).success).toBe(false);
  expect(
    ownerVideoLooksSchema.parse([range(0, 30), range(30, 60)]),
  ).toHaveLength(2);
  expect(
    ownerVideoLooksFit([range(30, 60)], { startFrame: 30, endFrame: 60 }),
  ).toBe(true);
  expect(
    ownerVideoLooksFit([range(29, 60)], { startFrame: 30, endFrame: 60 }),
  ).toBe(false);
  expect(
    ownerVideoLooksFit([range(30, 61)], { startFrame: 30, endFrame: 60 }),
  ).toBe(false);
});

it("replaces only new coverage, preserves both remainders and restores fallback when moved", () => {
  const original = [range(0, 100)],
    copy = structuredClone(original);
  const inserted = replaceOwnerVideoLookRange(original, undefined, {
    ...mono,
    startFrame: 30,
    endFrame: 60,
  });
  expect(inserted).toEqual([
    range(0, 30),
    { ...mono, startFrame: 30, endFrame: 60 },
    range(60, 100),
  ]);
  const moved = replaceOwnerVideoLookRange(inserted, inserted[1], {
    ...mono,
    startFrame: 50,
    endFrame: 80,
  });
  expect(moved).toEqual([
    range(0, 30),
    { ...mono, startFrame: 50, endFrame: 80 },
    range(80, 100),
  ]);
  expect(ownerVideoLookAt({ videoLooks: moved }, 40)).toBeUndefined();
  expect(original).toEqual(copy);
});

it("uses half-open ranges, explicit Original and the legacy fallback without stacking", () => {
  const content = {
    videoLook: warm,
    videoLooks: [
      { ...mono, startFrame: 30, endFrame: 60 },
      {
        preset: "original" as const,
        strength: 100,
        startFrame: 60,
        endFrame: 90,
      },
    ],
  };
  expect(ownerVideoLookAt(content, 29)).toEqual(warm);
  expect(ownerVideoLookAt(content, 30)).toEqual(mono);
  expect(ownerVideoLookAt(content, 59)).toEqual(mono);
  expect(ownerVideoLookAt(content, 60)).toEqual({
    preset: "original",
    strength: 100,
  });
  expect(ownerVideoLookAt(content, 90)).toEqual(warm);
  expect(
    ownerVideoLookSegments(content, { startFrame: 20, endFrame: 100 }),
  ).toEqual([
    range(20, 30),
    { ...mono, startFrame: 30, endFrame: 60 },
    { preset: "original", strength: 100, startFrame: 60, endFrame: 90 },
    range(90, 100),
  ]);
  expect(
    clipOwnerVideoLooks(content.videoLooks, { startFrame: 40, endFrame: 70 }),
  ).toEqual([
    { ...mono, startFrame: 40, endFrame: 60 },
    { preset: "original", strength: 100, startFrame: 60, endFrame: 70 },
  ]);
});

it("rejects a split above the fixed range budget without mutating the acknowledged array", () => {
  const original = Array.from({ length: 32 }, (_, i) =>
      range(i * 10, i * 10 + 10),
    ),
    copy = structuredClone(original);
  expect(() =>
    replaceOwnerVideoLookRange(original, undefined, {
      ...mono,
      startFrame: 2,
      endFrame: 4,
    }),
  ).toThrow();
  expect(original).toEqual(copy);
});
