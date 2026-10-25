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
import {
  defaultOwnerFocus,
  ownerFocusCrop,
} from "../packages/contracts/local/focus.ts";
import {
  ownerClipSchema,
  ownerClipBaseSchema,
} from "../packages/contracts/local/clips.ts";
import { automaticOwnerEdit } from "../packages/contracts/local/edit-overlay.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { listenOwner } from "./owner-http.ts";
import "./owner-controls-browser.ts";

declare global {
  function focusRun(action: string, value?: string): Promise<unknown>;
  function focusPlayback(): Promise<{
    overviewSeeks: number;
    rewinds: number;
    decoded: number;
    time: number;
    sameVideo: boolean;
  }>;
  function focusPointer(): { x: number; y: number; targetX: number };
  function focusCenter(): number;
  function focusUiState(): {
    shots: string[];
    selected: number;
    dirty: boolean;
    footer: boolean;
    overflow: boolean;
    cropCount: number;
    oldBoxes: number;
  };
  function focusReady(): Promise<void>;
  function focusWaitCenter(value: number): Promise<void>;
}
async function clearScratch(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (!rel || rel.startsWith("..") || isAbsolute(rel))
    throw new Error("invalid_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}
it("edits person focus through real shared controls, pointer gestures, Apply/Discard and restored state at desktop and phone sizes", async () => {
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
  let fakeCaptionRequests = 0;
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
  clip.edit = automaticOwnerEdit(clip.base!, clip.id, baseHash);
  let bytes = Buffer.alloc(0),
    edits = 0,
    failNext = false;
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
      if (req.method === "POST" && req.url?.endsWith("/fake-captions")) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        expect(
          Object.keys(JSON.parse(Buffer.concat(chunks).toString())).sort(),
        ).toEqual(["expectedRevision", "operationId"]);
        fakeCaptionRequests++;
        const nextBase = {
          ...clip.base!,
          overlay: {
            ...clip.base!.overlay,
            captions: [
              {
                startMs: 0,
                endMs: 500,
                text: "Fictional captions.",
                lines: ["Fictional captions."],
                wordIds: ["w_000001", "w_000002"],
                wordCues: [
                  {
                    wordId: "w_000001",
                    text: "Fictional",
                    startMs: 0,
                    endMs: 250,
                  },
                  {
                    wordId: "w_000002",
                    text: "captions.",
                    startMs: 250,
                    endMs: 500,
                  },
                ],
              },
            ],
          },
        };
        const nextHash = createHash("sha256")
          .update(JSON.stringify(nextBase))
          .digest("hex");
        clip = ownerClipSchema.parse({
          ...clip,
          base: nextBase,
          baseHash: nextHash,
          revision: clip.revision + 1,
          edit: {
            ...automaticOwnerEdit(nextBase, clip.id, nextHash),
            revision: clip.revision + 1,
          },
        });
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ clips: [clip], active: false, workers: 1 }));
        return;
      }
      if (req.method === "POST" && req.url?.endsWith("/edit")) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk));
          if (Buffer.concat(chunks).length > 128 * 1024)
            throw new Error("oversized_synthetic_edit");
        }
        if (failNext) {
          failNext = false;
          res.writeHead(503).end();
          return;
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
      const wait=async(f,phase='state')=>{for(let i=0;i<500;i++){const v=f();if(v)return v;await new Promise(r=>setTimeout(r,20));}throw new Error('focus_ui_timeout_'+phase)};
      const button=label=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label&&b.getClientRects().length);
      const named=label=>document.querySelector('[aria-label="'+label+'"]');
      const field=label=>[...document.querySelectorAll('.focus-editor label')].find(l=>l.firstChild.textContent.trim()===label)?.querySelector('input,select');
      const tab=async label=>{const root=label==='Advanced'||label==='Timing'?'Camera':label;[...document.querySelectorAll('[aria-label="Focus controls"] [role="tab"]')].find(n=>n.textContent===root).click();await new Promise(requestAnimationFrame);if(root==='Camera'){[...document.querySelectorAll('[aria-label="Camera controls"] [role="tab"]')].find(n=>n.textContent===(label==='Advanced'?'Advanced':'Timing')).click();await new Promise(requestAnimationFrame);}};
      const change=async(label,value)=>{const n=field(label);if(!n)throw new Error('missing_control_'+label);Object.getOwnPropertyDescriptor(n.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(n,value);n.dispatchEvent(new Event(n.tagName==='SELECT'?'change':'input',{bubbles:true}));await new Promise(r=>setTimeout(r,50));};
      const settle=async()=>{await wait(()=>!document.querySelector('.focus-editor').disabled&&!button('Apply changes'),'saved');};
      const person=n=>[...document.querySelectorAll('.focus-person-select')].find(b=>b.textContent.trim()==='Person '+n);
      const sourceVideo=()=>document.querySelector('.editor-preview video');
      const frameReady=async()=>{await wait(()=>sourceVideo()?.readyState>=2&&!sourceVideo().seeking&&(!named('Capture camera end').disabled||!named('Capture camera start').disabled),'seeked');};
      globalThis.focusReady=async()=>{await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'preview');[...document.querySelectorAll('[aria-label="Clip settings"] [role="tab"]')].find(n=>n.textContent==='Focus').click();await wait(()=>document.querySelector('.focus-editor'));await frameReady();};
      globalThis.focusUiState=()=>{const f=document.querySelector('footer').getBoundingClientRect();return {shots:[...document.querySelectorAll('.focus-shot')].map(n=>n.firstChild.textContent),selected:[...document.querySelectorAll('.focus-shot')].findIndex(n=>n.getAttribute('aria-pressed')==='true'),dirty:!!button('Apply changes'),footer:f.top>=0&&f.bottom<=innerHeight+1,overflow:document.documentElement.scrollWidth>innerWidth,cropCount:document.querySelectorAll('.focus-crop').length,oldBoxes:document.querySelectorAll('.focus-person-box').length};};
      globalThis.focusCenter=()=>Number(field('Horizontal (%)').value);
      globalThis.focusPointer=()=>{const n=document.querySelector('.focus-person-handle[aria-pressed="true"]');n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect(),s=document.querySelector('.focus-source').getBoundingClientRect();return {x:r.left+r.width/2+3,y:r.top+r.height/2,targetX:r.left+r.width/2+3+s.width*.1};};
      globalThis.focusWaitCenter=async value=>{await wait(()=>Math.abs(globalThis.focusCenter()-value)<1,'drag');};
      globalThis.focusRun=async(action,value)=>{
        if(action==='tab')return tab(value);
        if(action==='add-layout'){
          const group=document.querySelector('.focus-add-position');group.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);
          const footer=document.querySelector('footer').getBoundingClientRect();
          return !globalThis.focusUiState().dirty&&[...group.querySelectorAll('select,button')].every(n=>{const r=n.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&r.bottom<=footer.top+1;});
        }
        if(action==='numbering'){
          await tab('Camera');document.querySelectorAll('.focus-shot')[0].click();await frameReady();
          const before=globalThis.focusUiState().shots;
          button('Add position').click();await wait(()=>named('New position person'));
          if(named('New position person').value!=='person_1'||document.activeElement!==named('New position person')||globalThis.focusUiState().dirty||globalThis.focusUiState().shots.length!==4)return false;
          await change('Person','person_2');if(globalThis.focusUiState().dirty||globalThis.focusUiState().shots.length!==4)return false;
          button('Cancel').click();await wait(()=>!named('New position person'));if(document.activeElement!==button('Add position')||globalThis.focusUiState().dirty)return false;
          button('Add position').click();await wait(()=>named('New position person'));document.querySelectorAll('.focus-shot')[1].click();await wait(()=>!named('New position person'));
          button('Add position').click();await wait(()=>named('New position person'));if(named('New position person').value!=='person_2')return false;button('Cancel').click();
          document.querySelectorAll('.focus-shot')[0].click();await frameReady();button('Add position').click();await wait(()=>named('New position person'));await change('Person','person_2');button('Add').click();await wait(()=>globalThis.focusUiState().shots.length===5);
          if(globalThis.focusUiState().selected!==1||globalThis.focusUiState().shots[1]!=='Person 2 · Position 1'||globalThis.focusUiState().shots[2]!=='Person 2 · Position 2')return false;
          button('Remove position').click();await wait(()=>globalThis.focusUiState().shots.length===4&&!button('Apply changes'));
          button('Add position').click();await wait(()=>named('New position person'));button('Add').click();await wait(()=>globalThis.focusUiState().shots.length===5);
          if(globalThis.focusUiState().selected!==1||globalThis.focusUiState().shots[1]!=='Person 1 · Position 2'||!document.querySelector('[aria-label="Camera controls"] [aria-selected="true"]').textContent.includes('Timing'))return false;
          await tab('Advanced');await change('Zoom','1.8');button('Remove position').click();await wait(()=>globalThis.focusUiState().shots.length===4&&!button('Apply changes'));
          if(JSON.stringify(globalThis.focusUiState().shots)!==JSON.stringify(before))return false;
          document.querySelectorAll('.focus-shot')[2].click();await frameReady();button('Remove position').click();await wait(()=>globalThis.focusUiState().shots.length===3);
          const after=globalThis.focusUiState().shots;
          button('Discard changes').click();await settle();await wait(()=>globalThis.focusUiState().shots.length===4);document.querySelectorAll('.focus-shot')[0].click();await frameReady();
          return JSON.stringify(after)===JSON.stringify(['Person 1 · Position 1','Person 2 · Position 1','Person 1 · Position 2']);
        }
        if(action==='fake-empty'){
          await wait(()=>document.querySelector('.caption-empty')&&document.querySelector('.editor-panels:not([hidden])'),'fake_empty_layout');const panel=document.querySelector('.caption-empty');panel.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=panel.getBoundingClientRect(),f=document.querySelector('footer').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&f.top>=0&&f.bottom<=innerHeight+1&&[...panel.querySelectorAll('button')].every(n=>{const b=n.getBoundingClientRect();return b.width>=44&&b.height>=44&&b.left>=r.left-1&&b.right<=r.right+1;});
        }
        if(action==='fake-captions'){
          await wait(()=>document.querySelector('.caption-empty')&&document.querySelector('.editor-panels:not([hidden])'),'fake_empty');
          const fake=button('Generate fake captions'),real=button('Generate captions');
          if(!fake||fake.disabled||!real?.disabled||document.querySelector('[aria-label="Select and move captions"]'))return false;
          fake.click();await wait(()=>document.querySelector('[aria-label="Caption 1 word 1"]'),'fake_added');
          return document.querySelector('[aria-label="Caption 1 word 1"]').value==='Fictional'&&!document.querySelector('.caption-text-editor input[type="number"]')&&!document.querySelector('[aria-label="Caption generation actions"]');
        }
        if(action==='playback'){
          const video=sourceVideo(),overview=document.querySelector('.focus-source video');
          const descriptor=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'currentTime');
          let overviewSeeks=0,rewinds=0,decoded=0,last=-1,callback=0;const backward=[],seeks=[];
          Object.defineProperty(video,'currentTime',{configurable:true,get(){return descriptor.get.call(this)},set(value){seeks.push([descriptor.get.call(this),value]);descriptor.set.call(this,value)}});
          Object.defineProperty(overview,'currentTime',{configurable:true,get(){return descriptor.get.call(this)},set(value){overviewSeeks++;descriptor.set.call(this,value)}});
          const observe=(now,meta)=>{if(meta.mediaTime<last-.05){rewinds++;backward.push([last,meta.mediaTime]);}last=meta.mediaTime;decoded++;callback=video.requestVideoFrameCallback(observe);};
          callback=video.requestVideoFrameCallback(observe);
          document.querySelector('[aria-label="Mute sound"]')?.click();
          await new Promise(requestAnimationFrame);
          document.querySelector('[aria-label="Play video"]').click();
          await new Promise(r=>setTimeout(r,2600));
          const time=video.currentTime;
          video.cancelVideoFrameCallback(callback);
          document.querySelector('[aria-label="Pause video"]')?.click();
          await new Promise(r=>setTimeout(r,120));
          video.cancelVideoFrameCallback(callback);delete overview.currentTime;delete video.currentTime;
          const result={overviewSeeks,rewinds,decoded,time,backward,seeks,sameVideo:video===sourceVideo()};
          await tab('Camera');document.querySelectorAll('.focus-shot')[0].click();await frameReady();
          return result;
        }
        if(action==='change'){const [label,text]=JSON.parse(value);return change(label,text);}
        if(action==='seek'){await tab('Advanced');await change('Time (s)',value);await frameReady();return;}
        if(action==='row'){document.querySelectorAll('.focus-shot')[Number(value)].click();await frameReady();return;}
        if(action==='person'){person(value).click();await new Promise(requestAnimationFrame);return;}
        if(action==='click'){const n=button(value);if(!n||n.disabled)throw new Error('unavailable_button_'+value);n.click();await new Promise(r=>setTimeout(r,40));return;}
        if(action==='capture'){await frameReady();const n=named('Capture camera '+value);if(n.disabled)throw new Error('capture_disabled_'+value);n.click();await new Promise(r=>setTimeout(r,50));if(!button('Apply changes'))throw new Error('capture_not_changed_'+document.querySelector('.focus-editor [role="status"]')?.textContent);return;}
        if(action==='settle')return settle();
        if(action==='key'){const n=document.querySelector('.focus-person-handle[aria-pressed="true"]');n.focus();n.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await new Promise(r=>setTimeout(r,40));return;}
        if(action==='navigation'){for(const name of ['People','Advanced','Camera'])await tab(name);await tab('People');person(3).click();await new Promise(requestAnimationFrame);return !button('Apply changes')&&document.querySelector('.focus-context').textContent.includes('Not used')&&!document.querySelector('input[aria-label*="appearance"]')&&![...document.querySelectorAll('.focus-editor label')].some(n=>/Appears|Leaves|Appearance/.test(n.textContent));}
        if(action==='advanced'){await tab('Camera');const basic=!field('Zoom').getClientRects().length&&!field('Horizontal (%)').getClientRects().length;await tab('Advanced');return !document.querySelector('.focus-context').textContent.includes('Not used')&&basic&&field('Zoom').getClientRects().length>0&&document.querySelectorAll('[aria-label="Focus controls"] [role="tab"]').length===2&&field('Zoom').closest('[id$="camera-panel"]')!==null;}
        if(action==='pending')return document.querySelector('.focus-editor').disabled;
        if(action==='invalid'){await change('Zoom','0.5');const blocked=button('Apply changes').disabled&&!!document.querySelector('[role="alert"]');await change('Zoom','1.5');return blocked;}
        if(action==='failed')return wait(()=>[...document.querySelectorAll('[role="status"]')].some(n=>n.textContent.includes('Couldn’t save')),'save-failure');
        if(action==='removal'){await tab('People');person(4).click();await new Promise(requestAnimationFrame);named('Remove Person 2').click();await wait(()=>!person(2));if(!person(4)||person(4).getAttribute('aria-pressed')!=='true')throw new Error('remove_selection_regression');button('Discard changes').click();await settle();await wait(()=>person(2)&&person(4));person(4).click();await new Promise(requestAnimationFrame);await wait(()=>document.querySelector('footer').getBoundingClientRect().height>0,'removal-footer');const n=named('Remove Person 4');n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect(),row=n.closest('.focus-person-row'),footer=document.querySelector('footer').getBoundingClientRect();const fit=r.width>=44&&r.height>=44&&r.bottom<=footer.top+1&&row.scrollWidth<=row.clientWidth+1;n.click();await wait(()=>!person(4));if(!fit)throw new Error('remove_layout_'+JSON.stringify({width:r.width,height:r.height,bottom:r.bottom,footer:footer.top,rowWidth:row.scrollWidth,client:row.clientWidth}));return !!person(2)&&!!person(3);}
        if(action==='keyboard'){const camera=[...document.querySelectorAll('[aria-label="Focus controls"] [role="tab"]')][0];camera.focus();camera.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));await new Promise(requestAnimationFrame);if(document.activeElement.textContent!=='People')return false;await tab('Camera');const timing=[...document.querySelectorAll('[aria-label="Camera controls"] [role="tab"]')][0];timing.focus();timing.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));await new Promise(requestAnimationFrame);return document.activeElement.textContent==='Advanced';}
        if(action==='layout'){const panel=document.querySelector('[role="tabpanel"][id$="'+value.toLowerCase()+'-panel"]');panel.scrollIntoView({block:'start'});return globalThis.focusUiState();}
        if(action==='positions'){const n=named('Person position'),choices=[...n.options].map(o=>o.value);await change('Position',choices[2]);await wait(()=>globalThis.focusUiState().selected===3);const lastLocked=named('Capture camera end').disabled;await change('Position',choices[1]);await wait(()=>globalThis.focusUiState().selected===2);await frameReady();return lastLocked&&!button('Apply changes');} if(action==='scrubber'){const n=[...document.querySelectorAll('.editor-preview div')].filter(n=>n.style.touchAction==='none'&&n.style.paddingTop==='4px'&&n.getClientRects().length).sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];if(!n)throw new Error('missing_playback_scrubber');n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return {x:r.left+1,y:r.top+r.height/2,targetX:r.left+r.width*39/119};} if(action==='scrub-start'){await wait(()=>Number(field('Time (s)').value)<=.067,'slider-start');return;} if(action==='scrub-frame'){await wait(()=>Number(field('Time (s)').value)>1&&Number(field('Time (s)').value)<2);await frameReady();return Math.round(Number(field('Time (s)').value)*30);} if(action==='active-person')return document.querySelector('.focus-person-select[aria-pressed=true]')?.textContent; if(action==='zoom')return Number(field('Zoom').value); if(action==='scroll-capture'){named('Capture camera start').scrollIntoView({block:'center'});return;} if(action==='no-appearance')return !document.querySelector('.focus-editor').textContent.match(/appearance|Appears at|Leaves at/i);
        if(action==='capture-guards'){const video=sourceVideo();const locked=named('Capture camera start').disabled;Object.defineProperty(video,'seeking',{configurable:true,value:true});video.dispatchEvent(new Event('seeking'));await wait(()=>named('Capture camera end').disabled);delete video.seeking;video.dispatchEvent(new Event('seeked'));await frameReady();named('Capture camera end').click();await wait(()=>document.querySelector('.local-error')?.textContent.includes('neighboring'));return locked&&!button('Apply changes');} if(action==='preview-error'){sourceVideo().dispatchEvent(new Event('error',{bubbles:true}));await wait(()=>named('Retry preview'),'preview-error');const blocked=named('Capture camera end').disabled;named('Retry preview').click();await frameReady();return blocked;} if(action==='crop'){const v=sourceVideo().getBoundingClientRect(),c=document.querySelector('.editor-preview').getBoundingClientRect(),n=document.querySelector('.focus-person-handle[aria-pressed=true]'),style=getComputedStyle(n);return {x:(c.left-v.left)*1080/v.width,y:(c.top-v.top)*1920/v.height,width:c.width*1080/v.width,height:c.height*1920/v.height,handleFrame:style.boxShadow==='none'&&style.borderTopWidth==='0px'};} if(action==='cancel'){document.querySelector('.focus-person-handle[aria-pressed="true"]').dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,bubbles:true}));return;}
        throw new Error('unknown_action_'+action);
      };
    `;
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    const run = (action: string, value?: string) =>
      page.evaluate(
        (a: string, v: string) => focusRun(a, v),
        action,
        value ?? "",
      );
    const change = (label: string, value: string) =>
      run("change", JSON.stringify([label, value]));
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 568 },
    ]) {
      clip = ownerClipSchema.parse({
        ...clip,
        revision: 0,
        edit: automaticOwnerEdit(clip.base!, clip.id, baseHash),
      });
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      await page.goto({ url: `http://127.0.0.1:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      if (viewport.width === 1440) {
        for (const width of [1440, 390, 320]) {
          await page.setViewport({
            width,
            height: width === 320 ? 568 : 844,
            deviceScaleFactor: 1,
          });
          expect(await run("fake-empty")).toBe(true);
          const shot = await page._client().send("Page.captureScreenshot", {
            format: "png",
            fromSurface: true,
          });
          await writeFile(
            resolve(`.local-build/evidence/cl078-fake-empty-${width}.png`),
            Buffer.from(shot.value.data, "base64"),
          );
        }
        await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
        expect(await run("fake-captions")).toBe(true);
        expect(fakeCaptionRequests).toBe(1);
        clip = ownerClipSchema.parse({
          ...clip,
          base,
          baseHash,
          revision: 0,
          edit: automaticOwnerEdit(
            ownerClipBaseSchema.parse(base),
            clip.id,
            baseHash,
          ),
        });
        await page.goto({ url: `http://127.0.0.1:${port}/`, timeout: 15000 });
        await page._client().send("Runtime.evaluate", { expression: driver });
      }
      await page.evaluate(() => focusReady());
      await page._client().send("Runtime.evaluate", {
        expression:
          "globalThis.focusPlayback=()=>globalThis.focusRun('playback')",
      });
      const playback = await page.evaluate(() => focusPlayback());
      expect(playback, JSON.stringify(playback)).toMatchObject({
        rewinds: 0,
        sameVideo: true,
      });
      expect(playback.overviewSeeks).toBeLessThanOrEqual(4);
      expect(playback.decoded).toBeGreaterThan(35);
      expect(playback.time).toBeGreaterThan(1.8);
      expect((await page.evaluate(() => focusUiState())).shots).toEqual([
        "Person 1 · Position 1",
        "Person 2 · Position 1",
        "Person 1 · Position 2",
        "Person 1 · Position 3",
      ]);
      expect(await run("numbering")).toBe(true);
      expect(await run("keyboard")).toBe(true);
      expect(await run("navigation")).toBe(true);
      expect(await run("no-appearance")).toBe(true);
      expect(await run("advanced")).toBe(true);
      await run("tab", "People");
      await run("person", "1");
      expect(await run("positions")).toBe(true);
      await run("tab", "Advanced");
      const pointer = await page.evaluate(() => focusPointer()),
        client = page._client();
      const before = await page.evaluate(() => focusCenter());
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: pointer.x,
        y: pointer.y,
      });
      await client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: pointer.x,
        y: pointer.y,
        button: "left",
        buttons: 1,
        clickCount: 1,
      });
      expect(await page.evaluate(() => focusCenter())).toBe(before);
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: pointer.targetX,
        y: pointer.y,
        button: "left",
        buttons: 1,
      });
      await page.evaluate(() => focusWaitCenter(35));
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: pointer.targetX,
        y: pointer.y,
        button: "left",
        buttons: 0,
      });
      await run("key");
      expect(await page.evaluate(() => focusCenter())).toBeGreaterThan(35);
      const touch = await page.evaluate(() => focusPointer());
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: touch.x, y: touch.y, id: 1 }],
      });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: touch.targetX, y: touch.y, id: 1 }],
      });
      await page.evaluate(() => focusWaitCenter(46));
      await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      const canceled = await page.evaluate(() => focusPointer());
      const canceledCenter = await page.evaluate(() => focusCenter());
      await client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: canceled.x,
        y: canceled.y,
        button: "left",
        buttons: 1,
        clickCount: 1,
      });
      await run("cancel");
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: canceled.targetX,
        y: canceled.y,
        button: "left",
        buttons: 1,
      });
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: canceled.targetX,
        y: canceled.y,
        button: "left",
        buttons: 0,
      });
      expect(await page.evaluate(() => focusCenter())).toBe(canceledCenter);
      await run("click", "Discard changes");
      await run("settle");
      await run("tab", "Camera");
      await run("row", "0");
      await run("tab", "People");
      await run("key");
      await run("tab", "Advanced");
      await change("Zoom", "1.25");
      await run("click", "Apply changes");
      expect(await run("pending")).toBe(true);
      await run("settle");
      expect(
        clip.edit!.focus!.shots[0],
        JSON.stringify({
          width: viewport.width,
          shots: clip.edit!.focus!.shots,
          ui: await page.evaluate(() => focusUiState()),
        }),
      ).toMatchObject({
        personId: "person_1",
        zoom: 1.25,
      });
      expect(clip.edit!.focus!.shots[2]).toEqual(focus.shots[2]);
      expect(clip.edit!.focus!.shots[1]).toEqual(focus.shots[1]);
      expect(clip.edit!.focus!.shots[3]).toEqual(focus.shots[3]);
      expect(clip.edit!.focus!.people).toEqual(focus.people);
      expect(clip.base!.overlay.focus).toEqual(focus);
      const geometry = (await run("crop")) as {
        x: number;
        y: number;
        width: number;
        height: number;
        handleFrame: boolean;
      };
      const expectedCrop = ownerFocusCrop(
        clip.edit!.focus!,
        clip.edit!.focus!.shots[0]!,
      );
      for (const key of ["x", "y", "width", "height"] as const)
        expect(geometry[key]).toBeCloseTo(expectedCrop[key], 1);
      expect(geometry.handleFrame).toBe(true);
      await run("tab", "Camera");
      await run("row", "1");
      await change("Focus on", "person_1");
      await run("tab", "Advanced");
      expect(await run("zoom")).toBe(1);
      await run("click", "Discard changes");
      await run("settle");
      expect(await run("active-person")).toBe("Person 2");
      await run("tab", "Camera");
      await run("row", "0");
      await run("seek", "3.7");
      await run("tab", "Camera");
      expect(await run("capture-guards")).toBe(true);
      expect(await run("preview-error")).toBe(true);
      const scrub = (await run("scrubber")) as {
        x: number;
        y: number;
        targetX: number;
      };
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: scrub.x,
        y: scrub.y,
      });
      await client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: scrub.x,
        y: scrub.y,
        button: "left",
        buttons: 1,
        clickCount: 1,
      });
      await run("scrub-start");
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: scrub.targetX,
        y: scrub.y,
        button: "left",
        buttons: 1,
      });
      const scrubbedFrame = (await run("scrub-frame")) as number;
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: scrub.targetX,
        y: scrub.y,
        button: "left",
        buttons: 0,
      });
      await run("tab", "Camera");
      expect((await page.evaluate(() => focusUiState())).selected).toBe(0);
      await run("capture", "end");
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.focus!.shots[0]!.endFrame).toBe(scrubbedFrame + 1);
      expect(clip.edit!.focus!.shots[1]!.startFrame).toBe(scrubbedFrame + 1);
      await run("row", "1");
      await run("seek", "0.967");
      await run("tab", "Camera");
      await run("capture", "start");
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.focus!.shots[0]!.endFrame).toBe(29);
      expect(clip.edit!.focus!.shots[1]!.startFrame).toBe(29);
      await run("seek", "1.5");
      await run("tab", "Camera");
      await run("click", "Add position");
      await run("click", "Add");
      await run("tab", "Advanced");
      await change("Zoom", "2");
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.focus!.shots).toHaveLength(5);
      expect(clip.edit!.focus!.shots[1]!.zoom).toBe(1);
      expect(clip.edit!.focus!.shots[2]!.zoom).toBe(2);
      expect(clip.edit!.focus!.shots[2]!.personId).toBe("person_2");
      await run("tab", "People");
      await run("click", "Add person");
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.focus!.people).toHaveLength(4);
      expect(await run("removal")).toBe(true);
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.focus!.people.map((p) => p.id)).toEqual([
        "person_1",
        "person_2",
        "person_3",
      ]);
      expect(clip.edit!.focus!.shots[2]).toMatchObject({
        personId: null,
        zoom: 2,
      });
      await run("person", "3");
      expect((await page.evaluate(() => focusUiState())).dirty).toBe(false);
      await run("click", "Use here");
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.focus!.shots[2]!.personId).toBe("person_3");
      await run("tab", "Camera");
      await run("click", "Add position");
      expect(await run("add-layout")).toBe(true);
      const composer = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
      });
      await writeFile(
        resolve(`.local-build/evidence/cl076-add-${viewport.width}.png`),
        Buffer.from(composer.value.data, "base64"),
      );
      await run("click", "Cancel");
      for (const tab of ["Camera", "People", "Advanced"]) {
        await run("tab", tab);
        const state = await run("layout", tab);
        expect(state).toMatchObject({
          footer: true,
          overflow: false,
          cropCount: 1,
          oldBoxes: 0,
        });
        const shot = await client.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
        });
        await writeFile(
          resolve(
            `.local-build/evidence/cl072-${tab.toLowerCase()}-${viewport.width}.png`,
          ),
          Buffer.from(shot.value.data, "base64"),
        );
      }
      await run("tab", "Camera");
      await run("scroll-capture");
      const captureLayout = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl072-capture-${viewport.width}.png`),
        Buffer.from(captureLayout.value.data, "base64"),
      );
      await run("tab", "Advanced");
      expect(await run("invalid")).toBe(true);
      await run("click", "Discard changes");
      await run("settle");
      await run("click", "Reset focus");
      await run("click", "Apply changes");
      await run("settle");
      expect(clip.edit!.focus).toEqual(focus);
    }
    await run("tab", "Advanced");
    await change("Zoom", "1.5");
    failNext = true;
    await run("click", "Apply changes");
    await run("failed");
    expect(clip.edit!.focus!.shots[0]!.zoom).toBe(1);
    await run("click", "Apply changes");
    await run("settle");
    expect(clip.edit!.focus!.shots[0]!.zoom).toBe(1.5);
    await page.goto({ url: `http://127.0.0.1:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await page.evaluate(() => focusReady());
    await run("tab", "Advanced");
    expect(await page.evaluate(() => focusCenter())).toBeCloseTo(
      clip.edit!.focus!.shots[0]!.centerX * 100,
      1,
    );
    expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
    expect(edits).toBe(25);
  } finally {
    await stop();
    await browser?.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    expect(server.listening).toBe(false);
    await clearScratch(directory);
  }
}, 180_000);
