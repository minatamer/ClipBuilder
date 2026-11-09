import { useRef, type PointerEvent } from "react";

/** Camera's crop picker, shared by original-video and placed-media framing. */
export function CameraTargetSurface({
  label,
  x,
  y,
  crop,
  disabled,
  onSelect,
  onMove,
}: {
  label: string;
  x: number;
  y: number;
  crop: { x: number; y: number; width: number; height: number };
  disabled: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const pointer = useRef<number | null>(null);
  function point(event: PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    onMove(
      (event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height,
    );
  }
  return (
    <button
      type="button"
      className="zoom-target-surface"
      aria-label={label}
      disabled={disabled}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        pointer.current = event.pointerId;
        onSelect();
        point(event);
      }}
      onPointerMove={(event) => {
        if (pointer.current === event.pointerId) point(event);
      }}
      onPointerUp={() => {
        pointer.current = null;
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
      onLostPointerCapture={() => {
        pointer.current = null;
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 0.05 : 0.01;
        const dx =
          event.key === "ArrowRight"
            ? step
            : event.key === "ArrowLeft"
              ? -step
              : 0;
        const dy =
          event.key === "ArrowDown"
            ? step
            : event.key === "ArrowUp"
              ? -step
              : 0;
        if (dx || dy) {
          event.preventDefault();
          onSelect();
          onMove(x + dx, y + dy);
        }
      }}
    >
      <span
        className="focus-crop"
        style={{
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
          height: `${crop.height * 100}%`,
        }}
      />
      <span
        className="zoom-target-marker"
        style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      >
        +
      </span>
    </button>
  );
}
