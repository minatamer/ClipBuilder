import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button, IconButton } from "../../shared/ui/button";
import styles from "./editor-save-conflict.module.css";

const labels: Record<string, string> = {
  captions: "Caption styling",
  captionText: "Caption words",
  captionSpeakers: "Speakers",
  texts: "Text",
  visuals: "Pictures and videos",
  audio: "Audio",
  hook: "Hook",
  hookContent: "Hook edits",
  focus: "Camera",
  cameraEffects: "Camera effects",
  cameraTracks: "Face tracking",
  videoLook: "Filters",
  videoLooks: "Filters",
  source: "Source video",
  revision: "Saved version",
};
export function EditorSaveConflict({
  fields,
  canKeep,
  onClose,
  onResolve,
}: {
  fields: readonly string[];
  canKeep: boolean;
  onClose: () => void;
  onResolve: (keepLocal: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId(),
    descriptionId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus({ preventScroll: true });
      else
        document
          .querySelector<HTMLButtonElement>(
            ".editor-save-tools button:not(:disabled)",
          )
          ?.focus({ preventScroll: true });
    };
  }, []);
  const areas = [
    ...new Set(
      fields.map((field) => labels[field.split(".")[0]!] ?? "Clip edits"),
    ),
  ];
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className={styles.heading}>
        <h2 id={titleId}>Review saved changes</h2>
        <IconButton icon={X} label="Close save review" onClick={onClose} />
      </header>
      <div className={styles.body}>
        <p id={descriptionId}>
          This clip has newer saved changes. Your edits are still here.
        </p>
        <ul>
          {areas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
        {!canKeep && (
          <p>
            Use the saved version to continue. Local changes will be replaced
            only when you choose it.
          </p>
        )}
      </div>
      <footer className={styles.actions}>
        <Button variant="secondary" onClick={() => onResolve(false)}>
          Use saved changes
        </Button>
        <Button
          variant="primary"
          disabled={!canKeep}
          onClick={() => onResolve(true)}
        >
          Keep my changes
        </Button>
      </footer>
    </dialog>
  );
}
