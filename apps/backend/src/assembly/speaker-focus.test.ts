import { describe, expect, it } from "vitest";
import {
  speakerPlanSchema,
  compositionManifestV2Schema,
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
describe("selected-range anonymous speaker focus", () => {
  it("grounds clip-relative matches in selected source words", () => {
    expect(compileSpeakerFocus(plan(), context)).toEqual([
      {
        startMs: 0,
        endMs: 10000,
        mode: "speaker",
        speaker: "spk_0",
        confidence: 0.95,
        box,
      },
    ]);
  });
  it("uses actual speech duration for a brief turn padded by provider silence", () => {
    const sourceWords = [
      { ...words[0]!, startMs: 5000, endMs: 7000 },
      { ...words[1]!, startMs: 7000, endMs: 7500, speakerId: "spk_1" },
      { ...words[2]!, startMs: 14000, endMs: 15000 },
    ];
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    input.shots[0]!.observations = [
      {
        ...item,
        startMs: 0,
        endMs: 2000,
        evidenceWordIds: [sourceWords[0]!.id],
      },
      {
        ...item,
        startMs: 2000,
        endMs: 9000,
        speakerId: "spk_1",
        evidenceWordIds: [sourceWords[1]!.id],
      },
      {
        ...item,
        startMs: 9000,
        endMs: 10000,
        evidenceWordIds: [sourceWords[2]!.id],
      },
    ];
    const focus = compileSpeakerFocus(input, {
      ...context,
      words: sourceWords,
    });
    expect(
      focus
        .filter((segment) => segment.mode === "speaker")
        .map((segment) => ({
          startMs: segment.startMs,
          endMs: segment.endMs,
          speaker: segment.speaker,
        })),
    ).toEqual([
      { startMs: 0, endMs: 2000, speaker: "spk_0" },
      { startMs: 9000, endMs: 10000, speaker: "spk_0" },
    ]);
    expect(
      focus
        .filter((segment) => segment.startMs >= 2000 && segment.endMs <= 9000)
        .every((segment) => segment.mode === "wide"),
    ).toBe(true);
  });
  it.each(["overlap", "offscreen", "absent", "ambiguous"] as const)(
    "uses wide for %s",
    (association) => {
      const input = plan();
      input.shots[0]!.observations[0]!.association = association;
      input.shots[0]!.observations[0]!.box = null;
      expect(compileSpeakerFocus(input, context)[0]!.mode).toBe("wide");
    },
  );
  it("uses wide for low confidence, unknown speech, or audible overlap", () => {
    const input = plan();
    input.shots[0]!.observations[0]!.confidence = 0.84;
    expect(compileSpeakerFocus(input, context)[0]!.mode).toBe("wide");
    for (const speakerId of [null, "spk_1"]) {
      expect(
        compileSpeakerFocus(plan(), {
          ...context,
          words: [...words, { ...words[1]!, id: "w_999999", speakerId }],
        })[0]!.mode,
      ).toBe("wide");
    }
  });
  it("fills silence/gaps with wide and suppresses a short interjection", () => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    item.startMs = 1000;
    item.endMs = 1500;
    item.evidenceWordIds = [words[2]!.id];
    expect(
      compileSpeakerFocus(input, { ...context, words: [words[2]!] }),
    ).toEqual([
      { startMs: 0, endMs: 1000, mode: "wide" },
      { startMs: 1000, endMs: 1500, mode: "wide" },
      { startMs: 1500, endMs: 10000, mode: "wide" },
    ]);
    expect(
      compileSpeakerFocus(
        { ...input, shots: [{ startMs: 0, endMs: 10000, observations: [] }] },
        context,
      ),
    ).toEqual([{ startMs: 0, endMs: 10000, mode: "wide" }]);
  });
  it("emits wide for internal and trailing silence and resets motion after the gap", () => {
    const sourceWords = [
      { ...words[0]!, startMs: 5000, endMs: 7000 },
      { ...words[1]!, startMs: 9000, endMs: 11000 },
    ];
    const focus = compileSpeakerFocus(plan(), {
      ...context,
      words: sourceWords,
    });
    expect(focus).toEqual([
      {
        startMs: 0,
        endMs: 2000,
        mode: "speaker",
        speaker: "spk_0",
        confidence: 0.95,
        box,
      },
      { startMs: 2000, endMs: 4000, mode: "wide" },
      {
        startMs: 4000,
        endMs: 6000,
        mode: "speaker",
        speaker: "spk_0",
        confidence: 0.95,
        box,
      },
      { startMs: 6000, endMs: 10000, mode: "wide" },
    ]);
  });
  it.each([999, 1000])(
    "counts %i ms of voiced coverage without adding silent word pauses",
    (speechMs) => {
      const sourceWords = [
        { ...words[0]!, startMs: 5000, endMs: 5500 },
        { ...words[1]!, startMs: 10000, endMs: 10000 + speechMs - 500 },
      ];
      const focus = compileSpeakerFocus(plan(), {
        ...context,
        words: sourceWords,
      });
      const matched = focus.filter((segment) => segment.mode === "speaker");
      expect(
        matched.reduce(
          (total, segment) => total + segment.endMs - segment.startMs,
          0,
        ),
      ).toBe(speechMs === 1000 ? 1000 : 0);
      expect(
        focus.find(
          (segment) => segment.startMs === 500 && segment.endMs === 5000,
        )?.mode,
      ).toBe("wide");
    },
  );
  it("does not double-count overlapping word timestamps for the same speaker", () => {
    const sourceWords = [
      { ...words[0]!, startMs: 5000, endMs: 5700 },
      { ...words[1]!, startMs: 5200, endMs: 5900 },
    ];
    expect(
      compileSpeakerFocus(plan(), { ...context, words: sourceWords }).every(
        (segment) => segment.mode === "wide",
      ),
    ).toBe(true);
  });
  it("keeps a sustained turn through provider subdivision with bounded pan, and resets at cuts", () => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    input.shots[0]!.observations = words.map((word, index) => ({
      ...item,
      startMs: index * 500,
      endMs: (index + 1) * 500,
      evidenceWordIds: [word.id],
      box: index === 0 ? box : { ...box, x: 0.7 },
    }));
    const focus = compileSpeakerFocus(input, context);
    expect(focus).toHaveLength(20);
    expect(focus.every((segment) => segment.mode === "speaker")).toBe(true);
    for (const segment of focus.slice(1)) {
      if (segment.mode !== "speaker" || !segment.fromBox)
        throw new Error("missing-sustained-focus");
      const from = segment.fromBox;
      expect(
        Math.hypot(
          segment.box.x + segment.box.width / 2 - from.x - from.width / 2,
          segment.box.y + segment.box.height / 2 - from.y - from.height / 2,
        ),
      ).toBeLessThanOrEqual(0.125 + Number.EPSILON);
    }
    input.shots = input.shots[0]!.observations.map((observation) => ({
      startMs: observation.startMs,
      endMs: observation.endMs,
      observations: [observation],
    }));
    const cutFocus = compileSpeakerFocus(input, context);
    expect(
      cutFocus.every(
        (segment) => segment.mode === "speaker" && !segment.fromBox,
      ),
    ).toBe(true);
  });
  it("localizes overlap and unknown speech to wide intervals instead of extending a crop through them", () => {
    const sourceWords = [
      { ...words[0]!, startMs: 5000, endMs: 15000 },
      { ...words[1]!, startMs: 7000, endMs: 7500, speakerId: "spk_1" },
      { ...words[2]!, startMs: 10000, endMs: 10500, speakerId: null },
    ];
    const focus = compileSpeakerFocus(plan(), {
      ...context,
      words: sourceWords,
    });
    expect(
      focus.map(({ startMs, endMs, mode }) => ({ startMs, endMs, mode })),
    ).toEqual([
      { startMs: 0, endMs: 2000, mode: "speaker" },
      { startMs: 2000, endMs: 2500, mode: "wide" },
      { startMs: 2500, endMs: 5000, mode: "speaker" },
      { startMs: 5000, endMs: 5500, mode: "wide" },
      { startMs: 5500, endMs: 10000, mode: "speaker" },
    ]);
    for (const segment of focus) expect(segment).not.toHaveProperty("fromBox");
  });
  it("clips transcript coverage to the selected range and ignores speech outside it", () => {
    const sourceWords = [
      { ...words[1]!, startMs: 0, endMs: 5000, speakerId: "spk_1" },
      { ...words[0]!, startMs: 4000, endMs: 16000 },
      { ...words[2]!, startMs: 15000, endMs: 17000, speakerId: null },
    ];
    expect(
      compileSpeakerFocus(plan(), { ...context, words: sourceWords }),
    ).toEqual([
      {
        startMs: 0,
        endMs: 10000,
        mode: "speaker",
        speaker: "spk_0",
        confidence: 0.95,
        box,
      },
    ]);
  });
  it("falls back to bounded complete wide coverage when transcript splits exceed the geometry limit", () => {
    const sourceWords = Array.from({ length: 100 }, (_, index) => ({
      ...words[0]!,
      id: `w_${String(index + 1).padStart(6, "0")}`,
      startMs: 5000 + index * 100,
      endMs: 5050 + index * 100,
    }));
    const focus = compileSpeakerFocus(plan(), {
      ...context,
      words: sourceWords,
    });
    expect(focus).toEqual([{ startMs: 0, endMs: 10000, mode: "wide" }]);
    expect(
      compositionManifestV2Schema.shape.focus.safeParse(focus).success,
    ).toBe(true);
  });
  it("limits continuous-shot pan velocity and resets at a camera cut", () => {
    const input = plan(),
      first = input.shots[0]!.observations[0]!;
    first.endMs = 9000;
    input.shots[0]!.observations.push({
      ...first,
      startMs: 9000,
      endMs: 10000,
      evidenceWordIds: [words[18]!.id],
      box: { ...box, x: 0.7 },
    });
    const focus = compileSpeakerFocus(input, context),
      second = focus[1]!;
    expect(second.mode).toBe("speaker");
    if (second.mode === "speaker") {
      expect(second.fromBox).toEqual(box);
      expect(second.box.x - box.x).toBeCloseTo(0.25);
    }
    input.shots = [
      { startMs: 0, endMs: 9000, observations: [first] },
      {
        startMs: 9000,
        endMs: 10000,
        observations: [input.shots[0]!.observations[1]!],
      },
    ];
    expect(compileSpeakerFocus(input, context)[1]).not.toHaveProperty(
      "fromBox",
    );
  });
  it.each([
    "duration",
    "geometry",
    "cut",
    "rotation",
    "unknown-word",
    "wrong-speaker",
    "outside-evidence",
    "extra",
  ])("rejects %s corruption", (kind) => {
    const input = plan(),
      item = input.shots[0]!.observations[0]!;
    if (kind === "duration") input.durationMs = 11000;
    if (kind === "geometry") item.box = { ...box, x: 0.99 };
    if (kind === "cut") input.shots[0]!.startMs = 1;
    if (kind === "rotation")
      Object.assign(input, { coordinateSpace: "raw-sensor" });
    if (kind === "unknown-word") item.evidenceWordIds = ["w_999999"];
    if (kind === "wrong-speaker") item.speakerId = "spk_1";
    if (kind === "outside-evidence") {
      item.startMs = 1000;
    }
    if (kind === "extra") Object.assign(input, { command: "synthetic" });
    expect(() => compileSpeakerFocus(input, context)).toThrow();
  });
  it("bounds observations globally and refuses observations crossing cuts", () => {
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
