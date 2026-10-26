import { expect, it } from "vitest";
import { ownerAnalysisSchema } from "../../../../../packages/contracts/local/selection.ts";
import { defaultMomentSelection, momentDuration } from "./moment-selection.ts";

function analysis(manual: number, suggestions: number) {
  const moment = () => ({
    id: crypto.randomUUID(),
    processingIdentity: "a".repeat(64),
    cut: { startFrame: 0, endFrame: 30 },
    rangeIds: [],
    evidence: null,
    cues: [],
  });
  return ownerAnalysisSchema.parse({
    id: crypto.randomUUID(),
    mode: "synthetic-ai",
    inputs: {
      sourceRevision: 0,
      policyRevision: 7,
      ranges: [],
      aiDuration: { minMs: 10000, maxMs: 60000 },
      manualOnly: false,
    },
    words: [],
    manual: Array.from({ length: manual }, moment),
    suggestions: Array.from({ length: suggestions }, moment),
    calls: { transcription: 0, selection: 0 },
  });
}
it("defaults to all results with the correct analysis and policy identity", () => {
  const result = analysis(2, 1);
  expect(defaultMomentSelection(result)).toEqual(
    [...result.manual, ...result.suggestions].map(({ id }) => ({
      analysisId: result.id,
      policyRevision: 7,
      momentId: id,
    })),
  );
});
it("retains every result in manual-first order without truncating or modifying analysis", () => {
  const result = analysis(8, 5);
  const before = structuredClone(result);
  const selected = defaultMomentSelection(result);
  expect(selected).toHaveLength(13);
  expect(selected.map(({ momentId }) => momentId)).toEqual(
    [...result.manual, ...result.suggestions].map(({ id }) => id),
  );
  expect(result).toEqual(before);
});
it("never repeats a selected ID even if a result crosses groups", () => {
  const result = analysis(1, 2);
  result.suggestions[0] = result.manual[0]!;
  expect(
    defaultMomentSelection(result).map(({ momentId }) => momentId),
  ).toEqual([result.manual[0]!.id, result.suggestions[1]!.id]);
});
it("keeps empty results unselected", () => {
  expect(defaultMomentSelection(analysis(0, 0))).toEqual([]);
});

it.each([
  [30, "1s"],
  [1470, "49s"],
  [1800, "1m"],
  [2700, "1m 30s"],
  [46, "1.53s"],
] as const)(
  "formats %i frames using actual cut duration: %s",
  (frames, label) =>
    expect(momentDuration({ startFrame: 135, endFrame: 135 + frames })).toBe(
      label,
    ),
);
