import { useEffect, useRef, useState } from "react";
import {
  ownerDraftListSchema,
  ownerDraftStatusSchema,
  type OwnerDraftStatus,
  type OwnerDraftSummary,
} from "../../../../../packages/contracts/local/drafts.ts";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import type { OwnerRuntimeCapabilities } from "../../../../../packages/contracts/local/runtime.ts";

function savedTime(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "No completed save";
}

/** Saving is explicit once; acknowledged edits then autosave in the local host. */
export function OwnerDraftPanel({
  workspace,
  capabilities,
  busy,
  active,
  onBusy,
  onOpen,
}: {
  workspace: OwnerWorkspace | null;
  capabilities: OwnerRuntimeCapabilities;
  busy: boolean;
  active: boolean;
  onBusy: (busy: boolean) => void;
  onOpen: (workspace: OwnerWorkspace) => void;
}) {
  const [drafts, setDrafts] = useState<OwnerDraftSummary[]>([]);
  const [status, setStatus] = useState<OwnerDraftStatus | null>(null);
  const [statusWorkspace, setStatusWorkspace] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Save once to keep a reopenable private draft.",
  );
  const [listError, setListError] = useState(false);
  const [statusError, setStatusError] = useState(false);
  const [pending, setPending] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const alive = useRef(false);
  const mutation = useRef<AbortController | null>(null);
  const ownsBusy = useRef(false);
  const readGeneration = useRef(0);
  const busyCallback = useRef(onBusy);
  const workspaceId = workspace?.id ?? null;
  const currentStatus = statusWorkspace === workspaceId ? status : null;
  useEffect(() => {
    busyCallback.current = onBusy;
  }, [onBusy]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      mutation.current?.abort();
      if (ownsBusy.current) {
        ownsBusy.current = false;
        busyCallback.current(false);
      }
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function readList() {
      const generation = readGeneration.current;
      try {
        const response = await fetch("/api/local/drafts", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const value = ownerDraftListSchema.parse(await response.json());
        if (
          !controller.signal.aborted &&
          generation === readGeneration.current
        ) {
          setDrafts(value);
          setListError(false);
        }
      } catch {
        if (!controller.signal.aborted && generation === readGeneration.current)
          setListError(true);
      }
    }
    async function readStatus() {
      if (!workspaceId) return;
      const generation = readGeneration.current;
      try {
        const response = await fetch(
          `/api/local/workspace/${workspaceId}/draft`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("unavailable");
        const value = ownerDraftStatusSchema.parse(await response.json());
        if (
          !controller.signal.aborted &&
          generation === readGeneration.current
        ) {
          setStatus(value);
          setStatusWorkspace(workspaceId);
          setStatusError(false);
        }
      } catch {
        if (!controller.signal.aborted && generation === readGeneration.current)
          setStatusError(true);
      }
      if (!controller.signal.aborted)
        timer = setTimeout(() => void readStatus(), 1000);
    }
    void readList();
    void readStatus();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [workspaceId, refresh]);

  async function perform(kind: "save" | "open" | "delete", id?: string) {
    if (mutation.current || busy) return;
    if (
      kind === "save" &&
      (!workspaceId || !currentStatus || (!currentStatus.id && active))
    )
      return;
    if (kind === "open" && (workspaceId || !id)) return;
    if (kind === "delete" && !id) return;
    const controller = new AbortController();
    mutation.current = controller;
    readGeneration.current++;
    ownsBusy.current = true;
    setPending(true);
    onBusy(true);
    try {
      const url =
        kind === "save"
          ? `/api/local/workspace/${workspaceId}/draft`
          : `/api/local/drafts/${id}${kind === "open" ? "/open" : ""}`;
      const response = await fetch(url, {
        method: kind === "delete" ? "DELETE" : "POST",
        signal: controller.signal,
      });
      if (!response.ok || (kind === "delete" && response.status !== 204))
        throw new Error("unacknowledged");
      readGeneration.current++;
      if (kind === "save") {
        const value = ownerDraftStatusSchema.parse(await response.json());
        if (!alive.current || controller.signal.aborted) return;
        setStatus(value);
        setStatusWorkspace(workspaceId);
        setStatusError(false);
        setMessage(
          value.state === "saved"
            ? "Draft saved locally. Applied edits now autosave; unapplied form changes are not included."
            : value.state === "saving"
              ? "Local save is still running. Durability is confirmed only when its status becomes saved."
              : "The latest changes were not saved. They remain in this running workspace; any last good saved copy is preserved. Retry Save when ready.",
        );
      } else if (kind === "open") {
        const value = ownerWorkspaceSchema.parse(await response.json());
        if (!alive.current || controller.signal.aborted) return;
        onOpen(value);
        setMessage(
          "Saved source, captions, pictures and edits reopened after local validation. No analysis or processing was started.",
        );
      } else {
        if (!alive.current || controller.signal.aborted) return;
        setDrafts((items) => items.filter((item) => item.id !== id));
        setMessage(
          "Only the selected draft was deleted. Its source master and saved exports remain independent.",
        );
      }
      if (alive.current) setRefresh((value) => value + 1);
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          "The action was not acknowledged. The latest workspace state and any last good saved draft are preserved. Refresh the list/status before an explicit retry; no automatic processing is started.",
        );
    } finally {
      mutation.current = null;
      if (ownsBusy.current) {
        ownsBusy.current = false;
        onBusy(false);
      }
      if (alive.current) setPending(false);
    }
  }
  const locked = busy || pending;
  return (
    <section aria-labelledby="draft-title">
      <h2 id="draft-title">Private local drafts</h2>
      <p role="status" aria-live="polite">
        {message}
      </p>
      <p>
        Drafts, source masters and exports use separate folders under
        Downloads/ClipBuilder. Save keeps the source reference, validated words
        and candidates, automatic clip bases, applied presentation edits and
        required normalized pictures. Deleting a draft preserves its source and
        saved exports.
      </p>
      {workspace && (
        <>
          {statusError ? (
            <p role="alert">
              Draft status is unavailable. A save is not confirmed until the
              local host acknowledges it.
            </p>
          ) : !currentStatus ? (
            <p role="status">Checking this workspace’s draft status…</p>
          ) : (
            <p role="status">
              {currentStatus.state === "session-only"
                ? "Session only: this workspace has not been saved."
                : currentStatus.state === "saving"
                  ? "Saving acknowledged changes locally…"
                  : currentStatus.state === "unsaved"
                    ? "Unsaved changes remain in this running workspace. Any last good saved copy is preserved."
                    : "Acknowledged draft saved locally."}{" "}
              Last completed save: {savedTime(currentStatus.savedAt)}.
            </p>
          )}
          <button
            type="button"
            disabled={locked || !currentStatus || (!currentStatus.id && active)}
            onClick={() => void perform("save")}
          >
            {currentStatus?.id ? "Save draft now" : "Save draft locally"}
          </button>
          {!currentStatus?.id && active && (
            <p>
              Finish or cancel native work before the first save. Later
              acknowledged edits autosave to the same draft.
            </p>
          )}
          <p>
            Only applied and acknowledged revisions are saved. A failed save
            leaves the running workspace available for a retry; browser refresh
            does not make an unsaved workspace durable.
          </p>
        </>
      )}
      <nav>
        <button
          type="button"
          disabled={locked}
          onClick={() => setRefresh((value) => value + 1)}
        >
          Refresh saved drafts and status
        </button>
      </nav>
      {listError && (
        <p role="alert">
          The saved-draft list is unavailable. Previously displayed rows have
          not been confirmed again; refresh before changing them.
        </p>
      )}
      {!drafts.length && !listError && <p>No saved drafts are listed.</p>}
      {workspace && drafts.length > 0 && (
        <p>
          Clear the current processing workspace before opening another saved
          draft. This leaves its saved files independent.
        </p>
      )}
      <ol className="clip-list">
        {drafts.map((draft) => {
          const label = `draft ${draft.id.slice(0, 8)}, saved ${savedTime(draft.savedAt)}, ${draft.clips} clips`;
          return (
            <li key={draft.id}>
              <h3>
                Draft {draft.id.slice(0, 8)}
                {draft.id === currentStatus?.id ? " · open" : ""}
              </h3>
              <p>
                {draft.clips} clips · saved {savedTime(draft.savedAt)}
              </p>
              <nav>
                <button
                  type="button"
                  disabled={locked || !!workspace || listError}
                  aria-label={`Open ${label}`}
                  onClick={() => void perform("open", draft.id)}
                >
                  Open saved draft
                </button>
                <button
                  type="button"
                  disabled={locked || listError}
                  aria-label={`Delete ${label}`}
                  onClick={() => {
                    if (locked || listError) return;
                    if (
                      window.confirm(
                        `Delete only ${label}? Its source master and saved exports will remain. This removes the draft and its owned picture files.`,
                      )
                    )
                      void perform("delete", draft.id);
                  }}
                >
                  Delete this draft
                </button>
              </nav>
            </li>
          );
        })}
      </ol>
      <p>
        Opening a valid saved bundle, reading, editing and native re-export need
        no AI keys. Saved clips keep their original AI and picture provenance.
        {capabilities.aiMode === "synthetic-ai"
          ? " Fresh automatic analysis is simulated in this runtime."
          : capabilities.aiMode === "provider-ai"
            ? " Fresh automatic analysis uses this runtime's provider."
            : " Fresh automatic analysis is unavailable in this runtime."}{" "}
        No offline AI model is included, and real caption readability, crop and
        A/V quality still need owner review.
      </p>
    </section>
  );
}
