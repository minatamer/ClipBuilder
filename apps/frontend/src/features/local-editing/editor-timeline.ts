import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import {
  ownerHookFrames,
  ownerSourceFrame,
} from "../../../../../packages/contracts/local/hook.ts";
import { ownerOccurrenceOverlay } from "../../../../../packages/contracts/local/hook-content.ts";
import { ownerOverlayAudioSegments } from "../../../../../packages/contracts/local/occurrence-audio.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { OWNER_SOUNDS } from "../../../../../packages/contracts/local/audio.ts";
import { focusPositions, focusPositionName } from "./focus-positions.ts";
import { filterTimelineRanges, filterRangeKey } from "./filter-ranges.ts";
import { OWNER_VIDEO_LOOK_LABELS } from "../../../../../packages/contracts/local/video-look.ts";
import { ownerCameraEffectEnd } from "../../../../../packages/contracts/local/camera-motion.ts";

export type EditorTimelineKind =
  "picture" | "text" | "caption" | "audio" | "camera" | "look" | "effect";
export type EditorTimelineItem = {
  key: string;
  kind: EditorTimelineKind;
  occurrence: "hook" | "body";
  id: string;
  index: number;
  title: string;
  startFrame: number;
  endFrame: number;
  targetId?: string;
  effectTab?: "zoom" | "pan" | "motion";
};

export function editorTimelineVisual(
  overlay: OwnerOverlay,
  item: EditorTimelineItem,
) {
  const cue = ownerOccurrenceOverlay(overlay, item.occurrence).visuals[
    item.index
  ]!;
  return {
    cue,
    frame: cue.video
      ? cue.video.offsetFrame +
        ownerSourceFrame(overlay, item.startFrame) -
        cue.startFrame
      : undefined,
  };
}

