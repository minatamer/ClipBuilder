import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { lstat, mkdir, open, readdir, rename, rm } from "node:fs/promises";
import { isAbsolute, parse, relative, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { z } from "zod";
import {
  ownerDraftSnapshotSchema,
  ownerDraftSummarySchema,
  type OwnerDraftSnapshot,
} from "../../../packages/contracts/owner/drafts.ts";
import {
  OWNER_LIMITS,
  ownerIdSchema,
} from "../../../packages/contracts/owner/policy.ts";
import { ownerDigestSchema } from "../../../packages/contracts/owner/assets.ts";
import {
  confinedPath,
  requireDisk,
  type WorkspaceFiles,
} from "./workspace-files.ts";
import { rejectRepositoryStorage } from "./owner-storage.ts";

export type OwnerDraftSummary = z.infer<typeof ownerDraftSummarySchema>;
const MAX_DOCUMENT_BYTES = 32 * 1024 ** 2;
const fileSchema = z
  .object({
    digest: ownerDigestSchema,
    bytes: z.number().int().positive().max(OWNER_LIMITS.sourceBytes),
  })
  .strict();
type StoredFile = z.infer<typeof fileSchema>;
type FileCache = Map<string, { identity: string; file: StoredFile }>;
const assetFileSchema = fileSchema.extend({ id: ownerIdSchema }).strict();
const rawFileSchema = fileSchema.extend({ clipId: ownerIdSchema }).strict();
const outputFileSchema = fileSchema
  .extend({
    clipId: ownerIdSchema,
    revision: z.number().int().min(0).max(19),
    id: ownerDigestSchema,
  })
  .strict();
const recordSchema = z
  .object({
    version: z.literal(1),
    id: ownerIdSchema,
    savedAt: z.string().datetime(),
    snapshot: ownerDraftSnapshotSchema,
    source: fileSchema,
    assets: z.array(assetFileSchema).max(200),
    raw: z.array(rawFileSchema).max(OWNER_LIMITS.clips),
    outputs: z.array(outputFileSchema).max(200),
  })
  .strict();
type DraftRecord = z.infer<typeof recordSchema>;
type Copy = { from: string; to: string; file: StoredFile };
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const missing = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

async function regularFile(path: string): Promise<number> {
  const info = await lstat(path);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.size < 1 ||
    info.size > OWNER_LIMITS.sourceBytes
  )
    throw new Error("draft_file_invalid");
  return info.size;
}

/** Stream hashes and copies; hour-long source media never enters a JS buffer. */
async function inspectFile(
  path: string,
  signal: AbortSignal,
  cache?: FileCache,
): Promise<StoredFile> {
  signal.throwIfAborted();
  const bytes = await regularFile(path);
  const before = await lstat(path, { bigint: true });
  const identity = `${before.dev}:${before.ino}:${before.size}:${before.mtimeNs}:${before.ctimeNs}`;
  const verified = cache?.get(path);
  if (verified?.identity === identity) return { ...verified.file };
  const hash = createHash("sha256");
  let actual = 0;
  for await (const chunk of createReadStream(path, { signal })) {
    signal.throwIfAborted();
    actual += chunk.length;
    if (actual > bytes) throw new Error("draft_file_changed");
    hash.update(chunk);
  }
  const after = await lstat(path, { bigint: true });
  if (
    actual !== bytes ||
    identity !==
      `${after.dev}:${after.ino}:${after.size}:${after.mtimeNs}:${after.ctimeNs}`
  )
    throw new Error("draft_file_changed");
  const file = { bytes, digest: hash.digest("hex") };
  cache?.set(path, { identity, file });
  return file;
}
async function verifyFile(
  path: string,
  file: StoredFile,
  signal: AbortSignal,
  cache?: FileCache,
): Promise<void> {
  const actual = await inspectFile(path, signal, cache);
  if (actual.bytes !== file.bytes || actual.digest !== file.digest)
    throw new Error("draft_file_damaged");
}

