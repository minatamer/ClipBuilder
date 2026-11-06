import { expect, it, vi } from "vitest";
import { decodedThumbnailZoom, thumbnailZoom } from "./thumbnail-framing";

function frame({
  top = 0,
  bottom = top,
  left = 0,
  right = left,
  dark = false,
}: {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  dark?: boolean;
} = {}) {
  const width = 128,
    height = 72;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      const band =
        dark ||
        y < top ||
        y >= height - bottom ||
        x < left ||
        x >= width - right;
      data.set(band ? [6, 6, 6, 255] : [35, 130, 190, 255], p);
    }
  return { data, width, height };
}

it("fills embedded paired letterbox and pillarbox bands without modifying pixels", () => {
  const pixels = frame({ top: 10 }),
    original = pixels.data.slice();
  expect(thumbnailZoom(pixels)).toBeCloseTo(72 / 52);
  expect(pixels.data).toEqual(original);
  expect(thumbnailZoom(frame({ left: 12 }))).toBeCloseTo(128 / 104);
  expect(thumbnailZoom(frame({ top: 8, left: 10 }))).toBeCloseTo(72 / 56);
});

it.each([
  {},
  { dark: true },
  { top: 10, bottom: 0 },
  { left: 8, right: 18 },
  { top: 25 },
  { top: 1 },
])(
  "keeps normal framing for unbanded, dark, ambiguous or excessive edges: %j",
  (options) => {
    expect(thumbnailZoom(frame(options))).toBe(1);
  },
);

it("accounts for cover cropping already provided by non-landscape source ratios", () => {
  expect(thumbnailZoom(frame({ top: 8 }), 9 / 16)).toBe(1);
  expect(thumbnailZoom(frame({ left: 8 }), 3)).toBe(1);
  expect(thumbnailZoom(frame({ top: 8 }), 3)).toBeCloseTo(72 / 56);
});

it("does not treat transparent edges or a small bright object on black as bands", () => {
  const transparent = frame({ top: 10 });
  for (let p = 3; p < transparent.data.length; p += 4) transparent.data[p] = 0;
  expect(thumbnailZoom(transparent)).toBe(1);
  expect(thumbnailZoom(frame({ top: 25, left: 40 }))).toBe(1);
  expect(
    thumbnailZoom({ data: new Uint8ClampedArray(), width: 128, height: 72 }),
  ).toBe(1);
  expect(thumbnailZoom(frame(), NaN)).toBe(1);
});

it("bounds canvas reads, releases its pixels and degrades safely if inspection fails", () => {
  const drawImage = vi.fn(),
    getImageData = vi.fn(() => frame({ top: 10 }));
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({ drawImage, getImageData })),
  };
  vi.stubGlobal("document", { createElement: vi.fn(() => canvas) });
  try {
    const video = { videoWidth: 1920, videoHeight: 1080 } as HTMLVideoElement;
    expect(decodedThumbnailZoom(video)).toBeCloseTo(72 / 52);
    expect(drawImage).toHaveBeenCalledExactlyOnceWith(video, 0, 0, 128, 72);
    expect(getImageData).toHaveBeenCalledExactlyOnceWith(0, 0, 128, 72);
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
    getImageData.mockImplementation(() => {
      throw Error("synthetic blocked canvas");
    });
    expect(decodedThumbnailZoom(video)).toBe(1);
    expect(
      decodedThumbnailZoom({
        naturalWidth: 0,
        naturalHeight: 0,
      } as HTMLImageElement),
    ).toBe(1);
  } finally {
    vi.unstubAllGlobals();
  }
});
