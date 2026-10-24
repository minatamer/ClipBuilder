import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const repository = fileURLToPath(new URL("../", import.meta.url));
// Fixed worker/browser inputs; dependencies resolve from the renderer package in the image.
await build({
  absWorkingDir: repository,
  entryPoints: ["apps/renderer/local/entry.ts"],
  outfile: "apps/renderer/dist/editing-worker.js",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
});
await build({
  absWorkingDir: repository,
  entryPoints: ["apps/renderer/local/overlay-page.tsx"],
  outfile: "apps/renderer/editing-overlay/app.js",
  bundle: true,
  platform: "browser",
  format: "esm",
  jsx: "automatic",
});
await mkdir(new URL("../apps/renderer/editing-overlay", import.meta.url), {
  recursive: true,
});
await writeFile(
  new URL("../apps/renderer/editing-overlay/index.html", import.meta.url),
  '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1080px;height:1920px;background:transparent}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
);
