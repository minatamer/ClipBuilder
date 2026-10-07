import { describe, expect, it, vi } from "vitest";
import { GoogleAuth } from "google-auth-library";
import { GcsMediaStore } from "./gcs-media-store.js";
import { binding, mediaFixture } from "../../test/media-fixture.js";

describe("resumable upload origin", () => {
  it("sends the admitted hosted origin to storage and keeps the local fallback for legacy callers", async () => {
    const f = mediaFixture();
    await f.operations.sessions.admit({
      binding,
      bytes: 1024,
      contentType: "video/mp4",
      rightsAcknowledged: true,
      dataTransferAcknowledged: true,
    });
    const record = await f.store.getIntent(binding.sessionId);
    if (!record) throw new Error("synthetic_intent_missing");
    const send = vi
      .spyOn(GoogleAuth.prototype, "request")
      .mockImplementation(async () => {
        throw new Error("synthetic_request_boundary");
      });
    try {
      const store = new GcsMediaStore(
        "synthetic-bucket",
        "http://localhost:3000",
      );
      for (const origin of [undefined, "https://synthetic-frontend.run.app"]) {
        send.mockClear();
        await expect(store.beginUpload(record.intent, origin)).rejects.toThrow(
          "synthetic_request_boundary",
        );
        expect(send).toHaveBeenCalledOnce();
        expect(send.mock.calls[0]?.[0]?.headers).toMatchObject({
          Origin: origin ?? "http://localhost:3000",
          "X-Upload-Content-Length": "1024",
          "X-Upload-Content-Type": "video/mp4",
        });
      }
    } finally {
      send.mockRestore();
    }
  });
});
