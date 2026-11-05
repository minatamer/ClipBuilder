import { expect, it, vi } from "vitest";
import {
  mkdtemp,
  readFile,
  rm,
  realpath,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { WORKER_RESPONSE_BYTES } from "../apps/backend/local/worker-transport.ts";
import { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import { OwnerClipBatch } from "../apps/backend/local/clip-batch.ts";
import { analyzeOwner } from "../apps/backend/local/analysis.ts";
import {
  defaultOwnerFocus,
  ownerFocusCrop,
  ownerSourceContent,
} from "../packages/contracts/local/focus.ts";
import { ownerCameraFollowCrop } from "../packages/contracts/local/camera-follow.ts";
import type {
  OwnerWorkspace,
  OwnerMediaResult,
} from "../packages/contracts/local/index.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

it("attaches late-reframe Motion on fresh preparation through real HTTP and exports the saved paths without new AI", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-fresh-motion-"));
  const files = new WorkspaceFiles(root),
    tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(150000);
  const worker = createOwnerWorker({
    root,
    token: "synthetic-follow",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: await prepareLocalOverlayFixture(root),
  });
  let batch: OwnerClipBatch | undefined;
  try {
    const workspaceId = await files.create(),
      source = await files.file(workspaceId, "source.mp4"),
      texture = join(root, "texture.png"),
      pixels = Buffer.alloc(72 * 96 * 3);
    let value = 7234321;
    for (let n = 0; n < pixels.length; n++) {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      pixels[n] = 50 + ((value >>> 24) % 180);
    }
    await sharp(pixels, { raw: { width: 72, height: 96, channels: 3 } })
      .png()
      .toFile(texture);
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
        "color=c=0x202020:s=480x270:r=30:d=24",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-i",
        texture,
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-filter_complex",
        "[0:v][1:v]overlay=x='70+140*clip((t-12)/4,0,1)':y=70:shortest=1,drawbox=x=350:y=70:w=72:h=96:color=blue:t=fill[v]",
        "-map",
        "[v]",
        "-map",
        "2:a",
        "-t",
        "24",
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
      signal,
    );
    const metadata = await inspectOwnerSource(source, tools, signal);
    const workspace: OwnerWorkspace = {
      id: workspaceId,
      mode: "provider-ai",
      revision: 0,
      source: metadata,
    };
    const unexpected = vi.fn(async () => {
      throw Error("unexpected_provider_call");
    });
    const transcribe = vi.fn(async () => []);
    const analysis = await analyzeOwner(
      workspace,
      {
        sourceRevision: 0,
        policyRevision: 1,
        ranges: [{ id: randomUUID(), startMs: 0, endMs: 24000 }],
        manualOnly: true,
        aiDuration: { minMs: 10000, maxMs: 10000 },
      },
      { mode: "provider-ai", transcribe, select: unexpected },
      signal,
    );
    const focus = defaultOwnerFocus(metadata, 720);
    focus.people = [
      {
        id: "person_1",
        observations: [
          {
            startFrame: 0,
            endFrame: 720,
            box: {
              x: 70 / 480,
              y: 70 / 270,
              width: 72 / 480,
              height: 96 / 270,
            },
          },
        ],
      },
    ];
    focus.shots = [
      { ...focus.shots[0]!, endFrame: 180 },
      {
        ...focus.shots[0]!,
        startFrame: 180,
        personId: "person_1",
        centerX: 106 / 480,
      },
    ];
    const port = await listenOwner(worker.server),
      rpc = localWorkerPort(port, "synthetic-follow");
    const replies: OwnerMediaResult[] = [];
    const media = vi.fn(async (...args: Parameters<typeof rpc>) => {
      const result = await rpc(...args);
      replies.push(result);
      return result;
    });
    const plan = vi.fn(async () => []),
      image = vi.fn(async () => {
        throw Error("unexpected_picture_call");
      });
    batch = new OwnerClipBatch(workspace, files, {
      mode: "provider-ai",
      plan,
      image,
      focus: () => focus,
      render: media,
    });
    await batch.submit(
      {
        operationId: randomUUID(),
        analysisId: analysis.id,
        sourceRevision: 0,
        policyRevision: 1,
        momentIds: [analysis.manual[0]!.id],
      },
      analysis,
    );
    await batch.drain();
    const clip = batch.snapshot().clips[0]!;
    expect(clip.state).toBe("review-ready");
    expect(
      clip.edit!.cameraTracks,
      JSON.stringify(
        replies.map((r) => ({
          operation: r.operation,
          tracks:
            r.operation === "clip-preview" ? r.cameraTracks?.length : null,
        })),
      ),
    ).toHaveLength(1);
    expect(Buffer.byteLength(JSON.stringify(replies[0]))).toBeGreaterThan(
      WORKER_RESPONSE_BYTES,
    );
    expect(clip.edit!.cameraTracks![0]!.startFrame).toBe(180);
    expect(clip.edit!.cameraTracks![0]!.endFrame).toBe(720);
    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(plan).toHaveBeenCalledTimes(1);
    expect(image).toHaveBeenCalledTimes(0);
    expect(unexpected).toHaveBeenCalledTimes(0);
    expect(media).toHaveBeenCalledTimes(1);
    const tracks = clip.edit!.cameraTracks!,
      content = ownerSourceContent(focus.source),
      baseline = ownerFocusCrop(focus, focus.shots[1]!);
    expect(
      (baseline.x + baseline.width - content.x) / content.width,
    ).toBeLessThan(210 / 480);
    const crop = ownerCameraFollowCrop(focus, tracks, 510, "body", 510);
    expect((crop.x - content.x) / content.width).toBeLessThan(210 / 480);
    expect((crop.x + crop.width - content.x) / content.width).toBeGreaterThan(
      282 / 480,
    );
    await batch.render(clip.id, {
      operationId: randomUUID(),
      expectedRevision: 0,
    });
    await batch.drain();
    expect(batch.snapshot().clips[0]!.state).toBe("ready");
    expect(plan).toHaveBeenCalledTimes(1);
    expect(media).toHaveBeenCalledTimes(2);
    expect(image).toHaveBeenCalledTimes(0);
    expect(unexpected).toHaveBeenCalledTimes(0);
    const output = await files.output(workspaceId, clip.id, 0),
      raw = join(root, "late.rgb");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-i",
        output,
        "-vf",
        "select=eq(n\\,510)",
        "-fps_mode",
        "passthrough",
        "-frames:v",
        "1",
        "-pix_fmt",
        "rgb24",
        "-f",
        "rawvideo",
        raw,
      ],
      signal,
    );
    const frame = await readFile(raw);
    let targetPixels = 0;
    for (let n = 0; n < frame.length; n += 3)
      if (Math.min(frame[n]!, frame[n + 1]!, frame[n + 2]!) > 55)
        targetPixels++;
    expect(targetPixels).toBeGreaterThan(3000);
    const probe = JSON.parse(
      await runOwnedProcess(
        tools.ffprobe,
        [
          "-v",
          "error",
          "-select_streams",
          "v:0",
          "-show_entries",
          "stream=width,height",
          "-of",
          "json",
          output,
        ],
        signal,
      ),
    ).streams[0];
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await sharp(frame, {
      raw: { width: probe.width, height: probe.height, channels: 3 },
    })
      .png()
      .toFile(resolve(".local-build/evidence/cl221-fresh-native.png"));
    await writeFile(
      resolve(".local-build/evidence/cl221-fresh-native.json"),
      JSON.stringify({
        responseBytes: Buffer.byteLength(JSON.stringify(replies[0])),
        tracks: tracks.length,
        lateTargetPixels: targetPixels,
        providerCalls: 0,
        planCalls: 1,
        mediaCalls: 2,
      }),
    );
  } finally {
    await batch?.close();
    await worker.close();
    await files.close();
    await clearScratch(root);
  }
}, 160000);
async function clearScratch(root: string) {
  const rel = relative(await realpath(tmpdir()), await realpath(root));
  if (
    !rel ||
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("clipbuilder-fresh-motion-")
  )
    throw Error("invalid_fresh_motion_cleanup");
  await rm(root, { recursive: true, force: true });
}
