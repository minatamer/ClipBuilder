"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowLeft, Film, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "../../shared/ui/button";
import { timecode } from "./candidate.evidence";
import styles from "./sample.module.css";

export function PortraitPlaceholder({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.momentSurface}>
      <div className={styles.placeholderContent}>
        <Film size={28} aria-hidden="true" />
        <span className={styles.resolution}>9:16</span>
        <span className={styles.placeholderLabel}>Video placeholder</span>
        <span className={styles.placeholderResolution}>1080 x 1920</span>
      </div>
      {children}
    </div>
  );
}

export function PortraitPlayer({
  label,
  range,
  currentMs,
  playing,
  toggle,
  seek,
  busy = false,
  moment,
  onClose,
  onKeyDown,
  children,
  videoRef,
  surface,
  videoPreload = "metadata",
  muted = false,
  toggleMute,
  aspectRatio,
  source = false,
  durationKnown = true,
}: {
  label: string;
  range: { startMs: number; endMs: number };
  currentMs: number;
  playing: boolean;
  toggle: () => void;
  seek: (timeMs: number) => void;
  busy?: boolean;
  moment?: { id: string; rank: number };
  onClose?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  videoRef?: RefObject<HTMLVideoElement | null>;
  surface?: ReactNode;
  videoPreload?: "metadata" | "auto";
  muted?: boolean;
  toggleMute?: () => void;
  aspectRatio?: number;
  source?: boolean;
  durationKnown?: boolean;
}) {
  const controlsId = useId();
  const [awake, setAwake] = useState(true);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [seekingFocused, setSeekingFocused] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopHide = useCallback(() => {
    if (idleTimer.current !== null) clearTimeout(idleTimer.current);
    idleTimer.current = null;
  }, []);
  const scheduleHide = useCallback(() => {
    stopHide();
    if (source || !playing || busy || keyboardFocused || seekingFocused) return;
    idleTimer.current = setTimeout(() => {
      idleTimer.current = null;
      setAwake(false);
    }, 2200);
  }, [source, playing, busy, keyboardFocused, seekingFocused, stopHide]);
  useEffect(() => {
    scheduleHide();
    return stopHide;
  }, [scheduleHide, stopHide]);
  const reveal = () => {
    setAwake(true);
    scheduleHide();
  };
  const controlsVisible =
    source || !playing || busy || awake || keyboardFocused || seekingFocused;
  const videoSurface =
    surface ??
    (videoRef ? (
      <video
        ref={videoRef}
        className={styles.localVideo}
        playsInline
        preload={videoPreload}
        muted={muted}
        aria-label={label}
      />
    ) : (
      <PortraitPlaceholder>{children}</PortraitPlaceholder>
    ));
  return (
    <div
      className={`${styles.portraitPlayer} ${source ? styles.sourcePlayer : ""}`}
      aria-label={label}
      data-controls-visible={controlsVisible}
      data-moment-surface={moment?.id}
      style={{
        ...(source && aspectRatio
          ? { width: `min(100%, calc(40dvh * ${aspectRatio}))` }
          : aspectRatio
            ? { aspectRatio, width: `min(100%, calc(100cqh * ${aspectRatio}))` }
            : {}),
      }}
      onPointerEnter={reveal}
      onPointerMove={reveal}
      onPointerDownCapture={() => {
        setKeyboardFocused(false);
        reveal();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        stopHide();
        setAwake(false);
      }}
      onFocusCapture={(event) => {
        setKeyboardFocused(event.target.matches(":focus-visible"));
        reveal();
      }}
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof HTMLElement) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setKeyboardFocused(false);
      }}
      onKeyDownCapture={() => {
        setKeyboardFocused(true);
        reveal();
      }}
    >
      {source ? (
        <div className={styles.sourceMedia} style={{ aspectRatio }}>
          {videoSurface}
        </div>
      ) : (
        videoSurface
      )}
      <button
        type="button"
        className={styles.playerReveal}
        aria-label="Show playback controls"
        aria-controls={controlsId}
        disabled={busy}
        onClick={reveal}
      />
      {onClose && (
        <div className={styles.playerBack}>
          <IconButton
            icon={ArrowLeft}
            label="Back to moments"
            onClick={onClose}
            disabled={busy}
          />
        </div>
      )}
      <div id={controlsId} className={styles.inlinePlayback}>
        <div className={styles.playerCommands}>
          <IconButton
            icon={playing ? Pause : Play}
            label={`${playing ? "Pause" : "Play"} ${moment ? `moment ${moment.rank} preview` : source ? "source video" : "clip preview"}`}
            {...(moment ? { id: `moment-play-${moment.rank}` } : {})}
            disabled={busy || !durationKnown}
            onClick={toggle}
            {...(onKeyDown ? { onKeyDown } : {})}
          />
          {toggleMute && (
            <IconButton
              icon={muted ? VolumeX : Volume2}
              label={
                muted
                  ? `Unmute ${source ? "source" : "clip"} audio`
                  : `Mute ${source ? "source" : "clip"} audio`
              }
              disabled={busy}
              onClick={toggleMute}
            />
          )}
          <output data-playback-time aria-live="off" aria-label="Playback time">
            {timecode(currentMs - range.startMs)} /{" "}
            {durationKnown ? timecode(range.endMs - range.startMs) : "--:--"}
          </output>
        </div>
        <input
          aria-label={
            moment
              ? "Moment playback position"
              : source
                ? "Source playback position"
                : "Clip playback position"
          }
          type="range"
          min={range.startMs}
          max={range.endMs}
          step={1}
          value={Math.round(currentMs)}
          aria-valuetext={
            durationKnown
              ? `${timecode(currentMs - range.startMs)} of ${timecode(range.endMs - range.startMs)}`
              : "Loading video duration"
          }
          disabled={busy || !durationKnown}
          onFocus={() => setSeekingFocused(true)}
          onBlur={() => setSeekingFocused(false)}
          onChange={(event) => {
            reveal();
            seek(Number(event.target.value));
          }}
        />
      </div>
    </div>
  );
}
