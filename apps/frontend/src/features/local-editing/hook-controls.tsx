import { useId, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Sparkles } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { PictureTiming } from "./picture-timing.tsx";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  changeOwnerHookEndpoint,
  completeOwnerHookDraft,
  type OwnerHookDraft,
} from "./hook-range-draft.ts";
import type { OwnerHook } from "../../../../../packages/contracts/local/hook.ts";
import { ownerHookSoundWindow } from "./hook-edit.ts";

export function HookControls({
  hook,
  suggestion,
  simulated = false,
  frames,
  player,
  available,
  attempt,
  valid,
  onChange,
  onUseSuggestion,
  generateTitle,
  addAudio,
  titleUnavailable,
  onGenerateTitle,
  onAddAudio,
  maxFrames = 10 * OWNER_FPS,
}: {
  hook: OwnerHookDraft | undefined;
  suggestion?: OwnerHook | undefined;
  simulated?: boolean;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  valid: boolean;
  onChange: (hook: OwnerHookDraft | undefined) => void;
  onUseSuggestion: (hook: OwnerHook) => void;
  generateTitle: boolean;
  addAudio: boolean;
  titleUnavailable: string | undefined;
  onGenerateTitle: (enabled: boolean) => void;
  onAddAudio: (enabled: boolean) => void;
  maxFrames?: number;
}) {
  const optionFeedback = useId();
  const range = hook
    ? completeOwnerHookDraft(hook, frames, maxFrames)
    : undefined;
  const suggestionWindow = suggestion
    ? addAudio
      ? ownerHookSoundWindow(suggestion, frames)
      : suggestion
    : undefined;
  const view = hook
    ? { startFrame: hook.startFrame ?? NaN, endFrame: hook.endFrame ?? NaN }
    : undefined;
  const rangeMessage =
    !hook || range
      ? undefined
      : hook.startFrame === null
        ? "Choose a start."
        : hook.endFrame === null
          ? "Choose an end to preview or apply the Hook."
          : `Choose a valid range (up to ${maxFrames / OWNER_FPS}s).`;
  return (
    <div className="hook-controls">
      <p>Repeat a moment, then play the full clip.</p>
      <div className="hook-options" role="group" aria-label="Hook options">
        <label className="check">
          <input
            type="checkbox"
            checked={generateTitle}
            disabled={!!titleUnavailable && !generateTitle}
            aria-describedby={titleUnavailable ? optionFeedback : undefined}
            onChange={(event) => onGenerateTitle(event.currentTarget.checked)}
          />
          Generate title
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={addAudio}
            disabled={!!hook && !range && !addAudio}
            onChange={(event) => onAddAudio(event.currentTarget.checked)}
          />
          Add Hook audio
        </label>
      </div>
      <InlineFeedback
        id={optionFeedback}
        tone="status"
        message={titleUnavailable}
      />
      {suggestion && (
        <div
          className="hook-suggestion"
          role="group"
          aria-label={
            simulated ? "Simulated AI hook suggestion" : "AI hook suggestion"
          }
        >
          <div className="hook-suggestion-copy">
            <span className="hook-suggestion-label">
              <Sparkles size={16} aria-hidden="true" />
              AI suggested hook{simulated && <small>Simulated</small>}
            </span>
            <span>
              {(suggestion.startFrame / OWNER_FPS).toFixed(2)}s –{" "}
              {(suggestionWindow!.endFrame / OWNER_FPS).toFixed(2)}s
            </span>
          </div>
          <Button
            variant="secondary"
            disabled={
              !available ||
              !valid ||
              (hook?.startFrame === suggestion.startFrame &&
                hook.endFrame === suggestionWindow!.endFrame)
            }
            onClick={() => onUseSuggestion({ ...suggestion })}
          >
            Use suggestion
          </Button>
        </div>
      )}
      {hook ? (
        <>
          <PictureTiming
            label="Hook"
            cue={view!}
            frames={frames}
            player={player}
            available={available}
            attempt={attempt}
            validationMessage={rangeMessage}
            onStartAfterEnd={(frame) =>
              onChange(changeOwnerHookEndpoint(hook, "startFrame", frame))
            }
            onChange={(next) => {
              const endpoint = !Object.is(next.startFrame, view!.startFrame)
                ? "startFrame"
                : "endFrame";
              onChange(changeOwnerHookEndpoint(hook, endpoint, next[endpoint]));
            }}
          />
          <p className="focus-empty">
            Up to {maxFrames / OWNER_FPS} seconds. Repeated items are marked
            [Hook].
          </p>
          <div className="caption-empty-actions">
            <Button
              variant="secondary"
              disabled={!available || !valid || !range}
              onClick={() => {
                player.current?.pause();
                player.current?.seekTo(0);
                player.current?.play();
              }}
            >
              Preview hook
            </Button>
            <Button variant="quiet" onClick={() => onChange(undefined)}>
              Remove hook
            </Button>
          </div>
        </>
      ) : (
        <Button
          variant="secondary"
          disabled={!available || !valid}
          onClick={() =>
            onChange({
              startFrame: 0,
              endFrame: Math.min(frames, 3 * OWNER_FPS),
            })
          }
        >
          Add hook
        </Button>
      )}
    </div>
  );
}
