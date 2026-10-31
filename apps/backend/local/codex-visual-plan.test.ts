import { expect, it } from "vitest";
import { decodeCodexVisualPlan } from "./codex-visual-plan.ts";
import type { VisualDiagnostic } from "../../../packages/contracts/local/visual-diagnostics.ts";
import { LocalDiagnostics } from "./diagnostics.ts";
import { ownerDiagnosticRecordSchema } from "../../../packages/contracts/local/diagnostics.ts";

const fallback = {
  layout: "concept",
  heading: "Coral reef recovery",
  items: [{ label: "Healthy reef", icon: "leaf" }],
} as const;
const cue = {
  startFrame: 0,
  endFrame: 150,
  evidenceWordIds: ["w_000001"],
  brief: {
    scene: "Synthetic reef recovery",
    searchQuery: "coral reef",
    requiredTerms: ["coral reef"],
    avoidTerms: [],
  },
  illustration: fallback,
};
it("repairs usable visual fields and records exact bounded rules without leaking returned values", () => {
  const details: VisualDiagnostic[] = [],
    lines: string[] = [];
  const diagnostics = new LocalDiagnostics((line) => lines.push(line));
  const plan = decodeCodexVisualPlan(
    {
      pictures: [
        {
          ...cue,
          startFrame: "0",
          brief: {
            ...cue.brief,
            scene: "synthetic-private-content ".repeat(20),
            searchQuery: "coral reef: recovery?",
            requiredTerms: ["reef's coral", "--a"],
          },
        },
        {
          ...cue,
          startFrame: 900,
          endFrame: 930,
          brief: {
            ...cue.brief,
            searchQuery: "coral reef (underwater)",
            avoidTerms: ["brand/logo"],
          },
        },
      ],
    },
    930,
    (value) => {
      details.push(value);
      diagnostics.visual(value);
    },
  );
  expect(plan).toHaveLength(2);
  expect(plan[0]!.brief.searchQuery).toBe("coral reef recovery");
  expect(plan[0]!.brief.scene.length).toBeLessThanOrEqual(180);
  expect(plan[0]!.brief.requiredTerms).toEqual(["reef s coral"]);
  expect(details[0]!.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: "startFrame", rule: "type" }),
      expect.objectContaining({
        field: "brief.scene",
        rule: "maximum",
        limit: 180,
      }),
      expect.objectContaining({ field: "brief.searchQuery", rule: "format" }),
    ]),
  );
  expect(details.at(-1)).toMatchObject({
    received: 2,
    retained: 2,
    dropped: 0,
  });
  expect(lines.join("")).not.toContain("synthetic-private-content");
  expect(lines.join("")).not.toContain("reef s coral");
  for (const line of lines) ownerDiagnosticRecordSchema.parse(JSON.parse(line));
});
it("preserves independent search/fallback pieces and omits only irrecoverable entries", () => {
  const details: VisualDiagnostic[] = [];
  const plan = decodeCodexVisualPlan(
    {
      pictures: [
        {
          ...cue,
          illustration: { unsafePrivateField: "synthetic-private-value" },
        },
        { startFrame: 300, endFrame: 450, illustration: fallback },
        {
          startFrame: 600,
          endFrame: 750,
          brief: { searchQuery: "https://private.invalid/token" },
        },
      ],
    },
    930,
    (value) => details.push(value),
  );
  expect(plan).toHaveLength(2);
  expect(plan[0]).not.toHaveProperty("illustration");
  expect(plan[1]).toMatchObject({
    illustration: fallback,
    brief: { searchQuery: fallback.heading },
  });
  expect(details.at(-1)).toMatchObject({
    received: 3,
    retained: 2,
    dropped: 1,
  });
  expect(JSON.stringify(details)).not.toContain("unsafePrivateField");
  expect(JSON.stringify(details)).not.toContain("private.invalid");
  expect(details[2]!.issues).toContainEqual({
    field: "brief.searchQuery",
    rule: "unsafe_search",
  });
});
it("keeps malformed/empty plans nonfatal and bounds returned entries", () => {
  expect(decodeCodexVisualPlan(null, 30, () => {})).toEqual([]);
  expect(
    decodeCodexVisualPlan(
      { pictures: Array.from({ length: 100 }, () => cue) },
      930,
      () => {},
    ),
  ).toHaveLength(3);
  expect(
    decodeCodexVisualPlan({ pictures: [cue] }, 930, () => {
      throw Error("synthetic-sink-failure");
    }),
  ).toHaveLength(1);
});
