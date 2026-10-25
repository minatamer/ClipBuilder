import { expect, it, vi } from "vitest";
import { createServer, request } from "node:http";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createRequire } from "node:module";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";
import type {
  NextServerOptions,
  RequestHandler,
} from "../apps/frontend/node_modules/next/dist/server/next.js";
import { listenOwner, ownerRequest } from "./owner-http.ts";

async function clearUploadProof(root: string) {
  const actual = await realpath(root),
    parent = await realpath(tmpdir()),
    rel = relative(parent, actual);
  if (
    !rel ||
    rel.startsWith("..") ||
    isAbsolute(rel) ||
    !rel.startsWith("clipbuilder-large-upload-")
  )
    throw new Error("invalid_upload_proof_cleanup");
  await rm(actual, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
}

it("streams a complete large upload through the actual pinned Next route without document-proxy body cloning", async () => {
  vi.stubEnv("NEXT_TELEMETRY_DISABLED", "1");
  const guardedFetch = globalThis.fetch;
  vi.stubGlobal("fetch", ((input, init) =>
    String(input) === "https://registry.npmjs.org/-/package/next/dist-tags"
      ? Promise.resolve(Response.json({ latest: "16.3.8", canary: "16.3.8" }))
      : guardedFetch(input, init)) satisfies typeof fetch);
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-large-upload-"));
  let app: { close: () => Promise<void> } | undefined;
  type Watcher = { close: () => void; removeAllListeners: () => void };
  const watchers = new Set<Watcher>();
  const watchpack: {
    prototype: Watcher & { watch: (...args: unknown[]) => void };
  } = createRequire(import.meta.url)(
    "../apps/frontend/node_modules/next/dist/compiled/watchpack",
  );
  const originalWatch = watchpack.prototype.watch;
  const watchSpy = vi
    .spyOn(watchpack.prototype, "watch")
    .mockImplementation(function (this: Watcher, ...args: unknown[]) {
      watchers.add(this);
      return Reflect.apply(originalWatch, this, args);
    });
  const server = createServer();
  let linked = false;
  try {
    await symlink(
      await realpath(resolve("apps/frontend/node_modules")),
      join(root, "node_modules"),
      "junction",
    );
    linked = true;
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        private: true,
        name: "synthetic-upload-proof",
        version: "1.0.0",
      }),
    );
    await writeFile(
      join(root, "next.config.mjs"),
      `export default {devIndicators:false,poweredByHeader:false,outputFileTracingRoot:${JSON.stringify(root)}};`,
    );
    for (const name of ["proxy.ts", "browser-security-policy.ts"]) {
      const compiled = transpileModule(
        await readFile(resolve("apps/frontend/src", name), "utf8"),
        {
          compilerOptions: {
            module: ModuleKind.ESNext,
            target: ScriptTarget.ES2022,
          },
        },
      );
      await writeFile(
        join(root, name.replace(".ts", ".js")),
        compiled.outputText,
      );
    }
    const route = join(root, "app/api/local/open/video");
    await mkdir(route, { recursive: true });
    await writeFile(
      join(route, "route.js"),
      `import {createHash} from 'node:crypto';export const runtime='nodejs';export async function POST(request){let bytes=0;const hash=createHash('sha256');for await(const part of request.body){bytes+=part.byteLength;hash.update(part);}return Response.json({bytes,digest:hash.digest('hex')});}`,
    );
    const ready = join(root, "app/api/ready");
    await mkdir(ready, { recursive: true });
    await writeFile(
      join(ready, "route.js"),
      `export function GET(){return Response.json({ready:true});}`,
    );
    const next: (options: NextServerOptions & { webpack: boolean }) => {
      prepare: () => Promise<void>;
      close: () => Promise<void>;
      getRequestHandler: () => RequestHandler;
    } = createRequire(import.meta.url)(
      "../apps/frontend/node_modules/next/dist/server/next.js",
    );
    const nextApp = next({
      dev: true,
      dir: root,
      hostname: "127.0.0.1",
      webpack: true,
    });
    app = nextApp;
    await nextApp.prepare();
    const handler = nextApp.getRequestHandler();
    server.on("request", (req, res) => void handler(req, res));
    const port = await listenOwner(server);
    const readyResult = await ownerRequest(port, "/api/ready");
    expect(readyResult.status).toBe(200);
    expect(readyResult.headers["content-security-policy"]).toContain(
      "'strict-dynamic'",
    );
    const total = 64 * 1024 ** 2 + 37,
      chunk = Buffer.alloc(256 * 1024, 0x5a),
      expected = createHash("sha256");
    let client: ReturnType<typeof request>;
    const response = new Promise<{ status: number; body: string }>(
      (done, fail) => {
        client = request(
          {
            host: "127.0.0.1",
            port,
            path: "/api/local/open/video",
            method: "POST",
            headers: {
              "Content-Length": total,
              "Content-Type": "video/mp4",
              Origin: `http://127.0.0.1:${port}`,
              "Sec-Fetch-Site": "same-origin",
            },
            signal: AbortSignal.timeout(90_000),
          },
          (res) => {
            const parts: Buffer[] = [];
            res.on("data", (part) => parts.push(Buffer.from(part)));
            res.on("error", fail);
            res.on("end", () =>
              done({
                status: res.statusCode ?? 0,
                body: Buffer.concat(parts).toString(),
              }),
            );
          },
        );
        client.on("error", fail);
      },
    );
    async function* body() {
      for (let offset = 0; offset < total; offset += chunk.length) {
        const part = chunk.subarray(0, Math.min(chunk.length, total - offset));
        expected.update(part);
        yield part;
      }
    }
    const [result] = await Promise.all([
      response,
      pipeline(Readable.from(body()), client!),
    ]);
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      bytes: total,
      digest: expected.digest("hex"),
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    if (app) await app.close();
    for (const watcher of watchers) {
      watcher.close();
      watcher.removeAllListeners();
    }
    watchSpy.mockRestore();
    await new Promise((done) => setTimeout(done, 250));
    if (linked) await unlink(join(root, "node_modules"));
    await clearUploadProof(root);
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  }
}, 180_000);
