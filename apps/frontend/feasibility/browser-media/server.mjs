import "../../../../test/deterministic.environment.ts";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  LOCAL_WORKSPACE_LIMITS,
  PUBLIC_LIMITS,
  SAFE_ERROR_MESSAGES,
  isSourceWithinLimitProfile,
} from "@clipbuilder/contracts";

const audioModules = new Map([
  ["/audio-extraction.mjs", "audio.extraction"],
  ["/audio-samples.mjs", "audio.samples"],
  ["/audio-profile.mjs", "audio.profile"],

  ["/opfs-access.mjs", "opfs.access"],
  ["/media-errors.mjs", "media.errors"],
]);
const audioImports = new Map([
  ["mediabunny", "/mediabunny.mjs"],
  ["@clipbuilder/contracts", "/audio-contracts.mjs"],
  ...[...audioModules].map(([path, name]) => [`./${name}`, path]),
]);
async function readAudioModule(name) {
  const source = await readFile(
    new URL(`../../src/features/media/${name}.ts`, import.meta.url),
    "utf8",
  );
  let body = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  for (const [specifier, path] of audioImports)
    body = body.replaceAll(JSON.stringify(specifier), JSON.stringify(path));
  return body;
}

const files = new Map([
  ["/", [new URL("./index.html", import.meta.url), "text/html"]],
  ["/main.mjs", [new URL("./main.mjs", import.meta.url), "text/javascript"]],

  [
    "/sync-access.mjs",
    [new URL("./sync-access.mjs", import.meta.url), "text/javascript"],
  ],
  [
    "/worker.mjs",
    [new URL("./worker.mjs", import.meta.url), "text/javascript"],
  ],
  [
    "/mediabunny.mjs",
    [
      new URL(
        "../../node_modules/mediabunny/dist/bundles/mediabunny.mjs",
        import.meta.url,
      ),
      "text/javascript",
    ],
  ],
]);
export function createFeasibilityServer() {
  return createServer(async (request, response) => {
    const entry = files.get(request.url);
    const audioModule = audioModules.get(request.url);
    const contracts = request.url === "/audio-contracts.mjs";
    if (request.method !== "GET" || (!entry && !audioModule && !contracts)) {
      response.writeHead(404).end();
      return;
    }
    try {
      const body = contracts
        ? `export const LOCAL_WORKSPACE_LIMITS = ${JSON.stringify(LOCAL_WORKSPACE_LIMITS)}; export const PUBLIC_LIMITS = ${JSON.stringify(PUBLIC_LIMITS)}; export const SAFE_ERROR_MESSAGES = ${JSON.stringify(SAFE_ERROR_MESSAGES)}; export const isSourceWithinLimitProfile = ${isSourceWithinLimitProfile.toString()}; const LIMIT_PROFILES = { public: PUBLIC_LIMITS };`
        : audioModule
          ? await readAudioModule(audioModule)
          : await readFile(fileURLToPath(entry[0]));
      response.writeHead(200, {
        "Content-Type": entry?.[1] ?? "text/javascript",
        "Cache-Control": "no-store",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; worker-src 'self'; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self';",
      });
      response.end(body);
    } catch {
      response.writeHead(500).end();
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = createFeasibilityServer();
  server.listen(4185, "127.0.0.1", () =>
    process.stdout.write(
      `CL-005 loopback spike PID ${process.pid}, port 4185\n`,
    ),
  );
  const stop = () => {
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
    server.close();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
