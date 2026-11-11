"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ControlTabs } from "./control-tabs";
import { ThumbnailVideo } from "../../shared/ui/video-thumbnail";
import { CircleAlert, Upload } from "lucide-react";
import { Workspace } from "../../shared/ui/workspace";
import { WorkflowFrame } from "../../shared/ui/workflow-frame";
import { Button } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import { OwnerSelectionPanel } from "./selection-panel.tsx";
import type { OwnerMomentExport } from "../../../../../packages/contracts/local/selection.ts";
import { OwnerClipBatchPanel } from "./clip-batch-panel.tsx";
import { SessionControls } from "./session-controls.tsx";
import { editorTourStorage, resetEditorTour } from "./editor-tour-preference";
import { openPickedFile } from "./open-local-file.ts";
import { OwnerAcquisitionPanel } from "./acquisition-panel.tsx";
import { capturePreviewTime } from "./manual-time.ts";
import { AnalysisChallenge } from "../source-analysis/analysis-challenge";
import { uploadHostedVideo, type HostedUploadProgress } from "./hosted-upload";
import { ProcessingState } from "../../shared/ui/processing-state";
import type { ClipConnection } from "./clip-connection";
import {
  hostedDemoStatusSchema,
  type HostedDemoStatus,
} from "../../../../../packages/contracts/local/hosted-editing.ts";
import { DemoLimitScreen } from "./demo-limit-screen.tsx";
import {
  ownerRuntimeCapabilitiesSchema,
  type OwnerRuntimeCapabilities,
} from "../../../../../packages/contracts/local/runtime.ts";

