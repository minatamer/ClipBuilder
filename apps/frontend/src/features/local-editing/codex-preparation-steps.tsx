import { useEffect, useState } from "react";
import { Check, Circle, LoaderCircle, X } from "lucide-react";
import {
  codexProgressSchema,
  type CodexProgress,
  type CodexProgressStep,
  type CodexStepId,
} from "../../../../../packages/contracts/local/codex-progress.ts";
import styles from "./codex-preparation-steps.module.css";

const labels: Record<CodexStepId, string> = {
  inspect: "Checking video",
  audio: "Extracting audio",
  transcription: "Transcribing speech",
  speakers: "Separating speakers",
  frames: "Sampling video frames",
  selection: "Finding moments",
  planning: "Planning the edit",
  pictures: "Adding pictures",
  preview: "Preparing preview",
};

/** Observes existing work only. Unmount and workspace changes cancel polling. */
export function CodexPreparationSteps({
  workspaceId,
  clipId,
  preparationStage,
}: {
  workspaceId: string;
  clipId?: string;
  preparationStage?:
    | "speakers"
    | "planning"
    | "pictures"
    | "captions"
    | "preview"
    | null
    | undefined;
}) {
  const [progress, setProgress] = useState<CodexProgress | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/local/workspace/${workspaceId}/codex-progress`,
          {
            cache: "no-store",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(2500),
            ]),
          },
        );
        if (response.ok) {
          const value = codexProgressSchema
            .nullable()
            .parse(await response.json());
          if (!controller.signal.aborted) setProgress(value);
        }
      } catch {
        /* Progress transport cannot retry the actual operation. */
      }
      if (!controller.signal.aborted)
        timer = setTimeout(() => void poll(), 750);
    };
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [workspaceId, clipId]);
  const steps: CodexProgressStep[] =
    progress &&
    progress.clipId === clipId &&
    (!!clipId || progress.steps.some((step) => step.state !== "done"))
      ? progress.steps.map((step) => ({ ...step }))
      : [];
  if (
    clipId &&
    preparationStage &&
    preparationStage !== "planning" &&
    preparationStage !== "speakers"
  ) {
    steps.push({
      id: "pictures",
      state: preparationStage === "pictures" ? "running" : "done",
      elapsedMs: 0,
    });
    if (preparationStage === "preview")
      steps.push({ id: "preview", state: "running", elapsedMs: 0 });
  }
  if (!steps.length) return null;
  return (
    <ol
      className={styles.steps}
      aria-label="Preparation stages"
      aria-live="polite"
    >
      {steps.map((step) => {
        const Icon =
          step.state === "done"
            ? Check
            : step.state === "running"
              ? LoaderCircle
              : step.state === "failed" || step.state === "canceled"
                ? X
                : Circle;
        return (
          <li key={step.id} data-state={step.state}>
            <Icon
              aria-hidden="true"
              className={step.state === "running" ? styles.spinner : undefined}
            />
            <span>{labels[step.id]}</span>
            <span className={styles.status}>
              {step.state === "done"
                ? "Done"
                : step.state === "running"
                  ? "In progress"
                  : step.state === "pending"
                    ? "Waiting"
                    : step.state === "failed"
                      ? "Failed"
                      : "Canceled"}
            </span>
            {step.state === "done" && step.elapsedMs > 0 && (
              <span className={styles.time}>
                {(step.elapsedMs / 1000).toFixed(1)}s
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