async function readDocument(
  path: string,
  signal: AbortSignal,
): Promise<unknown> {
  signal.throwIfAborted();
  if ((await regularFile(path)) > MAX_DOCUMENT_BYTES)
    throw new Error("draft_document_large");
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of createReadStream(path, { signal })) {
    signal.throwIfAborted();
    bytes += chunk.length;
    if (bytes > MAX_DOCUMENT_BYTES) throw new Error("draft_document_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks, bytes).toString("utf8"));
}

/** Reject links in every ancestor before creating even the first storage folder. */
async function ensureDirectory(
  directory: string,
  signal: AbortSignal,
): Promise<void> {
  const full = resolve(directory);
  let cursor = parse(full).root;
  for (const part of relative(cursor, full).split(sep).filter(Boolean)) {
    signal.throwIfAborted();
    cursor = resolve(cursor, part);
    try {
      await mkdir(cursor, { mode: 0o700 });
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ))
        throw error;
    }
    const info = await lstat(cursor);
    if (!info.isDirectory() || info.isSymbolicLink())
      throw new Error("invalid_path");
  }
}

async function atomicJson(
  path: string,
  value: unknown,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted();
  const json = JSON.stringify(value);
  if (Buffer.byteLength(json) > MAX_DOCUMENT_BYTES)
    throw new Error("draft_document_large");
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(json, { signal });
      signal.throwIfAborted();
      await handle.sync();
    } finally {
      await handle.close();
    }
    signal.throwIfAborted();
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}
async function copyImmutable(
  copy: Copy,
  signal: AbortSignal,
  cache?: FileCache,
): Promise<void> {
  signal.throwIfAborted();
  try {
    await verifyFile(copy.to, copy.file, signal, cache);
    return;
  } catch (error) {
    if (!missing(error)) throw error;
  }
  const temporary = `${copy.to}.${randomUUID()}.tmp`;
  try {
    const hash = createHash("sha256");
    let bytes = 0;
    await pipeline(
      createReadStream(copy.from, { signal }),
      new Transform({
        transform(chunk: Buffer, _encoding, done) {
          if (signal.aborted) {
            done(new Error("draft_canceled"));
            return;
          }
          bytes += chunk.length;
          if (bytes > copy.file.bytes) {
            done(new Error("draft_file_changed"));
            return;
          }
          hash.update(chunk);
          done(null, chunk);
        },
      }),
      createWriteStream(temporary, { flags: "wx", mode: 0o600 }),
      { signal },
    );
    if (bytes !== copy.file.bytes || hash.digest("hex") !== copy.file.digest)
      throw new Error("draft_file_changed");
    const handle = await open(temporary, "r+");
    try {
      await handle.sync();
    } finally {
      await handle.close();
    }
    // All store operations have one writer; an existing immutable file is never replaced.
    try {
      await lstat(copy.to);
      throw new Error("draft_file_conflict");
    } catch (error) {
      if (!missing(error)) throw error;
    }
    signal.throwIfAborted();
    await rename(temporary, copy.to);
    const info = await lstat(copy.to, { bigint: true });
    cache?.set(copy.to, {
      identity: `${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`,
      file: { ...copy.file },
    });
  } finally {
    await rm(temporary, { force: true });
  }
}

