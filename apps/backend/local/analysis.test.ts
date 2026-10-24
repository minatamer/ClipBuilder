import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import {
  analyzeOwner,
  fitOwnerAiWindow,
  ownerLocalCues,
  type OwnerAnalysisPorts,
} from "./analysis.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { ownerAvailableWindows } from "./selection-windows.ts";
import {
  candidateSelectionPolicy,
  CANDIDATE_SELECTION_POLICY,
} from "../src/analysis/analysis.prompt.ts";
import {
  ownerCut,
  parseOwnerTimestamp,
  ownerTimestamp,
  type OwnerAnalysisInputs,
} from "../../../packages/contracts/local/selection.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";
import { startSessionRequestSchema } from "../../../packages/contracts/src/api.schema.ts";

const workspace = (durationMs = 240_000): OwnerWorkspace => ({
  id: randomUUID(),
  revision: 0,
  mode: "synthetic-ai",
  source: {
    fingerprint: "b".repeat(64),
    bytes: 1000,
    durationMs,
    width: 320,
    height: 180,
    fps: 30,
  },
});
const range = (startMs: number, endMs: number) => ({
  id: randomUUID(),
  startMs,
  endMs,
});
const input = (minMs = 30_000, maxMs = minMs): OwnerAnalysisInputs => ({
  sourceRevision: 0,
  policyRevision: 1,
  ranges: [range(1001, 8999), range(70_000, 145_000)],
  aiDuration: { minMs, maxMs },
  manualOnly: false,
});
const ports = () => ({
  mode: "synthetic-ai" as const,
  transcribe: vi.fn(fakeOwnerAnalysis.transcribe),
  select: vi.fn(fakeOwnerAnalysis.select),
});
const signal = () => new AbortController().signal;

