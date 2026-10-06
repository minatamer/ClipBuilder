import { describe, expect, it } from "vitest";
import {
  speakerPlanSchema,
  focusSegmentV3Schema,
  type SpeakerPlan,
  type TranscriptWord,
} from "@clipbuilder/contracts";
import { compileSpeakerFocus } from "./speaker-focus.js";
const words: TranscriptWord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `w_${String(i + 1).padStart(6, "0")}`,
  startMs: 5000 + i * 500,
  endMs: 5500 + i * 500,
  text: "synthetic",
  punctuatedText: "synthetic",
  speakerId: "spk_0",
  confidence: null,
}));
const context = { range: { startMs: 5000, endMs: 15000 }, words };
const box = { x: 0.1, y: 0.1, width: 0.2, height: 0.3 };
function plan(): SpeakerPlan {
  return {
    version: 1,
    coordinateSpace: "upright-display",
    durationMs: 10000,
    shots: [
      {
        startMs: 0,
        endMs: 10000,
        observations: [
          {
            startMs: 0,
            endMs: 10000,
            speakerId: "spk_0",
            evidenceWordIds: [words[0]!.id],
            visiblePeople: 2,
            association: "matched",
            box,
            confidence: 0.95,
          },
        ],
      },
    ],
  };
}
function timeline(raw: SpeakerPlan, sourceWords = words) {
  return compileSpeakerFocus(raw, { ...context, words: sourceWords });
}
describe("selected-range anonymous speaker focus", () => {
  it("uses a first-frame visible-face fallback without speaker confidence and never borrows a later face", () => {
    const input = plan();
    const item = input.shots[0]!.observations[0]!;
    const opening = { ...box, x: 0.65 };
    input.shots[0]!.openingFace = { box: opening, confidence: 0.95 };
    input.shots[0]!.observations = [
      {
        ...item,
        endMs: 2000,
        association: "ambiguous",
        box: null,
        evidenceWordIds: [],
      },
      { ...item, startMs: 2000, evidenceWordIds: [words[4]!.id] },
    ];
    const focus = timeline(input);
    expect(focus[0]).toMatchObject({
      startMs: 0,
      endMs: 3000,
      mode: "held",
      reason: "visible-face",
      box: opening,
    });
    expect(focus[0]).not.toHaveProperty("speaker");
    expect(focus[0]).not.toHaveProperty("confidence");
    expect(focus.at(-1)).toMatchObject({ mode: "speaker", box });
    delete input.shots[0]!.openingFace;
    const fallback = timeline(input);
    expect(fallback[0]).toMatchObject({
      mode: "held",
      reason: "opening-default",
    });
    expect(fallback[0]).not.toMatchObject({ box });
    expect(fallback[0]).not.toHaveProperty("speaker");
  });
  it("fails an unrepresentable focus track atomically instead of widening the entire shot", () => {
    const input = plan();
    input.durationMs = 20000;
    input.shots[0]!.endMs = 20000;
    input.shots[0]!.observations[0]!.endMs = 20000;
    const dense = Array.from({ length: 1000 }, (_, index) => ({
      ...words[0]!,
      id: `w_${String(index + 1).padStart(6, "0")}`,
      startMs: 5000 + index * 20,
      endMs: 5010 + index * 20,
    }));
    expect(() =>
      compileSpeakerFocus(input, {
        range: { startMs: 5000, endMs: 25000 },
        words: dense,
      }),
    ).toThrow("focus_track_too_complex");
  });
  it("opens on visible geometry immediately while waiting to claim a speaking-person match", () => {
    expect(timeline(plan())).toEqual([
      { startMs: 0, endMs: 1000, mode: "held", reason: "visible-face", box },
      {
        startMs: 1000,
        endMs: 10000,
        mode: "speaker",
        speaker: "spk_0",
        confidence: 0.95,
        box,
      },
    ]);
  });
  it("holds the last confirmed face through long uncertainty without claiming a speaker match", () => {
    const focus = timeline(plan(), [
      { ...words[0]!, endMs: 7000 },
      { ...words[1]!, startMs: 7500, endMs: 8500 },
    ]);
    expect(
      focus.map(({ startMs, endMs, mode }) => ({ startMs, endMs, mode })),
    ).toEqual([
      { startMs: 0, endMs: 1000, mode: "held" },
      { startMs: 1000, endMs: 2000, mode: "speaker" },
      { startMs: 2000, endMs: 2500, mode: "held" },
      { startMs: 2500, endMs: 3500, mode: "speaker" },
      { startMs: 3500, endMs: 10000, mode: "held" },
    ]);
    for (const held of focus.filter((s) => s.mode === "held")) {
      expect(held.box).toEqual(box);
      expect(held).not.toHaveProperty("speaker");
      expect(held).not.toHaveProperty("confidence");
    }
    expect(focus.at(-1)).toMatchObject({ reason: "pause", mode: "held" });
  });
  it("keeps a short interjection on the prior crop; silence never makes a switch qualify", () => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    input.shots[0]!.observations = [
      { ...item, endMs: 2000 },
      {
        ...item,
        startMs: 2000,
        endMs: 9000,
        speakerId: "spk_1",
        evidenceWordIds: [words[4]!.id],
        box: { ...box, x: 0.7 },
      },
      { ...item, startMs: 9000, evidenceWordIds: [words[18]!.id] },
    ];
    const focus = timeline(input, [
      { ...words[0]!, endMs: 7000 },
      { ...words[4]!, endMs: 7500, speakerId: "spk_1" },
      { ...words[18]!, endMs: 15000 },
    ]);
    expect(
      focus.some((s) => s.mode === "speaker" && s.speaker === "spk_1"),
    ).toBe(false);
    expect(focus.find((s) => s.startMs === 2000)).toMatchObject({
      mode: "held",
      reason: "switch-pending",
      box,
    });
  });
  it("counts union coverage once, clips range edges, and excludes long silent gaps from hysteresis", () => {
    expect(
      timeline(plan(), [
        { ...words[0]!, endMs: 5700 },
        { ...words[1]!, startMs: 5200, endMs: 5900 },
      ]).every((s) => s.mode !== "speaker"),
    ).toBe(true);
    expect(
      timeline(plan(), [
        { ...words[0]!, endMs: 5500 },
        { ...words[1]!, startMs: 10000, endMs: 10500 },
      ]).every((s) => s.mode !== "speaker"),
    ).toBe(true);
    expect(
      timeline(plan(), [{ ...words[0]!, startMs: 4000, endMs: 16000 }]).at(-1),
    ).toMatchObject({ mode: "speaker", endMs: 10000 });
  });
  it.each(["overlap", "ambiguous"] as const)(
    "freezes validated geometry during %s and reacquires without going wide",
    (association) => {
      const input = plan(),
        item = input.shots[0]!.observations[0]!;
      input.shots[0]!.observations = [
        { ...item, endMs: 2000 },
        {
          ...item,
          startMs: 2000,
          endMs: 2500,
          box: null,
          association,
          evidenceWordIds: [],
        },
        { ...item, startMs: 2500, evidenceWordIds: [words[5]!.id] },
      ];
      const focus = timeline(input);
      expect(focus.find((s) => s.startMs === 2000)).toEqual({
        startMs: 2000,
        endMs: 2500,
        mode: "held",
        reason: "uncertain",
        box,
      });
      expect(focus.find((s) => s.startMs === 2500)).toMatchObject({
        mode: "speaker",
      });
    },
  );
  it.each(["absent", "offscreen"] as const)(
    "immediately resets on confirmed %s",
    (association) => {
      const input = plan(),
        item = input.shots[0]!.observations[0]!;
      input.shots[0]!.observations = [
        { ...item, endMs: 2000 },
        {
          ...item,
          startMs: 2000,
          box: null,
          association,
          visiblePeople: 0,
          evidenceWordIds: [],
        },
      ];
      expect(timeline(input).at(-1)).toMatchObject({
        startMs: 2000,
        mode: "wide",
        reason: association,
      });
    },
  );
  it("keeps a visible face when the speaking person is offscreen rather than widening", () => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    input.shots[0]!.observations = [
      { ...item, endMs: 2000 },
      {
        ...item,
        startMs: 2000,
        association: "offscreen",
        box: null,
        evidenceWordIds: [],
        visiblePeople: 1,
      },
    ];
    expect(timeline(input).at(-1)).toMatchObject({
      mode: "held",
      reason: "uncertain",
      box,
    });
    input.shots[0]!.openingFace = { box, confidence: 0.95 };
    input.shots[0]!.observations = [
      {
        ...item,
        association: "offscreen",
        box: null,
        evidenceWordIds: [],
        visiblePeople: 1,
      },
    ];
    expect(timeline(input)[0]).toMatchObject({
      startMs: 0,
      mode: "held",
      reason: "visible-face",
      box,
    });
  });
  it("holds observation gaps, low confidence and overlapping transcript evidence without invented matches", () => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    input.shots[0]!.observations = [
      { ...item, endMs: 2000 },
      {
        ...item,
        startMs: 2500,
        endMs: 3000,
        confidence: 0.84,
        evidenceWordIds: [words[5]!.id],
      },
      { ...item, startMs: 3000, evidenceWordIds: [words[6]!.id] },
    ];
    const focus = timeline(input, [
      ...words,
      { ...words[7]!, id: "w_999999", speakerId: null },
    ]);
    expect(focus.find((s) => s.startMs === 2000)).toMatchObject({
      mode: "held",
      reason: "observation-gap",
    });
    expect(focus.find((s) => s.startMs === 2500)).toMatchObject({
      mode: "held",
      reason: "uncertain",
    });
    expect(focus.find((s) => s.startMs === 3500)).toMatchObject({
      mode: "held",
      reason: "uncertain",
    });
  });
  it("cuts immediately to each new crop without motion fields across pauses and real shot cuts", () => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    input.shots[0]!.observations = [
      { ...item, endMs: 2000 },
      {
        ...item,
        startMs: 2000,
        evidenceWordIds: [words[4]!.id],
        box: { ...box, x: 0.7 },
      },
    ];
    const sourceWords = words.map((word) => ({
      ...word,
      endMs: word.endMs - 100,
    }));
    const focus = timeline(input, sourceWords);
    expect(focus.find((s) => s.startMs === 2000)).toMatchObject({
      box: { ...box, x: 0.7 },
    });
    for (const segment of focus) {
      expect(segment).not.toHaveProperty("fromBox");
      expect(segment).not.toHaveProperty("transitionMs");
      expect(segment).not.toHaveProperty("transitionStartMs");
    }
    input.shots = [
      {
        startMs: 0,
        endMs: 2000,
        observations: [input.shots[0]!.observations[0]!],
      },
      {
        startMs: 2000,
        endMs: 10000,
        observations: [input.shots[0]!.observations[1]!],
      },
    ];
    const cut = timeline(input);
    expect(cut.find((s) => s.startMs === 2000)).toMatchObject({
      mode: "held",
      reason: "visible-face",
      box: { ...box, x: 0.7 },
    });
    expect(cut.every((s) => !("fromBox" in s))).toBe(true);
  });
  it("does not collapse ordinary dense word pauses into a full-frame shot", () => {
    const dense = Array.from({ length: 100 }, (_, i) => ({
      ...words[0]!,
      id: `w_${String(i + 1).padStart(6, "0")}`,
      startMs: 5000 + i * 100,
      endMs: 5050 + i * 100,
    }));
    const focus = timeline(plan(), dense);
    expect(focus.length).toBeGreaterThan(120);
    expect(focus.some((s) => s.mode === "speaker")).toBe(true);
    for (const segment of focus)
      expect(focusSegmentV3Schema.safeParse(segment).success).toBe(true);
    expect(focus.at(-1)).toMatchObject({ mode: "held" });
  });
  it.each(["duration", "geometry", "cut", "rotation", "extra"])(
    "rejects %s corruption",
    (kind) => {
      const input = plan(),
        item = input.shots[0]!.observations[0]!;
      if (kind === "duration") input.durationMs = 11000;
      if (kind === "geometry") item.box = { ...box, x: 0.99 };
      if (kind === "cut") input.shots[0]!.startMs = 1;
      if (kind === "rotation")
        Object.assign(input, { coordinateSpace: "raw-sensor" });
      if (kind === "extra") Object.assign(input, { command: "synthetic" });
      expect(() => timeline(input)).toThrow();
    },
  );
  it.each(["unknown-word", "wrong-speaker", "outside-evidence"])(
    "warns for %s and never invents a speaker match from provisional geometry",
    (kind) => {
      const input = plan(),
        item = input.shots[0]!.observations[0]!;
      if (kind === "unknown-word") item.evidenceWordIds = ["w_999999"];
      if (kind === "wrong-speaker") item.speakerId = "spk_1";
      if (kind === "outside-evidence") item.startMs = 1000;
      const warnings: string[] = [];
      const focus = compileSpeakerFocus(input, context, (reason) =>
        warnings.push(reason),
      );
      expect(warnings).toEqual(["speaker_evidence_rejected"]);
      expect(focus.every((segment) => segment.mode === "held")).toBe(true);
    },
  );
  it("drops only a bad reference while preserving independently valid evidence and later observations", () => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    input.shots[0]!.observations = [
      { ...item, endMs: 2000, evidenceWordIds: [words[0]!.id, words[4]!.id] },
      { ...item, startMs: 8000, evidenceWordIds: [words[16]!.id] },
    ];
    const warnings: string[] = [];
    const focus = compileSpeakerFocus(input, context, (reason) =>
      warnings.push(reason),
    );
    expect(warnings).toEqual(["speaker_evidence_rejected"]);
    expect(focus.find((segment) => segment.startMs === 1000)).toMatchObject({
      mode: "speaker",
      box,
    });
    expect(focus.find((segment) => segment.startMs === 2000)).toMatchObject({
      mode: "held",
      endMs: 8000,
      box,
    });
    expect(focus.at(-1)).toMatchObject({ mode: "speaker", box });
    expect(input.shots[0]!.observations[0]!.evidenceWordIds).toHaveLength(2);
  });
  it("bounds observations globally and rejects observations crossing cuts", () => {
    const input = plan();
    input.shots[0]!.observations[0]!.endMs = 10001;
    expect(speakerPlanSchema.safeParse(input).success).toBe(false);
    const tooMany = plan();
    tooMany.shots[0]!.observations = Array.from({ length: 121 }, (_, i) => ({
      ...tooMany.shots[0]!.observations[0]!,
      startMs: i * 80,
      endMs: (i + 1) * 80,
    }));
    expect(speakerPlanSchema.safeParse(tooMany).success).toBe(false);
  });
});
