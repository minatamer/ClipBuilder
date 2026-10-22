import { readdir, readFile, lstat } from "node:fs/promises";
import { resolve, join } from "node:path";

async function files(directory) {
  const found = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isSymbolicLink()) continue;
    if (
      item.name === "owner" ||
      item.name.startsWith("owner-") ||
      item.name === ".owner-build"
    )
      throw new Error("owner_artifact_exposed");
    if (item.isDirectory()) found.push(...(await files(path)));
    else found.push(path);
  }
  return found;
}
let count = 0;
for (const directory of [
  "apps/backend/dist",
  "apps/renderer/dist",
  "packages/contracts/dist",
  "packages/composition/dist",
  "apps/frontend/.next/server",
  "apps/frontend/.next/static",
  "apps/frontend/.next/standalone",
]) {
  for (const file of await files(resolve(directory))) {
    if (
      !/\.(?:js|json|html)$/.test(file) ||
      (await lstat(file)).size > 20 * 1024 ** 2
    )
      continue;
    if (
      /CLIPBUILDER_OWNER_STATE|owner_fake_mode_required|\/api\/workspace\/|\/api\/agent\/|clipbuilder-owner-active|Local owner workspace/.test(
        await readFile(file, "utf8"),
      )
    )
      throw new Error("owner_artifact_exposed");
    count++;
  }
}
const dockerignore = await readFile(".dockerignore", "utf8");
for (const required of [
  "**/owner",
  ".owner-build",
  "scripts/owner-*",
  "private",
])
  if (!dockerignore.split(/\r?\n/).includes(required))
    throw new Error("owner_context_exposed");
// Public compiler roots are explicitly src-only; imports are additionally lint-enforced.
for (const application of ["backend", "frontend", "renderer"]) {
  const config = JSON.parse(
    await readFile(`apps/${application}/tsconfig.json`, "utf8"),
  );
  if (
    config.include.some(
      (pattern) => pattern.includes("owner") || pattern === "**/*.ts",
    )
  )
    throw new Error("owner_compiler_exposed");
}
process.stdout.write(
  `Public owner-exclusion check passed (${count} built files; Docker context and compiler roots).\n`,
);
