import { describe, expect, it } from "vitest";
import {
  HeadPixelTracker,
  type GrayFrame,
} from "../../../../../packages/composition/local/head-pixel-tracker.ts";

function image(
  x = 80,
  y = 80,
  scale = 1,
  angle = 0,
  visible = true,
): GrayFrame {
  const width = 320,
    height = 180,
    pixels = new Float32Array(width * height).fill(28);
  for (let py = 0; py < height; py++)
    for (let px = 0; px < width; px++) {
      for (const [cx, cy, target] of [
        [x, y, true],
        [240, 90, false],
      ] as const) {
        if (target && !visible) continue;
        const dx = px - cx,
          dy = py - cy;
        const lx = (dx * Math.cos(angle) + dy * Math.sin(angle)) / scale,
          ly = (-dx * Math.sin(angle) + dy * Math.cos(angle)) / scale;
        if (Math.abs(lx) <= 20 && Math.abs(ly) <= 30)
          pixels[py * width + px] =
            120 +
            55 * Math.sin(lx * (target ? 0.6 : 0.8)) * Math.sin(ly * 0.4) +
            30 * Math.cos(lx * 0.2 + ly * 0.3);
      }
    }
  return { width, height, pixels };
}
const seed = { x: 60 / 320, y: 50 / 180, width: 40 / 320, height: 60 / 180 };
describe("manually seeded classical head tracking", () => {
  it("optionally reacquires an abrupt unique layout translation and still stops on loss", () => {
    const options = { immediate: true, recoverTranslation: true };
    const point = new HeadPixelTracker(image(), seed, options).step(
      image(120, 80),
    );
    expect(point).not.toBeNull();
    expect(Math.abs(point!.x * 320 - 120)).toBeLessThan(1);
    expect(
      new HeadPixelTracker(image(), seed, options).step(
        image(80, 80, 1, 0, false),
      ),
    ).toBeNull();
    const repeated = image(120, 80);
    for (let y = 50; y < 110; y++)
      for (let x = 100; x < 140; x++)
        repeated.pixels[y * 320 + x + 50] = repeated.pixels[y * 320 + x]!;
    expect(
      new HeadPixelTracker(image(), seed, options).step(repeated),
    ).toBeNull();
  });
  it("follows translation past the original camera without switching to a stationary distractor", () => {
    const tracker = new HeadPixelTracker(image(), seed);
    for (let i = 1; i <= 20; i++) {
      const p = tracker.step(image(80 + i * 3, 80 + i * 0.4));
      expect(p, `frame ${i}`).not.toBeNull();
      expect(Math.abs(p!.x * 320 - (80 + i * 3))).toBeLessThan(2.5);
      expect(Math.abs(p!.y * 180 - (80 + i * 0.4))).toBeLessThan(2.5);
    }
  });
  it("retains small gradual head rotation and scale without requiring new owner points", () => {
    const tracker = new HeadPixelTracker(image(), seed);
    for (let i = 1; i <= 15; i++) {
      const p = tracker.step(image(80 + i * 1.5, 80, 1 + i * 0.005, i * 0.006));
      expect(p, `frame ${i}`).not.toBeNull();
      expect(Math.abs(p!.x * 320 - (80 + i * 1.5))).toBeLessThan(3);
    }
  });
  it("stops on disappearance, scene replacement or incompatible frame size", () => {
    expect(
      new HeadPixelTracker(image(), seed).step(image(80, 80, 1, 0, false)),
    ).toBeNull();
    const cut = image();
    cut.pixels.fill(240);
    expect(new HeadPixelTracker(image(), seed).step(cut)).toBeNull();
    expect(
      new HeadPixelTracker(image(), seed).step({ ...image(), width: 319 }),
    ).toBeNull();
  });
  it("rejects an untextured seed and oversized/malformed frames", () => {
    const flat = image();
    flat.pixels.fill(128);
    expect(() => new HeadPixelTracker(flat, seed)).toThrow("head_not_clear");
    expect(
      () => new HeadPixelTracker({ ...image(), width: 513 }, seed),
    ).toThrow("head_frame_invalid");
  });
});
