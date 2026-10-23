import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { OwnerDraftStore } from "./draft-store.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import {
  ownerClipBaseSchema,
  ownerClipSchema,
} from "../../../packages/contracts/local/clips.ts";
import { type OwnerDraftSnapshot } from "../../../packages/contracts/local/drafts.ts";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, createReadStream: vi.fn(actual.createReadStream) };
});

let directory: string,
  scratch: string,
  storage: string,
  files: WorkspaceFiles,
  store: OwnerDraftStore;
const hash = (bytes: string | Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
const sourceBytes = Buffer.from("synthetic owner source");
const pictureBytes = Buffer.from("synthetic canonical JPEG");
const rawBytes = Buffer.from("synthetic normalized clip");
const outputBytes = Buffer.from("synthetic native output");

it("recognizes source, raw clip and existing export bytes, never filenames", async () => {
  const snapshot = await fixture();
  const saved = await store.save(undefined, snapshot, files);
  for (const bytes of [sourceBytes, rawBytes, outputBytes]) {
    expect(
      await store.matchVideo(
        { fingerprint: hash(bytes), bytes: bytes.length },
        AbortSignal.timeout(5000),
      ),
    ).toEqual({
      id: saved.id,
      clipId: snapshot.clips[0]!.id,
    });
  }
  expect(
    await store.matchVideo(
      { fingerprint: hash(outputBytes), bytes: outputBytes.length + 1 },
      AbortSignal.timeout(5000),
    ),
  ).toBeNull();
  expect(
    await store.matchVideo(
      { fingerprint: hash("different"), bytes: outputBytes.length },
      AbortSignal.timeout(5000),
    ),
  ).toBeNull();
});

it("chooses the latest matching draft and checks selected manifest identity", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  try {
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    const snapshot = await fixture();
    const older = await store.save(undefined, snapshot, files);
    vi.setSystemTime(new Date("2026-01-01T10:00:01Z"));
    const newer = await store.save(undefined, snapshot, files);
    const signal = AbortSignal.timeout(5000);
    expect(
      (
        await store.matchVideo(
          { fingerprint: hash(outputBytes), bytes: outputBytes.length },
          signal,
        )
      )?.id,
    ).toBe(newer.id);
    expect(
      (
        await store.matchReference(
          { id: older.id, sourceFingerprint: hash(sourceBytes) },
          signal,
        )
      ).id,
    ).toBe(older.id);
    await expect(
      store.matchReference(
        { id: newer.id, sourceFingerprint: hash("other") },
        signal,
      ),
    ).rejects.toThrow("draft_reference_mismatch");
    expect(() =>
      store.matchReference(
        { id: "../outside", sourceFingerprint: hash(sourceBytes) },
        signal,
      ),
    ).toThrow();
  } finally {
    vi.useRealTimers();
  }
});

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-drafts-test-"));
  scratch = join(directory, "scratch");
  storage = join(directory, "Downloads", "ClipBuilder");
  await mkdir(scratch);
  files = new WorkspaceFiles(scratch);
  store = new OwnerDraftStore(storage);
});
afterEach(async () => {
  await store.cancelPending();
  vi.restoreAllMocks();
  await files.close();
  await rm(directory, { recursive: true, force: true });
});
async function fixture(): Promise<OwnerDraftSnapshot> {
  const workspaceId = await files.create(),
    clipId = randomUUID(),
    momentId = randomUUID(),
    analysisId = randomUUID(),
    assetId = randomUUID();
  await writeFile(await files.file(workspaceId, "source.mp4"), sourceBytes);
  await writeFile(await files.asset(workspaceId, assetId), pictureBytes);
  await writeFile(await files.clipSource(workspaceId, clipId), rawBytes);
  await writeFile(await files.output(workspaceId, clipId, 0), outputBytes);
  const asset = {
    id: assetId,
    digest: hash(pictureBytes),
    bytes: pictureBytes.length,
    width: 640,
    height: 360,
    origin: "owner-supplied" as const,
  };
  const base = ownerClipBaseSchema.parse({
    version: 1,
    analysisId,
    momentId,
    sourceRevision: 0,
    fingerprint: hash(sourceBytes),
    processingIdentity: "b".repeat(64),
    cut: { startFrame: 0, endFrame: 30 },
    words: [],
    overlay: {
      version: 1,
      frames: 30,
      captions: [],
      visuals: [
        {
          id: randomUUID(),
          assetId,
          digest: asset.digest,
          startFrame: 0,
          endFrame: 30,
          box: { x: 0, y: 0, width: 1, height: 0.4 },
          fit: "contain",
          origin: "owner-supplied",
        },
      ],
    },
  });
  const clip = ownerClipSchema.parse({
    id: clipId,
    momentId,
    mode: "synthetic-ai",
    analysisId,
    sourceRevision: 0,
    revision: 0,
    assemblyRevision: 0,
    baseHash: hash(JSON.stringify(base)),
    state: "ready",
    base,
    edit: null,
    assets: [asset],
    outputs: [
      {
        id: "c".repeat(64),
        revision: 0,
        editRevision: 0,
        frames: 30,
        bytes: outputBytes.length,
      },
    ],
    calls: { plan: 1, image: 1, render: 1 },
    error: null,
  });
  return {
    version: 1,
    workspace: {
      id: workspaceId,
      source: {
        fingerprint: hash(sourceBytes),
        bytes: sourceBytes.length,
        durationMs: 2000,
        width: 320,
        height: 180,
        fps: 30,
      },
      mode: "synthetic-ai",
      revision: 0,
    },
    analysis: null,
    clips: [clip],
  };
}
async function exists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return false;
    throw error;
  }
}
function edit(
  snapshot: OwnerDraftSnapshot,
  revision: number,
): OwnerDraftSnapshot {
  const copy = structuredClone(snapshot);
  const clip = copy.clips[0]!;
  clip.revision = revision;
  clip.edit = {
    version: 1,
    clipId: clip.id,
    fingerprint: copy.workspace.source.fingerprint,
    baseHash: clip.baseHash!,
    revision,
    captions: null,
    visuals: [],
  };
  return copy;
}

