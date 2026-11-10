import type { ReactNode, Ref } from "react";
import { createPortal } from "react-dom";
import { useWorkspaceChrome } from "./workspace";

import styles from "./workflow.module.css";

export function WorkflowFrame({
  title,
  subtitle,
  headingRef,
  step,
  children,
  actions = null,
  bounded = false,
}: {
  title: string;
  subtitle?: string | undefined;
  headingRef?: Ref<HTMLHeadingElement>;
  step: 0 | 1 | 2 | null;
  children: ReactNode;
  actions?: ReactNode;
  bounded?: boolean;
}) {
  const chrome = useWorkspaceChrome();
  const toolbar =
    actions !== null ? <div className={styles.actions}>{actions}</div> : null;
  return (
    <main
      id="sample-main"
      tabIndex={-1}
      className={styles.frame}
      data-stage={step ?? "opening"}
    >
      <header className={styles.heading}>
        <h1 ref={headingRef} tabIndex={-1}>
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div
        className={`${styles.content} ${bounded ? styles.boundedContent : ""}`}
      >
        {children}
      </div>
      {chrome
        ? chrome.actions && toolbar && createPortal(toolbar, chrome.actions)
        : toolbar}
    </main>
  );
}
