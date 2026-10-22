import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat } from "node:fs/promises";
import { join } from "node:path";

export const OWNER_FFMPEG = {
  version: "9.0.2",
  archiveSha256:
    "60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba",
  ffmpeg: "3256173f3f8bffd7df12227c68adf68025edb1832273a9530688a7bb1ed8edec",
  ffprobe: "f0d36ecbbdd3bcfac3efa078c96c7271c2e68b3810595552ac3b7f17e9a65c52",
} as const;

/** Explicit tooling admission; never downloads or falls back to cloud/minimal binaries. */
export async function ownerNativeTools(repository: string) {
  if (process.platform !== "win32" || process.arch !== "x64")
    throw new Error("owner_native_platform_unverified");
  const directory = join(
    repository,
    ".owner-build/tools/ffmpeg-release/ffmpeg-9.0.2-essentials_build/bin",
  );
  const tools = {
    ffmpeg: join(directory, "ffmpeg.exe"),
    ffprobe: join(directory, "ffprobe.exe"),
  };
  for (const key of ["ffmpeg", "ffprobe"] as const) {
    const info = await lstat(tools[key]);
    if (!info.isFile() || info.isSymbolicLink())
      throw new Error("owner_native_tool_unavailable");
    const hash = createHash("sha256");
    for await (const bytes of createReadStream(tools[key])) hash.update(bytes);
    if (hash.digest("hex") !== OWNER_FFMPEG[key])
      throw new Error("owner_native_tool_unavailable");
  }
  return tools;
}
