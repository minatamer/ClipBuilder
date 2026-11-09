import { expect, it } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerOverlaySchema } from "../packages/contracts/local/clips.ts";
import {
  rasterizeOwnerOverlay,
  normalizeOwnerOverlayPng,
} from "../apps/renderer/local/rasterize-overlay.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";

it("presents each exact trimmed B-roll frame before native surface capture", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-video-presentation-"),
  );
  const signal = AbortSignal.timeout(60_000);
  try {
    const tools = await ownerNativeTools(resolve("."));
    const video = join(directory, "generated.mp4");
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
        "nullsrc=s=96x96:r=30:d=1,geq=lum='16+mod(N*17,200)':cb=128:cr=128",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        video,
      ],
      signal,
    );
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-i",
        video,
        "-fps_mode",
        "passthrough",
        "-threads",
        "2",
        join(directory, "source-%03d.png"),
      ],
      signal,
    );
    const bytes = await readFile(video),
      assetId = randomUUID(),
      digest = createHash("sha256").update(bytes).digest("hex");
    const overlay = ownerOverlaySchema.parse({
      version: 1,
      frames: 12,
      captions: [],
      visuals: [
        {
          id: randomUUID(),
          assetId,
          digest,
          startFrame: 1,
          endFrame: 12,
          presentation: "full-frame",
          box: { x: 0, y: 0, width: 1, height: 1 },
          fit: "cover",
          video: { offsetFrame: 3, volume: 100, muted: true },
          entrance: "none",
          exit: "none",
          origin: "owner-supplied",
        },
      ],
      videoAssets: [
        {
          id: assetId,
          digest,
          width: 96,
          height: 96,
          frames: 30,
          bytes: bytes.length,
          hasAudio: false,
        },
      ],
    });
    const frames = join(directory, "frames");
    await mkdir(frames);
    const bundle = await prepareLocalOverlayFixture(directory);
    await rasterizeOwnerOverlay(
      {
        bundle,
        overlay,
        assets: {},
        videos: { [assetId]: { file: video, bytes: bytes.length } },
        chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        frames,
      },
      signal,
    );
    const center = async (file: string) =>
      Array.from(
        await sharp(file)
          .extract({ left: 40, top: 40, width: 8, height: 8 })
          .resize(1, 1)
          .removeAlpha()
          .raw()
          .toBuffer(),
      );
    const source = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        center(join(directory, `source-${String(i + 1).padStart(3, "0")}.png`)),
      ),
    );
    for (let frame = 1; frame < 12; frame++) {
      const sampled = Array.from(
        await sharp(join(frames, `${String(frame).padStart(6, "0")}.png`))
          .extract({ left: 500, top: 900, width: 16, height: 16 })
          .resize(1, 1)
          .removeAlpha()
          .raw()
          .toBuffer(),
      );
      const differences = source.map((rgb) =>
        rgb.reduce(
          (sum, channel, i) => sum + Math.abs(channel - sampled[i]!),
          0,
        ),
      );
      const chosen = differences.indexOf(Math.min(...differences));
      expect(chosen, `presentation ${frame}, source ${frame + 2}`).toBe(
        frame + 2,
      );
      expect(differences[chosen]).toBeLessThanOrEqual(6);
    }
    const output = join(directory, "muxed.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-i",
        video,
        "-framerate",
        "30",
        "-i",
        join(frames, "%06d.png"),
        "-filter_complex",
        "[0:v]fps=fps=30:start_time=0:round=near,trim=end_frame=12,setpts=PTS-STARTPTS,scale=54:96[source];[1:v]fps=fps=30:start_time=0:round=up,tpad=stop_mode=clone:stop_duration=0.033333333,trim=end_frame=12,setpts=PTS-STARTPTS,scale=54:96[art];[source][art]overlay=0:0:shortest=1:format=auto,format=yuv420p[v]",
        "-filter_complex_threads",
        "2",
        "-map",
        "[v]",
        "-frames:v",
        "12",
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-crf",
        "18",
        "-threads",
        "2",
        output,
      ],
      signal,
    );
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-i",
        output,
        "-fps_mode",
        "passthrough",
        "-threads",
        "2",
        join(directory, "final-%03d.png"),
      ],
      signal,
    );
    for (let frame = 1; frame < 12; frame++) {
      const sampled = await center(
        join(directory, `final-${String(frame + 1).padStart(3, "0")}.png`),
      );
      const differences = source
        .slice(3, 14)
        .map((rgb) =>
          rgb.reduce(
            (sum, channel, i) => sum + Math.abs(channel - sampled[i]!),
            0,
          ),
        );
      expect(
        differences.indexOf(Math.min(...differences)) + 3,
        `muxed ${frame}`,
      ).toBe(frame + 2);
    }
    // Chromium PNGs lose alpha while a full-frame visual is opaque, then regain
    // it. Exercise that actual format transition far into the same stream.
    const mixed = join(directory, "mixed");
    await mkdir(mixed);
    const color = (n: number) => ({
      r: 20 + ((n * 17) % 200),
      g: 20 + ((n * 37) % 200),
      b: 20 + ((n * 53) % 200),
    });
    for (let n = 0; n < 240; n++) {
      const opaque = n >= 30 && n < 210;
      const png = await sharp({
        create: {
          width: 54,
          height: 96,
          channels: opaque ? 3 : 4,
          background: opaque ? color(n) : { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .png()
        .toBuffer();
      expect(png[25]).toBe(opaque ? 2 : 6);
      const normalized = await normalizeOwnerOverlayPng(png);
      expect(normalized[25]).toBe(6);
      await writeFile(
        join(mixed, `${String(n).padStart(6, "0")}.png`),
        normalized,
      );
    }
    expect((await readFile(join(mixed, "000029.png")))[25]).toBe(6);
    expect((await readFile(join(mixed, "000030.png")))[25]).toBe(6);
    const mixedOutput = join(directory, "mixed.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-copyts",
        "-i",
        video,
        "-framerate",
        "30",
        "-threads",
        "2",
        "-i",
        join(mixed, "%06d.png"),
        "-filter_complex",
        `[0:v]fps=fps=30:start_time=0:round=near,tpad=stop_mode=clone:stop_duration=7,trim=end_frame=240,setpts=PTS-STARTPTS,scale=54:96[source];[1:v]fps=fps=30:start_time=0:round=up,tpad=stop_mode=clone:stop_duration=0.033333333,trim=end_frame=240,setpts=PTS-STARTPTS[art];[source][art]overlay=0:0:shortest=1:format=auto,format=yuv420p[v]`,
        "-filter_complex_threads",
        "2",
        "-map",
        "[v]",
        "-frames:v",
        "240",
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-crf",
        "18",
        "-threads",
        "2",
        mixedOutput,
      ],
      signal,
    );
    const checks = [30, 31, 116, 186, 209];
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-i",
        mixedOutput,
        "-vf",
        `select='${checks.map((n) => `eq(n,${n})`).join("+")}'`,
        "-fps_mode",
        "passthrough",
        "-threads",
        "2",
        join(directory, "check-%03d.png"),
      ],
      signal,
    );
    for (const [index, n] of checks.entries()) {
      const actual = await center(
        join(directory, `check-${String(index + 1).padStart(3, "0")}.png`),
      );
      const expected = Object.values(color(n));
      expect(
        Math.max(
          ...expected.map((channel, i) => Math.abs(channel - actual[i]!)),
        ),
        `opaque boundary frame ${n}: ${JSON.stringify({ actual, expected })}`,
      ).toBeLessThanOrEqual(8);
    }
  } finally {
    expect(dirname(await realpath(directory))).toBe(await realpath(tmpdir()));
    await rm(directory, { recursive: true, force: true });
  }
}, 90_000);
