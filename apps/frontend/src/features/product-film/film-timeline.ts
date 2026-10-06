export const FILM_FORMAT = { width: 1920, height: 1080, fps: 30 } as const;
export const FILM_OPENING_FRAME = 25;
export const FILM_POSTER = "/generated/product-film/opening.jpg";
export type FilmVariant = "walkthrough" | "style";
export type FilmBeat =
  | "identity"
  | "intake"
  | "analysis"
  | "choose"
  | "build"
  | "review"
  | "result"
  | "share"
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
    ["identity", 90],
    ["intake", 150],
    ["analysis", 120],
    ["choose", 210],
    ["build", 210],
    ["review", 210],
    ["result", 240],
    ["share", 150],
    ["close", 120],
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
  intake: "/generated/product-film/intake.png",
  preparation: "/generated/product-film/preparation.png",
  source: "/generated/product-film/source.png",
  analysis: "/generated/product-film/analysis.png",
  candidates: "/generated/product-film/candidates.png",
  selected: "/generated/product-film/selected.png",
  build: "/generated/product-film/build.png",
  review: "/generated/product-film/review.png",
  render: "/generated/product-film/render.png",
  result: "/generated/product-film/result.png",
} as const;

export const FILM_COPY: Record<FilmBeat, { title: string; detail: string }> = {
  identity: {
    title: "A conversation. A complete idea.",
    detail: "ClipBuilder",
  },
  intake: {
    title: "Bring the conversation.",
    detail: "Prepare one recording.",
  },
  analysis: {
    title: "Find the complete ideas.",
    detail: "Grounded in the source.",
  },
  choose: { title: "One moment worth keeping.", detail: "Choose exactly one." },
  build: {
    title: "Let the story take shape.",
    detail: "Framing. Fixed captions. Context.",
  },
  review: {
    title: "Watch. Then confirm.",
    detail: "Read-only review before export.",
  },
  result: {
    title: "The idea, in focus.",
    detail: "Illustrative vertical composition.",
  },
  share: {
    title: "Carry the story further.",
    detail: "Download first. Share outside ClipBuilder.",
  },
  close: { title: "Your conversation. Your next cut.", detail: "ClipBuilder" },
};
