"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  useId,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { LoaderCircle, Play } from "lucide-react";
import type { AnalysisBundleV1, ClipCandidateV1 } from "@clipbuilder/contracts";

import { candidateRange, timecode } from "./candidate.evidence";
import { AgenticNotes, candidateNotes } from "./agentic-notes";
import { PortraitPlaceholder, PortraitPlayer } from "./portrait-player";
import { ReviewTranscript } from "./review-transcript";
import { useRangePlayback } from "./use-range-playback";
import { useMomentLayout } from "./use-moment-layout";
import { ClipReviewLayout } from "./clip-review-layout";
import { useMomentThumbnails, type MomentFrame } from "./use-moment-thumbnails";
import styles from "./sample.module.css";

function MomentChoice({
  analysis,
  candidate,
  busy,
  choose,
  move,
  sourceUrl,
  dimensions,
  frame,
}: {
  analysis: AnalysisBundleV1;
  candidate: ClipCandidateV1;
  busy: boolean;
  sourceUrl?: string;
  dimensions: { width: number; height: number };
  frame: MomentFrame | undefined;
  choose: (item: ClipCandidateV1, keyboard?: boolean) => void;
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
      onClick={(event) => choose(candidate, event.detail === 0)}
      onKeyDown={(event) => move(event, candidate)}
    >
      <div className={styles.choicePortrait} data-moment-surface={candidate.id}>
        {sourceUrl ? (
          <MomentThumbnail frame={frame} />
        ) : (
          <PortraitPlaceholder dimensions={dimensions} />
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

function MomentThumbnail({ frame }: { frame: MomentFrame | undefined }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state =
    frame === "unavailable" ? "unavailable" : frame ? "ready" : "loading";
  useLayoutEffect(() => {
    const surface = canvas.current;
    if (!surface || !frame || frame === "unavailable") return;
    surface.width = frame.width;
    surface.height = frame.height;
    surface.getContext("2d")?.drawImage(frame, 0, 0);
    return () => {
      surface.width = 0;
      surface.height = 0;
    };
  }, [frame]);
  return (
    <>
      <canvas
        ref={canvas}
        className={styles.localVideo}
        aria-hidden="true"
        data-thumbnail-state={state}
      />
      {state !== "ready" && (
        <span className={styles.thumbnailStatus} role="status">
          {state === "loading" ? (
            <>
              <LoaderCircle
                className={styles.playerSpinner}
                aria-hidden="true"
              />
              <span className={styles.screenReaderText}>
                Loading preview frame
              </span>
            </>
          ) : (
            "Preview unavailable"
          )}
        </span>
      )}
    </>
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
  dimensions,
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
  dimensions: { width: number; height: number };
}) {
  const range = candidateRange(analysis, candidate);
  const {
    currentMs,
    playing,
    loading,
    seek,
    toggle,
    pause,
    videoRef,
    volume,
    setVolume,
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
  const video = (
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
        loading={loading}
        aspectRatio={dimensions.width / dimensions.height}
        source={dimensions.width > dimensions.height}
        videoPreload="auto"
        {...(!sourceUrl
          ? { surface: <PortraitPlaceholder dimensions={dimensions} /> }
          : {})}
        {...(sourceUrl ? { videoRef } : {})}
        volume={volume}
        setVolume={setVolume}
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
  );
  const transcript = (
    <ReviewTranscript
      analysis={analysis}
      range={range}
      currentMs={currentMs}
      highlighted={highlighted}
    />
  );
  const notes = (
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
  );
  if (dimensions.width > dimensions.height)
    return (
      <ClipReviewLayout
        carousel
        label={`Selected moment ${candidate.rank} review`}
        video={video}
        notes={
          <section
            className={styles.editNotes}
            aria-label="Selected moment agentic notes"
          >
            <h2>Agentic Notes</h2>
            {notes}
          </section>
        }
        transcript={
          <section
            className={styles.momentTranscript}
            aria-label="Selected moment transcript"
          >
            <h2>Transcript</h2>
            {transcript}
          </section>
        }
      />
    );
  return (
    <>
      {video}
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
          {(splitDetails || tab === "transcript") && transcript}
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
          {(splitDetails || tab === "notes") && notes}
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
  const revealKeyboardFocus = useRef(false);
  const [playedId, setPlayedId] = useState<string | null>(null);
  const frames = useMomentThumbnails(analysis, sourceUrl);
  const [tab, setTab] = useState<"transcript" | "notes">("transcript");
  const transition = useMomentLayout(root, selectedId);
  const swapsAxes =
    analysis.media.rotationDegrees === 90 ||
    analysis.media.rotationDegrees === 270;
  const dimensions = {
    width: swapsAxes ? analysis.media.height : analysis.media.width,
    height: swapsAxes ? analysis.media.width : analysis.media.height,
  };
  const selected = analysis.candidates.find((item) => item.id === selectedId);
  useLayoutEffect(() => {
    if (keyboardFocus.current === null) return;
    document
      .getElementById(
        `moment-${selectedId === null ? "choice" : "play"}-${keyboardFocus.current}`,
      )
      ?.focus({ preventScroll: !revealKeyboardFocus.current });
    keyboardFocus.current = null;
    revealKeyboardFocus.current = false;
  }, [selectedId]);
  function choose(item: ClipCandidateV1, keyboard = false) {
    if (busy) return;
    transition(() => {
      keyboardFocus.current = item.rank;
      revealKeyboardFocus.current = keyboard;
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
    choose(next, true);
  }
  if (analysis.candidates.length === 0) return null;
  return (
    <div
      ref={root}
      className={`${styles.review} ${selected ? styles.previewMode : styles.galleryMode}`}
      data-moment-layout={selected ? "preview" : "gallery"}
      data-source-shape={analysis.media.orientation}
      style={
        {
          "--moment-aspect": dimensions.width / dimensions.height,
        } as CSSProperties
      }
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
              dimensions={dimensions}
              frame={frames[item.id]}
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
              revealKeyboardFocus.current = true;
              setPlayedId(null);
              onClose();
            })
          }
          tab={tab}
          setTab={setTab}
          dimensions={dimensions}
          {...(sourceUrl ? { sourceUrl } : {})}
        />
      )}
    </div>
  );
}
