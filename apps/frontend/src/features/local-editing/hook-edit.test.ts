import { expect, it } from "vitest";
import { ownerEditDocumentSchema } from "../../../../../packages/contracts/local/editor.ts";
import {
  ownerAudioSegments,
  type OwnerAudioCue,
} from "../../../../../packages/contracts/local/audio.ts";
import {
  ownerHookSchema,
  decodeOwnerHookSuggestion,
} from "../../../../../packages/contracts/local/hook.ts";
import {
  changeManualOwnerHook,
  acceptSuggestedOwnerHook,
} from "./hook-edit.ts";

const draft = () =>
  ownerEditDocumentSchema.parse({
    version: 1,
    clipId: crypto.randomUUID(),
    fingerprint: "a".repeat(64),
    baseHash: "b".repeat(64),
    revision: 0,
    captions: null,
    visuals: [],
  });
const manualCue = (): OwnerAudioCue => ({
  id: crypto.randomUUID(),
  source: { kind: "builtin", id: "discord" },
  placement: "clip",
  startFrame: 0,
  endFrame: 15,
  offsetFrame: 0,
  volume: 42,
  loop: false,
});

it.each([
  [90, "riser", 69],
  [159, "riser", 0],
  [180, "rising-tension", 42],
  [222, "rising-tension", 0],
] as const)(
  "chooses the covering recording for %i frames, ending at the hook cut without looping",
  (frames, id, offsetFrame) => {
    const original = draft(),
      hook = { startFrame: 300, endFrame: 300 + frames };
    const next = acceptSuggestedOwnerHook(original, hook, crypto.randomUUID());
    const cue = next.audio!.cues[0]!;
    expect(original.audio).toBeUndefined();
    expect(original.hook).toBeUndefined();
    expect(cue).toMatchObject({
      source: { kind: "builtin", id },
      offsetFrame,
      volume: 35,
      placement: "hook",
      loop: false,
      suggestedHook: true,
    });
    const segments = ownerAudioSegments(
      { ...next.audio!, assets: [] },
      900,
      hook,
    );
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      start: 0,
      end: frames / 30,
      offset: offsetFrame / 30,
    });
    expect(ownerEditDocumentSchema.parse(next)).toEqual(next);
  },
);

it("retains manual audio, original volume and edited gain; replaces only its managed cue across repeated suggestions", () => {
  const existing = manualCue(),
    original = { ...draft(), audio: { originalVolume: 73, cues: [existing] } };
  const first = acceptSuggestedOwnerHook(
    original,
    { startFrame: 300, endFrame: 459 },
    crypto.randomUUID(),
  );
  first.audio!.cues[1]!.volume = 19;
  const next = acceptSuggestedOwnerHook(
    first,
    { startFrame: 350, endFrame: 560 },
    crypto.randomUUID(),
  );
  expect(next.audio!.originalVolume).toBe(73);
  expect(next.audio!.cues).toHaveLength(2);
  expect(next.audio!.cues[0]).toEqual(existing);
  expect(next.audio!.cues[1]).toMatchObject({
    id: first.audio!.cues[1]!.id,
    volume: 19,
    source: { id: "rising-tension" },
    offsetFrame: 12,
  });
  const removed = changeManualOwnerHook(next, undefined);
  expect(removed.hook).toBeUndefined();
  expect(removed.audio!.cues).toEqual([existing]);
});

it("keeps manual hooks at ten seconds with no automatic audio, while AI suggestions stop at 7.4 seconds", () => {
  const hook = { startFrame: 300, endFrame: 600 };
  expect(ownerHookSchema.parse(hook)).toEqual(hook);
  const next = changeManualOwnerHook(draft(), hook);
  expect(next.hook).toEqual(hook);
  expect(next.audio).toBeUndefined();
  expect(decodeOwnerHookSuggestion(hook, 900)).toEqual({
    startFrame: 300,
    endFrame: 522,
  });
});

it("preserves full user layers instead of silently replacing them or raising the twelve-track limit", () => {
  const original = {
    ...draft(),
    audio: { originalVolume: 100, cues: Array.from({ length: 12 }, manualCue) },
  };
  const before = structuredClone(original);
  expect(() =>
    acceptSuggestedOwnerHook(
      original,
      { startFrame: 300, endFrame: 459 },
      crypto.randomUUID(),
    ),
  ).toThrow("hook_audio_capacity");
  expect(original).toEqual(before);
  expect(() =>
    acceptSuggestedOwnerHook(
      draft(),
      { startFrame: 300, endFrame: 523 },
      crypto.randomUUID(),
    ),
  ).toThrow("invalid_hook_suggestion");
});
