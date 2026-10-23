import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  link,
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
import {
  OwnerSourceLibrary,
  type OwnerSourcePublication,
} from "./source-library.ts";
import { OwnerDraftStore } from "./draft-store.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { ownerYoutubeSourceId } from "./youtube-url.ts";
import type { OwnerSource } from "../../../packages/contracts/local/index.ts";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, createReadStream: vi.fn(actual.createReadStream) };
});
let directory: string,
  storage: string,
  scratch: string,
  files: WorkspaceFiles,
  library: OwnerSourceLibrary;
const bytes = Buffer.from("synthetic complete video source");
const hash = (value: Buffer) =>
  createHash("sha256").update(value).digest("hex");
const metadata = (value = bytes): OwnerSource => ({
  fingerprint: hash(value),
  bytes: value.length,
  durationMs: 2000,
  width: 1920,
  height: 1080,
  fps: 30,
});
function publication(videoId = "aaaaaaaaaaa"): OwnerSourcePublication {
  return {
    videoId,
    mode: "synthetic-source",
    selection: { kind: "tier", tier: 1080 },
    video: {
      formatId: "v1",
      codec: "h264",
      protocol: "https",
      drm: false,
      bytes: bytes.length,
      bytesEstimated: false,
      bitrateKbps: 1000,
      width: 1920,
      height: 1080,
      fps: 30,
      dynamicRange: "sdr",
      quality: 0,
      preference: 0,
    },
    audio: {
      formatId: "a1",
      codec: "aac",
      protocol: "https",
      drm: false,
      bytes: null,
      bytesEstimated: true,
      bitrateKbps: 160,
      channels: 2,
      sampleRate: 48_000,
      language: "en",
      trackId: "original",
      role: "original",
    },
  };
}
beforeEach(async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  vi.mocked(createReadStream)
    .mockReset()
    .mockImplementation(actual.createReadStream);
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-library-test-"));
  storage = join(directory, "Downloads", "ClipBuilder");
  scratch = join(directory, "scratch");
  await mkdir(scratch);
  files = new WorkspaceFiles(scratch);
  library = new OwnerSourceLibrary(storage);
});
afterEach(async () => {
  await library.cancelPending();
  await files.close();
  vi.restoreAllMocks();
  await rm(directory, { recursive: true, force: true });
});
async function workspace(value = bytes) {
  const id = await files.create();
  await writeFile(await files.file(id, "source.mp4"), value);
  return { id, source: metadata(value) };
}
async function exists(path: string) {
  try {
    await lstat(path);
    return true;
  } catch (cause) {
    if (cause instanceof Error && "code" in cause && cause.code === "ENOENT")
      return false;
    throw cause;
  }
}
function inspector(source = metadata()) {
  return vi.fn(async (id: string, signal: AbortSignal) => {
    signal.throwIfAborted();
    expect(hash(await readFile(await files.file(id, "source.mp4")))).toBe(
      source.fingerprint,
    );
    return source;
  });
}

it.each([
  ["avc1.640028", "mp4a.40.2"],
  ["vp09.00.51.08", "opus"],
])(
  "retains provider-shaped %s/%s descriptors through offline native admission",
  async (videoCodec, audioCodec) => {
    const input = publication();
    input.mode = "provider-source";
    input.tools = {
      downloader: "2026.10.21",
      challenge: "2.9.8",
      ffmpeg: "9.0.2",
    };
    input.video.codec = videoCodec;
    input.audio.codec = audioCodec;
    const saved = await library.publish(input, await workspace(), files);
    library = new OwnerSourceLibrary(storage);
    expect((await library.list())[0]?.state).toBe("ready");
    const inspect = inspector();
    const opened = await library.open(saved.id, files, inspect);
    expect(opened.variant.video.codec).toBe(videoCodec);
    expect(opened.variant.audio.codec).toBe(audioCodec);
    expect(inspect).toHaveBeenCalledTimes(1);
  },
);

