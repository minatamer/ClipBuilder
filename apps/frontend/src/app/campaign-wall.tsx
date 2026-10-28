"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./page.module.css";

export function CampaignWall({ children }: { children: ReactNode }) {
  const wall = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const target = wall.current;
    if (!target || !window.IntersectionObserver) return;
    const cards = [...target.querySelectorAll<HTMLElement>("[data-brand]")];
    const visible = new Set<HTMLElement>();
    const played = new Set<HTMLElement>();
    let active: HTMLElement | undefined;
    let timer: number | undefined;
    const next = () => {
      if (active || document.visibilityState !== "visible") return;
      const card = cards.find((item) => visible.has(item) && !played.has(item));
      if (!card) return;
      active = card;
      played.add(card);
      observer.unobserve(card);
      visible.delete(card);
      card.dataset.campaignShining = "true";
      timer = window.setTimeout(() => {
        delete card.dataset.campaignShining;
        card.dataset.campaignShone = "true";
        active = undefined;
        timer = undefined;
        next();
      }, 1000);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!(entry.target instanceof HTMLElement)) continue;
          const card = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75)
            visible.add(card);
          else visible.delete(card);
        }
        next();
      },
      { threshold: 0.75, rootMargin: "-80px 0px -48px 0px" },
    );
    for (const card of cards) observer.observe(card);
    document.addEventListener("visibilitychange", next);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", next);
      if (timer !== undefined) window.clearTimeout(timer);
      if (active) delete active.dataset.campaignShining;
    };
  }, []);
  return (
    <ul
      ref={wall}
      className={styles.campaignWall}
      data-campaign-wall
      aria-label="Platforms with public paid clipping campaigns"
    >
      {children}
    </ul>
  );
}