function validateRelations(record: DraftRecord): void {
  const { snapshot, source, assets, raw, outputs } = record;
  const workspace = snapshot.workspace;
  if (
    source.digest !== workspace.source.fingerprint ||
    source.bytes !== workspace.source.bytes ||
    new Set(snapshot.clips.map((clip) => clip.id)).size !==
      snapshot.clips.length ||
    new Set(assets.map((asset) => asset.id)).size !== assets.length ||
    new Set(raw.map((file) => file.clipId)).size !== raw.length ||
    new Set(outputs.map((file) => file.id)).size !== outputs.length
  )
    throw new Error("draft_document_invalid");
  const admitted = new Map(assets.map((asset) => [asset.id, asset]));
  const expectedAssets = new Map<
    string,
    OwnerDraftSnapshot["clips"][number]["assets"][number]
  >();
  for (const clip of snapshot.clips) {
    if (
      new Set(clip.assets.map((asset) => asset.id)).size !== clip.assets.length
    )
      throw new Error("draft_document_invalid");
    for (const asset of clip.assets) {
      const prior = expectedAssets.get(asset.id);
      if (prior && JSON.stringify(prior) !== JSON.stringify(asset))
        throw new Error("draft_document_invalid");
      expectedAssets.set(asset.id, asset);
    }
  }
  if (admitted.size !== expectedAssets.size)
    throw new Error("draft_document_invalid");
  for (const [id, asset] of expectedAssets) {
    const stored = admitted.get(id);
    if (
      !stored ||
      stored.digest !== asset.digest ||
      stored.bytes !== asset.bytes
    )
      throw new Error("draft_document_invalid");
  }
  for (const clip of snapshot.clips) {
    if (
      (clip.base === null) !== (clip.baseHash === null) ||
      new Set(clip.outputs.map((output) => output.revision)).size !==
        clip.outputs.length ||
      clip.outputs.some(
        (output) =>
          !clip.base ||
          output.frames !== clip.base.overlay.frames ||
          output.editRevision > clip.revision,
      )
    )
      throw new Error("draft_document_invalid");
    if (
      clip.sourceRevision !== workspace.revision ||
      (clip.base &&
        (clip.base.fingerprint !== source.digest ||
          clip.baseHash !== digest(clip.base) ||
          clip.base.sourceRevision !== workspace.revision ||
          clip.base.momentId !== clip.momentId ||
          clip.base.analysisId !== clip.analysisId))
    )
      throw new Error("draft_document_invalid");
    if (
      clip.edit &&
      (clip.edit.clipId !== clip.id ||
        clip.edit.baseHash !== clip.baseHash ||
        clip.edit.fingerprint !== source.digest ||
        clip.edit.revision !== clip.revision)
    )
      throw new Error("draft_document_invalid");
    for (const cue of clip.base?.overlay.visuals ?? []) {
      if (
        !clip.assets.some(
          (asset) => asset.id === cue.assetId && asset.digest === cue.digest,
        )
      )
        throw new Error("draft_document_invalid");
    }
    for (const cue of clip.edit?.visuals ?? []) {
      if (!clip.assets.some((asset) => asset.id === cue.assetId))
        throw new Error("draft_document_invalid");
    }
    for (const output of clip.outputs) {
      if (
        !outputs.some(
          (file) =>
            file.clipId === clip.id &&
            file.id === output.id &&
            file.revision === output.revision &&
            file.bytes === output.bytes,
        )
      )
        throw new Error("draft_document_invalid");
    }
  }
  if (
    outputs.length !==
      snapshot.clips.reduce((count, clip) => count + clip.outputs.length, 0) ||
    raw.some((file) => !snapshot.clips.some((clip) => clip.id === file.clipId))
  )
    throw new Error("draft_document_invalid");
  const analysis = snapshot.analysis;
  if (analysis && analysis.inputs.sourceRevision !== workspace.revision)
    throw new Error("draft_document_invalid");
}

