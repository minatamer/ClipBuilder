import { expect, it } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createOwnerWorker } from "../apps/renderer/owner/server.ts";
import { ownerNativeTools } from "../apps/renderer/owner/native-tools.ts";
import { inspectOwnerSource } from "../apps/renderer/owner/media.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { probeMedia } from "../apps/renderer/src/media/inspection.ts";
import {
  OWNER_PROVIDER_MEDIA,
  ownerMediaResultSchema,
  type OwnerMediaJob,
} from "../packages/contracts/owner/index.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

const signal = () => AbortSignal.timeout(150_000);
const pause = () => new Promise<void>((done) => setTimeout(done, 15));

function frequency(bytes: Buffer, start: number, end: number) {
  let crossings = 0;
  for (let i = Math.ceil(start * 16_000) + 1; i < end * 16_000; i++) {
    if (bytes.readInt16LE((i - 1) * 2) <= 0 && bytes.readInt16LE(i * 2) > 0)
      crossings++;
  }
  return crossings / (end - start);
}

it("prepares full clock-normalized audio and only a fractional selected upright video through fixed native jobs", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const prefix = join(tmpdir(), "clipbuilder-owner-provider-proof-");
  const root = await mkdtemp(prefix);
  if (!root.startsWith(prefix)) throw new Error("unowned_proof_scratch");
  const workspaceId = randomUUID(),
    clipId = randomUUID();
  const directory = join(root, workspaceId);
  await mkdir(directory);
  const worker = createOwnerWorker({ root, token: "provider-proof", tools });
  const port = await listenOwner(worker.server);
  const run = (job: OwnerMediaJob) =>
    ownerRequest(port, "/media", {
      method: "POST",
      headers: { Authorization: "Bearer provider-proof" },
      body: JSON.stringify(job),
    });
  try {
    const source = join(directory, "source.mp4");
    const unrotated = join(directory, "synthetic-unrotated.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=red:size=960x640:rate=30:duration=2",
        "-f",
        "lavfi",
        "-i",
        "color=blue:size=960x640:rate=30:duration=2",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=500:sample_rate=16000:duration=2",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=1000:sample_rate=16000:duration=2",
        "-filter_complex_threads",
        "2",
        "-filter_complex",
        "[0:v][1:v]concat=n=2:v=1:a=0[v];[2:a][3:a]concat=n=2:v=0:a=1[a]",
        "-map",
        "[v]",
        "-map",
        "[a]",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "32k",
        "-threads",
        "2",
        "-output_ts_offset",
        "3.5",
        "-metadata",
        "title=synthetic private title",
        "-metadata:s:v:0",
        "title=synthetic private video title",
        "-metadata:s:a:0",
        "title=synthetic private audio title",
        unrotated,
      ],
      signal(),
    );
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-copyts",
        "-display_rotation:v:0",
        "90",
        "-i",
        unrotated,
        "-map",
        "0",
        "-c",
        "copy",
        source,
      ],
      signal(),
    );
    const admitted = await inspectOwnerSource(source, tools, signal());
    expect(admitted.durationMs).toBe(4000);
    expect(admitted.width).toBe(640);
    expect(admitted.height).toBe(960);
    const audioJob: OwnerMediaJob = {
      operation: "prepare-owner-audio",
      workspaceId,
      jobId: randomUUID(),
      fingerprint: admitted.fingerprint,
    };
    const videoJob: OwnerMediaJob = {
      operation: "prepare-owner-video",
      workspaceId,
      jobId: randomUUID(),
      clipId,
      fingerprint: admitted.fingerprint,
      cut: { startFrame: 61, endFrame: 92 },
    };
    for (const job of [audioJob, videoJob]) {
      const response = await run(job);
      expect(response.status).toBe(200);
      const result = ownerMediaResultSchema.parse(
        JSON.parse(response.body.toString()),
      );
      expect(["prepare-owner-audio", "prepare-owner-video"]).toContain(
        result.operation,
      );
      if (
        result.operation !== "prepare-owner-audio" &&
        result.operation !== "prepare-owner-video"
      )
        throw new Error("unexpected_provider_result");
      const file = join(
        directory,
        job.operation === "prepare-owner-audio"
          ? "provider.audio.m4a"
          : `${clipId}.provider.mp4`,
      );
      const bytes = await readFile(file);
      expect(result.bytes).toBe(bytes.length);
      expect(result.bytes).toBeLessThanOrEqual(OWNER_PROVIDER_MEDIA.bytes);
      expect(result.digest).toBe(
        createHash("sha256").update(bytes).digest("hex"),
      );
      expect(Object.keys(result).sort()).toEqual([
        "bytes",
        "digest",
        "durationMs",
        "operation",
      ]);
      expect(result.durationMs).toBe(
        job.operation === "prepare-owner-audio" ? 4000 : 1033,
      );
      const pcm = join(directory, "proof.pcm");
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-y",
          "-v",
          "error",
          "-i",
          file,
          "-map",
          "0:a:0",
          "-ac",
          "1",
          "-ar",
          "16000",
          "-f",
          "s16le",
          pcm,
        ],
        signal(),
      );
      const decoded = await readFile(pcm);
      expect(frequency(decoded, 0.2, 0.8)).toBeCloseTo(
        job.operation === "prepare-owner-audio" ? 500 : 1000,
        -1,
      );
      if (job.operation === "prepare-owner-audio")
        expect(frequency(decoded, 2.2, 2.8)).toBeCloseTo(1000, -1);
      else {
        const probe = await probeMedia(file, tools.ffprobe, signal());
        const video = probe.streams.find(
          (stream) => stream.codec_type === "video",
        );
        expect(video?.width).toBe(426);
        expect(video?.height).toBe(640);
        expect(video?.start_time).toBe(0);
        expect(video?.duration).toBeCloseTo(31 / 30, 5);
        const pixel = join(directory, "proof.rgb");
        for (const time of [0, 1]) {
          await runOwnedProcess(
            tools.ffmpeg,
            [
              "-nostdin",
              "-y",
              "-v",
              "error",
              "-ss",
              String(time),
              "-i",
              file,
              "-frames:v",
              "1",
              "-vf",
              "scale=1:1",
              "-pix_fmt",
              "rgb24",
              "-f",
              "rawvideo",
              pixel,
            ],
            signal(),
          );
          const color = await readFile(pixel);
          expect(color[0]).toBeLessThan(30);
          expect(color[2]).toBeGreaterThan(200);
        }
        const tags = await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            "-show_entries",
            "format_tags:stream_tags",
            "-of",
            "json",
            file,
          ],
          signal(),
        );
        expect(tags).not.toContain("synthetic private title");
        expect(tags).not.toContain("synthetic private video title");
        expect(tags).not.toContain("synthetic private audio title");
      }
    }
    expect(
      (await run({ ...videoJob, fingerprint: "0".repeat(64) })).status,
    ).toBe(400);
    expect(
      (await run({ ...videoJob, cut: { startFrame: 100, endFrame: 150 } }))
        .status,
    ).toBe(400);
    expect(await readdir(directory)).not.toContain(
      `${clipId}.provider.partial.mp4`,
    );
    expect(
      (await inspectOwnerSource(source, tools, signal())).fingerprint,
    ).toBe(admitted.fingerprint);
    expect(
      ownerMediaResultSchema.safeParse({
        operation: "prepare-owner-audio",
        bytes: OWNER_PROVIDER_MEDIA.bytes + 1,
        durationMs: 4000,
        digest: admitted.fingerprint,
      }).success,
    ).toBe(false);
  } finally {
    await worker.close();
    await rm(root, { recursive: true, force: true });
  }
}, 180_000);

