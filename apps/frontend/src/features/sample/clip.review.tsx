"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
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
import styles from "./sample.module.css";

type ClipReviewProps = {
  analysis: AnalysisBundleV1;
  assembly: AssemblyBundleV1;
  playbackTimeMs?: number;
  onPosition?: (clipTimeMs: number) => void;
  presentation?: "review" | "export";
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
}: ClipReviewProps & { selected: ClipCandidateV1 }) {
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
          <Button
            icon={Download}
            disabled
            title="A validated output video is required"
          >
            Download MP4
          </Button>
        </div>
        <section
          className={styles.socialDestinations}
          aria-labelledby="social-heading"
        >
          <h2 id="social-heading">
            <span>OR</span> Share on social media
          </h2>
          <div className={styles.socialActions}>
            {["Facebook", "Instagram", "TikTok", "X"].map((name) => (
              <button
                key={name}
                type="button"
                disabled
                aria-label={`${name} sharing unavailable, coming soon`}
              >
                <Share2 size={18} aria-hidden="true" />
                <strong>{name}</strong>
                <span>Soon</span>
              </button>
            ))}
          </div>
        </section>
      </section>
    );
  return (
    <section className={styles.clipReview} aria-label="Read-only clip preview">
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
      <div className={styles.reviewVideo}>{player}</div>
      <section className={styles.momentTranscript} aria-label="Clip transcript">
        <h2>Transcript</h2>
        <ReviewTranscript
          analysis={analysis}
          range={range}
          currentMs={currentMs}
          highlighted={highlighted}
        />
      </section>
    </section>
  );
}
