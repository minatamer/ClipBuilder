import { expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import type { OwnerVisualEdit } from "../packages/contracts/local/assets.ts";
import { ownerEditOperations } from "../apps/frontend/src/features/local-editing/editor-state.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

function amplitude(bytes: Buffer, at: number, frequency: number) {
  const start = Math.round(at * 48000),
    length = 4800;
  let real = 0,
    imaginary = 0;
  for (let i = 0; i < length; i++) {
    const value = bytes.readInt16LE((start + i) * 2) / 32768,
      phase = (2 * Math.PI * frequency * i) / 48000;
    real += value * Math.cos(phase);
    imaginary += value * Math.sin(phase);
  }
  return (Math.hypot(real, imaginary) * 2) / length;
}

it("uploads two concurrent videos and transparent pictures over real HTTP, renders default silence and independent audio mixes, and reopens hashed drafts without AI", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-broll-proof-")),
    root = join(directory, "workspaces"),
    storage = join(directory, "library");
  await mkdir(root);
  await mkdir(storage);
  const tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(240_000);
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-y", "-v", "error", ...args],
      signal,
    );
  const bundle = await prepareLocalOverlayFixture(directory);
  const diagnostics: unknown[] = [];
  const worker = createOwnerWorker({
    diagnostic: (line) => diagnostics.push(JSON.parse(line)),
    root,
    token: "synthetic-broll-worker",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: bundle,
  });
  const workerPort = await listenOwner(worker.server);
  const media = vi.fn(
    async (
      job: Parameters<Parameters<typeof createOwnerHost>[0]["media"]>[0],
    ) => {
      const response = await ownerRequest(workerPort, "/media", {
        method: "POST",
        headers: {
          Authorization: "Bearer synthetic-broll-worker",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
        signal,
      });
      expect(response.status).toBe(200);
      return ownerMediaResultSchema.parse(JSON.parse(response.body.toString()));
    },
  );
  const plan = vi.fn(async () => []),
    image = vi.fn(async () => {
      throw Error("unexpected_image_call");
    });
  const options = {
    root,
    storageRoot: storage,
    token: "synthetic-broll-host",
    port: 0,
    analysis: fakeOwnerAnalysis,
    clipPreparation: { mode: "synthetic-ai" as const, plan, image },
    media,
  };
  let host = createOwnerHost(options),
    port = await listenOwner(host.server);
  const auth = { Authorization: "Bearer synthetic-broll-host" };
  const json = async (path: string, body?: unknown) => {
    const response = await ownerRequest(port, path, {
      ...(body === undefined
        ? {}
        : { method: "POST", body: JSON.stringify(body) }),
      headers: { ...auth, "Content-Type": "application/json" },
      signal,
    });
    expect([200, 202]).toContain(response.status);
    return JSON.parse(response.body.toString());
  };
  const wait = async (path: string, state: string) => {
    for (let i = 0; i < 1800; i++) {
      const list = ownerClipListSchema.parse(await json(path));
      if (!list.active) {
        expect(
          list.clips[0]!.state,
          JSON.stringify(diagnostics.slice(-3)),
        ).toBe(state);
        return list;
      }
      await new Promise((done) => setTimeout(done, 50));
    }
    throw Error("synthetic_broll_timeout");
  };
  try {
    const source = join(directory, "interview.mp4");
    await run([
      "-f",
      "lavfi",
      "-i",
      "color=c=gray:s=320x180:r=24:d=3",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=3",
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
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: await readFile(source),
      signal,
    });
    expect(upload.status).toBe(200);
    const workspace = ownerWorkspaceSchema.parse(
      JSON.parse(upload.body.toString()),
    );
    const api = `/api/workspace/${workspace.id}`;
    const analysis = ownerAnalysisSchema.parse(
      await json(`${api}/analysis`, {
        sourceRevision: 0,
        policyRevision: 1,
        ranges: [{ id: crypto.randomUUID(), startMs: 0, endMs: 3000 }],
        manualOnly: true,
        aiDuration: { minMs: 10000, maxMs: 10000 },
      }),
    );
    await json(`${api}/clips`, {
      operationId: crypto.randomUUID(),
      analysisId: analysis.id,
      sourceRevision: 0,
      policyRevision: 1,
      momentIds: [analysis.manual[0]!.id],
      framing: "fit",
    });
    let list = await wait(`${api}/clips`, "review-ready"),
      clip = list.clips[0]!;
    const endpoint = `${api}/clips/${clip.id}`;
    const previewPcm = join(directory, "preview.pcm");
    await run([
      "-i",
      join(root, workspace.id, `${clip.id}.source.mp4`),
      "-vn",
      "-ar",
      "48000",
      "-ac",
      "1",
      "-f",
      "s16le",
      previewPcm,
    ]);
    const previewAudio = await readFile(previewPcm);
    for (const at of [0.25, 0.75, 1.25, 2.75])
      expect(amplitude(previewAudio, at, 440)).toBeGreaterThan(0.05);
    list = ownerClipListSchema.parse(
      await json(`${endpoint}/fake-captions`, {
        operationId: crypto.randomUUID(),
        expectedRevision: clip.revision,
      }),
    );
    clip = list.clips[0]!;
    for (const [index, frequency] of [880, 1320, 0].entries()) {
      const file = join(directory, `broll-${index}.mp4`);
      await run([
        "-f",
        "lavfi",
        "-i",
        index === 0
          ? "color=c=green:s=320x180:r=24:d=3"
          : index === 1
            ? "testsrc2=s=180x320:r=24:d=3"
            : "color=c=blue:s=240x240:r=24:d=3",
        ...(frequency
          ? [
              "-f",
              "lavfi",
              "-i",
              `sine=frequency=${frequency}:sample_rate=48000:duration=3`,
            ]
          : []),
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        ...(frequency ? ["-c:a", "aac"] : []),
        "-threads",
        "2",
        file,
      ]);
      const admitted = await ownerRequest(port, `${endpoint}/video`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "video/mp4" },
        body: await readFile(file),
        signal,
      });
      expect(admitted.status).toBe(200);
      list = ownerClipListSchema.parse(JSON.parse(admitted.body.toString()));
      clip = list.clips[0]!;
    }
    expect(clip.videoAssets!.map((asset) => asset.hasAudio)).toEqual([
      true,
      true,
      false,
    ]);
    expect(
      clip.videoAssets!.map((asset) => [asset.width, asset.height]),
    ).toEqual([
      [320, 180],
      [180, 320],
      [240, 240],
    ]);
    for (const [index, frequency] of [880, 1320].entries()) {
      const normalized = join(
          root,
          workspace.id,
          `${clip.audioAssets![index]!.id}.wav`,
        ),
        decoded = join(directory, `normalized-${index}.pcm`);
      await run([
        "-i",
        normalized,
        "-map",
        "0:a:0",
        "-c:a",
        "pcm_s16le",
        "-ar",
        "48000",
        "-ac",
        "1",
        "-f",
        "s16le",
        decoded,
      ]);
      const bytes = await readFile(decoded);
      expect(
        amplitude(bytes, 0.75, frequency),
        `normalized video ${index}, bytes ${bytes.length}`,
      ).toBeGreaterThan(0.08);
    }
    const bad = await ownerRequest(port, `${endpoint}/video`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: Buffer.from("not an mp4"),
      signal,
    });
    expect(bad.status).not.toBe(200);
    expect(
      (await readdir(join(root, workspace.id))).filter(
        (name) => name.includes("partial") || name.endsWith("video-input"),
      ),
    ).toEqual([]);
    const picture = await sharp(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="80" height="160" fill="#ff0000"/><circle cx="115" cy="80" r="30" fill="#ffff00"/></svg>',
      ),
    )
      .png()
      .toBuffer();
    const admitted = await ownerRequest(port, `${endpoint}/picture`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "image/png" },
      body: picture,
      signal,
    });
    expect(admitted.status).toBe(200);
    list = ownerClipListSchema.parse(JSON.parse(admitted.body.toString()));
    clip = list.clips[0]!;
    const [first, second, third] = clip.videoAssets!;
    const base: OwnerVisualEdit = {
      id: crypto.randomUUID(),
      assetId: first!.id,
      startFrame: 15,
      endFrame: 75,
      box: { x: 0.1, y: 0.1, width: 0.8, height: 0.4 },
      fit: "cover",
      presentation: "full-frame",
      video: { offsetFrame: 30, volume: 50, muted: true },
      entrance: "none",
      exit: "none",
    };
    const inset: OwnerVisualEdit = {
      ...structuredClone(base),
      id: crypto.randomUUID(),
      assetId: second!.id,
      startFrame: 30,
      endFrame: 60,
      presentation: "inset",
      box: { x: 0.2, y: 0.2, width: 0.5, height: 0.25 },
      video: { offsetFrame: 15, volume: 25, muted: true },
      effect: {
        startFrame: 30,
        endFrame: 55,
        zoom: 1.5,
        fromX: 0.2,
        fromY: 0.5,
        toX: 0.8,
        toY: 0.5,
      },
      tracking: {
        assetId: second!.id,
        startFrame: 30,
        endFrame: 60,
        sourceStartFrame: 15,
        seed: { x: 0.4, y: 0.3, width: 0.2, height: 0.2 },
        outcome: "complete",
        points: [
          ...Array.from({ length: 15 }, (_, i) => ({
            frame: i * 2,
            x: 0.5 + i / 200,
            y: 0.4,
          })),
          { frame: 29, x: 0.575, y: 0.4 },
        ],
      },
    };
    const photo: OwnerVisualEdit = {
      id: crypto.randomUUID(),
      assetId: clip.assets[0]!.id,
      startFrame: 20,
      endFrame: 65,
      box: { x: 0.1, y: 0.15, width: 0.3, height: 0.2 },
      fit: "contain",
      entrance: "none",
      exit: "none",
      effect: {
        startFrame: 20,
        endFrame: 60,
        zoom: 1.6,
        fromX: 0.2,
        fromY: 0.5,
        toX: 0.8,
        toY: 0.5,
      },
    };
    const logo: OwnerVisualEdit = {
      ...structuredClone(photo),
      id: crypto.randomUUID(),
      startFrame: 0,
      endFrame: 90,
      box: { x: 0.7, y: 0.75, width: 0.2, height: 0.15 },
    };
    delete logo.effect;
    const draft = structuredClone(clip.edit!);
    const square: OwnerVisualEdit = {
      ...structuredClone(base),
      id: crypto.randomUUID(),
      assetId: third!.id,
      startFrame: 75,
      endFrame: 90,
      video: { offsetFrame: 0, volume: 100, muted: true },
    };
    draft.visuals = [base, inset, photo, logo, square];
    const apply = async (visuals: OwnerVisualEdit[]) => {
      const next = {
        ...structuredClone(clip.edit!),
        visuals,
        captions: {
          ...(clip.edit!.captions ?? OWNER_CAPTION_PRESETS.tiktok),
          fontSize: 96,
          color: "#ffffff",
          outlineWidth: 0,
          animation: "none" as const,
          box: { x: 0.075, y: 0.45, width: 0.85, height: 0.2 },
        },
      };
      list = ownerClipListSchema.parse(
        await json(`${endpoint}/edit`, {
          operationId: crypto.randomUUID(),
          expectedRevision: clip.revision,
          baseHash: clip.baseHash,
          operations: ownerEditOperations(clip.edit!, next, clip),
        }),
      );
      clip = list.clips[0]!;
    };
    await apply(draft.visuals);
    const excess = {
      ...structuredClone(clip.edit!),
      visuals: [
        ...structuredClone(clip.edit!.visuals),
        { ...structuredClone(base), id: crypto.randomUUID() },
      ],
    };
    const rejected = await ownerRequest(port, `${endpoint}/edit`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        operationId: crypto.randomUUID(),
        expectedRevision: clip.revision,
        baseHash: clip.baseHash,
        operations: ownerEditOperations(clip.edit!, excess, clip),
      }),
      signal,
    });
    expect(rejected.status).toBe(400);
    expect(
      ownerClipListSchema.parse(await json(`${api}/clips`)).clips[0]!.revision,
    ).toBe(clip.revision);
    const render = async () => {
      await json(`${endpoint}/render`, {
        operationId: crypto.randomUUID(),
        expectedRevision: clip.revision,
      });
      list = await wait(`${api}/clips`, "ready");
      clip = list.clips[0]!;
    };
    const pcm = async (revision: number) => {
      const output = join(root, workspace.id, `${clip.id}.r${revision}.mp4`),
        path = join(directory, `mix-${revision}.pcm`);
      await run([
        "-i",
        output,
        "-vn",
        "-map",
        "0:a:0",
        "-c:a",
        "pcm_s16le",
        "-ar",
        "48000",
        "-ac",
        "1",
        "-f",
        "s16le",
        path,
      ]);
      return readFile(path);
    };
    await render();
    const muted = await pcm(0);
    const originalPcm = join(directory, "original.pcm");
    await run([
      "-i",
      source,
      "-vn",
      "-map",
      "0:a:0",
      "-c:a",
      "pcm_s16le",
      "-ar",
      "48000",
      "-ac",
      "1",
      "-f",
      "s16le",
      originalPcm,
    ]);
    const originalBytes = await readFile(originalPcm);
    expect(
      amplitude(originalBytes, 0.75, 440),
      `source bytes ${originalBytes.length}`,
    ).toBeGreaterThan(0.05);
    for (const at of [0.25, 0.75, 1.25, 1.75, 2.75])
      expect(
        amplitude(muted, at, 440),
        `original speech at ${at}`,
      ).toBeGreaterThan(0.05);
    expect(amplitude(muted, 1.25, 880)).toBeLessThan(0.003);
    expect(amplitude(muted, 1.25, 1320)).toBeLessThan(0.003);
    const frameFile = join(directory, "layered.png");
    await run([
      "-ss",
      "1.25",
      "-i",
      join(root, workspace.id, `${clip.id}.r0.mp4`),
      "-frames:v",
      "1",
      frameFile,
    ]);
    const { data, info } = await sharp(frameFile)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixel = (x: number, y: number) =>
      Array.from(
        data.subarray(
          (Math.floor(y * info.height) * info.width +
            Math.floor(x * info.width)) *
            info.channels,
          (Math.floor(y * info.height) * info.width +
            Math.floor(x * info.width)) *
            info.channels +
            3,
        ),
      );
    expect(pixel(0.02, 0.02)[1]).toBeGreaterThan(pixel(0.02, 0.02)[0]! + 40);
    expect(pixel(0.18, 0.24)[0]).toBeGreaterThan(pixel(0.18, 0.24)[1]! + 60);
    let captionPixels = 0;
    for (
      let y = Math.floor(info.height * 0.45);
      y < Math.floor(info.height * 0.65);
      y++
    )
      for (let x = 0; x < info.width; x++) {
        const at = (y * info.width + x) * info.channels;
        if (data[at]! > 210 && data[at + 1]! > 210 && data[at + 2]! > 210)
          captionPixels++;
      }
    expect(captionPixels).toBeGreaterThan(4);
    const movingFrames: Buffer[] = [];
    for (const [index, time] of [1.1, 1.8].entries()) {
      const path = join(directory, `motion-${index}.png`);
      await run([
        "-ss",
        String(time),
        "-i",
        join(root, workspace.id, `${clip.id}.r0.mp4`),
        "-frames:v",
        "1",
        path,
      ]);
      movingFrames.push(
        await sharp(path)
          .extract({
            left: Math.floor(info.width * 0.45),
            top: Math.floor(info.height * 0.25),
            width: Math.floor(info.width * 0.2),
            height: Math.floor(info.height * 0.15),
          })
          .removeAlpha()
          .raw()
          .toBuffer(),
      );
    }
    const difference =
      movingFrames[0]!.reduce(
        (sum, value, index) => sum + Math.abs(value - movingFrames[1]![index]!),
        0,
      ) / movingFrames[0]!.length;
    expect(difference).toBeGreaterThan(5);
    const squareFrame = join(directory, "square-full-frame.png");
    await run([
      "-ss",
      "2.75",
      "-i",
      join(root, workspace.id, `${clip.id}.r0.mp4`),
      "-frames:v",
      "1",
      squareFrame,
    ]);
    const squarePixel = await sharp(squareFrame)
      .extract({ left: 1, top: 1, width: 1, height: 1 })
      .removeAlpha()
      .raw()
      .toBuffer();
    expect(squarePixel[2]!).toBeGreaterThan(squarePixel[0]! + 60);
    expect(squarePixel[2]!).toBeGreaterThan(squarePixel[1]! + 60);
    const audible = structuredClone(clip.edit!.visuals);
    audible[0]!.video!.muted = false;
    audible[1]!.video!.muted = false;
    await apply(audible);
    await render();
    const mixed = await pcm(1);
    expect(amplitude(mixed, 1.25, 880)).toBeGreaterThan(0.025);
    expect(amplitude(mixed, 1.25, 1320)).toBeGreaterThan(0.012);
    expect(amplitude(mixed, 0.25, 880)).toBeLessThan(0.003);
    expect(amplitude(mixed, 2.75, 1320)).toBeLessThan(0.003);
    expect(amplitude(mixed, 1.25, 440)).toBeGreaterThan(0.05);
    const saved = await json(`${api}/draft`, {});
    expect(saved.state).toBe("saved");
    const before = JSON.stringify(
      compileOwnerOverlay(
        clip.base!,
        clip.edit,
        clip.assets,
        clip.audioAssets,
        clip.videoAssets,
      ),
    );
    const calls = media.mock.calls.length;
    await host.close();
    host = createOwnerHost(options);
    port = await listenOwner(host.server);
    const reopened = ownerWorkspaceSchema.parse(
      await json(`/api/drafts/${saved.id}/open`, {}),
    );
    const restored = ownerClipListSchema.parse(
      await json(`/api/workspace/${reopened.id}/clips`),
    ).clips[0]!;
    expect(
      JSON.stringify(
        compileOwnerOverlay(
          restored.base!,
          restored.edit,
          restored.assets,
          restored.audioAssets,
          restored.videoAssets,
        ),
      ),
    ).toBe(before);
    expect(media).toHaveBeenCalledTimes(calls);
    expect(plan).toHaveBeenCalledTimes(0);
    expect(image).toHaveBeenCalledTimes(0);
    expect(
      (await readdir(join(root, reopened.id))).filter((name) =>
        name.startsWith("overlay-"),
      ),
    ).toEqual([]);
  } finally {
    await host.close();
    await worker.close();
    expect(host.server.listening).toBe(false);
    expect(worker.server.listening).toBe(false);
    expect(await readdir(root)).toEqual([]);
    await rm(directory, { recursive: true, force: true });
  }
}, 300_000);
