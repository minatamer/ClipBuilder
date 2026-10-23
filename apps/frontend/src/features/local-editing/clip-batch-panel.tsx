import { Button } from "../../shared/ui/button";
import buttonStyles from "../../shared/ui/workflow.module.css";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ClipEditor } from "./clip-editor.tsx";
import { LoaderCircle } from "lucide-react";
import { WorkflowActions } from "./workflow-actions.tsx";
import {
  ownerClipListSchema,
  type OwnerClip,
  type OwnerClipList,
} from "../../../../../packages/contracts/local/clips.ts";
import type { OwnerWorkspace } from "../../../../../packages/contracts/local/index.ts";
import type { OwnerMomentExport } from "../../../../../packages/contracts/local/selection.ts";
import type { OwnerRuntimeCapabilities } from "../../../../../packages/contracts/local/runtime.ts";

const initial: OwnerClipList = { clips: [], active: false, workers: 1 };
const STATUS_UNAVAILABLE = "Reconnecting…";
export function OwnerClipBatchPanel({
  workspace,
  capabilities,
  selected,
  onActive,
  onClipsChange,
  onProcessed,
  initialReviewId,
  onDirtyChange,
  showProcessing = true,
  selectionReady = selected.length > 0,
  footerTarget,
}: {
  workspace: OwnerWorkspace;
  capabilities: OwnerRuntimeCapabilities;
  selected: OwnerMomentExport[];
  onActive: (active: boolean) => void;
  onClipsChange?: (hasClips: boolean) => void;
  onProcessed?: () => void;
  initialReviewId?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  showProcessing?: boolean;
  selectionReady?: boolean;
  footerTarget?: HTMLElement | null | undefined;
}) {
  const planningAvailable =
    capabilities.planningAvailable && workspace.mode === capabilities.aiMode;
  const [list, setList] = useState(initial),
    [message, setMessage] = useState("");
  const [pending, setPending] = useState(false),
    [review, setReview] = useState<string | null>(initialReviewId ?? null);
  const [dirtyClip, setDirtyClip] = useState<string | null>(null);
  const tabsId = useId();
  const keyboardClip = useRef<string | null>(null);
  useEffect(() => {
    if (keyboardClip.current) {
      document.getElementById(`${tabsId}-${keyboardClip.current}`)?.focus();
      keyboardClip.current = null;
    }
  }, [review, tabsId]);
  useEffect(() => {
    onDirtyChange?.(Boolean(dirtyClip));
  }, [dirtyClip, onDirtyChange]);
  const hasClips = list.clips.length > 0;
  useEffect(() => {
    onClipsChange?.(hasClips);
  }, [hasClips, onClipsChange]);
  const editDirty = useCallback((id: string, dirty: boolean) => {
    setDirtyClip((current) => (dirty ? id : current === id ? null : current));
  }, []);
  const alive = useRef(false),
    requestController = useRef<AbortController | null>(null),
    requesting = useRef(false),
    mutationRevision = useRef(0);
  const endpoint = `/api/local/workspace/${workspace.id}/clips`;
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
      let delay = 1000;
      const atMutation = mutationRevision.current;
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("unavailable");
        const result = ownerClipListSchema.parse(await response.json());
        if (
          !controller.signal.aborted &&
          atMutation === mutationRevision.current
        ) {
          accept(result);
          setMessage((current) =>
            current === STATUS_UNAVAILABLE ? "" : current,
          );
        }
        delay =
          atMutation !== mutationRevision.current || result.active ? 750 : 1000;
      } catch {
        if (!controller.signal.aborted) setMessage(STATUS_UNAVAILABLE);
      }
      // Another local client can edit an idle bundle; reads never dispatch work.
      if (!controller.signal.aborted)
        timer = setTimeout(() => void refresh(), delay);
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
        setMessage("");
        if (path === endpoint) onProcessed?.();
      }
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage("Couldn’t complete this action. Try again.");
    } finally {
      requestController.current = null;
      requesting.current = false;
      if (alive.current) setPending(false);
    }
  }
  const current =
    list.clips.find((clip) => clip.id === review) ?? list.clips[0];
  const currentIndex =
    list.clips.findIndex((clip) => clip.id === current?.id) + 1;
  const latest = current?.outputs.at(-1);
  const working = (clip: OwnerClip) =>
    ["queued", "preparing", "rendering", "canceling"].includes(clip.state);
  return (
    <section
      className="batch-section"
      aria-labelledby={hasClips ? "batch-title" : undefined}
      aria-label={hasClips ? undefined : "Clips"}
    >
      {hasClips && (
        <h2 id="batch-title" className="local-sr-only">
          Your clips
        </h2>
      )}
      <p className="flow-notice" role="status" aria-live="polite">
        {message}
      </p>
      {!planningAvailable && (hasClips || selected.length > 0) && (
        <p role="status">AI unavailable. Prepared clips still work.</p>
      )}
      {((showProcessing && selectionReady) ||
        (!showProcessing && list.active && !dirtyClip)) && (
        <WorkflowActions target={footerTarget} label="Clip processing">
          {showProcessing && selectionReady && !list.active && (
            <Button
              variant="primary"
              disabled={
                !planningAvailable ||
                !selected.length ||
                pending ||
                list.active ||
                !!dirtyClip
              }
              onClick={() => {
                if (!planningAvailable) return;
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
              Process clips
            </Button>
          )}
          {!showProcessing && list.active && (
            <Button
              variant="secondary"
              disabled={!list.active || pending}
              onClick={() => void action(`${endpoint}/cancel`)}
            >
              Cancel processing
            </Button>
          )}
        </WorkflowActions>
      )}
      <div hidden={showProcessing}>
        <div className="clip-list" role="tablist" aria-label="Choose a clip">
          {list.clips.map((clip, index) => (
            <Button
              key={clip.id}
              variant="secondary"
              className="clip-choice"
              role="tab"
              id={`${tabsId}-${clip.id}`}
              aria-controls={`${tabsId}-panel`}
              aria-selected={current?.id === clip.id}
              tabIndex={current?.id === clip.id ? 0 : -1}
              aria-label={`Edit clip ${index + 1}`}
              disabled={!!dirtyClip && dirtyClip !== clip.id}
              onClick={() => setReview(clip.id)}
              onKeyDown={(event) => {
                if (
                  dirtyClip ||
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  list.clips[
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? list.clips.length - 1
                        : (index +
                            (event.key === "ArrowRight" ? 1 : -1) +
                            list.clips.length) %
                          list.clips.length
                  ]!;
                if (next.id === current?.id) {
                  keyboardClip.current = null;
                  event.currentTarget.focus();
                } else {
                  keyboardClip.current = next.id;
                  setReview(next.id);
                }
              }}
            >
              <span>Clip {index + 1}</span>
              <span className="clip-state">
                {(
                  {
                    "validated-revision": "Edited",
                    "review-ready": "Ready to edit",
                    rendering: "Exporting",
                  } as Partial<Record<OwnerClip["state"], string>>
                )[clip.state] ?? clip.state}
              </span>
            </Button>
          ))}
        </div>
        {current && (
          <article
            className="clip-review"
            role="tabpanel"
            id={`${tabsId}-panel`}
            aria-labelledby={`${tabsId}-${current.id}`}
          >
            <div className="section-heading">
              <div>
                <h3 className="local-sr-only">Clip {currentIndex}</h3>
              </div>
              {!showProcessing && !list.active && (
                <WorkflowActions
                  target={footerTarget}
                  label={`Clip ${currentIndex} actions`}
                >
                  {current.base &&
                    !dirtyClip &&
                    latest?.editRevision !== current.revision && (
                      <Button
                        variant="primary"
                        disabled={
                          working(current) ||
                          pending ||
                          dirtyClip === current.id
                        }
                        onClick={() =>
                          void action(`${endpoint}/${current.id}/render`, {
                            operationId: crypto.randomUUID(),
                            expectedRevision: current.revision,
                          })
                        }
                      >
                        Export clip
                      </Button>
                    )}
                  {latest &&
                    !dirtyClip &&
                    latest.editRevision === current.revision && (
                      <a
                        className={`${buttonStyles.button} ${buttonStyles.primary}`}
                        aria-label={
                          latest.editRevision === current.revision
                            ? "Download clip"
                            : "Download previous export"
                        }
                        href={`${endpoint}/${current.id}/output/${latest.revision}`}
                        download={`clip-${currentIndex}-r${latest.revision}.mp4`}
                      >
                        {latest.editRevision === current.revision
                          ? "Download clip"
                          : "Previous export"}
                      </a>
                    )}
                </WorkflowActions>
              )}
            </div>
            {current.error &&
              ["canceled", "failed"].includes(current.state) && (
                <p role="status">
                  {current.error === "canceled"
                    ? "Canceled."
                    : "Couldn’t process this clip. Try again."}
                </p>
              )}
            {!current.base && working(current) && (
              <div className="clip-preparing" role="status">
                <LoaderCircle
                  size={24}
                  className="acquisition-spinner"
                  aria-hidden="true"
                />
                <span>
                  {current.state === "queued" ? "Queued" : "Preparing clip…"}
                </span>
              </div>
            )}
            {current.base && !showProcessing && (
              <ClipEditor
                key={current.id}
                clip={current}
                workspaceId={workspace.id}
                onAccepted={acceptEdit}
                onDirty={editDirty}
                footerTarget={footerTarget}
                actionsVisible={!showProcessing}
              />
            )}
          </article>
        )}
      </div>
    </section>
  );
}
