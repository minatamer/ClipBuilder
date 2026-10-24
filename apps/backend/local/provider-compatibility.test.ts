import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { analyzeOwner, type OwnerAnalysisPorts } from "./analysis.ts";
import { OwnerClipBatch, type OwnerClipPorts } from "./clip-batch.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import {
  OWNER_FPS,
  type OwnerWorkspace,
} from "../../../packages/contracts/local/index.ts";
import type {
  OwnerAnalysis,
  OwnerAnalysisInputs,
  OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import { CONTEXTUAL_PICTURE_POLICY } from "../../../packages/contracts/src/contextual-picture.schema.ts";

// All adapters below are injected test doubles. "provider-ai" and "generated"
// exercise future adapter metadata; no real AI, source decoding or network runs.
const timings: [string, number, number][] = [
  ["Coral", 711, 1009],
  ["reefs", 1047, 1533],
  ["shelter", 1591, 2026],
  ["young", 2187, 2411],
  ["fish.", 2497, 2973],
  ["Patient", 10117, 10619],
  ["restoration", 10743, 11477],
  ["can", 11701, 11929],
  ["revive", 12213, 12973],
  ["damaged", 13301, 13781],
  ["ecosystems.", 13937, 14789],
  ["Patient", 30117, 30619],
  ["restoration", 30743, 31477],
  ["can", 31701, 31929],
  ["revive", 32213, 32973],
  ["damaged", 33301, 33781],
  ["ecosystems.", 33937, 34789],
];
const words: OwnerWord[] = timings.map(
  ([punctuatedText, startMs, endMs], index) => ({
    id: `w_${String(index + 1).padStart(6, "0")}`,
    startMs,
    endMs,
    text: punctuatedText.replace(/[.]$/u, ""),
    punctuatedText,
    speakerId: index < 5 ? "spk_2" : "spk_7",
    confidence: index === 6 ? null : 0.973,
  }),
);
const reefBrief = {
  scene: "A coral reef providing shelter for young fish",
  searchQuery: "coral reefs shelter fish",
  requiredTerms: ["coral", "reefs"],
  avoidTerms: ["logos"],
};
const restorationBrief = {
  scene: "Ecological restoration of a damaged coral reef",
  searchQuery: "restoration damaged ecosystems",
  requiredTerms: ["restoration", "ecosystems"],
  avoidTerms: ["logos"],
};
const sourceBytes = Buffer.from("synthetic-adapter-compatibility-source");
let directory: string,
  files: WorkspaceFiles,
  workspace: OwnerWorkspace,
  inputs: OwnerAnalysisInputs,
  analysis: OwnerAnalysis,
  batch: OwnerClipBatch;
let analysisPorts: {
  mode: OwnerAnalysisPorts["mode"];
  transcribe: ReturnType<typeof vi.fn<OwnerAnalysisPorts["transcribe"]>>;
  select: ReturnType<typeof vi.fn<OwnerAnalysisPorts["select"]>>;
};
let clipPorts: {
  mode: OwnerClipPorts["mode"];
  plan: ReturnType<typeof vi.fn<OwnerClipPorts["plan"]>>;
  image: ReturnType<typeof vi.fn<OwnerClipPorts["image"]>>;
  render: ReturnType<typeof vi.fn<OwnerClipPorts["render"]>>;
};

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-adapter-test-"));
  files = new WorkspaceFiles(directory);
  workspace = {
    id: await files.create(),
    revision: 3,
    mode: "provider-ai",
    source: {
      fingerprint: createHash("sha256").update(sourceBytes).digest("hex"),
      bytes: sourceBytes.length,
      durationMs: 44917,
      width: 320,
      height: 180,
      fps: 29.97,
    },
  };
  await writeFile(await files.file(workspace.id, "source.mp4"), sourceBytes);
  inputs = {
    sourceRevision: workspace.revision,
    policyRevision: 7,
    ranges: [
      { id: randomUUID(), startMs: 619, endMs: 3211 },
      { id: randomUUID(), startMs: 10217, endMs: 15093 },
    ],
    aiDuration: { minMs: 10133, maxMs: 11877 },
    manualOnly: false,
  };
  analysisPorts = {
    mode: "provider-ai",
    transcribe: vi.fn(async () => structuredClone(words)),
    select: vi.fn(async () => [
      {
        startWordId: "w_000012",
        endWordId: "w_000017",
        title: "Patient restoration",
        hook: "restoration can revive",
        rationale: "Restoration leads to a clear ecological benefit.",
        evidence: [
          {
            signal: "immediate-hook",
            wordIds: ["w_000012", "w_000013"],
            note: "The statement introduces its subject immediately.",
          },
          {
            signal: "clear-payoff",
            wordIds: ["w_000015", "w_000016", "w_000017"],
            note: "The ending describes a concrete result.",
          },
        ],
        caveats: [],
      },
    ]),
  };
  analysis = await analyzeOwner(
    workspace,
    inputs,
    analysisPorts,
    new AbortController().signal,
  );
  const jpeg = await sharp({
    create: {
      width: 320,
      height: 180,
      channels: 3,
      background: "#416974",
    },
  })
    .jpeg()
    .toBuffer();
  clipPorts = {
    mode: "provider-ai",
    plan: vi.fn(async ({ moment }) => [
      {
        startFrame: 0,
        endFrame: Math.min(90, moment.cut.endFrame - moment.cut.startFrame),
        brief:
          moment.cues[0]?.id === "w_000001"
            ? structuredClone(reefBrief)
            : structuredClone(restorationBrief),
        evidenceWordIds: moment.cues.slice(0, 2).map((word) => word.id),
      },
    ]),
    image: vi.fn(async () => ({
      bytes: Buffer.from(jpeg),
      width: 320,
      height: 180,
      origin: "generated",
    })),
    render: vi.fn(async (job) => {
      if (job.operation !== "clip") throw new Error("wrong_operation");
      // Synthetic bytes prove ownership/revisions, not native MP4 validity.
      const output = Buffer.from(
        `synthetic:${job.clipId}:${job.renderRevision}`,
      );
      await writeFile(
        await files.output(workspace.id, job.clipId, job.renderRevision),
        output,
      );
      return {
        operation: "clip",
        frames: job.overlay.frames,
        bytes: output.length,
        durationMs: Math.round((job.overlay.frames * 1000) / OWNER_FPS),
      };
    }),
  };
  batch = new OwnerClipBatch(workspace, files, clipPorts);
});

