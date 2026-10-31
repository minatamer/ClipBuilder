// Opt-in local image probe. Bundle into owned scratch; never ship in an app image.
import "../test/deterministic.environment.ts";
import assert from "node:assert/strict";
import net from "node:net";
import { createReadStream } from "node:fs";
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
  open,
  statfs,
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
  { demoUsageFixture },
] = await Promise.all([
  import("../apps/backend/local/hosted-workflow.ts"),
  import("../apps/backend/local/fake-analysis.ts"),
  import("../apps/backend/local/fake-clips.ts"),
  import("../apps/backend/local/worker-port.ts"),
  import("../apps/backend/local/local-mode.ts"),
  import("../packages/contracts/local/hosted-editing.ts"),
  import("../test/demo-usage-fixture.ts"),
]);
const { ownerOutputProfile } =
  await import("../apps/renderer/local/export-profile.ts");
const { OWNER_SOCIAL_TEXT_PRESETS } =
  await import("../packages/contracts/local/text-style.ts");
const { createHostedScratchCapacity, HOSTED_SCRATCH_VOLUME_BYTES } =
  await import("../apps/backend/local/hosted-capacity.ts");
const { PUBLIC_LIMITS } =
  await import("../packages/contracts/src/constants.ts");
const expectedProfile = ownerOutputProfile(
  { width: 160, height: 90, fps: 30 },
  30,
);
const run = promisify(execFile),
  pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const directory = await mkdtemp(join(tmpdir(), "clipbuilder-hosted-linux-")),
  root = join(directory, "workspaces");
