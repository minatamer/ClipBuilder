import { EditorColorControl } from "./editor-color-control";
import { useId, type ReactNode } from "react";
import { TypographyPresetPicker } from "./typography-preset-picker";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import {
  OWNER_TEXT_FONTS,
  OWNER_FONT_SIZE,
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
  characterOnly = false,
  backgroundControls = true,
  mixed = [],
  feedback,
  presetPicker,
}: {
  value: OwnerTypography;
  onChange: (next: OwnerTypography, property?: keyof OwnerTypography) => void;
  onPreset: (preset: OwnerTypography["preset"]) => void;
  characterOnly?: boolean;
  backgroundControls?: boolean;
  mixed?: readonly (keyof OwnerTypography)[];
  feedback?: ReactNode;
  presetPicker?: ReactNode;
}) {
  const background = ownerTextBackground(value);
  const id = useId();
  const sizeError =
    !mixed.includes("fontSize") &&
    (!Number.isInteger(value.fontSize) ||
      value.fontSize < OWNER_FONT_SIZE.min ||
      value.fontSize > OWNER_FONT_SIZE.max)
      ? `Use ${OWNER_FONT_SIZE.min}–${OWNER_FONT_SIZE.max}.`
      : undefined;
  const outlineError =
    !mixed.includes("outlineWidth") &&
    (!Number.isInteger(ownerTypographyOutline(value)) ||
      ownerTypographyOutline(value) < 0 ||
      ownerTypographyOutline(value) > 12)
      ? "Use 0–12."
      : undefined;
  return (
    <div className="typography-editor">
      {!characterOnly &&
        (presetPicker ?? (
          <TypographyPresetPicker value={value.preset} onChange={onPreset} />
        ))}
      <section className="editor-control-group" aria-label="Typography">
        <h3>Typography</h3>
        <div className="editor-fields typography-fields">
          <label>
            Font size
            <input
              aria-label="Font size"
              type="number"
              min={OWNER_FONT_SIZE.min}
              max={OWNER_FONT_SIZE.max}
              step="1"
              placeholder={mixed.includes("fontSize") ? "Mixed" : undefined}
              aria-invalid={!!sizeError || undefined}
              aria-describedby={sizeError ? `${id}-size-error` : undefined}
              value={
                !mixed.includes("fontSize") && Number.isFinite(value.fontSize)
                  ? value.fontSize
                  : ""
              }
              onChange={(event) =>
                onChange(
                  {
                    ...value,
                    fontSize:
                      event.currentTarget.value === ""
                        ? NaN
                        : Number(event.currentTarget.value),
                  },
                  "fontSize",
                )
              }
            />
            <InlineFeedback id={`${id}-size-error`} message={sizeError} />
          </label>
          <label>
            Font
            <select
              className="select-control"
              value={mixed.includes("font") ? "" : (value.font ?? "Arial")}
              onChange={(event) =>
                onChange(
                  {
                    ...value,
                    font: event.currentTarget.value as NonNullable<
                      OwnerTypography["font"]
                    >,
                  },
                  "font",
                )
              }
            >
              {mixed.includes("font") && (
                <option value="" disabled>
                  Mixed
                </option>
              )}
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
              value={
                mixed.includes("fontWeight") ? "" : ownerTypographyWeight(value)
              }
              onChange={(event) =>
                onChange(
                  {
                    ...value,
                    fontWeight: Number(
                      event.currentTarget.value,
                    ) as NonNullable<OwnerTypography["fontWeight"]>,
                  },
                  "fontWeight",
                )
              }
            >
              {mixed.includes("fontWeight") && (
                <option value="" disabled>
                  Mixed
                </option>
              )}
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
          {!characterOnly && (
            <label>
              Alignment
              <select
                className="select-control"
                value={value.align}
                onChange={(event) =>
                  onChange(
                    {
                      ...value,
                      align: event.currentTarget
                        .value as OwnerTypography["align"],
                    },
                    "align",
                  )
                }
              >
                {(["left", "center", "right"] as const).map((align) => (
                  <option key={align} value={align}>
                    {align[0]!.toUpperCase() + align.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>
      <section className="editor-control-group" aria-label="Colour and outline">
        <h3>Colour and outline</h3>
        <div className="editor-fields typography-fields">
          <label>
            <span className="typography-field-heading">
              Text color
              {mixed.includes("color") && <small>Mixed</small>}
            </span>
            <EditorColorControl
              value={value.color}
              onChange={(event) =>
                onChange(
                  { ...value, color: event.currentTarget.value },
                  "color",
                )
              }
            />
          </label>
          <label>
            Outline width
            <input
              aria-label="Outline width"
              type="number"
              min="0"
              max="12"
              step="1"
              placeholder={mixed.includes("outlineWidth") ? "Mixed" : undefined}
              aria-invalid={!!outlineError || undefined}
              aria-describedby={
                outlineError ? `${id}-outline-error` : undefined
              }
              value={
                mixed.includes("outlineWidth") ||
                !Number.isFinite(ownerTypographyOutline(value))
                  ? ""
                  : ownerTypographyOutline(value)
              }
              onChange={(event) =>
                onChange(
                  {
                    ...value,
                    outlineWidth:
                      event.currentTarget.value === ""
                        ? NaN
                        : Number(event.currentTarget.value),
                  },
                  "outlineWidth",
                )
              }
            />
            <InlineFeedback id={`${id}-outline-error`} message={outlineError} />
          </label>
          <label>
            <span className="typography-field-heading">
              Outline color
              {mixed.includes("outlineColor") && <small>Mixed</small>}
            </span>
            <EditorColorControl
              value={value.outlineColor ?? "#000000"}
              onChange={(event) =>
                onChange(
                  { ...value, outlineColor: event.currentTarget.value },
                  "outlineColor",
                )
              }
            />
          </label>
          {!characterOnly && backgroundControls && (
            <label>
              Background color
              <EditorColorControl
                value={background.color}
                onChange={(event) =>
                  onChange(
                    { ...value, backgroundColor: event.currentTarget.value },
                    "backgroundColor",
                  )
                }
              />
            </label>
          )}
          {!characterOnly && backgroundControls && (
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
                  onChange(
                    {
                      ...value,
                      backgroundOpacity:
                        Number(event.currentTarget.value) / 100,
                    },
                    "backgroundOpacity",
                  )
                }
              />
            </label>
          )}
        </div>
      </section>
      {feedback && (
        <div
          className="typography-feedback"
          aria-hidden={!!(sizeError || outlineError) || undefined}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
