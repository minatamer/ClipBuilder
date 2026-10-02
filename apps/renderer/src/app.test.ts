import request from "supertest";
import { rm } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createRendererApplication } from "./app.js";
import { MediaFailure } from "./media/media.failure.js";
import { binding, nonce, mediaFixture } from "../test/media-fixture.js";
function fixture(removeScratch?: (directory: string) => Promise<void>) {
  const f = mediaFixture(undefined, 2, removeScratch);
  const app = createRendererApplication(f.operations, {
    async verify(header) {
      if (header === "Bearer control") return "control";
      if (header === "Bearer expiry") return "expiry";
      throw new MediaFailure("unauthorized");
    },
  });
  return { ...f, app };
}
describe("private renderer routes", () => {
  it("refuses upload and reports failed local cleanup until an expiry retry succeeds", async () => {
    let fail = true;
    const f = fixture(async (directory) => {
      if (fail) throw Error("synthetic locked scratch");
      await rm(directory, { recursive: true, force: true });
    });
    await f.admit();
    try {
      expect(
        (
          await request(f.app)
            .post("/internal/prepare")
            .set("Authorization", "Bearer control")
            .send({ binding, nonce, generation: "12" })
        ).status,
      ).toBe(503);
      expect(
        (
          await request(f.app)
            .post("/internal/upload")
            .set("Authorization", "Bearer control")
            .send({
              binding,
              bytes: 1024,
              contentType: "video/mp4",
              rightsAcknowledged: true,
              dataTransferAcknowledged: true,
            })
        ).body,
      ).toEqual({ code: "cleanup_pending" });
      expect(f.store.calls.begin).toBe(1);
      expect(
        (
          await request(f.app)
            .post("/internal/expiry")
            .set("Authorization", "Bearer expiry")
            .send({})
        ).status,
      ).toBe(503);
      fail = false;
      expect(
        (
          await request(f.app)
            .post("/internal/expiry")
            .set("Authorization", "Bearer expiry")
            .send({})
        ).body.unresolved,
      ).toBe(0);
      expect(f.operations.counts).toEqual({ media: 1, ai: 0 });
    } finally {
      fail = false;
      await f.operations.shutdown();
    }
  });
  it("authenticates before parsing and restricts expiry identity", async () => {
    const f = fixture();
    expect((await request(f.app).get("/v1/health")).body).toEqual({
      status: "ok",
    });
    expect(
      (
        await request(f.app)
          .post("/internal/upload")
          .send({ private: "synthetic" })
      ).status,
    ).toBe(403);
    expect(
      (
        await request(f.app)
          .post("/internal/upload")
          .set("Authorization", "Bearer expiry")
          .send({})
      ).status,
    ).toBe(403);
    expect(
      (
        await request(f.app)
          .post("/internal/expiry")
          .set("Authorization", "Bearer control")
          .send({})
      ).status,
    ).toBe(403);
    expect(
      (
        await request(f.app)
          .post("/internal/expiry")
          .set("Authorization", "Bearer expiry")
          .send({})
      ).status,
    ).toBe(200);
    expect(f.store.calls).toEqual({
      begin: 0,
      cancel: 0,
      delete: 0,
      download: 0,
      upload: 0,
    });
  });
  it("validates admission and returns only safe failure codes", async () => {
    const f = fixture();
    const invalid = await request(f.app)
      .post("/internal/upload")
      .set("Authorization", "Bearer control")
      .send({
        binding,
        bytes: 1024,
        contentType: "video/mp4",
        rightsAcknowledged: false,
        dataTransferAcknowledged: true,
      });
    expect(invalid.status).toBe(400);
    expect(invalid.body).toEqual({ code: "invalid" });
    f.store.beginUpload = async () => {
      throw new Error("synthetic-private-provider-payload");
    };
    const failed = await request(f.app)
      .post("/internal/upload")
      .set("Authorization", "Bearer control")
      .send({
        binding,
        bytes: 1024,
        contentType: "video/mp4",
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
      });
    expect(failed.status).toBe(422);
    expect(failed.body).toEqual({ code: "media_failed" });
    expect(failed.text).not.toContain("private-provider");
    expect(f.operations.counts).toEqual({ media: 0, ai: 0 });
  });
});
