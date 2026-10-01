"use client";

import { useEffect, useState } from "react";
import { Clapperboard } from "lucide-react";
import type { OperationStatusV1 } from "@clipbuilder/contracts";
import { Progress } from "../../shared/ui/progress";
import { timecode } from "./candidate.evidence";
import styles from "./sample.module.css";

// An activity cue, not work completeness or a finish-time estimate.
export function processingActivityFraction(elapsedMs: number) {
  return Number.isFinite(elapsedMs)
    ? 0.92 * (1 - Math.exp(-Math.max(0, elapsedMs) / 45_000))
    : 0;
}

export function ProcessingStatus({
  label,
  operation,
  fraction,
  mode,
  active = true,
}: {
  label: string;
  operation?: OperationStatusV1;
  fraction?: number;
  mode: "fake" | "real";
  active?: boolean;
}) {
  const [initialTime] = useState(() => Date.now());
  const [now, setNow] = useState(initialTime);
  const running =
    active &&
    (!operation ||
      operation.state === "queued" ||
      operation.state === "running");
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const startMs = operation?.startedAt
    ? Date.parse(operation.startedAt)
    : initialTime;
  const endMs = operation?.completedAt
    ? Date.parse(operation.completedAt)
    : now;
  const elapsedMs = Math.max(0, endMs - startMs);
  const complete = operation?.state === "succeeded";
  const measured = mode === "fake" ? fraction : complete ? 1 : undefined;
  return (
    <section className={styles.processing} aria-label="Processing status">
      <Clapperboard size={40} aria-hidden="true" />
      <Progress
        label={label}
        active={active}
        {...(measured === undefined ? {} : { fraction: measured })}
        {...(mode === "real" && !complete
          ? { activityFraction: processingActivityFraction(elapsedMs) }
          : {})}
      />
      <p className={styles.elapsedTime}>
        Elapsed <time>{timecode(elapsedMs)}</time>
      </p>
    </section>
  );
}
