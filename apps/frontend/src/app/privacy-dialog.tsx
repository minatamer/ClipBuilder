"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "../shared/ui/button";

import styles from "./page.module.css";

type PrivacyDialogProperties = {
  triggerClassName?: string | undefined;
  triggerLabel?: string;
  triggerVariant?: "secondary";
  localMedia?: boolean;
  cloudMedia?: boolean;
};

export function PrivacyDialog({
  triggerClassName,
  triggerLabel = "Privacy",
  triggerVariant,
  localMedia = false,
  cloudMedia = false,
}: PrivacyDialogProperties) {
  const dialogReference = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const openDialog = () => {
    if (!dialogReference.current?.open) {
      dialogReference.current?.showModal();
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
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDialog();
          }
        }}
      >
        <div className={styles.dialogSurface}>
          <div className={styles.dialogLead}>
            <div className={styles.dialogHeading}>
              <div>
                <p className={styles.dialogEyebrow}>Privacy</p>
                <h2 id={titleId}>Your media stays yours.</h2>
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

            <p className={styles.dialogIntro} id={descriptionId}>
              Used only to create your requested clip.
              {!localMedia &&
                !cloudMedia &&
                " Development preview never reads or uploads selected files."}
            </p>
          </div>

          <div className={styles.dialogGrid}>
            <section>
              <span>01</span>
              <h3>No reuse or publishing</h3>
              <p>
                We don’t publish your video or edit, reuse them in marketing, or
                keep them as demo content.
              </p>
            </section>
            <section>
              <span>02</span>
              <h3>Temporary storage</h3>
              <p>
                {cloudMedia
                  ? "Device and cloud copies are temporary. Exit starts background deletion; cleanup may be delayed. Downloaded files remain."
                  : localMedia
                    ? "Your video stays on this device. Exit starts best-effort cleanup; closing the tab doesn’t. Downloaded files remain."
                    : "Real processing uses temporary private storage. Exit starts background deletion; cleanup may be delayed. Downloaded files remain."}
              </p>
            </section>
            <section>
              <span>03</span>
              <h3>AI processing</h3>
              <p>
                Real AI processing sends a short audio/video copy to Google
                Gemini. Google’s retention rules are separate.
              </p>
              {cloudMedia && (
                <p>
                  Contextual pictures may use short scene descriptions from the
                  selected clip to search Wikimedia Commons. Your video is not
                  sent to Wikimedia. If no usable picture is found, Gemini may
                  create an illustrative image from a short scene description.
                </p>
              )}
            </section>
          </div>
        </div>
      </dialog>
    </>
  );
}
