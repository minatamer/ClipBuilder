import { transform } from "esbuild";
import { expect, it } from "vitest";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { ownerCameraFollowKey } from "../packages/contracts/local/camera-follow.ts";
import { ownerClipSchema } from "../packages/contracts/local/clips.ts";
import { randomUUID, createHash } from "node:crypto";
import { ownerSoundAudio } from "../packages/composition/local/audio-sources.ts";
import { OWNER_SOUNDS } from "../packages/contracts/local/audio.ts";

declare global {
  function editorPlaybackMeasure(tab: string): Promise<{
    decoded: number;
    gapMs: number;
    sourceSeeks: number;
    inspectorSeeks: number;
    pauses: number;
    sameVideo: boolean;
    warnings: number;
    dropped: number;
    advanced: number;
  }>;
}

it("keeps full editor playback continuous while Zoom/Motion inspectors and live edits are active", async () => {
  const sample = ownerSoundAudio("pulse"),
    audioId = randomUUID();
  const audio = {
    id: audioId,
    digest: createHash("sha256")
      .update(new Uint8Array(sample.bytes))
      .digest("hex"),
    bytes: sample.bytes.byteLength,
    frames: Math.round(
      OWNER_SOUNDS.find((s) => s.id === "pulse")!.seconds * 30,
    ),
    durationMs: Math.round(
      OWNER_SOUNDS.find((s) => s.id === "pulse")!.seconds * 1000,
    ),
  };
  const fixture = await startHookEditorFixture(undefined, {
    durationFrames: 300,
    sourceSize: { width: 1920, height: 1080 },
    pictureSize: { width: 1920, height: 1920 },
    previewAudio: {
      id: audioId,
      bytes: new Uint8Array(sample.bytes),
      contentType: sample.mimeType,
    },
    configure(clip) {
      const base = clip.base!;
      clip.audioAssets = [audio];
      base.overlay.audio!.assets = [audio];
      clip.edit!.audio!.cues.push(
        ...[30, 90].map((startFrame) => ({
          id: randomUUID(),
          source: { kind: "upload" as const, id: audioId },
          placement: "clip" as const,
          startFrame,
          endFrame: startFrame + 30,
          offsetFrame: 0,
          volume: 35,
          loop: false,
        })),
      );
      base.overlay.frames = 300;
      base.cut.endFrame = base.cut.startFrame + 300;
      const focus = base.overlay.focus!;
      focus.source = { width: 1920, height: 1080 };
      focus.frames = 300;
      focus.shots = Array.from({ length: 5 }, (_, i) => ({
        ...focus.shots[0]!,
        startFrame: i * 60,
        endFrame: (i + 1) * 60,
        centerX: i % 2 ? 0.7 : 0.3,
      }));
      clip.edit!.focus = structuredClone(focus);
      delete clip.edit!.hook;
      delete clip.edit!.hookContent;
      clip.edit!.cameraEffects = [
        {
          id: crypto.randomUUID(),
          occurrence: "body",
          startFrame: 0,
          zoomFrames: 59,
          holdFrames: 0,
          returnFrames: 0,
          target: { centerX: 0.3, centerY: 0.5, zoom: 1.5 },
        },
      ];
      clip.edit!.cameraTracks = [
        {
          id: crypto.randomUUID(),
          occurrence: "body",
          personId: null,
          startFrame: 120,
          endFrame: 180,
          sourceStartFrame: 120,
          focusKey: ownerCameraFollowKey(focus, null),
          seed: { x: 0.2, y: 0.3, width: 0.1, height: 0.1 },
          outcome: "complete",
          points: Array.from({ length: 31 }, (_, i) => Math.min(i * 2, 59)).map(
            (frame) => ({ frame, x: 0.25 + frame / 295, y: 0.35 }),
          ),
        },
      ];
    },
  });
  const validated = ownerClipSchema.safeParse(fixture.clip);
  if (!validated.success) {
    await fixture.close();
    throw validated.error;
  }
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions: { headless: true },
    logLevel: "error",
  });
  try {
    const evidence = [];
    for (const scenario of [
      { width: 1440, height: 900, tab: "Zoom" },
      { width: 820, height: 1180, tab: "Motion" },
      { width: 390, height: 844, tab: "Zoom" },
    ]) {
      const page = await browser.newPage({
        context: () => null,
        logLevel: "error",
        indent: false,
        pageIndex: 0,
        onBrowserLog: null,
        onLog: () => {},
      });
      await page.setViewport({
        width: scenario.width,
        height: scenario.height,
        deviceScaleFactor: 1,
      });
      await page.goto({ url: fixture.url, timeout: 15000 });
      const driver = await transform(
        `globalThis.editorPlaybackMeasure=async(tab:string)=>{
        const wait=async(fn:()=>unknown)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,20))}throw Error('editor_playback_not_ready_'+document.body.innerText.slice(0,600))};
        await wait(()=>document.querySelector('.editor-layout:not([data-loading]) .editor-panels'));
        document.querySelectorAll<HTMLButtonElement>('[aria-label="Clip settings"] [role="tab"]').forEach(b=>{if(b.textContent==='Camera')b.click()});
        await wait(()=>document.querySelector('[aria-label="Focus controls"]'));
        document.querySelectorAll<HTMLButtonElement>('[aria-label="Focus controls"] [role="tab"]').forEach(b=>{if(b.textContent===tab)b.click()});
        await new Promise(r=>setTimeout(r,1200));
        const source=document.querySelector<HTMLVideoElement>('.editor-preview video[data-editor-active="true"]')!,inspector=document.querySelector<HTMLVideoElement>('.numbered-focus-preview video')!;
        await wait(()=>source.readyState>=2&&!source.seeking&&inspector.readyState>=2&&!inspector.seeking);
        let decoded=0,gapMs=0,last=0,sourceSeeks=0,inspectorSeeks=0,pauses=0,warnings=0,handle=0,stopped=false;
        const error=console.error;console.error=(...args)=>{if(args.some(a=>typeof a==='string'&&/Maximum update depth|Too many re-renders/.test(a)))warnings++;error(...args)};
        const events: {type:string,at:number}[]=[];const onSource=()=>{sourceSeeks++;events.push({type:'seek',at:source.currentTime})},onInspector=()=>inspectorSeeks++,onPause=()=>{pauses++;events.push({type:'pause',at:source.currentTime})};
        source.addEventListener('seeking',onSource);inspector.addEventListener('seeking',onInspector);source.addEventListener('pause',onPause);
        const callback=(now:number)=>{decoded++;if(last)gapMs=Math.max(gapMs,now-last);last=now;if(!stopped)handle=source.requestVideoFrameCallback(callback)};handle=source.requestVideoFrameCallback(callback);
        const before=source.getVideoPlaybackQuality(),begin=source.currentTime;
        document.querySelector<HTMLButtonElement>('[aria-label="Play video"]')!.click();
        const edit=setTimeout(()=>{const input=document.querySelector<HTMLInputElement>('[aria-label="Zoom magnification"]');if(input){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'1.6');input.dispatchEvent(new Event('input',{bubbles:true}))}},900);
        try{await new Promise(r=>setTimeout(r,7300));return {events,callbacks:decoded,decoded:source.getVideoPlaybackQuality().totalVideoFrames-before.totalVideoFrames,gapMs,sourceSeeks,inspectorSeeks,pauses,sameVideo:document.querySelector('.editor-preview video[data-editor-active="true"]')===source,warnings,dropped:source.getVideoPlaybackQuality().droppedVideoFrames-before.droppedVideoFrames,advanced:source.currentTime-begin}}
        finally{clearTimeout(edit);stopped=true;source.cancelVideoFrameCallback(handle);source.removeEventListener('seeking',onSource);inspector.removeEventListener('seeking',onInspector);source.removeEventListener('pause',onPause);console.error=error;document.querySelector<HTMLButtonElement>('[aria-label="Pause video"]')?.click()}
      };`,
        { loader: "ts" },
      );
      await page.evaluate(driver.code);
      evidence.push({
        scenario,
        result: await page.evaluate(
          (tab) => editorPlaybackMeasure(tab),
          scenario.tab,
        ),
      });
      await page.close();
    }
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl256-editor-playback.json"),
      JSON.stringify({ synthetic: true, providerCalls: 0, evidence }, null, 2),
    );
    for (const { result } of evidence) {
      expect(result, JSON.stringify(result)).toMatchObject({
        sourceSeeks: 0,
        pauses: 0,
        sameVideo: true,
        warnings: 0,
      });
      expect(result.inspectorSeeks).toBeLessThan(5);
      expect(result.gapMs).toBeLessThan(150);
      expect(result.decoded).toBeGreaterThan(190);
      expect(result.advanced).toBeGreaterThan(7);
    }
    expect(fixture.counts()).toEqual({ edits: 0, unexpected: 0 });
    expect(fixture.audioReads()).toBe(3);
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    await browser.close({ silent: true });
    await fixture.close();
  }
}, 90000);
