import { expect, it } from "vitest";
import {
  OWNER_AUDIO_LIMITS,
  ownerAudioEditSchema,
  ownerAudioTrackSchema,
  ownerAudioSegments,
  resolveOwnerAudioCues,
  type OwnerAudioCue,
} from "./audio.ts";
import { ownerOverlaySchema } from "./clips.ts";

const cue = (
  placement: OwnerAudioCue["placement"] = "clip",
): OwnerAudioCue => ({
  id: crypto.randomUUID(),
  source: { kind: "builtin", id: "tension" },
  placement,
  startFrame: 30,
  endFrame: 150,
  offsetFrame: 15,
  volume: 20,
  loop: true,
});
it("allows twelve concurrent independent gains and anchors accents only to visual starts", () => {
  const visualId = crypto.randomUUID(),
    snap: OwnerAudioCue = {
      ...cue(),
      visualId,
      source: { kind: "builtin", id: "snap" },
      startFrame: 0,
      endFrame: 4,
      loop: false,
      offsetFrame: 0,
      volume: 35,
    };
  const layers = Array.from({ length: 11 }, (_, i) => ({
    ...cue(),
    startFrame: 10,
    endFrame: 80,
    volume: i * 9,
  }));
  const resolved = resolveOwnerAudioCues(
    [snap, ...layers],
    [{ id: visualId, startFrame: 10 }],
    90,
  );
  expect(
    ownerAudioEditSchema.parse({ originalVolume: 73, cues: resolved }).cues,
  ).toHaveLength(12);
  expect(resolved[0]).toMatchObject({
    startFrame: 10,
    endFrame: 14,
    volume: 35,
  });
  expect(resolved.slice(1)).toEqual(layers);
  const moved = resolveOwnerAudioCues(
    resolved,
    [{ id: visualId, startFrame: 89 }],
    90,
  );
  expect(moved[0]).toMatchObject({ startFrame: 89, endFrame: 90 });
  expect(
    resolveOwnerAudioCues(moved, [{ id: visualId, startFrame: 20 }], 90)[0],
  ).toMatchObject({ startFrame: 20, endFrame: 24 });
  expect(resolveOwnerAudioCues(resolved, [], 90)).toEqual(layers);
  const segments = ownerAudioSegments(
    { originalVolume: 100, assets: [], cues: [resolved[0]!] },
    90,
  );
  expect(segments).toHaveLength(1);
  expect(segments[0]!.start).toBeCloseTo(10 / 30);
  expect(segments[0]!.end).toBeCloseTo(14 / 30);
});
it("projects timed sounds into both edited occurrences with the same audio offset, while hook and background windows stay distinct", () => {
  const timed = cue(),
    hook = { ...cue("hook"), offsetFrame: 0 },
    video = { ...cue("video"), offsetFrame: 0 };
  const audio = ownerAudioTrackSchema.parse({
    originalVolume: 100,
    cues: [timed, hook, video],
    assets: [],
  });
  expect(
    ownerAudioSegments(audio, 180, { startFrame: 60, endFrame: 120 }).map(
      ({ cue, ...segment }) => ({ id: cue.id, ...segment }),
    ),
  ).toEqual([
    { id: timed.id, start: 0, end: 2, offset: 1.5 },
    { id: timed.id, start: 3, end: 7, offset: 0.5 },
    { id: hook.id, start: 0, end: 2, offset: 0 },
    { id: video.id, start: 0, end: 8, offset: 0 },
  ]);
  expect(ownerAudioSegments({ ...audio, cues: [hook] }, 180)).toEqual([]);
  expect(
    ownerAudioSegments(
      audio,
      180,
      { startFrame: 60, endFrame: 120 },
      { hookSeconds: 2.04, bodySeconds: 6 },
    ).find((segment) => segment.cue.id === hook.id)?.end,
  ).toBe(2.04);
});
it("clips one-shots to remaining samples and preserves full-file looping phase across a hook cut", () => {
  const value = {
    ...cue(),
    source: { kind: "builtin" as const, id: "pop" as const },
    startFrame: 0,
    endFrame: 90,
    offsetFrame: 3,
    loop: false,
  };
  const audio = ownerAudioTrackSchema.parse({
    originalVolume: 100,
    cues: [value],
    assets: [],
  });
  expect(ownerAudioSegments(audio, 90)[0]?.end).toBeCloseTo(0.2);
  expect(
    ownerAudioSegments(audio, 90, { startFrame: 30, endFrame: 60 }),
  ).toHaveLength(1);
  const looping = { ...audio, cues: [{ ...value, loop: true }] };
  const segments = ownerAudioSegments(looping, 90, {
    startFrame: 30,
    endFrame: 60,
  });
  expect(segments).toHaveLength(2);
  expect(segments[0]!.offset).toBeCloseTo(1.1 % 0.3);
  expect(ownerAudioSegments(undefined, 90)).toEqual([]);
});
it("bounds audio sources, gains, offsets, duplicates, count and upload bindings without changing legacy overlays", () => {
  const valid = { originalVolume: 100, cues: [cue()] };
  for (const invalid of [
    { ...valid, originalVolume: 101 },
    { ...valid, cues: [{ ...cue(), volume: NaN }] },
    { ...valid, cues: [{ ...cue(), offsetFrame: Infinity }] },
    {
      ...valid,
      cues: [
        {
          ...cue(),
          source: { kind: "remote", id: "https://example.invalid/a.mp3" },
        },
      ],
    },
    {
      ...valid,
      cues: Array.from({ length: OWNER_AUDIO_LIMITS.cues + 1 }, () => cue()),
    },
    { ...valid, cues: [valid.cues[0], valid.cues[0]] },
  ])
    expect(ownerAudioEditSchema.safeParse(invalid).success).toBe(false);
  const upload = {
    ...cue(),
    source: { kind: "upload" as const, id: crypto.randomUUID() },
  };
  expect(
    ownerAudioTrackSchema.safeParse({ ...valid, cues: [upload], assets: [] })
      .success,
  ).toBe(false);
  expect(
    ownerOverlaySchema.parse({
      version: 1,
      frames: 90,
      captions: [],
      visuals: [],
    }),
  ).not.toHaveProperty("audio");
  expect(
    ownerOverlaySchema.safeParse({
      version: 1,
      frames: 90,
      captions: [],
      visuals: [],
      audio: { ...valid, assets: [] },
    }).success,
  ).toBe(false);
});
