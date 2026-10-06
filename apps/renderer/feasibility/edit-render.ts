import "../../../test/deterministic.environment.js";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, rm, stat, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { compositionManifestV3Schema } from "@clipbuilder/contracts";
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
const chromium = resolve(
  "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe",
);
const input = process.argv[2];
if (!input || basename(input) !== "synthetic-edit-input.mp4")
  throw new Error("synthetic-input-required");
for (const path of [input, ffmpeg, ffprobe, chromium]) await stat(path);
const directory = await mkdtemp(
  join(tmpdir(), "clipbuilder-edit-render-synthetic-"),
);
const signal = AbortSignal.timeout(180000);
try {
  const pipeline = new NodeMediaPipeline({
    ffmpeg,
    ffprobe,
    chromium,
    bundle: resolve("bundle"),
  });
  const source = await pipeline.inspect(input, signal);
  const proxy = join(directory, "proxy.mp4"),
    output = join(directory, "output.mp4");
  const manifest = compositionManifestV3Schema.parse({
    version: 3,
    source: {
      fingerprint: source.fingerprint,
      durationMs: source.durationMs,
      width: source.width,
      height: source.height,
    },
    range: { startMs: 500, endMs: 10500 },
    output: { width: 1080, height: 1920, fps: 30 },
    focus: [{ mode: "wide", reason: "initial", startMs: 0, endMs: 10000 }],
    captions: [
      {
        startMs: 0,
        endMs: 1800,
        text: "Clear spoken words",
        lines: ["Clear spoken words"],
        wordIds: ["w_000001", "w_000002", "w_000003"],
        wordCues: [
          { wordId: "w_000001", text: "Clear", startMs: 0, endMs: 500 },
          { wordId: "w_000002", text: "spoken", startMs: 700, endMs: 1200 },
          { wordId: "w_000003", text: "words", startMs: 1400, endMs: 1800 },
        ],
      },
    ],
    cards: [
      {
        origin: "transcript-fallback",
        kind: "statement",
        startMs: 2000,
        endMs: 4000,
        title: "Synthetic context",
        lines: ["One grounded visual"],
      },
    ],
  });
  await pipeline.proxy(input, proxy, signal, manifest.range);
  const proxyMetadata = await probeMedia(proxy, ffprobe, signal);
  assert.ok(Math.abs(proxyMetadata.format.duration - 10) < 0.1);
  process.stdout.write(
    JSON.stringify({
      proxyVerified: true,
      durationMs: 10000,
      sourceStartMs: 500,
      aiCalls: 0,
      cloudCalls: 0,
    }) + "\n",
  );
  await pipeline.render(input, output, manifest, directory, signal);
  const rendered = await probeMedia(output, ffprobe, signal);
  assert.ok(Math.abs(rendered.format.duration - 10) < 0.1);
  assert.equal(
    rendered.streams.find((s) => s.codec_type === "video")?.width,
    1080,
  );
  assert.equal(
    rendered.streams.find((s) => s.codec_type === "video")?.height,
    1920,
  );
  for (const [ms, name] of [
    [900, "caption"],
    [2500, "visual"],
    [9500, "tail"],
  ]) {
    const image = join(directory, `${name}.png`);
    await runOwnedProcess(
      ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-ss",
        String(ms / 1000),
        "-i",
        output,
        "-frames:v",
        "1",
        "-c:v",
        "png",
        "-threads",
        "1",
        image,
      ],
      signal,
    );
    assert.ok((await stat(image)).size > 24);
    if (process.argv[3])
      await copyFile(
        image,
        join(process.argv[3], `synthetic-render-${name}.png`),
      );
  }
  // Packaged production decoder proves non-empty audio and continuous output in
  // validateOutput. Frame/tone identity comparisons need the full fixture tools.
  assert.ok((await stat(output)).size > 1024);
  process.stdout.write(
    JSON.stringify({
      finalRenderVerified: true,
      captionFrameDecoded: true,
      visualFrameDecoded: true,
      durationMs: 10000,
      aiCalls: 0,
      cloudCalls: 0,
    }) + "\n",
  );
} finally {
  assert.ok(
    resolve(dirname(directory)) === resolve(tmpdir()) &&
      basename(directory).startsWith("clipbuilder-edit-render-synthetic-"),
  );
  await rm(directory, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 100,
  });
}
