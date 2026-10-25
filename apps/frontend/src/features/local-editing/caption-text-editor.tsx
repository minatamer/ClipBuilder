import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Play } from "lucide-react";
import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import type { OwnerEditDocument } from "../../../../../packages/contracts/local/editor.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { Button } from "../../shared/ui/button";

export function CaptionTextEditor({
  captions,
  edits,
  player,
  available,
  frames,
  onChange,
}: {
  captions: OwnerOverlay["captions"];
  edits: OwnerEditDocument["captionText"];
  player: RefObject<PlayerRef | null>;
  available: boolean;
  frames: number;
  onChange: (edits: NonNullable<OwnerEditDocument["captionText"]>) => void;
}) {
  const replacements = new Map(edits?.map((edit) => [edit.wordId, edit.text]));
  return (
    <div className="caption-text-editor">
      {captions.map((caption, index) => (
        <fieldset
          key={`${caption.startMs}:${index}`}
          className="caption-word-group"
        >
          <legend className="local-sr-only">Caption {index + 1}</legend>
          <Button
            variant="quiet"
            icon={Play}
            disabled={!available}
            aria-label={`Preview caption ${index + 1}`}
            onClick={() => {
              player.current?.pause();
              player.current?.seekTo(
                Math.min(
                  frames - 1,
                  Math.floor((caption.startMs * OWNER_FPS) / 1000),
                ),
              );
            }}
          >
            {(caption.startMs / 1000).toFixed(2)}s
          </Button>
          <div className="caption-words">
            {caption.wordCues.map((word, wordIndex) => {
              const value = replacements.get(word.wordId) ?? word.text;
              return (
                <label key={word.wordId}>
                  <span className="local-sr-only">
                    Caption {index + 1}, word {wordIndex + 1}
                  </span>
                  <input
                    type="text"
                    aria-label={`Caption ${index + 1} word ${wordIndex + 1}`}
                    value={value}
                    maxLength={80}
                    size={Math.min(24, Math.max(4, value.length + 1))}
                    onFocus={() => player.current?.pause()}
                    onChange={(event) =>
                      onChange([
                        ...(edits ?? []).filter(
                          (edit) => edit.wordId !== word.wordId,
                        ),
                        ...(event.currentTarget.value === word.text
                          ? []
                          : [
                              {
                                wordId: word.wordId,
                                text: event.currentTarget.value,
                              },
                            ]),
                      ])
                    }
                  />
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      {!!edits?.length && (
        <Button variant="secondary" onClick={() => onChange([])}>
          Reset text
        </Button>
      )}
    </div>
  );
}
