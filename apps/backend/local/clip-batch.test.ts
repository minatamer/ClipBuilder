import { LocalDiagnostics } from "./diagnostics.ts";
import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { OwnerClipBatch, type OwnerClipPorts } from "./clip-batch.ts";
import { editorContentFixture as fakeOwnerClipPreparation } from "../../../test/owner-content-fixture.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { analyzeOwner } from "./analysis.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import {
  type OwnerWorkspace,
  OWNER_FPS,
} from "../../../packages/contracts/local/index.ts";
import { type OwnerAnalysis } from "../../../packages/contracts/local/selection.ts";
import { OWNER_BATCH_POLICY } from "../../../packages/contracts/local/clips.ts";
import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../../packages/contracts/local/text-style.ts";
import { compileOwnerOverlay } from "../../../packages/contracts/local/edit-overlay.ts";
import { defaultOwnerFocus } from "../../../packages/contracts/local/focus.ts";
import { placeOwnerPlannedVisual } from "../../../packages/contracts/local/visual-placement.ts";
import {
  checkHostedScratch,
  HOSTED_MEMORY_BYTES,
  HOSTED_SCRATCH_VOLUME_BYTES,
} from "./hosted-capacity.ts";

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
      if (job.operation === "clip-preview") {
        const frames = job.cut.endFrame - job.cut.startFrame;
        const bytes = Buffer.from(`synthetic-preview:${job.clipId}`);
        await writeFile(
          await files.clipSource(workspace.id, job.clipId),
          bytes,
        );
        return {
          operation: "clip-preview",
          frames,
          bytes: bytes.length,
          durationMs: Math.round((frames * 1000) / OWNER_FPS),
        };
      }
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
        frames: ownerPresentationFrames(job.overlay),
        bytes: bytes.length,
        durationMs: Math.round(
          (ownerPresentationFrames(job.overlay) * 1000) / OWNER_FPS,
        ),
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
it("caps only fresh planned pictures and gaps, then preserves a manually extended visual on retry/export", async () => {
  const moment = analysis.suggestions[0]!;
  const cue = (startFrame: number, endFrame: number, scene: string) => ({
    startFrame,
    endFrame,
    brief: {
      scene,
      searchQuery: "coral reef",
      requiredTerms: ["coral"],
      avoidTerms: [],
    },
    evidenceWordIds: [moment.cues[0]!.id],
  });
  ports.plan.mockResolvedValue([
    cue(0, 300, "Synthetic reef"),
    cue(30, 300, "Synthetic marine habitat"),
  ]);
  await batch.submit({ ...request(), momentIds: [moment.id] }, analysis);
  await batch.drain();
  const prepared = batch.snapshot().clips[0]!;
  expect(
    prepared.base!.overlay.visuals.map(({ startFrame, endFrame }) => [
      startFrame,
      endFrame,
    ]),
  ).toEqual([
    [0, 150],
    [210, 300],
  ]);
  expect(
    prepared.base!.overlay.audio!.cues.map((cue) => cue.startFrame),
  ).toEqual([0, 210]);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(2);
  const edited = await batch.edit(prepared.id, {
    operationId: randomUUID(),
    expectedRevision: prepared.revision,
    baseHash: prepared.baseHash,
    operations: [
      {
        kind: "visual-upsert",
        cue: { ...prepared.edit!.visuals[0]!, endFrame: 240 },
      },
    ],
  });
  ports.render.mockRejectedValueOnce(new Error("synthetic_export_failure"));
  await batch.render(prepared.id, {
    operationId: randomUUID(),
    expectedRevision: edited.clips[0]!.revision,
  });
  await batch.drain();
  const failed = batch.snapshot().clips[0]!;
  expect(failed.state).toBe("failed");
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  batch.restore([failed]);
  await batch.retry(prepared.id, {
    operationId: randomUUID(),
    expectedRevision: failed.revision,
  });
  await batch.drain();
  const ready = batch.snapshot().clips[0]!;
  expect(ready.state).toBe("ready");
  expect(ready.edit!.visuals[0]!.endFrame).toBe(240);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(2);
  const job = ports.render.mock.lastCall![0];
  if (job.operation !== "clip") throw new Error("expected_export");
  expect(job.overlay.visuals[0]!.endFrame).toBe(240);
});
it("places new planned pictures around observed faces and preserves manual boxes on restore/export", async () => {
  Object.assign(ports, {
    focus: ({
      moment,
    }: Parameters<NonNullable<OwnerClipPorts["focus"]>>[0]) => {
      const focus = defaultOwnerFocus(
        workspace.source,
        moment.cut.endFrame - moment.cut.startFrame,
      );
      focus.people = [
        {
          id: "person_1",
          observations: [
            {
              startFrame: 0,
              endFrame: focus.frames,
              box: { x: 0.08, y: 0.12, width: 0.3, height: 0.48 },
            },
          ],
        },
      ];
      return focus;
    },
  });
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[1]!.id] },
    analysis,
  );
  await batch.drain();
  const ready = batch.snapshot().clips[0]!,
    visual = ready.base!.overlay.visuals[0]!;
  expect(visual.box).toEqual(
    placeOwnerPlannedVisual(ready.base!.overlay.focus, visual),
  );
  expect(visual.box).not.toEqual(placeOwnerPlannedVisual(undefined, visual));
  const manualBox = { x: 0.1, y: 0.15, width: 0.4, height: 0.2 };
  const edited = await batch.edit(ready.id, {
    operationId: randomUUID(),
    expectedRevision: ready.revision,
    baseHash: ready.baseHash,
    operations: [
      {
        kind: "visual-upsert",
        cue: { ...ready.edit!.visuals[0]!, box: manualBox },
      },
    ],
  });
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  batch.restore(edited.clips);
  expect(batch.snapshot().clips[0]!.edit!.visuals[0]!.box).toEqual(manualBox);
  await batch.render(ready.id, {
    operationId: randomUUID(),
    expectedRevision: edited.clips[0]!.revision,
  });
  await batch.drain();
  const exported = batch.snapshot().clips[0]!;
  expect(exported.state).toBe("ready");
  expect(exported.edit!.visuals[0]!.box).toEqual(manualBox);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(1);
  const final = ports.render.mock.calls.at(-1)![0];
  expect(final.operation).toBe("clip");
  if (final.operation === "clip")
    expect(final.overlay.visuals[0]!.box).toEqual(manualBox);
});
it("adds one editable recorded Pop per planned visual without additional planning and follows moved/deleted visual edits", async () => {
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const clip = batch.snapshot().clips[0]!,
    visual = clip.base!.overlay.visuals[0]!;
  const cues = clip.base!.overlay.audio!.cues;
  expect(cues).toHaveLength(1);
  expect(cues[0]).toMatchObject({
    visualId: visual.id,
    source: { kind: "builtin", id: "pop" },
    startFrame: visual.startFrame,
    endFrame: visual.startFrame + 9,
    volume: 35,
    loop: false,
  });
  expect(clip.edit!.audio!.cues).toEqual(cues);
  const changed = structuredClone(clip.edit!);
  changed.visuals[0]!.startFrame = 10;
  changed.audio!.cues[0]!.volume = 12;
  expect(
    compileOwnerOverlay(clip.base!, changed, clip.assets).audio!.cues[0],
  ).toMatchObject({ startFrame: 10, endFrame: 19, volume: 12 });
  changed.visuals = [];
  expect(
    compileOwnerOverlay(clip.base!, changed, clip.assets).audio!.cues,
  ).toEqual([]);
  const acknowledged = await batch.edit(clip.id, {
    operationId: randomUUID(),
    expectedRevision: clip.revision,
    baseHash: clip.baseHash,
    operations: [{ kind: "visual-remove", cueId: visual.id }],
  });
  expect(acknowledged.clips[0]!.edit!.audio!.cues).toEqual([]);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(1);
  expect(ports.render).toHaveBeenCalledTimes(1);
});
it("omits early Hook advice independently of active edits and preserves the usable clip through restore without replanning", async () => {
  const hookSuggestion = vi.fn(() => ({ startFrame: 3, endFrame: 21 }));
  Object.assign(ports, { hookSuggestion });
  await batch.submit(request(), analysis);
  await batch.drain();
  const clips = batch.snapshot().clips;
  expect(clips.every((clip) => clip.base?.hookSuggestion === undefined)).toBe(
    true,
  );
  expect(
    clips.every(
      (clip) =>
        !clip.base?.overlay.hook &&
        !clip.edit?.hook &&
        clip.outputs.length === 0,
    ),
  ).toBe(true);
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(hookSuggestion).toHaveBeenCalledTimes(3);
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  batch.restore(clips);
  expect(
    batch.snapshot().clips.map((clip) => clip.base?.hookSuggestion),
  ).toEqual(clips.map((clip) => clip.base?.hookSuggestion));
  expect(ports.plan).toHaveBeenCalledTimes(3);
});

