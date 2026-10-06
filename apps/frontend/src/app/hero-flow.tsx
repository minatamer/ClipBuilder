"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./hero-flow.module.css";

const steps = [
  {
    title: "Upload your video",
    detail: "Your conversation",
    icon: "M12 17V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5",
  },
  {
    title: "Find the moments",
    detail: "Complete ideas",
    icon: "M4 7h11M4 12h8M4 17h6m8-5 1.5 3.5L23 17l-3.5 1.5L18 22l-1.5-3.5L13 17l3.5-1.5Z",
  },
  {
    title: "Pick your favorite",
    detail: "One choice",
    icon: "m7 12 3 3 7-7M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
  },
  {
    title: "Add the magic",
    detail: "Captions + visuals",
    icon: "m4 20 12-12 4 4L8 24M14 4l1-3 1 3 3 1-3 1-1 3-1-3-3-1ZM5 4v4M3 6h4M20 18v4m-2-2h4",
  },
  {
    title: "Ready to share",
    detail: "Your vertical cut",
    icon: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 7 5 3-5 3Z",
  },
] as const;

export function HeroFlow() {
  const surface = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const target = surface.current;
    if (!target) return;
    let onScreen = false;
    const update = () =>
      setActive(onScreen && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = Boolean(entry?.isIntersecting);
        update();
      },
      { threshold: 0.1 },
    );
    observer.observe(target);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div className={styles.flow} ref={surface} data-active={active}>
      <p className={styles.caption}>One conversation. One finished clip.</p>
      <ol
        className={styles.steps}
        aria-label="From your video to your final cut"
      >
        {steps.map((step, index) => (
          <li
            className={styles.step}
            key={step.title}
            style={{ "--step": index } as CSSProperties}
          >
            <span className={styles.icon} aria-hidden="true">
              <svg
                viewBox="0 0 26 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <path d={step.icon} />
              </svg>
            </span>
            <span className={styles.copy}>
              <strong>{step.title}</strong>
              <span>{step.detail}</span>
            </span>
            {index < steps.length - 1 && (
              <span className={styles.connector} aria-hidden="true">
                <span />
                <svg
                  viewBox="0 0 8 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path d="m1 1 5 5-5 5" />
                </svg>
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
