import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { listenOwner } from "./owner-http.ts";

/** All source surfaces use current components and generated, protected-range bytes. */
export async function startThumbnailBrowserFixture() {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-shared-thumbnails-"));
  const tools = await ownerNativeTools(resolve("."));
  const files = new Map<string, { bytes: Buffer; type: string }>();
  let stalled = 0,
    rangeReads = 0,
    imageReads = 0;
  const server = createServer((req, res) => {
    const path = req.url ?? "";
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; media-src 'self' blob:; connect-src 'self' blob:",
    );
    if (path.includes("/slow/")) {
      stalled++;
      res.once("close", () => stalled--);
      return;
    }
    const file = files.get(path);
    if (!file) {
      res.writeHead(404).end();
      return;
    }
    if (path.includes("/thumbnail/")) imageReads++;
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? "");
    if (file.type === "video/mp4" && path.includes("/sources/") && !range) {
      res.writeHead(416).end();
      return;
    }
    const start = range ? Number(range[1]) : 0,
      end = Math.min(
        range?.[2] ? Number(range[2]) : file.bytes.length - 1,
        file.bytes.length - 1,
        range ? start + 512 * 1024 - 1 : Infinity,
      );
    if (start > end) {
      res.writeHead(416).end();
      return;
    }
    if (range) rangeReads++;
    res
      .writeHead(range ? 206 : 200, {
        "Content-Type": file.type,
        "Content-Length": end - start + 1,
        "Cache-Control": "no-store",
        "Accept-Ranges": "bytes",
        ...(range
          ? { "Content-Range": `bytes ${start}-${end}/${file.bytes.length}` }
          : {}),
      })
      .end(file.bytes.subarray(start, end + 1));
  });
  try {
    const video = join(root, "generated.mp4");
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
        "color=c=0x235b9d:s=160x90:r=30:d=60",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        video,
      ],
      AbortSignal.timeout(20000),
    );
    const bytes = await readFile(video);
    const portrait = join(root, "portrait.mp4");
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
        "color=c=0x235b9d:s=90x160:r=30:d=60",
        "-vf",
        "drawbox=x=0:y=0:w=iw:h=25:color=red:t=fill,drawbox=x=0:y=135:w=iw:h=25:color=green:t=fill",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        portrait,
      ],
      AbortSignal.timeout(20000),
    );
    files.set("/portrait.mp4", {
      bytes: await readFile(portrait),
      type: "video/mp4",
    });
    files.set("/source.mp4", { bytes, type: "video/mp4" });
    for (const id of ["first", "second"])
      files.set(`/api/local/sources/downloads/${id}/preview`, {
        bytes,
        type: "video/mp4",
      });
    // A fixed generated PNG is supplied through the same protected-image shape.
    const sharp = (
      await import("../apps/backend/node_modules/sharp/dist/index.mjs")
    ).default;
    const image = await sharp({
      create: { width: 320, height: 180, channels: 3, background: "#ffd24a" },
    })
      .png()
      .toBuffer();
    files.set("/api/local/sources/thumbnail/generated", {
      bytes: image,
      type: "image/png",
    });
    const source = `import React,{useEffect,useState} from 'react';import{createRoot}from'react-dom/client';
      import{YoutubePreview}from'./apps/frontend/src/features/local-editing/youtube-preview.tsx';
      import{ThumbnailVideo}from'./apps/frontend/src/shared/ui/video-thumbnail.tsx';
      import{CandidateReview}from'./apps/frontend/src/features/sample/candidate.review.tsx';
      import{analysis}from'./apps/frontend/src/features/session/session.test-fixtures.ts';
      import'./apps/frontend/src/styles/tokens.css';import'./apps/frontend/src/features/local-editing/style.css';
      function App(){const[blob,setBlob]=useState(''),[show,setShow]=useState(true),[variant,setVariant]=useState('first');
        useEffect(()=>{const c=new AbortController();let url;void fetch('/source.mp4',{signal:c.signal}).then(r=>r.blob()).then(bytes=>{c.signal.throwIfAborted();url=URL.createObjectURL(bytes);setBlob(url);}).catch(()=>{});return()=>{c.abort();if(url)URL.revokeObjectURL(url)}},[]);
        return <main className='local-editing'><h1>Generated shared-thumbnail check</h1>
          <button id='toggle' onClick={()=>{setShow(!show);setVariant('first')}}>Toggle surfaces</button>
          <button id='replace' onClick={()=>setVariant('second')}>Replace saved source</button>
          <button id='missing' onClick={()=>setVariant('missing')}>Missing saved source</button>
          <button id='slow' onClick={()=>setVariant('slow')}>Slow saved source</button>
          {show&&<div className='gallery'>
            <section aria-label='Saved source'><h2>Saved source</h2><YoutubePreview source={{kind:'saved',destination:'downloads',variantId:variant}} title='Generated saved video'/></section>
            <section aria-label='YouTube offer'><h2>YouTube offer</h2><YoutubePreview source={{kind:'youtube',sourceId:'generated'}} title='Generated YouTube offer'/></section>
            <section aria-label='Uploaded source'><h2>Uploaded source</h2><ThumbnailVideo aria-label='Uploaded video' thumbnailSource={blob||undefined} src={blob||undefined} controls preload='metadata' style={{width:240,height:135}}/></section>
            {blob&&<section aria-label='Moment cards'><h2>Moment cards</h2><CandidateReview analysis={analysis} selectedId={null} onSelect={()=>{}} onClose={()=>{}} busy={false} sourceUrl={blob}/></section>}
            <section aria-label='Portrait moments'><h2>Portrait moments</h2><CandidateReview analysis={{...analysis,media:{...analysis.media,width:90,height:160}}} selectedId={null} onSelect={()=>{}} onClose={()=>{}} busy={false} sourceUrl='/portrait.mp4'/></section>
          </div>}</main>;
      }createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);`;
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
      files.set("/" + name, {
        bytes: await readFile(join(root, name)),
        type: name.endsWith("js") ? "text/javascript" : "text/css",
      });
    files.set("/", {
      bytes: Buffer.from(
        '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>body{margin:0;padding:24px}.gallery{display:grid;gap:20px;max-width:1100px;margin:auto}.gallery section{min-width:0;position:relative}button{margin:8px}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
      ),
      type: "text/html",
    });
    const port = await listenOwner(server);
    return {
      url: `http://localhost:${port}/`,
      root,
      counts: () => ({ stalled, rangeReads, imageReads }),
      close: async () => {
        server.closeAllConnections();
        await new Promise<void>((done) => server.close(() => done()));
        if (dirname(await realpath(root)) !== (await realpath(tmpdir())))
          throw Error("thumbnail_cleanup_invalid");
        await rm(root, { recursive: true, force: true });
      },
    };
  } catch (error) {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done) => server.close(() => done()));
    if (dirname(await realpath(root)) !== (await realpath(tmpdir())))
      throw Error("thumbnail_cleanup_invalid");
    await rm(root, { recursive: true, force: true });
    throw error;
  } finally {
    await stop();
  }
}
