"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { ProcessingChallengeAction } from "@clipbuilder/contracts";
import { Button } from "../../shared/ui/button";
import {
  mountProcessingChallenge,
  type Turnstile,
} from "./processing-challenge";
import styles from "./analysis-challenge.module.css";
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
export function AnalysisChallenge({
  siteKey,
  action,
  sessionId,
  onToken,
  onFailure,
}: {
  siteKey: string;
  action: ProcessingChallengeAction;
  sessionId: string;
  onToken(token: string): void;
  onFailure(): void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId(),
    descriptionId = useId();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!host.current) return;
    const open = () => {
      if (dialog.current && !dialog.current.open) dialog.current.showModal();
    };
    const stop = mountProcessingChallenge({
      host: host.current,
      document,
      api: () => window.turnstile,
      siteKey,
      action,
      sessionId,
      onInteractive: () => {
        setFailed(false);
        open();
      },
      onFinished: () => dialog.current?.close(),
      onToken,
      onError: () => {
        setFailed(true);
        open();
      },
    });
    const currentDialog = dialog.current;
    return () => {
      stop();
      currentDialog?.close();
    };
  }, [action, attempt, onToken, sessionId, siteKey]);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onFailure();
      }}
    >
      <div className={styles.content}>
        <h2 id={titleId}>Quick verification</h2>
        <p id={descriptionId}>
          {failed
            ? "Verification couldn’t finish. Please try again."
            : "Complete this check to continue."}
        </p>
      </div>
      <div ref={host} className={styles.widget} />
      <div className={`${styles.content} ${styles.actions}`}>
        {failed && (
          <Button
            onClick={() => {
              dialog.current?.close();
              setFailed(false);
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </Button>
        )}
        <Button variant="secondary" onClick={onFailure}>
          Cancel
        </Button>
      </div>
    </dialog>
  );
}
