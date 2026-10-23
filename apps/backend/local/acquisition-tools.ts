import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, lstat, realpath } from "node:fs/promises";
import { isAbsolute, join, parse, resolve } from "node:path";

export const OWNER_DOWNLOADER_PIN = {
  version: "2026.10.21",
  sha256: "33121d192d706e62f684a06f80918e3f3a8ba52ac3a65213b6951c39c7d9f555",
  challengeVersion: "2.9.8",
  challengeArchiveSha256:
    "cba84b26e0df5ae7f74fc66b86a95b866872a86292ebd84fa1e959927edd93bf",
  challengeChecksumSha256:
    "c2b2404be2a5b850b76a9c6ffd797c2178064f06d3bdf9806f53adcf0e021e4d",
} as const;
export type PreparedAcquisitionTools = {
  downloader: string;
  challenge: string;
  /** From the pinned upstream executable checksum document, never a job input. */
  challengeExecutableSha256: string;
  systemRoot: string;
};

async function executableDigest(file: string, signal: AbortSignal) {
  if (!isAbsolute(file)) throw new Error("acquisition_tools_unavailable");
  let cursor = parse(resolve(file)).root;
  for (const part of resolve(file).slice(cursor.length).split(/[\\/]/)) {
    cursor = join(cursor, part);
    if (
      (await lstat(cursor)).isSymbolicLink() ||
      (await realpath(cursor)) !== resolve(cursor)
    )
      throw new Error("acquisition_tools_unavailable");
  }
  const before = await lstat(file, { bigint: true });
  if (
    !before.isFile() ||
    before.nlink !== 1n ||
    before.size > 256n * 1024n ** 2n
  )
    throw new Error("acquisition_tools_unavailable");
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file, { signal }))
    hash.update(chunk);
  const after = await lstat(file, { bigint: true });
  if (
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    before.ctimeNs !== after.ctimeNs
  )
    throw new Error("acquisition_tools_unavailable");
  return hash.digest("hex");
}
export async function verifyAcquisitionTools(
  tools: PreparedAcquisitionTools,
  signal: AbortSignal,
) {
  if (
    !/^[a-f0-9]{64}$/.test(tools.challengeExecutableSha256) ||
    !isAbsolute(tools.systemRoot)
  )
    throw new Error("acquisition_tools_unavailable");
  if (
    (await executableDigest(tools.downloader, signal)) !==
      OWNER_DOWNLOADER_PIN.sha256 ||
    (await executableDigest(tools.challenge, signal)) !==
      tools.challengeExecutableSha256
  )
    throw new Error("acquisition_tools_unavailable");
}

/** Fixed local tool directory; no PATH discovery, installation, env files or network. */
export async function ownerAcquisitionTools(
  repository: string,
  systemRoot: string | undefined,
  signal: AbortSignal,
): Promise<PreparedAcquisitionTools> {
  if (process.platform !== "win32" || process.arch !== "x64" || !systemRoot)
    throw new Error("acquisition_tools_unavailable");
  const directory = resolve(repository, ".local-build/tools/youtube");
  let cursor = parse(directory).root;
  for (const part of directory.slice(cursor.length).split(/[\\/]/u)) {
    cursor = join(cursor, part);
    if (
      (await lstat(cursor)).isSymbolicLink() ||
      (await realpath(cursor)) !== cursor
    )
      throw new Error("acquisition_tools_unavailable");
  }
  const checksumFile = join(directory, "deno.sha256sum");
  for (const file of [
    checksumFile,
    join(directory, "yt-dlp.LICENSE"),
    join(directory, "yt-dlp.THIRD_PARTY_LICENSES.txt"),
    join(directory, "deno.LICENSE.md"),
  ]) {
    const info = await lstat(file);
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.size < 1 ||
      info.size > 1024 ** 2
    )
      throw new Error("acquisition_tools_unavailable");
  }
  const checksumBytes = await readFile(checksumFile);
  if (
    createHash("sha256").update(checksumBytes).digest("hex") !==
    OWNER_DOWNLOADER_PIN.challengeChecksumSha256
  )
    throw new Error("acquisition_tools_unavailable");
  // The pinned Windows asset uses PowerShell Get-FileHash output, not GNU sums.
  const checksum = checksumBytes
    .toString("utf8")
    .match(/^Hash\s*:\s*([A-F0-9]{64})\s*$/mu)?.[1]
    ?.toLowerCase();
  if (!checksum) throw new Error("acquisition_tools_unavailable");
  const tools = {
    downloader: join(directory, "yt-dlp.exe"),
    challenge: join(directory, "deno.exe"),
    challengeExecutableSha256: checksum,
    systemRoot,
  };
  await verifyAcquisitionTools(tools, signal);
  return tools;
}
