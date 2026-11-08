import { expect, it } from "vitest";
import { join, resolve } from "node:path";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/local/index.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import { resolveOwnerCapacity } from "../packages/contracts/local/capacity.ts";
import {
  ownerMediaResultSchema,
  type OwnerMediaJob,
} from "../packages/contracts/local/index.ts";

it("inspects a real synthetic two-hour local Gemini MP4 and extracts only the 41-second audio/video through worker HTTP", async () => {
  const tools = {
    ...(await ownerNativeTools(resolve("."))),
    capacity: resolveOwnerCapacity({ aiProvider: "gemini" }),
  };
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-gemini-duration-proof-"),
  );
  const workspaceId = randomUUID(),
    clipId = randomUUID(),
    root = join(directory, "workspaces");
  const folder = join(root, workspaceId);
  await mkdir(folder, { recursive: true });
  const signal = AbortSignal.timeout(150_000);
  const worker = createOwnerWorker({ root, token: "synthetic-worker", tools });
  try {
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=blue:size=160x90:rate=12:duration=7200",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=8000:cl=mono",
        "-t",
        "7200",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "8k",
        "-threads",
        "2",
        join(folder, "source.mp4"),
      ],
      signal,
    );
    const port = await listenOwner(worker.server);
    const run = async (job: OwnerMediaJob) => {
      const response = await ownerRequest(port, "/media", {
        method: "POST",
        headers: {
          Authorization: "Bearer synthetic-worker",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
        signal,
      });
      expect(response.status).toBe(200);
      return ownerMediaResultSchema.parse(JSON.parse(response.body.toString()));
    };
    const inspected = await run({ operation: "inspect", workspaceId });
    if (inspected.operation !== "inspect")
      throw Error("synthetic_inspection_missing");
    expect(inspected.source.durationMs).toBe(7_200_000);
    for (const operation of [
      "prepare-owner-audio",
      "prepare-owner-video",
    ] as const) {
      const result = await run({
        operation,
        workspaceId,
        clipId,
        jobId: randomUUID(),
        fingerprint: inspected.source.fingerprint,
        cut: { startFrame: 1920, endFrame: 3150 },
      });
      expect(result).toMatchObject({ operation, durationMs: 41_000 });
      expect("bytes" in result && result.bytes).toBeGreaterThan(0);
    }
  } finally {
    await worker.close();
    expect(worker.server.listening).toBe(false);
    await rm(directory, { recursive: true, force: true });
  }
}, 180_000);

it("encodes and decodes a real synthetic portrait MP4 offline, then drains all scratch/listeners", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-proof-"));
  const root = join(directory, "workspaces");
  await mkdir(root);
  const signal = AbortSignal.timeout(60_000);
  const worker = createOwnerWorker({ root, token: "proof-worker", tools });
  const workerPort = await listenOwner(worker.server);
  let calls = 0;
  const host = createOwnerHost({
    root,
    ui: directory,
    port: 0,
    token: "proof-host",
    analysis: fakeOwnerAnalysis,
    media: async (job) => {
      calls++;
      const response = await ownerRequest(workerPort, "/media", {
        method: "POST",
        headers: { Authorization: "Bearer proof-worker" },
        body: JSON.stringify(job),
      });
      expect(response.status).toBe(200);
      return JSON.parse(response.body.toString());
    },
  });
  try {
    const source = join(directory, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=blue:size=320x180:rate=30:duration=2",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=2",
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
    const port = await listenOwner(host.server);
    const auth = { Authorization: "Bearer proof-host" };
    const upload = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: await readFile(source),
    });
    expect(upload.status).toBe(200);
    const workspace = ownerWorkspaceSchema.parse(
      JSON.parse(upload.body.toString()),
    );
    expect(workspace.source.durationMs).toBe(2000);
    const analyzed = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/analysis`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceRevision: 0,
          policyRevision: 1,
          ranges: [{ id: crypto.randomUUID(), startMs: 200, endMs: 1200 }],
          aiDuration: { minMs: 30_000, maxMs: 30_000 },
          manualOnly: false,
        }),
      },
    );
    expect(analyzed.status).toBe(200);
    const result = ownerAnalysisSchema.parse(
      JSON.parse(analyzed.body.toString()),
    );
    expect(result.calls).toEqual({ transcription: 1, selection: 0 });
    const selection = {
      analysisId: result.id,
      policyRevision: result.inputs.policyRevision,
      momentId: result.manual[0]!.id,
    };
    for (let n = 0; n < 2; n++) {
      const rendered = await ownerRequest(
        port,
        `/api/workspace/${workspace.id}/portrait`,
        {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify(selection),
        },
      );
      expect(rendered.status).toBe(200);
      expect(JSON.parse(rendered.body.toString())).toMatchObject({
        durationMs: 1000,
        frames: 30,
      });
    }
    const output = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/portrait`,
      { headers: auth },
    );
    expect(output.status).toBe(200);
    expect(output.body.length).toBeGreaterThan(1000);
    expect(calls).toBe(3);
  } finally {
    await host.close();
    await worker.close();
    expect(await readdir(root)).toEqual([]);
    expect(host.server.listening).toBe(false);
    expect(worker.server.listening).toBe(false);
    await rm(directory, { recursive: true, force: true });
  }
}, 90_000);
