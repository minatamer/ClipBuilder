import { build } from "esbuild";
import { mkdir, lstat, realpath, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRequire, isBuiltin } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));

const output = resolve(".local-build");
await mkdir(output, { recursive: true });
if (
  (await lstat(output)).isSymbolicLink() ||
  (await realpath(output)) !== output
)
  throw new Error("owner_build_path_invalid");
for (const directory of ["overlay"]) {
  try {
    if ((await lstat(resolve(output, directory))).isSymbolicLink())
      throw new Error("owner_build_path_invalid");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
// These exact ignored build outputs are the only trees this build replaces.
for (const directory of ["overlay"])
  await rm(resolve(output, directory), { recursive: true, force: true });
await build({
  absWorkingDir: process.cwd(),
  entryPoints: ["apps/renderer/local/overlay-page.tsx"],
  bundle: true,
  platform: "browser",
  format: "esm",
  outfile: resolve(output, "overlay/app.js"),
  jsx: "automatic",
});
await writeFile(
  resolve(output, "overlay/index.html"),
  `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; img-src data:; font-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'"><style>html,body{margin:0;width:1080px;height:1920px;background:transparent}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>`,
);
for (const [entry, name] of [
  ["apps/backend/local/agent-cli.ts", "agent"],
  ["apps/renderer/local/entry.ts", "worker"],
]) {
  await build({
    absWorkingDir: process.cwd(),
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
process.stdout.write("Local media worker and overlay ready.\n");