it("keeps three maximum-source clips and all twenty export revisions with actual retained-byte reservations", async () => {
  await batch.close();
  workspace.source.bytes = PUBLIC_LIMITS.maxSourceBytes;
  const peaks: number[] = [];
  const capacity = vi.fn(async (_root: string, peak: number) => {
    peaks.push(peak);
    checkHostedScratch(peak, {
      volume: HOSTED_SCRATCH_VOLUME_BYTES,
      free: HOSTED_SCRATCH_VOLUME_BYTES,
      retained: 0,
      memoryLimit: HOSTED_MEMORY_BYTES,
      memoryUsed: 512 * 1024 ** 2,
    });
  });
  batch = new OwnerClipBatch(
    workspace,
    files,
    ports,
    undefined,
    undefined,
    capacity,
    3,
  );
  await batch.submit(request(), analysis);
  await batch.drain();
  const clips = batch.snapshot().clips;
  expect(clips).toHaveLength(3);
  expect(
    clips.every((clip) => clip.preview && clip.state === "review-ready"),
  ).toBe(true);
  expect(peaks[0]).toBe(
    PUBLIC_LIMITS.maxSourceBytes +
      3 * OWNER_BATCH_POLICY.clipReservationBytes +
      OWNER_BATCH_POLICY.overlayBytes,
  );
  const clip = clips[0]!;
  for (let index = 0; index < OWNER_BATCH_POLICY.outputs; index++) {
    await batch.render(clip.id, {
      operationId: randomUUID(),
      expectedRevision: clip.revision,
    });
    await batch.drain();
  }
  const completed = batch.snapshot().clips[0]!;
  expect(completed.outputs).toHaveLength(20);
  for (const output of completed.outputs)
    expect(
      (
        await readFile(
          await files.output(workspace.id, clip.id, output.revision),
        )
      ).length,
    ).toBe(output.bytes);
  expect(ports.plan).toHaveBeenCalledTimes(3);
  expect(ports.render).toHaveBeenCalledTimes(23);
  const retained = batch
    .snapshot()
    .clips.reduce(
      (total, item) =>
        total +
        item.preview!.bytes +
        item.outputs.reduce((sum, output) => sum + output.bytes, 0) +
        item.assets.reduce((sum, asset) => sum + asset.bytes, 0),
      0,
    );
  expect(peaks.at(-1)).toBe(
    workspace.source.bytes +
      retained -
      completed.outputs.at(-1)!.bytes +
      OWNER_BATCH_POLICY.clipReservationBytes +
      OWNER_BATCH_POLICY.overlayBytes,
  );
  await expect(
    batch.render(clip.id, {
      operationId: randomUUID(),
      expectedRevision: clip.revision,
    }),
  ).rejects.toThrow("output_limit");
  capacity.mockRejectedValueOnce(new Error("disk_unavailable"));
  await expect(
    batch.render(clips[1]!.id, {
      operationId: randomUUID(),
      expectedRevision: 0,
    }),
  ).rejects.toThrow("disk_unavailable");
  expect(ports.render).toHaveBeenCalledTimes(23);
  expect(batch.snapshot().clips[0]!.outputs).toEqual(completed.outputs);
});

