import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import {
  OWNER_TEXT_PRESET_LABELS,
  ownerTextBackground,
  ownerTypographyOutline,
  ownerTypographyWeight,
  type OwnerTypography,
} from "../../../../../packages/contracts/local/text-style.ts";
import { EditorChoiceGrid } from "./editor-choice-grid";

export function TypographyPresetPicker({
  value,
  onChange,
}: {
  value: OwnerTypography["preset"];
  onChange: (preset: OwnerTypography["preset"]) => void;
}) {
  return (
    <section className="editor-control-group" aria-label="Style presets">
      <h3>Style presets</h3>
      <EditorChoiceGrid
        label="Style"
        value={value}
        onChange={onChange}
        items={Object.entries(OWNER_TEXT_PRESET_LABELS).map(([key, label]) => {
          const preset = key as OwnerTypography["preset"],
            style = OWNER_CAPTION_PRESETS[preset],
            background = ownerTextBackground(style);
          return {
            value: preset,
            label,
            preview: (
              <span
                className="typography-preset-sample"
                style={{
                  fontFamily: style.font ?? "Arial",
                  fontWeight: ownerTypographyWeight(style),
                  color: style.color,
                  WebkitTextStroke: `${Math.min(1, ownerTypographyOutline(style) / 12)}px ${style.outlineColor ?? "#000000"}`,
                  background: `color-mix(in srgb, ${background.color} ${background.opacity * 100}%, transparent)`,
                }}
              >
                Aa
              </span>
            ),
          };
        })}
      />
    </section>
  );
}
