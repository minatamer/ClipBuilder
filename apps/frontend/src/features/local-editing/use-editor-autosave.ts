import { useEffect, useEffectEvent, useRef, useState } from "react";
import type {
  OwnerClip,
  OwnerClipList,
} from "../../../../../packages/contracts/local/clips.ts";
import {
  ownerEditRequestSchema,
  OWNER_CAPTION_PRESETS,
  type OwnerEditDocument,
} from "../../../../../packages/contracts/local/editor.ts";
import { EditorSaveRejected, saveEditorEdit } from "./save-editor-edit";
import {
  initialOwnerEdit,
  ownerEditOperations,
  sameOwnerEdit,
} from "./editor-state";
import { readOwnerClips } from "./collection-pages";
import { reconcileEditorEdit } from "./reconcile-editor-edit";

export type AutosavePhase =
  "saved" | "waiting" | "saving" | "syncing" | "failed" | "conflict";
type SaveConflict = {
  base: OwnerEditDocument;
  saved: OwnerEditDocument;
  fields: string[];
  canKeep: boolean;
};

/** Manual edits only: idempotent receipts and safe three-way reconciliation. */
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
    draft: OwnerEditDocument,
    kind: "save" | "sync",
    base: OwnerEditDocument,
  ) => void;
  onAccepted: (list: OwnerClipList) => void;
}) {
  const [phase, setPhase] = useState<AutosavePhase>("saved");
  const [attempt, setAttempt] = useState(0);
  const [conflict, setConflict] = useState<SaveConflict | null>(null);
  const active = useRef<AbortController | null>(null);
  const rebases = useRef(0);
  const submission = useRef<{
    body: ReturnType<typeof ownerEditRequestSchema.parse>;
    original: OwnerEditDocument;
    draft: OwnerEditDocument;
  } | null>(null);
  const receive = useEffectEvent(
    (
      saved: OwnerEditDocument,
      base: OwnerEditDocument,
      kind: "save" | "sync",
      list?: OwnerClipList,
    ) => {
      const result = reconcileEditorEdit(
        base,
        options.draft,
        saved,
        false,
        options.clip.base?.overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean,
      );
      if (list) options.onAccepted(list);
      if (result.conflicts.length) {
        setConflict({
          base,
          saved,
          fields: result.conflicts,
          canKeep: result.compatible,
        });
        setPhase("conflict");
        return;
      }
      options.onAcknowledged(saved, result.draft, kind, base);
      setConflict(null);
      setPhase("saved");
    },
  );
  const latest = useEffectEvent(async (signal: AbortSignal) => {
    const response = await fetch(
      "/api/local/workspace/" + options.workspaceId + "/clips",
      {
        signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
      },
    );
    if (!response.ok) throw Error("edit_sync_unavailable");
    const list = await readOwnerClips(response, options.workspaceId, signal);
    const clip = list.clips.find((clip) => clip.id === options.clip.id);
    if (!clip?.base || !clip.baseHash) throw Error("edit_sync_unavailable");
    return { list, edit: initialOwnerEdit(clip) };
  });
  const save = useEffectEvent(async () => {
    if (
      active.current ||
      options.blocked ||
      (!options.dirty && !submission.current)
    )
      return;
    const controller = new AbortController();
    active.current = controller;
    setPhase("saving");
    try {
      const submitted =
        submission.current?.draft ?? structuredClone(options.draft);
      const original =
        submission.current?.original ?? structuredClone(options.original);
      const body =
        submission.current?.body ??
        ownerEditRequestSchema.parse({
          operationId: crypto.randomUUID(),
          expectedRevision: original.revision,
          baseHash: original.baseHash,
          operations: ownerEditOperations(original, submitted, options.clip),
        });
      submission.current = { body, original, draft: submitted };
      const list = await saveEditorEdit(
        options.workspaceId,
        options.clip.id,
        body,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (!list) {
        // A 409 definitively rejected this operation. Read before making a new one.
        submission.current = null;
        if (++rebases.current > 3) {
          setPhase("failed");
          return;
        }
        setPhase("syncing");
        const current = await latest(controller.signal);
        if (!controller.signal.aborted)
          receive(current.edit, original, "sync", current.list);
        return;
      }
      const accepted = list.clips.find((clip) => clip.id === options.clip.id);
      if (!accepted?.base || !accepted.baseHash)
        throw Error("edit_save_unacknowledged");
      submission.current = null;
      rebases.current = 0;
      receive(initialOwnerEdit(accepted), submitted, "save", list);
    } catch (failure) {
      if (failure instanceof EditorSaveRejected) submission.current = null;
      if (!controller.signal.aborted) setPhase("failed");
    } finally {
      if (active.current === controller) active.current = null;
    }
  });
  const synchronize = useEffectEvent(async () => {
    if (active.current || options.blocked) return;
    const controller = new AbortController();
    active.current = controller;
    try {
      const remote = initialOwnerEdit(options.clip);
      const pending = submission.current;
      if (pending) {
        // A poll can acknowledge an applied save whose response was lost.
        if (
          remote.revision > pending.body.expectedRevision &&
          remote.baseHash === pending.body.baseHash &&
          sameOwnerEdit(remote, pending.draft)
        ) {
          submission.current = null;
          rebases.current = 0;
          receive(remote, pending.draft, "save");
        }
        return; // Other uncertain receipts remain available for exact replay.
      }
      if (++rebases.current > 3) {
        setPhase("failed");
        return;
      }
      setPhase("syncing");
      if (
        remote.revision !== options.original.revision ||
        remote.baseHash !== options.original.baseHash
      )
        receive(remote, options.original, "sync");
      else {
        const current = await latest(controller.signal);
        if (!controller.signal.aborted)
          receive(current.edit, options.original, "sync", current.list);
      }
    } catch {
      if (!controller.signal.aborted) setPhase("failed");
    } finally {
      if (active.current === controller) active.current = null;
    }
  });
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    // A read can prove an exhausted save succeeded. This path only inspects the
    // retained receipt/polled snapshot; it never starts another POST or GET.
    if (
      !active.current &&
      !options.blocked &&
      phase === "failed" &&
      options.stale &&
      submission.current
    ) {
      const timer = setTimeout(() => void synchronize(), 0);
      return () => clearTimeout(timer);
    }
    if (
      active.current ||
      options.blocked ||
      phase === "saving" ||
      phase === "syncing" ||
      phase === "conflict" ||
      phase === "failed"
    )
      return;
    if (options.stale) {
      if (phase === "waiting" && submission.current) {
        const timer = setTimeout(() => void save(), 650);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => void synchronize(), 0);
      return () => clearTimeout(timer);
    }
    if (!options.dirty && !submission.current) {
      setPhase("saved");
      return;
    }
    setPhase("waiting");
    const timer = setTimeout(() => void save(), 650);
    return () => clearTimeout(timer);
  }, [
    options.draft,
    options.original,
    options.clip,
    options.dirty,
    options.blocked,
    options.stale,
    phase,
    attempt,
  ]);
  const resolve = (keepLocal: boolean) => {
    if (!conflict || active.current) return false;
    const remote =
      options.clip.revision > conflict.saved.revision
        ? initialOwnerEdit(options.clip)
        : conflict.saved;
    const result = keepLocal
      ? reconcileEditorEdit(
          conflict.base,
          options.draft,
          remote,
          true,
          options.clip.base?.overlay.captionStyle ??
            OWNER_CAPTION_PRESETS.clean,
        )
      : null;
    if (keepLocal && (!result?.compatible || !result.valid)) return false;
    submission.current = null;
    rebases.current = 0;
    options.onAcknowledged(
      remote,
      result?.draft ?? structuredClone(remote),
      "sync",
      conflict.base,
    );
    setConflict(null);
    setPhase("saved");
    return true;
  };
  return {
    phase,
    conflict,
    resolve,
    reset: () => {
      if (active.current) return;
      submission.current = null;
      setConflict(null);
      rebases.current = 0;
      setPhase("saved");
    },
    retry: () => {
      if (phase === "failed") {
        rebases.current = 0;
        setPhase("waiting");
        setAttempt((value) => value + 1);
      }
    },
  };
}
