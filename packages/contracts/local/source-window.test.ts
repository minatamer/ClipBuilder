import { expect, it } from "vitest";
import {
  ownerAnalysisWindow,
  ownerLocalSourceTime,
  ownerOriginalSourceTime,
  ownerSourceTimestamp,
  ownerSourceWindowSchema,
  ownerWindowFrames,
  parseOwnerSourceTimestamp,
} from "./source-window.ts";
import { ownerMediaJobSchema, ownerSourceSchema } from "./index.ts";

it("keeps long analysis windows separate from output cuts and rounds inwards", () => {
  const source = { durationMs: 7_200_000 };
  expect(
    ownerAnalysisWindow(source, { startMs: 1_800_000, endMs: 3_000_000 }),
  ).toEqual({ startMs: 1_800_000, endMs: 3_000_000 });
  expect(ownerWindowFrames({ startMs: 1001, endMs: 2999 })).toEqual({
    startFrame: 31,
    endFrame: 89,
  });
  for (const window of [
    { startMs: 0, endMs: 0 },
    { startMs: 2000, endMs: 1000 },
    { startMs: -1, endMs: 2000 },
    { startMs: 0, endMs: Infinity },
  ])
    expect(ownerSourceWindowSchema.safeParse(window).success).toBe(false);
  expect(() =>
    ownerAnalysisWindow(source, { startMs: 0, endMs: 7_201_000 }),
  ).toThrow();
});

it("maps an imported section to original time exactly once and excludes keyframe padding", () => {
  const source = ownerSourceSchema.parse({
    fingerprint: "a".repeat(64),
    bytes: 100,
    durationMs: 62_000,
    width: 320,
    height: 180,
    fps: 30,
    origin: { startMs: 1_798_000, durationMs: 7_200_000 },
    availableWindow: { startMs: 2000, endMs: 62_000 },
  });
  expect(ownerAnalysisWindow(source)).toEqual(source.availableWindow);
  expect(ownerOriginalSourceTime(source, 2000)).toBe(1_800_000);
  expect(ownerLocalSourceTime(source, 1_800_000)).toBe(2000);
  expect(() =>
    ownerAnalysisWindow(source, { startMs: 0, endMs: 60_000 }),
  ).toThrow();
  expect(
    ownerSourceSchema.safeParse({
      ...source,
      origin: { startMs: 7_199_000, durationMs: 7_200_000 },
    }).success,
  ).toBe(false);
  expect(
    ownerSourceSchema.safeParse({
      ...source,
      availableWindow: { startMs: 2000, endMs: 63_000 },
    }).success,
  ).toBe(false);
});

it("supports hour-aware precise timestamps without accepting unsafe clocks", () => {
  expect(parseOwnerSourceTimestamp("00:120:00.125")).toBe(7_200_125);
  expect(ownerSourceTimestamp(360_000_125)).toBe("100:00:00.125");
  expect(parseOwnerSourceTimestamp("100:00:00.125")).toBe(360_000_125);
  for (const value of [
    "-1:00:00",
    "NaN",
    "00:00:00.1234",
    "99999999999999999:00:00",
  ])
    expect(() => parseOwnerSourceTimestamp(value)).toThrow();
});

it("permits scoped audio only and requires an isolated proxy identity", () => {
  const job = {
    operation: "prepare-owner-audio",
    workspaceId: crypto.randomUUID(),
    jobId: crypto.randomUUID(),
    fingerprint: "a".repeat(64),
    clipId: crypto.randomUUID(),
    window: { startMs: 1_800_000, endMs: 3_000_000 },
  };
  expect(ownerMediaJobSchema.safeParse(job).success).toBe(true);
  expect(
    ownerMediaJobSchema.safeParse({ ...job, clipId: undefined }).success,
  ).toBe(false);
  expect(
    ownerMediaJobSchema.safeParse({
      ...job,
      cut: { startFrame: 0, endFrame: 300 },
    }).success,
  ).toBe(false);
  expect(
    ownerMediaJobSchema.safeParse({ ...job, operation: "prepare-owner-video" })
      .success,
  ).toBe(false);
});
