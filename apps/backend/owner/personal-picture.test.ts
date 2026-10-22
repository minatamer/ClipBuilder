import { expect, it } from "vitest";
import { crc32, deflateSync } from "node:zlib";
import sharp from "sharp";
import { normalizeOwnerPicture } from "./personal-picture.ts";
import { OWNER_PICTURE_LIMITS as limits } from "../../../packages/contracts/owner/assets.ts";

const signal = () => new AbortController().signal;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const chunk = (type: string, bytes: Buffer) => {
  const size = Buffer.alloc(4),
    name = Buffer.from(type, "ascii"),
    checksum = Buffer.alloc(4);
  size.writeUInt32BE(bytes.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, bytes])));
  return Buffer.concat([size, name, bytes, checksum]);
};
const ihdr = (width: number, height: number) => {
  const bytes = Buffer.alloc(13);
  bytes.writeUInt32BE(width);
  bytes.writeUInt32BE(height, 4);
  bytes[8] = 8;
  bytes[9] = 6;
  return chunk("IHDR", bytes);
};
const animatedPng = () => {
  const animation = Buffer.alloc(8);
  animation.writeUInt32BE(2);
  const frame = (sequence: number) => {
    const control = Buffer.alloc(26);
    control.writeUInt32BE(sequence);
    control.writeUInt32BE(1, 4);
    control.writeUInt32BE(1, 8);
    control.writeUInt16BE(1, 20);
    control.writeUInt16BE(10, 22);
    return chunk("fcTL", control);
  };
  const secondPixels = Buffer.alloc(4);
  secondPixels.writeUInt32BE(2);
  return Buffer.concat([
    pngSignature,
    ihdr(1, 1),
    chunk("acTL", animation),
    frame(0),
    chunk("IDAT", deflateSync(Buffer.from([0, 255, 0, 0, 255]))),
    frame(1),
    chunk(
      "fdAT",
      Buffer.concat([
        secondPixels,
        deflateSync(Buffer.from([0, 0, 255, 0, 255])),
      ]),
    ),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

it.each(["png", "jpeg"] as const)(
  "decodes actual %s bytes, fits the original aspect ratio and returns canonical JPEG",
  async (format) => {
    const bytes = await sharp({
      create: { width: 2500, height: 1000, channels: 3, background: "#416974" },
    })
      .toFormat(format)
      .toBuffer();
    const normalized = await normalizeOwnerPicture(bytes, signal()),
      metadata = await sharp(normalized.bytes).metadata();
    expect(normalized.width).toBe(1920);
    expect(normalized.height).toBe(768);
    expect(normalized.bytes.length).toBeLessThanOrEqual(limits.bytes);
    expect(metadata).toEqual(
      expect.objectContaining({
        format: "jpeg",
        width: 1920,
        height: 768,
        hasAlpha: false,
      }),
    );
    expect(normalized.bytes.subarray(0, 3)).toEqual(
      Buffer.from([255, 216, 255]),
    );
  },
);

it("keeps small inputs at their original dimensions and flattens transparent pixels to the fixed background", async () => {
  const bytes = await sharp({
    create: { width: 8, height: 6, channels: 4, background: "#ff000000" },
  })
    .png()
    .toBuffer();
  const result = await normalizeOwnerPicture(bytes, signal()),
    pixels = await sharp(result.bytes)
      .raw()
      .toBuffer({ resolveWithObject: true });
  expect([result.width, result.height, pixels.info.channels]).toEqual([
    8, 6, 3,
  ]);
  for (const [index, expected] of [16, 18, 21].entries())
    expect(Math.abs(pixels.data[index]! - expected)).toBeLessThanOrEqual(2);
});

it("applies EXIF orientation to real pixels and strips orientation, EXIF and color-profile metadata", async () => {
  const width = 40,
    height = 20,
    raw = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 3;
      raw[offset] = x < width / 2 ? 240 : 15;
      raw[offset + 1] = 15;
      raw[offset + 2] = x < width / 2 ? 15 : 240;
    }
  }
  const oriented = await sharp(raw, { raw: { width, height, channels: 3 } })
    .withMetadata({
      orientation: 6,
      exif: { IFD0: { ImageDescription: "Synthetic private image metadata" } },
    })
    .jpeg({ quality: 95 })
    .toBuffer();
  const result = await normalizeOwnerPicture(oriented, signal()),
    metadata = await sharp(result.bytes).metadata(),
    decoded = await sharp(result.bytes)
      .raw()
      .toBuffer({ resolveWithObject: true });
  expect([result.width, result.height]).toEqual([20, 40]);
  expect(metadata.orientation).toBeUndefined();
  expect(metadata.exif).toBeUndefined();
  expect(metadata.icc).toBeUndefined();
  expect(metadata.xmp).toBeUndefined();
  const top = (8 * result.width + 10) * 3,
    bottom = (32 * result.width + 10) * 3;
  expect(decoded.data[top]).toBeGreaterThan(220);
  expect(decoded.data[top + 2]).toBeLessThan(30);
  expect(decoded.data[bottom]).toBeLessThan(30);
  expect(decoded.data[bottom + 2]).toBeGreaterThan(220);
});

it.each([
  [
    "SVG",
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
    ),
  ],
  ["HTML", Buffer.from("<!doctype html><html><body>synthetic</body></html>")],
  [
    "GIF",
    Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64",
    ),
  ],
  ["empty input", Buffer.alloc(0)],
  ["malformed JPEG", Buffer.from([255, 216, 255, 0, 0, 0])],
  ["truncated PNG", pngSignature],
  ["animated PNG", animatedPng()],
] as const)(
  "rejects %s rather than trusting a JPEG/PNG upload label",
  async (_kind, bytes) => {
    await expect(normalizeOwnerPicture(bytes, signal())).rejects.toThrow(
      "invalid_owner_picture",
    );
  },
);

