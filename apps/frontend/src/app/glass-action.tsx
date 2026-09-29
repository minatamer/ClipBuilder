"use client";

import { Glass, type GlassOptics } from "@samasante/liquid-glass";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./page.module.css";

const actionOptics: Partial<GlassOptics> = {
  bend: 0.46,
  bendWidth: 0.18,
  brightness: 0.035,
  curvature: 0.24,
  depth: 0.56,
  dispersion: 0.2,
  frost: 7,
  glow: 0.35,
  glowFalloff: 2.2,
  glowSpread: 0.12,
  saturate: 1.35,
  sheen: 0.72,
  sheenAngle: -38,
  sheenFalloff: 2.4,
  sheenWidth: 2.4,
  softEdge: true,
  specular: 0.9,
  strength: 0.05,
};

type GlassActionProps = Omit<ComponentPropsWithoutRef<"a">, "children"> & {
  children: ReactNode;
  tone?: "primary" | "secondary";
};

export function GlassAction({
  children,
  className,
  tone = "primary",
  ...linkProps
}: GlassActionProps) {
  const toneClass =
    tone === "secondary"
      ? styles.glassActionSecondary
      : styles.glassActionPrimary;

  return (
    <Glass
      className={`${styles.glassActionShell} ${toneClass}`}
      optics={actionOptics}
      radius={999}
    >
      <a className={className} {...linkProps}>
        {children}
      </a>
    </Glass>
  );
}
