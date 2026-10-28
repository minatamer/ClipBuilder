"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./page.module.css";

export function LandingHeader({ children }: { children: ReactNode }) {
  const header = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const target = header.current;
    const hero = document.getElementById("top");
    const link = target?.querySelector<HTMLAnchorElement>(
      'a[href="#how-it-works"]',
    );
    const home = target?.querySelector<HTMLAnchorElement>('a[href="#top"]');
    if (!target || !hero || !link) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const update = () => {
      const next = desktop.matches && hero.getBoundingClientRect().bottom < 0;
      if (next && document.activeElement === link)
        home?.focus({ preventScroll: true });
      link.inert = next;
      if (next) link.setAttribute("aria-hidden", "true");
      else link.removeAttribute("aria-hidden");
      setCompact(next);
    };
    const observer = new IntersectionObserver(update, { threshold: 0 });
    observer.observe(hero);
    desktop.addEventListener("change", update);
    window.addEventListener("pageshow", update);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", update);
      window.removeEventListener("pageshow", update);
    };
  }, []);

  return (
    <header ref={header} className={styles.siteHeader} data-compact={compact}>
      <div className={styles.headerInner}>{children}</div>
    </header>
  );
}
