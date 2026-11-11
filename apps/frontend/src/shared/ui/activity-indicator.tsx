import styles from "./activity-indicator.module.css";

/** Small decorative activity for controls/statuses; the owner supplies the label. */
export function ActivityIndicator({ size = 16 }: { size?: number }) {
  return (
    <svg
      className={styles.indicator}
      data-activity-indicator
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className={styles.track} cx="12" cy="12" r="9" />
      <circle
        className={styles.orbit}
        cx="12"
        cy="12"
        r="9"
        pathLength="100"
        strokeDasharray="68 32"
        strokeLinecap="round"
      />
      <circle className={styles.core} cx="12" cy="12" r="2" />
    </svg>
  );
}
