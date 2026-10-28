// Opt-in, offline Linux benchmark. Bundle into scratch; never ship in an image.
import "../test/deterministic.environment.ts";
import assert from "node:assert/strict";
import net from "node:net";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  readdir,
  rm,
  stat,
  statfs,
  copyFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

assert.equal(process.platform, "linux");
assert.notEqual(process.getuid(), 0);
assert.equal(process.env.FAKE_MODE, "true");
assert.equal(process.env.PAID_DEMO_ENABLED, "false");
let externalAttempts = 0;
const realFetch = globalThis.fetch,
  connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const values = Array.isArray(args[0]) ? args[0] : args;
  const value = values[0];
  const host =
    typeof value === "object" && value !== null
      ? value.host
      : typeof value === "number"
        ? values[1]
        : undefined;
  if (host && !["127.0.0.1", "localhost", "::1"].includes(host)) {
    externalAttempts++;
    throw new Error("external_socket_forbidden");
  }
  return Reflect.apply(connect, this, args);
};
globalThis.fetch = (input, init) => {
  if (
    !["127.0.0.1", "localhost", "[::1]"].includes(
      new URL(String(input)).hostname,
    )
  ) {
    externalAttempts++;
    throw new Error("external_fetch_forbidden");
  }
  return realFetch(input, init);
};
const [
  { localWorkerPort },
  { nativeEnvironment },
  { ownerMediaJobSchema, OWNER_FPS },
  { defaultOwnerFocus },
  { ownerOutputProfile },
  { OWNER_CAPTION_PRESETS },
  { OWNER_SOCIAL_TEXT_PRESETS },
  { PUBLIC_LIMITS },
] = await Promise.all([
  import("../apps/backend/local/worker-port.ts"),
  import("../apps/backend/local/local-mode.ts"),
  import("../packages/contracts/local/index.ts"),
  import("../packages/contracts/local/focus.ts"),
  import("../apps/renderer/local/export-profile.ts"),
  import("../packages/contracts/local/editor.ts"),
  import("../packages/contracts/local/text-style.ts"),
  import("../packages/contracts/src/constants.ts"),
]);
const run = promisify(execFile);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fixtures = [
  { name: "hd30", width: 1920, height: 1080, fps: 30 },
  { name: "landscape4k60", width: 3840, height: 2160, fps: 60 },
  { name: "portrait4k60", width: 2160, height: 3840, fps: 60 },
];
const hash = async (file) => {
  const digest = createHash("sha256");
  for await (const bytes of createReadStream(file)) digest.update(bytes);
  return digest.digest("hex");
};
const ffmpeg = async (args, timeout = 660000) =>
  run(
    "/usr/bin/ffmpeg",
    ["-nostdin", "-v", "error", "-threads", "2", ...args],
    { timeout, killSignal: "SIGKILL", maxBuffer: 2 * 1024 ** 2 },
  );
const emit = (value) => process.stdout.write(JSON.stringify(value) + "\n");

