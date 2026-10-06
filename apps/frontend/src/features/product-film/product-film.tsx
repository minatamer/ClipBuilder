import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  FILM_CAPTURES,
  FILM_COPY,
  FILM_TIMELINES,
  type FilmBeat,
  type FilmVariant,
} from "./film-timeline";
import {
  IllustratedClip,
  IllustratedConversation,
} from "./illustrated-conversation";
import { screenCamera, type ScreenBeat } from "./film-camera";

const ease = Easing.bezier(0.2, 0.75, 0.25, 1);
function progress(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}
const font = '"Segoe UI", Arial, sans-serif';
const panel: CSSProperties = {
  border: "1px solid #9abfff45",
  boxShadow: "0 35px 90px #0008, 0 0 1px #c0d9ff",
  borderRadius: 24,
  overflow: "hidden",
};

function FilmBrand({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.27,
        fontSize: size * 0.55,
        fontWeight: 750,
        letterSpacing: -1,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
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

function Cursor({
  frame,
  to,
  clickAt = 55,
}: {
  frame: number;
  to: readonly [number, number];
  clickAt?: number;
}) {
  const move = progress(frame, 12, clickAt - 5);
  const ring = progress(frame, clickAt, clickAt + 18);
  return (
    <div
      style={{
        position: "absolute",
        left: 1160 + (to[0] - 1160) * move,
        top: 220 + (to[1] - 220) * move,
        pointerEvents: "none",
        opacity: 1 - progress(frame, clickAt + 25, clickAt + 40),
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 70,
          height: 70,
          left: -35,
          top: -35,
          border: "3px solid #c9ddff",
          borderRadius: "50%",
          transform: `scale(${0.35 + ring * 1.1})`,
          opacity: frame < clickAt ? 0 : 1 - ring,
        }}
      />
      <svg
        width="38"
        height="46"
        viewBox="0 0 38 46"
        style={{ filter: "drop-shadow(0 4px 6px #0008)" }}
      >
        <path
          d="M4 3L31 28L18 29L24 41L16 44L10 31L3 39Z"
          fill="white"
          stroke="#122a51"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

function ScreenPlane({
  src,
  frame,
  duration,
  beat = "intake",
  cameraFrame = frame,
  cursor,
}: {
  src: string;
  frame: number;
  duration: number;
  beat?: ScreenBeat;
  cameraFrame?: number;
  cursor?: { to: readonly [number, number]; clickAt: number };
}) {
  const pose = screenCamera(beat, cameraFrame);
  const enter = progress(frame, 0, 34);
  return (
    <div
      style={{
        position: "absolute",
        left: pose.x,
        top: pose.y,
        width: 1440 * pose.scale,
        height: 1000 * pose.scale,
        perspective: 1800,
      }}
    >
      <div
        style={{
          ...panel,
          width: 1440,
          height: 1000,
          transformOrigin: "top left",
          transform: `scale(${pose.scale}) rotateX(${pose.pitch}deg) rotateY(${pose.yaw}deg) rotateZ(${pose.roll}deg)`,
          boxShadow:
            "0 50px 110px #0009, 6px 8px 0 #173456, 7px 9px 0 #7392be55",
          background: "#09244d",
        }}
      >
        <Img
          src={staticFile(src)}
          alt="Captured ClipBuilder simulated workflow"
          style={{ width: "100%", height: "100%" }}
        />
        {cursor && (
          <Cursor frame={frame} to={cursor.to} clickAt={cursor.clickAt} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.22 + (1 - enter) * 0.32,
            background: `linear-gradient(${100 + pose.yaw}deg, #9dc7ff22, transparent 35%, transparent 65%, #9dc7ff08)`,
          }}
        />
        {beat === "analysis" && (
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: `${-70 + (frame / duration) * 190}%`,
              width: "50%",
              height: "140%",
              pointerEvents: "none",
              transform: "skewX(-18deg)",
              background:
                "linear-gradient(90deg, transparent, #b9d8ff1c, transparent)",
            }}
          />
        )}
      </div>
    </div>
  );
}

function Title({
  beat,
  frame,
  side = false,
  focusWindow,
}: {
  beat: FilmBeat;
  frame: number;
  side?: boolean;
  focusWindow?: readonly [number, number];
}) {
  const enter = progress(frame, 0, 24);
  const closeup = focusWindow
    ? progress(frame, focusWindow[0], focusWindow[0] + 12) *
      (1 - progress(frame, focusWindow[1], focusWindow[1] + 12))
    : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 130,
        top: side ? 340 : 96,
        width: side ? 810 : 1620,
        opacity: enter * (1 - closeup),
        transform: `translateY(${(1 - enter) * 28}px)`,
      }}
    >
      <div
        style={{
          color: "#9bc3ff",
          fontSize: 24,
          fontWeight: 650,
          letterSpacing: 5,
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {FILM_COPY[beat].detail}
      </div>
      <div
        style={{
          fontSize: side ? 98 : 80,
          fontWeight: 750,
          lineHeight: 1.06,
          letterSpacing: -4,
        }}
      >
        {FILM_COPY[beat].title}
      </div>
    </div>
  );
}

function ClipPlane({
  frame,
  left = 1120,
  top = 235,
  scale = 0.37,
}: {
  frame: number;
  left?: number;
  top?: number;
  scale?: number;
}) {
  const enter = progress(frame, 0, 35);
  const orbit = interpolate(
    frame,
    [0, 35, 80, 140, 210],
    [-38, -12, 12, -6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease },
  );
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 1080 * scale,
        height: 1920 * scale,
        perspective: 1400,
      }}
    >
      <div
        style={{
          ...panel,
          width: 1080,
          height: 1920,
          borderRadius: 64,
          transformOrigin: "top left",
          transform: `scale(${scale * (0.96 + enter * 0.04)}) translateY(${(1 - enter) * 160}px) rotateX(${(1 - enter) * -9}deg) rotateY(${orbit}deg) rotateZ(${(1 - enter) * 8 + Math.sin(frame / 75) * -2}deg)`,
          boxShadow:
            "0 70px 140px #000b, 14px 8px 0 #193354, 16px 9px 0 #89b9ee55",
        }}
      >
        <IllustratedClip frame={frame} />
      </div>
    </div>
  );
}

