import type { KeyboardEvent } from "react";
import { CircleAlert, type LucideIcon } from "lucide-react";

/** Compact inspector navigation; only the matching labelled panel is visible. */
export function ControlTabs<T extends string>({
  id,
  label,
  items,
  value,
  onChange,
  disabled = false,
  className = "control-tabs",
}: {
  id: string;
  label: string;
  items: readonly {
    value: T;
    label: string;
    icon?: LucideIcon;
    issue?: string | undefined;
  }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  function key(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (disabled) return;
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
    <div
      className={`editor-tab-strip ${className}`}
      role="tablist"
      aria-label={label}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            type="button"
            key={item.value}
            role="tab"
            disabled={disabled}
            id={`${id}-${item.value}`}
            aria-controls={`${id}-${item.value}-panel`}
            aria-selected={value === item.value}
            aria-label={item.issue ? item.label : undefined}
            aria-describedby={
              item.issue ? `${id}-${item.value}-issue` : undefined
            }
            tabIndex={value === item.value ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => key(event, index)}
          >
            {Icon && (
              <Icon
                className="editor-section-icon"
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                focusable="false"
              />
            )}
            <span>{item.label}</span>
            {item.issue && (
              <>
                <CircleAlert
                  size={14}
                  className="editor-tab-issue"
                  aria-hidden="true"
                />
                <span
                  className="local-sr-only"
                  id={`${id}-${item.value}-issue`}
                >
                  {item.issue}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
