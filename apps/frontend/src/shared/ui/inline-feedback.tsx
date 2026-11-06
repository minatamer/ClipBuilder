import styles from "./inline-feedback.module.css";

/** Keep a local message slot mounted so validation cannot reflow its controls. */
export function InlineFeedback({
  message,
  id,
  tone = "error",
  reserve = true,
  inline = false,
}: {
  message?: string | null | undefined;
  id?: string | undefined;
  tone?: "error" | "status";
  reserve?: boolean;
  inline?: boolean;
}) {
  if (!reserve && !message) return null;
  return (
    <span
      id={id}
      data-inline-feedback
      data-reserve={reserve || undefined}
      data-inline={inline || undefined}
      className={styles.feedback}
      role={message ? (tone === "error" ? "alert" : "status") : undefined}
      aria-hidden={!message || undefined}
    >
      {message}
    </span>
  );
}