it("retains one source and independent exports, then reopens a new workspace offline without replaying work", async () => {
  expect(await store.list()).toEqual([]);
  expect(await exists(storage)).toBe(false);
  const original = await fixture();
  const summary = await store.save(undefined, original, files);
  expect(summary.clips).toBe(1);
  expect(await store.list()).toEqual([summary]);
  const source = join(storage, "Sources", `${hash(sourceBytes)}.mp4`);
  const exported = join(
    storage,
    "Exports",
    `${original.clips[0]!.outputs[0]!.id}.mp4`,
  );
  const sourceInfo = await lstat(source);
  await store.save(summary.id, edit(original, 1), files);
  const second = await store.save(undefined, original, files);
  expect((await lstat(source)).mtimeMs).toBe(sourceInfo.mtimeMs);
  expect(await readdir(join(storage, "Sources"))).toHaveLength(1);
  await files.close();
  store = new OwnerDraftStore(storage);
  const restored = await store.load(summary.id, files);
  expect(restored.workspace.id).not.toBe(original.workspace.id);
  expect(restored.clips[0]!.id).toBe(original.clips[0]!.id);
  expect(restored.clips[0]!.baseHash).toBe(original.clips[0]!.baseHash);
  expect(restored.clips[0]!.revision).toBe(1);
  expect(restored.clips[0]!.calls).toEqual({ plan: 1, image: 1, render: 1 });
  expect(
    await readFile(await files.file(restored.workspace.id, "source.mp4")),
  ).toEqual(sourceBytes);
  expect(
    await readFile(
      await files.asset(
        restored.workspace.id,
        original.clips[0]!.assets[0]!.id,
      ),
    ),
  ).toEqual(pictureBytes);
  expect(
    await readFile(
      await files.clipSource(restored.workspace.id, original.clips[0]!.id),
    ),
  ).toEqual(rawBytes);
  expect(
    await readFile(
      await files.output(restored.workspace.id, original.clips[0]!.id, 0),
    ),
  ).toEqual(outputBytes);
  await store.delete(summary.id);
  expect(await exists(join(storage, "Drafts", summary.id))).toBe(false);
  expect(await readFile(source)).toEqual(sourceBytes);
  expect(await readFile(exported)).toEqual(outputBytes);
  expect((await store.list()).map((draft) => draft.id)).toEqual([second.id]);
});

