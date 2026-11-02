import { expect, it } from "vitest";
import { ownerOverlayFrame } from "./overlay-frame.ts";
import {
  ownerOverlaySchema,
  type OwnerOverlay,
} from "../../contracts/local/clips.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../contracts/local/text-style.ts";

const title = {
  id: crypto.randomUUID(),
  text: "A synthetic opening",
  role: "opening-title" as const,
  startFrame: 0,
  endFrame: 45,
  style: {
    ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
    box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
  },
};
const overlay: OwnerOverlay = {
  version: 1,
  frames: 180,
  captions: [],
  visuals: [],
  hook: { startFrame: 90, endFrame: 105 },
  texts: [title],
};

it("shows a generated title once from Hook frame zero through a short-Hook body transition", () => {
  for (let frame = 0; frame < 195; frame++)
    expect(ownerOverlayFrame(overlay, frame).texts.length).toBe(
      frame < 45 ? 1 : 0,
    );
  expect(ownerOverlayFrame({ ...overlay, hook: undefined }, 0).texts).toEqual([
    title,
  ]);
  expect(
    ownerOverlayFrame(
      { ...overlay, hook: { startFrame: 60, endFrame: 120 } },
      0,
    ).texts,
  ).toEqual([title]);
  expect(
    ownerOverlayFrame(
      { ...overlay, hook: { startFrame: 60, endFrame: 120 } },
      60,
    ).texts,
  ).toEqual([]);
});

it("preserves source-clock behavior for legacy and ordinary manual text", () => {
  const legacy = { ...title, role: undefined };
  const old = ownerOverlaySchema.parse({ ...overlay, texts: [legacy] });
  expect(ownerOverlayFrame(old, 0).texts).toEqual([]);
  expect(ownerOverlayFrame(old, 15).texts).toEqual([legacy]);
  expect(ownerOverlayFrame(old, 60).texts).toEqual([]);
  const restored = ownerOverlaySchema.parse(
    JSON.parse(JSON.stringify(overlay)),
  );
  expect(ownerOverlayFrame(restored, 0).texts[0]).toEqual(title);
});

for (const fps of [24, 25, 30000 / 1001, 30, 60])
  it(`uses the measured native Hook prefix for a continuous once-only title at ${fps}fps`, () => {
    const prefix = (Math.round((15 * fps) / 30) / fps) * 30;
    for (const hook of [true, false]) {
      const start = hook ? 90 : 0;
      for (let frame = 0; frame < (hook ? prefix : 180); frame++) {
        const result = ownerOverlayFrame(overlay, frame, {
          hook,
          sourceStartFrame: start,
          sourceEndFrame: start + (hook ? prefix : 180),
          presentationStartFrame: hook ? 0 : prefix,
          frames: Math.ceil(hook ? prefix : 180),
        });
        expect(result.texts.length).toBe(
          frame + (hook ? 0 : prefix) < 45 ? 1 : 0,
        );
      }
    }
  });
