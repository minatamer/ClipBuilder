import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  copyFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import {
  createSyntheticAcquisitionComponents,
  prepareOwnerAcquisition,
} from "../apps/renderer/local/acquisition-media.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import {
  ownerMediaResultSchema,
  type OwnerMediaJob,
} from "../packages/contracts/local/index.ts";
import type { OwnerAcquisitionDescriptor } from "../packages/contracts/local/acquisition.ts";
import { ownerAcquisitionNativeStageSchema } from "../packages/contracts/local/acquisition-profile.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";

declare global {
  function clipbuilderAcquisitionPlayback(
    bytes: string,
  ): Promise<{ width: number; height: number; time: number }>;
}
async function browserDecode(bytes: Buffer) {
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions: { headless: true },
    logLevel: "error",
  });
  try {
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    await page._client().send("Runtime.evaluate", {
      expression: `globalThis.clipbuilderAcquisitionPlayback = async (encoded) => {
      const raw = atob(encoded), bytes = Uint8Array.from(raw, value => value.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], {type: 'video/mp4'}));
      const video = document.createElement('video'); video.muted = true; document.body.append(video);
      let timer;
      try { return await new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error('synthetic_browser_decode_timeout')), 10000);
        video.onerror = () => reject(new Error('synthetic_browser_decode_failed'));
        video.onloadeddata = () => { video.currentTime = 0.5; };
        video.onseeked = () => resolve({width: video.videoWidth, height: video.videoHeight, time: video.currentTime});
        video.src = url; video.load();
      }); } finally { clearTimeout(timer); video.pause(); video.removeAttribute('src'); video.load(); video.remove(); URL.revokeObjectURL(url); }
    }`,
    });
    return await page.evaluate(
      (value) => globalThis.clipbuilderAcquisitionPlayback(value),
      bytes.toString("base64"),
    );
  } finally {
    await browser.close({ silent: true });
  }
}

const profile = (
  width: number,
  height: number,
): OwnerAcquisitionDescriptor => ({
  width,
  height,
  fps: 30,
  durationMs: 16000,
  videoCodec: "h264",
  audioCodec: "aac",
  audioChannels: 1,
  audioSampleRate: 48000,
});

it("preserves NTSC packets while validating rounded offered timing and rejects real clock changes", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const root = await mkdtemp(
    join(tmpdir(), "clipbuilder-rounded-acquisition-"),
  );
  const signal = AbortSignal.timeout(150000),
    id = randomUUID(),
    directory = join(root, id);
  await mkdir(directory);
  const actual = {
    ...profile(1280, 720),
    fps: 30000 / 1001,
    videoCodec: "vp9" as const,
    audioCodec: "opus" as const,
  };
  const offered = { ...actual, fps: 30, durationMs: 17000 };
  try {
    await createSyntheticAcquisitionComponents(root, id, actual, tools, signal);
    const backup = join(root, "backup");
    await mkdir(backup);
    for (const kind of ["video", "audio"])
      await copyFile(
        join(directory, "acquisition." + kind),
        join(backup, "acquisition." + kind),
      );
    const result = await prepareOwnerAcquisition(
      root,
      id,
      offered,
      tools,
      signal,
    );
    expect(result.source.fps).toBeCloseTo(30000 / 1001, 3);
    expect(result.source.durationMs).toBeGreaterThan(16000);
    expect(result.source.durationMs).toBeLessThan(16100);
    expect(result.descriptor.fps).toBe(result.source.fps);
    expect(result.descriptor.durationMs).toBe(result.source.durationMs);
    for (const changed of [
      { ...offered, fps: 25 },
      { ...offered, durationMs: 18000 },
    ]) {
      const rejected = randomUUID(),
        target = join(root, rejected);
      await mkdir(target);
      for (const kind of ["video", "audio"])
        await copyFile(
          join(backup, "acquisition." + kind),
          join(target, "acquisition." + kind),
        );
      await expect(
        prepareOwnerAcquisition(root, rejected, changed, tools, signal),
      ).rejects.toThrow("acquisition_selection_changed");
      expect(await readdir(target)).toEqual([]);
    }
  } finally {
    expect(resolve(root, "..")).toBe(resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  }
}, 150000);

