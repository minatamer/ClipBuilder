import type { SafeError } from "@clipbuilder/contracts";
import type { ClippingSessionState } from "../session/session.types";
import { Button } from "../../shared/ui/button";
import { failureMessage } from "./failure-message";
import styles from "./sample.module.css";

export function ConnectionFailureNotice({
  failure,
  busy,
  onRetry,
  onClear,
}: {
  failure: SafeError;
  busy: boolean;
  onRetry(): void;
  onClear(): void;
}) {
  return (
    <div role="alert" className={styles.error}>
      <p>{failureMessage(failure)}</p>
      <Button variant="quiet" onClick={onRetry}>
        Retry connection
      </Button>
      {failure.code === "ACTIVE_SESSION_EXISTS" && (
        <Button variant="quiet" disabled={busy} onClick={onClear}>
          Clear existing preview
        </Button>
      )}
    </div>
  );
}

/** Presents recovery; the screen retains every operation, reservation and transition. */
export function WorkflowRecovery({
  state,
  localMode,
  busy,
  onRestoreOutput,
}: {
  state: ClippingSessionState;
  localMode: boolean;
  busy: boolean;
  onRestoreOutput(): void;
}) {
  switch (state.stage) {
    case "cloud-render-failed":
      return (
        <section className={styles.empty}>
          <p role="alert">
            Export could not be confirmed. Checking for an existing output will
            never start another render.
          </p>
          <Button onClick={onRestoreOutput} disabled={busy}>
            Check completed export
          </Button>
        </section>
      );
    case "fatal":
      return (
        <section className={styles.empty}>
          <p role="alert">{failureMessage(state.failure)}</p>
          {localMode && state.failure.code === "ACTIVE_SESSION_EXISTS" && (
            <p>Close the other workspace tab, then reconnect here.</p>
          )}
        </section>
      );
    case "expired":
      return (
        <section className={styles.empty}>
          <p>This temporary preview has expired. Start fresh.</p>
        </section>
      );
    case "cleanup-partial":
      return (
        <section className={styles.empty}>
          <p role="status">Returning home...</p>
        </section>
      );
    case "analysis-failed":
    case "assembly-failed":
    case "cloud-assembly-failed":
    case "render-failed":
      return (
        <section className={styles.empty}>
          <p role="alert">{failureMessage(state.failure)}</p>
        </section>
      );
    default:
      return null;
  }
}