describe("owner manual ranges and independent discovery", () => {
  it.each([1, 5, 10])(
    "requests %i grounded suggestions without changing manual cuts or repeating calls",
    async (count) => {
      const provider = ports();
      const request = { ...input(), aiCount: count };
      const result = await analyzeOwner(
        workspace(600_000),
        request,
        provider,
        signal(),
      );
      expect(result.suggestions).toHaveLength(count);
      expect(result.manual.map((moment) => moment.cut)).toEqual(
        request.ranges.map((row) => ownerCut(row, 600_000)),
      );
      expect(result.inputs.aiCount).toBe(count);
      expect(provider.select.mock.calls[0]?.[3]).toContain(
        `owner requests ${count} independent final AI moments`,
      );
      expect(provider.select.mock.calls[0]?.[4]).toBe(count);
      expect(provider.select.mock.calls[0]?.[5]).toEqual(
        result.manual.map((moment) => moment.cut),
      );
      const proposed = await provider.select.mock.results[0]!.value;
      for (const proposal of proposed) {
        const first = result.words.find(
          (word) => word.id === proposal.startWordId,
        )!;
        const last = result.words.find(
          (word) => word.id === proposal.endWordId,
        )!;
        expect(
          result.manual.every(
            ({ cut }) =>
              Math.ceil((last.endMs * 30) / 1000) <= cut.startFrame ||
              Math.floor((first.startMs * 30) / 1000) >= cut.endFrame,
          ),
        ).toBe(true);
      }
      for (const suggestion of result.suggestions) {
        expect(
          result.manual.every(
            ({ cut }) =>
              suggestion.cut.endFrame <= cut.startFrame ||
              suggestion.cut.startFrame >= cut.endFrame,
          ),
        ).toBe(true);
      }
      expect(result.calls).toEqual({ transcription: 1, selection: 1 });
    },
  );
  it.each([0, -1, 11, 2.5, NaN, Infinity])(
    "rejects invalid count %s before any work",
    async (aiCount) => {
      const provider = ports();
      await expect(
        analyzeOwner(workspace(), { ...input(), aiCount }, provider, signal()),
      ).rejects.toThrow();
      expect(provider.transcribe).not.toHaveBeenCalled();
      expect(provider.select).not.toHaveBeenCalled();
    },
  );
  it("returns an honest shortfall without automatic retries or discarding manual cuts", async () => {
    const provider = ports();
    const result = await analyzeOwner(
      workspace(40_000),
      { ...input(), ranges: [range(0, 1000)], aiCount: 5 },
      provider,
      signal(),
    );
    expect(result.suggestions.length).toBeLessThan(5);
    expect(result.manual).toHaveLength(1);
    expect(result.calls).toEqual({ transcription: 1, selection: 1 });
  });
  it("freezes the submitted inputs and source identity before dispatch", async () => {
    const request = input(),
      current = workspace(),
      provider = ports();
    provider.transcribe.mockImplementationOnce(
      async (snapshot, cancellation) => {
        request.ranges = [];
        current.source.durationMs = 1000;
        return fakeOwnerAnalysis.transcribe(snapshot, cancellation);
      },
    );
    const result = await analyzeOwner(current, request, provider, signal());
    expect(result.inputs.ranges).toHaveLength(2);
    expect(result.manual).toHaveLength(2);
    expect(result.suggestions).toHaveLength(4);
  });
  it.each([
    [30_000, 30_000],
    [60_000, 60_000],
    [20_000, 45_000],
  ])(
    "enforces %i–%i AI bounds while preserving manual requests",
    async (min, max) => {
      const provider = ports();
      const request = input(min, max);
      const result = await analyzeOwner(
        workspace(),
        request,
        provider,
        signal(),
      );
      expect(result.inputs).toEqual(request);
      expect(result.manual).toHaveLength(2);
      expect(result.manual.map((moment) => moment.cut)).toEqual(
        request.ranges.map((row) => ownerCut(row, 240_000)),
      );
      expect(result.suggestions.length).toBeGreaterThan(0);
      for (const moment of result.suggestions) {
        const frames = moment.cut.endFrame - moment.cut.startFrame;
        expect(frames).toBeGreaterThanOrEqual(Math.ceil((min * 30) / 1000));
        expect(frames).toBeLessThanOrEqual(Math.floor((max * 30) / 1000));
        if (min === max) expect(frames).toBe((min * 30) / 1000);
      }
      expect(provider.transcribe).toHaveBeenCalledTimes(1);
      expect(provider.select).toHaveBeenCalledTimes(1);
      expect(provider.select.mock.calls[0]?.[3]).toContain(
        `${min / 1000}–${max / 1000} second physical window`,
      );
      expect(result.calls).toEqual({ transcription: 1, selection: 1 });
    },
  );
  it("reuses duplicate manual cuts without asking AI to rediscover them", async () => {
    const request = input();
    request.ranges = [range(0, 30_000), range(0, 30_000), range(1000, 8000)];
    const result = await analyzeOwner(workspace(), request, ports(), signal());
    expect(result.manual).toHaveLength(2);
    expect(result.manual[0]?.rangeIds).toHaveLength(2);
    expect(result.manual[0]?.evidence).toBeNull();
    expect(result.suggestions).toHaveLength(4);
    expect(
      new Set(
        [...result.manual, ...result.suggestions].map(
          (moment) => moment.processingIdentity,
        ),
      ).size,
    ).toBe(6);
    expect(result.inputs.ranges).toHaveLength(3);
  });
  it("logs overlapping proposals as advice and retains the requested usable results", async () => {
    const provider = ports();
    provider.select.mockImplementationOnce(
      async (words, _policy, cancellation, instructions) => {
        // Latest owner decision makes exclusions advisory after generation.
        const pool = await fakeOwnerAnalysis.select(
          words,
          { minMs: 10_000, maxMs: 10_000 },
          cancellation,
          instructions,
          5,
        );
        return [
          { ...pool[1]!, endWordId: pool[2]!.endWordId }, // partial overlap
          pool[2]!, // inside the manual cut
          { ...pool[1]!, endWordId: pool[4]!.endWordId }, // contains the manual cut
          { ...pool[0]!, endWordId: pool[1]!.endWordId }, // ends exactly at manual start
          { ...pool[4]!, endWordId: pool[5]!.endWordId }, // starts exactly at manual end
          ...pool.slice(6, 9),
        ];
      },
    );
    const result = await analyzeOwner(
      workspace(120_000),
      {
        ...input(10_000, 60_000),
        ranges: [range(20_000, 40_000)],
        aiCount: 5,
      },
      provider,
      signal(),
    );
    expect(result.suggestions.map(({ cut }) => cut)).toEqual([
      { startFrame: 300, endFrame: 900 },
      { startFrame: 600, endFrame: 900 },
      { startFrame: 300, endFrame: 1500 },
      { startFrame: 0, endFrame: 600 },
      { startFrame: 1200, endFrame: 1800 },
    ]);
    expect(result.calls).toEqual({ transcription: 1, selection: 1 });
    expect(provider.select).toHaveBeenCalledTimes(1);
  });
  it("unions overlapping reservations without changing manual cuts and skips discovery when no gap fits", async () => {
    const provider = ports();
    const request = {
      ...input(10_000),
      ranges: [range(31_000, 40_000), range(10_000, 23_000), range(0, 12_000)],
    };
    const result = await analyzeOwner(
      workspace(40_000),
      request,
      provider,
      signal(),
    );
    expect(result.manual.map(({ cut }) => cut)).toEqual(
      request.ranges.map((row) => ownerCut(row, 40_000)),
    );
    expect(result.suggestions).toEqual([]);
    expect(provider.transcribe).toHaveBeenCalledTimes(1);
    expect(provider.select).not.toHaveBeenCalled();
    expect(result.calls).toEqual({ transcription: 1, selection: 0 });
  });
  it("does not let a selector mutate manual cuts and retains overlapping returned results", async () => {
    const provider = ports();
    provider.select.mockImplementationOnce(
      async (words, duration, cancellation, instructions, count, excluded) => {
        // The private prompt copy cannot change the owner's manual cuts.
        Object.assign(excluded![0]!, { startFrame: 0, endFrame: 1 });
        return fakeOwnerAnalysis.select(
          words,
          duration,
          cancellation,
          instructions,
          count,
        );
      },
    );
    const result = await analyzeOwner(
      workspace(120_000),
      { ...input(10_000), ranges: [range(20_000, 40_000)], aiCount: 5 },
      provider,
      signal(),
    );
    expect(result.manual[0]?.cut).toEqual({ startFrame: 600, endFrame: 1200 });
    expect(result.suggestions).toHaveLength(5);
    expect(
      result.suggestions.every(
        ({ cut }) => cut.endFrame <= 600 || cut.startFrame >= 1200,
      ),
    ).toBe(false);
  });
  it("keeps silent manual cuts and skips selection when words are absent", async () => {
    const provider = ports();
    provider.transcribe.mockResolvedValue([]);
    const result = await analyzeOwner(workspace(), input(), provider, signal());
    expect(result.manual).toHaveLength(2);
    expect(result.manual[0]?.cues).toEqual([]);
    expect(result.suggestions).toEqual([]);
    expect(provider.transcribe).toHaveBeenCalledTimes(1);
    expect(provider.select).toHaveBeenCalledTimes(0);
  });
  it("preserves manual input on short sources, explicit manual-only runs and empty AI results", async () => {
    for (const manualOnly of [false, true]) {
      const provider = ports();
      const request = input();
      request.ranges = [range(200, 1200)];
      request.manualOnly = manualOnly;
      const result = await analyzeOwner(
        workspace(9000),
        request,
        provider,
        signal(),
      );
      expect(result.manual).toHaveLength(1);
      expect(result.suggestions).toEqual([]);
      expect(result.inputs.ranges).toEqual(request.ranges);
      expect(provider.transcribe).toHaveBeenCalledTimes(1);
      expect(provider.select).toHaveBeenCalledTimes(0);
    }
    const provider = ports();
    provider.select.mockResolvedValue([]);
    expect(
      (await analyzeOwner(workspace(), input(), provider, signal())).manual,
    ).toHaveLength(2);
    expect(provider.select).toHaveBeenCalledTimes(1);
  });
  it.each([
    (value: OwnerAnalysisInputs) => {
      value.ranges[0]!.startMs = NaN;
    },
    (value: OwnerAnalysisInputs) => {
      value.aiDuration.maxMs = Infinity;
    },
    (value: OwnerAnalysisInputs) => {
      value.ranges[0]!.endMs = value.ranges[0]!.startMs;
    },
    (value: OwnerAnalysisInputs) => {
      value.ranges[0]!.endMs = 360_000;
    },
    (value: OwnerAnalysisInputs) => {
      value.ranges[0]!.startMs = -1;
    },
    (value: OwnerAnalysisInputs) => {
      value.ranges = Array.from({ length: 11 }, () => range(0, 1000));
    },
    (value: OwnerAnalysisInputs) => {
      value.sourceRevision++;
    },
    (value: OwnerAnalysisInputs) => {
      value.aiDuration.minMs = 45_000;
      value.aiDuration.maxMs = 20_000;
    },
    (value: OwnerAnalysisInputs) => {
      value.aiDuration.minMs = value.aiDuration.maxMs = 30_001;
    },
    (value: OwnerAnalysisInputs) => {
      value.ranges[1]!.id = value.ranges[0]!.id;
    },
  ])(
    "rejects invalid/stale inputs with exactly zero dispatches",
    async (mutate) => {
      const request = input();
      mutate(request);
      const provider = ports();
      await expect(
        analyzeOwner(workspace(), request, provider, signal()),
      ).rejects.toThrow();
      expect(provider.transcribe).toHaveBeenCalledTimes(0);
      expect(provider.select).toHaveBeenCalledTimes(0);
    },
  );
  it("freezes input/source snapshots and cancels between the only two fake boundaries", async () => {
    const request = input(),
      controller = new AbortController(),
      provider = ports();
    const original = structuredClone(request);
    provider.transcribe.mockImplementationOnce(async () => {
      request.ranges = [];
      controller.abort();
      return [];
    });
    await expect(
      analyzeOwner(workspace(), request, provider, controller.signal),
    ).rejects.toThrow();
    expect(provider.transcribe).toHaveBeenCalledTimes(1);
    expect(provider.select).toHaveBeenCalledTimes(0);
    expect(original.ranges).toHaveLength(2);
    const canceled = new AbortController();
    canceled.abort();
    const unused = ports();
    await expect(
      analyzeOwner(workspace(), input(), unused, canceled.signal),
    ).rejects.toThrow();
    expect(unused.transcribe).toHaveBeenCalledTimes(0);
  });
  it("keeps usable ranges with nonextractive copy while reporting critiques", async () => {
    const provider = ports();
    const critique = vi.fn();
    provider.select.mockImplementation(
      async (...args: Parameters<OwnerAnalysisPorts["select"]>) => {
        const candidates = await fakeOwnerAnalysis.select(...args);
        return candidates.map((candidate, index) =>
          index % 2
            ? { ...candidate, title: "Invented text" }
            : { ...candidate, startWordId: "w_999999" },
        );
      },
    );
    const result = await analyzeOwner(
      workspace(),
      input(),
      { ...provider, critique },
      signal(),
    );
    expect(result.manual).toHaveLength(2);
    expect(result.suggestions).toHaveLength(2);
    expect(
      result.suggestions.every(
        (moment) => moment.evidence?.title === "Invented text",
      ),
    ).toBe(true);
    expect(critique).toHaveBeenCalled();
    expect(provider.transcribe).toHaveBeenCalledTimes(1);
    expect(provider.select).toHaveBeenCalledTimes(1);
  });
});

