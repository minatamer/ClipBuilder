import type { CompositionManifestV3 } from "@clipbuilder/contracts";
import { OwnerStyledCaption } from "../../../../../packages/composition/local/styled-caption.tsx";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";

import { ConversationSpeaker } from "./conversation-speaker.tsx";

export function IllustratedConversation({
  frame,
  portrait = false,
  portraitAmount = portrait ? 1 : 0,
  showLabel = true,
}: {
  frame: number;
  portrait?: boolean;
  portraitAmount?: number;
  showLabel?: boolean;
}) {
  const phase = ((frame % 360) + 360) % 360;
  const activeSecond = phase >= 180;
  const settle = Math.min(1, (phase % 180) / 24);
  const blend = settle * settle * (3 - 2 * settle);
  const nextX = activeSecond ? -415 : 65;
  const previousX = activeSecond ? 65 : -415;
  const cameraX = (previousX + (nextX - previousX) * blend) * portraitAmount;
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${1200 - 640 * portraitAmount} 1000`}
      preserveAspectRatio="xMidYMid slice"
      aria-label="Original animated illustration of two podcast speakers"
    >
      <rect width="1200" height="1000" fill="#142b55" />
      <g transform={`translate(${cameraX} 0)`}>
        <rect x="70" y="100" width="1060" height="800" rx="38" fill="#193760" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={i}
            x={110 + i * 65}
            y="110"
            width="3"
            height="630"
            fill="#4b6e96"
            opacity=".28"
          />
        ))}
        <circle cx="210" cy="190" r="145" fill="#407bb1" opacity=".22" />
        <circle cx="980" cy="370" r="150" fill="#9574cd" opacity=".16" />
        <ConversationSpeaker frame={frame} />
        <ConversationSpeaker frame={frame} second />
        <path d="M0 777Q600 732 1200 777V1000H0Z" fill="#0c1c36" />
        {[405, 790].map((x) => (
          <g key={x}>
            <path
              d={`M${x - 115} 802L${x - 50} 610L${x + 15} 531`}
              fill="none"
              stroke="#050f23"
              strokeWidth="14"
              strokeLinejoin="round"
            />
            <rect
              x={x}
              y="482"
              width="37"
              height="103"
              rx="17"
              fill="#0a1324"
              transform={`rotate(16 ${x} 482)`}
            />
            <path
              d={`M${x + 4} 495L${x + 23} 501M${x + 2} 509L${x + 20} 514M${x} 523L${x + 16} 528`}
              stroke="#6888af"
              strokeWidth="3"
            />
          </g>
        ))}
        {showLabel && (
          <text
            x="95"
            y="188"
            fill="#b9d6ff"
            fontFamily="Arial, sans-serif"
            fontSize="22"
            letterSpacing="6"
          >
            THE CONVERSATION
          </text>
        )}
      </g>
    </svg>
  );
}

const words = ["Great", "ideas", "deserve", "context."];
const caption: CompositionManifestV3["captions"][number] = {
  text: "Great ideas deserve context.",
  wordIds: words.map((_, i) => `film-illustration-word-${i}`),
  startMs: 0,
  endMs: 8000,
  lines: ["Great ideas deserve context."],
  wordCues: words.map((text, i) => ({
    wordId: `film-illustration-word-${i}`,
    text,
    startMs: i * 800,
    endMs: (i + 1) * 800,
  })),
};

export function IllustratedClip({
  frame,
  detailsOnly = false,
  detailsOpacity = 1,
}: {
  frame: number;
  detailsOnly?: boolean;
  detailsOpacity?: number;
}) {
  const ms = (frame % 180) * (1000 / 30);
  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1920,
        overflow: "hidden",
        color: "white",
        fontFamily: "Arial, sans-serif",
        background: detailsOnly ? "transparent" : "#142b55",
      }}
    >
      {!detailsOnly && <IllustratedConversation frame={frame} portrait />}
      <div
        data-film-clip-details={detailsOnly ? true : undefined}
        style={{ position: "absolute", inset: 0, opacity: detailsOpacity }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(transparent 30%, #05102899 100%)",
          }}
        />
        <OwnerStyledCaption
          caption={caption}
          ms={ms}
          style={OWNER_CAPTION_PRESETS.glass}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 60,
            padding: "16px 24px",
            background: "#07162ed9",
            borderRadius: 40,
            fontSize: 26,
            letterSpacing: 2,
          }}
        >
          ILLUSTRATIVE CLIP
        </div>
      </div>
    </div>
  );
}
