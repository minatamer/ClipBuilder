import type { ReactNode } from "react";
import { FILM_COPY, FILM_OPENING_FRAME } from "./film-timeline";
import {
  conversationRect,
  filmNarrative,
  sceneProgress,
  type FilmRect,
} from "./film-choreography";
import { IllustratedConversation } from "./illustrated-conversation";

export const FILM_BACKGROUND =
  "radial-gradient(ellipse at 78% 63%, #163768 0%, #091a37 46%, #050e20 100%)";
export const FILM_FONT = '"Segoe UI", Arial, sans-serif';
const identityLength = (value: number, responsive: boolean) =>
  responsive ? `${value / 19.2}cqw` : value;

export function FilmBrand({
  size = 64,
  responsive = false,
}: {
  size?: number;
  responsive?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: identityLength(size * 0.25, responsive),
        fontSize: identityLength(size * 0.55, responsive),
        fontWeight: 750,
        letterSpacing: identityLength(-1, responsive),
      }}
    >
      <svg
        width={size}
        height={size}
        style={
          responsive
            ? {
                width: identityLength(size, true),
                height: identityLength(size, true),
              }
            : undefined
        }
        viewBox="0 0 80 80"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="78"
          height="78"
          rx="23"
          fill="#407cf0"
          stroke="#a9ceff"
        />
        <path
          d="M22 31L59 26M22 48L49 52"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
      ClipBuilder
    </div>
  );
}

/** Shared artwork is one object; typography never reveals or masks its surface. */
export function FilmConversationPanel({
  rect,
  opacity = 1,
  children,
  portraitAmount = 0,
  portrait = false,
  immersion = 0,
  responsive = false,
}: {
  rect: FilmRect;
  opacity?: number;
  children?: ReactNode;
  portraitAmount?: number;
  portrait?: boolean;
  immersion?: number;
  responsive?: boolean;
}) {
  return (
    <div
      data-film-demo
      data-film-conversation
      data-film-portrait={portrait ? true : undefined}
      style={{
        position: "absolute",
        left: identityLength(rect.x, responsive),
        top: identityLength(rect.y, responsive),
        width: responsive ? "100%" : rect.width,
        height: responsive ? "100%" : rect.height,
        opacity,
        overflow: "hidden",
        borderRadius: 36 * (1 - immersion),
        border: `${2 * (1 - immersion)}px solid #a9ceff55`,
        background: "#142b55",
        boxShadow: `0 40px 110px rgba(0,0,0,${0.5 * (1 - immersion)})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: identityLength(-20, responsive),
          left: identityLength(-20 + 1040 * immersion, responsive),
          right: identityLength(-20 - 440 * immersion, responsive),
          maskImage: `linear-gradient(90deg,rgba(0,0,0,${1 - immersion}) 0px,#000 ${responsive ? identityLength(220 * immersion, true) : `${220 * immersion}px`})`,
          transform: "scale(1.02)",
        }}
      >
        <IllustratedConversation
          frame={FILM_OPENING_FRAME}
          portraitAmount={portraitAmount}
          showLabel={false}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(transparent 65%,#06152b99)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: immersion,
          background:
            "linear-gradient(90deg,#050e20 0%,#07162d 35%,#07162dc4 49%,#07162d00 72%)",
        }}
      />
      {children}
    </div>
  );
}

export function FilmIdentityHeadline({
  height,
  closing = false,
  frame = 25,
  mode = "steady",
  responsive = false,
}: {
  height: number;
  closing?: boolean;
  frame?: number;
  mode?: "in" | "out" | "steady";
  responsive?: boolean;
}) {
  const layout = filmNarrative(closing ? "close" : "identity", frame, height);
  const rootOpacity =
    mode === "out"
      ? 1 - sceneProgress(frame, 0, 8)
      : mode === "in"
        ? sceneProgress(frame, 8, 9)
        : 1;
  return (
    <div
      data-film-copy
      data-film-title
      data-film-identity-type
      style={{
        position: "absolute",
        left: identityLength(layout.rect.x, responsive),
        top: responsive ? `${(layout.rect.y / height) * 100}%` : layout.rect.y,
        width: identityLength(layout.rect.width, responsive),
        fontSize: identityLength(layout.fontSize, responsive),
        fontWeight: 780,
        lineHeight: 1.01,
        zIndex: 4,
        letterSpacing: identityLength(-7, responsive),
        opacity: rootOpacity,
      }}
    >
      {FILM_COPY[closing ? "close" : "identity"].title
        .split("\n")
        .map((line, lineIndex) => (
          <span
            key={line}
            style={{
              display: "block",
              whiteSpace: "pre",
              color: lineIndex === 1 ? "#a9ceff" : undefined,
            }}
          >
            {[...line].map((letter, index) => {
              const enter =
                mode === "in"
                  ? sceneProgress(
                      frame,
                      8 + lineIndex * 2 + index * 0.14,
                      18 + lineIndex * 2 + index * 0.14,
                    )
                  : 1;
              const exit =
                mode === "out"
                  ? sceneProgress(frame, index * 0.08, 6 + index * 0.08)
                  : 0;
              return (
                <span
                  key={index}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    opacity: enter * (1 - exit),
                    transform: `translateY(${(1 - enter) * 18 - exit * 10}px) scaleY(${0.96 + 0.04 * enter})`,
                    transformOrigin: "50% 100%",
                    filter: `blur(${(1 - enter) * 2 + exit * 2}px)`,
                  }}
                >
                  {letter}
                </span>
              );
            })}
          </span>
        ))}
    </div>
  );
}

/** Same complete opening primitives as the live stage; no raster re-generation. */
export function FilmIdentity({
  height,
  enter,
  responsive = false,
}: {
  height: number;
  enter: number;
  responsive?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: FILM_BACKGROUND,
        color: "#f0f5ff",
        fontFamily: FILM_FONT,
        opacity: enter,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: identityLength(80, responsive),
          top: identityLength(64, responsive),
          zIndex: 5,
        }}
      >
        <FilmBrand responsive={responsive} />
      </div>
      <FilmIdentityHeadline height={height} responsive={responsive} />
      <FilmConversationPanel
        rect={conversationRect(height)}
        immersion={1}
        responsive={responsive}
      />
    </div>
  );
}
