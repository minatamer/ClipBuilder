import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { cp, mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { createHash } from "node:crypto";
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
}
await writeFile(
  join(destination, "runtime-tools.json"),
  JSON.stringify(versions, null, 2),
);
