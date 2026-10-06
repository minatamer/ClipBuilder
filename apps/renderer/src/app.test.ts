import request from "supertest";
import { rm } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { createRendererApplication } from "./app.js";
import { MediaFailure } from "./media/media.failure.js";
import { binding, nonce, mediaFixture } from "../test/media-fixture.js";
import { createHash } from "node:crypto";
import {
  compositionManifestV3Schema,
  TEMPORARY_MEDIA_LIMITS,
} from "@clipbuilder/contracts";
function fixture(removeScratch?: (directory: string) => Promise<void>) {
  const f = mediaFixture(undefined, removeScratch);
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
  it("accepts bounded inline picture descriptors only on the authenticated render route", async () => {
    const f = fixture();
    const bytes = Buffer.alloc(96 * 1024, 1);
    bytes.set([0xff, 0xd8, 0xff]);
    const asset = {
      repository: "wikimedia-commons",
      license: "CC0",
      pageId: 1,
      title: "Synthetic",
      width: 20,
      height: 10,
      dataUri: `data:image/jpeg;base64,${bytes.toString("base64")}`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
    const manifest = compositionManifestV3Schema.parse({
      version: 3,
      source: {
        fingerprint: binding.fingerprint,
        durationMs: 15000,
        width: 1920,
        height: 1080,
      },
      range: { startMs: 0, endMs: 10000 },
      output: { width: 1080, height: 1920, fps: 30 },
      focus: [{ startMs: 0, endMs: 10000, mode: "wide", reason: "initial" }],
      captions: [],
      cards: [],
      pictures: [
        {
          startMs: 2000,
          endMs: 4000,
          anchorWordId: "w_000001",
          subjectWordIds: ["w_000001"],
          asset,
        },
      ],
    });
    const input = {
      binding,
      nonce,
      manifest,
      manifestHash: createHash("sha256")
        .update(JSON.stringify(manifest))
        .digest("hex"),
    };
    expect(Buffer.byteLength(JSON.stringify(input))).toBeGreaterThan(
      TEMPORARY_MEDIA_LIMITS.descriptorBytes,
    );
    const render = vi
      .spyOn(f.operations, "render")
      .mockRejectedValue(new MediaFailure("conflict"));
    const result = await request(f.app)
      .post("/internal/render")
      .set("Authorization", "Bearer control")
      .send(input);
    expect(result.status).toBe(409);
    expect(render).toHaveBeenCalledOnce();
    const unauthorized = await request(f.app)
      .post("/internal/render")
      .send(input);
    expect(unauthorized.status).toBe(403);
    expect(render).toHaveBeenCalledOnce();
    const ordinary = await request(f.app)
      .post("/internal/cancel")
      .set("Authorization", "Bearer control")
      .send(input);
    expect(ordinary.status).toBe(422);
  });
  it("rejects overlapping uploads and scheduled cleanup while admission owns the journal", async () => {
    const f = fixture();
    let entered!: () => void, release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(f.store, "listIntents").mockImplementationOnce(async () => {
      entered();
      await held;
      return [];
    });
    const sweep = vi.spyOn(f.operations, "sweep");
    const input = {
      binding,
      bytes: 1024,
      contentType: "video/mp4",
      rightsAcknowledged: true,
      dataTransferAcknowledged: true,
    };
    const first = request(f.app)
      .post("/internal/upload")
      .set("Authorization", "Bearer control")
      .send(input)
      .then((response) => response);
    try {
      await started;
      const overlapping = await request(f.app)
        .post("/internal/upload")
        .set("Authorization", "Bearer control")
        .send(input);
      const expiry = await request(f.app)
        .post("/internal/expiry")
        .set("Authorization", "Bearer expiry")
        .send({});
      expect(overlapping.status).toBe(409);
      expect(expiry.status).toBe(409);
      expect(expiry.body).toEqual({ code: "busy" });
      expect(sweep).toHaveBeenCalledTimes(0);
      expect(f.store.calls.begin).toBe(0);
    } finally {
      release();
    }
    expect((await first).status).toBe(200);
    expect(f.store.calls.begin).toBe(1);
    expect(f.operations.counts).toEqual({ media: 0, ai: 0 });
  });
  it("rejects upload during scheduled cleanup and releases the guard after failure", async () => {
    const f = fixture();
    let entered!: () => void, release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(f.operations, "sweep").mockImplementationOnce(async () => {
      entered();
      await held;
      throw new MediaFailure("cleanup_pending");
    });
    const admit = vi.spyOn(f.sessions, "admit");
    const expiry = request(f.app)
      .post("/internal/expiry")
      .set("Authorization", "Bearer expiry")
      .send({})
      .then((response) => response);
    const input = {
      binding,
      bytes: 1024,
      contentType: "video/mp4",
      rightsAcknowledged: true,
      dataTransferAcknowledged: true,
    };
    try {
      await started;
      expect(
        (
          await request(f.app)
            .post("/internal/upload")
            .set("Authorization", "Bearer control")
            .send(input)
        ).status,
      ).toBe(409);
      expect(admit).toHaveBeenCalledTimes(0);
    } finally {
      release();
    }
    expect((await expiry).status).toBe(503);
    expect(
      (
        await request(f.app)
          .post("/internal/upload")
          .set("Authorization", "Bearer control")
          .send(input)
      ).status,
    ).toBe(200);
    expect(admit).toHaveBeenCalledTimes(1);
    expect(f.operations.counts).toEqual({ media: 0, ai: 0 });
  });
  it("cancels disconnected admission before allocation and releases its intake guard", async () => {
    const f = fixture(),
      server = f.app.listen(0, "127.0.0.1");
    let entered!: () => void,
      release!: () => void,
      finished!: () => void,
      observe!: (signal: AbortSignal) => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const settled = new Promise<void>((resolve) => {
      finished = resolve;
    });
    const observed = new Promise<AbortSignal>((resolve) => {
      observe = resolve;
    });
    const withSignal = f.store.withSignal.bind(f.store);
    vi.spyOn(f.store, "withSignal").mockImplementation((signal, work) => {
      observe(signal);
      return withSignal(signal, work);
    });
    const admit = f.sessions.admit.bind(f.sessions);
    vi.spyOn(f.sessions, "admit").mockImplementation(async (...args) => {
      try {
        return await admit(...args);
      } finally {
        finished();
      }
    });
    vi.spyOn(f.store, "listIntents").mockImplementationOnce(async () => {
      entered();
      await held;
      return [];
    });
    const input = {
      binding,
      bytes: 1024,
      contentType: "video/mp4",
      rightsAcknowledged: true,
      dataTransferAcknowledged: true,
    };
    const pending = request(server)
      .post("/internal/upload")
      .set("Authorization", "Bearer control")
      .send(input);
    const ended = pending.then(
      () => undefined,
      () => undefined,
    );
    try {
      await started;
      const signal = await observed;
      const aborted = new Promise<void>((resolve) =>
        signal.addEventListener("abort", () => resolve(), { once: true }),
      );
      pending.abort();
      await aborted;
      release();
      await settled;
      await ended;
      expect(f.store.calls.begin).toBe(0);
      expect(
        (
          await request(server)
            .post("/internal/upload")
            .set("Authorization", "Bearer control")
            .send(input)
        ).status,
      ).toBe(200);
      expect(f.store.calls.begin).toBe(1);
      expect(f.operations.counts).toEqual({ media: 0, ai: 0 });
    } finally {
      release();
      pending.abort();
      await f.operations.shutdown();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
  it.each(["expiry/", "Expiry"])(
    "refuses control caller access through noncanonical %s",
    async (path) => {
      const f = fixture(),
        sweep = vi.spyOn(f.operations, "sweep");
      const response = await request(f.app)
        .post(`/internal/${path}`)
        .set("Authorization", "Bearer control")
        .send({});
      expect(response.status).not.toBe(200);
      expect(sweep).toHaveBeenCalledTimes(0);
      expect(f.operations.counts).toEqual({ media: 0, ai: 0 });
    },
  );
  it("rejects non-JSON/compressed methods without starting a media job", async () => {
    const f = fixture();
    for (const headers of [
      { "Content-Type": "text/plain" },
      { "Content-Type": "application/json", "Content-Encoding": "gzip" },
    ]) {
      const response = await request(f.app)
        .post("/internal/render")
        .set("Authorization", "Bearer control")
        .set(headers)
        .send("{}");
      expect(response.status).toBe(400);
      expect(response.headers["referrer-policy"]).toBe("no-referrer");
      expect(response.text).not.toContain("Bearer");
    }
    expect(f.operations.counts).toEqual({ media: 0, ai: 0 });
    expect(f.calls.render).toBe(0);
  });
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
