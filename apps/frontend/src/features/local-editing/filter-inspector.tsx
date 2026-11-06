import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import {
  OWNER_VIDEO_LOOKS,
  OWNER_VIDEO_LOOK_LABELS,
  type OwnerVideoLookRange,
} from "../../../../../packages/contracts/local/video-look.ts";
import { PictureTiming } from "./picture-timing.tsx";
import { Button } from "../../shared/ui/button";

export function FilterInspector({
  cue,
  frames,
  player,
  available,
  attempt,
  disabled,
  onChange,
  feedback,
}: {
  cue: OwnerVideoLookRange;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  disabled: boolean;
  onChange: (cue: OwnerVideoLookRange) => void;
  feedback?: string | undefined;
}) {
  return (
    <fieldset className="filter-editor" disabled={disabled}>
      <legend className="local-sr-only">Filter range</legend>
      <PictureTiming
        cue={cue}
        frames={frames}
        player={player}
        available={available}
        attempt={attempt}
        label="Filter"
        validationMessage={feedback}
        onChange={onChange}
      />
      <div className="filter-settings">
        <label>
          Filter
          <select
            className="select-control"
            value={cue.preset}
            onChange={(event) => {
              const preset = OWNER_VIDEO_LOOKS.find(
                (value) => value === event.currentTarget.value,
              );
              if (preset) onChange({ ...cue, preset });
            }}
          >
            {OWNER_VIDEO_LOOKS.map((value) => (
              <option key={value} value={value}>
                {OWNER_VIDEO_LOOK_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Strength ({cue.strength}%)
          <input
            aria-label="Filter strength"
            type="range"
            min="0"
            max="100"
            step="1"
            value={cue.strength}
            disabled={cue.preset === "original"}
            onChange={(event) =>
              onChange({ ...cue, strength: Number(event.currentTarget.value) })
            }
          />
        </label>
      </div>
      <Button
        variant="secondary"
        onClick={() => onChange({ ...cue, preset: "original", strength: 100 })}
      >
        Reset filter
      </Button>
    </fieldset>
  );
}