it("serializes frozen saves and recovers only the fully validated previous document", async () => {
  const original = await fixture();
  const saved = await store.save(undefined, original, files);
  const first = edit(original, 1),
    second = edit(original, 2);
  const saving = Promise.all([
    store.save(saved.id, first, files),
    store.save(saved.id, second, files),
  ]);
  second.clips[0]!.revision = 99;
  await saving;
  expect((await store.load(saved.id, files)).clips[0]!.revision).toBe(2);
  await writeFile(
    join(storage, "Drafts", saved.id, "draft.json"),
    "{interrupted",
  );
  expect((await store.load(saved.id, files)).clips[0]!.revision).toBe(1);
  await writeFile(
    await files.file(original.workspace.id, "source.mp4"),
    Buffer.alloc(sourceBytes.length, 5),
  );
  await expect(store.save(saved.id, original, files)).rejects.toThrow(
    "draft_source_changed",
  );
  expect((await store.load(saved.id, files)).clips[0]!.revision).toBe(1);
});

it("detects changed saved media, preserves every saved copy on failed reopening, and isolates a damaged draft", async () => {
  const original = await fixture();
  const saved = await store.save(undefined, original, files);
  const sibling = await store.save(undefined, original, files);
  const asset = original.clips[0]!.assets[0]!;
  const storedPicture = join(
    storage,
    "Drafts",
    saved.id,
    "assets",
    `${asset.id}.${asset.digest}.jpg`,
  );
  await writeFile(storedPicture, Buffer.alloc(asset.bytes, 1));
  const before = await readdir(scratch);
  await expect(store.load(saved.id, files)).rejects.toThrow(
    "draft_unavailable",
  );
  expect(await readdir(scratch)).toEqual(before);
  expect(await exists(storedPicture)).toBe(true);
  expect((await store.load(sibling.id, files)).clips[0]!.id).toBe(
    original.clips[0]!.id,
  );
  await writeFile(
    join(storage, "Sources", `${hash(sourceBytes)}.mp4`),
    Buffer.alloc(sourceBytes.length, 2),
  );
  await expect(store.save(saved.id, original, files)).rejects.toThrow(
    "draft_unavailable",
  );
  await expect(store.load(sibling.id, files)).rejects.toThrow(
    "draft_unavailable",
  );
  expect(
    await readFile(join(storage, "Sources", `${hash(sourceBytes)}.mp4`)),
  ).toEqual(Buffer.alloc(sourceBytes.length, 2));
});

it("restores interrupted jobs as canceled and allows a prepared bundle with no published raw cut", async () => {
  const original = await fixture();
  original.clips[0]!.state = "rendering";
  await rm(
    await files.clipSource(original.workspace.id, original.clips[0]!.id),
  );
  const saved = await store.save(undefined, original, files);
  const restored = await store.load(saved.id, files);
  expect(restored.clips[0]!.state).toBe("canceled");
  expect(restored.clips[0]!.error).toBe("canceled");
  expect(restored.clips[0]!.calls).toEqual(original.clips[0]!.calls);
  expect(restored.clips[0]!.outputs).toEqual(original.clips[0]!.outputs);
  expect(
    await exists(
      await files.clipSource(restored.workspace.id, original.clips[0]!.id),
    ),
  ).toBe(false);
});

