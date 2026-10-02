import { describe, expect, it } from "vitest";
import {
  mediaUploadRequestSchema,
  mediaUploadResponseSchema,
  mediaPrepareRequestSchema,
} from "./cloud-media.schema.js";
const binding = {
  sessionId: "ses_" + "a".repeat(22),
  sourceRevision: "rev_" + "b".repeat(22),
  fingerprint: "a".repeat(64),
};
const request = {
  binding,
  bytes: 1024,
  contentType: "video/mp4",
  rightsAcknowledged: true,
  dataTransferAcknowledged: true,
};
describe("private media transport boundaries", () => {
  it("rejects arbitrary bucket/path/URL inputs and missing rights/transfer acknowledgements", () => {
    expect(mediaUploadRequestSchema.safeParse(request).success).toBe(true);
    for (const extra of [
      { bucket: "untrusted" },
      { object: "../source" },
      { sourceUrl: "https://untrusted.invalid" },
      { bytes: 524288001 },
      { rightsAcknowledged: false },
      { dataTransferAcknowledged: false },
    ])
      expect(
        mediaUploadRequestSchema.safeParse({ ...request, ...extra }).success,
      ).toBe(false);
  });
  it("requires a exact positive object generation and bounded opaque nonce", () => {
    const input = {
      binding,
      generation: "12",
      nonce: "00000000-0000-4000-8000-000000000001",
    };
    expect(mediaPrepareRequestSchema.safeParse(input).success).toBe(true);
    for (const generation of [
      "0",
      "12/elsewhere",
      "-1",
      "1e20",
      "9".repeat(26),
    ])
      expect(
        mediaPrepareRequestSchema.safeParse({ ...input, generation }).success,
      ).toBe(false);
  });
  it("allows only Google's HTTPS runtime upload capability", () => {
    for (const uploadUrl of [
      "http://storage.googleapis.com/upload",
      "https://storage.googleapis.com.evil.invalid/upload",
      "https://user@storage.googleapis.com/upload",
      "file:///source",
      "https://localhost/upload",
    ])
      expect(
        mediaUploadResponseSchema.safeParse({ uploadUrl, expiresAtMs: 1000 })
          .success,
      ).toBe(false);
  });
});
