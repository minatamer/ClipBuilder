import type { KeyboardEvent } from "react";

/** Compact inspector navigation; only the matching labelled panel is visible. */
export function ControlTabs({
  id,
  label,
  items,
  value,
  onChange,
}: {
  id: string;
  label: string;
  items: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  function key(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      items[
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? items.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) %
              items.length
      ]!;
    onChange(next.value);
    document.getElementById(`${id}-${next.value}`)?.focus();
  }
  return (
    <div className="control-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <button
          type="button"
          key={item.value}
          role="tab"
          id={`${id}-${item.value}`}
          aria-controls={`${id}-${item.value}-panel`}
          aria-selected={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => key(event, index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
