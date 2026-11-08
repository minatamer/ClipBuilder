import { expect, it } from "vitest";
import {
  editorTourLayout,
  editorTourMasks,
  type TourBox,
} from "./editor-tour-layout";

const overlap = (a: TourBox, b: TourBox) =>
  Math.max(
    0,
    Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left),
  ) *
  Math.max(
    0,
    Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top),
  );

it.each([
  [1440, 900],
  [834, 900],
  [390, 844],
  [320, 430],
  [768, 430],
  [320, 270],
])(
  "keeps guide and real target separate at %ix%i, including visual viewport offsets",
  (width, height) => {
    for (const offset of [0, 70]) {
      const view = { left: 3, top: offset, width, height };
      for (const target of [
        {
          left: 18,
          top: offset + height / 2 - 7,
          width: Math.min(200, width - 36),
          height: 44,
        },
        {
          left: 18,
          top: offset + 75,
          width: Math.min(400, width - 36),
          height: 44,
        },
        { left: 18, top: offset + 30, width: width - 36, height: height + 200 },
        { left: 18, top: offset + height - 60, width: width - 36, height: 44 },
      ]) {
        const { spotlight, card } = editorTourLayout(target, view, 320);
        expect(card.left).toBeGreaterThanOrEqual(view.left);
        expect(card.top).toBeGreaterThanOrEqual(view.top);
        expect(card.left + card.width).toBeLessThanOrEqual(view.left + width);
        expect(card.top + card.maxHeight).toBeLessThanOrEqual(
          view.top + height,
        );
        if (spotlight) {
          expect(spotlight.width).toBeGreaterThan(0);
          expect(spotlight.height).toBeGreaterThan(0);
          expect(overlap(spotlight, { ...card, height: card.maxHeight })).toBe(
            0,
          );
          // Any cropped window still intersects the actual target.
          expect(overlap(spotlight, target)).toBeGreaterThan(0);
          if (width === 320 && height === 430 && target.height === 44)
            expect(spotlight.height).toBeGreaterThanOrEqual(target.height);
        }
        const masks = editorTourMasks(spotlight, view);
        for (const mask of masks) {
          expect(mask.width).toBeGreaterThanOrEqual(0);
          expect(mask.height).toBeGreaterThanOrEqual(0);
          if (spotlight) expect(overlap(mask, spotlight)).toBe(0);
        }
        const area =
          masks.reduce((sum, box) => sum + box.width * box.height, 0) +
          (spotlight ? spotlight.width * spotlight.height : 0);
        expect(area).toBeCloseTo(width * height, 5);
      }
    }
  },
);

it("keeps a missing or offscreen target dismissible without an invented highlight", () => {
  const view = { left: 0, top: 0, width: 390, height: 844 };
  expect(editorTourLayout(null, view, 320).spotlight).toBeNull();
  expect(
    editorTourLayout({ left: 0, top: 1000, width: 100, height: 44 }, view, 320)
      .spotlight,
  ).toBeNull();
});

it("keeps selected navigation in a tall panel's phone spotlight", () => {
  const navigation = { left: 22, top: 150, width: 290, height: 105 };
  const { spotlight, card } = editorTourLayout(
    { left: 18, top: 150, width: 350, height: 600 },
    { left: 0, top: 0, width: 390, height: 844 },
    320,
    navigation,
  );
  expect(spotlight).not.toBeNull();
  expect(overlap(spotlight!, navigation)).toBe(
    navigation.width * navigation.height,
  );
  expect(overlap(spotlight!, { ...card, height: card.maxHeight })).toBe(0);
});
