"use client";

import { useEffect, useId, useRef, useState } from "react";

import styles from "./page.module.css";
import {
  processSequenceCycleDurationMilliseconds,
  processSequencePhases,
} from "./process-narrative-timing";

const flowSteps = [
  {
    number: "01",
    label: "Upload",
    title: "Upload a conversation with potential",
    copy: "Drop in a long-form video you own and believe holds a clip-worthy moment. Upload progress stays visible until it is ready.",
    detail: "Long-form video uploading",
  },
  {
    number: "02",
    label: "Read",
    title: "Reading the conversation",
    copy: "Transcript bars resolve line by line while the vertical output stays muted.",
    detail: "Transcript resolving",
  },
  {
    number: "03",
    label: "Cut",
    title: "Bringing the cut to life",
    copy: "Color, framing, captions, light, and timeline motion turn the phone into a living preview.",
    detail: "Vertical preview playing",
  },
] as const;

function BoomMicrophone() {
  return (
    <svg
      className={styles.boomMicrophone}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      data-boom-microphone="true"
    >
      <path className={styles.boomCable} d="M103 -3 84 2 65 25 59 34" />
      <path className={styles.boomArmRail} d="M103 -3 84 2 65 25" />
      <path className={styles.boomArmHighlight} d="M101 -1 84 4 66 26" />
      <circle className={styles.boomJoint} cx="84" cy="2" r="4" />
      <circle className={styles.boomJoint} cx="65" cy="25" r="3.6" />
      <path className={styles.boomMicMount} d="M65 25 59 35" />
      <g className={styles.boomMicCapsule} transform="rotate(11 57.5 45)">
        <rect x="51" y="33" width="13" height="25" rx="6.5" />
        <path d="M54 38h7M53.5 42h8M53.5 46h8" />
        <path d="M57.5 58v5M53.5 63h8" />
      </g>
    </svg>
  );
}

function SpeakerArm({
  side,
  paintId,
}: {
  side: "left" | "right";
  paintId: string;
}) {
  return (
    <span
      className={`${styles.speakerArm} ${side === "left" ? styles.speakerArmLeft : styles.speakerArmRight}`}
      data-speaker-arm
    >
      <svg
        className={styles.speakerUpperArm}
        viewBox="0 0 24 70"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        data-speaker-upper-arm
      >
        <path
          fill={`url(#${paintId}-skin)`}
          d="M4 23C2 34 2 44 4 54C5 62 7 68 12 69C18 69 20 63 20 56C21 44 23 34 21 23Z"
        />
        <path
          className={styles.speakerSkinShade}
          d="M18 27C19 39 16 49 17 58Q17 65 12 69C18 69 20 63 20 56L22 28Z"
        />
        <path
          fill={`url(#${paintId}-shirt)`}
          d="M22 1C14 0 8 2 4 8C1 14 0 21 1 28Q9 33 19 32C21 24 24 13 22 1Z"
        />
        <path
          className={styles.speakerFabricShade}
          d="M20 9 22 17 19 32Q15 33 12 32L16 25Z"
        />
        <path className={styles.speakerSeam} d="M2 27Q10 32 19 30M7 9 4 20" />
      </svg>
      <span className={styles.speakerForearm} data-speaker-forearm>
        <svg
          viewBox="0 0 24 70"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill={`url(#${paintId}-skin)`}
            d="M11 1C5 1 2 7 3 15C4 27 8 42 9 55L9 68Q13 71 18 67L18 54C19 42 22 29 22 17C23 7 18 1 11 1Z"
          />
          <path
            className={styles.speakerSkinShade}
            d="M18 7C21 22 16 40 15 53L15 69 18 67 18 54C19 42 22 29 22 17Q22 10 18 7Z"
          />
          <path
            className={styles.speakerSkinDetail}
            d="M6 12Q10 9 15 12M9 53 10 61"
          />
        </svg>
        <svg
          className={styles.speakerHand}
          viewBox="0 0 32 38"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          data-speaker-hand
        >
          <path
            fill={`url(#${paintId}-skin)`}
            d="M10 1H21L22 9C22 12 27 13 29 17Q32 21 28 22L23 18 24 29Q24 34 21 35Q18 39 14 36C10 37 7 33 7 29L6 18C6 11 10 9 10 1Z"
          />
          <path
            className={styles.speakerSkinDetail}
            d="M11 25 12 33M15 26 16 35M19 25 20 33M11 15Q16 17 20 15"
          />
        </svg>
      </span>
    </span>
  );
}

