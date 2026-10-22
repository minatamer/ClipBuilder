import { execFile } from "node:child_process";
import { lstat, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

export function containsPath(root: string, target: string): boolean {
  const rel = relative(root, target);
  return (
    !rel || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`))
  );
}

/** Resolve only the known Downloads folder. Importing this module does no I/O. */
export async function resolveOwnerStorage(): Promise<string> {
  if (process.platform !== "win32")
    throw new Error("owner_storage_unavailable");
  const { stdout } = await execute(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "$ErrorActionPreference='Stop'; [Environment]::ExpandEnvironmentVariables((Get-ItemPropertyValue -LiteralPath 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders' -Name '{374DE290-123F-4565-9164-39C4925E467B}'))",
    ],
    { windowsHide: true, timeout: 5000, maxBuffer: 16 * 1024 },
  );
  const downloads = stdout.trim();
  if (
    !isAbsolute(downloads) ||
    downloads.includes("\n") ||
    downloads.includes("\r")
  )
    throw new Error("owner_storage_unavailable");
  const root = resolve(downloads, "ClipBuilder");
  await rejectRepositoryStorage(root);
  return root;
}

/** The owner launcher runs from the repository; never retain private work there. */
export async function rejectRepositoryStorage(target: string): Promise<void> {
  let repository = resolve(process.cwd());
  for (;;) {
    try {
      await lstat(join(repository, ".git"));
      if (containsPath(await realpath(repository), resolve(target)))
        throw new Error("owner_storage_in_repository");
      return;
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
