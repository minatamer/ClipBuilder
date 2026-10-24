import { LocalDiagnostics } from "./diagnostics.ts";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { OwnerClipBatch, type OwnerClipPorts } from "./clip-batch.ts";
import { fakeOwnerClipPreparation } from "./fake-clips.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { analyzeOwner } from "./analysis.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import {
  type OwnerWorkspace,
  OWNER_FPS,
} from "../../../packages/contracts/local/index.ts";
import { type OwnerAnalysis } from "../../../packages/contracts/local/selection.ts";

let directory: string,
  files: WorkspaceFiles,
  workspace: OwnerWorkspace,
  analysis: OwnerAnalysis,
  batch: OwnerClipBatch;
let ports: {
  mode: OwnerClipPorts["mode"];
  plan: ReturnType<typeof vi.fn<OwnerClipPorts["plan"]>>;
  image: ReturnType<typeof vi.fn<OwnerClipPorts["image"]>>;
  render: ReturnType<typeof vi.fn<OwnerClipPorts["render"]>>;
};
const analysisPorts = {
  mode: "synthetic-ai" as const,
  transcribe: vi.fn(fakeOwnerAnalysis.transcribe),
  select: vi.fn(fakeOwnerAnalysis.select),
};
beforeEach(async () => {
  vi.clearAllMocks();
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-batch-test-"));
  files = new WorkspaceFiles(directory);
  workspace = {
    id: await files.create(),
    revision: 0,
    mode: "synthetic-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 9,
      durationMs: 61_000,
      width: 320,
      height: 180,
      fps: 30,
    },
  };
  await writeFile(await files.file(workspace.id, "source.mp4"), "synthetic");
  analysis = await analyzeOwner(
    workspace,
    {
      sourceRevision: 0,
      policyRevision: 1,
      ranges: [
        { id: randomUUID(), startMs: 200, endMs: 1200 },
        { id: randomUUID(), startMs: 2000, endMs: 4000 },
      ],
      aiDuration: { minMs: 10_000, maxMs: 10_000 },
      manualOnly: false,
    },
    analysisPorts,
    new AbortController().signal,
  );
  ports = {
    mode: "synthetic-ai",
    plan: vi.fn(fakeOwnerClipPreparation.plan),
    image: vi.fn(fakeOwnerClipPreparation.image),
    render: vi.fn(async (job) => {
      if (job.operation !== "clip") throw new Error("wrong_operation");
      const bytes = Buffer.from(
        `synthetic:${job.clipId}:${job.renderRevision}`,
      );
      await writeFile(
        await files.output(workspace.id, job.clipId, job.renderRevision),
        bytes,
      );
      return {
        operation: "clip",
        frames: job.overlay.frames,
        bytes: bytes.length,
        durationMs: Math.round((job.overlay.frames * 1000) / OWNER_FPS),
      };
    }),
  };
  batch = new OwnerClipBatch(workspace, files, ports);
});
afterEach(async () => {
  await batch.close();
  await files.close();
  expect(await readdir(directory)).toEqual([]);
  await rm(directory, { recursive: true, force: true });
});
const request = () => ({
  operationId: randomUUID(),
  analysisId: analysis.id,
  sourceRevision: 0,
  policyRevision: 1,
  momentIds: [...analysis.manual, ...analysis.suggestions.slice(0, 1)].map(
    (moment) => moment.id,
  ),
});
const gate = () => {
  let release!: () => void;
  const wait = new Promise<void>((done) => {
    release = done;
  });
  return { wait, release };
};

it("cancel-all fences requests still waiting for admission without dispatching work", async () => {
  const submission = batch.submit(request(), analysis);
  batch.cancel();
  await submission;
  await batch.drain();
  expect(batch.snapshot().clips.map((clip) => clip.state)).toEqual([
    "canceled",
    "canceled",
    "canceled",
  ]);
  expect(ports.plan).toHaveBeenCalledTimes(0);
  expect(ports.image).toHaveBeenCalledTimes(0);
  expect(ports.render).toHaveBeenCalledTimes(0);
  await batch.submit(request(), analysis);
  await batch.drain();
  const clip = batch.snapshot().clips[0]!;
  const operation = { operationId: randomUUID(), expectedRevision: 0 };
  const exporting = batch.render(clip.id, operation);
  batch.cancel();
  await exporting;
  await batch.drain();
  await batch.render(clip.id, operation);
  await batch.drain();
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(ports.image).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(3);
  expect(batch.snapshot().clips[0]?.outputs).toHaveLength(1);
});

