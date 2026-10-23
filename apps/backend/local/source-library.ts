import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { link, lstat, open, readdir, rm } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
import {
  OWNER_ACQUISITION_LIMITS,
  ownerSavedSourceVariantSchema,
  ownerYoutubeVideoIdSchema,
  type OwnerSavedSourceVariant,
} from "../../../packages/contracts/local/acquisition.ts";
import {
  ownerSourceSchema,
  type OwnerSource,
} from "../../../packages/contracts/local/index.ts";
import { ownerDraftSnapshotSchema } from "../../../packages/contracts/local/drafts.ts";
import {
  OWNER_LIMITS,
  ownerIdSchema,
} from "../../../packages/contracts/local/policy.ts";
import { ownerDigestSchema } from "../../../packages/contracts/local/assets.ts";
import { prepareOwnerStorage } from "./owner-storage.ts";
import { ownerYoutubeSourceId } from "./youtube-url.ts";
import { ownerYoutubeChoiceDescriptor } from "./youtube-formats.ts";
import {
  confinedPath,
  requireDisk,
  type WorkspaceFiles,
} from "./workspace-files.ts";

const MAX_SIDECAR = 16 * 1024;
const MAX_DRAFT = 32 * 1024 ** 2;
const toolsSchema = z
  .object({
    downloader: z.enum(["synthetic", "2026.10.21"]),
    challenge: z.enum(["synthetic", "2.9.8"]),
    ffmpeg: z.literal("9.0.2"),
  })
  .strict();
const publicationSchema = ownerSavedSourceVariantSchema
  .pick({ mode: true, selection: true, video: true, audio: true })
  .extend({
    videoId: ownerYoutubeVideoIdSchema,
    acquiredAt: z.string().datetime().optional(),
    tools: toolsSchema.optional(),
  })
  .strict();
export type OwnerSourcePublication = z.infer<typeof publicationSchema>;
const recordSchema = z
  .object({
    version: z.literal(1),
    videoId: ownerYoutubeVideoIdSchema,
    variant: ownerSavedSourceVariantSchema,
    tools: toolsSchema,
  })
  .strict()
  .refine(
    (record) =>
      record.variant.state === "ready" &&
      record.variant.sourceId === ownerYoutubeSourceId(record.videoId) &&
      (record.variant.mode === "synthetic-source"
        ? record.tools.downloader === "synthetic" &&
          record.tools.challenge === "synthetic"
        : record.tools.downloader === "2026.10.21" &&
          record.tools.challenge === "2.9.8"),
  );
type SourceRecord = z.infer<typeof recordSchema>;
type Inspector = (
  workspaceId: string,
  signal: AbortSignal,
) => Promise<OwnerSource>;
type Verified = { identity: string; fingerprint: string; bytes: number };
const error = (code: string) => new Error(`owner_source_${code}`);
const missing = (cause: unknown) =>
  cause instanceof Error && "code" in cause && cause.code === "ENOENT";
const sameSource = (first: OwnerSource, second: OwnerSource) =>
  JSON.stringify(ownerSourceSchema.parse(first)) ===
  JSON.stringify(ownerSourceSchema.parse(second));

async function mediaFile(path: string) {
  const info = await lstat(path, { bigint: true });
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.nlink !== 1n ||
    info.size <= 0n ||
    info.size > BigInt(OWNER_LIMITS.sourceBytes)
  )
    throw error("damaged");
  return {
    bytes: Number(info.size),
    identity: `${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`,
  };
}
async function hashMedia(
  path: string,
  signal: AbortSignal,
  cache?: Map<string, Verified>,
) {
  signal.throwIfAborted();
  const before = await mediaFile(path),
    known = cache?.get(path);
  if (known?.identity === before.identity) return known;
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of createReadStream(path, { signal })) {
    signal.throwIfAborted();
    bytes += chunk.length;
    if (bytes > before.bytes) throw error("damaged");
    hash.update(chunk);
  }
  const after = await mediaFile(path);
  if (before.identity !== after.identity || bytes !== before.bytes)
    throw error("damaged");
  const value = { ...before, fingerprint: hash.digest("hex") };
  cache?.set(path, value);
  return value;
}
async function verifyMedia(
  path: string,
  source: OwnerSource,
  signal: AbortSignal,
  cache?: Map<string, Verified>,
) {
  const actual = await hashMedia(path, signal, cache);
  if (
    actual.bytes !== source.bytes ||
    actual.fingerprint !== source.fingerprint
  )
    throw error("damaged");
}
async function readJson(
  path: string,
  maximum: number,
  signal: AbortSignal,
): Promise<unknown> {
  signal.throwIfAborted();
  const info = await lstat(path);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.nlink !== 1 ||
    info.size < 2 ||
    info.size > maximum
  )
    throw error("invalid");
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of createReadStream(path, { signal })) {
    signal.throwIfAborted();
    length += chunk.length;
    if (length > maximum) throw error("invalid");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks, length).toString("utf8"));
}

