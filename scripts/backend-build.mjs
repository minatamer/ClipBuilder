import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repository = fileURLToPath(new URL("../", import.meta.url));
if (process.platform === "win32") {
  const prepared = spawnSync(
    process.execPath,
    [fileURLToPath(new URL("./local-media-build.mjs", import.meta.url))],
    { cwd: repository, stdio: "inherit", windowsHide: true },
  );
  if (prepared.status !== 0) throw new Error("local_media_build_failed");
}

await build({
  absWorkingDir: fileURLToPath(new URL("../apps/backend/", import.meta.url)),
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
});
