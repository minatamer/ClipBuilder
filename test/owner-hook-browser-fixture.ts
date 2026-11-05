import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { mkdtemp, readFile, realpath, writeFile, rm } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { independentHookFixture } from "./owner-hook-fixture.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

/** Generated, loopback-only editor surface for browser regression checks. */
export async function startHookEditorFixture(baselineEditor?: string) {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-hook-editor-"));
  const clip = independentHookFixture(),
    workspace = {
      id: randomUUID(),
      mode: "synthetic-ai",
      revision: 0,
      source: {
        fingerprint: "a".repeat(64),
        bytes: 1000,
        durationMs: 4000,
        width: 640,
        height: 360,
        fps: 30,
      },
    };
  clip.outputs = [
    {
      id: "e".repeat(64),
      revision: 0,
      editRevision: 0,
      frames: 120,
      bytes: 1000,
    },
  ];
  // Late items must remain discoverable before their timestamps, in every picker.
  clip.edit!.visuals.push({
    ...clip.edit!.visuals[0]!,
    id: randomUUID(),
    startFrame: 90,
    endFrame: 120,
  });
  clip.edit!.texts!.push({
    ...clip.edit!.texts![0]!,
    id: randomUUID(),
    text: "Later text",
    startFrame: 90,
    endFrame: 120,
  });
  clip.edit!.audio!.cues.push({
    ...clip.edit!.audio!.cues[0]!,
    id: randomUUID(),
    placement: "clip",
    startFrame: 90,
    endFrame: 120,
  });
  clip.edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  let ui = "",
    bytes = Buffer.alloc(0),
    edits = 0,
    unexpected = 0;
  const picture = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "yellow" },
  })
    .png()
    .toBuffer();
  clip.assets[0] = {
    ...clip.assets[0]!,
    bytes: picture.length,
    digest: createHash("sha256").update(picture).digest("hex"),
  };
  clip.base!.overlay.visuals[0]!.digest = clip.assets[0]!.digest;
  const list = () => ({ clips: [clip], active: false, workers: 1 });
  const server = createServer((req, res) => {
    void (async () => {
      res.setHeader("Content-Type", "application/json");
      if (req.url === "/__fixture/state") {
        res.end(JSON.stringify({ clip, edits, unexpected }));
        return;
      }
      if (req.method === "POST" && req.url?.endsWith("/edit")) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const edit = applyOwnerEdit(
          clip,
          JSON.parse(Buffer.concat(chunks).toString()),
          { width: 640, height: 360 },
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
      if (req.url?.endsWith("/clips")) {
        res.end(JSON.stringify(list()));
        return;
      }
      if (req.url?.endsWith("/analysis")) {
        res.end("null");
        return;
      }
      if (req.url?.includes("/assets/")) {
        res.writeHead(200, { "Content-Type": "image/png" }).end(picture);
        return;
      }
      if (req.url?.endsWith("/source")) {
        const match = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/),
          start = Number(match?.[1] ?? 0),
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
        req.url === "/motion.html"
          ? "motion.html"
          : req.url === "/motion.js"
            ? "motion.js"
            : req.url === "/loop.html"
              ? "loop.html"
              : req.url === "/loop-baseline.html"
                ? "loop-baseline.html"
                : req.url === "/loop.js"
                  ? "loop.js"
                  : req.url === "/loop-baseline.js"
                    ? "loop-baseline.js"
                    : req.url === "/"
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
    })().catch(() => res.writeHead(500).end());
  });
  try {
    const tools = await ownerNativeTools(resolve(".")),
      source = join(root, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=teal:s=640x360:r=30:d=4",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=4",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-threads",
        "2",
        source,
      ],
      AbortSignal.timeout(30000),
    );
    bytes = await readFile(source);
    ui = await prepareLocalControlsFixture(root);
    await writeFile(
      join(ui, "index.html"),
      '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
    );
    const loopSource = `import React, {useRef,useState} from "react";
      import {createRoot} from "react-dom/client";
      import {ClipEditor} from "./apps/frontend/src/features/local-editing/clip-editor.tsx";
      const clip=${JSON.stringify(clip)};
      function Host(){const count=useRef(0);const [report,setReport]=useState({dirty:false});const [tick,setTick]=useState(0);
        return <><button onClick={()=>setTick(tick+1)}>Render host</button><output aria-label="Activity reports">{count.current}</output><ClipEditor clip={clip} workspaceId="${workspace.id}" source={{width:640,height:360}} onAccepted={()=>{}} onDirty={(_,dirty)=>{if(++count.current>60)throw Error("editor_activity_loop");setReport({dirty});}} /></>;}
      createRoot(document.getElementById("root")).render(<Host/>);`;
    try {
      for (const baseline of baselineEditor ? [false, true] : [false]) {
        const name = baseline ? "loop-baseline" : "loop";
        await build({
          stdin: {
            contents: loopSource,
            resolveDir: resolve("."),
            loader: "tsx",
          },
          nodePaths: [resolve("apps/frontend/node_modules")],
          bundle: true,
          platform: "browser",
          format: "esm",
          jsx: "automatic",
          outfile: join(ui, `${name}.js`),
          plugins: baseline
            ? [
                {
                  name: "frozen-editor",
                  setup(builder) {
                    builder.onLoad(
                      { filter: /local-editing[\\/]clip-editor\.tsx$/ },
                      () => ({
                        contents: baselineEditor!,
                        loader: "tsx",
                        resolveDir: resolve(
                          "apps/frontend/src/features/local-editing",
                        ),
                      }),
                    );
                  },
                },
              ]
            : [],
        });
        await writeFile(
          join(ui, `${name}.html`),
          `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/${name}.js"></script></body></html>`,
        );
      }
    } finally {
      await stop();
    }
    if (baselineEditor) {
      const fakeTrack = `export async function trackHeadVideo({seed,frames,signal,progress}) {
        for(let step=1;step<=8;step++) {
          signal.throwIfAborted();
          await new Promise((resolve,reject)=>{
            const aborted=()=>{clearTimeout(timer);signal.removeEventListener('abort',aborted);reject(signal.reason);};
            const timer=setTimeout(()=>{signal.removeEventListener('abort',aborted);resolve();},500);
            signal.addEventListener('abort',aborted,{once:true});
          });
          progress(Math.round(frames*step/8),frames);
        }
        return {outcome:'complete',points:Array.from({length:frames},(_,frame)=>({frame,x:seed.x+seed.width/2,y:seed.y+seed.height/2}))};
      }`;
      try {
        await build({
          stdin: {
            contents: `import React from "react";import {createRoot} from "react-dom/client";import {LocalEditingExperience} from "./apps/frontend/src/features/local-editing/experience.tsx";import "./apps/frontend/src/styles/tokens.css";createRoot(document.getElementById("root")).render(<LocalEditingExperience/>);`,
            resolveDir: resolve("."),
            loader: "tsx",
          },
          nodePaths: [resolve("apps/frontend/node_modules")],
          bundle: true,
          platform: "browser",
          format: "esm",
          jsx: "automatic",
          outfile: join(ui, "motion.js"),
          plugins: [
            {
              name: "synthetic-track-timing",
              setup(builder) {
                builder.onLoad(
                  { filter: /local-editing[\\/]track-head-video\.ts$/ },
                  () => ({ contents: fakeTrack, loader: "js" }),
                );
              },
            },
          ],
        });
        await writeFile(
          join(ui, "motion.html"),
          `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/motion.js"></script></body></html>`,
        );
      } finally {
        await stop();
      }
    }
    const port = await listenOwner(server);

    return {
      url: `http://localhost:${port}/`,
      clip,
      counts: () => ({ edits, unexpected }),
      close: async () => {
        server.closeAllConnections();
        if (server.listening)
          await new Promise<void>((done, reject) =>
            server.close((e) => (e ? reject(e) : done())),
          );
        await clearHookScratch(root);
      },
    };
  } catch (error) {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done) => server.close(() => done()));
    await clearHookScratch(root);
    throw error;
  }
}

async function clearHookScratch(root: string) {
  const owned = relative(await realpath(tmpdir()), await realpath(root));
  if (
    !owned ||
    owned.startsWith("..") ||
    isAbsolute(owned) ||
    !owned.startsWith("clipbuilder-hook-editor-")
  )
    throw Error("invalid_hook_proof_cleanup");
  await rm(root, { recursive: true, force: true });
}
