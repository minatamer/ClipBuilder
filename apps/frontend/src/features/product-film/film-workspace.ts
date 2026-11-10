/** Measured from the 1440×1000 current-workspace synthetic capture package (CL-273). */
export const FILM_WORKSPACE = {
  source: { x: 41, y: 243, width: 684, height: 385 },
  editor: { x: 116, y: 76, width: 457, height: 812 },
  upload: { x: 224, y: 817 },
  analyze: { x: 1300, y: 32 },
  jump: { x: 845, y: 446 },
  process: { x: 1306, y: 32 },
  download: { x: 1245, y: 32 },
  cards: [0, 1, 2].map((index) => ({
    x: 767,
    y: 331 + index * 174,
    width: 645,
    height: 158,
  })),
} as const;