/** A temporary hardlink publishes atomically without replacing any existing file. */
async function publishExclusive(
  temporary: string,
  target: string,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  await link(temporary, target);
  // Leave a single-link immutable master after publication; no shared writable alias persists.
  await rm(temporary);
}
async function copyMaster(
  from: string,
  to: string,
  source: OwnerSource,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const temporary = `${to}.${randomUUID()}.partial`;
  try {
    const hash = createHash("sha256");
    let bytes = 0;
    await pipeline(
      createReadStream(from, { signal }),
      new Transform({
        transform(chunk: Buffer, _encoding, done) {
          if (signal.aborted) {
            done(error("canceled"));
            return;
          }
          bytes += chunk.length;
          if (bytes > source.bytes) {
            done(error("damaged"));
            return;
          }
          hash.update(chunk);
          done(null, chunk);
        },
      }),
      createWriteStream(temporary, { flags: "wx", mode: 0o600 }),
      { signal },
    );
    if (bytes !== source.bytes || hash.digest("hex") !== source.fingerprint)
      throw error("damaged");
    const handle = await open(temporary, "r+");
    try {
      await handle.sync();
    } finally {
      await handle.close();
    }
    await publishExclusive(temporary, to, signal);
  } finally {
    await rm(temporary, { force: true });
  }
}
async function publishRecord(
  path: string,
  record: SourceRecord,
  signal: AbortSignal,
) {
  const bytes = JSON.stringify(record);
  if (Buffer.byteLength(bytes) > MAX_SIDECAR) throw error("invalid");
  const temporary = `${path}.${randomUUID()}.partial`;
  try {
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(bytes, { signal });
      await handle.sync();
    } finally {
      await handle.close();
    }
    await publishExclusive(temporary, path, signal);
  } finally {
    await rm(temporary, { force: true });
  }
}
function supported(variant: OwnerSavedSourceVariant) {
  const { video, audio, actual, selection } = variant;
  try {
    ownerYoutubeChoiceDescriptor(
      { durationMs: actual.durationMs },
      { video, audio },
    );
    return (
      video.width === actual.width &&
      video.height === actual.height &&
      Math.abs(video.fps - actual.fps) <= 0.001 &&
      (selection.kind !== "tier" ||
        selection.tier === Math.min(actual.width, actual.height))
    );
  } catch {
    return false;
  }
}

