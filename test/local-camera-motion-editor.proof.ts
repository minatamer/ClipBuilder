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
import { join, resolve, relative, isAbsolute } from "node:path";
import { build, stop } from "esbuild";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import { ownerClipSchema } from "../packages/contracts/local/clips.ts";
import { automaticOwnerEdit } from "../packages/contracts/local/edit-overlay.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { listenOwner } from "./owner-http.ts";
import "./owner-controls-browser.ts";

declare global {
  function motionRun(action: string, value?: string): Promise<unknown>;
}
async function clearScratch(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (!rel || rel.startsWith("..") || isAbsolute(rel))
    throw new Error("invalid_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}
it("edits manual zoom through real mouse/touch/keyboard controls and Apply/Discard/reopen with a Hook at desktop and phone sizes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-focus-browser-")),
    source = join(directory, "synthetic.mp4");
  const tools = await ownerNativeTools(resolve("."));
  const focus = defaultOwnerFocus({ width: 1280, height: 720 }, 120);
  focus.people = [
    {
      id: "person_1",
      observations: [
        {
          startFrame: 0,
          endFrame: 120,
          box: { x: 0.1, y: 0.1, width: 0.3, height: 0.7 },
        },
      ],
    },
    {
      id: "person_2",
      observations: [
        {
          startFrame: 0,
          endFrame: 120,
          box: { x: 0.6, y: 0.1, width: 0.3, height: 0.7 },
        },
      ],
    },
  ];
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 30, personId: "person_1", centerX: 0.25 },
    {
      ...focus.shots[0]!,
      startFrame: 30,
      endFrame: 60,
      personId: "person_2",
      centerX: 0.75,
      reason: "speaker",
    },
    {
      ...focus.shots[0]!,
      startFrame: 60,
      endFrame: 90,
      personId: "person_1",
      centerX: 0.25,
    },
    {
      ...focus.shots[0]!,
      startFrame: 90,
      endFrame: 120,
      personId: "person_1",
      centerX: 0.6,
    },
  ];
  focus.decisions = [
    {
      startFrame: 90,
      endFrame: 120,
      personId: null,
      speakerId: null,
      confidence: 0,
      evidenceWordIds: [],
      shotStart: true,
    },
  ];
  focus.people.push({
    id: "person_3",
    observations: [
      {
        startFrame: 0,
        endFrame: 120,
        box: { x: 0.4, y: 0.1, width: 0.2, height: 0.7 },
      },
    ],
  });
  const clipId = randomUUID(),
    workspaceId = randomUUID();
  const base = {
    version: 1,
    analysisId: randomUUID(),
    momentId: randomUUID(),
    sourceRevision: 0,
    fingerprint: "a".repeat(64),
    processingIdentity: "b".repeat(64),
    cut: { startFrame: 0, endFrame: 120 },
    words: [],
    overlay: { version: 1, frames: 120, captions: [], visuals: [], focus },
  };
  const baseHash = createHash("sha256")
    .update(JSON.stringify(base))
    .digest("hex");
  let clip = ownerClipSchema.parse({
    id: clipId,
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
        frames: 120,
        bytes: 1000,
      },
    ],
    calls: { plan: 0, image: 0, render: 0 },
    error: null,
  });
  clip.edit = {
    ...automaticOwnerEdit(clip.base!, clip.id, baseHash),
    hook: { startFrame: 15, endFrame: 75 },
  };
  let bytes = Buffer.alloc(0),
    edits = 0;
  const server = createServer((req, res) => {
    void (async () => {
      if (
        req.url === "/seed" ||
        (req.method === "GET" && req.url?.endsWith("/clips"))
      ) {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify(
            req.url === "/seed"
              ? clip
              : { clips: [clip], active: false, workers: 1 },
          ),
        );
        return;
      }
      if (req.url?.endsWith("/source")) {
        const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/),
          start = Number(range?.[1] ?? 0),
          end = Math.min(
            Number(range?.[2] || bytes.length - 1),
            bytes.length - 1,
          );
        res
          .writeHead(range ? 206 : 200, {
            "Content-Type": "video/mp4",
            "Content-Length": end - start + 1,
            "Accept-Ranges": "bytes",
            ...(range
              ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` }
              : {}),
          })
          .end(bytes.subarray(start, end + 1));
        return;
      }
      if (req.method === "POST" && req.url?.endsWith("/edit")) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk));
          if (Buffer.concat(chunks).length > 128 * 1024)
            throw new Error("oversized_synthetic_edit");
        }
        const edit = applyOwnerEdit(
          clip,
          JSON.parse(Buffer.concat(chunks).toString()),
          focus.source,
        );
        await new Promise((done) => setTimeout(done, 250));
        clip = ownerClipSchema.parse({
          ...clip,
          revision: edit.revision,
          edit,
          state: "validated-revision",
        });
        edits++;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ clips: [clip], active: false, workers: 1 }));
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
        .end(await readFile(join(directory, file)));
    })().catch(() => res.writeHead(409).end());
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=black:s=1080x1920:r=30:d=4,drawbox=x=0:y=656:w=540:h=608:color=red:t=fill,drawbox=x=540:y=656:w=540:h=608:color=blue:t=fill",
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
    await build({
      stdin: {
        contents: `import React,{useState,useCallback} from 'react';import {createRoot} from 'react-dom/client';import {ClipEditor} from './apps/frontend/src/features/local-editing/clip-editor.tsx';import {Workspace} from './apps/frontend/src/shared/ui/workspace.tsx';import {WorkflowFrame} from './apps/frontend/src/shared/ui/workflow-frame.tsx';import {Button} from './apps/frontend/src/shared/ui/button.tsx';import './apps/frontend/src/styles/tokens.css';import './apps/frontend/src/features/local-editing/style.css';
      function App({initial}){const [clip,setClip]=useState(initial),[footer,setFooter]=useState(null),[dirty,setDirty]=useState(false);const mark=useCallback((id,value)=>setDirty(value),[]);return <Workspace localMode><WorkflowFrame step={2} title="Review and edit clips" bounded footer={<><div ref={setFooter}/>{!dirty&&<Button variant="primary">Export clip</Button>}</>}><div className="local-editing local-editor"><section className="batch-section"><div className="clip-workspace"><div className="clip-list"><Button variant="secondary">Clip 1</Button></div><article className="clip-review"><ClipEditor fakeCaptionGeneration clip={clip} workspaceId="${workspaceId}" source={{width:1280,height:720}} onAccepted={list=>setClip(list.clips[0])} onDirty={mark} footerTarget={footer}/></article></div></section></div></WorkflowFrame></Workspace>};fetch('/seed').then(r=>r.json()).then(initial=>createRoot(document.getElementById('root')).render(<App initial={initial}/>));`,
        loader: "tsx",
        resolveDir: resolve("."),
      },
      nodePaths: [resolve("apps/frontend/node_modules")],
      outfile: join(directory, "app.js"),
      bundle: true,
      platform: "browser",
      format: "esm",
      jsx: "automatic",
    });
    await stop();
    await writeFile(
      join(directory, "index.html"),
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
    const driver = `
    const named=name=>document.querySelector('[aria-label="'+name+'"]');
    const button=label=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===label&&n.getClientRects().length);
    const wait=async(fn,phase)=>{for(let i=0;i<500;i++){if(fn())return;await new Promise(r=>setTimeout(r,20));}throw Error('motion_timeout_'+phase);};
    const change=async(name,value)=>{const n=named(name);if(!n)throw Error('missing_'+name);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,value);n.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,50));};
    const tab=async label=>{[...document.querySelectorAll('[aria-label="Focus controls"] [role="tab"]')].find(n=>n.textContent===label).click();await new Promise(requestAnimationFrame);};
    const open=async()=>{await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'ready');[...document.querySelectorAll('[aria-label="Clip settings"] [role="tab"]')].find(n=>n.textContent==='Focus').click();await wait(()=>document.querySelector('.focus-editor'),'focus');};
    const video=()=>document.querySelector('.editor-preview video[data-editor-active=true]');
    const settled=()=>wait(()=>!button('Apply changes')&&!document.querySelector('.focus-editor').disabled,'saved');
    globalThis.motionRun=async(action,value)=>{
      if(action==='open'){await open();await tab('Zoom');return;}
      if(action==='add'){
        await open();await tab('Camera');[...document.querySelectorAll('[aria-label="Camera controls"] [role="tab"]')].find(n=>n.textContent==='Advanced').click();await new Promise(requestAnimationFrame);
        const time=[...document.querySelectorAll('.focus-editor label')].find(n=>n.firstChild.textContent.trim()==='Time (s)').querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(time,'0.1');time.dispatchEvent(new Event('input',{bubbles:true}));
        await wait(()=>video()?.dataset.editorVideo==='body'&&video().readyState>=2&&!video().seeking&&Math.abs(video().currentTime-.1)<.04,'body_seek');await tab('Zoom');
        await wait(()=>button('Add at playhead')&&!button('Add at playhead').disabled,'add_ready');button('Add at playhead').click();await wait(()=>named('Zoom target'),'added');
        await change('Zoom duration seconds','.6');await change('Zoom magnification','2.5');await change('Zoom target x','50');await change('Zoom target y','50');
        named('Zoom target').scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=named('Zoom target').getBoundingClientRect();return {x:r.left+r.width*.4,y:r.top+r.height*.5,targetX:r.left+r.width*.65};
      }
      if(action==='info')return {x:Number(named('Zoom target x').value),duration:Number(named('Zoom duration seconds').value),zoom:Number(named('Zoom magnification').value),dirty:!!button('Apply changes')};
      if(action==='key'){named('Zoom target').focus();return;}
      if(action==='check'){
        await change('Zoom duration seconds','');if(!button('Apply changes').disabled||!button('Preview zoom').disabled)throw Error('empty_duration_allowed');await change('Zoom duration seconds','.6');
        await change('Zoom start seconds','5.9');if(!button('Apply changes').disabled)throw Error('end_bound_allowed');await change('Zoom start seconds','2.1');
        await change('Zoom target x','');if(!button('Apply changes').disabled)throw Error('empty_target_allowed');await change('Zoom target x','60');
        button('Preview zoom').click();await wait(()=>named('Pause video'),'playing');await new Promise(r=>setTimeout(r,350));named('Pause video').click();
        named('Zoom target').scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=named('Zoom target').getBoundingClientRect(),f=document.querySelector('footer').getBoundingClientRect();
        return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth+1&&f.top>=0&&f.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth&&document.querySelectorAll('.camera-motion-editor').length===1;
      }
      if(action==='click'){const n=button(value);if(!n||n.disabled)throw Error('unavailable_'+value);n.click();await new Promise(r=>setTimeout(r,70));return;}
      if(action==='settle')return settled();
      throw Error('unknown_action');
    };`;
    const run = (action: string, value?: string) =>
      page.evaluate(
        (a: string, v: string) => motionRun(a, v),
        action,
        value ?? "",
      );
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 568 },
    ]) {
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      await page.goto({ url: `http://127.0.0.1:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      const point = (await run("add")) as {
          x: number;
          y: number;
          targetX: number;
        },
        before = ((await run("info")) as { x: number }).x,
        client = page._client();
      await client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: point.x,
        y: point.y,
        button: "left",
        buttons: 1,
        clickCount: 1,
      });
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: point.targetX,
        y: point.y,
        button: "left",
        buttons: 1,
      });
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: point.targetX,
        y: point.y,
        button: "left",
        buttons: 0,
      });
      await new Promise((done) => setTimeout(done, 70));
      expect(((await run("info")) as { x: number }).x).toBeGreaterThan(
        before + 5,
      );
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: point.x, y: point.y, id: 1 }],
      });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: point.targetX, y: point.y, id: 1 }],
      });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await run("key");
      const keyBefore = ((await run("info")) as { x: number }).x;
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "ArrowRight",
        code: "ArrowRight",
        windowsVirtualKeyCode: 39,
      });
      await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "ArrowRight",
        code: "ArrowRight",
        windowsVirtualKeyCode: 39,
      });
      await new Promise((done) => setTimeout(done, 70));
      expect(((await run("info")) as { x: number }).x).toBeGreaterThan(
        keyBefore,
      );
      expect(await run("check")).toBe(true);
      const shot = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
      });
      await writeFile(
        resolve(`.local-build/evidence/cl192-zoom-${viewport.width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.cameraEffects).toHaveLength(1);
      expect(clip.edit!.cameraEffects![0]).toMatchObject({
        occurrence: "body",
        startFrame: 3,
        zoomFrames: 18,
        target: { zoom: 2.5 },
      });
      await page.goto({ url: `http://127.0.0.1:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      await run("open");
      expect(await run("info")).toMatchObject({
        duration: 0.6,
        zoom: 2.5,
        dirty: false,
      });
      await run("click", "Remove zoom");
      await run("click", "Discard changes");
      await run("settle");
      expect(await run("info")).toMatchObject({
        duration: 0.6,
        zoom: 2.5,
        dirty: false,
      });
      await run("click", "Remove zoom");
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.cameraEffects).toEqual([]);
    }
    expect(edits).toBe(6);
    expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    await stop();
    await browser?.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    expect(server.listening).toBe(false);
    await clearScratch(directory);
  }
}, 90_000);
