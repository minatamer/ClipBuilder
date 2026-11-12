import { useEffect, useId, useRef } from "react";
import { RotateCcw, WifiOff } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { Button } from "./button";
import styles from "./connection-recovery.module.css";

/** One owner for connection feedback/actions, separate from active processing. */
export function ConnectionRecovery({
  state,
  onReconnect,
  onNewSession,
  layout = "workspace",
}: {
  state: "unavailable" | "missing" | "reconnecting";
  onReconnect: () => void;
  onNewSession?: (() => void) | undefined;
  layout?: "workspace" | "compact";
}) {
  const id = useId(),
    pending = state === "reconnecting";
  const root = useRef<HTMLElement>(null),
    restoreFocus = useRef(false);
  useEffect(() => {
    if (pending || !restoreFocus.current) return;
    restoreFocus.current = false;
    if (document.activeElement === document.body)
      root.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [pending]);
  const title = pending
    ? "Reconnecting to your workspace"
    : state === "missing"
      ? "This workspace isn’t available"
      : "Couldn’t reach your workspace";
  return (
    <section
      ref={root}
      className={styles.recovery}
      data-layout={layout}
      data-connection-recovery
      data-missing={state === "missing" || undefined}
      aria-labelledby={id}
    >
      {layout === "workspace" && (
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.window}>
            <div className={styles.chrome}>
              <i />
              <i />
              <i />
            </div>
            <div className={styles.rail}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.canvas}>
              <BrandMark />
              <span />
            </div>
            <div className={styles.inspector}>
              <i />
              <span />
              <span />
              <i />
              <span />
            </div>
          </div>
          <div className={styles.signal}>
            <WifiOff size={22} />
          </div>
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.copy} role="status" aria-live="polite">
          {layout === "compact" ? (
            <span id={id} className={styles.compactTitle}>
              <WifiOff size={16} aria-hidden="true" />
              {pending
                ? "Reconnecting…"
                : state === "missing"
                  ? "Session unavailable"
                  : "Connection interrupted"}
            </span>
          ) : (
            <>
              <h2 id={id}>{title}</h2>
              <p>
                {pending
                  ? "Checking the connection to this workspace…"
                  : state === "missing"
                    ? "Try reconnecting, or start a new session to continue."
                    : "We couldn’t reach this workspace. Reconnect to pick up where you left off."}
              </p>
            </>
          )}
        </div>
        <div className={styles.actions}>
          <Button
            variant={layout === "compact" ? "secondary" : "primary"}
            icon={RotateCcw}
            busy={pending}
            disabled={pending}
            onClick={() => {
              restoreFocus.current =
                root.current?.contains(document.activeElement) ?? false;
              onReconnect();
            }}
          >
            Reconnect
          </Button>
          {state === "missing" && onNewSession && (
            <Button variant="quiet" onClick={onNewSession}>
              Start new session
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
