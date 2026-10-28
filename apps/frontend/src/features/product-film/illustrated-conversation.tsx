import type { CompositionManifestV3 } from "@clipbuilder/contracts";
import { ContextualCard, FixedCaption } from "@clipbuilder/composition";

/** Original vector stand-in. This is animation artwork, never processing evidence. */
function Speaker({
  frame,
  second = false,
}: {
  frame: number;
  second?: boolean;
}) {
  const breath = Math.sin(frame / 22) * 3;
  const secondSpeaking = Math.floor(frame / 72) % 2 === 1;
  const talking = second ? secondSpeaking : !secondSpeaking;
  const mouth = talking ? 3 + Math.abs(Math.sin(frame / 3)) * 9 : 2;
  const blink = frame % 113 > 108;
  const gesture = Math.sin(frame / 28) * (talking ? 8 : 2);
  return (
    <g transform={`translate(${second ? 835 : 355} ${breath})`}>
      <ellipse cx="0" cy="905" rx="175" ry="55" fill="#030e22" opacity=".5" />
      <path
        d="M-145 770 Q-146 557-88 545 L88 545 Q152 588 145 770Z"
        fill={second ? "#becdf3" : "#426cc1"}
      />
      <path
        d="M-55 551L-42 466H42L55 551Q0 591-55 551"
        fill={second ? "#bd805e" : "#d8a080"}
      />
      <g transform={`rotate(${Math.sin(frame / 43) * 1.5} 0 415)`}>
        <ellipse
          cy="415"
          rx="75"
          ry="93"
          fill={second ? "#ce9370" : "#edbd9c"}
        />
        <path
          d={
            second
              ? "M-73 420Q-92 314-16 315Q92 292 77 408L48 362Q-20 396-62 365Z"
              : "M-73 399Q-79 297 16 317Q86 318 77 396L47 368Q-11 350-73 399"
          }
          fill={second ? "#352d38" : "#172a47"}
        />
        <path
          d="M-38 408L-18 406M18 406L38 408"
          stroke="#3c3540"
          strokeWidth={blink ? 4 : 7}
          strokeLinecap="round"
        />
        <path
          d="M-7 418L-12 441H2"
          fill="none"
          stroke="#aa7058"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cy="464" rx="16" ry={mouth} fill="#733f44" />
        {!second && (
          <path
            d="M-69 376Q-104 376-96 431M69 376Q103 380 96 431M-82 370Q-75 291 0 299Q73 293 83 370"
            fill="none"
            stroke="#06162f"
            strokeWidth="18"
          />
        )}
      </g>
      <g transform={`rotate(${gesture} -89 568)`}>
        <path
          d="M-101 568Q-184 617-185 721L-85 742L-77 696L-122 676L-50 593"
          fill={second ? "#afc0ea" : "#365eae"}
        />
        <path
          d="M-90 695L-39 680Q-19 680-20 694L-60 713L-20 703Q-3 706-11 719L-56 745L-99 731Z"
          fill={second ? "#ce9370" : "#edbd9c"}
        />
      </g>
      <path
        d="M85 572Q170 622 170 725L80 751L64 706L115 679L43 596"
        fill={second ? "#afc0ea" : "#365eae"}
      />
      <path
        d="M79 706L34 698Q17 698 21 713L68 745L96 729Z"
        fill={second ? "#ce9370" : "#edbd9c"}
      />
    </g>
  );
}

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
  const activeSecond = Math.floor(frame / 72) % 2 === 1;
  const settle = Math.min(1, (frame % 72) / 18);
  const blend = settle * settle * (3 - 2 * settle);
  const nextX = activeSecond ? -415 : 65;
  const previousX = frame < 72 ? nextX : activeSecond ? 65 : -415;
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
        <Speaker frame={frame} />
        <Speaker frame={frame} second />
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

const words = ["Start", "before", "you", "feel", "ready."];
const caption: CompositionManifestV3["captions"][number] = {
  text: "Start before you feel ready.",
  wordIds: words.map((_, i) => `film-illustration-word-${i}`),
  startMs: 0,
  endMs: 8000,
  lines: ["Start before you feel ready."],
  wordCues: words.map((text, i) => ({
    wordId: `film-illustration-word-${i}`,
    text,
    startMs: i * 800,
    endMs: (i + 1) * 800,
  })),
};
const card: CompositionManifestV3["cards"][number] = {
  origin: "planner",
  kind: "statement",
  title: "One useful conversation",
  lines: ["A small first step."],
  startMs: 0,
  endMs: 8000,
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
        <ContextualCard card={card} ms={ms} />
        <FixedCaption caption={caption} ms={ms} />
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
