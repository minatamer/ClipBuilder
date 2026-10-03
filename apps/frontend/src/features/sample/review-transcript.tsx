"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AnalysisBundleV1 } from "@clipbuilder/contracts";
import styles from "./sample.module.css";

export function ReviewTranscript({
  analysis,
  range,
  currentMs,
  highlighted = [],
  selectedWords,
}: {
  analysis: AnalysisBundleV1;
  range: { startMs: number; endMs: number };
  currentMs: number;
  highlighted?: readonly string[];
  selectedWords?: AnalysisBundleV1["transcript"]["words"];
}) {
  const pane = useRef<HTMLDivElement>(null);
  const words = useMemo(
    () =>
      selectedWords ??
      analysis.transcript.words.filter(
        (word) => word.startMs >= range.startMs && word.endMs <= range.endMs,
      ),
    [selectedWords, analysis.transcript.words, range.startMs, range.endMs],
  );
  const activeId = words.find(
    (word) => word.startMs <= currentMs && word.endMs > currentMs,
  )?.id;
  useEffect(() => {
    const wordId = highlighted[0] ?? activeId;
    const element = pane.current?.querySelector<HTMLElement>(
      `[data-word-id="${wordId}"]`,
    );
    if (!pane.current || !element) return;
    const box = element.getBoundingClientRect();
    const bounds = pane.current.getBoundingClientRect();
    if (box.top < bounds.top || box.bottom > bounds.bottom)
      pane.current.scrollTop +=
        box.top - bounds.top - pane.current.clientHeight / 3;
  }, [activeId, highlighted]);
  return (
    <div
      ref={pane}
      className={styles.transcriptScroll}
      tabIndex={0}
      aria-label="Scrollable moment transcript"
    >
      <p
        className={styles.transcript}
        aria-label="Candidate transcript"
        dir="auto"
      >
        {words.map((word) => (
          <span
            key={word.id}
            data-word-id={word.id}
            data-current={word.id === activeId}
          >
            {highlighted.includes(word.id) ? (
              <mark>{word.punctuatedText}</mark>
            ) : (
              word.punctuatedText
            )}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}
