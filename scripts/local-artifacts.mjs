import { readdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
let count = 0;
async function inspect(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isSymbolicLink()) continue;
    if (
      [".local-build", ".owner-build", "private"].includes(item.name) ||
      /^\.env(?!\.example$)/.test(item.name) ||
      /\.(?:exe|mp4|mov|webm|log)$/.test(item.name)
    )
      throw new Error("private_local_artifact_exposed");
    if (item.isDirectory()) await inspect(path);
    else count++;
  }
}
for (const directory of [
  "apps/backend/dist",
  "apps/frontend/.next/server",
  "apps/frontend/.next/static",
  "apps/frontend/.next/standalone",
])
  await inspect(resolve(directory));
const ignored = (await readFile(".dockerignore", "utf8")).split(/\r?\n/);
for (const value of [".local-build", ".owner-build", "private", "**/.env.*"])
  if (!ignored.includes(value)) throw new Error("private_context_exposed");
const scripts = JSON.parse(await readFile("package.json", "utf8")).scripts;
if (Object.keys(scripts).some((key) => key.startsWith("owner:")))
  throw new Error("retired_owner_command");
process.stdout.write(
  `Integrated artifact privacy check passed (${count} files). Hosted route inactivity is verified by runtime tests.\n`,
);
