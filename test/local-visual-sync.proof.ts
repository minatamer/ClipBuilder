import { expect, it } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { build, stop } from "esbuild";
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
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import type { OwnerOverlay } from "../packages/contracts/local/clips.ts";
import { ownerVisualOccurrences } from "../packages/contracts/local/visual-clock.ts";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner } from "./owner-http.ts";

declare global {
  var paintedFrame: number;
  var audioStartedWithImage: boolean | undefined;
  function playButtonPosition(): { x: number; y: number };
  function failedWithoutAudio(): boolean;
}

async function cleanVisualSync(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel.startsWith("clipbuilder-visual-sync-proof-") ||
    rel.startsWith("..") ||
    isAbsolute(rel)
  )
    throw Error("invalid_visual_sync_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("decodes native MP4 image/audio onsets on the same frames at 24/25/29.97/30/60fps, including a Hook starting inside an image", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-visual-sync-proof-"));
  const storage = join(root, "workspaces");
  await mkdir(storage);
  const files = new WorkspaceFiles(storage),
    tools = await ownerNativeTools(resolve("."));
  const signal = AbortSignal.timeout(180000);
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-y", "-v", "error", ...args],
      signal,
    );
  try {
    const bundle = await prepareLocalOverlayFixture(root);
    const picture = await sharp({
      create: { width: 128, height: 128, channels: 3, background: "#00ff00" },
    })
      .png()
      .toBuffer();
    for (const rate of ["24", "25", "30000/1001", "30", "60"]) {
      const workspaceId = await files.create(),
        source = await files.file(workspaceId, "source.mp4");
      await run([
        "-f",
        "lavfi",
        "-i",
        `color=black:s=240x320:r=${rate}:d=3.1`,
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        "3.1",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        source,
      ]);
      const metadata = await inspectOwnerSource(source, tools, signal);
      const assetId = randomUUID(),
        audioId = randomUUID(),
        clipId = randomUUID();
      await writeFile(await files.asset(workspaceId, assetId, "png"), picture);
      const wav = await files.audio(workspaceId, audioId);
      await run([
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=1760:sample_rate=48000:duration=0.3",
        "-ac",
        "2",
        "-c:a",
        "pcm_s16le",
        wav,
      ]);
      const audioBytes = await readFile(wav);
      const visuals = [
        { startFrame: 4, endFrame: 12, entrance: "none" as const },
        { startFrame: 17, endFrame: 54, entrance: "fade" as const },
      ].map((timing) => ({
        ...timing,
        id: randomUUID(),
        assetId,
        digest: createHash("sha256").update(picture).digest("hex"),
        origin: "synthetic" as const,
        format: "png" as const,
        fit: "contain" as const,
        exit: "none" as const,
        animationFrames: 9,
        box: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
      }));
      const overlay: OwnerOverlay = {
        version: 1,
        frames: 90,
        hook: { startFrame: 23, endFrame: 34 },
        captions: [],
        visuals,
        audio: {
          originalVolume: 0,
          assets: [
            {
              id: audioId,
              frames: 9,
              durationMs: 300,
              bytes: audioBytes.length,
              digest: createHash("sha256").update(audioBytes).digest("hex"),
            },
          ],
          cues: visuals.map((visual) => ({
            id: randomUUID(),
            visualId: visual.id,
            source: { kind: "upload", id: audioId },
            placement: "clip",
            startFrame: visual.startFrame,
            endFrame: visual.startFrame + 9,
            offsetFrame: 0,
            volume: 100,
            loop: false,
          })),
        },
      };
      await renderOwnerClip(
        {
          root: storage,
          tools,
          bundle,
          chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
          cache: new Map(),
        },
        {
          operation: "clip",
          workspaceId,
          clipId,
          jobId: randomUUID(),
          renderRevision: 0,
          cut: { startFrame: 0, endFrame: 90 },
          fingerprint: metadata.fingerprint,
          overlay,
        },
        signal,
      );
      const output = await files.output(workspaceId, clipId, 0),
        pcmFile = join(root, "audio.pcm"),
        pixelsFile = join(root, "image.rgb");
      await run([
        "-i",
        output,
        "-vn",
        "-ar",
        "48000",
        "-ac",
        "1",
        "-f",
        "s16le",
        pcmFile,
      ]);
      // One admitted pixel well inside the visual, outside its rounded corners.
      await run([
        "-i",
        output,
        "-vf",
        "crop=2:2:60:100,scale=1:1",
        "-an",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        pixelsFile,
      ]);
      const pcm = await readFile(pcmFile),
        pixels = await readFile(pixelsFile),
        fps = metadata.fps;
      const hookFrames = Math.max(1, Math.round((11 * fps) / 30)),
        bodyFrames = Math.round((90 * fps) / 30);
      expect(pixels.length / 3).toBe(hookFrames + bodyFrames);
      const expected = visuals
        .flatMap((visual) =>
          ownerVisualOccurrences(visual, 90, overlay.hook, {
            fps,
            hookSeconds: hookFrames / fps,
            bodySeconds: bodyFrames / fps,
            hookSourceSeconds: Math.floor((23 * fps) / 30 + 1e-9) / fps,
          }),
        )
        .map((part) => Math.round(part.start * fps))
        .sort((a, b) => a - b);
      const imageStarts: number[] = [],
        audioStarts: number[] = [];
      let imageBefore = false,
        audioBefore = false;
      for (let frame = 0; frame < pixels.length / 3; frame++) {
        const visible = pixels[frame * 3 + 1]! > 10;
        const from = Math.round((frame / fps) * 48000),
          to = Math.min(
            pcm.length / 2,
            Math.round(((frame + 1) / fps) * 48000),
          );
        let energy = 0;
        for (let sample = from; sample < to; sample++)
          energy += (pcm.readInt16LE(sample * 2) / 32768) ** 2;
        const audible = Math.sqrt(energy / Math.max(1, to - from)) > 0.015;
        if (visible && !imageBefore) imageStarts.push(frame);
        if (audible && !audioBefore) audioStarts.push(frame);
        imageBefore = visible;
        audioBefore = audible;
      }
      expect(imageStarts, `painted image starts at ${rate}`).toEqual(expected);
      expect(audioStarts, `decoded audio starts at ${rate}`).toEqual(
        imageStarts,
      );
    }
  } finally {
    await files.close();
    await cleanVisualSync(root);
  }
}, 190000);

