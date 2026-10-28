import { screenCamera, type ScreenBeat } from "./film-camera";
import {
  FILM_TIMELINES,
  filmDuration,
  type FilmBeat,
  type FilmVariant,
} from "./film-timeline";

export type FilmRect = { x: number; y: number; width: number; height: number };
export type FilmLayer = { rect: FilmRect; opacity: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export function sceneProgress(frame: number, from: number, to: number) {
  const t = clamp((frame - from) / (to - from));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
export function moveRect(from: FilmRect, to: FilmRect, t: number): FilmRect {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    width: from.width + (to.width - from.width) * t,
    height: from.height + (to.height - from.height) * t,
  };
}
export function conversationRect(height: number): FilmRect {
  return { x: 0, y: 0, width: 1920, height };
}
export function filmNarrative(beat: FilmBeat, frame: number, height: number) {
  const right = beat === "choose";
  const identity = beat === "identity" || beat === "close";
  const result = beat === "result";
  const ends =
    beat === "intake"
      ? [48, 60]
      : beat === "analysis"
        ? [50, 64]
        : beat === "choose"
          ? [30, 42]
          : beat === "review"
            ? [30, 44]
            : null;
  return {
    rect: {
      x: identity ? 88 : result ? 80 : right ? 1040 : 96,
      y:
        height *
        (identity
          ? 0.28
          : result
            ? 0.25
            : beat === "review"
              ? 0.28
              : right
                ? 0.13
                : 0.16),
      width: identity
        ? 1060
        : result
          ? 950
          : right
            ? 792
            : beat === "review"
              ? 810
              : 1150,
      height: 390,
    },
    fontSize: result ? 148 : 144,
    opacity:
      beat === "build"
        ? 0
        : identity
          ? 1
          : sceneProgress(frame, 8, 20) *
            (ends ? 1 - sceneProgress(frame, ends[0]!, ends[1]!) : 1),
    right,
  };
}
export const isScreenBeat = (beat: FilmBeat): beat is ScreenBeat =>
  ["intake", "analysis", "choose", "review"].includes(beat);
const editorSource = { x: 532, y: 171, width: 400, height: 711.111111 };
const selectedSource = { x: 386, y: 269, width: 879, height: 494 };
const uploadSource = { x: 690, y: 430, width: 60, height: 60 };
const sourcePreview = { x: 350, y: 180, width: 740, height: 500 };

export function filmStage(
  variant: FilmVariant,
  frame: number,
  height: number,
  fps: number,
) {
  const timeline = FILM_TIMELINES[variant],
    total = filmDuration(variant);
  const normalized = ((frame % total) + total) % total;
  const shot = timeline.find(
    (item) => normalized >= item.from && normalized < item.from + item.duration,
  )!;
  const index = timeline.indexOf(shot),
    previous = timeline[(index + timeline.length - 1) % timeline.length]!;
  const local = normalized - shot.from,
    span = Math.min(fps * 0.9, shot.duration * 0.45),
    t = sceneProgress(local, 0, span);
  const canvas = { x: 0, y: 0, width: 1920, height };
  const window = canvas;
  const scale = (height - 144) / 1920;
  const buildPortrait = {
    x: 1848 - 1080 * scale,
    y: 72,
    width: 1080 * scale,
    height: height - 144,
  };
  const buildSource = {
    x: 64,
    y: 72,
    width: buildPortrait.x - 128,
    height: height - 144,
  };
  const result = buildPortrait;
  const wide = conversationRect(height);
  const poseFor = (beat: ScreenBeat, f: number, duration: number) => {
    const tall = clamp((height - 1080) / 456);
    const settle = sceneProgress(f, beat === "choose" ? 42 : 58, 85);
    const editorial = 1 - sceneProgress(f, 32, 60);
    const framing =
      beat === "intake"
        ? {
            anchorX: 0.66 - 0.16 * settle,
            anchorY: (0.78 - 0.1 * tall) * (1 - settle) + 0.5 * settle,
            lens: 1.12,
          }
        : beat === "analysis"
          ? { anchorX: 0.65, anchorY: 0.7, lens: 1.6 }
          : beat === "choose"
            ? {
                anchorX: 0.36 + 0.14 * settle,
                anchorY: (0.75 - 0.09 * tall) * (1 - settle) + 0.5 * settle,
                lens: 1.08,
              }
            : {
                anchorX: 0.5 + 0.2 * editorial,
                anchorY: 0.5 + 0.05 * editorial,
                lens: 1.18,
                focus: { x: 732, y: 526 },
                focusWeight: editorial,
              };
    return screenCamera(
      beat,
      f,
      duration,
      window.width,
      window.height,
      framing,
    );
  };
  const project = (
    rect: FilmRect,
    pose: ReturnType<typeof screenCamera>,
  ): FilmRect => ({
    x: window.x + pose.x + rect.x * pose.scale,
    y: window.y + pose.y + rect.y * pose.scale,
    width: rect.width * pose.scale,
    height: rect.height * pose.scale,
  });
  const priorScreen = isScreenBeat(previous.beat) ? previous.beat : "choose";
  const priorPose = poseFor(
    priorScreen,
    previous.duration - 1,
    previous.duration,
  );
  const screenBeat = isScreenBeat(shot.beat) ? shot.beat : priorScreen;
  const screenFrame = isScreenBeat(shot.beat) ? local : previous.duration - 1;
  const screenDuration = isScreenBeat(shot.beat)
    ? shot.duration
    : previous.duration;
  let pose = poseFor(screenBeat, screenFrame, screenDuration);
  if (isScreenBeat(shot.beat) && isScreenBeat(previous.beat) && t < 1) {
    pose = {
      ...pose,
      x: priorPose.x + (pose.x - priorPose.x) * t,
      y: priorPose.y + (pose.y - priorPose.y) * t,
      scale: priorPose.scale + (pose.scale - priorPose.scale) * t,
    };
  }
  if (pose.cursor) {
    const x = pose.x + pose.cursor.x * pose.scale,
      y = pose.y + pose.cursor.y * pose.scale;
    const visible =
      x >= 0 &&
      y >= 0 &&
      x + 40 * pose.scale <= window.width &&
      y + 48 * pose.scale <= window.height;
    pose = {
      ...pose,
      cursor: {
        ...pose.cursor,
        opacity: visible
          ? pose.cursor.opacity *
            (shot.beat === "review" ? sceneProgress(local, 44, 56) : 1) *
            (isScreenBeat(shot.beat) && isScreenBeat(previous.beat)
              ? sceneProgress(local, span * 0.55, span)
              : 1)
          : 0,
      },
    };
  }
  let conversation: FilmLayer = { rect: wide, opacity: 0 };
  let portrait: FilmLayer = { rect: buildPortrait, opacity: 0 };
  let conversationFraming = 0;
  const portraitClip = canvas;
  let screenOpacity = 0,
    cardsProgress = 0,
    cardsOpacity = 0;
  let transition = "";
  switch (shot.beat) {
    case "identity":
    case "close": {
      const sameArt = previous.beat === "close";
      transition = sameArt ? "type-only" : "portrait-to-conversation";
      const rect = sameArt ? wide : moveRect(result, wide, t);
      conversation = { rect, opacity: 1 };
      conversationFraming = sameArt ? 0 : 1 - t;
      portrait = { rect, opacity: 0 };
      break;
    }
    case "intake": {
      transition = "conversation-to-upload";
      screenOpacity = sceneProgress(local, 0, span * 0.6);
      const mediaSource = moveRect(
        uploadSource,
        sourcePreview,
        sceneProgress(local, 30, 55),
      );
      conversation = {
        rect: moveRect(wide, project(mediaSource, pose), t),
        opacity: 1,
      };
      break;
    }
    case "analysis": {
      transition = "media-to-analysis";
      screenOpacity = 1;
      const media = project(sourcePreview, priorPose);
      const focus = project({ x: 690, y: 440, width: 60, height: 60 }, pose);
      conversation = {
        rect: moveRect(media, focus, t),
        opacity: 1 - sceneProgress(local, span * 0.6, span),
      };
      cardsProgress = sceneProgress(
        local,
        shot.duration - fps,
        shot.duration - 3,
      );
      cardsOpacity = cardsProgress;
      break;
    }
    case "choose": {
      transition = "analysis-to-cards";
      const fromAnalysis = previous.beat === "analysis";
      screenOpacity = fromAnalysis ? 1 : sceneProgress(local, 0, span * 0.6);
      cardsProgress = fromAnalysis ? 1 : t;
      cardsOpacity = 1 - sceneProgress(local, span * 0.6, span);
      if (!fromAnalysis)
        conversation = {
          rect: moveRect(
            wide,
            project({ x: 119, y: 436, width: 378, height: 214 }, pose),
            t,
          ),
          opacity: 1 - t,
        };
      if (local >= 42)
        conversation = {
          rect: project(selectedSource, pose),
          opacity: sceneProgress(local, 42, 51),
        };
      break;
    }
    case "build": {
      transition = "selection-to-portrait";
      screenOpacity = 1 - sceneProgress(local, 0, span * 0.7);
      const selected = project(selectedSource, priorPose);
      conversation = { rect: moveRect(selected, buildSource, t), opacity: 1 };
      portrait = {
        rect: moveRect(selected, buildPortrait, t),
        opacity: 1,
      };
      break;
    }
    case "review": {
      transition = "portrait-to-editor";
      screenOpacity = sceneProgress(local, 12, span);
      conversation = {
        rect: moveRect(
          buildSource,
          { ...buildSource, x: buildPortrait.x - 8, width: 8 },
          sceneProgress(local, 0, 12),
        ),
        opacity: 1 - sceneProgress(local, 8, 12),
      };
      portrait = {
        rect: moveRect(buildPortrait, project(editorSource, pose), t),
        opacity: 1,
      };
      break;
    }
    case "result": {
      transition =
        previous.beat === "review" ? "editor-to-result" : "portrait-to-result";
      const editor = previous.beat === "review";
      screenOpacity = editor ? 1 - sceneProgress(local, 0, span * 0.7) : 0;
      portrait = {
        rect: moveRect(
          editor ? project(editorSource, priorPose) : buildPortrait,
          result,
          t,
        ),
        opacity: 1,
      };
      if (!editor) conversation = { rect: buildSource, opacity: 1 - t };
      break;
    }
  }
  // Keep captions/cards whole even when the camera crops the underlying media.
  const visible = {
    x: Math.max(portrait.rect.x, portraitClip.x),
    y: Math.max(portrait.rect.y, portraitClip.y),
    right: Math.min(
      portrait.rect.x + portrait.rect.width,
      portraitClip.x + portraitClip.width,
    ),
    bottom: Math.min(
      portrait.rect.y + portrait.rect.height,
      portraitClip.y + portraitClip.height,
    ),
  };
  const detailScale = Math.min(
    (visible.right - visible.x) / 1080,
    (visible.bottom - visible.y) / 1920,
  );
  const portraitDetails = {
    x: visible.x + (visible.right - visible.x - 1080 * detailScale) / 2,
    y: visible.y + (visible.bottom - visible.y - 1920 * detailScale) / 2,
    width: 1080 * detailScale,
    height: 1920 * detailScale,
  };
  return {
    shot,
    previous,
    local,
    t,
    transition,
    canvas,
    window,
    conversation,
    conversationClip: canvas,
    conversationFraming,
    conversationImmersion:
      shot.beat === "identity"
        ? previous.beat === "close"
          ? 1
          : t
        : shot.beat === "close"
          ? t
          : shot.beat === "intake" ||
              (shot.beat === "choose" && previous.beat === "identity")
            ? 1 - t
            : 0,
    portrait,
    portraitClip,
    portraitDetails,
    screenBeat,
    screenFrame,
    screenDuration,
    screenOpacity,
    pose,
    cardsProgress,
    cardsOpacity,
    // The analysis component leaves before any card grows into its old space.
    analysisOpacity:
      shot.beat === "analysis"
        ? 1 -
          sceneProgress(local, shot.duration - fps * 1.4, shot.duration - fps)
        : 0,
    narrative: filmNarrative(shot.beat, local, height),
    previousNarrative: filmNarrative(
      previous.beat,
      previous.duration - 1,
      height,
    ),
  };
}
