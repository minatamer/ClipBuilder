export const FILM_FORMAT = { width: 1920, height: 1080, fps: 30 } as const;
export const FILM_OPENING_FRAME = 25;
export const FILM_POSTER = "/product-film/opening.jpg";
export type FilmVariant = "walkthrough" | "style";
export type FilmBeat =
  | "identity"
  | "intake"
  | "analysis"
  | "choose"
  | "build"
  | "review"
  | "result"
  | "close";
export type FilmShot = { beat: FilmBeat; from: number; duration: number };

function timeline(beats: readonly (readonly [FilmBeat, number])[]): FilmShot[] {
  let from = 0;
  return beats.map(([beat, duration]) => {
    const shot = { beat, from, duration };
    from += duration;
    return shot;
  });
}

export const FILM_TIMELINES: Record<FilmVariant, readonly FilmShot[]> = {
  walkthrough: timeline([
    ["identity", 60],
    ["intake", 90],
    ["analysis", 90],
    ["choose", 90],
    ["build", 105],
    ["review", 105],
    ["result", 120],
    ["close", 60],
  ]),
  style: timeline([
    ["identity", 30],
    ["choose", 90],
    ["build", 60],
    ["result", 60],
  ]),
};

export function filmDuration(variant: FilmVariant) {
  return FILM_TIMELINES[variant].reduce(
    (total, shot) => total + shot.duration,
    0,
  );
}

export const FILM_CAPTURES = {
  intake: "/product-film/intake.png",
  preparation: "/product-film/preparation.png",
  source: "/product-film/source.png",
  analysis: "/product-film/analysis.png",
  candidates: "/product-film/candidates.png",
  selected: "/product-film/selected.png",
  build: "/product-film/build.png",
  review: "/product-film/review.png",
  render: "/product-film/render.png",
  result: "/product-film/result.png",
} as const;

export const FILM_COPY: Record<FilmBeat, { title: string; detail: string }> = {
  identity: {
    title: "A conversation.\nA complete idea.",
    detail: "ClipBuilder",
  },
  intake: {
    title: "Bring the\nconversation.",
    detail: "Prepare one recording.",
  },
  analysis: {
    title: "Find the\ncomplete ideas.",
    detail: "Grounded in the source.",
  },
  choose: {
    title: "Pick your\nmoments.",
    detail: "Keep the moments you want.",
  },
  build: {
    title: "Let the story\ntake shape.",
    detail: "Framing. Captions. Context.",
  },
  review: {
    title: "Make the\ncut yours.",
    detail: "Edit captions, pictures and style.",
  },
  result: {
    title: "Your next\nstandout clip.",
    detail: "Download your MP4. Share it anywhere.",
  },
  close: { title: "Your next cut.\nStarts here.", detail: "ClipBuilder" },
};