afterEach(async () => {
  await batch.close();
  expect(await readFile(await files.file(workspace.id, "source.mp4"))).toEqual(
    sourceBytes,
  );
  await files.close();
  expect(await readdir(directory)).toEqual([]);
  await rm(directory, { recursive: true, force: true });
});

const request = () => ({
  operationId: randomUUID(),
  analysisId: analysis.id,
  sourceRevision: workspace.revision,
  policyRevision: inputs.policyRevision,
  momentIds: [...analysis.manual, ...analysis.suggestions].map(
    (moment) => moment.id,
  ),
});

it("carries arbitrary adapter words and grounded picture inputs through manual/AI clips and deterministic re-export", async () => {
  expect(analysis.mode).toBe("provider-ai");
  expect(analysis.words).toEqual(words);
  expect(analysis.calls).toEqual({ transcription: 1, selection: 1 });
  expect(analysisPorts.select.mock.calls[0]?.[0]).toEqual(words);
  expect(analysisPorts.select.mock.calls[0]?.[1]).toEqual(inputs.aiDuration);
  expect(analysis.manual.map((moment) => moment.cut)).toEqual([
    { startFrame: 19, endFrame: 96 },
    { startFrame: 307, endFrame: 453 },
  ]);
  expect(analysis.suggestions[0]?.cut).toEqual({
    startFrame: 903,
    endFrame: 1207,
  });
  expect(analysis.suggestions[0]?.evidence?.hook).toBe(
    "restoration can revive",
  );

  const submission = request();
  await batch.submit(submission, analysis);
  await batch.drain();
  const initial = batch.snapshot();
  expect(initial.clips.map((clip) => clip.state)).toEqual([
    "ready",
    "ready",
    "ready",
  ]);
  expect(initial.clips.map((clip) => clip.mode)).toEqual([
    "provider-ai",
    "provider-ai",
    "provider-ai",
  ]);
  expect(initial.clips.map((clip) => clip.base?.overlay.frames)).toEqual([
    77, 146, 304,
  ]);
  expect(initial.clips[0]?.base?.words[0]).toEqual({
    ...words[0],
    startMs: 78,
    endMs: 376,
  });
  for (const [index, clip] of initial.clips.entries()) {
    const moment = [...analysis.manual, ...analysis.suggestions][index]!;
    expect(clip.base?.words).toEqual(moment.cues);
    expect(clip.base?.processingIdentity).toBe(moment.processingIdentity);
    expect(clip.base?.fingerprint).toBe(workspace.source.fingerprint);
    expect(clipPorts.plan.mock.calls[index]?.[0].workspace).toEqual(workspace);
    expect(clipPorts.plan.mock.calls[index]?.[0].clipId).toBe(clip.id);
    expect(clip.calls).toEqual({ plan: 1, image: 1, render: 1 });
    expect(clip.assets.map((asset) => asset.origin)).toEqual(["generated"]);
    expect(clip.base?.overlay.visuals.map((cue) => cue.origin)).toEqual([
      "generated",
    ]);
    const imageInput = clipPorts.image.mock.calls[index]![0];
    expect(imageInput.clipId).toBe(clip.id);
    expect(imageInput.words).toEqual(moment.cues);
    expect(imageInput.cue.brief).toEqual(
      index === 0 ? reefBrief : restorationBrief,
    );
    expect(imageInput.cue.evidenceWordIds).toEqual(
      moment.cues.slice(0, 2).map((word) => word.id),
    );
  }
  const first = initial.clips[0]!,
    original = await readFile(await files.output(workspace.id, first.id, 0)),
    reexport = { operationId: randomUUID(), expectedRevision: 0 };
  await batch.submit(submission, analysis);
  await Promise.all([
    batch.render(first.id, reexport),
    batch.render(first.id, reexport),
  ]);
  await batch.drain();
  const current = batch.snapshot().clips[0]!;
  expect(current.base).toEqual(first.base);
  expect(current.outputs.map((output) => output.revision)).toEqual([0, 1]);
  expect(current.outputs[0]?.id).not.toBe(current.outputs[1]?.id);
  expect(await readFile(await files.output(workspace.id, first.id, 0))).toEqual(
    original,
  );
  expect(analysisPorts.transcribe).toHaveBeenCalledTimes(1);
  expect(analysisPorts.select).toHaveBeenCalledTimes(1);
  expect(clipPorts.plan).toHaveBeenCalledTimes(3);
  expect(clipPorts.image).toHaveBeenCalledTimes(3);
  expect(clipPorts.render).toHaveBeenCalledTimes(4);
});

