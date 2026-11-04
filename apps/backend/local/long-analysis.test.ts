import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  rm,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { unpageDocument } from "./paged-document.ts";
import { AnalysisChunks } from "./analysis-chunks.ts";
import {
  analyzeLongOwner,
  longAnalysisPlan,
  reconcileChunkSeam,
} from "./long-analysis.ts";
import { resolveOwnerCapacity } from "../../../packages/contracts/local/capacity.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";
import type { OwnerAnalysisPorts } from "./analysis.ts";
import type { OwnerAnalysis } from "../../../packages/contracts/local/selection.ts";

const roots: string[] = [];
it("reconciles an overlapping seam word while preserving the next actual repetition", () => {
  const word = {
    id: "w_000001",
    text: "yes",
    punctuatedText: "yes",
    startMs: 479800,
    endMs: 480100,
    speakerId: null,
    confidence: null,
  };
  const repeated = { ...word, id: "w_000003", startMs: 480250, endMs: 480500 };
  expect(
    reconcileChunkSeam(
      [word],
      [{ ...word, id: "w_000002", startMs: 479900, endMs: 480200 }, repeated],
    ),
  ).toEqual([repeated]);
});
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

const syntheticIdeas = [
  10000, 40000, 92000, 140000, 192000, 235000, 270000, 312000, 340000, 402000,
  450000,
];
async function regionalFixture(jitter = 0) {
  const f = await fixture(600000);
  const words = syntheticIdeas.flatMap((start, idea) =>
    Array.from({ length: 12 }, (_, index) => ({
      id: "w_placeholder",
      text: `Idea${idea}word${index}`,
      punctuatedText: `Idea${idea}word${index}${index === 11 ? (jitter ? "!" : ".") : ""}`,
      startMs: start + index * 1000 + jitter,
      endMs: start + index * 1000 + 600 + jitter,
      speakerId: null,
      confidence: null,
    })),
  );
  f.transcribeWindow.mockImplementation(async (_workspace, window) =>
    words.filter((w) => w.startMs >= window.startMs && w.endMs <= window.endMs),
  );
  const selector: OwnerAnalysisPorts["select"] = async (
    available,
    _policy,
    signal,
    _instructions,
    _count,
    _excluded,
    core,
  ) => {
    signal.throwIfAborted();
    const found = syntheticIdeas.flatMap((_start, idea) => {
      const start = available.find((w) => w.text === `Idea${idea}word0`),
        end = available.find((w) => w.text === `Idea${idea}word11`);
      if (
        !start ||
        !end ||
        (core && !(start.startMs >= core.startMs && start.startMs < core.endMs))
      )
        return [];
      return [
        {
          startWordId: start.id,
          endWordId: end.id,
          title: start.punctuatedText,
          hook: start.punctuatedText,
          rationale: "Synthetic independent opportunity",
          evidence: [],
          caveats: [],
        },
      ];
    });
    // Attention-limited fake, not a claim about a fixed real-model result cap.
    return found.slice(0, 6);
  };
  f.select.mockImplementation(selector);
  return {
    ...f,
    selector,
    words,
    options: {
      ...f.options,
      capacity: resolveOwnerCapacity(
        { aiProvider: "codex" },
        { longSources: true, manyClips: true },
      ),
      value: {
        ...f.options.value,
        aiCount: "all",
        window: { startMs: 0, endMs: 480500 },
        aiDuration: { minMs: 10000, maxMs: 60000 },
      },
    },
  };
}