it("prepares three independent bundles, reuses one analysis, and makes duplicate batch submissions idempotent", async () => {
  const input = request();
  await Promise.all([
    batch.submit(input, analysis),
    batch.submit(input, analysis),
  ]);
  await batch.drain();
  const result = batch.snapshot();
  expect(result.active).toBe(false);
  expect(result.workers).toBe(1);
  expect(result.clips.map((clip) => clip.state)).toEqual([
    "ready",
    "ready",
    "ready",
  ]);
  expect(result.clips.map((clip) => clip.base?.overlay.frames)).toEqual([
    30, 60, 300,
  ]);
  expect(new Set(result.clips.map((clip) => clip.id)).size).toBe(3);
  expect(new Set(result.clips.map((clip) => clip.outputs[0]?.id)).size).toBe(3);
  for (const clip of result.clips) {
    expect(clip.sourceRevision).toBe(0);
    expect(clip.base?.fingerprint).toBe(workspace.source.fingerprint);
    expect(clip.baseHash).toMatch(/^[a-f0-9]{64}$/);
    expect(clip.calls).toEqual({ plan: 1, image: 1, render: 1 });
  }
  await batch.submit(input, analysis);
  await batch.submit({ ...input, operationId: randomUUID() }, analysis);
  await batch.drain();
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(ports.image).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(3);
  expect(new Set(ports.render.mock.calls.map(([job]) => job.jobId)).size).toBe(
    3,
  );
  expect(analysisPorts.transcribe).toHaveBeenCalledTimes(1);
  expect(analysisPorts.select).toHaveBeenCalledTimes(1);
  expect(
    (await readFile(await files.file(workspace.id, "source.mp4"))).toString(),
  ).toBe("synthetic");
});
it("freezes inputs before asynchronous admission and explicitly resumes a never-started canceled clip without duplicating siblings", async () => {
  const entered = gate(),
    release = gate();
  ports.plan.mockImplementationOnce(async (moment, signal) => {
    entered.release();
    await release.wait;
    return fakeOwnerClipPreparation.plan(moment, signal);
  });
  const input = request(),
    pending = batch.submit(input, analysis);
  input.momentIds = [];
  await pending;
  await entered.wait;
  const third = batch.snapshot().clips[2]!;
  batch.cancel(third.id);
  release.release();
  await batch.drain();
  expect(batch.snapshot().clips).toHaveLength(3);
  expect(batch.snapshot().clips[2]?.calls.plan).toBe(0);
  const resume = request();
  await batch.submit(resume, analysis);
  await batch.drain();
  expect(batch.snapshot().clips[2]?.id).toBe(third.id);
  expect(batch.snapshot().clips.map((clip) => clip.state)).toEqual([
    "ready",
    "ready",
    "ready",
  ]);
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(ports.image).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(3);
});
it("isolates a queued cancellation, an in-flight failure and a successful sibling with one active job", async () => {
  const entered = gate(),
    release = gate();
  let active = 0,
    peak = 0;
  ports.plan.mockImplementationOnce(async (moment, signal) => {
    entered.release();
    await release.wait;
    return fakeOwnerClipPreparation.plan(moment, signal);
  });
  const successfulRender = ports.render.getMockImplementation()!;
  let calls = 0;
  ports.render.mockImplementation(async (job, signal) => {
    active++;
    peak = Math.max(peak, active);
    try {
      if (calls++ === 0) throw new Error("synthetic_failure");
      return await successfulRender(job, signal);
    } finally {
      active--;
    }
  });
  const result = await batch.submit(request(), analysis);
  await entered.wait;
  expect(result.active).toBe(true);
  expect(batch.snapshot().clips[1]?.state).toBe("queued");
  batch.cancel(result.clips[2]!.id);
  release.release();
  await batch.drain();
  expect(batch.snapshot().clips.map((clip) => clip.state)).toEqual([
    "failed",
    "ready",
    "canceled",
  ]);
  expect(ports.plan).toHaveBeenCalledTimes(2);
  expect(ports.image).toHaveBeenCalledTimes(2);
  expect(ports.render).toHaveBeenCalledTimes(2);
  expect(peak).toBe(1);
  expect(batch.snapshot().clips[2]?.calls).toEqual({
    plan: 0,
    image: 0,
    render: 0,
  });
  expect(
    (await readFile(await files.file(workspace.id, "source.mp4"))).toString(),
  ).toBe("synthetic");
});
it("reports cancellation only after running work drains; cancel-all dispatches no queued siblings", async () => {
  const entered = gate(),
    release = gate();
  let drained = false;
  ports.render.mockImplementationOnce(async (_job, signal) => {
    entered.release();
    await new Promise<void>((done) =>
      signal.addEventListener("abort", () => done(), { once: true }),
    );
    await release.wait;
    drained = true;
    signal.throwIfAborted();
    throw new Error("canceled");
  });
  const result = await batch.submit(request(), analysis);
  await entered.wait;
  const canceled = batch.cancel();
  expect(canceled.clips[0]?.state).toBe("canceling");
  expect(canceled.active).toBe(true);
  expect(drained).toBe(false);
  release.release();
  await batch.drain();
  expect(drained).toBe(true);
  expect(batch.snapshot().clips.map((clip) => clip.state)).toEqual([
    "canceled",
    "canceled",
    "canceled",
  ]);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(1);
  expect(ports.render).toHaveBeenCalledTimes(1);
  expect(result.clips).toHaveLength(3);
});
it("rejects invalid/stale requests and operation conflicts before any new work", async () => {
  const input = request();
  for (const invalid of [
    { ...input, sourceRevision: 1 },
    { ...input, policyRevision: 2 },
    { ...input, analysisId: randomUUID() },
    { ...input, momentIds: [randomUUID()] },
    { ...input, momentIds: [input.momentIds[0], input.momentIds[0]] },
  ])
    await expect(batch.submit(invalid, analysis)).rejects.toThrow();
  expect(ports.plan).toHaveBeenCalledTimes(0);
  expect(ports.image).toHaveBeenCalledTimes(0);
  expect(ports.render).toHaveBeenCalledTimes(0);
  await batch.submit(input, analysis);
  await batch.drain();
  await expect(
    batch.submit(
      { ...input, momentIds: input.momentIds.slice(0, 1) },
      analysis,
    ),
  ).rejects.toThrow("operation_conflict");
  const clip = batch.snapshot().clips[0]!;
  await expect(
    batch.render(clip.id, { operationId: randomUUID(), expectedRevision: 1 }),
  ).rejects.toThrow("stale_or_busy_clip");
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(3);
});
it("retains immutable previous outputs and the source during explicit deterministic re-export", async () => {
  await batch.submit(request(), analysis);
  await batch.drain();
  const clip = batch.snapshot().clips[0]!;
  const first = await readFile(await files.output(workspace.id, clip.id, 0)),
    operation = { operationId: randomUUID(), expectedRevision: 0 };
  await Promise.all([
    batch.render(clip.id, operation),
    batch.render(clip.id, operation),
  ]);
  await batch.drain();
  const current = batch.snapshot().clips[0]!;
  expect(current.outputs.map((output) => output.revision)).toEqual([0, 1]);
  expect(current.outputs[0]?.id).not.toBe(current.outputs[1]?.id);
  expect(await readFile(await files.output(workspace.id, clip.id, 0))).toEqual(
    first,
  );
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(ports.image).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(4);
  expect(batch.snapshot().clips[1]?.outputs).toHaveLength(1);
  expect(
    (await readFile(await files.file(workspace.id, "source.mp4"))).toString(),
  ).toBe("synthetic");
});

