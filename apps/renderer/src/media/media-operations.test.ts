import { access, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { describe, expect, it } from "vitest";
import { binding, nonce, mediaFixture } from "../../test/media-fixture.js";
import { MediaFailure } from "./media.failure.js";
describe("owned media dispatch", () => {
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
