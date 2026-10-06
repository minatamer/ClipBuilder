import Image from "next/image";
import { FILM_FORMAT, FILM_POSTER } from "./film-timeline";
import styles from "./product-film-hero.module.css";

export function ProductFilmPoster() {
  return (
    <Image
      className={styles.poster}
      src={FILM_POSTER}
      alt=""
      width={FILM_FORMAT.width}
      height={FILM_FORMAT.height}
      loading="eager"
      fetchPriority="high"
      unoptimized
    />
  );
}
