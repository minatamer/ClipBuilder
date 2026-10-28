"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { FILM_CAPTURES, FILM_FORMAT } from "./film-timeline";
import { ProductFilmPoster } from "./product-film-poster";
import { ProductFilmFallback } from "./product-film-fallback";
import styles from "./product-film-hero.module.css";

const FilmPlayer = dynamic(
  () =>
    import("./product-film-player").then((module) => module.ProductFilmPlayer),
  { ssr: false, loading: () => null },
);

class FilmBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? <ProductFilmFallback /> : this.props.children;
  }
}

export function ProductFilmHero() {
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [compositionHeight, setCompositionHeight] = useState<number | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);
  const [assetsFailed, setAssetsFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [visit, setVisit] = useState(0);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const measure = ({ width, height }: { width: number; height: number }) => {
      if (width > 0 && height > 0)
        setCompositionHeight(Math.round((FILM_FORMAT.width * height) / width));
    };
    measure(target.getBoundingClientRect());
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const controller = new AbortController();
    let cancelled = false;
    const timeout = setTimeout(() => controller.abort(), 8000);
    void Promise.all(
      Object.values(FILM_CAPTURES).map(async (path) => {
        const response = await fetch(path, {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-store",
        });
        if (
          !response.ok ||
          !response.headers.get("content-type")?.startsWith("image/png")
        )
          throw new Error("film_capture_unavailable");
      }),
    )
      .catch(() => {
        controller.abort();
        if (!cancelled) setAssetsFailed(true);
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [loaded]);
  useEffect(() => {
    const target = surface.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const onScreen = Boolean(entry?.isIntersecting);
        setVisible(onScreen);
        if (onScreen) setLoaded(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(target);
    const visibility = () =>
      setForeground(document.visibilityState === "visible");
    visibility();
    const revisit = (event: PageTransitionEvent) => {
      if (event.persisted) {
        visibility();
        setVisit((value) => value + 1);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pageshow", revisit);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pageshow", revisit);
    };
  }, []);
  return (
    <div
      className={styles.hero}
      ref={surface}
      aria-label="ClipBuilder cinematic walkthrough"
    >
      <div className={styles.surface} ref={canvas} data-film-surface>
        <FilmBoundary>
          {assetsFailed ? (
            <ProductFilmFallback />
          ) : (
            <>
              <ProductFilmPoster />
              {loaded && compositionHeight !== null && (
                <div className={styles.player} data-film-player>
                  <FilmPlayer
                    key={visit}
                    variant="walkthrough"
                    compositionHeight={compositionHeight}
                    active={visible && foreground}
                  />
                </div>
              )}
            </>
          )}
        </FilmBoundary>
      </div>
    </div>
  );
}
