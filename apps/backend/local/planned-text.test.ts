import { expect, it } from "vitest";
import { decodePlannedText } from "./planned-text.ts";
const words = ["Coral", "reefs", "recover."].map((text, index) => ({
  id: `w_${String(index + 1).padStart(6, "0")}`,
  text,
  punctuatedText: text,
  startMs: index * 400,
  endMs: index * 400 + 350,
  speakerId: "spk_0",
  confidence: null,
}));
it("makes editable source text with bounded clocks and ignores malformed optional data", () => {
  const result = decodePlannedText(
    {
      texts: [
        {
          startFrame: 2,
          endFrame: 100,
          wordIds: ["w_000003", "w_000001", "w_000002", "w_000001"],
        },
        { startFrame: 0, endFrame: 20, wordIds: ["w_999999"] },
        { startFrame: "bad" },
      ],
    },
    words,
    60,
  );
  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({
    text: "Coral reefs recover.",
    startFrame: 2,
    endFrame: 60,
    style: { preset: "tiktok" },
  });
  expect(decodePlannedText({}, words, 60)).toEqual([]);
});
