import type { InputHTMLAttributes } from "react";

/** The native picker remains the sole editable value; hex is a readable swatch label. */
export function EditorColorControl({
  value,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value"> & {
  value: string;
}) {
  return (
    <span className="editor-color-control">
      <input {...props} type="color" value={value} />
      <output aria-hidden="true">{value.toUpperCase()}</output>
    </span>
  );
}
