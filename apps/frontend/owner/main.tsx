import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../packages/contracts/owner/index.ts";
import "./style.css";
import { OwnerSelectionPanel } from "./selection-panel.tsx";
import type { OwnerMomentExport } from "../../../packages/contracts/owner/selection.ts";
import { OwnerClipBatchPanel } from "./clip-batch-panel.tsx";
import { OwnerDraftPanel } from "./draft-panel.tsx";

function OwnerWorkspaceView() {
  const [workspace, setWorkspace] = useState<OwnerWorkspace | null>(null);
  const [busy, setBusy] = useState(true);
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
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/workspace", {
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
              "Local source restored in this running session. AI remains simulated.",
            );
        }
      } catch {
        if (!controller.signal.aborted)
          setMessage(
            "The local workspace is unavailable. Check that its host is running.",
          );
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    })();
    return () => controller.abort();
  }, []);
  async function upload(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    setMessage("Copying and inspecting locally…");
    try {
      const response = await fetch("/api/source", {
        method: "POST",
        headers: { "Content-Type": "video/mp4" },
        body: file,
      });
      if (!response.ok) throw new Error("unavailable");
      setWorkspace(ownerWorkspaceSchema.parse(await response.json()));
      choose([]);
      setMessage(
        "Local source ready. AI is simulated; no provider or cloud processing.",
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
    if (!workspace || busy || clipWork) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/workspace/${workspace.id}`, {
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
    <main>
      <header>
        <p className="eyebrow">Local owner workspace · Fake AI · Paid off</p>
        <h1>ClipBuilder</h1>
        <p>
          Private local source preview and encoding. This workspace is excluded
          from deployment.
        </p>
      </header>
      <p role="status" aria-live="polite">
        {message}
      </p>
      <OwnerDraftPanel
        workspace={workspace}
        busy={busy}
        active={clipWork}
        onBusy={setBusy}
        onOpen={opened}
      />
      {!workspace ? (
        <label className="file">
          Choose local MP4
          <input
            type="file"
            accept="video/mp4"
            disabled={busy}
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      ) : (
        <>
          <OwnerSelectionPanel
            key={workspace.id}
            workspace={workspace}
            busy={busy || clipWork}
            onBusy={setBusy}
            onChoose={choose}
          />
          <section className="previews" aria-label="Local media previews">
            <article>
              <h2>Source</h2>
              <video
                aria-label="Local source video"
                controls
                preload="metadata"
                src={`/api/workspace/${workspace.id}/source`}
              />
              <p>
                {Math.round(workspace.source.durationMs / 1000)} seconds ·{" "}
                {workspace.source.width} × {workspace.source.height}
              </p>
            </article>
          </section>
          <OwnerClipBatchPanel
            key={`clips-${workspace.id}`}
            workspace={workspace}
            selected={selection}
            onActive={setClipWork}
          />
          <nav aria-label="Workspace actions">
            <button disabled={busy || clipWork} onClick={() => void clear()}>
              Clear processing workspace
            </button>
            {clearBlocked && (
              <button
                disabled={busy || clipWork}
                onClick={() => void clear(true)}
              >
                Discard unsaved session and clear
              </button>
            )}
          </nav>
        </>
      )}
    </main>
  );
}
const root = document.getElementById("root");
if (root) createRoot(root).render(<OwnerWorkspaceView />);