it.each([0, 170, -130])(
  "reviews every region rather than one global shortlist, retaining all eleven synthetic opportunities (clock jitter %i)",
  async (jitter) => {
    const f = await regionalFixture(jitter);
    expect(
      await f.selector(
        f.words,
        f.options.value.aiDuration,
        f.options.signal,
        "synthetic",
        "all",
      ),
    ).toHaveLength(6);
    const result = await analyzeLongOwner(f.options);
    expect(result.suggestions).toHaveLength(11);
    expect(
      result.suggestions.some(
        (m) => m.cut.startFrame < 7200 && m.cut.endFrame > 7200,
      ),
    ).toBe(true);
    expect(
      new Set(result.suggestions.map((c) => c.processingIdentity)).size,
    ).toBe(11);
    expect(result.coverage).toEqual({
      state: "complete",
      completed: 4,
      planned: 4,
      coveredThroughMs: 480500,
    });
    expect(f.transcribeWindow).toHaveBeenCalledTimes(1);
    expect(f.select).toHaveBeenCalledTimes(4);
    expect(f.select.mock.calls.map((call) => call[6])).toEqual([
      { startMs: 0, endMs: 120000 },
      { startMs: 120000, endMs: 240000 },
      { startMs: 240000, endMs: 360000 },
      { startMs: 360000, endMs: 480500 },
    ]);
    expect(
      f.select.mock.calls.every(
        ([words]) => words.at(-1)!.endMs - words[0]!.startMs <= 240000,
      ),
    ).toBe(true);
    f.select.mockClear();
    f.transcribeWindow.mockClear();
    const restored = await analyzeLongOwner(f.options);
    expect(restored.calls).toEqual({ transcription: 0, selection: 0 });
    expect(restored.suggestions).toEqual(result.suggestions);
    expect(f.select).not.toHaveBeenCalled();
    expect(f.transcribeWindow).not.toHaveBeenCalled();
  },
);

it("retains successful regional reviews and resumes only failed/missing selections with the same ASR", async () => {
  const f = await regionalFixture();
  f.select
    .mockImplementationOnce(f.selector)
    .mockRejectedValueOnce(Error("codex_limit"));
  const partial = await analyzeLongOwner(f.options);
  expect(partial.coverage).toMatchObject({
    state: "partial",
    completed: 1,
    planned: 4,
    failure: "codex_limit",
  });
  expect(f.select).toHaveBeenCalledTimes(2);
  expect(f.transcribeWindow).toHaveBeenCalledTimes(1);
  f.select.mockClear();
  f.transcribeWindow.mockClear();
  const retry = await analyzeLongOwner(f.options);
  expect(retry.suggestions).toHaveLength(11);
  expect(retry.calls).toEqual({ transcription: 0, selection: 3 });
  expect(f.select).toHaveBeenCalledTimes(3);
  expect(f.transcribeWindow).not.toHaveBeenCalled();
});

it("copies selected-coverage anchors with regional receipts and restores identical choices without inference", async () => {
  const f = await regionalFixture();
  const result = await analyzeLongOwner(f.options);
  const restored = await mkdtemp(
    join(tmpdir(), "clipbuilder-regional-restore-"),
  );
  roots.push(restored);
  await f.options.chunks.copyTo(restored, f.options.signal);
  const copied = new AnalysisChunks(restored, async () => {});
  let anchors = 0;
  const directory = join(restored, "analysis-chunks");
  for (const name of await readdir(directory)) {
    if (!/^[a-f0-9]{64}\.json$/u.test(name)) continue;
    const path = join(directory, name);
    const record = await unpageDocument(
      path,
      JSON.parse(await readFile(path, "utf8")),
      f.options.signal,
    );
    if (
      typeof record !== "object" ||
      record === null ||
      !("key" in record) ||
      typeof record.key !== "string"
    )
      continue;
    const receipt = await copied.read(record.key, f.options.signal);
    if (receipt?.kind === "selection") anchors += receipt.anchors?.length ?? 0;
  }
  expect(anchors).toBe(11);
  f.select.mockClear();
  f.transcribeWindow.mockClear();
  const recovered = await analyzeLongOwner({ ...f.options, chunks: copied });
  expect(recovered.suggestions).toEqual(result.suggestions);
  expect(recovered.calls).toEqual({ transcription: 0, selection: 0 });
  expect(f.select).not.toHaveBeenCalled();
  expect(f.transcribeWindow).not.toHaveBeenCalled();
});

