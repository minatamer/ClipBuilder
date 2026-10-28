import { FIXED_COMPOSITION_POLICY } from "@clipbuilder/contracts";
import type { OwnerOverlay } from "../../contracts/local/clips.ts";
import {
  ownerCaptionStyleSchema,
  type OwnerCaptionStyle,
} from "../../contracts/local/editor.ts";
import {
  ownerTypographyPaint,
  ownerTypographyBackground,
  ownerTextLineUnits,
} from "./text-paint.ts";
import { ownerTextBackground } from "../../contracts/local/text-style.ts";
import { SlidingCaptionLine } from "./sliding-caption-line.tsx";
import type { OwnerSpeakerColor } from "../../contracts/local/caption-speakers.ts";

type Caption = OwnerOverlay["captions"][number];

/** Fixed timed words inside a validated owner box; no text or timing edits. */
export function OwnerStyledCaption({
  caption,
  ms,
  style: suppliedStyle,
  colors,
}: {
  caption: Caption;
  ms: number;
  style: OwnerCaptionStyle;
  colors?: OwnerSpeakerColor;
}) {
  const style = ownerCaptionStyleSchema.parse({
    ...suppliedStyle,
    ...(colors
      ? {
          color: colors.color,
          backgroundColor: colors.backgroundColor,
          highlight: colors.highlight,
        }
      : {}),
  });
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
  const legacyBoxed =
    style.preset === "boxed" &&
    suppliedStyle.backgroundColor === undefined &&
    suppliedStyle.backgroundOpacity === undefined;
  const block = style.preset === "solid-block";
  const paint = ownerTypographyPaint(style);
  const width = style.box.width * 1080,
    height = style.box.height * 1920,
    backgroundPadding =
      !legacyBoxed && ownerTextBackground(style).opacity ? 24 : 0,
    wordPadding = Math.min(
      8,
      width /
        (Math.max(...caption.lines.map((line) => line.split(" ").length)) * 4),
    ),
    fontSize = Math.max(
      1,
      Math.min(
        style.fontSize,
        Math.floor(
          ((height - (block ? backgroundPadding : 0)) / caption.lines.length -
            8 -
            (block ? 0 : backgroundPadding)) /
            1.2,
        ),
        ...caption.lines.map((line) =>
          Math.floor(
            (width -
              backgroundPadding -
              line.split(" ").length * wordPadding * 2) /
              Math.max(1, ownerTextLineUnits(line, style.font)),
          ),
        ),
      ),
    );
  const lines = caption.lines.map((line, lineIndex) => {
    const tokenIndex = caption.lines
      .slice(0, lineIndex)
      .reduce((sum, text) => sum + text.split(" ").length, 0);
    const lineTokens = tokens.slice(
      tokenIndex,
      tokenIndex + line.split(" ").length,
    );
    return (
      <div
        key={lineIndex}
        data-caption-line={lineIndex}
        style={{
          flexShrink: 0,
          whiteSpace: "nowrap",
          paddingBlock: backgroundPadding && !block ? 6 : undefined,
        }}
      >
        <span
          style={
            legacyBoxed || block ? undefined : ownerTypographyBackground(style)
          }
        >
          {style.animation === "slide" ? (
            <SlidingCaptionLine
              tokens={lineTokens}
              cues={caption.wordCues}
              ms={ms}
              color={style.highlight}
              wordPadding={wordPadding}
              fontKey={JSON.stringify([
                paint.fontFamily,
                paint.fontWeight,
                fontSize,
              ])}
            />
          ) : (
            lineTokens.map(({ word, cue }, wordIndex) => {
              const highlighted = cue.startMs <= ms && ms < cue.endMs;
              const onset = Math.min(
                1,
                Math.max(
                  0,
                  (ms - cue.startMs) /
                    FIXED_COMPOSITION_POLICY.spokenWordOnsetMs,
                ),
              );
              const single = style.animation === "single-word";
              if (single && !highlighted) return null;
              const bounce = Math.min(1, Math.max(0, (ms - cue.startMs) / 220));
              return (
                <span
                  key={wordIndex}
                  data-word-id={cue.wordId}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    padding: `4px ${wordPadding}px`,
                    opacity:
                      style.animation === "reveal"
                        ? ms < cue.startMs
                          ? 0
                          : 1
                        : undefined,
                    backgroundColor: legacyBoxed
                      ? ownerTextBackground(style).color
                      : undefined,
                    borderRadius: legacyBoxed ? 9 : undefined,
                    transform:
                      style.animation === "bounce" && highlighted
                        ? `translateY(${-Math.sin(bounce * Math.PI) * fontSize * 0.2}px) scale(${1 + Math.sin(bounce * Math.PI) * 0.12})`
                        : style.animation === "pop" && highlighted
                          ? `scale(${0.88 + onset * 0.12})`
                          : undefined,
                  }}
                >
                  {wordIndex && !single ? " " : ""}
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
            })
          )}
        </span>
      </div>
    );
  });
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
        justifyContent:
          style.verticalAlign === "center" ? "center" : "flex-end",
        overflow: "hidden",
        ...paint,
        opacity:
          style.animation === "fade"
            ? Math.min(1, (ms - caption.startMs) / 120)
            : undefined,
        color: style.color,
        textAlign: style.align,
        fontSize,
        lineHeight: 1.2,
      }}
    >
      {block ? (
        <div
          data-caption-panel="true"
          style={{
            ...ownerTypographyBackground(style),
            width: "max-content",
            maxWidth: "100%",
            boxSizing: "border-box",
            alignSelf:
              style.align === "left"
                ? "flex-start"
                : style.align === "right"
                  ? "flex-end"
                  : "center",
            flexShrink: 0,
          }}
        >
          {lines}
        </div>
      ) : (
        lines
      )}
    </div>
  );
}