it("keeps a sixty-minute audio input and five-minute selected proxy below the hard cap and cleans an in-flight canceled replacement", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const prefix = join(tmpdir(), "clipbuilder-owner-provider-proof-");
  const root = await mkdtemp(prefix);
  if (!root.startsWith(prefix)) throw new Error("unowned_proof_scratch");
  const workspaceId = randomUUID(),
    clipId = randomUUID();
  const directory = join(root, workspaceId);
  await mkdir(directory);
  const worker = createOwnerWorker({ root, token: "provider-proof", tools });
  const port = await listenOwner(worker.server);
  const run = (job: OwnerMediaJob, route = "/media") =>
    ownerRequest(port, route, {
      method: "POST",
      headers: { Authorization: "Bearer provider-proof" },
      body: JSON.stringify(job),
    });
  try {
    const source = join(directory, "source.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=blue:size=16x16:rate=12:duration=3600",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=500:sample_rate=16000:duration=3600",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "32k",
        "-threads",
        "2",
        source,
      ],
      signal(),
    );
    const admitted = await inspectOwnerSource(source, tools, signal());
    expect(admitted.durationMs).toBe(3_600_000);
    const job: OwnerMediaJob = {
      operation: "prepare-owner-audio",
      workspaceId,
      jobId: randomUUID(),
      fingerprint: admitted.fingerprint,
    };
    const response = await run(job);
    expect(response.status).toBe(200);
    const audio = ownerMediaResultSchema.parse(
      JSON.parse(response.body.toString()),
    );
    if (audio.operation !== "prepare-owner-audio")
      throw new Error("unexpected_provider_result");
    expect(audio.durationMs).toBe(3_600_000);
    expect(audio.bytes).toBeLessThanOrEqual(OWNER_PROVIDER_MEDIA.bytes);
    const videoResponse = await run({
      operation: "prepare-owner-video",
      workspaceId,
      jobId: randomUUID(),
      clipId,
      fingerprint: admitted.fingerprint,
      cut: { startFrame: 3300 * 30, endFrame: 3600 * 30 },
    });
    expect(videoResponse.status).toBe(200);
    const video = ownerMediaResultSchema.parse(
      JSON.parse(videoResponse.body.toString()),
    );
    if (video.operation !== "prepare-owner-video")
      throw new Error("unexpected_provider_result");
    expect(video.durationMs).toBe(300_000);
    expect(video.bytes).toBeLessThanOrEqual(OWNER_PROVIDER_MEDIA.bytes);
    const canceled = { ...job, jobId: randomUUID() };
    const pending = run(canceled);
    const partial = join(directory, "provider.audio.partial.m4a");
    let encoding = false;
    for (let attempt = 0; attempt < 1200; attempt++) {
      if (
        await lstat(partial).then(
          () => true,
          () => false,
        )
      ) {
        encoding = true;
        break;
      }
      await pause();
    }
    expect(encoding).toBe(true);
    const cancellationStarted = performance.now();
    expect((await run(canceled, "/cancel")).status).toBe(204);
    expect((await pending).status).toBe(400);
    const cancellationMs = Math.round(performance.now() - cancellationStarted);
    expect(await readdir(directory)).not.toContain(
      "provider.audio.partial.m4a",
    );
    expect(
      createHash("sha256")
        .update(await readFile(join(directory, "provider.audio.m4a")))
        .digest("hex"),
    ).toBe(audio.digest);
    expect(
      (await inspectOwnerSource(source, tools, signal())).fingerprint,
    ).toBe(admitted.fingerprint);
    await mkdir(resolve(".owner-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".owner-build/evidence/cl024-native-cancel.json"),
      JSON.stringify({
        encodingObserved: encoding,
        cancellationMs,
        audioBytes: audio.bytes,
        videoBytes: video.bytes,
        audioDurationMs: audio.durationMs,
        videoDurationMs: video.durationMs,
      }),
    );
  } finally {
    await worker.close();
    await rm(root, { recursive: true, force: true });
  }
}, 180_000);
