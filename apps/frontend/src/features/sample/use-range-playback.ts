"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useSessionEffects } from "../session/session.provider";
import {
  attachNativeRangePlayback,
  playbackPosition,
} from "./native-range-playback";

export type PreviewCommand = { timeMs: number; play: boolean; ordinal: number };

export function useRangePlayback(
  range: { startMs: number; endMs: number },
  command: PreviewCommand,
  onPosition?: (clipTimeMs: number) => void,
  sourceUrl?: string,
) {
  const initial = playbackPosition(command.timeMs, range);
  const position = useRef(initial);
  const [currentMs, setCurrentMs] = useState(initial);
  const [playing, setPlaying] = useState(command.play);
  const [loading, setLoading] = useState(Boolean(sourceUrl));
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const effects = useSessionEffects();
  const reportPosition = useEffectEvent((sourceMs: number) =>
    onPosition?.(Math.round(sourceMs - range.startMs)),
  );
  useEffect(() => {
    const video = videoRef.current;
    if (!sourceUrl || !video) return;
    video.volume = volume;
    video.muted = volume === 0;
  }, [sourceUrl, volume]);
  useEffect(() => {
    const video = videoRef.current;
    if (!sourceUrl || !video) return;
    const changed = () => setVolume(video.muted ? 0 : video.volume);
    video.addEventListener("volumechange", changed);
    return () => video.removeEventListener("volumechange", changed);
  }, [sourceUrl]);
  useEffect(() => {
    if (!playing || sourceUrl) return;
    let last = performance.now();
    let lastReport = last;
    const timer = setInterval(() => {
      const now = performance.now();
      position.current = Math.min(range.endMs, position.current + now - last);
      last = now;
      setCurrentMs(position.current);
      if (now - lastReport >= 1000 || position.current >= range.endMs) {
        reportPosition(position.current);
        lastReport = now;
      }
      if (position.current >= range.endMs) setPlaying(false);
    }, 80);
    return () => clearInterval(timer);
  }, [playing, range.endMs, sourceUrl]);
  useEffect(() => {
    const video = videoRef.current;
    if (!sourceUrl || !video) return;
    const cleanup = attachNativeRangePlayback(
      video,
      sourceUrl,
      { startMs: range.startMs, endMs: range.endMs },
      initial,
      command.play,
      (value) => {
        position.current = value;
        setCurrentMs(value);
        reportPosition(value);
      },
      setPlaying,
      setLoading,
    );
    return effects ? effects.registerStopper(cleanup) : cleanup;
  }, [
    sourceUrl,
    range.startMs,
    range.endMs,
    command.ordinal,
    command.play,
    initial,
    effects,
  ]);
  const seek = (value: number) => {
    position.current = playbackPosition(value, range);
    setCurrentMs(position.current);
    if (sourceUrl && videoRef.current)
      videoRef.current.currentTime = position.current / 1000;
    onPosition?.(Math.round(position.current - range.startMs));
  };
  const toggle = () => {
    if (currentMs >= range.endMs) seek(range.startMs);
    onPosition?.(Math.round(position.current - range.startMs));
    if (sourceUrl && videoRef.current) {
      if (videoRef.current.paused)
        void videoRef.current.play().catch(() => setPlaying(false));
      else videoRef.current.pause();
    } else setPlaying(!playing);
  };
  return {
    currentMs,
    playing,
    loading: Boolean(sourceUrl) && loading,
    volume,
    setVolume,
    seek,
    toggle,
    videoRef,
    pause: () => {
      videoRef.current?.pause();
      setPlaying(false);
    },
  };
}
