/** Measured from the 1440×1000 current-workspace synthetic capture package (CL-273). */
export const FILM_WORKSPACE = {
  source: { x: 24, y: 172, width: 623, height: 350 },
  editor: { x: 116, y: 76, width: 456, height: 810 },
  upload: { x: 1154, y: 827 },
  analyze: { x: 1342, y: 916 },
  jump: { x: 1349, y: 325 },
  process: { x: 1348, y: 876 },
  download: { x: 1245, y: 32 },
  cards: [0, 1, 2].map((index) => ({
    x: 704,
    y: 287 + index * 129,
    width: 704,
    height: 129,
  })),
} as const;
