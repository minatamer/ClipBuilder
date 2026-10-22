import { randomUUID } from "node:crypto";
import { mkdir, lstat, realpath, rm, statfs } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import {
  OWNER_LIMITS,
  ownerIdSchema,
} from "../../../packages/contracts/owner/index.ts";

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
