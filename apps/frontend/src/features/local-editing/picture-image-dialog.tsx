import { useId, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { Button } from "../../shared/ui/button";
import styles from "./picture-image-dialog.module.css";

/** Inspect existing protected bytes without changing any editor draft. */
export function PictureImageDialog({
  workspaceId,
  assetId,
  number,
  onOpen,
  occurrence,
}: {
  workspaceId: string;
  assetId: string;
  number: number;
  onOpen: () => void;
  occurrence?: "hook" | "body";
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  return (
    <div ref={root} className={styles.trigger}>
      <Button
        variant="quiet"
        aria-label={`View picture ${number}${occurrence === "hook" ? " [Hook]" : ""}`}
        aria-haspopup="dialog"
        onClick={() => {
          if (!dialog.current || dialog.current.open) return;
          onOpen();
          setStatus("loading");
          setOpened(true);
          dialog.current.showModal();
          dialog.current
            .querySelector<HTMLButtonElement>("button")
            ?.focus({ preventScroll: true });
        }}
      >
        <Maximize2 size={14} aria-hidden="true" />
        View
      </Button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={() => {
          setOpened(false);
          root.current
            ?.querySelector<HTMLButtonElement>("button")
            ?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Tab" &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            event.preventDefault();
            dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            dialog.current?.close();
        }}
      >
        <div className={styles.surface}>
          <header className={styles.heading}>
            <h2 id={titleId}>
              Picture {number}
              {occurrence === "hook" ? " [Hook]" : ""}
            </h2>
            <Button
              variant="secondary"
              aria-label="Close image"
              onClick={() => dialog.current?.close()}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </header>
          <div className={styles.media}>
            {opened && status !== "failed" && (
              // The protected original is already normalized; no image proxy is needed.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/local/workspace/${workspaceId}/assets/${assetId}`}
                alt={`Picture ${number}`}
                className={styles.image}
                style={{
                  visibility: status === "ready" ? "visible" : "hidden",
                }}
                onLoad={() => setStatus("ready")}
                onError={() => setStatus("failed")}
              />
            )}
            {status === "loading" && opened && (
              <p role="status">Loading image…</p>
            )}
            {status === "failed" && (
              <p role="alert">Couldn’t load this image. Close and try again.</p>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
