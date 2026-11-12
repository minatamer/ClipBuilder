import type { ReactNode } from "react";
import { BrandedSpinner, type BrandedSpinnerSize } from "./branded-spinner";
import { Progress } from "./progress";
import styles from "./processing-state.module.css";

/** No timer or estimated completion: measured progress is explicitly supplied. */
export function ProcessingState({
  label,
  className,
  progress,
  children,
  indicatorSize = "standard",
  layout = "panel",
}: {
  label: string;
  className?: string | undefined;
  progress?: { fraction: number; valueText: string };
  children?: ReactNode;
  indicatorSize?: BrandedSpinnerSize;
  layout?: "panel" | "compact" | "workspace";
}) {
  return (
    <div
      className={[styles.state, className].filter(Boolean).join(" ")}
      data-layout={layout}
    >
      <BrandedSpinner size={layout === "compact" ? "compact" : indicatorSize} />
      <p className={styles.title} role="status" aria-live="polite">
        {label}
      </p>
      {layout === "compact" && !progress && (
        <div className={styles.skeleton} aria-hidden="true">
          <span />
          <span />
        </div>
      )}
      {children}
      {progress && (
        <div className={styles.meter}>
          <Progress
            label="Uploaded"
            fraction={progress.fraction}
            valueText={progress.valueText}
          />
        </div>
      )}
    </div>
  );
}
