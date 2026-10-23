import type { OwnerClip } from "../../../../../packages/contracts/local/clips.ts";
import {
  OWNER_CAPTION_PRESETS,
  type OwnerCaptionStyle,
  type OwnerEditDocument,
  type OwnerEditRequest,
} from "../../../../../packages/contracts/local/editor.ts";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import { automaticOwnerEdit } from "../../../../../packages/contracts/local/edit-overlay.ts";

export type OwnerEditorBox = OwnerVisualEdit["box"];

export function automaticVisualEdits(clip: OwnerClip): OwnerVisualEdit[] {
  return (clip.base?.overlay.visuals ?? []).map(
    ({ id, assetId, startFrame, endFrame, box, fit }) => ({
      id,
      assetId,
      startFrame,
      endFrame,
      box: { ...box },
      fit,
    }),
  );
}

export function initialOwnerEdit(clip: OwnerClip): OwnerEditDocument {
  if (!clip.base || !clip.baseHash) throw new Error("Clip is not reviewable.");
  return clip.edit
    ? structuredClone(clip.edit)
    : {
        ...automaticOwnerEdit(clip.base, clip.id, clip.baseHash),
        revision: clip.revision,
      };
}

export function sameOwnerEdit(
  left: OwnerEditDocument,
  right: OwnerEditDocument,
): boolean {
  return (
    JSON.stringify(left.captions) === JSON.stringify(right.captions) &&
    JSON.stringify(left.videoLook) === JSON.stringify(right.videoLook) &&
    JSON.stringify(left.visuals) === JSON.stringify(right.visuals)
  );
}

export function ownerEditOperations(
  original: OwnerEditDocument,
  draft: OwnerEditDocument,
  clip: OwnerClip,
): OwnerEditRequest["operations"] {
  const operations: OwnerEditRequest["operations"] = [];
  if (JSON.stringify(original.videoLook) !== JSON.stringify(draft.videoLook))
    operations.push(
      draft.videoLook
        ? { kind: "video-look", look: draft.videoLook }
        : { kind: "reset", panel: "video" },
    );
  if (JSON.stringify(original.captions) !== JSON.stringify(draft.captions))
    operations.push(
      draft.captions
        ? { kind: "caption", style: draft.captions }
        : { kind: "reset", panel: "captions" },
    );
  if (JSON.stringify(original.visuals) !== JSON.stringify(draft.visuals)) {
    if (
      JSON.stringify(draft.visuals) ===
      JSON.stringify(automaticVisualEdits(clip))
    ) {
      operations.push({ kind: "reset", panel: "visuals" });
    } else {
      for (const cue of original.visuals)
        if (!draft.visuals.some((item) => item.id === cue.id))
          operations.push({ kind: "visual-remove", cueId: cue.id });
      for (const cue of draft.visuals)
        if (
          JSON.stringify(
            original.visuals.find((item) => item.id === cue.id),
          ) !== JSON.stringify(cue)
        )
          operations.push({ kind: "visual-upsert", cue });
    }
  }
  return operations;
}

/** Clamp pointer/keyboard gestures to the same safe bounds the contract admits. */
export function constrainOwnerBox(
  box: OwnerEditorBox,
  caption: OwnerCaptionStyle | null,
): OwnerEditorBox {
  const edge = caption ? 0.05 : 0;
  const extent = 1 - edge * 2;
  const width = Math.max(caption ? 0.6 : 1 / 1080, Math.min(extent, box.width));
  const minHeight = caption
    ? (2 * (caption.fontSize * 1.2 + 8)) / 1920
    : 1 / 1920;
  const height = Math.max(minHeight, Math.min(extent, box.height));
  return {
    x: Math.max(edge, Math.min(1 - edge - width, box.x)),
    y: Math.max(edge, Math.min(1 - edge - height, box.y)),
    width,
    height,
  };
}

export function captionForOwnerEdit(
  document: OwnerEditDocument,
): OwnerCaptionStyle {
  return document.captions ?? OWNER_CAPTION_PRESETS.clean;
}

export function ownerBoxesOverlap(
  left: OwnerEditorBox,
  right: OwnerEditorBox,
): boolean {
  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y
  );
}

export function ownerGestureBox(
  box: OwnerEditorBox,
  dx: number,
  dy: number,
  canvas: { width: number; height: number },
  resize: boolean,
  caption: OwnerCaptionStyle | null,
): OwnerEditorBox {
  return constrainOwnerBox(
    resize
      ? {
          ...box,
          width: box.width + dx / canvas.width,
          height: box.height + dy / canvas.height,
        }
      : { ...box, x: box.x + dx / canvas.width, y: box.y + dy / canvas.height },
    caption,
  );
}
