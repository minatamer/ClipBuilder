import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { GripVertical, Play } from "lucide-react";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import { Button, IconButton } from "../../shared/ui/button";
import { MediaTimelineThumbnail } from "./media-timeline-thumbnail";
import { focusTimestamp } from "./focus-positions";
import { useEditorInspectorDisclosure } from "./editor-inspector-layout";
import styles from "./visual-layer-order.module.css";

/** Stored visuals paint back to front; the stack presents front to back. */
export function reorderVisualLayers(
  cues: OwnerVisualEdit[],
  id: string,
  position: number,
) {
  const from = cues.findIndex((cue) => cue.id === id);
  if (
    from < 0 ||
    !Number.isInteger(position) ||
    position < 0 ||
    position >= cues.length
  )
    return cues;
  const to = cues.length - 1 - position;
  if (from === to) return cues;
  const next = [...cues];
  const [cue] = next.splice(from, 1);
  next.splice(to, 0, cue!);
  return next;
}

type Grab = {
  id: string;
  label: string;
  from: number;
  to: number;
  order: string;
  pointer: number | null;
};

function pointerPosition(list: HTMLOListElement, y: number) {
  const rows = [...list.children];
  const target = rows.findIndex(
    (row) => y < row.getBoundingClientRect().bottom,
  );
  return target < 0 ? rows.length - 1 : target;
}

