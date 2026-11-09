import type {
  OwnerClip,
  OwnerOverlay,
} from "../../../../../packages/contracts/local/clips.ts";
import type { OwnerEditDocument } from "../../../../../packages/contracts/local/editor.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";

export type EditorFormDraft = {
  original: OwnerEditDocument;
  draft: OwnerEditDocument;
};
export type EditorPreviewForm = EditorFormDraft & {
  preview: OwnerOverlay | null;
};

/** Invalid intermediate input keeps the latest valid draft on screen. */
export function editorPreviewForm(
  previous: EditorPreviewForm | null,
  next: EditorFormDraft,
  clip: Pick<
    OwnerClip,
    "base" | "baseHash" | "assets" | "audioAssets" | "videoAssets"
  >,
): EditorPreviewForm {
  let preview =
    previous?.original === next.original &&
    next.original.fingerprint === clip.base?.fingerprint &&
    next.original.baseHash === clip.baseHash
      ? previous.preview
      : null;
  try {
    if (clip.base)
      preview = compileOwnerOverlay(
        clip.base,
        next.draft,
        clip.assets,
        clip.audioAssets,
        clip.videoAssets,
      );
  } catch {
    // The draft stays invalid and Apply remains guarded; only its paint is held.
  }
  return { ...next, preview };
}
