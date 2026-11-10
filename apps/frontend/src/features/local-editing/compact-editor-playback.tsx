import { useCallback, useSyncExternalStore, type RefObject } from "react";
import type { PlayerRef, EventTypes } from "@remotion/player";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "../../shared/ui/button";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";

const query = "(max-width: 63.999rem)";
const subscribeLayout = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const compactLayout = () => window.matchMedia(query).matches;
const serverLayout = () => false;

function subscribePlayer(
  player: RefObject<PlayerRef | null>,
  notify: () => void,
  events: readonly EventTypes[],
) {
  const current = player.current;
  if (!current) return () => {};
  for (const event of events) current.addEventListener(event, notify);
  return () => {
    for (const event of events) current.removeEventListener(event, notify);
  };
}

export function useCompactEditorPlayback(
  player: RefObject<PlayerRef | null>,
  ready: boolean,
) {
  const compact = useSyncExternalStore(
    subscribeLayout,
    compactLayout,
    serverLayout,
  );
  const subscribe = useCallback(
    (notify: () => void) => {
      return ready
        ? subscribePlayer(player, notify, ["fullscreenchange"])
        : () => {};
    },
    [player, ready],
  );
  const fullscreen = useSyncExternalStore(
    subscribe,
    () => player.current?.isFullscreen() ?? false,
    serverLayout,
  );
  return compact && !fullscreen;
}

const clock = (frame: number) => {
  const seconds = Math.floor(frame / OWNER_FPS);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

/** One compact transport, independent of the scaled portrait canvas and editor render loop. */
export function CompactEditorPlayback({
  player,
  frames,
}: {
  player: RefObject<PlayerRef | null>;
  frames: number;
}) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const events = [
        "frameupdate",
        "seeked",
        "play",
        "pause",
        "ended",
        "volumechange",
        "mutechange",
      ] as const;
      return subscribePlayer(player, notify, events);
    },
    [player],
  );
  const state = useSyncExternalStore(
    subscribe,
    () => {
      const current = player.current;
      return current
        ? `${current.getCurrentFrame()}|${Number(current.isPlaying())}|${current.getVolume()}|${Number(current.isMuted())}`
        : "0|0|1|0";
    },
    () => "0|0|1|0",
  );
  const [rawFrame = 0, playing = 0, volume = 1, muted = 0] = state
    .split("|")
    .map(Number);
  const frame = Math.min(frames - 1, Math.max(0, rawFrame));
  return (
    <div
      className="compact-editor-playback"
      role="group"
      aria-label="Preview playback"
    >
      <input
        type="range"
        aria-label="Preview position"
        min={0}
        max={frames - 1}
        step={1}
        value={frame}
        aria-valuetext={`${clock(frame)} of ${clock(frames)}`}
        onChange={(event) => {
          player.current?.pause();
          player.current?.seekTo(Number(event.currentTarget.value));
        }}
      />
      <div className="compact-playback-row">
        <IconButton
          label={playing ? "Pause video" : "Play video"}
          icon={playing ? Pause : Play}
          onClick={(event) => player.current?.toggle(event)}
        />
        <IconButton
          label={muted ? "Unmute sound" : "Mute sound"}
          icon={muted ? VolumeX : Volume2}
          onClick={() => {
            const current = player.current;
            if (current?.isMuted()) current.unmute();
            else current?.mute();
          }}
        />
        <span className="compact-playback-clock">
          {clock(frame)} / {clock(frames)}
        </span>
        <details className="compact-playback-volume">
          <summary aria-label="Playback volume">Vol</summary>
          <label>
            Playback volume
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(event) =>
                player.current?.setVolume(
                  Number(event.currentTarget.value) / 100,
                )
              }
            />
          </label>
        </details>
        <IconButton
          label="Enter Fullscreen"
          icon={Maximize}
          onClick={() => player.current?.requestFullscreen()}
        />
      </div>
    </div>
  );
}
