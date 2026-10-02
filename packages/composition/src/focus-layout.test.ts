import { describe, expect, it } from "vitest";
import { focusLayout } from "./focus-layout.js";
const source = {
  width: 1920,
  height: 1080,
  fingerprint: "a".repeat(64),
  durationMs: 15_000,
};
describe("shared preview/render geometry", () => {
  it("contains the full shot for ambiguous or overlapping speech", () => {
    expect(
      focusLayout(
        source,
        { mode: "wide", startMs: 0, endMs: 10_000 },
        1080,
        1920,
      ),
    ).toEqual({ width: 1080, height: 607.5, left: 0, top: 656.25 });
  });
  it("clamps speaker crops to source edges without blank margins", () => {
    for (const x of [0, 0.9]) {
      const layout = focusLayout(
        source,
        {
          mode: "speaker",
          startMs: 0,
          endMs: 10_000,
          confidence: 0.9,
          speaker: "spk_0",
          box: { x, y: 0, width: 0.1, height: 0.2 },
        },
        1080,
        1920,
      );
      expect(layout.left).toBeLessThanOrEqual(0);
      expect(layout.left + layout.width).toBeGreaterThanOrEqual(1080);
      expect(layout.top).toBe(0);
      expect(layout.height).toBe(1920);
    }
  });
});