export function VisualLayers({
  cues,
  selected,
  disabled,
  workspaceId,
  frameOffset,
  onChange,
  onSelect,
  onJump,
  canJump,
}: {
  cues: OwnerVisualEdit[];
  selected: string;
  disabled: boolean;
  workspaceId: string;
  frameOffset: number;
  onChange: (cues: OwnerVisualEdit[]) => void;
  onSelect: (cue: OwnerVisualEdit) => void;
  onJump: (cue: OwnerVisualEdit) => void;
  canJump: (cue: OwnerVisualEdit) => boolean;
}) {
  const id = useId();
  const disclosure = useEditorInspectorDisclosure();
  const list = useRef<HTMLOListElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const focusAfterMove = useRef<string | null>(null);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [message, setMessage] = useState("");
  const order = cues.map((cue) => cue.id).join(":");
  if (grab && (disabled || grab.order !== order)) {
    setGrab(null);
    setMessage("Layer order unchanged.");
  }
  const active = !disabled && grab?.order === order ? grab : null;
  const pointerId = active?.pointer;
  useEffect(() => {
    if (pointerId === undefined || pointerId === null) return;
    let frame: number;
    const scroll = () => {
      const node = list.current;
      const pane = node?.closest<HTMLElement>(".editor-collection");
      if (node && pane) {
        const bounds = pane.getBoundingClientRect();
        if (
          pointer.current.x >= bounds.left &&
          pointer.current.x <= bounds.right
        ) {
          const y = pointer.current.y;
          const amount =
            y < bounds.top + 40 ? -8 : y > bounds.bottom - 40 ? 8 : 0;
          if (amount) {
            pane.scrollTop += amount;
            const to = pointerPosition(node, y);
            setGrab((current) =>
              current && current.to !== to ? { ...current, to } : current,
            );
          }
        }
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [pointerId]);
  useLayoutEffect(() => {
    if (!focusAfterMove.current) return;
    const row = [...(list.current?.children ?? [])].find(
      (node) => node.getAttribute("data-layer-id") === focusAfterMove.current,
    );
    row?.querySelector<HTMLButtonElement>("[data-layer-handle]")?.focus();
    focusAfterMove.current = null;
  }, [order, grab]);
  function finish(commit: boolean) {
    if (active) {
      const next = commit
        ? reorderVisualLayers(cues, active.id, active.to)
        : cues;
      focusAfterMove.current = active.id;
      setMessage(
        next === cues
          ? "Layer order unchanged."
          : `${active.label} moved to position ${active.to + 1} of ${cues.length}.`,
      );
      if (next !== cues) onChange(next);
    }
    setGrab(null);
  }
  function begin(
    cue: OwnerVisualEdit,
    label: string,
    position: number,
    pointer: number | null,
  ) {
    setGrab({
      id: cue.id,
      label,
      from: position,
      to: position,
      order,
      pointer,
    });
    setMessage(
      `${label} picked up. Position ${position + 1} of ${cues.length}.`,
    );
  }
  return (
    <section className={styles.stack} aria-label="Layer order">
      <div className={styles.heading}>
        <h3>Layer order</h3>
        <span>Front to back</span>
      </div>
      <p className="local-sr-only" id={`${id}-instructions`}>
        Drag a handle to reorder. Or press Space to pick up, use arrow keys,
        Home or End to move, then Space to drop. Escape cancels.
      </p>
      {!cues.length && (
        <p className="source-hint">Added pictures and videos appear here.</p>
      )}
      <ol
        ref={list}
        className={styles.list}
        aria-label="Picture and video layers"
      >
        {[...cues].reverse().map((cue, position) => {
          const number = cues.length - position;
          const label = `${cue.video ? "Video" : "Picture"} ${number}`;
          const moving = active?.id === cue.id;
          return (
            <li
              key={cue.id}
              data-layer-id={cue.id}
              data-selected={
                (selected === cue.id &&
                  disclosure?.expanded &&
                  disclosure.available) ||
                undefined
              }
              data-moving={moving || undefined}
              data-drop-edge={
                active && active.to !== active.from && position === active.to
                  ? active.to < active.from
                    ? "before"
                    : "after"
                  : undefined
              }
              className={styles.row}
            >
              <IconButton
                icon={GripVertical}
                label={`Reorder ${label}`}
                className={styles.handle}
                data-layer-handle
                aria-describedby={`${id}-instructions`}
                disabled={disabled || cues.length < 2}
                onPointerDown={(event) => {
                  if (
                    disabled ||
                    cues.length < 2 ||
                    !event.isPrimary ||
                    event.button !== 0
                  )
                    return;
                  event.currentTarget.focus();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  pointer.current = { x: event.clientX, y: event.clientY };
                  begin(cue, label, position, event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!active || active.pointer !== event.pointerId) return;
                  pointer.current = { x: event.clientX, y: event.clientY };
                  const bounded = list.current
                    ? pointerPosition(list.current, event.clientY)
                    : active.to;
                  if (bounded !== active.to)
                    setGrab({ ...active, to: bounded });
                }}
                onPointerUp={(event) => {
                  if (active?.pointer !== event.pointerId) return;
                  const bounds = list.current?.getBoundingClientRect();
                  finish(
                    !!bounds &&
                      event.clientX >= bounds.left &&
                      event.clientX <= bounds.right &&
                      event.clientY >= bounds.top &&
                      event.clientY <= bounds.bottom,
                  );
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onPointerCancel={() => finish(false)}
                onLostPointerCapture={() => {
                  if (active?.pointer !== null) setGrab(null);
                }}
                onClick={(event) => {
                  if (event.detail !== 0) return;
                  if (active?.id === cue.id) finish(true);
                  else begin(cue, label, position, null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && active) {
                    event.preventDefault();
                    finish(false);
                    return;
                  }
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    if (active?.id === cue.id) finish(true);
                    else begin(cue, label, position, null);
                  } else if (
                    active?.id === cue.id &&
                    active.pointer === null &&
                    ["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
                  ) {
                    event.preventDefault();
                    const to =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? cues.length - 1
                          : Math.max(
                              0,
                              Math.min(
                                cues.length - 1,
                                active.to + (event.key === "ArrowUp" ? -1 : 1),
                              ),
                            );
                    setGrab({ ...active, to });
                    setMessage(
                      `${label}. Position ${to + 1} of ${cues.length}.`,
                    );
                  } else if (event.key === "Tab" && active) finish(false);
                }}
              />
              <Button
                variant="quiet"
                className={styles.item}
                aria-label={`Edit layer ${label}`}
                aria-pressed={
                  selected === cue.id &&
                  (!disclosure || (disclosure.available && disclosure.expanded))
                }
                aria-expanded={
                  selected === cue.id &&
                  !!disclosure?.available &&
                  disclosure.expanded
                }
                aria-controls={disclosure?.panelId}
                disabled={disabled}
                onClick={() => {
                  if (active) finish(false);
                  if (selected === cue.id && disclosure?.available)
                    disclosure.setExpanded(!disclosure.expanded);
                  else onSelect(cue);
                }}
              >
                <MediaTimelineThumbnail
                  workspaceId={workspaceId}
                  assetId={cue.assetId}
                  frame={
                    cue.video
                      ? Number.isFinite(cue.video.offsetFrame)
                        ? Math.max(0, cue.video.offsetFrame)
                        : 0
                      : undefined
                  }
                />
                <span
                  className={styles.details}
                  title={`${focusTimestamp(cue.startFrame + frameOffset)}–${focusTimestamp(cue.endFrame + frameOffset)}`}
                >
                  <strong>{label}</strong>
                  <span>
                    {focusTimestamp(cue.startFrame + frameOffset)}
                    <span className={styles.rangeEnd}>
                      –{focusTimestamp(cue.endFrame + frameOffset)}
                    </span>
                  </span>
                </span>
                <span className={styles.position}>
                  {position === 0
                    ? "Front"
                    : position === cues.length - 1
                      ? "Back"
                      : position + 1}
                </span>
              </Button>
              <Button
                variant="quiet"
                className={styles.jump}
                icon={Play}
                aria-label={`Jump to ${label} in preview`}
                title={`Jump to ${focusTimestamp(cue.startFrame + frameOffset)} in preview`}
                disabled={disabled || !!active || !canJump(cue)}
                onClick={() => onJump(cue)}
              >
                <span>Jump to</span>
              </Button>
            </li>
          );
        })}
      </ol>
      <span className="local-sr-only" role="status">
        {message}
      </span>
    </section>
  );
}