it("reserves every queued export before dispatch while keeping a single overlay workspace", async () => {
  await batch.close();
  const capacity = vi.fn<(root: string, peak: number) => Promise<void>>(
    async () => {},
  );
  batch = new OwnerClipBatch(
    workspace,
    files,
    ports,
    undefined,
    undefined,
    capacity,
    3,
  );
  await batch.submit(request(), analysis);
  await batch.drain();
  const clips = batch.snapshot().clips;
  const retained = clips.reduce(
    (sum, clip) =>
      sum +
      clip.preview!.bytes +
      clip.assets.reduce((total, asset) => total + asset.bytes, 0),
    0,
  );
  const stop = gate();
  const render = ports.render.getMockImplementation()!;
  ports.render.mockImplementation(async (...args) => {
    if (args[0].operation === "clip") await stop.wait;
    return render(...args);
  });
  try {
    for (let index = 0; index < 3; index++) {
      await batch.render(clips[index]!.id, {
        operationId: randomUUID(),
        expectedRevision: 0,
      });
      expect(capacity.mock.calls.at(-1)![1]).toBe(
        workspace.source.bytes +
          retained +
          (index + 1) * OWNER_BATCH_POLICY.clipReservationBytes +
          OWNER_BATCH_POLICY.overlayBytes,
      );
    }
  } finally {
    stop.release();
    await batch.drain();
  }
  expect(
    batch.snapshot().clips.every((clip) => clip.outputs.length === 1),
  ).toBe(true);
});

it("dispatches no planning, images or native work when cgroup headroom denies preparation", async () => {
  await batch.close();
  const capacity = async (_root: string, peak: number) =>
    checkHostedScratch(peak, {
      volume: HOSTED_SCRATCH_VOLUME_BYTES,
      free: HOSTED_SCRATCH_VOLUME_BYTES,
      retained: 0,
      memoryLimit: HOSTED_MEMORY_BYTES,
      memoryUsed: HOSTED_MEMORY_BYTES - 1,
    });
  batch = new OwnerClipBatch(
    workspace,
    files,
    ports,
    undefined,
    undefined,
    capacity,
    3,
  );
  await expect(batch.submit(request(), analysis)).rejects.toThrow(
    "disk_unavailable",
  );
  await batch.drain();
  expect(batch.snapshot().clips).toEqual([]);
  expect(ports.plan).toHaveBeenCalledTimes(0);
  expect(ports.image).toHaveBeenCalledTimes(0);
  expect(ports.render).toHaveBeenCalledTimes(0);
});

