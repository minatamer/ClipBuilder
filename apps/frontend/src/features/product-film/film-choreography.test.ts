import { describe, expect, it } from "vitest";
import {
  filmStage,
  conversationRect,
  filmNarrative,
} from "./film-choreography";
import { filmDuration, FILM_TIMELINES } from "./film-timeline";

describe("content-led film choreography", () => {
  it("integrates varied copy with full-canvas scenes and leaves action-only passages", () => {
    for (const height of [1080, 1440, 1536]) {
      for (const frame of [90, 195, 268, 460]) {
        const stage = filmStage("walkthrough", frame, height, 30);
        expect(stage.window).toEqual(stage.canvas);
        expect(stage.narrative.opacity).toBeGreaterThan(0.9);
      }
      expect(filmNarrative("choose", 28, height).rect.x).toBeGreaterThan(1000);
      expect(filmNarrative("review", 25, height).rect.y).toBeGreaterThan(
        filmNarrative("intake", 30, height).rect.y,
      );
      for (const frame of [130, 220, 310, 390, 510])
        expect(
          filmStage("walkthrough", frame, height, 30).narrative.opacity,
        ).toBe(0);
      const open = filmStage("walkthrough", 25, height, 30);
      expect(open.conversation.rect).toEqual(open.canvas);
      expect(open.conversationImmersion).toBe(1);
    }
  });
  it("keeps objects finite, visible media covered and the shown cursor inside its workspace", () => {
    for (const variant of ["walkthrough", "style"] as const)
      for (const height of [1080, 1440, 1536])
        for (let frame = 0; frame < filmDuration(variant); frame++) {
          const stage = filmStage(variant, frame, height, 30);
          for (const layer of [stage.conversation, stage.portrait]) {
            for (const value of Object.values(layer.rect))
              expect(Number.isFinite(value)).toBe(true);
            expect(layer.rect.width).toBeGreaterThan(0);
            expect(layer.rect.height).toBeGreaterThan(0);
            expect(layer.opacity).toBeGreaterThanOrEqual(0);
            expect(layer.opacity).toBeLessThanOrEqual(1);
          }
          if (stage.portrait.opacity > 0.02) {
            for (const bounds of [stage.portrait.rect, stage.portraitClip]) {
              const details = stage.portraitDetails;
              expect(details.width).toBeGreaterThan(0);
              expect(details.height).toBeGreaterThan(0);
              expect(details.x).toBeGreaterThanOrEqual(bounds.x - 0.001);
              expect(details.y).toBeGreaterThanOrEqual(bounds.y - 0.001);
              expect(details.x + details.width).toBeLessThanOrEqual(
                bounds.x + bounds.width + 0.001,
              );
              expect(details.y + details.height).toBeLessThanOrEqual(
                bounds.y + bounds.height + 0.001,
              );
            }
          }
          if (stage.screenOpacity > 0.01) {
            const { pose, window } = stage;
            expect(pose.x).toBeLessThanOrEqual(0.001);
            expect(pose.y).toBeLessThanOrEqual(0.001);
            expect(pose.x + 1440 * pose.scale).toBeGreaterThanOrEqual(
              window.width - 0.001,
            );
            expect(pose.y + 1000 * pose.scale).toBeGreaterThanOrEqual(
              window.height - 0.001,
            );
            if (pose.cursor && pose.cursor.opacity > 0.02) {
              const x = pose.x + pose.cursor.x * pose.scale,
                y = pose.y + pose.cursor.y * pose.scale;
              expect(x).toBeGreaterThanOrEqual(0);
              expect(y).toBeGreaterThanOrEqual(0);
              expect(x + 40 * pose.scale).toBeLessThanOrEqual(
                window.width + 0.001,
              );
              expect(y + 48 * pose.scale).toBeLessThanOrEqual(
                window.height + 0.001,
              );
            }
          }
        }
  });
  it("changes only type through the repeated conversation scene and exact loop seam", () => {
    for (const height of [1080, 1440, 1536]) {
      const end = filmStage("walkthrough", 719, height, 30);
      for (const frame of [0, 1, 6, 12, 24, 40, 59]) {
        const stage = filmStage("walkthrough", frame, height, 30);
        expect(stage.transition).toBe("type-only");
        expect(stage.conversation).toEqual(end.conversation);
        expect(stage.conversation.rect).toEqual(conversationRect(height));
        expect(stage.conversationFraming).toBe(0);
        expect(stage.screenOpacity).toBe(0);
        expect(stage.portrait.opacity).toBe(0);
      }
    }
  });
  it("continues the analysis cards without moving or rebuilding them at the moment-list cut", () => {
    const before = filmStage("walkthrough", 239, 1536, 30),
      after = filmStage("walkthrough", 240, 1536, 30);
    expect(before.cardsProgress).toBe(1);
    expect(after.cardsProgress).toBe(1);
    expect(before.cardsOpacity).toBe(1);
    expect(after.cardsOpacity).toBe(1);
    expect(after.pose.x).toBe(before.pose.x);
    expect(after.pose.y).toBe(before.pose.y);
    expect(after.pose.scale).toBe(before.pose.scale);
  });
  it("clears the loading capture before card formation and never restores it at the list seam", () => {
    for (const height of [1080, 1440, 1536]) {
      let previous = 1;
      for (let frame = 198; frame <= 270; frame++) {
        const stage = filmStage("walkthrough", frame, height, 30);
        expect(stage.analysisOpacity).toBeLessThanOrEqual(previous);
        previous = stage.analysisOpacity;
        if (stage.cardsProgress > 0) expect(stage.analysisOpacity).toBe(0);
      }
      expect(filmStage("walkthrough", 198, height, 30).analysisOpacity).toBe(1);
      expect(filmStage("walkthrough", 210, height, 30).cardsProgress).toBe(0);
      expect(
        filmStage("walkthrough", 234, height, 30).cardsOpacity,
      ).toBeGreaterThan(0.9);
    }
  });
  it("carries the same portrait from build into editor, out to result and then widens its framing", () => {
    for (const height of [1080, 1440, 1536]) {
      const selected = filmStage("walkthrough", 329, height, 30);
      const split = filmStage("walkthrough", 330, height, 30);
      expect(split.conversation).toEqual(selected.conversation);
      expect(split.portrait).toEqual(selected.conversation);
      expect(split.conversation.opacity).toBe(1);
      expect(filmStage("walkthrough", 342, height, 30).portrait.opacity).toBe(
        1,
      );
      const editorEntry = filmStage("walkthrough", 447, height, 30);
      expect(editorEntry.screenOpacity).toBe(0);
      expect(editorEntry.conversation.rect.width).toBe(8);
    }
    for (const [beforeFrame, afterFrame] of [
      [434, 435],
      [539, 540],
    ] as const) {
      const before = filmStage("walkthrough", beforeFrame, 1440, 30),
        after = filmStage("walkthrough", afterFrame, 1440, 30);
      for (const key of ["x", "y", "width", "height"] as const)
        expect(after.portrait.rect[key]).toBeCloseTo(
          before.portrait.rect[key],
          5,
        );
    }
    const before = filmStage("walkthrough", 659, 1440, 30),
      after = filmStage("walkthrough", 660, 1440, 30);
    expect(after.conversation.rect).toEqual(before.portrait.rect);
    expect(after.conversationFraming).toBe(1);
    expect(filmStage("walkthrough", 689, 1440, 30).conversationFraming).toBe(0);
    expect(
      new Set(
        FILM_TIMELINES.walkthrough.map(
          (shot) => filmStage("walkthrough", shot.from, 1440, 30).transition,
        ),
      ).size,
    ).toBe(8);
  });
});
