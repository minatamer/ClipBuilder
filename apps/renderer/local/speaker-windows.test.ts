import { expect, it } from "vitest";
import {
  LOCAL_SPEAKER_WINDOWS,
  clusterSpeakerWindows,
  speakerWindowTurns,
  refineSpeakerBoundaries,
  type SpeakerWindow,
} from "./speaker-windows.ts";
import { assignLocalSpeakers } from "./speaker-turns.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";

const voices = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const windows = (labels: number[]): SpeakerWindow[] =>
  labels.map((label, index) => ({
    start: index * 0.75,
    end: index * 0.75 + 1.5,
    embedding: voices[label]!,
  }));

it("discovers one, two and three voices and preserves a returning voice without a requested count", () => {
  for (const labels of [
    [0, 0, 0],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 2, 2, 0, 0],
  ])
    expect(clusterSpeakerWindows(windows(labels))).toEqual(labels);
  expect(clusterSpeakerWindows(windows([2, 2, 0, 0, 2, 2]))).toEqual([
    0, 0, 1, 1, 0, 0,
  ]);
});
it("keeps an isolated transition neutral rather than inventing a voice", () => {
  expect(clusterSpeakerWindows(windows([0, 0, 1, 2, 2]))).toEqual([
    0,
    0,
    null,
    1,
    1,
  ]);
  expect(clusterSpeakerWindows(windows([0]))).toEqual([0]);
  expect(clusterSpeakerWindows(windows([0, 1]))).toEqual([null, null]);
});
it("normalizes magnitude and averages complete clusters rather than linking through a noisy bridge", () => {
  const data = windows([0, 0, 1, 1]);
  data[0]!.embedding = [10, 0, 0];
  data[1]!.embedding = [0.99, 0.02, 0];
  expect(clusterSpeakerWindows(data)).toEqual([0, 0, 1, 1]);
});
it("maps overlapping centers once, preserves unknown gaps and never extends through silence", () => {
  const data = windows([0, 0, 0, 1, 1, 1]);
  const turns = speakerWindowTurns(data);
  expect(turns).toEqual([
    { start: 0, end: 2.625, speaker: 0 },
    { start: 2.625, end: 5.25, speaker: 1 },
  ]);
  const separated = windows([0, 0, 0, 0]);
  separated[2] = { ...separated[2]!, start: 10, end: 11.5 };
  separated[3] = { ...separated[3]!, start: 10.75, end: 12.25 };
  expect(speakerWindowTurns(separated)).toEqual([
    { start: 0, end: 2.25, speaker: 0 },
    { start: 10, end: 12.25, speaker: 0 },
  ]);
  expect(speakerWindowTurns(windows([0, 0, 1, 2, 2]))).toHaveLength(2);
});
it("carries a short opening speaker into unchanged word IDs and clocks", () => {
  const turns = speakerWindowTurns(windows([0, 0, 0, 1, 1, 1]));
  const original = [
    {
      id: "w_000001",
      text: "Synthetic",
      punctuatedText: "Synthetic",
      startMs: 2400,
      endMs: 2600,
      speakerId: null,
      confidence: null,
    },
    {
      id: "w_000002",
      text: "Reply",
      punctuatedText: "Reply",
      startMs: 2900,
      endMs: 3400,
      speakerId: null,
      confidence: null,
    },
  ];
  const result = assignLocalSpeakers(
    original,
    turns
      .map(
        (t) =>
          `${t.start.toFixed(3)} -- ${t.end.toFixed(3)} speaker_${t.speaker}`,
      )
      .join("\n"),
    5250,
  );
  expect(result.map((w) => w.speakerId)).toEqual(["spk_0", "spk_1"]);
  expect(result.map((w) => ({ ...w, speakerId: null }))).toEqual(original);
});
it("bounds dimensions, work, clocks and non-finite model replies", () => {
  expect(clusterSpeakerWindows([])).toEqual([]);
  const invalid = [
    { ...windows([0])[0]!, embedding: [0, 0] },
    { ...windows([0])[0]!, embedding: [NaN, 1] },
    { ...windows([0])[0]!, start: -1 },
    { ...windows([0])[0]!, end: OWNER_LIMITS.clipMs / 1000 + 1 },
  ];
  for (const row of invalid)
    expect(() => clusterSpeakerWindows([row])).toThrow("codex_input_invalid");
  expect(() =>
    clusterSpeakerWindows(
      Array.from(
        { length: LOCAL_SPEAKER_WINDOWS.maximumWindows + 1 },
        () => windows([0])[0]!,
      ),
    ),
  ).toThrow("codex_input_invalid");
  expect(() =>
    clusterSpeakerWindows([
      windows([0])[0]!,
      { ...windows([0])[0]!, start: 1, embedding: [1, 0] },
    ]),
  ).toThrow("codex_input_invalid");
});

it("refines a coarse change only toward a measured quiet gap within half a step", () => {
  const samples = new Float32Array(4 * 16000).fill(0.1);
  samples.fill(0, Math.round(2.02 * 16000), Math.round(2.15 * 16000));
  const turns = [
    { start: 0, end: 1.875, speaker: 0 },
    { start: 1.875, end: 4, speaker: 1 },
  ];
  const actual = refineSpeakerBoundaries(turns, samples);
  expect(actual[0]!.end).toBeGreaterThan(2.02);
  expect(actual[0]!.end).toBeLessThan(2.15);
  expect(actual[1]!.start).toBe(actual[0]!.end);
  expect(Math.abs(actual[0]!.end - turns[0]!.end)).toBeLessThanOrEqual(0.375);
  expect(turns[0]!.end).toBe(1.875);
  samples.fill(0.1);
  expect(refineSpeakerBoundaries(turns, samples)).toEqual(turns);
  const gap = [
    { start: 0, end: 1.5, speaker: 0 },
    { start: 2, end: 4, speaker: 1 },
  ];
  expect(refineSpeakerBoundaries(gap, samples)).toEqual(gap);
});
