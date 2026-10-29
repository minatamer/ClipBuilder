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
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import {
  ownerClipSchema,
  type OwnerClip,
} from "../packages/contracts/local/clips.ts";
import { automaticOwnerEdit } from "../packages/contracts/local/edit-overlay.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

declare module "../apps/renderer/node_modules/@remotion/renderer/dist/browser/devtools-commands.js" {
  interface Commands {
    "Emulation.setTouchEmulationEnabled": {
      paramsType: [{ enabled: boolean; maxTouchPoints?: number }];
      returnType: Record<string, never>;
    };
  }
}

declare global {
  function responsiveEditor(action: string): Promise<{
    width: number;
    preview: number;
    stripX: number;
    stripY: number;
    scroll: number;
  }>;
}

it("uses the real editor, clip navigation and footer at phone, tablet and desktop sizes without paid calls", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-responsive-"));
  const source = join(directory, "synthetic.mp4");
  const focus = defaultOwnerFocus({ width: 1280, height: 720 }, 120);
  const workspace = {
    id: randomUUID(),
    mode: "synthetic-ai",
    revision: 0,
    source: {
      fingerprint: "a".repeat(64),
      bytes: 1000,
      durationMs: 4000,
      width: 1280,
      height: 720,
      fps: 30,
    },
  };
  const clips: OwnerClip[] = Array.from({ length: 10 }, () => {
    const base = {
      version: 1,
      analysisId: randomUUID(),
      momentId: randomUUID(),
      sourceRevision: 0,
      fingerprint: workspace.source.fingerprint,
      processingIdentity: "b".repeat(64),
      cut: { startFrame: 0, endFrame: 120 },
      words: [],
      overlay: { version: 1, frames: 120, captions: [], visuals: [], focus },
    };
    const hash = createHash("sha256")
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
      baseHash: hash,
      state: "ready",
      base,
      edit: null,
      assets: [],
      outputs: [
        {
          id: "c".repeat(64),
          revision: 0,
          editRevision: 0,
          frames: 120,
          bytes: 1000,
        },
      ],
      calls: { plan: 0, image: 0, render: 0 },
      error: null,
    });
    clip.edit = automaticOwnerEdit(clip.base!, clip.id, hash);
    return clip;
  });
  let bytes = Buffer.alloc(0),
    ui = "",
    state: OwnerClip["state"] = "ready";
  let edits = 0,
    unexpected = 0,
    resetFailure = false;
  const list = () => ({
    clips: clips.map((clip, index) =>
      index === 0
        ? {
            ...clip,
            state,
            error: state === "failed" ? "local_clip_failed" : null,
          }
        : clip,
    ),
    active: state === "queued",
    workers: 1,
  });
  const server = createServer((req, res) => {
    void (async () => {
      res.setHeader("Content-Type", "application/json");
      if (
        req.method === "DELETE" &&
        req.url === `/api/local/workspace/${workspace.id}`
      ) {
        resetFailure = true;
        res.writeHead(409).end();
        return;
      }
      if (req.method === "POST" && req.url?.endsWith("/edit")) {
        const clip = clips.find((item) => req.url?.includes(item.id));
        if (!clip) throw new Error("unknown_synthetic_clip");
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const edit = applyOwnerEdit(
          clip,
          JSON.parse(Buffer.concat(chunks).toString()),
          focus.source,
        );
        Object.assign(clip, {
          edit,
          revision: edit.revision,
          state: "validated-revision",
        });
        edits++;
        res.end(JSON.stringify(list()));
        return;
      }
      if (req.method !== "GET") {
        unexpected++;
        res.writeHead(405).end();
        return;
      }
      if (req.url === "/api/local/capabilities") {
        res.end(
          JSON.stringify({
            aiMode: "synthetic-ai",
            sourceMode: null,
            planningAvailable: true,
            captionGeneration: false,
            localMedia: true,
            cloud: false,
          }),
        );
        return;
      }
      if (req.url === "/api/local/workspace") {
        res.end(JSON.stringify(workspace));
        return;
      }
      if (req.url?.endsWith("/analysis")) {
        res.end("null");
        return;
      }
      if (req.url?.endsWith("/clips")) {
        res.end(JSON.stringify(list()));
        return;
      }
      if (req.url?.endsWith("/source")) {
        const match = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
        const start = Number(match?.[1] ?? 0),
          end = Math.min(
            Number(match?.[2] || bytes.length - 1),
            bytes.length - 1,
          );
        res
          .writeHead(match ? 206 : 200, {
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            ...(match
              ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` }
              : {}),
          })
          .end(bytes.subarray(start, end + 1));
        return;
      }
      if (req.url === "/favicon.ico") {
        res.writeHead(204).end();
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
        unexpected++;
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
    })().catch(() => {
      unexpected++;
      res.writeHead(500).end();
    });
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
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
        "color=c=teal:s=1280x720:r=30:d=4,drawbox=x=640:y=0:w=640:h=720:color=navy:t=fill",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        source,
      ],
      AbortSignal.timeout(30_000),
    );
    bytes = await readFile(source);
    ui = await prepareLocalControlsFixture(directory);
    await writeFile(
      join(ui, "index.html"),
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
    );
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
    const driver = `globalThis.responsiveEditor=async action=>{
      const wait=async(fn,label)=>{for(let i=0;i<240;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw new Error('responsive_timeout_'+label);};
      const button=text=>[...document.querySelectorAll('button,a')].find(n=>n.textContent.trim()===text);
      const rail=()=>document.querySelector('.clip-list'), content=()=>document.querySelector('#sample-main > div');
      const tabs=()=>[...(rail()?.querySelectorAll('[role=tab]')??[])], selected=()=>tabs().find(n=>n.getAttribute('aria-selected')==='true');
      const ready=()=>document.querySelector('.editor-panels:not([hidden])');
      const rect=n=>n.getBoundingClientRect();
      const footer=()=>{const f=document.querySelector('#sample-main > footer'),r=rect(f),frame=rect(document.querySelector('#sample-main'));
        if(r.right>frame.right || r.left<frame.left)throw new Error('frame_footer_overflow');
        if(r.bottom>innerHeight+1 || r.top<0)throw new Error('footer_outside_view');
        const controls=[...f.querySelectorAll('button,a[href]')].filter(n=>rect(n).width>0 && !n.closest('.session-recovery'));
        if(controls.some(n=>rect(n).left<r.left || rect(n).right>r.right || rect(n).top<r.top || rect(n).bottom>r.bottom))throw new Error('footer_action_overflow');
        if(innerWidth<600 && r.height>76)throw new Error('phone_footer_too_tall_'+r.height);
        if(innerWidth<600 && controls.some(n=>rect(n).height<44))throw new Error('footer_touch_target');
      };
      await wait(()=>tabs().length===10,'tabs');
      await wait(()=>rail().getAttribute('aria-orientation')===(matchMedia('(max-width:75rem), (hover:none) and (pointer:coarse)').matches?'horizontal':'vertical'),'layout_change');
      if(action==='ready'){
        await wait(()=>ready() && button('Add more clips') && button('Download clip'),'preview');
        const p=rect(document.querySelector('.editor-preview')),c=rect(content()),l=rect(rail()),panel=rect(ready());
        const frame=rect(document.querySelector('#sample-main'));
        if(c.right>frame.right || p.right>frame.right || panel.right>frame.right)throw new Error('frame_content_overflow');
        const horizontal=innerWidth<=1200 || matchMedia('(hover:none) and (pointer:coarse)').matches;
        if(rail().getAttribute('aria-orientation')!==(horizontal?'horizontal':'vertical'))throw new Error('orientation');
        if(horizontal && (l.bottom>p.top+1 || getComputedStyle(rail()).scrollbarWidth!=='none' || rail().scrollWidth<=rail().clientWidth))throw new Error('strip_geometry');
        if(innerWidth<=760){if(Math.abs(p.width-(c.width-parseFloat(getComputedStyle(content()).paddingLeft)*2))>2 || panel.top<p.bottom)throw new Error('phone_preview_not_full_width');}
        else {if(panel.left<p.right || p.bottom>rect(document.querySelector('#sample-main > footer')).top+1)throw new Error('two_column_fit');if(horizontal && innerHeight>900 && p.width<=256)throw new Error('tablet_preview_too_small');}
        if(Math.abs(p.height/p.width-16/9)>.02)throw new Error('preview_aspect');
        if(document.documentElement.scrollWidth>innerWidth)throw new Error('document_overflow');
        footer();return {width:innerWidth,preview:p.width,stripX:l.left+l.width*.85,stripY:l.top+l.height/2,scroll:rail().scrollLeft};
      }
      if(action==='navigation'){
        const horizontal=rail().getAttribute('aria-orientation')==='horizontal',before=content().scrollTop;
        const key=async value=>{selected().focus({preventScroll:true});selected().dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true}));await new Promise(r=>setTimeout(r,100));};
        await key('End');if(selected()!==tabs()[9] || document.activeElement!==selected())throw new Error('end_focus');
        if(horizontal && (rect(selected()).right>rect(rail()).right+1 || content().scrollTop!==before))throw new Error('selected_not_revealed');
        await key(horizontal?'ArrowRight':'ArrowDown');if(selected()!==tabs()[0])throw new Error('wrap');
        await key(horizontal?'ArrowLeft':'ArrowUp');if(selected()!==tabs()[9])throw new Error('back_wrap');
        await key('Home');if(selected()!==tabs()[0])throw new Error('home');
        await wait(()=>ready(),'after_navigation');
      }
      if(action==='controls' || action==='dirty'){
        await wait(()=>ready(),'controls');
        [...document.querySelectorAll('.editor-tabs button')].find(n=>n.textContent===(action==='controls'?'Focus':'Filters')).click();
        await new Promise(requestAnimationFrame);
        if(action==='controls'){ready().scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,150));}
        else {const input=document.querySelector('.editor-panels select');if(!input)throw new Error('missing_filter');
          const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;setter.call(input,'warm');input.dispatchEvent(new Event('change',{bubbles:true}));
          await wait(()=>button('Apply changes') && tabs().slice(1).every(n=>n.disabled) && !button('Add more clips'),'dirty');
          if(tabs().slice(1).some(n=>!n.disabled) || button('Add more clips') || button('Download clip'))throw new Error('dirty_guard');
          selected().dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));await new Promise(requestAnimationFrame);
          if(selected()!==tabs()[0])throw new Error('dirty_keyboard_guard');
        }footer();
      }
      if(action==='discard'){button('Discard changes').click();await wait(()=>button('Add more clips') && !button('Apply changes'),'discard');footer();}
      if(action==='apply'){button('Apply changes').click();await wait(()=>button('Export clip') && !button('Apply changes'),'apply');footer();}
      if(action==='failed' || action==='queued'){
        await wait(()=>document.querySelector('.clip-preparing') || button('Retry clip'),'state');
        if(document.querySelector('.clip-editor') || button('Download clip'))throw new Error('readiness_guard');footer();
      }
      if(action==='reset-failed'){
        await wait(()=>button('Start over') && !button('Start over').disabled,'reset_ready');
        button('Start over').click();await wait(()=>button('Reset options'),'reset');button('Reset options').click();
        await wait(()=>button('Retry reset') && button('Discard session'),'recovery');
        const popup=rect(document.querySelector('.session-recovery'));
        if(popup.top<0 || popup.bottom>rect(document.querySelector('#sample-main > footer')).top+2 || popup.right>innerWidth)throw new Error('recovery_overflow');
        button('Retry reset').focus();button('Retry reset').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
        await wait(()=>!button('Retry reset'),'escape');if(document.activeElement!==button('Reset options'))throw new Error('recovery_focus');
        button('Reset options').click();await wait(()=>button('Retry reset'),'reopen');footer();
      }
      return {width:innerWidth,preview:0,stripX:0,stripY:0,scroll:rail().scrollLeft};
    };`;
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    const run = (action: string) =>
      page.evaluate((a) => globalThis.responsiveEditor(a), action);
    const capture = async (name: string) => {
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl131-${name}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    };
    for (const viewport of [
      { width: 320, height: 568, touch: true },
      { width: 390, height: 844, touch: true },
      { width: 430, height: 932, touch: true },
      { width: 768, height: 1024, touch: true },
      { width: 834, height: 1194, touch: true },
      { width: 1024, height: 768, touch: true },
      { width: 1366, height: 1024, touch: true },
      { width: 1440, height: 900, touch: false },
    ]) {
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      await page._client().send("Emulation.setTouchEmulationEnabled", {
        enabled: viewport.touch,
        maxTouchPoints: 5,
      });
      await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      const geometry = await run("ready");
      await capture(`${viewport.width}-preview`);
      await run("navigation");
      if (viewport.touch) {
        await page._client().send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: geometry.stripX, y: geometry.stripY, id: 1 }],
        });
        for (let step = 1; step <= 8; step++)
          await page._client().send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [
              { x: geometry.stripX - step * 20, y: geometry.stripY, id: 1 },
            ],
          });
        await page._client().send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        expect((await run("scroll")).scroll).toBeGreaterThan(10);
      }
      await run("controls");
      await capture(`${viewport.width}-controls`);
      await run("dirty");
      await capture(`${viewport.width}-dirty`);
      await run("discard");
    }
    // Resize an existing selection across both orientations; retain keyboard behavior.
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await run("navigation");
    await run("dirty");
    await run("apply");
    expect(edits).toBe(1);
    for (const next of ["failed", "queued"] as const) {
      state = next;
      await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      await run(next);
      await capture(`390-${next}`);
    }
    state = "ready";
    await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await run("reset-failed");
    expect(resetFailure).toBe(true);
    await capture("390-reset-failed");
    expect(unexpected).toBe(0);
  } finally {
    await browser?.close({ silent: true });
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done, reject) =>
        server.close((error) => (error ? reject(error) : done())),
      );
    await clearResponsiveScratch(directory);
  }
}, 180_000);

async function clearResponsiveScratch(directory: string) {
  const actual = await realpath(directory),
    rel = relative(await realpath(tmpdir()), actual);
  if (!rel || rel.startsWith("..") || isAbsolute(rel))
    throw new Error("invalid_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}
