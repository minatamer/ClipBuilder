import { requireLocalMemory } from "./machine-memory.ts";
import { createHash, randomUUID } from "node:crypto";
import {
  ownerAnalysisRequestForCapacity,
  ownerAnalysisSchema,
  ownerWordsSchema,
  OWNER_FPS,
  ownerAiResultLimit,
  type OwnerAnalysis,
  type OwnerWord,
  type OwnerAnalysisInputs,
  type OwnerCut,
} from "../../../packages/contracts/local/selection.ts";
import {
  ownerAnalysisWindow,
  ownerAvailableSourceWindow,
} from "../../../packages/contracts/local/source-window.ts";
import {
  ownerWorkspaceForCapacity,
  type OwnerWorkspace,
} from "../../../packages/contracts/local/index.ts";
import type { OwnerCapacity } from "../../../packages/contracts/local/capacity.ts";
import { analyzeOwner, type OwnerAnalysisPorts } from "./analysis.ts";
import { AnalysisChunks } from "./analysis-chunks.ts";
import { CODEX_FIND_ALL_POLICY } from "./codex-selection-input.ts";
import {
  completeFindAllPassages,
  reconcileFindAllPassages,
} from "./find-all-passages.ts";

export const LONG_ANALYSIS_CHUNK_MS = 8 * 60_000;
export const FIND_ALL_REVIEW_MS = 2 * 60_000;
const REVIEW_LOOKBACK_MS = 15_000;
const CONTEXT_MS = 60_000,
  SPEECH_OVERLAP_MS = 2000;
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
/** Iteration, rather than an array proportional to source duration. */
export function* longAnalysisPlan(
  startMs: number,
  endMs: number,
  chunkMs = LONG_ANALYSIS_CHUNK_MS,
) {
  if (
    !Number.isSafeInteger(startMs) ||
    !Number.isSafeInteger(endMs) ||
    startMs < 0 ||
    endMs < startMs ||
    !Number.isSafeInteger(chunkMs) ||
    chunkMs < 1000
  )
    throw Error("analysis_plan_invalid");
  for (let start = startMs; start < endMs;) {
    let boundary = (Math.floor(start / chunkMs) + 1) * chunkMs;
    if (boundary - start < 1000) boundary += chunkMs;
    const end = endMs - boundary < 1000 ? endMs : boundary;
    yield { startMs: start, endMs: end };
    start = end;
  }
}

