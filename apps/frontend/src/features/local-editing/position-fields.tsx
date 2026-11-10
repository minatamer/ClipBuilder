import type { OwnerEditorBox, OwnerTextGeometry } from "./editor-state.ts";
import { PositionPresets } from "./position-presets";

export function BoxFields({
  label,
  box,
  onChange,
}: {
  label: string;
  box: OwnerEditorBox;
  onChange: (box: OwnerEditorBox) => void;
}) {
  return (
    <details className="geometry-controls">
      <summary>Position and size</summary>
      <div className="editor-box-fields">
        {(["x", "y", "width", "height"] as const).map((key) => (
          <label key={key}>
            {label} {key} (0–1)
            <input
              type="number"
              step="0.005"
              min="0"
              max="1"
              value={Number.isFinite(box[key]) ? box[key] : ""}
              onChange={(event) =>
                onChange({
                  ...box,
                  [key]:
                    event.currentTarget.value === ""
                      ? NaN
                      : Number(event.currentTarget.value),
                })
              }
            />
          </label>
        ))}
      </div>
    </details>
  );
}
export function TextPositionFields({
  label,
  style,
  onChange,
  defaultCenter,
}: {
  label: string;
  style: OwnerTextGeometry;
  onChange: (box: OwnerEditorBox, centered?: boolean) => void;
  defaultCenter?: number | undefined;
}) {
  return (
    <>
      <PositionPresets
        label={label}
        box={style.box}
        geometry={style}
        defaultCenter={defaultCenter}
        onChange={(box) => onChange(box, true)}
      />
      <BoxFields
        label={label}
        box={style.box}
        onChange={(box) => onChange(box)}
      />
    </>
  );
}
