"use client";

import { useEffect, useState } from "react";
import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import { useSessionEffects } from "../session/session.provider";
import { PortraitPlayer } from "./portrait-player";
import { useRangePlayback } from "./use-range-playback";
import styles from "./sample.module.css";

export function SourcePreview({
  sourceUrl,
  durationMs,
}: {
  sourceUrl: string;
  durationMs?: number;
}) {
  const [actualDuration, setActualDuration] = useState<number>();
  const effects = useSessionEffects();
  const range = {
    startMs: 0,
    endMs:
      durationMs ?? actualDuration ?? PUBLIC_LIMITS.maxSourceSeconds * 1000,
  };
  const playback = useRangePlayback(
    range,
    { timeMs: 0, play: false, ordinal: 0 },
    undefined,
    sourceUrl,
  );
  useEffect(() => {
    const video = playback.videoRef.current;
    if (!video || durationMs !== undefined) return;
    const update = () => {
      if (Number.isFinite(video.duration) && video.duration > 0)
        setActualDuration(Math.ceil(video.duration * 1000));
    };
    video.addEventListener("loadedmetadata", update);
    update();
    const cleanup = () => video.removeEventListener("loadedmetadata", update);
    return effects ? effects.registerStopper(cleanup) : cleanup;
  }, [sourceUrl, durationMs, effects, playback.videoRef]);
  return (
    <section className={styles.sourcePreview} aria-label="Local source preview">
      <PortraitPlayer label="Source video" range={range} {...playback} />
    </section>
  );
}