it("keeps backup picture files and rejects attempts to overwrite an immutable published export", async () => {
  const original = await fixture();
  const saved = await store.save(undefined, original, files);
  const changed = edit(original, 1);
  const newBytes = Buffer.from("second synthetic personal picture");
  const newAsset = {
    ...changed.clips[0]!.assets[0]!,
    id: randomUUID(),
    digest: hash(newBytes),
    bytes: newBytes.length,
  };
  changed.clips[0]!.assets.push(newAsset);
  changed.clips[0]!.edit!.visuals = [
    {
      id: randomUUID(),
      assetId: newAsset.id,
      startFrame: 0,
      endFrame: 30,
      box: { x: 0.1, y: 0.1, width: 0.5, height: 0.3 },
      fit: "cover",
    },
  ];
  await writeFile(
    await files.asset(original.workspace.id, newAsset.id),
    newBytes,
  );
  await store.save(saved.id, changed, files);
  await store.save(saved.id, edit(original, 2), files);
  await writeFile(
    join(storage, "Drafts", saved.id, "draft.json"),
    "interrupted",
  );
  const recovered = await store.load(saved.id, files);
  expect(recovered.clips[0]!.revision).toBe(1);
  expect(
    await readFile(await files.asset(recovered.workspace.id, newAsset.id)),
  ).toEqual(newBytes);
  await writeFile(
    await files.output(original.workspace.id, original.clips[0]!.id, 0),
    Buffer.alloc(outputBytes.length, 9),
  );
  await expect(store.save(saved.id, original, files)).rejects.toThrow(
    "draft_file_damaged",
  );
  expect(
    await readFile(
      join(storage, "Exports", `${original.clips[0]!.outputs[0]!.id}.mp4`),
    ),
  ).toEqual(outputBytes);
  expect((await store.load(saved.id, files)).clips[0]!.revision).toBe(1);
  // A failed first save must not consume a draft slot or replace a retained export.
  const before = await readdir(join(storage, "Drafts"));
  await expect(store.save(undefined, original, files)).rejects.toThrow(
    "draft_file_damaged",
  );
  expect(await readdir(join(storage, "Drafts"))).toEqual(before);
});

it("cancels and drains a blocked streaming save plus its queued successor without publishing or retaining partial copies", async () => {
  const original = await fixture();
  const sourcePath = await files.file(original.workspace.id, "source.mp4");
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  let release!: () => void;
  const started = new Promise<void>((done) => {
    release = done;
  });
  let sourceReads = 0;
  let blocked: ReturnType<typeof createReadStream> | undefined;
  vi.mocked(createReadStream).mockImplementation((path, options) => {
    const stream = actual.createReadStream(path, options);
    if (path === sourcePath && ++sourceReads === 2) {
      blocked = stream;
      vi.spyOn(stream, "_read").mockImplementation(() => {
        release();
      });
    }
    return stream;
  });
  // The second source read is the stream copy, after the source hash passed.
  const first = store.save(undefined, original, files);
  const second = store.save(undefined, original, files);
  const results = Promise.allSettled([first, second]);
  await started;
  await store.cancelPending();
  expect((await results).map((result) => result.status)).toEqual([
    "rejected",
    "rejected",
  ]);
  expect(blocked?.destroyed).toBe(true);
  expect(await readdir(join(storage, "Drafts"))).toEqual([]);
  expect(await readdir(join(storage, "Sources"))).toEqual([]);
  expect(await readdir(join(storage, "Exports"))).toEqual([]);
  expect(await readFile(sourcePath)).toEqual(sourceBytes);
  vi.mocked(createReadStream).mockImplementation(actual.createReadStream);
  const saved = await store.save(undefined, original, files);
  expect((await store.load(saved.id, files)).clips[0]!.id).toBe(
    original.clips[0]!.id,
  );
});

it("rejects linked storage/draft paths and forged references without reading or deleting outside owned storage", async () => {
  const original = await fixture();
  const saved = await store.save(undefined, original, files);
  const outside = join(directory, "outside");
  await mkdir(outside);
  await writeFile(join(outside, "keep.txt"), "synthetic outside file");
  const draftPath = join(storage, "Drafts", saved.id);
  const linkId = randomUUID();
  await symlink(outside, join(storage, "Drafts", linkId), "junction");
  await expect(store.load(linkId, files)).rejects.toThrow();
  await expect(store.delete(linkId)).rejects.toThrow();
  expect(await readFile(join(outside, "keep.txt"), "utf8")).toBe(
    "synthetic outside file",
  );
  await rm(join(storage, "Drafts", linkId));
  const json = JSON.parse(
    await readFile(join(draftPath, "draft.json"), "utf8"),
  );
  json.snapshot.clips[0].base.fingerprint = "d".repeat(64);
  await writeFile(join(draftPath, "draft.json"), JSON.stringify(json));
  await expect(store.load(saved.id, files)).rejects.toThrow(
    "draft_unavailable",
  );
  const linkedRoot = join(directory, "linked-root");
  await symlink(outside, linkedRoot, "junction");
  await expect(
    new OwnerDraftStore(linkedRoot).save(undefined, original, files),
  ).rejects.toThrow("invalid_path");
  expect(await readdir(outside)).toEqual(["keep.txt"]);
});
