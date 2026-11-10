import { pictureLinkedAudio } from "./picture-audio.ts";
import { EditorInspector } from "./editor-inspector-layout";
import {
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { PlayerRef } from "@remotion/player";
import { Play, Square, Upload } from "lucide-react";
import { Button, IconButton } from "../../shared/ui/button";
import { ControlTabs } from "./control-tabs.tsx";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import {
  EditorOccurrence,
  EditorPresentationClock,
  editorClockOffset,
} from "./editor-clock.ts";
import { ownerHookFrames } from "../../../../../packages/contracts/local/hook.ts";
import { PictureTiming } from "./picture-timing.tsx";
import {
  OWNER_HOOK_AUDIO_DEFAULT_VOLUME,
  type OwnerHookSoundId,
} from "./hook-edit.ts";
import {
  ownerSoundAudio,
  ownerAudioSourceKey,
} from "../../../../../packages/composition/local/audio-sources.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import type { OwnerVisualTiming } from "../../../../../packages/contracts/local/visual-clock.ts";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
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
  onHookSound,
  onUpload,
  onYoutube,
  initialCueId,
  hideCueList = false,
  linkedVisual,
  onBackToPicture,
  uploadFeedback,
  validationFeedback,
}: {
  audio: OwnerAudioEdit | undefined;
  assets: readonly OwnerAudioAsset[];
  visuals?: readonly OwnerVisualTiming[];
  frames: number;
  hook: OwnerHook | undefined;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  pending: boolean;
  onChange: (audio: OwnerAudioEdit) => void;
  onHookSound?: ((sound: OwnerHookSoundId) => void) | undefined;
  onUpload: (file: File) => Promise<string | null>;
  onYoutube?: (() => void) | undefined;
  initialCueId?: string | undefined;
  hideCueList?: boolean;
  linkedVisual?:
    (OwnerVisualTiming & Pick<OwnerVisualEdit, "video">) | undefined;
  onBackToPicture?: (() => void) | undefined;
  uploadFeedback?: string | undefined;
  validationFeedback?: string | undefined;
}) {
  const occurrence = useContext(EditorOccurrence);
  const unifiedClock = useContext(EditorPresentationClock);
  const displayOffset = unifiedClock ? editorClockOffset(hook, occurrence) : 0;
  const current = audio ?? { originalVolume: 100, cues: [] };
  const windowStart = occurrence === "hook" && hook ? hook.startFrame : 0;
  const windowEnd = occurrence === "hook" && hook ? hook.endFrame : frames;
  const [view, setView] = useState(initialCueId ? "tracks" : "library"),
    [selection, setSelection] = useState<string | null>(initialCueId ?? null),
    [playing, setPlaying] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState("");
  const previewOwner = useRef<string | null>(null);
  const auditionAttempt = useRef(0);
  const id = useId(),
    input = useRef<HTMLInputElement>(null),
    audition = useRef<HTMLAudioElement>(null),
    urls = useRef(new Map<string, string>());
  useEffect(() => {
    const player = audition.current,
      owned = urls.current;
    return () => {
      previewOwner.current = null;
      player?.pause();
      owned.forEach((url) => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);
  const activeCues = resolveOwnerAudioCues(current.cues, visuals, frames);
  const selected =
    selection === "original"
      ? undefined
      : (activeCues.find((cue) => cue.id === selection) ?? activeCues[0]);
  const cueStart = (cue: OwnerAudioCue) => {
    const prefix = ownerHookFrames({ hook }) / OWNER_FPS;
    const segments = ownerAudioSegments(
      { ...current, cues: [cue], assets: [...assets] },
      frames,
      occurrence === "body" ? undefined : hook,
      undefined,
      visuals,
    );
    const at = segments.find(
      (segment) => occurrence !== "hook" || segment.start < prefix,
    )?.start;
    return at === undefined
      ? undefined
      : at + (occurrence === "body" ? prefix : 0);
  };
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
    const previous = current.cues.find((item) => item.id === cue.id);
    if (
      cue.suggestedHook &&
      previous &&
      (cue.placement !== previous.placement ||
        cue.offsetFrame !== previous.offsetFrame ||
        cue.loop !== previous.loop)
    ) {
      cue = { ...cue };
      delete cue.suggestedHook;
    }
    if (
      cue.visualId &&
      previous &&
      (cue.placement !== previous.placement ||
        cue.offsetFrame !== previous.offsetFrame ||
        cue.loop !== previous.loop)
    ) {
      cue = { ...cue };
      delete cue.visualId;
    }
    onChange({
      ...current,
      cues: current.cues.map((item) => (item.id === cue.id ? cue : item)),
    });
  };
  const stop = () => {
    auditionAttempt.current++;
    previewOwner.current = null;
    audition.current?.pause();
    setPlaying(null);
    setPreviewError(null);
  };
  const add = (source: OwnerAudioCue["source"]) => {
    if (pending) return;
    const sound =
      source.kind === "builtin"
        ? OWNER_SOUNDS.find((item) => item.id === source.id)
        : undefined;
    if (
      sound?.hookOnly &&
      onHookSound &&
      (sound.id === "riser" || sound.id === "rising-tension")
    ) {
      stop();
      onHookSound(sound.id);
      setView("tracks");
      return;
    }
    if (current.cues.length >= OWNER_AUDIO_LIMITS.cues) return;
    const placement =
      source.kind === "upload" || sound?.id === "pulse"
        ? "video"
        : sound?.id === "tension" || sound?.hookOnly
          ? "hook"
          : "clip";
    const frame = Math.max(
      windowStart,
      Math.min(
        windowEnd - 1,
        ownerSourceFrame({ hook }, player.current?.getCurrentFrame() ?? 0),
      ),
    );
    let cue: OwnerAudioCue = {
      id: crypto.randomUUID(),
      source,
      placement,
      startFrame: placement === "clip" ? frame : 0,
      endFrame:
        placement === "clip"
          ? Math.min(
              windowEnd,
              frame +
                Math.max(
                  1,
                  Math.round(ownerAudioDuration(source, assets) * OWNER_FPS),
                ),
            )
          : frames,
      offsetFrame: 0,
      volume: sound?.hookOnly
        ? OWNER_HOOK_AUDIO_DEFAULT_VOLUME
        : sound?.music || source.kind === "upload"
          ? 20
          : 35,
      loop: (!!sound?.music && !sound.hookOnly) || source.kind === "upload",
    };
    if (linkedVisual)
      cue = pictureLinkedAudio(
        cue,
        linkedVisual,
        windowEnd,
        Math.round(ownerAudioDuration(source, assets) * OWNER_FPS),
      );
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
    previewOwner.current = sound.id;
    const currentAttempt = ++auditionAttempt.current;
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
    element.volume = sound.hookOnly
      ? OWNER_HOOK_AUDIO_DEFAULT_VOLUME / 100
      : 0.35;
    setPlaying(sound.id);
    setPreviewError(null);
    void element.play().catch(() => {
      if (
        previewOwner.current !== sound.id ||
        auditionAttempt.current !== currentAttempt
      )
        return;
      setPlaying(null);
      setPreviewError({
        id: sound.id,
        text: "Couldn’t play this sound. Retry preview.",
      });
    });
  };
  return (
    <div className="audio-inspector">
      {linkedVisual && (
        <div
          className="picture-audio-context"
          role="group"
          aria-label={linkedVisual.video ? "Video audio" : "Picture audio"}
        >
          <strong>
            Audio for {linkedVisual.video ? "video" : "picture"}
            {occurrence === "hook" ? " [Hook]" : ""}
          </strong>
          <Button variant="quiet" onClick={onBackToPicture}>
            Back to {linkedVisual.video ? "video" : "picture"}
          </Button>
        </div>
      )}
      <ControlTabs
        id={`${id}-view`}
        label="Audio views"
        items={[
          {
            value: "library",
            label: "Sound library",
            issue: uploadError || uploadFeedback || previewError?.text,
          },
          {
            value: "tracks",
            label: `Your audio (${current.cues.length})`,
            issue: validationFeedback,
          },
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
          if (!previewOwner.current) return;
          setPlaying(null);
          setPreviewError({
            id: previewOwner.current,
            text: "Couldn’t play this sound. Retry preview.",
          });
        }}
      />
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
                aria-describedby={
                  previewError?.id === sound.id
                    ? `${id}-${sound.id}-feedback`
                    : undefined
                }
                icon={playing === sound.id ? Square : Play}
                disabled={pending}
                onClick={() => preview(sound)}
              />
              <Button
                variant="secondary"
                aria-label={`Add ${sound.label}`}
                disabled={
                  pending ||
                  (current.cues.length >= OWNER_AUDIO_LIMITS.cues &&
                    !(sound.hookOnly && onHookSound)) ||
                  ((sound.id === "tension" || sound.hookOnly) &&
                    (!hook ||
                      (occurrence === "body" &&
                        !(sound.hookOnly && onHookSound))))
                }
                onClick={() => add({ kind: "builtin", id: sound.id })}
              >
                Add
              </Button>
              <InlineFeedback
                id={`${id}-${sound.id}-feedback`}
                message={
                  previewError?.id === sound.id ? previewError.text : undefined
                }
              />
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
        <div className="audio-intake-actions">
          <Button
            variant="secondary"
            icon={Upload}
            disabled={
              pending ||
              assets.length >= OWNER_AUDIO_LIMITS.assets ||
              current.cues.length >= OWNER_AUDIO_LIMITS.cues
            }
            onClick={() => input.current?.click()}
            aria-describedby={
              uploadError || uploadFeedback
                ? `${id}-upload-feedback`
                : undefined
            }
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
                setUploadError("Choose audio under 12 MB and 2 minutes.");
                return;
              }
              setUploadError("");
              stop();
              void onUpload(file).then((assetId) => {
                if (assetId) {
                  setView("tracks");
                  setSelection(null);
                } else setUploadError("Couldn’t add this audio. Try again.");
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
        </div>
        <InlineFeedback
          id={`${id}-upload-feedback`}
          message={uploadError || uploadFeedback}
        />
        <p className="source-hint">MP3, WAV or M4A · 12 MB · 2 minutes</p>
        {!hook && (
          <p className="source-hint">Add a hook to use hook-only audio.</p>
        )}
      </div>
      <div
        role="tabpanel"
        id={`${id}-view-tracks-panel`}
        aria-labelledby={`${id}-view-tracks`}
        hidden={view !== "tracks"}
      >
        {view === "tracks" && (
          <EditorInspector title="Audio properties" disabled={pending}>
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
          </EditorInspector>
        )}
        {!activeCues.length && <p className="focus-empty">No added audio.</p>}
        {!hideCueList && (
          <div className="audio-cue-list" role="group" aria-label="Added audio">
            {activeCues.map((cue, index) => (
              <Button
                variant="secondary"
                className="audio-cue"
                key={cue.id}
                aria-pressed={selected?.id === cue.id}
                onClick={() => {
                  setSelection(cue.id);
                  seekCue(cue);
                }}
              >
                {index + 1}. {label(cue.source)}
                {cue.visualId ? " · Visual" : ""}
              </Button>
            ))}
          </div>
        )}
        {selected && view === "tracks" && (
          <EditorInspector disabled={pending} title="Selected sound">
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
                      startFrame:
                        placement === "clip" && occurrence === "hook" && hook
                          ? hook.startFrame
                          : 0,
                      endFrame:
                        occurrence === "hook" && hook ? hook.endFrame : frames,
                    };
                    delete next.visualId;
                    change(next);
                  }
                }}
              >
                <option value="clip">Timed clip</option>
                {occurrence !== "body" && (
                  <option value="hook">Hook only</option>
                )}
                <option value="video">
                  {occurrence === "hook"
                    ? "Whole Hook"
                    : occurrence === "body"
                      ? "Whole main clip"
                      : "Whole video"}
                </option>
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
                  At picture start ·{" "}
                  {((selected.startFrame + displayOffset) / OWNER_FPS).toFixed(
                    2,
                  )}
                  s
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
            <InlineFeedback message={validationFeedback} />
          </EditorInspector>
        )}
      </div>
    </div>
  );
}
