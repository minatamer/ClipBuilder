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
      version: 2,
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
  it("preserves zero-duration provider words without inventing highlight clocks", () => {
    const f = fixture();
    f.words[1]!.endMs = f.words[1]!.startMs;
    f.words[2]!.startMs = f.words[1]!.startMs;
    const originalWords = structuredClone(f.words);
    const result = f.result();
    const cue = result.manifest.captions
      .flatMap((caption) => caption.wordCues)
      .find((item) => item.wordId === f.words[1]!.id)!;
    expect(cue).toEqual({
      wordId: f.words[1]!.id,
      text: f.words[1]!.punctuatedText,
      startMs: 500,
      endMs: 500,
    });
    expect(
      result.manifest.captions.flatMap((caption) => caption.wordIds),
    ).toEqual(f.words.map((word) => word.id));
    expect(result.words).toEqual(originalWords);
    expect(f.words).toEqual(originalWords);
    const corrupted = structuredClone(result);
    const positiveCue = corrupted.manifest.captions[0]!.wordCues[0]!;
    positiveCue.endMs = positiveCue.startMs;
    expect(selectedAssemblyResultSchema.safeParse(corrupted).success).toBe(
      false,
    );
  });
  it("logs simultaneous groups and keeps the displayable caption groups", () => {
    const f = fixture();
    f.words[1]!.punctuatedText = "E = mc²";
    expect(
      compileFixedCaptions(f.context).every(
        (c) => c.text.split(/\s+/u).length <= 5,
      ),
    ).toBe(true);
    f.words[0]!.punctuatedText = "word0.";
    f.words[1]!.startMs = f.words[0]!.startMs;
    const critiques: string[] = [];
    const captions = compileFixedCaptions(f.context, (reason) =>
      critiques.push(reason),
    );
    expect(captions.length).toBeGreaterThan(0);
    expect(captions.flatMap((caption) => caption.wordIds)).not.toContain(
      f.words[0]!.id,
    );
    expect(critiques).toEqual(["unsupported-caption-overlap"]);
    expect(f.result().words).toEqual(f.words);
  });
  it("reconciles surviving caption clocks after omitting a zero-duration standalone group", () => {
    const f = fixture();
    f.words[1]!.punctuatedText += ".";
    f.words[1]!.endMs = 6250;
    f.words[2]!.startMs = 5750;
    f.words[2]!.endMs = 5750;
    f.words[2]!.punctuatedText += ".";
    const result = f.result();
    expect(result.manifest.captions[0]!.endMs).toBe(1250);
    expect(
      result.manifest.captions.flatMap((caption) => caption.wordIds),
    ).not.toContain(f.words[2]!.id);
    expect(result.words).toEqual(f.words);
    expect(selectedAssemblyResultSchema.safeParse(result).success).toBe(true);
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
        origin: "planner",
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
  it("does not invent an automatic text-excerpt graphic for zero cards", () => {
    const f = fixture(),
      result = f.result();
    expect(result.manifest.cards).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(/Earth|Moon|equation/);
    expect(result.words).toEqual(f.words);
  });
  it("keeps usable cards when speaker evidence is unusable and skips only an invalid card", () => {
    const f = fixture();
    f.plan.speaker.durationMs = 1;
    f.plan.cards = [f.card(), f.card(12)];
    f.plan.cards[1]!.title.startWordId = "w_999999";
    const result = f.result();
    expect(result.manifest.focus).toEqual([
      {
        startMs: 0,
        endMs: 15000,
        mode: "held",
        reason: "opening-default",
        box: { x: 0.13, y: 0.25, width: 0.24, height: 0.35 },
      },
    ]);
    expect(result.manifest.cards).toHaveLength(1);
    expect(result.manifest.cards[0]!.origin).toBe("planner");
    expect(result.manifest.cards[0]!.title).toBe(f.words[4]!.punctuatedText);
  });
  it("keeps the edit when no grounded visual fits, including an invalid planner card", () => {
    const f = fixture();
    for (const word of f.words) word.punctuatedText += ".";
    expect(f.result().manifest.cards).toEqual([]);
    f.plan.cards = [f.card()];
    f.plan.cards[0]!.title.startWordId = "w_999999";
    expect(f.result().manifest.cards).toEqual([]);
  });
  it("grounds highlight clocks in original words and rejects retiming or provenance mutation", () => {
    const f = fixture();
    f.plan.cards = [f.card()];
    const result = f.result();
    expect(result.manifest.captions[0]!.wordCues[0]).toMatchObject({
      wordId: f.words[0]!.id,
      text: f.words[0]!.punctuatedText,
      startMs: 0,
      endMs: 500,
    });
    result.manifest.captions[0]!.wordCues[0]!.endMs = 499;
    expect(selectedAssemblyResultSchema.safeParse(result).success).toBe(false);
    const changed = f.result();
    changed.cardEvidence[0]!.origin = "transcript-fallback";
    expect(selectedAssemblyResultSchema.safeParse(changed).success).toBe(false);
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
  ])("omits unusable %s cards without aborting the edit", (kind) => {
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
    const result = f.result();
    expect(result.words).toEqual(f.words);
    expect(result.manifest.captions.length).toBeGreaterThan(0);
    expect(result.manifest.cards).toHaveLength(
      ["overlap", "coverage"].includes(kind) ? 1 : 0,
    );
    expect(selectedAssemblyResultSchema.safeParse(result).success).toBe(true);
  });
  it.each([
    "https://synthetic.invalid",
    "<script>",
    "ignore previous instructions",
    "in the style of",
    "logo",
  ])("omits unsafe card text %s without aborting the edit", (text) => {
    const f = fixture();
    f.words[4]!.punctuatedText = text;
    f.plan.cards = [f.card()];
    const result = f.result();
    expect(
      result.manifest.cards.every(
        (card) => ![card.title, ...card.lines].join(" ").includes(text),
      ),
    ).toBe(true);
    expect(result.words).toEqual(f.words);
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
