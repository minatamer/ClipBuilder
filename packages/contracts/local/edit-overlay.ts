import {
  ownerAssetSchema,
  ownerVisualEditSchema,
  type OwnerAsset,
} from "./assets.ts";
import { ZodError } from "zod";
import {
  ownerEditDocumentSchema,
  type OwnerEditDocument,
  type OwnerContentEdit,
} from "./editor.ts";
import type { OwnerHook } from "./hook.ts";
import { ownerVideoAssetSchema, type OwnerVideoAsset } from "./video-assets.ts";
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
  videoAssets: readonly OwnerVideoAsset[] = [],
): OwnerOverlay {
  const base = ownerClipBaseSchema.parse(value),
    edit = document ? ownerEditDocumentSchema.parse(document) : null;
  if (edit && edit.fingerprint !== base.fingerprint)
    throw new Error("stale_edit_source");
  const assets = admitted.map((asset) => ownerAssetSchema.parse(asset));
  if (new Set(assets.map((asset) => asset.id)).size !== assets.length)
    throw new Error("duplicate_asset");
  const videos = videoAssets.map((asset) => ownerVideoAssetSchema.parse(asset));
  if (
    new Set(videos.map((asset) => asset.id)).size !== videos.length ||
    videos.some((video) => assets.some((asset) => asset.id === video.id))
  )
    throw new Error("duplicate_asset");
  const overlay = compileContent(
    base,
    edit,
    assets,
    audioAssets,
    edit?.hook,
    videos,
  );
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
    let hookContent;
    try {
      hookContent = compileContent(
        hookBase,
        saved.edits,
        assets,
        audioAssets,
        edit.hook,
        videos,
      );
    } catch (error) {
      if (error instanceof ZodError)
        throw new ZodError(
          error.issues.map((issue) => ({
            ...issue,
            path: ["hookContent", "edits", ...issue.path],
          })),
        );
      throw error;
    }
    return ownerOverlaySchema.parse({
      ...overlay,
      hookContent,
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
  videoAssets: readonly OwnerVideoAsset[],
) {
  const visuals = edit
    ? edit.visuals.map((cue) => {
        const asset = cue.video
          ? videoAssets.find((asset) => asset.id === cue.assetId)
          : assets.find((asset) => asset.id === cue.assetId);
        if (!asset) throw new Error("missing_edit_asset");
        if (cue.video)
          return {
            ...cue,
            digest: asset.digest,
            origin: "owner-supplied" as const,
          };
        if (!("origin" in asset)) throw new Error("missing_edit_asset");
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
      cue.video
        ? !videoAssets.some(
            (asset) => asset.id === cue.assetId && asset.digest === cue.digest,
          )
        : !assets.some(
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
  // Video audio is derived from its placed cue; there is no second editable gain.
  for (const cue of visuals) {
    if (!cue.video || cue.video.muted || cue.video.volume === 0) continue;
    const asset = videoAssets.find((asset) => asset.id === cue.assetId);
    if (!asset?.hasAudio) continue;
    if (!audioAssets.some((item) => item.id === asset.audioAssetId))
      throw new Error("missing_video_audio");
    audioCues.push({
      id: cue.id,
      source: { kind: "upload", id: asset.audioAssetId! },
      placement: "clip",
      startFrame: cue.startFrame,
      endFrame: cue.endFrame,
      offsetFrame: cue.video.offsetFrame,
      volume: cue.video.volume,
      loop: false,
    });
  }
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
    ...(videoAssets.length ? { videoAssets } : {}),
    ...(edit?.texts ? { texts: edit.texts } : {}),
    ...(edit?.captions ? { captionStyle: edit.captions } : {}),
    ...(edit?.videoLook ? { videoLook: edit.videoLook } : {}),
    ...(edit?.videoLooks ? { videoLooks: edit.videoLooks } : {}),
    ...(edit?.focus ? { focus: edit.focus } : {}),
    ...(edit?.cameraEffects ? { cameraEffects: edit.cameraEffects } : {}),
    ...(edit?.cameraTracks ? { cameraTracks: edit.cameraTracks } : {}),
    ...(audio || audioCues.length
      ? {
          audio: ownerAudioTrackSchema.parse({
            originalVolume: audio?.originalVolume ?? 100,
            cues: audioCues,
            assets:
              edit?.audio || videoAssets.length
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
