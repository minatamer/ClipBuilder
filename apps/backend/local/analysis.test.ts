import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import {
  analyzeOwner,
  ownerLocalCues,
  type OwnerAnalysisPorts,
} from "./analysis.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
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
  it("reuses exact duplicate cuts, links matching AI evidence and still offers four independent suggestions", async () => {
    const request = input();
    request.ranges = [range(0, 30_000), range(0, 30_000), range(1000, 8000)];
    const result = await analyzeOwner(workspace(), request, ports(), signal());
    expect(result.manual).toHaveLength(2);
    expect(result.manual[0]?.rangeIds).toHaveLength(2);
    expect(result.manual[0]?.evidence).not.toBeNull();
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
  it("drops unsupported references and invented copy without losing manual ranges", async () => {
    const provider = ports();
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
    const result = await analyzeOwner(workspace(), input(), provider, signal());
    expect(result.manual).toHaveLength(2);
    expect(result.suggestions).toEqual([]);
    expect(provider.transcribe).toHaveBeenCalledTimes(1);
    expect(provider.select).toHaveBeenCalledTimes(1);
  });
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
