import { expect, it } from "vitest";
import { createServer } from "node:http";
import {
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { build, stop } from "esbuild";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { listenOwner } from "./owner-http.ts";

// Chromium's public performance command is omitted from Remotion's small CDP
// subset. Extend that test-only protocol typing instead of casting its response.
declare module "../apps/renderer/node_modules/@remotion/renderer/dist/browser/devtools-commands.js" {
  interface Commands {
    "Performance.getMetrics": {
      paramsType: [];
      returnType: { metrics: { name: string; value: number }[] };
    };
  }
}

type PlaybackMeasurement = {
  decoded: number;
  gapMs: number;
  buffering: number;
  seeks: number;
  pauses: number;
  rewinds: number;
  sameVideo: boolean;
  drops: number;
  progress: number;
  images: number;
  warnings: number;
  imageReadyAtCue: boolean | null;
};
declare global {
  function smoothPlaybackMeasure(): Promise<PlaybackMeasurement>;
  function smoothPlaybackCleanup(): number;
}

async function cleanup(directory: string) {
  const actual = await realpath(directory),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel.startsWith("clipbuilder-playback-") ||
    rel.includes("..") ||
    isAbsolute(rel)
  )
    throw Error("invalid_playback_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("plays admitted and dynamically added images through camera/Zoom/Motion without buffering or source resets", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-playback-"));
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let unexpected = 0,
    imageResponses = 0;
  const server = createServer((req, res) => {
    void (async () => {
      const path = req.url?.split("?")[0];
      if (path === "/favicon.ico") return void res.writeHead(204).end();
      const file =
        path === "/"
          ? "index.html"
          : path === "/app.js"
            ? "app.js"
            : path === "/source.mp4"
              ? "source.mp4"
              : path === "/image.png"
                ? "image.png"
                : null;
      if (!file) {
        unexpected++;
        res.writeHead(404).end();
        return;
      }
      const bytes = await readFile(join(directory, file));
      if (file === "image.png")
        await new Promise<void>((done) => {
          const timer = setTimeout(() => {
            timers.delete(timer);
            done();
          }, 900);
          timers.add(timer);
        });
      if (res.destroyed) return;
      if (file === "image.png") imageResponses++;
      const range = file.endsWith("mp4")
        ? /^bytes=(\d+)-(\d*)$/u.exec(req.headers.range ?? "")
        : null;
      const start = Number(range?.[1] ?? 0),
        end = Math.min(
          Number(range?.[2] || bytes.length - 1),
          bytes.length - 1,
        );
      res
        .writeHead(range ? 206 : 200, {
          "Content-Type": file.endsWith("html")
            ? "text/html"
            : file.endsWith("js")
              ? "text/javascript"
              : file.endsWith("png")
                ? "image/png"
                : "video/mp4",
          "Content-Length": end - start + 1,
          ...(file.endsWith("mp4") ? { "Accept-Ranges": "bytes" } : {}),
          ...(range
            ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` }
            : {}),
          "Cache-Control": "no-store",
        })
        .end(bytes.subarray(start, end + 1));
    })().catch(() => {
      if (!res.destroyed) res.writeHead(500).end();
    });
  });
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
        "testsrc2=s=1920x1080:r=30:d=9",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        join(directory, "source.mp4"),
      ],
      AbortSignal.timeout(30000),
    );
    await sharp({
      create: { width: 1920, height: 1920, channels: 3, background: "#ff4040" },
    })
      .png()
      .toFile(join(directory, "image.png"));
    await build({
      stdin: {
        contents: `
        import React,{useRef,useState} from 'react';import{createRoot}from'react-dom/client';import{Player}from'@remotion/player';
        import{Review}from'./apps/frontend/src/features/local-editing/clip-editor.tsx';
        import{defaultOwnerFocus}from'./packages/contracts/local/focus.ts';import{ownerCameraFollowKey}from'./packages/contracts/local/camera-follow.ts';
        const blobs=new Set();const createBlob=URL.createObjectURL.bind(URL),revokeBlob=URL.revokeObjectURL.bind(URL);URL.createObjectURL=value=>{const url=createBlob(value);blobs.add(url);return url};URL.revokeObjectURL=url=>{blobs.delete(url);revokeBlob(url)};globalThis.smoothPlaybackCleanup=()=>blobs.size;
        const mode=new URLSearchParams(location.search).get('mode'),id='11111111-1111-4111-8111-111111111111';
        const focus=defaultOwnerFocus({width:1920,height:1080},270);
        focus.shots=Array.from({length:9},(_,i)=>({...focus.shots[0],startFrame:i*30,endFrame:(i+1)*30,centerX:i%2?.7:.3}));
        const visual=(key,start=120)=>({id:key,assetId:key,origin:'synthetic',startFrame:start,endFrame:240,fit:'cover',box:{x:.1,y:.6,width:.8,height:.3},motion:{type:'none'}});
        const overlay={version:1,frames:270,captions:[],visuals:mode==='dynamic'?[]:[visual(id)],focus,
          cameraEffects:[{id,occurrence:'body',startFrame:30,zoomFrames:29,holdFrames:0,returnFrames:0,target:{centerX:.7,centerY:.5,zoom:1.5}}],
          cameraTracks:[{id,occurrence:'body',personId:null,startFrame:150,endFrame:180,sourceStartFrame:150,focusKey:ownerCameraFollowKey(focus,null),seed:{x:.2,y:.3,width:.1,height:.1},outcome:'complete',points:Array.from({length:16},(_,i)=>Math.min(i*2,29)).map(frame=>({frame,x:.25+frame/145,y:.35}))}]};
        let player,update,assetUpdate;const noop=()=>{};const root=createRoot(document.getElementById('root'));
        function App(){const ref=useRef(null),[value,setValue]=useState(overlay),[assets,setAssets]=useState(mode==='dynamic'?{}:{[id]:'/image.png?initial'});player=ref;update=setValue;assetUpdate=setAssets;return <Player ref={ref} component={Review} inputProps={{overlay:value,workspaceId:'synthetic',assets,sourceUrl:'/source.mp4',selection:'',onSelect:noop,onBox:noop,onGestureStart:noop,onPlaybackError:()=>{throw Error('playback_failed')},onPreviewReady:noop,interactive:false,setting:'focus',silent:true}} durationInFrames={270} compositionWidth={1080} compositionHeight={1920} fps={30} numberOfSharedAudioTags={0} initiallyMuted controls={false} style={{width:Math.min(340,innerWidth)}}/>}
        let warnings=0;const original=console.error;console.error=(...args)=>{if(args.some(a=>typeof a==='string'&&/Maximum update depth|Too many re-renders/.test(a)))warnings++;original(...args)};
        root.render(<React.StrictMode><App/></React.StrictMode>);
        const wait=async(fn)=>{for(let i=0;i<500;i++){if(fn())return;await new Promise(r=>setTimeout(r,20))}throw Error('playback_not_ready')};
        globalThis.smoothPlaybackMeasure=async()=>{
          await wait(()=>player?.current&&document.querySelector('video')?.readyState>=2);
          // Initial media/asset preparation is distinct from continuous playback.
          await new Promise(r=>setTimeout(r,1200));
          const video=document.querySelector('video');let decoded=0,gapMs=0,last=0,rewinds=0,lastMedia=-1,seeks=0,pauses=0,buffering=0,stopped=false,handle=0,imageReadyAtCue=mode==='dynamic'?null:false,checkedImage=false;
          const seek=()=>seeks++,pause=()=>pauses++,buffer=()=>buffering++;
          video.addEventListener('seeking',seek);video.addEventListener('pause',pause);player.current.addEventListener('waiting',buffer);
          const callback=(now,meta)=>{if(!checkedImage&&mode!=='dynamic'&&player.current.getCurrentFrame()>=120){checkedImage=true;setTimeout(()=>{const image=document.querySelector('img');imageReadyAtCue=!!image?.complete&&image.naturalWidth>0},0)}decoded++;if(last)gapMs=Math.max(gapMs,now-last);last=now;if(meta.mediaTime<lastMedia)rewinds++;lastMedia=meta.mediaTime;if(!stopped)handle=video.requestVideoFrameCallback(callback)};
          const before=video.getVideoPlaybackQuality();handle=video.requestVideoFrameCallback(callback);const begin=player.current.getCurrentFrame();
          player.current.play();const dynamic=mode==='dynamic'?setTimeout(()=>{assetUpdate({[id]:'/image.png?dynamic'});update(v=>({...v,visuals:[visual(id,0)]}))},2500):0;
          try{await new Promise(r=>setTimeout(r,7300));return {decoded,gapMs,buffering,seeks,pauses,rewinds,sameVideo:document.querySelector('video')===video,drops:video.getVideoPlaybackQuality().droppedVideoFrames-before.droppedVideoFrames,progress:(player.current.getCurrentFrame()-begin)/30,images:document.querySelectorAll('img').length,warnings,imageReadyAtCue}}
          finally{stopped=true;clearTimeout(dynamic);video.cancelVideoFrameCallback(handle);video.removeEventListener('seeking',seek);video.removeEventListener('pause',pause);player.current.removeEventListener('waiting',buffer);player.current.pause();root.unmount()}
        };
      `,
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
      '<!doctype html><html><body style="margin:0"><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
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
    const evidence = [];
    for (const scenario of [
      { width: 1440, height: 900, mode: "known" },
      { width: 820, height: 1180, mode: "dynamic" },
      { width: 390, height: 844, mode: "known" },
    ]) {
      await page.setViewport({ ...scenario, deviceScaleFactor: 1 });
      await page.goto({
        url: `http://127.0.0.1:${port}/?mode=${scenario.mode}`,
        timeout: 15000,
      });
      await page._client().send("Performance.enable");
      const before = await page._client().send("Performance.getMetrics");
      const result = await page.evaluate(() => smoothPlaybackMeasure());
      const after = await page._client().send("Performance.getMetrics");
      const rendering = Object.fromEntries(
        [
          "LayoutCount",
          "LayoutDuration",
          "RecalcStyleCount",
          "RecalcStyleDuration",
          "TaskDuration",
        ].map((name) => [
          name,
          (after.value.metrics.find((m) => m.name === name)?.value ?? 0) -
            (before.value.metrics.find((m) => m.name === name)?.value ?? 0),
        ]),
      );
      evidence.push({ scenario, result, rendering });
      expect(await page.evaluate(() => smoothPlaybackCleanup())).toBe(0);
    }
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl256-playback.json"),
      JSON.stringify({ synthetic: true, providerCalls: 0, evidence }, null, 2),
    );
    for (const { result, scenario } of evidence) {
      expect(result, JSON.stringify(result)).toMatchObject({
        buffering: 0,
        seeks: 0,
        pauses: 0,
        rewinds: 0,
        sameVideo: true,
        warnings: 0,
        images: 1,
      });
      if (scenario.mode !== "dynamic")
        expect(result.imageReadyAtCue).toBe(true);
      expect(result.gapMs).toBeLessThan(200);
      expect(result.decoded).toBeGreaterThan(190);
      expect(result.progress).toBeGreaterThan(7);
    }
    expect(unexpected).toBe(0);
    expect(imageResponses).toBe(3);
  } finally {
    for (const timer of timers) clearTimeout(timer);
    await stop();
    await browser?.close({ silent: true });
    await new Promise<void>((done) => {
      server.close(() => done());
      server.closeAllConnections();
    });
    await cleanup(directory);
  }
}, 90000);
