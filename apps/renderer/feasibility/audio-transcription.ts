import "../../../test/deterministic.environment.js";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { basename, dirname, join, resolve } from "node:path";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { NodeMediaPipeline } from "../dist/media/node-pipeline.js";
import { probeMedia } from "../dist/media/inspection.js";
import { runOwnedProcess } from "../dist/media/process-runner.js";
import { TEMPORARY_MEDIA_LIMITS } from "@clipbuilder/contracts";

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
  chromium: "unused",
  bundle: "unused",
};
const fixtureFfmpeg = process.env.FIXTURE_FFMPEG_PATH;
if (!fixtureFfmpeg)
  throw Error("Synthetic fixture FFmpeg is required; no tool is downloaded.");
const signal = AbortSignal.timeout(180000);
const directory = await mkdtemp(join(tmpdir(), "clipbuilder-synthetic-audio-"));
const records: {
  codec: string;
  delayMs: number;
  durationMs: number;
  sourceOnsetMs: number;
  audioOnsetMs: number;
  bytes: number;
  elapsedMs: number;
}[] = [];
let stage = "fixture_preparation",
  fixtureIndex = -1;
let maximumDurationProof: {
  durationMs: number;
  bytes: number;
  elapsedMs: number;
} | null = null;
try {
  const frames = join(directory, "frames.rgb"),
    tone = join(directory, "tone.pcm");
  await writeFile(frames, Buffer.alloc(320 * 180 * 3 * 450, 100));
  const pcm = Buffer.alloc(48000 * 2 * 12);
  for (let sample = 0; sample < pcm.length / 2; sample++)
    pcm.writeInt16LE(
      Math.round(6000 * Math.sin((sample * 2 * Math.PI * 440) / 48000)),
      sample * 2,
    );
  await writeFile(tone, pcm);
  const pipeline = new NodeMediaPipeline(tools);
  async function onset(path: string, name: string) {
    const decoded = join(directory, `${name}.pcm`);
    await runOwnedProcess(
      fixtureFfmpeg!,
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
        decoded,
      ],
      signal,
    );
    const bytes = await readFile(decoded);
    for (let offset = 0; offset + 640 <= bytes.length; offset += 640) {
      let energy = 0;
      for (let sample = offset; sample < offset + 640; sample += 2)
        energy += (bytes.readInt16LE(sample) / 32768) ** 2;
      if (Math.sqrt(energy / 320) > 0.01) return offset / 32;
    }
    throw Error("Synthetic tone missing");
  }
  for (const [index, fixture] of [
    { codec: "aac", encoder: "aac", delayMs: 0 },
    { codec: "aac", encoder: "aac", delayMs: 1200 },
    { codec: "opus", encoder: "libopus", delayMs: 1800 },
    { codec: "vorbis", encoder: "libvorbis", delayMs: 600 },
  ].entries()) {
    fixtureIndex = index;
    stage = "fixture_encode";
    const input = join(directory, `source-${index}.mp4`),
      audio = join(directory, `audio-${index}.m4a`);
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
        frames,
        "-itsoffset",
        String(fixture.delayMs / 1000),
        "-f",
        "s16le",
        "-ar",
        "48000",
        "-ac",
        "1",
        "-i",
        tone,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        fixture.encoder,
        "-threads",
        "2",
        "-t",
        "15",
        input,
      ],
      signal,
    );
    stage = "source_inspection";
    const source = await pipeline.inspect(input, signal);
    assert.equal(source.profile!.audioCodec, fixture.codec);
    assert.equal(source.durationMs, 15000);
    stage = "audio_extraction";
    const started = performance.now();
    await pipeline.audio(input, audio, signal);
    const elapsedMs = Math.round(performance.now() - started);
    stage = "audio_inspection";
    const probe = await probeMedia(audio, tools.ffprobe, signal, "audio"),
      bytes = (await stat(audio)).size;
    assert.equal(probe.streams.length, 1);
    assert.equal(probe.streams[0]!.codec_name, "aac");
    assert.equal(probe.streams[0]!.sample_rate, 16000);
    assert.equal(probe.streams[0]!.channels, 1);
    assert.ok(
      Math.abs(probe.format.duration * 1000 - source.durationMs) <= 100,
    );
    assert.ok(bytes > 0 && bytes <= TEMPORARY_MEDIA_LIMITS.proxyBytes);
    stage = "audio_clock_comparison";
    const sourceOnsetMs = await onset(input, `source-${index}`),
      audioOnsetMs = await onset(audio, `audio-${index}`);
    assert.ok(Math.abs(sourceOnsetMs - audioOnsetMs) <= 100);
    records.push({
      codec: fixture.codec,
      delayMs: fixture.delayMs,
      durationMs: source.durationMs,
      sourceOnsetMs,
      audioOnsetMs,
      bytes,
      elapsedMs,
    });
  }
  stage = "maximum_duration_fixture";
  const maximumInput = join(directory, "maximum-source.mp4"),
    maximumAudio = join(directory, "maximum-audio.m4a");
  await runOwnedProcess(
    fixtureFfmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-stream_loop",
      "79",
      "-i",
      join(directory, "source-0.mp4"),
      "-map",
      "0:v:0",
      "-map",
      "0:a:0",
      "-c",
      "copy",
      "-t",
      "1199.5",
      maximumInput,
    ],
    signal,
  );
  const maximumSource = await pipeline.inspect(maximumInput, signal);
  assert.ok(
    maximumSource.durationMs >= 1199000 && maximumSource.durationMs <= 1200000,
  );
  stage = "maximum_duration_extraction";
  const maximumStarted = performance.now();
  await pipeline.audio(maximumInput, maximumAudio, signal);
  const maximumBytes = (await stat(maximumAudio)).size;
  assert.ok(maximumBytes <= TEMPORARY_MEDIA_LIMITS.proxyBytes);
  maximumDurationProof = {
    durationMs: maximumSource.durationMs,
    bytes: maximumBytes,
    elapsedMs: Math.round(performance.now() - maximumStarted),
  };
} catch (error) {
  process.stdout.write(
    JSON.stringify({
      fake: true,
      providerCalls: 0,
      failedStage: stage,
      fixtureIndex,
    }) + "\n",
  );
  throw error;
} finally {
  await removeSyntheticScratch(directory);
}
process.stdout.write(
  JSON.stringify({
    fake: true,
    providerCalls: 0,
    records,
    maximumDurationProof,
    scratchRemoved: true,
  }) + "\n",
);

async function removeSyntheticScratch(directory: string) {
  const absolute = resolve(directory);
  if (
    dirname(absolute) !== resolve(tmpdir()) ||
    !basename(absolute).startsWith("clipbuilder-synthetic-audio-")
  )
    throw Error("Invalid synthetic cleanup target");
  await rm(absolute, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 100,
  });
}
