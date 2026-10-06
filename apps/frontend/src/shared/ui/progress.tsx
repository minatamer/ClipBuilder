import styles from "./workflow.module.css";

export function Progress({
  label,
  fraction,
  activityFraction,
  active = true,
  valueText,
}: {
  label: string;
  fraction?: number;
  activityFraction?: number;
  active?: boolean;
  valueText?: string;
}) {
  const value =
    fraction === undefined || !Number.isFinite(fraction)
      ? undefined
      : Math.max(0, Math.min(1, fraction));
  const percentage = value === undefined ? undefined : Math.floor(value * 100);
  const activity =
    activityFraction === undefined || !Number.isFinite(activityFraction)
      ? undefined
      : Math.max(0, Math.min(0.95, activityFraction));
  const fill = value ?? activity;
  return (
    <div className={styles.progress} data-active={active}>
      <div className={styles.progressLabel}>
        <span role="status">{label}</span>
        {value !== undefined && (
          <span className={styles.progressPercentage} aria-hidden="true">
            {percentage}%
          </span>
        )}
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={value === undefined ? undefined : valueText}
        data-determinate={value !== undefined}
        data-activity={value === undefined && activity !== undefined}
      >
        <span
          className={styles.progressFill}
          style={
            fill === undefined ? undefined : { transform: `scaleX(${fill})` }
          }
        />
      </div>
    </div>
  );
}
