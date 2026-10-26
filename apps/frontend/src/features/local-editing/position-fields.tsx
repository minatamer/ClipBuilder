import { Button } from "../../shared/ui/button";
import {
  centeredOwnerBox,
  type OwnerEditorBox,
  type OwnerTextGeometry,
} from "./editor-state.ts";

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
}: {
  label: string;
  style: OwnerTextGeometry;
  onChange: (box: OwnerEditorBox, centered?: boolean) => void;
}) {
  return (
    <>
      <div
        className="position-presets"
        role="group"
        aria-label={`${label} position`}
      >
        {(
          [
            { center: 0.25, label: "Upper half" },
            { center: 0.5, label: "Center" },
            { center: 0.75, label: "Lower half" },
          ] as const
        ).map((item) => (
          <Button
            key={item.center}
            variant="secondary"
            aria-pressed={
              Math.abs(style.box.y + style.box.height / 2 - item.center) <
                0.00001 &&
              Math.abs(style.box.x + style.box.width / 2 - 0.5) < 0.00001 &&
              style.verticalAlign === "center"
            }
            onClick={() =>
              onChange(centeredOwnerBox(style.box, item.center, style), true)
            }
          >
            {item.label}
          </Button>
        ))}
      </div>
      <BoxFields
        label={label}
        box={style.box}
        onChange={(box) => onChange(box)}
      />
    </>
  );
}
