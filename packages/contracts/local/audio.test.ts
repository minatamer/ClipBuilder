import { expect, it } from "vitest";
import {
  OWNER_AUDIO_LIMITS,
  ownerAudioEditSchema,
  ownerAudioTrackSchema,
  ownerAudioSegments,
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
  expect(ownerAudioSegments(audio, 90)[0]?.end).toBeCloseTo(0.1);
  expect(
    ownerAudioSegments(audio, 90, { startFrame: 30, endFrame: 60 }),
  ).toHaveLength(1);
  const looping = { ...audio, cues: [{ ...value, loop: true }] };
  const segments = ownerAudioSegments(looping, 90, {
    startFrame: 30,
    endFrame: 60,
  });
  expect(segments).toHaveLength(2);
  expect(segments[0]!.offset).toBeCloseTo(1.1 % 0.2);
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
