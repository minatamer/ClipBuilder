import {
  ownerContentEditSchema,
  ownerHookContentSchema,
  ownerEditDocumentSchema,
  type OwnerContentEdit,
  type OwnerEditDocument,
  type OwnerHookContent,
} from "./editor.ts";
import { correctedOwnerCaptions } from "./caption-text.ts";
import { compileOwnerOverlay } from "./edit-overlay.ts";
import type { OwnerAsset } from "./assets.ts";
import type { OwnerAudioAsset } from "./audio.ts";
import type { OwnerVideoAsset } from "./video-assets.ts";
import type { OwnerVisualEdit } from "./assets.ts";
import type { OwnerClipBase, OwnerOverlay } from "./clips.ts";
import { OWNER_FPS } from "./policy.ts";
import {
  clipOwnerVideoLooks,
  subtractOwnerVideoLookWindow,
  ownerVideoLookSegments,
} from "./video-look.ts";
import {
  ownerHookFrames,
  ownerHookCaption,
  ownerHookSchema,
  type OwnerHook,
} from "./hook.ts";

export type OwnerEditOccurrence = "body" | "hook";

/** Select content fields; provisional editor values validate only on Apply. */
export function ownerContentEdits(
  document: OwnerContentEdit,
): OwnerContentEdit {
  const {
    captions,
    audio,
    captionText,
    captionSpeakers,
    texts,
    videoLook,
    videoLooks,
    focus,
    cameraEffects,
    cameraTracks,
    visuals,
  } = document;
  return {
    captions,
    audio,
    captionText,
    captionSpeakers,
    texts,
    videoLook,
    videoLooks,
    focus,
    cameraEffects,
    cameraTracks,
    visuals,
  };
}

/** One non-recursive occurrence; shared assets remain in the clip's asset pool. */
export function ownerOccurrenceOverlay(
  overlay: OwnerOverlay,
  occurrence: OwnerEditOccurrence,
): OwnerOverlay {
  return occurrence === "hook" ? (overlay.hookContent ?? overlay) : overlay;
}

/** Source clocks stay unchanged; only the selected playback occurrence differs. */
export function ownerOccurrencePresentationFrame(
  hook: OwnerHook | undefined,
  frame: number,
  occurrence: OwnerEditOccurrence,
) {
  return hook && occurrence === "hook"
    ? Math.max(
        0,
        Math.min(ownerHookFrames({ hook }) - 1, frame - hook.startFrame),
      )
    : ownerHookFrames({ hook }) + frame;
}

function intersects(
  item: { startFrame: number; endFrame: number },
  window: OwnerHook,
) {
  return item.startFrame < window.endFrame && item.endFrame > window.startFrame;
}

