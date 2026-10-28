import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  FILM_CAPTURES,
  FILM_COPY,
  type FilmBeat,
  type FilmVariant,
} from "./film-timeline";
import { IllustratedClip } from "./illustrated-conversation";
import {
  FILM_CAPTURE_SIZE,
  screenCamera,
  type ScreenBeat,
} from "./film-camera";
import {
  FILM_BACKGROUND,
  FILM_FONT,
  FilmBrand,
  FilmIdentityHeadline,
  FilmConversationPanel,
} from "./film-identity";
import {
  filmStage,
  filmNarrative,
  moveRect,
  sceneProgress,
  isScreenBeat,
  type FilmRect,
} from "./film-choreography";

function Title({
  beat,
  frame,
  layout,
  exit = 1,
}: {
  beat: FilmBeat;
  frame: number;
  layout: ReturnType<typeof filmNarrative>;
  exit?: number;
}) {
  return (
    <div
      data-film-copy
      style={{
        position: "absolute",
        zIndex: 4,
        left: layout.rect.x,
        top: layout.rect.y,
        width: layout.rect.width,
        opacity: layout.opacity * exit,
      }}
    >
      <div
        data-film-detail
        style={{
          color: "#a9ceff",
          fontSize: 28,
          lineHeight: 1.25,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {FILM_COPY[beat].detail}
      </div>
      <div
        data-film-title
        style={{
          fontSize: layout.fontSize,
          fontWeight: 780,
          lineHeight: 1.04,
          letterSpacing: -6,
        }}
      >
        {FILM_COPY[beat].title.split("\n").map((line, index) => {
          const enter = sceneProgress(frame, 8 + index * 3, 20 + index * 3);
          return (
            <span
              key={line}
              style={{
                display: "block",
                whiteSpace: "pre",
                color: index === 1 ? "#a9ceff" : undefined,
                opacity: enter,
                translate: `${(1 - enter) * -28}px 0`,
              }}
            >
              {line}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Cursor({
  cursor,
}: {
  cursor: NonNullable<ReturnType<typeof screenCamera>["cursor"]>;
}) {
  return (
    <div
      data-film-cursor
      style={{
        position: "absolute",
        left: cursor.x,
        top: cursor.y,
        width: 40,
        height: 48,
        opacity: cursor.opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -100,
          top: -100,
          width: 200,
          height: 200,
          background: "radial-gradient(circle,#add9ff35,transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -44,
          top: -44,
          width: 88,
          height: 88,
          border: "3px solid #d1e8ff",
          borderRadius: "50%",
          opacity: cursor.ring,
          transform: `scale(${0.45 + (1 - cursor.ring) * 1.25})`,
        }}
      />
      <svg
        width="40"
        height="48"
        viewBox="0 0 38 46"
        style={{ filter: "drop-shadow(0 3px 7px #00132e)" }}
      >
        <path
          d="M4 3L31 28L18 29L24 41L16 44L10 31L3 39Z"
          fill="white"
          stroke="#173764"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

function captureAt(beat: ScreenBeat, frame: number) {
  if (beat === "intake")
    return frame < 32
      ? FILM_CAPTURES.intake
      : frame < 52
        ? FILM_CAPTURES.preparation
        : FILM_CAPTURES.source;
  if (beat === "choose")
    return frame < 42 ? FILM_CAPTURES.candidates : FILM_CAPTURES.selected;
  return beat === "review" ? FILM_CAPTURES.review : FILM_CAPTURES.analysis;
}

function MomentCards({
  formation,
  opacity,
}: {
  formation: number;
  opacity: number;
}) {
  return (
    <>
      {[0, 1, 2].map((index) => {
        const source = {
          x: 119 + index * 410,
          y: 436,
          width: 378,
          height: 300,
        };
        const rect = moveRect(
          { x: 716, y: 552, width: 8, height: 8 },
          source,
          formation,
        );
        return (
          <div
            key={index}
            data-film-card
            style={{
              position: "absolute",
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              overflow: "hidden",
              opacity,
              filter: `blur(${(1 - formation) * 5}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 1440,
                height: 1000,
                left: -source.x * (rect.width / source.width),
                top: -source.y * (rect.height / source.height),
                transformOrigin: "0 0",
                transform: `scale(${rect.width / source.width},${rect.height / source.height})`,
              }}
            >
              <Img
                src={staticFile(FILM_CAPTURES.candidates)}
                alt=""
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

function ScreenScene({ stage }: { stage: ReturnType<typeof filmStage> }) {
  const { fps } = useVideoConfig();
  const { screenBeat: beat, screenFrame: frame, pose, window: rect } = stage;
  const current = captureAt(beat, frame);
  const stateAt =
    beat === "intake"
      ? frame >= 52
        ? 52
        : frame >= 32
          ? 32
          : 0
      : beat === "choose" && frame >= 42
        ? 42
        : 0;
  const previousBeat = stage.previous.beat;
  // Analysis has already cleared as its cards form; never bring its loader back.
  const previousScreen =
    isScreenBeat(previousBeat) && previousBeat !== "analysis";
  const prior =
    stage.local < fps * 0.9 &&
    previousScreen &&
    stage.screenBeat === stage.shot.beat
      ? captureAt(previousBeat, stage.previous.duration - 1)
      : stateAt > 0
        ? captureAt(beat, stateAt - 1)
        : undefined;
  const blend =
    beat === "choose" && previousBeat === "analysis" && stateAt === 0
      ? 1 - stage.cardsOpacity
      : prior
        ? sceneProgress(
            stage.local < fps * 0.9 &&
              previousScreen &&
              stage.screenBeat === stage.shot.beat
              ? stage.local
              : frame,
            stateAt > 0 ? stateAt : 0,
            stateAt > 0 ? stateAt + fps * 0.3 : fps * 0.4,
          )
        : 1;
  return (
    <div
      data-film-demo
      data-film-screen
      data-film-bleed
      style={{
        overflow: "hidden",
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        opacity: stage.screenOpacity,
        background: "#09244d",
      }}
    >
      <div
        data-film-camera
        style={{
          position: "absolute",
          left: pose.x,
          top: pose.y,
          width: FILM_CAPTURE_SIZE.width,
          height: FILM_CAPTURE_SIZE.height,
          transformOrigin: "0 0",
          transform: `scale(${pose.scale})`,
          maskImage: "linear-gradient(180deg,transparent 190px,#000 245px)",
          background:
            "linear-gradient(135deg,#193d76 0%,#0b2c67 52%,#081b40 100%)",
        }}
      >
        {prior && blend < 1 && (
          <Img
            src={staticFile(prior)}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
        )}
        <Img
          src={staticFile(current)}
          alt="Illustrative ClipBuilder workflow"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            opacity: blend * (beat === "analysis" ? stage.analysisOpacity : 1),
          }}
        />
        {stage.cardsOpacity > 0 && (
          <MomentCards
            formation={stage.cardsProgress}
            opacity={stage.cardsOpacity}
          />
        )}
      </div>
      <div
        data-film-copy-shade
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: stage.narrative.opacity,
          background: stage.narrative.right
            ? "linear-gradient(210deg,#050e20f5 0%,#07162dde 24%,#07162d00 64%)"
            : beat === "review"
              ? "linear-gradient(90deg,#050e20 0%,#07162df5 34%,#07162d00 60%)"
              : "linear-gradient(120deg,#050e20f5 0%,#07162de0 24%,#07162d40 58%,#07162d00 78%)",
        }}
      />
    </div>
  );
}

function Portrait({
  rect,
  clip,
  opacity,
  frame,
  detailsOpacity,
  framing,
  details,
}: {
  rect: FilmRect;
  clip: FilmRect;
  opacity: number;
  frame: number;
  detailsOpacity: number;
  framing: number;
  details: FilmRect;
}) {
  const scale = details.width / 1080;
  return (
    <div
      data-film-portrait-boundary
      style={{
        position: "absolute",
        zIndex: 2,
        left: clip.x,
        top: clip.y,
        width: clip.width,
        height: clip.height,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <FilmConversationPanel
        rect={{ ...rect, x: rect.x - clip.x, y: rect.y - clip.y }}
        opacity={opacity}
        portraitAmount={framing}
        portrait
      >
        <div
          style={{
            position: "absolute",
            width: 1080,
            height: 1920,
            left: details.x - rect.x,
            top: details.y - rect.y,
            transformOrigin: "0 0",
            transform: `scale(${scale})`,
          }}
        >
          <IllustratedClip
            frame={frame}
            detailsOnly
            detailsOpacity={detailsOpacity}
          />
        </div>
      </FilmConversationPanel>
    </div>
  );
}

function Narrative({
  beat,
  contentFrame,
  transitionFrame,
  mode,
}: {
  beat: FilmBeat;
  contentFrame: number;
  transitionFrame: number;
  mode: "in" | "out";
}) {
  const { height } = useVideoConfig();
  if (beat === "identity" || beat === "close")
    return (
      <FilmIdentityHeadline
        height={height}
        closing={beat === "close"}
        frame={transitionFrame - (beat === "close" && mode === "in" ? 12 : 0)}
        mode={mode}
      />
    );
  const layout = filmNarrative(beat, contentFrame, height);
  const opacity = mode === "out" ? 1 - sceneProgress(transitionFrame, 0, 8) : 1;
  if (layout.opacity === 0) return null;
  return (
    <>
      <Title beat={beat} frame={contentFrame} layout={layout} exit={opacity} />
      {beat === "result" && (
        <div
          style={{
            position: "absolute",
            left: 80,
            bottom: 112,
            color: "#b8d8ff",
            fontSize: 40,
            letterSpacing: 2,
            opacity,
          }}
        >
          MP4 / YOUR NEXT CUT
        </div>
      )}
    </>
  );
}

export function ProductFilm({
  variant = "walkthrough",
}: {
  variant?: FilmVariant;
}) {
  const frame = useCurrentFrame();
  const { height, fps } = useVideoConfig();
  const stage = filmStage(variant, frame, height, fps);
  const identity =
    stage.shot.beat === "identity" || stage.shot.beat === "close";
  const previousIdentity =
    stage.previous.beat === "identity" || stage.previous.beat === "close";
  const brandOpacity = identity
    ? previousIdentity
      ? 1
      : sceneProgress(stage.local, 0, 8)
    : previousIdentity
      ? 1 - sceneProgress(stage.local, 0, 8)
      : 0;
  return (
    <AbsoluteFill
      data-film-beat={stage.shot.beat}
      data-film-frame={frame}
      data-film-transition={stage.transition}
      style={{
        color: "#f0f5ff",
        fontFamily: FILM_FONT,
        background: FILM_BACKGROUND,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill data-film-stage style={{ zIndex: 0 }}>
        {stage.screenOpacity > 0 && <ScreenScene stage={stage} />}
        {stage.portrait.opacity > 0 && (
          <Portrait
            rect={stage.portrait.rect}
            clip={stage.portraitClip}
            details={stage.portraitDetails}
            opacity={stage.portrait.opacity}
            frame={frame}
            framing={stage.shot.beat === "build" ? stage.t : 1}
            detailsOpacity={
              stage.shot.beat === "build"
                ? sceneProgress(stage.local, 17, 27)
                : stage.shot.beat === "result"
                  ? 1 -
                    sceneProgress(
                      stage.local,
                      stage.shot.duration - 8,
                      stage.shot.duration - 1,
                    )
                  : 1
            }
          />
        )}
        {stage.conversation.opacity > 0 && (
          <div
            style={{
              position: "absolute",
              left: stage.conversationClip.x,
              top: stage.conversationClip.y,
              width: stage.conversationClip.width,
              height: stage.conversationClip.height,
              overflow: "hidden",
            }}
          >
            <FilmConversationPanel
              rect={{
                ...stage.conversation.rect,
                x: stage.conversation.rect.x - stage.conversationClip.x,
                y: stage.conversation.rect.y - stage.conversationClip.y,
              }}
              opacity={stage.conversation.opacity}
              portraitAmount={stage.conversationFraming}
              immersion={stage.conversationImmersion}
            >
              {stage.shot.beat === "build" && (
                <div
                  style={{
                    position: "absolute",
                    inset: "auto 0 0",
                    padding: "60px 32px 32px",
                    background: "linear-gradient(transparent,#05152df5)",
                    display: "flex",
                    gap: 24,
                    fontSize: 30,
                    fontWeight: 650,
                  }}
                >
                  {["Frame", "Caption", "Style"].map((label, index) => (
                    <span
                      key={label}
                      style={{
                        opacity: sceneProgress(
                          stage.local,
                          27 + index * 3,
                          36 + index * 3,
                        ),
                      }}
                    >
                      {label}
                      {index < 2 ? " /" : ""}
                    </span>
                  ))}
                </div>
              )}
            </FilmConversationPanel>
          </div>
        )}
      </AbsoluteFill>
      {stage.screenOpacity > 0 && stage.pose.cursor && (
        <div
          style={{
            position: "absolute",
            zIndex: 3,
            left: stage.window.x + stage.pose.x,
            top: stage.window.y + stage.pose.y,
            width: FILM_CAPTURE_SIZE.width,
            height: FILM_CAPTURE_SIZE.height,
            opacity: stage.screenOpacity,
            transformOrigin: "0 0",
            transform: `scale(${stage.pose.scale})`,
            pointerEvents: "none",
          }}
        >
          <Cursor cursor={stage.pose.cursor} />
        </div>
      )}
      {brandOpacity > 0 && (
        <div
          data-film-brand
          style={{
            position: "absolute",
            left: 80,
            top: 64,
            opacity: brandOpacity,
          }}
        >
          <FilmBrand />
        </div>
      )}
      {stage.local < 8 && stage.previousNarrative.opacity > 0 && (
        <Narrative
          beat={stage.previous.beat}
          contentFrame={stage.previous.duration - 1}
          transitionFrame={stage.local}
          mode="out"
        />
      )}
      <Narrative
        beat={stage.shot.beat}
        contentFrame={stage.local}
        transitionFrame={stage.local}
        mode="in"
      />
    </AbsoluteFill>
  );
}
