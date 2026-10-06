import { createHash } from "node:crypto";
import {
  CONTEXTUAL_PICTURE_POLICY,
  type CompositionManifestV3,
} from "@clipbuilder/contracts";

// Check fixed JPEG bytes before Chromium receives them. No URL, path or decoder
// command comes from the manifest, and dimensions cannot hide a decompression bomb.
export function verifyInlinePictures(
  manifest: Pick<CompositionManifestV3, "pictures">,
) {
  for (const picture of manifest.pictures ?? []) {
    const asset = picture.asset,
      data = Buffer.from(asset.dataUri.slice(23), "base64");
    if (
      data.length > CONTEXTUAL_PICTURE_POLICY.maxRasterBytes ||
      asset.dataUri !== `data:image/jpeg;base64,${data.toString("base64")}` ||
      createHash("sha256").update(data).digest("hex") !== asset.sha256 ||
      data.length < 4 ||
      data.readUInt16BE(0) !== 0xffd8 ||
      data.readUInt16BE(data.length - 2) !== 0xffd9
    )
      throw new Error("invalid");
    let offset = 2,
      dimensions = false;
    while (offset + 4 <= data.length) {
      if (data[offset++] !== 0xff) throw new Error("invalid");
      while (data[offset] === 0xff) offset++;
      if (offset + 3 > data.length) throw new Error("invalid");
      const marker = data[offset++]!;
      if (marker === 0xda || marker === 0xd9) break;
      const length = data.readUInt16BE(offset);
      if (length < 2 || offset + length > data.length)
        throw new Error("invalid");
      if ([0xc0, 0xc1, 0xc2].includes(marker)) {
        if (
          length < 8 ||
          data[offset + 2] !== 8 ||
          data.readUInt16BE(offset + 3) !== asset.height ||
          data.readUInt16BE(offset + 5) !== asset.width
        )
          throw new Error("invalid");
        dimensions = true;
      }
      offset += length;
    }
    if (!dimensions) throw new Error("invalid");
  }
}
