import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { cp, mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  preparePinnedBrowser,
  PINNED_CHROMIUM_VERSION,
} from "./browser-tooling.js";
if (process.platform !== "linux" || process.arch !== "x64")
  throw new Error("Image tools require Linux x64.");
const destination = resolve(process.argv[2] ?? "/opt/clipbuilder");
const require = createRequire(import.meta.url),
  rendererRequire = createRequire(require.resolve("@remotion/renderer"));
const compositor = dirname(
  rendererRequire.resolve("@remotion/compositor-linux-x64-gnu/package.json"),
);
const browser = await preparePinnedBrowser();
await mkdir(destination, { recursive: true });
await cp(compositor, join(destination, "compositor"), { recursive: true });
await cp(dirname(browser.path), join(destination, "chromium"), {
  recursive: true,
});
const versions: Record<string, string> = {
  remotion: "4.0.534",
  chromium: PINNED_CHROMIUM_VERSION,
};
for (const path of [
  join(destination, "compositor/ffmpeg"),
  join(destination, "compositor/ffprobe"),
  join(destination, "chromium/chrome-headless-shell"),
]) {
  await chmod(path, 0o755);
  versions[path.replace(destination, "")] = createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
  if (path.endsWith("/ffmpeg") || path.endsWith("/ffprobe")) {
    const name = path.endsWith("/ffmpeg") ? "ffmpeg" : "ffprobe";
    const version = execFileSync(path, ["-version"], {
      timeout: 10_000,
      encoding: "utf8",
      maxBuffer: 64 * 1024,
    })
      .split("\n")[0]
      ?.trim();
    if (!version?.startsWith(name + " version ") || version.length > 2048)
      throw new Error("Native tool version unavailable.");
    versions[name] = version;
  }
}
await writeFile(
  join(destination, "runtime-tools.json"),
  JSON.stringify(versions, null, 2),
);
