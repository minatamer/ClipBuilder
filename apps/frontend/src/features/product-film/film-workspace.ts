/** Measured from the 1440×1000 current-workspace synthetic capture package (CL-273). */
export const FILM_WORKSPACE = {
  source: { x: 24, y: 172, width: 623, height: 350 },
  editor: { x: 116, y: 76, width: 456, height: 810 },
  upload: { x: 1154, y: 664 },
  analyze: { x: 1342, y: 902 },
  jump: { x: 1336, y: 308 },
  process: { x: 1348, y: 719 },
  download: { x: 1245, y: 32 },
  captions: { x: 775, y: 90 },
  captionStyle: { x: 1358, y: 418 },
  layer: { x: 624, y: 461 },
  cameraCrop: { x: 797, y: 353 },
  cards: [0, 1, 2].map((index) => ({
    x: 704,
    y: 273.2 + index * 132.4,
    width: 704,
    height: 122,
  })),
} as const;
