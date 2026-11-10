import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import {
  OWNER_VIDEO_LOOKS,
  OWNER_VIDEO_LOOK_LABELS,
  type OwnerVideoLookRange,
} from "../../../../../packages/contracts/local/video-look.ts";
import { PictureTiming } from "./picture-timing.tsx";
import { Button } from "../../shared/ui/button";
import { EditorChoiceGrid } from "./editor-choice-grid";
import { VideoThumbnail } from "../../shared/ui/video-thumbnail";
import { OwnerVideoLookLayer } from "../../../../../packages/composition/local/video-look.tsx";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";

export function FilterInspector({
  cue,
  frames,
  player,
  available,
  attempt,
  disabled,
  onChange,
  feedback,
  sourceUrl,
}: {
  cue: OwnerVideoLookRange;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  disabled: boolean;
  onChange: (cue: OwnerVideoLookRange) => void;
  feedback?: string | undefined;
  sourceUrl: string;
}) {
  return (
    <fieldset className="filter-editor" disabled={disabled}>
      <legend className="local-sr-only">Filter range</legend>
      <section className="editor-control-group" aria-label="Video looks">
        <h3>Looks</h3>
        <EditorChoiceGrid
          label="Filter"
          value={cue.preset}
          onChange={(preset) => onChange({ ...cue, preset })}
          items={OWNER_VIDEO_LOOKS.map((preset) => ({
            value: preset,
            label: OWNER_VIDEO_LOOK_LABELS[preset],
            preview: (
              <span className="filter-preset-preview">
                <OwnerVideoLookLayer look={{ preset, strength: 100 }}>
                  <VideoThumbnail
                    request={{
                      source: sourceUrl,
                      timeMs: (cue.startFrame * 1000) / OWNER_FPS,
                      width: 240,
                      height: 135,
                    }}
                  />
                </OwnerVideoLookLayer>
              </span>
            ),
          }))}
        />
      </section>
      <div className="filter-settings">
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
      <section className="editor-control-group" aria-label="Filter timing">
        <h3>Timing</h3>
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
      </section>
      <Button
        variant="secondary"
        onClick={() => onChange({ ...cue, preset: "original", strength: 100 })}
      >
        Reset filter
      </Button>
    </fieldset>
  );
}
