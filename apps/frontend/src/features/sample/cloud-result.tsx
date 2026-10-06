"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type {
  FinalRenderResult,
  SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import type { SourceAnalysisApi } from "../source-analysis/source-analysis.api";
import { Button } from "../../shared/ui/button";
import { PortraitPlayer } from "./portrait-player";
import { useRangePlayback } from "./use-range-playback";
import { observeOutputPlayback } from "../render/output-playback";
import { ClipDeliveryActions, SocialDestinations } from "./clip-delivery";
import styles from "./sample.module.css";

export function CloudResult({
  result,
  assembly,
  api,
  deliveryFooter,
}: {
  result: FinalRenderResult;
  assembly: SelectedAssemblyResult;
  api: Pick<SourceAnalysisApi, "session" | "output">;
  deliveryFooter?: HTMLElement | null;
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
      <div className={styles.exportVideo}>
        <div className={styles.exportVideoFrame}>
          <PortraitPlayer
            label="Final MP4"
            range={range}
            currentMs={playback.currentMs}
            playing={playback.playing}
            loading={!failed && (!access || playback.loading)}
            toggle={playback.toggle}
            seek={playback.seek}
            videoRef={playback.videoRef}
            videoPreload="auto"
            volume={playback.volume}
            setVolume={playback.setVolume}
            busy={!access || !decoded || failed}
          />
        </div>
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
        <ClipDeliveryActions target={deliveryFooter}>
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
        </ClipDeliveryActions>
        <p role="status" className={styles.screenReaderText}>
          {expired
            ? "Output access has expired."
            : failed
              ? "Playback verification failed. Download is unavailable."
              : requested
                ? "Download requested. Check your browser for progress or failure; you can retry while the output is available."
                : decoded
                  ? "Download available."
                  : "Verifying output playback before download."}
        </p>
      </div>
      <SocialDestinations />
    </section>
  );
}
