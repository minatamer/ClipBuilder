import { useEffect, useId, useRef, useState } from "react";
import { Clock3, Play, X } from "lucide-react";
import type { OwnerWorkspace } from "../../../../../packages/contracts/local/index.ts";
import {
  OWNER_FPS,
  ownerMomentRangeRequestSchema,
  ownerReviewedMomentCut,
  type OwnerAnalysis,
  type OwnerMoment,
  type OwnerMomentRangeRequest,
} from "../../../../../packages/contracts/local/selection.ts";
import {
  ownerOriginalSourceTime,
  ownerSourceTimestamp,
  parseOwnerSourceTimestamp,
} from "../../../../../packages/contracts/local/source-window.ts";
import { Button, IconButton } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { MediaLoadingOverlay } from "../../shared/ui/media-loading-overlay";
import { readOwnerAnalysis } from "./collection-pages.ts";
import { capturePreviewTime, manualPreviewJumpSeconds } from "./manual-time.ts";
import { momentDuration } from "./moment-selection.ts";
import { OWNER_MAX_REQUESTED_CLIP_MS } from "../../../../../packages/contracts/local/policy.ts";
import styles from "./moment-range-dialog.module.css";

export function MomentRangeDialog({
  workspace,
  analysis,
  moment,
  number,
  onBusy,
  onAccepted,
  onClose,
}: {
  workspace: OwnerWorkspace;
  analysis: OwnerAnalysis;
  moment: OwnerMoment;
  number: number;
  onBusy: (busy: boolean) => void;
  onAccepted: (analysis: OwnerAnalysis, replacementId: string) => void;
  onClose: () => void;
}) {
  const offset = workspace.source.origin?.startMs ?? 0;
  const initial = (frame: number) =>
    ownerSourceTimestamp(
      ownerOriginalSourceTime(workspace.source, (frame * 1000) / OWNER_FPS),
    );
  const [start, setStart] = useState(initial(moment.cut.startFrame));
  const [end, setEnd] = useState(initial(moment.cut.endFrame));
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const retry = useRef<OwnerMomentRangeRequest | null>(null);
  const titleId = useId(),
    feedbackId = useId();
  const rangeHint = `Use 1–${Math.max(OWNER_MAX_REQUESTED_CLIP_MS / 1000, Number(((moment.cut.endFrame - moment.cut.startFrame) / OWNER_FPS).toFixed(2)))}s inside the analyzed range, with Start before End.`;
  useEffect(() => {
    dialog.current?.showModal();
    first.current?.focus();
    return () => request.current?.abort();
  }, []);
  function range() {
    return {
      startMs: parseOwnerSourceTimestamp(start) - offset,
      endMs: parseOwnerSourceTimestamp(end) - offset,
    };
  }
  let cut: ReturnType<typeof ownerReviewedMomentCut> | null = null;
  try {
    cut = ownerReviewedMomentCut(workspace.source, analysis, moment, range());
  } catch {
    /* Keep typed values until corrected. */
  }
  function capture(endpoint: "start" | "end") {
    if (pending) return;
    const time = capturePreviewTime(
      video.current,
      workspace.source.durationMs,
      offset,
    );
    if (time === null) {
      setMessage("Wait for the preview to finish seeking.");
      return;
    }
    (endpoint === "start" ? setStart : setEnd)(time);
    setMessage("");
  }
  function jump(endpoint: "start" | "end") {
    if (
      pending ||
      !video.current ||
      video.current.readyState < 1 ||
      video.current.error
    )
      return;
    try {
      const seconds = manualPreviewJumpSeconds(
        parseOwnerSourceTimestamp(endpoint === "start" ? start : end) - offset,
        workspace.source,
        endpoint,
      );
      if (seconds === null) throw Error("invalid_time");
      video.current.pause();
      video.current.currentTime = seconds;
      setMessage("");
    } catch {
      setMessage("Enter a timestamp inside the source video.");
    }
  }
  async function save() {
    if (request.current) return;
    if (!cut) {
      setMessage(rangeHint);
      return;
    }
    if (
      cut.startFrame === moment.cut.startFrame &&
      cut.endFrame === moment.cut.endFrame
    ) {
      onClose();
      return;
    }
    const currentRange = range();
    const previous = retry.current;
    const body = ownerMomentRangeRequestSchema.parse({
      analysisId: analysis.id,
      momentId: moment.id,
      sourceRevision: workspace.revision,
      policyRevision: analysis.inputs.policyRevision,
      expectedCut: moment.cut,
      operationId:
        previous &&
        previous.range.startMs === currentRange.startMs &&
        previous.range.endMs === currentRange.endMs
          ? previous.operationId
          : crypto.randomUUID(),
      range: currentRange,
    });
    retry.current = body;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    onBusy(true);
    setMessage("");
    video.current?.pause();
    try {
      const response = await fetch(
        `/api/local/workspace/${workspace.id}/analysis/${moment.id}/edit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        },
      );
      if (!response.ok) {
        setMessage(
          response.status === 409
            ? "These clips changed or processing is busy. Close and reload before editing."
            : "Couldn’t save timestamps. Try again.",
        );
        return;
      }
      const result = await readOwnerAnalysis(
        response,
        workspace.id,
        controller.signal,
      );
      if (
        !result ||
        result.id !== analysis.id ||
        ![...result.manual, ...result.suggestions].some(
          (value) => value.id === body.operationId,
        )
      )
        throw Error("invalid_result");
      if (!controller.signal.aborted) onAccepted(result, body.operationId);
    } catch {
      if (!controller.signal.aborted)
        setMessage("Couldn’t save timestamps. Try again.");
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setPending(false);
      onBusy(false);
    }
  }
  const feedback = message || (!cut ? rangeHint : momentDuration(cut));
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!request.current) onClose();
      }}
    >
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <header className={styles.heading}>
          <h2 id={titleId}>Edit timestamps</h2>
          <IconButton
            label="Close timestamps dialog"
            icon={X}
            disabled={pending}
            onClick={onClose}
          />
        </header>
        <div className={styles.body}>
          <p className={styles.name}>
            {moment.evidence?.title ?? `Clip ${number}`}
          </p>
          <div className={styles.preview}>
            <video
              ref={video}
              src={`/api/local/workspace/${workspace.id}/source`}
              controls
              muted
              playsInline
              preload="auto"
              aria-label="Timestamp source preview"
              onLoadedMetadata={() => {
                if (video.current)
                  video.current.currentTime = moment.cut.startFrame / OWNER_FPS;
              }}
            />
            <MediaLoadingOverlay element={video} />
          </div>
          <div className={styles.endpoints}>
            {(["start", "end"] as const).map((endpoint) => (
              <div className={styles.endpoint} key={endpoint}>
                <label>
                  {endpoint === "start" ? "Start" : "End"}
                  <input
                    ref={endpoint === "start" ? first : undefined}
                    aria-label={`${endpoint === "start" ? "Start" : "End"} timestamp`}
                    value={endpoint === "start" ? start : end}
                    maxLength={32}
                    disabled={pending}
                    aria-describedby={feedbackId}
                    aria-invalid={!cut || undefined}
                    onChange={(event) => {
                      (endpoint === "start" ? setStart : setEnd)(
                        event.target.value,
                      );
                      setMessage("");
                    }}
                  />
                </label>
                <div className={styles.endpointActions}>
                  <Button
                    variant="quiet"
                    icon={Clock3}
                    disabled={pending}
                    aria-label={`Capture ${endpoint} timestamp`}
                    onClick={() => capture(endpoint)}
                  >
                    Capture
                  </Button>
                  <IconButton
                    label={`Jump to ${endpoint} timestamp`}
                    icon={Play}
                    disabled={pending}
                    onClick={() => jump(endpoint)}
                  />
                </div>
              </div>
            ))}
          </div>
          <InlineFeedback
            id={feedbackId}
            message={feedback}
            tone={message || !cut ? "error" : "status"}
          />
        </div>
        <footer className={styles.actions}>
          <Button variant="quiet" disabled={pending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" busy={pending} disabled={pending || !cut}>
            {pending ? "Saving…" : "Save timestamps"}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
