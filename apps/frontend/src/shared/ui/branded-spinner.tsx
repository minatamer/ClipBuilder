import { BrandMark } from "./brand-mark";
import styles from "./branded-spinner.module.css";

export type BrandedSpinnerSize = "standard" | "compact";

/** Decorative visual only. The owning status supplies its accessible label. */
export function BrandedSpinner({
  size = "standard",
}: {
  size?: BrandedSpinnerSize;
}) {
  return (
    <div
      className={styles.visual}
      data-branded-spinner
      data-size={size}
      aria-hidden="true"
    >
      <span className={styles.halo} />
      <BrandMark className={styles.mark} />
      <svg
        className={styles.rings}
        viewBox="0 0 100 100"
        fill="none"
        focusable="false"
      >
        <circle
          className={styles.orbit}
          cx="50"
          cy="50"
          r="47"
          strokeWidth="0.8"
        />
        <circle
          data-brand-spinner-ring
          className={styles.spinner}
          cx="50"
          cy="50"
          r="43"
          strokeWidth="2.4"
          pathLength="100"
          strokeDasharray="74 26"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