it("applies, exports, restores and removes a bounded manual hook without another AI request", async () => {
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[1]!.id] },
    analysis,
  );
  await batch.drain();
  let clip = batch.snapshot().clips[0]!;
  const base = JSON.stringify(clip.base),
    planCalls = ports.plan.mock.calls.length,
    imageCalls = ports.image.mock.calls.length;
  await expect(
    batch.edit(clip.id, {
      operationId: randomUUID(),
      expectedRevision: 0,
      baseHash: clip.baseHash,
      operations: [
        {
          kind: "hook",
          hook: { startFrame: 0, endFrame: clip.base!.overlay.frames + 1 },
        },
      ],
    }),
  ).rejects.toThrow();
  const hook = { startFrame: 10, endFrame: 25 };
  clip = (
    await batch.edit(clip.id, {
      operationId: randomUUID(),
      expectedRevision: 0,
      baseHash: clip.baseHash,
      operations: [{ kind: "hook", hook }],
    })
  ).clips[0]!;
  await batch.render(clip.id, {
    operationId: randomUUID(),
    expectedRevision: 1,
  });
  await batch.drain();
  clip = batch.snapshot().clips[0]!;
  expect(clip.outputs.at(-1)?.frames).toBe(clip.base!.overlay.frames + 15);
  const job = ports.render.mock.calls.at(-1)![0];
  expect(job.operation).toBe("clip");
  if (job.operation !== "clip") throw new Error("missing_clip");
  expect(job.overlay.hook).toEqual(hook);
  const restored = new OwnerClipBatch(workspace, files, ports);
  restored.restore(JSON.parse(JSON.stringify(batch.snapshot().clips)));
  expect(restored.snapshot().clips[0]!.edit?.hook).toEqual(hook);
  await restored.close();
  await batch.edit(clip.id, {
    operationId: randomUUID(),
    expectedRevision: 1,
    baseHash: clip.baseHash,
    operations: [{ kind: "hook", hook: null }],
  });
  expect(batch.snapshot().clips[0]!.edit?.hook).toBeUndefined();
  expect(JSON.stringify(clip.base)).toBe(base);
  expect(ports.plan).toHaveBeenCalledTimes(planCalls);
  expect(ports.image).toHaveBeenCalledTimes(imageCalls);
});

it("allows manual text to start later and last beyond the AI reading window through restore/export", async () => {
  const layer = {
    id: randomUUID(),
    text: "Synthetic opening",
    startFrame: 0,
    endFrame: 60,
    style: {
      ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
      box: { x: 0.08, y: 0.08, width: 0.84, height: 0.18 },
    },
  };
  Object.assign(ports, { texts: vi.fn(() => [layer]) });
  await batch.submit(
    { ...request(), momentIds: [analysis.suggestions[0]!.id] },
    analysis,
  );
  await batch.drain();
  const ready = batch.snapshot().clips[0]!,
    manual = { ...layer, startFrame: 30, endFrame: 300 };
  const edited = await batch.edit(ready.id, {
    operationId: randomUUID(),
    expectedRevision: ready.revision,
    baseHash: ready.baseHash,
    operations: [{ kind: "text-layers", layers: [manual] }],
  });
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  batch.restore(edited.clips);
  expect(batch.snapshot().clips[0]!.edit!.texts).toEqual([manual]);
  await batch.render(ready.id, {
    operationId: randomUUID(),
    expectedRevision: edited.clips[0]!.revision,
  });
  await batch.drain();
  expect(batch.snapshot().clips[0]!.state).toBe("ready");
  const job = ports.render.mock.lastCall![0];
  if (job.operation !== "clip") throw new Error("expected_export");
  expect(job.overlay.texts).toEqual([manual]);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(1);
});
it("retains optional planned editable text through preparation failure, restore and explicit retry without another plan", async () => {
  const layer = {
    id: randomUUID(),
    text: "Synthetic grounded title",
    startFrame: 0,
    endFrame: 30,
    style: {
      ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
      box: { x: 0.08, y: 0.08, width: 0.84, height: 0.18 },
    },
  };
  const texts = vi.fn(() => [layer]);
  Object.assign(ports, { texts });
  ports.image.mockRejectedValueOnce(new Error("synthetic_picture_failure"));
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[1]!.id] },
    analysis,
  );
  await batch.drain();
  const failed = batch.snapshot().clips[0]!;
  expect(failed.state).toBe("failed");
  expect(failed.base).toBeNull();
  expect(failed.preparation?.texts).toEqual([layer]);
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, ports);
  batch.restore([failed]);
  await batch.retry(failed.id, {
    operationId: randomUUID(),
    expectedRevision: 0,
  });
  await batch.drain();
  const ready = batch.snapshot().clips[0]!;
  expect(ready.state).toBe("review-ready");
  expect(ready.base?.overlay.texts).toEqual([layer]);
  expect(ready.edit?.texts).toEqual([layer]);
  expect(texts).toHaveBeenCalledTimes(1);
  expect(ports.plan).toHaveBeenCalledTimes(1);
});

it.each(["synthetic-ai", "provider-ai"] as const)(
  "starts %s clips without text and ignores a legacy title on preparation retry",
  async (mode) => {
    await batch.close();
    ports.mode = workspace.mode = analysis.mode = mode;
    ports.plan.mockResolvedValue([]);
    batch = new OwnerClipBatch(workspace, files, ports);
    await batch.submit(
      { ...request(), momentIds: [analysis.manual[1]!.id] },
      analysis,
    );
    await batch.drain();
    const ready = batch.snapshot().clips[0]!;
    expect(ready.base!.overlay.texts).toEqual([]);
    expect(ready.preparation?.title).toBeUndefined();
    await batch.close();
    batch = new OwnerClipBatch(workspace, files, ports);
    batch.restore([
      {
        ...ready,
        state: "failed",
        base: null,
        baseHash: null,
        preview: undefined,
        preparation: {
          ...ready.preparation!,
          title: "Legacy title must stay invisible",
        },
      },
    ]);
    await batch.retry(ready.id, {
      operationId: randomUUID(),
      expectedRevision: 0,
    });
    await batch.drain();
    const retried = batch.snapshot().clips[0]!;
    expect(retried.state).toBe("review-ready");
    expect(retried.base!.overlay.texts).toEqual([]);
    expect(ports.plan).toHaveBeenCalledTimes(1);
    expect(ports.image).toHaveBeenCalledTimes(0);
    expect(ports.render).toHaveBeenCalledTimes(2);
  },
);

