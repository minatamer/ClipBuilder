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
  const next = ownerEditDocumentSchema.parse(clip.edit ?? automatic);
  for (const operation of request.operations) {
    switch (operation.kind) {
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
          else delete next.focus;
        } else delete next.videoLook;
        break;
    }
  }
  if (next.audio)
    next.audio.cues = resolveOwnerAudioCues(
      next.audio.cues,
      next.visuals,
      clip.base.overlay.frames,
    );
  next.revision = clip.revision + 1;
  const validated = ownerEditDocumentSchema.parse(next);
  compileOwnerOverlay(clip.base, validated, clip.assets, clip.audioAssets);
  return validated;
}
