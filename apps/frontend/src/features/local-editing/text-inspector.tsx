import { EditorColorControl } from "./editor-color-control";
import { useContext, useState, useRef, type RefObject } from "react";
import { TextSelectionContext } from "./text-selection.tsx";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { textLayerErrors } from "./text-validation.ts";
import {
  editOwnerStyledText,
  ownerCharacterStyleAt,
  styleOwnerTextRange,
  type OwnerCharacterStyle,
} from "../../../../../packages/contracts/local/text-ranges.ts";
import { EditorOccurrence, EditorHookClock } from "./editor-clock.ts";
import { ownerPresentationFrames } from "../../../../../packages/contracts/local/hook.ts";
import type { PlayerRef } from "@remotion/player";
import { Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "../../shared/ui/button";
import { ControlTabs } from "./control-tabs.tsx";
import { TypographyFields } from "./typography-fields.tsx";
import { TextPositionFields } from "./position-fields.tsx";
import { PictureTiming } from "./picture-timing.tsx";
import { constrainOwnerBox } from "./editor-state.ts";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import {
  ownerTypographySchema,
  OWNER_TITLE_TREATMENT_STYLES,
  ownerTypographyWeight,
  ownerTypographyOutline,
  type OwnerTypography,
} from "../../../../../packages/contracts/local/text-style.ts";
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
  hidePicker = false,
  feedback,
}: {
  id: string;
  hidePicker?: boolean;
  feedback?: string | undefined;
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
  const hook = useContext(EditorHookClock);
  const occurrence = useContext(EditorOccurrence);
  const session = useContext(TextSelectionContext);
  const [message, setMessage] = useState<{
    layerId: string;
    area: "content" | "style";
    text: string;
  } | null>(null);
  const replacement = useRef<{ start: number; end: number } | undefined>(
    undefined,
  );
  const current = layers.find((layer) => layer.id === selected) ?? layers[0];
  const index = layers.findIndex((layer) => layer.id === current?.id);
  const textFrames =
    current?.role === "opening-title"
      ? occurrence
        ? occurrence === "hook" && hook
          ? hook.endFrame - hook.startFrame
          : frames
        : ownerPresentationFrames({ frames, hook })
      : frames;
  const errors = current
    ? textLayerErrors(current, textFrames)
    : { content: undefined, timing: undefined, style: undefined };
  const contentError =
    errors.content ??
    (feedback || undefined) ??
    (message && message.layerId === current?.id && message.area === "content"
      ? message.text
      : undefined);
  function setLayer(next: OwnerTextLayer) {
    onChange(layers.map((layer) => (layer.id === next.id ? next : layer)));
  }
  const range =
    session && session.selection?.layerId === current?.id
      ? session.selection
      : null;
  const selectedRange = range && range.end > range.start ? range : null;
  const characterMode = !!selectedRange || !!range?.editing;
  const effective = (at: number): OwnerTypography => {
    const character = ownerCharacterStyleAt(current?.spans ?? [], at);
    return {
      ...current!.style,
      ...character,
      color: character.color ?? current!.style.color,
      fontSize: character.fontSize ?? current!.style.fontSize,
    };
  };
  const value = current
    ? selectedRange
      ? effective(selectedRange.start)
      : current.style
    : null;
  const mixed: (keyof OwnerTypography)[] = [];
  const highlightMixed =
    !!selectedRange &&
    Array.from(
      { length: selectedRange.end - selectedRange.start },
      (_, index) =>
        ownerCharacterStyleAt(current?.spans ?? [], selectedRange.start + index)
          .highlightColor,
    ).some(
      (color) =>
        color !==
        ownerCharacterStyleAt(current?.spans ?? [], selectedRange.start)
          .highlightColor,
    );
  if (selectedRange && value) {
    for (const key of [
      "color",
      "font",
      "fontSize",
      "fontWeight",
      "outlineColor",
      "outlineWidth",
    ] as const) {
      const read = (style: OwnerTypography) =>
        key === "fontWeight"
          ? ownerTypographyWeight(style)
          : key === "outlineWidth"
            ? ownerTypographyOutline(style)
            : key === "font"
              ? (style.font ?? "Arial")
              : key === "outlineColor"
                ? (style.outlineColor ?? "#000000")
                : style[key];
      for (let at = selectedRange.start; at < selectedRange.end; at++)
        if (read(effective(at)) !== read(value)) {
          mixed.push(key);
          break;
        }
    }
  }
  function styleSelection(patch: OwnerCharacterStyle | null) {
    if (!current || !selectedRange) return;
    try {
      setLayer({
        ...current,
        spans: styleOwnerTextRange(
          current.text,
          current.spans ?? [],
          selectedRange.start,
          selectedRange.end,
          patch,
        ),
      });
      setMessage(null);
    } catch (error) {
      setMessage({
        layerId: current.id,
        area: "style",
        text:
          error instanceof Error && error.message.includes("32")
            ? "Max 32 word styles."
            : "Couldn’t style selection.",
      });
    }
  }
  const items = [
    { value: "content", label: "Content" },
    { value: "style", label: "Style" },
    { value: "timing", label: "Timing" },
    { value: "position", label: "Position" },
  ];
  return (
    <>
      {!hidePicker && (
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
      )}
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
          <IconButton
            icon={Trash2}
            label={`Remove text ${index + 1}`}
            onClick={() => {
              onChange(layers.filter((layer) => layer.id !== current.id));
              const next = layers[index + 1] ?? layers[index - 1];
              if (next) onSelect(next);
              else document.getElementById(`${id}-add`)?.focus();
            }}
          />
        )}
      </div>
      {!layers.length && <p>No text yet.</p>}
      {current && (
        <>
          <div className="text-selection-tools">
            <Button
              variant="secondary"
              disabled={!available}
              onClick={() => session?.begin(current)}
            >
              Edit text in preview
            </Button>
            {range && (
              <Button variant="quiet" onClick={() => session?.whole()}>
                {range.editing ? "Done editing · Whole text" : "Whole text"}
              </Button>
            )}
            <span role="status">
              {selectedRange
                ? `Selected text: “${current.text.slice(selectedRange.start, selectedRange.end)}”`
                : range?.editing
                  ? "Select text to style"
                  : "Whole text"}
              {mixed.length || highlightMixed ? " · Mixed styles" : ""}
            </span>
          </div>
          <ControlTabs
            id={id}
            label="Text controls"
            items={items.map((item) => ({
              ...item,
              issue:
                item.value === "content"
                  ? contentError
                  : item.value === "timing"
                    ? errors.timing
                    : errors.style,
            }))}
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
                  <span className="text-field-heading">
                    Text
                    <InlineFeedback
                      id={`${id}-content-error`}
                      message={contentError}
                      inline
                    />
                  </span>
                  <textarea
                    aria-label="Text content"
                    aria-invalid={!!contentError || undefined}
                    aria-describedby={
                      contentError ? `${id}-content-error` : undefined
                    }
                    maxLength={OWNER_TEXT_LIMITS.characters}
                    rows={4}
                    value={current.text}
                    onFocus={(event) => {
                      player.current?.pause();
                      session?.select(
                        current,
                        event.currentTarget.selectionStart,
                        event.currentTarget.selectionEnd,
                        false,
                      );
                    }}
                    onBeforeInput={(event) => {
                      replacement.current = {
                        start: event.currentTarget.selectionStart,
                        end: event.currentTarget.selectionEnd,
                      };
                    }}
                    onSelect={(event) =>
                      session?.select(
                        current,
                        event.currentTarget.selectionStart,
                        event.currentTarget.selectionEnd,
                        false,
                      )
                    }
                    onChange={(event) => {
                      try {
                        setLayer({
                          ...current,
                          ...editOwnerStyledText(
                            current.text,
                            current.spans ?? [],
                            event.currentTarget.value,
                            undefined,
                            replacement.current,
                          ),
                        });
                        replacement.current = undefined;
                        setMessage(null);
                      } catch (error) {
                        setMessage({
                          layerId: current.id,
                          area: "content",
                          text:
                            error instanceof Error &&
                            error.message.includes("500")
                              ? "Max 500 characters."
                              : "Couldn’t edit text.",
                        });
                      }
                    }}
                  />
                </label>
              )}
              {item.value === "style" && (
                <>
                  {!characterMode && (
                    <div
                      className="title-treatments"
                      role="group"
                      aria-label="Title treatments"
                    >
                      {Object.entries(OWNER_TITLE_TREATMENT_STYLES).map(
                        ([name, treatment]) => (
                          <Button
                            key={name}
                            variant="secondary"
                            onClick={() => {
                              const style = {
                                ...treatment,
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
                          >
                            <span
                              style={{
                                fontFamily: treatment.font,
                                fontWeight: treatment.fontWeight,
                              }}
                            >
                              {name === "bold-hook"
                                ? "Bold hook"
                                : name === "highlight-panel"
                                  ? "Highlight panel"
                                  : name[0]!.toUpperCase() + name.slice(1)}
                            </span>
                          </Button>
                        ),
                      )}
                    </div>
                  )}
                  <fieldset disabled={characterMode && !selectedRange}>
                    <TypographyFields
                      feedback={
                        <InlineFeedback
                          message={
                            errors.style ??
                            (message?.layerId === current.id &&
                            message.area === "style"
                              ? message.text
                              : undefined)
                          }
                        />
                      }
                      value={value!}
                      characterOnly={characterMode}
                      mixed={mixed}
                      onChange={(style, property) => {
                        if (characterMode) {
                          const patch: OwnerCharacterStyle = {};
                          for (const key of [
                            "color",
                            "font",
                            "fontSize",
                            "fontWeight",
                            "outlineColor",
                            "outlineWidth",
                          ] as const)
                            if (property === key)
                              Object.assign(patch, { [key]: style[key] });
                          styleSelection(patch);
                          return;
                        }
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
                        });
                      }}
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
                    {characterMode && (
                      <div
                        className="text-accent-tools"
                        role="group"
                        aria-label="Word styling"
                      >
                        {(
                          [
                            ["Red", "#FF3B30"],
                            ["Yellow", "#FFD60A"],
                            ["Cyan", "#64D2FF"],
                          ] as const
                        ).map(([label, color]) => (
                          <Button
                            key={color}
                            variant="secondary"
                            onClick={() => styleSelection({ color })}
                          >
                            {label}
                          </Button>
                        ))}
                        <label>
                          Word highlight
                          {highlightMixed && <span>Mixed</span>}
                          <EditorColorControl
                            value={
                              selectedRange
                                ? (ownerCharacterStyleAt(
                                    current.spans ?? [],
                                    selectedRange.start,
                                  ).highlightColor ?? "#FFD60A")
                                : "#FFD60A"
                            }
                            onChange={(event) =>
                              styleSelection({
                                highlightColor: event.currentTarget.value,
                              })
                            }
                          />
                        </label>
                        <Button
                          variant="quiet"
                          onClick={() => styleSelection(null)}
                        >
                          Clear selection styling
                        </Button>
                      </div>
                    )}
                  </fieldset>
                  {!characterMode && !!current.spans?.length && (
                    <Button
                      variant="quiet"
                      onClick={() => setLayer({ ...current, spans: [] })}
                    >
                      Reset word styles
                    </Button>
                  )}
                </>
              )}
              {item.value === "timing" && tab === "timing" && (
                <>
                  <PictureTiming
                    cue={current}
                    frames={textFrames}
                    presentationClock={current.role === "opening-title"}
                    player={player}
                    available={available}
                    attempt={attempt}
                    label="Text"
                    onChange={setLayer}
                  />
                  <InlineFeedback message={errors.timing} />
                </>
              )}
              {item.value === "position" && (
                <>
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
                  <InlineFeedback message={errors.style} />
                </>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}
