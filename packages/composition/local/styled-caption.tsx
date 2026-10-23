import { FIXED_COMPOSITION_POLICY } from "@clipbuilder/contracts";
import type { OwnerOverlay } from "../../contracts/local/clips.ts";
import {
  ownerCaptionStyleSchema,
  type OwnerCaptionStyle,
} from "../../contracts/local/editor.ts";

type Caption = OwnerOverlay["captions"][number];
const weights: Record<OwnerCaptionStyle["preset"], number> = {
  clean: 800,
  classic: 700,
  bold: 900,
};

/** Conservative local-font advances, without browser measurement or reflow. */
function lineUnits(line: string, font: OwnerCaptionStyle["font"]) {
  if (font === "Courier New")
    return Array.from(line).reduce(
      (sum, char) => sum + ((char.codePointAt(0) ?? 0) > 127 ? 1.2 : 0.65),
      0,
    );
  return (
    Array.from(line).reduce(
      (total, char) =>
        total +
        (/[MWmw@%]/u.test(char) || (char.codePointAt(0) ?? 0) > 127
          ? 1.1
          : /[A-Z]/u.test(char)
            ? 0.9
            : /[ilj.,'!:; ]/u.test(char)
              ? 0.4
              : 0.7),
      0,
    ) * (font && font !== "Arial" ? 1.15 : 1)
  );
}

/** Fixed timed words inside a validated owner box; no text or timing edits. */
export function OwnerStyledCaption({
  caption,
  ms,
  style: suppliedStyle,
}: {
  caption: Caption;
  ms: number;
  style: OwnerCaptionStyle;
}) {
  const style = ownerCaptionStyleSchema.parse(suppliedStyle);
  if (!Number.isFinite(ms) || ms < caption.startMs || ms >= caption.endMs)
    return null;
  const tokens = caption.wordCues.flatMap((cue) =>
    cue.text.split(" ").map((word) => ({ word, cue })),
  );
  if (
    caption.lines.length < 1 ||
    caption.lines.length > 2 ||
    caption.lines.join(" ") !== caption.text ||
    tokens.map((token) => token.word).join(" ") !== caption.text
  )
    throw new Error("invalid_owner_caption");
  const width = style.box.width * 1080,
    height = style.box.height * 1920,
    wordPadding = Math.min(
      8,
      width /
        (Math.max(...caption.lines.map((line) => line.split(" ").length)) * 4),
    ),
    fontSize = Math.max(
      1,
      Math.min(
        style.fontSize,
        Math.floor((height / caption.lines.length - 8) / 1.2),
        ...caption.lines.map((line) =>
          Math.floor(
            (width - line.split(" ").length * wordPadding * 2) /
              Math.max(1, lineUnits(line, style.font)),
          ),
        ),
      ),
    );
  let tokenIndex = 0;
  return (
    <div
      data-caption-preset={style.preset}
      style={{
        position: "absolute",
        left: style.box.x * 1080,
        top: style.box.y * 1920,
        width,
        height,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        fontFamily: style.font ?? "Arial",
        opacity:
          style.animation === "fade"
            ? Math.min(1, (ms - caption.startMs) / 120)
            : undefined,
        color: style.color,
        textAlign: style.align,
        fontSize,
        lineHeight: 1.2,
        fontWeight: weights[style.preset],
        textShadow:
          "0 2px 2px #000, 2px 0 2px #000, -2px 0 2px #000, 0 -2px 2px #000",
      }}
    >
      {caption.lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          data-caption-line={lineIndex}
          style={{ flexShrink: 0, whiteSpace: "nowrap" }}
        >
          {line.split(" ").map((word, wordIndex) => {
            const { cue } = tokens[tokenIndex++]!;
            const highlighted = cue.startMs <= ms && ms < cue.endMs;
            const onset = Math.min(
              1,
              Math.max(
                0,
                (ms - cue.startMs) / FIXED_COMPOSITION_POLICY.spokenWordOnsetMs,
              ),
            );
            return (
              <span
                key={wordIndex}
                data-word-id={cue.wordId}
                style={{
                  position: "relative",
                  display: "inline-block",
                  padding: `4px ${wordPadding}px`,
                  transform:
                    style.animation === "pop" && highlighted
                      ? `scale(${0.88 + onset * 0.12})`
                      : undefined,
                }}
              >
                {wordIndex ? " " : ""}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 9,
                    backgroundColor: style.highlight,
                    opacity:
                      highlighted &&
                      (style.animation === undefined ||
                        style.animation === "highlight" ||
                        style.animation === "pop")
                        ? 0.55 + onset * 0.45
                        : 0,
                    transform: `scale(${highlighted ? 0.92 + onset * 0.08 : 1})`,
                  }}
                />
                <span style={{ position: "relative" }}>{word}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
