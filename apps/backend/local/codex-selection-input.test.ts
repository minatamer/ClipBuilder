import { expect, it } from "vitest";
import { codexSelectionInput } from "./codex-selection-input.ts";
import { normalizeCandidateSelection } from "../src/analysis/analysis.provider-shape.ts";

it("compacts references without changing canonical words, source clocks or grounded output", () => {
  const words = ["A", "complete", "example."].map((text, index) => ({
    id: `w_${String(index + 1).padStart(32, "a")}`,
    text: text.replace(".", ""),
    punctuatedText: text,
    startMs: 300000 + index * 1000,
    endMs: 300800 + index * 1000,
    speakerId: null,
    confidence: null,
  }));
  const original = structuredClone(words);
  const input = codexSelectionInput(words, { startMs: 300000, endMs: 420000 });
  expect(input.words[0]).toEqual({
    id: "w_000001",
    text: "A",
    startMs: 300000,
    endMs: 300800,
  });
  expect(JSON.stringify(input.words)).not.toContain("punctuatedText");
  expect(JSON.stringify(input.words)).not.toContain("confidence");
  expect(JSON.stringify(input.words)).not.toContain(words[0]!.id);
  const normalized = normalizeCandidateSelection(
    {
      candidates: [
        {
          startWordId: "w_000001",
          endWordId: "w_000003",
          titleWordIds: ["w_000002", "w_000003"],
          hookWordIds: ["w_000001", "w_000002"],
          evidence: [
            { signal: "self-contained", wordIds: ["w_000001", "w_000002"] },
          ],
          caveats: [],
        },
        { startWordId: "w_missing", endWordId: "w_000003" },
      ],
    },
    input.aliases,
    100,
  );
  const restored = input.restore(normalized.candidates);
  expect(restored[0]).toMatchObject({
    startWordId: words[0]!.id,
    endWordId: words[2]!.id,
    title: "complete example.",
    hook: "A complete",
    evidence: [{ wordIds: [words[0]!.id, words[1]!.id] }],
  });
  expect(normalized.diagnostic.droppedCount).toBe(1);
  expect(words).toEqual(original);
  expect(input.instructions).toContain("chronologically");
  expect(input.instructions).toContain("Empty regions are valid");
  expect(input.reviewCore).toEqual({ startMs: 300000, endMs: 420000 });
  expect(input.speechUnits).toEqual([
    { startWordId: "w_000001", endWordId: "w_000003", question: false },
  ]);
  expect(input.instructions).toContain("Keep a question with its answer");
});

it("preserves speaker boundaries and refuses malformed internal scopes", () => {
  const word = {
    id: "w_canonical",
    text: "Example",
    punctuatedText: "Example!",
    startMs: 1000,
    endMs: 2000,
    speakerId: "speaker_00",
    confidence: null,
  };
  expect(codexSelectionInput([word]).words[0]).toMatchObject({
    text: "Example!",
    speakerId: "speaker_00",
  });
  expect(() =>
    codexSelectionInput([word], { startMs: 2000, endMs: 1000 }),
  ).toThrow();
});
