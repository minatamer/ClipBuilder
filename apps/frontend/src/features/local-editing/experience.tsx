"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Film } from "lucide-react";
import { Workspace } from "../../shared/ui/workspace";
import { WorkflowFrame } from "../../shared/ui/workflow-frame";
import { Button } from "../../shared/ui/button";
import buttonStyles from "../../shared/ui/workflow.module.css";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import "./style.css";
import { OwnerSelectionPanel } from "./selection-panel.tsx";
import type { OwnerMomentExport } from "../../../../../packages/contracts/local/selection.ts";
import { OwnerClipBatchPanel } from "./clip-batch-panel.tsx";
import { openPickedFile } from "./open-local-file.ts";
import { OwnerAcquisitionPanel } from "./acquisition-panel.tsx";
import { capturePreviewTime } from "./manual-time.ts";
import { AnalysisChallenge } from "../source-analysis/analysis-challenge";
import { uploadHostedVideo, type HostedUploadProgress } from "./hosted-upload";
import { ProcessingState } from "../../shared/ui/processing-state";
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
  const [capabilities, setCapabilities] =
    useState<OwnerRuntimeCapabilities | null>(null);
  const [busy, setBusy] = useState(true);
  const [openingState, setOpeningState] = useState<
    HostedUploadProgress | "opening" | null
  >(null);
  const [acquisitionBusy, setAcquisitionBusy] = useState(false);
  const blocked = busy || acquisitionBusy || !capabilities;
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const sourcePreview = useRef<HTMLVideoElement>(null);
  const [previewReadyFor, setPreviewReadyFor] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
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
  const [view, setView] = useState<"moments" | "editor">("moments");
  const heading = useRef<HTMLHeadingElement>(null);
  const clipsChanged = useCallback((value: boolean) => {
    setHasClips(value);
    if (value) setView("editor");
  }, []);
  useEffect(() => {
    if (view === "editor") sourcePreview.current?.pause();
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start" });
  }, [view, workspace?.id]);
  const [unapplied, setUnapplied] = useState(false);
  const [clearBlocked, setClearBlocked] = useState(false);
  const [footerTarget, setFooterTarget] = useState<HTMLDivElement | null>(null);
  const choose = useCallback((value: OwnerMomentExport[]) => {
    setSelection(value);
  }, []);
  const sourceOpened = useCallback(
    (value: OwnerWorkspace) => {
      setWorkspace(value);
      setInitialClip(null);
      choose([]);
      setShowMomentResults(false);
      setClipWork(false);
      setHasClips(false);
      setView("moments");
      setUnapplied(false);
      setClearBlocked(false);
      setMessage("");
    },
    [choose],
  );
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const capabilitiesReady = fetch("/api/local/capabilities", {
          signal: controller.signal,
        }).then(async (response) => {
          if (!response.ok) throw new Error("unavailable");
          return ownerRuntimeCapabilitiesSchema.parse(await response.json());
        });
        const workspaceReady = fetch("/api/local/workspace", {
          signal: controller.signal,
        }).then(async (response) => {
          if (!response.ok) throw new Error("unavailable");
          return ownerWorkspaceSchema.nullable().parse(await response.json());
        });
        const [currentCapabilities, current] = await Promise.all([
          capabilitiesReady,
          workspaceReady,
        ]);
        if (!controller.signal.aborted) {
          setCapabilities(currentCapabilities);
          setWorkspace(current);
          setBusy(false);
        }
      } catch {
        if (controller.signal.aborted) return;
        controller.abort();
        setBusy(false);
        setMessage(
          hosted
            ? "We couldn’t connect. Refresh the page to try again."
            : "We couldn’t connect to the local service. Check the backend and refresh to try again.",
        );
      }
    })();
    return () => controller.abort();
  }, [hosted]);
  async function upload(file: File | undefined) {
    if (!file || blocked || opening.current) return;
    const controller = new AbortController();
    opening.current = controller;
    let releaseVerification = () => {};
    setBusy(true);
    setOpeningState("opening");
    setMessage("");
    try {
      if (hosted) {
        if (file.name.toLowerCase().endsWith(".json"))
          throw new Error("video_required");
        const status = await fetch("/api/local/session", {
          signal: controller.signal,
        });
        if (!status.ok) throw new Error("session_unavailable");
        const existing = (await status.json()) as { active?: boolean };
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
        : await openPickedFile(file, controller.signal);
      setWorkspace(result.workspace);
      setUnapplied(false);
      setInitialClip(result.clipId);
      setShowMomentResults(false);
      choose([]);
      setHasClips(false);
      setView("moments");
      setMessage("");
    } catch {
      if (!controller.signal.aborted)
        setMessage(
          hosted
            ? "Couldn’t open this video. Check verification and try again."
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
    setBusy(true);
    try {
      const response = await fetch(`/api/local/workspace/${workspace.id}`, {
        method: "DELETE",
        ...(discardUnsaved
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ discardUnsaved: true }),
            }
          : {}),
      });
      if (response.status === 409) {
        setClearBlocked(true);
        setMessage(
          "Couldn’t save the latest changes. Retry or discard this session.",
        );
        return;
      }
      if (!response.ok && response.status !== 404)
        throw new Error("unavailable");
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
      setMessage("");
    } catch {
      setMessage("The processing copy could not be cleared. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace localMode={!hosted} cloudMode={hosted} illustrativePictures>
      <WorkflowFrame
        headingRef={heading}
        title={
          !workspace
            ? "Choose your video"
            : view === "moments"
              ? "Choose your moments"
              : "Review and edit clips"
        }
        step={!workspace ? 0 : view === "moments" ? 1 : 2}
        subtitle={
          !workspace
            ? hosted
              ? "Upload a video from your computer."
              : "Start with a video on your computer or a YouTube link."
            : undefined
        }
        footer={
          workspace ? (
            <>
              <div className="session-controls">
                <Button
                  variant="quiet"
                  disabled={blocked || clipWork}
                  onClick={() => void clear()}
                >
                  {clearBlocked ? "Retry reset" : "Start over"}
                </Button>
                {clearBlocked && (
                  <Button
                    variant="quiet"
                    disabled={blocked || clipWork}
                    onClick={() => void clear(true)}
                  >
                    Discard session
                  </Button>
                )}
              </div>
              <div className="local-footer-actions">
                {hasClips && !unapplied && !clipWork && !blocked && (
                  <Button
                    variant="secondary"
                    disabled={blocked}
                    onClick={() =>
                      setView(view === "editor" ? "moments" : "editor")
                    }
                  >
                    {view === "editor" ? "Add more clips" : "Back to editor"}
                  </Button>
                )}
                <div className="workflow-footer-slot" ref={setFooterTarget} />
              </div>
            </>
          ) : null
        }
      >
        <div
          className={`local-editing ${!workspace ? "local-intake" : view === "editor" ? "local-editor" : ""}`}
        >
          <p className="flow-notice" role="status" aria-live="polite">
            {message}
          </p>
          {!workspace && ((busy && !capabilities) || openingState) ? (
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
              <div
                className={`source-options${hosted ? " source-options-upload" : ""}`}
              >
                <section
                  className={`source-card upload-card ${dragging ? "is-dragging" : ""}`}
                  aria-labelledby="upload-title"
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
                    <span className="source-icon">
                      <Upload size={24} aria-hidden="true" />
                    </span>
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
                  <footer className="source-card-footer">
                    <div className="source-actions">
                      <Button
                        icon={Upload}
                        disabled={blocked}
                        onClick={() => fileInput.current?.click()}
                      >
                        Choose a video
                      </Button>
                      {!hosted && (
                        <a
                          href="/start?source=sample"
                          className={`${buttonStyles.button} ${buttonStyles.secondary}`}
                        >
                          <Film size={18} aria-hidden="true" />
                          Use demo sample
                        </a>
                      )}
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
                      tabIndex={-1}
                      disabled={blocked}
                      onChange={(event) => {
                        void upload(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                    <span className="source-card-footnote source-hint">
                      {hosted
                        ? "MP4 video · Temporary editing session"
                        : "MP4 or ClipBuilder draft · Saved edits reopen automatically"}
                    </span>
                  </footer>
                </section>
                {!hosted && (
                  <OwnerAcquisitionPanel
                    workspace={workspace}
                    capabilities={capabilities}
                    busy={busy || clipWork}
                    initializing={busy && !capabilities}
                    onBusy={setAcquisitionBusy}
                    onOpen={sourceOpened}
                  />
                )}
              </div>
            )
          )}
          {workspace && (
            <>
              <section className="moment-selection" hidden={view !== "moments"}>
                <div className="moment-layout">
                  <aside className="source-preview" aria-label="Source preview">
                    <div className="section-heading">
                      <h2>Your video</h2>
                    </div>
                    <video
                      key={workspace.id}
                      ref={sourcePreview}
                      aria-label="Source video"
                      controls
                      preload="metadata"
                      src={`/api/local/workspace/${workspace.id}/source`}
                      onLoadedMetadata={() => setPreviewReadyFor(workspace.id)}
                      onSeeked={() => setPreviewReadyFor(workspace.id)}
                      onSeeking={() => setPreviewReadyFor(null)}
                      onEmptied={() => setPreviewReadyFor(null)}
                      onError={() => setPreviewReadyFor(null)}
                      onLoadStart={() => setPreviewReadyFor(null)}
                    />
                    <p className="source-hint">
                      {Math.round(workspace.source.durationMs / 1000)} seconds ·{" "}
                      {workspace.source.width} × {workspace.source.height}
                    </p>
                  </aside>
                  {capabilities && (
                    <OwnerSelectionPanel
                      key={workspace.id}
                      workspace={workspace}
                      capabilities={capabilities}
                      busy={blocked || clipWork}
                      footerTarget={footerTarget}
                      actionsVisible={view === "moments"}
                      onBusy={setBusy}
                      onChoose={choose}
                      onResultsViewChange={setShowMomentResults}
                      previewReady={previewReadyFor === workspace.id}
                      onCaptureTime={() =>
                        capturePreviewTime(
                          sourcePreview.current,
                          workspace.source.durationMs,
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
                          setMessage("");
                          video.currentTime = seconds;
                          video.scrollIntoView({
                            block: "center",
                            behavior: "smooth",
                          });
                          video.focus({ preventScroll: true });
                          void video.play().catch(() => {
                            if (sourcePreview.current === video)
                              setMessage("Press play in the video preview.");
                          });
                        } catch {
                          setMessage(
                            "Couldn’t jump to this clip. Try the video controls.",
                          );
                        }
                      }}
                    />
                  )}
                </div>
              </section>
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
                  onDirtyChange={setUnapplied}
                  showProcessing={view === "moments"}
                  selectionReady={showMomentResults}
                  footerTarget={footerTarget}
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
