import { expect, it } from "vitest";
import { retainOwnerTranscript } from "./transcript-timing.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

const word = (index: number, startMs: number, endMs: number) => ({
  id: `w_${String(index).padStart(6, "0")}`,
  startMs,
  endMs,
  text: "Synthetic",
  punctuatedText: "Synthetic",
  speakerId: null,
  confidence: null,
});
it("retains every decoded word in original order and logs timing critiques without content", () => {
  const lines: string[] = [];
  const raw = [
    word(1, 200, 400),
    word(2, 500, 500),
    word(3, 600, 550),
    word(4, 100, 300),
    word(5, 900, 1001),
    word(6, 1000, 1100),
  ];
  const before = structuredClone(raw);
  const result = retainOwnerTranscript(
    raw,
    1000,
    new LocalDiagnostics((line) => lines.push(line)),
  );
  expect(result).toEqual(raw);
  expect(raw).toEqual(before);
  expect(lines.map((line) => JSON.parse(line))).toContainEqual(
    expect.objectContaining({
      operation: "transcript_validate",
      transcriptTiming: {
        returnedWords: 6,
        acceptedWords: 6,
        nonpositiveWords: 2,
        outsideMediaWords: 2,
        reorderedWords: 0,
        outOfOrderWords: 1,
      },
    }),
  );
  expect(lines.join("\n")).not.toContain("Synthetic");
  expect(lines.join("\n")).not.toContain("w_000001");
});
it("retains exact source endpoints and stable ordering for overlapping speakers", () => {
  const raw = [word(1, 0, 1000), word(2, 0, 200), word(3, 500, 600)];
  expect(retainOwnerTranscript(raw, 1000, new LocalDiagnostics())).toEqual(raw);
});
it("preserves nonpositive timing while retaining duplicate/structural rejection", () => {
  expect(
    retainOwnerTranscript([word(1, 500, 500)], 1000, new LocalDiagnostics()),
  ).toEqual([word(1, 500, 500)]);
  expect(() =>
    retainOwnerTranscript(
      [word(1, 0, 100), word(1, 100, 200)],
      1000,
      new LocalDiagnostics(),
    ),
  ).toThrow("invalid_owner_transcript");
  expect(() =>
    retainOwnerTranscript([word(1, -1, 100)], 1000, new LocalDiagnostics()),
  ).toThrow();
});