it("accepts empty regions without a fill loop and retains cross-boundary opportunities and exact duplicates only once", async () => {
  const f = await regionalFixture();
  f.select.mockImplementation(async (...args) => {
    const found = await f.selector(...args);
    return args[6]?.startMs === 120000 ? [] : [...found, ...found];
  });
  const result = await analyzeLongOwner(f.options);
  expect(result.coverage?.state).toBe("complete");
  expect(f.select).toHaveBeenCalledTimes(4);
  expect(result.suggestions).toHaveLength(8);
  expect(
    new Set(
      result.suggestions.map((m) => `${m.cut.startFrame}:${m.cut.endFrame}`),
    ).size,
  ).toBe(8);
  // 11.6-second opportunity starts near a core boundary and ends in its context.
  expect(
    result.suggestions.some((m) => m.cut.startFrame === (235000 * 30) / 1000),
  ).toBe(false); // deliberately empty second core
  expect(f.select.mock.calls[1]![0].some((w) => w.startMs >= 240000)).toBe(
    true,
  ); // Crossing words and neighboring context survive.
});
const capacity = resolveOwnerCapacity(
  { aiProvider: "codex" },
  { longSources: true, manyClips: false },
);

it("reconciles repeated canonical passages and overlapping padding into one complete non-overlapping result", async () => {
  const f = await fixture(500000);
  f.select.mockImplementation(async (words) =>
    [299000, 300000, 302000].flatMap((at) => {
      const word = words.find((w) => w.startMs === at);
      return word
        ? [
            {
              startWordId: word.id,
              endWordId: word.id,
              title: word.punctuatedText,
              hook: word.punctuatedText,
              rationale: "Synthetic",
              evidence: [],
              caveats: [],
            },
          ]
        : [];
    }),
  );
  const result = await analyzeLongOwner({
    ...f.options,
    value: {
      ...f.options.value,
      aiCount: "all",
      window: { startMs: 0, endMs: 480500 },
      aiDuration: { minMs: 10000, maxMs: 60000 },
    },
  });
  expect(result.suggestions).toHaveLength(1);
  expect(result.suggestions[0]!.cut.startFrame).toBeLessThanOrEqual(
    (299000 * 30) / 1000,
  );
  expect(result.suggestions[0]!.cut.endFrame).toBeGreaterThan(
    (302000 * 30) / 1000,
  );
  const repeated = await analyzeLongOwner({
    ...f.options,
    value: {
      ...f.options.value,
      aiCount: "all",
      window: { startMs: 0, endMs: 480500 },
      aiDuration: { minMs: 10000, maxMs: 60000 },
    },
  });
  expect(repeated.suggestions).toEqual(result.suggestions);
  expect(repeated.calls).toEqual({ transcription: 0, selection: 0 });
  expect(f.select).toHaveBeenCalledTimes(4);
});

it("skips a silent review core even when neighboring context has speech", async () => {
  const f = await fixture(400000);
  f.transcribeWindow.mockImplementation(async () =>
    [115000, ...Array.from({ length: 12 }, (_, i) => 241000 + i * 1000)].map(
      (at) => ({
        id: "w_placeholder",
        text: "Synthetic",
        punctuatedText: "Synthetic",
        startMs: at,
        endMs: at + 600,
        speakerId: null,
        confidence: null,
      }),
    ),
  );
  f.select.mockImplementation(
    async (words, _policy, _signal, _instructions, _count, _excluded, core) =>
      core?.startMs === 240000
        ? [
            {
              startWordId: words.find((w) => w.startMs === 241000)!.id,
              endWordId: words.at(-1)!.id,
              title: "Synthetic",
              hook: "Synthetic",
              rationale: "Synthetic",
              evidence: [],
              caveats: [],
            },
          ]
        : [],
  );
  const result = await analyzeLongOwner({
    ...f.options,
    value: {
      ...f.options.value,
      aiCount: "all",
      window: { startMs: 0, endMs: 360000 },
    },
  });
  expect(result.coverage).toMatchObject({
    state: "complete",
    completed: 3,
    planned: 3,
  });
  expect(result.calls).toEqual({ transcription: 1, selection: 2 });
  expect(f.select).toHaveBeenCalledTimes(2);
  expect(f.select.mock.calls.map((call) => call[6]?.startMs)).toEqual([
    0, 240000,
  ]);
  expect(result.suggestions).toHaveLength(1);
});

