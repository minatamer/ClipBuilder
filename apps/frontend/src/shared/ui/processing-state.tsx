import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";
import { Progress } from "./progress";
import styles from "./processing-state.module.css";

/** No timer or estimated completion: measured progress is explicitly supplied. */
export function ProcessingState({
  label,
  className,
  progress,
  children,
}: {
  label: string;
  className?: string;
  progress?: { fraction: number; valueText: string };
  children?: ReactNode;
}) {
  return (
    <div className={[styles.state, className].filter(Boolean).join(" ")}>
      <div className={styles.visual} aria-hidden="true">
        <span className={styles.halo} />
        <span className={styles.orbit} />
        <LoaderCircle className={styles.spinner} strokeWidth={0.8} />
        <BrandMark className={styles.mark} />
      </div>
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
