import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { NodeMediaPipeline } from "../dist/media/node-pipeline.js";
import { probeMedia } from "../dist/media/inspection.js";
import { runOwnedProcess } from "../dist/media/process-runner.js";
const require = createRequire(import.meta.url);
const compositor = dirname(
  createRequire(require.resolve("@remotion/renderer")).resolve(
    `@remotion/compositor-${process.platform === "win32" ? "win32-x64-msvc" : "linux-x64-gnu"}/package.json`,
  ),
);
const suffix = process.platform === "win32" ? ".exe" : "";
const ffmpeg = join(compositor, `ffmpeg${suffix}`),
  ffprobe = join(compositor, `ffprobe${suffix}`);
const fixtureTool = process.env.FIXTURE_FFMPEG_PATH;
if (!fixtureTool) throw new Error("Approved fixture FFmpeg path is required.");
for (const tool of [ffmpeg, ffprobe, fixtureTool]) await stat(tool);
const directory = await mkdtemp(
  join(tmpdir(), "clipbuilder-selected-synthetic-"),
);
const signal = AbortSignal.timeout(60000);
try {
  const source = join(directory, "source.mp4"),
    proxy = join(directory, "selected.mp4"),
    pcm = join(directory, "selected.pcm");
  await runOwnedProcess(
    fixtureTool,
    [
      "-nostdin",
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=320x180:rate=30:duration=15",
      "-itsoffset",
      "1.2",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=13.8",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
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
    signal,
  );
  const pipeline = new NodeMediaPipeline({
    ffmpeg,
    ffprobe,
    chromium: "unused",
    bundle: "unused",
  });
  await pipeline.proxy(source, proxy, signal, { startMs: 500, endMs: 10500 });
  const metadata = await probeMedia(proxy, ffprobe, signal),
    bytes = (await stat(proxy)).size;
  assert.ok(Math.abs(metadata.format.duration - 10) <= 0.1);
  assert.ok(bytes <= 24 * 1024 * 1024);
  assert.equal(
    metadata.streams.find((stream) => stream.codec_type === "video")
      ?.codec_name,
    "h264",
  );
  assert.equal(
    metadata.streams.find((stream) => stream.codec_type === "audio")
      ?.codec_name,
    "aac",
  );
  await runOwnedProcess(
    fixtureTool,
    [
      "-nostdin",
      "-v",
      "error",
      "-i",
      proxy,
      "-map",
      "0:a:0",
      "-vn",
      "-af",
      "aresample=async=1:first_pts=0",
      "-f",
      "s16le",
      "-ac",
      "1",
      "-ar",
      "16000",
      pcm,
    ],
    signal,
  );
  const samples = await readFile(pcm);
  let onsetMs = -1;
  for (let offset = 0; offset + 640 <= samples.length; offset += 640) {
    let energy = 0;
    for (let sample = offset; sample < offset + 640; sample += 2)
      energy += (samples.readInt16LE(sample) / 32768) ** 2;
    if (Math.sqrt(energy / 320) > 0.01) {
      onsetMs = offset / 32;
      break;
    }
  }
  assert.ok(Math.abs(onsetMs - 700) <= 100);
  process.stdout.write(
    JSON.stringify({
      selectedMs: Math.round(metadata.format.duration * 1000),
      bytes,
      audioOnsetMs: onsetMs,
      aiCalls: 0,
      cloudCalls: 0,
    }) + "\n",
  );
} finally {
  await rm(directory, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 100,
  });
}
