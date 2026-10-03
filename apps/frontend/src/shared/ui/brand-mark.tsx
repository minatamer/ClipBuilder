import styles from "./brand-mark.module.css";

export function BrandMark({ className }: { className?: string | undefined }) {
  return (
    <span
      className={[styles.mark, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <span />
      <span />
    </span>
  );
}
