import { expect, it, vi } from "vitest";
import { analyzeOwner, type OwnerTranscript } from "./analysis.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { resolveOwnerCapacity } from "../../../packages/contracts/local/capacity.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";
import { ownerAnalysisSchema } from "../../../packages/contracts/local/selection.ts";

const workspace = (durationMs = 7_200_000): OwnerWorkspace => ({
  id: crypto.randomUUID(),
  revision: 0,
  mode: "synthetic-ai",
  source: {
    fingerprint: "a".repeat(64),
    bytes: 100,
    durationMs,
    width: 320,
    height: 180,
    fps: 30,
  },
});
const capacity = resolveOwnerCapacity(
  { aiProvider: "codex" },
  { longSources: true, manyClips: false },
);
const inputs = {
  sourceRevision: 0,
  policyRevision: 0,
  ranges: [],
  aiDuration: { minMs: 10_000, maxMs: 30_000 },
  manualOnly: false,
  window: { startMs: 1_800_000, endMs: 3_000_000 },
};
const ports = () => ({
  mode: "synthetic-ai" as const,
  transcribe: vi.fn(fakeOwnerAnalysis.transcribe),
  transcribeWindow: vi.fn(fakeOwnerAnalysis.transcribeWindow!),
  select: vi.fn(fakeOwnerAnalysis.select),
});
const signal = () => new AbortController().signal;

it("transcribes only twenty minutes of two-hour metadata and keeps discovery and cues inside it", async () => {
  const p = ports();
  const result = await analyzeOwner(
    workspace(),
    inputs,
    p,
    signal(),
    undefined,
    capacity,
  );
  expect(p.transcribe).not.toHaveBeenCalled();
  expect(p.transcribeWindow).toHaveBeenCalledExactlyOnceWith(
    workspaceAs(result.inputs.sourceRevision),
    inputs.window,
    expect.any(AbortSignal),
  );
  function workspaceAs(revision: number) {
    return expect.objectContaining({
      revision,
      source: expect.objectContaining({ durationMs: 7_200_000 }),
    });
  }
  expect(result.transcriptWindow).toEqual(inputs.window);
  expect(result.calls).toEqual({ transcription: 1, selection: 1 });
  expect(p.select).toHaveBeenCalledTimes(1);
  expect(
    p.select.mock.calls[0]![0].every(
      (w) =>
        w.startMs >= inputs.window.startMs && w.endMs <= inputs.window.endMs,
    ),
  ).toBe(true);
  expect(result.suggestions.length).toBeGreaterThan(0);
  expect(
    result.suggestions.every(
      (m) =>
        m.cut.startFrame >= 54_000 &&
        m.cut.endFrame <= 90_000 &&
        m.cues.every(
          (w) =>
            w.startMs >= 0 &&
            w.endMs <= ((m.cut.endFrame - m.cut.startFrame) * 1000) / 30,
        ),
    ),
  ).toBe(true);
});

it("retains wider acknowledged coverage for restore and slices discovery without retranscription", async () => {
  const p = ports(),
    current = workspace(3_600_000);
  const reuse = {
    transcript: undefined as OwnerTranscript | undefined,
    completed(value: OwnerTranscript) {
      this.transcript = value;
    },
  };
  const wide = await analyzeOwner(current, inputs, p, signal(), reuse);
  const narrower = {
    ...inputs,
    window: { startMs: 1_900_000, endMs: 2_000_000 },
  };
  const result = await analyzeOwner(current, narrower, p, signal(), reuse);
  expect(result.calls.transcription).toBe(0);
  expect(result.words).toEqual(wide.words);
  expect(result.transcriptWindow).toEqual(inputs.window);
  expect(p.transcribeWindow).toHaveBeenCalledTimes(1);
  expect(
    p.select.mock.calls[1]![0].every(
      (w) =>
        w.startMs >= narrower.window.startMs &&
        w.endMs <= narrower.window.endMs,
    ),
  ).toBe(true);
  const saved = ownerAnalysisSchema.parse(JSON.parse(JSON.stringify(result)));
  reuse.transcript = {
    fingerprint: current.source.fingerprint,
    sourceRevision: 0,
    mode: current.mode as "synthetic-ai",
    words: saved.words,
    window: saved.transcriptWindow,
  };
  await analyzeOwner(
    current,
    { ...inputs, window: { startMs: 1000, endMs: 21_000 } },
    p,
    signal(),
    reuse,
  );
  expect(p.transcribeWindow).toHaveBeenCalledTimes(2);
  await analyzeOwner(
    current,
    { ...inputs, window: undefined },
    p,
    signal(),
    reuse,
  );
  expect(p.transcribe).toHaveBeenCalledTimes(1);
});

it("fails invalid, stale, out-of-window and unsupported scopes before any dispatch", async () => {
  const p = ports(),
    current = workspace(3_600_000);
  for (const request of [
    { ...inputs, sourceRevision: 1 },
    { ...inputs, window: { startMs: 0, endMs: 3_601_000 } },
    { ...inputs, window: { startMs: 1000, endMs: 1000 } },
    {
      ...inputs,
      ranges: [{ id: crypto.randomUUID(), startMs: 0, endMs: 1000 }],
    },
  ])
    await expect(analyzeOwner(current, request, p, signal())).rejects.toThrow();
  await expect(
    analyzeOwner(
      current,
      inputs,
      { mode: p.mode, transcribe: p.transcribe, select: p.select },
      signal(),
    ),
  ).rejects.toThrow("source_window_unavailable");
  await expect(
    analyzeOwner(current, inputs, p, AbortSignal.abort()),
  ).rejects.toThrow();
  expect(p.transcribe).not.toHaveBeenCalled();
  expect(p.transcribeWindow).not.toHaveBeenCalled();
  expect(p.select).not.toHaveBeenCalled();
});