it("bounds a long Find all pass to serial review requests while preserving eight-minute ASR work", async () => {
  const f = await fixture(7245000);
  let selecting = false;
  const implementation = f.select.getMockImplementation()!;
  f.select.mockImplementation(async (...args) => {
    expect(selecting).toBe(false);
    selecting = true;
    expect(args[0].at(-1)!.endMs - args[0][0]!.startMs).toBeLessThanOrEqual(
      180000,
    );
    await Promise.resolve();
    try {
      return await implementation(...args);
    } finally {
      selecting = false;
    }
  });
  const result = await analyzeLongOwner({
    ...f.options,
    value: { ...f.options.value, aiCount: "all" },
  });
  expect(result.coverage).toEqual({
    state: "complete",
    completed: 61,
    planned: 61,
    coveredThroughMs: 7245000,
  });
  expect(f.select).toHaveBeenCalledTimes(61);
  expect(f.transcribeWindow).toHaveBeenCalledTimes(16);
  expect(result.words).toEqual([]);
});

it("keeps global manual exclusions and canonical references across regional context", async () => {
  const f = await regionalFixture();
  const result = await analyzeLongOwner({
    ...f.options,
    value: {
      ...f.options.value,
      ranges: [{ id: crypto.randomUUID(), startMs: 110000, endMs: 125000 }],
    },
  });
  expect(result.manual).toHaveLength(1);
  expect(f.transcribeWindow).toHaveBeenCalledTimes(1);
  for (const call of f.select.mock.calls)
    expect(call[5]).toContainEqual({ startFrame: 3300, endFrame: 3750 });
  expect(result.coverage?.state).toBe("complete");
});

it("stops later reviews on cancellation and restarts only incomplete units after explicit retry", async () => {
  const f = await regionalFixture(),
    controller = new AbortController();
  f.select
    .mockImplementationOnce(f.selector)
    .mockImplementationOnce(async () => {
      controller.abort();
      throw Error("synthetic_cancel");
    });
  const result = await analyzeLongOwner({
    ...f.options,
    signal: controller.signal,
  });
  expect(result.coverage).toMatchObject({
    state: "canceled",
    completed: 1,
    planned: 4,
  });
  expect(f.select).toHaveBeenCalledTimes(2);
  f.select.mockClear();
  f.transcribeWindow.mockClear();
  const retried = await analyzeLongOwner(f.options);
  expect(retried.calls).toEqual({ transcription: 0, selection: 3 });
  expect(retried.suggestions).toHaveLength(11);
});

