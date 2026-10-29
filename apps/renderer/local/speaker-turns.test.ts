import { expect, it } from "vitest";
import { assignLocalSpeakers } from "./speaker-turns.ts";
const words = Array.from({ length: 6 }, (_, index) => ({
  id: `w_${String(index + 1).padStart(6, "0")}`,
  text: "Synthetic",
  punctuatedText: "Synthetic",
  startMs: index * 1000,
  endMs: (index + 1) * 1000,
  speakerId: null,
  confidence: null,
}));
it("aligns stable anonymous audio labels and leaves overlap/unknown words neutral without retiming", () => {
  const actual = assignLocalSpeakers(
    words,
    "Started\n0.000 -- 2.000 speaker_04\n2.000 -- 4.000 speaker_01\n3.000 -- 4.000 speaker_04\n4.000 -- 5.000 speaker_04\nDuration: 6s",
    6000,
  );
  expect(actual.map((word) => word.speakerId)).toEqual([
    "spk_0",
    "spk_0",
    "spk_1",
    null,
    "spk_0",
    null,
  ]);
  expect(actual.map((word) => ({ ...word, speakerId: null }))).toEqual(words);
  expect(
    assignLocalSpeakers(words, "No detected speech", 6000).every(
      (word) => word.speakerId === null,
    ),
  ).toBe(true);
});
it("rejects overlarge output and bounds source-clock segments", () => {
  expect(() =>
    assignLocalSpeakers(words, "x".repeat(1024 ** 2 + 1), 6000),
  ).toThrow("codex_input_invalid");
  expect(
    assignLocalSpeakers(words, "99.000 -- 100.000 speaker_00", 6000).every(
      (word) => word.speakerId === null,
    ),
  ).toBe(true);
});
