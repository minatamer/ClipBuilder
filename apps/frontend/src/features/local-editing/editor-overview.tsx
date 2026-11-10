import { useEffect, useMemo, useRef, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import { ownerPresentationFrames } from "../../../../../packages/contracts/local/hook.ts";
import {
  editorTimelineItems,
  editorTimelineVisual,
  type EditorTimelineItem,
  type EditorTimelineKind,
} from "./editor-timeline.ts";
import { focusTimestamp } from "./focus-positions";
import { MediaTimelineThumbnail } from "./media-timeline-thumbnail";

const groups: readonly { kind: EditorTimelineKind; label: string }[] = [
  { kind: "text", label: "Titles and text" },
  { kind: "caption", label: "Captions" },
  { kind: "picture", label: "Pictures and videos" },
  { kind: "camera", label: "Camera positions" },
  { kind: "effect", label: "Camera effects" },
  { kind: "look", label: "Filters" },
  { kind: "audio", label: "Audio" },
];

/** A navigation projection of existing edit intervals; no second parameter editor. */
export function EditorOverview({
  overlay,
  workspaceId,
  player,
  disabled,
  onSelect,
}: {
  overlay: OwnerOverlay;
  workspaceId: string;
  player: RefObject<PlayerRef | null>;
  disabled: boolean;
  onSelect: (item: EditorTimelineItem) => void;
}) {
  const frames = ownerPresentationFrames(overlay);
  const rows = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        items: editorTimelineItems(overlay, group.kind),
      })),
    [overlay],
  );
  const playhead = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const current = player.current;
    if (!current) return;
    const paint = () => {
      if (playhead.current)
        playhead.current.style.left = `${Math.min(100, Math.max(0, (current.getCurrentFrame() / frames) * 100))}%`;
    };
    paint();
    current.addEventListener("frameupdate", paint);
    return () => current.removeEventListener("frameupdate", paint);
  }, [player, frames]);
  const firstVisual = overlay.visuals[0];
  return (
    <div className="editor-overview">
      <section className="overview-workbench" aria-label="Clip overview">
        <h2>Clip overview</h2>
        <div className="overview-scroll" tabIndex={0} aria-label="Layer timing">
          <div className="overview-table">
            <div className="overview-ruler">
              <span>Layers</span>
              <div>
                {[0, 0.25, 0.5, 0.75, 1].map((at) => (
                  <span key={at}>
                    {focusTimestamp(Math.round(frames * at))}
                  </span>
                ))}
              </div>
            </div>
            {rows.map((group) => (
              <section
                className="overview-group"
                key={group.kind}
                aria-label={group.label}
              >
                <h3>{group.label}</h3>
                {group.items.length ? (
                  (group.kind === "caption" || group.kind === "camera"
                    ? [group.items]
                    : group.items.map((item) => [item])
                  ).map((items) => (
                    <div className="overview-row" key={items[0]!.key}>
                      <span
                        className="overview-row-name"
                        title={items[0]!.title}
                      >
                        {items.length > 1 ? group.label : items[0]!.title}
                      </span>
                      <div className="overview-track">
                        {items.map((item) => (
                          <button
                            type="button"
                            key={item.key}
                            disabled={disabled}
                            className="overview-cue"
                            title={`${item.title} · ${focusTimestamp(item.startFrame)}–${focusTimestamp(item.endFrame)}`}
                            aria-label={`Edit ${item.title}, ${focusTimestamp(item.startFrame)} to ${focusTimestamp(item.endFrame)}`}
                            style={{
                              left: `${(item.startFrame / frames) * 100}%`,
                              width: `${((item.endFrame - item.startFrame) / frames) * 100}%`,
                            }}
                            onClick={() => onSelect(item)}
                          >
                            {item.kind === "picture" &&
                              (() => {
                                const { cue, frame } = editorTimelineVisual(
                                  overlay,
                                  item,
                                );
                                return (
                                  <span className="overview-cue-thumbnail">
                                    <MediaTimelineThumbnail
                                      workspaceId={workspaceId}
                                      assetId={cue.assetId}
                                      frame={frame}
                                    />
                                  </span>
                                );
                              })()}
                            <span>{item.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="overview-empty">None added</p>
                )}
              </section>
            ))}
            <div className="overview-clock">
              <span ref={playhead} className="overview-playhead" />
            </div>
          </div>
        </div>
      </section>
      <aside className="overview-inspector" aria-label="Clip summary">
        <h2>At a glance</h2>
        {firstVisual && (
          <div className="overview-thumbnail">
            <MediaTimelineThumbnail
              workspaceId={workspaceId}
              assetId={firstVisual.assetId}
              frame={firstVisual.video?.offsetFrame}
            />
          </div>
        )}
        <dl>
          <dt>Duration</dt>
          <dd>{focusTimestamp(frames)}</dd>
          <dt>Visual layers</dt>
          <dd>{overlay.visuals.length}</dd>
          <dt>Camera positions</dt>
          <dd>{overlay.focus?.shots.length ?? 1}</dd>
        </dl>
        <p>Select an item in the timeline to edit it.</p>
      </aside>
    </div>
  );
}
