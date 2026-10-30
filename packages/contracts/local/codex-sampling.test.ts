import { expect, it } from "vitest";
import {
  codexSpeakerChangeFrames,
  planCodexFrameSamples,
} from "./codex-sampling.ts";

it.each([
  [1, 1],
  [29, 1],
  [30, 1],
  [59, 1],
  [60, 2],
  [299, 9],
  [1800, 60],
  [9000, 60],
])(
  "preserves the existing image count and in-cut chronology for %s frames",
  (frames, count) => {
    const samples = planCodexFrameSamples(frames);
    expect(samples).toHaveLength(count);
    expect(samples[0]).toBe(0);
    expect(samples.every((frame) => frame >= 0 && frame < frames)).toBe(true);
    expect(samples).toEqual([...new Set(samples)].sort((a, b) => a - b));
  },
);
it("keeps the legacy uniform grid when labels or changes are absent", () => {
  expect(planCodexFrameSamples(300)).toEqual([
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270,
  ]);
  expect(
    codexSpeakerChangeFrames(
      [
        { startMs: 0, endMs: 400, speakerId: "spk_0" },
        { startMs: 500, endMs: 900, speakerId: "spk_0" },
      ],
      300,
    ),
  ).toEqual([]);
});
it("places off-grid changes at the middle panel without adding image slots", () => {
  const samples = planCodexFrameSamples(600, [17, 173, 590]);
  expect(samples).toHaveLength(20);
  expect(samples).toEqual(expect.arrayContaining([0, 11, 167, 584]));
  expect(
    Math.max(
      ...samples.slice(1).map((frame, index) => frame - samples[index]!),
    ),
  ).toBeLessThanOrEqual(36);
});
it("retains uniform coverage and spreads targeted slots under dense changes", () => {
  const samples = planCodexFrameSamples(
    9000,
    Array.from({ length: 500 }, (_, i) => i * 17 + 1),
  );
  expect(samples).toHaveLength(60);
  expect(samples[0]).toBe(0);
  expect(samples.at(-1)).toBeGreaterThanOrEqual(8700);
  expect(samples).toEqual([...new Set(samples)].sort((a, b) => a - b));
  expect(
    Math.max(
      ...samples.slice(1).map((frame, index) => frame - samples[index]!),
    ),
  ).toBeLessThanOrEqual(300);
});
it("refills opening collisions and handles cut-end and sub-second bursts", () => {
  expect(planCodexFrameSamples(60, [1, 1, 0, 60, -1])).toEqual([0, 30]);
  expect(planCodexFrameSamples(60, [59])).toEqual([0, 53]);
  expect(planCodexFrameSamples(2, [1])).toEqual([0]);
});
it.each([0, -1, 1.5, NaN, 9001])(
  "rejects invalid frame counts: %s",
  (frames) => {
    expect(() => planCodexFrameSamples(frames)).toThrow("codex_input_invalid");
  },
);
it("derives sorted clip-relative hints from ordered words without changing them", () => {
  const words = [
    { startMs: 4000, endMs: 4500, speakerId: "spk_0" },
    { startMs: 2300, endMs: 3000, speakerId: "spk_1" },
    { startMs: 0, endMs: 900, speakerId: "spk_0" },
    { startMs: 1000, endMs: 1900, speakerId: "spk_0" },
  ];
  const original = structuredClone(words);
  expect(codexSpeakerChangeFrames(words, 150)).toEqual([69, 120]);
  expect(words).toEqual(original);
});
it("does not invent changes through unknown or overlapping words", () => {
  expect(
    codexSpeakerChangeFrames(
      [
        { startMs: 0, endMs: 900, speakerId: "spk_0" },
        { startMs: 1000, endMs: 1500, speakerId: null },
        { startMs: 2000, endMs: 3000, speakerId: "spk_1" },
        { startMs: 2600, endMs: 3300, speakerId: "spk_0" },
        { startMs: 3500, endMs: 3900, speakerId: "spk_0" },
        { startMs: 4000, endMs: 4500, speakerId: "spk_1" },
      ],
      150,
    ),
  ).toEqual([120]);
});
it("bounds excess speaker hints across the whole clip instead of keeping only early changes", () => {
  const words = Array.from({ length: 200 }, (_, index) => ({
    startMs: index * 1000,
    endMs: index * 1000 + 800,
    speakerId: `spk_${index % 2}`,
  }));
  const changes = codexSpeakerChangeFrames(words, 6000);
  expect(changes).toHaveLength(60);
  expect(changes[0]).toBe(30);
  expect(changes.at(-1)).toBe(5970);
  expect(changes).toEqual([...new Set(changes)].sort((a, b) => a - b));
});
it("keeps nested overlap neutral until the longest overlapping word ends", () => {
  expect(
    codexSpeakerChangeFrames(
      [
        { startMs: 0, endMs: 4000, speakerId: "spk_0" },
        { startMs: 1000, endMs: 1500, speakerId: "spk_1" },
        { startMs: 2000, endMs: 2500, speakerId: "spk_2" },
        { startMs: 2600, endMs: 2700, speakerId: "spk_0" },
        { startMs: 4500, endMs: 4800, speakerId: "spk_1" },
        { startMs: 5000, endMs: 5500, speakerId: "spk_0" },
      ],
      180,
    ),
  ).toEqual([150]);
});
