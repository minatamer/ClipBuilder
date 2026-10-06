import {
  FIXED_COMPOSITION_POLICY,
  type CompositionManifestV3,
} from "@clipbuilder/contracts";
import { Img } from "remotion";

export const FIXED_LAYER_GEOMETRY = {
  card: { left: 80, top: 1040, width: 920, maxHeight: 380 },
  picture: { left: 80, top: 900, width: 920, height: 520 },
  caption: { left: 80, bottom: 220, width: 920, maxHeight: 200 },
} as const;
type Card = CompositionManifestV3["cards"][number];
type Caption = CompositionManifestV3["captions"][number];
export function ContextualCard({ card, ms }: { card: Card; ms: number }) {
  const fade = Math.min(
    1,
    Math.max(0, (ms - card.startMs) / 200),
    Math.max(0, (card.endMs - ms) / 200),
  );
  return (
    <div
      role="img"
      aria-label={[card.title, ...card.lines].join(". ")}
      style={{
        position: "absolute",
        ...FIXED_LAYER_GEOMETRY.card,
        overflow: "hidden",
        borderRadius: 24,
        opacity: fade,
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#172c38",
          backgroundImage: "linear-gradient(145deg, #24334b, #152131 70%)",
          border: "2px solid #7463e5",
          borderRadius: 24,
          overflowWrap: "anywhere",
          transform: `translateY(${(1 - fade) * 28}px) scale(${0.98 + fade * 0.02})`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            lineHeight: 1.2,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {card.title}
        </div>
        <div
          aria-hidden="true"
          style={{
            width: 120,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#a291ff",
            marginBottom: 16,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: card.kind === "comparison" ? "row" : "column",
            gap: 16,
          }}
        >
          {card.lines.map((line, i) => (
            <div
              key={i}
              style={{
                flex: card.kind === "comparison" ? 1 : undefined,
                minWidth: 0,
                padding: 16,
                borderRadius: 16,
                backgroundColor: "#101f29",
                borderLeft: "6px solid #a291ff",
                fontSize: 32,
                lineHeight: 1.3,
              }}
            >
              {card.kind === "steps" && (
                <div
                  style={{ color: "#8de5c5", fontSize: 28, marginBottom: 8 }}
                >
                  {i + 1}
                </div>
              )}
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function ContextualPicture({
  picture,
  ms,
}: {
  picture: NonNullable<CompositionManifestV3["pictures"]>[number];
  ms: number;
}) {
  const fade = Math.min(
    1,
    Math.max(0, (ms - picture.startMs) / 200),
    Math.max(0, (picture.endMs - ms) / 200),
  );
  return (
    <div
      style={{
        position: "absolute",
        ...FIXED_LAYER_GEOMETRY.picture,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        opacity: fade,
        transform: `translateY(${(1 - fade) * 20}px)`,
      }}
    >
      <Img
        src={picture.asset.dataUri}
        alt="Contextual picture"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: 20,
          boxShadow: "0 8px 32px #0008",
        }}
      />
    </div>
  );
}
export function FixedCaption({
  caption,
  ms,
}: {
  caption: Caption;
  ms: number;
}) {
  let index = 0;
  const lines = caption.lines;
  const tokens = caption.wordCues.flatMap((cue) =>
    cue.text.split(" ").map((word) => ({ word, cue })),
  );
  // Conservative fixed Arial advances keep ordinary short groups at 64px;
  // exceptionally wide/unbroken words shrink within the same safe area.
  const units = (line: string) =>
    Array.from(line).reduce(
      (total, char) =>
        total +
        (/[MWmw@%]/u.test(char) || (char.codePointAt(0) ?? 0) > 127
          ? 1
          : /[A-Z]/u.test(char)
            ? 0.9
            : /[ilj.,'!:; ]/u.test(char)
              ? 0.4
              : 0.7),
      0,
    );
  const fontSize = Math.min(
    FIXED_COMPOSITION_POLICY.captionFontSize,
    ...lines.map((line) =>
      Math.max(
        12,
        Math.floor(
          (FIXED_LAYER_GEOMETRY.caption.width - line.split(" ").length * 16) /
            Math.max(1, units(line)),
        ),
      ),
    ),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: FIXED_LAYER_GEOMETRY.caption.left,
        bottom: FIXED_LAYER_GEOMETRY.caption.bottom,
        width: FIXED_LAYER_GEOMETRY.caption.width,
        maxHeight: FIXED_LAYER_GEOMETRY.caption.maxHeight,
        boxSizing: "border-box",
        color: "#ffffff",
        textAlign: "center",
        fontSize,
        lineHeight: 1.2,
        fontWeight: 800,
        textShadow:
          "0 2px 2px #000, 2px 0 2px #000, -2px 0 2px #000, 0 -2px 2px #000",
        overflowWrap: "anywhere",
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          {line.split(" ").map((word, j) => {
            const cue = tokens[index++]!.cue;
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
                key={j}
                style={{
                  position: "relative",
                  display: "inline-block",
                  padding: "4px 8px",
                }}
              >
                {j ? " " : ""}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 9,
                    backgroundColor: "#7652d8",
                    opacity: highlighted ? 0.55 + onset * 0.45 : 0,
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
