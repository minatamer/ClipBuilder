import sharp from "sharp";
import { OWNER_PICTURE_LIMITS as limits } from "../../../packages/contracts/local/assets.ts";

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const invalid = () => new Error("invalid_owner_picture");

/** Inspect PNG framing before raster decoding, including APNG control chunks. */
function inspectPng(bytes: Buffer) {
  let offset = pngSignature.length;
  let header = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    if (length > bytes.length - offset - 12) throw invalid();
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    if (!header) {
      if (type !== "IHDR" || length !== 13) throw invalid();
      const width = bytes.readUInt32BE(offset + 8),
        height = bytes.readUInt32BE(offset + 12);
      if (!width || !height || width * height > limits.inputPixels)
        throw invalid();
      header = true;
    }
    if (["acTL", "fcTL", "fdAT"].includes(type)) throw invalid();
    offset += length + 12;
    if (type === "IEND") return;
  }
  throw invalid();
}

/** Owner-supplied raster bytes only. No filename, MIME, path or URL is trusted. */
export async function normalizeOwnerPicture(
  bytes: Buffer,
  signal: AbortSignal,
): Promise<{ bytes: Buffer; width: number; height: number }> {
  signal.throwIfAborted();
  if (!bytes.length || bytes.length > limits.inputBytes) throw invalid();
  const input = Buffer.from(bytes);
  const png = input.subarray(0, pngSignature.length).equals(pngSignature),
    jpeg = input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff;
  if (!png && !jpeg) throw invalid();
  if (png) inspectPng(input);
  const image = sharp(input, {
    limitInputPixels: limits.inputPixels,
    animated: false,
    failOn: "warning",
  });
  try {
    const metadata = await image.metadata();
    signal.throwIfAborted();
    if (
      metadata.format !== (png ? "png" : "jpeg") ||
      (metadata.pages ?? 1) !== 1 ||
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > limits.inputPixels
    )
      throw invalid();
    const normalized = await image
      .rotate()
      .resize({
        width: limits.dimension,
        height: limits.dimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#101215" })
      .jpeg({ quality: 82, progressive: false, chromaSubsampling: "4:2:0" })
      .toBuffer({ resolveWithObject: true });
    signal.throwIfAborted();
    if (
      !normalized.data.length ||
      normalized.data.length > limits.bytes ||
      normalized.info.width > limits.dimension ||
      normalized.info.height > limits.dimension
    )
      throw invalid();
    return {
      bytes: normalized.data,
      width: normalized.info.width,
      height: normalized.info.height,
    };
  } catch {
    signal.throwIfAborted();
    throw invalid();
  } finally {
    image.destroy();
  }
}