it("generates and fully decodes exact synthetic 720p/1080p/2160p/portrait sources through the local worker without downloaded media", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const prefix = join(tmpdir(), "clipbuilder-owner-acquisition-proof-");
  const root = await mkdtemp(prefix),
    worker = createOwnerWorker({ root, token: "acquisition-proof", tools });
  if (!root.startsWith(prefix)) throw new Error("unowned_proof_scratch");
  const port = await listenOwner(worker.server);
  let calls = 0;
  const run = async (job: OwnerMediaJob) => {
    calls++;
    return ownerRequest(port, "/media", {
      method: "POST",
      headers: { Authorization: "Bearer acquisition-proof" },
      body: JSON.stringify(job),
    });
  };
  const observed = new Set<string>();
  const runObserved = async (job: OwnerMediaJob) => {
    let sampling = true;
    const requested = run(job);
    const samples = (async () => {
      while (sampling) {
        const sample = await ownerRequest(port, `/progress/${job.jobId}`, {
          headers: { Authorization: "Bearer acquisition-proof" },
        });
        if (sample.status === 200)
          observed.add(
            ownerAcquisitionNativeStageSchema.parse(
              JSON.parse(sample.body.toString()).stage,
            ),
          );
        else expect(sample.status).toBe(404);
        if (sampling) await new Promise<void>((done) => setTimeout(done, 25));
      }
    })();
    let sampleError: unknown;
    const drained = samples.catch((error: unknown) => {
      sampleError = error;
    });
    const result = await requested.finally(async () => {
      sampling = false;
      await drained;
    });
    if (sampleError) throw sampleError;
    return result;
  };
  try {
    for (const [width, height] of [
      [1280, 720],
      [1920, 1080],
      [3840, 2160],
      [1080, 1920],
    ]) {
      const workspaceId = randomUUID(),
        expected = profile(width!, height!);
      await mkdir(join(root, workspaceId));
      const response = await (width === 3840 ? runObserved : run)({
        operation: "synthesize-acquisition",
        workspaceId,
        jobId: randomUUID(),
        expected,
      });
      expect(response.status, `${width}x${height} synthetic acquisition`).toBe(
        200,
      );
      const result = ownerMediaResultSchema.parse(
        JSON.parse(response.body.toString()),
      );
      if (result.operation !== "synthesize-acquisition")
        throw new Error("wrong_native_result");
      expect(result.source).toMatchObject({
        width,
        height,
        fps: 30,
        durationMs: 16000,
      });
      expect(result.descriptor).toEqual(expected);
      expect(await readdir(join(root, workspaceId))).toEqual(["source.mp4"]);
      if (width === 1280) {
        const verified = await run({
          operation: "inspect-acquisition",
          workspaceId,
          jobId: randomUUID(),
          expected,
        });
        expect(verified.status).toBe(200);
        const offline = ownerMediaResultSchema.parse(
          JSON.parse(verified.body.toString()),
        );
        if (offline.operation !== "inspect-acquisition")
          throw new Error("wrong_native_result");
        expect(offline.source).toEqual(result.source);
        const changed = await run({
          operation: "inspect-acquisition",
          workspaceId,
          expected: profile(1920, 1080),
        });
        expect(changed.status).toBe(400);
        expect(await readdir(join(root, workspaceId))).toEqual(["source.mp4"]);
      }
    }
    expect(calls).toBe(6);
    expect(observed.has("inspecting")).toBe(true);
  } finally {
    await worker.close();
    expect(worker.server.listening).toBe(false);
    await rm(root, { recursive: true, force: true });
  }
}, 180000);

