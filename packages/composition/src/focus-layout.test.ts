import { describe, expect, it } from "vitest";
import { focusLayout } from "./focus-layout.js";
const source = {
  width: 1920,
  height: 1080,
  fingerprint: "a".repeat(64),
  durationMs: 15_000,
};
describe("shared preview/render geometry", () => {
  it("zooms tight face evidence into the vertical frame and places it above picture/caption overlays", () => {
    const box = { x: 0.2, y: 0.35, width: 0.1, height: 0.12 };
    const layout = focusLayout(
      source,
      {
        startMs: 0,
        endMs: 15000,
        mode: "speaker",
        speaker: "spk_0",
        confidence: 0.95,
        box,
      },
      1080,
      1920,
    );
    expect(layout.height).toBeGreaterThan(1920);
    expect(box.height * layout.height).toBeGreaterThanOrEqual(1920 * 0.3);
    expect(layout.top + (box.y + box.height / 2) * layout.height).toBeCloseTo(
      1920 * 0.38,
    );
    expect(layout.left).toBeLessThanOrEqual(0);
    expect(layout.left + layout.width).toBeGreaterThanOrEqual(1080);
  });
  it("holds the identical target crop across a pause even when legacy tween fields exist", () => {
    const path = {
      mode: "speaker" as const,
      speaker: "spk_0",
      confidence: 0.95,
      startMs: 2000,
      endMs: 2400,
      fromBox: { x: 0.1, y: 0.2, width: 0.2, height: 0.3 },
      box: { x: 0.7, y: 0.2, width: 0.2, height: 0.3 },
      transitionStartMs: 2000,
      transitionMs: 2400,
    };
    const held = {
      mode: "held" as const,
      reason: "pause" as const,
      startMs: 2400,
      endMs: 2600,
      fromBox: path.fromBox,
      box: path.box,
      transitionStartMs: path.transitionStartMs,
      transitionMs: path.transitionMs,
    };
    expect(focusLayout(source, path, 1080, 1920, 2400)).toEqual(
      focusLayout(source, held, 1080, 1920, 2400),
    );
    const after = { ...path, startMs: 2600, endMs: 3000 };
    expect(focusLayout(source, held, 1080, 1920, 2600)).toEqual(
      focusLayout(source, after, 1080, 1920, 2600),
    );
  });
  it("cuts to the target on the first frame for upright landscape, portrait and square sources", () => {
    const focus = {
      mode: "speaker" as const,
      startMs: 0,
      endMs: 2000,
      confidence: 0.95,
      speaker: "spk_0",
      fromBox: { x: 0, y: 0, width: 0.2, height: 0.3 },
      box: { x: 0.7, y: 0.6, width: 0.2, height: 0.3 },
    };
    for (const [width, height] of [
      [1920, 1080],
      [1080, 1920],
      [1080, 1080],
    ]) {
      const input = { ...source, width: width!, height: height! };
      for (const ms of [0, 500, 1000, 2000]) {
        const layout = focusLayout(input, focus, 1080, 1920, ms);
        expect(layout.left).toBeLessThanOrEqual(0);
        expect(layout.top).toBeLessThanOrEqual(0);
        expect(layout.left + layout.width).toBeGreaterThanOrEqual(1080);
        expect(layout.top + layout.height).toBeGreaterThanOrEqual(1920);
      }
      const middle = focusLayout(input, focus, 1080, 1920, 1000);
      expect(middle).toEqual(
        focusLayout(
          input,
          {
            ...focus,
            fromBox: undefined,
            box: focus.box,
          },
          1080,
          1920,
        ),
      );
    }
  });
  it("contains the full shot when an explicit wide segment is supplied", () => {
    expect(
      focusLayout(
        source,
        { mode: "wide", reason: "initial", startMs: 0, endMs: 10_000 },
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
      expect(layout.height).toBeGreaterThanOrEqual(1920);
    }
  });
});
