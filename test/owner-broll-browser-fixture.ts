import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { syntheticTextClip } from "./owner-text-fixture.ts";
import { automaticOwnerEdit } from "../packages/contracts/local/edit-overlay.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import { copyOwnerHookContent } from "../packages/contracts/local/hook-content.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { listenOwner } from "./owner-http.ts";

/** Generated media and actual editor/Apply compiler; isolated from owner sessions. */
export async function startBrollBrowserFixture(
  options: {
    delayedMedia?: boolean;
    hook?: boolean;
    tracking?: boolean;
    thumbnails?: boolean;
  } = {},
) {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-broll-browser-"));
  const tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(60_000);
  const files = new Map<string, { bytes: Buffer; type: string }>();
  let clip = syntheticTextClip(),
    applies = 0;
  let holdingThumbnails = false;
  const thumbnailReads = new Set<() => void>();
  const releaseThumbnails = () => {
    holdingThumbnails = false;
    for (const release of [...thumbnailReads]) release();
  };
  const workspaceId = randomUUID();
  const server = createServer((req, res) => {
    void (async () => {
      if (
        holdingThumbnails &&
        req.headers["sec-fetch-dest"] === "empty" &&
        /\/(?:video-assets|assets)\//.test(req.url ?? "")
      ) {
        await new Promise<void>((done) => {
          const release = () => {
            res.off("close", release);
            thumbnailReads.delete(release);
            done();
          };
          thumbnailReads.add(release);
          res.once("close", release);
        });
        if (res.destroyed) return;
      }
      if (req.method === "POST" && req.url?.endsWith("/edit")) {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 1000000) throw Error("fixture_request_large");
          chunks.push(Buffer.from(chunk));
        }
        const edit = applyOwnerEdit(
          clip,
          JSON.parse(Buffer.concat(chunks).toString()),
          { width: 320, height: 180 },
        );
        clip = {
          ...clip,
          edit,
          revision: edit.revision,
          state: "validated-revision",
        };
        applies++;
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify({ clips: [clip], active: false, workers: 1 }));
        return;
      }
      if (req.method === "GET" && req.url?.endsWith("/clips")) {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify({ clips: [clip], active: false, workers: 1 }));
        return;
      }
      const file = files.get(req.url ?? "");
      if (!file) {
        res.writeHead(404).end();
        return;
      }
      const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? "");
      const start = range ? Number(range[1]) : 0,
        end = range?.[2]
          ? Math.min(Number(range[2]), file.bytes.length - 1)
          : file.bytes.length - 1;
      if (start > end || start < 0) {
        res.writeHead(416).end();
        return;
      }
      res
        .writeHead(range ? 206 : 200, {
          "Content-Type": file.type,
          "Content-Length": end - start + 1,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-store",
          ...(range
            ? { "Content-Range": `bytes ${start}-${end}/${file.bytes.length}` }
            : {}),
        })
        .end(file.bytes.subarray(start, end + 1));
    })().catch(() => res.writeHead(400).end());
  });
  try {
    for (const [index, color] of ["gray", "testsrc2", "green"].entries()) {
      const file = join(root, `synthetic-${index}.mp4`);
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-y",
          "-v",
          "error",
          "-f",
          "lavfi",
          "-i",
          options.thumbnails && color === "testsrc2"
            ? "nullsrc=s=320x180:r=30:d=3,geq=lum='16+mod(N*17,200)':cb=128:cr=128"
            : color === "testsrc2"
              ? options.tracking
                ? "color=c=black:s=320x180:r=30:d=3[bg];nullsrc=s=64x64:r=30:d=3,geq=r='mod(X*13+Y*7,255)':g='mod(X*5+Y*17,255)':b='mod(X*19+Y*3,255)'[head];[bg][head]overlay=x='40+15*t':y=50:shortest=1"
                : "testsrc2=s=320x180:r=30:d=3"
              : `color=c=${color}:s=320x180:r=30:d=3`,
          ...(index === 0
            ? [
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=440:sample_rate=48000:duration=3",
              ]
            : []),
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          ...(index === 0 ? ["-c:a", "aac"] : []),
          "-threads",
          "2",
          file,
        ],
        signal,
      );
      const bytes = await readFile(file);
      if (index === 0)
        files.set(
          `/api/local/workspace/${workspaceId}/clips/${clip.id}/source`,
          { bytes, type: "video/mp4" },
        );
      else {
        const audioId = randomUUID(),
          audioFile = join(root, `synthetic-${index}.wav`);
        await runOwnedProcess(
          tools.ffmpeg,
          [
            "-nostdin",
            "-y",
            "-v",
            "error",
            "-f",
            "lavfi",
            "-i",
            `sine=frequency=${index === 1 ? 880 : 1320}:sample_rate=48000:duration=3`,
            "-c:a",
            "pcm_s16le",
            "-ar",
            "48000",
            "-ac",
            "2",
            audioFile,
          ],
          signal,
        );
        const audio = await readFile(audioFile);
        (clip.audioAssets ??= []).push({
          id: audioId,
          digest: createHash("sha256").update(audio).digest("hex"),
          bytes: audio.length,
          frames: 90,
          durationMs: 3000,
        });
        files.set(
          `/api/local/workspace/${workspaceId}/audio-assets/${audioId}`,
          { bytes: audio, type: "audio/wav" },
        );
        const asset = {
          id: randomUUID(),
          digest: createHash("sha256").update(bytes).digest("hex"),
          bytes: bytes.length,
          width: 320,
          height: 180,
          frames: 90,
          hasAudio: true,
          audioAssetId: audioId,
        };
        (clip.videoAssets ??= []).push(asset);
        files.set(
          `/api/local/workspace/${workspaceId}/video-assets/${asset.id}`,
          { bytes, type: "video/mp4" },
        );
      }
    }
    const picture = await sharp(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect x="15" y="15" width="290" height="150" rx="12" fill="#8a4fff"/><circle cx="100" cy="90" r="50" fill="#ffc64d"/><path d="M180 130V65h25v65zm40 0V40h25v90z" fill="#ffffff"/></svg>',
      ),
    )
      .png()
      .toBuffer();
    const asset = {
      id: randomUUID(),
      digest: createHash("sha256").update(picture).digest("hex"),
      bytes: picture.length,
      width: 320,
      height: 180,
      origin: "owner-supplied" as const,
      format: "png" as const,
    };
    clip.assets = [asset];
    files.set(`/api/local/workspace/${workspaceId}/assets/${asset.id}`, {
      bytes: picture,
      type: "image/png",
    });
    clip.base!.overlay.focus = defaultOwnerFocus(
      { width: 320, height: 180 },
      90,
    );
    clip.edit = automaticOwnerEdit(clip.base!, clip.id, clip.baseHash!);
    clip.edit.visuals = [
      {
        id: randomUUID(),
        assetId: clip.videoAssets![0]!.id,
        startFrame: 0,
        endFrame: 90,
        box: { x: 0.1, y: 0.1, width: 0.8, height: 0.4 },
        fit: "cover",
        presentation: "full-frame",
        video: { offsetFrame: 0, volume: 100, muted: true },
        entrance: "none",
        exit: "none",
      },
      {
        id: randomUUID(),
        assetId: clip.videoAssets![1]!.id,
        startFrame: 0,
        endFrame: 90,
        box: { x: 0.1, y: 0.15, width: 0.5, height: 0.25 },
        fit: "cover",
        video: { offsetFrame: 0, volume: 100, muted: true },
        entrance: "none",
        exit: "none",
      },
      {
        id: randomUUID(),
        assetId: asset.id,
        startFrame: 0,
        endFrame: 90,
        box: { x: 0.5, y: 0.65, width: 0.4, height: 0.18 },
        fit: "contain",
        entrance: "none",
        exit: "none",
      },
    ];
    if (options.thumbnails) {
      const repeated = clip.edit.visuals[1]!;
      repeated.assetId = clip.videoAssets![0]!.id;
      repeated.endFrame = 60;
      repeated.video!.offsetFrame = 30;
      clip.edit.visuals.push({
        ...clip.edit.visuals[0]!,
        id: randomUUID(),
        startFrame: 60,
        video: { offsetFrame: 0, volume: 100, muted: true },
      });
    }
    if (options.delayedMedia) {
      const background = clip.edit.visuals[0]!;
      background.startFrame = 30;
      background.effect = {
        startFrame: 30,
        endFrame: 90,
        zoom: 1.4,
        fromX: 0.2,
        fromY: 0.5,
        toX: 0.8,
        toY: 0.5,
      };
      background.exit = "fade";
      background.animationFrames = 9;
      for (const cue of clip.edit.visuals.slice(1)) {
        cue.startFrame = 30;
        cue.effect = {
          startFrame: 45,
          endFrame: 75,
          zoom: 1.5,
          fromX: 0.2,
          fromY: 0.5,
          toX: 0.8,
          toY: 0.5,
        };
        if (cue.video) cue.video.offsetFrame = 15;
      }
    }
    if (options.hook) {
      clip.base!.words = clip.base!.overlay.captions.flatMap((caption) =>
        caption.wordCues.map((word) => ({
          id: word.wordId,
          text: word.text,
          punctuatedText: word.text,
          startMs: word.startMs,
          endMs: word.endMs,
          speakerId: null,
          confidence: 1,
        })),
      );
      clip.edit.hook = { startFrame: 15, endFrame: 90 };
      clip.edit.hookContent = copyOwnerHookContent(
        clip.base!,
        clip.edit,
        clip.assets,
        clip.audioAssets ?? [],
        clip.edit.hook,
        undefined,
        clip.videoAssets,
      );
    }
    const source = `import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
      import {ClipEditor} from './apps/frontend/src/features/local-editing/clip-editor.tsx';
      import {OwnerClipBatchPanel} from './apps/frontend/src/features/local-editing/clip-batch-panel.tsx';
      import {Workspace} from './apps/frontend/src/shared/ui/workspace.tsx';import {WorkflowFrame} from './apps/frontend/src/shared/ui/workflow-frame.tsx';
      import {rememberEditorTour,editorTourStorage} from './apps/frontend/src/features/local-editing/editor-tour-preference.ts';
      import './apps/frontend/src/styles/tokens.css';import './apps/frontend/src/features/local-editing/style.css';
      rememberEditorTour(editorTourStorage());
      const initialClip=(await fetch('/api/local/workspace/${workspaceId}/clips').then(response=>response.json())).clips[0]; function App(){const[clip,setClip]=useState(initialClip),[footer,setFooter]=useState(null);return <Workspace localMode><WorkflowFrame title='CL-271 generated media check' step={2} footer={<div className='local-footer-actions'><div className='workflow-footer-slot' ref={setFooter}/></div>}><div className='local-editing local-editor'>{window.location.pathname==='/processing'?<OwnerClipBatchPanel workspace={{id:'${workspaceId}',revision:0,mode:'synthetic-ai',source:{fingerprint:'${"b".repeat(64)}',bytes:1000,durationMs:3000,width:320,height:180,fps:30}}} capabilities={{aiMode:'synthetic-ai',sourceMode:'synthetic-source',localMedia:true,cloud:false,planningAvailable:true}} selected={[{analysisId:clip.analysisId,momentId:clip.momentId,policyRevision:1}]} onActive={()=>{}} footerTarget={footer}/>:<ClipEditor clip={clip} workspaceId='${workspaceId}' source={{width:320,height:180}} onDirty={()=>{}} footerTarget={footer} onAccepted={list=>setClip(list.clips[0])}/>}</div></WorkflowFrame></Workspace>;}createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);`;
    await build({
      stdin: { contents: source, resolveDir: resolve("."), loader: "tsx" },
      nodePaths: [resolve("apps/frontend/node_modules")],
      bundle: true,
      platform: "browser",
      format: "esm",
      jsx: "automatic",
      outfile: join(root, "app.js"),
    });
    for (const name of ["app.js", "app.css"])
      files.set(`/${name}`, {
        bytes: await readFile(join(root, name)),
        type: name.endsWith("js") ? "text/javascript" : "text/css",
      });
    files.set("/", {
      bytes: Buffer.from(
        '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
      ),
      type: "text/html",
    });
    files.set("/processing", files.get("/")!);
    const port = await listenOwner(server);
    return {
      url: `http://localhost:${port}/`,
      root,
      applies: () => applies,
      holdThumbnails: () => {
        holdingThumbnails = true;
      },
      releaseThumbnails,
      pendingThumbnails: () => thumbnailReads.size,
      close: async () => {
        releaseThumbnails();
        server.closeAllConnections();
        await new Promise<void>((done) => server.close(() => done()));
        if (dirname(await realpath(root)) !== (await realpath(tmpdir())))
          throw Error("fixture_cleanup_invalid");
        await rm(root, { recursive: true, force: true });
      },
    };
  } catch (error) {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done) => server.close(() => done()));
    await rm(root, { recursive: true, force: true });
    throw error;
  } finally {
    await stop();
  }
}
