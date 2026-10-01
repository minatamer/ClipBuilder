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
          d="M4 27 21 28 19 61Q18 69 12 69T5 61Z"
        />
        <path
          fill={`url(#${paintId}-shirt)`}
          d="M12 1C5 1 1 7 1 16L2 36Q12 41 23 36L23 16C23 7 19 1 12 1Z"
        />
        <path className={styles.speakerSeam} d="M3 35Q12 39 22 35M5 10 4 27" />
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
            d="M12 1C5 1 1 5 2 14L5 38 8 69H18L21 38 23 14C24 5 19 1 12 1Z"
          />
          <path className={styles.speakerSkinDetail} d="M5 15 9 47" />
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
            d="M9 1H22L23 11 28 19Q29 23 26 23L22 19 23 29Q23 36 17 37C11 37 8 33 8 28L7 15Z"
          />
          <path
            className={styles.speakerSkinDetail}
            d="M13 25V32M17 26V33M21 25V31"
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
            <stop offset="1" stopColor="var(--speaker-shirt-shadow)" />
          </linearGradient>
          <linearGradient id={`${paintId}-skin`} x1="0" y1="0" x2="1" y2="0.6">
            <stop stopColor="var(--speaker-skin-light)" />
            <stop offset="1" stopColor="var(--speaker-skin-shadow)" />
          </linearGradient>
        </defs>
        <path className={styles.speakerUndershirt} d="M38 57H62L72 170H28Z" />
        <path fill={`url(#${paintId}-skin)`} d="M44 39H57L58 57Q50 67 42 57Z" />
        <path
          className={styles.speakerNeckShade}
          d="M44 42 57 44V49Q49 52 44 47Z"
        />
        <path
          fill={`url(#${paintId}-shirt)`}
          d="M43 54C34 57 24 58 18 66L23 103C25 125 22 148 20 170H80C77 149 75 125 77 103L82 66C76 58 66 57 57 54L54 66H47Z"
        />
        <path
          className={styles.speakerFabricShade}
          d="M23 84 33 100 29 144 25 170H20Q26 124 23 103ZM77 84 67 105 72 170H80Q74 124 77 103Z"
        />
        <path
          className={styles.speakerSeam}
          d="M49 75 48 169M31 108 34 127M69 105 65 125M29 158Q36 161 43 160"
        />
        <path
          className={styles.speakerPocket}
          d="M58 82H69L68 94Q64 98 59 94Z"
        />
        <g transform={isQuestion ? undefined : "translate(100 0) scale(-1 1)"}>
          <path
            fill={`url(#${paintId}-skin)`}
            d="M38 25C33 24 33 34 39 35L41 40Q45 48 53 47C61 46 65 38 65 27V21H39Z"
          />
          <path
            className={styles.speakerHair}
            d={
              isQuestion
                ? "M37 31C31 19 36 9 46 8C54 5 66 11 67 21L63 27 61 18C55 22 49 23 40 20L40 31Z"
                : "M37 32C31 21 35 10 46 8C54 6 65 11 67 22L63 29 62 20C53 24 47 18 41 22L40 33Z"
            }
          />
          <path className={styles.speakerHairLight} d="M39 16Q49 10 58 15" />
          <path
            className={styles.speakerFeatures}
            d="M47 29h3M58 28h3M55 30 54 35h3M50 40q5 2 9-1"
          />
          <path className={styles.speakerSkinDetail} d="M37 29 39 32" />
          {!isQuestion && (
            <path
              className={styles.speakerBeard}
              d="M42 36 46 40Q54 44 62 37L60 43Q53 50 47 45Z"
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
          d="M43 54C34 57 24 58 18 66L21 74Q28 66 35 66L43 60ZM57 54C66 57 76 58 82 66L79 74Q72 66 65 66L57 60Z"
        />
        <path
          className={styles.speakerCollar}
          d="M43 54 35 58 43 73 50 65ZM57 54 65 58 57 73 50 65Z"
        />
        <path className={styles.speakerSeam} d="m35 58 8 15 7-8 7 8 8-15" />
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
              <span>Illustrative flow · sample only</span>
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
