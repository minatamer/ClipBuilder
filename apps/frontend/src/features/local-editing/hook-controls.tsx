import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Sparkles } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { PictureTiming } from "./picture-timing.tsx";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  changeOwnerHookEndpoint,
  completeOwnerHookDraft,
  type OwnerHookDraft,
} from "./hook-range-draft.ts";
import type { OwnerHook } from "../../../../../packages/contracts/local/hook.ts";

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
  suggestedAudio = false,
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
  suggestedAudio?: boolean;
}) {
  const range = hook ? completeOwnerHookDraft(hook, frames) : undefined;
  const view = hook
    ? { startFrame: hook.startFrame ?? NaN, endFrame: hook.endFrame ?? NaN }
    : undefined;
  return (
    <div className="hook-controls">
      <p>Repeat a moment, then play the full clip.</p>
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
              {(suggestion.endFrame / OWNER_FPS).toFixed(2)}s
            </span>
          </div>
          <Button
            variant="secondary"
            disabled={
              !available ||
              !valid ||
              (suggestedAudio &&
                hook?.startFrame === suggestion.startFrame &&
                hook.endFrame === suggestion.endFrame)
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
            {hook.startFrame === null
              ? "Choose a start."
              : hook.endFrame === null
                ? "Choose an end to preview or apply the Hook."
                : !range
                  ? "Choose an end after the start, inside this clip and within 10 seconds."
                  : "Up to 10 seconds. Edit each copy in Hook or Main clip."}
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
