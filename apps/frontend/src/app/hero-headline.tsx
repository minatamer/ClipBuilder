"use client";

import { useEffect, useState } from "react";

import styles from "./page.module.css";

const wordIntervalMilliseconds = 2400;

const heroWords = [
  { label: "moment", treatment: styles.wordMoment },
  { label: "hook", treatment: styles.wordHook },
  { label: "insight", treatment: styles.wordInsight },
  { label: "punchline", treatment: styles.wordPunchline },
  { label: "takeaway", treatment: styles.wordTakeaway },
  { label: "story", treatment: styles.wordStory },
] as const;

export function HeroHeadline() {
  const [wordState, setWordState] = useState<{
    active: number;
    previous: number | null;
  }>({ active: 0, previous: null });

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      setWordState(({ active }) => ({
        active: (active + 1) % heroWords.length,
        previous: active,
      }));
    }, wordIntervalMilliseconds);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className={styles.heroHeadline}>
      <h1
        id="hero-title"
        aria-label="We find you the moment. You get the final cut."
      >
        <span className={styles.heroTitleLine} aria-hidden="true">
          <span>We find you the</span>
          <span className={styles.heroWordSlot}>
            {heroWords.map((word, index) => {
              const stateClass =
                index === wordState.active
                  ? styles.heroWordActive
                  : index === wordState.previous
                    ? styles.heroWordExiting
                    : "";

              return (
                <span
                  className={[styles.heroWord, stateClass]
                    .filter(Boolean)
                    .join(" ")}
                  key={word.label}
                >
                  <span className={`${styles.heroWordInner} ${word.treatment}`}>
                    {word.label}
                  </span>
                  .
                </span>
              );
            })}
          </span>
        </span>
        <span className={styles.heroTitleLine} aria-hidden="true">
          You get the final cut.
        </span>
      </h1>
    </div>
  );
}
