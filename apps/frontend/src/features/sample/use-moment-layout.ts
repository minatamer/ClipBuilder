"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { flushSync } from "react-dom";

export function motionDurationMs(value: string) {
  const match = /^(\d*\.?\d+)(ms|s)$/u.exec(value.trim());
  const duration = match ? Number(match[1]) * (match[2] === "s" ? 1000 : 1) : 0;
  return duration > 0 && duration <= 5000 ? duration : 640;
}

export function useMomentLayout(
  root: RefObject<HTMLDivElement | null>,
  selectedId: string | null,
) {
  const previous = useRef(new Map<string, DOMRect>());
  const animations = useRef<Animation[]>([]);
  useLayoutEffect(() => {
    const stop = () => {
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
    };
    const tokens = getComputedStyle(document.documentElement);
    const duration = motionDurationMs(
      tokens.getPropertyValue("--cb-motion-entrance"),
    );
    root.current
      ?.querySelectorAll<HTMLElement>("[data-moment-surface]")
      .forEach((element) => {
        const before = previous.current.get(
          element.dataset.momentSurface ?? "",
        );
        if (before === undefined || typeof element.animate !== "function")
          return;
        const after = element.getBoundingClientRect();
        if (after.width === 0 || after.height === 0) return;
        // Local FLIP keeps every animated surface inside its ancestor clips.
        animations.current.push(
          element.animate(
            [
              {
                transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
                transformOrigin: "top left",
              },
              { transform: "none", transformOrigin: "top left" },
            ],
            {
              duration,
              easing:
                tokens.getPropertyValue("--cb-ease-settle").trim() ||
                "ease-out",
            },
          ),
        );
      });
    previous.current.clear();
    return stop;
  }, [root, selectedId]);
  return (update: () => void) => {
    previous.current.clear();
    root.current
      ?.querySelectorAll<HTMLElement>("[data-moment-surface]")
      .forEach((element) => {
        previous.current.set(
          element.dataset.momentSurface ?? "",
          element.getBoundingClientRect(),
        );
      });
    flushSync(update);
  };
}
