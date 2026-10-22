import { build } from "esbuild";
import { mkdir, lstat, realpath, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRequire, isBuiltin } from "node:module";
import { pathToFileURL } from "node:url";

const output = resolve(".owner-build");
await mkdir(output, { recursive: true });
if (
  (await lstat(output)).isSymbolicLink() ||
  (await realpath(output)) !== output
)
  throw new Error("owner_build_path_invalid");
try {
  if ((await lstat(resolve(output, "ui"))).isSymbolicLink())
    throw new Error("owner_build_path_invalid");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
// This exact ignored output is the only tree this build replaces.
await rm(resolve(output, "ui"), { recursive: true, force: true });
await build({
  entryPoints: ["apps/frontend/owner/main.tsx"],
  bundle: true,
  platform: "browser",
  format: "esm",
  outfile: resolve(output, "ui/app.js"),
  jsx: "automatic",
  minify: false,
});
for (const [entry, name] of [
  ["apps/backend/owner/entry.ts", "server"],
  ["apps/renderer/owner/entry.ts", "worker"],
]) {
  await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    plugins: [
      {
        name: "owned-package-resolution",
        setup(builder) {
          builder.onResolve({ filter: /^[^./]/ }, (args) => {
            if (isBuiltin(args.path))
              return { path: args.path, external: true };
            if (args.path.startsWith("@clipbuilder/")) return;
            const require = createRequire(
              resolve(args.resolveDir, "package.json"),
            );
            return {
              path: pathToFileURL(require.resolve(args.path)).href,
              external: true,
            };
          });
        },
      },
    ],
    outfile: resolve(output, `${name}.mjs`),
    sourcemap: true,
  });
}
await writeFile(
  resolve(output, "ui/index.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ClipBuilder local owner</title><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
);
process.stdout.write("Owner build ready (local-only).\n");
