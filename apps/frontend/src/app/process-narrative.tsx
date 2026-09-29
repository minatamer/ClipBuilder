"use client";

import { useEffect, useRef, useState } from "react";

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
        <h2 id="process-title">Your words become a finished vertical cut.</h2>
        <p>
          Follow one conversation through a visible, grounded transformation.
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
                    <div
                      className={styles.conversationSpeakerA}
                      data-conversation-speaker
                    >
                      <span className={styles.speakerHead} />
                      <strong className={styles.speakerBody} />
                      <span
                        className={`${styles.speakerArm} ${styles.speakerArmLeft}`}
                        data-speaker-arm
                      >
                        <i
                          className={styles.speakerUpperArm}
                          data-speaker-upper-arm
                        />
                        <i
                          className={styles.speakerForearm}
                          data-speaker-forearm
                        >
                          <b className={styles.speakerHand} data-speaker-hand />
                        </i>
                      </span>
                      <span
                        className={`${styles.speakerArm} ${styles.speakerArmRight}`}
                        data-speaker-arm
                      >
                        <i
                          className={styles.speakerUpperArm}
                          data-speaker-upper-arm
                        />
                        <i
                          className={styles.speakerForearm}
                          data-speaker-forearm
                        >
                          <b className={styles.speakerHand} data-speaker-hand />
                        </i>
                      </span>
                      <span
                        className={styles.speakerShoulderMold}
                        data-speaker-shoulder-mold="true"
                        aria-hidden="true"
                      />
                      <BoomMicrophone />
                    </div>
                    <div
                      className={styles.conversationSpeakerB}
                      data-conversation-speaker
                    >
                      <span className={styles.speakerHead} />
                      <strong className={styles.speakerBody} />
                      <span
                        className={`${styles.speakerArm} ${styles.speakerArmLeft}`}
                        data-speaker-arm
                      >
                        <i
                          className={styles.speakerUpperArm}
                          data-speaker-upper-arm
                        />
                        <i
                          className={styles.speakerForearm}
                          data-speaker-forearm
                        >
                          <b className={styles.speakerHand} data-speaker-hand />
                        </i>
                      </span>
                      <span
                        className={`${styles.speakerArm} ${styles.speakerArmRight}`}
                        data-speaker-arm
                      >
                        <i
                          className={styles.speakerUpperArm}
                          data-speaker-upper-arm
                        />
                        <i
                          className={styles.speakerForearm}
                          data-speaker-forearm
                        >
                          <b className={styles.speakerHand} data-speaker-hand />
                        </i>
                      </span>
                      <span
                        className={styles.speakerShoulderMold}
                        data-speaker-shoulder-mold="true"
                        aria-hidden="true"
                      />
                      <BoomMicrophone />
                    </div>
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