/** Display clocks only. Source-bound edit data never receives these offsets. */
export function editorTimelineItems(
  overlay: OwnerOverlay,
  kind: EditorTimelineKind,
): EditorTimelineItem[] {
  const prefix = ownerHookFrames(overlay);
  const items: EditorTimelineItem[] = [];
  for (const occurrence of overlay.hook
    ? (["hook", "body"] as const)
    : (["body"] as const)) {
    const content = ownerOccurrenceOverlay(overlay, occurrence);
    const first = occurrence === "hook" ? overlay.hook!.startFrame : 0;
    const last =
      occurrence === "hook" ? overlay.hook!.endFrame : overlay.frames;
    const offset = occurrence === "hook" ? -first : prefix;
    function add(
      id: string,
      index: number,
      title: string,
      start: number,
      end: number,
      local = false,
      target?: Pick<EditorTimelineItem, "targetId" | "effectTab">,
    ) {
      const from = local ? 0 : first,
        to = local ? last - first : last;
      start = Math.max(from, start);
      end = Math.min(to, end);
      if (end <= start) return;
      const shift = local ? (occurrence === "hook" ? 0 : prefix) : offset;
      items.push({
        key: `${occurrence}:${kind}:${id}`,
        kind,
        occurrence,
        id,
        index,
        title: `${title}${occurrence === "hook" ? " [Hook]" : ""}`,
        startFrame: start + shift,
        endFrame: end + shift,
        ...target,
      });
    }
    if (kind === "picture")
      content.visuals.forEach((cue, i) =>
        add(
          cue.id,
          i,
          `${cue.video ? "Video" : "Picture"} ${i + 1}`,
          cue.startFrame,
          cue.endFrame,
        ),
      );
    if (kind === "effect") {
      overlay.cameraEffects
        ?.filter((effect) => effect.occurrence === occurrence)
        .forEach((effect, index) => {
          add(
            effect.id,
            index,
            effect.kind === "pan"
              ? "Pan · Original video"
              : "Zoom · Original video",
            effect.startFrame,
            ownerCameraEffectEnd(effect),
            true,
            {
              targetId: "original",
              effectTab: effect.kind === "pan" ? "pan" : "zoom",
            },
          );
        });
      overlay.cameraTracks
        ?.filter((track) => track.occurrence === occurrence)
        .forEach((track, index) => {
          add(
            track.id,
            index,
            "Face tracking · Original video",
            track.startFrame,
            track.endFrame,
            true,
            { targetId: "original", effectTab: "motion" },
          );
        });
      content.visuals.forEach((cue, index) => {
        if (cue.effect)
          add(
            cue.id,
            index,
            `Zoom / Pan · ${cue.video ? "Video" : "Picture"} ${index + 1}`,
            cue.effect.startFrame,
            cue.effect.endFrame,
            false,
            {
              targetId: cue.id,
              effectTab:
                cue.effect.fromX !== cue.effect.toX ||
                cue.effect.fromY !== cue.effect.toY
                  ? "pan"
                  : "zoom",
            },
          );
        if (cue.tracking)
          add(
            `${cue.id}:tracking`,
            index,
            `Face tracking · Video ${index + 1}`,
            Math.max(cue.startFrame, cue.tracking.startFrame),
            Math.min(cue.endFrame, cue.tracking.endFrame),
            false,
            { targetId: cue.id, effectTab: "motion" },
          );
      });
    }
    if (kind === "text")
      content.texts?.forEach((layer, i) =>
        add(
          layer.id,
          i,
          `Text ${i + 1} · ${layer.text}`,
          layer.startFrame,
          layer.endFrame,
          layer.role === "opening-title",
        ),
      );
    if (kind === "caption")
      content.captions.forEach((cue, i) =>
        add(
          String(i),
          i,
          `Caption ${i + 1} · ${cue.text}`,
          Math.floor((cue.startMs * OWNER_FPS) / 1000),
          Math.ceil((cue.endMs * OWNER_FPS) / 1000),
        ),
      );
    if (kind === "camera" && content.focus)
      focusPositions(content.focus).forEach((position, i) => {
        const shot = content.focus!.shots[i]!;
        add(
          String(i),
          i,
          focusPositionName(position),
          shot.startFrame,
          shot.endFrame,
        );
      });
    if (kind === "camera" && !content.focus)
      add("0", 0, "Custom position 1", first, last);
    if (kind === "look")
      filterTimelineRanges(content, {
        startFrame: first,
        endFrame: last,
      }).forEach((range, i) =>
        add(
          filterRangeKey(range),
          i,
          `${range.title} · ${OWNER_VIDEO_LOOK_LABELS[range.preset]}`,
          range.startFrame,
          range.endFrame,
        ),
      );
    if (kind === "audio") {
      add("original", -1, "Original audio", first, last);
      for (const [index, cue] of (content.audio?.cues ?? []).entries()) {
        const segments = ownerOverlayAudioSegments(overlay).filter(
          (segment) =>
            segment.cue.id === cue.id &&
            (occurrence === "hook"
              ? segment.start < prefix / OWNER_FPS
              : segment.start >= prefix / OWNER_FPS),
        );
        if (!segments.length) continue;
        const start = Math.min(
          ...segments.map((segment) => segment.start * OWNER_FPS),
        );
        const end = Math.max(
          ...segments.map((segment) => segment.end * OWNER_FPS),
        );
        items.push({
          key: `${occurrence}:audio:${cue.id}`,
          kind,
          occurrence,
          id: cue.id,
          index,
          title: `${cue.source.kind === "builtin" ? (OWNER_SOUNDS.find((sound) => sound.id === cue.source.id)?.label ?? "Sound") : `Uploaded audio ${(content.audio?.assets.findIndex((asset) => cue.source.kind === "upload" && asset.id === cue.source.id) ?? -1) + 1}`}${cue.visualId ? " · Picture" : ""}${occurrence === "hook" ? " [Hook]" : ""}`,
          startFrame: Math.round(start),
          endFrame: Math.round(end),
        });
      }
    }
  }
  return items.sort(
    (a, b) =>
      a.startFrame - b.startFrame ||
      a.endFrame - b.endFrame ||
      a.index - b.index,
  );
}
