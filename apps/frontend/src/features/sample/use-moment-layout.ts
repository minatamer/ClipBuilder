"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
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
  const transition = useRef<ViewTransition | null>(null);
  const intent = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      intent.current += 1;
      transition.current?.skipTransition();
      animations.current.forEach((animation) => animation.cancel());
    };
  }, []);
  useLayoutEffect(() => {
    const stop = () => {
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
    };
    if (transition.current === null) {
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
          // FLIP only the portrait; transcript and controls retain their own scale.
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
    }
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
    const version = ++intent.current;
    transition.current?.skipTransition();
    const commit = () => {
      if (mounted.current && version === intent.current) flushSync(update);
    };
    if (typeof document.startViewTransition !== "function") {
      commit();
      return;
    }
    const next = document.startViewTransition(commit);
    transition.current = next;
    // Rapid choices supersede stale callbacks; rejected/skipped snapshots are harmless.
    void next.ready.catch(() => {});
    void next.finished
      .catch(() => {})
      .then(() => {
        if (transition.current === next) transition.current = null;
      });
  };
}
