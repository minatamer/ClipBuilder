import { useEffect, useState, useContext, useRef, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  ownerSourceFrame,
  ownerHookFrames,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";
import { ownerOccurrencePresentationFrame } from "../../../../../packages/contracts/local/hook-content.ts";
import { EditorOccurrence, EditorHookClock } from "./editor-clock.ts";
import { noteEditorPreview } from "../diagnostics/editor-lifecycle";

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
  presentationClock = false,
  occurrenceClock = false,
}: {
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  frames: number;
  captureTarget: object;
  presentationClock?: boolean;
  occurrenceClock?: boolean;
}) {
  const hook = useContext(EditorHookClock);
  const occurrence = useContext(EditorOccurrence);
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
    noteEditorPreview("subscribe");
    const container = current.getContainerNode();
    const sync = () => {
      noteEditorPreview("frame");
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
      noteEditorPreview("media-ready");
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
      noteEditorPreview("dispose");
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
  }, [available, player, attempt, hook, occurrence, frames, captureTarget]);

  return {
    frame: presentationClock
      ? frame -
        (occurrenceClock && occurrence === "body"
          ? ownerHookFrames({ hook })
          : 0)
      : ownerSourceFrame({ hook }, frame),
    playing,
    captureReady:
      available &&
      ready &&
      (!occurrence ||
        !hook ||
        frame < ownerHookFrames({ hook }) === (occurrence === "hook")),
    captureFrame: async () => {
      noteEditorPreview("capture");
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
      const sourceFrame = ownerSourceFrame({ hook }, presentation);
      const at = presentationClock
        ? presentation -
          (occurrenceClock && occurrence === "body"
            ? ownerHookFrames({ hook })
            : 0)
        : sourceFrame;
      if (
        occurrence &&
        hook &&
        presentation < ownerHookFrames({ hook }) !== (occurrence === "hook")
      )
        return null;
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
        Math.abs(video.currentTime - sourceFrame / OWNER_FPS) <=
          1 / OWNER_FPS + 0.001;
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
          const canceled = () => {
            noteEditorPreview("capture-aborted");
            finish(null);
          };
          const timer = setTimeout(canceled, 1_000);
          video.addEventListener("seeked", seeked);
          video.addEventListener("loadeddata", seeked);
          video.addEventListener("error", canceled);
          controller.signal.addEventListener("abort", canceled, { once: true });
          try {
            video.currentTime = sourceFrame / OWNER_FPS;
          } catch {
            canceled();
          }
        });
      } finally {
        if (capture.current === controller) capture.current = null;
      }
    },
    seekTo: (at: number) => {
      noteEditorPreview("seek");
      player.current?.pause();
      const presentation = presentationClock
        ? occurrenceClock && occurrence === "body"
          ? ownerHookFrames({ hook }) + at
          : at
        : ownerOccurrencePresentationFrame(hook, at, occurrence ?? "body");
      player.current?.seekTo(presentation);
      setFrame(presentation);
    },
  };
}
