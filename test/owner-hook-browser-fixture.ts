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
import { ownerClipRenameSchema } from "../packages/contracts/local/clip-name.ts";
import { ownerHookTitleRequestSchema } from "../packages/contracts/local/hook-title.ts";
import { hookTitlePlanner } from "../apps/backend/local/hook-title-planner.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";
import {
  browserDiagnosticSchema,
  type BrowserDiagnostic,
} from "../packages/contracts/src/browser-diagnostic.schema.ts";

/** Generated, loopback-only editor surface for browser regression checks. */
export async function startHookEditorFixture(
  baselineEditor?: string,
  options: {
    configure?: (clip: ReturnType<typeof independentHookFixture>) => void;
    pictureSize?: { width: number; height: number };
    simulateTracking?: boolean;
    renameFailures?: number;
    renameDelayMs?: number;
    contextualFeedback?: boolean;
    hookTitles?: boolean;
    holdHookTitles?: boolean;
    momentsLayout?: boolean;
    durationFrames?: number;
    readinessFeedback?: boolean;
    sourceSize?: { width: number; height: number };
    previewAudio?: { id: string; bytes: Uint8Array; contentType: string };
    editorTour?: boolean;
    holdPreview?: boolean;
  } = {},
) {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-hook-editor-"));
  const clip = independentHookFixture(),
    workspace = {
      id: randomUUID(),
      mode: "synthetic-ai",
      revision: 0,
      source: {
        fingerprint: "a".repeat(64),
        bytes: 1000,
        durationMs: ((options.durationFrames ?? 120) / 30) * 1000,
        width: options.sourceSize?.width ?? 640,
        height: options.sourceSize?.height ?? 360,
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
  options.configure?.(clip);
  let ui = "",
    bytes = Buffer.alloc(0),
    edits = 0,
    unexpected = 0;
  let renameAttempts = 0,
    renames = 0;
  let injectedFailures = 0;
  let titleSuggestions = 0;
  let titleCancellations = 0,
    titleFailures = 0;
  const pendingTitles = new Set<
    (outcome: "ready" | "failed" | "canceled") => void
  >();
  const diagnostics: BrowserDiagnostic[] = [];
  let previewAudioReads = 0;
  let analysesStarted = 0;
  let analysesClosed = 0;
  const momentsAnalysis = (many: boolean) => {
    const moments = Array.from({ length: many ? 12 : 1 }, (_, index) => ({
      id: randomUUID(),
      processingIdentity: createHash("sha256")
        .update(`synthetic-moment-${index}`)
        .digest("hex"),
      cut: { startFrame: index, endFrame: index + 60 },
      rangeIds: [],
      cues: [],
      evidence:
        many && index > 2
          ? {
              startWordId: "w_000001",
              endWordId: "w_000002",
              title:
                `Synthetic ${index + 1}: a deliberately long headline that stays inside its result card`.slice(
                  0,
                  80,
                ),
              hook: "Synthetic hook",
              rationale: "Generated layout example",
              evidence: [],
              caveats: [],
            }
          : null,
    }));
    return ownerAnalysisSchema.parse({
      id: randomUUID(),
      inputs: {
        sourceRevision: 0,
        policyRevision: 0,
        ranges: [],
        aiDuration: { minMs: 10000, maxMs: 60000 },
        aiCount: many ? "all" : 1,
        manualOnly: !many,
      },
      mode: "synthetic-ai",
      words: [],
      manual: moments.filter((m) => !m.evidence),
      suggestions: moments.filter((m) => m.evidence),
      calls: { transcription: 0, selection: 0 },
    });
  };
  const oneAnalysis = options.momentsLayout ? momentsAnalysis(false) : null,
    manyAnalysis = options.momentsLayout ? momentsAnalysis(true) : null;
  const pictureSize = options.pictureSize ?? { width: 100, height: 100 };
  const picture = await sharp({
    create: { ...pictureSize, channels: 3, background: "yellow" },
  })
    .png()
    .toBuffer();
  clip.assets[0] = {
    ...clip.assets[0]!,
    ...pictureSize,
    bytes: picture.length,
    digest: createHash("sha256").update(picture).digest("hex"),
  };
  clip.base!.overlay.visuals[0]!.digest = clip.assets[0]!.digest;
  const sibling = options.editorTour ? structuredClone(clip) : null;
  if (sibling) {
    sibling.id = randomUUID();
    if (sibling.edit) sibling.edit.clipId = sibling.id;
  }
  let previewHeld = options.holdPreview ?? false;
  let tourWorkspace: typeof workspace | null = workspace;
  let tourResets = 0,
    tourOpens = 0;
  const pendingPreviews = new Set<() => void>();
  const releasePreview = () => {
    previewHeld = false;
    for (const done of pendingPreviews) done();
    pendingPreviews.clear();
  };
  const list = () => ({
    clips: sibling ? [clip, sibling] : [clip],
    active: false,
    workers: 1,
  });
  const server = createServer((req, res) => {
    void (async () => {
      res.setHeader("Content-Type", "application/json");
      if (
        options.editorTour &&
        req.method === "DELETE" &&
        req.url === `/api/local/workspace/${tourWorkspace?.id}`
      ) {
        req.resume();
        tourWorkspace = null;
        tourResets++;
        res.writeHead(204).end();
        return;
      }
      if (
        options.editorTour &&
        req.method === "POST" &&
        req.url === "/api/local/open/video"
      ) {
        for await (const chunk of req) void chunk;
        tourWorkspace = { ...workspace, id: randomUUID() };
        tourOpens++;
        res.end(
          JSON.stringify({
            kind: "video",
            workspace: tourWorkspace,
            clipId: null,
          }),
        );
        return;
      }
      if (req.url === "/api/diagnostics" && req.method === "POST") {
        const chunks: Buffer[] = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 8192) throw Error("synthetic_diagnostic_limit");
          chunks.push(Buffer.from(chunk));
        }
        const record = browserDiagnosticSchema.parse(
          JSON.parse(Buffer.concat(chunks).toString()),
        );
        if (diagnostics.length < 256) diagnostics.push(record);
        res.writeHead(204).end();
        return;
      }
      if (
        options.hookTitles &&
        req.method === "POST" &&
        req.url?.endsWith("/hook-title")
      ) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const request = ownerHookTitleRequestSchema.parse(
          JSON.parse(Buffer.concat(chunks).toString()),
        );
        titleSuggestions++;
        if (options.holdHookTitles) {
          const outcome = await new Promise<"ready" | "failed" | "canceled">(
            (done) => {
              const finish = (value: "ready" | "failed" | "canceled") => {
                pendingTitles.delete(finish);
                res.off("close", canceled);
                done(value);
              };
              const canceled = () => {
                titleCancellations++;
                finish("canceled");
              };
              pendingTitles.add(finish);
              res.once("close", canceled);
              if (res.destroyed) canceled();
            },
          );
          if (outcome === "canceled") return;
          if (outcome === "failed") {
            titleFailures++;
            res.writeHead(503).end("{}");
            return;
          }
        }
        const title = await hookTitlePlanner(async () => ({
          texts: [
            {
              title: "A Fresh Way to See This Moment",
              startFrame: 0,
              endFrame: 90,
              wordIds: [],
              hookStyle: "curiosity-gap",
              emphasis: [
                {
                  text: "Fresh Way",
                  occurrence: 0,
                  style: { color: "#FF3B30" },
                },
              ],
            },
          ],
        }))(
          {
            words: clip.base!.words,
            frames: clip.base!.overlay.frames,
            hook: request.hook,
          },
          new AbortController().signal,
        );
        res.end(
          JSON.stringify({
            clipId: clip.id,
            expectedRevision: request.expectedRevision,
            sourceRevision: request.sourceRevision,
            hook: request.hook,
            title,
          }),
        );
        return;
      }
      const scenario =
        options.contextualFeedback || options.momentsLayout
          ? req.headers["x-fixture-view"]
          : undefined;
      if (
        options.momentsLayout &&
        req.url?.endsWith("/analysis") &&
        req.method === "POST"
      ) {
        analysesStarted++;
        req.resume();
        res.once("close", () => {
          analysesClosed++;
        });
        return;
      }
      if (options.momentsLayout && req.url?.endsWith("/codex-progress")) {
        res.end(
          JSON.stringify({
            runId: workspace.id,
            steps: [
              { id: "inspect", state: "done", elapsedMs: 7000 },
              { id: "audio", state: "done", elapsedMs: 400 },
              { id: "transcription", state: "running", elapsedMs: 3000 },
              { id: "speakers", state: "running", elapsedMs: 1000 },
            ],
          }),
        );
        return;
      }
      if (scenario && req.url === "/api/local/sources/state") {
        res.writeHead(503).end("{}");
        return;
      }
      if (options.contextualFeedback && scenario && req.method !== "GET") {
        injectedFailures++;
        req.resume();
        res.writeHead(503).end("{}");
        return;
      }
      if (req.url === "/__fixture/state") {
        res.end(
          JSON.stringify({ clip, edits, unexpected, renameAttempts, renames }),
        );
        return;
      }
      if (
        req.method === "POST" &&
        req.url?.endsWith(`/clips/${clip.id}/rename`)
      ) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const input = ownerClipRenameSchema.parse(
          JSON.parse(Buffer.concat(chunks).toString()),
        );
        renameAttempts++;
        const renameDelayMs = options.renameDelayMs;
        if (renameDelayMs)
          await new Promise((done) =>
            setTimeout(done, Math.min(3000, renameDelayMs)),
          );
        if (renameAttempts <= (options.renameFailures ?? 0)) {
          res.writeHead(503).end("{}");
          return;
        }
        if (input.expectedName !== (clip.displayName ?? null)) {
          res.writeHead(409).end("{}");
          return;
        }
        if (input.name === null) delete clip.displayName;
        else clip.displayName = input.name;
        renames++;
        res.end(JSON.stringify(list()));
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
            ...(options.hookTitles ? { hookTitleSuggestions: true } : {}),
            sourceMode: null,
            planningAvailable: true,
            captionGeneration: false,
            ...(options.momentsLayout ? { aiProvider: "codex" } : {}),
            localMedia: true,
            cloud: false,
          }),
        );
        return;
      }
      if (req.url === "/api/local/workspace") {
        res.end(
          JSON.stringify(
            scenario === "/intake.html"
              ? null
              : options.editorTour
                ? tourWorkspace
                : workspace,
          ),
        );
        return;
      }
      if (options.editorTour && req.url === "/api/local/sources/state") {
        res.end("null");
        return;
      }
      if (req.url?.endsWith("/clips")) {
        res.end(
          JSON.stringify(
            options.momentsLayout ||
              scenario === "/moments.html" ||
              scenario === "/intake.html"
              ? { clips: [], active: false, workers: 1 }
              : scenario === "/failed.html"
                ? {
                    clips: [
                      {
                        ...clip,
                        state: "failed",
                        error: "local_clip_failed",
                        outputs: [],
                      },
                    ],
                    active: false,
                    workers: 1,
                  }
                : options.contextualFeedback
                  ? {
                      clips: [
                        {
                          ...clip,
                          state: "review-ready",
                          preview: {
                            frames: clip.base!.overlay.frames,
                            bytes: bytes.length,
                          },
                          outputs: [],
                        },
                      ],
                      active: false,
                      workers: 1,
                    }
                  : list(),
          ),
        );
        return;
      }
      if (req.url?.endsWith("/analysis")) {
        res.end(
          JSON.stringify(
            options.momentsLayout
              ? scenario === "/moments-many.html"
                ? manyAnalysis
                : scenario === "/moments-one.html"
                  ? oneAnalysis
                  : null
              : null,
          ),
        );
        return;
      }
      if (req.url?.includes("/assets/")) {
        res.writeHead(200, { "Content-Type": "image/png" }).end(picture);
        return;
      }
      if (
        options.previewAudio &&
        req.url?.endsWith(`/audio-assets/${options.previewAudio.id}`)
      ) {
        previewAudioReads++;
        res
          .writeHead(200, {
            "Content-Type": options.previewAudio.contentType,
            "Cache-Control": "no-store",
          })
          .end(options.previewAudio.bytes);
        return;
      }
      if (req.url?.endsWith("/source")) {
        if (previewHeld)
          await new Promise<void>((done) => {
            const finish = () => {
              pendingPreviews.delete(finish);
              res.off("close", finish);
              done();
            };
            pendingPreviews.add(finish);
            res.once("close", finish);
          });
        if (res.destroyed) return;
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
                    : req.url === "/" ||
                        ((options.contextualFeedback ||
                          options.momentsLayout) &&
                          [
                            "/intake.html",
                            "/moments.html",
                            "/failed.html",
                            "/moments-one.html",
                            "/moments-many.html",
                            "/moments-loading.html",
                          ].includes(req.url ?? ""))
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
        `${options.sourceSize ? "testsrc2=" : "color=teal:"}s=${options.sourceSize?.width ?? 640}x${options.sourceSize?.height ?? 360}:r=30:d=${(options.durationFrames ?? 120) / 30}`,
        "-f",
        "lavfi",
        "-i",
        `sine=frequency=440:sample_rate=48000:duration=${(options.durationFrames ?? 120) / 30}`,
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
    if (options.contextualFeedback)
      await writeFile(join(root, "synthetic-picture.png"), picture);
    ui = await prepareLocalControlsFixture(root, false, options.editorTour);
    await writeFile(
      join(ui, "index.html"),
      '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
    );
    if (options.contextualFeedback || options.momentsLayout) {
      const html = await readFile(join(ui, "index.html"), "utf8");
      await writeFile(
        join(ui, "index.html"),
        html.replace(
          "<head>",
          `<head><script>const originalFetch=window.fetch;window.fetch=(input,init={})=>{const headers=new Headers(init.headers);headers.set('x-fixture-view',location.pathname);return originalFetch(input,{...init,headers})};document.addEventListener('click',()=>{document.querySelectorAll('audio').forEach(audio=>audio.muted=true)},true);document.addEventListener('DOMContentLoaded',()=>{if(${Boolean(options.momentsLayout)})return;const button=document.createElement('button');button.textContent='Simulate audition failure (fixture)';button.style.cssText='position:fixed;bottom:4px;left:4px;z-index:10000';button.onclick=()=>{document.querySelector('.audio-inspector audio')?.dispatchEvent(new Event('error'));button.remove()};document.body.append(button)});</script>`,
        ),
      );
    }
    const loopSource = `import React, {useRef,useState} from "react";
      import {createRoot} from "react-dom/client";
      import {ClipEditor} from "./apps/frontend/src/features/local-editing/clip-editor.tsx";
      import {rememberEditorTour,editorTourStorage} from "./apps/frontend/src/features/local-editing/editor-tour-preference.ts";
      if(!${Boolean(options.editorTour)})rememberEditorTour(editorTourStorage());
      const clip=${JSON.stringify(clip)};
      function Host(){const count=useRef(0),ready=useRef(0);const [report,setReport]=useState({dirty:false});const [tick,setTick]=useState(0);
        return <><button onClick={()=>setTick(tick+1)}>Render host</button><output aria-label="Activity reports">{count.current}</output><output aria-label="Preview ready reports">{ready.current}</output><ClipEditor clip={clip} workspaceId="${workspace.id}" source={{width:640,height:360}} onAccepted={()=>{}} onPreviewReady={${options.readinessFeedback ? "()=>{document.documentElement.dataset.fixtureReadyReports=String(++ready.current);if(ready.current>60)throw Error('editor_preview_ready_loop');setReport({dirty:report.dirty})}" : "undefined"}} onDirty={(_,dirty)=>{if(++count.current>60)throw Error("editor_activity_loop");setReport({dirty});}} /></>;}
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
          `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css">${options.readinessFeedback ? `<script>const originalError=console.error;console.error=(...values)=>{if(values.some(v=>typeof v==='string'&&v.includes('Maximum update depth')))document.documentElement.dataset.fixtureUpdateDepth=String(Number(document.documentElement.dataset.fixtureUpdateDepth??0)+1);originalError(...values)};</script>` : ""}</head><body><div id="root"></div><script type="module" src="/${name}.js"></script></body></html>`,
        );
      }
    } finally {
      await stop();
    }
    if (baselineEditor || options.simulateTracking) {
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
            contents: `import React from "react";import {createRoot} from "react-dom/client";import {LocalEditingExperience} from "./apps/frontend/src/features/local-editing/experience.tsx";import {rememberEditorTour,editorTourStorage} from "./apps/frontend/src/features/local-editing/editor-tour-preference.ts";import "./apps/frontend/src/styles/tokens.css";if(!${Boolean(options.editorTour)})rememberEditorTour(editorTourStorage());createRoot(document.getElementById("root")).render(<LocalEditingExperience/>);`,
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
      syntheticMedia:
        options.contextualFeedback || options.editorTour
          ? { video: source, picture: join(root, "synthetic-picture.png") }
          : undefined,
      clip,
      sibling,
      releasePreview,
      holdPreview: () => {
        previewHeld = true;
      },
      tourSessionCounts: () => ({
        resets: tourResets,
        opens: tourOpens,
        pendingPreviews: pendingPreviews.size,
      }),
      counts: () => ({ edits, unexpected }),
      diagnostics: () => diagnostics.slice(),
      audioReads: () => previewAudioReads,
      renameCounts: () => ({ renameAttempts, renames }),
      feedbackCounts: () => ({ injectedFailures }),
      titleCounts: () => ({
        titleSuggestions,
        titleCancellations,
        titleFailures,
        pendingTitles: pendingTitles.size,
      }),
      releaseTitles: (outcome: "ready" | "failed") => {
        for (const finish of pendingTitles) finish(outcome);
      },
      momentCounts: () => ({ analysesStarted, analysesClosed }),
      close: async () => {
        releasePreview();
        server.closeAllConnections();
        if (server.listening)
          await new Promise<void>((done, reject) =>
            server.close((e) => (e ? reject(e) : done())),
          );
        await clearHookScratch(root);
      },
    };
  } catch (error) {
    releasePreview();
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
