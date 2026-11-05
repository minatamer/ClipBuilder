import { expect, it } from "vitest";
import { randomUUID, createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import type { OwnerOverlay } from "../packages/contracts/local/clips.ts";

it("exports independent Hook captions/pictures/look/camera/original audio at a one-frame native join", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-hook-content-"));
  const tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(90000);
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-y", "-v", "error", ...args],
      signal,
    );
  try {
    const workspaceId = randomUUID(),
      clipId = randomUUID(),
      directory = join(root, workspaceId);
    await mkdir(directory);
    const source = join(directory, "source.mp4");
    await run([
      "-f",
      "lavfi",
      "-i",
      "color=black:s=240x320:r=30000/1001:d=2,drawbox=x=120:y=0:w=120:h=320:color=green:t=fill",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=2",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      source,
    ]);
    const metadata = await inspectOwnerSource(source, tools, signal),
      assetId = randomUUID();
    const picture = await sharp({
      create: { width: 100, height: 100, channels: 3, background: "yellow" },
    })
      .png()
      .toBuffer();
    // Native assets use only their admitted fixed path.
    await writeFile(join(directory, `${assetId}.png`), picture);
    const hook = { startFrame: 31, endFrame: 32 },
      focus = defaultOwnerFocus(metadata, 60);
    const caption = {
      startMs: 0,
      endMs: 2000,
      text: "COPY",
      lines: ["COPY"],
      wordIds: ["w_000001"],
      wordCues: [{ wordId: "w_000001", text: "COPY", startMs: 0, endMs: 2000 }],
    };
    const visual = {
      id: randomUUID(),
      assetId,
      digest: createHash("sha256").update(picture).digest("hex"),
      format: "png" as const,
      origin: "synthetic" as const,
      startFrame: 0,
      endFrame: 60,
      box: { x: 0.1, y: 0.7, width: 0.2, height: 0.2 },
      fit: "contain" as const,
    };
    const overlay: OwnerOverlay = {
      version: 1,
      frames: 60,
      hook,
      focus,
      captions: [caption],
      captionStyle: { ...OWNER_CAPTION_PRESETS.clean, color: "#0000ff" },
      visuals: [visual],
      audio: { originalVolume: 100, cues: [], assets: [] },
    };
    overlay.hookContent = {
      ...overlay,
      visuals: [
        {
          ...visual,
          startFrame: hook.startFrame,
          endFrame: hook.endFrame,
          box: { ...visual.box, x: 0.7 },
        },
      ],
      captions: [
        {
          ...caption,
          startMs: Math.floor((hook.startFrame * 1000) / 30),
          endMs: Math.ceil((hook.endFrame * 1000) / 30),
          wordCues: caption.wordCues.map((word) => ({
            ...word,
            startMs: Math.floor((hook.startFrame * 1000) / 30),
            endMs: Math.ceil((hook.endFrame * 1000) / 30),
          })),
        },
      ],
      captionStyle: { ...OWNER_CAPTION_PRESETS.clean, color: "#ff0000" },
      videoLook: { preset: "warm", strength: 10 },
      focus: {
        ...focus,
        shots: focus.shots.map((s) => ({ ...s, centerX: 0.75, zoom: 1.2 })),
      },
      audio: { originalVolume: 0, cues: [], assets: [] },
    };
    const result = await renderOwnerClip(
      {
        root,
        tools,
        bundle: await prepareLocalOverlayFixture(root),
        chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        cache: new Map(),
      },
      {
        operation: "clip",
        workspaceId,
        clipId,
        jobId: randomUUID(),
        renderRevision: 0,
        cut: { startFrame: 0, endFrame: 60 },
        fingerprint: metadata.fingerprint,
        overlay,
      },
      signal,
    );
    expect(result.frames).toBe(61);
    const output = join(directory, `${clipId}.r0.mp4`),
      raw = join(directory, "join.rgb");
    await run([
      "-i",
      output,
      "-vf",
      "select=lte(n\\,1)",
      "-fps_mode",
      "passthrough",
      "-frames:v",
      "2",
      "-pix_fmt",
      "rgb24",
      "-f",
      "rawvideo",
      raw,
    ]);
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
    const pixels = await readFile(raw),
      size = probe.width * probe.height * 3;
    const counts = (frame: number) => {
      let red = 0,
        blue = 0,
        left = 0,
        right = 0;
      for (let y = 0; y < probe.height; y++)
        for (let x = 0; x < probe.width; x++) {
          const n = frame * size + (y * probe.width + x) * 3,
            r = pixels[n]!,
            g = pixels[n + 1]!,
            b = pixels[n + 2]!;
          if (r > 140 && r > b * 2 && r > g * 2) red++;
          if (b > 140 && b > r * 2 && b > g * 2) blue++;
          if (r > 140 && g > 140 && b < 100) {
            if (x < probe.width / 2) left++;
            else right++;
          }
        }
      return { red, blue, left, right };
    };
    expect(pixels.length).toBe(size * 2);
    const cameraPixel = (frame: number) =>
      pixels[
        frame * size +
          (Math.floor(probe.height * 0.1) * probe.width +
            Math.floor(probe.width * 0.35)) *
            3 +
          1
      ]!;
    expect(cameraPixel(0)).toBeGreaterThan(60);
    expect(cameraPixel(1)).toBeLessThan(20);
    const first = counts(0),
      second = counts(1);
    expect(first.red).toBeGreaterThan(30);
    expect(first.blue).toBe(0);
    expect(first.right).toBeGreaterThan(200);
    expect(first.left).toBe(0);
    expect(second.blue).toBeGreaterThan(30);
    expect(second.red).toBe(0);
    expect(second.left).toBeGreaterThan(200);
    expect(second.right).toBe(0);
    const pcm = join(directory, "audio.pcm");
    await run([
      "-i",
      output,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "48000",
      "-f",
      "s16le",
      pcm,
    ]);
    const audio = await readFile(pcm);
    const rms = (start: number, end: number) => {
      let sum = 0;
      for (let n = Math.round(start * 48000); n < Math.round(end * 48000); n++)
        sum += (audio.readInt16LE(n * 2) / 32768) ** 2;
      return Math.sqrt(sum / ((end - start) * 48000));
    };
    expect(rms(0.005, 0.02)).toBeLessThan(0.01);
    expect(rms(0.08, 0.18)).toBeGreaterThan(0.05);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const [index, name] of [
      [0, "hook"],
      [1, "main"],
    ] as const)
      await sharp(pixels.subarray(index * size, (index + 1) * size), {
        raw: { width: probe.width, height: probe.height, channels: 3 },
      })
        .png()
        .toFile(resolve(`.local-build/evidence/cl220-native-${name}.png`));
  } finally {
    await clearHookScratch(root);
  }
}, 100000);

async function clearHookScratch(root: string) {
  const owned = relative(await realpath(tmpdir()), await realpath(root));
  if (
    !owned ||
    owned.startsWith("..") ||
    isAbsolute(owned) ||
    !owned.startsWith("clipbuilder-hook-content-")
  )
    throw Error("invalid_hook_proof_cleanup");
  await rm(root, { recursive: true, force: true });
}
