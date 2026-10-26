import { expect, it } from "vitest";
import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerClipSchema } from "../packages/contracts/local/clips.ts";
import { automaticOwnerEdit } from "../packages/contracts/local/edit-overlay.ts";

declare global {
  function resetRun(action: string): Promise<boolean>;
}

async function clearResetScratch(directory: string) {
  const actual = await realpath(directory),
    parent = await realpath(tmpdir()),
    rel = relative(parent, actual);
  if (
    !rel ||
    rel.startsWith("..") ||
    isAbsolute(rel) ||
    !rel.startsWith("clipbuilder-reset-proof-")
  )
    throw new Error("invalid_reset_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("resets the shared workspace through its visible footer, preserving failures and disabling active work", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-reset-proof-"));
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let hosted = false,
    active = false,
    withClips = true,
    fail = 0;
  const deletes: boolean[] = [];
  let unexpectedMutations = 0;
  const workspace = {
    id: randomUUID(),
    mode: "synthetic-ai",
    revision: 0,
    source: {
      fingerprint: "a".repeat(64),
      bytes: 1000,
      durationMs: 2000,
      width: 320,
      height: 568,
      fps: 30,
    },
  };
  let current: typeof workspace | null = workspace;
  const base = {
    version: 1,
    analysisId: randomUUID(),
    momentId: randomUUID(),
    sourceRevision: 0,
    fingerprint: workspace.source.fingerprint,
    processingIdentity: "b".repeat(64),
    cut: { startFrame: 0, endFrame: 60 },
    words: [],
    overlay: { version: 1, frames: 60, captions: [], visuals: [] },
  };
  const baseHash = createHash("sha256")
    .update(JSON.stringify(base))
    .digest("hex");
  const clip = ownerClipSchema.parse({
    id: randomUUID(),
    momentId: base.momentId,
    mode: "synthetic-ai",
    analysisId: base.analysisId,
    sourceRevision: 0,
    revision: 0,
    assemblyRevision: 0,
    baseHash,
    state: "ready",
    base,
    edit: null,
    assets: [],
    outputs: [
      {
        id: "c".repeat(64),
        revision: 0,
        editRevision: 0,
        frames: 60,
        bytes: 1000,
      },
    ],
    calls: { plan: 0, image: 0, render: 0 },
    error: null,
  });
  clip.edit = automaticOwnerEdit(clip.base!, clip.id, baseHash);
  let ui = "",
    video = Buffer.alloc(0);
  const server = createServer((req, res) => {
    void (async () => {
      const json = (value: unknown) =>
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(value));
      if (
        req.method === "DELETE" &&
        req.url === `/api/local/workspace/${workspace.id}`
      ) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const text = Buffer.concat(chunks).toString();
        deletes.push(text ? JSON.parse(text).discardUnsaved === true : false);
        await new Promise((done) => setTimeout(done, 250));
        if (fail) {
          res.writeHead(fail).end();
          return;
        }
        current = null;
        res.writeHead(204).end();
        return;
      }
      if (req.method !== "GET") {
        unexpectedMutations++;
        res.writeHead(400).end();
        return;
      }
      if (req.url === "/api/local/capabilities") {
        json(
          hosted
            ? {
                execution: "hosted",
                aiMode: "synthetic-ai",
                sourceMode: null,
                planningAvailable: true,
                localMedia: false,
                cloud: true,
              }
            : {
                aiMode: "synthetic-ai",
                sourceMode: "synthetic-source",
                planningAvailable: true,
                localMedia: true,
                cloud: false,
              },
        );
        return;
      }
      if (req.url === "/api/local/workspace") {
        json(current);
        return;
      }
      if (
        req.url?.endsWith("/analysis") ||
        req.url === "/api/local/sources/state"
      ) {
        json(null);
        return;
      }
      if (req.url?.endsWith("/clips")) {
        json({ clips: withClips ? [clip] : [], active, workers: 1 });
        return;
      }
      if (req.url?.endsWith("/source")) {
        const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/),
          start = Number(range?.[1] ?? 0),
          end = Math.min(
            Number(range?.[2] || video.length - 1),
            video.length - 1,
          );
        res
          .writeHead(range ? 206 : 200, {
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            ...(range
              ? { "Content-Range": `bytes ${start}-${end}/${video.length}` }
              : {}),
          })
          .end(video.subarray(start, end + 1));
        return;
      }
      const file =
        req.url === "/"
          ? "index.html"
          : req.url === "/app.js"
            ? "app.js"
            : req.url === "/app.css"
              ? "app.css"
              : null;
      if (!file) {
        res.writeHead(404).end();
        return;
      }
      res
        .writeHead(200, {
          "Content-Type": file.endsWith("js")
            ? "text/javascript"
            : file.endsWith("css")
              ? "text/css"
              : "text/html",
        })
        .end(await readFile(join(ui, file)));
    })().catch(() => res.writeHead(500).end());
  });
  try {
    const tools = await ownerNativeTools(resolve(".")),
      source = join(directory, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=blue:s=320x568:r=30:d=2",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        source,
      ],
      AbortSignal.timeout(20_000),
    );
    video = await readFile(source);
    const localUi = await prepareLocalControlsFixture(directory);
    const hostedRoot = join(directory, "hosted");
    await mkdir(hostedRoot);
    const hostedUi = await prepareLocalControlsFixture(hostedRoot, true);
    ui = localUi;
    const port = await listenOwner(server);
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
    const driver = `
      const wait=async f=>{for(let i=0;i<500;i++){if(f())return;await new Promise(r=>setTimeout(r,20));}throw new Error('reset_ui_timeout');};
      const button=t=>[...document.querySelectorAll('#sample-main > footer button')].find(n=>n.textContent.trim()===t);
      globalThis.resetRun=async action=>{
        if(action==='ready'){await wait(()=>button('Start over')&&!button('Start over').disabled);return true;}
        if(action==='layout'){const n=button('Start over')||button('Retry reset'),r=n.getBoundingClientRect(),f=n.closest('footer').getBoundingClientRect();n.focus();return document.activeElement===n&&r.width>=44&&r.height>=44&&r.top>=f.top&&r.bottom<=f.bottom&&f.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth;}
        if(action==='dirty'){await wait(()=>document.querySelector('.editor-panels:not([hidden])'));document.querySelector('[role="tab"][id$="-text"]').click();const add=()=>[...document.querySelectorAll('.clip-editor button')].find(n=>n.textContent.trim()==='Add text');await wait(()=>add());add().click();await wait(()=>button('Apply changes'));return !button('Start over').disabled;}
        if(action==='start'){button('Start over').click();return true;}
        if(action==='pending'){await wait(()=>button('Start over')?.disabled);return true;}
        if(action==='cleared'){await wait(()=>document.querySelector('h1').textContent.includes('Choose your video'));return !document.querySelector('.clip-editor,.moment-selection,.clip-choice')&&!button('Start over')&&document.activeElement===document.querySelector('h1')&&!!document.querySelector('.upload-card input')&&(!document.querySelector('input[type=url]')||document.querySelector('input[type=url]').value==='');}
        if(action==='failed'){await wait(()=>document.querySelector('.flow-notice').textContent.includes('could not be cleared'));return !!document.querySelector('.clip-editor')&&!button('Start over').disabled;}
        if(action==='conflict'){await wait(()=>button('Retry reset')&&button('Discard session'));return !!document.querySelector('.clip-editor')&&!button('Retry reset').disabled;}
        if(action==='discard'){button('Discard session').click();return true;}
        if(action==='blocked'){await wait(()=>document.querySelector('.clip-choice')&&button('Start over')?.disabled);return true;}
        if(action==='local-intake')return !!document.querySelector('input[type=url]')&&document.querySelector('input[type=url]').value==='';
        if(action==='hosted-intake')return !document.querySelector('input[type=url]')&&!document.querySelector('a[href="/start?source=sample"]');
        return false;
      };
    `;
    const run = (action: string) =>
      page.evaluate((a: string) => resetRun(a), action);
    const open = async (width: number, height: number) => {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.goto({ url: `http://127.0.0.1:${port}/`, timeout: 15_000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
    };
    for (const width of [1440, 390, 320]) {
      current = workspace;
      await open(width, width === 1440 ? 900 : 844);
      expect(await run("ready")).toBe(true);
      expect(await run("layout")).toBe(true);
      expect(await run("dirty")).toBe(true);
      expect(await run("layout")).toBe(true);
      await mkdir(resolve(".local-build/evidence"), { recursive: true });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl073-dirty-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
      await run("start");
      expect(await run("pending")).toBe(true);
      expect(await run("cleared")).toBe(true);
      expect(await run("local-intake")).toBe(true);
      expect(current).toBeNull();
    }
    current = workspace;
    fail = 500;
    await open(390, 844);
    await run("ready");
    await run("start");
    expect(await run("failed")).toBe(true);
    expect(current).toBe(workspace);
    fail = 0;
    await run("start");
    expect(await run("cleared")).toBe(true);
    current = workspace;
    fail = 409;
    await open(320, 568);
    await run("ready");
    await run("dirty");
    await run("start");
    expect(await run("conflict")).toBe(true);
    expect(await run("layout")).toBe(true);
    fail = 0;
    await run("discard");
    expect(await run("cleared")).toBe(true);
    current = workspace;
    withClips = false;
    await open(390, 844);
    await run("ready");
    await run("start");
    expect(await run("cleared")).toBe(true);
    current = workspace;
    withClips = true;
    active = true;
    await open(390, 844);
    expect(await run("blocked")).toBe(true);
    active = false;
    hosted = true;
    ui = hostedUi;
    current = workspace;
    await open(320, 568);
    await run("ready");
    await run("start");
    expect(await run("cleared")).toBe(true);
    expect(await run("hosted-intake")).toBe(true);
    expect(deletes).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
    ]);
    expect(unexpectedMutations).toBe(0);
    expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    await browser?.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    await clearResetScratch(directory);
  }
}, 120_000);