it.each([
  ["invented", "w_999999", 0, 70],
  ["outside the picture cue", "w_000001", 70, 77],
])(
  "retains %s planner evidence and completes the clip without another plan",
  async (_reason, wordId, startFrame, endFrame) => {
    const validPlan = clipPorts.plan.getMockImplementation()!;
    clipPorts.plan.mockImplementationOnce(async (input, signal) => {
      const plan = await validPlan(input, signal);
      return [{ ...plan[0]!, startFrame, endFrame, evidenceWordIds: [wordId] }];
    });
    await batch.submit(
      { ...request(), momentIds: [analysis.manual[0]!.id] },
      analysis,
    );
    await batch.drain();
    const clip = batch.snapshot().clips[0]!;
    expect(clip.state).toBe("ready");
    expect(clip.calls).toEqual({ plan: 1, image: 1, render: 1 });
    expect(clip.base?.overlay.visuals).toHaveLength(1);
    expect(clip.assets).toHaveLength(1);
    expect(clip.outputs).toHaveLength(1);
    expect(clipPorts.plan).toHaveBeenCalledTimes(1);
    expect(clipPorts.image).toHaveBeenCalledTimes(1);
    expect(clipPorts.render).toHaveBeenCalledTimes(1);
  },
);

it("fails closed when a provider-shaped image adapter returns synthetic provenance", async () => {
  const validImage = clipPorts.image.getMockImplementation()!;
  clipPorts.image.mockImplementationOnce(async (input, signal) => ({
    ...(await validImage(input, signal))!,
    origin: "synthetic",
  }));
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const clip = batch.snapshot().clips[0]!;
  expect(clip.mode).toBe("provider-ai");
  expect(clip.state).toBe("failed");
  expect(clip.calls).toEqual({ plan: 1, image: 1, render: 0 });
  expect(clip.base).toBeNull();
  expect(clip.assets).toEqual([]);
  expect(clip.outputs).toEqual([]);
  expect(clipPorts.image).toHaveBeenCalledTimes(1);
  expect(clipPorts.render).toHaveBeenCalledTimes(0);
});

