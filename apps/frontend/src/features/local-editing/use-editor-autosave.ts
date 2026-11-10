import { useEffect, useEffectEvent, useRef, useState } from "react";
import type {
  OwnerClip,
  OwnerClipList,
} from "../../../../../packages/contracts/local/clips.ts";
import {
  ownerEditRequestSchema,
  type OwnerEditDocument,
} from "../../../../../packages/contracts/local/editor.ts";
import { readOwnerClips } from "./collection-pages";
import { initialOwnerEdit, ownerEditOperations } from "./editor-state";

export type AutosavePhase =
  "saved" | "waiting" | "saving" | "failed" | "conflict";

/** Debounced edit transport only. A save never invokes generation or rendering. */
export function useEditorAutosave(options: {
  workspaceId: string;
  clip: OwnerClip;
  original: OwnerEditDocument;
  draft: OwnerEditDocument;
  dirty: boolean;
  blocked: boolean;
  stale: boolean;
  onAcknowledged: (
    original: OwnerEditDocument,
    submitted: OwnerEditDocument,
  ) => void;
  onAccepted: (list: OwnerClipList) => void;
}) {
  const [phase, setPhase] = useState<AutosavePhase>("saved");
  const [attempt, setAttempt] = useState(0);
  const active = useRef<AbortController | null>(null);
  const submission = useRef<{
    body: ReturnType<typeof ownerEditRequestSchema.parse>;
    draft: OwnerEditDocument;
  } | null>(null);
  const save = useEffectEvent(async () => {
    if (
      active.current ||
      options.blocked ||
      (options.stale && !submission.current) ||
      (!options.dirty && !submission.current)
    )
      return;
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(15_000),
    ]);
    active.current = controller;
    setPhase("saving");
    try {
      const submitted =
        submission.current?.draft ?? structuredClone(options.draft);
      const body =
        submission.current?.body ??
        ownerEditRequestSchema.parse({
          operationId: crypto.randomUUID(),
          expectedRevision: options.original.revision,
          baseHash: options.original.baseHash,
          operations: ownerEditOperations(
            options.original,
            submitted,
            options.clip,
          ),
        });
      submission.current = { body, draft: submitted };
      const response = await fetch(
        `/api/local/workspace/${options.workspaceId}/clips/${options.clip.id}/edit`,
        {
          method: "POST",
          signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (response.status === 409) {
        if (!controller.signal.aborted) setPhase("conflict");
        return;
      }
      if (!response.ok) throw Error("edit_save_unavailable");
      const list = await readOwnerClips(response, options.workspaceId, signal);
      const accepted = list.clips.find((clip) => clip.id === options.clip.id);
      if (!accepted?.base || !accepted.baseHash)
        throw Error("edit_save_unacknowledged");
      if (controller.signal.aborted) return;
      submission.current = null;
      options.onAcknowledged(initialOwnerEdit(accepted), submitted);
      options.onAccepted(list);
      setPhase("saved");
    } catch {
      if (!controller.signal.aborted) setPhase("failed");
    } finally {
      if (active.current === controller) active.current = null;
    }
  });
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    if (
      submission.current &&
      !active.current &&
      (submission.current.body.expectedRevision !== options.original.revision ||
        submission.current.body.baseHash !== options.original.baseHash)
    ) {
      submission.current = null;
      setPhase("saved");
    }
    if (!options.dirty && !submission.current) {
      if (!active.current) setPhase("saved");
      return;
    }
    if (
      options.blocked ||
      (options.stale && !submission.current) ||
      phase === "saving" ||
      phase === "failed" ||
      phase === "conflict"
    )
      return;
    setPhase("waiting");
    const timer = setTimeout(() => void save(), 650);
    return () => clearTimeout(timer);
  }, [
    options.draft,
    options.original,
    options.dirty,
    options.blocked,
    options.stale,
    phase,
    attempt,
  ]);
  return {
    phase,
    reset: () => {
      if (active.current) return;
      submission.current = null;
      setPhase("saved");
    },
    retry: () => {
      if (phase === "failed") {
        setPhase("waiting");
        setAttempt((value) => value + 1);
      }
    },
  };
}
