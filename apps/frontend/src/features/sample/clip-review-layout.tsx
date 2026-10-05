"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import styles from "./sample.module.css";

const names = ["Video", "Agentic Notes", "Transcript"] as const;

export function ClipReviewLayout({
  video,
  notes,
  transcript,
  carousel = false,
  label = "Read-only clip preview",
}: {
  video: ReactNode;
  notes: ReactNode;
  transcript: ReactNode;
  carousel?: boolean;
  label?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState(false);
  const [active, setActive] = useState(0);
  const activeIndex = useRef(0);
  const phoneLayout = useRef(false);
  const focusSlide = useRef<number | null>(null);
  const focusedDot = useRef<number | null>(null);
  const slides = () =>
    Array.from(
      track.current?.querySelectorAll<HTMLElement>("[data-review-slide]") ?? [],
    );

  useLayoutEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => {
      const next = getComputedStyle(element).scrollSnapType.startsWith("x");
      const panels = Array.from(
        element.querySelectorAll<HTMLElement>("[data-review-slide]"),
      );
      let index = next ? activeIndex.current : 0;
      if (next && !phoneLayout.current) {
        const focused = panels.findIndex((panel) =>
          panel.contains(document.activeElement),
        );
        index = focused < 0 ? 0 : focused;
      }
      if (!next && phoneLayout.current && focusedDot.current !== null) {
        focusSlide.current = focusedDot.current;
        focusedDot.current = null;
      }
      phoneLayout.current = next;
      activeIndex.current = index;
      setPhone(next);
      setActive(index);
      element.scrollTo({
        left: next ? (panels[index]?.offsetLeft ?? 0) : 0,
        behavior: "instant",
      });
    };
    measure();
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  useLayoutEffect(() => {
    if (focusSlide.current === null) return;
    track.current
      ?.querySelectorAll<HTMLElement>("[data-review-slide]")
      .item(focusSlide.current)
      ?.focus({ preventScroll: true });
    focusSlide.current = null;
  }, [active, phone]);

  const show = (index: number) => {
    const panel = slides()[index];
    if (panel)
      track.current?.scrollTo({ left: panel.offsetLeft, behavior: "smooth" });
  };

  return (
    <section
      className={`${styles.clipReviewShell} ${carousel ? styles.sourceReviewShell : ""}`}
      aria-label={label}
      aria-roledescription={phone ? "carousel" : undefined}
    >
      <div
        ref={track}
        className={styles.clipReview}
        data-review-layout={phone ? "carousel" : "cards"}
        onScroll={(event) => {
          if (!phoneLayout.current) return;
          const panels = slides();
          const left = event.currentTarget.scrollLeft;
          const next = panels.reduce(
            (closest, panel, index) =>
              Math.abs(panel.offsetLeft - left) <
              Math.abs((panels[closest]?.offsetLeft ?? 0) - left)
                ? index
                : closest,
            0,
          );
          if (next === activeIndex.current) return;
          const focused = document.activeElement;
          if (focused && panels[activeIndex.current]?.contains(focused))
            focusSlide.current = next;
          activeIndex.current = next;
          setActive(next);
        }}
      >
        {[video, notes, transcript].map((content, index) => (
          <div
            key={names[index]}
            className={styles.reviewSlide}
            data-review-slide={index}
            role="group"
            aria-roledescription={phone ? "slide" : undefined}
            aria-label={
              phone ? `${names[index]}, ${index + 1} of 3` : names[index]
            }
            inert={phone && active !== index}
            tabIndex={-1}
          >
            {content}
          </div>
        ))}
      </div>
      <div
        className={styles.reviewDots}
        role="group"
        aria-label="Review slides"
      >
        {names.map((name, index) => (
          <button
            key={name}
            type="button"
            aria-label={`Show ${name}`}
            aria-current={active === index ? "true" : undefined}
            onClick={() => show(index)}
            onFocus={() => {
              focusedDot.current = index;
            }}
            onBlur={() => {
              if (
                track.current &&
                getComputedStyle(track.current).scrollSnapType.startsWith("x")
              )
                focusedDot.current = null;
            }}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % names.length
                  : event.key === "ArrowLeft"
                    ? (index + names.length - 1) % names.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? names.length - 1
                        : null;
              if (next === null) return;
              event.preventDefault();
              event.currentTarget.parentElement
                ?.querySelectorAll<HTMLButtonElement>("button")
                .item(next)
                ?.focus({ preventScroll: true });
              show(next);
            }}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
