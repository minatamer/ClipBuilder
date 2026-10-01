import type { ReactNode, Ref } from "react";

import styles from "./workflow.module.css";

export function WorkflowFrame({
  title,
  subtitle,
  headingRef,
  step,
  children,
  footer,
  bounded = false,
}: {
  title: string;
  subtitle?: string | undefined;
  headingRef?: Ref<HTMLHeadingElement>;
  step: 0 | 1 | 2;
  children: ReactNode;
  footer: ReactNode;
  bounded?: boolean;
}) {
  return (
    <main id="sample-main" tabIndex={-1} className={styles.frame}>
      <header className={styles.heading}>
        <h1 ref={headingRef} tabIndex={-1}>
          Step {step + 1} of 3: {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div
        className={`${styles.content} ${bounded ? styles.boundedContent : ""}`}
      >
        {children}
      </div>
      {footer !== null && <footer className={styles.footer}>{footer}</footer>}
    </main>
  );
}
