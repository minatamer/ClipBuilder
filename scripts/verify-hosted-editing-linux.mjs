// Opt-in local image probe. Bundle into owned scratch; never ship in an app image.
import "../test/deterministic.environment.ts";
import assert from "node:assert/strict";
import net from "node:net";
import { createServer } from "node:http";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { randomBytes, createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  readdir,
  rm,
  stat,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

assert.equal(process.platform, "linux");
assert.notEqual(process.getuid(), 0);
assert.equal(process.env.NODE_ENV, "test");
assert.equal(process.env.FAKE_MODE, "true");
assert.equal(process.env.PAID_DEMO_ENABLED, "false");
const realFetch = globalThis.fetch,
  connect = net.Socket.prototype.connect;
let externalAttempts = 0;
net.Socket.prototype.connect = function (...args) {
  const values = Array.isArray(args[0]) ? args[0] : args;
  const value = values[0];
  const host =
    typeof value === "object" && value !== null
      ? value.host
      : typeof value === "number"
        ? values[1]
        : undefined;
  if (host && !["127.0.0.1", "localhost", "::1"].includes(host)) {
    externalAttempts++;
    throw new Error("external_socket_forbidden");
  }
  return Reflect.apply(connect, this, args);
};
globalThis.fetch = (input, init) => {
  if (
    !["127.0.0.1", "localhost", "[::1]"].includes(
      new URL(String(input)).hostname,
    )
  ) {
    externalAttempts++;
    throw new Error("external_fetch_forbidden");
  }
  return realFetch(input, init);
};
const [
  { createHostedEditingWorkflow, editingCookie, EDITING_CSRF_COOKIE },
  { fakeOwnerAnalysis },
  { fakeOwnerClipPreparation },
  { localWorkerPort },
  { nativeEnvironment },
  { HOSTED_EDITING_POLICY },
] = await Promise.all([
  import("../apps/backend/local/hosted-workflow.ts"),
  import("../apps/backend/local/fake-analysis.ts"),
  import("../apps/backend/local/fake-clips.ts"),
  import("../apps/backend/local/worker-port.ts"),
  import("../apps/backend/local/local-mode.ts"),
  import("../packages/contracts/local/hosted-editing.ts"),
]);
const run = promisify(execFile),
  pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const directory = await mkdtemp(join(tmpdir(), "clipbuilder-hosted-linux-")),
  root = join(directory, "workspaces");
await mkdir(root);
const state = join(directory, "worker.json"),
  token = randomBytes(32).toString("hex");
await writeFile(
  state,
  JSON.stringify({
    root,
    workerToken: token,
    tools: { ffmpeg: "/usr/bin/ffmpeg", ffprobe: "/usr/bin/ffprobe" },
    chromium: "/usr/bin/chromium",
    overlayBundle: "/app/media/editing-overlay",
  }),
  { mode: 0o600 },
);
const worker = spawn(process.execPath, ["/app/media/dist/editing-worker.js"], {
  stdio: ["ignore", "ignore", "inherit", "ipc"],
  env: { ...nativeEnvironment(directory), CLIPBUILDER_LOCAL_STATE: state },
});
const exited = new Promise((resolve) => worker.once("close", resolve));
let flow,
  browser,
  server,
  stage = "worker-startup",
  now = Date.now(),
  peakScratch = 0,
  peakMemory = 0;
const counts = {
  transcribe: 0,
  select: 0,
  plan: 0,
  image: 0,
  inspect: 0,
  clip: 0,
};
const metrics = {};
async function wait(read, label, timeout = 120000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const value = await read();
    if (value) return value;
    await pause(50);
  }
  throw new Error("probe_timeout_" + label);
}
async function scratch(path) {
  let bytes = 0;
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    try {
      if (entry.isDirectory()) bytes += await scratch(child);
      else if (entry.isFile()) bytes += (await stat(child)).size;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return bytes;
}
let monitoring;
const monitor = setInterval(() => {
  if (monitoring) return;
  monitoring = Promise.all([
    scratch(directory),
    readFile("/sys/fs/cgroup/memory.current", "utf8"),
  ])
    .then(([disk, memory]) => {
      peakScratch = Math.max(peakScratch, disk);
      peakMemory = Math.max(peakMemory, Number(memory));
    })
    .finally(() => {
      monitoring = undefined;
    });
}, 100);
try {
  await wait(
    async () => {
      if (worker.exitCode !== null) throw new Error("packaged_worker_exited");
      return fetch("http://127.0.0.1:4200/health", {
        headers: { Authorization: "Bearer " + token },
      }).then(
        async (response) => {
          await response.body?.cancel();
          return response.ok;
        },
        () => false,
      );
    },
    "worker_startup",
    15000,
  );
  stage = "fixture";
  const source = join(directory, "synthetic.mp4");
  await run(
    "/usr/bin/ffmpeg",
    [
      "-nostdin",
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=blue:size=160x90:rate=30:duration=4",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=4",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-threads",
      "2",
      source,
    ],
    { timeout: 20000 },
  );
  const bytes = await readFile(source),
    total = HOSTED_EDITING_POLICY.chunkBytes + 123;
  const padding = Buffer.alloc(total - bytes.length);
  padding.writeUInt32BE(padding.length);
  padding.write("free", 4);
  const uploaded = Buffer.concat([bytes, padding]);
  const native = localWorkerPort(4200, token);
  let origin = "";
  server = createServer((req, res) => {
    void (async () => {
      if (req.url?.startsWith("/api/local/")) {
        req.url = req.url.replace("/api/local/", "/");
        req.headers.origin = origin;
        req.headers["sec-fetch-site"] = "same-origin";
        const csrf = editingCookie(req.headers.cookie, EDITING_CSRF_COOKIE);
        if (csrf) req.headers["x-csrf-token"] = csrf;
        await flow.dispatch(req, res);
        return;
      }
      if (req.url === "/favicon.ico") {
        res.writeHead(204).end();
        return;
      }
      const name = {
        "/": "index.html",
        "/app.js": "app.js",
        "/app.css": "app.css",
      }[req.url];
      if (!name) {
        res.writeHead(404).end();
        return;
      }
      res
        .writeHead(200, {
          "Content-Type": name.endsWith("js")
            ? "text/javascript"
            : name.endsWith("css")
              ? "text/css"
              : "text/html",
          "Content-Security-Policy":
            "default-src 'self' blob: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'",
        })
        .end(await readFile(join("/proof/ui", name)));
    })().catch(() => res.destroy());
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = "http://localhost:" + server.address().port;
  flow = createHostedEditingWorkflow({
    root,
    origin,
    ttlMs: 180000,
    now: () => now,
    siteKey: "synthetic-site",
    aiMode: "synthetic-ai",
    sourceLimits: { bytes: 20 * 1024 ** 2, durationMs: 60000 },
    abuse: { verify: async () => true },
    capacity: async (_directory, peak) => {
      assert.ok(peak >= 0 && peak <= HOSTED_EDITING_POLICY.scratchBytes);
      metrics.reservationBytes = Math.max(metrics.reservationBytes ?? 0, peak);
    },
    media: async (job, signal) => {
      counts[job.operation]++;
      return native(job, signal);
    },
    providers: () => ({
      analysis: {
        ...fakeOwnerAnalysis,
        async transcribe(...args) {
          counts.transcribe++;
          return fakeOwnerAnalysis.transcribe(...args);
        },
        async select(...args) {
          counts.select++;
          return fakeOwnerAnalysis.select(...args);
        },
      },
      clipPreparation: {
        ...fakeOwnerClipPreparation,
        async plan(...args) {
          counts.plan++;
          return fakeOwnerClipPreparation.plan(...args);
        },
        async image(...args) {
          counts.image++;
          return fakeOwnerClipPreparation.image(...args);
        },
      },
    }),
  });
  const { openBrowser } = createRequire("/app/media/package.json")(
    "@remotion/renderer",
  );
  browser = await openBrowser("chrome", {
    browserExecutable: "/usr/bin/chromium",
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
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto({ url: origin + "/", timeout: 10000 });
  stage = "shared-browser-editor";
  const evaluated = await page._client().send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async()=>{
    window.turnstile={render(_node,options){queueMicrotask(()=>options.callback('synthetic-proof'));return 'synthetic';},remove(){}};
    const wait=async(fn,label='step')=>{for(let i=0;i<2400;i++){const value=fn();if(value)return value;await new Promise(done=>setTimeout(done,50));}throw new Error('linux_ui_timeout_'+label+'_'+[...document.querySelectorAll('.clip-state')].map(n=>n.textContent).join('_'));};
    const button=text=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===text);
    const input=await wait(()=>document.querySelector('.upload-card input:not(:disabled)'));
    if(document.body.textContent.includes('YouTube'))throw new Error('hosted_youtube_visible');
    const bytes=Uint8Array.from(atob(${JSON.stringify(bytes.toString("base64"))}),c=>c.charCodeAt(0)),padding=new Uint8Array(${padding.length});new DataView(padding.buffer).setUint32(0,padding.length);padding.set([102,114,101,101],4);
    const transfer=new DataTransfer();transfer.items.add(new File([bytes,padding],'synthetic.mp4',{type:'video/mp4'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
    await wait(()=>button('Add clip')&&!button('Add clip').matches(':disabled'),'upload');button('Add clip').click();
    const change=async(node,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(requestAnimationFrame);};
    await wait(()=>document.querySelector('[aria-label="Clip 1 end"]'));
    await change(document.querySelector('[aria-label="Clip 1 start"]'),'00:00:01');await change(document.querySelector('[aria-label="Clip 1 end"]'),'00:00:02');
    document.querySelector('.selection input[type="checkbox"]').click();await wait(()=>button('Use clips')&&!button('Use clips').disabled);button('Use clips').click();await wait(()=>button('Process clips')&&!button('Process clips').disabled);button('Process clips').click();
    const ready=()=>document.querySelector('.editor-panels:not([hidden])')&&document.querySelector('a[aria-label="Download clip"]');
    await wait(ready,'initial_export');const first=await (await fetch(ready().href)).arrayBuffer();
    const font=[...document.querySelectorAll('.clip-editor label')].find(n=>n.firstChild?.textContent.trim().startsWith('Font size')).querySelector('input');await change(font,'72');
    await wait(()=>button('Apply changes'));button('Apply changes').click();await wait(()=>button('Export clip'));button('Export clip').click();
    await wait(ready,'edited_export');const last=await (await fetch(ready().href)).arrayBuffer();
    const workspace=await (await fetch('/api/local/workspace')).json();const list=await (await fetch('/api/local/workspace/'+workspace.id+'/clips')).json();
    return {workspaceId:workspace.id,clipId:list.clips[0].id,revision:list.clips[0].revision,firstBytes:first.byteLength,lastBytes:last.byteLength,exclusive:!document.querySelector('.moment-selection').getClientRects().length,edit:list.clips[0].edit};
  })()`,
  });
  if (evaluated.value.exceptionDetails)
    throw new Error(
      "shared_browser_editor_failed_" +
        JSON.stringify(evaluated.value.exceptionDetails),
    );
  const result = evaluated.value.result.value;
  assert.equal(result.exclusive, true);
  assert.ok(result.firstBytes > 1000 && result.lastBytes > 1000);
  assert.equal(result.edit.captions.fontSize, 72);
  const workspace = join(root, result.workspaceId);
  assert.equal(
    createHash("sha256")
      .update(await readFile(join(workspace, "source.mp4")))
      .digest("hex"),
    createHash("sha256").update(uploaded).digest("hex"),
  );
  const video = join(workspace, result.clipId + ".r1.mp4");
  const profile = JSON.parse(
    (
      await run("/usr/bin/ffprobe", [
        "-v",
        "error",
        "-show_streams",
        "-show_format",
        "-of",
        "json",
        video,
      ])
    ).stdout,
  );
  assert.ok(
    profile.streams.some(
      (stream) =>
        stream.codec_name === "h264" &&
        stream.width === 1080 &&
        stream.height === 1920,
    ),
  );
  assert.ok(profile.streams.some((stream) => stream.codec_name === "aac"));
  assert.ok(Math.abs(Number(profile.format.duration) - 1) < 0.1);
  await run(
    "/usr/bin/ffmpeg",
    ["-nostdin", "-v", "error", "-i", video, "-f", "null", "-"],
    { timeout: 20000 },
  );
  stage = "native-cancel-retry";
  const cookies = await page
    ._client()
    .send("Network.getCookies", { urls: [origin] });
  const cookie = cookies.value.cookies
      .map((value) => value.name + "=" + value.value)
      .join("; "),
    csrf = editingCookie(cookie, EDITING_CSRF_COOKIE);
  const headers = {
    Origin: origin,
    "Sec-Fetch-Site": "same-origin",
    Cookie: cookie,
    "X-CSRF-Token": csrf,
    "Content-Type": "application/json",
  };
  const api = async (path, method = "GET", body) => {
    const response = await fetch(origin + "/api/local" + path, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.ok(response.ok, "local_api_" + response.status);
    return response.status === 204 ? null : response.json();
  };
  const base = "/workspace/" + result.workspaceId + "/clips",
    clip = base + "/" + result.clipId;
  const movedPicture = {
    ...result.edit.visuals[0],
    box: { x: 0.25, y: 0.45, width: 0.45, height: 0.25 },
    entrance: "slide",
    exit: "fade",
    animationFrames: 6,
  };
  const edited = await api(clip + "/edit", "POST", {
    operationId: crypto.randomUUID(),
    expectedRevision: result.revision,
    baseHash: result.edit.baseHash,
    operations: [
      {
        kind: "caption",
        style: {
          ...result.edit.captions,
          box: { ...result.edit.captions.box, y: 0.12 },
        },
      },
      { kind: "video-look", look: { preset: "mono", strength: 100 } },
      { kind: "visual-upsert", cue: movedPicture },
    ],
  });
  const revision = edited.clips[0].revision;
  assert.equal(edited.clips[0].edit.visuals[0].entrance, "slide");
  assert.equal(edited.clips[0].edit.captions.box.y, 0.12);
  await api(clip + "/render", "POST", {
    operationId: crypto.randomUUID(),
    expectedRevision: revision,
  });
  await wait(() => counts.clip === 3, "third_native");
  await api(base + "/cancel", "POST");
  await wait(async () => {
    const list = await api(base);
    return !list.active && list.clips[0].state === "canceled";
  }, "canceled");
  await api(clip + "/retry", "POST", {
    operationId: crypto.randomUUID(),
    expectedRevision: revision,
  });
  await wait(async () => {
    const list = await api(base);
    return !list.active && list.clips[0].state === "ready";
  }, "retried");
  assert.deepEqual(counts, {
    transcribe: 1,
    select: 0,
    plan: 1,
    image: 1,
    inspect: 1,
    clip: 4,
  });
  const finalRevision = (await api(base)).clips[0].outputs.at(-1).revision;
  const monoPixel = (
    await run(
      "/usr/bin/ffmpeg",
      [
        "-nostdin",
        "-v",
        "error",
        "-ss",
        "0.5",
        "-i",
        join(workspace, result.clipId + `.r${finalRevision}.mp4`),
        "-vf",
        "crop=2:2:20:20,format=rgb24",
        "-frames:v",
        "1",
        "-f",
        "rawvideo",
        "-",
      ],
      { encoding: "buffer", timeout: 20000 },
    )
  ).stdout;
  assert.equal(monoPixel.length, 12);
  assert.ok(
    Math.max(...monoPixel.subarray(0, 3)) -
      Math.min(...monoPixel.subarray(0, 3)) <
      5,
    "native_mono_filter_missing",
  );
  await api("/session", "DELETE");
  assert.deepEqual(await readdir(root), []);
  stage = "expiry";
  const start = await fetch(origin + "/api/local/session", {
    method: "POST",
    headers: {
      Origin: origin,
      "Sec-Fetch-Site": "same-origin",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startNonce: crypto.randomUUID(),
      turnstileToken: "synthetic",
    }),
  });
  assert.equal(start.status, 201);
  const nextCookie = start.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  const nextHeaders = {
    ...headers,
    Cookie: nextCookie,
    "X-CSRF-Token": editingCookie(nextCookie, EDITING_CSRF_COOKIE),
  };
  const begun = await fetch(origin + "/api/local/upload", {
    method: "POST",
    headers: nextHeaders,
    body: JSON.stringify({ bytes: 100 }),
  });
  assert.equal(begun.status, 201);
  now += 180001;
  const expired = await fetch(origin + "/api/local/session", {
    headers: nextHeaders,
  });
  assert.deepEqual(await expired.json(), { active: false });
  await wait(async () => !(await readdir(root)).length, "expiry_cleanup");
  metrics.result = {
    synthetic: true,
    platform: process.platform,
    nonRoot: true,
    chunkedUploadBytes: total,
    sourceHashBound: true,
    captionFontSize: 72,
    captionPositionSaved: true,
    picturePositionMotionSaved: true,
    decodedMonoFilter: true,
    outputWidth: 1080,
    outputHeight: 1920,
    outputSeconds: Number(profile.format.duration),
    outputBytes: Number(profile.format.size),
    canceled: true,
    retryReusedPreparation: true,
    exitClean: true,
    expiryClean: true,
    counts,
    externalAttempts,
  };
} catch (error) {
  process.stderr.write(
    "Linux hosted probe failed during " +
      stage +
      ": " +
      (error instanceof Error ? error.message : "unknown") +
      "\n",
  );
  process.exitCode = 1;
} finally {
  clearInterval(monitor);
  await monitoring;
  await browser?.close({ silent: true });
  await flow?.close();
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  if (worker.connected) worker.send("stop");
  const force = setTimeout(() => worker.kill("SIGKILL"), 5000);
  await exited;
  clearTimeout(force);
  assert.deepEqual(await readdir(root), []);
  await rm(directory, { recursive: true, force: true });
}
assert.equal(externalAttempts, 0);
if (metrics.result)
  process.stdout.write(
    JSON.stringify({
      ...metrics.result,
      peakScratchBytes: peakScratch,
      peakContainerMemoryBytes: peakMemory,
      reservationBytes: metrics.reservationBytes,
    }) + "\n",
  );
