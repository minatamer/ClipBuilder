import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { MediaFailure } from "../media/media.failure.js";
export function validUploadCapability(value: string): string {
  const url = new URL(value);
  if (
    url.origin !== "https://storage.googleapis.com" ||
    url.username ||
    url.password ||
    value.length > 8192 ||
    !url.searchParams.has("upload_id")
  )
    throw new MediaFailure("invalid");
  return value;
}
export class UploadCapabilityCipher {
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new MediaFailure("invalid");
  }
  encrypt(value: string, sessionId: string): string {
    validUploadCapability(value);
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", this.key, iv);
    cipher.setAAD(Buffer.from(sessionId));
    const bytes = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString(
      "base64url",
    );
  }
  decrypt(value: string, sessionId: string): string {
    try {
      const bytes = Buffer.from(value, "base64url");
      const decipher = createDecipheriv(
        "aes-256-gcm",
        this.key,
        bytes.subarray(0, 12),
      );
      decipher.setAAD(Buffer.from(sessionId));
      decipher.setAuthTag(bytes.subarray(12, 28));
      return validUploadCapability(
        Buffer.concat([
          decipher.update(bytes.subarray(28)),
          decipher.final(),
        ]).toString("utf8"),
      );
    } catch {
      throw new MediaFailure("cleanup_pending");
    }
  }
}
