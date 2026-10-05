import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  writeFile,
  rm,
  readdir,
  lstat,
  symlink,
  stat,
} from "node:fs/promises";
import { join, resolve, dirname, basename } from "node:path";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { deflateSync } from "node:zlib";

const fixtureOnly = process.argv.includes("--fixture-only");
if (!fixtureOnly) assert.equal(process.platform, "linux");
const root = resolve("."),
  renderer = join(root, "apps/renderer");
const { NodeMediaPipeline } = await import(
  pathToFileURL(join(renderer, "dist/media/node-pipeline.js"))
);
const { runOwnedProcess } = await import(
  pathToFileURL(join(renderer, "dist/media/process-runner.js"))
);
const { validateOutput, probeMedia } = await import(
  pathToFileURL(join(renderer, "dist/media/inspection.js"))
);
const { assertDecodedAudio } = await import(
  pathToFileURL(join(renderer, "dist/media/decoded-audio.js"))
);
const { measureScratchBytes } = await import(
  pathToFileURL(join(renderer, "dist/media/scratch-usage.js"))
);
const require = createRequire(join(renderer, "package.json"));
const { TEMPORARY_MEDIA_LIMITS } = await import("@clipbuilder/contracts");
const localCompositor =
  process.platform === "win32"
    ? dirname(
        createRequire(require.resolve("@remotion/renderer")).resolve(
          "@remotion/compositor-win32-x64-msvc/package.json",
        ),
      )
    : "/opt/clipbuilder/compositor";
const signal = AbortSignal.timeout(120000),
  tools = {
    ffmpeg: join(
      localCompositor,
      "ffmpeg" + (process.platform === "win32" ? ".exe" : ""),
    ),
    ffprobe: join(
      localCompositor,
      "ffprobe" + (process.platform === "win32" ? ".exe" : ""),
    ),
    chromium: "/opt/clipbuilder/chromium/chrome-headless-shell",
    bundle: join(renderer, "bundle"),
  };
const directory = await mkdtemp(join(tmpdir(), "clipbuilder-linux-proof-"));
let monitor,
  pending,
  monitoringFailure,
  peakScratchBytes = 0,
  linuxSpecialEntryObserved = false;

