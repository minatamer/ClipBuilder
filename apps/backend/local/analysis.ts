import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  OWNER_LIMITS,
  ownerWorkspaceForCapacity,
  type OwnerWorkspace,
} from "../../../packages/contracts/local/index.ts";
import {
  OWNER_FPS,
  ownerAnalysisRequestForCapacity,
  ownerAiEvidenceSchema,
  ownerAnalysisSchema,
  ownerCut,
  ownerWordsSchema,
  ownerAiResultLimit,
  type OwnerAiCount,
  type OwnerAnalysisInputs,
  type OwnerAiEvidence,
  type OwnerCut,
  type OwnerMoment,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import { ownerSelectionPolicy } from "./selection-policy.ts";
import { ownerAvailableWindows } from "./selection-windows.ts";
import { OWNER_DEFAULT_AI_COUNT } from "../../../packages/contracts/local/policy.ts";
import type { OwnerAiMode } from "../../../packages/contracts/local/policy.ts";
import {
  resolveOwnerCapacity,
  type OwnerCapacity,
} from "../../../packages/contracts/local/capacity.ts";
import {
  ownerAnalysisWindow,
  ownerWindowFrames,
  type OwnerSourceWindow,
} from "../../../packages/contracts/local/source-window.ts";

/** Domain ports only; explicit owner composition supplies synthetic or provider AI. */
export type OwnerAnalysisPorts = {
  readonly compatibility?: string;
  chunkProgress?(completed: number, planned: number): void;
  readonly mode: OwnerAiMode;
  readonly transcriptionSpeakersPrepared?: boolean;
  started?(
    workspace: OwnerWorkspace,
    work: { transcription: boolean; selection: boolean; speakers: boolean },
  ): void;
  critique?(): void;
  transcribe(
    workspace: OwnerWorkspace,
    signal: AbortSignal,
  ): Promise<OwnerWord[]>;
  transcribeCut?(
    workspace: OwnerWorkspace,
    cut: OwnerCut,
    signal: AbortSignal,
  ): Promise<OwnerWord[]>;
  transcribeWindow?(
    workspace: OwnerWorkspace,
    window: OwnerSourceWindow,
    signal: AbortSignal,
  ): Promise<OwnerWord[]>;
  select(
    words: readonly OwnerWord[],
    policy: OwnerAnalysisInputs["aiDuration"],
    signal: AbortSignal,
    instructions: string,
    requestedCount?: OwnerAiCount,
    excludedCuts?: readonly OwnerCut[],
    reviewCore?: OwnerSourceWindow,
  ): Promise<OwnerAiEvidence[]>;
};

/** Held by one workspace; saved analyses can seed it after source verification. */
export type OwnerTranscript = {
  fingerprint: string;
  sourceRevision: number;
  mode: OwnerAiMode;
  words: OwnerWord[];
  cut?: OwnerCut | undefined;
  window?: OwnerSourceWindow | undefined;
  speakersPrepared?: boolean | undefined;
};

export function ownerLocalCues(
  words: readonly OwnerWord[],
  cut: OwnerCut,
): OwnerWord[] {
  const start = (cut.startFrame * 1000) / OWNER_FPS,
    end = (cut.endFrame * 1000) / OWNER_FPS;
  return words
    .filter((word) => word.endMs > start && word.startMs < end)
    .flatMap((word) => {
      const startMs = Math.max(0, Math.round(word.startMs - start));
      const endMs = Math.min(
        Math.round(end - start),
        Math.round(word.endMs - start),
      );
      return endMs > startMs ? [{ ...word, startMs, endMs }] : [];
    });
}

export function fitOwnerAiWindow(
  first: OwnerWord,
  last: OwnerWord,
  sourceMs: number,
  policy: OwnerAnalysisInputs["aiDuration"],
  available: readonly OwnerCut[] = ownerAvailableWindows(sourceMs, []),
): OwnerCut | null {
  const total = Math.floor((sourceMs * OWNER_FPS) / 1000),
    min = Math.ceil((policy.minMs * OWNER_FPS) / 1000),
    max = Math.floor((policy.maxMs * OWNER_FPS) / 1000);
  const evidenceStart = Math.floor((first.startMs * OWNER_FPS) / 1000),
    evidenceEnd = Math.ceil((last.endMs * OWNER_FPS) / 1000);
  const frames = Math.max(min, evidenceEnd - evidenceStart);
  if (
    frames > max ||
    frames > total ||
    evidenceEnd > total ||
    evidenceEnd <= evidenceStart
  )
    return null;
  const window = available.find(
    (cut) =>
      cut.startFrame <= evidenceStart &&
      cut.endFrame >= evidenceEnd &&
      cut.endFrame - cut.startFrame >= frames,
  );
  if (!window) return null;
  const startFrame = Math.min(evidenceStart, window.endFrame - frames);
  return { startFrame, endFrame: startFrame + frames };
}

function excerpt(text: string, words: readonly OwnerWord[]) {
  for (let start = 0; start < words.length; start++) {
    let value = "";
    for (
      let next = start;
      next < words.length && value.length <= text.length;
      next++
    ) {
      value = [value, words[next]!.punctuatedText].filter(Boolean).join(" ");
      if (value === text) return true;
    }
  }
  return false;
}

export async function analyzeOwner(
  currentWorkspace: OwnerWorkspace,
  value: unknown,
  ports: OwnerAnalysisPorts,
  signal: AbortSignal,
  reuse?: {
    transcript: OwnerTranscript | undefined;
    completed(transcript: OwnerTranscript): void;
    reused?(): void;
  },
  capacity: OwnerCapacity = resolveOwnerCapacity({}),
  reviewCore?: OwnerSourceWindow,
) {
  const workspace = ownerWorkspaceForCapacity(capacity).parse(currentWorkspace);
  if (workspace.mode !== ports.mode) throw new Error("analysis_mode_mismatch");
  const inputs = ownerAnalysisRequestForCapacity(capacity).parse(value);
  const requestedCount = inputs.aiCount ?? OWNER_DEFAULT_AI_COUNT;
  const resultLimit = ownerAiResultLimit(requestedCount, capacity.moments);
  if (
    !capacity.manyClips &&
    typeof requestedCount === "number" &&
    requestedCount > OWNER_LIMITS.suggestions
  )
    throw Error("candidate_policy_rejected");
  if (inputs.sourceRevision !== workspace.revision)
    throw new Error("stale_source_revision");
  const window = ownerAnalysisWindow(workspace.source, inputs.window);
  const windowCut = ownerWindowFrames(window);
  const scoped =
    window.startMs !== 0 || window.endMs !== workspace.source.durationMs;
  const cuts = inputs.ranges.map((range) =>
    ownerCut(range, workspace.source.durationMs),
  );
  if (
    cuts.some(
      (cut) =>
        cut.startFrame < windowCut.startFrame ||
        cut.endFrame > windowCut.endFrame,
    )
  )
    throw new Error("manual_outside_source_window");
  signal.throwIfAborted();
  // Parsing freezes a private input snapshot before any asynchronous dispatch.
  const cached = reuse?.transcript;
  // A bounded transcription port keeps one continuous window and anonymous speaker
  // labels consistent across multiple manual ranges without scanning the source.
  const manualWindow =
    inputs.manualOnly && ports.transcribeCut && cuts.length
      ? {
          startFrame: Math.min(...cuts.map((cut) => cut.startFrame)),
          endFrame: Math.max(...cuts.map((cut) => cut.endFrame)),
        }
      : undefined;
  // Far-apart rows may exceed the existing native cut bound. Preserve the
  // full-source path instead of broadening that contract or dropping rows.
  const requestedCut =
    manualWindow &&
    manualWindow.endFrame - manualWindow.startFrame <=
      (OWNER_LIMITS.clipMs * OWNER_FPS) / 1000
      ? manualWindow
      : undefined;
  const emptyManual =
    inputs.manualOnly &&
    cuts.length === 0 &&
    !!(ports.transcribeCut || ports.transcribeWindow);
  const requestedWindow = !requestedCut && scoped ? window : undefined;
  const requiredCoverage = requestedCut
    ? {
        startMs: (requestedCut.startFrame * 1000) / OWNER_FPS,
        endMs: (requestedCut.endFrame * 1000) / OWNER_FPS,
      }
    : window;
  const cachedWindow =
    cached?.window ??
    (cached?.cut
      ? {
          startMs: (cached.cut.startFrame * 1000) / OWNER_FPS,
          endMs: (cached.cut.endFrame * 1000) / OWNER_FPS,
        }
      : undefined);
  const reused =
    !emptyManual &&
    cached !== undefined &&
    cached.fingerprint === workspace.source.fingerprint &&
    cached.sourceRevision === workspace.revision &&
    cached.mode === workspace.mode &&
    (!cachedWindow ||
      (cachedWindow.startMs <= requiredCoverage.startMs &&
        cachedWindow.endMs >= requiredCoverage.endMs));
  const transcriptCut = reused ? cached.cut : requestedCut;
  const transcriptWindow = reused ? cached.window : requestedWindow;
  if (!emptyManual && !reused && requestedWindow && !ports.transcribeWindow)
    throw new Error("source_window_unavailable");
  // Deferred local detection belongs to each new selected clip, including when
  // transcription is reused from an older model. Never rewrite retained clips.
  const speakersPrepared =
    ports.transcriptionSpeakersPrepared === false
      ? false
      : reused
        ? (cached.speakersPrepared ?? true)
        : true;
  ports.started?.(workspace, {
    transcription: !reused && !emptyManual,
    selection: !inputs.manualOnly,
    speakers: speakersPrepared,
  });
  const transcriptWords = ownerWordsSchema.parse(
    emptyManual
      ? []
      : reused
        ? cached.words
        : requestedCut && ports.transcribeCut
          ? await ports.transcribeCut(workspace, requestedCut, signal)
          : requestedWindow && ports.transcribeWindow
            ? await ports.transcribeWindow(workspace, requestedWindow, signal)
            : await ports.transcribe(workspace, signal),
  );
  const ids = new Set<string>();
  let previousStart = -1;
  for (const word of transcriptWords) {
    if (ids.has(word.id)) throw new Error("invalid_owner_transcript");
    if (
      word.startMs < previousStart ||
      word.endMs <= word.startMs ||
      word.endMs > workspace.source.durationMs
    )
      ports.critique?.();
    ids.add(word.id);
    previousStart = word.startMs;
  }
  if (!reused && !emptyManual)
    reuse?.completed({
      fingerprint: workspace.source.fingerprint,
      sourceRevision: workspace.revision,
      mode: workspace.mode,
      words: ownerWordsSchema.parse(transcriptWords),
      ...(transcriptCut ? { cut: transcriptCut } : {}),
      ...(transcriptWindow ? { window: transcriptWindow } : {}),
      ...(!speakersPrepared ? { speakersPrepared: false } : {}),
    });
  signal.throwIfAborted();
  if (reused) reuse?.reused?.();
  // Keep acknowledged wider words/coverage for recovery, but expose only the
  // selected interval to discovery and moment cue construction.
  const words = scoped
    ? transcriptWords
        .filter(
          (word) => word.endMs > window.startMs && word.startMs < window.endMs,
        )
        .map((word) => ({
          ...word,
          startMs: Math.max(window.startMs, word.startMs),
          endMs: Math.min(window.endMs, word.endMs),
        }))
    : transcriptWords;
  const byCut = new Map<string, OwnerMoment>();
  const key = (cut: OwnerCut) => `${cut.startFrame}:${cut.endFrame}`;
  const moment = (cut: OwnerCut): OwnerMoment => ({
    id: randomUUID(),
    processingIdentity: createHash("sha256")
      .update(`${workspace.source.fingerprint}:${key(cut)}`)
      .digest("hex"),
    cut,
    rangeIds: [],
    evidence: null,
    cues: ownerLocalCues(words, cut),
    ...(!speakersPrepared ? { speakersPrepared: false } : {}),
  });
  const manual: OwnerMoment[] = [];
  for (const [index, range] of inputs.ranges.entries()) {
    const cut = cuts[index]!;
    let current = byCut.get(key(cut));
    if (!current) {
      current = moment(cut);
      byCut.set(key(cut), current);
      manual.push(current);
    }
    current.rangeIds.push(range.id);
  }
  const suggestions: OwnerMoment[] = [];
  const excludedCuts = manual.map((item) => ({ ...item.cut }));
  const available = ownerAvailableWindows(
    workspace.source.durationMs,
    excludedCuts,
  )
    .map((cut) => ({
      startFrame: Math.max(cut.startFrame, windowCut.startFrame),
      endFrame: Math.min(cut.endFrame, windowCut.endFrame),
    }))
    .filter((cut) => cut.endFrame > cut.startFrame);
  const selected =
    !inputs.manualOnly &&
    words.length > 0 &&
    (!reviewCore ||
      words.some(
        (word) =>
          word.startMs >= reviewCore.startMs && word.startMs < reviewCore.endMs,
      )) &&
    available.some(
      (cut) =>
        cut.endFrame - cut.startFrame >=
        Math.ceil((inputs.aiDuration.minMs * OWNER_FPS) / 1000),
    );
  if (selected) {
    const proposals = z
      .array(ownerAiEvidenceSchema)
      .max(Math.min(Number.MAX_SAFE_INTEGER, OWNER_LIMITS.ranges + resultLimit))
      .parse(
        await ports.select(
          words,
          inputs.aiDuration,
          signal,
          ownerSelectionPolicy(
            inputs.aiDuration,
            requestedCount,
            capacity.moments,
          ),
          requestedCount,
          excludedCuts,
          ...(reviewCore ? [reviewCore] : []),
        ),
      );
    signal.throwIfAborted();
    const positions = new Map(words.map((word, index) => [word.id, index]));
    for (const proposal of proposals) {
      const start = positions.get(proposal.startWordId),
        end = positions.get(proposal.endWordId);
      if (start === undefined || end === undefined) {
        ports.critique?.();
        continue; // No physical source range can be decoded.
      }
      const first = Math.min(start, end),
        last = Math.max(start, end);
      if (start > end) ports.critique?.();
      const span = words.slice(first, last + 1);
      if (
        !excerpt(proposal.title, span) ||
        !excerpt(proposal.hook, span) ||
        proposal.evidence.length < 2 ||
        new Set(proposal.evidence.map((item) => item.signal)).size !==
          proposal.evidence.length
      )
        ports.critique?.();
      if (
        proposal.evidence.some(
          (item) =>
            item.wordIds.length === 0 ||
            item.wordIds.some((id, index) => {
              const position = positions.get(id);
              return (
                position === undefined ||
                position < first ||
                position > last ||
                (index > 0 &&
                  position !==
                    (positions.get(item.wordIds[index - 1]!) ?? -2) + 1)
              );
            }),
        )
      )
        ports.critique?.();
      let cut = fitOwnerAiWindow(
        words[first]!,
        words[last]!,
        workspace.source.durationMs,
        inputs.aiDuration,
        available,
      );
      if (!cut) {
        ports.critique?.();
        // Keep the returned passage available. Only physical source/resource
        // bounds constrain the render clock; duration/exclusion advice cannot veto it.
        const total = windowCut.endFrame;
        const minimumFrames = Math.min(OWNER_FPS, total - windowCut.startFrame);
        const startFrame = Math.max(
          windowCut.startFrame,
          Math.min(
            total - minimumFrames,
            Math.floor(
              (Math.min(...span.map((word) => word.startMs)) * OWNER_FPS) /
                1000,
            ),
          ),
        );
        const endFrame = Math.max(
          startFrame + minimumFrames,
          Math.min(
            total,
            startFrame + (OWNER_LIMITS.clipMs * OWNER_FPS) / 1000,
            Math.ceil(
              (Math.max(...span.map((word) => word.endMs)) * OWNER_FPS) / 1000,
            ),
          ),
        );
        cut = { startFrame, endFrame };
      }
      if (suggestions.length >= resultLimit) break;
      if (capacity.manyClips && byCut.has(key(cut))) continue;
      if (
        byCut.has(key(cut)) ||
        suggestions.some(
          (previous) =>
            Math.max(
              0,
              Math.min(cut.endFrame, previous.cut.endFrame) -
                Math.max(cut.startFrame, previous.cut.startFrame),
            ) /
              Math.min(
                cut.endFrame - cut.startFrame,
                previous.cut.endFrame - previous.cut.startFrame,
              ) >
            0.35,
        )
      )
        ports.critique?.();
      const candidate = moment(cut);
      candidate.evidence = proposal;
      byCut.set(key(cut), candidate);
      suggestions.push(candidate);
    }
  }
  return ownerAnalysisSchema.parse({
    id: randomUUID(),
    mode: ports.mode,
    inputs,
    words: transcriptWords,
    ...(transcriptCut ? { transcriptCut } : {}),
    ...(transcriptWindow ? { transcriptWindow } : {}),
    ...(!speakersPrepared ? { transcriptSpeakersPrepared: false } : {}),
    manual,
    suggestions,
    calls: {
      transcription: reused || emptyManual ? 0 : 1,
      selection: selected ? 1 : 0,
    },
  });
}