if (process.argv[2] === "generate") {
  for (const fixture of fixtures) {
    const before = performance.now();
    await ffmpeg([
      "-y",
      "-f",
      "lavfi",
      "-i",
      `testsrc2=size=${fixture.width}x${fixture.height}:rate=${fixture.fps}`,
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000",
      "-t",
      "61",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "28",
      "-maxrate",
      "32M",
      "-bufsize",
      "64M",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-ac",
      "2",
      "-threads",
      "4",
      "-movflags",
      "+faststart",
      join("/fixtures", fixture.name + ".mp4"),
    ]);
    emit({
      event: "fixture",
      ...fixture,
      seconds: (performance.now() - before) / 1000,
      bytes: (await stat(join("/fixtures", fixture.name + ".mp4"))).size,
    });
  }
  await ffmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=size=640x360:rate=1",
    "-frames:v",
    "1",
    "-threads",
    "1",
    "/fixtures/picture.png",
  ]);
}
if (process.argv[2] !== "generate") {
  assert.equal(process.argv[2], "run");
  const duration = Number(process.argv[4] ?? 60);
  assert.ok([12, 60].includes(duration));
  const constantFocus = process.argv[5] === "constant";
  assert.ok([undefined, "constant", "dynamic"].includes(process.argv[5]));
  const selected =
    process.argv[3] && process.argv[3] !== "all"
      ? fixtures.filter((f) => f.name === process.argv[3])
      : fixtures;
  assert.ok(selected.length > 0);
  const clipCount = Number(process.argv[6] ?? 1);
  assert.ok([1, 3].includes(clipCount));
  assert.ok(clipCount === 1 || (duration === 12 && selected.length === 1));
  const archive = process.argv[7] === "archive";
  assert.ok([undefined, "archive", "discard"].includes(process.argv[7]));
  const batchWorkspace = randomUUID();
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-native-bench-"));
  const root = join(directory, "workspaces");
  await mkdir(root);
  const token = randomBytes(32).toString("hex"),
    state = join(directory, "worker.json");
  await writeFile(
    state,
    JSON.stringify({
      root,
      workerToken: token,
      tools: { ffmpeg: "/usr/bin/ffmpeg", ffprobe: "/usr/bin/ffprobe" },
      chromium: "/usr/bin/chromium",
      overlayBundle: "/app/media/editing-overlay",
    }),
    { mode: 0o600 },
  );
  const worker = spawn(
    process.execPath,
    ["/app/media/dist/editing-worker.js"],
    {
      stdio: ["ignore", "ignore", "ignore", "ipc"],
      env: { ...nativeEnvironment(directory), CLIPBUILDER_LOCAL_STATE: state },
    },
  );
  const exited = new Promise((resolve) => worker.once("close", resolve));
  const native = localWorkerPort(4200, token, undefined, {
    run: (_name, action) => action(),
    failure: () => {},
  });
  let peakMemory = 0,
    peakScratch = 0,
    monitoring,
    phase = "startup";
  let exportStart, rasterStart, encodingStart, activeWorkspace, activeClip;
  let monitorError;
  const cpu = async () =>
    Object.fromEntries(
      (await readFile("/sys/fs/cgroup/cpu.stat", "utf8"))
        .trim()
        .split("\n")
        .map((line) => line.split(" ").map((v, i) => (i ? Number(v) : v))),
    );
  async function sample() {
    const [memory, disk, entries] = await Promise.all([
      readFile("/sys/fs/cgroup/memory.current", "utf8"),
      statfs(directory),
      activeWorkspace ? readdir(activeWorkspace) : [],
    ]);
    peakMemory = Math.max(peakMemory, Number(memory));
    // tmpfs allocated blocks count hardlinked PNGs once, without scanning frames.
    peakScratch = Math.max(
      peakScratch,
      (disk.blocks - disk.bfree) * disk.bsize,
    );
    if (
      exportStart &&
      !rasterStart &&
      entries.some((name) => name.startsWith("overlay-"))
    )
      rasterStart = performance.now();
    if (
      exportStart &&
      !encodingStart &&
      entries.includes(activeClip + ".r0.mp4.partial.mp4")
    )
      encodingStart = performance.now();
  }
  const monitor = setInterval(() => {
    if (!monitoring)
      monitoring = sample()
        .catch((error) => {
          monitorError = error;
        })
        .finally(() => {
          monitoring = undefined;
        });
  }, 250);
  try {
    const deadline = Date.now() + 15000;
    while (true) {
      if (worker.exitCode !== null) throw new Error("worker_exited");
      const response = await fetch("http://127.0.0.1:4200/health", {
        headers: { Authorization: "Bearer " + token },
        signal: AbortSignal.timeout(1000),
      }).catch(() => undefined);
      if (response) {
        await response.body?.cancel();
        if (response.ok) break;
      }
      if (Date.now() > deadline) throw new Error("worker_startup_timeout");
      await pause(100);
    }
    emit({
      event: "started",
      memoryMax: (await readFile("/sys/fs/cgroup/memory.max", "utf8")).trim(),
      cpuMax: (await readFile("/sys/fs/cgroup/cpu.max", "utf8")).trim(),
      fake: true,
      providerCalls: 0,
      scratch: "tmpfs",
      outputsRetained: true,
      duration,
      constantFocus,
      clipCount,
      archive,
    });
    const jobs = selected.flatMap((fixture) =>
      Array.from({ length: clipCount }, () => fixture),
    );
    for (const [index, fixture] of jobs.entries()) {
      phase = fixture.name;
      const workspaceId = clipCount === 3 ? batchWorkspace : randomUUID(),
        clipId = randomUUID(),
        assetId = randomUUID();
      const workspace = join(root, workspaceId);
      if (clipCount === 1 || index === 0) {
        await mkdir(workspace);
        await copyFile(
          join("/fixtures", fixture.name + ".mp4"),
          join(workspace, "source.mp4"),
        );
      }
      await copyFile(
        "/fixtures/picture.png",
        join(workspace, assetId + ".png"),
      );
      const inspection = await native(
        { operation: "inspect", workspaceId },
        AbortSignal.timeout(30000),
      );
      const metadata = inspection.source;
      assert.ok(metadata);
      assert.ok(
        metadata.bytes <= PUBLIC_LIMITS.maxSourceBytes,
        "fixture_exceeds_hosted_upload_limit",
      );
      const frames = duration * OWNER_FPS;
      const focus = defaultOwnerFocus(metadata, frames);
      if (!constantFocus)
        focus.shots = [0, frames / 3, (2 * frames) / 3].map(
          (startFrame, index) => ({
            startFrame,
            endFrame: startFrame + frames / 3,
            personId: null,
            centerX: [0.25, 0.65, 0.45][index],
            centerY: 0.5,
            zoom: index === 1 ? 1.15 : 1,
            reason: "manual",
          }),
        );
      const captions = Array.from({ length: duration / 2 }, (_, index) => {
        const startMs = index * 2000;
        const words = ["Synthetic", "clip", "benchmark", String(index + 1)];
        const wordCues = words.map((text, word) => ({
          text,
          wordId: `w_${String(index * 4 + word + 1).padStart(6, "0")}`,
          startMs: startMs + word * 500,
          endMs: startMs + (word + 1) * 500,
        }));
        return {
          startMs,
          endMs: startMs + 2000,
          text: words.join(" "),
          lines: [words.join(" ")],
          wordIds: wordCues.map((w) => w.wordId),
          wordCues,
        };
      });
      const job = ownerMediaJobSchema.parse({
        operation: "clip",
        workspaceId,
        clipId,
        jobId: randomUUID(),
        renderRevision: 0,
        cut: {
          startFrame:
            (1 + (clipCount === 3 ? index * duration : 0)) * OWNER_FPS,
          endFrame:
            frames + (1 + (clipCount === 3 ? index * duration : 0)) * OWNER_FPS,
        },
        fingerprint: metadata.fingerprint,
        overlay: {
          version: 1,
          frames,
          focus,
          captions,
          captionStyle: { ...OWNER_CAPTION_PRESETS.tiktok, animation: "pop" },
          videoLook: { preset: "vivid", strength: 40 },
          texts: [
            {
              id: randomUUID(),
              text: "SYNTHETIC BENCHMARK",
              startFrame: 0,
              endFrame: frames,
              style: {
                ...OWNER_SOCIAL_TEXT_PRESETS["solid-block"],
                box: { x: 0.1, y: 0.1, width: 0.8, height: 0.12 },
              },
            },
          ],
          visuals: [
            {
              id: randomUUID(),
              assetId,
              digest: await hash(join(workspace, assetId + ".png")),
              format: "png",
              origin: "synthetic",
              startFrame: frames / 6,
              endFrame: frames / 3,
              fit: "cover",
              box: { x: 0.2, y: 0.3, width: 0.6, height: 0.25 },
              entrance: "slide",
              exit: "fade",
              animationFrames: 15,
            },
          ],
        },
      });
      await monitoring;
      peakMemory = 0;
      peakScratch = 0;
      await sample();
      const before = performance.now(),
        cpuBefore = await cpu();
      exportStart = before;
      activeWorkspace = workspace;
      activeClip = clipId;
      const ownCpuBefore = process.cpuUsage();
      rasterStart = undefined;
      encodingStart = undefined;
      emit({
        event: "export-start",
        name: fixture.name,
        batchIndex: index + 1,
        input: { ...fixture, bytes: metadata.bytes },
        expected: ownerOutputProfile(metadata, frames),
      });
      let result, failure, transportCode;
      try {
        result = await native(job, AbortSignal.timeout(650000));
      } catch (error) {
        failure = "native_export_failed";
        const code = error.cause?.code;
        if (typeof code === "string" && /^[A-Z_]{1,64}$/.test(code))
          transportCode = code;
      }
      const exportSeconds = (performance.now() - before) / 1000,
        cpuAfter = await cpu();
      await monitoring;
      await sample();
      if (monitorError) throw monitorError;
      const ownCpu = process.cpuUsage(ownCpuBefore);
      const metrics = {
        event: "export",
        name: fixture.name,
        batchIndex: index + 1,
        exportSeconds,
        cpuSeconds: (cpuAfter.usage_usec - cpuBefore.usage_usec) / 1e6,
        throttledSeconds:
          (cpuAfter.throttled_usec - cpuBefore.throttled_usec) / 1e6,
        peakMemory,
        peakScratch,
        instrumentationCpuSeconds: (ownCpu.user + ownCpu.system) / 1e6,
        previewSeconds: rasterStart ? (rasterStart - before) / 1000 : undefined,
        rasterSeconds:
          encodingStart && rasterStart
            ? (encodingStart - rasterStart) / 1000
            : undefined,
        encodingSeconds: encodingStart
          ? (performance.now() - encodingStart) / 1000
          : undefined,
        result,
        failure,
        transportCode,
      };
      emit(metrics);
      exportStart = undefined;
      activeWorkspace = undefined;
      if (failure) throw new Error(failure);
      const output = join(workspace, clipId + ".r0.mp4");
      const probe = JSON.parse(
        (
          await run(
            "/usr/bin/ffprobe",
            [
              "-v",
              "error",
              "-count_frames",
              "-show_entries",
              "stream=codec_name,width,height,avg_frame_rate,nb_read_frames,sample_rate,channels:format=duration,size",
              "-of",
              "json",
              output,
            ],
            { timeout: 120000 },
          )
        ).stdout,
      );
      const expected = ownerOutputProfile(metadata, frames),
        video = probe.streams.find((s) => s.codec_name === "h264");
      assert.equal(video.width, expected.width);
      assert.equal(video.height, expected.height);
      assert.equal(Number(video.nb_read_frames), expected.frames);
      const [n, d] = video.avg_frame_rate.split("/").map(Number);
      assert.equal(n / d, expected.fps);
      assert.equal(
        probe.streams.find((s) => s.codec_name === "aac").sample_rate,
        "48000",
      );
      assert.equal(
        probe.streams.find((s) => s.codec_name === "aac").channels,
        2,
      );
      const checksums = (
        await ffmpeg([
          "-i",
          output,
          "-map",
          "0:v:0",
          "-map",
          "0:a:0",
          "-c:v",
          "rawvideo",
          "-c:a",
          "pcm_s16le",
          "-f",
          "streamhash",
          "-hash",
          "sha256",
          "-",
        ])
      ).stdout.trim();
      assert.equal(
        await hash(join(workspace, "source.mp4")),
        metadata.fingerprint,
      );
      emit({
        event: "verified",
        name: fixture.name,
        batchIndex: index + 1,
        probe,
        checksums,
        memoryEvents: (
          await readFile("/sys/fs/cgroup/memory.events", "utf8")
        ).trim(),
      });
      // Optional private synthetic artifacts for pixel comparisons, after timing.
      if (archive)
        await copyFile(
          output,
          join("/results", `${fixture.name}-${index + 1}.mp4`),
        );
      // One current source, while prior previews/exports remain as retained load.
      if (clipCount === 1 || index === clipCount - 1)
        await rm(join(workspace, "source.mp4"));
    }
    assert.equal(externalAttempts, 0);
    emit({
      event: "complete",
      externalAttempts,
      providerCalls: 0,
      cgroupPeak: Number(await readFile("/sys/fs/cgroup/memory.peak", "utf8")),
    });
  } catch (error) {
    emit({ event: "failed", phase, code: error.message, externalAttempts });
    process.exitCode = 1;
  } finally {
    clearInterval(monitor);
    await monitoring;
    if (worker.exitCode === null && worker.connected) worker.send("stop");
    const timer = setTimeout(() => worker.kill("SIGKILL"), 5000);
    await exited;
    clearTimeout(timer);
    await rm(directory, { recursive: true, force: true });
  }
}
