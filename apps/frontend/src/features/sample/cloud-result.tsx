"use client";
import { useEffect, useState } from "react";
import { Download, Share2 } from "lucide-react";
import type {
  FinalRenderResult,
  SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import type { SourceAnalysisApi } from "../source-analysis/source-analysis.api";
import { Button } from "../../shared/ui/button";
import { PortraitPlayer } from "./portrait-player";
import { useRangePlayback } from "./use-range-playback";
import { observeOutputPlayback } from "../render/output-playback";
import styles from "./sample.module.css";

export function CloudResult({
  result,
  assembly,
  api,
}: {
  result: FinalRenderResult;
  assembly: SelectedAssemblyResult;
  api: Pick<SourceAnalysisApi, "session" | "output">;
}) {
  const [expired, setExpired] = useState(false);
  const [access, setAccess] = useState(false),
    [decoded, setDecoded] = useState(false),
    [failed, setFailed] = useState(false),
    [requested, setRequested] = useState(false),
    [attempt, setAttempt] = useState(0);
  const durationMs =
    assembly.manifest.range.endMs - assembly.manifest.range.startMs;
  const range = { startMs: 0, endMs: durationMs };
  const playback = useRangePlayback(
    range,
    { timeMs: 0, play: false, ordinal: attempt },
    undefined,
    access ? "/api/analysis/output" : undefined,
  );
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(
      () => {
        controller.abort();
        if (active) {
          setAccess(false);
          setDecoded(false);
          setFailed(true);
          setExpired(true);
        }
      },
      Math.max(1, result.expiresAtMs - Date.now()),
    );
    void (async () => {
      const session = await api.session(controller.signal);
      if (
        session.sessionId !== result.binding.sessionId ||
        result.expiresAtMs <= Date.now()
      )
        throw new Error();
      const value = await api.output(result, controller.signal);
      if (value.expiresAtMs !== result.expiresAtMs) throw new Error();
      if (active && !controller.signal.aborted) setAccess(true);
    })().catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [api, result, attempt]);
  useEffect(() => {
    const video = playback.videoRef.current;
    if (!access || !video) return;
    return observeOutputPlayback(
      video,
      durationMs,
      () => setDecoded(true),
      () => {
        setDecoded(false);
        setFailed(true);
      },
    );
  }, [access, durationMs, playback.videoRef]);
  return (
    <section
      className={styles.exportLayout}
      aria-label="Clip delivery"
      tabIndex={0}
    >
      <div className={styles.exportVideo} data-output-delivery="true">
        <div className={styles.exportVideoFrame}>
          <PortraitPlayer
            label="Final MP4"
            range={range}
            currentMs={playback.currentMs}
            playing={playback.playing}
            toggle={playback.toggle}
            seek={playback.seek}
            videoRef={playback.videoRef}
            videoPreload="auto"
            muted={playback.muted}
            toggleMute={playback.toggleMute}
            busy={!access || !decoded || failed}
          />
        </div>
        <p>
          {durationMs / 1000} seconds · 1080 × 1920 · 30 fps · H.264/AAC MP4
        </p>
        <p>
          Available until {new Date(result.expiresAtMs).toLocaleTimeString()}.
          Source and preview copies have been deleted from temporary server
          storage. Clear media also removes this output; it cannot delete your
          downloaded copy.
        </p>
        {failed && (
          <p role="alert">
            {expired
              ? "The output download window has ended. Start over for a new clip."
              : "Output playback is unavailable. Retry access before the download window ends."}
          </p>
        )}
        {failed && (
          <Button
            variant="secondary"
            onClick={() => {
              setAccess(false);
              setDecoded(false);
              setFailed(false);
              setRequested(false);
              setAttempt((value) => value + 1);
            }}
            disabled={expired}
          >
            Retry output access
          </Button>
        )}
        <Button
          icon={Download}
          disabled={!access || !decoded || failed}
          onClick={() => {
            if (Date.now() >= result.expiresAtMs) {
              setDecoded(false);
              setFailed(true);
              return;
            }
            const link = document.createElement("a");
            link.href = "/api/analysis/download";
            link.download = "clipbuilder.mp4";
            document.body.append(link);
            link.click();
            link.remove();
            setRequested(true);
          }}
        >
          Download MP4
        </Button>
        <p role="status">
          {expired
            ? "Output access has expired."
            : failed
              ? "Playback verification failed. Download is unavailable."
              : requested
                ? "Download requested. Check your browser for progress or failure; you can retry while the output is available."
                : decoded
                  ? "Playback verified. Your MP4 is ready to download."
                  : "Verifying output playback before download."}
        </p>
        <section
          className={styles.outputTranscript}
          aria-label="Final clip transcript"
        >
          <h2>Transcript</h2>
          <p dir="auto">
            {assembly.words.map((word) => word.punctuatedText).join(" ")}
          </p>
        </section>
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
}
