import { expect, it } from "vitest";
import { correctedOwnerCaptions } from "./caption-text.ts";
import { ownerEditOperationSchema } from "./editor.ts";
const captions = [
  {
    startMs: 100,
    endMs: 600,
    text: "Hello Mars.",
    lines: ["Hello Mars."],
    wordIds: ["w_000001", "w_000002"],
    wordCues: [
      { wordId: "w_000001", text: "Hello", startMs: 100, endMs: 300 },
      { wordId: "w_000002", text: "Mars.", startMs: 350, endMs: 600 },
    ],
  },
];
it("changes display and highlighted text while preserving all clocks, IDs and original data", () => {
  const before = structuredClone(captions);
  const corrected = correctedOwnerCaptions(captions, [
    { wordId: "w_000001", text: "Hi" },
  ]);
  expect(corrected[0]).toMatchObject({
    text: "Hi Mars.",
    lines: ["Hi Mars."],
    startMs: 100,
    endMs: 600,
    wordIds: captions[0]!.wordIds,
  });
  expect(
    corrected[0]!.wordCues.map((word) => ({
      wordId: word.wordId,
      startMs: word.startMs,
      endMs: word.endMs,
    })),
  ).toEqual(
    captions[0]!.wordCues.map((word) => ({
      wordId: word.wordId,
      startMs: word.startMs,
      endMs: word.endMs,
    })),
  );
  expect(captions).toEqual(before);
});
it("rejects unknown words, duplicate overrides, empty/oversized text and timestamp editing", () => {
  expect(() =>
    correctedOwnerCaptions(captions, [{ wordId: "w_900000", text: "Hi" }]),
  ).toThrow();
  for (const words of [
    [{ wordId: "w_000001", text: "" }],
    [{ wordId: "w_000001", text: "x".repeat(81) }],
    [{ wordId: "w_000001", text: "Hi", startMs: 1 }],
    [
      { wordId: "w_000001", text: "Hi" },
      { wordId: "w_000001", text: "Other" },
    ],
  ])
    expect(
      ownerEditOperationSchema.safeParse({ kind: "caption-text", words })
        .success,
    ).toBe(false);
});
