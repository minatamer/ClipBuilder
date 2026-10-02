import { lstat, mkdir, mkdtemp, readdir, copyFile, rm } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
export async function prepareBuildContext(root: string) {
  const sourceRoot = resolve(root),
    destination = await mkdtemp(join(tmpdir(), "clipbuilder-build-context-"));
  async function copy(path: string) {
    const source = resolve(sourceRoot, path);
    if (!source.startsWith(sourceRoot + sep))
      throw new Error("Build path escapes repository.");
    const info = await lstat(source);
    if (info.isSymbolicLink())
      throw new Error("Build input links are prohibited.");
    if (info.isDirectory()) {
      for (const child of await readdir(source)) {
        if (/\.test\.tsx?$/.test(child)) continue;
        const childInfo = await lstat(join(source, child));
        if (childInfo.isFile() && !/\.tsx?$/.test(child))
          throw new Error("Unexpected source build input.");
        await copy(join(path, child));
      }
    } else if (info.isFile()) {
      const target = join(destination, relative(sourceRoot, source));
      await mkdir(resolve(target, ".."), { recursive: true });
      await copyFile(source, target);
    } else throw new Error("Unsupported build input.");
  }
  try {
    for (const path of [
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "tsconfig.base.json",
      "apps/renderer/package.json",
      "apps/renderer/tsconfig.json",
      "apps/renderer/src",
      "apps/renderer/scripts/build-bundle.ts",
      "apps/renderer/scripts/stage-tools.ts",
      "apps/renderer/scripts/verify-linux-media.mjs",
      "apps/renderer/Dockerfile",
      "apps/renderer/cloudbuild.yaml",
      "packages/contracts/package.json",
      "packages/contracts/tsconfig.json",
      "packages/contracts/src",
      "packages/composition/package.json",
      "packages/composition/tsconfig.json",
      "packages/composition/src",
    ])
      await copy(path);
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
  return destination;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  process.stdout.write((await prepareBuildContext(resolve("../.."))) + "\n");
