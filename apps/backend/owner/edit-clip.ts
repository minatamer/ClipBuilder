import {
  ownerEditRequestSchema,
  ownerEditDocumentSchema,
  type OwnerEditDocument,
} from "../../../packages/contracts/owner/editor.ts";
import {
  automaticOwnerEdit,
  compileOwnerOverlay,
} from "../../../packages/contracts/owner/edit-overlay.ts";
import type { OwnerClip } from "../../../packages/contracts/owner/clips.ts";

export function applyOwnerEdit(
  clip: OwnerClip,
  value: unknown,
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
        else delete next.videoLook;
        break;
    }
  }
  next.revision = clip.revision + 1;
  const validated = ownerEditDocumentSchema.parse(next);
  compileOwnerOverlay(clip.base, validated, clip.assets);
  return validated;
}
