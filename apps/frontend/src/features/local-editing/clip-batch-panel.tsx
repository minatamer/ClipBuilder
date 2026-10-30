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
import { isLocalClipEditable } from "./clip-readiness.ts";
import { clipStageLabel } from "./clip-stage.ts";
import { ProcessingState } from "../../shared/ui/processing-state";
import { WorkflowActions } from "./workflow-actions.tsx";
import {
  ownerClipListSchema,
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
import { LoaderCircle } from "lucide-react";
import { pollClipConnection, type ClipConnection } from "./clip-connection.ts";

const initial: OwnerClipList = { clips: [], active: false, workers: 1 };
// Keep aligned with the clip-strip media query in style.css, including large tablets.
const clipStripQuery =
  "(max-width: 75rem), (hover: none) and (pointer: coarse)";
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
  footerTarget,
  onRecovered,
  onStartOver,
  onConnected,
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
  onRecovered?: ((workspace: OwnerWorkspace) => void) | undefined;
  onStartOver?: (() => void) | undefined;
  onConnected?: ((connected: boolean) => void) | undefined;
}) {
  const clipLimit =
    "execution" in capabilities && capabilities.demoClipLimit !== null
      ? HOSTED_DEMO_POLICY.clips
      : OWNER_LIMITS.clips;
  const [limitNotice, setLimitNotice] = useState(0);
  const [connection, setConnection] = useState<ClipConnection>("connected");
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const planningAvailable =
    capabilities.planningAvailable && workspace.mode === capabilities.aiMode;
  const [list, setList] = useState(initial),
    [message, setMessage] = useState("");
  const [pending, setPending] = useState(false),
    [review, setReview] = useState<string | null>(initialReviewId ?? null);
  const [dirtyClip, setDirtyClip] = useState<string | null>(null);
  const [editorPending, setEditorPending] = useState(false);
  const tabsId = useId();
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
    void pollClipConnection({
      workspaceId: workspace.id,
      signal: controller.signal,
      revision: () => mutationRevision.current,
      list: (value, revision) => {
        if (revision === mutationRevision.current) accept(value);
      },
      state: (value) => {
        setConnection(value);
        onConnected?.(value === "connected");
        if (value === "missing") onActive(false);
      },
      recovered: onRecovered,
    });
    return () => controller.abort();
  }, [
    workspace.id,
    accept,
    connectionAttempt,
    onRecovered,
    onActive,
    onConnected,
  ]);
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
  const currentId = current?.id;
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
      {limitNotice > 0 && (
        <DemoLimitToast
          key={limitNotice}
          message="Free demo mode allows 3 clips total per run. Your existing clips are still available to edit and export."
        />
      )}
      {!planningAvailable && (hasClips || selected.length > 0) && (
        <p role="status">AI unavailable. Prepared clips still work.</p>
      )}
      {connection !== "connected" && (
        <WorkflowActions target={footerTarget} label="Session connection">
          <span
            className="connection-status"
            data-missing={connection === "missing" || undefined}
            role="status"
            aria-live="polite"
          >
            {connection === "reconnecting" && (
              <LoaderCircle
                size={16}
                className="acquisition-spinner"
                aria-hidden="true"
              />
            )}
            {connection === "reconnecting"
              ? "Reconnecting…"
              : connection === "missing"
                ? "This session is no longer available."
                : "Couldn’t reconnect."}
          </span>
          {connection !== "reconnecting" && (
            <Button
              variant="secondary"
              onClick={() => {
                setConnection("reconnecting");
                setConnectionAttempt((value) => value + 1);
              }}
            >
              Try again
            </Button>
          )}
          {connection === "missing" && onStartOver && (
            <Button variant="primary" onClick={onStartOver}>
              Start new session
            </Button>
          )}
        </WorkflowActions>
      )}
      {connection === "connected" &&
        ((showProcessing && selectionReady) ||
          (!showProcessing && list.active && !dirtyClip)) && (
          <WorkflowActions target={footerTarget} label="Clip processing">
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
      <div className="clip-workspace" hidden={showProcessing}>
        <div
          ref={clipList}
          className="clip-list"
          role="tablist"
          aria-label="Choose a clip"
          aria-orientation={horizontal ? "horizontal" : "vertical"}
        >
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
                const previous = horizontal ? "ArrowLeft" : "ArrowUp",
                  following = horizontal ? "ArrowRight" : "ArrowDown";
                if (
                  dirtyClip ||
                  ![previous, following, "Home", "End"].includes(event.key)
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
                  setReview(next.id);
                }
              }}
            >
              <span>Clip {index + 1}</span>
              <span className="clip-state">{clipStageLabel(clip)}</span>
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
              {connection === "connected" &&
                !showProcessing &&
                (!list.active || retryable) && (
                  <WorkflowActions
                    target={footerTarget}
                    label={`Clip ${currentIndex} actions`}
                  >
                    {(retryable ||
                      (current.base &&
                        editable &&
                        latest?.editRevision !== current.revision)) &&
                      !dirtyClip && (
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
                          {retryable ? "Retry clip" : "Export clip"}
                        </Button>
                      )}
                    {latest &&
                      editable &&
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
                    : "Couldn’t process this clip."}
                </p>
              )}
            {working(current) && (
              <ProcessingState
                className="clip-preparing"
                label={clipStageLabel(current)}
              />
            )}
            {editable && !showProcessing && (
              <ClipEditor
                key={current.id}
                clip={current}
                workspaceId={workspace.id}
                source={workspace.source}
                onAccepted={acceptEdit}
                onDirty={editDirty}
                footerTarget={footerTarget}
                actionsVisible={!showProcessing}
                captionGeneration={capabilities.captionGeneration ?? false}
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
              />
            )}
          </article>
        )}
      </div>
    </section>
  );
}