/** Materialize the current appearance once, without inference or copying bytes. */
export function copyOwnerHookContent(
  base: OwnerClipBase,
  document: OwnerEditDocument,
  assets: readonly OwnerAsset[],
  audioAssets: readonly OwnerAudioAsset[],
  hook: OwnerHook,
  prior?: OwnerHookContent,
  videoAssets: readonly OwnerVideoAsset[] = [],
): OwnerHookContent {
  ownerHookSchema.parse(hook);
  if (hook.endFrame > base.overlay.frames)
    throw new Error("invalid_hook_window");
  const bodyDocument = ownerEditDocumentSchema.parse(document);
  delete bodyDocument.hookContent;
  const body = compileOwnerOverlay(
    base,
    bodyDocument,
    assets,
    audioAssets,
    videoAssets,
  );
  let captions = body.captions.flatMap((caption) => {
    const clipped = ownerHookCaption(caption, hook);
    return clipped
      ? [
          {
            ...clipped,
            startMs: Math.floor(clipped.startMs),
            endMs: Math.ceil(clipped.endMs),
            wordCues: clipped.wordCues.map((word) => ({
              ...word,
              startMs: Math.floor(word.startMs),
              endMs: Math.ceil(word.endMs),
            })),
          },
        ]
      : [];
  });
  const wordIds = new Set(captions.flatMap((c) => c.wordIds));
  const words = base.words
    .filter((w) => wordIds.has(w.id))
    .map((word) => ({
      ...word,
      startMs: Math.max(
        word.startMs,
        Math.floor((hook.startFrame * 1000) / OWNER_FPS),
      ),
      endMs: Math.min(
        word.endMs,
        Math.ceil((hook.endFrame * 1000) / OWNER_FPS),
      ),
    }));
  const edits = ownerContentEdits(bodyDocument);
  edits.captions = body.captionStyle ?? null;
  edits.audio = {
    originalVolume: body.audio?.originalVolume ?? 100,
    cues:
      body.audio?.cues.filter(
        (cue) =>
          !body.visuals.some((visual) => visual.video && visual.id === cue.id),
      ) ?? [],
  };
  edits.captionText = [];
  edits.captionSpeakers = body.captionSpeakers
    ? {
        ...body.captionSpeakers,
        assignments: body.captionSpeakers.assignments.filter((w) =>
          wordIds.has(w.wordId),
        ),
      }
    : undefined;
  const clipTiming = <T extends { startFrame: number; endFrame: number }>(
    item: T,
  ): T => ({
    ...item,
    startFrame: Math.max(item.startFrame, hook.startFrame),
    endFrame: Math.min(item.endFrame, hook.endFrame),
  });
  edits.texts = (body.texts ?? [])
    .filter((layer) =>
      layer.role === "opening-title"
        ? layer.startFrame < ownerHookFrames({ hook })
        : intersects(layer, hook),
    )
    .map((layer) =>
      layer.role === "opening-title" ? layer : clipTiming(layer),
    );
  edits.visuals = edits.visuals
    .filter((cue) => intersects(cue, hook))
    .map((cue) => clipOwnerVisual(cue, hook));
  if (body.videoLooks)
    edits.videoLooks = clipOwnerVideoLooks(body.videoLooks, hook);
  edits.cameraEffects = edits.cameraEffects?.filter(
    (e) => e.occurrence === "hook",
  );
  edits.cameraTracks = edits.cameraTracks?.filter(
    (t) => t.occurrence === "hook",
  );
  if (prior) {
    captions = correctedOwnerCaptions(
      captions,
      prior.captions
        .flatMap((caption) => caption.wordCues)
        .filter((word) => wordIds.has(word.wordId))
        .map((word) => ({ wordId: word.wordId, text: word.text })),
    );

    const preserved = ownerContentEditSchema.parse(prior.edits);
    preserved.captionText = preserved.captionText?.filter((w) =>
      wordIds.has(w.wordId),
    );
    if (preserved.captionSpeakers)
      preserved.captionSpeakers.assignments =
        preserved.captionSpeakers.assignments.filter((w) =>
          wordIds.has(w.wordId),
        );
    const mergeTimed = <
      T extends { id: string; startFrame: number; endFrame: number },
    >(
      old: T[],
      fresh: T[],
    ) => [
      ...old.filter((item) => intersects(item, hook)).map(clipTiming),
      ...fresh.filter(
        (item) =>
          !intersects(item, prior.window) &&
          !old.some((saved) => saved.id === item.id && intersects(saved, hook)),
      ),
    ];
    preserved.visuals = [
      ...preserved.visuals
        .filter((cue) => intersects(cue, hook))
        .map((cue) => clipOwnerVisual(cue, hook)),
      ...edits.visuals.filter(
        (cue) =>
          !intersects(cue, prior.window) &&
          !preserved.visuals.some(
            (saved) => saved.id === cue.id && intersects(saved, hook),
          ),
      ),
    ];
    const inheritedLooks = subtractOwnerVideoLookWindow(
      ownerVideoLookSegments(body, hook),
      prior.window,
    ).filter((range) => {
      const fallback = preserved.videoLook ??
        base.overlay.videoLook ?? {
          preset: "original",
          strength: 100,
        };
      return (
        range.preset !== fallback.preset ||
        range.strength !== fallback.strength ||
        body.videoLooks?.some((saved) => intersects(saved, range))
      );
    });
    if (preserved.videoLooks || inheritedLooks.length)
      preserved.videoLooks = [
        ...clipOwnerVideoLooks(preserved.videoLooks ?? [], hook),
        ...inheritedLooks,
      ].sort((a, b) => a.startFrame - b.startFrame);
    preserved.texts = [
      ...(preserved.texts ?? []).filter((t) => t.role === "opening-title"),
      ...mergeTimed(
        (preserved.texts ?? []).filter((t) => t.role !== "opening-title"),
        (edits.texts ?? []).filter((t) => t.role !== "opening-title"),
      ),
    ];
    // Hook-relative camera paths cannot survive a changed excerpt clock.
    preserved.cameraEffects = [];
    preserved.cameraTracks = [];
    Object.assign(edits, preserved);
  }
  if (edits.audio)
    edits.audio.cues = edits.audio.cues.flatMap((cue) => {
      if (cue.visualId)
        return edits.visuals.some((visual) => visual.id === cue.visualId)
          ? [cue]
          : [];
      if (cue.placement !== "clip") return [cue];
      return intersects(cue, hook) ? [clipTiming(cue)] : [];
    });
  const length = ownerHookFrames({ hook });
  edits.texts = edits.texts?.flatMap((layer) =>
    layer.role === "opening-title"
      ? layer.startFrame < length
        ? [{ ...layer, endFrame: Math.min(layer.endFrame, length) }]
        : []
      : [layer],
  );
  return ownerHookContentSchema.parse({
    window: { ...hook },
    captions,
    words,
    edits,
  });
}

