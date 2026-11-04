import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Html5Video, useVideoConfig, type OnVideoFrame } from "remotion";
import {
  ownerCameraCropAt,
  type OwnerCameraEffect,
} from "../../../../../packages/contracts/local/camera-motion.ts";
import type { OwnerCameraTrack } from "../../../../../packages/contracts/local/camera-follow.ts";
import type { OwnerFocus } from "../../../../../packages/contracts/local/focus.ts";

const NO_EFFECTS: readonly OwnerCameraEffect[] = [];
const NO_TRACKS: readonly OwnerCameraTrack[] = [];

/** A camera cut belongs to the presented video frame, not the independent Player tick. */
export function CameraPreviewVideo({
  sourceUrl,
  kind,
  active,
  start,
  end,
  focus,
  effects = NO_EFFECTS,
  tracks = NO_TRACKS,
  volume,
  onPreviewReady,
  onPlaybackError,
}: {
  sourceUrl: string;
  kind: "hook" | "body";
  active: boolean;
  start: number;
  end: number;
  focus: OwnerFocus | undefined;
  effects: readonly OwnerCameraEffect[] | undefined;
  tracks: readonly OwnerCameraTrack[] | undefined;
  volume: number;
  onPreviewReady: () => void;
  onPlaybackError: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const presented = useRef<number | null>(null);
  const { fps } = useVideoConfig();
  const draw = useCallback(
    (node: HTMLVideoElement, time: number) => {
      if (
        !focus ||
        !Number.isFinite(time) ||
        video.current !== node ||
        !node.isConnected
      )
        return;
      const frame = Math.max(
        0,
        Math.min(focus.frames - 1, Math.round(time * fps)),
      );
      const crop = ownerCameraCropAt(
        focus,
        effects,
        frame,
        kind,
        frame - start,
        tracks,
      );
      node.style.setProperty(
        "--camera-width",
        `${(1080 * 1080) / crop.width}px`,
      );
      node.style.setProperty(
        "--camera-height",
        `${(1920 * 1920) / crop.height}px`,
      );
      node.style.setProperty(
        "--camera-left",
        `${(-crop.x * 1080) / crop.width}px`,
      );
      node.style.setProperty(
        "--camera-top",
        `${(-crop.y * 1920) / crop.height}px`,
      );
    },
    [focus, effects, tracks, kind, start, fps],
  );
  const onVideoFrame = useCallback<OnVideoFrame>(
    (frame, _now, metadata) => {
      if (!(frame instanceof HTMLVideoElement) || video.current !== frame)
        return;
      if (metadata) presented.current = metadata.mediaTime;
      else if (frame.seeking) return;
      draw(frame, presented.current ?? frame.currentTime);
    },
    [draw],
  );

  useLayoutEffect(() => {
    presented.current = null;
  }, [sourceUrl]);

  useLayoutEffect(() => {
    const node = video.current;
    if (node) draw(node, presented.current ?? node.currentTime);
  }, [draw]);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    let animation = 0,
      disposed = false;
    const hasFrameCallback =
      typeof node.requestVideoFrameCallback === "function";
    const stop = () => {
      cancelAnimationFrame(animation);
      animation = 0;
    };
    const tick = () => {
      if (disposed || video.current !== node) return;
      if (!node.seeking && node.readyState >= 2) {
        presented.current = node.currentTime;
        draw(node, node.currentTime);
      }
      if (!node.paused && !node.ended) animation = requestAnimationFrame(tick);
      else animation = 0;
    };
    const play = () => {
      if (!hasFrameCallback && !animation)
        animation = requestAnimationFrame(tick);
    };
    const settled = () => {
      if (node.seeking || node.readyState < 2) return;
      presented.current = node.currentTime;
      draw(node, node.currentTime);
    };
    const empty = () => {
      presented.current = null;
      stop();
    };
    node.addEventListener("loadeddata", settled);
    node.addEventListener("seeked", settled);
    node.addEventListener("emptied", empty);
    node.addEventListener("play", play);
    node.addEventListener("pause", stop);
    node.addEventListener("ended", stop);
    play();
    return () => {
      disposed = true;
      stop();
      node.removeEventListener("loadeddata", settled);
      node.removeEventListener("seeked", settled);
      node.removeEventListener("emptied", empty);
      node.removeEventListener("play", play);
      node.removeEventListener("pause", stop);
      node.removeEventListener("ended", stop);
    };
  }, [draw, sourceUrl]);

  const style = useMemo(() => {
    if (!focus)
      return { width: "100%", height: "100%", objectFit: "contain" as const };
    const crop = ownerCameraCropAt(focus, effects, start, kind, 0, tracks);
    return {
      position: "absolute" as const,
      width: `var(--camera-width, ${(1080 * 1080) / crop.width}px)`,
      height: `var(--camera-height, ${(1920 * 1920) / crop.height}px)`,
      maxWidth: "none",
      left: `var(--camera-left, ${(-crop.x * 1080) / crop.width}px)`,
      top: `var(--camera-top, ${(-crop.y * 1920) / crop.height}px)`,
    };
  }, [focus, effects, tracks, kind, start]);

  return (
    <Html5Video
      key={sourceUrl}
      ref={video}
      data-editor-video={kind}
      data-editor-active={active}
      src={sourceUrl}
      preload="auto"
      volume={volume}
      trimBefore={start}
      trimAfter={end}
      style={style}
      onVideoFrame={onVideoFrame}
      pauseWhenBuffering
      onLoadedData={onPreviewReady}
      onErrorCapture={(event) => {
        event.stopPropagation();
        onPlaybackError();
      }}
      onError={onPlaybackError}
    />
  );
}