async function hasSpecialEntry(path) {
  try {
    for (const name of await readdir(path)) {
      const child = join(path, name);
      try {
        const info = await lstat(child);
        if (info.isSymbolicLink() || info.isSocket()) return true;
        if (info.isDirectory() && (await hasSpecialEntry(child))) return true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return false;
}

async function ownedProcessCount() {
  let count = 0;
  for (const pid of await readdir("/proc")) {
    if (!/^\d+$/.test(pid) || Number(pid) === process.pid) continue;
    try {
      if (
        (await readFile("/proc/" + pid + "/cmdline", "utf8")).includes(
          directory,
        )
      )
        count++;
    } catch (error) {
      if (!["ENOENT", "ESRCH", "EACCES"].includes(error.code)) throw error;
    }
  }
  return count;
}

async function audioOnset(input, name, durationMs) {
  const decoded = join(directory, name + ".wav");
  await runOwnedProcess(
    tools.ffmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-i",
      input,
      "-map",
      "0:a:0",
      "-vn",
      "-af",
      "aresample=async=1:first_pts=0",
      "-c:a",
      "pcm_s16le",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-f",
      "wav",
      decoded,
    ],
    signal,
  );
  const bytes = await readFile(decoded);
  assertDecodedAudio(bytes, durationMs);
  let offset = 12;
  while (offset < bytes.length) {
    const size = bytes.readUInt32LE(offset + 4),
      start = offset + 8;
    if (bytes.toString("latin1", offset, offset + 4) === "data") {
      for (let frame = 0; frame + 640 <= size; frame += 640) {
        let energy = 0;
        for (let sample = frame; sample < frame + 640; sample += 2)
          energy += (bytes.readInt16LE(start + sample) / 32768) ** 2;
        if (Math.sqrt(energy / 320) > 0.01) return frame / 32;
      }
    }
    offset = start + size + (size % 2);
  }
  throw new Error("synthetic_tone_missing");
}

let stage = "fixture";
async function verify() {
  try {
    const rgb = join(directory, "pattern.png"),
      pcm = join(directory, "tone.pcm"),
      input = join(directory, "source.mp4"),
      output = join(directory, "output.mp4");
    const pixels = Buffer.alloc((320 * 3 + 1) * 180);
    for (let y = 0; y < 180; y++) {
      for (let x = 0; x < 320; x++) {
        const offset = y * (320 * 3 + 1) + 1 + x * 3;
        pixels[offset] = 40;
        pixels[offset + 1] = 90;
        pixels[offset + 2] = 160;
      }
    }
    function chunk(type, data) {
      const body = Buffer.concat([Buffer.from(type), data]),
        length = Buffer.alloc(4),
        checksum = Buffer.alloc(4);
      length.writeUInt32BE(data.length);
      let crc = 0xffffffff;
      for (const byte of body) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++)
          crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
      checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
      return Buffer.concat([length, body, checksum]);
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(320, 0);
    header.writeUInt32BE(180, 4);
    header[8] = 8;
    header[9] = 2;
    const samples = Buffer.alloc(16000 * 15 * 2);
    for (let sample = 19200; sample < 240000; sample++)
      samples.writeInt16LE(
        Math.round(Math.sin((sample * 440 * Math.PI * 2) / 16000) * 8000),
        sample * 2,
      );
    await writeFile(
      rgb,
      Buffer.concat([
        Buffer.from("89504e470d0a1a0a", "hex"),
        chunk("IHDR", header),
        chunk("IDAT", deflateSync(pixels)),
        chunk("IEND", Buffer.alloc(0)),
      ]),
    );
    await writeFile(pcm, samples);
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "image2",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-i",
        rgb,
        "-f",
        "s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        "-i",
        pcm,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-t",
        "15",
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
    assert.equal(source.durationMs, 15000);
    stage = "audio-extraction";
    const audio = join(directory, "analysis.m4a"),
      audioStarted = performance.now();
    await pipeline.audio(input, audio, signal);
    const audioExtractionMs = Math.round(performance.now() - audioStarted),
      audioProfile = await probeMedia(audio, tools.ffprobe, signal, "audio"),
      audioBytes = (await stat(audio)).size;
    assert.equal(audioProfile.streams.length, 1);
    assert.equal(audioProfile.streams[0].codec_type, "audio");
    assert.ok(
      audioBytes > 0 && audioBytes <= TEMPORARY_MEDIA_LIMITS.proxyBytes,
    );
    const sourceOnsetMs = await audioOnset(
        input,
        "source-decoded",
        source.durationMs,
      ),
      audioOnsetMs = await audioOnset(
        audio,
        "audio-decoded",
        source.durationMs,
      );
    assert.ok(Math.abs(sourceOnsetMs - 1200) <= 100);
    assert.ok(Math.abs(sourceOnsetMs - audioOnsetMs) <= 100);
    if (fixtureOnly) {
      process.stdout.write(
        JSON.stringify({
          synthetic: true,
          sourceDurationMs: source.durationMs,
          audioBytes,
          audioExtractionMs,
          sourceOnsetMs,
          audioOnsetMs,
          audioOnly: true,
          aiCalls: 0,
        }) + "\n",
      );
      return;
    }
    await symlink("synthetic-host-1234", join(directory, "SingletonLock"));
    const manifest = {
      version: 2,
      source: {
        fingerprint: source.fingerprint,
        width: source.width,
        height: source.height,
        durationMs: source.durationMs,
      },
      range: { startMs: 1000, endMs: 11000 },
      output: { width: 1080, height: 1920, fps: 30 },
      focus: [{ mode: "wide", startMs: 0, endMs: 10000 }],
      captions: [
        { startMs: 0, endMs: 10000, text: "Synthetic Linux verification" },
      ],
      cards: [],
    };
    monitor = setInterval(() => {
      if (pending) return;
      pending = Promise.all([
        measureScratchBytes(directory),
        hasSpecialEntry(directory),
      ])
        .then(([bytes, special]) => {
          peakScratchBytes = Math.max(peakScratchBytes, bytes);
          linuxSpecialEntryObserved ||= special;
        })
        .catch((error) => {
          monitoringFailure = error;
        })
        .finally(() => {
          pending = undefined;
        });
    }, 100);
    stage = "render";
    await pipeline.render(input, output, manifest, directory, signal);
    stage = "output-validation";
    const validated = await validateOutput(
      output,
      tools.ffprobe,
      tools.ffmpeg,
      10000,
      signal,
    );
    const cancelDirectory = join(directory, "cancel");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(cancelDirectory);
    stage = "cancel";
    const controller = new AbortController();
    const canceled = pipeline.render(
      input,
      join(cancelDirectory, "output.mp4"),
      manifest,
      cancelDirectory,
      controller.signal,
    );
    const result = canceled.then(
      () => false,
      () => true,
    );
    const timer = setTimeout(() => controller.abort(), 2000);
    try {
      assert.equal(await result, true);
      assert.equal(controller.signal.aborted, true);
    } finally {
      clearTimeout(timer);
    }
    clearInterval(monitor);
    await pending;
    assert.equal(monitoringFailure, undefined);
    assert.equal(linuxSpecialEntryObserved, true);
    assert.equal(await ownedProcessCount(), 0);
    assert.ok(peakScratchBytes < 2 * 1024 * 1024 * 1024);
    await writeFile(
      "/tmp/clipbuilder-linux-media-proof.json",
      JSON.stringify({
        synthetic: true,
        sourceDurationMs: source.durationMs,
        audioDurationMs: Math.round(audioProfile.format.duration * 1000),
        audioBytes,
        audioExtractionMs,
        sourceOnsetMs,
        audioOnsetMs,
        audioOnly: true,
        outputDurationMs: validated.durationMs,
        outputBytes: validated.bytes,
        linuxSpecialEntryObserved,
        peakScratchBytes,
        canceled: true,
        ownedProcessesRemaining: 0,
        aiCalls: 0,
      }),
    );
    process.stdout.write(
      "Linux synthetic render, scratch scan and process cancellation verified.\n",
    );
  } finally {
    if (monitor) clearInterval(monitor);
    await pending;
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith("clipbuilder-linux-proof-"));
    await rm(directory, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 100,
    });
  }
}
await verify().catch(() => {
  process.stderr.write(
    "Linux media verification failed during " + stage + ".\n",
  );
  process.exitCode = 1;
});
