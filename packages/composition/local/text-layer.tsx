import type { OwnerTextLayer } from "../../contracts/local/text-layers.ts";
import { ownerTextBackground } from "../../contracts/local/text-style.ts";
import {
  ownerTypographyPaint,
  ownerTypographyBackground,
  ownerTextLineUnits,
} from "./text-paint.ts";

function wrapText(
  text: string,
  units: number,
  font: OwnerTextLayer["style"]["font"],
): string[] {
  return text.split("\n").flatMap((paragraph) => {
    const lines: string[] = [];
    let line = "",
      used = 0;
    const space = ownerTextLineUnits(" ", font);
    for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
      if (line && used + space + ownerTextLineUnits(word, font) > units) {
        lines.push(line);
        line = "";
        used = 0;
      }
      if (line) {
        line += " ";
        used += space;
      }
      for (const char of word) {
        const advance = ownerTextLineUnits(char, font);
        if (line && used + advance > units) {
          lines.push(line);
          line = "";
          used = 0;
        }
        line += char;
        used += advance;
      }
    }
    lines.push(line);
    return lines;
  });
}

export function OwnerTextLayerView({ layer }: { layer: OwnerTextLayer }) {
  const { style } = layer,
    width = style.box.width * 1080,
    height = style.box.height * 1920;
  const background = ownerTextBackground(style).opacity > 0;
  function layout(fontSize: number) {
    const scale = Math.min(1, fontSize / 64),
      gap = Math.min(12, fontSize * 0.2);
    const lines = wrapText(
      layer.text,
      (width - 16 - (background ? 24 * scale : 0)) / fontSize,
      style.font,
    );
    return {
      lines,
      scale,
      gap,
      fits:
        lines.length * (fontSize * 1.2 + gap + (background ? 12 * scale : 0)) <=
        height - 16,
    };
  }
  let lower = 1,
    upper = style.fontSize;
  while (lower < upper) {
    const size = Math.ceil((lower + upper) / 2);
    if (layout(size).fits) lower = size;
    else upper = size - 1;
  }
  const fontSize = lower,
    { lines, scale, gap } = layout(fontSize);
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
        boxSizing: "border-box",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent:
          style.verticalAlign === "bottom" ? "flex-end" : "center",
        overflow: "hidden",
        fontSize,
        lineHeight: 1.2,
        ...ownerTypographyPaint(style),
      }}
    >
      {lines.map((line, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent:
              style.align === "left"
                ? "flex-start"
                : style.align === "right"
                  ? "flex-end"
                  : "center",
            flexShrink: 0,
            paddingBlock: gap / 2,
          }}
        >
          <span
            style={{
              display: "block",
              whiteSpace: "pre",
              ...ownerTypographyBackground(style, scale),
            }}
          >
            {line || "\u00a0"}
          </span>
        </div>
      ))}
    </div>
  );
}