/** Creation/range edits are explicit local changes; legacy reads remain untouched. */
export function withIndependentOwnerHook(
  base: OwnerClipBase,
  document: OwnerEditDocument,
  assets: readonly OwnerAsset[],
  audioAssets: readonly OwnerAudioAsset[],
  hook: OwnerHook | undefined,
  videoAssets: readonly OwnerVideoAsset[] = [],
): OwnerEditDocument {
  const next = ownerEditDocumentSchema.parse(document);
  if (!hook) {
    delete next.hook;
    delete next.hookContent;
    return next;
  }
  if (
    next.hookContent &&
    JSON.stringify(next.hookContent.window) === JSON.stringify(hook)
  )
    return { ...next, hook: { ...hook } };
  next.hookContent = copyOwnerHookContent(
    base,
    document,
    assets,
    audioAssets,
    hook,
    next.hookContent,
    videoAssets,
  );
  next.hook = { ...hook };
  if (next.audio)
    next.audio.cues = next.audio.cues.filter((cue) => cue.placement !== "hook");
  return next;
}

/** A Hook keeps the source trim and exact partial easing of the original cue. */
function clipOwnerVisual(
  cue: OwnerVisualEdit,
  window: OwnerHook,
): OwnerVisualEdit {
  const startFrame = Math.max(cue.startFrame, window.startFrame),
    endFrame = Math.min(cue.endFrame, window.endFrame);
  const next = { ...cue, startFrame, endFrame };
  if (cue.video)
    next.video = {
      ...cue.video,
      offsetFrame: cue.video.offsetFrame + startFrame - cue.startFrame,
    };
  if (cue.effect) {
    const effect = cue.effect;
    const start = Math.max(
      startFrame,
      Math.min(endFrame - 1, effect.startFrame),
    );
    const end = Math.max(start + 1, Math.min(endFrame, effect.endFrame));
    const at = (frame: number) =>
      (effect.progressStart ?? 0) +
      ((effect.progressEnd ?? 1) - (effect.progressStart ?? 0)) *
        Math.max(
          0,
          Math.min(
            1,
            (frame - effect.startFrame) / (effect.endFrame - effect.startFrame),
          ),
        );
    next.effect = {
      ...effect,
      startFrame: start,
      endFrame: end,
      progressStart: at(start),
      progressEnd: at(end),
    };
  }
  return next;
}
