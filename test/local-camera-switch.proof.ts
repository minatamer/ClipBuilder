import { expect, it } from "vitest";
import { createServer } from "node:http";
import {
  mkdir,
  mkdtemp,
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
import { listenOwner } from "./owner-http.ts";

type Measurement = {
  decoded: number;
  mismatches: number;
  examples: {
    source: number;
    player: number;
    actual: number;
    expected: number;
  }[];
  rewinds: number;
  switches: number;
  sameVideo: boolean;
  progress: number;
};
declare global {
  function cameraMeasure(): Promise<Measurement>;
  function cameraLifecycle(): Promise<{
    seek: boolean;
    edit: boolean;
    replay: boolean;
    cleanup: boolean;
    fallbackMoves: boolean;
    pausedEditAfterPlayback: boolean;
    replacement: boolean;
  }>;
}
async function cleanup(directory: string) {
  const actual = await realpath(directory),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel.startsWith("clipbuilder-camera-switch-") ||
    rel.includes("..") ||
    isAbsolute(rel)
  )
    throw Error("invalid_camera_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("keeps normal preview camera cuts aligned with decoded source frames during sustained playback", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-camera-switch-"));
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  const server = createServer((req, res) => {
    void (async () => {
      if (req.url === "/favicon.ico") {
        res.writeHead(204).end();
        return;
      }
      const pathname = req.url?.split("?")[0];
      const file =
        pathname === "/"
          ? "index.html"
          : req.url === "/app.js"
            ? "app.js"
            : pathname === "/source.mp4" || pathname === "/replacement.mp4"
              ? "source.mp4"
              : null;
      if (!file) {
        res.writeHead(404).end();
        return;
      }
      const bytes = await readFile(join(directory, file));
      const range = file.endsWith("mp4")
        ? /^bytes=(\d+)-(\d*)$/u.exec(req.headers.range ?? "")
        : null;
      const start = Number(range?.[1] ?? 0),
        end = Math.min(
          Number(range?.[2] || bytes.length - 1),
          bytes.length - 1,
        );
      if (start > end || start >= bytes.length) {
        res.writeHead(416).end();
        return;
      }
      res
        .writeHead(range ? 206 : 200, {
          "Content-Type": file.endsWith("html")
            ? "text/html"
            : file.endsWith("js")
              ? "text/javascript"
              : "video/mp4",
          "Content-Length": end - start + 1,
          ...(file.endsWith("mp4") ? { "Accept-Ranges": "bytes" } : {}),
          ...(range
            ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` }
            : {}),
        })
        .end(bytes.subarray(start, end + 1));
    })().catch(() => res.writeHead(500).end());
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
        "color=navy:s=108x192:r=30:d=7",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        join(directory, "source.mp4"),
      ],
      AbortSignal.timeout(30000),
    );
    await build({
      stdin: {
        contents: `
      import React,{useRef,useState} from 'react';import {createRoot} from 'react-dom/client';
      import {Player} from '@remotion/player';import {Review} from './apps/frontend/src/features/local-editing/clip-editor.tsx';
      import {defaultOwnerFocus} from './packages/contracts/local/focus.ts';import {ownerCameraCropAt} from './packages/contracts/local/camera-motion.ts';
      import {ownerCameraFollowKey} from './packages/contracts/local/camera-follow.ts';
      import {ownerPresentationFrames} from './packages/contracts/local/hook.ts';
      const mode=new URLSearchParams(location.search).get('mode');
      if(mode==='fallback')HTMLVideoElement.prototype.requestVideoFrameCallback=undefined;
      const focus=defaultOwnerFocus({width:1920,height:1080},210);
      focus.shots=Array.from({length:21},(_,i)=>({...focus.shots[0],startFrame:i*10,endFrame:(i+1)*10,centerX:i%2?.75:.25,reason:'manual'}));
      const overlay={version:1,frames:210,captions:[],visuals:[],focus};
      if(mode==='hook')overlay.hook={startFrame:30,endFrame:90};
      if(mode==='motion'){
        overlay.cameraEffects=[{id:'11111111-1111-4111-8111-111111111111',occurrence:'body',startFrame:20,zoomFrames:9,holdFrames:9,returnFrames:12,target:{centerX:.6,centerY:.4,zoom:2}}];
        overlay.cameraTracks=[{id:'22222222-2222-4222-8222-222222222222',occurrence:'body',personId:null,startFrame:80,endFrame:120,sourceStartFrame:80,focusKey:ownerCameraFollowKey(focus,null),seed:{x:.2,y:.3,width:.1,height:.1},outcome:'complete',points:[...Array.from({length:20},(_,i)=>i*2),39].map(frame=>({frame,x:.25+frame/100,y:.35}))}];
      }
      let player,update,replace,current=overlay;const root=createRoot(document.getElementById('root'));
      const noop=()=>{};function App(){const ref=useRef(null);const [value,setValue]=useState(overlay),[url,setUrl]=useState('/source.mp4');current=value;update=setValue;replace=()=>setUrl('/replacement.mp4');player=ref;return <Player ref={ref} component={Review} inputProps={{overlay:value,workspaceId:'synthetic',assets:{},sourceUrl:url,selection:'',onSelect:noop,onBox:noop,onGestureStart:noop,onPlaybackError:noop,onPreviewReady:noop,interactive:false,setting:'filters',silent:true}} durationInFrames={ownerPresentationFrames(value)} compositionWidth={1080} compositionHeight={1920} fps={30} numberOfSharedAudioTags={0} initiallyMuted controls={false} style={{width:Math.min(240,innerWidth)}}/>};
      root.render(<React.StrictMode><App/></React.StrictMode>);
      const wait=async(fn,phase='ready')=>{for(let i=0;i<500;i++){if(fn())return;await new Promise(r=>setTimeout(r,20));}throw Error('camera_fixture_not_ready_'+phase+'_'+JSON.stringify({player:player.current?.getCurrentFrame(),videos:[...document.querySelectorAll('video')].map(v=>({active:v.dataset.editorActive,time:v.currentTime,seeking:v.seeking,ready:v.readyState,left:getComputedStyle(v).left,width:getComputedStyle(v).width}))}));};
      const active=()=>document.querySelector('video[data-editor-active="true"]');
      const observedTimes=new WeakMap();
      const expectedAt=(video,time)=>{const source=Math.max(0,Math.round(time*30)),kind=video.dataset.editorVideo;return ownerCameraCropAt(current.focus,current.cameraEffects??[],source,kind,source-(kind==='hook'?current.hook.startFrame:0),current.cameraTracks??[]);};
      const cropMatches=(video,crop)=>{const style=getComputedStyle(video),values={left:-crop.x*1080/crop.width,top:-crop.y*1920/crop.height,width:1080*1080/crop.width,height:1920*1920/crop.height};return Object.entries(values).every(([key,value])=>Math.abs(parseFloat(style[key])-value)<.5);};
      const observedTime=video=>observedTimes.get(video)??video.currentTime;
      const aligned=video=>cropMatches(video,expectedAt(video,observedTime(video)));
      globalThis.cameraMeasure=async()=>{
        await wait(()=>player.current&&active()?.readyState>=2);
        player.current.pause();player.current.seekTo(0);await new Promise(r=>setTimeout(r,200));
        const handles=new Map(),lasts=new Map(),sides=new Map(),kinds=new Map(),sequences=new Map();
        let decoded=0,mismatches=0,rewinds=0,switches=0,sameVideo=true,stopped=false;const examples=[];
        const watch=video=>{if(handles.has(video))return;const kind=video.dataset.editorVideo;if(kinds.has(kind)&&kinds.get(kind)!==video)sameVideo=false;kinds.set(kind,video);const callback=(_now,metadata)=>{
          if(video.dataset.editorActive==='true'){
            const source=Math.max(0,Math.round(metadata.mediaTime*30)),crop=expectedAt(video,metadata.mediaTime),sequence=(sequences.get(video)??0)+1;sequences.set(video,sequence);
            const expected=-crop.x*1080/crop.width,last=lasts.get(video)??-1,side=sides.get(video)??-1;
            if(source<last)rewinds++;lasts.set(video,source);const next=Math.floor(source/10);if(side>=0&&next!==side)switches++;sides.set(video,next);decoded++;
            setTimeout(()=>{if(stopped||!video.isConnected||sequences.get(video)!==sequence)return;const actual=parseFloat(getComputedStyle(video).left);if(!cropMatches(video,crop)){mismatches++;if(examples.length<12)examples.push({source,player:player.current.getCurrentFrame(),actual,expected});}},0);
          }
          if(!stopped&&video.isConnected)handles.set(video,video.requestVideoFrameCallback(callback));
        };handles.set(video,video.requestVideoFrameCallback(callback));};
        const scan=()=>document.querySelectorAll('video').forEach(watch);scan();const observer=new MutationObserver(scan);observer.observe(document.getElementById('root'),{childList:true,subtree:true});
        const begin=player.current.getCurrentFrame();
        try{player.current.play();await new Promise(r=>setTimeout(r,6200));player.current.pause();await new Promise(r=>setTimeout(r,10));return {decoded,mismatches,examples,rewinds,switches,sameVideo,progress:(player.current.getCurrentFrame()-begin)/30};}
        finally{stopped=true;observer.disconnect();for(const [video,handle]of handles)video.cancelVideoFrameCallback(handle);player.current.pause();}
      };
      globalThis.cameraLifecycle=async()=>{
        const handles=new Map();const scan=()=>document.querySelectorAll('video').forEach(video=>{if(handles.has(video)||typeof video.requestVideoFrameCallback!=='function')return;const callback=(_now,metadata)=>{observedTimes.set(video,metadata.mediaTime);if(video.isConnected)handles.set(video,video.requestVideoFrameCallback(callback));};handles.set(video,video.requestVideoFrameCallback(callback));});scan();const mediaObserver=new MutationObserver(scan);mediaObserver.observe(document.getElementById('root'),{childList:true,subtree:true});
        await wait(()=>player.current&&active()?.readyState>=2);player.current.pause();player.current.seekTo(43);await wait(()=>active()&&!active().seeking&&Math.abs(active().currentTime-43/30)<.04&&aligned(active()),'seek43');
        const video=active(),seek=aligned(video);update(value=>({...value,focus:{...value.focus,shots:value.focus.shots.map((s,i)=>i===4?{...s,centerX:.6}:s)}}));await new Promise(r=>setTimeout(r,100));const edit=video===active()&&aligned(video);
        player.current.seekTo(0);await wait(()=>!video.seeking&&video.currentTime<.04&&aligned(video),'replay0');const replay=aligned(video);let mutations=0;const observer=new MutationObserver(()=>mutations++);observer.observe(video,{attributes:true,attributeFilter:['style']});
        player.current.play();await new Promise(r=>setTimeout(r,700));player.current.pause();const fallbackMoves=mutations>0&&video.currentTime>.4;await new Promise(r=>setTimeout(r,100));
        const index=Math.floor(Math.round(observedTime(video)*30)/10);update(value=>({...value,focus:{...value.focus,shots:value.focus.shots.map((s,i)=>i===index?{...s,centerX:.4}:s)}}));await new Promise(r=>setTimeout(r,100));const pausedEditAfterPlayback=aligned(video);
        const oldStyle=video.getAttribute('style');replace();await wait(()=>active()!==video&&active()?.readyState>=2&&!active().seeking&&(typeof active().requestVideoFrameCallback!=='function'||observedTimes.has(active()))&&aligned(active()),'replacement');const next=active();await new Promise(r=>setTimeout(r,100));const replacement=!video.isConnected&&video.getAttribute('style')===oldStyle&&aligned(next);
        const before=next.getAttribute('style');root.unmount();await new Promise(r=>setTimeout(r,150));const cleanup=!next.isConnected&&before===next.getAttribute('style');observer.disconnect();mediaObserver.disconnect();for(const [node,handle]of handles)node.cancelVideoFrameCallback(handle);return {seek,edit,replay,cleanup,fallbackMoves,pausedEditAfterPlayback,replacement};
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
      '<!doctype html><html><body style="margin:0;background:#111"><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
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
      { width: 1440, height: 900, mode: "baseline" },
      { width: 390, height: 844, mode: "baseline" },
      { width: 1440, height: 900, mode: "hook" },
      { width: 1440, height: 900, mode: "motion" },
    ]) {
      await page.setViewport({
        width: scenario.width,
        height: scenario.height,
        deviceScaleFactor: 1,
      });
      await page.goto({
        url: `http://127.0.0.1:${port}/?mode=${scenario.mode}`,
        timeout: 15000,
      });
      const result = await page.evaluate(() => cameraMeasure());
      expect(result, JSON.stringify({ scenario, result })).toMatchObject({
        mismatches: 0,
        rewinds: 0,
        sameVideo: true,
      });
      expect(result.decoded).toBeGreaterThan(100);
      expect(result.switches).toBeGreaterThan(10);
      expect(result.progress).toBeGreaterThan(4.5);
      evidence.push({ scenario, result });
      if (scenario.mode === "baseline" && scenario.width === 1440) {
        expect(await page.evaluate(() => cameraLifecycle())).toEqual({
          seek: true,
          edit: true,
          replay: true,
          cleanup: true,
          fallbackMoves: true,
          pausedEditAfterPlayback: true,
          replacement: true,
        });
      }
    }
    await page.goto({
      url: `http://127.0.0.1:${port}/?mode=fallback`,
      timeout: 15000,
    });
    const lifecycle = await page.evaluate(() => cameraLifecycle());
    expect(lifecycle).toEqual({
      seek: true,
      edit: true,
      replay: true,
      cleanup: true,
      fallbackMoves: true,
      pausedEditAfterPlayback: true,
      replacement: true,
    });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl212-camera-switch.json"),
      JSON.stringify(
        { synthetic: true, providerCalls: 0, evidence, lifecycle },
        null,
        2,
      ),
    );
  } finally {
    try {
      await stop();
    } finally {
      try {
        await browser?.close({ silent: true });
      } finally {
        try {
          await new Promise<void>((done) => {
            server.close(() => done());
            server.closeAllConnections();
          });
        } finally {
          await cleanup(directory);
        }
      }
    }
  }
}, 120000);
