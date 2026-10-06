"use client";

import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { ProductFilm } from "./product-film";
import {
  FILM_FORMAT,
  FILM_OPENING_FRAME,
  filmDuration,
  type FilmVariant,
} from "./film-timeline";
import { ProductFilmPoster } from "./product-film-poster";
import { ProductFilmFallback } from "./product-film-fallback";

export function ProductFilmPlayer({
  active,
  variant,
}: {
  active: boolean;
  variant: FilmVariant;
}) {
  const player = useRef<PlayerRef>(null);
  useEffect(() => {
    const current = player.current;
    if (!current) return;
    if (active) {
      current.play();
    } else {
      current.pause();
    }
  }, [active]);
  return (
    <Player
      ref={player}
      component={ProductFilm}
      inputProps={{ variant }}
      durationInFrames={filmDuration(variant)}
      compositionWidth={FILM_FORMAT.width}
      compositionHeight={FILM_FORMAT.height}
      fps={FILM_FORMAT.fps}
      controls={false}
      clickToPlay={false}
      allowFullscreen={false}
      autoPlay={active}
      initialFrame={FILM_OPENING_FRAME}
      renderLoading={() => <ProductFilmPoster />}
      loop
      initiallyMuted
      showVolumeControls={false}
      numberOfSharedAudioTags={0}
      spaceKeyToPlayOrPause={false}
      style={{ width: "100%", aspectRatio: "16 / 9" }}
      errorFallback={() => <ProductFilmFallback />}
    />
  );
}
