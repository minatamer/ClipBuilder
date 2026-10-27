import { useLayoutEffect, useRef } from "react";
import type { OwnerOverlay } from "../../contracts/local/clips.ts";
import { slidingHighlight, type SlidingWordBox } from "./sliding-highlight.ts";

type Cue = OwnerOverlay["captions"][number]["wordCues"][number];

/** Offset metrics stay in logical pixels under both Player scaling and raster DPR. */
export function SlidingCaptionLine({
  tokens,
  cues,
  ms,
  color,
  wordPadding,
  fontKey,
}: {
  tokens: { word: string; cue: Cue }[];
  cues: readonly Cue[];
  ms: number;
  color: string;
  wordPadding: number;
  fontKey: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const layout = useRef<{ key: string; boxes: SlidingWordBox[] }>({
    key: "",
    boxes: [],
  });
  const layoutKey = JSON.stringify([
    tokens.map(({ word, cue }) => [word, cue.wordId]),
    wordPadding,
    fontKey,
  ]);
  useLayoutEffect(() => {
    if (layout.current.key !== layoutKey) {
      const measured: SlidingWordBox[] = [];
      for (const element of root.current?.querySelectorAll<HTMLSpanElement>(
        "[data-slide-word]",
      ) ?? []) {
        const wordId = element.dataset.slideWord!;
        const previous = measured.at(-1);
        if (previous?.wordId === wordId) {
          previous.width =
            element.offsetLeft + element.offsetWidth - previous.left;
        } else {
          measured.push({
            wordId,
            left: element.offsetLeft,
            top: element.offsetTop,
            width: element.offsetWidth,
            height: element.offsetHeight,
          });
        }
      }
      layout.current = { key: layoutKey, boxes: measured };
    }
    const highlight = slidingHighlight(layout.current.boxes, cues, ms);
    if (!panel.current) return;
    panel.current.style.display = highlight ? "block" : "none";
    if (highlight)
      for (const key of ["left", "top", "width", "height"] as const)
        panel.current.style[key] = `${highlight[key]}px`;
  }, [layoutKey, cues, ms]);
  return (
    <span ref={root} style={{ position: "relative", display: "inline-block" }}>
      <span
        ref={panel}
        aria-hidden="true"
        data-sliding-highlight="true"
        style={{
          display: "none",
          position: "absolute",
          borderRadius: 9,
          backgroundColor: color,
        }}
      />
      {tokens.map(({ word, cue }, index) => (
        <span key={index}>
          {index ? " " : ""}
          <span
            data-word-id={cue.wordId}
            data-slide-word={cue.wordId}
            style={{
              position: "relative",
              display: "inline-block",
              padding: `4px ${wordPadding}px`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