await mkdir(root);
const capacity = await createHostedScratchCapacity(directory, root);
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
  caption: 0,
  select: 0,
  plan: 0,
  image: 0,
  inspect: 0,
  clip: 0,
  "clip-preview": 0,
};
const metrics = {};
const scratchVolume = await statfs(directory);
assert.equal(
  scratchVolume.blocks * scratchVolume.bsize,
  HOSTED_SCRATCH_VOLUME_BYTES,
);
// This small separate tmpfs proves mount-bound failure without a multi-GiB
// pressure test on the owner's 7.56-GiB Docker VM.
const preserved = "/capacity-proof/retained.mp4";
const filling = "/capacity-proof/derived.partial.mp4";
await writeFile(preserved, "synthetic-retained-output", { flag: "wx" });
let written = 0;
const file = await open(filling, "wx");
try {
  const buffer = Buffer.alloc(1024 ** 2, 7);
  await assert.rejects(
    async () => {
      for (let index = 0; index < 64; index++) {
        const part = await file.write(buffer);
        written += part.bytesWritten;
      }
    },
    { code: "ENOSPC" },
  );
} finally {
  await file.close();
  assert.equal(await readFile(preserved, "utf8"), "synthetic-retained-output");
  await rm(filling);
  await rm(preserved);
}
metrics.boundedWriteBytes = written;
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
    total = process.argv.includes("--maximum-upload")
      ? PUBLIC_LIMITS.maxSourceBytes
      : HOSTED_EDITING_POLICY.chunkBytes + 123;
  const paddingLength = total - bytes.length;
  const paddingHeader = Buffer.alloc(8);
  paddingHeader.writeUInt32BE(paddingLength);
  paddingHeader.write("free", 4);
  const expectedHash = createHash("sha256").update(bytes).update(paddingHeader);
  const zeros = Buffer.alloc(1024 ** 2);
  const fixture = await open(source, "a");
  try {
    await fixture.writeFile(paddingHeader);
    for (
      let remaining = paddingLength - 8;
      remaining > 0;
      remaining -= zeros.length
    ) {
      const chunk = zeros.subarray(0, Math.min(remaining, zeros.length));
      expectedHash.update(chunk);
      await fixture.writeFile(chunk);
    }
  } finally {
    await fixture.close();
  }
  const native = localWorkerPort(4200, token);
  let origin = "",
    clientIp = "192.0.2.1";
  server = createServer((req, res) => {
    void (async () => {
      if (req.url?.startsWith("/api/local/")) {
        req.url = req.url.replace("/api/local/", "/");
        req.headers.origin = origin;
        req.headers["x-clipbuilder-client-ip"] = clientIp;
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
    usage: demoUsageFixture(() => now).usage,
    root,
    origin,
    ttlMs: 180000,
    now: () => now,
    siteKey: "synthetic-site",
    aiMode: "synthetic-ai",
    captionGeneration: true,
    sourceLimits: {
      bytes: PUBLIC_LIMITS.maxSourceBytes,
      durationMs: PUBLIC_LIMITS.maxSourceSeconds * 1000,
    },
    abuse: { verify: async () => true },
    capacity: async (_directory, peak) => {
      await capacity(_directory, peak);
      metrics.reservationBytes = Math.max(metrics.reservationBytes ?? 0, peak);
    },
    media: async (job, signal) => {
      counts[job.operation]++;
      return native(job, signal);
    },
    providers: () => ({
      async captionTranscription(workspace, clip, signal) {
        counts.caption++;
        assert.equal(clip.base.cut.endFrame - clip.base.cut.startFrame, 30);
        return fakeOwnerAnalysis.transcribe(
          { ...workspace, source: { ...workspace.source, durationMs: 1000 } },
          signal,
        );
      },
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
  await page._client().send("Runtime.evaluate", {
    expression:
      "window.turnstile={render(_node,options){queueMicrotask(()=>options.callback('synthetic-proof'));return 'synthetic';},remove(){}};",
  });
  await wait(async () => {
    const ready = await page._client().send("Runtime.evaluate", {
      returnByValue: true,
      expression:
        'Boolean(document.querySelector(".upload-card input:not(:disabled)"))',
    });
    return ready.value.result.value;
  }, "upload_input");
  const documentNode = await page._client().send("DOM.getDocument");
  const inputNode = await page._client().send("DOM.querySelector", {
    nodeId: documentNode.value.root.nodeId,
    selector: ".upload-card input:not(:disabled)",
  });
  await page._client().send("DOM.setFileInputFiles", {
    nodeId: inputNode.value.nodeId,
    files: [source],
  });
  const evaluated = await page._client().send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async()=>{
    window.turnstile={render(_node,options){queueMicrotask(()=>options.callback('synthetic-proof'));return 'synthetic';},remove(){}};
    const wait=async(fn,label='step')=>{for(let i=0;i<2400;i++){const value=fn();if(value)return value;await new Promise(done=>setTimeout(done,50));}throw new Error('linux_ui_timeout_'+label+'_'+[...document.querySelectorAll('.clip-state')].map(n=>n.textContent).join('_'));};
    const button=text=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===text);
    if(document.body.textContent.includes('YouTube'))throw new Error('hosted_youtube_visible');
    await wait(()=>button('Add clip')&&!button('Add clip').matches(':disabled'),'upload');button('Add clip').click();
    const change=async(node,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(requestAnimationFrame);};
    await wait(()=>document.querySelector('[aria-label="Clip 1 end"]'));
    await change(document.querySelector('[aria-label="Clip 1 start"]'),'00:00:01');await change(document.querySelector('[aria-label="Clip 1 end"]'),'00:00:02');
    if(document.querySelector('.selection input[type="checkbox"]').checked)throw new Error('fake_ai_default_enabled');await wait(()=>button('Use clips')&&!button('Use clips').disabled);button('Use clips').click();await wait(()=>button('Process clips')&&!button('Process clips').disabled);button('Process clips').click();
    const ready=()=>document.querySelector('.editor-panels:not([hidden])')&&document.querySelector('a[aria-label="Download clip"]');
    await wait(()=>button('Export clip')&&document.querySelector('.editor-panels:not([hidden])'),'preview_ready');
    if(!document.querySelector('.caption-empty')||document.querySelector('.picture-choice'))throw new Error('fake_defaults_not_empty');
    button('Generate captions').click();await wait(()=>document.querySelector('[aria-label="Caption generation actions"]'),'caption_consent');[...document.querySelectorAll('[aria-label="Caption generation actions"] button')].find(n=>n.textContent==='Generate captions').click();await wait(()=>!document.querySelector('.caption-empty')&&!document.querySelector('[aria-label="Caption generation actions"]'),'fake_caption_port');
    const settings=async label=>{[...document.querySelectorAll('[aria-label="Clip settings"] [role="tab"]')].find(n=>n.textContent===label).click();await new Promise(requestAnimationFrame);};
    await settings('Media');const canvas=document.createElement('canvas');canvas.width=100;canvas.height=100;const context=canvas.getContext('2d');context.fillStyle='#00ff00';context.fillRect(0,0,100,100);const blob=await new Promise(done=>canvas.toBlob(done,'image/png'));const imageTransfer=new DataTransfer();imageTransfer.items.add(new File([blob],'synthetic.png',{type:'image/png'}));const pictureInput=document.querySelector('[aria-label="Upload picture"]');pictureInput.files=imageTransfer.files;pictureInput.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>document.querySelector('.picture-choice')&&button('Apply changes')&&!button('Apply changes').disabled,'explicit_picture');button('Apply changes').click();await wait(()=>button('Export clip')&&!button('Export clip').disabled,'picture_applied');
    await wait(()=>{const action=button('Export clip');if(button('Apply changes')||!action||action.disabled)return false;action.click();return true;},'initial_export_start');await wait(ready,'initial_export');const first=await (await fetch(ready().href)).arrayBuffer();
    await settings('Captions');[...document.querySelectorAll('[aria-label="Caption controls"] [role="tab"]')].find(n=>n.textContent==='Style').click();await new Promise(requestAnimationFrame);const font=[...document.querySelectorAll('.clip-editor label')].find(n=>n.firstChild?.textContent.trim().startsWith('Font size')).querySelector('input');await change(font,'72');
    await wait(()=>button('Apply changes'));button('Apply changes').click();await wait(()=>{const action=button('Export clip');if(button('Apply changes')||!action||action.disabled)return false;action.click();return true;},'edited_export_start');
    await wait(ready,'edited_export');const last=await (await fetch(ready().href)).arrayBuffer();
    const workspace=await (await fetch('/api/local/workspace')).json();const list=await (await fetch('/api/local/workspace/'+workspace.id+'/clips')).json();
    return {workspaceId:workspace.id,clipId:list.clips[0].id,revision:list.clips[0].revision,outputRevision:list.clips[0].outputs.at(-1).revision,firstBytes:first.byteLength,lastBytes:last.byteLength,exclusive:!document.querySelector('.moment-selection').getClientRects().length,edit:list.clips[0].edit};
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
  const actualHash = createHash("sha256");
  for await (const chunk of createReadStream(join(workspace, "source.mp4")))
    actualHash.update(chunk);
  assert.equal(actualHash.digest("hex"), expectedHash.digest("hex"));
  const video = join(
    workspace,
    result.clipId + `.r${result.outputRevision}.mp4`,
  );
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
        stream.width === expectedProfile.width &&
        stream.height === expectedProfile.height,
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
      {
        kind: "text-layers",
        layers: [
          {
            id: crypto.randomUUID(),
            text: "Linux synthetic title",
            startFrame: 0,
            endFrame: 30,
            style: {
              ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
              box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
            },
          },
        ],
      },
    ],
  });
  const revision = edited.clips[0].revision;
  assert.equal(edited.clips[0].edit.visuals[0].entrance, "slide");
  assert.equal(edited.clips[0].edit.captions.box.y, 0.12);
  assert.equal(edited.clips[0].edit.texts[0].endFrame, 30);
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
    caption: 1,
    select: 0,
    plan: 1,
    image: 0,
    inspect: 1,
    clip: 4,
    "clip-preview": 1,
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
  const denied = await fetch(origin + "/api/local/session", {
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
  assert.equal(denied.status, 429);
  assert.equal((await denied.json()).limited, true);
  stage = "expiry";
  clientIp = "192.0.2.2";
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
  assert.deepEqual(await expired.json(), {
    active: false,
    limited: false,
    retryAt: null,
  });
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
    outputWidth: expectedProfile.width,
    outputHeight: expectedProfile.height,
    sourceHeightPreserved: true,
    timedTextSaved: true,
    explicitSyntheticCaptions: true,
    explicitUploadedPicture: true,
    outputSeconds: Number(profile.format.duration),
    outputBytes: Number(profile.format.size),
    canceled: true,
    retryReusedPreparation: true,
    exitClean: true,
    expiryClean: true,
    demoQuotaEnforced: true,
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
      scratchVolumeBytes: HOSTED_SCRATCH_VOLUME_BYTES,
      boundedWriteBytes: metrics.boundedWriteBytes,
      memoryEvents: await readFile("/sys/fs/cgroup/memory.events", "utf8"),
    }) + "\n",
  );