it.each(["generated", "retrieved"] as const)(
  "keeps new text empty with TikTok captions and immediate/fading %s pictures, reporting real phases and reusing them on preview retry",
  async (origin) => {
    await batch.close();
    ports.mode = "provider-ai";
    workspace.mode = "provider-ai";
    analysis.mode = "provider-ai";
    ports.image.mockImplementation(async (request, signal) => {
      const picture = await fakeOwnerClipPreparation.image(request, signal);
      return picture ? { ...picture, origin } : null;
    });
    const observed: string[] = [];
    batch = new OwnerClipBatch(workspace, files, ports, () => {
      const clip = batch.snapshot().clips[0];
      if (clip?.preparationStage) observed.push(clip.preparationStage);
    });
    ports.render.mockRejectedValueOnce(new Error("synthetic_preview_failure"));
    await batch.submit(
      { ...request(), momentIds: [analysis.manual[1]!.id] },
      analysis,
    );
    await batch.drain();
    const failed = batch.snapshot().clips[0]!;
    expect(failed.state).toBe("failed");
    expect(failed.preparationStage).toBeUndefined();
    expect([...new Set(observed)]).toEqual([
      "planning",
      "pictures",
      "captions",
      "preview",
    ]);
    expect(failed.preparation?.title).toBeUndefined();
    expect(failed.base!.overlay.texts).toEqual([]);
    expect(failed.base!.overlay.captionStyle?.outlineWidth).toBe(12);
    expect(failed.base!.overlay.captionStyle?.preset).toBe("tiktok");
    expect(failed.base!.overlay.captions.length).toBeGreaterThan(0);
    expect(failed.base!.overlay.visuals[0]).toMatchObject({
      entrance: "none",
      exit: "fade",
      animationFrames: 9,
    });
    const retained = structuredClone(failed.base);
    const restored = new OwnerClipBatch(workspace, files, ports);
    restored.restore([
      { ...failed, state: "preparing", preparationStage: "pictures" },
    ]);
    expect(restored.snapshot().clips[0]).toMatchObject({
      state: "canceled",
    });
    expect(restored.snapshot().clips[0]!.preparationStage).toBeUndefined();
    await restored.close();
    await batch.retry(failed.id, {
      operationId: randomUUID(),
      expectedRevision: 0,
    });
    await batch.drain();
    const ready = batch.snapshot().clips[0]!;
    expect(ready.state).toBe("review-ready");
    expect(ready.preparationStage).toBeUndefined();
    expect(ready.base).toEqual(retained);
    expect(ports.plan).toHaveBeenCalledTimes(1);
    expect(ports.image).toHaveBeenCalledTimes(1);
    expect(ports.render.mock.calls.map(([job]) => job.operation)).toEqual([
      "clip-preview",
      "clip-preview",
    ]);
    expect(ready.outputs).toEqual([]);
    expect(ready.calls.render).toBe(0);
  },
);

it("exports only on request and retries a failed first export without repeating prepared AI or preview work", async () => {
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const prepared = batch.snapshot().clips[0]!;
  expect(prepared.state).toBe("review-ready");
  expect(prepared.preview?.frames).toBe(30);
  expect(prepared.outputs).toEqual([]);
  expect(prepared.calls).toEqual({ plan: 1, image: 1, render: 0 });
  expect(ports.render.mock.calls.map(([job]) => job.operation)).toEqual([
    "clip-preview",
  ]);
  await expect(
    readFile(await files.output(workspace.id, prepared.id, 0)),
  ).rejects.toThrow();
  ports.render.mockRejectedValueOnce(new Error("synthetic_export_failure"));
  await batch.render(prepared.id, {
    operationId: randomUUID(),
    expectedRevision: 0,
  });
  await batch.drain();
  expect(batch.snapshot().clips[0]).toMatchObject({
    state: "failed",
    preview: prepared.preview,
    outputs: [],
  });
  await batch.retry(prepared.id, {
    operationId: randomUUID(),
    expectedRevision: 0,
  });
  await batch.drain();
  const exported = batch.snapshot().clips[0]!;
  expect(exported.state).toBe("ready");
  expect(exported.outputs).toHaveLength(1);
  expect(exported.base).toEqual(prepared.base);
  expect(exported.assets).toEqual(prepared.assets);
  expect(ports.render.mock.calls.map(([job]) => job.operation)).toEqual([
    "clip-preview",
    "clip",
    "clip",
  ]);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(1);
});

