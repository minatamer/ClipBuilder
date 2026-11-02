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
const capacity = resolveOwnerCapacity(
  { aiProvider: "codex" },
  { longSources: true, manyClips: false },
);
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
      aiCount: "all",
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
