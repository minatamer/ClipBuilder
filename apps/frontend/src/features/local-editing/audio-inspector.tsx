import { useEffect, useId, useRef, useState, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Play, Square, Upload } from "lucide-react";
import { Button, IconButton } from "../../shared/ui/button";
import { ControlTabs } from "./control-tabs.tsx";
import { PictureTiming } from "./picture-timing.tsx";
import {
  ownerSoundAudio,
  ownerAudioSourceKey,
} from "../../../../../packages/composition/local/audio-sources.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  ownerSourceFrame,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";
import {
  OWNER_AUDIO_LIMITS,
  OWNER_SOUNDS,
  ownerAudioDuration,
  ownerAudioSegments,
  resolveOwnerAudioCues,
  type OwnerAudioAsset,
  type OwnerAudioCue,
  type OwnerAudioEdit,
} from "../../../../../packages/contracts/local/audio.ts";

export function AudioInspector({
  audio,
  assets,
  visuals = [],
  frames,
  hook,
  player,
  available,
  attempt,
  pending,
  onChange,
  onUpload,
  onYoutube,
  initialCueId,
}: {
  audio: OwnerAudioEdit | undefined;
  assets: readonly OwnerAudioAsset[];
  visuals?: readonly { id: string; startFrame: number }[];
  frames: number;
  hook: OwnerHook | undefined;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  pending: boolean;
  onChange: (audio: OwnerAudioEdit) => void;
  onUpload: (file: File) => Promise<string | null>;
  onYoutube?: (() => void) | undefined;
  initialCueId?: string | undefined;
}) {
  const current = audio ?? { originalVolume: 100, cues: [] };
  const [view, setView] = useState(initialCueId ? "tracks" : "library"),
    [selection, setSelection] = useState<string | null>(initialCueId ?? null),
    [playing, setPlaying] = useState<string | null>(null),
    [message, setMessage] = useState("");
  const id = useId(),
    input = useRef<HTMLInputElement>(null),
    audition = useRef<HTMLAudioElement>(null),
    urls = useRef(new Map<string, string>());
  useEffect(() => {
    const player = audition.current,
      owned = urls.current;
    return () => {
      player?.pause();
      owned.forEach((url) => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);
  const activeCues = resolveOwnerAudioCues(current.cues, visuals, frames);
  const selected =
    activeCues.find((cue) => cue.id === selection) ?? activeCues[0];
  const cueStart = (cue: OwnerAudioCue) =>
    ownerAudioSegments(
      { ...current, cues: [cue], assets: [...assets] },
      frames,
      hook,
    )[0]?.start;
  const selectedStart = selected ? cueStart(selected) : undefined;
  const seekCue = (cue: OwnerAudioCue) => {
    const start = cueStart(cue);
    player.current?.pause();
    if (start !== undefined)
      player.current?.seekTo(Math.round(start * OWNER_FPS));
  };
  const label = (source: OwnerAudioCue["source"]) =>
    source.kind === "builtin"
      ? OWNER_SOUNDS.find((sound) => sound.id === source.id)!.label
      : `Uploaded audio ${assets.findIndex((asset) => asset.id === source.id) + 1}`;
  const change = (cue: OwnerAudioCue) => {
    if (cue.loop && cue.visualId) {
      cue = { ...cue };
      delete cue.visualId;
    }
    onChange({
      ...current,
      cues: current.cues.map((item) => (item.id === cue.id ? cue : item)),
    });
  };
  const stop = () => {
    audition.current?.pause();
    setPlaying(null);
  };
  const add = (source: OwnerAudioCue["source"]) => {
    if (pending || current.cues.length >= OWNER_AUDIO_LIMITS.cues) return;
    const sound =
      source.kind === "builtin"
        ? OWNER_SOUNDS.find((item) => item.id === source.id)
        : undefined;
    const placement =
      source.kind === "upload" || sound?.id === "pulse"
        ? "video"
        : sound?.id === "tension"
          ? "hook"
          : "clip";
    const frame = Math.max(
      0,
      Math.min(
        frames - 1,
        ownerSourceFrame({ hook }, player.current?.getCurrentFrame() ?? 0),
      ),
    );
    const cue: OwnerAudioCue = {
      id: crypto.randomUUID(),
      source,
      placement,
      startFrame: placement === "clip" ? frame : 0,
      endFrame:
        placement === "clip"
          ? Math.min(
              frames,
              frame +
                Math.max(
                  1,
                  Math.round(ownerAudioDuration(source, assets) * OWNER_FPS),
                ),
            )
          : frames,
      offsetFrame: 0,
      volume: sound?.music || source.kind === "upload" ? 20 : 35,
      loop: !!sound?.music || source.kind === "upload",
    };
    stop();
    seekCue(cue);
    onChange({ ...current, cues: [...current.cues, cue] });
    setSelection(cue.id);
    setView("tracks");
  };
  const preview = (sound: (typeof OWNER_SOUNDS)[number]) => {
    if (playing === sound.id) {
      stop();
      return;
    }
    const element = audition.current;
    if (!element) return;
    player.current?.pause();
    const key = ownerAudioSourceKey({ kind: "builtin", id: sound.id });
    let url = urls.current.get(key);
    if (!url) {
      const sample = ownerSoundAudio(sound.id);
      url = URL.createObjectURL(
        new Blob([sample.bytes], { type: sample.mimeType }),
      );
      urls.current.set(key, url);
    }
    element.src = url;
    element.volume = 0.35;
    setPlaying(sound.id);
    setMessage("");
    void element.play().catch(() => {
      setPlaying(null);
      setMessage("Couldn’t play this sound. Try again.");
    });
  };
  return (
    <div className="audio-inspector">
      <ControlTabs
        id={`${id}-view`}
        label="Audio views"
        items={[
          { value: "library", label: "Sound library" },
          { value: "tracks", label: `Your audio (${current.cues.length})` },
        ]}
        value={view}
        onChange={(value) => {
          stop();
          setView(value);
        }}
      />
      <audio
        ref={audition}
        onEnded={() => setPlaying(null)}
        onError={() => {
          setPlaying(null);
          setMessage("Couldn’t play this sound. Try again.");
        }}
      />
      {message && <p role="status">{message}</p>}
      <div
        role="tabpanel"
        id={`${id}-view-library-panel`}
        aria-labelledby={`${id}-view-library`}
        hidden={view !== "library"}
      >
        <div className="sound-library">
          {OWNER_SOUNDS.filter((sound) => !sound.retired).map((sound) => (
            <div className="sound-card" key={sound.id}>
              <span>
                <strong>{sound.label}</strong>
                <small>{sound.music ? "Music" : "Effect"}</small>
              </span>
              <IconButton
                label={`${playing === sound.id ? "Stop" : "Preview"} ${sound.label}`}
                icon={playing === sound.id ? Square : Play}
                disabled={pending}
                onClick={() => preview(sound)}
              />
              <Button
                variant="secondary"
                aria-label={`Add ${sound.label}`}
                disabled={
                  pending ||
                  current.cues.length >= OWNER_AUDIO_LIMITS.cues ||
                  (sound.id === "tension" && !hook)
                }
                onClick={() => add({ kind: "builtin", id: sound.id })}
              >
                Add
              </Button>
            </div>
          ))}
          {assets.map((asset, index) => (
            <div className="sound-card" key={asset.id}>
              <span>
                <strong>Uploaded audio {index + 1}</strong>
                <small>{(asset.durationMs / 1000).toFixed(1)}s</small>
              </span>
              <Button
                variant="secondary"
                aria-label={`Add uploaded audio ${index + 1}`}
                disabled={
                  pending || current.cues.length >= OWNER_AUDIO_LIMITS.cues
                }
                onClick={() => add({ kind: "upload", id: asset.id })}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          icon={Upload}
          disabled={
            pending ||
            assets.length >= OWNER_AUDIO_LIMITS.assets ||
            current.cues.length >= OWNER_AUDIO_LIMITS.cues
          }
          onClick={() => input.current?.click()}
        >
          {pending ? "Uploading…" : "Upload audio"}
        </Button>
        <input
          ref={input}
          className="local-file-input"
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp4,.mp3,.wav,.m4a"
          aria-label="Upload audio"
          disabled={pending}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (!file) return;
            if (file.size < 1 || file.size > OWNER_AUDIO_LIMITS.inputBytes) {
              setMessage("Choose audio under 12 MB and 2 minutes.");
              return;
            }
            setMessage("");
            stop();
            void onUpload(file).then((assetId) => {
              if (assetId) {
                setView("tracks");
                setSelection(null);
              }
            });
          }}
        />
        {onYoutube && (
          <Button
            variant="secondary"
            disabled={
              pending ||
              assets.length >= OWNER_AUDIO_LIMITS.assets ||
              current.cues.length >= OWNER_AUDIO_LIMITS.cues
            }
            onClick={() => {
              stop();
              onYoutube();
            }}
          >
            From YouTube
          </Button>
        )}
        <p className="source-hint">MP3, WAV or M4A · 12 MB · 2 minutes</p>
        {!hook && (
          <p className="source-hint">Add a hook to use suspense audio.</p>
        )}
      </div>
      <div
        role="tabpanel"
        id={`${id}-view-tracks-panel`}
        aria-labelledby={`${id}-view-tracks`}
        hidden={view !== "tracks"}
      >
        <label>
          Original audio ({current.originalVolume}%)
          <input
            aria-label="Original audio volume"
            type="range"
            min="0"
            max="100"
            value={current.originalVolume}
            disabled={pending}
            onChange={(event) =>
              onChange({
                ...current,
                originalVolume: Number(event.currentTarget.value),
              })
            }
          />
        </label>
        {!activeCues.length && <p className="focus-empty">No added audio.</p>}
        <div className="audio-cue-list" role="group" aria-label="Added audio">
          {activeCues.map((cue, index) => (
            <Button
              variant="secondary"
              className="audio-cue"
              key={cue.id}
              aria-pressed={selected?.id === cue.id}
              onClick={() => setSelection(cue.id)}
            >
              {index + 1}. {label(cue.source)}
              {cue.visualId ? " · Visual" : ""}
            </Button>
          ))}
        </div>
        {selected && (
          <fieldset disabled={pending} className="audio-settings">
            <legend className="local-sr-only">Audio settings</legend>
            <Button
              variant="secondary"
              icon={Play}
              disabled={!available || selectedStart === undefined}
              title={
                selectedStart === undefined
                  ? "Choose an audible placement and audio offset."
                  : undefined
              }
              onClick={() => {
                stop();
                seekCue(selected);
                player.current?.play();
              }}
            >
              Preview in clip
            </Button>
            <label>
              Placement
              <select
                aria-label="Audio placement"
                value={selected.placement}
                onChange={(event) => {
                  const placement = event.currentTarget.value;
                  if (
                    placement === "clip" ||
                    placement === "hook" ||
                    placement === "video"
                  ) {
                    const next: OwnerAudioCue = {
                      ...selected,
                      placement,
                      startFrame: 0,
                      endFrame: frames,
                    };
                    delete next.visualId;
                    change(next);
                  }
                }}
              >
                <option value="clip">Timed clip</option>
                <option value="hook">Hook only</option>
                <option value="video">Whole video</option>
              </select>
            </label>
            {selected.placement === "hook" && !hook && (
              <p className="source-hint">
                This sound is silent until a hook is added.
              </p>
            )}
            {selected.visualId && (
              <div className="caption-empty-actions">
                <span>
                  At visual start ·{" "}
                  {(selected.startFrame / OWNER_FPS).toFixed(2)}s
                </span>
                <Button
                  variant="quiet"
                  onClick={() => {
                    const next = { ...selected };
                    delete next.visualId;
                    change(next);
                  }}
                >
                  Edit timing
                </Button>
              </div>
            )}
            {selected.placement === "clip" && !selected.visualId && (
              <PictureTiming
                label="Sound"
                cue={selected}
                frames={frames}
                player={player}
                available={available && !pending}
                attempt={attempt}
                onChange={change}
              />
            )}
            <label>
              Volume ({selected.volume}%)
              <input
                aria-label="Added audio volume"
                type="range"
                min="0"
                max="100"
                value={selected.volume}
                onChange={(event) =>
                  change({
                    ...selected,
                    volume: Number(event.currentTarget.value),
                  })
                }
              />
            </label>
            <label>
              Audio offset (s)
              <input
                aria-label="Audio offset seconds"
                type="number"
                min="0"
                max={ownerAudioDuration(selected.source, assets)}
                step="0.033333"
                value={Number((selected.offsetFrame / OWNER_FPS).toFixed(3))}
                onChange={(event) => {
                  const offset = Number(event.currentTarget.value);
                  if (Number.isFinite(offset))
                    change({
                      ...selected,
                      offsetFrame: Math.max(0, Math.round(offset * OWNER_FPS)),
                    });
                }}
              />
            </label>
            <label className="selection">
              <input
                type="checkbox"
                checked={selected.loop}
                onChange={(event) =>
                  change({ ...selected, loop: event.currentTarget.checked })
                }
              />
              Loop audio
            </label>
            <Button
              variant="quiet"
              onClick={() => {
                onChange({
                  ...current,
                  cues: current.cues.filter((cue) => cue.id !== selected.id),
                });
                setSelection(null);
              }}
            >
              Remove sound
            </Button>
          </fieldset>
        )}
      </div>
    </div>
  );
}
