"use client";

import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  useId,
  type KeyboardEvent,
} from "react";
import { Play } from "lucide-react";
import type { AnalysisBundleV1, ClipCandidateV1 } from "@clipbuilder/contracts";

import { candidateRange, timecode } from "./candidate.evidence";
import { AgenticNotes, candidateNotes } from "./agentic-notes";
import { PortraitPlaceholder, PortraitPlayer } from "./portrait-player";
import { ReviewTranscript } from "./review-transcript";
import { useRangePlayback } from "./use-range-playback";
import { useMomentLayout } from "./use-moment-layout";
import { useSessionEffects } from "../session/session.provider";
import styles from "./sample.module.css";

function MomentChoice({
  analysis,
  candidate,
  busy,
  choose,
  move,
  sourceUrl,
}: {
  analysis: AnalysisBundleV1;
  candidate: ClipCandidateV1;
  busy: boolean;
  sourceUrl?: string;
  choose: (item: ClipCandidateV1) => void;
  move: (
    event: KeyboardEvent<HTMLButtonElement>,
    item: ClipCandidateV1,
  ) => void;
}) {
  const range = candidateRange(analysis, candidate);
  return (
    <button
      type="button"
      className={styles.momentChoice}
      id={`moment-choice-${candidate.rank}`}
      aria-label={`Play moment ${candidate.rank}: ${candidate.title}`}
      disabled={busy}
      onClick={() => choose(candidate)}
      onKeyDown={(event) => move(event, candidate)}
    >
      <div className={styles.choicePortrait} data-moment-surface={candidate.id}>
        {sourceUrl ? (
          <MomentThumbnail sourceUrl={sourceUrl} startMs={range.startMs} />
        ) : (
          <PortraitPlaceholder />
        )}
        <span className={styles.choicePlay}>
          <Play size={14} aria-hidden="true" />
        </span>
        <span className={styles.choiceDuration}>
          {Math.round(range.durationMs / 1000)}s
        </span>
      </div>
      <span className={styles.momentMeta}>Moment {candidate.rank}</span>
      <strong>{candidate.title}</strong>
      <span className={styles.momentRange}>
        {timecode(range.startMs)} - {timecode(range.endMs)}
      </span>
    </button>
  );
}

function MomentThumbnail({
  sourceUrl,
  startMs,
}: {
  sourceUrl: string;
  startMs: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const effects = useSessionEffects();
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const ready = () => {
      element.currentTime = startMs / 1000;
    };
    element.addEventListener("loadedmetadata", ready);
    let stopped = false;
    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      element.removeEventListener("loadedmetadata", ready);
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
    return effects ? effects.registerStopper(cleanup) : cleanup;
  }, [sourceUrl, startMs, effects]);
  return (
    <video
      ref={video}
      src={sourceUrl}
      className={styles.localVideo}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}

