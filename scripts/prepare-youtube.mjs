import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  OWNER_DOWNLOADER_PIN as pin,
  ownerAcquisitionTools,
} from "../apps/backend/local/acquisition-tools.ts";
import { nativeEnvironment } from "../apps/backend/local/local-mode.ts";

// Explicit preparation only: never imported by startup, jobs, tests or public builds.
if (
  process.platform !== "win32" ||
  process.arch !== "x64" ||
  !process.env.SystemRoot
)
  throw new Error("acquisition_tools_unavailable");
const repository = resolve(import.meta.dirname, "..");
const directory = join(repository, ".local-build/tools/youtube");
for (const path of [
  join(repository, ".local-build"),
  join(repository, ".local-build/tools"),
  directory,
]) {
  await mkdir(path, { recursive: true });
  if ((await lstat(path)).isSymbolicLink() || (await realpath(path)) !== path)
    throw new Error("acquisition_tool_path_invalid");
}
const scratch = await mkdtemp(join(directory, ".prepare-"));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function download(name, url, expected, limit = 64 * 1024 ** 2) {
  const destination = join(directory, name);
  try {
    const info = await lstat(destination);
    if (!info.isFile() || info.isSymbolicLink() || info.size > limit)
      throw new Error("acquisition_tool_path_invalid");
    const bytes = await readFile(destination);
    if (expected && digest(bytes) !== expected)
      throw new Error("acquisition_tool_checksum_mismatch");
    if (bytes.length) return destination;
    throw new Error("acquisition_tool_download_incomplete");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok || !response.body)
    throw new Error("acquisition_tool_download_failed");
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) throw new Error("acquisition_tool_download_too_large");
    chunks.push(Buffer.from(chunk));
  }
  const bytes = Buffer.concat(chunks);
  if (!bytes.length || (expected && digest(bytes) !== expected))
    throw new Error("acquisition_tool_checksum_mismatch");
  const temporary = join(scratch, name);
  await writeFile(temporary, bytes, { flag: "wx" });
  await rename(temporary, destination);
  return destination;
}
try {
  const ytdlp = `https://github.com/yt-dlp/yt-dlp/releases/download/${pin.version}`;
  const deno = `https://github.com/denoland/deno/releases/download/v${pin.challengeVersion}`;
  await download("yt-dlp.exe", `${ytdlp}/yt-dlp.exe`, pin.sha256);
  const archive = await download(
    "deno.zip",
    `${deno}/deno-x86_64-pc-windows-msvc.zip`,
    pin.challengeArchiveSha256,
  );
  await download(
    "deno.sha256sum",
    `${deno}/deno-x86_64-pc-windows-msvc.sha256sum`,
    pin.challengeChecksumSha256,
    4096,
  );
  await download(
    "yt-dlp.LICENSE",
    `https://raw.githubusercontent.com/yt-dlp/yt-dlp/${pin.version}/LICENSE`,
    undefined,
    1024 ** 2,
  );
  await download(
    "yt-dlp.THIRD_PARTY_LICENSES.txt",
    `https://raw.githubusercontent.com/yt-dlp/yt-dlp/${pin.version}/THIRD_PARTY_LICENSES.txt`,
    undefined,
    1024 ** 2,
  );
  await download(
    "deno.LICENSE.md",
    `https://raw.githubusercontent.com/denoland/deno/v${pin.challengeVersion}/LICENSE.md`,
    undefined,
    1024 ** 2,
  );
  try {
    await lstat(join(directory, "deno.exe"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const extracted = join(scratch, "deno");
    await promisify(execFile)(
      join(
        process.env.SystemRoot,
        "System32/WindowsPowerShell/v1.0/powershell.exe",
      ),
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "$ErrorActionPreference = 'Stop'; Expand-Archive -LiteralPath $env:CLIPBUILDER_TOOL_ARCHIVE -DestinationPath $env:CLIPBUILDER_TOOL_EXTRACT",
      ],
      {
        windowsHide: true,
        timeout: 60_000,
        maxBuffer: 4096,
        env: {
          ...nativeEnvironment(scratch),
          CLIPBUILDER_TOOL_ARCHIVE: archive,
          CLIPBUILDER_TOOL_EXTRACT: extracted,
        },
      },
    );
    await copyFile(
      join(extracted, "deno.exe"),
      join(directory, "deno.exe"),
      constants.COPYFILE_EXCL,
    );
  }
  const tools = await ownerAcquisitionTools(
    repository,
    process.env.SystemRoot,
    new AbortController().signal,
  );
  // Offline, bounded version checks. No source, provider or account access.
  for (const [file, version] of [
    [tools.downloader, pin.version],
    [tools.challenge, `deno ${pin.challengeVersion}`],
  ]) {
    const result = await promisify(execFile)(file, ["--version"], {
      windowsHide: true,
      timeout: 30_000,
      maxBuffer: 4096,
      cwd: scratch,
      env: nativeEnvironment(scratch),
    });
    if (!result.stdout.trim().startsWith(version))
      throw new Error("acquisition_tool_version_mismatch");
  }
  process.stdout.write(
    "Pinned local YouTube tools verified; AI remains unchanged. No media request made.\n",
  );
} finally {
  if (
    dirname(scratch) === directory &&
    !relative(directory, scratch).includes("..")
  )
    await rm(scratch, { recursive: true, force: true });
}
