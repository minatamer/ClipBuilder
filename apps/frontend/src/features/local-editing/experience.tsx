"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Film, HardDrive } from "lucide-react";
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
import {
  ownerRuntimeCapabilitiesSchema,
  type OwnerRuntimeCapabilities,
} from "../../../../../packages/contracts/local/runtime.ts";

export function LocalEditingExperience() {
  const [workspace, setWorkspace] = useState<OwnerWorkspace | null>(null);
  const [capabilities, setCapabilities] =
    useState<OwnerRuntimeCapabilities | null>(null);
  const [busy, setBusy] = useState(true);
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
  const sessionMenu = useRef<HTMLDetailsElement>(null);
  const clipsChanged = useCallback((value: boolean) => {
    setHasClips(value);
    if (value) setView("editor");
  }, []);
  useEffect(() => {
    if (view === "editor") sourcePreview.current?.pause();
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start" });
  }, [view]);
  useEffect(() => {
    const close = (
      event: globalThis.PointerEvent | globalThis.KeyboardEvent,
    ) => {
      if (
        event.type === "keydown" &&
        (event as globalThis.KeyboardEvent).key !== "Escape"
      )
        return;
      if (
        event.type === "pointerdown" &&
        event.target instanceof Node &&
        sessionMenu.current?.contains(event.target)
      )
        return;
      if (sessionMenu.current) sessionMenu.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);
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
          "We couldn’t connect to the local service. Check the backend and refresh to try again.",
        );
      }
    })();
    return () => controller.abort();
  }, []);
  async function upload(file: File | undefined) {
    if (!file || blocked || opening.current) return;
    const controller = new AbortController();
    opening.current = controller;
    setBusy(true);
    setMessage("Opening your file…");
    try {
      const result = await openPickedFile(file, controller.signal);
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
          "Couldn’t open this file. Choose an MP4 or ClipBuilder draft.",
        );
    } finally {
      if (opening.current === controller) opening.current = null;
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
    <Workspace localMode>
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
            ? "Start with a video on your computer or a YouTube link."
            : undefined
        }
        footer={
          workspace ? (
            <>
              <div className="session-controls">
                <p className="local-mode-note">
                  <HardDrive size={16} aria-hidden="true" />
                  {!capabilities
                    ? "Connecting…"
                    : capabilities.aiMode === "synthetic-ai"
                      ? "Fake AI"
                      : capabilities.aiMode === "provider-ai"
                        ? "Gemini"
                        : "AI unavailable"}
                </p>
                <details className="session-menu" ref={sessionMenu}>
                  <summary>Session</summary>
                  <div className="session-menu-content">
                    <Button
                      variant="quiet"
                      disabled={blocked || clipWork || unapplied}
                      onClick={() => void clear()}
                    >
                      {clearBlocked ? "Retry" : "Start over"}
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
                </details>
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
        <div className={`local-editing ${!workspace ? "local-intake" : ""}`}>
          <p className="flow-notice" role="status" aria-live="polite">
            {message}
          </p>
          {!workspace && (
            <div className="source-options">
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
                  <p>
                    Drop your conversation here, or choose a file from your
                    computer.
                  </p>
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
                    <a
                      href="/start?source=sample"
                      className={`${buttonStyles.button} ${buttonStyles.secondary}`}
                    >
                      <Film size={18} aria-hidden="true" />
                      Use demo sample
                    </a>
                  </div>
                  <input
                    ref={fileInput}
                    className="local-file-input"
                    type="file"
                    accept="video/mp4,.json"
                    aria-label="Choose a video or saved ClipBuilder draft"
                    tabIndex={-1}
                    disabled={blocked}
                    onChange={(event) => {
                      void upload(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                  <span className="source-card-footnote source-hint">
                    MP4 or ClipBuilder draft · Saved edits reopen automatically
                  </span>
                </footer>
              </section>
              <OwnerAcquisitionPanel
                workspace={workspace}
                capabilities={capabilities}
                busy={busy || clipWork}
                initializing={busy && !capabilities}
                onBusy={setAcquisitionBusy}
                onOpen={sourceOpened}
              />
            </div>
          )}
          {workspace && (
            <>
              <section className="moment-selection" hidden={view !== "moments"}>
                <div className="moment-layout">
                  <aside
                    className="source-preview"
                    aria-label="Local media previews"
                  >
                    <div className="section-heading">
                      <h2>Your video</h2>
                    </div>
                    <video
                      key={workspace.id}
                      ref={sourcePreview}
                      aria-label="Local source video"
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
    </Workspace>
  );
}
