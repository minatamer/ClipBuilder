import { useEffect, useState, useContext, useRef, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  ownerSourceFrame,
  ownerPresentationFrame,
  ownerHookFrames,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";
import { EditorHookClock } from "./editor-clock.ts";

function activeSourceVideo(
  container: HTMLElement | null | undefined,
  hook: OwnerHook | undefined,
  frame: number,
) {
  const part = hook && frame < ownerHookFrames({ hook }) ? "hook" : "body";
  return container?.querySelector<HTMLVideoElement>(
    `video[data-editor-video="${part}"]`,
  );
}

/** Keep playback ticks in controls, away from the parent Player's input props. */
export function useEditorPreview({
  player,
  available,
  attempt,
  frames,
  captureTarget,
}: {
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  frames: number;
  captureTarget: object;
}) {
  const hook = useContext(EditorHookClock);
  const [frame, setFrame] = useState(
    () => player.current?.getCurrentFrame() ?? 0,
  );
  const [playing, setPlaying] = useState(
    () => player.current?.isPlaying() ?? false,
  );
  const [ready, setReady] = useState(false);
  const capture = useRef<AbortController | null>(null);
  useEffect(() => {
    const current = player.current;
    if (!available || !current) return;
    const container = current.getContainerNode();
    const sync = () => {
      setFrame(current.getCurrentFrame());
      mediaReady();
    };
    const playingNow = () => {
      setPlaying(current.isPlaying());
      sync();
    };
    const seekedNow = () => {
      capture.current?.abort();
      sync();
    };
    const mediaReady = (event?: Event) => {
      const video = activeSourceVideo(
        container,
        hook,
        current.getCurrentFrame(),
      );
      if (event && event.target !== video) return;
      setReady(
        Boolean(
          video && video.readyState >= 2 && !video.seeking && !video.error,
        ),
      );
    };
    const waiting = (event: Event) => {
      if (
        event.target ===
        activeSourceVideo(container, hook, current.getCurrentFrame())
      )
        setReady(false);
    };
    for (const event of ["loadeddata", "seeked", "canplay"])
      container?.addEventListener(event, mediaReady, true);
    for (const event of ["seeking", "waiting", "emptied"])
      container?.addEventListener(event, waiting, true);
    current.addEventListener("frameupdate", sync);
    current.addEventListener("seeked", seekedNow);
    current.addEventListener("play", playingNow);
    current.addEventListener("pause", playingNow);
    current.addEventListener("ended", playingNow);
    mediaReady();
    playingNow();
    return () => {
      capture.current?.abort();
      current.removeEventListener("frameupdate", sync);
      current.removeEventListener("seeked", seekedNow);
      current.removeEventListener("play", playingNow);
      current.removeEventListener("pause", playingNow);
      current.removeEventListener("ended", playingNow);
      for (const event of ["loadeddata", "seeked", "canplay"])
        container?.removeEventListener(event, mediaReady, true);
      for (const event of ["seeking", "waiting", "emptied"])
        container?.removeEventListener(event, waiting, true);
    };
  }, [available, player, attempt, hook, frames, captureTarget]);

  return {
    frame: ownerSourceFrame({ hook }, frame),
    playing,
    captureReady: available && ready,
    captureFrame: async () => {
      const current = player.current;
      const container = current?.getContainerNode();
      const video =
        current &&
        activeSourceVideo(container, hook, current.getCurrentFrame());
      if (
        capture.current ||
        !available ||
        !current ||
        !container ||
        !video ||
        video.readyState < 2 ||
        video.seeking ||
        video.error
      )
        return null;
      current.pause();
      const presentation = current.getCurrentFrame();
      const at = ownerSourceFrame({ hook }, presentation);
      if (!Number.isInteger(at) || at < 0 || at >= frames) return null;
      // Separate media/player clocks can briefly drift during playback. Check
      // their alignment on capture rather than flashing disabled every tick.
      const controller = new AbortController();
      capture.current = controller;
      const aligned = () =>
        !controller.signal.aborted &&
        player.current?.getContainerNode() === container &&
        current.getCurrentFrame() === presentation &&
        activeSourceVideo(container, hook, current.getCurrentFrame()) ===
          video &&
        video.readyState >= 2 &&
        !video.seeking &&
        !video.error &&
        Math.abs(video.currentTime - at / OWNER_FPS) <= 1 / OWNER_FPS + 0.001;
      try {
        if (aligned()) return at;
        return await new Promise<number | null>((resolve) => {
          const finish = (value: number | null) => {
            clearTimeout(timer);
            video.removeEventListener("seeked", seeked);
            video.removeEventListener("loadeddata", seeked);
            video.removeEventListener("error", canceled);
            controller.signal.removeEventListener("abort", canceled);
            resolve(value);
          };
          const seeked = () => {
            if (aligned()) finish(at);
          };
          const canceled = () => finish(null);
          const timer = setTimeout(canceled, 1_000);
          video.addEventListener("seeked", seeked);
          video.addEventListener("loadeddata", seeked);
          video.addEventListener("error", canceled);
          controller.signal.addEventListener("abort", canceled, { once: true });
          try {
            video.currentTime = at / OWNER_FPS;
          } catch {
            canceled();
          }
        });
      } finally {
        if (capture.current === controller) capture.current = null;
      }
    },
    seekTo: (at: number) => {
      player.current?.pause();
      const presentation = ownerPresentationFrame({ hook }, at);
      player.current?.seekTo(presentation);
      setFrame(presentation);
    },
  };
}
