import { useEffect, useState, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";

/** Keep playback ticks in controls, away from the parent Player's input props. */
export function useEditorPreview({
  player,
  available,
  attempt,
  frames,
}: {
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  frames: number;
}) {
  const [frame, setFrame] = useState(
    () => player.current?.getCurrentFrame() ?? 0,
  );
  const [playing, setPlaying] = useState(
    () => player.current?.isPlaying() ?? false,
  );
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const current = player.current;
    if (!available || !current) return;
    const video = current.getContainerNode()?.querySelector("video");
    const sync = () => {
      setFrame(current.getCurrentFrame());
      mediaReady();
    };
    const playingNow = () => {
      setPlaying(current.isPlaying());
      sync();
    };
    const mediaReady = () =>
      setReady(
        Boolean(
          video &&
          video.readyState >= 2 &&
          !video.seeking &&
          !video.error &&
          Math.abs(video.currentTime - current.getCurrentFrame() / OWNER_FPS) <=
            1 / OWNER_FPS + 0.001,
        ),
      );
    const waiting = () => setReady(false);
    for (const event of ["loadeddata", "seeked", "canplay"])
      video?.addEventListener(event, mediaReady);
    for (const event of ["seeking", "waiting", "emptied"])
      video?.addEventListener(event, waiting);
    current.addEventListener("frameupdate", sync);
    current.addEventListener("seeked", sync);
    current.addEventListener("play", playingNow);
    current.addEventListener("pause", playingNow);
    current.addEventListener("ended", playingNow);
    mediaReady();
    playingNow();
    return () => {
      current.removeEventListener("frameupdate", sync);
      current.removeEventListener("seeked", sync);
      current.removeEventListener("play", playingNow);
      current.removeEventListener("pause", playingNow);
      current.removeEventListener("ended", playingNow);
      for (const event of ["loadeddata", "seeked", "canplay"])
        video?.removeEventListener(event, mediaReady);
      for (const event of ["seeking", "waiting", "emptied"])
        video?.removeEventListener(event, waiting);
    };
  }, [available, player, attempt]);

  return {
    frame,
    playing,
    captureReady: available && ready,
    captureFrame: () => {
      const current = player.current;
      const video = current?.getContainerNode()?.querySelector("video");
      if (
        !available ||
        !current ||
        !video ||
        video.readyState < 2 ||
        video.seeking ||
        video.error
      )
        return null;
      current.pause();
      const at = current.getCurrentFrame();
      return Number.isInteger(at) &&
        at >= 0 &&
        at < frames &&
        Math.abs(video.currentTime - at / OWNER_FPS) <= 1 / OWNER_FPS + 0.001
        ? at
        : null;
    },
    seekTo: (at: number) => {
      player.current?.pause();
      player.current?.seekTo(at);
      setFrame(at);
    },
  };
}
