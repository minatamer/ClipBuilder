import type { ReactNode } from "react";
import { focusTimestamp } from "./focus-positions.ts";
import type { EditorTimelineItem } from "./editor-timeline.ts";
import { Button } from "../../shared/ui/button";

export function PictureTimelineAudio({
  item,
  disabled,
  onAdd,
}: {
  item: EditorTimelineItem;
  disabled: boolean;
  onAdd: (item: EditorTimelineItem) => void;
}) {
  return (
    <Button
      variant="quiet"
      aria-label={`Add audio to ${item.title}`}
      disabled={disabled}
      onClick={() => onAdd(item)}
    >
      Add audio
    </Button>
  );
}

export function EditorTimeline({
  items,
  selected,
  frames,
  label,
  disabled,
  onSelect,
  accessory,
  preview,
}: {
  items: EditorTimelineItem[];
  selected: string | undefined;
  frames: number;
  label: string;
  disabled: boolean;
  onSelect: (item: EditorTimelineItem) => void;
  accessory?: ((item: EditorTimelineItem) => ReactNode) | undefined;
  preview?: ((item: EditorTimelineItem) => ReactNode) | undefined;
}) {
  return (
    <div className="editor-timeline" role="group" aria-label={label}>
      {items.map((item) => (
        <div className="editor-timeline-entry" key={item.key}>
          <button
            type="button"
            className="focus-shot"
            data-timeline-key={item.key}
            data-picture={item.kind === "picture" || undefined}
            data-audio-cue={
              (item.kind === "audio" && item.index >= 0) || undefined
            }
            aria-pressed={selected === item.key}
            disabled={disabled}
            onClick={() => onSelect(item)}
          >
            {preview?.(item)}
            <span className="editor-timeline-name">{item.title}</span>
            <span className="editor-timeline-time">
              {focusTimestamp(item.startFrame)}–{focusTimestamp(item.endFrame)}
            </span>
            <span
              className="focus-shot-bar"
              aria-hidden="true"
              style={{
                left: `${(item.startFrame / frames) * 100}%`,
                width: `${((item.endFrame - item.startFrame) / frames) * 100}%`,
              }}
            />
          </button>
          {accessory?.(item)}
        </div>
      ))}
    </div>
  );
}
