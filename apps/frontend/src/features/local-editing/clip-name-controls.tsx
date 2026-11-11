import { useEffect, useId, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import styles from "./clip-name-controls.module.css";
import { Button, IconButton } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import {
  ownerClipNameSchema,
  ownerClipRenameSchema,
  ownerClipDisplayName,
} from "../../../../../packages/contracts/local/clip-name.ts";
import type {
  OwnerClip,
  OwnerClipList,
} from "../../../../../packages/contracts/local/clips.ts";
import { readOwnerClips } from "./collection-pages";

export function ClipNameControls({
  clip,
  index,
  workspaceId,
  onAccepted,
  disabled,
  tabIndex,
}: {
  clip: OwnerClip;
  index: number;
  workspaceId: string;
  onAccepted: (list: OwnerClipList) => void;
  disabled: boolean;
  tabIndex?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const expectedName = useRef<string | null>(null);
  const titleId = useId();
  const nameId = useId();
  const errorId = useId();
  const displayName = ownerClipDisplayName(clip, index);
  const wasEditing = useRef(false);
  const request = useRef<AbortController | null>(null);
  const alive = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (editing) {
      dialog.current?.showModal();
      input.current?.focus();
      input.current?.select();
    } else if (wasEditing.current)
      root.current
        ?.querySelector<HTMLButtonElement>('button[aria-label="Rename clip"]')
        ?.focus();
    wasEditing.current = editing;
  }, [editing]);
  async function save() {
    if (pending || request.current || disabled) return;
    const name = value.trim() ? ownerClipNameSchema.safeParse(value) : null;
    if (name && !name.success) {
      setMessage("Use a single-line name of at most 80 characters.");
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setMessage("");
    try {
      const body = ownerClipRenameSchema.parse({
        operationId: crypto.randomUUID(),
        expectedName: expectedName.current,
        name: name?.data ?? null,
      });
      const response = await fetch(
        `/api/local/workspace/${workspaceId}/clips/${clip.id}/rename`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        setMessage(
          response.status === 409
            ? "The name changed elsewhere. Close and reopen this dialog to try again."
            : "Couldn’t rename this clip. Try again.",
        );
        return;
      }
      const list = await readOwnerClips(
        response,
        workspaceId,
        controller.signal,
      );
      if (alive.current) {
        onAccepted(list);
        dialog.current?.close();
      }
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage("Couldn’t rename this clip. Try again.");
    } finally {
      if (alive.current) setPending(false);
      request.current = null;
    }
  }
  return (
    <div ref={root} className={styles.compact}>
      <Button
        variant="quiet"
        className={styles.rename}
        aria-label="Rename clip"
        title="Rename clip"
        disabled={disabled}
        tabIndex={tabIndex}
        aria-describedby={nameId}
        aria-haspopup="dialog"
        onClick={() => {
          expectedName.current = clip.displayName ?? null;
          setValue(clip.displayName ?? "");
          setMessage("");
          setEditing(true);
        }}
      >
        <span id={nameId} className={styles.name} title={displayName}>
          {displayName}
        </span>
        <Pencil size={16} aria-hidden="true" />
      </Button>
      {editing && (
        <dialog
          ref={dialog}
          className={styles.dialog}
          aria-labelledby={titleId}
          onCancel={(event) => {
            if (pending || request.current) event.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            if (!pending && !request.current) dialog.current?.close();
          }}
          onClose={() => setEditing(false)}
        >
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <header className={styles.heading}>
              <h2 id={titleId}>Rename clip</h2>
              <IconButton
                label="Close rename dialog"
                icon={X}
                disabled={pending}
                onClick={() => dialog.current?.close()}
              />
            </header>
            <div className={styles.body}>
              <p className={styles.fullName}>{displayName}</p>
              <label>
                Clip name
                <input
                  ref={input}
                  aria-label="Clip name"
                  value={value}
                  maxLength={160}
                  placeholder={`Clip ${index}`}
                  aria-describedby={message ? errorId : undefined}
                  aria-invalid={
                    !!value.trim() &&
                    !ownerClipNameSchema.safeParse(value).success
                  }
                  disabled={pending || disabled}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setMessage("");
                  }}
                />
              </label>
              <InlineFeedback id={errorId} message={message} reserve={false} />
            </div>
            <footer className={styles.actions}>
              <Button
                type="submit"
                variant="primary"
                busy={pending}
                disabled={pending || disabled}
              >
                {pending ? "Saving…" : "Save name"}
              </Button>
              <Button
                variant="quiet"
                disabled={pending}
                onClick={() => dialog.current?.close()}
              >
                Cancel
              </Button>
            </footer>
          </form>
        </dialog>
      )}
    </div>
  );
}
