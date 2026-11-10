import { createPortal } from "react-dom";
import { Check, CircleAlert, LoaderCircle, Redo2, Undo2 } from "lucide-react";
import { Button, IconButton } from "../../shared/ui/button";
import { useWorkspaceChrome } from "../../shared/ui/workspace";
import type { AutosavePhase } from "./use-editor-autosave";

export function EditorSaveTools({
  phase,
  dirty,
  invalid,
  disabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRetry,
}: {
  phase: AutosavePhase;
  dirty: boolean;
  invalid: boolean;
  disabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRetry: () => void;
}) {
  const chrome = useWorkspaceChrome();
  const failed = phase === "failed" || phase === "conflict";
  const state = failed
    ? phase
    : invalid
      ? "invalid"
      : dirty || phase === "saving"
        ? "saving"
        : "saved";
  const label =
    phase === "conflict"
      ? "Clip changed elsewhere"
      : phase === "failed"
        ? "Couldn’t save"
        : invalid
          ? "Check edits"
          : state === "saving"
            ? "Saving…"
            : "Saved";
  const tools = (
    <div className="editor-save-tools" aria-label="Edit history and saving">
      <IconButton
        icon={Undo2}
        label="Undo"
        disabled={disabled || !canUndo}
        onClick={onUndo}
      />
      <IconButton
        icon={Redo2}
        label="Redo"
        disabled={disabled || !canRedo}
        onClick={onRedo}
      />
      <span
        className="editor-save-status"
        role="status"
        aria-live="polite"
        data-failed={failed || undefined}
        data-state={state}
        title={state === "saved" ? "All valid edits saved" : label}
      >
        <span className="editor-save-symbol" aria-hidden="true">
          {state === "saving" ? (
            <LoaderCircle
              size={16}
              className="acquisition-spinner"
              aria-hidden="true"
            />
          ) : state === "saved" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <CircleAlert size={16} />
          )}
        </span>
        <span className="editor-save-copy">{label}</span>
      </span>
      {phase === "failed" && (
        <Button variant="quiet" className="editor-save-retry" onClick={onRetry}>
          Retry save
        </Button>
      )}
    </div>
  );
  return chrome ? chrome.tools && createPortal(tools, chrome.tools) : tools;
}
