import { useCallback, useEffect, useRef } from "react";
import { motionDurationMs } from "../sample/use-moment-layout";

/** FLIP the real editor surface from the chosen portrait once media is ready. */
export function useClipEntry() {
  const root = useRef<HTMLElement>(null);
  const from = useRef<DOMRect | null>(null);
  const active = useRef<Animation | null>(null);
  const stop = useCallback(() => {
    active.current?.cancel();
    active.current = null;
    from.current = null;
  }, []);
  useEffect(() => {
    window.addEventListener("resize", stop);
    root.current?.addEventListener("scroll", stop, true);
    const node = root.current;
    return () => {
      stop();
      window.removeEventListener("resize", stop);
      node?.removeEventListener("scroll", stop, true);
    };
  }, [stop]);
  const choose = useCallback(
    (button: HTMLElement | null) => {
      stop();
      if (
        root.current?.querySelector('.clip-list[aria-orientation="vertical"]')
      ) {
        const surface = button?.querySelector(".clip-rail-preview");
        const rect = surface?.getBoundingClientRect();
        if (
          rect &&
          rect.width > 0 &&
          rect.top >= 0 &&
          rect.bottom <= innerHeight
        )
          from.current = rect;
      }
    },
    [stop],
  );
  const ready = useCallback(() => {
    const before = from.current;
    from.current = null;
    const surface = root.current?.querySelector<HTMLElement>(".editor-preview");
    if (!before || !surface || typeof surface.animate !== "function") return;
    const after = surface.getBoundingClientRect();
    if (!after.width || !after.height) return;
    const tokens = getComputedStyle(document.documentElement);
    active.current = surface.animate(
      [
        {
          transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
          transformOrigin: "top left",
        },
        { transform: "none", transformOrigin: "top left" },
      ],
      {
        duration: motionDurationMs(
          tokens.getPropertyValue("--cb-motion-entrance"),
        ),
        easing:
          tokens.getPropertyValue("--cb-ease-settle").trim() || "ease-out",
      },
    );
  }, []);
  return { root, choose, ready };
}
