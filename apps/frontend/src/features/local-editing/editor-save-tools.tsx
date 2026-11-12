import { ActivityIndicator } from "../../shared/ui/activity-indicator";
import { createPortal } from "react-dom";
import { Check, CircleAlert, Redo2, Undo2 } from "lucide-react";
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
  onResolve,
  onReload,
  reloadDisabled,
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
  onResolve?: (() => void) | undefined;
  onReload?: (() => void) | undefined;
  reloadDisabled?: boolean;
}) {
  const chrome = useWorkspaceChrome();
  const failed = phase === "failed" || phase === "conflict";
  const state = failed
    ? phase
    : invalid
      ? "invalid"
      : dirty || phase === "saving" || phase === "syncing"
        ? "saving"
        : "saved";
  const label =
    phase === "conflict"
      ? "Save conflict"
      : phase === "failed"
        ? "Couldn’t save"
        : invalid
          ? "Check edits"
          : phase === "syncing"
            ? "Syncing…"
            : state === "saving"
              ? "Saving…"
              : "Saved";
  const tools = (
    <div className="editor-save-tools" aria-label="Edit history and saving">
      <span className="editor-save-recovery">
        {phase === "conflict" && onResolve ? (
          <Button
            variant="quiet"
            className="editor-save-retry"
            onClick={onResolve}
          >
            Review edits
          </Button>
        ) : onReload ? (
          <Button
            variant="quiet"
            className="editor-save-retry"
            disabled={reloadDisabled}
            onClick={onReload}
          >
            Repair preview
          </Button>
        ) : phase === "failed" ? (
          <Button
            variant="quiet"
            className="editor-save-retry"
            onClick={onRetry}
          >
            Retry save
          </Button>
        ) : null}
      </span>
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
            <ActivityIndicator size={16} />
          ) : state === "saved" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <CircleAlert size={16} />
          )}
        </span>
        <span className="editor-save-copy">{label}</span>
      </span>
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
    </div>
  );
  return chrome ? chrome.tools && createPortal(tools, chrome.tools) : tools;
}