function Identity({
  frame,
  closing = false,
}: {
  frame: number;
  closing?: boolean;
}) {
  const enter = progress(frame, 0, 28);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 1120,
          top: 190,
          width: 580,
          height: 710,
          ...panel,
          opacity: 0.86,
          transform: `perspective(1500px) rotateY(${-30 + enter * 18 + Math.sin(frame / 80) * 5}deg) rotateZ(${7 - enter * 3}deg) translateY(${(1 - enter) * 100 + Math.sin(frame / 55) * 12}px)`,
        }}
      >
        <IllustratedConversation frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 282,
          width: 1000,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 25}px)`,
        }}
      >
        <FilmBrand size={90} />
        <div
          style={{
            marginTop: 48,
            fontSize: 110,
            fontWeight: 750,
            letterSpacing: -5,
            lineHeight: 1.04,
            maxWidth: 1020,
          }}
        >
          {FILM_COPY[closing ? "close" : "identity"].title}
        </div>
        <div style={{ marginTop: 34, color: "#b6d2f9", fontSize: 32 }}>
          {closing
            ? "Try the experience."
            : "From a long conversation to one vertical cut."}
        </div>
      </div>
    </>
  );
}

function Build({ frame }: { frame: number }) {
  const enter = progress(frame, 0, 32);
  return (
    <>
      <Title beat="build" frame={frame} />
      <div
        style={{
          ...panel,
          position: "absolute",
          left: 105 - progress(frame, 60, 160) * 30,
          top: 348,
          width: 740,
          height: 510,
          opacity: 1 - progress(frame, 115, 155) * 0.2,
          transform: `perspective(1300px) rotateY(${23 - enter * 13 - progress(frame, 65, 165) * 19}deg) rotateZ(${-4 + enter * 2}deg) scale(${1 - progress(frame, 65, 165) * 0.07})`,
        }}
      >
        <IllustratedConversation frame={frame} />
      </div>
      <svg
        style={{ position: "absolute", left: 880, top: 490 }}
        width="190"
        height="190"
        viewBox="0 0 190 190"
        aria-hidden="true"
      >
        <path
          d="M20 95H145M116 67L145 95L116 123"
          stroke="#8bbcff"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="180"
          strokeDashoffset={180 * (1 - enter)}
        />
      </svg>
      {["Speaker framing", "Fixed captions", "Contextual visuals"].map(
        (label, i) => {
          const appear = progress(frame, 32 + i * 22, 54 + i * 22);
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                left: 160 + i * 6,
                top: 870 + i * 48,
                fontSize: 25,
                letterSpacing: 1,
                color: "#bbd8ff",
                opacity: appear,
                transform: `translateY(${(1 - appear) * 20}px)`,
              }}
            >
              <span style={{ color: "#70aaff", marginRight: 16 }}>↗</span>
              {label}
            </div>
          );
        },
      )}
      <ClipPlane frame={frame} left={1170} top={275} scale={0.37} />
    </>
  );
}

function Sharing({ frame }: { frame: number }) {
  return (
    <>
      <Title beat="share" frame={frame} />
      <ClipPlane frame={frame} left={380} top={325} scale={0.31} />
      <div style={{ position: "absolute", left: 960, top: 398, width: 700 }}>
        <div
          style={{
            color: "#91baff",
            fontSize: 25,
            letterSpacing: 4,
            marginBottom: 32,
          }}
        >
          OUTSIDE THE APP
        </div>
        {[
          "Open your chosen platform",
          "Upload your downloaded clip",
          "Share it yourself",
        ].map((text, i) => {
          const enter = progress(frame, 12 + i * 18, 36 + i * 18);
          return (
            <div
              key={text}
              style={{
                display: "flex",
                gap: 25,
                alignItems: "center",
                padding: "28px 0",
                opacity: enter,
                transform: `translateX(${(1 - enter) * 40}px)`,
                borderBottom: "1px solid #aacfff30",
                fontSize: 35,
              }}
            >
              <span style={{ color: "#83afff", fontSize: 24 }}>0{i + 1}</span>
              {text}
            </div>
          );
        })}
        <div style={{ marginTop: 32, color: "#a8c7ee", fontSize: 27 }}>
          Share on your terms.
        </div>
      </div>
    </>
  );
}

function Shot({
  beat,
  frame,
  duration,
}: {
  beat: FilmBeat;
  frame: number;
  duration: number;
}) {
  const quick = duration < 120;
  if (beat === "identity" || beat === "close")
    return <Identity frame={frame} closing={beat === "close"} />;
  if (beat === "build") return <Build frame={frame} />;
  if (beat === "share") return <Sharing frame={frame} />;
  if (beat === "result" && !quick && frame < 90)
    return (
      <>
        <Title beat="result" frame={frame} />
        <ScreenPlane
          src={FILM_CAPTURES.result}
          frame={frame}
          duration={duration}
          beat="result"
        />
      </>
    );
  if (beat === "result")
    return (
      <>
        <Title beat={beat} frame={frame} side />
        <ClipPlane
          frame={quick ? frame : frame - 90}
          left={1140}
          top={170}
          scale={0.43}
        />
      </>
    );
  let src: string = FILM_CAPTURES.analysis;
  let cursor: { to: readonly [number, number]; clickAt: number } | undefined;
  if (beat === "intake") {
    src =
      frame < 62
        ? FILM_CAPTURES.intake
        : frame < 94
          ? FILM_CAPTURES.preparation
          : FILM_CAPTURES.source;
    if (frame < 62) cursor = { to: [805, 590], clickAt: 54 };
    if (frame >= 94) cursor = { to: [1256, 945], clickAt: 130 };
  }
  if (beat === "choose") {
    const selectedAt = quick ? 52 : 88;
    src =
      frame < selectedAt ? FILM_CAPTURES.candidates : FILM_CAPTURES.selected;
    cursor =
      frame < selectedAt
        ? { to: [307, 575], clickAt: selectedAt - 5 }
        : { to: [1264, 945], clickAt: duration - 25 };
  }
  if (beat === "review") {
    src = frame < 156 ? FILM_CAPTURES.review : FILM_CAPTURES.render;
    if (frame < 156) cursor = { to: [1240, 945], clickAt: 147 };
  }
  return (
    <>
      <Title
        beat={beat}
        frame={frame}
        {...(beat === "choose"
          ? { focusWindow: [46, 116] as const }
          : beat === "review"
            ? { focusWindow: [50, 110] as const }
            : {})}
      />
      <ScreenPlane
        src={src}
        frame={frame}
        duration={duration}
        cameraFrame={
          quick && beat === "choose" ? frame * (210 / duration) : frame
        }
        beat={beat}
        {...(cursor ? { cursor } : {})}
      />
    </>
  );
}

export function ProductFilm({
  variant = "walkthrough",
}: {
  variant?: FilmVariant;
}) {
  const frame = useCurrentFrame();
  const timeline = FILM_TIMELINES[variant];
  const shot =
    timeline.find(
      (item) => frame >= item.from && frame < item.from + item.duration,
    ) ?? timeline[timeline.length - 1]!;
  const localFrame = frame - shot.from;
  const previous = timeline[timeline.indexOf(shot) - 1];
  const transition = previous ? progress(localFrame, 0, 18) : 1;
  return (
    <AbsoluteFill
      style={{
        color: "#f0f5ff",
        fontFamily: font,
        background:
          "radial-gradient(ellipse at 78% 63%, #163768 0%, #091a37 46%, #050e20 100%)",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.08,
          backgroundImage:
            "linear-gradient(#7da8dd22 1px, transparent 1px), linear-gradient(90deg, #7da8dd22 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          transform: `perspective(900px) rotateX(48deg) scale(1.8) translateY(${Math.sin(frame / 140) * 5}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${48 + Math.sin(frame / 160) * 25}% 88%, #3a7cc42e, transparent 52%)`,
        }}
      />
      {previous && transition < 1 && (
        <AbsoluteFill
          style={{
            opacity: 1 - transition,
            transform: `translateX(${-140 * transition}px) scale(${1 - transition * 0.04})`,
          }}
        >
          <Shot
            beat={previous.beat}
            frame={previous.duration - 1}
            duration={previous.duration}
          />
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          opacity: transition,
          transform: `translateX(${(1 - transition) * 110}px)`,
        }}
      >
        <Shot beat={shot.beat} frame={localFrame} duration={shot.duration} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