it("reuses one complete retained master after restart with frozen IDs and a fresh native inspection of its new workspace copy", async () => {
  expect(await library.list()).toEqual([]);
  expect(await library.usage()).toEqual({ bytes: 0, warning: false });
  expect(await exists(storage)).toBe(false);
  const original = await workspace(),
    saved = await library.publish(publication(), original, files);
  expect(saved.sourceId).toBe(ownerYoutubeSourceId("aaaaaaaaaaa"));
  expect(saved.offsetMs).toBe(0);
  expect(saved.mode).toBe("synthetic-source");
  expect(JSON.stringify(saved)).not.toContain("videoId");
  const master = join(storage, "Sources", `${saved.actual.fingerprint}.mp4`),
    before = await lstat(master);
  await files.close();
  library = new OwnerSourceLibrary(storage);
  const inspect = inspector();
  expect(await library.list("aaaaaaaaaaa")).toEqual([saved]);
  expect(inspect).toHaveBeenCalledTimes(0);
  const opened = await library.open(saved.id, files, inspect);
  expect(opened.workspaceId).not.toBe(original.id);
  expect(opened.variant.id).toBe(saved.id);
  expect(inspect).toHaveBeenCalledTimes(1);
  expect(
    await readFile(await files.file(opened.workspaceId, "source.mp4")),
  ).toEqual(bytes);
  const repeated = await library.publish(
    publication(),
    { id: opened.workspaceId, source: opened.source },
    files,
  );
  expect(repeated.id).toBe(saved.id);
  expect((await lstat(master)).mtimeMs).toBe(before.mtimeMs);
  expect((await readdir(join(storage, "Sources"))).sort()).toEqual(
    [`${saved.id}.source.json`, `${saved.actual.fingerprint}.mp4`].sort(),
  );
  expect(await library.usage()).toEqual({
    bytes: bytes.length,
    warning: false,
  });
});

it("reports missing/damaged masters offline, never overwrites damage, and locates only bytes matching the frozen fingerprint", async () => {
  const original = await workspace(),
    saved = await library.publish(publication(), original, files);
  const master = join(storage, "Sources", `${saved.actual.fingerprint}.mp4`),
    inspect = inspector();
  const damaged = Buffer.alloc(bytes.length, 1);
  await writeFile(master, damaged);
  expect((await library.list())[0]!.state).toBe("damaged");
  await expect(library.open(saved.id, files, inspect)).rejects.toThrow(
    "owner_source_damaged",
  );
  await expect(
    library.locate(saved.id, original.id, files, inspect),
  ).rejects.toThrow("owner_source_damaged");
  expect(await readFile(master)).toEqual(damaged);
  await rm(master);
  expect((await library.list())[0]!.state).toBe("missing");
  const wrong = await workspace(Buffer.from("different synthetic source"));
  await expect(
    library.locate(saved.id, wrong.id, files, inspect),
  ).rejects.toThrow("owner_source_damaged");
  expect(inspect).toHaveBeenCalledTimes(1);
  expect((await library.locate(saved.id, original.id, files, inspect)).id).toBe(
    saved.id,
  );
  expect(await readFile(master)).toEqual(bytes);
  expect((await library.list())[0]!.state).toBe("ready");
});

it("isolates unsupported/failed variants and native revalidation failure without deleting a completed source", async () => {
  const original = await workspace(),
    saved = await library.publish(publication(), original, files);
  const hdr = publication("bbbbbbbbbbb");
  hdr.video.dynamicRange = "hdr";
  await expect(library.publish(hdr, original, files)).rejects.toThrow(
    "owner_source_unsupported",
  );
  const before = await readdir(scratch);
  await expect(
    library.open(saved.id, files, async () => {
      throw new Error("native_unavailable");
    }),
  ).rejects.toThrow("owner_source_unavailable");
  expect(await readdir(scratch)).toEqual(before);
  await expect(
    library.open(saved.id, files, async () => ({
      ...original.source,
      width: 1280,
    })),
  ).rejects.toThrow("owner_source_damaged");
  expect(await readdir(scratch)).toEqual(before);
  expect((await library.list()).map((item) => item.id)).toEqual([saved.id]);
  expect(
    await readFile(join(storage, "Sources", `${saved.actual.fingerprint}.mp4`)),
  ).toEqual(bytes);
});