it("fits AI padding inside remaining frame windows and never crosses a manual boundary", async () => {
  const words = await fakeOwnerAnalysis.transcribe(workspace(60_000), signal());
  const available = ownerAvailableWindows(60_000, [
    { startFrame: 600, endFrame: 1200 },
  ]);
  const fit = (startMs: number, endMs: number, windows = available) =>
    fitOwnerAiWindow(
      { ...words[0]!, startMs },
      { ...words[1]!, endMs },
      60_000,
      { minMs: 10_000, maxMs: 30_000 },
      windows,
    );
  expect(fit(19_000, 19_900)).toEqual({ startFrame: 300, endFrame: 600 });
  expect(fit(40_000, 41_000)).toEqual({ startFrame: 1200, endFrame: 1500 });
  expect(fit(19_000, 20_001)).toBeNull(); // one overlapping frame
  expect(fit(39_999, 41_000)).toBeNull();
  expect(fit(18_000, 42_000)).toBeNull(); // evidence bridges a reserved cut
  expect(fit(19_000, 19_900, [{ startFrame: 570, endFrame: 600 }])).toBeNull();
});

it("uses one frame conversion, displays fractional endpoints, and clips manual cues to local time", () => {
  expect(parseOwnerTimestamp("00:01:02.003")).toBe(62_003);
  expect(ownerTimestamp(62_003)).toBe("00:01:02.003");
  expect(() => parseOwnerTimestamp("1:62")).toThrow();
  expect(() => parseOwnerTimestamp("00:60:00")).toThrow();
  expect(ownerCut({ startMs: 1001, endMs: 2999 }, 10_000)).toEqual({
    startFrame: 30,
    endFrame: 90,
  });
  expect(ownerCut({ startMs: 1001, endMs: 2001 }, 2001)).toEqual({
    startFrame: 30,
    endFrame: 60,
  });
  const cues = ownerLocalCues(
    [
      {
        id: "w_000001",
        text: "Synthetic",
        punctuatedText: "Synthetic",
        startMs: 100,
        endMs: 800,
        speakerId: null,
        confidence: 1,
      },
    ],
    { startFrame: 6, endFrame: 36 },
  );
  expect(cues[0]).toMatchObject({ startMs: 0, endMs: 600, text: "Synthetic" });
});

it("keeps the public prompt and strict public payloads unchanged", () => {
  expect(candidateSelectionPolicy()).toBe(CANDIDATE_SELECTION_POLICY);
  expect(CANDIDATE_SELECTION_POLICY).toContain(
    "10–60 seconds from first startMs to last endMs",
  );
  expect(CANDIDATE_SELECTION_POLICY).toContain("zero to 4 candidates");
  expect(
    startSessionRequestSchema.safeParse({
      mode: "upload",
      ranges: input().ranges,
    }).success,
  ).toBe(false);
});
