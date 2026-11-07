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
  chooseOwnerHookSound,
  removeOwnerHookSound,
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
  [90, "riser", 159],
  [159, "riser", 159],
  [180, "rising-tension", 222],
  [222, "rising-tension", 222],
] as const)(
  "chooses the covering recording for %i frames, ending at the hook cut without looping",
  (frames, id, duration) => {
    const original = draft(),
      hook = { startFrame: 300, endFrame: 300 + frames };
    const next = acceptSuggestedOwnerHook(
      original,
      hook,
      crypto.randomUUID(),
      900,
    );
    const cue = next.audio!.cues[0]!;
    expect(original.audio).toBeUndefined();
    expect(original.hook).toBeUndefined();
    expect(cue).toMatchObject({
      source: { kind: "builtin", id },
      offsetFrame: 0,
      volume: 100,
      placement: "hook",
      loop: false,
      suggestedHook: true,
    });
    const segments = ownerAudioSegments(
      { ...next.audio!, assets: [] },
      900,
      next.hook,
    );
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      start: 0,
      end: duration / 30,
      offset: 0,
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
    900,
  );
  first.audio!.cues[1]!.volume = 19;
  const next = acceptSuggestedOwnerHook(
    first,
    { startFrame: 350, endFrame: 560 },
    crypto.randomUUID(),
    900,
  );
  expect(next.audio!.originalVolume).toBe(73);
  expect(next.audio!.cues).toHaveLength(2);
  expect(next.audio!.cues[0]).toEqual(existing);
  expect(next.audio!.cues[1]).toMatchObject({
    id: first.audio!.cues[1]!.id,
    volume: 19,
    source: { id: "rising-tension" },
    offsetFrame: 0,
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
      900,
    ),
  ).toThrow("hook_audio_capacity");
  expect(original).toEqual(before);
  expect(() =>
    acceptSuggestedOwnerHook(
      draft(),
      { startFrame: 300, endFrame: 523 },
      crypto.randomUUID(),
      900,
    ),
  ).toThrow("invalid_hook_suggestion");
});

it("realigns stale short trims after manual timing changes and preserves the exact endpoints and edited gain", () => {
  const first = acceptSuggestedOwnerHook(
    draft(),
    { startFrame: 300, endFrame: 425 },
    crypto.randomUUID(),
    900,
  );
  const cue = first.audio!.cues[0]!;
  cue.offsetFrame = 34;
  cue.volume = 27;
  const next = changeManualOwnerHook(first, { startFrame: 301, endFrame: 484 });
  expect(next.hook).toEqual({ startFrame: 301, endFrame: 484 });
  expect(next.audio!.cues[0]).toMatchObject({
    id: cue.id,
    volume: 27,
    source: { id: "rising-tension" },
    offsetFrame: 39,
    endFrame: 183,
  });
  expect(
    ownerAudioSegments({ ...next.audio!, assets: [] }, 900, next.hook)[0],
  ).toMatchObject({ start: 0, end: 6.1, offset: 1.3 });
  expect(first.audio!.cues[0]!.offsetFrame).toBe(34);
  expect(() =>
    changeManualOwnerHook(next, { startFrame: 301, endFrame: 524 }),
  ).toThrow("invalid_hook_audio_range");
});

it("replaces a managed recording at twelve tracks and leaves explicitly detached audio untouched", () => {
  const first = chooseOwnerHookSound(
    draft(),
    { startFrame: 30, endFrame: 60 },
    crypto.randomUUID(),
    900,
    "riser",
  );
  const cue = first.audio!.cues[0]!;
  first.audio!.cues.push(...Array.from({ length: 11 }, manualCue));
  const next = chooseOwnerHookSound(
    first,
    first.hook!,
    crypto.randomUUID(),
    900,
    "rising-tension",
  );
  expect(next.audio!.cues).toHaveLength(12);
  expect(next.audio!.cues.find((item) => item.suggestedHook)!.id).toBe(cue.id);
  delete cue.suggestedHook;
  const changed = changeManualOwnerHook(first, {
    startFrame: 30,
    endFrame: 240,
  });
  expect(changed.audio).toEqual(first.audio);
  expect(changeManualOwnerHook(changed, undefined).audio).toEqual(first.audio);
});

it("unchecking audio keeps the Hook range, edited gain and independent cues without mutating the old document", () => {
  const original = chooseOwnerHookSound(
    draft(),
    { startFrame: 30, endFrame: 60 },
    crypto.randomUUID(),
    900,
    "riser",
  );
  const other = manualCue();
  original.audio!.originalVolume = 67;
  original.audio!.cues.push(other);
  const before = structuredClone(original);
  const next = removeOwnerHookSound(original);
  expect(next.hook).toEqual(original.hook);
  expect(next.audio).toEqual({ originalVolume: 67, cues: [other] });
  expect(original).toEqual(before);
});

it.each(["riser", "rising-tension"] as const)(
  "uses the complete selected %s recording, retaining source bounds, cue identity and gain",
  (id) => {
    const full = id === "riser" ? 159 : 222;
    const first = chooseOwnerHookSound(
      draft(),
      { startFrame: 30, endFrame: 90 },
      crypto.randomUUID(),
      900,
      id,
    );
    expect(first.hook).toEqual({ startFrame: 30, endFrame: 30 + full });
    expect(first.audio!.cues[0]).toMatchObject({
      source: { id },
      volume: 100,
      offsetFrame: 0,
      loop: false,
    });
    first.audio!.cues[0]!.volume = 61;
    const bounded = chooseOwnerHookSound(
      first,
      { startFrame: 850, endFrame: 899 },
      crypto.randomUUID(),
      900,
      id,
    );
    expect(bounded.hook).toEqual({ startFrame: 850, endFrame: 900 });
    expect(bounded.audio!.cues[0]).toMatchObject({
      id: first.audio!.cues[0]!.id,
      volume: 61,
      offsetFrame: full - 50,
    });
    expect(
      ownerAudioSegments(
        { ...bounded.audio!, assets: [] },
        900,
        bounded.hook,
      )[0]!.end,
    ).toBeCloseTo(50 / 30, 12);
  },
);
