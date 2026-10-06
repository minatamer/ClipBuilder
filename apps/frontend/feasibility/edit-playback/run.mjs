import "../../../../test/deterministic.environment.ts";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { once } from "node:events";

const rootRequire = createRequire(resolve("../../package.json"));
const viteRequire = createRequire(rootRequire.resolve("vitest/package.json"));
const { build } = createRequire(viteRequire.resolve("vite/package.json"))(
  "esbuild",
);
const chromium =
  process.env.CHROMIUM_PATH ??
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : "chromium");
await stat(chromium);
const directory = await mkdtemp(
  join(tmpdir(), "clipbuilder-playback-synthetic-"),
);
const deadline = AbortSignal.timeout(180000);
let server, browser, socket;
const pending = new Map();
const child = async (executable, args) => {
  const process = spawn(executable, args, {
    windowsHide: true,
    stdio: "ignore",
    signal: AbortSignal.timeout(10000),
  });
  const [code] = await once(process, "exit");
  assert.equal(code, 0, "synthetic-process-failed");
};
try {
  await build({
    entryPoints: [resolve("feasibility/edit-playback/browser.tsx")],
    bundle: true,
    outfile: join(directory, "browser.js"),
    platform: "browser",
    format: "esm",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
  });
  let bytes;
  const bundle = await readFile(join(directory, "browser.js"));
  let stallUntil = 0;
  const serve = async (request, response) => {
    if (request.url === "/synthetic" && request.method === "POST") {
      const chunks = [];
      let size = 0;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 20 * 1024 * 1024) {
          response.writeHead(413).end();
          return;
        }
        chunks.push(chunk);
      }
      bytes = Buffer.concat(chunks);
      await writeFile(join(directory, "source.mp4"), bytes);
      response.writeHead(204).end();
      return;
    }
    if (request.url?.startsWith("/proof")) {
      response
        .writeHead(200, { "Content-Type": "text/html" })
        .end(
          '<div id="root"></div><script type="module" src="/browser.js"></script>',
        );
      return;
    }
    if (request.url === "/browser.js") {
      response
        .writeHead(200, { "Content-Type": "text/javascript" })
        .end(bundle);
      return;
    }
    if (request.url !== "/source.mp4" || !bytes) {
      response.writeHead(404).end();
      return;
    }
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2]
      ? Math.min(Number(range[2]), bytes.length - 1)
      : bytes.length - 1;
    if (start > end || start >= bytes.length) {
      response.writeHead(416).end();
      return;
    }
    response.writeHead(range ? 206 : 200, {
      "Content-Type": "video/mp4",
      "Content-Length": end - start + 1,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      ...(range
        ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` }
        : {}),
    });
    const cutoff = Math.min(bytes.length - 1, 180000);
    if (start < cutoff)
      response.write(bytes.subarray(start, Math.min(end + 1, cutoff)));
    const timer = setTimeout(
      () => response.end(bytes.subarray(Math.max(start, cutoff), end + 1)),
      Math.max(0, stallUntil - Date.now()),
    );
    response.once("close", () => clearTimeout(timer));
  };
  server = createServer((request, response) => {
    void serve(request, response).catch(() => response.destroy());
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  browser = spawn(
    chromium,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--disable-background-networking",
      "--autoplay-policy=no-user-gesture-required",
      "--remote-debugging-port=0",
      `--user-data-dir=${join(directory, "profile")}`,
      "about:blank",
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let spawnFailed = false;
  browser.once("error", () => {
    spawnFailed = true;
  });
  let debug;
  for (let n = 0; n < 100; n++) {
    if (spawnFailed) break;
    try {
      debug = (
        await readFile(join(directory, "profile", "DevToolsActivePort"), "utf8")
      ).split("\n")[0];
      break;
    } catch {
      await wait(100);
    }
  }
  assert.ok(debug && /^\d+$/u.test(debug), "synthetic-browser-unavailable");
  const pages = await (
    await fetch(`http://127.0.0.1:${debug}/json/list`, { signal: deadline })
  ).json();
  socket = new WebSocket(
    pages.find((page) => page.type === "page").webSocketDebuggerUrl,
  );
  await once(socket, "open", { signal: deadline });
  let id = 0;
  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      deadline.throwIfAborted();
      const ordinal = ++id;
      const timer = setTimeout(() => {
        pending.delete(ordinal);
        reject(new Error("synthetic-browser-command-timeout"));
      }, 60000);
      pending.set(ordinal, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      try {
        socket.send(JSON.stringify({ id: ordinal, method, params }));
      } catch {
        pending.get(ordinal)?.reject(new Error("synthetic-browser-closed"));
        pending.delete(ordinal);
      }
    });
  let externalRequests = 0;
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Fetch.requestPaused") {
      const url = new URL(message.params.request.url);
      const allowed = url.hostname === "127.0.0.1" && Number(url.port) === port;
      if (!allowed) externalRequests++;
      void call(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", {
        requestId: message.params.requestId,
        ...(allowed ? {} : { errorReason: "BlockedByClient" }),
      }).catch(() => {});
    }
    const result = pending.get(message.id);
    if (!result) return;
    pending.delete(message.id);
    if (message.error)
      result.reject(new Error("synthetic-browser-command-failed"));
    else result.resolve(message.result);
  });
  await call("Fetch.enable", {
    patterns: [{ urlPattern: "http*", requestStage: "Request" }],
  });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 600,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    assert.ok(!result.exceptionDetails, "synthetic-browser-evaluation-failed");
    return result.result.value;
  };
  await call("Page.navigate", {
    url: `http://127.0.0.1:${port}/proof?mode=generate`,
  });
  await wait(700);
  const generated = await evaluate("window.playbackProof.generate()");
  const mediaPath = process.argv
    .find((arg) => arg.startsWith("--synthetic-media="))
    ?.slice("--synthetic-media=".length);
  if (mediaPath) await writeFile(mediaPath, bytes, { flag: "wx" });
  process.stdout.write(
    JSON.stringify({ synthetic: generated, aiCalls: 0, cloudCalls: 0 }) + "\n",
  );
  await evaluate("window.playbackProof.stop()");
  for (const mode of ["legacy", "current"]) {
    stallUntil = Date.now() + 7000;
    await call("Page.navigate", {
      url: `http://127.0.0.1:${port}/proof?mode=${mode}`,
    });
    await wait(700);
    await evaluate("window.playbackProof.play()");
    await wait(11500);
    const stats = await evaluate("window.playbackProof.stats()");
    let stalledFrameAdvance = 0;
    for (let i = 0; i + 20 < stats.media.length; i++)
      if (
        stats.media[i] > 0.2 &&
        Math.abs(stats.media[i + 20] - stats.media[i]) < 0.02
      )
        stalledFrameAdvance = Math.max(
          stalledFrameAdvance,
          stats.frames[i + 20] - stats.frames[i],
        );
    const result = {
      mode,
      waitingEvents: stats.waiting,
      seeks: stats.seeks,
      stalledFrameAdvance,
      finalFrame: stats.frames.at(-1),
      ended: stats.ended,
      videoNodes: stats.videoNodes,
      aiCalls: 0,
      cloudCalls: 0,
    };
    process.stdout.write(JSON.stringify(result) + "\n");
    if (process.argv.includes("--assert-buffer-fix") && mode === "current")
      assert.ok(
        stalledFrameAdvance <= 2,
        "player-clock-advanced-through-buffering",
      );
    if (mode === "current") {
      assert.equal(
        stats.videoNodes,
        1,
        "video-remounted-at-overlay-or-focus-boundary",
      );
      for (let i = 1; i < stats.media.length; i++)
        assert.ok(
          stats.media[i] >= stats.media[i - 1] - 0.001,
          "unsolicited-decoded-media-rewind",
        );
      await wait(6000);
      const completed = await evaluate("window.playbackProof.stats()");
      assert.equal(completed.ended, true);
      assert.equal(completed.frames.at(-1), 299);
      process.stdout.write(
        JSON.stringify({
          continuousPlaybackCompleted: true,
          finalFrame: 299,
          decodedRewinds: 0,
        }) + "\n",
      );
      const proofDirectory = process.argv
        .find((arg) => arg.startsWith("--proof-directory="))
        ?.slice("--proof-directory=".length);
      let bounds;
      for (const [frame, active, visual] of [
        [9, ["Clear"], false],
        [18, [], false],
        [27, ["spoken"], false],
        [45, ["words"], false],
        [75, [], true],
      ]) {
        await evaluate(`window.playbackProof.seek(${frame})`);
        await wait(400);
        const layers = await evaluate("window.playbackProof.layers()");
        assert.deepEqual(layers.activeWords, active);
        assert.equal(layers.visual, visual);
        if (frame < 60) {
          assert.equal(layers.captionFont, "64px");
          if (bounds) assert.deepEqual(layers.captionBounds, bounds);
          else bounds = layers.captionBounds;
        }
        if (proofDirectory && [27, 75].includes(frame)) {
          const screenshot = await call("Page.captureScreenshot", {
            format: "png",
          });
          await writeFile(
            join(proofDirectory, `synthetic-edit-${frame}.png`),
            Buffer.from(screenshot.data, "base64"),
          );
        }
      }
      process.stdout.write(
        JSON.stringify({
          captionCues: "word/silence/word/word",
          captionFont: 64,
          stableCaptionBounds: true,
          visualInserted: true,
        }) + "\n",
      );
    }
    await evaluate("window.playbackProof.stop()");
  }
  assert.equal(externalRequests, 0, "unexpected-non-loopback-browser-request");
  await call("Browser.close");
  socket.close();
  if (browser.exitCode === null)
    await once(browser, "exit", { signal: AbortSignal.timeout(10000) });
  browser = undefined;
} finally {
  for (const command of pending.values())
    command.reject(new Error("synthetic-browser-cleanup"));
  pending.clear();
  socket?.close();
  if (browser?.pid && browser.exitCode === null) {
    if (process.platform === "win32")
      await child("taskkill.exe", ["/PID", String(browser.pid), "/T", "/F"]);
    else browser.kill("SIGTERM");
  }
  server?.closeAllConnections();
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
  assert.ok(
    resolve(dirname(directory)) === resolve(tmpdir()) &&
      basename(directory).startsWith("clipbuilder-playback-synthetic-"),
  );
  await rm(directory, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 100,
  });
}
