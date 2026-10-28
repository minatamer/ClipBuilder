import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import type { OwnerCaptionStyle } from "../../../../../packages/contracts/local/editor.ts";
import {
  defaultSpeakerColor,
  type OwnerCaptionSpeakers,
} from "../../../../../packages/contracts/local/caption-speakers.ts";
import { Button } from "../../shared/ui/button";

export function CaptionSpeakers({
  value,
  captions,
  style,
  onChange,
}: {
  value: OwnerCaptionSpeakers;
  captions: OwnerOverlay["captions"];
  style: OwnerCaptionStyle;
  onChange: (value: OwnerCaptionSpeakers | undefined) => void;
}) {
  const labels = new Map(value.assignments.map((w) => [w.wordId, w.speakerId]));
  const ids = [
    ...new Set([
      ...value.assignments.flatMap((w) => (w.speakerId ? [w.speakerId] : [])),
      ...value.colors.map((c) => c.speakerId),
    ]),
  ].sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
  if (!ids.length) ids.push("spk_0", "spk_1");
  return (
    <div className="speaker-controls">
      <label className="speaker-toggle">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) =>
            onChange({ ...value, enabled: e.currentTarget.checked })
          }
        />
        Color by speaker
      </label>
      <div className="speaker-palette">
        {ids.map((id) => {
          const colors =
            value.colors.find((c) => c.speakerId === id) ??
            defaultSpeakerColor(id, style);
          return (
            <fieldset key={id} className="speaker-color-card">
              <legend>Speaker {Number(id.slice(4))}</legend>
              <div className="editor-fields">
                {(
                  [
                    ["color", "Text"],
                    ["backgroundColor", "Background"],
                    ["highlight", "Highlight"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="color"
                      aria-label={`Speaker ${Number(id.slice(4))} ${label.toLowerCase()} color`}
                      value={colors[key]}
                      onChange={(e) =>
                        onChange({
                          ...value,
                          colors: [
                            ...value.colors.filter((c) => c.speakerId !== id),
                            { ...colors, [key]: e.currentTarget.value },
                          ],
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
      {ids.length < 16 && (
        <Button
          variant="secondary"
          onClick={() => {
            const id = Array.from({ length: 16 }, (_, i) => `spk_${i}`).find(
              (id) => !ids.includes(id),
            )!;
            onChange({
              ...value,
              colors: [...value.colors, defaultSpeakerColor(id, style)],
            });
          }}
        >
          Add speaker
        </Button>
      )}
      <div className="caption-text-editor">
        {captions.map((caption, index) => (
          <fieldset
            key={`${caption.startMs}:${index}`}
            className="caption-word-group"
          >
            <legend>Caption {index + 1}</legend>
            <div className="speaker-words">
              {caption.wordCues.map((word) => (
                <label key={word.wordId}>
                  <span>{word.text}</span>
                  <select
                    className="select-control"
                    aria-label={`Speaker for ${word.wordId}`}
                    value={labels.get(word.wordId) ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        assignments: [
                          ...value.assignments.filter(
                            (w) => w.wordId !== word.wordId,
                          ),
                          {
                            wordId: word.wordId,
                            speakerId: e.currentTarget.value || null,
                          },
                        ],
                      })
                    }
                  >
                    <option value="">Unassigned</option>
                    {ids.map((id) => (
                      <option key={id} value={id}>
                        Speaker {Number(id.slice(4))}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <Button variant="secondary" onClick={() => onChange(undefined)}>
        Reset speakers
      </Button>
    </div>
  );
}
