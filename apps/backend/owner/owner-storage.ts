import { execFile } from "node:child_process";
import { lstat, mkdir, realpath } from "node:fs/promises";
import {
  dirname,
  isAbsolute,
  join,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const knownFolders = {
  downloads: "{374DE290-123F-4565-9164-39C4925E467B}",
  desktop: "Desktop",
} as const;
export type OwnerStorageLocation = keyof typeof knownFolders;

export function containsPath(root: string, target: string): boolean {
  const rel = relative(root, target);
  return (
    !rel || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`))
  );
}

/** Resolve only an explicit known folder. Importing this module does no I/O. */
export async function resolveOwnerStorage(
  location: OwnerStorageLocation = "downloads",
  testLookup?: (name: string) => Promise<string>,
): Promise<string> {
  if (!Object.hasOwn(knownFolders, location))
    throw new Error("owner_storage_unavailable");
  if (
    testLookup &&
    (process.env.NODE_ENV !== "test" ||
      process.env.FAKE_MODE !== "true" ||
      process.env.PAID_DEMO_ENABLED !== "false")
  )
    throw new Error("owner_storage_unavailable");
  if (!testLookup && process.platform !== "win32")
    throw new Error("owner_storage_unavailable");
  const name = knownFolders[location];
  const stdout = testLookup
    ? await testLookup(name)
    : (
        await execute(
          "powershell.exe",
          [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `$ErrorActionPreference='Stop'; [Environment]::ExpandEnvironmentVariables((Get-ItemPropertyValue -LiteralPath 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders' -Name '${name}'))`,
          ],
          { windowsHide: true, timeout: 5000, maxBuffer: 16 * 1024 },
        )
      ).stdout;
  const selected = stdout.trim();
  if (
    !isAbsolute(selected) ||
    Array.from(selected).some((character) => character.charCodeAt(0) < 32)
  )
    throw new Error("owner_storage_unavailable");
  const root = resolve(selected, "ClipBuilder");
  await prepareOwnerStorage(root);
  return root;
}

/** Never retain private media inside any Git checkout, irrespective of caller cwd. */
export async function rejectRepositoryStorage(target: string): Promise<void> {
  let repository = resolve(target);
  for (;;) {
    try {
      await lstat(join(repository, ".git"));
      throw new Error("owner_storage_in_repository");
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    }
    const parent = dirname(repository);
    if (parent === repository) return;
    repository = parent;
  }
}

/** Inspect before creating; all missing directories are created only on an explicit save/import. */
export async function prepareOwnerStorage(
  root: string,
  create = false,
): Promise<boolean> {
  if (!isAbsolute(root)) throw new Error("invalid_path");
  const target = resolve(root);
  await rejectRepositoryStorage(target);
  let cursor = parse(target).root,
    absent = false;
  for (const part of relative(cursor, target).split(sep).filter(Boolean)) {
    cursor = resolve(cursor, part);
    if (absent && !create) continue;
    try {
      const info = await lstat(cursor);
      if (!info.isDirectory() || info.isSymbolicLink())
        throw new Error("invalid_path");
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
      if (!create) {
        absent = true;
        continue;
      }
      try {
        await mkdir(cursor, { mode: 0o700 });
      } catch (created) {
        if (!(
          created instanceof Error &&
          "code" in created &&
          created.code === "EEXIST"
        ))
          throw created;
      }
      const info = await lstat(cursor);
      if (!info.isDirectory() || info.isSymbolicLink())
        throw new Error("invalid_path");
    }
  }
  if (!absent) await rejectRepositoryStorage(await realpath(target));
  return !absent;
}
