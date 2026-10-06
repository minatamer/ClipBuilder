import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const appRoutes = new Set([
  "/page",
  "/start/page",
  "/_not-found/page",
  "/_global-error/page",
  "/api/analysis/[action]/route",
  "/api/sample/[...path]/route",
  "/api/session/exit/route",
  "/icon.svg/route",
  "/robots.txt/route",
]);
const harnessNames = new Set([
  "main.mjs",
  "worker.mjs",
  "sync-access.mjs",
  "mediabunny.mjs",
  "audio-extraction.mjs",
  "audio-samples.mjs",
  "audio-profile.mjs",
  "opfs-access.mjs",
  "media-errors.mjs",
  "audio-contracts.mjs",
]);
const invalid = () => new Error("release_artifact_invalid");
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw invalid();
  return value as Record<string, unknown>;
}
async function json(path: string): Promise<unknown> {
  const info = await lstat(path);
  if (!info.isFile() || info.size > 1024 * 1024) throw invalid();
  return JSON.parse(await readFile(path, "utf8"));
}

// Inspect existing build output only; no listen, credentials, network or copying.
export async function verifyReleaseArtifact(
  frontendRoot: string,
  scope: "release" | "local-build" = "release",
) {
  const root = resolve(frontendRoot),
    standalone = join(root, ".next", "standalone");
  const application = join(standalone, "apps", "frontend");
  const entries = object(
    await json(join(application, ".next", "server", "app-paths-manifest.json")),
  );
  if (
    Object.keys(entries).length !== appRoutes.size ||
    Object.keys(entries).some((route) => !appRoutes.has(route))
  )
    throw invalid();
  for (const entry of Object.values(entries)) {
    if (
      typeof entry !== "string" ||
      !entry.startsWith("app/") ||
      !entry.endsWith(".js") ||
      entry.includes("\\") ||
      entry.split("/").includes("..")
    )
      throw invalid();
    if (!(await lstat(join(application, ".next", "server", entry))).isFile())
      throw invalid();
  }
  const pages = object(
    await json(join(application, ".next", "server", "pages-manifest.json")),
  );
  if (
    Object.keys(pages).some(
      (route) =>
        !["/_app", "/_document", "/_error", "/404", "/500"].includes(route),
    )
  )
    throw invalid();
  const routing = object(
    await json(join(application, ".next", "routes-manifest.json")),
  );
  const rewrites = object(routing.rewrites);
  if (
    Object.keys(rewrites).some(
      (key) => !["beforeFiles", "afterFiles", "fallback"].includes(key),
    ) ||
    ["beforeFiles", "afterFiles", "fallback"].some(
      (key) => !Array.isArray(rewrites[key]) || rewrites[key].length !== 0,
    )
  )
    throw invalid();
  if (
    !Array.isArray(routing.redirects) ||
    routing.redirects.some((value) => {
      const rule = object(value);
      return (
        rule.internal !== true ||
        rule.source !== "/:path+/" ||
        rule.destination !== "/:path+" ||
        rule.statusCode !== 308
      );
    })
  )
    throw invalid();
  if (!(await lstat(join(application, "server.js"))).isFile()) throw invalid();

  const files: { label: string; path: string }[] = [];
  const links: string[] = [];
  let externalPackageLinks = 0;
  const outside = (value: string) =>
    value === ".." || value.startsWith(".." + sep) || isAbsolute(value);
  async function inventory(base: string, folder: string, label: string) {
    const info = await lstat(folder);
    if (info.isSymbolicLink()) {
      const target = await realpath(folder);
      const targetPath = relative(base, target);
      if (outside(targetPath)) {
        // Windows Next output can retain package junctions to the source store.
        // Local exclusion checks record this; strict release verification rejects it.
        const packagePath = relative(
          resolve(root, "../..", "node_modules"),
          target,
        );
        if (
          scope !== "local-build" ||
          !label.includes("/node_modules/") ||
          outside(packagePath)
        )
          throw invalid();
        const copied = join(standalone, "node_modules", packagePath);
        if (!(await lstat(copied)).isDirectory()) throw invalid();
        externalPackageLinks++;
        links.push(
          label + "=external-package:" + packagePath.replaceAll(sep, "/"),
        );
      } else links.push(label + "=" + targetPath.replaceAll(sep, "/"));
      return;
    }
    if (!info.isDirectory()) throw invalid();
    for (const item of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, item.name),
        child = label + "/" + item.name;
      const firstParty = !child.includes("/node_modules/");
      if (
        (scope === "release" &&
          child.startsWith("public/generated/product-film")) ||
        /^\.env(?:\.|$)|^runtime\.local\.json$|\.(?:pem|key|p12|pfx|mp4|mov|webm|mkv|avi|wav|mp3|m4a|aac|srt|vtt|ass|onnx|pt|pth)$/i.test(
          item.name,
        ) ||
        (firstParty &&
          (/^(?:feasibility|private|artifacts|uploads|outputs|test|__tests__)$/.test(
            item.name,
          ) ||
            /\.test(?:-fixtures)?\.[tj]sx?$/.test(item.name)))
      )
        throw invalid();
      if (firstParty && harnessNames.has(item.name)) throw invalid();
      if (item.isDirectory() || item.isSymbolicLink())
        await inventory(base, path, child);
      else if (item.isFile()) files.push({ label: child, path });
      else throw invalid();
      if (files.length + links.length > 20_000) throw invalid();
    }
  }
  await inventory(standalone, standalone, "standalone");
  const staticRoot = join(root, ".next", "static");
  await inventory(staticRoot, staticRoot, "static");
  const publicRoot = join(root, "public");
  // Next does not copy public/static into standalone; they are separate inputs.
  let hasPublic = false;
  try {
    await lstat(publicRoot);
    hasPublic = true;
  } catch (error) {
    if (object(error).code !== "ENOENT") throw error;
  }
  if (hasPublic) await inventory(publicRoot, publicRoot, "public");
  const hash = createHash("sha256");
  let bytes = 0;
  for (const file of files.sort((a, b) =>
    a.label.localeCompare(b.label, "en"),
  )) {
    const digest = createHash("sha256");
    for await (const chunk of createReadStream(file.path)) {
      bytes += chunk.length;
      if (bytes > 1024 * 1024 * 1024) throw invalid();
      digest.update(chunk);
    }
    hash.update(file.label + "\0").update(digest.digest());
  }
  for (const link of links.sort()) hash.update(link + "\0");
  return {
    files: files.length,
    links: links.length,
    bytes,
    sha256: hash.digest("hex"),
    appRoutes: appRoutes.size,
    externalPackageLinks,
    selfContained: externalPackageLinks === 0,
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const scope = process.argv[2] === "--local-build" ? "local-build" : "release";
  verifyReleaseArtifact(
    fileURLToPath(new URL("../", import.meta.url)),
    scope,
  ).then(
    (result) => process.stdout.write(JSON.stringify(result) + "\n"),
    () => {
      process.stderr.write("release_artifact_invalid\n");
      process.exitCode = 1;
    },
  );
}
