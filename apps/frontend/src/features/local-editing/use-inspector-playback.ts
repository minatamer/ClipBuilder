import { useEffect, useEffectEvent, type RefObject } from "react";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";

function synchronizeInspector(
  video: HTMLVideoElement | null,
  frame: number,
  playing: boolean,
) {
  if (!video || !Number.isFinite(video.duration)) return;
  const target = Math.max(0, Math.min(video.duration, frame / OWNER_FPS));
  if (!playing) {
    video.pause();
    if (!video.seeking && Math.abs(video.currentTime - target) > 0.04)
      video.currentTime = target;
    return;
  }
  if (!video.seeking && Math.abs(video.currentTime - target) > 0.2)
    video.currentTime = target;
  if (video.paused) void video.play().catch(() => {});
}

/** The source inspector plays normally; Player ticks are not seek commands. */
export function useInspectorPlayback(
  media: RefObject<HTMLVideoElement | null>,
  sourceUrl: string,
  frame: number,
  playing: boolean,
) {
  const synchronize = useEffectEvent(() => {
    // Allow normal decoder/tick skew. Only a real jump, Hook boundary or drift
    // resynchronizes the inspector; the main preview owns the playback clock.
    synchronizeInspector(media.current, frame, playing);
  });
  useEffect(() => {
    synchronize();
  }, [frame, playing, sourceUrl]);
  useEffect(() => {
    const video = media.current;
    if (!video) return;
    const loaded = () => synchronize();
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("seeked", loaded);
    return () => {
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("seeked", loaded);
      video.pause();
    };
  }, [media, sourceUrl]);
}