it("records background preparation and render failures with no extra processing calls", async () => {
  const lines: string[] = [];
  await batch.close();
  batch = new OwnerClipBatch(
    workspace,
    files,
    ports,
    undefined,
    new LocalDiagnostics((line) => lines.push(line)),
  );
  ports.render.mockRejectedValueOnce(
    Object.assign(new Error("synthetic-private-ffmpeg-command"), {
      code: "ENOSPC",
    }),
  );
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  expect(batch.snapshot().clips[0]?.state).toBe("failed");
  expect(lines.map((line) => JSON.parse(line))).toContainEqual(
    expect.objectContaining({
      operation: "clip_build",
      outcome: "failed",
      error: expect.objectContaining({ systemCode: "ENOSPC" }),
    }),
  );
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.render).toHaveBeenCalledTimes(1);
  expect(lines.join("\n")).not.toContain("synthetic-private-ffmpeg-command");
});

it("retries preparation without a base once, preserving successful siblings and stale/idempotency guards", async () => {
  ports.plan.mockRejectedValueOnce(new Error("synthetic_transport_failure"));
  await batch.submit(request(), analysis);
  await batch.drain();
  const before = batch.snapshot(),
    failed = before.clips[0]!;
  expect(failed.base).toBeNull();
  expect(failed.state).toBe("failed");
  await expect(
    batch.retry(failed.id, { operationId: randomUUID(), expectedRevision: 9 }),
  ).rejects.toThrow("stale_or_busy_clip");
  const operation = { operationId: randomUUID(), expectedRevision: 0 };
  await Promise.all([
    batch.retry(failed.id, operation),
    batch.retry(failed.id, operation),
  ]);
  await batch.drain();
  expect(batch.snapshot().clips[0]?.state).toBe("ready");
  expect(batch.snapshot().clips.slice(1)).toEqual(before.clips.slice(1));
  expect(ports.plan).toHaveBeenCalledTimes(4);
  expect(ports.image).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(3);
  await batch.retry(failed.id, operation);
  await batch.drain();
  expect(ports.plan).toHaveBeenCalledTimes(4);
});

