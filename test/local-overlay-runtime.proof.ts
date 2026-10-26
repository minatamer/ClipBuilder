import { expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  writeFile,
  realpath,
  rm,
  readdir,
  readFile,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { isBuiltin, createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { build, stop } from "esbuild";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { nativeEnvironment } from "../apps/backend/local/local-mode.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";

async function clearOverlayProof(directory: string) {
  const actual = await realpath(directory),
    parent = await realpath(tmpdir()),
    name = relative(parent, actual);
  if (
    !name.startsWith("clipbuilder-overlay-runtime-") ||
    isAbsolute(name) ||
    name.startsWith("..")
  )
    throw new Error("overlay_proof_cleanup_invalid");
  await rm(actual, { recursive: true, force: true });
}

it("paints a full minute of empty overlay from a compiled isolated native child", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-overlay-runtime-"),
  );
  try {
    const bundle = await prepareLocalOverlayFixture(directory);
    await writeFile(
      join(bundle, "index.html"),
      "<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; img-src data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'\"><style>html,body{margin:0;width:1080px;height:1920px;background:transparent}</style></head><body><div id=\"root\"></div><script type=\"module\" src=\"/app.js\"></script></body></html>",
    );
    const entry = join(directory, "synthetic-overlay-worker.mjs");
    try {
      await build({
        stdin: {
          contents: `import {readFile} from "node:fs/promises";
import {rasterizeOwnerOverlay} from "./apps/renderer/local/rasterize-overlay.ts";
import {renderOwnerClip} from "./apps/renderer/local/clip-render.ts";
try {
  const request=JSON.parse(await readFile(process.argv[2], "utf8"));
  const signal=AbortSignal.timeout(120000);
  await rasterizeOwnerOverlay(request.overlayOptions, signal);
  const rendered=await renderOwnerClip({...request.renderOptions,cache:new Map()},request.job,signal);
  process.stdout.write(JSON.stringify({ok:true,frames:rendered.frames,durationMs:rendered.durationMs}));
} catch(error) {
  process.stdout.write(JSON.stringify({ok:false,errorClass:error.name,message:String(error.message).slice(0,1200)}));
}`,
          resolveDir: resolve("."),
          loader: "ts",
        },
        bundle: true,
        platform: "node",
        format: "esm",
        outfile: entry,
        plugins: [
          {
            name: "owned-package-resolution",
            setup(builder) {
              builder.onResolve({ filter: /^[^./]/ }, (args) => {
                if (isBuiltin(args.path))
                  return { path: args.path, external: true };
                if (args.path.startsWith("@clipbuilder/")) return;
                const require = createRequire(
                  resolve(args.resolveDir, "package.json"),
                );
                return {
                  path: pathToFileURL(require.resolve(args.path)).href,
                  external: true,
                };
              });
            },
          },
        ],
      });
    } finally {
      await stop();
    }
    const frames = join(directory, "frames");
    await mkdir(frames);
    const workspaceId = randomUUID(),
      clipId = randomUUID();
    const workspaces = join(directory, "workspaces");
    const workspace = join(workspaces, workspaceId);
    await mkdir(workspace, { recursive: true });
    const tools = await ownerNativeTools(resolve("."));
    const source = join(workspace, "source.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=blue:s=320x568:r=30:d=60",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        "60",
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
      ],
      AbortSignal.timeout(30_000),
    );
    const metadata = await inspectOwnerSource(
      source,
      tools,
      AbortSignal.timeout(10_000),
    );
    const overlay = { version: 1, frames: 1800, captions: [], visuals: [] };
    const request = join(directory, "synthetic-request.json");
    await writeFile(
      request,
      JSON.stringify({
        overlayOptions: {
          bundle,
          chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
          overlay,
          assets: {},
          frames,
        },
        renderOptions: {
          root: workspaces,
          tools,
          bundle,
          chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        },
        job: {
          operation: "clip",
          workspaceId,
          clipId,
          jobId: randomUUID(),
          renderRevision: 0,
          cut: { startFrame: 0, endFrame: 1800 },
          fingerprint: metadata.fingerprint,
          overlay,
        },
      }),
    );
    const result = await runOwnedProcess(
      process.execPath,
      [entry, request],
      AbortSignal.timeout(130_000),
      { env: nativeEnvironment(directory) },
    );
    expect(JSON.parse(result)).toEqual({
      ok: true,
      frames: 1800,
      durationMs: 60_000,
    });
    expect(await readdir(frames)).toHaveLength(1800);
    expect(await readFile(join(frames, "001799.png"))).toEqual(
      await readFile(join(frames, "000000.png")),
    );
    expect((await stat(join(frames, "000000.png"))).nlink).toBeLessThan(1024);
    const output = await inspectOwnerSource(
      join(workspace, `${clipId}.r0.mp4`),
      tools,
      AbortSignal.timeout(10_000),
    );
    expect(output.durationMs).toBe(60_000);
    expect(output).toMatchObject({ width: 320, height: 568, fps: 30 });
    expect(
      (await readdir(workspace)).some(
        (name) => name.startsWith("overlay-") || name.endsWith(".partial.mp4"),
      ),
    ).toBe(false);
  } finally {
    await clearOverlayProof(directory);
  }
}, 150_000);
