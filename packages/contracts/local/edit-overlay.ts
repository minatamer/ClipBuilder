import {
  ownerAssetSchema,
  ownerVisualEditSchema,
  type OwnerAsset,
} from "./assets.ts";
import { ownerEditDocumentSchema, type OwnerEditDocument } from "./editor.ts";
import {
  ownerClipBaseSchema,
  ownerOverlaySchema,
  type OwnerClipBase,
  type OwnerOverlay,
} from "./clips.ts";

export function automaticOwnerEdit(
  base: OwnerClipBase,
  clipId: string,
  baseHash: string,
): OwnerEditDocument {
  return ownerEditDocumentSchema.parse({
    version: 1,
    clipId,
    fingerprint: base.fingerprint,
    baseHash,
    revision: 0,
    captions: null,
    visuals: base.overlay.visuals.map((cue) =>
      ownerVisualEditSchema.parse({
        id: cue.id,
        assetId: cue.assetId,
        startFrame: cue.startFrame,
        endFrame: cue.endFrame,
        box: cue.box,
        fit: cue.fit,
      }),
    ),
  });
}

/** Pure validation/compilation shared by control, preview and native export. */
export function compileOwnerOverlay(
  value: OwnerClipBase,
  document: OwnerEditDocument | null,
  admitted: readonly OwnerAsset[],
): OwnerOverlay {
  const base = ownerClipBaseSchema.parse(value),
    edit = document ? ownerEditDocumentSchema.parse(document) : null;
  if (edit && edit.fingerprint !== base.fingerprint)
    throw new Error("stale_edit_source");
  const assets = admitted.map((asset) => ownerAssetSchema.parse(asset));
  if (new Set(assets.map((asset) => asset.id)).size !== assets.length)
    throw new Error("duplicate_asset");
  const visuals = edit
    ? edit.visuals.map((cue) => {
        const asset = assets.find((asset) => asset.id === cue.assetId);
        if (!asset) throw new Error("missing_edit_asset");
        return { ...cue, digest: asset.digest, origin: asset.origin };
      })
    : base.overlay.visuals;
  for (const cue of visuals)
    if (
      !assets.some(
        (asset) =>
          asset.id === cue.assetId &&
          asset.digest === cue.digest &&
          asset.origin === cue.origin,
      )
    )
      throw new Error("missing_edit_asset");
  return ownerOverlaySchema.parse({
    ...base.overlay,
    visuals,
    ...(edit?.captions ? { captionStyle: edit.captions } : {}),
    ...(edit?.videoLook ? { videoLook: edit.videoLook } : {}),
  });
}