/** Explicit save is the sole creator of persistent storage. All reads/writes drain together. */
export class OwnerDraftStore {
  private tail: Promise<unknown> = Promise.resolve();
  private controller = new AbortController();
  private readonly verified: FileCache = new Map();
  readonly root: string;
  constructor(root: string) {
    if (!isAbsolute(root)) throw new Error("invalid_path");
    this.root = resolve(root);
  }
  private serial<T>(
    operation: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const signal = this.controller.signal;
    const result = this.tail.then(() => {
      signal.throwIfAborted();
      return operation(signal);
    });
    this.tail = result.catch(() => undefined);
    return result;
  }
  async cancelPending(): Promise<void> {
    const pending = this.tail;
    this.controller.abort();
    this.controller = new AbortController();
    await pending;
  }
  private async rootExists(signal: AbortSignal): Promise<boolean> {
    signal.throwIfAborted();
    await rejectRepositoryStorage(this.root);
    try {
      let cursor = parse(this.root).root;
      for (const part of relative(cursor, this.root)
        .split(sep)
        .filter(Boolean)) {
        signal.throwIfAborted();
        cursor = resolve(cursor, part);
        const info = await lstat(cursor);
        if (!info.isDirectory() || info.isSymbolicLink())
          throw new Error("invalid_path");
      }
      return true;
    } catch (error) {
      if (missing(error)) return false;
      throw error;
    }
  }
  private async directory(id: string): Promise<string> {
    ownerIdSchema.parse(id);
    return confinedPath(this.root, "Drafts", id);
  }
  private async paths(
    record: DraftRecord,
  ): Promise<{ source: string; assets: Copy[]; raw: Copy[]; outputs: Copy[] }> {
    const directory = await this.directory(record.id);
    const entry = async (subdirectory: string, name: string) =>
      confinedPath(directory, subdirectory, name);
    return {
      source: await confinedPath(
        this.root,
        "Sources",
        `${record.source.digest}.mp4`,
      ),
      assets: await Promise.all(
        record.assets.map(async (file) => ({
          from: "",
          to: await entry("assets", `${file.id}.${file.digest}.jpg`),
          file,
        })),
      ),
      raw: await Promise.all(
        record.raw.map(async (file) => ({
          from: "",
          to: await entry("raw", `${file.clipId}.${file.digest}.mp4`),
          file,
        })),
      ),
      outputs: await Promise.all(
        record.outputs.map(async (file) => ({
          from: "",
          to: await confinedPath(this.root, "Exports", `${file.id}.mp4`),
          file,
        })),
      ),
    };
  }
  private async readRecord(
    id: string,
    signal: AbortSignal,
    verify = true,
  ): Promise<DraftRecord> {
    const directory = await this.directory(id);
    for (const name of ["draft.json", "backup.json"]) {
      try {
        const path = await confinedPath(directory, name);
        const record = recordSchema.parse(await readDocument(path, signal));
        if (record.id !== id) throw new Error("draft_document_invalid");
        validateRelations(record);
        if (verify) {
          const paths = await this.paths(record);
          await verifyFile(paths.source, record.source, signal, this.verified);
          for (const file of [...paths.assets, ...paths.raw, ...paths.outputs])
            await verifyFile(file.to, file.file, signal, this.verified);
        }
        return record;
      } catch {
        signal.throwIfAborted();
        /* A fully validated last-good document may recover an interrupted save. */
      }
    }
    throw new Error("draft_unavailable");
  }
  save(
    id: string | undefined,
    snapshot: OwnerDraftSnapshot,
    files: WorkspaceFiles,
  ): Promise<OwnerDraftSummary> {
    const frozen = ownerDraftSnapshotSchema.parse(snapshot);
    if (id !== undefined) ownerIdSchema.parse(id);
    return this.serial((signal) => this.write(id, frozen, files, signal));
  }
  private async write(
    id: string | undefined,
    snapshot: OwnerDraftSnapshot,
    files: WorkspaceFiles,
    signal: AbortSignal,
  ): Promise<OwnerDraftSummary> {
    const exists = await this.rootExists(signal);
    const previous = id
      ? exists
        ? await this.readRecord(id, signal)
        : undefined
      : undefined;
    if (id && !previous) throw new Error("draft_unavailable");
    if (!id && (await this.listIds(signal)).length >= 200)
      throw new Error("draft_limit");
    const sourcePath = await files.file(snapshot.workspace.id, "source.mp4");
    const source = await inspectFile(sourcePath, signal, this.verified);
    if (
      source.digest !== snapshot.workspace.source.fingerprint ||
      source.bytes !== snapshot.workspace.source.bytes
    )
      throw new Error("draft_source_changed");
    const assets = [
      ...new Map(
        snapshot.clips.flatMap((clip) =>
          clip.assets.map((asset) => [asset.id, asset] as const),
        ),
      ).values(),
    ].map((asset) => ({
      id: asset.id,
      digest: asset.digest,
      bytes: asset.bytes,
    }));
    const raw: DraftRecord["raw"] = [];
    const outputs: DraftRecord["outputs"] = [];
    for (const clip of snapshot.clips) {
      try {
        raw.push({
          clipId: clip.id,
          ...(await inspectFile(
            await files.clipSource(snapshot.workspace.id, clip.id),
            signal,
            this.verified,
          )),
        });
      } catch (error) {
        if (!missing(error)) throw error;
      }
      for (const output of clip.outputs) {
        const file = await inspectFile(
          await files.output(snapshot.workspace.id, clip.id, output.revision),
          signal,
          this.verified,
        );
        if (file.bytes !== output.bytes)
          throw new Error("draft_output_changed");
        outputs.push({
          ...file,
          clipId: clip.id,
          revision: output.revision,
          id: output.id,
        });
      }
    }
    const record = recordSchema.parse({
      version: 1,
      id: id ?? randomUUID(),
      savedAt: new Date().toISOString(),
      snapshot,
      source,
      assets,
      raw,
      outputs,
    });
    validateRelations(record);
    if (Buffer.byteLength(JSON.stringify(record)) > MAX_DOCUMENT_BYTES)
      throw new Error("draft_document_large");
    await ensureDirectory(this.root, signal);
    await rejectRepositoryStorage(await confinedPath(this.root, "Sources"));
    for (const name of ["Sources", "Drafts", "Exports"])
      await ensureDirectory(await confinedPath(this.root, name), signal);
    const directory = await this.directory(record.id);
    if (id) await ensureDirectory(directory, signal);
    else await mkdir(directory, { mode: 0o700 });
    try {
      for (const name of ["assets", "raw"])
        await ensureDirectory(await confinedPath(directory, name), signal);
      const paths = await this.paths(record);
      const copies: Copy[] = [
        { from: sourcePath, to: paths.source, file: source },
      ];
      for (let index = 0; index < assets.length; index++)
        copies.push({
          ...paths.assets[index]!,
          from: await files.asset(snapshot.workspace.id, assets[index]!.id),
        });
      for (let index = 0; index < raw.length; index++)
        copies.push({
          ...paths.raw[index]!,
          from: await files.clipSource(
            snapshot.workspace.id,
            raw[index]!.clipId,
          ),
        });
      for (let index = 0; index < outputs.length; index++)
        copies.push({
          ...paths.outputs[index]!,
          from: await files.output(
            snapshot.workspace.id,
            outputs[index]!.clipId,
            outputs[index]!.revision,
          ),
        });
      let bytes = 2 * MAX_DOCUMENT_BYTES;
      for (const copy of copies) {
        try {
          await verifyFile(copy.to, copy.file, signal, this.verified);
        } catch (error) {
          if (!missing(error)) throw error;
          bytes += copy.file.bytes;
        }
      }
      await requireDisk(this.root, bytes);
      for (const copy of copies)
        await copyImmutable(copy, signal, this.verified);
      if (previous)
        await atomicJson(
          await confinedPath(directory, "backup.json"),
          previous,
          signal,
        );
      await atomicJson(
        await confinedPath(directory, "draft.json"),
        record,
        signal,
      );
      return ownerDraftSummarySchema.parse({
        id: record.id,
        savedAt: record.savedAt,
        clips: snapshot.clips.length,
      });
    } catch (error) {
      // Only this newly created draft is scratch until its first document commits.
      // Source masters and immutable exports remain independent and are preserved.
      if (!id)
        await rm(await this.directory(record.id), {
          recursive: true,
          force: true,
        });
      throw error;
    }
  }
  private async listIds(signal: AbortSignal): Promise<string[]> {
    if (!(await this.rootExists(signal))) return [];
    try {
      const entries = await readdir(await confinedPath(this.root, "Drafts"), {
        withFileTypes: true,
      });
      const ids: string[] = [];
      for (const entry of entries) {
        if (!ownerIdSchema.safeParse(entry.name).success) continue;
        if (!entry.isDirectory() || entry.isSymbolicLink())
          throw new Error("invalid_path");
        ids.push(entry.name);
        if (ids.length > 200) throw new Error("draft_limit");
      }
      return ids;
    } catch (error) {
      if (missing(error)) return [];
      throw error;
    }
  }
  list(): Promise<OwnerDraftSummary[]> {
    return this.serial(async (signal) => {
      const summaries: OwnerDraftSummary[] = [];
      for (const id of await this.listIds(signal)) {
        try {
          const record = await this.readRecord(id, signal, false);
          summaries.push(
            ownerDraftSummarySchema.parse({
              id,
              savedAt: record.savedAt,
              clips: record.snapshot.clips.length,
            }),
          );
        } catch {
          signal.throwIfAborted();
          /* One damaged draft must not hide healthy siblings. */
        }
      }
      return summaries.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    });
  }
  load(id: string, files: WorkspaceFiles): Promise<OwnerDraftSnapshot> {
    ownerIdSchema.parse(id);
    return this.serial(async (signal) => {
      if (!(await this.rootExists(signal)))
        throw new Error("draft_unavailable");
      // Opening a draft revalidates all admitted bytes, even within the same process.
      this.verified.clear();
      const record = await this.readRecord(id, signal);
      const paths = await this.paths(record);
      await requireDisk(
        files.root,
        record.source.bytes +
          [...record.assets, ...record.raw, ...record.outputs].reduce(
            (total, file) => total + file.bytes,
            0,
          ),
      );
      const workspaceId = await files.create();
      try {
        const copies: Copy[] = [
          {
            from: paths.source,
            to: await files.file(workspaceId, "source.mp4"),
            file: record.source,
          },
        ];
        for (let index = 0; index < record.assets.length; index++)
          copies.push({
            from: paths.assets[index]!.to,
            to: await files.asset(workspaceId, record.assets[index]!.id),
            file: record.assets[index]!,
          });
        for (let index = 0; index < record.raw.length; index++)
          copies.push({
            from: paths.raw[index]!.to,
            to: await files.clipSource(workspaceId, record.raw[index]!.clipId),
            file: record.raw[index]!,
          });
        for (let index = 0; index < record.outputs.length; index++)
          copies.push({
            from: paths.outputs[index]!.to,
            to: await files.output(
              workspaceId,
              record.outputs[index]!.clipId,
              record.outputs[index]!.revision,
            ),
            file: record.outputs[index]!,
          });
        for (const copy of copies)
          await copyImmutable(copy, signal, this.verified);
        signal.throwIfAborted();
        const snapshot = record.snapshot;
        snapshot.workspace.id = workspaceId;
        for (const clip of snapshot.clips) {
          if (
            [
              "selected",
              "queued",
              "preparing",
              "rendering",
              "canceling",
            ].includes(clip.state)
          ) {
            clip.state = "canceled";
            clip.error = "canceled";
          }
        }
        return ownerDraftSnapshotSchema.parse(snapshot);
      } catch (error) {
        await files.remove(workspaceId);
        throw error;
      }
    });
  }
  delete(id: string): Promise<void> {
    ownerIdSchema.parse(id);
    return this.serial(async (signal) => {
      if (!(await this.rootExists(signal))) return;
      const directory = await this.directory(id);
      const inspect = async (path: string): Promise<void> => {
        for (const entry of await readdir(path, { withFileTypes: true })) {
          signal.throwIfAborted();
          if (entry.isSymbolicLink()) throw new Error("invalid_path");
          const child = await confinedPath(
            directory,
            relative(directory, resolve(path, entry.name)),
          );
          if (entry.isDirectory()) await inspect(child);
        }
      };
      try {
        await inspect(directory);
      } catch (error) {
        if (missing(error)) return;
        throw error;
      }
      signal.throwIfAborted();
      await rm(directory, { recursive: true, force: true });
    });
  }
}
