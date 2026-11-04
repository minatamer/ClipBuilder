import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  completeFindAllPassages,
  findAllSpeechUnits,
  reconcileFindAllPassages,
} from "./find-all-passages.ts";
import { ownerLocalCues, fitOwnerAiWindow } from "./analysis.ts";
import {
  ownerMomentSchema,
  type OwnerAiEvidence,
  type OwnerMoment,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";

const fingerprint = "a".repeat(64);
const policy = { minMs: 1000, maxMs: 60000 };
function speech(count: number, ending = true): OwnerWord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `w_${String(i).padStart(6, "0")}`,
    text: `Synthetic${i}`,
    punctuatedText: `Synthetic${i}${ending && i % 10 === 9 ? "." : ""}`,
    startMs: i * 1000,
    endMs: i * 1000 + 700,
    speakerId: null,
    confidence: null,
  }));
}
function evidence(
  words: readonly OwnerWord[],
  first: number,
  last: number,
): OwnerAiEvidence {
  return {
    startWordId: words[first]!.id,
    endWordId: words[last]!.id,
    title: words[first]!.punctuatedText,
    hook: words[first]!.punctuatedText,
    rationale: "Synthetic grounded passage",
    evidence: [
      {
        signal: "self-contained",
        wordIds: [words[first]!.id],
        note: words[first]!.punctuatedText,
      },
    ],
    caveats: [],
  };
}
function moment(
  words: readonly OwnerWord[],
  first: number,
  last: number,
): OwnerMoment {
  const cut = fitOwnerAiWindow(words[first]!, words[last]!, 300000, policy)!;
  return ownerMomentSchema.parse({
    id: crypto.randomUUID(),
    processingIdentity: createHash("sha256")
      .update(`${fingerprint}:${cut.startFrame}:${cut.endFrame}`)
      .digest("hex"),
    cut,
    rangeIds: [],
    evidence: evidence(words, first, last),
    cues: ownerLocalCues(words, cut),
  });
}

it.each([0, 110, -90])(
  "completes the same sentences despite different internal endpoints and clock jitter (%i)",
  (jitter) => {
    const words = speech(40).map((word) => ({
      ...word,
      startMs: 100000 + word.startMs + jitter,
      endMs: 100000 + word.endMs + jitter,
    }));
    const original = structuredClone(words);
    const result = completeFindAllPassages(
      words,
      [evidence(words, 12, 25), evidence(words, 15, 28)],
      policy,
      [],
    );
    expect(result.map((item) => [item.startWordId, item.endWordId])).toEqual([
      [words[10]!.id, words[29]!.id],
      [words[10]!.id, words[29]!.id],
    ]);
    expect(result[0]!.title).toBe(words[12]!.punctuatedText);
    expect(result[0]!.evidence[0]!.wordIds).toEqual([words[12]!.id]);
    expect(words).toEqual(original);
  },
);

it("includes nearby questions and dependent continuations without crossing pauses or known unrelated speakers", () => {
  const words = speech(50);
  words[9]!.punctuatedText = "Synthetic9?";
  expect(
    completeFindAllPassages(words, [evidence(words, 21, 27)], policy, [])[0]!
      .startWordId,
  ).toBe(words[0]!.id);
  words[9]!.punctuatedText = "Synthetic9.";
  words[20]!.text = "However";
  expect(
    completeFindAllPassages(words, [evidence(words, 21, 27)], policy, [])[0]!
      .startWordId,
  ).toBe(words[10]!.id);
  words[19]!.endMs = 19000;
  expect(
    completeFindAllPassages(words, [evidence(words, 21, 27)], policy, [])[0]!
      .startWordId,
  ).toBe(words[20]!.id);
  words[19]!.endMs = 19700;
  words[19]!.speakerId = "speaker_00";
  words[20]!.speakerId = "speaker_01";
  expect(
    completeFindAllPassages(words, [evidence(words, 21, 27)], policy, [])[0]!
      .startWordId,
  ).toBe(words[20]!.id);
});

it("preserves bounded unpunctuated proposals, never trims a completion to fit, and honors reserved cuts", () => {
  const words = speech(120, false),
    proposal = evidence(words, 40, 59);
  expect(
    completeFindAllPassages(
      words,
      [proposal],
      { minMs: 1000, maxMs: 30000 },
      [],
    ),
  ).toEqual([proposal]);
  expect(
    completeFindAllPassages(words, [evidence(words, 0, 80)], policy, []),
  ).toEqual([]);
  const punctuated = speech(40);
  const bounded = completeFindAllPassages(
    punctuated,
    [evidence(punctuated, 12, 25)],
    { minMs: 1000, maxMs: 16000 },
    [],
  );
  expect(bounded[0]!.startWordId).toBe(punctuated[10]!.id);
  expect(bounded[0]!.endWordId).toBe(punctuated[25]!.id);
  const reserved = [{ startFrame: 300, endFrame: 360 }];
  const allowed = completeFindAllPassages(
    punctuated,
    [evidence(punctuated, 12, 25)],
    policy,
    reserved,
  );
  expect(allowed[0]!.startWordId).toBe(punctuated[12]!.id);
  expect(allowed[0]!.endWordId).toBe(punctuated[29]!.id);
});

