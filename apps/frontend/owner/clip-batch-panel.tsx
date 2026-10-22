import { useCallback, useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { AbsoluteFill, Html5Video, useCurrentFrame } from "remotion";
import { OwnerAutomaticOverlay } from "../../../packages/composition/owner/automatic-overlay.tsx";
import {
  ownerClipListSchema,
  type OwnerClip,
  type OwnerClipList,
  type OwnerOverlay,
} from "../../../packages/contracts/owner/clips.ts";
import {
  OWNER_FPS,
  type OwnerWorkspace,
} from "../../../packages/contracts/owner/index.ts";
import type { OwnerMomentExport } from "../../../packages/contracts/owner/selection.ts";

function Review({
  overlay,
  assets,
  sourceUrl,
}: {
  overlay: OwnerOverlay;
  assets: Record<string, string>;
  sourceUrl: string;
}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#101215" }}>
      <Html5Video
        src={sourceUrl}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        pauseWhenBuffering
      />
      <OwnerAutomaticOverlay overlay={overlay} assets={assets} frame={frame} />
    </AbsoluteFill>
  );
}
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
  const alive = useRef(false),
    requestController = useRef<AbortController | null>(null),
    requesting = useRef(false);
  const endpoint = `/api/workspace/${workspace.id}/clips`;
  const accept = useCallback(
    (value: OwnerClipList) => {
      setList(value);
      onActive(value.active);
    },
    [onActive],
  );
  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = async () => {
      let repeat = true;
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("unavailable");
        const result = ownerClipListSchema.parse(await response.json());
        if (!controller.signal.aborted) accept(result);
        repeat = result.active;
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
      alive.current = false;
      controller.abort();
      requestController.current?.abort();
      if (timer) clearTimeout(timer);
    };
  }, [endpoint, accept, list.active]);
  async function action(path: string, body?: unknown) {
    if (requesting.current) return;
    requesting.current = true;
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
  const sourceUrl = (clip: OwnerClip) => `${endpoint}/${clip.id}/source`;
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
                disabled={!clip.base || clip.outputs.length === 0}
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
                disabled={!clip.base || working(clip) || pending}
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
          <Player
            key={current.id}
            component={Review}
            inputProps={{
              overlay: current.base.overlay,
              assets: Object.fromEntries(
                current.assets.map((asset) => [
                  asset.id,
                  `/api/workspace/${workspace.id}/assets/${asset.id}`,
                ]),
              ),
              sourceUrl: sourceUrl(current),
            }}
            durationInFrames={current.base.overlay.frames}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={OWNER_FPS}
            controls
            style={{ width: "100%", maxWidth: 360 }}
          />
        </article>
      )}
    </section>
  );
}
