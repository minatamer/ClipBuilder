import { Writable } from "node:stream";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../config/loadConfig.js";
import { createRetainedSampleRouter } from "../http/routes/retained-sample.route.js";
import {
  RetainedSample,
  type RetainedSampleReader,
} from "./retained-sample.js";
import { mapError } from "../http/errorMapper.js";
import {
  composeRetainedSample,
  retainedSampleReader,
} from "./retained-sample.gcs.js";

function sink() {
  return new Writable({
    write(_bytes, _encoding, done) {
      done();
    },
  });
}
const full = () =>
  new Response(new Uint8Array(10), {
    headers: { "Content-Type": "video/mp4", "Content-Length": "10" },
  });

describe("retained master read boundary", () => {
  it("defaults off and cannot enable cloud reads in test, fake or incomplete composition", () => {
    const config = loadConfig({ NODE_ENV: "test" });
    expect(config.retainedSample.enabled).toBe(false);
    expect(composeRetainedSample(config)).toBeNull();
    for (const values of [
      { NODE_ENV: "test", FAKE_MODE: "false" },
      { NODE_ENV: "development", FAKE_MODE: "true" },
      {
        NODE_ENV: "development",
        FAKE_MODE: "false",
        RETAINED_SAMPLE_GENERATION: "",
      },
      {
        NODE_ENV: "development",
        FAKE_MODE: "false",
        CLOUD_SPEND_APPROVED: "false",
      },
    ])
      expect(() =>
        loadConfig({
          APP_ENV: "local",
          CLOUD_SPEND_APPROVED: "true",
          RETAINED_SAMPLE_ENABLED: "true",
          RETAINED_SAMPLE_BUCKET: "synthetic-retained",
          RETAINED_SAMPLE_OBJECT: "synthetic.mp4",
          RETAINED_SAMPLE_GENERATION: "123",
          RETAINED_SAMPLE_BYTES: "10",
          ...values,
        }),
      ).toThrow();
    expect(
      loadConfig({
        NODE_ENV: "development",
        APP_ENV: "local",
        FAKE_MODE: "false",
        CLOUD_SPEND_APPROVED: "true",
        RETAINED_SAMPLE_ENABLED: "true",
        RETAINED_SAMPLE_BUCKET: "synthetic-retained",
        RETAINED_SAMPLE_OBJECT: "synthetic.mp4",
        RETAINED_SAMPLE_GENERATION: "123",
        RETAINED_SAMPLE_BYTES: "10",
      }).gemini.apiKey,
    ).toBeNull();
  });
  it("pins the owner object generation, forwards only a read and stops before auth on abort", async () => {
    const auth = vi.fn(async () => "Bearer synthetic");
    const transport = vi.fn<typeof fetch>(async () => full());
    const reader = retainedSampleReader(
      {
        bucket: "synthetic-retained",
        object: "demo/synthetic.mp4",
        generation: "123",
        bytes: 10,
      },
      auth,
      transport,
    );
    const response = await reader.read(undefined, new AbortController().signal);
    await response.body?.cancel();
    const [url, options] = transport.mock.calls[0]!;
    expect(String(url)).toBe(
      "https://storage.googleapis.com/storage/v1/b/synthetic-retained/o/demo%2Fsynthetic.mp4?alt=media&generation=123",
    );
    expect(options).toMatchObject({
      headers: { Authorization: "Bearer synthetic" },
      redirect: "error",
    });
    expect(options?.method).toBeUndefined();
    const abort = new AbortController();
    abort.abort();
    await expect(reader.read("bytes=0-1", abort.signal)).rejects.toThrow();
    expect(auth).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it("streams exact ranges and never exposes the bucket, auth or a master cleanup capability", async () => {
    const read = vi.fn<RetainedSampleReader["read"]>(
      async () =>
        new Response(new Uint8Array([3, 4, 5]), {
          status: 206,
          headers: {
            "Content-Type": "video/mp4",
            "Content-Length": "3",
            "Content-Range": "bytes 2-4/10",
          },
        }),
    );
    const sample = new RetainedSample({ bytes: 10, read });
    const app = express().use(
      "/source",
      createRetainedSampleRouter(sample, "http://localhost:3000"),
    );
    app.use(
      (
        error: unknown,
        _request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ) => {
        void next;
        const mapped = mapError(error, `req_${"0".repeat(32)}`);
        response.status(mapped.status).json({ error: mapped.error });
      },
    );
    const result = await request(app)
      .get("/source/video")
      .set("Origin", "http://localhost:3000")
      .set("Sec-Fetch-Site", "same-origin")
      .set("Range", "bytes=2-4");
    expect(result.status).toBe(206);
    expect(result.headers["content-range"]).toBe("bytes 2-4/10");
    expect(result.headers["cache-control"]).toBe("no-store");
    expect(result.headers.location).toBeUndefined();
    expect(read).toHaveBeenCalledTimes(1);
    expect(read.mock.calls[0]?.[0]).toBe("bytes=2-4");
    const denied = await request(app)
      .get("/source/video")
      .set("Origin", "https://untrusted.invalid");
    expect(denied.status).toBe(403);
    expect(read).toHaveBeenCalledTimes(1);
    await expect(
      sample.stream({
        range: "bytes=0-1,3-4",
        signal: new AbortController().signal,
        destination: sink(),
        headers: vi.fn(),
      }),
    ).rejects.toThrow();
    expect(read).toHaveBeenCalledTimes(1);
  });
  it("releases stalled reads on cancellation, caps concurrent work and sanitizes failures", async () => {
    const cancel = vi.fn();
    const read = vi.fn(
      async () =>
        new Response(new ReadableStream<Uint8Array>({ cancel }), {
          headers: { "Content-Type": "video/mp4", "Content-Length": "10" },
        }),
    );
    const sample = new RetainedSample({ bytes: 10, read });
    const a = new AbortController(),
      b = new AbortController();
    const headers = vi.fn();
    const first = sample.stream({
      range: undefined,
      signal: a.signal,
      destination: sink(),
      headers,
    });
    const second = sample.stream({
      range: undefined,
      signal: b.signal,
      destination: sink(),
      headers,
    });
    const settled = Promise.allSettled([first, second]);
    await vi.waitFor(() => expect(headers).toHaveBeenCalledTimes(2));
    await expect(
      sample.stream({
        range: undefined,
        signal: new AbortController().signal,
        destination: sink(),
        headers,
      }),
    ).rejects.toMatchObject({ code: "CAPACITY_FULL" });
    a.abort();
    b.abort();
    await settled;
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(read).toHaveBeenCalledTimes(2);
    read.mockImplementation(async () => {
      throw new Error("synthetic-sensitive-error");
    });
    await expect(
      sample.stream({
        range: undefined,
        signal: new AbortController().signal,
        destination: sink(),
        headers,
      }),
    ).rejects.not.toThrow("synthetic-sensitive-error");
    expect(read).toHaveBeenCalledTimes(3);
  });
});
