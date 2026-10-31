import sharp from "sharp";
import { CONTEXTUAL_PICTURE_POLICY as policy } from "@clipbuilder/contracts";

export async function boundedPictureBody(response: Response, maxBytes: number) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("contextual_picture_unavailable");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) throw new Error("contextual_picture_unavailable");
      chunks.push(chunk.value);
    }
    return Buffer.concat(chunks);
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export async function normalizePicture(bytes: Buffer) {
  const image = sharp(bytes, {
    limitInputPixels: policy.maxInputPixels,
    animated: false,
    failOn: "error",
  });
  try {
    const metadata = await image.metadata();
    if (
      !["jpeg", "png", "webp", "gif", "heif", "avif"].includes(
        metadata.format ?? "",
      )
    )
      throw new Error("image_format_unsupported");
    const normalized = await image
      .rotate()
      .resize({
        width: policy.width,
        height: policy.height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#101215" })
      .jpeg({ quality: 72 })
      .toBuffer({ resolveWithObject: true });
    if (normalized.data.length > policy.maxRasterBytes)
      throw new Error("image_raster_limit");
    return {
      bytes: normalized.data,
      width: normalized.info.width,
      height: normalized.info.height,
    };
  } finally {
    image.destroy();
  }
}