it("rejects actual WebP despite its supported-looking upload label", async () => {
  const bytes = await sharp({
    create: { width: 12, height: 9, channels: 3, background: "#416974" },
  })
    .webp()
    .toBuffer();
  await expect(normalizeOwnerPicture(bytes, signal())).rejects.toThrow(
    "invalid_owner_picture",
  );
});

it("rejects an over-limit byte buffer before decoding", async () => {
  const bytes = Buffer.alloc(limits.inputBytes + 1);
  pngSignature.copy(bytes);
  await expect(normalizeOwnerPicture(bytes, signal())).rejects.toThrow(
    "invalid_owner_picture",
  );
});

it("rejects a PNG whose declared pixel count exceeds the decoder limit", async () => {
  // Valid framing/CRC with a tiny compressed body prevents allocating bomb pixels.
  const bytes = Buffer.concat([
    pngSignature,
    ihdr(4001, 4001),
    chunk("IDAT", deflateSync(Buffer.from([0, 0, 0, 0, 255]))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  await expect(normalizeOwnerPicture(bytes, signal())).rejects.toThrow(
    "invalid_owner_picture",
  );
});

it("rejects an oversized JPEG from metadata before attempting a full decode", async () => {
  const bytes = await sharp({
    create: { width: 8, height: 6, channels: 3, background: "#416974" },
  })
    .jpeg()
    .toBuffer();
  // Keep an actual JPEG structure but declare dimensions above the 16 MP limit.
  let offset = 2,
    patched = false;
  while (offset + 8 < bytes.length) {
    const marker = bytes[offset + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      bytes.writeUInt16BE(5000, offset + 5);
      bytes.writeUInt16BE(5000, offset + 7);
      patched = true;
      break;
    }
    if (marker === 0xda || bytes[offset] !== 0xff) break;
    offset += bytes.readUInt16BE(offset + 2) + 2;
  }
  expect(patched).toBe(true);
  await expect(normalizeOwnerPicture(bytes, signal())).rejects.toThrow(
    "invalid_owner_picture",
  );
});

it("propagates cancellation before starting and after pending raster work", async () => {
  const bytes = await sharp({
    create: { width: 320, height: 180, channels: 3, background: "#416974" },
  })
    .png()
    .toBuffer();
  const before = new AbortController();
  before.abort();
  await expect(
    normalizeOwnerPicture(bytes, before.signal),
  ).rejects.toMatchObject({ name: "AbortError" });
  const during = new AbortController(),
    pending = normalizeOwnerPicture(bytes, during.signal);
  queueMicrotask(() => during.abort());
  await expect(pending).rejects.toMatchObject({ name: "AbortError" });
});
