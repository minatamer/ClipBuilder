import { lstat, readdir } from "node:fs/promises";
import { join } from "node:path";

function disappeared(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

export async function measureScratchBytes(directory: string): Promise<number> {
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch (error) {
    if (disappeared(error)) return 0;
    throw error;
  }
  let total = 0;
  for (const entry of entries) {
    const path = join(directory, entry);
    try {
      // Chromium's Linux profile contains links and sockets. Account for the
      // entry itself without following links outside this operation's scratch.
      const info = await lstat(path);
      total += info.isDirectory() ? await measureScratchBytes(path) : info.size;
    } catch (error) {
      // Browser caches can remove entries between enumeration and inspection.
      if (!disappeared(error)) throw error;
    }
  }
  return total;
}
