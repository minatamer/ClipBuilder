import { FILM_FORMAT } from "./film-timeline";
import { FilmIdentity } from "./film-identity";
import styles from "./product-film-hero.module.css";

export function ProductFilmPoster() {
  return (
    <div className={styles.poster} data-film-poster aria-hidden="true">
      <FilmIdentity height={FILM_FORMAT.height} enter={1} responsive />
    </div>
  );
}
