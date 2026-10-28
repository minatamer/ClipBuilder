"use client";

import { useId, useRef } from "react";
import { ShieldCheck, FolderLock, Sparkles, X } from "lucide-react";
import { Button } from "../shared/ui/button";

import styles from "./page.module.css";

type PrivacyDialogProperties = {
  triggerClassName?: string | undefined;
  triggerLabel?: string;
  triggerVariant?: "secondary";
  localMedia?: boolean;
  cloudMedia?: boolean;
  illustrativePictures?: boolean;
};

export function PrivacyDialog({
  triggerClassName,
  triggerLabel = "Privacy",
  triggerVariant,
  localMedia = false,
  cloudMedia = false,
  illustrativePictures = false,
}: PrivacyDialogProperties) {
  const dialogReference = useRef<HTMLDialogElement>(null);
  const titleReference = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const openDialog = () => {
    if (!dialogReference.current?.open) {
      dialogReference.current?.showModal();
      titleReference.current?.focus({ preventScroll: true });
    }
  };

  const closeDialog = () => dialogReference.current?.close();

  return (
    <>
      {triggerVariant === "secondary" ? (
        <Button
          variant="secondary"
          className={triggerClassName}
          aria-haspopup="dialog"
          onClick={openDialog}
        >
          {triggerLabel}
        </Button>
      ) : (
        <button
          className={triggerClassName}
          type="button"
          aria-haspopup="dialog"
          onClick={openDialog}
        >
          {triggerLabel}
        </button>
      )}

      <dialog
        className={styles.privacyDialog}
        ref={dialogReference}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={(event) => {
          if (
            event.key !== "Tab" ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
          )
            return;
          const stops = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled),a[href],[tabindex="0"]',
            ),
          ];
          const first = stops[0],
            last = stops.at(-1);
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              closeDialog();
          }
        }}
      >
        <div className={styles.dialogSurface}>
          <div className={styles.dialogLead}>
            <div className={styles.dialogHeading}>
              <div className={styles.dialogIdentity}>
                <span className={styles.dialogMark} aria-hidden="true">
                  <ShieldCheck size={22} />
                </span>
                <p className={styles.dialogEyebrow}>Privacy</p>
              </div>
              <button
                className={styles.dialogClose}
                type="button"
                aria-label="Close privacy"
                onClick={closeDialog}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <h2 id={titleId} ref={titleReference} tabIndex={-1}>
              Your media stays yours.
            </h2>
            <p className={styles.dialogIntro} id={descriptionId}>
              Only used for your clip.
            </p>
          </div>

          <div
            className={styles.dialogGrid}
            role="region"
            aria-label="Privacy details"
            tabIndex={0}
          >
            <section data-privacy-point="files">
              <FolderLock size={20} aria-hidden="true" />
              <div>
                <h3>Your files</h3>
                <p>
                  Your video and edits aren’t published, used in marketing or
                  kept as demos.
                </p>
                <p>
                  {cloudMedia
                    ? "Device and cloud copies are temporary. Exit starts deletion; delays are possible. Downloaded files remain."
                    : localMedia
                      ? "Media stays on this device. Exit starts best-effort deletion; closing the tab doesn’t. Downloaded files remain."
                      : "Real processing uses temporary private storage. Exit starts deletion; delays are possible. Downloaded files remain."}
                </p>
                {cloudMedia && (
                  <p>
                    A temporary coded network identifier limits free demo use.
                    It is separate from your media.
                  </p>
                )}
              </div>
            </section>
            <section data-privacy-point="ai">
              <Sparkles size={20} aria-hidden="true" />
              <div>
                <h3>AI processing</h3>
                <p>
                  Real AI processing sends a short audio/video copy to our AI
                  provider. Its retention rules are separate.
                </p>
                {illustrativePictures ? (
                  <p>
                    AI generates pictures from short scene descriptions of your
                    selected clip.
                  </p>
                ) : (
                  cloudMedia && (
                    <p>
                      Wikimedia Commons receives short scene descriptions from
                      your clip for picture search. Your video isn’t sent to
                      Wikimedia. AI may generate a fallback image.
                    </p>
                  )
                )}
              </div>
            </section>
          </div>
        </div>
      </dialog>
    </>
  );
}
