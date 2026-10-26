import { expect, it, vi } from "vitest";
import { spawn } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  open,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createServer } from "node:net";
import { startBackend } from "../apps/backend/src/server.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import {
  ownerProcessTree,
  forceOwnerTree,
} from "../scripts/local-processes.mjs";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { discoverOwnerHost } from "../scripts/local-discovery.mjs";
import { ownerRequest } from "./owner-http.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/local/index.ts";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
declare global {
  function clipbuilderLocalApplicationReady(): boolean;
}
const fixture = vi.hoisted(() => ({ root: "" }));
vi.mock("../apps/backend/local/owner-storage.ts", async (original) => ({
  ...(await original<object>()),
  resolveOwnerStorage: async (location = "downloads") =>
    join(fixture.root, location),
}));

it("runs the normal app with local controls, real native upload/ranges and fake AI, then drains its worker", async () => {
  for (const port of [3000, 4000, 4200])
    await new Promise<void>((done, fail) => {
      const probe = createServer();
      probe.once("error", () => fail(new Error("proof_port_conflict")));
      probe.listen(port, "127.0.0.1", () => probe.close(() => done()));
    });
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-same-app-proof-"));
  fixture.root = root;
  const transport: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      !["3000", "4000", "4200"].includes(url.port) ||
      (init?.body !== undefined &&
        typeof init.body !== "string" &&
        !Buffer.isBuffer(init.body))
    )
      throw new Error("invalid_proof_transport");
    const response = await ownerRequest(Number(url.port), url.pathname, {
      method: init?.method ?? "GET",
      headers: {
        Host: url.host,
        ...Object.fromEntries(new Headers(init?.headers)),
      },
      ...(init?.body
        ? {
            body:
              typeof init.body === "string"
                ? init.body
                : Buffer.from(init.body as Uint8Array),
          }
        : {}),
      signal: init?.signal ?? AbortSignal.timeout(30_000),
    });
    return new Response(
      response.status === 204 ? null : new Uint8Array(response.body),
      {
        status: response.status,
        headers: Object.fromEntries(
          Object.entries(response.headers).filter(
            (pair): pair is [string, string] => typeof pair[1] === "string",
          ),
        ),
      },
    );
  };
  vi.stubGlobal("fetch", transport);
  await mkdir(join(root, "downloads"));
  await mkdir(join(root, "desktop"));
  const out = await open(join(root, "frontend.stdout.log"), "a", 0o600);
  const err = await open(join(root, "frontend.stderr.log"), "a", 0o600);
  let backend: Awaited<ReturnType<typeof startBackend>> | undefined;
  let frontend: ReturnType<typeof spawn> | undefined;
  let frontendIdentity:
    { pid: number; parent: number; created: string } | undefined;
  let runtime: string | undefined;
  let runtimeChildren: Awaited<ReturnType<typeof ownerProcessTree>> = [];
  let completed = false;
  let cleanupFailed = false;
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    backend = await startBackend({
      NODE_ENV: "development",
      APP_ENV: "local",
      FAKE_MODE: "true",
      PAID_DEMO_ENABLED: "false",
    });
    runtime = (await discoverOwnerHost()).runtime;
    runtimeChildren = (await ownerProcessTree(process.pid)).filter(
      (row) => row.pid !== process.pid,
    );
    frontend = spawn(
      process.execPath,
      [
        "--experimental-strip-types",
        "--import",
        pathToFileURL(resolve("test/no-env-files.mjs")).href,
        resolve("apps/frontend/node_modules/next/dist/bin/next"),
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        "3000",
      ],
      {
        cwd: resolve("apps/frontend"),
        windowsHide: true,
        env: {
          ...process.env,
          NODE_OPTIONS: "",
          NODE_ENV: "test",
          APP_ENV: "local",
        },
        stdio: ["ignore", out.fd, err.fd],
      },
    );
    [frontendIdentity] = await ownerProcessTree(frontend.pid);
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (frontend.exitCode !== null) break;
      try {
        const response = await fetch("http://localhost:3000/start", {
          signal: AbortSignal.timeout(1000),
        });
        const html = await response.text();
        ready = response.ok && html.includes("Choose your video");
      } catch {
        /* Bounded readiness probe. */
      }
      if (ready) break;
      await new Promise((done) => setTimeout(done, 100));
    }
    expect(ready).toBe(true);
    expect((await fetch("http://127.0.0.1:4000/v1/health")).status).toBe(200);
    expect(
      (await fetch("http://localhost:3000/api/sample/config")).status,
    ).toBe(200);
    const api = "http://localhost:3000/api/local";
    const capabilities = await fetch(`${api}/capabilities`);
    expect(capabilities.status).toBe(200);
    expect(await capabilities.json()).toMatchObject({
      aiMode: "synthetic-ai",
      localMedia: true,
      cloud: false,
    });
    const source = join(root, "synthetic.mp4");
    const tools = await ownerNativeTools(resolve("."));
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=blue:s=320x180:r=30:d=16",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:duration=16",
        "-c:v",
        "libx264",
        "-threads",
        "2",
        "-c:a",
        "aac",
        "-shortest",
        source,
      ],
      AbortSignal.timeout(20_000),
    );
    const bytes = await readFile(source);
    const uploaded = await fetch(`${api}/source`, {
      method: "POST",
      headers: {
        Origin: "http://localhost:3000",
        "Content-Type": "video/mp4",
        "Content-Length": String(bytes.length),
      },
      body: bytes,
    });
    expect(uploaded.status).toBe(200);
    const workspace = ownerWorkspaceSchema.parse(await uploaded.json());
    expect(workspace.mode).toBe("synthetic-ai");
    const playback = await fetch(`${api}/workspace/${workspace.id}/source`, {
      headers: { Range: "bytes=0-31" },
    });
    expect(playback.status).toBe(206);
    expect(Buffer.from(await playback.arrayBuffer())).toEqual(
      bytes.subarray(0, 32),
    );
    browser = await openBrowser("chrome", {
      browserExecutable:
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
      chromiumOptions: { headless: true },
      logLevel: "error",
    });
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
    await page.goto({ url: "http://localhost:3000/start", timeout: 15_000 });
    await page._client().send("Runtime.evaluate", {
      expression:
        "globalThis.clipbuilderLocalApplicationReady = () => document.querySelector('h1')?.textContent.includes('Choose your moments') === true && document.querySelector('.selection input[type=checkbox]')?.checked === false && [...document.querySelectorAll('button')].some(button => button.textContent.trim()==='Add clip' && !button.disabled) && document.querySelector('.source-preview video')?.readyState >= 1;",
    });
    let controlsReady = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      controlsReady = await page.evaluate(() =>
        globalThis.clipbuilderLocalApplicationReady(),
      );
      if (controlsReady) break;
      await new Promise((done) => setTimeout(done, 100));
    }
    expect(controlsReady).toBe(true);
    const screenshot = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png", fromSurface: true });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl027-integrated-start.png"),
      Buffer.from(screenshot.value.data, "base64"),
    );
    runtimeChildren.push(
      ...(await ownerProcessTree(process.pid)).filter(
        (row) => row.pid !== process.pid,
      ),
    );
    await browser.close({ silent: true });
    browser = undefined;
    expect(
      (
        await fetch(`${api}/workspace/${workspace.id}`, {
          method: "DELETE",
          headers: { Origin: "http://localhost:3000" },
        })
      ).status,
    ).toBe(204);
    expect(
      (
        await fetch(`${api}/capabilities`, {
          headers: { Origin: "http://attacker.invalid" },
        })
      ).status,
    ).toBe(403);
    completed = true;
  } finally {
    const attempt = async (operation: () => Promise<unknown> | undefined) => {
      try {
        await operation();
      } catch {
        cleanupFailed = true;
      }
    };
    await attempt(() => browser?.close({ silent: true }));
    if (frontend && frontendIdentity)
      await attempt(() => forceOwnerTree(frontend!, frontendIdentity));
    await attempt(() => out.close());
    await attempt(() => err.close());
    if (backend)
      await attempt(
        () => new Promise<void>((done) => backend!.close(() => done())),
      );
    if (runtime) {
      await attempt(async () => {
        let survivors = true;
        for (let attempt = 0; attempt < 20; attempt++) {
          const rows = await ownerProcessTree(process.pid);
          survivors = rows.some((row) =>
            runtimeChildren.some(
              (owned) => row.pid === owned.pid && row.created === owned.created,
            ),
          );
          if (!survivors) break;
          await new Promise((done) => setTimeout(done, 100));
        }
        expect(survivors).toBe(false);
        await expect(discoverOwnerHost()).rejects.toThrow(
          "owner_host_unavailable",
        );
      });
    }
    if (completed && !cleanupFailed)
      await rm(root, { recursive: true, force: true });
    else console.warn(`Synthetic app proof diagnostics: ${root}`);
    vi.unstubAllGlobals();
  }
  expect(cleanupFailed).toBe(false);
}, 90_000);
