import "../../../test/deterministic.environment.js";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { mkdtemp, readFile, rm, stat, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createWriteStream } from "node:fs";
import { once } from "node:events";
import { performance } from "node:perf_hooks";
import assert from "node:assert/strict";
import { compositionManifestV2Schema } from "@clipbuilder/contracts";
import { NodeMediaPipeline } from "../dist/media/node-pipeline.js";
import { runOwnedProcess } from "../dist/media/process-runner.js";
import { validateOutput, probeMedia } from "../dist/media/inspection.js";
const require = createRequire(import.meta.url);
const compositor = dirname(
  createRequire(require.resolve("@remotion/renderer")).resolve(
    `@remotion/compositor-${process.platform === "win32" ? "win32-x64-msvc" : "linux-x64-gnu"}/package.json`,
  ),
);
const extension = process.platform === "win32" ? ".exe" : "";
const tools = {
  ffmpeg: join(compositor, `ffmpeg${extension}`),
  ffprobe: join(compositor, `ffprobe${extension}`),
  chromium:
    process.env.CHROMIUM_PATH ??
    resolve(
      "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe",
    ),
  bundle: resolve("bundle"),
};
const fixtureFfmpeg = process.env.FIXTURE_FFMPEG_PATH ?? tools.ffmpeg;
for (const path of Object.values(tools)) await stat(path);
const directory = await mkdtemp(join(tmpdir(), "clipbuilder-synthetic-"));
const signal = AbortSignal.timeout(180_000),
  started = performance.now();
