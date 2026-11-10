"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { PrivacyDialog } from "../../app/privacy-dialog";
import { Button } from "./button";
import { BrandMark } from "./brand-mark";
import { Ellipsis } from "lucide-react";
import styles from "./workspace.module.css";

type WorkspaceSlots = {
  actions: HTMLDivElement | null;
  tools: HTMLDivElement | null;
  help: HTMLDivElement | null;
};
const WorkspaceChrome = createContext<WorkspaceSlots | undefined>(undefined);
export const useWorkspaceChrome = () => useContext(WorkspaceChrome);
export function Workspace({
  children,
  clear,
  localMode = false,
  cloudMode = false,
  illustrativePictures = false,
  sessionActions,
  editing = false,
}: {
  children: ReactNode;
  clear?: () => void;
  localMode?: boolean;
  cloudMode?: boolean;
  illustrativePictures?: boolean;
  sessionActions?: ReactNode;
  editing?: boolean;
}) {
  const [actions, setActions] = useState<HTMLDivElement | null>(null);
  const [tools, setTools] = useState<HTMLDivElement | null>(null);
  const [help, setHelp] = useState<HTMLDivElement | null>(null);
  return (
    <WorkspaceChrome value={{ actions, tools, help }}>
      <div className={styles.workspace} data-editing={editing || undefined}>
        <a className={styles.skipLink} href="#sample-main">
          Skip to main content
        </a>
        <header className={styles.header} data-workspace-toolbar>
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
          <div ref={setTools} className={styles.tools} />
          <div ref={setActions} className={styles.headerActions} />
          <div ref={setHelp} className={styles.help} />
          <details
            className={styles.sessionMenu}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
              }
            }}
          >
            <summary aria-label="Session options" title="Session options">
              <Ellipsis size={20} aria-hidden="true" />
            </summary>
            <div className={styles.menuContent}>
              {sessionActions}
              <PrivacyDialog
                localMedia={localMode}
                cloudMedia={cloudMode}
                illustrativePictures={illustrativePictures}
                triggerVariant="secondary"
              />
              {clear !== undefined && (
                <Button variant="secondary" onClick={clear}>
                  Exit
                </Button>
              )}
            </div>
          </details>
        </header>
        {children}
      </div>
    </WorkspaceChrome>
  );
}
