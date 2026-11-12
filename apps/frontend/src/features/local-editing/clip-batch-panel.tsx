import { ConnectionRecovery } from "../../shared/ui/connection-recovery";
import { OWNER_COLLECTION_PAGE_ITEMS as REQUEST_PAGE_ITEMS } from "../../../../../packages/contracts/local/collection-pages.ts";
import { readOwnerClips } from "./collection-pages.ts";
import { WorkspaceEditHistory } from "./edit-history";
import { createPortal } from "react-dom";
import { Button } from "../../shared/ui/button";
import buttonStyles from "../../shared/ui/workflow.module.css";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ClipEditor } from "./clip-editor.tsx";
import { ClipRailPreview } from "./clip-rail-preview";
import { BrandMark } from "../../shared/ui/brand-mark";
import { ClipNameControls } from "./clip-name-controls";
import {
  ownerClipDisplayName,
  ownerClipDownloadName,
} from "../../../../../packages/contracts/local/clip-name.ts";
import { useClipEntry } from "./use-clip-entry";
import { isLocalClipEditable } from "./clip-readiness.ts";
import { clipStageLabel } from "./clip-stage.ts";
import { ProcessingState } from "../../shared/ui/processing-state";
import { WorkflowActions } from "./workflow-actions.tsx";
import {
  ownerBatchRequestSchema,
  type OwnerClip,
  type OwnerClipList,
} from "../../../../../packages/contracts/local/clips.ts";
import {
  OWNER_LIMITS,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import type { OwnerMomentExport } from "../../../../../packages/contracts/local/selection.ts";
import type { OwnerRuntimeCapabilities } from "../../../../../packages/contracts/local/runtime.ts";
import { HOSTED_DEMO_POLICY } from "../../../../../packages/contracts/local/hosted-editing.ts";
import { DemoLimitToast } from "./demo-limit-toast.tsx";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { Trash2 } from "lucide-react";
import {
  pollClipConnection,
  retainAcknowledgedClips,
  type ClipConnection,
} from "./clip-connection.ts";
import { CodexPreparationSteps } from "./codex-preparation-steps.tsx";

const RAIL_PAGE_ITEMS = 20;
const initial: OwnerClipList = { clips: [], active: false, workers: 1 };
// Keep aligned with the clip-rail breakpoint in editor-workspace.css.
const clipStripQuery = "(max-width: 63.999rem)";
function subscribeClipLayout(update: () => void) {
  const media = window.matchMedia(clipStripQuery);
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}
const horizontalClipLayout = () => window.matchMedia(clipStripQuery).matches;
const serverClipLayout = () => false;
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
  actionTarget,
  onRecovered,
  onStartOver,
  onConnectionChange,
  onAddClips,
  initializing = false,
  reconnectRequest = 0,
  framingTarget,
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
  actionTarget?: HTMLElement | null | undefined;
  onRecovered?: ((workspace: OwnerWorkspace) => void) | undefined;
  onStartOver?: (() => void) | undefined;
  onConnectionChange?: ((state: ClipConnection) => void) | undefined;
  onAddClips?: (() => void) | undefined;
  initializing?: boolean;
  reconnectRequest?: number;
  framingTarget?: HTMLElement | null;
}) {
  const clipLimit =
    "execution" in capabilities && capabilities.demoClipLimit !== null
      ? HOSTED_DEMO_POLICY.clips
      : "capacity" in capabilities && capabilities.capacity?.manyClips
        ? Number.MAX_SAFE_INTEGER
        : OWNER_LIMITS.clips;
  const [limitNotice, setLimitNotice] = useState(0);
  const [framing, setFraming] = useState<"tracked" | "fit">("tracked");
  const [editHistory] = useState(() => new WorkspaceEditHistory());
  const [connection, setConnection] = useState<ClipConnection>("connected");
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const planningAvailable =
    capabilities.planningAvailable && workspace.mode === capabilities.aiMode;
  const [list, setList] = useState(initial),
    [message, setMessage] = useState<{
      clipId: string | null;
      text: string;
    } | null>(null);
  const [listReady, setListReady] = useState(false);
  const [pending, setPending] = useState(false),
    [review, setReview] = useState<string | null>(initialReviewId ?? null);
  const [dirtyClip, setDirtyClip] = useState<string | null>(null);
  const [editorPending, setEditorPending] = useState(false);
  const tabsId = useId();
  const {
    root: entryRoot,
    choose: prepareEntry,
    ready: previewEntryReady,
  } = useClipEntry();
  function chooseClip(id: string) {
    if (id === review) return;
    prepareEntry(document.getElementById(`${tabsId}-${id}`));
    setReview(id);
  }
  const clipList = useRef<HTMLDivElement>(null);
  const horizontal = useSyncExternalStore(
    subscribeClipLayout,
    horizontalClipLayout,
    serverClipLayout,
  );
  const keyboardClip = useRef<string | null>(null);
  useEffect(() => {
    if (keyboardClip.current) {
      document
        .getElementById(`${tabsId}-${keyboardClip.current}`)
        ?.focus({ preventScroll: horizontal });
      keyboardClip.current = null;
    }
  }, [review, tabsId, horizontal]);
  useEffect(() => {
    onDirtyChange?.(Boolean(dirtyClip));
  }, [dirtyClip, onDirtyChange]);
  const hasClips = list.clips.length > 0;
  useEffect(
    () => editHistory.retain(new Set(list.clips.map((clip) => clip.id))),
    [editHistory, list.clips],
  );
  useEffect(() => {
    if (listReady) onClipsChange?.(hasClips);
  }, [hasClips, listReady, onClipsChange]);
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
      setList((current) => retainAcknowledgedClips(current, value));
      setListReady(true);
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
    void pollClipConnection({
      workspaceId: workspace.id,
      signal: controller.signal,
      revision: () => mutationRevision.current,
      list: (value, revision) => {
        if (revision === mutationRevision.current) accept(value);
      },
      state: (value) => {
        setConnection(value);
        onConnectionChange?.(value);
        if (value === "missing") onActive(false);
      },
      recovered: onRecovered,
    });
    return () => controller.abort();
  }, [
    workspace.id,
    accept,
    connectionAttempt,
    reconnectRequest,
    onRecovered,
    onActive,
    onConnectionChange,
  ]);
  async function action(
    path: string,
    body?: unknown,
    onSuccess?: (value: OwnerClipList) => void,
  ) {
    if (requesting.current) {
      if (!path.endsWith("/cancel")) return;
      requestController.current?.abort();
    }
    requesting.current = true;
    mutationRevision.current++;
    setPending(true);
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const batch =
        path === endpoint ? ownerBatchRequestSchema.safeParse(body) : undefined;
      const messages: unknown[] = batch?.success
        ? Array.from(
            {
              length: Math.ceil(
                batch.data.momentIds.length / REQUEST_PAGE_ITEMS,
              ),
            },
            (_, index) => ({
              ...batch.data,
              operationId: crypto.randomUUID(),
              momentIds: batch.data.momentIds.slice(
                index * REQUEST_PAGE_ITEMS,
                index * REQUEST_PAGE_ITEMS + REQUEST_PAGE_ITEMS,
              ),
            }),
          )
        : [body];
      for (const [index, message] of messages.entries()) {
        controller.signal.throwIfAborted();
        const response = await fetch(path, {
          method: "POST",
          signal: controller.signal,
          ...(message === undefined
            ? {}
            : {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message),
              }),
        });
        if (response.status === 429) {
          const error: unknown = await response.json();
          if (
            error &&
            typeof error === "object" &&
            "error" in error &&
            error.error === "demo_clip_limit"
          ) {
            if (alive.current) setLimitNotice((value) => value + 1);
            return;
          }
        }
        if (!response.ok) throw new Error("unavailable");
        const value = await readOwnerClips(
          response,
          workspace.id,
          controller.signal,
        );
        if (alive.current) {
          mutationRevision.current++;
          accept(value);
          onSuccess?.(value);
          setMessage(null);
          if (path === endpoint && index === 0) onProcessed?.();
        }
      }
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage({
          clipId:
            list.clips.find((clip) =>
              path.startsWith(`${endpoint}/${clip.id}/`),
            )?.id ?? null,
          text: path.endsWith("/retry")
            ? "Couldn’t retry this clip."
            : path.endsWith("/render")
              ? "Couldn’t export this clip."
              : path.endsWith("/cancel")
                ? "Couldn’t confirm cancellation."
                : "Couldn’t process clips. Try again.",
        });
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        requesting.current = false;
        if (alive.current) setPending(false);
      }
    }
  }
  const current =
    list.clips.find((clip) => clip.id === review) ?? list.clips[0];
  const currentId = current?.id;
  const railStart =
    Math.floor(
      Math.max(
        0,
        list.clips.findIndex((clip) => clip.id === currentId),
      ) / RAIL_PAGE_ITEMS,
    ) * RAIL_PAGE_ITEMS;
  useEffect(() => {
    const rail = clipList.current;
    if (!horizontal || !rail || showProcessing) return;
    // Scroll only this strip: switching clips must not jump the page vertically.
    const reveal = () => {
      const tab = document.getElementById(`${tabsId}-${currentId}`);
      if (!tab) return;
      const bounds = rail.getBoundingClientRect(),
        selected = tab.getBoundingClientRect();
      if (selected.left < bounds.left + 4)
        rail.scrollLeft += selected.left - bounds.left - 4;
      else if (selected.right > bounds.right - 4)
        rail.scrollLeft += selected.right - bounds.right + 4;
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [currentId, horizontal, showProcessing, tabsId]);
  const currentIndex =
    list.clips.findIndex((clip) => clip.id === current?.id) + 1;
  const latest = current?.outputs.at(-1);
  const editable = current ? isLocalClipEditable(current) : false;
  const retryable = current && ["failed", "canceled"].includes(current.state);
  const working = (clip: OwnerClip) =>
    ["queued", "preparing", "rendering", "canceling"].includes(clip.state);
  const framingControl =
    capabilities.localMedia &&
    showProcessing &&
    selectionReady &&
    !list.active ? (
      <label>
        Framing
        <select
          className="select-control"
          aria-label="Clip framing"
          aria-describedby={`${tabsId}-framing-help`}
          value={framing}
          disabled={pending || list.active}
          onChange={(event) =>
            setFraming(event.currentTarget.value === "fit" ? "fit" : "tracked")
          }
        >
          <option value="tracked">Vertical framing (9:16)</option>
          <option value="fit">No tracking · Fit original</option>
        </select>
        <span id={`${tabsId}-framing-help`} className="source-hint">
          9:16 is the vertical format used for TikTok, YouTube Shorts and
          Instagram Reels.
        </span>
      </label>
    ) : null;
  return (
    <section
      ref={entryRoot}
      className="batch-section"
      hidden={initializing}
      aria-labelledby={hasClips ? "batch-title" : undefined}
      aria-label={hasClips ? undefined : "Clips"}
    >
      {hasClips && (
        <h2 id="batch-title" className="local-sr-only">
          Your clips
        </h2>
      )}
      {framingTarget === undefined
        ? framingControl
        : framingTarget &&
          framingControl &&
          createPortal(framingControl, framingTarget)}
      {message &&
        ((message.clipId === null && showProcessing) ||
          (message.clipId === currentId &&
            !showProcessing &&
            !dirtyClip &&
            !editorPending)) && (
          <WorkflowActions
            target={actionTarget}
            label="Clip action feedback"
            feedback
          >
            <InlineFeedback message={message.text} />
          </WorkflowActions>
        )}
      {!planningAvailable && (hasClips || selected.length > 0) && (
        <p role="status">AI unavailable. Prepared clips still work.</p>
      )}
      {!initializing && connection !== "connected" && (
        <WorkflowActions target={actionTarget} label="Session connection">
          <ConnectionRecovery
            layout="compact"
            state={connection}
            onReconnect={() => {
              setConnection("reconnecting");
              setConnectionAttempt((value) => value + 1);
            }}
            onNewSession={onStartOver}
          />
        </WorkflowActions>
      )}
      {connection === "connected" &&
        ((showProcessing && selectionReady) ||
          (!showProcessing && list.active && !dirtyClip)) && (
          <WorkflowActions target={actionTarget} label="Clip processing">
            {limitNotice > 0 && (
              <DemoLimitToast
                key={limitNotice}
                message="Limit: 3 clips per run. Existing clips are preserved."
              />
            )}
            {showProcessing && selectionReady && !list.active && (
              <Button
                variant="primary"
                disabled={
                  !planningAvailable ||
                  !selected.length ||
                  selected.length > clipLimit ||
                  pending ||
                  list.active ||
                  !!dirtyClip
                }
                onClick={() => {
                  if (
                    !planningAvailable ||
                    !selected.length ||
                    selected.length > clipLimit
                  )
                    return;
                  const first = selected[0]!;
                  void action(endpoint, {
                    operationId: crypto.randomUUID(),
                    analysisId: first.analysisId,
                    policyRevision: first.policyRevision,
                    sourceRevision: workspace.revision,
                    momentIds: selected.map((item) => item.momentId),
                    framing: capabilities.localMedia ? framing : "tracked",
                  });
                }}
              >
                Process clips
              </Button>
            )}
            {!showProcessing && list.active && (
              <Button
                variant="secondary"
                disabled={!list.active}
                onClick={() => void action(`${endpoint}/cancel`)}
              >
                <span>
                  Cancel<span className="local-action-detail"> processing</span>
                </span>
              </Button>
            )}
          </WorkflowActions>
        )}
      <div className="clip-workspace" hidden={showProcessing}>
        <aside className="clip-rail" aria-label="Clips">
          <div className="clip-rail-heading">
            <strong>Clips</strong>
            {onAddClips && (
              <Button
                variant="secondary"
                disabled={
                  !!dirtyClip || pending || editorPending || list.active
                }
                onClick={onAddClips}
              >
                + Add
              </Button>
            )}
          </div>
          <div
            ref={clipList}
            className="clip-list"
            role="tablist"
            aria-label="Choose a clip"
            aria-orientation={horizontal ? "horizontal" : "vertical"}
          >
            {list.clips
              .slice(railStart, railStart + RAIL_PAGE_ITEMS)
              .map((clip) => {
                const index = list.clips.findIndex(
                  (item) => item.id === clip.id,
                );
                return (
                  <div
                    key={clip.id}
                    className="clip-card"
                    role="presentation"
                    data-selected={current?.id === clip.id || undefined}
                  >
                    <ClipNameControls
                      clip={clip}
                      index={index + 1}
                      workspaceId={workspace.id}
                      onAccepted={acceptEdit}
                      disabled={
                        !!dirtyClip ||
                        pending ||
                        editorPending ||
                        connection !== "connected"
                      }
                      tabIndex={current?.id === clip.id ? 0 : -1}
                    />
                    <Button
                      variant="secondary"
                      className="clip-choice"
                      role="tab"
                      id={`${tabsId}-${clip.id}`}
                      aria-controls={`${tabsId}-panel`}
                      aria-selected={current?.id === clip.id}
                      tabIndex={current?.id === clip.id ? 0 : -1}
                      aria-label={`Edit ${ownerClipDisplayName(clip, index + 1)}`}
                      disabled={!!dirtyClip && dirtyClip !== clip.id}
                      onClick={() => chooseClip(clip.id)}
                      onKeyDown={(event) => {
                        const previous = horizontal ? "ArrowLeft" : "ArrowUp",
                          following = horizontal ? "ArrowRight" : "ArrowDown";
                        if (
                          dirtyClip ||
                          ![previous, following, "Home", "End"].includes(
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
                                    (event.key === following ? 1 : -1) +
                                    list.clips.length) %
                                  list.clips.length
                          ]!;
                        if (next.id === current?.id) {
                          keyboardClip.current = null;
                          event.currentTarget.focus();
                        } else {
                          keyboardClip.current = next.id;
                          chooseClip(next.id);
                        }
                      }}
                    >
                      {isLocalClipEditable(clip) ? (
                        <ClipRailPreview
                          clip={clip}
                          workspaceId={workspace.id}
                        />
                      ) : (
                        <span
                          className="clip-rail-preview clip-rail-pending"
                          aria-hidden="true"
                        >
                          <BrandMark className="clip-rail-watermark" />
                        </span>
                      )}
                      <span className="clip-state">{clipStageLabel(clip)}</span>
                    </Button>
                  </div>
                );
              })}
          </div>
        </aside>
        {current && (
          <article
            className="clip-review"
            role="tabpanel"
            id={`${tabsId}-panel`}
            aria-labelledby={`${tabsId}-${current.id}`}
          >
            <>
              {list.clips.length > RAIL_PAGE_ITEMS && (
                <nav className="collection-navigation" aria-label="Clip pages">
                  <Button
                    variant="secondary"
                    disabled={!!dirtyClip || railStart === 0}
                    onClick={() =>
                      setReview(
                        list.clips[Math.max(0, railStart - RAIL_PAGE_ITEMS)]!
                          .id,
                      )
                    }
                  >
                    Previous
                  </Button>
                  <span>
                    Clip {currentIndex} of {list.clips.length}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={
                      !!dirtyClip ||
                      railStart + RAIL_PAGE_ITEMS >= list.clips.length
                    }
                    onClick={() =>
                      setReview(
                        list.clips[
                          Math.min(
                            list.clips.length - 1,
                            railStart + RAIL_PAGE_ITEMS,
                          )
                        ]!.id,
                      )
                    }
                  >
                    Next
                  </Button>
                </nav>
              )}
              {connection === "connected" &&
                !showProcessing &&
                (!list.active || retryable) && (
                  <WorkflowActions
                    target={actionTarget}
                    label={`Clip ${currentIndex} actions`}
                  >
                    {current.state === "canceled" && !dirtyClip && (
                      <Button
                        className="clip-remove"
                        variant="secondary"
                        aria-label="Remove clip"
                        title="Remove clip"
                        disabled={pending || editorPending}
                        onClick={() =>
                          void action(
                            `${endpoint}/${current.id}/remove`,
                            {
                              operationId: crypto.randomUUID(),
                              expectedRevision: current.revision,
                            },
                            (value) => {
                              const next =
                                value.clips[
                                  Math.min(
                                    currentIndex - 1,
                                    value.clips.length - 1,
                                  )
                                ];
                              keyboardClip.current = next?.id ?? null;
                              setReview(next?.id ?? null);
                            },
                          )
                        }
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        <span className="local-action-detail">Remove clip</span>
                      </Button>
                    )}
                    {(retryable ||
                      (current.base &&
                        editable &&
                        latest?.editRevision !== current.revision)) && (
                      <Button
                        variant="primary"
                        disabled={
                          working(current) ||
                          pending ||
                          editorPending ||
                          (!current.base && !planningAvailable) ||
                          dirtyClip === current.id
                        }
                        onClick={() =>
                          void action(
                            `${endpoint}/${current.id}/${retryable ? "retry" : "render"}`,
                            {
                              operationId: crypto.randomUUID(),
                              expectedRevision: current.revision,
                            },
                          )
                        }
                      >
                        {retryable ? (
                          <span>
                            Retry
                            <span className="local-action-detail"> clip</span>
                          </span>
                        ) : (
                          "Export clip"
                        )}
                      </Button>
                    )}
                    {latest &&
                      editable &&
                      latest.editRevision === current.revision &&
                      (dirtyClip || editorPending ? (
                        <Button variant="primary" disabled>
                          Download clip
                        </Button>
                      ) : (
                        <a
                          className={`${buttonStyles.button} ${buttonStyles.primary}`}
                          aria-label={
                            latest.editRevision === current.revision
                              ? "Download clip"
                              : "Download previous export"
                          }
                          href={`${endpoint}/${current.id}/output/${latest.revision}`}
                          download={ownerClipDownloadName(
                            current,
                            currentIndex,
                            latest.revision,
                          )}
                        >
                          {latest.editRevision === current.revision
                            ? "Download clip"
                            : "Previous export"}
                        </a>
                      ))}
                  </WorkflowActions>
                )}
            </>
            {current.error &&
              ["canceled", "failed"].includes(current.state) && (
                <p role="status">
                  {current.error === "canceled"
                    ? "Canceled."
                    : "Couldn’t process this clip."}
                </p>
              )}
            {working(current) && (
              <ProcessingState
                layout="workspace"
                label={clipStageLabel(current)}
              >
                {current.state === "preparing" &&
                  "aiProvider" in capabilities &&
                  capabilities.aiProvider === "codex" && (
                    <CodexPreparationSteps
                      key={current.id}
                      workspaceId={workspace.id}
                      clipId={current.id}
                      preparationStage={current.preparationStage}
                    />
                  )}
              </ProcessingState>
            )}
            {editable && !showProcessing && (
              <ClipEditor
                key={current.id}
                clip={current}
                workspaceId={workspace.id}
                source={workspace.source}
                onAccepted={acceptEdit}
                history={editHistory}
                onDirty={editDirty}
                actionTarget={actionTarget}
                actionsVisible={!showProcessing}
                captionGeneration={capabilities.captionGeneration ?? false}
                visualDiscovery={capabilities.visualDiscovery ?? false}
                hookTitleSuggestions={
                  capabilities.hookTitleSuggestions ?? false
                }
                captionProvider={
                  "captionProvider" in capabilities
                    ? capabilities.captionProvider
                    : undefined
                }
                fakeCaptionGeneration={capabilities.localMedia}
                youtubeAudio={
                  "youtubeAudio" in capabilities &&
                  capabilities.youtubeAudio === true
                }
                onBusy={onActive}
                onPending={setEditorPending}
                onPreviewReady={previewEntryReady}
              />
            )}
          </article>
        )}
      </div>
    </section>
  );
}