try {
  const input = join(directory, "source.mp4"),
    proxy = join(directory, "proxy.mp4"),
    output = join(directory, "output.mp4");
  const raw = join(directory, "pattern.rgb"),
    stream = createWriteStream(raw);
  for (let frame = 0; frame < 450; frame++) {
    const bytes = Buffer.alloc(320 * 180 * 3);
    for (let y = 0; y < 180; y++)
      for (let x = 0; x < 320; x++) {
        const offset = (y * 320 + x) * 3;
        bytes[offset] = x < 160 ? 220 : 30;
        bytes[offset + 1] = y < 90 ? 180 : 50;
        bytes[offset + 2] = (frame % 30) * 8;
      }
    if (!stream.write(bytes)) await once(stream, "drain");
  }
  stream.end();
  await once(stream, "close");
  await runOwnedProcess(
    fixtureFfmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-f",
      "rawvideo",
      "-pixel_format",
      "rgb24",
      "-video_size",
      "320x180",
      "-framerate",
      "30",
      "-i",
      raw,
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
      input,
    ],
    signal,
  );
  const pipeline = new NodeMediaPipeline(tools),
    source = await pipeline.inspect(input, signal);
  assert.equal(source.durationMs, 15_000);
  assert.equal(source.width, 320);
  assert.equal(source.height, 180);
  assert.ok(Math.abs(source.audioStartMs - 1200) < 100);
  await pipeline.proxy(input, proxy, signal);
  const manifest = compositionManifestV2Schema.parse({
    version: 2,
    source: {
      fingerprint: source.fingerprint,
      width: source.width,
      height: source.height,
      durationMs: source.durationMs,
    },
    range: { startMs: 1000, endMs: 11_000 },
    output: { width: 1080, height: 1920, fps: 30 },
    focus: [
      {
        mode: "speaker",
        startMs: 0,
        endMs: 5000,
        speaker: "Synthetic",
        confidence: 1,
        box: { x: 0.75, y: 0.4, width: 0.15, height: 0.3 },
      },
      { mode: "wide", startMs: 5000, endMs: 10_000 },
    ],
    captions: [{ startMs: 0, endMs: 10_000, text: "Synthetic caption" }],
    cards: [
      {
        startMs: 2000,
        endMs: 4000,
        kind: "statement",
        title: "Synthetic context",
        lines: ["Generated test pattern"],
      },
    ],
  });
  await pipeline.render(input, output, manifest, directory, signal);
  const result = await validateOutput(
    output,
    tools.ffprobe,
    tools.ffmpeg,
    10_000,
    signal,
  );
  async function onset(path: string, name: string) {
    const pcm = join(directory, `${name}.pcm`);
    await runOwnedProcess(
      fixtureFfmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-i",
        path,
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
    const bytes = await readFile(pcm);
    for (let offset = 0; offset + 640 <= bytes.length; offset += 640) {
      let energy = 0;
      for (let sample = offset; sample < offset + 640; sample += 2)
        energy += (bytes.readInt16LE(sample) / 32768) ** 2;
      if (Math.sqrt(energy / 320) > 0.01) return offset / 32;
    }
    throw Error("Synthetic audio missing");
  }
  const sourceOnset = await onset(input, "source"),
    proxyOnset = await onset(proxy, "proxy"),
    outputOnset = await onset(output, "output");
  assert.ok(Math.abs(sourceOnset - proxyOnset) <= 100);
  assert.ok(Math.abs(outputOnset - (sourceOnset - 1000)) <= 150);
  const vorbis = join(directory, "vorbis.webm"),
    vorbisProxy = join(directory, "vorbis-proxy.mp4");
  await runOwnedProcess(
    fixtureFfmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-i",
      input,
      "-map",
      "0:v:0",
      "-map",
      "0:a:0",
      "-c:v",
      "libvpx-vp9",
      "-deadline",
      "realtime",
      "-cpu-used",
      "8",
      "-b:v",
      "120k",
      "-c:a",
      "libvorbis",
      "-t",
      "15",
      vorbis,
    ],
    signal,
  );
  const vorbisMetadata = await probeMedia(vorbis, tools.ffprobe, signal);
  assert.equal(
    vorbisMetadata.streams.find((s) => s.codec_type === "audio")?.codec_name,
    "vorbis",
  );
  await pipeline.inspect(vorbis, signal);
  await pipeline.proxy(vorbis, vorbisProxy, signal);
  const vorbisOnset = await onset(vorbis, "vorbis"),
    vorbisProxyOnset = await onset(vorbisProxy, "vorbis-proxy");
  assert.ok(Math.abs(vorbisOnset - vorbisProxyOnset) <= 100);
  const preview = resolve("../../.pnpm-store/cl006-synthetic-preview.png");
  await runOwnedProcess(
    fixtureFfmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-ss",
      "3",
      "-i",
      output,
      "-frames:v",
      "1",
      "-vf",
      "scale=270:480",
      "-y",
      preview,
    ],
    signal,
  );
  const controller = new AbortController();
  const cancelDirectory = join(directory, "cancel");
  await mkdir(cancelDirectory);
  const canceled = pipeline.render(
    input,
    join(cancelDirectory, "output.mp4"),
    manifest,
    cancelDirectory,
    controller.signal,
  );
  const canceledResult = canceled.then(
    () => false,
    () => true,
  );
  const cancelTimer = setTimeout(() => controller.abort(), 2000);
  try {
    assert.equal(await canceledResult, true);
    assert.equal(controller.signal.aborted, true);
  } finally {
    clearTimeout(cancelTimer);
  }
  process.stdout.write(
    JSON.stringify({
      sourceMs: source.durationMs,
      sourceAudioStartMs: source.audioStartMs,
      sourceOnsetMs: sourceOnset,
      proxyOnsetMs: proxyOnset,
      outputOnsetMs: outputOnset,
      outputMs: result.durationMs,
      outputBytes: result.bytes,
      proxyBytes: (await stat(proxy)).size,
      wallSeconds: Math.round((performance.now() - started) / 1000),
      nativeCancel: "passed",
      vorbisDecodeProxy: "passed",
      vorbisOnsetMs: vorbisOnset,
      vorbisProxyOnsetMs: vorbisProxyOnset,
      aiCalls: 0,
      preview,
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
