"use client";
import type { ReactNode } from "react";
import { PrivacyDialog } from "../../app/privacy-dialog";
import { Button } from "./button";
import { BrandMark } from "./brand-mark";
import styles from "../../features/sample/sample.module.css";
export function Workspace({
  children,
  clear,
  localMode = false,
  cloudMode = false,
  illustrativePictures = false,
}: {
  children: ReactNode;
  clear?: () => void;
  localMode?: boolean;
  cloudMode?: boolean;
  illustrativePictures?: boolean;
}) {
  return (
    <div className={styles.workspace}>
      <a className={styles.skipLink} href="#sample-main">
        Skip to main content
      </a>
      <header className={styles.header}>
        <a
          href="/"
          className={styles.brand}
          aria-label="ClipBuilder home"
          onClick={
            clear
              ? (event) => {
                  event.preventDefault();
                  clear();
                }
              : undefined
          }
        >
          <BrandMark className={styles.brandMark} />
          <span className={styles.brandText}>ClipBuilder</span>
        </a>
        <div className={styles.headerActions}>
          <PrivacyDialog
            localMedia={localMode}
            cloudMedia={cloudMode}
            illustrativePictures={illustrativePictures}
            triggerVariant="secondary"
            triggerClassName={styles.headerButton}
          />
          {clear !== undefined && (
            <Button
              variant="secondary"
              className={styles.headerButton}
              onClick={clear}
            >
              Exit
            </Button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
