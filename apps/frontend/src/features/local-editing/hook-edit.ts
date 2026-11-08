import type { OwnerEditDocument } from "../../../../../packages/contracts/local/editor.ts";
import type { OwnerHook } from "../../../../../packages/contracts/local/hook.ts";
import {
  OWNER_HOOK_SOUNDS,
  OWNER_AI_HOOK_POLICY,
} from "../../../../../packages/contracts/local/hook-sounds.ts";
import {
  OWNER_AUDIO_LIMITS,
  type OwnerAudioCue,
} from "../../../../../packages/contracts/local/audio.ts";

export type OwnerHookSoundId = (typeof OWNER_HOOK_SOUNDS)[number]["id"];
export const OWNER_HOOK_AUDIO_DEFAULT_VOLUME = 85;
export const OWNER_MANAGED_HOOK_MAX_FRAMES = Math.max(
  ...OWNER_HOOK_SOUNDS.map((sound) => sound.frames),
);

function coveringSound(hook: OwnerHook, preferred?: OwnerHookSoundId) {
  const frames = hook.endFrame - hook.startFrame;
  const sound =
    OWNER_HOOK_SOUNDS.find(
      (sound) => sound.id === preferred && sound.frames >= frames,
    ) ?? OWNER_HOOK_SOUNDS.find((sound) => sound.frames >= frames);
  if (!sound || frames < 1) throw new Error("invalid_hook_audio_range");
  return sound;
}

function alignSound(
  draft: OwnerEditDocument,
  hook: OwnerHook,
  cueId: string,
  sound: (typeof OWNER_HOOK_SOUNDS)[number],
): OwnerEditDocument {
  const frames = hook.endFrame - hook.startFrame;
  if (frames < 1 || frames > sound.frames)
    throw new Error("invalid_hook_audio_range");
  const audio = draft.audio ?? { originalVolume: 100, cues: [] };
  const previous = audio.cues.find((cue) => cue.suggestedHook);
  const retained = audio.cues.filter((cue) => !cue.suggestedHook);
  if (retained.length >= OWNER_AUDIO_LIMITS.cues)
    throw new Error("hook_audio_capacity");
  const cue: OwnerAudioCue = {
    id: previous?.id ?? cueId,
    source: { kind: "builtin", id: sound.id },
    placement: "hook",
    startFrame: 0,
    endFrame: frames,
    // Preserve the rise's ending at the cut; trim only the lead-in when shorter.
    offsetFrame: sound.frames - frames,
    volume: previous?.volume ?? OWNER_HOOK_AUDIO_DEFAULT_VOLUME,
    loop: false,
    suggestedHook: true,
  };
  return {
    ...draft,
    hook: { ...hook },
    audio: { ...audio, cues: [...retained, cue] },
  };
}

/** Recording choice sets the default length; a source boundary trims only the lead-in. */
export function chooseOwnerHookSound(
  draft: OwnerEditDocument,
  hook: OwnerHook,
  cueId: string,
  sourceFrames: number,
  soundId?: OwnerHookSoundId,
): OwnerEditDocument {
  const sound = soundId
    ? OWNER_HOOK_SOUNDS.find((sound) => sound.id === soundId)!
    : coveringSound(hook);
  const window = ownerHookSoundWindow(hook, sourceFrames, sound.id);
  return alignSound(draft, window, cueId, sound);
}

export function ownerHookSoundWindow(
  hook: OwnerHook,
  sourceFrames: number,
  soundId?: OwnerHookSoundId,
): OwnerHook {
  const sound = soundId
    ? OWNER_HOOK_SOUNDS.find((sound) => sound.id === soundId)!
    : coveringSound(hook);
  return {
    startFrame: hook.startFrame,
    endFrame: Math.min(sourceFrames, hook.startFrame + sound.frames),
  };
}

/** Explicit suggestion acceptance is one undoable local edit, never AI dispatch. */
export function acceptSuggestedOwnerHook(
  draft: OwnerEditDocument,
  hook: OwnerHook,
  cueId: string,
  sourceFrames: number,
): OwnerEditDocument {
  if (
    hook.startFrame < OWNER_AI_HOOK_POLICY.earliestStartFrame ||
    hook.endFrame > sourceFrames ||
    hook.endFrame - hook.startFrame > OWNER_MANAGED_HOOK_MAX_FRAMES
  )
    throw new Error("invalid_hook_suggestion");
  return chooseOwnerHookSound(draft, hook, cueId, sourceFrames);
}

/** Manual timing never adds music; removing a hook removes only its managed cue. */
export function changeManualOwnerHook(
  draft: OwnerEditDocument,
  hook: OwnerHook | undefined,
): OwnerEditDocument {
  const managed = draft.audio?.cues.find((cue) => cue.suggestedHook);
  if (hook && managed) {
    const preferred =
      managed.source.kind === "builtin"
        ? OWNER_HOOK_SOUNDS.find((sound) => sound.id === managed.source.id)?.id
        : undefined;
    return alignSound(draft, hook, managed.id, coveringSound(hook, preferred));
  }
  return { ...(hook ? draft : removeOwnerHookSound(draft)), hook };
}

/** The checkbox owns only its managed riser, never unrelated or customized audio. */
export function removeOwnerHookSound(
  draft: OwnerEditDocument,
): OwnerEditDocument {
  return draft.audio
    ? {
        ...draft,
        audio: {
          ...draft.audio,
          cues: draft.audio.cues.filter((cue) => !cue.suggestedHook),
        },
      }
    : draft;
}
