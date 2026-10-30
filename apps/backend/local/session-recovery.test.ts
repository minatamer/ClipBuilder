import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OwnerSessionRecovery } from "./session-recovery.ts";
import { OwnerDraftStore } from "./draft-store.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import type { OwnerDraftSnapshot } from "../../../packages/contracts/local/drafts.ts";

let directory: string,
  library: string,
  files: WorkspaceFiles,
  snapshot: OwnerDraftSnapshot;
const stores: OwnerSessionRecovery[] = [];
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-recovery-test-"));
  library = join(directory, "library");
  const root = join(directory, "workspaces");
  await mkdir(root);
  files = new WorkspaceFiles(root);
  const id = await files.create(),
    source = Buffer.from("synthetic-source");
  await writeFile(await files.file(id, "source.mp4"), source);
  snapshot = {
    version: 1,
    analysis: null,
    clips: [],
    workspace: {
      id,
      revision: 0,
      mode: "synthetic-ai",
      source: {
        fingerprint: createHash("sha256").update(source).digest("hex"),
        bytes: source.length,
        durationMs: 1000,
        width: 320,
        height: 180,
        fps: 30,
      },
    },
  };
});
afterEach(async () => {
  vi.restoreAllMocks();
  for (const store of stores.splice(0)) await store.close();
  await files.close();
  await rm(directory, { recursive: true, force: true });
});
function recovery() {
  const value = new OwnerSessionRecovery(library, files, () =>
    structuredClone(snapshot),
  );
  stores.push(value);
  return value;
}
it("publishes a debounced snapshot before shutdown and restores interrupted work without replay", async () => {
  snapshot.clips = [
    {
      id: randomUUID(),
      momentId: randomUUID(),
      analysisId: randomUUID(),
      mode: "synthetic-ai",
      sourceRevision: 0,
      revision: 0,
      assemblyRevision: 0,
      baseHash: null,
      state: "queued",
      base: null,
      edit: null,
      assets: [],
      outputs: [],
      calls: { plan: 1, image: 0, render: 0 },
      error: null,
    },
  ];
  const first = recovery();
  first.changed(snapshot.workspace.id);
  const store = new OwnerDraftStore(join(library, ".recovery"));
  let saved = await store.list();
  for (let attempt = 0; !saved.length && attempt < 100; attempt++) {
    await new Promise((done) => setTimeout(done, 20));
    saved = await store.list();
  }
  expect(saved).toHaveLength(1);
  const restored = await recovery().restore(AbortSignal.timeout(5000));
  expect(restored!.clips[0]).toMatchObject({
    state: "canceled",
    error: "canceled",
    calls: { plan: 1, image: 0, render: 0 },
  });
});
it("automatically persists one rolling snapshot and reopens its source without touching explicit drafts", async () => {
  const explicit = new OwnerDraftStore(library);
  const saved = await explicit.save(undefined, snapshot, files);
  const first = recovery();
  first.changed(snapshot.workspace.id);
  snapshot.workspace.revision = 1;
  first.changed(snapshot.workspace.id);
  await first.close();
  const store = new OwnerDraftStore(join(library, ".recovery"));
  expect(await store.list()).toHaveLength(1);
  const restored = await recovery().restore(AbortSignal.timeout(5000));
  expect(restored!.workspace.id).not.toBe(snapshot.workspace.id);
  expect(restored!.workspace.revision).toBe(1);
  expect(
    await readFile(await files.file(restored!.workspace.id, "source.mp4")),
  ).toEqual(Buffer.from("synthetic-source"));
  expect((await explicit.list()).map((draft) => draft.id)).toEqual([saved.id]);
});
it("clears only recovery on reset, leaving manually saved source and projects intact", async () => {
  const explicit = new OwnerDraftStore(library),
    saved = await explicit.save(undefined, snapshot, files);
  const first = recovery();
  first.changed(snapshot.workspace.id);
  await first.close();
  const second = recovery();
  await second.restore(AbortSignal.timeout(5000));
  await second.clear();
  expect(await second.restore(AbortSignal.timeout(5000))).toBeNull();
  expect((await explicit.list()).map((draft) => draft.id)).toEqual([saved.id]);
  expect(await readdir(join(library, "Sources"))).toHaveLength(1);
});
it("expires recovery after the existing two-hour window", async () => {
  const first = recovery();
  first.changed(snapshot.workspace.id);
  await first.close();
  const now = Date.now();
  vi.spyOn(Date, "now").mockReturnValue(now + 2 * 60 * 60 * 1000 + 1000);
  expect(await recovery().restore(AbortSignal.timeout(5000))).toBeNull();
});
it("refuses linked recovery roots without deleting outside files", async () => {
  const outside = join(directory, "outside");
  await mkdir(outside);
  await mkdir(library);
  await writeFile(join(outside, "keep.txt"), "synthetic-retained");
  await symlink(outside, join(library, ".recovery"), "junction");
  await expect(recovery().clear()).rejects.toThrow("invalid_path");
  expect(await readFile(join(outside, "keep.txt"), "utf8")).toBe(
    "synthetic-retained",
  );
});
