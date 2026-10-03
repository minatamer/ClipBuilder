import { access, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
import { describe, expect, it } from "vitest";
import { binding, nonce, mediaFixture } from "../../test/media-fixture.js";
import { MediaFailure } from "./media.failure.js";
describe("owned media dispatch", () => {
  it("physically proxies only the validated selected range once, then removes that proxy", async () => {
    const f = mediaFixture(undefined, 4),
      ranges: unknown[] = [];
    await f.admit();
    const signal = new AbortController().signal;
    await f.operations.prepare({ binding, nonce, generation: "12" }, signal);
    await f.operations.releaseAnalysisProxy(binding, signal);
    // The existing fake pipeline also records the actual cut argument.
    const pipeline = {
      async inspect() {
        return (await f.store.getIntent(binding.sessionId))!.intent.source!;
      },
      async proxy(
        _path: string,
        _output: string,
        _signal: AbortSignal,
        range?: unknown,
      ) {
        ranges.push(range);
      },
      async render() {
        throw new Error("not selected work");
      },
    };
    const { MediaOperations } = await import("./media-operations.js");
    const operations = new MediaOperations(
      f.sessions,
      pipeline,
      3,
      () => 1_000_000,
    );
    const request = {
      binding,
      nonce,
      generation: "12",
      range: { startMs: 1000, endMs: 11000 },
    };
    const result = await operations.select(request, signal);
    expect(result.range).toEqual(request.range);
    expect(ranges).toEqual([request.range]);
    await operations.releaseAnalysisProxy(binding, signal);
    expect(await f.store.listArtifacts(binding.sessionId)).toHaveLength(1);
    await expect(operations.select(request, signal)).rejects.toMatchObject({
      code: "media_failed",
    });
    expect(ranges).toHaveLength(1);
    expect(operations.counts).toEqual({ media: 2, ai: 0 });
  });
  it.each(["generation", "bounds", "unreleased"])(
    "rejects selected %s before cutting",
    async (kind) => {
      const f = mediaFixture(undefined, 4),
        signal = new AbortController().signal;
      await f.admit();
      await f.operations.prepare({ binding, nonce, generation: "12" }, signal);
      if (kind !== "unreleased")
        await f.operations.releaseAnalysisProxy(binding, signal);
      await expect(
        f.operations.select(
          {
            binding,
            nonce,
            generation: kind === "generation" ? "13" : "12",
            range: { startMs: 1000, endMs: kind === "bounds" ? 16000 : 11000 },
          },
          signal,
        ),
      ).rejects.toMatchObject({ code: "media_failed" });
      expect(f.calls).toEqual({ inspect: 1, proxy: 1, render: 0 });
      expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    },
  );
  it("reads only the admitted proxy generation, verifies bytes, removes scratch and deletes only the consumed proxy", async () => {
    const f = mediaFixture();
    const download = f.store.download.bind(f.store),
      upload = f.store.upload.bind(f.store);
    let scratch = "";
    f.store.download = async (session, artifact, generation, path, signal) => {
      await download(session, artifact, generation, path, signal);
      scratch = dirname(path);
      await writeFile(path, Buffer.alloc(1024));
    };
    f.store.upload = async (...args) => ({
      ...(await upload(...args)),
      checksum: createHash("sha256").update(Buffer.alloc(1024)).digest("hex"),
    });
    await f.admit();
    const prepared = await f.operations.prepare(
      { binding, nonce, generation: "12" },
      new AbortController().signal,
    );
    const bytes = await f.operations.analysisProxy(
      binding,
      new AbortController().signal,
    );
    expect(bytes.byteLength).toBe(1024);
    await expect(access(scratch)).rejects.toMatchObject({ code: "ENOENT" });
    expect(f.operations.counts).toEqual({ media: 1, ai: 0 });
    await f.operations.releaseAnalysisProxy(
      binding,
      new AbortController().signal,
    );
    expect(
      (await f.store.listArtifacts(binding.sessionId)).some(
        (a) => a.artifactId === prepared.analysisProxy.artifactId,
      ),
    ).toBe(false);
    expect(await f.store.listArtifacts(binding.sessionId)).toHaveLength(1);
    expect(
      (await f.store.getIntent(binding.sessionId))?.intent.analysisProxy,
    ).toBeNull();
    expect(f.store.calls).toMatchObject({ download: 2, upload: 1, delete: 1 });
  });
  it("a failed analysis-proxy deletion fences the session and is recovered by the independent sweep", async () => {
    let now = 1_000_000;
    const f = mediaFixture(undefined, 2, undefined, () => now);
    await f.admit();
    await f.operations.prepare(
      { binding, nonce, generation: "12" },
      new AbortController().signal,
    );
    f.store.failDelete = true;
    await expect(
      f.operations.releaseAnalysisProxy(binding, new AbortController().signal),
    ).rejects.toMatchObject({ code: "cleanup_pending" });
    expect(f.sessions.blocked).toBe(true);
    expect((await f.store.getIntent(binding.sessionId))?.intent.phase).toBe(
      "terminal",
    );
    f.store.failDelete = false;
    expect((await f.operations.sweep()).unresolved).toBe(1);
    now += 900_000;
    expect((await f.operations.sweep()).unresolved).toBe(0);
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(f.operations.counts).toEqual({ media: 1, ai: 0 });
  });
  it("retains failed scratch deletion, blocks further work, and retries via independent expiry", async () => {
    let fail = true,
      directory = "";
    const f = mediaFixture(undefined, 3, async (path) => {
      directory = path;
      if (fail) throw new Error("synthetic filesystem failure");
      await rm(path, { recursive: true, force: true });
    });
    await f.admit();
    try {
      await expect(
        f.operations.prepare(
          { binding, nonce, generation: "12" },
          new AbortController().signal,
        ),
      ).rejects.toMatchObject({ code: "cleanup_pending" });
      await access(directory);
      expect(() => f.operations.assertIntakeReady()).toThrow("cleanup_pending");
      await expect(
        f.operations.prepare(
          { binding, nonce, generation: "12" },
          new AbortController().signal,
        ),
      ).rejects.toMatchObject({ code: "cleanup_pending" });
      expect(f.operations.counts).toEqual({ media: 1, ai: 0 });
      expect(f.store.calls).toMatchObject({ download: 1, upload: 1 });
      expect((await f.store.getIntent(binding.sessionId))?.intent.phase).toBe(
        "terminal",
      );
      expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
      expect((await f.operations.sweep()).unresolved).toBe(1);
      fail = false;
      expect((await f.operations.sweep()).unresolved).toBe(0);
      await expect(access(directory)).rejects.toMatchObject({ code: "ENOENT" });
      expect(() => f.operations.assertIntakeReady()).not.toThrow();
    } finally {
      fail = false;
      await f.operations.shutdown();
    }
  });
  it("dispatches one prepare and refuses replay without another upload", async () => {
    const f = mediaFixture();
    await f.admit();
    const result = await f.operations.prepare(
      { binding, nonce, generation: "12" },
      new AbortController().signal,
    );
    expect(result.source.fingerprint).toBe(binding.fingerprint);
    await expect(
      f.operations.prepare(
        { binding, nonce, generation: "12" },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ code: "media_failed" });
    expect(f.calls).toEqual({ inspect: 1, proxy: 1, render: 0 });
    expect(f.store.calls).toMatchObject({ download: 1, upload: 1 });
    expect(f.operations.counts).toEqual({ media: 2, ai: 0 });
    await expect(
      f.operations.prepare(
        { binding, nonce, generation: "12" },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ code: "budget" });
  });
  it("refuses concurrent dispatch, fences cancellation, and removes owned scratch", async () => {
    let entered!: () => void,
      directory = "";
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const f = mediaFixture({
      async inspect(path, signal) {
        directory = dirname(path);
        entered();
        await new Promise<void>((_resolve, reject) =>
          signal.addEventListener(
            "abort",
            () => reject(new MediaFailure("canceled")),
            { once: true },
          ),
        );
        throw new Error("unreachable");
      },
      async proxy() {
        throw new Error("unreachable");
      },
      async render() {
        throw new Error("unreachable");
      },
    });
    await f.admit();
    const job = f.operations.prepare(
      { binding, nonce, generation: "12" },
      new AbortController().signal,
    );
    const rejection = expect(job).rejects.toMatchObject({ code: "canceled" });
    await ready;
    await expect(
      f.operations.prepare(
        { binding, nonce, generation: "12" },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ code: "busy" });
    await f.operations.cancel(binding);
    await rejection;
    expect((await f.store.getIntent(binding.sessionId))?.intent.phase).toBe(
      "terminal",
    );
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    await expect(access(directory)).rejects.toMatchObject({ code: "ENOENT" });
    expect(f.store.calls).toMatchObject({ begin: 1, download: 1, upload: 0 });
    expect(f.operations.counts).toEqual({ media: 1, ai: 0 });
  });
});