it("retains a paid plan and completed images across a restored preparation retry", async () => {
  const original = ports.plan.getMockImplementation()!;
  ports.plan.mockImplementationOnce(async (...args) => {
    const plan = await original(...args);
    return [plan[0]!, { ...plan[0]!, startFrame: 1 }];
  });
  const image = ports.image.getMockImplementation()!;
  ports.image
    .mockImplementationOnce(image)
    .mockRejectedValueOnce(new Error("synthetic_transport_failure"));
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const failed = batch.snapshot().clips[0]!;
  expect(failed.state).toBe("failed");
  expect(failed.preparation?.pictures).toHaveLength(1);
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  batch.restore([failed]);
  await batch.retry(failed.id, {
    operationId: randomUUID(),
    expectedRevision: 0,
  });
  await batch.drain();
  const ready = batch.snapshot().clips[0]!;
  expect(ready.state).toBe("ready");
  expect(ready.assets[0]).toEqual(failed.assets[0]);
  expect(ready.base?.overlay.visuals).toHaveLength(2);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(1);
});

it("retries only native rendering when a prepared base survives failure", async () => {
  ports.render.mockRejectedValueOnce(new Error("synthetic_native_failure"));
  await batch.submit(request(), analysis);
  await batch.drain();
  const before = batch.snapshot(),
    failed = before.clips[0]!;
  expect(failed.base).not.toBeNull();
  const operation = { operationId: randomUUID(), expectedRevision: 0 };
  await Promise.all([
    batch.retry(failed.id, operation),
    batch.retry(failed.id, operation),
  ]);
  await batch.drain();
  const ready = batch.snapshot().clips[0]!;
  expect(ready.state).toBe("ready");
  expect(ready.base).toEqual(failed.base);
  expect(ready.assets).toEqual(failed.assets);
  expect(ready.edit).toEqual(failed.edit);
  expect(batch.snapshot().clips.slice(1)).toEqual(before.clips.slice(1));
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(ports.image).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(4);
});

it("rejects a rebound saved preparation before dispatching a retry", async () => {
  ports.render.mockRejectedValueOnce(new Error("synthetic_native_failure"));
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const clip = batch.snapshot().clips[0]!;
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  clip.preparation!.moment.id = randomUUID();
  expect(() => batch.restore([clip])).toThrow("stale_saved_clip");
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(1);
  expect(ports.render).toHaveBeenCalledTimes(1);
});

it("recovers an older failed clip without a checkpoint from its saved analysis", async () => {
  ports.plan.mockRejectedValueOnce(new Error("synthetic_transport_failure"));
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const clip = batch.snapshot().clips[0]!;
  delete clip.preparation;
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  batch.restore([clip]);
  await batch.retry(
    clip.id,
    { operationId: randomUUID(), expectedRevision: 0 },
    analysis,
  );
  await batch.drain();
  expect(batch.snapshot().clips[0]?.state).toBe("ready");
  expect(ports.plan).toHaveBeenCalledTimes(2);
  expect(ports.image).toHaveBeenCalledTimes(1);
  expect(ports.render).toHaveBeenCalledTimes(1);
});

it("converts invalid visual clocks, critiques weak evidence, and renders without optional art", async () => {
  const original = ports.plan.getMockImplementation()!;
  ports.plan.mockImplementationOnce(async (...args) => {
    const plan = await original(...args);
    return [
      { ...plan[0]!, startFrame: 1000.5, endFrame: -1, evidenceWordIds: [] },
    ];
  });
  ports.image.mockResolvedValueOnce(null);
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  expect(batch.snapshot().clips[0]).toMatchObject({
    state: "ready",
    calls: { plan: 1, image: 1, render: 1 },
    base: { overlay: { visuals: [] } },
  });
});
