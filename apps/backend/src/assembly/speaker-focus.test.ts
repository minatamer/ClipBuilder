import { describe, expect, it } from "vitest";
import {
  speakerPlanSchema,
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
    expect(compileSpeakerFocus(input, context)).toEqual([
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