it("losslessly remuxes VP9/Opus WebM components and a combined H264/AAC source, rejecting changed descriptors before publication", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const prefix = join(tmpdir(), "clipbuilder-owner-acquisition-remux-");
  const root = await mkdtemp(prefix),
    signal = AbortSignal.timeout(150000);
  if (!root.startsWith(prefix)) throw new Error("unowned_proof_scratch");
  const expected: OwnerAcquisitionDescriptor = {
    ...profile(1280, 720),
    videoCodec: "vp9",
    audioCodec: "opus",
  };
  const workspaceId = randomUUID(),
    directory = join(root, workspaceId);
  await mkdir(directory);
  const packets = async (path: string, stream: "v:0" | "a:0") =>
    (
      await runOwnedProcess(
        tools.ffprobe,
        [
          "-v",
          "error",
          "-protocol_whitelist",
          "file,pipe",
          "-select_streams",
          stream,
          "-show_packets",
          "-show_entries",
          "packet=data_hash",
          "-show_data_hash",
          "sha256",
          "-of",
          "csv=p=0",
          path,
        ],
        signal,
        { maxStdout: 2 * 1024 ** 2 },
      )
    )
      .trim()
      .split(/\r?\n/)
      .map((row) => row.split(",")[0])
      .join("\n");
  try {
    await createSyntheticAcquisitionComponents(
      root,
      workspaceId,
      expected,
      tools,
      signal,
    );
    const videoPackets = await packets(
        join(directory, "acquisition.video"),
        "v:0",
      ),
      audioPackets = await packets(join(directory, "acquisition.audio"), "a:0");
    const merged = await prepareOwnerAcquisition(
      root,
      workspaceId,
      expected,
      tools,
      signal,
    );
    expect(merged.descriptor).toEqual(expected);
    expect(await packets(join(directory, "source.mp4"), "v:0")).toBe(
      videoPackets,
    );
    expect(await packets(join(directory, "source.mp4"), "a:0")).toBe(
      audioPackets,
    );
    expect(await readdir(directory)).toEqual(["source.mp4"]);
    const bytes = await readFile(join(directory, "source.mp4"));
    expect(bytes.length).toBe(merged.source.bytes);
    expect(await browserDecode(bytes)).toEqual({
      width: 1280,
      height: 720,
      time: 0.5,
    });

    const combinedId = randomUUID(),
      combinedDirectory = join(root, combinedId),
      combinedExpected = profile(1280, 720);
    await mkdir(combinedDirectory);
    await createSyntheticAcquisitionComponents(
      root,
      combinedId,
      combinedExpected,
      tools,
      signal,
    );
    const combinedTemporary = join(combinedDirectory, "combined.tmp.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        join(combinedDirectory, "acquisition.video"),
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        join(combinedDirectory, "acquisition.audio"),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c",
        "copy",
        "-f",
        "mp4",
        combinedTemporary,
      ],
      signal,
    );
    await rm(join(combinedDirectory, "acquisition.video"));
    await rm(join(combinedDirectory, "acquisition.audio"));
    await rename(
      combinedTemporary,
      join(combinedDirectory, "acquisition.video"),
    );
    const combined = await prepareOwnerAcquisition(
      root,
      combinedId,
      combinedExpected,
      tools,
      signal,
      true,
    );
    expect(combined.descriptor).toEqual(combinedExpected);
    expect(await readdir(combinedDirectory)).toEqual(["source.mp4"]);

    const rejectedId = randomUUID(),
      rejectedDirectory = join(root, rejectedId);
    await mkdir(rejectedDirectory);
    await createSyntheticAcquisitionComponents(
      root,
      rejectedId,
      profile(1280, 720),
      tools,
      signal,
    );
    await expect(
      prepareOwnerAcquisition(
        root,
        rejectedId,
        profile(1920, 1080),
        tools,
        signal,
      ),
    ).rejects.toThrow("acquisition_selection_changed");
    expect(await readdir(rejectedDirectory)).toEqual([]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 180000);
