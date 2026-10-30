import { expect, it } from "vitest";
import { ownerOverlayFrame } from "./overlay-frame.ts";
import { ownerVisualMotion } from "./visual-motion.ts";
import {
  ownerAudioSegments,
  resolveOwnerAudioCues,
  type OwnerAudioCue,
} from "../../contracts/local/audio.ts";
import {
  ownerVisualOccurrences,
  ownerOverlayClockSchema,
} from "../../contracts/local/visual-clock.ts";
import type { OwnerOverlay } from "../../contracts/local/clips.ts";

const visual = {
  id: crypto.randomUUID(),
  assetId: crypto.randomUUID(),
  digest: "a".repeat(64),
  origin: "synthetic" as const,
  startFrame: 17,
  endFrame: 63,
  box: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
  fit: "contain" as const,
};
const cue: OwnerAudioCue = {
  id: crypto.randomUUID(),
  visualId: visual.id,
  source: { kind: "builtin", id: "pop" },
  placement: "clip",
  startFrame: 17,
  endFrame: 26,
  offsetFrame: 0,
  volume: 35,
  loop: false,
};

for (const fps of [24, 25, 30000 / 1001, 30, 60]) {
  it(`matches the first/last actually painted frame at ${fps} fps across Hook cuts and motion`, () => {
    for (const entrance of ["none", "fade", "pop", "slide"] as const)
      for (const exit of ["none", "fade"] as const)
        for (const length of [1, 2, 3, 46])
          for (const hook of [
            undefined,
            { startFrame: 0, endFrame: 10 },
            { startFrame: 9, endFrame: 35 },
            { startFrame: 17, endFrame: 28 },
            { startFrame: 19, endFrame: 39 },
            { startFrame: 61, endFrame: 73 },
            { startFrame: 70, endFrame: 81 },
          ]) {
            const image = {
              ...visual,
              endFrame: visual.startFrame + length,
              entrance,
              exit,
              animationFrames: 9,
            };
            const overlay: OwnerOverlay = {
              version: 1,
              frames: 90,
              captions: [],
              visuals: [image],
              ...(hook ? { hook } : {}),
            };
            const hookFrames = hook
              ? Math.max(
                  1,
                  Math.round(((hook.endFrame - hook.startFrame) * fps) / 30),
                )
              : 0;
            const hookSource = hook
              ? Math.floor((hook.startFrame * fps) / 30 + 1e-9) / fps
              : 0;
            const bodyFrames = Math.round((90 * fps) / 30);
            const clock = {
              fps,
              hookSeconds: hookFrames / fps,
              hookSourceSeconds: hookSource,
              bodySeconds: bodyFrames / fps,
            };
            const expected: { start: number; end: number }[] = [];
            for (const part of [
              ...(hook
                ? [
                    {
                      hook: true,
                      count: hookFrames,
                      prefix: 0,
                      source: hookSource * 30,
                    },
                  ]
                : []),
              { hook: false, count: bodyFrames, prefix: hookFrames, source: 0 },
            ]) {
              let start: number | undefined;
              for (let f = 0; f <= part.count; f++) {
                const rendered = ownerOverlayFrame(
                  overlay,
                  Math.floor((f * 30) / fps + 1e-9),
                  {
                    hook: part.hook,
                    sourceStartFrame: part.source,
                    sourceEndFrame: part.source + (part.count * 30) / fps,
                    frames: Math.ceil((part.count * 30) / fps),
                  },
                );
                const visible =
                  f < part.count &&
                  rendered.visuals.some(
                    (v) => ownerVisualMotion(v, rendered.frame).opacity > 0,
                  );
                if (visible && start === undefined)
                  start = (part.prefix + f) / fps;
                if (!visible && start !== undefined) {
                  expected.push({ start, end: (part.prefix + f) / fps });
                  start = undefined;
                }
              }
            }
            const occurrences = ownerVisualOccurrences(image, 90, hook, clock);
            expect(occurrences).toHaveLength(expected.length);
            occurrences.forEach((window, i) => {
              expect(window.start).toBeCloseTo(expected[i]!.start, 10);
              expect(window.end).toBeCloseTo(expected[i]!.end, 10);
            });
            const segments = ownerAudioSegments(
              { originalVolume: 100, assets: [], cues: [cue] },
              90,
              hook,
              clock,
              [image],
            );
            expect(segments).toHaveLength(expected.length);
            segments.forEach((sound, i) => {
              expect(sound.start).toBeCloseTo(expected[i]!.start, 10);
              expect(sound.offset).toBe(0);
              expect(sound.end).toBeCloseTo(
                Math.min(expected[i]!.end, sound.start + 0.3),
                10,
              );
            });
          }
  });
}
it("moves/restores anchors, drops deleted images, resets stale offsets, and leaves manual tracks unchanged", () => {
  const manual = {
    ...cue,
    id: crypto.randomUUID(),
    visualId: undefined,
    loop: true,
    offsetFrame: 2,
  };
  const moved = { ...visual, startFrame: 30 };
  const cues = resolveOwnerAudioCues(
    [{ ...cue, offsetFrame: 8, loop: true }, manual],
    [moved],
    90,
  );
  expect(cues[0]).toMatchObject({
    startFrame: 30,
    offsetFrame: 0,
    loop: false,
  });
  expect(cues[1]).toEqual(manual);
  const audio = JSON.parse(
    JSON.stringify({ originalVolume: 100, assets: [], cues }),
  );
  expect(
    ownerAudioSegments(audio, 90, undefined, undefined, [moved])[0],
  ).toMatchObject({ start: 1, offset: 0 });
  expect(
    ownerAudioSegments({ ...audio, cues: [cue] }, 90, undefined, undefined, []),
  ).toEqual([]);
  expect(resolveOwnerAudioCues(cues, [], 90)).toEqual([manual]);
});
it("rejects nonfinite, unbounded and empty physical raster clocks", () => {
  const valid = {
    hook: true,
    sourceStartFrame: 10.1,
    sourceEndFrame: 15.2,
    frames: 6,
  };
  expect(ownerOverlayClockSchema.safeParse(valid).success).toBe(true);
  for (const patch of [
    { sourceStartFrame: NaN },
    { sourceEndFrame: Infinity },
    { frames: 304 },
    { sourceEndFrame: 9 },
    { extra: 1 },
  ])
    expect(
      ownerOverlayClockSchema.safeParse({ ...valid, ...patch }).success,
    ).toBe(false);
});
