import { expect, it } from "vitest";
import { slidingHighlight } from "./sliding-highlight.ts";
import { ownerOverlayFrame } from "./overlay-frame.ts";
import { syntheticTextClip } from "../../../test/owner-text-fixture.ts";
import { OWNER_CAPTION_PRESETS } from "../../contracts/local/editor.ts";

const cues = [
  { wordId: "one", startMs: 0, endMs: 500 },
  { wordId: "two", startMs: 500, endMs: 1000 },
  { wordId: "three", startMs: 1300, endMs: 1320 },
];
const boxes = cues.map((cue, index) => ({
  wordId: cue.wordId,
  left: index * 100,
  top: 0,
  width: 60 + index * 20,
  height: 40,
}));

it("slides one rectangle sideways and resizes it on the media clock, hiding in silence", () => {
  expect(slidingHighlight(boxes, cues, -1)).toBeNull();
  expect(slidingHighlight(boxes, cues, 0)).toMatchObject({
    left: 0,
    width: 60,
  });
  expect(slidingHighlight(boxes, cues, 500)).toMatchObject({
    left: 0,
    width: 60,
  });
  expect(slidingHighlight(boxes, cues, 540)).toMatchObject({
    left: 50,
    width: 70,
  });
  expect(slidingHighlight(boxes, cues, 580)).toMatchObject({
    left: 100,
    width: 80,
  });
  expect(slidingHighlight(boxes, cues, 1000)).toBeNull();
  expect(slidingHighlight(boxes, cues, 1300)).toMatchObject({
    left: 200,
    width: 100,
  });
  expect(slidingHighlight(boxes, cues, 1320)).toBeNull();
});

it("resets across lines, handles short cues/overlap and admits unordered provider timing", () => {
  expect(slidingHighlight(boxes.slice(1), cues, 500)).toMatchObject({
    left: 100,
  });
  expect(
    slidingHighlight([boxes[0]!, { ...boxes[1]!, top: 80 }], cues, 500),
  ).toMatchObject({ left: 100, top: 80 });
  const short = [
    { ...cues[0]!, endMs: 600 },
    { ...cues[1]!, endMs: 520 },
  ];
  expect(slidingHighlight(boxes, short, 510)).toMatchObject({
    left: 50,
    width: 70,
  });
  expect(slidingHighlight(boxes, [...short].reverse(), 510)).toMatchObject({
    left: 50,
  });
  expect(slidingHighlight(boxes, short, 520)).toMatchObject({ left: 0 });
});

it("keeps native raster reuse safe throughout sliding motion and short silent gaps", () => {
  const overlay = {
    ...syntheticTextClip().base!.overlay,
    captionStyle: {
      ...OWNER_CAPTION_PRESETS.tiktok,
      animation: "slide" as const,
    },
    captions: [
      {
        startMs: 0,
        endMs: 3000,
        text: "ONE TWO THREE",
        lines: ["ONE TWO THREE"],
        wordIds: cues.map((cue) => cue.wordId),
        wordCues: cues.map((cue, i) => ({
          ...cue,
          text: ["ONE", "TWO", "THREE"][i]!,
        })),
      },
    ],
  };
  const seen = new Map<string, string>();
  for (let frame = 0; frame < 90; frame++) {
    const state = ownerOverlayFrame(overlay, frame),
      paint = JSON.stringify(slidingHighlight(boxes, cues, state.ms));
    if (seen.has(state.key)) expect(paint).toBe(seen.get(state.key));
    else seen.set(state.key, paint);
  }
  expect(
    slidingHighlight(boxes, cues, ownerOverlayFrame(overlay, 16).ms)?.left,
  ).toBeGreaterThan(0);
  expect(ownerOverlayFrame(overlay, 16).key).not.toBe(
    ownerOverlayFrame(overlay, 17).key,
  );
});
