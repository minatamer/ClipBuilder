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
  triggerLabel = "Privacy & limits",
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
                <p className={styles.dialogEyebrow}>Privacy &amp; limits</p>
                <h2 id={titleId}>Small scope. Plain limits.</h2>
              </div>
              <button
                className={styles.dialogClose}
                type="button"
                aria-label="Close privacy and limits"
                onClick={closeDialog}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <p className={styles.dialogIntro} id={descriptionId}>
              ClipBuilder is a focused demo for one owned conversation and one
              temporary vertical edit.
            </p>
          </div>

          <div className={styles.dialogGrid}>
            <section>
              <span>01</span>
              <h3>Owned media only</h3>
              <p>
                Use only a recording you own or have permission to edit.
                {cloudMedia
                  ? " After confirmation, the original is uploaded to temporary private storage and a bounded audiovisual proxy is sent for AI analysis. Provider retention is separate."
                  : localMedia
                    ? " Original video stays on this device; it is not uploaded."
                    : " The development preview never reads or uploads selected files."}
              </p>
            </section>
            <section>
              <span>02</span>
              <h3>One temporary edit</h3>
              <p>
                No account, project history, batch workflow, or direct social
                publishing.
                {localMedia &&
                  " One recoverable workspace expires two hours after selection. Clear media deletes it best-effort. Closing the tab cannot guarantee deletion; expiry cleanup runs while open or on the next visit. Browser storage can be removed sooner."}
                {cloudMedia &&
                  " Cloud source access also expires after two hours. Cancel and clear request immediate deletion; an independent expiry sweep retries cleanup. Outages can delay physical deletion."}
              </p>
            </section>
            <section>
              <span>03</span>
              <h3>Visible bounds</h3>
              <p>
                For the fastest demo, use an MP4 under 10 minutes and 250 MiB.
                Maximum: 20 minutes and 500 MiB. Your final clip will be 10–60
                seconds.
              </p>
            </section>
          </div>
        </div>
      </dialog>
    </>
  );
}