it("buffers preview audio/frame progression until the actual image loads and stops on image failure", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-visual-sync-proof-"));
  let release: (() => void) | undefined,
    requests = 0;
  const gate = new Promise<void>((done) => {
    release = done;
  });
  const picture = await sharp({
    create: { width: 32, height: 32, channels: 3, background: "#00ff00" },
  })
    .png()
    .toBuffer();
  const visualId = randomUUID(),
    assetId = randomUUID();
  const overlay: OwnerOverlay = {
    version: 1,
    frames: 60,
    captions: [],
    visuals: [
      {
        id: visualId,
        assetId,
        digest: "a".repeat(64),
        origin: "synthetic",
        startFrame: 0,
        endFrame: 40,
        entrance: "none",
        exit: "none",
        fit: "contain",
        box: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
      },
    ],
    audio: {
      originalVolume: 0,
      assets: [],
      cues: [
        {
          id: randomUUID(),
          visualId,
          source: { kind: "builtin", id: "pop" },
          placement: "clip",
          startFrame: 0,
          endFrame: 9,
          offsetFrame: 0,
          volume: 35,
          loop: false,
        },
      ],
    },
  };
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  const server = createServer((req, res) => {
    if (req.url === "/app.js")
      void readFile(join(root, "app.js")).then((body) =>
        res.writeHead(200, { "Content-Type": "text/javascript" }).end(body),
      );
    else if (req.url === "/image.png") {
      requests++;
      void gate.then(() => {
        if (!res.destroyed)
          res
            .writeHead(200, {
              "Content-Type": "image/png",
              "Cache-Control": "no-store",
            })
            .end(picture);
      });
    } else if (req.url === "/missing.png") {
      requests++;
      res.writeHead(404).end();
    } else
      res
        .writeHead(200, { "Content-Type": "text/html" })
        .end(
          '<html><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
        );
  });
  try {
    await build({
      stdin: {
        contents: `import React,{useRef,useState} from 'react';import{createRoot}from'react-dom/client';import{Player}from'@remotion/player';import{useCurrentFrame}from'remotion';import{OwnerAutomaticOverlay}from'./packages/composition/local/automatic-overlay.tsx';import{OwnerAudioPreview}from'./apps/frontend/src/features/local-editing/audio-preview.tsx';import{bufferedOverlayImage}from'./apps/frontend/src/features/local-editing/clip-editor.tsx';
      const overlay=${JSON.stringify(overlay)};
      function Clip({fail}){const frame=useCurrentFrame();globalThis.paintedFrame=frame;return <><OwnerAudioPreview overlay={overlay} workspaceId="synthetic" onError={fail}/><OwnerAutomaticOverlay overlay={overlay} assets={{['${assetId}']:location.search?'/missing.png':'/image.png'}} frame={frame} renderImage={bufferedOverlayImage} onImageError={fail}/></>}
      function App(){const ref=useRef(null),[error,setError]=useState(false);return <><button id="play" onClick={()=>ref.current?.play()}>Play</button>{error?<p id="failed">Reload preview</p>:<Player ref={ref} component={Clip} inputProps={{fail:()=>setError(true)}} fps={30} durationInFrames={60} compositionWidth={1080} compositionHeight={1920} style={{width:180,height:320}}/>}</>}
      document.addEventListener('playing',event=>{if(event.target instanceof HTMLAudioElement){globalThis.audioStartedWithImage=!!document.querySelector('img')?.complete;}},true);
      globalThis.playButtonPosition=()=>{const box=document.querySelector('#play').getBoundingClientRect();return{x:box.x+box.width/2,y:box.y+box.height/2};};
      globalThis.failedWithoutAudio=()=>!!document.querySelector('#failed')&&!document.querySelector('audio');
      createRoot(document.getElementById('root')).render(<App/>);`,
        resolveDir: resolve("."),
        loader: "tsx",
      },
      nodePaths: [resolve("apps/frontend/node_modules")],
      bundle: true,
      platform: "browser",
      format: "esm",
      jsx: "automatic",
      outfile: join(root, "app.js"),
    });
    await stop();
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
    await page.goto({ url: `http://127.0.0.1:${port}/`, timeout: 10000 });
    for (let i = 0; i < 200 && requests === 0; i++)
      await new Promise((done) => setTimeout(done, 10));
    expect(requests).toBe(1);
    const position = await page.evaluate(() => globalThis.playButtonPosition());
    for (const type of ["mousePressed", "mouseReleased"] as const)
      await page._client().send("Input.dispatchMouseEvent", {
        type,
        ...position,
        button: "left",
        clickCount: 1,
      });
    await new Promise((done) => setTimeout(done, 400));
    expect(
      await page.evaluate(() => ({
        frame: globalThis.paintedFrame,
        started: globalThis.audioStartedWithImage ?? false,
      })),
    ).toEqual({ frame: 0, started: false });
    release!();
    let loaded = false;
    for (let i = 0; i < 200; i++) {
      loaded = await page.evaluate(
        () =>
          globalThis.paintedFrame > 0 &&
          globalThis.audioStartedWithImage === true,
      );
      if (loaded) break;
      await new Promise((done) => setTimeout(done, 10));
    }
    expect(loaded).toBe(true);
    expect(requests).toBe(1);
    await page.goto({ url: `http://127.0.0.1:${port}/?fail`, timeout: 10000 });
    let failed = false;
    for (let i = 0; i < 200; i++) {
      failed = await page.evaluate(() => globalThis.failedWithoutAudio());
      if (failed) break;
      await new Promise((done) => setTimeout(done, 10));
    }
    expect(failed).toBe(true);
    expect(requests).toBe(2);
  } finally {
    release?.();
    await stop();
    await browser?.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    await cleanVisualSync(root);
  }
}, 30000);
