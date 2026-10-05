import { Writable } from "node:stream";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { binding, nonce, mediaFixture } from "../../test/media-fixture.js";
import { createRendererApplication } from "../app.js";
import { MediaFailure } from "./media.failure.js";
const hash = "c".repeat(64),
  range = { startMs: 1000, endMs: 11000 };
async function fixture() {
  const f = mediaFixture(),
    signal = new AbortController().signal;
  await f.admit();
  await f.operations.prepare({ binding, nonce, generation: "12" }, signal);
  await f.operations.releaseAnalysisProxy(binding, signal);
  await f.operations.select(
    { binding, nonce, generation: "12", range },
    signal,
  );
  await f.operations.releaseAnalysisProxy(binding, signal);
  const result = await f.operations.preview(
    { binding, nonce, generation: "12", range, manifestHash: hash },
    signal,
  );
  const app = createRendererApplication(f.operations, {
    async verify(header) {
      if (header === "Bearer synthetic") return "control";
      throw new MediaFailure("unauthorized");
    },
  });
  return { ...f, signal, result, app, access: { binding, manifestHash: hash } };
}
describe("selected preview ownership", () => {
  it("drains a stream that arrives while Clear is committing its terminal fence", async () => {
    const f = await fixture();
    let release = () => {},
      entered = () => {},
      playbackEntered = () => {};
    const gate = new Promise<void>((resolve) => {
        release = resolve;
      }),
      terminal = new Promise<void>((resolve) => {
        entered = resolve;
      }),
      playback = new Promise<void>((resolve) => {
        playbackEntered = resolve;
      });
    const save = f.store.saveIntent.bind(f.store);
    f.store.saveIntent = async (intent, generation) => {
      if (intent.phase === "terminal") {
        entered();
        await gate;
      }
      return save(intent, generation);
    };
    const state: { signal?: AbortSignal } = {};
    f.store.stream = async (
      _id,
      _artifact,
      _generation,
      _range,
      _destination,
      signal,
    ) => {
      state.signal = signal;
      playbackEntered();
      await new Promise<void>((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(new Error("canceled")), {
          once: true,
        }),
      );
    };
    const clear = f.operations.cancel(binding);
    await terminal;
    const controller = new AbortController(),
      stream = f.operations
        .previewContent(
          f.access,
          undefined,
          new Writable(),
          controller.signal,
          () => {},
        )
        .catch(() => "canceled");
    try {
      await playback;
      release();
      await clear;
      expect(state.signal?.aborted).toBe(true);
    } finally {
      release();
      controller.abort();
      await stream;
    }
  });
  it("prepares a separate bounded proxy once and restores/streams without processing", async () => {
    const f = await fixture();
    expect(f.calls).toEqual({ inspect: 3, audio: 1, proxy: 2, render: 0 });
    expect(await f.store.listArtifacts(binding.sessionId)).toHaveLength(2);
    expect(await f.sessions.previewArtifact(f.access)).toEqual(f.result);
    const content = await request(f.app)
      .post("/internal/preview-content")
      .set("Authorization", "Bearer synthetic")
      .set("Range", "bytes=100-199")
      .send(f.access);
    expect(content.status).toBe(206);
    expect(content.headers["content-range"]).toBe("bytes 100-199/1024");
    expect(content.body.length).toBe(100);
    expect(content.headers["cache-control"]).toBe("no-store");
    expect(f.operations.counts).toEqual({ media: 3, ai: 0 });
    await f.operations.cancel(binding);
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
  });
  it("rejects wrong manifest, caller, binding and multiple ranges without dispatch", async () => {
    const f = await fixture();
    for (const [header, access, rangeHeader, status] of [
      ["Bearer wrong", f.access, "bytes=0-1", 403],
      [
        "Bearer synthetic",
        { ...f.access, manifestHash: "d".repeat(64) },
        "bytes=0-1",
        409,
      ],
      ["Bearer synthetic", f.access, "bytes=0-1,2-3", 400],
    ] as const) {
      const response = await request(f.app)
        .post("/internal/preview-content")
        .set("Authorization", header)
        .set("Range", rangeHeader)
        .send(access);
      expect(response.status).toBe(status);
    }
    expect(f.operations.counts).toEqual({ media: 3, ai: 0 });
    await f.operations.cancel(binding);
    await expect(f.sessions.previewArtifact(f.access)).rejects.toBeDefined();
  });
  it("aborts playback on Clear, drains it, and allows canceling a seek without deleting the session", async () => {
    const f = await fixture();
    let entered = () => {};
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    f.store.stream = async (
      _id,
      _artifact,
      _generation,
      _range,
      _destination,
      signal,
    ) => {
      entered();
      await new Promise<void>((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(new Error("canceled")), {
          once: true,
        }),
      );
    };
    const controller = new AbortController();
    const stream = f.operations.previewContent(
      f.access,
      "bytes=0-10",
      new Writable({
        write(_chunk, _encoding, done) {
          done();
        },
      }),
      controller.signal,
      () => {},
    );
    const outcome = stream.catch(() => "canceled");
    await started;
    controller.abort();
    expect(await outcome).toBe("canceled");
    expect((await f.store.getIntent(binding.sessionId))!.intent.phase).toBe(
      "prepared",
    );
    const next = f.operations
      .previewContent(
        f.access,
        undefined,
        new Writable({
          write(_chunk, _encoding, done) {
            done();
          },
        }),
        f.signal,
        () => {},
      )
      .catch(() => "canceled");
    await Promise.resolve();
    await f.operations.cancel(binding);
    expect(await next).toBe("canceled");
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(f.operations.counts).toEqual({ media: 3, ai: 0 });
  });
});
