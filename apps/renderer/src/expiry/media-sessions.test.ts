import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  compositionManifestV2Schema,
  type MediaBinding,
} from "@clipbuilder/contracts";
import { MediaSessions } from "./media-sessions.js";
import { UploadCapabilityCipher } from "./upload-capability.js";
import { MemoryMediaStore } from "../../test/memory-store.js";

const binding: MediaBinding = {
  sessionId: "ses_" + "a".repeat(22),
  sourceRevision: "rev_" + "b".repeat(22),
  fingerprint: "a".repeat(64),
};
const nonce = "00000000-0000-4000-8000-000000000001";
const artifact = "00000000-0000-4000-8000-000000000002";
function fixture() {
  let time = 1_000_000;
  const store = new MemoryMediaStore(),
    cipher = new UploadCapabilityCipher(Buffer.alloc(32, 7));
  const service = new MediaSessions(store, cipher, () => time);
  return {
    store,
    cipher,
    service,
    now: () => time,
    advance: (ms: number) => {
      time += ms;
    },
    admit: () =>
      service.admit({
        binding,
        bytes: 1024,
        contentType: "video/mp4",
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
      }),
  };
}
describe("temporary media admission and independent cleanup", () => {
  it("removes expired late/orphan generations without depending on an intent", async () => {
    const f = fixture();
    f.store.objects.set(binding.sessionId, [
      {
        artifactId: artifact,
        generation: "12",
        bytes: 1024,
        expiresAtMs: f.now() - 1,
      },
    ]);
    expect(await f.service.sweep()).toEqual({ sessions: 0, unresolved: 0 });
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(f.store.calls).toMatchObject({
      begin: 0,
      delete: 1,
      upload: 0,
      download: 0,
    });
  });
  it("encrypts the runtime-only upload capability and refuses duplicate admission without another allocation", async () => {
    const f = fixture(),
      response = await f.admit(),
      record = await f.store.getIntent(binding.sessionId);
    expect(JSON.stringify(record)).not.toContain(response.uploadUrl);
    expect(
      f.cipher.decrypt(record!.intent.encryptedUpload!, binding.sessionId),
    ).toBe(response.uploadUrl);
    await expect(f.admit()).rejects.toMatchObject({ code: "conflict" });
    expect(f.store.calls.begin).toBe(1);
    expect(f.store.calls.upload).toBe(0);
    expect(f.store.calls.download).toBe(0);
  });
  it("rejects capability tampering and a different session AAD", async () => {
    const f = fixture(),
      response = await f.admit(),
      encrypted = f.cipher.encrypt(response.uploadUrl, binding.sessionId);
    expect(() => f.cipher.decrypt(encrypted, "ses_other")).toThrow();
    expect(() => f.cipher.decrypt("corrupt", binding.sessionId)).toThrow();
    expect(() =>
      f.cipher.encrypt("https://evil.invalid/?upload_id=x", binding.sessionId),
    ).toThrow();
  });
  it("cleans abandoned uploaded bytes and unfinished uploads after service restart", async () => {
    const f = fixture();
    await f.admit();
    const record = (await f.store.getIntent(binding.sessionId))!;
    f.store.objects.set(binding.sessionId, [
      { artifactId: record.intent.sourceId, generation: "12", bytes: 1024 },
    ]);
    f.advance(7_200_001);
    const restarted = new MediaSessions(f.store, f.cipher, f.now);
    expect(await restarted.sweep()).toEqual({ sessions: 1, unresolved: 0 });
    expect(f.store.calls).toMatchObject({
      begin: 1,
      cancel: 1,
      delete: 1,
      upload: 0,
      download: 0,
    });
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(await f.store.getIntent(binding.sessionId)).toBeNull();
  });
  it("fences mismatched cancellation and keeps a failed cleanup obligation across restart", async () => {
    const f = fixture();
    await f.admit();
    await expect(
      f.service.terminate({ ...binding, fingerprint: "c".repeat(64) }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(f.store.calls.delete).toBe(0);
    const record = (await f.store.getIntent(binding.sessionId))!;
    f.store.objects.set(binding.sessionId, [
      { artifactId: record.intent.sourceId, generation: "12", bytes: 1024 },
    ]);
    f.store.failDelete = true;
    await expect(f.service.terminate(binding)).rejects.toMatchObject({
      code: "cleanup_pending",
    });
    const restarted = new MediaSessions(f.store, f.cipher, f.now);
    await expect(
      restarted.admit({
        binding: { ...binding, sessionId: "ses_" + "d".repeat(22) },
        bytes: 1024,
        contentType: "video/mp4",
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
      }),
    ).rejects.toMatchObject({ code: "cleanup_pending" });
    f.store.failDelete = false;
    f.advance(900_001);
    expect((await restarted.sweep()).unresolved).toBe(0);
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(f.store.calls.begin).toBe(1);
  });
  it("binds physical processing to admitted generation, source and frozen manifest, then deletes raw data on publication", async () => {
    const f = fixture();
    await f.admit();
    const record = (await f.store.getIntent(binding.sessionId))!;
    f.store.objects.set(binding.sessionId, [
      { artifactId: record.intent.sourceId, generation: "12", bytes: 1024 },
    ]);
    await expect(
      f.service.claimPrepare({ binding, generation: "13", nonce }),
    ).rejects.toMatchObject({ code: "invalid" });
    await f.service.claimPrepare({ binding, generation: "12", nonce });
    await expect(
      f.service.claimPrepare({ binding, generation: "12", nonce }),
    ).rejects.toMatchObject({ code: "conflict" });
    const source = {
      fingerprint: binding.fingerprint,
      bytes: 1024,
      width: 1280,
      height: 720,
      durationMs: 15_000,
      audioStartMs: 0,
    };
    await f.service.prepared(binding, nonce, {
      source,
      analysisProxy: {
        artifactId: artifact,
        generation: "14",
        bytes: 1024,
        checksum: "b".repeat(64),
      },
    });
    const manifest = compositionManifestV2Schema.parse({
      version: 2,
      source: {
        fingerprint: source.fingerprint,
        width: source.width,
        height: source.height,
        durationMs: source.durationMs,
      },
      range: { startMs: 0, endMs: 10_000 },
      output: { width: 1080, height: 1920, fps: 30 },
      focus: [{ mode: "wide", startMs: 0, endMs: 10_000 }],
      captions: [],
      cards: [],
    });
    const manifestHash = createHash("sha256")
      .update(JSON.stringify(manifest))
      .digest("hex");
    await expect(
      f.service.claimRender({
        binding,
        nonce,
        manifest,
        manifestHash: "c".repeat(64),
      }),
    ).rejects.toMatchObject({ code: "conflict" });
    await f.service.claimRender({ binding, nonce, manifest, manifestHash });
    f.store.objects
      .get(binding.sessionId)!
      .push({ artifactId: artifact, generation: "15", bytes: 1024 });
    await f.service.publish(binding, nonce, {
      manifestHash,
      output: {
        artifactId: artifact,
        generation: "15",
        bytes: 1024,
        checksum: "b".repeat(64),
      },
      expiresAtMs: f.now() + 600_000,
    });
    expect(
      (await f.store.listArtifacts(binding.sessionId)).map((o) => o.generation),
    ).toEqual(["15"]);
    f.advance(600_001);
    await f.service.sweep();
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
  });
  it("refuses late publication after terminal cancellation", async () => {
    const f = fixture();
    await f.admit();
    await f.service.terminate(binding);
    await expect(
      f.service.prepared(binding, nonce, {
        source: {
          fingerprint: binding.fingerprint,
          bytes: 1024,
          width: 1280,
          height: 720,
          durationMs: 15_000,
          audioStartMs: 0,
        },
        analysisProxy: {
          artifactId: artifact,
          generation: "15",
          bytes: 1024,
          checksum: "b".repeat(64),
        },
      }),
    ).rejects.toMatchObject({ code: "canceled" });
    expect(f.store.calls.download).toBe(0);
    expect(f.store.calls.upload).toBe(0);
  });
});
