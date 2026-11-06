import type { HTMLAttributes } from "react";
import type { OwnerTextLayer } from "../../contracts/local/text-layers.ts";
import { ownerCharacterStyleAt } from "../../contracts/local/text-ranges.ts";
import {
  ownerTypographyPaint,
  ownerTypographyBackground,
  ownerTextLineUnits,
} from "./text-paint.ts";

/** Identical bounded typography and wrapping in the editor and native overlay. */
export function OwnerStyledTextLayer({
  layer,
  editingProps,
}: {
  layer: OwnerTextLayer;
  editingProps?: HTMLAttributes<HTMLDivElement> | undefined;
}) {
  const { style } = layer,
    spans = layer.spans ?? [];
  const width = style.box.width * 1080,
    height = style.box.height * 1920;
  const runs: { start: number; end: number }[] = [];
  let start = 0;
  for (const span of spans) {
    if (start < span.start) runs.push({ start, end: span.start });
    runs.push({ start: span.start, end: span.end });
    start = span.end;
  }
  if (start < layer.text.length) runs.push({ start, end: layer.text.length });
  function fits(scale: number) {
    let used = 0,
      lineHeight = 0,
      total = 0;
    let cursor = 0;
    for (const word of layer.text.split(/(\s+)/u)) {
      let advance = 0,
        tallest = style.fontSize * scale * 1.4;
      for (const char of word) {
        const character = ownerCharacterStyleAt(spans, cursor);
        const size = (character.fontSize ?? style.fontSize) * scale;
        advance +=
          ownerTextLineUnits(char, character.font ?? style.font) * size;
        tallest = Math.max(tallest, size * 1.4);
        cursor += char.length;
      }
      if (word.includes("\n")) {
        total += Math.max(lineHeight, tallest) * word.split("\n").length;
        used = 0;
        lineHeight = 0;
      } else {
        if (used + advance > width - 48) {
          total += Math.max(lineHeight, tallest);
          used = 0;
          lineHeight = 0;
        }
        const extra = Math.max(
          0,
          Math.ceil(advance / Math.max(1, width - 48)) - 1,
        );
        total += extra * tallest;
        used += advance % Math.max(1, width - 48);
        lineHeight = Math.max(lineHeight, tallest);
      }
    }
    return total + lineHeight <= height - 40;
  }
  let lower = 1,
    upper = 1000;
  while (lower < upper) {
    const mid = Math.ceil((lower + upper) / 2);
    if (fits(mid / 1000)) lower = mid;
    else upper = mid - 1;
  }
  const scale = lower / 1000;
  return (
    <div
      data-text-layer={layer.id}
      data-text-preset={style.preset}
      style={{
        position: "absolute",
        left: style.box.x * 1080,
        top: style.box.y * 1920,
        width,
        height,
        padding: 8,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent:
          style.verticalAlign === "bottom" ? "flex-end" : "center",
        overflow: "hidden",
        ...ownerTypographyPaint(style),
        fontSize: style.fontSize * scale,
        lineHeight: 1.4,
      }}
    >
      <div
        {...editingProps}
        suppressContentEditableWarning
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          minHeight: "1.4em",
          outline: "none",
          ...ownerTypographyBackground(
            style,
            Math.min(1, (style.fontSize * scale) / 64),
          ),
          ...editingProps?.style,
        }}
      >
        {runs.map((run) => {
          const character = ownerCharacterStyleAt(spans, run.start);
          return (
            <span
              key={run.start}
              data-text-start={run.start}
              style={{
                ...ownerTypographyPaint({
                  ...style,
                  ...character,
                  color: character.color ?? style.color,
                  fontSize: character.fontSize ?? style.fontSize,
                }),
                textAlign: undefined,
                fontSize: (character.fontSize ?? style.fontSize) * scale,
                backgroundColor: character.highlightColor,
              }}
            >
              {layer.text.slice(run.start, run.end)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
