import { copyFile, lstat, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** Secret-free, closed build inputs; never submit the checkout as a cloud context. */
export async function prepareAppImage(root, application) {
  if (!["frontend", "backend"].includes(application))
    throw new Error("invalid_image_target");
  const sourceRoot = resolve(root);
  const destination = await mkdtemp(
    join(tmpdir(), `clipbuilder-${application}-context-`),
  );
  async function copy(path, directorySource = false) {
    const source = resolve(sourceRoot, path);
    if (!source.startsWith(sourceRoot + sep))
      throw new Error("invalid_image_input");
    const info = await lstat(source);
    if (info.isSymbolicLink()) throw new Error("image_input_link");
    if (info.isDirectory()) {
      for (const child of await readdir(source)) {
        if (
          join(path, child) ===
          join("apps/frontend/src/features/product-film", "studio.tsx")
        )
          continue;
        if (child.endsWith(".md")) continue;
        if (/\.test(?:-fixtures)?\.[tj]sx?$/.test(child)) continue;
        if (/\.proof\.[tj]sx?$/.test(child)) continue;
        await copy(join(path, child), true);
      }
    } else if (info.isFile()) {
      if (
        directorySource &&
        !/\.(?:ts|tsx|css|svg)$/.test(path) &&
        path !== join("apps/backend/local", "sample-earth.jpg")
      )
        throw new Error("unexpected_image_source");
      const target = join(destination, relative(sourceRoot, source));
      await mkdir(resolve(target, ".."), { recursive: true });
      await copyFile(source, target);
    } else throw new Error("invalid_image_input");
  }
  try {
    const inputs = [
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "tsconfig.base.json",
      "test/deterministic.environment.ts",
      "scripts/verify-image-runtime.mjs",
      `apps/${application}/package.json`,
      `apps/${application}/tsconfig.json`,
      `apps/${application}/src`,
      `apps/${application}/Dockerfile`,
      `apps/${application}/cloudbuild.yaml`,
      "packages/contracts/package.json",
      "packages/contracts/tsconfig.json",
      "packages/contracts/src",
      "packages/contracts/local",
      "scripts/local-discovery.mjs",
      "scripts/local-discovery.d.mts",
      "scripts/local-processes.mjs",
      "scripts/local-processes.d.mts",
    ];
    if (application === "backend")
      inputs.push(
        "apps/backend/local",
        "scripts/backend-build.mjs",
        "scripts/native-tools.ts",
        "scripts/editing-worker-build.mjs",
        "apps/renderer/package.json",
        "apps/renderer/src",
        "apps/renderer/local",
        "packages/composition/package.json",
        "packages/composition/tsconfig.json",
        "packages/composition/src",
        "packages/composition/local",
      );
    if (application === "frontend")
      inputs.push(
        "apps/frontend/next-env.d.ts",
        "apps/frontend/next.config.ts",
        "apps/frontend/scripts/verify-release-artifact.ts",
        "apps/frontend/scripts/delivery-assets.json",
        "packages/composition/package.json",
        "packages/composition/tsconfig.json",
        "packages/composition/src",
        "packages/composition/local",
      );
    for (const path of inputs) await copy(path);
    if (application === "frontend") {
      const { default: DELIVERY_ASSETS } = await import(
        "../apps/frontend/scripts/delivery-assets.json",
        { with: { type: "json" } }
      );
      for (const name of Object.keys(DELIVERY_ASSETS))
        await copy("apps/frontend/public/" + name);
    }
    return destination;
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  process.stdout.write((await prepareAppImage(root, process.argv[2])) + "\n");
}
