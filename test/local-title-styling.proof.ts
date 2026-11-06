import { expect, it, vi } from "vitest";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
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
import { decodePlannedText } from "../apps/backend/local/planned-text.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import { ownerOverlayFrame } from "../packages/composition/local/overlay-frame.ts";
import type { OwnerWorkspace } from "../packages/contracts/local/index.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

it("retains fresh AI word styling through preparation, Hook acceptance, persisted edits, worker HTTP and decoded native pixels", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-title-styles-"));
  const files = new WorkspaceFiles(root),
    tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(150000);
  const worker = createOwnerWorker({
    root,
    token: "synthetic-title-styles",
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
        "color=c=0x102040:s=360x640:r=30:d=12",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        "12",
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
      }),
      transcribe = vi.fn(async () => []);
    const analysis = await analyzeOwner(
      workspace,
      {
        sourceRevision: 0,
        policyRevision: 1,
        ranges: [{ id: randomUUID(), startMs: 0, endMs: 12000 }],
        manualOnly: true,
        aiDuration: { minMs: 10000, maxMs: 10000 },
      },
      { mode: "synthetic-ai", transcribe, select: unexpected },
      signal,
    );
    const title = decodePlannedText(
      {
        texts: [
          {
            title: "Why buyers wait",
            treatment: "impact",
            emphasis: [
              {
                text: "buyers",
                occurrence: 0,
                style: {
                  color: "#FF3B30",
                  font: "Georgia",
                  fontSize: 100,
                  fontWeight: 900,
                  outlineWidth: 2,
                  highlightColor: "#FFD60A",
                },
              },
            ],
          },
        ],
      },
      [],
      360,
    );
    const plan = vi.fn(async () => [
      {
        startFrame: 180,
        endFrame: 240,
        brief: {
          scene: "Synthetic panel",
          searchQuery: "panel",
          requiredTerms: ["panel"],
          avoidTerms: [],
        },
        evidenceWordIds: [],
      },
    ]);
    const picture = await sharp({
      create: { width: 100, height: 100, channels: 3, background: "#00ff00" },
    })
      .png()
      .toBuffer();
    const image = vi.fn(async () => ({
      bytes: picture,
      origin: "synthetic" as const,
    }));
    const port = await listenOwner(worker.server),
      media = vi.fn(localWorkerPort(port, "synthetic-title-styles"));
    const hook = { startFrame: 300, endFrame: 315 };
    batch = new OwnerClipBatch(workspace, files, {
      mode: "synthetic-ai",
      plan,
      image,
      focus: () => defaultOwnerFocus(metadata, 360),
      texts: () => structuredClone(title),
      hookSuggestion: () => hook,
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
    let clip = batch.snapshot().clips[0]!;
    expect(clip.state).toBe("review-ready");
    expect(clip.base!.overlay.texts![0]!.spans).toEqual(title[0]!.spans);
    expect(clip.base!.hookSuggestion).toEqual(hook);
    await batch.edit(
      clip.id,
      JSON.parse(
        JSON.stringify({
          operationId: randomUUID(),
          expectedRevision: clip.revision,
          baseHash: clip.baseHash,
          operations: [{ kind: "hook", hook }],
        }),
      ),
    );
    clip = batch.snapshot().clips[0]!;
    const restored = JSON.parse(JSON.stringify(clip.edit));
    const overlay = compileOwnerOverlay(clip.base!, restored, clip.assets);
    expect(overlay.hookContent!.texts![0]!.spans).toEqual(title[0]!.spans);
    expect(ownerOverlayFrame(overlay, 0).texts[0]!.spans).toEqual(
      title[0]!.spans,
    );
    await batch.render(clip.id, {
      operationId: randomUUID(),
      expectedRevision: clip.revision,
    });
    await batch.drain();
    expect(batch.snapshot().clips[0]!.state).toBe("ready");
    expect(plan).toHaveBeenCalledTimes(1);
    expect(image).toHaveBeenCalledTimes(1);
    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(unexpected).not.toHaveBeenCalled();
    expect(media).toHaveBeenCalledTimes(2);
    const output = await files.output(workspaceId, clip.id, 0),
      raw = join(root, "title.rgb");
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
        "select='eq(n,0)+eq(n,14)+eq(n,15)+eq(n,120)'",
        "-fps_mode",
        "passthrough",
        "-pix_fmt",
        "rgb24",
        "-f",
        "rawvideo",
        raw,
      ],
      signal,
    );
    const pixels = await readFile(raw),
      frameBytes = 360 * 640 * 3;
    expect(pixels.length).toBe(4 * frameBytes);
    const counts = Array.from({ length: 4 }, (_, frame) => {
      let red = 0,
        white = 0,
        yellow = 0,
        black = 0;
      for (let y = 50; y < 168; y++)
        for (let x = 28; x < 332; x++) {
          const at = frame * frameBytes + (y * 360 + x) * 3,
            r = pixels[at]!,
            g = pixels[at + 1]!,
            b = pixels[at + 2]!;
          if (r > 160 && g < 100 && b < 100) red++;
          if (r > 190 && g > 190 && b > 190) white++;
          if (r > 160 && g > 130 && b < 90) yellow++;
          if (r < 35 && g < 35 && b < 35) black++;
        }
      return { red, white, yellow, black };
    });
    for (const result of counts.slice(0, 3)) {
      expect(result.red).toBeGreaterThan(20);
      expect(result.white).toBeGreaterThan(20);
      expect(result.yellow).toBeGreaterThan(20);
      expect(result.black).toBeGreaterThan(20);
    }
    expect(counts[3]!.red).toBe(0);
  } finally {
    await batch?.close();
    await worker.close();
    await files.close();
    await clearTitleScratch(root);
  }
}, 160000);

async function clearTitleScratch(root: string) {
  const owned = relative(await realpath(tmpdir()), await realpath(root));
  if (
    !owned ||
    isAbsolute(owned) ||
    owned.startsWith("..") ||
    !owned.startsWith("clipbuilder-title-styles-")
  )
    throw Error("invalid_title_style_cleanup");
  await rm(root, { recursive: true, force: true });
}
