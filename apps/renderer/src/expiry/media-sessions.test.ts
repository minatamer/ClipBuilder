import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  compositionManifestV3Schema,
  type MediaBinding,
} from "@clipbuilder/contracts";
import { MediaSessions } from "./media-sessions.js";
import { UploadCapabilityCipher } from "./upload-capability.js";
import { MemoryMediaStore } from "../../test/memory-store.js";
import { temporaryIntentSchema } from "./temporary-intent.js";
import {
  CleanupDiagnostics,
  type CleanupDiagnostic,
} from "./cleanup-diagnostics.js";

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
  const records: CleanupDiagnostic[] = [];
  const service = new MediaSessions(
    store,
    cipher,
    () => time,
    new CleanupDiagnostics((record) => records.push(record)),
  );
  return {
    store,
    cipher,
    service,
    records,
    now: () => time,
    advance: (ms: number) => {
      time += ms;
    },
    admit: (sessionBinding = binding, signal?: AbortSignal) =>
      service.admit(
        {
          binding: sessionBinding,
          bytes: 1024,
          contentType: "video/mp4",
          rightsAcknowledged: true,
          dataTransferAcknowledged: true,
        },
        signal,
      ),
  };
}
describe("temporary media admission and independent cleanup", () => {
  const nextBinding = { ...binding, sessionId: "ses_" + "d".repeat(22) };
  it("cleans an expired session during admission between scheduled sweeps", async () => {
    const f = fixture();
    await f.admit();
    const old = (await f.store.getIntent(binding.sessionId))!;
    f.store.objects.set(binding.sessionId, [
      { artifactId: old.intent.sourceId, generation: "12", bytes: 1024 },
    ]);
    f.advance(7_200_001);
    await f.admit(nextBinding);
    expect(await f.store.getIntent(binding.sessionId)).toBeNull();
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(await f.store.getIntent(nextBinding.sessionId)).not.toBeNull();
    expect(f.store.calls).toEqual({
      begin: 2,
      cancel: 1,
      delete: 1,
      upload: 0,
      download: 0,
    });
    const trigger = f.records.find(
      (record) => record.phase === "intake_check" && record.expired === 1,
    )!;
    expect(trigger).toMatchObject({
      operation: "admission",
      reason: "cleanup_required",
      sessions: 1,
    });
    expect(
      f.records.filter(
        (record) => record.diagnosticId === trigger.diagnosticId,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "intent_delete",
          outcome: "succeeded",
        }),
        expect.objectContaining({ phase: "recovery", outcome: "succeeded" }),
        expect.objectContaining({
          phase: "upload_allocate",
          outcome: "succeeded",
        }),
      ]),
    );
  });
  it("keeps failed deletion blocked, respects retry delay and recovers on later admission", async () => {
    const f = fixture();
    await f.admit();
    const old = (await f.store.getIntent(binding.sessionId))!;
    f.store.objects.set(binding.sessionId, [
      { artifactId: old.intent.sourceId, generation: "12", bytes: 1024 },
    ]);
    f.advance(7_200_001);
    f.store.failDelete = true;
    await expect(f.admit(nextBinding)).rejects.toMatchObject({
      code: "cleanup_pending",
    });
    expect(f.store.calls.begin).toBe(1);
    expect((await f.store.getIntent(binding.sessionId))!.intent).toMatchObject({
      cleanupPending: true,
      cleanupAttempts: 1,
    });
    f.store.failDelete = false;
    await expect(f.admit(nextBinding)).rejects.toMatchObject({
      code: "cleanup_pending",
    });
    expect(f.store.calls.delete).toBe(1);
    expect(f.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "retry_wait",
          outcome: "deferred",
          retryAfterMs: 900_000,
        }),
      ]),
    );
    f.advance(900_001);
    await f.admit(nextBinding);
    expect(f.service.blocked).toBe(false);
    expect(f.store.calls).toEqual({
      begin: 2,
      cancel: 2,
      delete: 2,
      upload: 0,
      download: 0,
    });
  });
  it("preserves an active prepared source and unexpired final output while cleaning an old session", async () => {
    const f = fixture();
    await f.admit();
    f.advance(6_900_000);
    const prepared = { ...binding, sessionId: "ses_" + "e".repeat(22) };
    const completed = { ...binding, sessionId: "ses_" + "f".repeat(22) };
    await f.admit(prepared);
    await f.admit(completed);
    const preparedRecord = (await f.store.getIntent(prepared.sessionId))!;
    await f.store.saveIntent(
      { ...preparedRecord.intent, phase: "prepared" },
      preparedRecord.generation,
    );
    const completeRecord = (await f.store.getIntent(completed.sessionId))!;
    await f.store.saveIntent(
      {
        ...completeRecord.intent,
        phase: "complete",
        encryptedUpload: null,
        output: {
          artifactId: artifact,
          generation: "12",
          bytes: 1024,
          checksum: "b".repeat(64),
        },
        outputExpiresAtMs: f.now() + 600_000,
      },
      completeRecord.generation,
    );
    const activeObject = {
      artifactId: artifact,
      generation: "12",
      bytes: 1024,
    };
    f.store.objects.set(prepared.sessionId, [activeObject]);
    f.store.objects.set(completed.sessionId, [activeObject]);
    const activeBefore = await f.store.getIntent(prepared.sessionId);
    const outputBefore = await f.store.getIntent(completed.sessionId);
    f.advance(300_001);
    await f.admit(nextBinding);
    expect(await f.store.getIntent(prepared.sessionId)).toEqual(activeBefore);
    expect(await f.store.getIntent(completed.sessionId)).toEqual(outputBefore);
    expect(await f.store.listArtifacts(prepared.sessionId)).toEqual([
      activeObject,
    ]);
    expect(await f.store.listArtifacts(completed.sessionId)).toEqual([
      activeObject,
    ]);
    expect(f.store.calls).toMatchObject({
      begin: 4,
      upload: 0,
      download: 0,
      delete: 0,
    });
  });
  it("rechecks a session that expires while admission cleanup is running", async () => {
    const f = fixture();
    await f.admit();
    f.advance(7_200_001);
    const old = (await f.store.getIntent(binding.sessionId))!;
    const nearExpiry = {
      ...old.intent,
      binding: { ...binding, sessionId: "ses_" + "e".repeat(22) },
      encryptedUpload: null,
      expiresAtMs: f.now() + 1,
    };
    await f.store.saveIntent(nearExpiry, "0");
    const list = f.store.listIntents.bind(f.store);
    let inventories = 0;
    vi.spyOn(f.store, "listIntents").mockImplementation(async () => {
      if (++inventories === 3) f.advance(2);
      return list();
    });
    await expect(f.admit(nextBinding)).rejects.toMatchObject({
      code: "cleanup_pending",
    });
    expect(f.store.calls.begin).toBe(1);
    expect(f.service.blocked).toBe(true);
    await f.admit(nextBinding);
    expect(f.store.calls.begin).toBe(2);
  });
  it("does not allocate when the cleanup journal cannot be read", async () => {
    const f = fixture();
    vi.spyOn(f.store, "listIntents").mockRejectedValue(
      Object.assign(new Error("synthetic-private-bucket-details"), {
        code: 403,
      }),
    );
    await expect(f.admit()).rejects.toThrow();
    expect(f.store.calls).toEqual({
      begin: 0,
      cancel: 0,
      delete: 0,
      upload: 0,
      download: 0,
    });
    expect(f.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "intent_list",
          outcome: "failed",
          httpStatus: 403,
        }),
      ]),
    );
    expect(JSON.stringify(f.records)).not.toContain("synthetic-private");
  });
  it("recovers a process cleanup block caused by an expired orphan", async () => {
    const f = fixture();
    f.store.objects.set(binding.sessionId, [
      {
        artifactId: artifact,
        generation: "12",
        bytes: 1024,
        expiresAtMs: f.now() - 1,
      },
    ]);
    f.store.failDelete = true;
    expect((await f.service.sweep()).unresolved).toBe(1);
    f.store.failDelete = false;
    await f.admit(nextBinding);
    expect(f.service.blocked).toBe(false);
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(f.store.calls).toEqual({
      begin: 1,
      cancel: 0,
      delete: 2,
      upload: 0,
      download: 0,
    });
  });
  it("cleans an expired final output before admitting a fresh upload", async () => {
    const f = fixture();
    await f.admit();
    const record = (await f.store.getIntent(binding.sessionId))!;
    await f.store.saveIntent(
      {
        ...record.intent,
        phase: "complete",
        encryptedUpload: null,
        output: {
          artifactId: artifact,
          generation: "12",
          bytes: 1024,
          checksum: "b".repeat(64),
        },
        outputExpiresAtMs: f.now() + 600_000,
      },
      record.generation,
    );
    f.store.objects.set(binding.sessionId, [
      { artifactId: artifact, generation: "12", bytes: 1024 },
    ]);
    f.advance(600_001);
    await f.admit(nextBinding);
    expect(await f.store.getIntent(binding.sessionId)).toBeNull();
    expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
    expect(f.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "intake_check",
          outputExpired: 1,
          expired: 0,
        }),
      ]),
    );
    expect(f.store.calls).toEqual({
      begin: 2,
      cancel: 0,
      delete: 1,
      upload: 0,
      download: 0,
    });
  });
  it("compensates an upload allocated just before client cancellation with a separate cleanup signal", async () => {
    const f = fixture(),
      controller = new AbortController();
    const begin = f.store.beginUpload.bind(f.store);
    vi.spyOn(f.store, "beginUpload").mockImplementation(async (intent) => {
      const capability = await begin(intent);
      controller.abort();
      return capability;
    });
    const scopes = vi.spyOn(f.store, "withSignal");
    await expect(f.admit(binding, controller.signal)).rejects.toMatchObject({
      code: "media_failed",
    });
    expect(scopes).toHaveBeenCalledTimes(1);
    expect(scopes.mock.calls[0][0].aborted).toBe(false);
    expect((await f.store.getIntent(binding.sessionId))!.intent).toMatchObject({
      phase: "terminal",
      encryptedUpload: null,
      cleanupPending: false,
    });
    expect(f.store.calls).toEqual({
      begin: 1,
      cancel: 1,
      delete: 0,
      upload: 0,
      download: 0,
    });
  });
  it.each(["uploading", "prepared"] as const)(
    "cleans legacy WebM %s records while refusing further processing",
    async (phase) => {
      const f = fixture();
      await f.admit();
      const record = (await f.store.getIntent(binding.sessionId))!;
      const intent = temporaryIntentSchema.parse({
        ...record.intent,
        contentType: "video/webm",
        phase,
        source:
          phase === "uploading"
            ? null
            : {
                fingerprint: binding.fingerprint,
                bytes: 1024,
                durationMs: 15_000,
                width: 1280,
                height: 720,
                audioStartMs: 0,
                profile: {
                  container: "webm",
                  videoCodec: "vp9",
                  audioCodec: "opus",
                  averageFrameRate: 30,
                  rotationDegrees: 0,
                },
              },
      });
      expect(intent.source).toBeNull();
      await f.store.saveIntent(intent, record.generation);
      f.store.objects.set(binding.sessionId, [
        { artifactId: intent.sourceId, generation: "12", bytes: 1024 },
      ]);
      await expect(
        f.service.claimPrepare({ binding, generation: "12", nonce }),
      ).rejects.toMatchObject({ code: "invalid" });
      await f.service.terminate(binding);
      expect(await f.store.listArtifacts(binding.sessionId)).toEqual([]);
      expect(f.store.calls).toEqual({
        begin: 1,
        cancel: 1,
        delete: 1,
        upload: 0,
        download: 0,
      });
      f.advance(7_200_001);
      expect(await f.service.sweep()).toEqual({ sessions: 1, unresolved: 0 });
      expect(await f.store.getIntent(binding.sessionId)).toBeNull();
    },
  );

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
      audioProfile: {
        contentType: "audio/m4a",
        codec: "aac",
        sampleRate: 16000,
        channels: 1,
      },
      analysisAudio: {
        artifactId: artifact,
        generation: "14",
        bytes: 1024,
        checksum: "b".repeat(64),
      },
    });
    const manifest = compositionManifestV3Schema.parse({
      version: 3,
      source: {
        fingerprint: source.fingerprint,
        width: source.width,
        height: source.height,
        durationMs: source.durationMs,
      },
      range: { startMs: 0, endMs: 10_000 },
      output: { width: 1080, height: 1920, fps: 30 },
      focus: [{ mode: "wide", reason: "initial", startMs: 0, endMs: 10_000 }],
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
        audioProfile: {
          contentType: "audio/m4a",
          codec: "aac",
          sampleRate: 16000,
          channels: 1,
        },
        analysisAudio: {
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
