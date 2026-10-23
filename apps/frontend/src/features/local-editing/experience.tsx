"use client";
import { useCallback, useEffect, useState } from "react";
import { Workspace } from "../../shared/ui/workspace";
import { WorkflowFrame } from "../../shared/ui/workflow-frame";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import "./style.css";
import { OwnerSelectionPanel } from "./selection-panel.tsx";
import type { OwnerMomentExport } from "../../../../../packages/contracts/local/selection.ts";
import { OwnerClipBatchPanel } from "./clip-batch-panel.tsx";
import { OwnerDraftPanel } from "./draft-panel.tsx";
import { OwnerAcquisitionPanel } from "./acquisition-panel.tsx";
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
  const [message, setMessage] = useState(
    "Choose an MP4 to open a private local processing copy.",
  );
  const [selection, setSelection] = useState<OwnerMomentExport[]>([]);
  const [clipWork, setClipWork] = useState(false);
  const [clearBlocked, setClearBlocked] = useState(false);
  const choose = useCallback((value: OwnerMomentExport[]) => {
    setSelection(value);
  }, []);
  const opened = useCallback(
    (value: OwnerWorkspace) => {
      setWorkspace(value);
      choose([]);
      setClipWork(false);
      setClearBlocked(false);
      setMessage(
        "Saved draft reopened locally. Source, timed words and edits were verified; no AI work was replayed.",
      );
    },
    [choose],
  );
  const sourceOpened = useCallback(
    (value: OwnerWorkspace) => {
      setWorkspace(value);
      choose([]);
      setClipWork(false);
      setClearBlocked(false);
      setMessage(
        "The complete saved source is ready locally. Choose manual ranges and discovery settings; no AI work was started by opening it.",
      );
    },
    [choose],
  );
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const capabilityResponse = await fetch("/api/local/capabilities", {
          signal: controller.signal,
        });
        if (!capabilityResponse.ok) throw new Error("unavailable");
        const currentCapabilities = ownerRuntimeCapabilitiesSchema.parse(
          await capabilityResponse.json(),
        );
        if (controller.signal.aborted) return;
        setCapabilities(currentCapabilities);
        const response = await fetch("/api/local/workspace", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const current = ownerWorkspaceSchema
          .nullable()
          .parse(await response.json());
        if (!controller.signal.aborted) {
          setWorkspace(current);
          if (current)
            setMessage(
              "Local source restored in this running session. Saved results retain their own provenance; fresh actions use the capabilities shown above.",
            );
        }
      } catch {
        if (!controller.signal.aborted)
          setMessage(
            "Local capabilities or workspace status could not be verified. Check that the local host is running before continuing.",
          );
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    })();
    return () => controller.abort();
  }, []);
  async function upload(file: File | undefined) {
    if (!file || blocked) return;
    setBusy(true);
    setMessage("Copying and inspecting locally…");
    try {
      const response = await fetch("/api/local/source", {
        method: "POST",
        headers: { "Content-Type": "video/mp4" },
        body: file,
      });
      if (!response.ok) throw new Error("unavailable");
      setWorkspace(ownerWorkspaceSchema.parse(await response.json()));
      choose([]);
      setMessage(
        "Local source ready. No analysis was started; fresh actions use the capabilities shown above.",
      );
    } catch {
      setMessage(
        "The local source could not be opened. Check the supported media and available disk space.",
      );
    } finally {
      setBusy(false);
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
          "The latest draft changes are not saved. Retry Save now, or explicitly discard this unsaved session. The last saved draft is preserved.",
        );
        return;
      }
      if (!response.ok && response.status !== 404)
        throw new Error("unavailable");
      setWorkspace(null);
      choose([]);
      setClipWork(false);
      setClearBlocked(false);
      setMessage(
        "Processing workspace cleared. Saved source masters are preserved.",
      );
    } catch {
      setMessage("The processing copy could not be cleared. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace localMode>
      <WorkflowFrame
        title={
          !workspace
            ? "Choose your source"
            : !selection.length
              ? "Choose your moments"
              : "Review and edit clips"
        }
        step={!workspace ? 0 : !selection.length ? 1 : 2}
        footer={null}
      >
        <div className="local-editing">
          <p className="eyebrow">
            Local editing ·{" "}
            {!capabilities
              ? "Checking capabilities"
              : capabilities.aiMode === "synthetic-ai"
                ? "Simulated AI"
                : capabilities.aiMode === "provider-ai"
                  ? "Provider AI"
                  : "AI unavailable"}
            {capabilities ? " · Local media" : ""}
          </p>
          <p>
            Upload a source or use a YouTube link, choose moments and edit your
            clips. Saved files and media editing stay on this computer.
            {capabilities?.aiMode === "provider-ai" &&
              " Enabled provider AI sends prepared media to Gemini."}
          </p>
          <p role="status" aria-live="polite">
            {message}
          </p>
          {!workspace && (
            <>
              <p>
                <a href="/start?source=sample">Use demo sample</a>
              </p>
              <label className="file">
                Choose local MP4
                <input
                  type="file"
                  accept="video/mp4"
                  disabled={blocked}
                  onChange={(event) => {
                    void upload(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </>
          )}
          {capabilities && (
            <details key="drafts">
              <summary>Saved drafts</summary>
              <OwnerDraftPanel
                workspace={workspace}
                capabilities={capabilities}
                busy={blocked}
                active={clipWork}
                onBusy={setBusy}
                onOpen={opened}
              />
            </details>
          )}
          {capabilities && (
            <details key="sources" open={!workspace}>
              <summary>YouTube downloads and saved sources</summary>
              <OwnerAcquisitionPanel
                workspace={workspace}
                capabilities={capabilities}
                busy={busy || clipWork}
                onBusy={setAcquisitionBusy}
                onOpen={sourceOpened}
              />
            </details>
          )}
          {workspace && (
            <>
              {capabilities && (
                <OwnerSelectionPanel
                  key={workspace.id}
                  workspace={workspace}
                  capabilities={capabilities}
                  busy={blocked || clipWork}
                  onBusy={setBusy}
                  onChoose={choose}
                />
              )}
              <section className="previews" aria-label="Local media previews">
                <article>
                  <h2>Source</h2>
                  <video
                    aria-label="Local source video"
                    controls
                    preload="metadata"
                    src={`/api/local/workspace/${workspace.id}/source`}
                  />
                  <p>
                    {Math.round(workspace.source.durationMs / 1000)} seconds ·{" "}
                    {workspace.source.width} × {workspace.source.height}
                  </p>
                </article>
              </section>
              {capabilities && (
                <OwnerClipBatchPanel
                  key={`clips-${workspace.id}`}
                  workspace={workspace}
                  capabilities={capabilities}
                  selected={selection}
                  onActive={setClipWork}
                />
              )}
              <nav aria-label="Workspace actions">
                <button
                  disabled={blocked || clipWork}
                  onClick={() => void clear()}
                >
                  Clear processing workspace
                </button>
                {clearBlocked && (
                  <button
                    disabled={blocked || clipWork}
                    onClick={() => void clear(true)}
                  >
                    Discard unsaved session and clear
                  </button>
                )}
              </nav>
            </>
          )}
        </div>
      </WorkflowFrame>
    </Workspace>
  );
}
