import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { ControlTabs } from "./control-tabs.tsx";
import { TypographyFields } from "./typography-fields.tsx";
import { TextPositionFields } from "./position-fields.tsx";
import { PictureTiming } from "./picture-timing.tsx";
import { constrainOwnerBox } from "./editor-state.ts";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import { ownerTypographySchema } from "../../../../../packages/contracts/local/text-style.ts";
import {
  OWNER_TEXT_LIMITS,
  type OwnerTextLayer,
} from "../../../../../packages/contracts/local/text-layers.ts";

export function TextInspector({
  id,
  layers,
  selected,
  onSelect,
  onChange,
  onAdd,
  frames,
  player,
  available,
  attempt,
  tab,
  onTab,
}: {
  id: string;
  layers: OwnerTextLayer[];
  selected: string;
  onSelect: (layer: OwnerTextLayer) => void;
  onChange: (layers: OwnerTextLayer[]) => void;
  onAdd: () => void;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  tab: string;
  onTab: (tab: string) => void;
}) {
  const current = layers.find((layer) => layer.id === selected) ?? layers[0];
  const index = layers.findIndex((layer) => layer.id === current?.id);
  function setLayer(next: OwnerTextLayer) {
    onChange(layers.map((layer) => (layer.id === next.id ? next : layer)));
  }
  const items = [
    { value: "content", label: "Content" },
    { value: "style", label: "Style" },
    { value: "timing", label: "Timing" },
    { value: "position", label: "Position" },
  ];
  return (
    <>
      <div className="text-picker" role="group" aria-label="Text layers">
        {layers.map((layer, index) => (
          <Button
            key={layer.id}
            variant="secondary"
            className="text-choice"
            aria-label={`Edit text ${index + 1}`}
            aria-pressed={layer.id === current?.id}
            onClick={() => onSelect(layer)}
          >
            <span>Text {index + 1}</span>
            <span>{layer.text}</span>
          </Button>
        ))}
      </div>
      <div className="text-tools">
        <Button
          id={`${id}-add`}
          variant="secondary"
          icon={Plus}
          disabled={layers.length >= OWNER_TEXT_LIMITS.layers}
          onClick={onAdd}
        >
          Add text
        </Button>
        {current && (
          <Button
            variant="quiet"
            icon={Trash2}
            aria-label={`Remove text ${index + 1}`}
            onClick={() => {
              onChange(layers.filter((layer) => layer.id !== current.id));
              const next = layers[index + 1] ?? layers[index - 1];
              if (next) onSelect(next);
              else document.getElementById(`${id}-add`)?.focus();
            }}
          >
            Remove text
          </Button>
        )}
      </div>
      {!layers.length && <p>No text yet.</p>}
      {current && (
        <>
          <ControlTabs
            id={id}
            label="Text controls"
            items={items}
            value={tab}
            onChange={onTab}
          />
          {items.map((item) => (
            <div
              key={item.value}
              role="tabpanel"
              id={`${id}-${item.value}-panel`}
              aria-labelledby={`${id}-${item.value}`}
              hidden={tab !== item.value}
              tabIndex={0}
            >
              {item.value === "content" && (
                <label>
                  Text
                  <textarea
                    aria-label="Text content"
                    maxLength={OWNER_TEXT_LIMITS.characters}
                    rows={4}
                    value={current.text}
                    onChange={(event) =>
                      setLayer({ ...current, text: event.currentTarget.value })
                    }
                  />
                </label>
              )}
              {item.value === "style" && (
                <TypographyFields
                  value={current.style}
                  onChange={(style) =>
                    setLayer({
                      ...current,
                      style: {
                        ...current.style,
                        ...style,
                        box: Number.isFinite(style.fontSize)
                          ? constrainOwnerBox(current.style.box, {
                              ...current.style,
                              ...style,
                            })
                          : current.style.box,
                      },
                    })
                  }
                  onPreset={(preset) => {
                    const style = {
                      ...ownerTypographySchema
                        .strip()
                        .parse(OWNER_CAPTION_PRESETS[preset]),
                      align: current.style.align,
                      verticalAlign: current.style.verticalAlign,
                      box: current.style.box,
                    };
                    setLayer({
                      ...current,
                      style: {
                        ...style,
                        box: constrainOwnerBox(style.box, style),
                      },
                    });
                  }}
                />
              )}
              {item.value === "timing" && tab === "timing" && (
                <PictureTiming
                  cue={current}
                  frames={frames}
                  player={player}
                  available={available}
                  attempt={attempt}
                  label="Text"
                  onChange={setLayer}
                />
              )}
              {item.value === "position" && (
                <TextPositionFields
                  label="Text"
                  style={current.style}
                  onChange={(box, centered) =>
                    setLayer({
                      ...current,
                      style: {
                        ...current.style,
                        ...(centered
                          ? { align: "center", verticalAlign: "center" }
                          : {}),
                        box,
                      },
                    })
                  }
                />
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}
