"use client";

import { useId, useState } from "react";
import { Download } from "lucide-react";
import type {
  AnalysisBundleV1,
  AssemblyBundleV1,
  ClipCandidateV1,
} from "@clipbuilder/contracts";
import { Button } from "../../shared/ui/button";
import { candidateRange } from "./candidate.evidence";
import { AgenticNotes, assemblyNotes, candidateNotes } from "./agentic-notes";
import { PortraitPlayer } from "./portrait-player";
import { ReviewTranscript } from "./review-transcript";
import { useRangePlayback } from "./use-range-playback";
import { ClipReviewLayout } from "./clip-review-layout";
import { ClipDeliveryActions, SocialDestinations } from "./clip-delivery";
import styles from "./sample.module.css";

type ClipReviewProps = {
  analysis: AnalysisBundleV1;
  assembly: AssemblyBundleV1;
  playbackTimeMs?: number;
  onPosition?: (clipTimeMs: number) => void;
  presentation?: "review" | "export";
  deliveryFooter?: HTMLElement | null;
};

export function ClipReview(props: ClipReviewProps) {
  const selected = props.analysis.candidates.find(
    (item) => item.id === props.assembly.compositionManifest.baseCandidateId,
  );
  return selected ? (
    <SelectedClipReview key={selected.id} {...props} selected={selected} />
  ) : null;
}

function SelectedClipReview({
  analysis,
  assembly,
  selected,
  playbackTimeMs = 0,
  onPosition,
  presentation = "review",
  deliveryFooter,
}: ClipReviewProps & { selected: ClipCandidateV1 }) {
  const downloadNoticeId = useId();
  const range = candidateRange(analysis, selected);
  const { currentMs, playing, seek, toggle, pause } = useRangePlayback(
    range,
    { timeMs: range.startMs + playbackTimeMs, play: false, ordinal: 0 },
    onPosition,
  );
  const [highlighted, setHighlighted] = useState<readonly string[]>([]);
  const words = analysis.transcript.words.filter(
    (word) => word.startMs >= range.startMs && word.endMs <= range.endMs,
  );
  const nextWord = words.findIndex((word) => word.endMs > currentMs);
  const currentIndex = nextWord < 0 ? Math.max(0, words.length - 1) : nextWord;
  const groupStart = Math.floor(currentIndex / 6) * 6;
  const cue = assembly.visualPlan.cues.find((item) => {
    const start = analysis.transcript.words.find(
      (word) => word.id === item.startWordId,
    );
    const end = analysis.transcript.words.find(
      (word) => word.id === item.endWordId,
    );
    return start && end && currentMs >= start.startMs && currentMs <= end.endMs;
  });
  const quote = assembly.visualPlan.requests.find(
    (item) => item.id === cue?.assetRequestId,
  )?.exactText;
  const jump = (timeMs: number, wordIds: readonly string[]) => {
    pause();
    seek(timeMs);
    setHighlighted(wordIds);
  };
  const player = (
    <PortraitPlayer
      label={selected.title}
      range={range}
      currentMs={currentMs}
      playing={playing}
      toggle={toggle}
      seek={(timeMs) => {
        setHighlighted([]);
        seek(timeMs);
      }}
    >
      <p className={styles.captionPreview} aria-hidden="true">
        {words.slice(groupStart, groupStart + 6).map((word) => (
          <span
            key={word.id}
            data-current={word.startMs <= currentMs && word.endMs > currentMs}
          >
            {word.punctuatedText}{" "}
          </span>
        ))}
      </p>
      {quote && (
        <blockquote className={styles.quoteVisual} aria-hidden="true">
          {quote}
        </blockquote>
      )}
    </PortraitPlayer>
  );
  if (presentation === "export")
    return (
      <section
        className={styles.exportLayout}
        aria-label="Clip delivery"
        tabIndex={0}
      >
        <div className={styles.exportVideo}>
          <div className={styles.exportVideoFrame}>{player}</div>
          <ClipDeliveryActions target={deliveryFooter}>
            <p id={downloadNoticeId} className={styles.screenReaderText}>
              Downloads are unavailable in simulated mode.
            </p>
            <Button
              icon={Download}
              disabled
              aria-describedby={downloadNoticeId}
              title="Downloads are unavailable in simulated mode"
            >
              Download MP4
            </Button>
          </ClipDeliveryActions>
        </div>
        <SocialDestinations />
      </section>
    );
  return (
    <ClipReviewLayout
      notes={
        <section className={styles.editNotes} aria-label="Clip agentic notes">
          <h2>Agentic Notes</h2>
          <div
            className={styles.notesScroll}
            tabIndex={0}
            aria-label="Scrollable edit notes"
          >
            <h3>{selected.title}</h3>
            <p className={styles.rationale}>{selected.rationale}</p>
            <h3>Edit decisions</h3>
            <AgenticNotes
              notes={assemblyNotes(analysis, selected, assembly)}
              rangeStartMs={range.startMs}
              onSeek={jump}
            />
            <h3>Interest points</h3>
            <AgenticNotes
              notes={candidateNotes(analysis, selected)}
              rangeStartMs={range.startMs}
              onSeek={jump}
            />
            {selected.caveats.length > 0 && (
              <ul className={styles.caveats}>
                {selected.caveats.map((item) => (
                  <li key={item.code}>{item.note}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      }
      video={<div className={styles.reviewVideo}>{player}</div>}
      transcript={
        <section
          className={styles.momentTranscript}
          aria-label="Clip transcript"
        >
          <h2>Transcript</h2>
          <ReviewTranscript
            analysis={analysis}
            range={range}
            currentMs={currentMs}
            highlighted={highlighted}
          />
        </section>
      }
    />
  );
}
