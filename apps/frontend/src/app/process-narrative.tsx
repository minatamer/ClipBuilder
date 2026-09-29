"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./page.module.css";

const evidenceSteps = [
  {
    number: "01",
    label: "Source",
    title: "Read the source",
    copy: "Keep the transcript, timing, and speaker changes attached to the decision.",
    detail: "Transcript + timing",
  },
  {
    number: "02",
    label: "Evidence",
    title: "Ground the moment",
    copy: "Rank complete ideas by evidence—not by a promise of virality or hidden trend data.",
    detail: "Words 184–291",
  },
  {
    number: "03",
    label: "Control",
    title: "Keep control",
    copy: "Inspect the range, captions, framing, and visual cues before the final render.",
    detail: "One reversible cut",
  },
] as const;

export function ProcessNarrative() {
  const listRef = useRef<HTMLOListElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const list = listRef.current;

    if (!list || !("IntersectionObserver" in window)) {
      return;
    }

    const steps = Array.from(
      list.querySelectorAll<HTMLElement>("[data-process-step]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          );
        const index = Number(
          visible[0]?.target.getAttribute("data-step-index"),
        );

        if (Number.isInteger(index)) {
          setActiveStep(index);
        }
      },
      {
        rootMargin: "-22% 0px -42% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    steps.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={styles.processSection}
      id="how-it-works"
      aria-labelledby="process-title"
      data-active-step={activeStep}
    >
      <div className={styles.processSticky}>
        <div className={styles.processHeading}>
          <p className={styles.eyebrowLight}>How it works</p>
          <h2 id="process-title">Automation, with receipts.</h2>
          <p>
            One source moves through three visible decisions. Scroll to follow
            the evidence without losing the human handoff.
          </p>
        </div>

        <div className={styles.processVisual} aria-hidden="true">
          <div className={styles.processVisualTopline}>
            <span>Evidence path</span>
            <span>{evidenceSteps[activeStep]?.number} / 03</span>
          </div>
          <div className={styles.processOrbit}>
            <span className={styles.processCore} />
            <span className={styles.processNodeOne} />
            <span className={styles.processNodeTwo} />
            <span className={styles.processNodeThree} />
          </div>
          <div className={styles.processReadout}>
            <span>{evidenceSteps[activeStep]?.label}</span>
            <strong>{evidenceSteps[activeStep]?.detail}</strong>
          </div>
          <div className={styles.processProgress}>
            {evidenceSteps.map((step, index) => (
              <span
                key={step.number}
                data-complete={index <= activeStep ? "true" : "false"}
              />
            ))}
          </div>
        </div>
      </div>

      <ol className={styles.stepGrid} ref={listRef}>
        {evidenceSteps.map((step, index) => (
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
    </section>
  );
}