function PodcastSpeaker({ turn }: { turn: "question" | "answer" }) {
  const paintId = useId();
  const isQuestion = turn === "question";

  return (
    <div
      className={
        isQuestion ? styles.conversationSpeakerA : styles.conversationSpeakerB
      }
      data-conversation-speaker
    >
      <svg
        className={styles.speakerBody}
        viewBox="0 0 100 170"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={`${paintId}-shirt`} x1="0" y1="0" x2="0.8" y2="1">
            <stop stopColor="var(--speaker-shirt-light)" />
            <stop offset="0.42" stopColor="var(--speaker-shirt-light)" />
            <stop offset="1" stopColor="var(--speaker-shirt-shadow)" />
          </linearGradient>
          <linearGradient id={`${paintId}-skin`} x1="0" y1="0" x2="1" y2="0.6">
            <stop stopColor="var(--speaker-skin-light)" />
            <stop offset="0.6" stopColor="var(--speaker-skin-light)" />
            <stop offset="1" stopColor="var(--speaker-skin-shadow)" />
          </linearGradient>
        </defs>
        <path className={styles.speakerUndershirt} d="M40 57H60L69 170H31Z" />
        <path
          fill={`url(#${paintId}-skin)`}
          d="M44 41H58L58 55C57 61 53 65 49 66C45 63 42 59 43 53Z"
        />
        <path
          className={styles.speakerNeckShade}
          d="M44 43 58 44V51Q50 56 43 51Z"
        />
        <path
          fill={`url(#${paintId}-shirt)`}
          d="M43 55C36 58 26 58 19 64C13 70 13 80 16 91L21 109C23 124 21 143 18 164Q17 169 22 170H79Q83 169 81 163C77 144 77 125 79 109L84 91C87 80 86 70 80 64C73 59 64 58 58 55L55 66H47Z"
        />
        <path
          className={styles.speakerFabricShade}
          d="M17 82Q23 92 28 96L31 112Q26 132 29 155L26 170H22Q17 170 18 164C22 140 24 120 21 109ZM83 82Q77 94 71 97L68 116Q74 138 71 170H79Q83 169 81 163C77 144 77 125 79 109Z"
        />
        <path
          className={styles.speakerFabricLight}
          d="M34 78Q40 73 46 76L43 111Q35 127 36 150L31 165Q30 135 33 112ZM55 80 60 106 58 156 54 164Z"
        />
        <path
          className={styles.speakerSeam}
          d="M49 75 49 167M28 99 32 110 29 119M73 99 68 113M28 154Q34 157 41 155M57 161Q66 163 75 160"
        />
        <path
          className={styles.speakerPocket}
          d="M59 82 71 83 70 94Q65 99 60 94Z"
        />
        <g transform={isQuestion ? undefined : "translate(100 0) scale(-1 1)"}>
          <path
            fill={`url(#${paintId}-skin)`}
            d="M39 27C32 23 33 36 39 36L41 30Z"
          />
          <path
            fill={`url(#${paintId}-skin)`}
            d="M39 20C40 11 61 11 64 21L64 33C63 42 58 49 51 49C44 49 39 43 38 35L37 25Z"
          />
          <path
            className={styles.speakerSkinShade}
            d="M60 21C63 30 61 39 56 44L49 48Q57 52 62 42C66 36 65 27 64 23Z"
          />
          <path
            className={styles.speakerHair}
            d={
              isQuestion
                ? "M36 31C32 24 34 13 40 9C46 5 56 6 62 9C66 12 68 17 67 22L63 27 61 19C56 21 48 23 39 20L39 31Z"
                : "M36 32C32 23 34 13 41 9C49 4 61 8 66 16L67 23 63 29 61 20C54 23 47 18 40 22L39 33Z"
            }
          />
          <path
            className={styles.speakerHairLight}
            d="M39 15Q47 9 56 12M43 17 58 16"
          />
          <path
            className={styles.speakerFeatures}
            d="M44 26q3-2 6 0M57 25q3-1 5 1M46 30h2M59 29h2M54 29 53 35q1 2 4 1M49 41q5 2 9-1"
          />
          <path
            className={styles.speakerSkinDetail}
            d="M36 29 38 32M46 44 50 45"
          />
          {!isQuestion && (
            <path
              className={styles.speakerBeard}
              d="M41 36 46 40Q54 45 62 36L61 43Q57 50 50 49C45 47 42 43 41 36Z"
            />
          )}
        </g>
      </svg>
      <SpeakerArm side="left" paintId={paintId} />
      <SpeakerArm side="right" paintId={paintId} />
      <svg
        className={styles.speakerShoulderMold}
        viewBox="0 0 100 170"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        data-speaker-shoulder-mold="true"
      >
        <path
          fill={`url(#${paintId}-shirt)`}
          d="M43 55C35 59 25 58 19 64Q15 69 14 77L22 78C26 69 33 64 42 61ZM58 55C65 59 74 59 80 64Q85 69 86 77L78 78C74 69 67 64 58 61Z"
        />
        <path
          className={styles.speakerCollar}
          d="M43 55 36 59 43 72 49 65ZM58 55 65 59 57 72 50 65Z"
        />
        <path
          className={styles.speakerSeam}
          d="m36 59 7 13 6-7m1 0 7 7 8-13M23 65Q28 62 33 62M68 62 77 66"
        />
      </svg>
      <BoomMicrophone />
    </div>
  );
}