function MomentPreview({
  analysis,
  candidate,
  play,
  busy,
  move,
  close,
  tab,
  setTab,
  sourceUrl,
}: {
  analysis: AnalysisBundleV1;
  candidate: ClipCandidateV1;
  play: boolean;
  busy: boolean;
  move: (
    event: KeyboardEvent<HTMLButtonElement>,
    item: ClipCandidateV1,
  ) => void;
  close: () => void;
  tab: "transcript" | "notes";
  setTab: (value: "transcript" | "notes") => void;
  sourceUrl?: string;
}) {
  const range = candidateRange(analysis, candidate);
  const {
    currentMs,
    playing,
    seek,
    toggle,
    pause,
    videoRef,
    muted,
    toggleMute,
  } = useRangePlayback(
    range,
    {
      timeMs: range.startMs,
      play,
      ordinal: 0,
    },
    undefined,
    sourceUrl,
  );
  const [highlighted, setHighlighted] = useState<readonly string[]>([]);
  const tabsId = useId();
  const details = useRef<HTMLDivElement>(null);
  const [splitDetails, setSplitDetails] = useState(false);
  const split = useRef(false);
  const resizeFocus = useRef<"transcript" | "notes" | null>(null);
  useLayoutEffect(() => {
    const element = details.current;
    if (!element || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(() => {
      // Two readable 17rem cards plus their 1rem gap, using actual panel space.
      const rem = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const next = element.clientWidth >= 35 * rem;
      if (next === split.current) return;
      const focused = document.activeElement;
      if (focused && element.contains(focused)) {
        const notes = element.querySelector('[data-detail="notes"]');
        if (!next && notes?.contains(focused)) setTab("notes");
        else if (!next) setTab("transcript");
        else if (focused.getAttribute("role") === "tab")
          resizeFocus.current =
            focused.id === `${tabsId}-notes` ? "notes" : "transcript";
      }
      split.current = next;
      setSplitDetails(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [setTab, tabsId]);
  useLayoutEffect(() => {
    if (!resizeFocus.current) return;
    details.current
      ?.querySelector<HTMLElement>(
        `[data-detail="${resizeFocus.current}"] [tabindex="0"]`,
      )
      ?.focus({ preventScroll: true });
    resizeFocus.current = null;
  }, [splitDetails]);
  const jump = (timeMs: number, wordIds: readonly string[]) => {
    pause();
    seek(timeMs);
    setHighlighted(wordIds);
  };
  return (
    <>
      <section
        className={styles.activeMoment}
        aria-label={`Selected moment ${candidate.rank}`}
      >
        <PortraitPlayer
          label={candidate.title}
          moment={candidate}
          range={range}
          currentMs={currentMs}
          playing={playing}
          {...(sourceUrl ? { videoRef, muted, toggleMute } : {})}
          toggle={toggle}
          seek={(timeMs) => {
            setHighlighted([]);
            seek(timeMs);
          }}
          busy={busy}
          onClose={close}
          onKeyDown={(event) => move(event, candidate)}
        />
      </section>
      <div
        ref={details}
        className={styles.momentDetails}
        data-details-layout={splitDetails ? "cards" : "tabs"}
      >
        <div
          className={styles.detailTabs}
          role="tablist"
          aria-label="Moment details"
          hidden={splitDetails}
        >
          {(["transcript", "notes"] as const).map((value) => (
            <button
              key={value}
              id={`${tabsId}-${value}`}
              type="button"
              role="tab"
              aria-selected={tab === value}
              aria-controls={`${tabsId}-${value}-panel`}
              tabIndex={tab === value ? 0 : -1}
              onClick={() => setTab(value)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "transcript"
                    : event.key === "End"
                      ? "notes"
                      : value === "transcript"
                        ? "notes"
                        : "transcript";
                setTab(next);
                document.getElementById(`${tabsId}-${next}`)?.focus();
              }}
            >
              {value === "transcript" ? "Transcript" : "Agentic Notes"}
            </button>
          ))}
        </div>
        <section
          id={`${tabsId}-transcript-panel`}
          role={splitDetails ? "region" : "tabpanel"}
          aria-label="Selected moment transcript"
          aria-labelledby={`${tabsId}-${splitDetails ? "transcript-heading" : "transcript"}`}
          className={styles.detailCard}
          data-detail="transcript"
          hidden={!splitDetails && tab !== "transcript"}
        >
          <h2 id={`${tabsId}-transcript-heading`} hidden={!splitDetails}>
            Transcript
          </h2>
          {(splitDetails || tab === "transcript") && (
            <ReviewTranscript
              analysis={analysis}
              range={range}
              currentMs={currentMs}
              highlighted={highlighted}
            />
          )}
        </section>
        <section
          id={`${tabsId}-notes-panel`}
          role={splitDetails ? "region" : "tabpanel"}
          aria-label="Selected moment agentic notes"
          aria-labelledby={`${tabsId}-${splitDetails ? "notes-heading" : "notes"}`}
          className={styles.detailCard}
          data-detail="notes"
          hidden={!splitDetails && tab !== "notes"}
        >
          <h2 id={`${tabsId}-notes-heading`} hidden={!splitDetails}>
            Agentic Notes
          </h2>
          {(splitDetails || tab === "notes") && (
            <div
              className={styles.notesScroll}
              tabIndex={0}
              aria-label="Scrollable agentic notes"
            >
              <h3>{candidate.title}</h3>
              <p className={styles.rationale}>{candidate.rationale}</p>
              <AgenticNotes
                notes={candidateNotes(analysis, candidate)}
                rangeStartMs={range.startMs}
                onSeek={jump}
                busy={busy}
              />
              {candidate.caveats.length > 0 && (
                <ul className={styles.caveats}>
                  {candidate.caveats.map((item) => (
                    <li key={item.code}>{item.note}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export function CandidateReview({
  analysis,
  selectedId,
  onSelect,
  onClose,
  busy,
  sourceUrl,
}: {
  analysis: AnalysisBundleV1;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  busy: boolean;
  sourceUrl?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const keyboardFocus = useRef<number | null>(null);
  const [playedId, setPlayedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"transcript" | "notes">("transcript");
  const transition = useMomentLayout(root, selectedId);
  const selected = analysis.candidates.find((item) => item.id === selectedId);
  useLayoutEffect(() => {
    if (keyboardFocus.current === null) return;
    document
      .getElementById(
        `moment-${selectedId === null ? "choice" : "play"}-${keyboardFocus.current}`,
      )
      ?.focus({ preventScroll: true });
    keyboardFocus.current = null;
  }, [selectedId]);
  function choose(item: ClipCandidateV1) {
    if (busy) return;
    transition(() => {
      keyboardFocus.current = item.rank;
      setPlayedId(item.id);
      onSelect(item.id);
    });
  }
  function move(
    event: KeyboardEvent<HTMLButtonElement>,
    item: ClipCandidateV1,
  ) {
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (direction === 0 && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const index = analysis.candidates.indexOf(item);
    const ordinal =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? analysis.candidates.length - 1
          : (index + direction + analysis.candidates.length) %
            analysis.candidates.length;
    const next = analysis.candidates[ordinal];
    if (next === undefined || busy || next.id === selectedId) return;
    keyboardFocus.current = next.rank;
    choose(next);
  }
  if (analysis.candidates.length === 0) return null;
  return (
    <div
      ref={root}
      className={`${styles.review} ${selected ? styles.previewMode : styles.galleryMode}`}
      data-moment-layout={selected ? "preview" : "gallery"}
    >
      <div
        className={styles.momentChoices}
        role="group"
        aria-label={selected ? "Other moments" : "Candidate moments"}
      >
        {analysis.candidates
          .filter((item) => item.id !== selected?.id)
          .map((item) => (
            <MomentChoice
              key={item.id}
              analysis={analysis}
              candidate={item}
              busy={busy}
              choose={choose}
              move={move}
              {...(sourceUrl ? { sourceUrl } : {})}
            />
          ))}
      </div>
      {selected && (
        <MomentPreview
          key={selected.id}
          analysis={analysis}
          candidate={selected}
          play={playedId === selected.id}
          busy={busy}
          move={move}
          close={() =>
            transition(() => {
              keyboardFocus.current = selected.rank;
              setPlayedId(null);
              onClose();
            })
          }
          tab={tab}
          setTab={setTab}
          {...(sourceUrl ? { sourceUrl } : {})}
        />
      )}
    </div>
  );
}
