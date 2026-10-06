import { createHash } from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { compositionManifestV3Schema } from "@clipbuilder/contracts";
import { binding, nonce, mediaFixture } from "../../test/media-fixture.js";
import { createRendererApplication } from "../app.js";
import { MediaFailure } from "./media.failure.js";
async function fixture() {
  const f = mediaFixture(),
    signal = new AbortController().signal;
  await f.admit();
  await f.operations.prepare({ binding, nonce, generation: "12" }, signal);
  await f.operations.releaseAnalysisProxy(binding, signal);
  const range = { startMs: 1000, endMs: 11000 };
  await f.operations.select(
    { binding, nonce, generation: "12", range },
    signal,
  );
  await f.operations.releaseAnalysisProxy(binding, signal);
  const manifest = compositionManifestV3Schema.parse({
    version: 3,
    source: {
      fingerprint: binding.fingerprint,
      durationMs: 15000,
      width: 320,
      height: 180,
    },
    range,
    output: { width: 1080, height: 1920, fps: 30 },
    focus: [{ mode: "wide", reason: "initial", startMs: 0, endMs: 10000 }],
    captions: [],
    cards: [
      {
        origin: "planner",
        startMs: 2000,
        endMs: 3500,
        kind: "statement",
        title: "Synthetic context",
        lines: ["Synthetic excerpt"],
      },
    ],
  });
  const manifestHash = createHash("sha256")
    .update(JSON.stringify(manifest))
    .digest("hex");
  await f.operations.preview(
    { binding, nonce, generation: "12", range, manifestHash },
    signal,
  );
  const app = createRendererApplication(f.operations, {
    async verify(header) {
      if (header === "Bearer synthetic") return "control";
      throw new MediaFailure("unauthorized");
    },
  });
  return {
    ...f,
    signal,
    app,
    input: { binding, nonce, manifestHash, manifest },
    access: { binding, manifestHash },
  };
}
describe("validated final output ownership", () => {
  it("publishes one output, deletes source/proxies and privately streams existing ranges without jobs", async () => {
    const f = await fixture();
    await expect(f.sessions.outputArtifact(f.access)).rejects.toThrow();
    const result = await f.operations.render(f.input, f.signal);
    expect(
      (await f.store.getIntent(binding.sessionId))?.intent.mediaOperationsUsed,
    ).toBe(4);
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([
      expect.objectContaining({ artifactId: result.output.artifactId }),
    ]);
    expect(await f.sessions.outputArtifact(f.access)).toEqual({
      ...result,
      binding,
    });
    for (let i = 0; i < 2; i++) {
      const response = await request(f.app)
        .post("/internal/output-content")
        .set("Authorization", "Bearer synthetic")
        .set("Range", "bytes=-100")
        .send(f.access);
      expect(response.status).toBe(206);
      expect(response.body.length).toBe(100);
    }
    expect(f.calls).toEqual({ inspect: 4, audio: 1, proxy: 2, render: 1 });
    expect(f.operations.counts).toEqual({ media: 4, ai: 0 });
    await f.operations.cancel(binding);
    await expect(f.sessions.outputArtifact(f.access)).rejects.toThrow();
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
  });
  it("rejects a changed frozen manifest without rendering and keeps cleanup ownership", async () => {
    const f = await fixture(),
      manifest = { ...f.input.manifest, range: { startMs: 0, endMs: 10000 } },
      manifestHash = createHash("sha256")
        .update(JSON.stringify(manifest))
        .digest("hex");
    await expect(
      f.operations.render({ ...f.input, manifest, manifestHash }, f.signal),
    ).rejects.toThrow();
    expect(f.calls.render).toBe(0);
    await f.operations.cancel(binding);
  });
  it("refuses incomplete cleanup and stale output generations", async () => {
    const f = await fixture();
    f.store.failDelete = true;
    await expect(f.operations.render(f.input, f.signal)).rejects.toThrow();
    await expect(f.sessions.outputArtifact(f.access)).rejects.toThrow();
    f.store.failDelete = false;
    await f.operations.cancel(binding);
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
  });
});
