import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../packages/contracts/owner/index.ts";
import "./style.css";

function OwnerWorkspaceView() {
  const [workspace, setWorkspace] = useState<OwnerWorkspace | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState(
    "Choose an MP4 to open a private local processing copy.",
  );
  const [output, setOutput] = useState(false);
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
      setOutput(false);
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
  async function exportPortrait() {
    if (!workspace || busy) return;
    setBusy(true);
    setMessage("Encoding a local portrait preview…");
    try {
      const response = await fetch(`/api/workspace/${workspace.id}/portrait`, {
        method: "POST",
      });
      if (response.status === 404) {
        setWorkspace(null);
        setOutput(false);
        setMessage(
          "The temporary workspace expired. Choose the saved source again.",
        );
        return;
      }
      if (!response.ok) throw new Error("unavailable");
      setOutput(true);
      setMessage(
        "Local MP4 ready. This fixed first-ten-seconds encoding contains no AI analysis.",
      );
    } catch {
      setMessage("Local encoding is unavailable. Your source remains open.");
    } finally {
      setBusy(false);
    }
  }
  async function clear() {
    if (!workspace || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/workspace/${workspace.id}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 404)
        throw new Error("unavailable");
      setWorkspace(null);
      setOutput(false);
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
            {output && (
              <article>
                <h2>Portrait MP4</h2>
                <video
                  aria-label="Local portrait video"
                  controls
                  src={`/api/workspace/${workspace.id}/portrait`}
                />
                <a
                  href={`/api/workspace/${workspace.id}/portrait`}
                  download="clipbuilder-local.mp4"
                >
                  Download MP4
                </a>
              </article>
            )}
          </section>
          <nav aria-label="Workspace actions">
            <button disabled={busy} onClick={() => void exportPortrait()}>
              Encode first 10 seconds locally
            </button>
            <button disabled={busy} onClick={() => void clear()}>
              Clear processing workspace
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
const root = document.getElementById("root");
if (root) createRoot(root).render(<OwnerWorkspaceView />);