it.each([
  { operation: "clip", frames: 30, bytes: 100, durationMs: 1000 },
  { operation: "clip-preview", frames: 29, bytes: 100, durationMs: 1000 },
  { operation: "clip-preview", frames: 30, bytes: 100, durationMs: 999 },
  {
    operation: "clip-preview",
    frames: 30,
    bytes: 384 * 1024 ** 2 + 1,
    durationMs: 1000,
  },
] as const)(
  "keeps an invalid preview receipt non-editable and retries no paid preparation: %j",
  async (invalid) => {
    ports.render.mockResolvedValueOnce(invalid);
    await batch.submit(
      { ...request(), momentIds: [analysis.manual[0]!.id] },
      analysis,
    );
    await batch.drain();
    const failed = batch.snapshot().clips[0]!;
    expect(failed.state).toBe("failed");
    expect(failed.preview).toBeUndefined();
    expect(failed.outputs).toEqual([]);
    await expect(
      batch.render(failed.id, {
        operationId: randomUUID(),
        expectedRevision: 0,
      }),
    ).rejects.toThrow("stale_or_busy_clip");
    await batch.retry(failed.id, {
      operationId: randomUUID(),
      expectedRevision: 0,
    });
    await batch.drain();
    expect(batch.snapshot().clips[0]).toMatchObject({
      state: "review-ready",
      outputs: [],
      calls: { plan: 1, image: 1, render: 0 },
    });
    expect(ports.plan).toHaveBeenCalledTimes(1);
    expect(ports.image).toHaveBeenCalledTimes(1);
    expect(ports.render.mock.calls.map(([job]) => job.operation)).toEqual([
      "clip-preview",
      "clip-preview",
    ]);
  },
);

it("saves manual focus, preserves the automatic plan and restores snapshots without provider work or mutable export revisions", async () => {
  const input = request();
  input.momentIds = input.momentIds.slice(0, 1);
  await batch.submit(input, analysis);
  await batch.drain();
  const clip = batch.snapshot().clips[0]!,
    automatic = JSON.stringify(clip.base!.overlay.focus);
  const focus = structuredClone(clip.base!.overlay.focus!);
  focus.shots[0]!.centerX = 0.8;
  focus.shots[0]!.zoom = 2;
  focus.shots[0]!.reason = "manual";
  const requestEdit = {
    operationId: randomUUID(),
    expectedRevision: clip.revision,
    baseHash: clip.baseHash,
    operations: [{ kind: "focus", focus }],
  };
  await batch.edit(clip.id, requestEdit);
  await expect(
    batch.edit(clip.id, { ...requestEdit, operationId: randomUUID() }),
  ).rejects.toThrow("stale_edit_revision");
  const release = gate();
  const normalRender = ports.render.getMockImplementation()!;
  ports.render.mockImplementation(async (job, signal) => {
    await release.wait;
    return normalRender(job, signal);
  });
  await batch.render(clip.id, {
    operationId: randomUUID(),
    expectedRevision: 1,
  });
  await batch.edit(clip.id, {
    operationId: randomUUID(),
    expectedRevision: 1,
    baseHash: clip.baseHash,
    operations: [{ kind: "reset", panel: "focus" }],
  });
  release.release();
  await batch.drain();
  const exported = ports.render.mock.calls[1]![0];
  expect(exported.operation).toBe("clip");
  if (exported.operation !== "clip") throw new Error("expected_clip");
  expect(exported.overlay.focus?.shots[0]).toMatchObject({
    centerX: 0.8,
    zoom: 2,
  });
  const saved = batch.snapshot().clips;
  expect(JSON.stringify(saved[0]!.edit!.focus)).toBe(automatic);
  expect(JSON.stringify(saved[0]!.base!.overlay.focus)).toBe(automatic);
  const restored = new OwnerClipBatch(workspace, files, ports);
  restored.restore(JSON.parse(JSON.stringify(saved)));
  expect(restored.snapshot().clips).toEqual(saved);
  await restored.close();
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(1);
  expect(ports.render).toHaveBeenCalledTimes(2);
});
it("retains detected people through cancel, saved checkpoint restore and explicit retry without another plan request", async () => {
  await batch.close();
  const focusPort = vi.fn(fakeOwnerClipPreparation.focus!);
  const hookSuggestion = vi.fn(() => ({ startFrame: 3, endFrame: 21 }));
  batch = new OwnerClipBatch(workspace, files, {
    ...ports,
    focus: focusPort,
    hookSuggestion,
  });
  const release = gate(),
    image = ports.image.getMockImplementation()!;
  ports.image.mockImplementationOnce(async (input, signal) => {
    await release.wait;
    return image(input, signal);
  });
  const input = { ...request(), momentIds: [analysis.manual[0]!.id] };
  await batch.submit(input, analysis);
  await vi.waitFor(() => expect(ports.image).toHaveBeenCalledTimes(1));
  const checkpoint = JSON.stringify(
    batch.snapshot().clips[0]!.preparation!.focus,
  );
  expect(JSON.parse(checkpoint).people).toHaveLength(2);
  batch.cancel();
  release.release();
  await batch.drain();
  const saved = JSON.parse(JSON.stringify(batch.snapshot().clips));
  expect(saved[0].preparation.hookSuggestion).toBeUndefined();
  await batch.close();
  batch = new OwnerClipBatch(workspace, files, {
    ...ports,
    focus: focusPort,
    hookSuggestion,
  });
  batch.restore(saved);
  const clip = batch.snapshot().clips[0]!;
  expect(clip.state).toBe("canceled");
  await batch.retry(clip.id, {
    operationId: randomUUID(),
    expectedRevision: clip.revision,
  });
  await batch.drain();
  expect(JSON.stringify(batch.snapshot().clips[0]!.base!.overlay.focus)).toBe(
    checkpoint,
  );
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(focusPort).toHaveBeenCalledTimes(1);
  expect(hookSuggestion).toHaveBeenCalledTimes(1);
  expect(batch.snapshot().clips[0]!.base!.hookSuggestion).toBeUndefined();
  expect(ports.image).toHaveBeenCalledTimes(2);
  expect(ports.render).toHaveBeenCalledTimes(1);
});

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
  expect(batch.snapshot().clips[0]?.outputs).toHaveLength(0);
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
    "review-ready",
    "review-ready",
    "review-ready",
  ]);
  expect(result.clips.map((clip) => clip.base?.overlay.frames)).toEqual([
    30, 60, 300,
  ]);
  expect(new Set(result.clips.map((clip) => clip.id)).size).toBe(3);
  expect(
    result.clips.every((clip) => clip.outputs.length === 0 && clip.preview),
  ).toBe(true);
  for (const clip of result.clips) {
    expect(clip.sourceRevision).toBe(0);
    expect(clip.base?.fingerprint).toBe(workspace.source.fingerprint);
    expect(clip.baseHash).toMatch(/^[a-f0-9]{64}$/);
    expect(clip.calls).toEqual({ plan: 1, image: 1, render: 0 });
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
    "review-ready",
    "review-ready",
    "review-ready",
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
    "review-ready",
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
  await batch.render(clip.id, {
    operationId: randomUUID(),
    expectedRevision: 0,
  });
  await batch.drain();
  await batch.edit(clip.id, {
    operationId: randomUUID(),
    expectedRevision: 0,
    baseHash: clip.baseHash,
    operations: [{ kind: "reset", panel: "focus" }],
  });
  const first = await readFile(await files.output(workspace.id, clip.id, 0)),
    operation = { operationId: randomUUID(), expectedRevision: 1 };
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
  expect(ports.render).toHaveBeenCalledTimes(5);
  expect(batch.snapshot().clips[1]?.outputs).toHaveLength(0);
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
  expect(batch.snapshot().clips[0]?.state).toBe("review-ready");
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
    return [
      { ...plan[0]!, startFrame: 0, endFrame: 60 },
      { ...plan[0]!, startFrame: 120, endFrame: 180 },
    ];
  });
  const image = ports.image.getMockImplementation()!;
  ports.image
    .mockImplementationOnce(image)
    .mockRejectedValueOnce(new Error("synthetic_transport_failure"));
  await batch.submit(
    { ...request(), momentIds: [analysis.suggestions[0]!.id] },
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
  expect(ready.state).toBe("review-ready");
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
  expect(ready.state).toBe("review-ready");
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
  expect(batch.snapshot().clips[0]?.state).toBe("review-ready");
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
    state: "review-ready",
    calls: { plan: 1, image: 1, render: 0 },
    base: { overlay: { visuals: [] } },
  });
});

