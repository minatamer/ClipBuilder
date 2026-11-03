import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "../../shared/ui/button";
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
}: {
  clip: OwnerClip;
  index: number;
  workspaceId: string;
  onAccepted: (list: OwnerClipList) => void;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
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
        expectedName: clip.displayName ?? null,
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
      if (!response.ok) throw Error("rename_unavailable");
      const list = await readOwnerClips(
        response,
        workspaceId,
        controller.signal,
      );
      if (alive.current) {
        onAccepted(list);
        setEditing(false);
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
    <div ref={root} className="clip-name-controls">
      {!editing ? (
        <>
          <h3>{ownerClipDisplayName(clip, index)}</h3>
          <Button
            variant="quiet"
            aria-label="Rename clip"
            title="Rename clip"
            disabled={disabled}
            onClick={() => {
              setValue(clip.displayName ?? "");
              setMessage("");
              setEditing(true);
            }}
          >
            <Pencil size={16} aria-hidden="true" />
          </Button>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !pending) {
              event.preventDefault();
              setEditing(false);
            }
          }}
        >
          <input
            ref={input}
            aria-label="Clip name"
            value={value}
            maxLength={160}
            disabled={pending || disabled}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={pending || disabled}
          >
            Save name
          </Button>
          <Button
            variant="quiet"
            disabled={pending}
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </form>
      )}
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
