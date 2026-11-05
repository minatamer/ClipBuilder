import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import { ownerHookFrames } from "../../../../../packages/contracts/local/hook.ts";
import { ownerOccurrenceOverlay } from "../../../../../packages/contracts/local/hook-content.ts";
import { ownerOverlayAudioSegments } from "../../../../../packages/contracts/local/occurrence-audio.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { OWNER_SOUNDS } from "../../../../../packages/contracts/local/audio.ts";
import { focusPositions, focusPositionName } from "./focus-positions.ts";

export type EditorTimelineKind =
  "picture" | "text" | "caption" | "audio" | "camera" | "look";
export type EditorTimelineItem = {
  key: string;
  kind: EditorTimelineKind;
  occurrence: "hook" | "body";
  id: string;
  index: number;
  title: string;
  startFrame: number;
  endFrame: number;
};

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
      });
    }
    if (kind === "picture")
      content.visuals.forEach((cue, i) =>
        add(cue.id, i, `Picture ${i + 1}`, cue.startFrame, cue.endFrame),
      );
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
    if (kind === "look") add("look", 0, "Video filter", first, last);
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