it("starts production fake clips empty, explicitly transcribes one clip, preserves edits and replays without another paid call", async () => {
  const appFake = await import("./fake-clips.ts");
  ports.plan.mockImplementation(appFake.fakeOwnerClipPreparation.plan);
  const input = { ...request(), momentIds: [analysis.manual[0]!.id] };
  await batch.submit(input, analysis);
  await batch.drain();
  const before = batch.snapshot().clips[0]!;
  expect(before.base!.overlay.captions).toEqual([]);
  expect(before.assets).toEqual([]);
  expect(ports.image).toHaveBeenCalledTimes(0);
  const words = [
    {
      id: "w_900001",
      text: "Mars",
      punctuatedText: "Mars.",
      startMs: 100,
      endMs: 600,
      speakerId: "spk_0",
      confidence: 1,
    },
  ];
  const transcribe = vi.fn(async () => structuredClone(words));
  const action = {
    operationId: randomUUID(),
    expectedRevision: before.revision,
    paidConsent: true,
  };
  const result = await batch.generateCaptions(
    before.id,
    action,
    transcribe,
    new AbortController().signal,
  );
  const generated = result.clips[0]!;
  expect(generated.revision).toBe(1);
  expect(generated.captionAttempts).toBe(1);
  expect(generated.base!.overlay.focus).toEqual(before.base!.overlay.focus);
  expect(generated.outputs).toEqual(before.outputs);
  expect(generated.base!.overlay.captions[0]!.wordCues[0]).toMatchObject({
    text: "Mars.",
    startMs: 100,
    endMs: 600,
  });
  await batch.generateCaptions(
    before.id,
    action,
    transcribe,
    new AbortController().signal,
  );
  expect(transcribe).toHaveBeenCalledTimes(1);
  await expect(
    batch.generateCaptions(
      before.id,
      { ...action, operationId: randomUUID() },
      transcribe,
      new AbortController().signal,
    ),
  ).rejects.toThrow("stale_edit_revision");
  const edit = await batch.edit(before.id, {
    operationId: randomUUID(),
    expectedRevision: 1,
    baseHash: generated.baseHash,
    operations: [
      {
        kind: "caption-text",
        words: [{ wordId: "w_900001", text: "Martian." }],
      },
    ],
  });
  expect(edit.clips[0]!.edit!.captionText).toEqual([
    { wordId: "w_900001", text: "Martian." },
  ]);
  const speakers = {
    enabled: true,
    colors: [
      {
        speakerId: "spk_7",
        color: "#123456",
        backgroundColor: "#654321",
        highlight: "#abcdef",
      },
    ],
    assignments: [{ wordId: "w_900001", speakerId: "spk_7" }],
  };
  const colored = await batch.edit(before.id, {
    operationId: randomUUID(),
    expectedRevision: 2,
    baseHash: generated.baseHash,
    operations: [{ kind: "caption-speakers", speakers }],
  });
  expect(colored.clips[0]!.edit!.captionSpeakers).toEqual(speakers);
  await expect(
    batch.edit(before.id, {
      operationId: randomUUID(),
      expectedRevision: 3,
      baseHash: generated.baseHash,
      operations: [
        {
          kind: "caption-speakers",
          speakers: {
            ...speakers,
            assignments: [{ wordId: "absent", speakerId: null }],
          },
        },
      ],
    }),
  ).rejects.toThrow("unknown_caption_word");
  await batch.render(before.id, {
    operationId: randomUUID(),
    expectedRevision: 3,
  });
  await batch.drain();
  const job = ports.render.mock.calls.at(-1)![0];
  if (job.operation !== "clip") throw new Error("clip_missing");
  expect(job.overlay.captionSpeakers).toEqual(speakers);
  expect(job.overlay.captions[0]!.wordCues[0]).toMatchObject({
    text: "Martian.",
    startMs: 100,
    endMs: 600,
  });
  const reopened = new OwnerClipBatch(
    workspace,
    files,
    ports,
    () => {},
    new LocalDiagnostics(),
    async () => {},
  );
  reopened.restore(JSON.parse(JSON.stringify(batch.snapshot().clips)));
  expect(reopened.snapshot().clips[0]!.edit!.captionSpeakers).toEqual(speakers);
  expect(reopened.snapshot().clips[0]!.edit!.captionText).toEqual([
    { wordId: "w_900001", text: "Martian." },
  ]);
  await reopened.close();
  expect(transcribe).toHaveBeenCalledTimes(1);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(0);
});

