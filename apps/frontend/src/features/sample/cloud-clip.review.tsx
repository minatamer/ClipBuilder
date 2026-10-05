"use client";
import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { ClipComposition } from "@clipbuilder/composition";
import type {
  AnalysisBundleV1,
  SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import type { SourceAnalysisApi } from "../source-analysis/source-analysis.api";
import { PortraitPlayer } from "./portrait-player";
import { AgenticNotes, candidateNotes } from "./agentic-notes";
import { ReviewTranscript } from "./review-transcript";
import { ClipReviewLayout } from "./clip-review-layout";
import { fixedReviewNotes, previewFrame } from "./fixed-review";
import { Button } from "../../shared/ui/button";
import styles from "./sample.module.css";

export function CloudClipReview({
  analysis,
  result,
  api,
}: {
  analysis: AnalysisBundleV1;
  result: SelectedAssemblyResult;
  api: Pick<SourceAnalysisApi, "session" | "preview">;
}) {
  const player = useRef<PlayerRef>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0),
    [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0),
    [volume, setVolume] = useState(1);
  const [highlighted, setHighlighted] = useState<readonly string[]>([]);
  const range = result.manifest.range,
    duration = range.endMs - range.startMs;
  const selected = analysis.candidates.find(
    (candidate) => candidate.id === result.candidateId,
  );
  useEffect(() => {
    const controller = new AbortController();
    let expiry: ReturnType<typeof setTimeout> | undefined;
    void (async () => {
      const session = await api.session(controller.signal);
      if (session.sessionId !== result.binding.sessionId) throw new Error();
      const value = await api.preview(result, controller.signal);
      controller.signal.throwIfAborted();
      if (value.expiresAtMs <= Date.now()) throw new Error();
      setReady(true);
      expiry = setTimeout(() => {
        player.current?.pause();
        setReady(false);
        setFailed(true);
      }, value.expiresAtMs - Date.now());
    })().catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => {
      controller.abort();
      clearTimeout(expiry);
    };
  }, [api, result, attempt]);
  useEffect(() => {
    const current = player.current;
    if (!ready || !current) return;
    const position = (event: { detail: { frame: number } }) =>
      setFrame(event.detail.frame);
    const play = () => setPlaying(true),
      pause = () => setPlaying(false);
    const volumeChanged = () =>
      setVolume(current.isMuted() ? 0 : current.getVolume());
    const error = () => {
      current.pause();
      setFailed(true);
      setReady(false);
    };
    current.addEventListener("frameupdate", position);
    current.addEventListener("play", play);
    current.addEventListener("pause", pause);
    current.addEventListener("ended", pause);
    current.addEventListener("error", error);
    current.addEventListener("volumechange", volumeChanged);
    current.addEventListener("mutechange", volumeChanged);
    return () => {
      current.pause();
      current.removeEventListener("frameupdate", position);
      current.removeEventListener("play", play);
      current.removeEventListener("pause", pause);
      current.removeEventListener("ended", pause);
      current.removeEventListener("error", error);
      current.removeEventListener("volumechange", volumeChanged);
      current.removeEventListener("mutechange", volumeChanged);
    };
  }, [ready]);
  const seek = (sourceMs: number) => {
    player.current?.pause();
    const value = previewFrame(sourceMs, result);
    player.current?.seekTo(value);
    setFrame(value);
  };
  if (!selected) return <p role="alert">The selected clip is unavailable.</p>;
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
              notes={fixedReviewNotes(result)}
              rangeStartMs={range.startMs}
              busy={!ready}
              onSeek={(ms, ids) => {
                seek(ms);
                setHighlighted(ids);
              }}
            />
            <h3>Interest points</h3>
            <AgenticNotes
              notes={candidateNotes(analysis, selected)}
              rangeStartMs={range.startMs}
              busy={!ready}
              onSeek={(ms, ids) => {
                seek(ms);
                setHighlighted(ids);
              }}
            />
          </div>
        </section>
      }
      video={
        <div className={styles.reviewVideo}>
          {ready ? (
            <PortraitPlayer
              label={selected.title}
              range={range}
              currentMs={
                range.startMs +
                Math.min(duration, Math.round((frame * 1000) / 30))
              }
              playing={playing}
              volume={volume}
              setVolume={(level) => {
                player.current?.setVolume(level);
                if (level === 0) player.current?.mute();
                else player.current?.unmute();
                setVolume(level);
              }}
              toggle={() =>
                playing ? player.current?.pause() : player.current?.play()
              }
              seek={(ms) => {
                setHighlighted([]);
                seek(ms);
              }}
              surface={
                <Player
                  ref={player}
                  component={ClipComposition}
                  inputProps={{
                    manifest: result.manifest,
                    sourceUrl: "/api/analysis/preview",
                    sourceStartMs: 0,
                  }}
                  durationInFrames={Math.ceil((duration * 30) / 1000)}
                  fps={30}
                  compositionWidth={1080}
                  compositionHeight={1920}
                  controls={false}
                  initialVolume={volume}
                  clickToPlay={false}
                  doubleClickToFullscreen={false}
                  spaceKeyToPlayOrPause={false}
                  style={{ width: "100%", height: "100%" }}
                  errorFallback={() => (
                    <p role="alert">Preview playback is unavailable.</p>
                  )}
                />
              }
            />
          ) : (
            <p role={failed ? "alert" : "status"}>
              {failed
                ? "Preview access is unavailable. No new processing was started."
                : "Opening the prepared clip"}
            </p>
          )}
          {failed && (
            <Button
              variant="secondary"
              onClick={() => {
                setFailed(false);
                setReady(false);
                setPlaying(false);
                setFrame(0);
                setAttempt((value) => value + 1);
              }}
            >
              Retry preview access
            </Button>
          )}
        </div>
      }
      transcript={
        <section
          className={styles.momentTranscript}
          aria-label="Clip transcript"
        >
          <h2>Transcript</h2>
          <ReviewTranscript
            selectedWords={result.words}
            analysis={analysis}
            range={range}
            currentMs={range.startMs + Math.round((frame * 1000) / 30)}
            highlighted={highlighted}
          />
        </section>
      }
    />
  );
}