it("does not turn punctuation-free regional context edges into arbitrary new cuts", () => {
  const words = speech(200, false).map((word) => ({
    ...word,
    startMs: word.startMs + 60000,
    endMs: word.endMs + 60000,
  }));
  const proposal = evidence(words, 20, 35);
  expect(completeFindAllPassages(words, [proposal], policy, [])).toEqual([
    proposal,
  ]);
  expect(findAllSpeechUnits(words)).toHaveLength(1);
});

it("merges overlapping full passages with canonical cues and identities, removing nested alternatives", () => {
  const words = speech(60),
    a = moment(words, 10, 29),
    b = moment(words, 20, 39),
    nested = moment(words, 22, 26);
  const original = structuredClone([a, b, nested]);
  const result = reconcileFindAllPassages([nested, b, a], fingerprint, policy);
  expect(result).toHaveLength(1);
  expect(result[0]!.cut).toEqual({ startFrame: 300, endFrame: 1191 });
  expect(result[0]!.cues.map((word) => word.id)).toEqual(
    words.slice(10, 40).map((word) => word.id),
  );
  expect(result[0]!.evidence).toMatchObject({
    startWordId: words[10]!.id,
    endWordId: words[39]!.id,
  });
  expect(result[0]!.processingIdentity).toBe(
    createHash("sha256").update(`${fingerprint}:300:1191`).digest("hex"),
  );
  expect(result[0]!.speakersPrepared).toBeUndefined();
  expect(ownerMomentSchema.safeParse(result[0]).success).toBe(true);
  expect([a, b, nested]).toEqual(original);
});

it("repairs sentence fragments and continuation splits without joining independent adjacent ideas", () => {
  const words = speech(60);
  words[20]!.text = "And";
  const proposals = completeFindAllPassages(
    words,
    [evidence(words, 10, 19), evidence(words, 20, 39), evidence(words, 40, 49)],
    policy,
    [],
  );
  const decoded = proposals.map((p) =>
    moment(
      words,
      words.findIndex((w) => w.id === p.startWordId),
      words.findIndex((w) => w.id === p.endWordId),
    ),
  );
  const result = reconcileFindAllPassages(decoded, fingerprint, policy);
  expect(result.map((m) => m.cut)).toEqual([
    { startFrame: 300, endFrame: 1191 },
    { startFrame: 1200, endFrame: 1491 },
  ]);
});

it("uses whole admissible alternatives for incompatible overlap chains, independent of proposal ordering", () => {
  const words = speech(120),
    alternatives = [
      moment(words, 0, 39),
      moment(words, 30, 69),
      moment(words, 60, 99),
      moment(words, 5, 15),
    ];
  const expected = reconcileFindAllPassages(alternatives, fingerprint, {
    ...policy,
    maxMs: 45000,
  });
  expect(expected.map((m) => m.cut)).toEqual([
    alternatives[0]!.cut,
    alternatives[2]!.cut,
  ]);
  for (const order of [
    alternatives.toReversed(),
    [alternatives[2]!, alternatives[0]!, alternatives[3]!, alternatives[1]!],
  ]) {
    expect(
      reconcileFindAllPassages(order, fingerprint, {
        ...policy,
        maxMs: 45000,
      }).map((m) => m.processingIdentity),
    ).toEqual(expected.map((m) => m.processingIdentity));
  }
  expect(
    expected.every(
      (m, index) =>
        !index || expected[index - 1]!.cut.endFrame <= m.cut.startFrame,
    ),
  ).toBe(true);
});

it("preserves selected passages before rewarding added context when expansions conflict", () => {
  const words = speech(100),
    a = moment(words, 0, 39),
    b = moment(words, 40, 79),
    expanded = moment(words, 20, 79);
  const anchors = [a.cut, b.cut];
  const result = reconcileFindAllPassages(
    [expanded, b, a],
    fingerprint,
    policy,
    [],
    anchors,
  );
  expect(result.map((m) => m.cut)).toEqual([a.cut, b.cut]);
  expect(
    reconcileFindAllPassages(
      [a, b, expanded],
      fingerprint,
      policy,
      [],
      anchors,
    ).map((m) => m.processingIdentity),
  ).toEqual(result.map((m) => m.processingIdentity));
  const proposal = evidence(words, 12, 25);
  const variants = completeFindAllPassages(words, [proposal], policy, [], true);
  expect(variants).toHaveLength(2);
  expect(variants[1]).toEqual(proposal);
});

it("never bridges a manual reservation or merges proximity without shared canonical speech", () => {
  const words = speech(60),
    left = moment(words, 0, 19),
    right = moment(words, 20, 39);
  const unrelated = { ...right, cut: { startFrame: 500, endFrame: 1191 } };
  expect(
    reconcileFindAllPassages([left, right], fingerprint, policy),
  ).toHaveLength(2);
  const result = reconcileFindAllPassages(
    [left, unrelated],
    fingerprint,
    policy,
  );
  expect(result).toHaveLength(1);
  expect([left.cut, unrelated.cut]).toContainEqual(result[0]!.cut);
  expect(
    reconcileFindAllPassages([left, right], fingerprint, policy, [
      { startFrame: 100, endFrame: 200 },
    ]),
  ).toEqual([right]);
});