it("requires consent and revision, bounds failures, and never automatically repeats a failed caption attempt", async () => {
  const appFake = await import("./fake-clips.ts");
  ports.plan.mockImplementation(appFake.fakeOwnerClipPreparation.plan);
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const clip = batch.snapshot().clips[0]!;
  const transcribe = vi.fn(async () => {
    throw new Error("synthetic_failure");
  });
  const action = {
    operationId: randomUUID(),
    expectedRevision: 0,
    paidConsent: true,
  };
  const signal = new AbortController().signal;
  await expect(
    batch.generateCaptions(
      clip.id,
      { ...action, paidConsent: false },
      transcribe,
      signal,
    ),
  ).rejects.toThrow();
  expect(transcribe).toHaveBeenCalledTimes(0);
  await expect(
    batch.generateCaptions(clip.id, action, transcribe, signal),
  ).rejects.toThrow("synthetic_failure");
  await expect(
    batch.generateCaptions(clip.id, action, transcribe, signal),
  ).rejects.toThrow("caption_attempt_failed");
  expect(transcribe).toHaveBeenCalledTimes(1);
  for (let attempt = 0; attempt < 2; attempt++)
    await expect(
      batch.generateCaptions(
        clip.id,
        { ...action, operationId: randomUUID() },
        transcribe,
        signal,
      ),
    ).rejects.toThrow("synthetic_failure");
  await expect(
    batch.generateCaptions(
      clip.id,
      { ...action, operationId: randomUUID() },
      transcribe,
      signal,
    ),
  ).rejects.toThrow("caption_generation_unavailable");
  expect(transcribe).toHaveBeenCalledTimes(3);
  expect(batch.active).toBe(false);
  expect(batch.snapshot().clips[0]!.base!.overlay.captions).toEqual([]);
});

it("adds fictional captions on demand without consuming a Gemini attempt or triggering planning/images/render", async () => {
  const appFake = await import("./fake-clips.ts");
  ports.plan.mockImplementation(appFake.fakeOwnerClipPreparation.plan);
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const clip = batch.snapshot().clips[0]!;
  const result = await batch.generateCaptions(
    clip.id,
    { operationId: randomUUID(), expectedRevision: 0 },
    async (current, selected, signal) =>
      fakeOwnerAnalysis.transcribe(
        {
          ...current,
          source: {
            ...current.source,
            durationMs: (selected.base!.overlay.frames * 1000) / OWNER_FPS,
          },
        },
        signal,
      ),
    new AbortController().signal,
    true,
  );
  expect(result.clips[0]!.base!.overlay.captions.length).toBeGreaterThan(0);
  expect(result.clips[0]!.base!.overlay.captionStyle?.preset).toBe("tiktok");
  expect(result.clips[0]!.captionAttempts).toBeUndefined();
  expect(result.clips[0]!.revision).toBe(1);
  expect(ports.plan).toHaveBeenCalledTimes(1);
  expect(ports.image).toHaveBeenCalledTimes(0);
  expect(ports.render).toHaveBeenCalledTimes(1);
});
