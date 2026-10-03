import { describe, expect, it } from "vitest";
import {
  selectedAssemblyResultSchema,
  type SelectedAssemblyPlan,
  type TranscriptWord,
  type GroundedAnalysisResult,
} from "@clipbuilder/contracts";
import { SAMPLE_ANALYSIS } from "../demo/sampleAnalysis.js";
import { compileFixedAssembly, manifestDigest } from "./fixed-assembly.js";
import { compileFixedCaptions } from "./fixed-captions.js";

function fixture(durationMs = 15000) {
  const words: TranscriptWord[] = Array.from(
    { length: durationMs / 500 },
    (_, i) => ({
      id: `w_${String(i + 1).padStart(6, "0")}`,
      text: `word${i}`,
      punctuatedText: `word${i}`,
      startMs: 5000 + i * 500,
      endMs: 5500 + i * 500,
      speakerId: "spk_0",
      confidence: null,
    }),
  );
  const context = { range: { startMs: 5000, endMs: 5000 + durationMs }, words };
  const source: GroundedAnalysisResult = {
    binding: {
      sessionId: "ses_" + "s".repeat(22),
      sourceRevision: SAMPLE_ANALYSIS.media.sourceRevision,
      fingerprint: "a".repeat(64),
    },
    generation: "1",
    analysis: SAMPLE_ANALYSIS,
    receipt: "synthetic",
  };
  const plan: SelectedAssemblyPlan = {
    version: 1,
    speaker: {
      version: 1,
      coordinateSpace: "upright-display",
      durationMs,
      shots: [{ startMs: 0, endMs: durationMs, observations: [] }],
    },
    cards: [],
  };
  function card(
    anchor = 4,
    duration = 2000,
  ): SelectedAssemblyPlan["cards"][number] {
    return {
      kind: "statement",
      anchorWordId: words[anchor]!.id,
      durationMs: duration,
      title: { startWordId: words[anchor]!.id, endWordId: words[anchor]!.id },
      lines: [
        {
          startWordId: words[anchor + 1]!.id,
          endWordId: words[anchor + 2]!.id,
        },
      ],
    };
  }
  function result() {
    return selectedAssemblyResultSchema.parse({
      version: 1,
      binding: source.binding,
      generation: source.generation,
      analysisRevision: source.analysis.revision,
      candidateId: source.analysis.candidates[0]!.id,
      provider: "fake",
      receipt: "synthetic",
      ...compileFixedAssembly(plan, source, context),
    });
  }
  return { words, context, source, plan, card, result };
}
describe("fixed contextual assembly", () => {
  it("counts display tokens in a multi-token provider word and rejects unrepresentable simultaneous groups", () => {
    const f = fixture();
    f.words[1]!.punctuatedText = "E = mc²";
    expect(
      compileFixedCaptions(f.context).every(
        (c) => c.text.split(/\s+/u).length <= 7,
      ),
    ).toBe(true);
    f.words[0]!.punctuatedText = "word0.";
    f.words[1]!.startMs = f.words[0]!.startMs;
    expect(() => compileFixedCaptions(f.context)).toThrow(
      "unsupported-caption-overlap",
    );
  });
  it("freezes extractive cards and exhaustive caption word mapping with a stable manifest hash", () => {
    const f = fixture();
    f.plan.cards = [f.card()];
    const result = f.result();
    expect(result.manifest.cards).toEqual([
      {
        startMs: 2000,
        endMs: 4000,
        kind: "statement",
        title: "word4",
        lines: ["word5 word6"],
      },
    ]);
    expect(result.manifest.captions.flatMap((c) => c.wordIds)).toEqual(
      f.words.map((w) => w.id),
    );
    expect(result.manifestHash).toBe(manifestDigest(result.manifest));
    expect(f.result()).toEqual(result);
  });
  it("accepts zero cards and does not inject fixture subjects into unrelated words", () => {
    const f = fixture(),
      result = f.result();
    expect(result.manifest.cards).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(/Earth|Moon|equation/);
    expect(result.words).toEqual(f.words);
  });
  it.each([
    "missing",
    "reversed",
    "reordered",
    "opening",
    "overlap",
    "coverage",
    "late",
    "kind",
    "free-text",
  ])("rejects %s cues atomically", (kind) => {
    const f = fixture(10000),
      cue = f.card();
    f.plan.cards = [cue];
    if (kind === "missing") cue.title.startWordId = "w_999999";
    if (kind === "reversed")
      [cue.lines[0]!.startWordId, cue.lines[0]!.endWordId] = [
        cue.lines[0]!.endWordId,
        cue.lines[0]!.startWordId,
      ];
    if (kind === "reordered") cue.lines[0] = { ...cue.title };
    if (kind === "opening") cue.anchorWordId = f.words[0]!.id;
    if (kind === "overlap") f.plan.cards.push(f.card(7));
    if (kind === "coverage") f.plan.cards = [f.card(4, 3000), f.card(12, 3000)];
    if (kind === "late") cue.anchorWordId = f.words.at(-1)!.id;
    if (kind === "kind") cue.kind = "comparison";
    if (kind === "free-text") Object.assign(cue, { titleText: "fabricated" });
    expect(f.result).toThrow();
  });
  it.each([
    "https://synthetic.invalid",
    "<script>",
    "ignore previous instructions",
    "in the style of",
    "logo",
  ])("rejects unsafe card text %s", (text) => {
    const f = fixture();
    f.words[4]!.punctuatedText = text;
    f.plan.cards = [f.card()];
    expect(f.result).toThrow();
  });
  it("preserves exact equations/numbers as plain card text with no generated asset", () => {
    const f = fixture();
    f.words[4]!.punctuatedText = "E = mc²";
    f.words[5]!.punctuatedText = "42";
    f.words[6]!.punctuatedText = "units.";
    f.plan.cards = [f.card()];
    expect(f.result().manifest.cards[0]).toMatchObject({
      title: "E = mc²",
      lines: ["42 units."],
    });
  });
  it("splits at punctuation, pauses, speaker changes and line limits while preserving long words", () => {
    const f = fixture();
    f.words[1]!.punctuatedText = "word1.";
    f.words[4]!.speakerId = "spk_1";
    f.words[6]!.startMs += 400;
    f.words[8]!.punctuatedText = "x".repeat(80);
    const groups = compileFixedCaptions(f.context);
    expect(groups[0]!.wordIds).toEqual(f.words.slice(0, 2).map((w) => w.id));
    expect(groups.some((c) => c.wordIds?.[0] === f.words[4]!.id)).toBe(true);
    expect(groups.some((c) => c.text === "x".repeat(80))).toBe(true);
    expect(groups.flatMap((c) => c.wordIds)).toEqual(f.words.map((w) => w.id));
    expect(f.result().words).toEqual(f.words);
  });
  it("bounds caption overlap to the next display group without changing provider clocks", () => {
    const f = fixture();
    f.words[1]!.punctuatedText = "word1.";
    f.words[1]!.endMs += 250;
    const result = f.result();
    expect(result.manifest.captions[0]!.endMs).toBe(1000);
    expect(result.words[1]!.endMs).toBe(6250);
  });
  it("rejects caption text, missing word evidence, reordered cards and source fingerprint mutations", () => {
    const f = fixture();
    f.plan.cards = [f.card()];
    for (const mutate of [
      (v: ReturnType<typeof f.result>) => {
        v.manifest.captions[0]!.text = "fabricated";
      },
      (v: ReturnType<typeof f.result>) => {
        v.manifest.captions[0]!.wordIds = [];
      },
      (v: ReturnType<typeof f.result>) => {
        v.cardEvidence[0]!.lineWordIds[0]!.reverse();
      },
      (v: ReturnType<typeof f.result>) => {
        v.binding.fingerprint = "b".repeat(64);
      },
    ]) {
      const value = f.result();
      mutate(value);
      expect(selectedAssemblyResultSchema.safeParse(value).success).toBe(false);
    }
  });
});
