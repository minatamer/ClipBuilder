import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { Maximize2, X } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { MediaLoadingOverlay } from "../../shared/ui/media-loading-overlay";
import { ownerVideoFrameSampleTime } from "../../../../../packages/contracts/local/video-assets.ts";
import type { ownerSourceContent } from "../../../../../packages/contracts/local/focus.ts";
import type { HeadBox } from "../../../../../packages/composition/local/head-pixel-tracker.ts";

/** One normalized selection, shared by inline and expanded source views. */
export function HeadSelectionView({
  sourceUrl,
  content,
  sourceFrame,
  seed,
  disabled,
  tracking = false,
  followWindow,
  onChange,
  onConfirm,
  rawSource = false,
}: {
  sourceUrl: string;
  content: ReturnType<typeof ownerSourceContent>;
  sourceFrame: number;
  seed: HeadBox;
  disabled: boolean;
  tracking?: boolean;
  followWindow?: HeadBox;
  onChange: (seed: HeadBox) => void;
  onConfirm: () => void;
  rawSource?: boolean;
}) {
  const titleId = useId();
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLVideoElement>(null);
  const gesture = useRef<{ pointer: number; x: number; y: number } | null>(
    null,
  );
  useEffect(() => {
    if (media.current && media.current.readyState >= 1)
      media.current.currentTime = ownerVideoFrameSampleTime(sourceFrame);
  }, [sourceFrame, sourceUrl, expanded]);
  function pointer(event: PointerEvent<HTMLButtonElement>) {
    const r = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)),
    };
  }
  const selection = (
    <div
      className="focus-source head-motion-source"
      style={{
        aspectRatio: `${content.width}/${content.height}`,
        ...(expanded
          ? {
              width: `min(100%, calc((85dvh - 9rem) * ${content.width / content.height}))`,
            }
          : {
              width: `min(100%, calc(var(--focus-preview-height, ${tracking ? "35dvh - 4rem" : "50dvh - 5rem"}) * ${content.width / content.height}))`,
            }),
      }}
    >
      <video
        ref={media}
        src={sourceUrl}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        onLoadedMetadata={() => {
          if (media.current)
            media.current.currentTime = ownerVideoFrameSampleTime(sourceFrame);
        }}
        style={{
          position: "absolute",
          width: rawSource ? "100%" : `${(1080 / content.width) * 100}%`,
          height: rawSource ? "100%" : `${(1920 / content.height) * 100}%`,
          maxWidth: "none",
          left: rawSource ? 0 : `${(-content.x / content.width) * 100}%`,
          top: rawSource ? 0 : `${(-content.y / content.height) * 100}%`,
        }}
      />
      <MediaLoadingOverlay key={sourceUrl} element={media} />
      <button
        type="button"
        className="head-seed-surface"
        aria-label="Head to follow"
        disabled={disabled}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.focus();
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = pointer(e);
          gesture.current = { pointer: e.pointerId, ...p };
          onChange({
            ...seed,
            x: p.x - seed.width / 2,
            y: p.y - seed.height / 2,
          });
        }}
        onPointerMove={(e) => {
          const g = gesture.current;
          if (!g || g.pointer !== e.pointerId) return;
          const p = pointer(e);
          onChange({
            x: Math.min(p.x, g.x),
            y: Math.min(p.y, g.y),
            width: Math.abs(p.x - g.x),
            height: Math.abs(p.y - g.y),
          });
        }}
        onPointerUp={() => {
          gesture.current = null;
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
        onLostPointerCapture={() => {
          gesture.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onConfirm();
            return;
          }
          const dx =
            e.key === "ArrowRight" ? 0.01 : e.key === "ArrowLeft" ? -0.01 : 0;
          const dy =
            e.key === "ArrowDown" ? 0.01 : e.key === "ArrowUp" ? -0.01 : 0;
          if (!dx && !dy) return;
          e.preventDefault();
          onChange(
            e.shiftKey
              ? { ...seed, width: seed.width + dx, height: seed.height + dy }
              : { ...seed, x: seed.x + dx, y: seed.y + dy },
          );
        }}
      >
        {followWindow && (
          <span
            className="head-follow-window"
            aria-hidden="true"
            style={{
              left: `${followWindow.x * 100}%`,
              top: `${followWindow.y * 100}%`,
              width: `${followWindow.width * 100}%`,
              height: `${followWindow.height * 100}%`,
            }}
          />
        )}
        <span
          style={{
            left: `${seed.x * 100}%`,
            top: `${seed.y * 100}%`,
            width: `${seed.width * 100}%`,
            height: `${seed.height * 100}%`,
          }}
        />
      </button>
    </div>
  );
  return (
    <div className="head-selection-view" ref={root}>
      {!tracking && (
        <div className="head-selection-heading">
          <span>Mark the head to follow</span>
          <Button
            variant="quiet"
            icon={Maximize2}
            aria-label="Expand head selection"
            aria-haspopup="dialog"
            disabled={disabled}
            onClick={() => {
              if (dialog.current && !dialog.current.open) {
                setExpanded(true);
                dialog.current.showModal();
              }
            }}
          >
            Expand
          </Button>
        </div>
      )}
      {!expanded && selection}
      <dialog
        ref={dialog}
        className="head-selection-dialog"
        aria-labelledby={titleId}
        onClose={() => {
          gesture.current = null;
          setExpanded(false);
          root.current
            ?.querySelector<HTMLButtonElement>(
              '[aria-label="Expand head selection"]',
            )
            ?.focus({ preventScroll: true });
        }}
      >
        <header>
          <h2 id={titleId}>Head selection</h2>
          <Button
            variant="secondary"
            icon={X}
            aria-label="Close expanded selection"
            onClick={() => dialog.current?.close()}
          />
        </header>
        {expanded && selection}
        <footer>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm();
              dialog.current?.close();
            }}
          >
            Done
          </Button>
        </footer>
      </dialog>
    </div>
  );
}