export function ProcessNarrative() {
  const sectionReference = useRef<HTMLElement>(null);
  const stageReference = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isHandoff, setIsHandoff] = useState(false);
  const [shouldAnnounce, setShouldAnnounce] = useState(true);

  useEffect(() => {
    const section = sectionReference.current;
    const stage = stageReference.current;

    if (!section || !stage || !("IntersectionObserver" in window)) {
      return;
    }

    section.dataset.enhanced = "true";
    const timers = new Set<number>();

    const schedule = (callback: () => void, delayMilliseconds: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delayMilliseconds);

      timers.add(timer);
    };

    const runSequence = (isFirstCycle: boolean) => {
      const [firstPhase, ...laterPhases] = processSequencePhases;

      setActiveStep(firstPhase.activeStep);
      setIsHandoff(firstPhase.isHandoff);

      if (!isFirstCycle) {
        setShouldAnnounce(false);
      }

      laterPhases.forEach((phase) => {
        schedule(() => {
          setActiveStep(phase.activeStep);
          setIsHandoff(phase.isHandoff);
        }, phase.atMilliseconds);
      });
      schedule(
        () => runSequence(false),
        processSequenceCycleDurationMilliseconds,
      );
    };

    const entranceObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          section.dataset.visible = "true";
          runSequence(true);
          entranceObserver.disconnect();
        }
      },
      { rootMargin: "-8% 0px -18%", threshold: 0.2 },
    );

    entranceObserver.observe(stage);

    return () => {
      entranceObserver.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <section
      className={styles.processSection}
      id="how-it-works"
      aria-labelledby="process-title"
      data-active-step={activeStep}
      data-handoff={isHandoff ? "true" : "false"}
      data-enhanced="false"
      data-visible="false"
      ref={sectionReference}
    >
      <div className={styles.processIntro}>
        <p className={styles.eyebrowLight}>How it works</p>
        <h2 id="process-title">
          Turn long-form video into a clip worth sharing.
        </h2>
        <p>
          AI finds the standout moments in interviews, podcasts, speeches, and
          more. You choose one. We finish it with captions and visuals.
        </p>
      </div>

      <div className={styles.processLayout} ref={stageReference}>
        <div className={styles.processSticky}>
          <div className={styles.conversionStage} aria-hidden="true">
            <div className={styles.conversionTopline}>
              <span>Illustrative flow</span>
              <span>{flowSteps[activeStep]?.number} / 03</span>
            </div>

            <div className={styles.conversionFlow}>
              <div className={styles.uploadCard} data-upload-card>
                <div className={styles.uploadDropzone}>
                  <div className={styles.uploadFileTile}>
                    <span className={styles.uploadVideoIcon}>
                      <i />
                    </span>
                    <span>
                      <strong>conversation_sample.mp4</strong>
                      <small>Owned long-form video</small>
                    </span>
                  </div>
                </div>
                <div className={styles.uploadProgressMeta}>
                  <span>Uploading sample</span>
                  <strong className={styles.uploadProgressPending}>
                    In progress
                  </strong>
                  <strong className={styles.uploadProgressComplete}>
                    Ready
                  </strong>
                </div>
                <div className={styles.uploadProgressTrack}>
                  <span />
                </div>
                <p>Local video → temporary source</p>
              </div>

              <div className={styles.sourceConsole} data-read-console>
                <div className={styles.consoleHeader}>
                  <span />
                  <span />
                  <span />
                  <strong>source.transcript</strong>
                </div>
                <div className={styles.consoleLines}>
                  <span className={styles.consoleLine}>
                    <b>00:18.4</b>
                    <i className={styles.consoleBarLong} />
                  </span>
                  <span className={styles.consoleLine}>
                    <b>00:24.8</b>
                    <i className={styles.consoleBarMedium} />
                  </span>
                  <span className={styles.consoleLineSelected}>
                    <b>00:34.1</b>
                    <i className={styles.consoleBarSelected} />
                  </span>
                  <span className={styles.consoleLine}>
                    <b>00:46.2</b>
                    <i className={styles.consoleBarShort} />
                  </span>
                </div>
                <p>Complete idea · words 184–291</p>
              </div>

              <div className={styles.phoneFrame} data-conversation-preview>
                <div className={styles.phoneSpeaker} />
                <div className={styles.phoneScreen}>
                  <div className={styles.videoSky} />
                  <div className={styles.videoLight} />
                  <div className={styles.piVisual} data-pi-visual>
                    <span>π</span>
                    <strong>= 3.14159…</strong>
                  </div>
                  <div className={styles.conversationSpeakers}>
                    <PodcastSpeaker turn="question" />
                    <PodcastSpeaker turn="answer" />
                  </div>
                  <div className={styles.videoCaptions}>
                    <span className={styles.videoCaptionA}>
                      “How many digits does pi have?”
                    </span>
                    <strong className={styles.videoCaptionB}>
                      “Infinitely many—it never ends or repeats.”
                    </strong>
                  </div>
                  <div className={styles.videoTimeline} data-video-timeline>
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.conversionStatus}>
              <span>{flowSteps[activeStep]?.label}</span>
              <strong>
                {isHandoff
                  ? "Transcript moving into the cut"
                  : flowSteps[activeStep]?.detail}
              </strong>
              <span>00:34.2</span>
            </div>
          </div>
        </div>

        <p
          className={styles.processAnnouncement}
          aria-live={shouldAnnounce ? "polite" : "off"}
        >
          {flowSteps[activeStep]?.title}. {flowSteps[activeStep]?.copy}
        </p>

        <ol className={styles.stepGrid}>
          {flowSteps.map((step, index) => (
            <li
              key={step.number}
              data-process-step
              data-step-index={index}
              data-active={index === activeStep ? "true" : "false"}
              aria-current={index === activeStep ? "step" : undefined}
            >
              <span className={styles.stepNumber}>{step.number}</span>
              <div>
                <p className={styles.stepLabel}>{step.label}</p>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
