"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowLeft,
  Film,
  LoaderCircle,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { IconButton } from "../../shared/ui/button";
import { timecode } from "./candidate.evidence";
import { PlaybackControls } from "./playback-controls";
import styles from "./sample.module.css";

export function PortraitPlaceholder({
  children,
  dimensions = { width: 1080, height: 1920 },
}: {
  children?: ReactNode;
  dimensions?: { width: number; height: number };
}) {
  const ratio = dimensions.width / dimensions.height;
  return (
    <div className={styles.momentSurface}>
      <div className={styles.placeholderContent}>
        <Film size={28} aria-hidden="true" />
        <span className={styles.resolution}>
          {ratio === 9 / 16
            ? "9:16"
            : ratio > 1
              ? "Landscape"
              : ratio === 1
                ? "1:1"
                : "Portrait"}
        </span>
        <span className={styles.placeholderLabel}>Video placeholder</span>
        <span className={styles.placeholderResolution}>
          {dimensions.width} x {dimensions.height}
        </span>
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
  loading = false,
  moment,
  onClose,
  onKeyDown,
  children,
  videoRef,
  surface,
  videoPreload = "metadata",
  volume = 1,
  setVolume,
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
  loading?: boolean;
  moment?: { id: string; rank: number };
  onClose?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  videoRef?: RefObject<HTMLVideoElement | null>;
  surface?: ReactNode;
  videoPreload?: "metadata" | "auto";
  volume?: number;
  setVolume?: (volume: number) => void;
  aspectRatio?: number;
  source?: boolean;
  durationKnown?: boolean;
}) {
  const controlsId = useId();
  const volumeId = useId();
  const volumeControl = useRef<HTMLDivElement>(null);
  const volumeInput = useRef<HTMLInputElement>(null);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [seekingFocused, setSeekingFocused] = useState(false);
  const controls = useRef<PlaybackControls | null>(null);
  useEffect(() => {
    const controller = new PlaybackControls(setControlsVisible);
    controls.current = controller;
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const configure = () => controller.update({ mouse: hover.matches });
    configure();
    hover.addEventListener("change", configure);
    return () => {
      hover.removeEventListener("change", configure);
      controller.dispose();
      controls.current = null;
    };
  }, []);
  useEffect(() => {
    controls.current?.update({
      playing,
      busy,
      locked: keyboardFocused || seekingFocused || volumeOpen,
    });
  }, [playing, busy, keyboardFocused, seekingFocused, volumeOpen]);
  useEffect(() => {
    if (!volumeOpen) return;
    volumeInput.current?.focus({ preventScroll: true });
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !volumeControl.current?.contains(event.target)
      )
        setVolumeOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [volumeOpen]);
  const reveal = () => {
    controls.current?.interact();
  };
  const videoSurface =
    surface ??
    (videoRef ? (
      <video
        ref={videoRef}
        className={styles.localVideo}
        playsInline
        preload={videoPreload}
        muted={volume === 0}
        aria-label={label}
      />
    ) : (
      <PortraitPlaceholder>{children}</PortraitPlaceholder>
    ));
  const loadingIndicator = loading ? (
    <div className={styles.playerLoading} role="status">
      <LoaderCircle className={styles.playerSpinner} aria-hidden="true" />
      <span>Loading video…</span>
    </div>
  ) : null;
  return (
    <div
      className={`${styles.portraitPlayer} ${source ? styles.sourcePlayer : ""}`}
      aria-label={label}
      data-controls-visible={controlsVisible}
      data-moment-surface={moment?.id}
      style={{
        ...(source && aspectRatio
          ? {
              width: moment
                ? `min(100%, calc((100cqh - 6.5rem) * ${aspectRatio}))`
                : `min(100%, calc(40dvh * ${aspectRatio}))`,
            }
          : aspectRatio
            ? { aspectRatio, width: `min(100%, calc(100cqh * ${aspectRatio}))` }
            : {}),
      }}
      onPointerEnter={(event) => controls.current?.enter(event.pointerType)}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") controls.current?.enter("mouse");
      }}
      onPointerDownCapture={(event) => {
        setKeyboardFocused(false);
        controls.current?.update({ mouse: event.pointerType === "mouse" });
        reveal();
      }}
      onPointerLeave={(event) => controls.current?.leave(event.pointerType)}
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
          {loadingIndicator}
        </div>
      ) : (
        <>
          {videoSurface}
          {loadingIndicator}
        </>
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
          {setVolume && (
            <div
              ref={volumeControl}
              className={styles.volumeControl}
              onBlur={(event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
                  !event.currentTarget.contains(event.relatedTarget)
                )
                  setVolumeOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Escape" || !volumeOpen) return;
                event.stopPropagation();
                setVolumeOpen(false);
                volumeControl.current?.querySelector("button")?.focus();
              }}
            >
              <IconButton
                icon={volume === 0 ? VolumeX : Volume2}
                label={`Adjust ${source ? "source" : "clip"} volume`}
                aria-expanded={volumeOpen}
                aria-controls={volumeId}
                disabled={busy}
                onClick={() => setVolumeOpen((open) => !open)}
              />
              {volumeOpen && (
                <div id={volumeId} className={styles.volumePanel}>
                  <label htmlFor={`${volumeId}-level`}>Volume</label>
                  <output aria-live="off">{Math.round(volume * 100)}%</output>
                  <input
                    ref={volumeInput}
                    id={`${volumeId}-level`}
                    aria-label={`${source ? "Source" : "Clip"} volume`}
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(volume * 100)}
                    aria-valuetext={`${Math.round(volume * 100)} percent`}
                    disabled={busy}
                    onChange={(event) =>
                      setVolume(Number(event.target.value) / 100)
                    }
                  />
                </div>
              )}
            </div>
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