it("handles offset boundaries and rejects invalid planner arithmetic", async () => {
  expect([...longAnalysisPlan(119500, 360500, 120000)]).toEqual([
    { startMs: 119500, endMs: 240000 },
    { startMs: 240000, endMs: 360500 },
  ]);
  expect(() => [...longAnalysisPlan(0, 10000, 0)]).toThrow(
    "analysis_plan_invalid",
  );
  const f = await regionalFixture();
  const result = await analyzeLongOwner({
    ...f.options,
    value: { ...f.options.value, window: { startMs: 119500, endMs: 360500 } },
  });
  expect(result.coverage).toMatchObject({
    state: "complete",
    completed: 2,
    planned: 2,
    coveredThroughMs: 360500,
  });
  expect(f.select).toHaveBeenCalledTimes(2);
  expect(
    f.select.mock.calls.every(([words]) =>
      words.every((w) => w.startMs >= 119500 && w.endMs <= 360500),
    ),
  ).toBe(true);
});
async function fixture(durationMs = 7_200_000) {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-long-analysis-"));
  roots.push(root);
  const workspace: OwnerWorkspace = {
    id: randomUUID(),
    revision: 0,
    mode: "synthetic-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 20 * 1024 ** 3,
      durationMs,
      width: 320,
      height: 180,
      fps: 30,
    },
  };
  const transcribeWindow = vi.fn<
    NonNullable<OwnerAnalysisPorts["transcribeWindow"]>
  >(async (_workspace, window) => {
    const words = [];
    for (
      let at = Math.floor(window.startMs / 1000) * 1000;
      at < window.endMs;
      at += 1000
    )
      words.push({
        id: "w_000001",
        text: "fictional",
        punctuatedText: "fictional",
        startMs: at,
        endMs: at + 500,
        speakerId: null,
        confidence: null,
      });
    return words;
  });
  const select = vi.fn<OwnerAnalysisPorts["select"]>(async (words) => [
    {
      startWordId: words.at(-12)!.id,
      endWordId: words.at(-1)!.id,
      title: "fictional",
      hook: "fictional",
      rationale: "fictional",
      evidence: [],
      caveats: [],
    },
  ]);
  const ports: OwnerAnalysisPorts = {
    mode: "synthetic-ai",
    transcribe: vi.fn(() => {
      throw Error("whole_source_forbidden");
    }),
    transcribeWindow,
    select,
  };
  const checkpoint = vi.fn(async (result: OwnerAnalysis) => {
    void result;
  });
  const options = {
    workspace,
    value: {
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [],
      aiDuration: { minMs: 10_000, maxMs: 30_000 },
      aiCount: 2,
      manualOnly: false,
    },
    ports,
    capacity,
    chunks: new AnalysisChunks(root, async () => {}),
    checkpoint,
    signal: new AbortController().signal,
  };
  return { root, options, select, transcribeWindow, checkpoint };
}
it("retains twenty-five imported manual ranges through long-source review and checkpoints without selection calls", async () => {
  const f = await fixture();
  const ranges = Array.from({ length: 25 }, (_, i) => ({
    id: randomUUID(),
    startMs: i * 4000,
    endMs: i * 4000 + 2000,
  }));
  const transcribeCut = vi.fn<NonNullable<OwnerAnalysisPorts["transcribeCut"]>>(
    async () => [],
  );
  const result = await analyzeLongOwner({
    ...f.options,
    capacity: resolveOwnerCapacity({ aiProvider: "codex" }),
    value: { ...f.options.value, ranges, manualOnly: true },
    ports: { ...f.options.ports, transcribeCut },
  });
  expect(result.manual).toHaveLength(25);
  expect(result.inputs.ranges).toEqual(ranges);
  expect(result.coverage).toMatchObject({
    state: "complete",
    planned: 25,
    completed: 25,
  });
  expect(transcribeCut).toHaveBeenCalledTimes(25);
  expect(f.transcribeWindow).not.toHaveBeenCalled();
  expect(f.select).not.toHaveBeenCalled();
  expect(f.checkpoint).toHaveBeenCalledTimes(25);
});
it("covers two hours and later audio in bounded serial requests, and restores acknowledged work with zero calls", async () => {
  const f = await fixture(7_200_000 + 45_000);
  const result = await analyzeLongOwner(f.options);
  expect(result.coverage).toEqual({
    state: "complete",
    completed: 16,
    planned: 16,
    coveredThroughMs: 7_245_000,
  });
  expect(f.transcribeWindow).toHaveBeenCalledTimes(16);
  expect(f.select).toHaveBeenCalledTimes(16);
  expect(result.suggestions.at(-1)!.cut.endFrame).toBeGreaterThan(
    (7_200_000 * 30) / 1000,
  );
  expect(
    f.transcribeWindow.mock.calls.every(
      ([, window]) => window.endMs - window.startMs <= 484_000,
    ),
  ).toBe(true);
  expect(result.words).toEqual([]);
  const restored = join(f.root, "restored");
  await mkdir(restored);
  // Retain CL-189's acknowledged plain receipt format across the paged upgrade.
  const archive = join(f.root, "analysis-chunks");
  for (const entry of await readdir(archive))
    if (entry.endsWith(".json")) {
      const path = join(archive, entry),
        value = JSON.parse(await readFile(path, "utf8"));
      if (value.format === "clipbuilder-paged-v1") {
        await writeFile(
          path,
          JSON.stringify(await unpageDocument(path, value, f.options.signal)),
        );
        break;
      }
    }
  await f.options.chunks.copyTo(restored, f.options.signal);
  await f.options.chunks.copyTo(restored, f.options.signal);
  f.select.mockClear();
  f.transcribeWindow.mockClear();
  const retry = await analyzeLongOwner({
    ...f.options,
    chunks: new AnalysisChunks(restored, async () => {}),
  });
  expect(retry.calls).toEqual({ transcription: 0, selection: 0 });
  expect(f.select).not.toHaveBeenCalled();
  expect(f.transcribeWindow).not.toHaveBeenCalled();
  expect(retry.suggestions).toEqual(result.suggestions);
});
it("retains completed chunks after a middle failure and resumes only the missing work", async () => {
  const f = await fixture();
  const implementation = f.transcribeWindow.getMockImplementation()!;
  f.transcribeWindow
    .mockImplementationOnce(implementation)
    .mockImplementationOnce(implementation)
    .mockRejectedValueOnce(Error("synthetic_rate_limit"));
  const partial = await analyzeLongOwner(f.options);
  expect(partial.coverage).toMatchObject({
    state: "partial",
    completed: 1,
    coveredThroughMs: 480_000,
  });
  expect(f.transcribeWindow).toHaveBeenCalledTimes(3);
  expect(f.select).toHaveBeenCalledTimes(1);
  const retry = await analyzeLongOwner(f.options);
  expect(retry.coverage?.state).toBe("complete");
  expect(retry.calls).toEqual({ transcription: 13, selection: 14 });
});
it("keeps seam context, unique stable word IDs, source clocks, window bounds and exclusions", async () => {
  const f = await fixture(1_200_000);
  const result = await analyzeLongOwner({
    ...f.options,
    value: {
      ...f.options.value,
      window: { startMs: 60_000, endMs: 1_020_000 },
    },
  });
  expect(result.coverage).toMatchObject({
    completed: 3,
    planned: 3,
    coveredThroughMs: 1_020_000,
  });
  const words = f.select.mock.calls[0]![0];
  expect(words.at(-1)!.startMs).toBe(539_000); // sixty seconds past the aligned 480-second seam
  expect(new Set(words.map((word) => word.id)).size).toBe(words.length);
  expect(words.every((w) => /^w_[a-f0-9]{32}$/.test(w.id))).toBe(true);
  expect(f.select.mock.calls[1]![0][0]!.startMs).toBe(480_000);
  expect([...longAnalysisPlan(0, 21_600_000)]).toHaveLength(45);
});
it("reuses wider acknowledged speech for a smaller window, handles subsecond tails, and never retries canceled work automatically", async () => {
  const f = await fixture(960_500);
  expect([...longAnalysisPlan(0, 960_500)]).toHaveLength(2);
  await analyzeLongOwner(f.options);
  f.transcribeWindow.mockClear();
  const smaller = await analyzeLongOwner({
    ...f.options,
    value: { ...f.options.value, window: { startMs: 60_000, endMs: 900_000 } },
  });
  expect(smaller.calls.transcription).toBe(0);
  expect(f.transcribeWindow).not.toHaveBeenCalled();
  const controller = new AbortController();
  f.select.mockImplementationOnce(async () => {
    controller.abort();
    throw Error("synthetic_cancel");
  });
  await expect(
    analyzeLongOwner({
      ...f.options,
      value: { ...f.options.value, policyRevision: 1 },
      signal: controller.signal,
    }),
  ).rejects.toThrow();
  expect(f.checkpoint.mock.calls.at(-1)![0].coverage?.state).toBe("canceled");
  expect(f.select.mock.calls.at(-1)![0].length).toBeGreaterThan(0);
});
it("processes more than the legacy full-transcript word limit without a growing response or WAV", async () => {
  const f = await fixture();
  f.transcribeWindow.mockImplementation(async (_workspace, window) =>
    Array.from(
      { length: Math.floor((window.endMs - window.startMs) / 100) },
      (_, i) => ({
        id: "w_000001",
        text: "fictional",
        punctuatedText: "fictional",
        startMs: window.startMs + i * 100,
        endMs: window.startMs + i * 100 + 50,
        speakerId: null,
        confidence: null,
      }),
    ),
  );
  const result = await analyzeLongOwner(f.options);
  expect(result.coverage?.state).toBe("complete");
  expect(f.transcribeWindow.mock.calls).toHaveLength(15);
  expect(
    f.select.mock.calls.reduce((sum, [words]) => sum + words.length, 0),
  ).toBeGreaterThan(30_000);
  expect(result.words).toEqual([]);
});
