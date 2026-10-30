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

/** Explicit suggestion acceptance is one undoable local edit, never AI dispatch. */
export function acceptSuggestedOwnerHook(
  draft: OwnerEditDocument,
  hook: OwnerHook,
  cueId: string,
): OwnerEditDocument {
  const frames = hook.endFrame - hook.startFrame;
  const sound = OWNER_HOOK_SOUNDS.find((sound) => sound.frames >= frames);
  if (
    !sound ||
    frames < 1 ||
    hook.startFrame < OWNER_AI_HOOK_POLICY.earliestStartFrame
  )
    throw new Error("invalid_hook_suggestion");
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
    volume: previous?.volume ?? 35,
    loop: false,
    suggestedHook: true,
  };
  return {
    ...draft,
    hook: { ...hook },
    audio: { ...audio, cues: [...retained, cue] },
  };
}

/** Manual timing never adds music; removing a hook removes only its managed cue. */
export function changeManualOwnerHook(
  draft: OwnerEditDocument,
  hook: OwnerHook | undefined,
): OwnerEditDocument {
  return {
    ...draft,
    hook,
    ...(hook === undefined && draft.audio
      ? {
          audio: {
            ...draft.audio,
            cues: draft.audio.cues.filter((cue) => !cue.suggestedHook),
          },
        }
      : {}),
  };
}
