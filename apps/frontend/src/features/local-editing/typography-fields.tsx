import {
  OWNER_TEXT_FONTS,
  OWNER_TEXT_PRESET_LABELS,
  ownerTextBackground,
  ownerTypographyWeight,
  ownerTypographyOutline,
  type OwnerTypography,
} from "../../../../../packages/contracts/local/text-style.ts";

/** One typography surface for caption words and independent text. */
export function TypographyFields({
  value,
  onChange,
  onPreset,
}: {
  value: OwnerTypography;
  onChange: (next: OwnerTypography) => void;
  onPreset: (preset: OwnerTypography["preset"]) => void;
}) {
  const background = ownerTextBackground(value);
  return (
    <div className="editor-fields typography-fields">
      <label>
        Style
        <select
          className="select-control"
          value={value.preset}
          onChange={(event) =>
            onPreset(event.currentTarget.value as OwnerTypography["preset"])
          }
        >
          {Object.entries(OWNER_TEXT_PRESET_LABELS).map(([preset, label]) => (
            <option key={preset} value={preset}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Font size
        <input
          type="number"
          min="24"
          max="120"
          step="1"
          value={Number.isFinite(value.fontSize) ? value.fontSize : ""}
          onChange={(event) =>
            onChange({
              ...value,
              fontSize:
                event.currentTarget.value === ""
                  ? NaN
                  : Number(event.currentTarget.value),
            })
          }
        />
      </label>
      <label>
        Font
        <select
          className="select-control"
          value={value.font ?? "Arial"}
          onChange={(event) =>
            onChange({
              ...value,
              font: event.currentTarget.value as NonNullable<
                OwnerTypography["font"]
              >,
            })
          }
        >
          {OWNER_TEXT_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </label>
      <label>
        Weight
        <select
          className="select-control"
          value={ownerTypographyWeight(value)}
          onChange={(event) =>
            onChange({
              ...value,
              fontWeight: Number(event.currentTarget.value) as NonNullable<
                OwnerTypography["fontWeight"]
              >,
            })
          }
        >
          {(
            [
              [400, "Regular"],
              [600, "Semibold"],
              [700, "Bold"],
              [800, "Extra bold"],
              [900, "Black"],
            ] as const
          ).map(([weight, label]) => (
            <option key={weight} value={weight}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Text color
        <input
          type="color"
          value={value.color}
          onChange={(event) =>
            onChange({ ...value, color: event.currentTarget.value })
          }
        />
      </label>
      <label>
        Alignment
        <select
          className="select-control"
          value={value.align}
          onChange={(event) =>
            onChange({
              ...value,
              align: event.currentTarget.value as OwnerTypography["align"],
            })
          }
        >
          {(["left", "center", "right"] as const).map((align) => (
            <option key={align} value={align}>
              {align[0]!.toUpperCase() + align.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Outline width
        <input
          type="number"
          min="0"
          max="12"
          step="1"
          value={ownerTypographyOutline(value)}
          onChange={(event) =>
            onChange({
              ...value,
              outlineWidth:
                event.currentTarget.value === ""
                  ? NaN
                  : Number(event.currentTarget.value),
            })
          }
        />
      </label>
      <label>
        Outline color
        <input
          type="color"
          value={value.outlineColor ?? "#000000"}
          onChange={(event) =>
            onChange({ ...value, outlineColor: event.currentTarget.value })
          }
        />
      </label>
      <label>
        Background color
        <input
          type="color"
          value={background.color}
          onChange={(event) =>
            onChange({ ...value, backgroundColor: event.currentTarget.value })
          }
        />
      </label>
      <label>
        Background opacity ({Math.round(background.opacity * 100)}%)
        <input
          aria-label="Background opacity"
          type="range"
          min="0"
          max="100"
          step="1"
          value={background.opacity * 100}
          onChange={(event) =>
            onChange({
              ...value,
              backgroundOpacity: Number(event.currentTarget.value) / 100,
            })
          }
        />
      </label>
    </div>
  );
}
