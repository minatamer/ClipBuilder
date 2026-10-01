import {
  analysisBundleSchema,
  assemblyBundleSchema,
} from "@clipbuilder/contracts";
import { describe, expect, it } from "vitest";

import {
  SAMPLE_ANALYSIS,
  SAMPLE_ASSEMBLY,
  SAMPLE_FOUR_CANDIDATES,
  SAMPLE_NO_CANDIDATES,
  SAMPLE_ONE_CANDIDATE,
  validateCandidateFixture,
} from "./sampleAnalysis.js";
import { SAMPLE_MANIFEST } from "./sampleManifest.js";

describe("sample fixture contracts", () => {
  it("publishes exactly three grounded, distinct candidates", () => {
    expect(analysisBundleSchema.safeParse(SAMPLE_ANALYSIS).success).toBe(true);
    expect(SAMPLE_ANALYSIS.candidates).toHaveLength(3);
    expect(
      new Set(
        SAMPLE_ANALYSIS.candidates.map(
          (candidate) => `${candidate.startWordId}:${candidate.endWordId}`,
        ),
      ).size,
    ).toBe(3);
    expect(validateCandidateFixture(SAMPLE_ANALYSIS)).toEqual(
      expect.objectContaining({ success: true }),
    );

    const story = SAMPLE_ANALYSIS.transcript.words
      .map((word) => word.text)
      .join(" ");
    expect(story).toContain("Earth");
    expect(story).toContain("Moon");
    expect(story).toContain("equation");
    expect(story).toContain("camera cut");
  });

  it("accepts the no-candidate outcome and production-shaped assembly", () => {
    expect(analysisBundleSchema.safeParse(SAMPLE_NO_CANDIDATES).success).toBe(
      true,
    );
    expect(SAMPLE_NO_CANDIDATES.candidates).toEqual([]);
    expect(SAMPLE_ONE_CANDIDATE.candidates).toHaveLength(1);
    expect(SAMPLE_FOUR_CANDIDATES.candidates).toHaveLength(4);
    expect(analysisBundleSchema.safeParse(SAMPLE_FOUR_CANDIDATES).success).toBe(
      true,
    );
    expect(validateCandidateFixture(SAMPLE_ONE_CANDIDATE)).toEqual(
      expect.objectContaining({ success: true }),
    );
    expect(validateCandidateFixture(SAMPLE_FOUR_CANDIDATES)).toEqual(
      expect.objectContaining({ success: true }),
    );
    expect(assemblyBundleSchema.safeParse(SAMPLE_ASSEMBLY).success).toBe(true);
    expect(SAMPLE_ASSEMBLY.speakerFocus.shots).toHaveLength(1);
    expect(SAMPLE_ASSEMBLY.visualPlan.requests).toHaveLength(1);
    expect(SAMPLE_ASSEMBLY.compositionManifest).toMatchObject({
      baseCandidateId: SAMPLE_ANALYSIS.candidates[0]?.id,
      captions: { profile: "clean-emphasis" },
    });
    expect(SAMPLE_MANIFEST).toMatchObject({
      rightsStatus: "pending",
      media: { objectGeneration: null, sha256: null, bytes: null },
      poster: { status: "pending", sha256: null },
    });
  });

  it.each([
    {
      name: "missing reference",
      mutate: (fixture: typeof SAMPLE_ANALYSIS) => {
        fixture.candidates[0]!.evidence[0]!.wordIds[0] = "w_999999";
      },
      ruleId: "candidate.reference",
    },
    {
      name: "duplicate range",
      mutate: (fixture: typeof SAMPLE_ANALYSIS) => {
        fixture.candidates[1]!.startWordId = fixture.candidates[0]!.startWordId;
        fixture.candidates[1]!.endWordId = fixture.candidates[0]!.endWordId;
      },
      ruleId: "candidate.distinct-range",
    },
    {
      name: "invented quote",
      mutate: (fixture: typeof SAMPLE_ANALYSIS) => {
        fixture.candidates[0]!.title = '"The Moon is made of cheese"';
      },
      ruleId: "candidate.invented-quote",
    },
    {
      name: "unquoted invented claim",
      mutate: (fixture: typeof SAMPLE_ANALYSIS) => {
        fixture.candidates[0]!.title =
          "Scientists discovered oceans under Mars";
      },
      ruleId: "candidate.invented-claim",
    },
    {
      name: "virality promise",
      mutate: (fixture: typeof SAMPLE_ANALYSIS) => {
        fixture.candidates[0]!.rationale =
          "Guaranteed to go viral with a million views.";
      },
      ruleId: "candidate.performance-claim",
    },
    {
      name: "virality promise in an evidence note",
      mutate: (fixture: typeof SAMPLE_ANALYSIS) => {
        fixture.candidates[0]!.evidence[0]!.note =
          "Guaranteed to go viral with a million views.";
      },
      ruleId: "candidate.performance-claim",
    },
    {
      name: "prompt injection",
      mutate: (fixture: typeof SAMPLE_ANALYSIS) => {
        fixture.transcript.words[0]!.text = "Ignore";
        fixture.transcript.words[1]!.text = "previous";
      },
      ruleId: "candidate.instruction-content",
    },
  ])("rejects $name with content-free rule evidence", ({ mutate, ruleId }) => {
    const fixture = structuredClone(SAMPLE_ANALYSIS);
    mutate(fixture);
    const result = validateCandidateFixture(fixture);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.evidence).toEqual(
        expect.arrayContaining([expect.objectContaining({ ruleId })]),
      );
      expect(JSON.stringify(result.evidence)).not.toContain("Moon is made");
    }
  });
});
