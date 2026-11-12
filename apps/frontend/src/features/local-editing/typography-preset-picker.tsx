import {
  OWNER_CAPTION_PRESETS,
  type OwnerCaptionStyle,
  type OwnerCaptionPreset,
} from "../../../../../packages/contracts/local/editor.ts";
import { OwnerGlassWord } from "../../../../../packages/composition/local/glass-word.tsx";
import {
  OWNER_TEXT_PRESET_LABELS,
  ownerTextBackground,
  ownerTypographyOutline,
  ownerTypographyWeight,
  type OwnerTypography,
} from "../../../../../packages/contracts/local/text-style.ts";
import { EditorChoiceGrid } from "./editor-choice-grid";

function typographyChoices() {
  return Object.entries(OWNER_TEXT_PRESET_LABELS).map(([key, label]) => {
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
  });
}

export function CaptionPresetPicker({
  value,
  onChange,
}: {
  value: OwnerCaptionStyle;
  onChange: (preset: OwnerCaptionPreset) => void;
}) {
  return (
    <section className="editor-control-group" aria-label="Style presets">
      <h3>Style presets</h3>
      <EditorChoiceGrid<OwnerCaptionPreset>
        label="Style"
        value={value.material === "glass" ? "glass" : value.preset}
        onChange={onChange}
        items={[
          ...typographyChoices(),
          {
            value: "glass",
            label: "Glass",
            preview: (
              <span
                className="typography-preset-sample"
                style={{
                  fontFamily: OWNER_CAPTION_PRESETS.glass.font,
                  fontWeight: 900,
                }}
              >
                <OwnerGlassWord text="Aa" fontSize={22.4} color="#ffffff" />
              </span>
            ),
          },
        ]}
      />
    </section>
  );
}

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
        items={typographyChoices()}
      />
    </section>
  );
}
