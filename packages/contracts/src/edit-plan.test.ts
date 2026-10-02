import { describe, expect, it } from "vitest";
import { compositionManifestV2Schema } from "./edit-plan.schema.js";

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
