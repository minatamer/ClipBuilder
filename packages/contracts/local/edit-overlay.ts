import {
  ownerAssetSchema,
  ownerVisualEditSchema,
  type OwnerAsset,
} from "./assets.ts";
import {
  ownerEditDocumentSchema,
  type OwnerEditDocument,
  type OwnerContentEdit,
} from "./editor.ts";
import type { OwnerHook } from "./hook.ts";
import { OWNER_FPS } from "./policy.ts";
import { correctedOwnerCaptions } from "./caption-text.ts";
import { resolveCaptionSpeakers } from "./caption-speakers.ts";
import {
  ownerClipBaseSchema,
  ownerOverlaySchema,
  ownerOverlayContentSchema,
  type OwnerClipBase,
  type OwnerOverlay,
} from "./clips.ts";
import {
  ownerAudioTrackSchema,
  resolveOwnerAudioCues,
  type OwnerAudioAsset,
} from "./audio.ts";

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
    ...(base.overlay.videoLooks ? { videoLooks: base.overlay.videoLooks } : {}),
    ...(base.overlay.audio
      ? {
          audio: {
            originalVolume: base.overlay.audio.originalVolume,
            cues: base.overlay.audio.cues,
          },
        }
      : {}),
    ...(base.overlay.texts ? { texts: base.overlay.texts } : {}),
    ...(base.overlay.focus ? { focus: base.overlay.focus } : {}),
    visuals: base.overlay.visuals.map((cue) =>
      ownerVisualEditSchema.parse({
        id: cue.id,
        assetId: cue.assetId,
        startFrame: cue.startFrame,
        endFrame: cue.endFrame,
        box: cue.box,
        fit: cue.fit,
        entrance: cue.entrance,
        exit: cue.exit,
        animationFrames: cue.animationFrames,
      }),
    ),
  });
}

/** Pure validation/compilation shared by control, preview and native export. */
export function compileOwnerOverlay(
  value: OwnerClipBase,
  document: OwnerEditDocument | null,
  admitted: readonly OwnerAsset[],
  audioAssets: readonly OwnerAudioAsset[] = [],
): OwnerOverlay {
  const base = ownerClipBaseSchema.parse(value),
    edit = document ? ownerEditDocumentSchema.parse(document) : null;
  if (edit && edit.fingerprint !== base.fingerprint)
    throw new Error("stale_edit_source");
  const assets = admitted.map((asset) => ownerAssetSchema.parse(asset));
  if (new Set(assets.map((asset) => asset.id)).size !== assets.length)
    throw new Error("duplicate_asset");
  const overlay = compileContent(base, edit, assets, audioAssets, edit?.hook);
  if (edit?.hookContent && edit.hook) {
    const saved = edit.hookContent;
    if (
      saved.words.some(
        (word) =>
          word.startMs < 0 ||
          word.endMs > Math.round((base.overlay.frames * 1000) / OWNER_FPS),
      )
    )
      throw new Error("stale_hook_content");
    const hookBase = {
      ...base,
      words: saved.words,
      overlay: { ...base.overlay, captions: saved.captions },
    };
    return ownerOverlaySchema.parse({
      ...overlay,
      hookContent: compileContent(
        hookBase,
        saved.edits,
        assets,
        audioAssets,
        edit.hook,
      ),
    });
  }
  return ownerOverlaySchema.parse(overlay);
}

function compileContent(
  base: OwnerClipBase,
  edit: OwnerContentEdit | null,
  assets: readonly OwnerAsset[],
  audioAssets: readonly OwnerAudioAsset[],
  hook: OwnerHook | undefined,
) {
  const visuals = edit
    ? edit.visuals.map((cue) => {
        const asset = assets.find((asset) => asset.id === cue.assetId);
        if (!asset) throw new Error("missing_edit_asset");
        return {
          ...cue,
          digest: asset.digest,
          origin: asset.origin,
          ...(asset.format ? { format: asset.format } : {}),
        };
      })
    : base.overlay.visuals;
  for (const cue of visuals)
    if (
      !assets.some(
        (asset) =>
          asset.id === cue.assetId &&
          asset.digest === cue.digest &&
          (asset.format ?? "jpeg") === (cue.format ?? "jpeg") &&
          asset.origin === cue.origin,
      )
    )
      throw new Error("missing_edit_asset");
  const audio = edit?.audio ?? base.overlay.audio;
  const audioCues = audio
    ? resolveOwnerAudioCues(audio.cues, visuals, base.overlay.frames)
    : [];
  return ownerOverlayContentSchema.parse({
    ...base.overlay,
    captions: correctedOwnerCaptions(base.overlay.captions, edit?.captionText),
    captionSpeakers: resolveCaptionSpeakers(
      base.overlay.captions,
      base.words,
      edit?.captionSpeakers,
    ),
    ...(hook ? { hook } : {}),
    visuals,
    ...(edit?.texts ? { texts: edit.texts } : {}),
    ...(edit?.captions ? { captionStyle: edit.captions } : {}),
    ...(edit?.videoLook ? { videoLook: edit.videoLook } : {}),
    ...(edit?.videoLooks ? { videoLooks: edit.videoLooks } : {}),
    ...(edit?.focus ? { focus: edit.focus } : {}),
    ...(edit?.cameraEffects ? { cameraEffects: edit.cameraEffects } : {}),
    ...(edit?.cameraTracks ? { cameraTracks: edit.cameraTracks } : {}),
    ...(audio
      ? {
          audio: ownerAudioTrackSchema.parse({
            ...audio,
            cues: audioCues,
            assets: edit?.audio
              ? audioAssets.filter((asset) =>
                  audioCues.some(
                    (cue) =>
                      cue.source.kind === "upload" &&
                      cue.source.id === asset.id,
                  ),
                )
              : (base.overlay.audio?.assets ?? []),
          }),
        }
      : {}),
  });
}
