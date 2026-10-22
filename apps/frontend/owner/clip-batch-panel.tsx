import { useCallback, useEffect, useRef, useState } from "react";
import { ClipEditor } from "./clip-editor.tsx";
import {
  ownerClipListSchema,
  type OwnerClip,
  type OwnerClipList,
} from "../../../packages/contracts/owner/clips.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/owner/index.ts";
import type { OwnerMomentExport } from "../../../packages/contracts/owner/selection.ts";

const initial: OwnerClipList = { clips: [], active: false, workers: 1 };
export function OwnerClipBatchPanel({
  workspace,
  selected,
  onActive,
}: {
  workspace: OwnerWorkspace;
  selected: OwnerMomentExport[];
  onActive: (active: boolean) => void;
}) {
  const [list, setList] = useState(initial),
    [message, setMessage] = useState(
      "Select several moments, then process them in one action.",
    );
  const [pending, setPending] = useState(false),
    [review, setReview] = useState<string | null>(null);
  const [dirtyClip, setDirtyClip] = useState<string | null>(null);
  const editDirty = useCallback((id: string, dirty: boolean) => {
    setDirtyClip((current) => (dirty ? id : current === id ? null : current));
  }, []);
  const alive = useRef(false),
    requestController = useRef<AbortController | null>(null),
    requesting = useRef(false),
    mutationRevision = useRef(0);
  const endpoint = `/api/workspace/${workspace.id}/clips`;
  const accept = useCallback(
    (value: OwnerClipList) => {
      setList(value);
      onActive(value.active);
    },
    [onActive],
  );
  const acceptEdit = useCallback(
    (value: OwnerClipList) => {
      mutationRevision.current++;
      accept(value);
    },
    [accept],
  );
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      requestController.current?.abort();
    };
  }, [endpoint]);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = async () => {
      let repeat = true;
      const atMutation = mutationRevision.current;
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("unavailable");
        const result = ownerClipListSchema.parse(await response.json());
        if (
          !controller.signal.aborted &&
          atMutation === mutationRevision.current
        )
          accept(result);
        repeat = atMutation === mutationRevision.current ? result.active : true;
      } catch {
        if (!controller.signal.aborted)
          setMessage(
            "Clip status is unavailable. The workspace retains acknowledged work; refreshing does not reprocess it.",
          );
      }
      if (repeat && !controller.signal.aborted)
        timer = setTimeout(() => void refresh(), 750);
    };
    void refresh();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [endpoint, accept, list.active]);
  async function action(path: string, body?: unknown) {
    if (requesting.current) return;
    requesting.current = true;
    mutationRevision.current++;
    setPending(true);
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const response = await fetch(path, {
        method: "POST",
        signal: controller.signal,
        ...(body === undefined
          ? {}
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }),
      });
      if (!response.ok) throw new Error("unavailable");
      const value = ownerClipListSchema.parse(await response.json());
      if (alive.current) {
        mutationRevision.current++;
        accept(value);
        setMessage(
          "Local work list updated. Native work runs one clip at a time.",
        );
      }
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          "The action was not acknowledged. Refresh status before an explicit retry; no automatic retry is made.",
        );
    } finally {
      requestController.current = null;
      requesting.current = false;
      if (alive.current) setPending(false);
    }
  }
  const current = list.clips.find((clip) => clip.id === review);
  const working = (clip: OwnerClip) =>
    ["queued", "preparing", "rendering", "canceling"].includes(clip.state);
  return (
    <section aria-labelledby="batch-title">
      <h2 id="batch-title">Automatic local edits</h2>
      <p role="status" aria-live="polite">
        {message}
      </p>
      <p>
        {selected.length} selected · upper bound: {selected.length}{" "}
        {workspace.mode === "synthetic-ai" ? "simulated plans" : "plans"} and{" "}
        {selected.length * 3} picture attempts. Discovery is reused.{" "}
        {workspace.mode === "synthetic-ai"
          ? "Actual AI calls: zero."
          : "Provider attempts are recorded per clip."}{" "}
        Native work runs one clip at a time.
      </p>
      <nav>
        <button
          disabled={!selected.length || pending || list.active}
          onClick={() => {
            const first = selected[0]!;
            void action(endpoint, {
              operationId: crypto.randomUUID(),
              analysisId: first.analysisId,
              policyRevision: first.policyRevision,
              sourceRevision: workspace.revision,
              momentIds: selected.map((item) => item.momentId),
            });
          }}
        >
          Process selected clips
        </button>
        <button
          disabled={!list.active || pending}
          onClick={() => void action(`${endpoint}/cancel`)}
        >
          Cancel all pending clips
        </button>
      </nav>
      {dirtyClip && (
        <p role="status">
          Apply or reload unapplied changes before reviewing another clip or
          exporting this clip.
        </p>
      )}
      <ol className="clip-list">
        {list.clips.map((clip, index) => (
          <li key={clip.id}>
            <h3>
              Clip {index + 1} · {clip.state}
            </h3>
            <p>
              Revision {clip.revision} ·{" "}
              {clip.mode === "synthetic-ai" ? "simulated plans" : "plans"}{" "}
              {clip.calls.plan}, pictures {clip.calls.image} · native attempts{" "}
              {clip.calls.render}
            </p>
            {clip.error && (
              <p role="status">
                {clip.error === "canceled"
                  ? "Canceled after owned work drained."
                  : "This clip failed. Sibling outputs and the source remain available."}
              </p>
            )}
            <nav>
              <button
                disabled={
                  !clip.base ||
                  clip.outputs.length === 0 ||
                  (!!dirtyClip && dirtyClip !== clip.id)
                }
                onClick={() => setReview(clip.id)}
              >
                Review clip {index + 1}
              </button>
              <button
                disabled={
                  !working(clip) || pending || clip.state === "canceling"
                }
                onClick={() => void action(`${endpoint}/${clip.id}/cancel`)}
              >
                Cancel clip {index + 1}
              </button>
              <button
                disabled={
                  !clip.base ||
                  working(clip) ||
                  pending ||
                  dirtyClip === clip.id
                }
                onClick={() =>
                  void action(`${endpoint}/${clip.id}/render`, {
                    operationId: crypto.randomUUID(),
                    expectedRevision: clip.revision,
                  })
                }
              >
                Export clip {index + 1} again
              </button>
            </nav>
            {clip.outputs.map((output) => (
              <p key={output.id}>
                <a
                  href={`${endpoint}/${clip.id}/output/${output.revision}`}
                  download={`clip-${index + 1}-r${output.revision}.mp4`}
                >
                  Download clip {index + 1}, export {output.revision + 1}
                </a>{" "}
                · {output.frames} frames ·{" "}
                {output.editRevision === clip.revision
                  ? "current revision"
                  : "older edit revision"}
              </p>
            ))}
          </li>
        ))}
      </ol>
      {current?.base && (
        <article className="clip-review">
          <h3>Review · revision {current.revision}</h3>
          <p>
            {current.mode === "synthetic-ai"
              ? "Captions and pictures below are synthetic placeholders. "
              : "This preview uses the saved timed captions and admitted pictures. "}
            Preview uses the same overlay as native export.
          </p>
          <ClipEditor
            key={current.id}
            clip={current}
            workspaceId={workspace.id}
            onAccepted={acceptEdit}
            onDirty={editDirty}
          />
        </article>
      )}
    </section>
  );
}
