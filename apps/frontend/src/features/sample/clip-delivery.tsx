"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../shared/ui/button";
import styles from "./sample.module.css";

export function ClipDeliveryActions({
  target,
  children,
}: {
  target?: HTMLElement | null | undefined;
  children: ReactNode;
}) {
  return target ? createPortal(children, target) : children;
}

const destinations = [
  {
    name: "Facebook",
    logo: (
      <path d="M14 21v-8h3l.5-4H14V7c0-1.1.4-2 2-2h2V1.5A24 24 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v8z" />
    ),
  },
  {
    name: "Instagram",
    logo: (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".9" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    name: "TikTok",
    logo: (
      <path d="M14 2h3c.2 2.5 1.5 4.2 4 4.6v3.2a9 9 0 0 1-4-1.3v7.3a6.2 6.2 0 1 1-6.2-6.2h.8v3.2a3 3 0 1 0 2.4 3z" />
    ),
  },
  {
    name: "X",
    logo: (
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.5 5.4 22H2.2l8.3-9.5L2.8 2h6.5l4.5 6.9zm-1.1 18h1.7L8.3 4H6.5z" />
    ),
  },
];

export function SocialDestinations() {
  return (
    <section
      className={styles.socialDestinations}
      aria-labelledby="social-heading"
    >
      <h2 id="social-heading">Share on social media</h2>
      <div className={styles.socialActions}>
        {destinations.map(({ name, logo }) => (
          <Button
            key={name}
            variant="secondary"
            className={styles.socialButton}
            disabled
            aria-label={`${name} sharing unavailable, coming soon`}
          >
            <span className={styles.socialButtonContent} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {logo}
              </svg>
              <strong>{name}</strong>
            </span>
            <span className={styles.socialSoon} aria-hidden="true">
              Soon
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