/** One finite, serial pass. Receipts survive failure; only an explicit retry resumes. */
export async function analyzeLongOwner(options: {
  workspace: OwnerWorkspace;
  value: unknown;
  ports: OwnerAnalysisPorts;
  signal: AbortSignal;
  capacity: OwnerCapacity;
  chunks: AnalysisChunks;
  checkpoint(result: OwnerAnalysis): Promise<void>;
}) {
  const { ports, signal, capacity, chunks } = options;
  const workspace = ownerWorkspaceForCapacity(capacity).parse(
    options.workspace,
  );
  if (workspace.mode !== ports.mode) throw Error("analysis_mode_mismatch");
  if (
    capacity.profile !== "local-codex" ||
    !capacity.longSources ||
    !ports.transcribeWindow
  )
    throw Error("long_analysis_unavailable");
  const inputs = ownerAnalysisRequestForCapacity(capacity).parse(options.value);
  if (inputs.sourceRevision !== workspace.revision)
    throw Error("stale_source_revision");
  const window = ownerAnalysisWindow(workspace.source, inputs.window);
  const available = ownerAvailableSourceWindow(workspace.source);
  const regional = inputs.aiCount === "all" && !inputs.manualOnly;
  const reviewMs = regional ? FIND_ALL_REVIEW_MS : LONG_ANALYSIS_CHUNK_MS;
  const firstBoundary = (Math.floor(window.startMs / reviewMs) + 1) * reviewMs;
  const lastTail = window.endMs % reviewMs;
  const planned = Math.max(
    1,
    Math.ceil(window.endMs / reviewMs) -
      Math.floor(window.startMs / reviewMs) -
      (lastTail > 0 && lastTail < 1000 ? 1 : 0) -
      (firstBoundary - window.startMs < 1000 && firstBoundary < window.endMs
        ? 1
        : 0),
  );
  if (
    inputs.ranges.some(
      (r) => r.startMs < window.startMs || r.endMs > window.endMs,
    )
  )
    throw Error("manual_outside_source_window");
  const result: OwnerAnalysis = {
    id: randomUUID(),
    inputs,
    mode: ports.mode,
    words: [],
    manual: [],
    suggestions: [],
    transcriptSpeakersPrepared: false,
    transcriptWindow: window,
    calls: { transcription: 0, selection: 0 },
    coverage: {
      state: "partial",
      completed: 0,
      planned,
      coveredThroughMs: window.startMs,
    },
  };
  ports.started?.(workspace, {
    transcription: true,
    selection: !inputs.manualOnly,
    speakers: false,
  });
  ports.chunkProgress?.(0, planned);
  const anchorsByCore = new Map<number, OwnerCut[]>();
  const chunkPorts: OwnerAnalysisPorts = {
    ...ports,
    started() {},
    async select(
      words,
      policy,
      signal,
      instructions,
      count,
      excluded = [],
      reviewCore,
    ) {
      const global = inputs.ranges.map((r) => ({
        startFrame: Math.round((r.startMs * OWNER_FPS) / 1000),
        endFrame: Math.round((r.endMs * OWNER_FPS) / 1000),
      }));
      result.calls.selection++;
      const selected = await ports.select(
        words,
        policy,
        signal,
        instructions,
        count,
        [...excluded, ...global],
        reviewCore,
      );
      if (regional && reviewCore) {
        const positions = new Map(words.map((word, index) => [word.id, index]));
        anchorsByCore.set(
          reviewCore.startMs,
          selected.flatMap((item) => {
            const a = positions.get(item.startWordId),
              b = positions.get(item.endWordId);
            if (a === undefined || b === undefined) return [];
            const cut = {
              startFrame: Math.floor(
                (words[Math.min(a, b)]!.startMs * OWNER_FPS) / 1000,
              ),
              endFrame: Math.ceil(
                (words[Math.max(a, b)]!.endMs * OWNER_FPS) / 1000,
              ),
            };
            return cut.endFrame > cut.startFrame &&
              cut.endFrame - cut.startFrame <=
                Math.floor((policy.maxMs * OWNER_FPS) / 1000) &&
              ![...excluded, ...global].some(
                (reserved) =>
                  cut.startFrame < reserved.endFrame &&
                  cut.endFrame > reserved.startFrame,
              )
              ? [cut]
              : [];
          }),
        );
      }
      return regional
        ? completeFindAllPassages(
            words,
            selected,
            policy,
            [...excluded, ...global],
            true,
          )
        : selected;
    },
  };
  const speech = async (core: { startMs: number; endMs: number }) => {
    const extract = {
      startMs: Math.max(available.startMs, core.startMs - SPEECH_OVERLAP_MS),
      endMs: Math.min(available.endMs, core.endMs + SPEECH_OVERLAP_MS),
    };
    const key = JSON.stringify([
      "speech-v1",
      ports.compatibility ?? "local-speech-v1",
      workspace.source.fingerprint,
      extract,
    ]);
    let record = await chunks.read(key, signal);
    record ??= await chunks.coveringSpeech(
      ports.compatibility ?? "local-speech-v1",
      workspace.source.fingerprint,
      extract,
      signal,
    );
    if (!record) {
      result.calls.transcription++;
      const raw = await ports.transcribeWindow!(workspace, extract, signal);
      const words = ownerWordsSchema.parse(
        raw.map((word) => ({
          ...word,
          id: `w_${digest([workspace.source.fingerprint, word.startMs, word.endMs, word.text]).slice(0, 32)}`,
        })),
      );
      record = { kind: "speech", words };
      await chunks.write(key, record, signal);
      await options.checkpoint(ownerAnalysisSchema.parse(result));
    }
    if (record.kind !== "speech") throw Error("analysis_chunk_invalid");
    // Midpoint ownership reconciles the deliberate overlap without duplicate words.
    return record.words.filter(
      (w) =>
        (w.startMs + w.endMs) / 2 >= core.startMs &&
        (w.startMs + w.endMs) / 2 < core.endMs,
    );
  };
  const candidates = new Map<number, OwnerAnalysis["suggestions"]>();
  let retainedBytes = 0;
  let overflowing = false;
  const reconcile = () => {
    const limit = ownerAiResultLimit(inputs.aiCount, capacity.moments);
    if (regional) {
      const values = reconcileFindAllPassages(
        [...candidates.values()].flat(),
        workspace.source.fingerprint,
        inputs.aiDuration,
        inputs.ranges.map((range) => ({
          startFrame: Math.round((range.startMs * OWNER_FPS) / 1000),
          endFrame: Math.round((range.endMs * OWNER_FPS) / 1000),
        })),
        [...anchorsByCore.values()].flat(),
      );
      overflowing = values.length > limit;
      result.suggestions = values.slice(0, limit);
      return;
    }
    const unique = new Map<string, OwnerAnalysis["suggestions"][number]>();
    // Round-robin preserves late windows in numeric mode without another AI call.
    const windows = [...candidates.values()];
    for (let rank = 0; windows.some((items) => items.length > rank); rank++)
      for (const items of windows) {
        const item = items[rank];
        if (!item) continue;
        const key = `${item.cut.startFrame}:${item.cut.endFrame}`;
        if (unique.has(key)) continue;
        unique.set(key, item);
      }
    overflowing = inputs.aiCount === "all" && unique.size > limit;
    const values = [...unique.values()];
    result.suggestions =
      inputs.aiCount !== "all" && values.length > limit
        ? Array.from(
            { length: limit },
            (_, i) =>
              values[
                Math.round((i * (values.length - 1)) / Math.max(1, limit - 1))
              ]!,
          )
        : values.slice(0, limit);
  };
  try {
    if (inputs.manualOnly) {
      for (const range of inputs.ranges) {
        const single = { ...inputs, ranges: [range] };
        const analysis = await analyzeOwner(
          workspace,
          single,
          ports,
          signal,
          undefined,
          capacity,
        );
        result.manual.push(...analysis.manual);
        result.calls.transcription += analysis.calls.transcription;
        await options.checkpoint(ownerAnalysisSchema.parse(result));
      }
      result.coverage = {
        state: "complete",
        planned: inputs.ranges.length,
        completed: inputs.ranges.length,
        coveredThroughMs: window.endMs,
      };
      return ownerAnalysisSchema.parse(result);
    }
    let previous:
      | { core: { startMs: number; endMs: number }; words: OwnerWord[] }
      | undefined;
    const discover = async (
      current: NonNullable<typeof previous>,
      next?: NonNullable<typeof previous>,
      reviewContext?: { startMs: number; endMs: number },
    ) => {
      const context = reviewContext ?? {
        startMs: current.core.startMs,
        endMs: Math.min(window.endMs, current.core.endMs + CONTEXT_MS),
      };
      const words = reviewContext
        ? current.words
        : [
            ...current.words,
            ...(next?.words.filter((w) => w.startMs < context.endMs) ?? []),
          ];
      const ranges = inputs.ranges.filter(
        (r) => r.startMs >= context.startMs && r.endMs <= context.endMs,
      );
      const scoped: OwnerAnalysisInputs = {
        ...inputs,
        window: context,
        ranges,
      };
      const key = JSON.stringify([
        regional ? `selection-v3:${CODEX_FIND_ALL_POLICY}` : "selection-v2",
        ports.compatibility ?? "codex-current",
        workspace.source.fingerprint,
        scoped,
        inputs.ranges,
        digest(words),
        ...(regional ? [current.core] : []),
      ]);
      let record = await chunks.read(key, signal);
      if (!record) {
        const analysis = await analyzeOwner(
          workspace,
          scoped,
          chunkPorts,
          signal,
          {
            transcript: {
              fingerprint: workspace.source.fingerprint,
              sourceRevision: workspace.revision,
              mode: ports.mode,
              words,
              window: context,
              speakersPrepared: false,
            },
            completed() {},
          },
          capacity,
          regional ? current.core : undefined,
        );
        // Full transcript lives only in its separate speech receipts.
        analysis.words = [];
        record = {
          kind: "selection",
          analysis,
          ...(regional
            ? { anchors: anchorsByCore.get(current.core.startMs) ?? [] }
            : {}),
        };
        await chunks.write(key, record, signal);
      }
      if (record.kind !== "selection") throw Error("analysis_chunk_invalid");
      if (regional)
        anchorsByCore.set(
          current.core.startMs,
          record.anchors ?? record.analysis.suggestions.map((item) => item.cut),
        );
      retainedBytes += Buffer.byteLength(
        JSON.stringify(record.analysis.suggestions),
      );
      requireLocalMemory(retainedBytes * 6);
      candidates.set(current.core.startMs, record.analysis.suggestions);
      for (const item of record.analysis.manual)
        if (
          !result.manual.some(
            (m) => m.processingIdentity === item.processingIdentity,
          )
        )
          result.manual.push(item);
      reconcile();
      result.coverage!.completed++;
      result.coverage!.coveredThroughMs = current.core.endMs;
      ports.chunkProgress?.(result.coverage!.completed, planned);
      await options.checkpoint(ownerAnalysisSchema.parse(result));
    };
    if (regional) {
      const review = longAnalysisPlan(
        window.startMs,
        window.endMs,
        FIND_ALL_REVIEW_MS,
      );
      let pending = review.next();
      let buffered: NonNullable<typeof previous>[] = [];
      for (const core of longAnalysisPlan(window.startMs, window.endMs)) {
        signal.throwIfAborted();
        const current = { core, words: await speech(core) };
        if (previous)
          current.words = reconcileChunkSeam(previous.words, current.words);
        previous = current;
        buffered.push(current);
        while (!pending.done) {
          const context = {
            startMs: Math.max(
              window.startMs,
              pending.value.startMs -
                Math.max(REVIEW_LOOKBACK_MS, inputs.aiDuration.maxMs),
            ),
            endMs: Math.min(
              window.endMs,
              pending.value.endMs + inputs.aiDuration.maxMs,
            ),
          };
          if (context.endMs > core.endMs) break;
          const words = buffered.flatMap((part) =>
            part.words.filter(
              (w) =>
                (w.startMs + w.endMs) / 2 >= context.startMs &&
                (w.startMs + w.endMs) / 2 < context.endMs,
            ),
          );
          await discover({ core: pending.value, words }, undefined, context);
          pending = review.next();
          const keepFrom = pending.done
            ? Infinity
            : Math.max(
                window.startMs,
                pending.value.startMs -
                  Math.max(REVIEW_LOOKBACK_MS, inputs.aiDuration.maxMs),
              );
          buffered = buffered.filter((part) => part.core.endMs > keepFrom);
        }
      }
      if (!pending.done) throw Error("analysis_chunk_invalid");
    } else {
      for (const core of longAnalysisPlan(window.startMs, window.endMs)) {
        signal.throwIfAborted();
        const current = { core, words: await speech(core) };
        if (previous)
          current.words = reconcileChunkSeam(previous.words, current.words);
        if (previous) await discover(previous, current);
        previous = current;
      }
      if (previous) await discover(previous);
    }
    // Manual seam-spanning rows get their own bounded, explicit ASR operation.
    for (const range of inputs.ranges)
      if (!result.manual.some((m) => m.rangeIds.includes(range.id))) {
        const manual = await analyzeOwner(
          workspace,
          { ...inputs, manualOnly: true, ranges: [range] },
          ports,
          signal,
          undefined,
          capacity,
        );
        result.manual.push(...manual.manual);
        result.calls.transcription += manual.calls.transcription;
      }
    result.coverage!.state = overflowing ? "partial" : "complete";
  } catch (error) {
    result.coverage!.state = signal.aborted ? "canceled" : "partial";
    const reason = error instanceof Error ? error.message : "";
    result.coverage!.failure =
      reason === "codex_login_required"
        ? reason
        : reason === "codex_limit"
          ? reason
          : reason === "disk_unavailable"
            ? reason
            : reason === "memory_unavailable"
              ? reason
              : "processing_unavailable";
    await options.checkpoint(ownerAnalysisSchema.parse(result));
    if (!result.coverage!.completed && !result.calls.transcription) throw error;
  }
  return ownerAnalysisSchema.parse(result);
}

/** Only matching, physically overlapping seam words collapse; repetitions survive. */
export function reconcileChunkSeam(
  previous: readonly OwnerWord[],
  current: readonly OwnerWord[],
) {
  const tail = previous.slice(-16);
  return current.filter(
    (word, index) =>
      index >= 16 ||
      !tail.some(
        (old) =>
          old.id === word.id ||
          (old.punctuatedText === word.punctuatedText &&
            old.startMs < word.endMs &&
            old.endMs > word.startMs),
      ),
  );
}
