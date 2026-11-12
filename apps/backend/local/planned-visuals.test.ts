import { expect, it } from "vitest";
import {
  timePlannedVisuals,
  plannedVisualGuide,
  plannedVisualSearchBriefs,
} from "./planned-visuals.ts";
import { ownerClipPlanSchema } from "../../../packages/contracts/local/clips.ts";

const picture = (
  startFrame: number,
  endFrame: number,
  scene = "Synthetic coral reef",
) => ({
  startFrame,
  endFrame,
  evidenceWordIds: ["w_000001"],
  brief: {
    scene,
    searchQuery: "coral reef",
    requiredTerms: ["coral"],
    avoidTerms: [],
  },
  illustration: {
    layout: "concept" as const,
    heading: "Coral",
    items: [{ label: "Ocean", icon: "globe" as const }],
  },
});
it("keeps exact primary subjects/meaning across fallback depictions, never replacing a technical concept with random props", () => {
  const primary = {
    scene: "An interface showing speech translated between languages",
    searchQuery: "speech translation interface",
    requiredTerms: ["speech translation"],
    avoidTerms: ["logo"],
  };
  const cue = {
    ...picture(30, 120),
    brief: primary,
    alternateBriefs: [
      {
        scene: "A pirate parrot",
        searchQuery: "parrot pirate",
        requiredTerms: ["parrot"],
        avoidTerms: ["brand"],
      },
      {
        scene: "Different image",
        searchQuery: "speech translation illustration",
        requiredTerms: ["illustration"],
        avoidTerms: [],
      },
    ],
  };
  const raw = structuredClone(cue),
    result = plannedVisualSearchBriefs(cue);
  expect(result.map((brief) => brief.searchQuery)).toEqual([
    "speech translation interface",
    "speech translation",
    "speech translation illustration",
  ]);
  expect(
    result.every(
      (brief) =>
        brief.scene === primary.scene &&
        JSON.stringify(brief.requiredTerms) ===
          JSON.stringify(primary.requiredTerms),
    ),
  ).toBe(true);
  expect(result[1]!.avoidTerms).toEqual(["logo", "brand"]);
  expect(result.every((brief) => !brief.searchQuery.includes("parrot"))).toBe(
    true,
  );
  expect(cue).toEqual(raw);
});
it("deduplicates normalized searches, matches whole multilingual terms and stays within three existing briefs", () => {
  const cue = picture(30, 120);
  cue.brief = {
    scene: "Synthetic marine coral",
    searchQuery: "coral photograph",
    requiredTerms: ["coral"],
    avoidTerms: [],
  };
  expect(
    plannedVisualSearchBriefs({
      ...cue,
      alternateBriefs: [
        cue.brief,
        { ...cue.brief, searchQuery: "coralline substitute" },
      ],
    }).map((brief) => brief.searchQuery),
  ).toEqual(["coral photograph", "coral"]);
  const arabic = {
    ...cue.brief,
    searchQuery: "ترجمة الكلام",
    requiredTerms: ["ترجمة"],
  };
  expect(
    plannedVisualSearchBriefs({
      ...cue,
      brief: arabic,
      alternateBriefs: [{ ...arabic, searchQuery: "ترجمة رسم" }],
    }).map((brief) => brief.searchQuery),
  ).toEqual(["ترجمة الكلام", "ترجمة رسم"]);
  const long = "a".repeat(32);
  const bounded = {
    ...cue.brief,
    requiredTerms: [long, "b".repeat(32), "c".repeat(32), "d".repeat(32)],
  };
  expect(
    plannedVisualSearchBriefs({
      ...cue,
      brief: bounded,
      alternateBriefs: [cue.brief, cue.brief],
    }),
  ).toEqual([bounded]);
});
it("scouts timing windows without imposing a minimum number of optional visuals", () => {
  expect(plannedVisualGuide(1800)).toEqual({
    maximumCount: 1,
    windows: [
      { startFrame: 0, endFrame: 900 },
      { startFrame: 900, endFrame: 1800 },
    ],
  });
  expect(timePlannedVisuals([], 1800)).toEqual([]);
  const bland = picture(0, 150, "A trading spreadsheet worksheet");
  const expressive = picture(
    210,
    360,
    "A visibly frustrated adult clenching fists",
  );
  const result = timePlannedVisuals([bland, expressive], 900);
  expect(result).toHaveLength(1);
  expect(result[0]!.brief.scene).toBe(expressive.brief.scene);
  expect(bland.brief.scene).toBe("A trading spreadsheet worksheet");
});

it("keeps one automatic visual, caps its hold at five seconds and preserves raw legacy plans", () => {
  const plan = [
      picture(210, 630),
      picture(240, 780, "Synthetic ocean habitat"),
      picture(270, 900, "Synthetic marine restoration"),
    ],
    original = structuredClone(plan),
    result = timePlannedVisuals(plan, 900);
  expect(
    result.map(({ startFrame, endFrame }) => [startFrame, endFrame]),
  ).toEqual([[210, 360]]);
  expect(result[0]!.brief).toEqual(plan[0]!.brief);
  expect(result.every((cue) => cue.illustration?.heading === "Coral")).toBe(
    true,
  );
  expect(plan).toEqual(original);
  expect(ownerClipPlanSchema.parse(original)).toEqual(original);
});
it("sorts and preserves a shorter chosen cue without acquiring later candidates", () => {
  const result = timePlannedVisuals(
    [picture(600, 1000), picture(15, 75), picture(270, 330)],
    660,
  );
  expect(
    result.map(({ startFrame, endFrame }) => [startFrame, endFrame]),
  ).toEqual([[15, 75]]);
  expect(timePlannedVisuals([picture(600, 1000)], 660)[0]).toMatchObject({
    startFrame: 600,
    endFrame: 660,
  });
});
it("shares one automatic slot across overlapping and later proposals", () => {
  const result = timePlannedVisuals(
    [picture(0, 60), picture(30, 90), picture(150, 240)],
    300,
  );
  expect(
    result.map(({ startFrame, endFrame }) => [startFrame, endFrame]),
  ).toEqual([[0, 60]]);
  expect(timePlannedVisuals([], 30)).toEqual([]);
});
it("retains tolerant physical clock conversion without re-expanding the AI cap", () => {
  const result = timePlannedVisuals([picture(900.4, -10.8)], 600);
  expect(result[0]).toMatchObject({ startFrame: 0, endFrame: 150 });
});
