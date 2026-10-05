import { describe, expect, it } from "vitest";
import { binding, nonce, mediaFixture } from "../../test/media-fixture.js";
import { MediaSessions } from "./media-sessions.js";
import { UploadCapabilityCipher } from "./upload-capability.js";
import { temporaryIntentSchema } from "./temporary-intent.js";

describe("persistent session media allowance", () => {
  it("prepares three new sessions on one instance and charges cleanup/read zero operations", async () => {
    const f = mediaFixture(),
      signal = new AbortController().signal;
    for (const letter of ["a", "c", "d"]) {
      const sessionBinding = {
        ...binding,
        sessionId: "ses_" + letter.repeat(22),
      };
      await f.admit(sessionBinding);
      await f.operations.prepare(
        { binding: sessionBinding, nonce, generation: "12" },
        signal,
      );
      await f.operations.releaseAnalysisProxy(sessionBinding, signal);
      await f.operations.cancel(sessionBinding);
      expect(
        (await f.store.getIntent(sessionBinding.sessionId))?.intent
          .mediaOperationsUsed,
      ).toBe(1);
    }
    expect(f.operations.counts).toEqual({ media: 3, ai: 0 });
    expect(f.calls).toEqual({ inspect: 3, audio: 3, proxy: 0, render: 0 });
    expect(f.store.calls).toMatchObject({ begin: 3, download: 3, upload: 3 });
  });
  it("keeps a failed claim consumed while a different session can still prepare", async () => {
    const f = mediaFixture(),
      signal = new AbortController().signal;
    const download = f.store.download.bind(f.store);
    let fail = true;
    f.store.download = async (...args) => {
      if (fail) throw new Error("synthetic media failure");
      return download(...args);
    };
    await f.admit();
    await expect(
      f.operations.prepare({ binding, nonce, generation: "12" }, signal),
    ).rejects.toMatchObject({ code: "media_failed" });
    expect((await f.store.getIntent(binding.sessionId))?.intent).toMatchObject({
      phase: "terminal",
      mediaOperationsUsed: 1,
    });
    fail = false;
    const second = { ...binding, sessionId: "ses_" + "c".repeat(22) };
    await f.admit(second);
    await f.operations.prepare(
      { binding: second, nonce, generation: "12" },
      signal,
    );
    expect(f.operations.counts).toEqual({ media: 2, ai: 0 });
    expect(f.calls.audio).toBe(1);
  });
  it("preserves exhaustion across restart and dispatches no work for budget rejection", async () => {
    const f = mediaFixture();
    await f.admit();
    const record = (await f.store.getIntent(binding.sessionId))!;
    await f.store.saveIntent(
      { ...record.intent, mediaOperationsUsed: 4 },
      record.generation,
    );
    const restarted = new MediaSessions(
      f.store,
      new UploadCapabilityCipher(Buffer.alloc(32, 7)),
      () => 1_000_000,
    );
    await expect(
      restarted.claimPrepare({ binding, nonce, generation: "12" }),
    ).rejects.toMatchObject({ code: "budget" });
    expect(
      (await f.store.getIntent(binding.sessionId))?.intent.mediaOperationsUsed,
    ).toBe(4);
    expect(f.calls).toEqual({ inspect: 0, audio: 0, proxy: 0, render: 0 });
    expect(f.store.calls).toMatchObject({ download: 0, upload: 0 });
  });
  it("atomically consumes one claim across two session services and refuses replay", async () => {
    const f = mediaFixture();
    await f.admit();
    const restarted = new MediaSessions(
      f.store,
      new UploadCapabilityCipher(Buffer.alloc(32, 7)),
      () => 1_000_000,
    );
    const request = { binding, nonce, generation: "12" };
    const results = await Promise.allSettled([
      f.sessions.claimPrepare(request),
      restarted.claimPrepare(request),
    ]);
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    expect(
      (await f.store.getIntent(binding.sessionId))?.intent.mediaOperationsUsed,
    ).toBe(1);
    await expect(restarted.claimPrepare(request)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(
      (await f.store.getIntent(binding.sessionId))?.intent.mediaOperationsUsed,
    ).toBe(1);
    expect(f.store.calls).toMatchObject({ download: 0, upload: 0 });
  });
  it.each([
    ["uploading", 0],
    ["preparing", 1],
    ["prepared", 1],
    ["selecting", 2],
    ["previewing", 3],
    ["rendering", 4],
    ["complete", 4],
    ["terminal", 4],
  ] as const)(
    "infers consumed allowance for legacy %s intents without breaking cleanup",
    async (phase, used) => {
      const f = mediaFixture();
      await f.admit();
      const record = (await f.store.getIntent(binding.sessionId))!;
      const legacy = {
        ...record.intent,
        phase,
        mediaOperationsUsed: undefined,
      };
      expect(temporaryIntentSchema.parse(legacy).mediaOperationsUsed).toBe(
        used,
      );
    },
  );
});