it("refuses draft references, preserves a master shared by another variant, and drains an active reader before targeted deletion", async () => {
  const original = await workspace(),
    first = await library.publish(publication(), original, files),
    second = await library.publish(publication("bbbbbbbbbbb"), original, files);
  const draftStore = new OwnerDraftStore(storage);
  const draft = await draftStore.save(
    undefined,
    {
      version: 1,
      workspace: { ...original, mode: "synthetic-ai", revision: 0 },
      analysis: null,
      clips: [],
    },
    files,
  );
  await expect(library.delete(first.id)).rejects.toThrow(
    "owner_source_referenced",
  );
  expect(await library.list()).toHaveLength(2);
  await draftStore.delete(draft.id);
  await library.delete(first.id);
  const master = join(storage, "Sources", `${second.actual.fingerprint}.mp4`);
  expect(await readFile(master)).toEqual(bytes);
  expect((await library.list()).map((item) => item.id)).toEqual([second.id]);
  let entered!: () => void, release!: () => void;
  const started = new Promise<void>((done) => {
      entered = done;
    }),
    held = new Promise<void>((done) => {
      release = done;
    });
  const opened = library.open(second.id, files, async () => {
    entered();
    await held;
    return original.source;
  });
  await started;
  const deleting = library.delete(second.id);
  await Promise.resolve();
  expect(await exists(master)).toBe(true);
  release();
  const copied = await opened;
  await deleting;
  expect(await library.list()).toEqual([]);
  expect(await exists(master)).toBe(false);
  expect(
    await readFile(await files.file(copied.workspaceId, "source.mp4")),
  ).toEqual(bytes);
});

it("drains cancellation of a blocked publication stream and queued operations, removes partials and preserves the original workspace", async () => {
  const original = await workspace(),
    source = await files.file(original.id, "source.mp4"),
    actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  let reads = 0,
    entered!: () => void,
    blocked: ReturnType<typeof createReadStream> | undefined;
  const started = new Promise<void>((done) => {
    entered = done;
  });
  vi.mocked(createReadStream).mockImplementation((path, options) => {
    const stream = actual.createReadStream(path, options);
    if (path === source && ++reads === 2) {
      blocked = stream;
      vi.spyOn(stream, "_read").mockImplementation(() => {
        entered();
      });
    }
    return stream;
  });
  const publishing = library.publish(publication(), original, files),
    queued = library.list();
  const results = Promise.allSettled([publishing, queued]);
  await started;
  await library.cancelPending();
  expect((await results).map((result) => result.status)).toEqual([
    "rejected",
    "rejected",
  ]);
  expect(blocked?.destroyed).toBe(true);
  expect(await readdir(join(storage, "Sources"))).toEqual([]);
  expect(await readFile(source)).toEqual(bytes);
  vi.mocked(createReadStream).mockImplementation(actual.createReadStream);
  const saved = await library.publish(publication(), original, files);
  expect((await library.open(saved.id, files, inspector())).variant.id).toBe(
    saved.id,
  );
});

it("rejects junction escapes, linked masters and malformed sidecars without following or deleting outside files", async () => {
  const original = await workspace(),
    saved = await library.publish(publication(), original, files),
    source = join(storage, "Sources", `${saved.actual.fingerprint}.mp4`),
    outside = join(directory, "outside.mp4");
  await link(source, outside);
  expect((await library.list())[0]!.state).toBe("damaged");
  await expect(library.open(saved.id, files, inspector())).rejects.toThrow();
  await expect(library.delete(saved.id)).rejects.toThrow();
  expect(await readFile(outside)).toEqual(bytes);
  await rm(outside);
  const sidecar = join(storage, "Sources", `${saved.id}.source.json`),
    record = JSON.parse(await readFile(sidecar, "utf8"));
  await writeFile(sidecar, JSON.stringify({ ...record, sourcePath: outside }));
  expect(await library.list()).toEqual([]);
  await expect(library.open(saved.id, files, inspector())).rejects.toThrow();
  expect(await readFile(source)).toEqual(bytes);
  const elsewhere = join(directory, "elsewhere"),
    linkedRoot = join(directory, "linked-root");
  await mkdir(elsewhere);
  await symlink(elsewhere, linkedRoot, "junction");
  await expect(
    new OwnerSourceLibrary(linkedRoot).publish(publication(), original, files),
  ).rejects.toThrow();
  expect(await readdir(elsewhere)).toEqual([]);
});
