import { useEffect, useId, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../../shared/ui/button";

export function SessionControls({
  recovery,
  disabled,
  onClear,
}: {
  recovery: boolean;
  disabled: boolean;
  onClear: (discardUnsaved?: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (root.current && !event.composedPath().includes(root.current))
        setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return (
    <div
      className="session-controls"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          root.current?.querySelector("button")?.focus();
        }
      }}
    >
      <Button
        variant="quiet"
        className="session-reset"
        title={recovery ? "Reset options" : "Start over"}
        aria-expanded={recovery ? open : undefined}
        aria-controls={recovery ? id : undefined}
        disabled={disabled}
        onClick={() => {
          if (recovery) setOpen((value) => !value);
          else onClear();
        }}
      >
        <RotateCcw size={18} aria-hidden="true" />
        <span>{recovery ? "Reset options" : "Start over"}</span>
      </Button>
      {recovery && open && (
        <div
          className="session-recovery"
          id={id}
          role="group"
          aria-label="Session recovery"
        >
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onClear();
            }}
          >
            Retry reset
          </Button>
          <Button
            variant="quiet"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onClear(true);
            }}
          >
            Discard session
          </Button>
        </div>
      )}
    </div>
  );
}
