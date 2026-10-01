"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

export type PreviewCommand = { timeMs: number; play: boolean; ordinal: number };

export function useRangePlayback(
  range: { startMs: number; endMs: number },
  command: PreviewCommand,
  onPosition?: (clipTimeMs: number) => void,
) {
  const initial = Math.max(
    range.startMs,
    Math.min(range.endMs, command.timeMs),
  );
  const position = useRef(initial);
  const [currentMs, setCurrentMs] = useState(initial);
  const [playing, setPlaying] = useState(command.play);
  const reportPosition = useEffectEvent((sourceMs: number) =>
    onPosition?.(Math.round(sourceMs - range.startMs)),
  );
  useEffect(() => {
    if (!playing) return;
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
  }, [playing, range.endMs]);
  const seek = (value: number) => {
    position.current = Math.max(range.startMs, Math.min(range.endMs, value));
    setCurrentMs(position.current);
    onPosition?.(Math.round(position.current - range.startMs));
  };
  const toggle = () => {
    if (currentMs >= range.endMs) seek(range.startMs);
    onPosition?.(Math.round(position.current - range.startMs));
    setPlaying(!playing);
  };
  return { currentMs, playing, seek, toggle, pause: () => setPlaying(false) };
}