it("does not admit synthetic analysis into a provider-shaped batch", async () => {
  await expect(
    batch.submit(request(), { ...analysis, mode: "synthetic-ai" }),
  ).rejects.toThrow("stale_analysis");
  expect(batch.snapshot().clips).toEqual([]);
  expect(clipPorts.plan).toHaveBeenCalledTimes(0);
  expect(clipPorts.image).toHaveBeenCalledTimes(0);
  expect(clipPorts.render).toHaveBeenCalledTimes(0);
});

it.each(["synthetic-ai", "unavailable"] as const)(
  "rejects %s analysis mode before transcription or discovery",
  async (mode) => {
    await expect(
      analyzeOwner(
        { ...workspace, mode },
        inputs,
        analysisPorts,
        new AbortController().signal,
      ),
    ).rejects.toThrow("analysis_mode_mismatch");
    // Setup's single explicit analysis is the only admitted operation.
    expect(analysisPorts.transcribe).toHaveBeenCalledTimes(1);
    expect(analysisPorts.select).toHaveBeenCalledTimes(1);
    expect(clipPorts.plan).toHaveBeenCalledTimes(0);
  },
);

it("normalizes adapter raster bytes and derives dimensions/digest instead of trusting metadata claims", async () => {
  const png = await sharp({
    create: {
      width: 1200,
      height: 600,
      channels: 4,
      background: "#41697480",
    },
  })
    .withMetadata({
      exif: { IFD0: { ImageDescription: "Synthetic test metadata" } },
    })
    .png()
    .toBuffer();
  const claimedPicture = {
    bytes: png,
    origin: "generated" as const,
    width: 1,
    height: 1,
  };
  clipPorts.image.mockResolvedValueOnce(claimedPicture);
  await batch.submit(
    { ...request(), momentIds: [analysis.manual[0]!.id] },
    analysis,
  );
  await batch.drain();
  const clip = batch.snapshot().clips[0]!,
    asset = clip.assets[0]!;
  expect(clip.state).toBe("ready");
  expect(asset).toEqual(
    expect.objectContaining({
      width: 920,
      height: 460,
      origin: "generated",
    }),
  );
  const saved = await readFile(await files.asset(workspace.id, asset.id)),
    metadata = await sharp(saved).metadata();
  expect(saved).not.toEqual(png);
  expect(asset.bytes).toBe(saved.length);
  expect(asset.digest).toBe(createHash("sha256").update(saved).digest("hex"));
  expect(metadata.format).toBe("jpeg");
  expect(metadata.exif).toBeUndefined();
  expect(metadata.hasAlpha).toBe(false);
  expect(clipPorts.plan).toHaveBeenCalledTimes(1);
  expect(clipPorts.image).toHaveBeenCalledTimes(1);
  expect(clipPorts.render).toHaveBeenCalledTimes(1);
});

it.each([
  ["malformed raster", Buffer.from("synthetic invalid image bytes")],
  [
    "oversized response",
    Buffer.alloc(CONTEXTUAL_PICTURE_POLICY.maxDownloadBytes + 1),
  ],
])(
  "rejects a %s before writing an asset or rendering",
  async (_reason, bytes) => {
    clipPorts.image.mockResolvedValueOnce({ bytes, origin: "generated" });
    await batch.submit(
      { ...request(), momentIds: [analysis.manual[0]!.id] },
      analysis,
    );
    await batch.drain();
    const clip = batch.snapshot().clips[0]!;
    expect(clip.state).toBe("failed");
    expect(clip.assets).toEqual([]);
    expect(clip.outputs).toEqual([]);
    expect(clip.calls).toEqual({ plan: 1, image: 1, render: 0 });
    expect(clipPorts.image).toHaveBeenCalledTimes(1);
    expect(clipPorts.render).toHaveBeenCalledTimes(0);
    expect(await readdir(join(directory, workspace.id))).toEqual([
      "source.mp4",
    ]);
  },
);
