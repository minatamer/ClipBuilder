import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "../../shared/ui/button";

/** A single keyboard-accessible visual picker for existing preset values. */
export function EditorChoiceGrid<T extends string>({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: T;
  items: readonly { value: T; label: string; preview: ReactNode }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="editor-choice-grid" role="radiogroup" aria-label={label}>
      {items.map((item, index) => (
        <Button
          key={item.value}
          id={`${id}-${index}`}
          variant="secondary"
          role="radio"
          aria-label={item.label}
          aria-checked={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          className="editor-choice"
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => {
            if (
              ![
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
              ].includes(event.key)
            )
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? items.length - 1
                  : (index +
                      (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) +
                      items.length) %
                    items.length;
            onChange(items[next]!.value);
            document.getElementById(`${id}-${next}`)?.focus();
          }}
        >
          <span className="editor-choice-preview" aria-hidden="true">
            {item.preview}
          </span>
          <span className="editor-choice-name">{item.label}</span>
          {value === item.value && (
            <Check
              className="editor-choice-check"
              size={14}
              aria-hidden="true"
            />
          )}
        </Button>
      ))}
    </div>
  );
}
