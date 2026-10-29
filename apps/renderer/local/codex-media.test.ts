import { expect, it } from "vitest";
import { parseLocalSpeech } from "./codex-media.ts";
it("normalizes bounded offline word clocks to stable IDs without inventing diarization", () => {
  const value = {
    transcription: [
      { text: "Synthetic caption.", offsets: { from: 100, to: 1000 } },
      { text: " Next", offsets: { from: 1000, to: 2500 } },
      { text: "", offsets: { from: 3000, to: 3000 } },
    ],
  };
  const words = parseLocalSpeech(value, 2000);
  expect(
    words.map(({ id, startMs, endMs, speakerId }) => ({
      id,
      startMs,
      endMs,
      speakerId,
    })),
  ).toEqual([
    { id: "w_000001", startMs: 100, endMs: 550, speakerId: null },
    { id: "w_000002", startMs: 550, endMs: 1000, speakerId: null },
    { id: "w_000003", startMs: 1000, endMs: 2000, speakerId: null },
  ]);
  expect(words.map((word) => word.punctuatedText)).toEqual([
    "Synthetic",
    "caption.",
    "Next",
  ]);
  expect(words.every((word) => word.confidence === null)).toBe(true);
  expect(() =>
    parseLocalSpeech(
      { transcription: [{ text: "bad", offsets: { from: NaN, to: 1 } }] },
      2000,
    ),
  ).toThrow();
});
