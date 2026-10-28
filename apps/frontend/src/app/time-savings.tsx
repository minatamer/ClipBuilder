"use client";

import { useEffect, useRef } from "react";
import styles from "./time-savings.module.css";

const MANUAL_MINUTES = 60;
const CLIPBUILDER_MINUTES = 10;
const CLIP_COUNT = 5;
const TIME_FRACTION = CLIPBUILDER_MINUTES / MANUAL_MINUTES;
const TIME_PERCENT = Math.round(TIME_FRACTION * 100);
const MINUTES_BACK = MANUAL_MINUTES - CLIPBUILDER_MINUTES;
const SAVED_PERCENT = Math.round((1 - TIME_FRACTION) * 100);
const CLOCK_CIRCUMFERENCE = 2 * Math.PI * 58;

const formatCount = (value: number, digits = 0) =>
  String(value).padStart(digits, "0");

function AnimatedNumber({
  value,
  from = 0,
  digits,
  savedMinutes = false,
}: {
  value: number;
  from?: number;
  digits?: number;
  savedMinutes?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-count-target={value}
      data-count-from={from}
      data-count-digits={digits}
      data-minutes-back={savedMinutes || undefined}
    >
      {formatCount(value, digits)}
    </span>
  );
}

export function TimeSavings() {
  const example = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = example.current;
    if (!target || !window.IntersectionObserver) return;
    const trigger = target.querySelector<HTMLElement>("[data-time-trigger]");
    const section = target.closest<HTMLElement>("[data-time-section]");
    if (!trigger || !section) return;
    let frame = 0;
    let entered = false;
    let lastEntry: IntersectionObserverEntry | undefined;
    const numbers = section.querySelectorAll<HTMLElement>(
      "[data-count-target]",
    );
    target.style.setProperty("--time-progress", "0");
    for (const number of numbers)
      number.textContent = formatCount(
        Number(number.dataset.countFrom),
        Number(number.dataset.countDigits ?? 0),
      );
    const startWhenVisible = () => {
      if (
        entered ||
        document.visibilityState !== "visible" ||
        !lastEntry?.isIntersecting ||
        lastEntry.intersectionRatio < 0.75
      )
        return;
      entered = true;
      observer.disconnect();
      target.dataset.entered = "true";
      section.dataset.entered = "true";
      const started = performance.now();
      const tick = (now: number) => {
        const elapsed = Math.max(0, Math.min(1, (now - started) / 2200));
        // Zero velocity at both ends, with the fastest change in the middle.
        const progress =
          elapsed * elapsed * elapsed * (elapsed * (elapsed * 6 - 15) + 10);
        target.style.setProperty("--time-progress", String(progress));
        for (const number of numbers) {
          const from = Number(number.dataset.countFrom),
            to = Number(number.dataset.countTarget);
          number.textContent = formatCount(
            Math.round(from + (to - from) * progress),
            Number(number.dataset.countDigits ?? 0),
          );
        }
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        lastEntry = entry;
        startWhenVisible();
      },
      { threshold: 0.75, rootMargin: "-80px 0px -48px 0px" },
    );
    observer.observe(trigger);
    document.addEventListener("visibilitychange", startWhenVisible);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", startWhenVisible);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      className={styles.section}
      aria-labelledby="time-title"
      data-time-section
    >
      <div className={styles.intro}>
        <p className={styles.eyebrow}>An hour, reimagined.</p>
        <h2
          id="time-title"
          aria-label={`What would you do with ${MINUTES_BACK} minutes back?`}
        >
          What would you do <span data-savings-before>with</span>{" "}
          <em>
            <span className={styles.savedNumber} data-headline-saved>
              <AnimatedNumber value={MINUTES_BACK} digits={2} savedMinutes />
            </span>{" "}
            <span data-savings-after>minutes</span> back?
          </em>
        </h2>
        <p>
          An hour for five clips by hand. Imagine the same batch in ten
          minutes—then put the other fifty into your next idea.
        </p>
        <div className={styles.batchSeal}>
          <span className={styles.clipStack} aria-hidden="true">
            {Array.from({ length: CLIP_COUNT }, (_, index) => (
              <i key={index}>
                <svg viewBox="0 0 12 16">
                  <path d="m4 5 4 3-4 3Z" fill="currentColor" />
                </svg>
              </i>
            ))}
          </span>
          <span>One batch. Five finished clips.</span>
        </div>
      </div>
      <div ref={example} className={styles.example} data-time-example>
        <p className={styles.exampleLabel}>The five-clip what-if</p>
        <div className={styles.saving} data-time-trigger>
          <div>
            <p className={styles.number}>
              <span className={styles.srOnly}>
                About {TIME_PERCENT}% of the time
              </span>
              <span aria-hidden="true">
                <AnimatedNumber value={TIME_PERCENT} from={100} />
                <span className={styles.percent}>%</span>
              </span>
            </p>
            <p className={styles.metricLabel}>
              of the time.<span>Same creative control.</span>
            </p>
          </div>
          <div className={styles.clock} aria-hidden="true">
            <svg viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="73" fill="none" stroke="#9cc6ff18" />
              {Array.from({ length: 12 }, (_, index) => (
                <line
                  key={index}
                  x1="80"
                  y1="10"
                  x2="80"
                  y2={index % 3 === 0 ? 19 : 15}
                  stroke="#c0d9ff77"
                  strokeWidth="2"
                  transform={`rotate(${index * 30} 80 80)`}
                />
              ))}
              <circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="#719fdb1f"
                strokeWidth="6"
              />
              <circle
                data-time-arc
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="#91c5ff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CLOCK_CIRCUMFERENCE}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "80px 80px",
                  strokeDashoffset: `calc(${CLOCK_CIRCUMFERENCE * (1 - TIME_FRACTION)}px * var(--time-progress))`,
                }}
              />
              <line
                data-clock-hand
                x1="80"
                y1="80"
                x2="80"
                y2="38"
                stroke="#e3f0ff"
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  transformOrigin: "80px 80px",
                  transform: `rotate(calc(360deg - ${360 * (1 - TIME_FRACTION)}deg * var(--time-progress)))`,
                }}
              />
              <circle cx="80" cy="80" r="5" fill="#b6d9ff" />
            </svg>
            <span>Time, reclaimed.</span>
          </div>
        </div>
        <div
          className={styles.comparison}
          role="img"
          aria-label={`Five-clip example: ${MANUAL_MINUTES} minutes manually compared with a ${CLIPBUILDER_MINUTES}-minute ClipBuilder target. About ${TIME_PERCENT} percent of the time: ${MINUTES_BACK} minutes back, roughly ${SAVED_PERCENT} percent saved. This is not a measured result.`}
        >
          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span>
                By hand <small>Example</small>
              </span>
              <strong>
                <AnimatedNumber value={MANUAL_MINUTES} from={MANUAL_MINUTES} />{" "}
                <small>min</small>
              </strong>
            </div>
            <div className={styles.track}>
              <span />
            </div>
          </div>
          <div className={`${styles.row} ${styles.assisted}`}>
            <div className={styles.rowLabel}>
              <span>
                With ClipBuilder <small>Target</small>
              </span>
              <strong>
                <AnimatedNumber
                  value={CLIPBUILDER_MINUTES}
                  from={MANUAL_MINUTES}
                />{" "}
                <small>min</small>
              </strong>
            </div>
            <div className={styles.track}>
              <span
                data-time-fill
                style={{
                  width: `calc(100% - ${(1 - TIME_FRACTION) * 100}% * var(--time-progress))`,
                }}
              />
            </div>
          </div>
        </div>
        <p className={styles.timeBack}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M4 10a8 8 0 1 1 1 8M4 4v6h6M12 7v5l3 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <strong>
            <span className={styles.srOnly}>{MINUTES_BACK} minutes back.</span>
            <span aria-hidden="true">
              <span className={styles.savedNumber}>
                <AnimatedNumber value={MINUTES_BACK} digits={2} savedMinutes />
              </span>{" "}
              minutes back.
            </span>
          </strong>
          <span>≈{SAVED_PERCENT}% saved</span>
        </p>
      </div>
    </section>
  );
}
