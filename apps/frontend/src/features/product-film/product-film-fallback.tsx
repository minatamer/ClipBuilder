import styles from "./product-film-hero.module.css";

export function ProductFilmFallback() {
  return (
    <div className={styles.fallback} role="alert">
      <strong>Motion preview unavailable</strong>
      <p>Reload this page to try again, or open ClipBuilder.</p>
      <a href="/start">Open ClipBuilder</a>
    </div>
  );
}
