"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { ClipComposition } from "@clipbuilder/composition";
import type {
  AnalysisBundleV1,
  SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import type { SourceAnalysisApi } from "../source-analysis/source-analysis.api";
import { PortraitPlayer } from "./portrait-player";
import { AgenticNotes } from "./agentic-notes";
import { ReviewTranscript } from "./review-transcript";
import { ClipReviewLayout } from "./clip-review-layout";
import {
  fixedReviewNotes,
  previewFrame,
  reviewInterestNotes,
} from "./fixed-review";
import { Button } from "../../shared/ui/button";
import styles from "./sample.module.css";
import { PreviewPlaybackTrace } from "./preview-playback.diagnostics";

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
  const mediaHost = useRef<HTMLDivElement>(null);
  const trace = useRef<PreviewPlaybackTrace | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0),
    [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0),
    [volume, setVolume] = useState(1);
  const [highlighted, setHighlighted] = useState<readonly string[]>([]);
  const range = result.manifest.range,
    duration = range.endMs - range.startMs;
  const inputProps = useMemo(
    () => ({ manifest: result.manifest, sourceUrl: "/api/analysis/preview" }),
    [result.manifest],
  );
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
    const diagnostics = new PreviewPlaybackTrace(
      crypto.randomUUID(),
      {
        captions: result.manifest.captions.length,
        cards:
          result.manifest.cards.length +
          (result.manifest.pictures?.length ?? 0),
        matched: result.manifest.focus.filter((s) => s.mode === "speaker")
          .length,
        held: result.manifest.focus.filter((s) => s.mode === "held").length,
        wide: result.manifest.focus.filter((s) => s.mode === "wide").length,
      },
      (record) => {
        // eslint-disable-next-line no-console -- Bounded content-free playback counters.
        console.info("clip-preview", record);
      },
    );
    trace.current = diagnostics;
    const waiting = () => {
      setBuffering(true);
      diagnostics.event("buffering");
    };
    const resume = () => {
      setBuffering(false);
      diagnostics.event("resumed");
    };
    const host = mediaHost.current;
    let observed: HTMLVideoElement | null = null,
      callback: number | undefined,
      presentedMs: number | undefined;
    const decoded = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      presentedMs = metadata.mediaTime * 1000;
      callback = observed?.requestVideoFrameCallback(decoded);
    };
    const seeking = () => diagnostics.seeking();
    host?.addEventListener("seeking", seeking, true);
    const sample = setInterval(() => {
      const video = host?.querySelector("video");
      if (video !== observed) {
        if (callback !== undefined)
          observed?.cancelVideoFrameCallback(callback);
        observed = video ?? null;
        presentedMs = undefined;
        callback = observed?.requestVideoFrameCallback?.(decoded);
      }
      if (video && current.isPlaying())
        diagnostics.sample(
          current.getCurrentFrame(),
          presentedMs ?? video.currentTime * 1000,
          result.manifest.output.fps,
        );
      const clockMs =
        (current.getCurrentFrame() * 1000) / result.manifest.output.fps;
      const visual = [
        ...result.manifest.cards,
        ...(result.manifest.pictures ?? []),
      ].findIndex((card) => card.startMs <= clockMs && clockMs < card.endMs);
      if (visual >= 0 && host?.querySelector('[role="img"], img'))
        diagnostics.visualShown(visual);
    }, 250);
    const traceExpiry = setTimeout(() => {
      clearInterval(sample);
      if (callback !== undefined) observed?.cancelVideoFrameCallback(callback);
      diagnostics.close();
    }, 120_000);
    const position = (event: { detail: { frame: number } }) =>
      setFrame(event.detail.frame);
    const play = () => setPlaying(true),
      pause = () => setPlaying(false);
    const ended = () => {
      pause();
      diagnostics.event("ended");
    };
    const volumeChanged = () =>
      setVolume(current.isMuted() ? 0 : current.getVolume());
    const error = () => {
      diagnostics.event("failed");
      current.pause();
      setFailed(true);
      setReady(false);
    };
    current.addEventListener("frameupdate", position);
    current.addEventListener("play", play);
    current.addEventListener("pause", pause);
    current.addEventListener("ended", ended);
    current.addEventListener("error", error);
    current.addEventListener("volumechange", volumeChanged);
    current.addEventListener("mutechange", volumeChanged);
    current.addEventListener("waiting", waiting);
    current.addEventListener("resume", resume);
    return () => {
      current.pause();
      current.removeEventListener("frameupdate", position);
      current.removeEventListener("play", play);
      current.removeEventListener("pause", pause);
      current.removeEventListener("ended", ended);
      current.removeEventListener("error", error);
      current.removeEventListener("volumechange", volumeChanged);
      current.removeEventListener("mutechange", volumeChanged);
      current.removeEventListener("waiting", waiting);
      current.removeEventListener("resume", resume);
      host?.removeEventListener("seeking", seeking, true);
      clearInterval(sample);
      clearTimeout(traceExpiry);
      if (callback !== undefined) observed?.cancelVideoFrameCallback(callback);
      diagnostics.close();
      trace.current = null;
    };
  }, [ready, result]);
  const seek = (sourceMs: number) => {
    trace.current?.userSeek();
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
              notes={reviewInterestNotes(analysis, selected)}
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
        <div className={styles.reviewVideo} ref={mediaHost}>
          {ready ? (
            <PortraitPlayer
              label={selected.title}
              range={range}
              currentMs={
                range.startMs +
                Math.min(duration, Math.round((frame * 1000) / 30))
              }
              playing={playing}
              loading={buffering}
              volume={volume}
              setVolume={(level) => {
                player.current?.setVolume(level);
                if (level === 0) player.current?.mute();
                else player.current?.unmute();
                setVolume(level);
              }}
              toggle={() => {
                if (playing) player.current?.pause();
                else {
                  if (
                    player.current?.getCurrentFrame() ===
                    Math.ceil((duration * 30) / 1000) - 1
                  ) {
                    trace.current?.userSeek();
                    player.current.seekTo(0);
                  }
                  player.current?.play();
                }
              }}
              seek={(ms) => {
                setHighlighted([]);
                seek(ms);
              }}
              surface={
                <Player
                  ref={player}
                  component={ClipComposition}
                  inputProps={inputProps}
                  durationInFrames={Math.ceil((duration * 30) / 1000)}
                  fps={30}
                  compositionWidth={1080}
                  compositionHeight={1920}
                  controls={false}
                  moveToBeginningWhenEnded={false}
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