export function LocalEditingExperience({
  hosted = false,
}: { hosted?: boolean } = {}) {
  const [challenge, setChallenge] = useState<string | null>(null);
  const challengeResult = useRef<{
    resolve: (token: string) => void;
    reject: () => void;
  } | null>(null);
  const challengeToken = useCallback(
    (token: string) => challengeResult.current?.resolve(token),
    [],
  );
  const challengeCancel = useCallback(
    () => challengeResult.current?.reject(),
    [],
  );
  const [workspace, setWorkspace] = useState<OwnerWorkspace | null>(null);
  const [demoStatus, setDemoStatus] = useState<HostedDemoStatus | null>(null);
  const [capabilities, setCapabilities] =
    useState<OwnerRuntimeCapabilities | null>(null);
  const [busy, setBusy] = useState(true);
  const [openingState, setOpeningState] = useState<
    HostedUploadProgress | "opening" | null
  >(null);
  const [acquisitionBusy, setAcquisitionBusy] = useState(false);
  const blocked = busy || acquisitionBusy || !capabilities;
  const [message, setMessage] = useState("");
  const [sourceMessage, setSourceMessage] = useState("");
  const [messageArea, setMessageArea] = useState<"upload" | "session">(
    "upload",
  );
  const [connectAttempt, setConnectAttempt] = useState(0);
  const [startupFailed, setStartupFailed] = useState(false);
  const [sessionConnection, setSessionConnection] =
    useState<ClipConnection>("connected");
  const sessionConnected = sessionConnection === "connected";
  const fileInput = useRef<HTMLInputElement>(null);
  const sourcePreview = useRef<HTMLVideoElement>(null);
  const [sourcePlayRequests] = useState(() => new SourcePlayRequests());
  useEffect(() => () => sourcePlayRequests.cancel(), [sourcePlayRequests]);
  const [previewReadyFor, setPreviewReadyFor] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sourceMethod, setSourceMethod] = useState<"upload" | "youtube">(
    "upload",
  );
  const sourceMethodsId = useId();
  const acquisitionBusyChanged = useCallback((value: boolean) => {
    setAcquisitionBusy(value);
    if (value) setSourceMethod("youtube");
  }, []);
  const opening = useRef<AbortController | null>(null);
  const [initialClip, setInitialClip] = useState<string | null>(null);
  useEffect(
    () => () => {
      opening.current?.abort();
    },
    [],
  );
  const [selection, setSelection] = useState<OwnerMomentExport[]>([]);
  const [showMomentResults, setShowMomentResults] = useState(false);
  const [clipWork, setClipWork] = useState(false);
  const [hasClips, setHasClips] = useState(false);
  const [view, setActiveView] = useState<"opening" | "moments" | "editor">(
    "opening",
  );
  const setView = useCallback(
    (next: typeof view) => {
      sourcePlayRequests.cancel();
      setSourceMessage("");
      setActiveView(next);
    },
    [sourcePlayRequests],
  );
  const [momentsVisited, setMomentsVisited] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const clipsChanged = useCallback(
    (value: boolean) => {
      setHasClips(value);
      if (!value) setMomentsVisited(workspace?.id ?? null);
      setView(value ? "editor" : "moments");
    },
    [workspace?.id, setView],
  );
  useEffect(() => {
    sourcePlayRequests.cancel();
    if (view === "editor") sourcePreview.current?.pause();
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, workspace?.id, sourcePlayRequests]);
  const [unapplied, setUnapplied] = useState(false);
  const [clearBlocked, setClearBlocked] = useState(false);
  const [resetWaiting, setResetWaiting] = useState(false);
  const editDirtyChanged = useCallback((value: boolean) => {
    setUnapplied(value);
    if (!value) setResetWaiting(false);
  }, []);
  const [actionTarget, setActionTarget] = useState<HTMLDivElement | null>(null);
  const [framingTarget, setFramingTarget] = useState<HTMLDivElement | null>(
    null,
  );
  const choose = useCallback((value: OwnerMomentExport[]) => {
    setSelection(value);
  }, []);
  const workspaceRecovered = useCallback(
    (value: OwnerWorkspace) => {
      setWorkspace(value);
      setSelection([]);
      setInitialClip(null);
      setUnapplied(false);
      setClearBlocked(false);
      setClipWork(false);
      setView("opening");
    },
    [setView],
  );
  const sourceOpened = useCallback(
    (value: OwnerWorkspace) => {
      setWorkspace(value);
      setInitialClip(null);
      choose([]);
      setShowMomentResults(false);
      setClipWork(false);
      setHasClips(false);
      setView("opening");
      setUnapplied(false);
      setClearBlocked(false);
      setMessage("");
    },
    [choose, setView],
  );
  useEffect(() => {
    const controller = new AbortController();
    const requestSignal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(10_000),
    ]);
    void (async () => {
      try {
        const capabilitiesReady = fetch("/api/local/capabilities", {
          signal: requestSignal,
        }).then(async (response) => {
          if (!response.ok) throw new Error("unavailable");
          return ownerRuntimeCapabilitiesSchema.parse(await response.json());
        });
        const workspaceReady = fetch("/api/local/workspace", {
          signal: requestSignal,
        }).then(async (response) => {
          if (!response.ok) throw new Error("unavailable");
          return ownerWorkspaceSchema.nullable().parse(await response.json());
        });
        const [currentCapabilities, current, status] = await Promise.all([
          capabilitiesReady,
          workspaceReady,
          hosted
            ? fetch("/api/local/session", { signal: requestSignal }).then(
                async (response) => {
                  if (!response.ok) throw new Error("demo_unavailable");
                  return hostedDemoStatusSchema.parse(await response.json());
                },
              )
            : Promise.resolve(null),
        ]);
        if (!controller.signal.aborted) {
          setCapabilities(currentCapabilities);
          setWorkspace(current);
          setDemoStatus(status);
          // The batch's first acknowledged list chooses the saved destination.
          setView(current ? "opening" : "moments");
          setBusy(false);
        }
      } catch {
        if (controller.signal.aborted) return;
        controller.abort();
        setBusy(false);
        setStartupFailed(true);
        setView("opening");
      }
    })();
    return () => controller.abort();
  }, [hosted, connectAttempt, setView]);
  async function upload(file: File | undefined) {
    if (!file || blocked || opening.current) return;
    const controller = new AbortController();
    opening.current = controller;
    let releaseVerification = () => {};
    setBusy(true);
    setOpeningState("opening");
    if (!hosted && file.name.toLowerCase().endsWith(".json"))
      setView("opening");
    setMessage("");
    try {
      if (hosted) {
        if (file.name.toLowerCase().endsWith(".json"))
          throw new Error("video_required");
        const status = await fetch("/api/local/session", {
          signal: controller.signal,
        });
        if (!status.ok) throw new Error("session_unavailable");
        const existing = hostedDemoStatusSchema.parse(await status.json());
        setDemoStatus(existing);
        if (existing.limited) return;
        if (!existing.active) {
          if (
            !capabilities ||
            !("processingSiteKey" in capabilities) ||
            !capabilities.processingSiteKey
          )
            throw new Error("verification_unavailable");
          const nonce = crypto.randomUUID();
          setChallenge(nonce);
          try {
            const token = await new Promise<string>((resolve, reject) => {
              const fail = () => reject(new Error("verification_canceled"));
              challengeResult.current = { resolve, reject: fail };
              controller.signal.addEventListener("abort", fail, { once: true });
              releaseVerification = () =>
                controller.signal.removeEventListener("abort", fail);
            });
            const session = await fetch("/api/local/session", {
              method: "POST",
              signal: controller.signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                startNonce: nonce,
                turnstileToken: token,
              }),
            });
            if (session.status === 429) {
              const limited = hostedDemoStatusSchema.safeParse(
                await session.json(),
              );
              if (limited.success && limited.data.limited) {
                setDemoStatus(limited.data);
                return;
              }
            }
            if (!session.ok) throw new Error("session_unavailable");
          } finally {
            releaseVerification();
            challengeResult.current = null;
            setChallenge(null);
          }
        }
      }
      const result = hosted
        ? await uploadHostedVideo(
            file,
            controller.signal,
            fetch,
            setOpeningState,
          )
        : await openPickedFile(
            file,
            controller.signal,
            fetch,
            capabilities && "capacity" in capabilities
              ? capabilities.capacity
              : undefined,
          );
      setWorkspace(result.workspace);
      setUnapplied(false);
      setInitialClip(result.clipId);
      setShowMomentResults(false);
      choose([]);
      setHasClips(false);
      setView("opening");
      setMessage("");
    } catch (error) {
      setView("moments");
      setMessageArea("upload");
      if (!controller.signal.aborted)
        setMessage(
          hosted
            ? "Couldn’t open this video. Check verification and try again."
            : error instanceof Error && error.message === "picked_file_capacity"
              ? "Not enough free disk space. Free space and try again."
              : "Couldn’t open this file. Choose an MP4 or ClipBuilder draft.",
        );
    } finally {
      if (opening.current === controller) opening.current = null;
      if (!controller.signal.aborted) setOpeningState(null);
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  async function clear(discardUnsaved = false) {
    if (!workspace || blocked || clipWork) return;
    if (unapplied && !discardUnsaved) {
      setResetWaiting(true);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        hosted ? "/api/local/session" : `/api/local/workspace/${workspace.id}`,
        {
          method: "DELETE",
          ...(discardUnsaved
            ? {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ discardUnsaved: true }),
              }
            : {}),
        },
      );
      if (response.status === 409) {
        setClearBlocked(true);
        setMessageArea("session");
        setMessage("Couldn’t save changes. Retry or discard.");
        return;
      }
      if (!response.ok && response.status !== 404)
        throw new Error("unavailable");
      resetEditorTour(editorTourStorage());
      setWorkspace(null);
      setPreviewReadyFor(null);
      setDragging(false);
      setShowMomentResults(false);
      setUnapplied(false);
      setInitialClip(null);
      choose([]);
      setClipWork(false);
      setHasClips(false);
      setView("moments");
      setClearBlocked(false);
      setResetWaiting(false);
      setMessage("");
      if (hosted) {
        const status = await fetch("/api/local/session");
        if (!status.ok) throw new Error("demo_unavailable");
        setDemoStatus(hostedDemoStatusSchema.parse(await status.json()));
      }
    } catch {
      setMessageArea("session");
      setMessage("Couldn’t reset. Try again.");
    } finally {
      setBusy(false);
    }
  }
  function retryStartup() {
    setBusy(true);
    setStartupFailed(false);
    setConnectAttempt((value) => value + 1);
  }
  const openingWorkspace = view === "opening";
  return (
    <Workspace
      localMode={!hosted}
      cloudMode={hosted}
      illustrativePictures
      editing={!!workspace && view === "editor"}
      sessionActions={
        workspace && (
          <SessionControls
            recovery={clearBlocked || resetWaiting}
            disabled={blocked || clipWork || !sessionConnected}
            onClear={(discard) => void clear(discard)}
            message={
              resetWaiting
                ? "Edits aren’t saved. Retry or discard this session."
                : messageArea === "session"
                  ? message
                  : undefined
            }
          />
        )
      }
    >
      <WorkflowFrame
        headingRef={heading}
        title={
          openingWorkspace
            ? "Opening workspace"
            : !workspace && demoStatus?.limited
              ? "Your free demo"
              : !workspace
                ? "Choose your video"
                : view === "moments"
                  ? "Choose your moments"
                  : "Review and edit clips"
        }
        step={
          openingWorkspace ? null : !workspace ? 0 : view === "moments" ? 1 : 2
        }
        subtitle={
          openingWorkspace || (!workspace && demoStatus?.limited)
            ? undefined
            : !workspace
              ? hosted
                ? "Upload a video from your computer."
                : "Start with a video on your computer or a YouTube link."
              : undefined
        }
        actions={
          workspace && view === "editor" ? (
            <div className="workflow-session-actions">
              <div className="workflow-action-slot" ref={setActionTarget} />
            </div>
          ) : null
        }
      >
        <div
          className={`local-editing ${openingWorkspace ? "local-opening" : !workspace ? "local-intake" : view === "editor" ? "local-editor" : "local-moments"}`}
        >
          {openingWorkspace ? (
            startupFailed ||
            ["missing", "unavailable"].includes(sessionConnection) ? (
              <div className="workspace-opening-failure" role="status">
                <CircleAlert size={28} aria-hidden="true" />
                <p>Couldn’t open workspace.</p>
              </div>
            ) : (
              <ProcessingState
                className="workspace-opening"
                label="Opening workspace"
                indicatorSize="compact"
              />
            )
          ) : !workspace && demoStatus?.limited ? (
            <DemoLimitScreen retryAt={demoStatus.retryAt} />
          ) : !workspace && ((busy && !capabilities) || openingState) ? (
            <ProcessingState
              label={
                openingState && typeof openingState === "object"
                  ? openingState.phase === "uploading"
                    ? "Uploading video"
                    : "Opening video"
                  : openingState
                    ? "Opening video"
                    : "Connecting"
              }
              {...(openingState &&
              typeof openingState === "object" &&
              openingState.phase === "uploading"
                ? {
                    progress: {
                      fraction: openingState.received / openingState.total,
                      valueText: `${openingState.received} of ${openingState.total} bytes uploaded`,
                    },
                  }
                : {})}
            />
          ) : (
            !workspace && (
              <div className="source-intake">
                {!hosted && (
                  <ControlTabs
                    id={sourceMethodsId}
                    className="source-method-tabs"
                    label="Video source"
                    items={[
                      { value: "upload", label: "Upload" },
                      { value: "youtube", label: "YouTube" },
                    ]}
                    value={sourceMethod}
                    onChange={setSourceMethod}
                    disabled={blocked}
                  />
                )}
                <div
                  className={`source-options${hosted ? " source-options-upload" : ""}`}
                >
                  <section
                    className={`source-card upload-card ${dragging ? "is-dragging" : ""}`}
                    aria-labelledby="upload-title"
                    hidden={!hosted && sourceMethod !== "upload"}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (!blocked) setDragging(true);
                    }}
                    onDragLeave={(event) => {
                      if (
                        !(event.relatedTarget instanceof Node) ||
                        !event.currentTarget.contains(event.relatedTarget)
                      )
                        setDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      void upload(event.dataTransfer.files[0]);
                    }}
                  >
                    <div className="source-card-heading">
                      <h2 id="upload-title">Upload a video</h2>
                    </div>
                    <div className="source-card-body">
                      <div className="upload-drop-area" data-disabled={blocked}>
                        <Upload aria-hidden="true" />
                        <strong>
                          {dragging ? "Drop to upload" : "Drop your video here"}
                        </strong>
                        <span>or choose a file below</span>
                      </div>
                    </div>
                    <div className="source-card-actions">
                      <InlineFeedback
                        id="upload-feedback"
                        message={messageArea === "upload" ? message : undefined}
                      />
                      <span className="source-card-footnote source-hint">
                        {hosted
                          ? "MP4 video · Temporary editing session"
                          : "MP4 or ClipBuilder draft · Saved edits reopen automatically"}
                      </span>
                      <div className="source-actions">
                        <Button
                          icon={Upload}
                          disabled={blocked}
                          onClick={() => fileInput.current?.click()}
                        >
                          Choose a video
                        </Button>
                      </div>
                      <input
                        ref={fileInput}
                        className="local-file-input"
                        type="file"
                        accept={hosted ? "video/mp4" : "video/mp4,.json"}
                        aria-label={
                          hosted
                            ? "Choose a video"
                            : "Choose a video or saved ClipBuilder draft"
                        }
                        aria-describedby={
                          messageArea === "upload" && message
                            ? "upload-feedback"
                            : undefined
                        }
                        tabIndex={-1}
                        disabled={blocked}
                        onChange={(event) => {
                          void upload(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </div>
                  </section>
                  {!hosted && (
                    <OwnerAcquisitionPanel
                      workspace={workspace}
                      capabilities={capabilities}
                      hidden={sourceMethod !== "youtube"}
                      busy={busy || clipWork}
                      initializing={busy && !capabilities}
                      onBusy={acquisitionBusyChanged}
                      onOpen={sourceOpened}
                    />
                  )}
                </div>
              </div>
            )
          )}
          {openingWorkspace && (
            <div className="workspace-opening-actions">
              {startupFailed && (
                <Button onClick={retryStartup}>Try again</Button>
              )}
              <div className="workflow-action-slot" ref={setActionTarget} />
            </div>
          )}
          {workspace && (
            <>
              {(view === "moments" || momentsVisited === workspace.id) && (
                <section
                  className="moment-selection"
                  hidden={view !== "moments"}
                >
                  <div className="moment-layout">
                    <aside
                      className="source-preview"
                      aria-label="Source preview"
                    >
                      <div className="section-heading">
                        <h2>Your video</h2>
                      </div>
                      <ThumbnailVideo
                        thumbnailSource={`/api/local/workspace/${workspace.id}/source`}
                        thumbnailAspectRatio={
                          workspace.source.width / workspace.source.height
                        }
                        thumbnailTimeMs={
                          workspace.source.availableWindow
                            ? workspace.source.availableWindow.startMs +
                              Math.min(
                                10000,
                                (workspace.source.availableWindow.endMs -
                                  workspace.source.availableWindow.startMs) /
                                  4,
                              )
                            : undefined
                        }
                        key={workspace.id}
                        ref={sourcePreview}
                        aria-label="Source video"
                        controls
                        preload="metadata"
                        src={`/api/local/workspace/${workspace.id}/source`}
                        onLoadedMetadata={(event) => {
                          constrainSourcePlayback(
                            event.currentTarget,
                            workspace.source.availableWindow,
                            "loaded",
                          );
                          setPreviewReadyFor(workspace.id);
                          setSourceMessage("");
                        }}
                        onTimeUpdate={(event) =>
                          constrainSourcePlayback(
                            event.currentTarget,
                            workspace.source.availableWindow,
                            "time",
                          )
                        }
                        onPlay={(event) =>
                          constrainSourcePlayback(
                            event.currentTarget,
                            workspace.source.availableWindow,
                            "play",
                          )
                        }
                        onPlaying={() => {
                          sourcePlayRequests.cancel();
                          setSourceMessage("");
                        }}
                        onPause={() => sourcePlayRequests.cancel()}
                        onSeeked={() => setPreviewReadyFor(workspace.id)}
                        onSeeking={(event) => {
                          constrainSourcePlayback(
                            event.currentTarget,
                            workspace.source.availableWindow,
                            "seeking",
                          );
                          setPreviewReadyFor(null);
                        }}
                        onEmptied={() => {
                          sourcePlayRequests.cancel();
                          setPreviewReadyFor(null);
                        }}
                        onError={() => {
                          sourcePlayRequests.cancel();
                          setPreviewReadyFor(null);
                          setSourceMessage("Couldn’t load the video preview.");
                        }}
                        onLoadStart={() => {
                          sourcePlayRequests.cancel();
                          setSourceMessage("");
                          setPreviewReadyFor(null);
                        }}
                      />
                      <div className="source-preview-feedback">
                        <InlineFeedback message={sourceMessage} />
                      </div>
                    </aside>
                    <div className="moment-workarea">
                      {capabilities && (
                        <OwnerSelectionPanel
                          key={workspace.id}
                          workspace={workspace}
                          capabilities={capabilities}
                          busy={blocked || clipWork}
                          actionTarget={actionTarget}
                          actionsVisible={view === "moments"}
                          onBusy={setBusy}
                          onChoose={choose}
                          onResultsViewChange={setShowMomentResults}
                          previewReady={previewReadyFor === workspace.id}
                          onCaptureTime={() =>
                            capturePreviewTime(
                              sourcePreview.current,
                              workspace.source.durationMs,
                              workspace.source.origin?.startMs ?? 0,
                            )
                          }
                          onJumpTo={(seconds) => {
                            const video = sourcePreview.current;
                            if (
                              blocked ||
                              clipWork ||
                              !video ||
                              video.readyState < 1 ||
                              video.error ||
                              !Number.isFinite(seconds) ||
                              seconds < 0 ||
                              seconds >= workspace.source.durationMs / 1000
                            )
                              return;
                            try {
                              setSourceMessage("");
                              video.currentTime = seconds;
                              const viewport = video
                                .closest("main")
                                ?.getBoundingClientRect();
                              const frame = video.getBoundingClientRect();
                              if (
                                !viewport ||
                                frame.top < viewport.top ||
                                frame.bottom > viewport.bottom
                              )
                                video.scrollIntoView({
                                  block: "nearest",
                                  behavior: "smooth",
                                });
                              video.focus({ preventScroll: true });
                              sourcePlayRequests.play(video, (reason) => {
                                if (sourcePreview.current === video)
                                  setSourceMessage(
                                    reason === "blocked"
                                      ? "Playback was blocked. Press Play in the preview."
                                      : "Couldn’t start playback. Try the video controls.",
                                  );
                              });
                            } catch {
                              setSourceMessage(
                                "Couldn’t jump to this clip. Try the video controls.",
                              );
                            }
                          }}
                        />
                      )}
                      <div className="moment-framing" ref={setFramingTarget} />
                      {view === "moments" && (
                        <div className="moment-workflow-actions">
                          {hasClips && !unapplied && !clipWork && !blocked && (
                            <Button
                              variant="secondary"
                              disabled={blocked}
                              onClick={() => setView("editor")}
                            >
                              Back to editor
                            </Button>
                          )}
                          <div
                            className="workflow-action-slot"
                            ref={setActionTarget}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
              {capabilities && (
                <OwnerClipBatchPanel
                  key={`clips-${workspace.id}`}
                  workspace={workspace}
                  capabilities={capabilities}
                  selected={selection}
                  onActive={setClipWork}
                  onClipsChange={clipsChanged}
                  onProcessed={() => setView("editor")}
                  initialReviewId={initialClip}
                  onDirtyChange={editDirtyChanged}
                  onAddClips={() => {
                    setMomentsVisited(workspace.id);
                    setView("moments");
                  }}
                  initializing={openingWorkspace}
                  showProcessing={view !== "editor"}
                  selectionReady={showMomentResults}
                  actionTarget={actionTarget}
                  framingTarget={framingTarget}
                  onRecovered={workspaceRecovered}
                  onConnectionChange={setSessionConnection}
                  onStartOver={() => {
                    resetEditorTour(editorTourStorage());
                    setWorkspace(null);
                    setSelection([]);
                    setHasClips(false);
                    setUnapplied(false);
                    setClipWork(false);
                    setView("moments");
                    setSessionConnection("connected");
                  }}
                />
              )}
            </>
          )}
        </div>
      </WorkflowFrame>
      {challenge &&
        capabilities &&
        "processingSiteKey" in capabilities &&
        capabilities.processingSiteKey && (
          <AnalysisChallenge
            siteKey={capabilities.processingSiteKey}
            action="session-start"
            sessionId={challenge}
            onToken={challengeToken}
            onFailure={challengeCancel}
          />
        )}
    </Workspace>
  );
}
import {
  constrainSourcePlayback,
  SourcePlayRequests,
} from "./source-playback.ts";
