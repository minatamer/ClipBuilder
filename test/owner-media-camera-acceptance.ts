import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { randomUUID, createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  realpath,
  copyFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import {
  ownerWorkspaceSchema,
  ownerMediaResultSchema,
} from "../packages/contracts/local/index.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import { ownerClipListSchema } from "../packages/contracts/local/clips.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import { ownerEditOperations } from "../apps/frontend/src/features/local-editing/editor-state.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

/** Opt-in generated UI -> real edit/render/draft transport, with no provider ports. */
export async function startMediaCameraAcceptance(
  storageRoot: string,
  resume?: { draftId: string; review: string },
) {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-camera-acceptance-"),
  );
  const root = join(directory, "workspaces");
  await mkdir(root);
  const review =
    resume?.review ??
    join(
      storageRoot,
      "CL-271-review",
      `Pan-face-tracking-${randomUUID().slice(0, 8)}`,
    );
  await mkdir(review, { recursive: true });
  const tools = await ownerNativeTools(resolve("."));
  const signal = AbortSignal.timeout(25 * 60_000);
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-y", "-v", "error", ...args],
      signal,
    );
  const bundle = await prepareLocalOverlayFixture(directory);
  const worker = createOwnerWorker({
    root,
    token: "synthetic-camera-worker",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: bundle,
  });
  const workerPort = await listenOwner(worker.server);
  let nativeCalls = 0,
    planCalls = 0,
    imageCalls = 0;
  const options = {
    root,
    storageRoot,
    token: "synthetic-camera-host",
    port: 0,
    analysis: fakeOwnerAnalysis,
    clipPreparation: {
      mode: "synthetic-ai" as const,
      plan: async () => {
        planCalls++;
        return [];
      },
      image: async () => {
        imageCalls++;
        throw Error("unexpected_image_call");
      },
    },
    media: async (
      job: Parameters<Parameters<typeof createOwnerHost>[0]["media"]>[0],
    ) => {
      nativeCalls++;
      const result = await ownerRequest(workerPort, "/media", {
        method: "POST",
        headers: {
          Authorization: "Bearer synthetic-camera-worker",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
        signal,
      });
      if (result.status !== 200) throw Error("synthetic_native_failure");
      return ownerMediaResultSchema.parse(JSON.parse(result.body.toString()));
    },
  };
  let host = createOwnerHost(options),
    port = await listenOwner(host.server);
  const headers = {
    Authorization: "Bearer synthetic-camera-host",
    "Content-Type": "application/json",
  };
  const json = async (path: string, value?: unknown) => {
    const result = await ownerRequest(port, path, {
      headers,
      ...(value === undefined
        ? {}
        : { method: "POST", body: JSON.stringify(value) }),
      signal,
    });
    if (![200, 202].includes(result.status))
      throw Error(`synthetic_http_${result.status}`);
    return JSON.parse(result.body.toString());
  };
  const waitClip = async () => {
    for (let i = 0; i < 1200; i++) {
      const list = ownerClipListSchema.parse(
        await json(`/api/workspace/${workspace.id}/clips`),
      );
      if (!list.active) {
        if (["failed", "canceled"].includes(list.clips[0]?.state ?? ""))
          throw Error("synthetic_clip_failure");
        return list.clips[0]!;
      }
      await new Promise((done) => setTimeout(done, 100));
    }
    throw Error("synthetic_clip_timeout");
  };
  let workspace: ReturnType<typeof ownerWorkspaceSchema.parse>;
  const files = new Map<string, { bytes: Buffer; type: string }>();
  let saved: { id: string } | undefined;
  let persisted = false,
    reopenCalls = -1;
  const getClip = async () =>
    ownerClipListSchema.parse(
      await json(`/api/workspace/${workspace.id}/clips`),
    ).clips[0]!;
  const overlay = (clip: Awaited<ReturnType<typeof getClip>>) =>
    compileOwnerOverlay(
      clip.base!,
      clip.edit,
      clip.assets,
      clip.audioAssets,
      clip.videoAssets,
    );
  const digest = (value: unknown) =>
    createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const api = createServer((req, res) => {
    void (async () => {
      const address = api.address();
      const webPort = address && typeof address === "object" ? address.port : 0;
      const hostHeader = req.headers.host;
      if (
        ![`localhost:${webPort}`, `127.0.0.1:${webPort}`].includes(
          hostHeader ?? "",
        ) ||
        req.headers["sec-fetch-site"] === "cross-site" ||
        (req.headers.origin && req.headers.origin !== `http://${hostHeader}`)
      ) {
        res.writeHead(403).end();
        return;
      }
      const path = req.url ?? "/";
      if (path === "/fixture/workspace") {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(workspace));
        return;
      }
      if (path === "/proof/status") {
        const clip = await getClip(),
          cue = clip.edit!.visuals.find((cue) => cue.video)!;
        res.writeHead(200, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            state: clip.state,
            revision: clip.revision,
            outputs: clip.outputs.length,
            pan: cue.effect,
            tracking: cue.tracking
              ? {
                  outcome: cue.tracking.outcome,
                  samples: cue.tracking.points.length,
                  dx: cue.tracking.points.at(-1)!.x - cue.tracking.points[0]!.x,
                  sourceStartFrame: cue.tracking.sourceStartFrame,
                  startFrame: cue.tracking.startFrame,
                  endFrame: cue.tracking.endFrame,
                }
              : null,
            nativeCalls,
            planCalls,
            imageCalls,
            persisted,
            reopenCalls,
            review,
          }),
        );
        return;
      }
      if (req.method === "POST" && path === "/proof/save-reopen") {
        const before = await getClip();
        if (
          !before.outputs.length ||
          !before.edit!.visuals.some((cue) => cue.tracking)
        )
          throw Error("acceptance_not_ready");
        saved = await json(`/api/workspace/${workspace.id}/draft`, {});
        const shape = digest(overlay(before)),
          edit = digest(before.edit),
          calls = nativeCalls;
        const originalOutput = await readFile(
          join(
            root,
            workspace.id,
            `${before.id}.r${before.outputs.at(-1)!.revision}.mp4`,
          ),
        );
        await host.close();
        host = createOwnerHost(options);
        port = await listenOwner(host.server);
        workspace = ownerWorkspaceSchema.parse(
          await json(`/api/drafts/${saved!.id}/open`, {}),
        );
        const after = await getClip();
        persisted =
          shape === digest(overlay(after)) &&
          edit === digest(after.edit) &&
          calls === nativeCalls;
        const reopenedOutput = await readFile(
          join(
            root,
            workspace.id,
            `${after.id}.r${after.outputs.at(-1)!.revision}.mp4`,
          ),
        );
        persisted &&= digest(originalOutput) === digest(reopenedOutput);
        reopenCalls = nativeCalls - calls;
        if (!persisted) throw Error("synthetic_draft_mismatch");
        const record = JSON.parse(
          (
            await readFile(join(storageRoot, "Drafts", saved!.id, "draft.json"))
          ).toString(),
        );
        await writeFile(
          join(review, "Open-pan-face-tracking.json"),
          JSON.stringify(
            {
              version: 1,
              id: record.id,
              source: { digest: record.source.digest },
            },
            null,
            2,
          ),
        );
        await writeFile(join(review, "Pan-face-tracking.mp4"), reopenedOutput);
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify({ persisted, reopenCalls, review }));
        return;
      }
      const frame = /^\/proof\/frame\/(\d+)$/.exec(path);
      if (req.method === "POST" && frame) {
        const at = Number(frame[1]);
        const clip = await getClip();
        if (
          !Number.isInteger(at) ||
          at < 0 ||
          at >= clip.base!.overlay.frames ||
          !clip.outputs.length
        )
          throw Error("invalid_frame");
        const out = join(directory, `export-${at}.png`);
        await run([
          "-i",
          join(
            root,
            workspace.id,
            `${clip.id}.r${clip.outputs.at(-1)!.revision}.mp4`,
          ),
          "-vf",
          `select='eq(n,${at})'`,
          "-fps_mode",
          "passthrough",
          "-frames:v",
          "1",
          out,
        ]);
        await copyFile(out, join(review, `export-${at}.png`));
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify({ frame: at, path: out }));
        return;
      }
      if (path.startsWith("/api/local/")) {
        if (
          path !== "/api/local/workspace" &&
          !path.startsWith(`/api/local/workspace/${workspace.id}/`)
        ) {
          res.writeHead(404).end();
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 70 * 1024 ** 2) throw Error("fixture_request_large");
          chunks.push(Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks);
        if (body.length > 70 * 1024 ** 2) throw Error("fixture_request_large");
        const result = await ownerRequest(
          port,
          path.replace("/api/local/", "/api/"),
          {
            method: req.method ?? "GET",
            headers: {
              Authorization: headers.Authorization,
              ...(typeof req.headers["content-type"] === "string"
                ? { "Content-Type": req.headers["content-type"] }
                : {}),
              ...(typeof req.headers.range === "string"
                ? { Range: req.headers.range }
                : {}),
            },
            ...(body.length ? { body } : {}),
            signal,
          },
        );
        res
          .writeHead(result.status, {
            ...(result.headers["content-type"]
              ? { "Content-Type": result.headers["content-type"] }
              : {}),
            ...(result.headers["content-range"]
              ? { "Content-Range": result.headers["content-range"] }
              : {}),
            "Content-Length": result.body.length,
            "Cache-Control": "no-store",
            "Accept-Ranges": "bytes",
          })
          .end(result.body);
        return;
      }
      const file = files.get(path);
      if (file) {
        res.writeHead(200, { "Content-Type": file.type }).end(file.bytes);
        return;
      }
      res.writeHead(404).end();
    })().catch(() => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });
  try {
    let clip: Awaited<ReturnType<typeof getClip>>;
    if (resume) {
      workspace = ownerWorkspaceSchema.parse(
        await json(`/api/drafts/${resume.draftId}/open`, {}),
      );
      clip = await getClip();
    } else {
      const source = join(directory, "synthetic-original.mp4");
      await run([
        "-f",
        "lavfi",
        "-i",
        "color=c=0x303841:s=1280x720:r=30:d=8",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=8",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-threads",
        "2",
        source,
      ]);
      const upload = await ownerRequest(port, "/api/source", {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "video/mp4",
        },
        body: await readFile(source),
        signal,
      });
      if (upload.status !== 200) throw Error("synthetic_source_upload");
      workspace = ownerWorkspaceSchema.parse(
        JSON.parse(upload.body.toString()),
      );
      const analysis = ownerAnalysisSchema.parse(
        await json(`/api/workspace/${workspace.id}/analysis`, {
          sourceRevision: 0,
          policyRevision: 1,
          ranges: [{ id: randomUUID(), startMs: 0, endMs: 8000 }],
          manualOnly: true,
          aiDuration: { minMs: 10000, maxMs: 10000 },
        }),
      );
      await json(`/api/workspace/${workspace.id}/clips`, {
        operationId: randomUUID(),
        analysisId: analysis.id,
        sourceRevision: 0,
        policyRevision: 1,
        momentIds: [analysis.manual[0]!.id],
        framing: "fit",
      });
      clip = await waitClip();
      const face = join(directory, "synthetic-face.png");
      await sharp(
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="144"><defs><linearGradient id="s"><stop stop-color="#f6c298"/><stop offset="1" stop-color="#ad6e4b"/></linearGradient></defs><rect width="128" height="144" fill="#254d72"/><ellipse cx="64" cy="72" rx="50" ry="64" fill="url(#s)"/><path d="M15 55Q10 3 67 5Q120 8 114 53L96 35 82 43 59 30 31 48Z" fill="#34231e"/><path d="M28 59L50 56M76 56L98 59" stroke="#352820" stroke-width="5"/><ellipse cx="40" cy="67" rx="12" ry="7" fill="#fff"/><ellipse cx="87" cy="67" rx="12" ry="7" fill="#fff"/><circle cx="42" cy="67" r="5" fill="#1b3036"/><circle cx="85" cy="67" r="5" fill="#1b3036"/><path d="M64 69L55 94 70 95M42 112Q65 128 87 109" fill="none" stroke="#774737" stroke-width="4"/><path d="M22 87l8 3m-6 9 8 1m65-13 9-3m-9 15 7-1" stroke="#b57b5b" stroke-width="2"/></svg>',
        ),
      )
        .png()
        .toFile(face);
      const video = join(directory, "synthetic-added-video.mp4");
      await run([
        "-f",
        "lavfi",
        "-i",
        "testsrc2=s=640x360:r=30:d=8",
        "-loop",
        "1",
        "-i",
        face,
        "-filter_complex",
        "[0:v]drawgrid=w=80:h=60:t=2:c=white@0.4[bg];[bg][1:v]overlay=x='100+35*t':y=100:shortest=1",
        "-t",
        "8",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        video,
      ]);
      const admitted = await ownerRequest(
        port,
        `/api/workspace/${workspace.id}/clips/${clip.id}/video`,
        {
          method: "POST",
          headers: {
            Authorization: headers.Authorization,
            "Content-Type": "video/mp4",
          },
          body: await readFile(video),
          signal,
        },
      );
      if (admitted.status !== 200) throw Error("synthetic_video_upload");
      clip = ownerClipListSchema.parse(JSON.parse(admitted.body.toString()))
        .clips[0]!;
      const edit = structuredClone(clip.edit!);
      const cue = {
        id: randomUUID(),
        assetId: clip.videoAssets![0]!.id,
        startFrame: 30,
        endFrame: 210,
        box: { x: 0.1, y: 0.1, width: 0.8, height: 0.4 },
        fit: "cover" as const,
        presentation: "full-frame" as const,
        video: { offsetFrame: 15, volume: 100, muted: true },
        focal: { x: 0.25, y: 0.5 },
        entrance: "none" as const,
        exit: "none" as const,
      };
      edit.visuals = [cue];
      await json(`/api/workspace/${workspace.id}/clips/${clip.id}/edit`, {
        operationId: randomUUID(),
        expectedRevision: clip.revision,
        baseHash: clip.baseHash,
        operations: ownerEditOperations(clip.edit!, edit, clip),
      });
    }
    const sourceCode = `import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
      import {OwnerClipBatchPanel} from './apps/frontend/src/features/local-editing/clip-batch-panel.tsx';
      import {Workspace} from './apps/frontend/src/shared/ui/workspace.tsx';import {WorkflowFrame} from './apps/frontend/src/shared/ui/workflow-frame.tsx';
      import {rememberEditorTour,editorTourStorage} from './apps/frontend/src/features/local-editing/editor-tour-preference.ts';
      import './apps/frontend/src/styles/tokens.css';import './apps/frontend/src/features/local-editing/style.css';
      rememberEditorTour(editorTourStorage());const workspace=await fetch('/fixture/workspace').then(r=>r.json());
      function App(){const[footer,setFooter]=useState(null);return <Workspace localMode editing><WorkflowFrame title='CL-271 added-video acceptance' step={2} actions={<div className='workflow-session-actions'><div className='workflow-action-slot' ref={setFooter}/></div>}><div className='local-editing local-editor'><OwnerClipBatchPanel workspace={workspace} capabilities={{aiMode:'synthetic-ai',sourceMode:'synthetic-source',localMedia:true,cloud:false,planningAvailable:true}} selected={[]} showProcessing={false} initialReviewId='${clip.id}' onActive={()=>{}} actionTarget={footer}/></div></WorkflowFrame></Workspace>;}createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);`;
    await build({
      stdin: { contents: sourceCode, resolveDir: resolve("."), loader: "tsx" },
      nodePaths: [resolve("apps/frontend/node_modules")],
      bundle: true,
      platform: "browser",
      format: "esm",
      jsx: "automatic",
      outfile: join(directory, "app.js"),
    });
    for (const name of ["app.js", "app.css"])
      files.set(`/${name}`, {
        bytes: await readFile(join(directory, name)),
        type: name.endsWith("js") ? "text/javascript" : "text/css",
      });
    files.set("/", {
      bytes: Buffer.from(
        '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
      ),
      type: "text/html",
    });
    const webPort = await listenOwner(api);
    return {
      url: `http://localhost:${webPort}/`,
      directory,
      review,
      close: async () => {
        api.closeAllConnections();
        await new Promise<void>((done) => api.close(() => done()));
        await host.close();
        await worker.close();
        if (dirname(await realpath(directory)) !== (await realpath(tmpdir())))
          throw Error("acceptance_cleanup_invalid");
        await rm(directory, { recursive: true, force: true });
      },
    };
  } catch (error) {
    api.closeAllConnections();
    if (api.listening)
      await new Promise<void>((done) => api.close(() => done()));
    await host.close();
    await worker.close();
    if (dirname(await realpath(directory)) === (await realpath(tmpdir())))
      await rm(directory, { recursive: true, force: true });
    throw error;
  } finally {
    await stop();
  }
}
