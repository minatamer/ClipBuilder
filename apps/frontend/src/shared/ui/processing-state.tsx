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
}: {
  label: string;
  className?: string;
  progress?: { fraction: number; valueText: string };
  children?: ReactNode;
  indicatorSize?: BrandedSpinnerSize;
}) {
  return (
    <div className={[styles.state, className].filter(Boolean).join(" ")}>
      <BrandedSpinner size={indicatorSize} />
      <p className={styles.title} role="status" aria-live="polite">
        {label}
      </p>
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
