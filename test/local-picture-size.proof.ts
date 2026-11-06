import { expect, it, vi } from "vitest";
import { mkdtemp, readFile, realpath, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import { OwnerClipBatch } from "../apps/backend/local/clip-batch.ts";
import { analyzeOwner } from "../apps/backend/local/analysis.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import type { OwnerWorkspace } from "../packages/contracts/local/index.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

it("keeps a fresh crowded-picture placement large through worker HTTP and native export without new AI", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-picture-size-"));
  const files = new WorkspaceFiles(root),
    tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(90000);
  const worker = createOwnerWorker({
    root,
    token: "synthetic-picture-size",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: await prepareLocalOverlayFixture(root),
  });
  let batch: OwnerClipBatch | undefined;
  try {
    const workspaceId = await files.create(),
      source = await files.file(workspaceId, "source.mp4");
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
        "color=c=0x102040:s=360x640:r=30:d=6",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        "6",
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
    const metadata = await inspectOwnerSource(source, tools, signal),
      workspace: OwnerWorkspace = {
        id: workspaceId,
        mode: "synthetic-ai",
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
        ranges: [{ id: randomUUID(), startMs: 0, endMs: 6000 }],
        manualOnly: true,
        aiDuration: { minMs: 10000, maxMs: 10000 },
      },
      { mode: "synthetic-ai", transcribe, select: unexpected },
      signal,
    );
    const focus = defaultOwnerFocus(metadata, 180);
    focus.people = [
      {
        id: "person_1",
        observations: [
          {
            startFrame: 0,
            endFrame: 180,
            box: { x: 0.2, y: 0.225, width: 0.6, height: 0.55 },
          },
        ],
      },
    ];
    const picture = await sharp({
      create: {
        width: 460,
        height: 260,
        channels: 3,
        background: "#00ff00",
      },
    })
      .png()
      .toBuffer();
    const plan = vi.fn(async () => [
      {
        startFrame: 30,
        endFrame: 150,
        brief: {
          scene: "Synthetic green panel",
          searchQuery: "green panel",
          requiredTerms: ["panel"],
          avoidTerms: [],
        },
        evidenceWordIds: [],
      },
    ]);
    const image = vi.fn(async () => ({
      bytes: picture,
      origin: "synthetic" as const,
    }));
    const port = await listenOwner(worker.server),
      rpc = localWorkerPort(port, "synthetic-picture-size"),
      media = vi.fn(rpc);
    batch = new OwnerClipBatch(workspace, files, {
      mode: "synthetic-ai",
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
    const visual = clip.base!.overlay.visuals[0]!;
    expect(visual.box.width).toBeCloseTo(920 / 1080);
    expect(visual.box.height).toBeCloseTo(520 / 1920);
    expect(clip.edit!.visuals[0]!.box).toEqual(visual.box);
    expect(media).toHaveBeenCalledTimes(1);
    const preview = media.mock.calls[0]![0];
    expect(preview.operation).toBe("clip-preview");
    if (preview.operation === "clip-preview")
      expect(preview.clipId).toBe(clip.id);
    await batch.render(clip.id, {
      operationId: randomUUID(),
      expectedRevision: clip.revision,
    });
    await batch.drain();
    expect(batch.snapshot().clips[0]!.state).toBe("ready");
    expect(plan).toHaveBeenCalledTimes(1);
    expect(image).toHaveBeenCalledTimes(1);
    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(unexpected).toHaveBeenCalledTimes(0);
    expect(media).toHaveBeenCalledTimes(2);
    const rendered = media.mock.calls[1]![0];
    expect(rendered.operation).toBe("clip");
    if (rendered.operation === "clip")
      expect(rendered.overlay.visuals[0]!.box).toEqual(visual.box);
    const output = await files.output(workspaceId, clip.id, 0),
      raw = join(root, "picture.rgb");
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
        "select=eq(n\\,60)",
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
    ).streams[0] as { width: number; height: number };
    const frame = await readFile(raw);
    let left = probe.width,
      right = -1,
      top = probe.height,
      bottom = -1;
    for (let y = 0; y < probe.height; y++)
      for (let x = 0; x < probe.width; x++) {
        const at = (y * probe.width + x) * 3;
        if (frame[at + 1]! > 180 && frame[at]! < 80 && frame[at + 2]! < 80) {
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }
    expect((right - left + 1) / probe.width).toBeGreaterThan(0.82);
    expect((bottom - top + 1) / probe.height).toBeGreaterThan(0.25);
    expect(Math.abs(left / probe.width - visual.box.x)).toBeLessThan(0.02);
    expect(Math.abs(top / probe.height - visual.box.y)).toBeLessThan(0.02);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await sharp(frame, { raw: { ...probe, channels: 3 } })
      .png()
      .toFile(resolve(".local-build/evidence/cl227-large-native.png"));
  } finally {
    await batch?.close();
    await worker.close();
    await files.close();
    await clearPictureScratch(root);
  }
}, 100000);

async function clearPictureScratch(root: string) {
  const rel = relative(await realpath(tmpdir()), await realpath(root));
  if (
    !rel ||
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("clipbuilder-picture-size-")
  )
    throw Error("invalid_picture_size_cleanup");
  await rm(root, { recursive: true, force: true });
}
