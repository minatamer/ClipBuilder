import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Button } from "../../shared/ui/button";
import { PictureTiming } from "./picture-timing.tsx";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import type { OwnerHook } from "../../../../../packages/contracts/local/hook.ts";

export function HookControls({
  hook,
  frames,
  player,
  available,
  attempt,
  valid,
  onChange,
}: {
  hook: OwnerHook | undefined;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  valid: boolean;
  onChange: (hook: OwnerHook | undefined) => void;
}) {
  return (
    <div className="hook-controls">
      <p>Repeat a moment, then play the full clip.</p>
      {hook ? (
        <>
          <PictureTiming
            label="Hook"
            cue={hook}
            frames={frames}
            player={player}
            available={available}
            attempt={attempt}
            onChange={onChange}
          />
          <p className="focus-empty">
            Up to 10 seconds. Edits and captions follow the moment.
          </p>
          <div className="caption-empty-actions">
            <Button
              variant="secondary"
              disabled={!available || !valid}
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
