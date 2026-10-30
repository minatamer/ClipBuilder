import { expect, it, vi } from "vitest";
import { decodePlannedText } from "./planned-text.ts";
import {
  OWNER_TITLE_HOOK_STYLES,
  ownerAuthoredTextPlanSchema,
} from "../../../packages/contracts/local/text-layers.ts";
const words = ["Coral", "reefs", "recover."].map((text, index) => ({
  id: `w_${String(index + 1).padStart(6, "0")}`,
  text,
  punctuatedText: text,
  startMs: index * 400,
  endMs: index * 400 + 350,
  speakerId: "spk_0",
  confidence: null,
}));
it("accepts newly authored headlines in every supported hook style without requiring verbatim copy", () => {
  expect(OWNER_TITLE_HOOK_STYLES.length).toBeGreaterThanOrEqual(7);
  for (const hookStyle of OWNER_TITLE_HOOK_STYLES) {
    const item = {
      title: "POV: Coral reefs get a second chance",
      hookStyle,
      wordIds: [words[0]!.id, words[1]!.id],
      startFrame: 180,
      endFrame: 900,
    };
    expect(ownerAuthoredTextPlanSchema.parse([item])).toEqual([item]);
    expect(decodePlannedText({ texts: [item] }, words, 900)[0]).toMatchObject({
      text: item.title,
      startFrame: 0,
      endFrame: 93,
    });
    expect(decodePlannedText({ texts: [item] }, words, 45)[0]!.endFrame).toBe(
      45,
    );
  }
});

it("keeps usable authored copy when evidence is missing or malformed, recording advisory critique without a paid retry gate", () => {
  const critique = vi.fn();
  const result = decodePlannedText(
    {
      texts: [
        {
          title: "Why this reef can recover",
          hookStyle: "pointed-question",
          wordIds: ["w_999999"],
        },
      ],
    },
    words,
    900,
    critique,
  );
  expect(result[0]!.text).toBe("Why this reef can recover");
  expect(critique).toHaveBeenCalledOnce();
  const fallback = decodePlannedText(
    {
      texts: [
        {
          title: "x".repeat(81),
          startFrame: 0,
          endFrame: 60,
          wordIds: words.map((word) => word.id),
        },
      ],
    },
    words,
    900,
  );
  expect(fallback[0]!.text).toBe("Coral reefs recover.");
  expect(
    ownerAuthoredTextPlanSchema.safeParse([
      {
        title: "x".repeat(81),
        hookStyle: "pov",
        startFrame: 0,
        endFrame: 60,
        wordIds: [words[0]!.id],
      },
    ]).success,
  ).toBe(false);
});
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
    startFrame: 0,
    endFrame: 60,
    style: { preset: "tiktok" },
  });
  expect(decodePlannedText({}, words, 60)).toEqual([]);
});
it("keeps only the first usable optional opening title and sizes its reading time from actual wording", () => {
  const source = Array.from({ length: 12 }, (_, index) => ({
    ...words[0]!,
    id: `w_${String(index + 1).padStart(6, "0")}`,
    text: "word",
    punctuatedText: "word",
  }));
  const cue = (ids: string[]) => ({
    startFrame: 180,
    endFrame: 600,
    wordIds: ids,
  });
  const short = decodePlannedText(
    { texts: [cue([source[0]!.id])] },
    source,
    900,
  );
  const long = decodePlannedText(
    {
      texts: [
        cue(["w_999999"]),
        cue(source.map((word) => word.id)),
        cue([source[0]!.id]),
      ],
    },
    source,
    900,
  );
  expect(short[0]).toMatchObject({ startFrame: 0, endFrame: 60, text: "word" });
  expect(long).toHaveLength(1);
  expect(long[0]).toMatchObject({
    startFrame: 0,
    endFrame: 143,
    text: source.map(() => "word").join(" "),
  });
  expect(
    decodePlannedText(
      { texts: [cue(source.map((word) => word.id))] },
      source,
      45,
    )[0]!.endFrame,
  ).toBe(45);
});
it("counts long or unspaced wording for reading time without exceeding eight seconds", () => {
  const source = [
    {
      ...words[0]!,
      text: "Synthetic".repeat(15),
      punctuatedText: "Synthetic".repeat(15),
    },
  ];
  const result = decodePlannedText(
    { texts: [{ startFrame: 90, endFrame: 120, wordIds: [source[0]!.id] }] },
    source,
    900,
  );
  expect(result[0]).toMatchObject({ startFrame: 0, endFrame: 240 });
});
