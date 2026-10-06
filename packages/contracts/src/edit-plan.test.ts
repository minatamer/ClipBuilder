import { describe, expect, it } from "vitest";
import {
  compositionManifestV2Schema,
  compositionManifestV3Schema,
} from "./edit-plan.schema.js";

const valid = () => ({
  version: 2,
  source: {
    fingerprint: "a".repeat(64),
    durationMs: 15_000,
    width: 160,
    height: 90,
  },
  range: { startMs: 0, endMs: 10_000 },
  output: { width: 1080, height: 1920, fps: 30 },
  focus: [{ startMs: 0, endMs: 10_000, mode: "wide" }],
  captions: [{ startMs: 0, endMs: 1500, text: "Synthetic test" }],
  cards: [],
});
describe("spoken-word composition policy", () => {
  const current = () =>
    compositionManifestV3Schema.parse({
      ...valid(),
      version: 3,
      focus: [
        {
          mode: "held",
          reason: "uncertain",
          startMs: 0,
          endMs: 10000,
          box: { x: 0.1, y: 0.1, width: 0.2, height: 0.3 },
        },
      ],
      captions: [
        {
          startMs: 0,
          endMs: 1500,
          text: "Synthetic test",
          lines: ["Synthetic test"],
          wordIds: ["w_000001", "w_000002"],
          wordCues: [
            { wordId: "w_000001", text: "Synthetic", startMs: 0, endMs: 600 },
            { wordId: "w_000002", text: "test", startMs: 800, endMs: 1500 },
          ],
        },
      ],
      cards: [
        {
          origin: "transcript-fallback",
          startMs: 2000,
          endMs: 3500,
          kind: "statement",
          title: "Test",
          lines: ["One grounded excerpt"],
        },
      ],
    });
  it("requires current cues and permits missing visuals while preserving immutable legacy parsing", () => {
    expect(compositionManifestV2Schema.parse(valid()).version).toBe(2);
    expect(compositionManifestV3Schema.safeParse(valid()).success).toBe(false);
    expect(
      compositionManifestV3Schema.safeParse({ ...current(), cards: [] })
        .success,
    ).toBe(true);
    expect(
      compositionManifestV3Schema.safeParse({ ...current(), jsx: "untrusted" })
        .success,
    ).toBe(false);
  });
  it("represents an instantaneous word cue without accepting reversed clocks", () => {
    const value = current();
    value.captions[0]!.wordCues[0]!.endMs = 0;
    expect(compositionManifestV3Schema.safeParse(value).success).toBe(true);
    value.captions[0]!.wordCues[1]!.endMs = 799;
    expect(compositionManifestV3Schema.safeParse(value).success).toBe(false);
  });
  it.each([
    "text",
    "id",
    "order",
    "end",
    "missing",
    "static-emphasis",
    "coverage",
    "orphan-clock",
    "uncertain-motion",
    "false-match",
  ])("rejects %s metadata corruption", (kind) => {
    const value = current();
    if (kind === "text") value.captions[0]!.wordCues[0]!.text = "invented";
    if (kind === "id") value.captions[0]!.wordCues[0]!.wordId = "w_999999";
    if (kind === "order") value.captions[0]!.wordCues.reverse();
    if (kind === "end") value.captions[0]!.wordCues[1]!.endMs = 1501;
    if (kind === "missing") value.captions[0]!.wordCues.pop();
    if (kind === "static-emphasis")
      Object.assign(value.captions[0]!, { emphasisWordIndex: 0 });
    if (kind === "coverage") value.focus[0]!.startMs = 1;
    if (kind === "orphan-clock")
      Object.assign(value.focus[0]!, { transitionMs: 1000 });
    if (kind === "uncertain-motion")
      Object.assign(value.focus[0]!, {
        fromBox: { x: 0.2, y: 0.1, width: 0.2, height: 0.3 },
        transitionStartMs: 0,
        transitionMs: 1000,
      });
    if (kind === "false-match")
      Object.assign(value.focus[0]!, { speaker: "spk_0", confidence: 0.99 });
    expect(compositionManifestV3Schema.safeParse(value).success).toBe(false);
  });
  it("uses a transition clock across pause subdivisions and permits bounded dense focus coverage", () => {
    const value = current();
    value.focus = Array.from({ length: 200 }, (_, index) => ({
      mode: "held",
      reason: "pause",
      startMs: index * 50,
      endMs: (index + 1) * 50,
      box: { x: 0.5, y: 0.1, width: 0.2, height: 0.3 },
      fromBox: { x: 0.1, y: 0.1, width: 0.2, height: 0.3 },
      transitionStartMs: 0,
      transitionMs: 1600,
    }));
    expect(compositionManifestV3Schema.safeParse(value).success).toBe(true);
  });
});
describe("fixed composition manifest", () => {
  it("accepts bounded source-relative manifest without executable inputs", () => {
    expect(compositionManifestV2Schema.parse(valid()).version).toBe(2);
    expect(
      compositionManifestV2Schema.safeParse({ ...valid(), jsx: "anything" })
        .success,
    ).toBe(false);
  });
  it("rejects stale-size, invalid range, focus gaps and out-of-frame boxes", () => {
    for (const change of [
      { range: { startMs: 10000, endMs: 20000 } },
      { focus: [{ mode: "wide", startMs: 40, endMs: 10000 }] },
      {
        focus: [
          {
            mode: "speaker",
            startMs: 0,
            endMs: 10000,
            confidence: 0.9,
            speaker: "speaker-1",
            box: { x: 0.9, y: 0, width: 0.2, height: 1 },
          },
        ],
      },
      { captions: [{ startMs: 9000, endMs: 11000, text: "Late" }] },
    ])
      expect(
        compositionManifestV2Schema.safeParse({ ...valid(), ...change })
          .success,
      ).toBe(false);
  });
  it("rejects overlapping or excessive contextual coverage", () => {
    const card = {
      startMs: 0,
      endMs: 3000,
      kind: "statement",
      title: "Test",
      lines: ["One"],
    };
    expect(
      compositionManifestV2Schema.safeParse({
        ...valid(),
        cards: [card, { ...card, startMs: 3000, endMs: 6000 }],
      }).success,
    ).toBe(false);
    expect(
      compositionManifestV2Schema.safeParse({
        ...valid(),
        cards: [card, { ...card, startMs: 2000, endMs: 4000 }],
      }).success,
    ).toBe(false);
  });
});
