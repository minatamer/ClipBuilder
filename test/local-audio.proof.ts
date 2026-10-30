import { expect, it } from "vitest";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { normalizeOwnerAudio } from "../apps/renderer/local/audio-media.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import {
  resolveOwnerAudioCues,
  ownerAudioDuration,
  type OwnerAudioAsset,
} from "../packages/contracts/local/audio.ts";
import type { OwnerOverlay } from "../packages/contracts/local/clips.ts";

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
async function cleanup(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel ||
    isAbsolute(rel) ||
    !rel.startsWith("clipbuilder-audio-proof-") ||
    rel.startsWith("..")
  )
    throw new Error("invalid_audio_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("normalizes bounded music formats and mixes speech, continuous music, hook-only sound and repeated timed effects into a real MP4", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-audio-proof-")),
    storage = join(root, "workspaces");
  await mkdir(storage);
  const files = new WorkspaceFiles(storage),
    workspaceId = await files.create(),
    tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(120000);
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-y", "-v", "error", ...args],
      signal,
    );
  try {
    const assets: OwnerAudioAsset[] = [];
    for (const [format, codec, frequency] of [
      ["wav", "pcm_s16le", 880],
      ["mp3", "libmp3lame", 1760],
      ["m4a", "aac", 660],
    ] as const) {
      const input = join(root, `synthetic.${format}`);
      await run([
        "-f",
        "lavfi",
        "-i",
        `sine=frequency=${frequency}:sample_rate=48000:duration=0.473`,
        "-c:a",
        codec,
        input,
      ]);
      const assetId = randomUUID();
      await writeFile(
        await files.audio(workspaceId, assetId, true),
        await readFile(input),
      );
      const result = await normalizeOwnerAudio(
        storage,
        {
          operation: "normalize-audio",
          workspaceId,
          assetId,
          jobId: randomUUID(),
        },
        tools,
        signal,
      );
      expect(result.asset.frames).toBeGreaterThanOrEqual(14);
      expect(result.asset.durationMs).toBe(
        Math.round((result.asset.frames * 1000) / 30),
      );
      const normalized = await readFile(
        await files.audio(workspaceId, assetId),
      );
      expect(createHash("sha256").update(normalized).digest("hex")).toBe(
        result.asset.digest,
      );
      assets.push(result.asset);
    }
    const source = await files.file(workspaceId, "source.mp4");
    await run([
      "-f",
      "lavfi",
      "-i",
      "color=gray:s=240x320:r=30:d=3",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=3",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      source,
    ]);
    const metadata = await inspectOwnerSource(source, tools, signal),
      clipId = randomUUID();
    const overlay: OwnerOverlay = {
      version: 1,
      frames: 90,
      hook: { startFrame: 30, endFrame: 60 },
      captions: [],
      visuals: [],
      audio: {
        originalVolume: 100,
        assets,
        cues: [
          {
            id: randomUUID(),
            source: { kind: "upload", id: assets[0]!.id },
            placement: "video",
            startFrame: 0,
            endFrame: 90,
            offsetFrame: 0,
            volume: 30,
            loop: true,
          },
          {
            id: randomUUID(),
            source: { kind: "upload", id: assets[1]!.id },
            placement: "hook",
            startFrame: 0,
            endFrame: 30,
            offsetFrame: 0,
            volume: 35,
            loop: true,
          },
          {
            id: randomUUID(),
            source: { kind: "builtin", id: "ding" },
            placement: "clip",
            startFrame: 45,
            endFrame: 65,
            offsetFrame: 0,
            volume: 35,
            loop: false,
          },
        ],
      },
    };
    const bundle = await prepareLocalOverlayFixture(root);
    const result = await renderOwnerClip(
      {
        root: storage,
        tools,
        bundle,
        chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        cache: new Map(),
      },
      {
        operation: "clip",
        workspaceId,
        clipId,
        jobId: randomUUID(),
        renderRevision: 0,
        cut: { startFrame: 0, endFrame: 90 },
        fingerprint: metadata.fingerprint,
        overlay,
      },
      signal,
    );
    expect(result.frames).toBe(120);
    const output = await files.output(workspaceId, clipId, 0),
      pcmPath = join(root, "mixed.pcm");
    await run([
      "-i",
      output,
      "-vn",
      "-ar",
      "48000",
      "-ac",
      "1",
      "-f",
      "s16le",
      pcmPath,
    ]);
    const pcm = await readFile(pcmPath);
    for (const time of [0.25, 1.25, 2.25, 3.25]) {
      expect(amplitude(pcm, time, 440)).toBeGreaterThan(0.08);
      expect(amplitude(pcm, time, 880)).toBeGreaterThan(0.02);
    }
    expect(amplitude(pcm, 0.25, 1760)).toBeGreaterThan(0.025);
    expect(amplitude(pcm, 1.1, 1760)).toBeLessThan(0.003);
    expect(amplitude(pcm, 3.25, 1760)).toBeLessThan(0.003);
    expect(amplitude(pcm, 0.62, 1320)).toBeGreaterThan(0.01);
    expect(amplitude(pcm, 2.62, 1320)).toBeGreaterThan(0.01);
    expect(amplitude(pcm, 1.25, 1320)).toBeLessThan(0.003);
    let peak = 0;
    for (let i = 0; i < pcm.length; i += 2)
      peak = Math.max(peak, Math.abs(pcm.readInt16LE(i)));
    expect(peak).toBeLessThan(32767);
    const probe = JSON.parse(
      await runOwnedProcess(
        tools.ffprobe,
        [
          "-v",
          "error",
          "-select_streams",
          "v:0",
          "-show_entries",
          "stream=height,avg_frame_rate",
          "-of",
          "json",
          output,
        ],
        signal,
      ),
    ).streams[0];
    expect(probe.height).toBe(320);
    expect(probe.avg_frame_rate).toBe("30/1");
    for (const [index, soundId] of (
      ["pop", "discord", "riser", "rising-tension"] as const
    ).entries()) {
      const hookSound = soundId === "riser" || soundId === "rising-tension";
      const visualId = randomUUID();
      const assetId = randomUUID(),
        picture = await sharp({
          create: { width: 32, height: 32, channels: 3, background: "#00ff00" },
        })
          .png()
          .toBuffer();
      await writeFile(await files.asset(workspaceId, assetId, "png"), picture);
      const pointOverlay: OwnerOverlay = {
        version: 1,
        frames: 90,
        ...(hookSound ? { hook: { startFrame: 30, endFrame: 60 } } : {}),
        captions: [],
        visuals: hookSound
          ? []
          : [
              {
                id: visualId,
                assetId,
                digest: createHash("sha256").update(picture).digest("hex"),
                origin: "synthetic",
                format: "png",
                startFrame: 30,
                endFrame: 60,
                fit: "contain",
                box: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
              },
            ],
        audio: {
          originalVolume: 0,
          assets: [],
          cues: resolveOwnerAudioCues(
            [
              {
                id: randomUUID(),
                ...(!hookSound ? { visualId } : {}),
                source: { kind: "builtin", id: soundId },
                placement: hookSound ? "hook" : "clip",
                startFrame: 0,
                endFrame: Math.round(
                  ownerAudioDuration({ kind: "builtin", id: soundId }, []) * 30,
                ),
                offsetFrame: hookSound
                  ? Math.round(
                      ownerAudioDuration({ kind: "builtin", id: soundId }, []) *
                        30,
                    ) - 30
                  : 0,
                volume: 35,
                loop: false,
              },
            ],
            [{ id: visualId, startFrame: 30 }],
            90,
          ),
        },
      };
      await renderOwnerClip(
        {
          root: storage,
          tools,
          bundle,
          chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
          cache: new Map(),
        },
        {
          operation: "clip",
          workspaceId,
          clipId,
          jobId: randomUUID(),
          renderRevision: 2 + index,
          cut: { startFrame: 0, endFrame: 90 },
          fingerprint: metadata.fingerprint,
          overlay: pointOverlay,
        },
        signal,
      );
      const pointPcm = join(root, `${soundId}.pcm`);
      await run([
        "-i",
        await files.output(workspaceId, clipId, 2 + index),
        "-vn",
        "-ar",
        "48000",
        "-ac",
        "1",
        "-f",
        "s16le",
        pointPcm,
      ]);
      const samples = await readFile(pointPcm),
        rms = (time: number) => {
          let energy = 0;
          const start = Math.round(time * 48000);
          for (let index = 0; index < 1200; index++)
            energy += (samples.readInt16LE((start + index) * 2) / 32768) ** 2;
          return Math.sqrt(energy / 1200);
        };
      const seconds = hookSound
        ? 1
        : ownerAudioDuration({ kind: "builtin", id: soundId }, []);
      const peak = Math.max(
        ...Array.from({ length: Math.floor(seconds / 0.025) }, (_, tick) =>
          rms((hookSound ? 0 : 1) + tick * 0.025),
        ),
      );
      expect(peak).toBeGreaterThan(0.01);
      for (const time of hookSound
        ? [1.1, 1.5, 2, 3.5]
        : [0.5, soundId === "pop" ? 1.4 : 1.6, 2, 2.7])
        expect(rms(time)).toBeLessThan(0.001);
    }
    // A nonexistent source is rejected before a final output can be produced.
    overlay.audio!.cues[0]!.source = { kind: "upload", id: randomUUID() };
    await expect(
      renderOwnerClip(
        {
          root: storage,
          tools,
          bundle,
          chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
          cache: new Map(),
        },
        {
          operation: "clip",
          workspaceId,
          clipId,
          jobId: randomUUID(),
          renderRevision: 1,
          cut: { startFrame: 0, endFrame: 90 },
          fingerprint: metadata.fingerprint,
          overlay,
        },
        signal,
      ),
    ).rejects.toThrow();
    await expect(
      stat(await files.output(workspaceId, clipId, 1)),
    ).rejects.toThrow();
    const invalidId = randomUUID();
    await writeFile(
      await files.audio(workspaceId, invalidId, true),
      await readFile(source),
    );
    await expect(
      normalizeOwnerAudio(
        storage,
        {
          operation: "normalize-audio",
          workspaceId,
          assetId: invalidId,
          jobId: randomUUID(),
        },
        tools,
        signal,
      ),
    ).rejects.toThrow();
    await expect(
      stat(await files.audio(workspaceId, invalidId)),
    ).rejects.toThrow();
  } finally {
    await files.close();
    await cleanup(root);
  }
}, 130000);
