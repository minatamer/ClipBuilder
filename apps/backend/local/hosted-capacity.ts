import { lstat, readdir, readFile, realpath, statfs } from "node:fs/promises";
import { join, resolve } from "node:path";
import { HOSTED_EDITING_POLICY } from "../../../packages/contracts/local/hosted-editing.ts";

export const HOSTED_MEMORY_BYTES = 8 * 1024 ** 3;
export const HOSTED_SCRATCH_VOLUME_BYTES =
  HOSTED_EDITING_POLICY.scratchBytes + HOSTED_EDITING_POLICY.reserveBytes;
const TMPFS_MAGIC = 0x01021994;
const MAX_SCRATCH_ENTRIES = 65_536;
const unavailable = () => new Error("disk_unavailable");
const bytes = (value: number) => Number.isSafeInteger(value) && value >= 0;

async function memory() {
  const number = (text: string) => {
    if (!/^\d+$/u.test(text.trim())) throw unavailable();
    const value = Number(text.trim());
    if (!bytes(value)) throw unavailable();
    return value;
  };
  try {
    return {
      limit: number(await readFile("/sys/fs/cgroup/memory.max", "utf8")),
      used: number(await readFile("/sys/fs/cgroup/memory.current", "utf8")),
    };
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
    return {
      limit: number(
        await readFile("/sys/fs/cgroup/memory/memory.limit_in_bytes", "utf8"),
      ),
      used: number(
        await readFile("/sys/fs/cgroup/memory/memory.usage_in_bytes", "utf8"),
      ),
    };
  }
}

/** Only metadata in this boot's private runtime; PNG hardlinks consume space once. */
export async function hostedScratchBytes(runtime: string): Promise<number> {
  const seen = new Set<string>();
  let total = 0;
  let entries = 0;
  async function visit(path: string) {
    if (++entries > MAX_SCRATCH_ENTRIES) throw unavailable();
    let info;
    try {
      info = await lstat(path, { bigint: true });
    } catch (error) {
      // The worker may finish/clean derived scratch while admission measures it.
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        return;
      throw error;
    }
    if (info.isSymbolicLink()) throw unavailable();
    if (info.isDirectory()) {
      let names;
      try {
        names = await readdir(path);
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        )
          return;
        throw error;
      }
      for (const name of names) await visit(join(path, name));
    } else if (info.isFile()) {
      const identity = `${info.dev}:${info.ino}`;
      if (seen.has(identity)) return;
      seen.add(identity);
      const allocation = Number(
        info.size > info.blocks * 512n ? info.size : info.blocks * 512n,
      );
      if (!bytes(allocation) || !bytes(total + allocation)) throw unavailable();
      total += allocation;
    } else throw unavailable();
  }
  await visit(runtime);
  return total;
}

/** A total projected media peak, not another copy of already retained bytes. */
export function checkHostedScratch(
  peak: number,
  current: {
    volume: number;
    free: number;
    retained: number;
    memoryLimit: number;
    memoryUsed: number;
  },
) {
  if (
    !bytes(peak) ||
    Object.values(current).some((value) => !bytes(value)) ||
    peak > HOSTED_EDITING_POLICY.scratchBytes ||
    current.retained > HOSTED_EDITING_POLICY.scratchBytes ||
    current.volume !== HOSTED_SCRATCH_VOLUME_BYTES ||
    current.free > current.volume ||
    current.memoryLimit < HOSTED_MEMORY_BYTES ||
    current.memoryUsed > current.memoryLimit
  )
    throw unavailable();
  const additional = Math.max(0, peak - current.retained);
  // The shared mount also contains browser profiles and this boot's private state.
  // They are already charged to free RAM/space but are not in the clip's peak.
  const overhead = Math.max(
    0,
    current.volume - current.free - current.retained,
  );
  if (
    Math.max(peak, current.retained) + overhead >
      HOSTED_EDITING_POLICY.scratchBytes ||
    current.free - additional < HOSTED_EDITING_POLICY.reserveBytes ||
    current.memoryLimit - current.memoryUsed - additional <
      HOSTED_EDITING_POLICY.reserveBytes
  )
    throw unavailable();
}

/** Startup and every admission fail closed without the bounded RAM-backed volume. */
export async function createHostedScratchCapacity(
  runtime: string,
  root: string,
) {
  if (
    (await lstat(runtime)).isSymbolicLink() ||
    (await realpath(runtime)) !== resolve(runtime) ||
    (await lstat(root)).isSymbolicLink() ||
    (await realpath(root)) !== join(resolve(runtime), "workspaces")
  )
    throw unavailable();
  const capacity = async (directory: string, peak: number) => {
    if (resolve(directory) !== resolve(root)) throw unavailable();
    const retained = await hostedScratchBytes(root);
    // Read available space/RAM after the metadata walk, while the worker may
    // have been producing frames, rather than using an older pressure snapshot.
    const [disk, ram] = await Promise.all([statfs(runtime), memory()]);
    if (disk.type !== TMPFS_MAGIC) throw unavailable();
    checkHostedScratch(peak, {
      volume: disk.blocks * disk.bsize,
      free: disk.bavail * disk.bsize,
      retained,
      memoryLimit: ram.limit,
      memoryUsed: ram.used,
    });
  };
  await capacity(root, 0);
  return capacity;
}
