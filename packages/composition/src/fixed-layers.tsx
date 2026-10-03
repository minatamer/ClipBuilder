import type { CompositionManifestV2 } from "@clipbuilder/contracts";

export const FIXED_LAYER_GEOMETRY = {
  card: { left: 80, top: 200, width: 920, height: 1200 },
  caption: { left: 80, bottom: 220, width: 920, maxHeight: 200 },
} as const;
type Card = CompositionManifestV2["cards"][number];
type Caption = CompositionManifestV2["captions"][number];
export function ContextualCard({ card, ms }: { card: Card; ms: number }) {
  const fade = Math.min(
    1,
    Math.max(0, (ms - card.startMs) / 200),
    Math.max(0, (card.endMs - ms) / 200),
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#101215",
        opacity: fade,
      }}
    >
      <div
        style={{
          position: "absolute",
          ...FIXED_LAYER_GEOMETRY.card,
          boxSizing: "border-box",
          padding: 48,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#172c38",
          borderRadius: 24,
          overflowWrap: "anywhere",
        }}
      >
        <div
          style={{
            fontSize: 56,
            lineHeight: 1.2,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          {card.title}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: card.kind === "comparison" ? "row" : "column",
            gap: 28,
          }}
        >
          {card.lines.map((line, i) => (
            <div
              key={i}
              style={{
                flex: card.kind === "comparison" ? 1 : undefined,
                minWidth: 0,
                padding: 24,
                borderRadius: 16,
                backgroundColor: "#101f29",
                fontSize: 38,
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
export function FixedCaption({ caption }: { caption: Caption }) {
  let index = 0;
  const lines = caption.lines ?? [caption.text];
  const longestLine = Math.max(...lines.map((line) => Array.from(line).length));
  // Bound wrapping even for wide glyphs or an exceptional unbroken 80-character word.
  const fontSize =
    longestLine > 32 ? 24 : longestLine > 24 ? 30 : longestLine > 16 ? 36 : 52;
  return (
    <div
      style={{
        position: "absolute",
        left: FIXED_LAYER_GEOMETRY.caption.left,
        bottom: FIXED_LAYER_GEOMETRY.caption.bottom,
        width: FIXED_LAYER_GEOMETRY.caption.width,
        maxHeight: FIXED_LAYER_GEOMETRY.caption.maxHeight,
        boxSizing: "border-box",
        padding: 28,
        backgroundColor: "#101215",
        color: "#faf4e9",
        borderRadius: 16,
        textAlign: "center",
        fontSize,
        lineHeight: 1.2,
        fontWeight: 600,
        overflowWrap: "anywhere",
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          {line.split(" ").map((word, j) => {
            const highlighted = index++ === caption.emphasisWordIndex;
            return (
              <span
                key={j}
                style={{ color: highlighted ? "#8de5c5" : undefined }}
              >
                {j ? " " : ""}
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
