import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { mkdir, lstat, open, realpath, rm, statfs } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import {
  OWNER_LIMITS,
  OWNER_PROVIDER_MEDIA,
  ownerIdSchema,
} from "../../../packages/contracts/local/index.ts";
import { ownerOutputRevisionSchema } from "../../../packages/contracts/local/clips.ts";
import {
  ownerPictureFormatSchema,
  ownerPictureExtension,
  type OwnerPictureFormat,
} from "../../../packages/contracts/local/assets.ts";

export async function confinedPath(
  root: string,
  ...parts: string[]
): Promise<string> {
  const base = await realpath(root);
  const target = resolve(base, ...parts);
  const rel = relative(base, target);
  if (!rel || isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`))
    throw new Error("invalid_path");
  let cursor = base;
  for (const part of rel.split(sep)) {
    cursor = resolve(cursor, part);
    try {
      const info = await lstat(cursor);
      if (info.isSymbolicLink()) throw new Error("invalid_path");
      const actual = await realpath(cursor);
      const inside = relative(base, actual);
      if (
        isAbsolute(inside) ||
        inside === ".." ||
        inside.startsWith(`..${sep}`)
      )
        throw new Error("invalid_path");
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    }
  }
  return target;
}

export class WorkspaceFiles {
  private readonly ids = new Set<string>();
  constructor(readonly root: string) {}
  async create(): Promise<string> {
    const id = randomUUID();
    await mkdir(await confinedPath(this.root, id), { mode: 0o700 });
    this.ids.add(id);
    return id;
  }
  async file(id: string, name: "source.mp4" | "portrait.mp4"): Promise<string> {
    ownerIdSchema.parse(id);
    if (!this.ids.has(id)) throw new Error("workspace_missing");
    return confinedPath(this.root, id, name);
  }
  async asset(
    id: string,
    assetId: string,
    format: OwnerPictureFormat = "jpeg",
  ): Promise<string> {
    ownerIdSchema.parse(assetId);
    await this.file(id, "source.mp4");
    return confinedPath(
      this.root,
      id,
      `${assetId}.${ownerPictureExtension(ownerPictureFormatSchema.parse(format))}`,
    );
  }
  async output(id: string, clipId: string, revision: number): Promise<string> {
    ownerIdSchema.parse(clipId);
    ownerOutputRevisionSchema.parse(revision);
    await this.file(id, "source.mp4");
    return confinedPath(this.root, id, `${clipId}.r${revision}.mp4`);
  }
  async audio(id: string, assetId: string, input = false): Promise<string> {
    ownerIdSchema.parse(assetId);
    await this.file(id, "source.mp4");
    return confinedPath(
      this.root,
      id,
      `${assetId}.${input ? "audio-input" : "wav"}`,
    );
  }
  async clipSource(id: string, clipId: string): Promise<string> {
    ownerIdSchema.parse(clipId);
    await this.file(id, "source.mp4");
    return confinedPath(this.root, id, `${clipId}.source.mp4`);
  }
  async providerAudio(id: string, clipId?: string): Promise<string> {
    if (clipId) ownerIdSchema.parse(clipId);
    await this.file(id, "source.mp4");
    return confinedPath(
      this.root,
      id,
      clipId ? `${clipId}.provider.audio.m4a` : "provider.audio.m4a",
    );
  }
  async providerVideo(id: string, clipId: string): Promise<string> {
    ownerIdSchema.parse(clipId);
    await this.file(id, "source.mp4");
    return confinedPath(this.root, id, `${clipId}.provider.mp4`);
  }
  /** Only fixed, worker-prepared inputs with a matching bounded receipt leave disk. */
  async readProviderInput(
    id: string,
    request:
      { kind: "audio"; clipId?: string } | { kind: "video"; clipId: string },
    receipt: { bytes: number; durationMs: number; digest: string },
    signal: AbortSignal,
  ): Promise<Blob> {
    signal.throwIfAborted();
    if (
      !Number.isSafeInteger(receipt.bytes) ||
      receipt.bytes <= 0 ||
      receipt.bytes > OWNER_PROVIDER_MEDIA.bytes ||
      !Number.isSafeInteger(receipt.durationMs) ||
      receipt.durationMs <= 0 ||
      receipt.durationMs >
        (request.kind === "audio"
          ? OWNER_LIMITS.sourceMs
          : OWNER_LIMITS.clipMs) ||
      !/^[a-f0-9]{64}$/.test(receipt.digest)
    )
      throw new Error("provider_input_rejected");
    const path =
      request.kind === "audio"
        ? await this.providerAudio(id, request.clipId)
        : await this.providerVideo(id, request.clipId);
    const before = await lstat(path, { bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.nlink !== 1n ||
      before.size !== BigInt(receipt.bytes)
    )
      throw new Error("provider_input_rejected");
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const opened = await file.stat({ bigint: true });
      if (
        opened.dev !== before.dev ||
        opened.ino !== before.ino ||
        opened.size !== before.size ||
        opened.mtimeNs !== before.mtimeNs ||
        opened.nlink !== 1n
      )
        throw new Error("provider_input_rejected");
      const bytes = Buffer.alloc(receipt.bytes);
      let offset = 0;
      while (offset < bytes.length) {
        signal.throwIfAborted();
        const read = await file.read(
          bytes,
          offset,
          bytes.length - offset,
          offset,
        );
        if (!read.bytesRead) throw new Error("provider_input_rejected");
        offset += read.bytesRead;
      }
      signal.throwIfAborted();
      const after = await file.stat({ bigint: true });
      const named = await lstat(path, { bigint: true });
      if (
        after.size !== before.size ||
        after.mtimeNs !== before.mtimeNs ||
        after.ctimeNs !== before.ctimeNs ||
        named.dev !== before.dev ||
        named.ino !== before.ino ||
        named.isSymbolicLink() ||
        after.nlink !== 1n ||
        createHash("sha256").update(bytes).digest("hex") !== receipt.digest
      )
        throw new Error("provider_input_rejected");
      return new Blob([bytes], {
        type: request.kind === "audio" ? "audio/m4a" : "video/mp4",
      });
    } finally {
      await file.close();
    }
  }
  async removeProviderInput(
    id: string,
    request:
      { kind: "audio"; clipId?: string } | { kind: "video"; clipId: string },
  ): Promise<void> {
    const path =
      request.kind === "audio"
        ? await this.providerAudio(id, request.clipId)
        : await this.providerVideo(id, request.clipId);
    await rm(path, { force: true });
  }
  async remove(id: string): Promise<void> {
    ownerIdSchema.parse(id);
    if (!this.ids.has(id)) return;
    const directory = await confinedPath(this.root, id);
    await rm(directory, { recursive: true, force: true });
    this.ids.delete(id);
  }
  async close(): Promise<void> {
    for (const id of this.ids) await this.remove(id);
  }
}

export async function requireDisk(
  root: string,
  peakBytes: number,
): Promise<void> {
  const info = await statfs(root);
  if (
    peakBytes < 0 ||
    peakBytes > OWNER_LIMITS.scratchBytes ||
    info.bavail * info.bsize - peakBytes < OWNER_LIMITS.reserveBytes
  )
    throw new Error("disk_unavailable");
}