/** Serialized durable masters/sidecars, independent of workspace, AI and download lifetime. */
export class OwnerSourceLibrary {
  readonly root: string;
  private tail: Promise<unknown> = Promise.resolve();
  private controller = new AbortController();
  private readonly verified = new Map<string, Verified>();
  constructor(root: string) {
    if (!isAbsolute(root)) throw error("invalid");
    this.root = resolve(root);
  }
  private serial<T>(
    action: (signal: AbortSignal) => Promise<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    const epoch = signal
      ? AbortSignal.any([this.controller.signal, signal])
      : this.controller.signal;
    const result = this.tail.then(async () => {
      try {
        epoch.throwIfAborted();
        return await action(epoch);
      } catch (cause) {
        if (epoch.aborted) throw error("canceled");
        if (
          cause instanceof Error &&
          /^owner_source_[a-z_]+$/u.test(cause.message)
        )
          throw cause;
        throw error("unavailable");
      }
    });
    this.tail = result.catch(() => undefined);
    return result;
  }
  async cancelPending() {
    const pending = this.tail;
    this.controller.abort();
    this.controller = new AbortController();
    await pending;
  }
  private async sourcePath(fingerprint: string) {
    ownerDigestSchema.parse(fingerprint);
    return confinedPath(this.root, "Sources", `${fingerprint}.mp4`);
  }
  private async sidecarPath(id: string) {
    ownerIdSchema.parse(id);
    return confinedPath(this.root, "Sources", `${id}.source.json`);
  }
  private async read(id: string, signal: AbortSignal): Promise<SourceRecord> {
    const record = recordSchema.parse(
      await readJson(await this.sidecarPath(id), MAX_SIDECAR, signal),
    );
    if (record.variant.id !== id) throw error("invalid");
    return record;
  }
  private async ids(signal: AbortSignal): Promise<string[]> {
    signal.throwIfAborted();
    if (!(await prepareOwnerStorage(this.root))) return [];
    try {
      const entries = await readdir(await confinedPath(this.root, "Sources"), {
        withFileTypes: true,
      });
      const ids: string[] = [];
      for (const entry of entries) {
        signal.throwIfAborted();
        if (!entry.name.endsWith(".source.json")) continue;
        const id = entry.name.slice(0, -".source.json".length);
        if (!ownerIdSchema.safeParse(id).success) continue;
        if (!entry.isFile() || entry.isSymbolicLink()) throw error("invalid");
        ids.push(id);
        if (ids.length > OWNER_ACQUISITION_LIMITS.catalogRecords)
          throw error("limit");
      }
      return ids;
    } catch (cause) {
      if (missing(cause)) return [];
      throw cause;
    }
  }
  private async state(
    record: SourceRecord,
    signal: AbortSignal,
  ): Promise<OwnerSavedSourceVariant> {
    let state: OwnerSavedSourceVariant["state"] = supported(record.variant)
      ? "ready"
      : "unsupported";
    if (state === "ready") {
      try {
        await verifyMedia(
          await this.sourcePath(record.variant.actual.fingerprint),
          record.variant.actual,
          signal,
          this.verified,
        );
      } catch (cause) {
        signal.throwIfAborted();
        state = missing(cause) ? "missing" : "damaged";
      }
    }
    return ownerSavedSourceVariantSchema.parse({ ...record.variant, state });
  }
  list(
    videoId?: string,
    signal?: AbortSignal,
  ): Promise<OwnerSavedSourceVariant[]> {
    if (videoId !== undefined) ownerYoutubeVideoIdSchema.parse(videoId);
    return this.serial(async (current) => {
      const result: OwnerSavedSourceVariant[] = [];
      for (const id of await this.ids(current)) {
        try {
          const record = await this.read(id, current);
          if (videoId === undefined || record.videoId === videoId)
            result.push(await this.state(record, current));
        } catch {
          current.throwIfAborted(); /* A malformed sidecar is never eligible for use. */
        }
      }
      return result.sort((first, second) =>
        second.acquiredAt.localeCompare(first.acquiredAt),
      );
    }, signal);
  }
  usage(signal?: AbortSignal): Promise<{ bytes: number; warning: boolean }> {
    return this.serial(async (current) => {
      current.throwIfAborted();
      if (!(await prepareOwnerStorage(this.root)))
        return { bytes: 0, warning: false };
      let bytes = 0;
      try {
        for (const entry of await readdir(
          await confinedPath(this.root, "Sources"),
        )) {
          current.throwIfAborted();
          if (!/^[a-f0-9]{64}\.mp4$/u.test(entry)) continue;
          const file = await lstat(
            await confinedPath(this.root, "Sources", entry),
          );
          if (
            !file.isFile() ||
            file.isSymbolicLink() ||
            file.nlink !== 1 ||
            !Number.isSafeInteger(file.size)
          )
            throw error("invalid");
          bytes += file.size;
        }
      } catch (cause) {
        if (!missing(cause)) throw cause;
      }
      return { bytes, warning: bytes >= OWNER_LIMITS.libraryWarningBytes };
    }, signal);
  }
  publish(
    input: OwnerSourcePublication,
    workspace: { id: string; source: OwnerSource },
    files: WorkspaceFiles,
    signal?: AbortSignal,
  ): Promise<OwnerSavedSourceVariant> {
    const value = publicationSchema.parse(input),
      source = ownerSourceSchema.parse(workspace.source),
      workspaceId = ownerIdSchema.parse(workspace.id);
    return this.serial(async (current) => {
      const from = await files.file(workspaceId, "source.mp4");
      await verifyMedia(from, source, current, this.verified);
      const variant = ownerSavedSourceVariantSchema.parse({
        id: randomUUID(),
        sourceId: ownerYoutubeSourceId(value.videoId),
        mode: value.mode,
        acquiredAt: value.acquiredAt ?? new Date().toISOString(),
        selection: value.selection,
        video: value.video,
        audio: value.audio,
        actual: source,
        offsetMs: 0,
        state: "ready",
      });
      if (!supported(variant)) throw error("unsupported");
      const tools =
        value.tools ??
        (value.mode === "synthetic-source"
          ? { downloader: "synthetic", challenge: "synthetic", ffmpeg: "9.0.2" }
          : undefined);
      const record = recordSchema.parse({
        version: 1,
        videoId: value.videoId,
        variant,
        tools,
      });
      const ids = await this.ids(current);
      for (const id of ids) {
        const existing = await this.read(id, current);
        if (
          existing.videoId === record.videoId &&
          existing.variant.mode === variant.mode &&
          existing.variant.actual.fingerprint === source.fingerprint &&
          JSON.stringify(existing.variant.video) ===
            JSON.stringify(variant.video) &&
          JSON.stringify(existing.variant.audio) ===
            JSON.stringify(variant.audio)
        ) {
          const saved = await this.state(existing, current);
          if (saved.state !== "ready") throw error(saved.state);
          return saved;
        }
      }
      if (ids.length >= OWNER_ACQUISITION_LIMITS.catalogRecords)
        throw error("limit");
      await prepareOwnerStorage(this.root, true);
      await prepareOwnerStorage(await confinedPath(this.root, "Sources"), true);
      const target = await this.sourcePath(source.fingerprint);
      let copyBytes = 0;
      try {
        await verifyMedia(target, source, current, this.verified);
      } catch (cause) {
        if (!missing(cause)) throw cause;
        copyBytes = source.bytes;
      }
      if (source.bytes + copyBytes + MAX_SIDECAR > OWNER_LIMITS.scratchBytes)
        throw error("capacity");
      await requireDisk(files.root, 0);
      await requireDisk(this.root, copyBytes + MAX_SIDECAR);
      current.throwIfAborted();
      if (copyBytes) await copyMaster(from, target, source, current);
      await verifyMedia(target, source, current, this.verified);
      await publishRecord(await this.sidecarPath(variant.id), record, current);
      return variant;
    }, signal);
  }
  open(
    id: string,
    files: WorkspaceFiles,
    inspect: Inspector,
    signal?: AbortSignal,
  ): Promise<{
    workspaceId: string;
    source: OwnerSource;
    variant: OwnerSavedSourceVariant;
  }> {
    ownerIdSchema.parse(id);
    return this.serial(async (current) => {
      if (!(await prepareOwnerStorage(this.root))) throw error("missing");
      const record = await this.read(id, current);
      if (!supported(record.variant)) throw error("unsupported");
      // Explicit use validates bytes afresh, rather than trusting list or restart metadata.
      this.verified.clear();
      const from = await this.sourcePath(record.variant.actual.fingerprint);
      await verifyMedia(from, record.variant.actual, current, this.verified);
      await requireDisk(files.root, record.variant.actual.bytes);
      const workspaceId = await files.create();
      try {
        await copyMaster(
          from,
          await files.file(workspaceId, "source.mp4"),
          record.variant.actual,
          current,
        );
        const source = ownerSourceSchema.parse(
          await inspect(workspaceId, current),
        );
        current.throwIfAborted();
        if (!sameSource(source, record.variant.actual)) throw error("damaged");
        return { workspaceId, source, variant: record.variant };
      } catch (cause) {
        await files.remove(workspaceId);
        throw cause;
      }
    }, signal);
  }
  locate(
    id: string,
    workspaceId: string,
    files: WorkspaceFiles,
    inspect: Inspector,
    signal?: AbortSignal,
  ): Promise<OwnerSavedSourceVariant> {
    ownerIdSchema.parse(id);
    ownerIdSchema.parse(workspaceId);
    return this.serial(async (current) => {
      if (!(await prepareOwnerStorage(this.root))) throw error("missing");
      const record = await this.read(id, current);
      if (!supported(record.variant)) throw error("unsupported");
      const from = await files.file(workspaceId, "source.mp4");
      await verifyMedia(from, record.variant.actual, current);
      const source = ownerSourceSchema.parse(
        await inspect(workspaceId, current),
      );
      if (!sameSource(source, record.variant.actual)) throw error("damaged");
      const target = await this.sourcePath(source.fingerprint);
      try {
        await verifyMedia(target, source, current);
      } catch (cause) {
        if (!missing(cause)) throw cause;
        if (source.bytes * 2 + MAX_SIDECAR > OWNER_LIMITS.scratchBytes)
          throw error("capacity");
        await requireDisk(this.root, source.bytes + MAX_SIDECAR);
        await requireDisk(files.root, 0);
        await copyMaster(from, target, source, current);
      }
      current.throwIfAborted();
      return record.variant;
    }, signal);
  }
  private async draftReferences(
    fingerprint: string,
    signal: AbortSignal,
  ): Promise<boolean> {
    const path = await confinedPath(this.root, "Drafts");
    let entries;
    try {
      entries = await readdir(path, { withFileTypes: true });
    } catch (cause) {
      if (missing(cause)) return false;
      throw cause;
    }
    for (const entry of entries) {
      signal.throwIfAborted();
      if (!ownerIdSchema.safeParse(entry.name).success) continue;
      if (!entry.isDirectory() || entry.isSymbolicLink()) return true;
      let seen = false;
      for (const name of ["draft.json", "backup.json"]) {
        try {
          const value = z
            .object({
              version: z.literal(1),
              id: ownerIdSchema,
              source: z.object({ digest: ownerDigestSchema }),
              snapshot: ownerDraftSnapshotSchema,
            })
            .passthrough()
            .parse(
              await readJson(
                await confinedPath(this.root, "Drafts", entry.name, name),
                MAX_DRAFT,
                signal,
              ),
            );
          if (
            value.id !== entry.name ||
            value.source.digest !== value.snapshot.workspace.source.fingerprint
          )
            return true;
          seen = true;
          if (value.source.digest === fingerprint) return true;
        } catch (cause) {
          signal.throwIfAborted();
          if (!missing(cause)) return true;
        }
      }
      if (!seen) return true;
    }
    return false;
  }
  delete(id: string, signal?: AbortSignal): Promise<void> {
    ownerIdSchema.parse(id);
    return this.serial(async (current) => {
      if (!(await prepareOwnerStorage(this.root))) return;
      const record = await this.read(id, current),
        fingerprint = record.variant.actual.fingerprint;
      if (await this.draftReferences(fingerprint, current))
        throw error("referenced");
      let shared = false;
      for (const other of await this.ids(current)) {
        if (other === id) continue;
        try {
          if (
            (await this.read(other, current)).variant.actual.fingerprint ===
            fingerprint
          )
            shared = true;
        } catch {
          current.throwIfAborted();
          shared = true;
        }
      }
      current.throwIfAborted();
      if (!shared) {
        const target = await this.sourcePath(fingerprint);
        try {
          const file = await lstat(target);
          if (!file.isFile() || file.isSymbolicLink() || file.nlink !== 1)
            throw error("invalid");
          await rm(target);
        } catch (cause) {
          if (!missing(cause)) throw cause;
        }
      }
      await rm(await this.sidecarPath(id));
      this.verified.clear();
    }, signal);
  }
}
