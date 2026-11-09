import {
  ownerEditRequestSchema,
  ownerEditDocumentSchema,
  type OwnerEditDocument,
} from "../../../packages/contracts/local/editor.ts";
import {
  automaticOwnerEdit,
  compileOwnerOverlay,
} from "../../../packages/contracts/local/edit-overlay.ts";
import type { OwnerClip } from "../../../packages/contracts/local/clips.ts";
import { resolveOwnerAudioCues } from "../../../packages/contracts/local/audio.ts";
import { boundOwnerOpeningTitles } from "../../../packages/contracts/local/text-layers.ts";
import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
import {
  copyOwnerHookContent,
  withIndependentOwnerHook,
} from "../../../packages/contracts/local/hook-content.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import { ownerCameraTracksFit } from "../../../packages/contracts/local/camera-follow.ts";

export function applyOwnerEdit(
  clip: OwnerClip,
  value: unknown,
  source?: { width: number; height: number },
): OwnerEditDocument {
  const request = ownerEditRequestSchema.parse(value);
  if (
    !clip.base ||
    !clip.baseHash ||
    request.baseHash !== clip.baseHash ||
    request.expectedRevision !== clip.revision
  )
    throw new Error("stale_edit_revision");
  const automatic = automaticOwnerEdit(clip.base, clip.id, clip.baseHash);
  let next = ownerEditDocumentSchema.parse(clip.edit ?? automatic);
  // A legacy linked Hook separates on the first explicit edit, before body changes.
  if (next.hook && !next.hookContent)
    next = withIndependentOwnerHook(
      clip.base,
      next,
      clip.assets,
      clip.audioAssets ?? [],
      next.hook,
      clip.videoAssets,
    );
  const priorHook = JSON.stringify(next.hook);
  for (const operation of request.operations) {
    switch (operation.kind) {
      case "visual-order": {
        const ordered = operation.ids.map((id) =>
          next.visuals.find((cue) => cue.id === id),
        );
        if (
          ordered.length !== next.visuals.length ||
          new Set(operation.ids).size !== ordered.length ||
          ordered.some((cue) => !cue)
        )
          throw new Error("invalid_visual_order");
        next.visuals = ordered.filter((cue) => cue !== undefined);
        break;
      }
      case "hook-content":
        if (operation.content) next.hookContent = operation.content;
        else delete next.hookContent;
        break;
      case "audio":
        next.audio = operation.audio;
        break;
      case "hook":
        if (operation.hook) next.hook = operation.hook;
        else delete next.hook;
        break;
      case "caption-speakers":
        if (operation.speakers) next.captionSpeakers = operation.speakers;
        else delete next.captionSpeakers;
        break;
      case "text-layers":
        next.texts = operation.layers;
        break;
      case "caption-text":
        next.captionText = operation.words;
        break;
      case "camera-effects":
        next.cameraEffects = operation.effects;
        break;
      case "camera-tracks":
        next.cameraTracks = operation.tracks;
        break;
      case "focus":
        if (
          operation.focus.frames !== clip.base.overlay.frames ||
          (source &&
            (source.width !== operation.focus.source.width ||
              source.height !== operation.focus.source.height)) ||
          (clip.base.overlay.focus &&
            JSON.stringify(operation.focus.source) !==
              JSON.stringify(clip.base.overlay.focus.source))
        )
          throw new Error("stale_edit_source");
        next.focus = operation.focus;
        break;
      case "video-look":
        next.videoLook = operation.look;
        break;
      case "video-looks":
        next.videoLooks = operation.looks;
        break;
      case "caption":
        next.captions = operation.style;
        break;
      case "visual-upsert": {
        const index = next.visuals.findIndex(
          (cue) => cue.id === operation.cue.id,
        );
        if (index < 0) next.visuals.push(operation.cue);
        else next.visuals[index] = operation.cue;
        break;
      }
      case "visual-remove":
        if (!next.visuals.some((cue) => cue.id === operation.cueId))
          throw new Error("missing_visual");
        next.visuals = next.visuals.filter((cue) => cue.id !== operation.cueId);
        break;
      case "reset":
        if (operation.panel === "captions") next.captions = null;
        else if (operation.panel === "visuals")
          next.visuals = automatic.visuals;
        else if (operation.panel === "focus") {
          if (automatic.focus) next.focus = automatic.focus;
          else {
            delete next.focus;
            next.cameraEffects = [];
          }
        } else {
          delete next.videoLook;
          next.videoLooks = [];
        }
        break;
    }
  }
  if (
    priorHook !== JSON.stringify(next.hook) &&
    !request.operations.some((operation) => operation.kind === "camera-effects")
  )
    next.cameraEffects = next.cameraEffects?.filter(
      (effect) => effect.occurrence === "body",
    );
  if (
    next.texts &&
    request.operations.some((operation) => operation.kind === "hook") &&
    !request.operations.some((operation) => operation.kind === "text-layers")
  )
    next.texts = boundOwnerOpeningTitles(
      next.texts,
      ownerPresentationFrames({
        frames: clip.base.overlay.frames,
        hook: next.hook,
      }),
    );
  if (next.audio)
    next.audio.cues = resolveOwnerAudioCues(
      next.audio.cues,
      next.visuals,
      clip.base.overlay.frames,
    );
  if (
    !request.operations.some((operation) => operation.kind === "camera-tracks")
  )
    next.cameraTracks = next.cameraTracks?.filter(
      (track) =>
        !(
          priorHook !== JSON.stringify(next.hook) && track.occurrence === "hook"
        ) &&
        ownerCameraTracksFit([track], next.focus ?? clip.base!.overlay.focus, {
          frames: clip.base!.overlay.frames,
          hook: next.hook,
        }),
    );
  if (!next.hook) delete next.hookContent;
  else if (
    !next.hookContent ||
    JSON.stringify(next.hookContent.window) !== JSON.stringify(next.hook)
  ) {
    const selectedHook = next.hook;
    const priorContent = next.hookContent;
    delete next.hookContent;
    next = withIndependentOwnerHook(
      clip.base,
      next,
      clip.assets,
      clip.audioAssets ?? [],
      selectedHook,
      clip.videoAssets,
    );
    // Range changes preserve scoped edits through the shared bounded-copy helper.
    if (priorContent) {
      next.hookContent = copyOwnerHookContent(
        clip.base,
        next,
        clip.assets,
        clip.audioAssets ?? [],
        selectedHook,
        priorContent,
        clip.videoAssets,
      );
    }
  }
  if (next.hookContent) {
    const known = [
      ...clip.base.overlay.captions.flatMap((caption) => caption.wordCues),
      ...(clip.edit?.hookContent?.captions.flatMap(
        (caption) => caption.wordCues,
      ) ?? []),
    ];
    const start = Math.floor((next.hook!.startFrame * 1000) / OWNER_FPS),
      end = Math.ceil((next.hook!.endFrame * 1000) / OWNER_FPS);
    for (const word of next.hookContent.captions.flatMap(
      (caption) => caption.wordCues,
    )) {
      if (
        !known.some(
          (reference) =>
            reference.wordId === word.wordId &&
            Math.abs(word.startMs - Math.max(reference.startMs, start)) <=
              1e-6 &&
            Math.abs(word.endMs - Math.min(reference.endMs, end)) <= 1e-6,
        )
      )
        throw new Error("stale_hook_content");
    }
  }
  for (const content of [next, next.hookContent?.edits]) {
    if (
      content?.focus &&
      (content.focus.frames !== clip.base.overlay.frames ||
        (source &&
          (content.focus.source.width !== source.width ||
            content.focus.source.height !== source.height)))
    )
      throw new Error("stale_edit_source");
  }
  next.revision = clip.revision + 1;
  const validated = ownerEditDocumentSchema.parse(next);
  compileOwnerOverlay(
    clip.base,
    validated,
    clip.assets,
    clip.audioAssets,
    clip.videoAssets,
  );
  return validated;
}
