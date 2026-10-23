import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  OWNER_LIMITS,
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../packages/contracts/local/index.ts";
import {
  OWNER_FPS,
  ownerAnalysisInputsSchema,
  ownerAiEvidenceSchema,
  ownerAnalysisSchema,
  ownerCut,
  ownerWordsSchema,
  type OwnerAnalysisInputs,
  type OwnerAiEvidence,
  type OwnerCut,
  type OwnerMoment,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import { ownerSelectionPolicy } from "./selection-policy.ts";
import { OWNER_DEFAULT_AI_COUNT } from "../../../packages/contracts/local/policy.ts";
import type { OwnerAiMode } from "../../../packages/contracts/local/policy.ts";

/** Domain ports only; explicit owner composition supplies synthetic or provider AI. */
export type OwnerAnalysisPorts = {
  readonly mode: OwnerAiMode;
  transcribe(
    workspace: OwnerWorkspace,
    signal: AbortSignal,
  ): Promise<OwnerWord[]>;
  select(
    words: readonly OwnerWord[],
    policy: OwnerAnalysisInputs["aiDuration"],
    signal: AbortSignal,
    instructions: string,
    requestedCount?: number,
  ): Promise<OwnerAiEvidence[]>;
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
  const startFrame = Math.min(evidenceStart, total - frames);
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
) {
  const workspace = ownerWorkspaceSchema.parse(currentWorkspace);
  if (workspace.mode !== ports.mode) throw new Error("analysis_mode_mismatch");
  const inputs = ownerAnalysisInputsSchema.parse(value);
  const requestedCount = inputs.aiCount ?? OWNER_DEFAULT_AI_COUNT;
  if (inputs.sourceRevision !== workspace.revision)
    throw new Error("stale_source_revision");
  const cuts = inputs.ranges.map((range) =>
    ownerCut(range, workspace.source.durationMs),
  );
  signal.throwIfAborted();
  // Parsing freezes a private input snapshot before any asynchronous dispatch.
  const words = ownerWordsSchema.parse(
    await ports.transcribe(workspace, signal),
  );
  signal.throwIfAborted();
  const ids = new Set<string>();
  let previousStart = -1;
  for (const word of words) {
    if (
      ids.has(word.id) ||
      word.startMs < previousStart ||
      word.endMs <= word.startMs ||
      word.endMs > workspace.source.durationMs
    )
      throw new Error("invalid_owner_transcript");
    ids.add(word.id);
    previousStart = word.startMs;
  }
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
  const selected =
    !inputs.manualOnly &&
    words.length > 0 &&
    workspace.source.durationMs >= inputs.aiDuration.minMs;
  if (selected) {
    const proposals = z
      .array(ownerAiEvidenceSchema)
      .max(OWNER_LIMITS.ranges + requestedCount)
      .parse(
        await ports.select(
          words,
          inputs.aiDuration,
          signal,
          ownerSelectionPolicy(inputs.aiDuration, requestedCount),
          requestedCount,
        ),
      );
    signal.throwIfAborted();
    const positions = new Map(words.map((word, index) => [word.id, index]));
    for (const proposal of proposals) {
      const start = positions.get(proposal.startWordId),
        end = positions.get(proposal.endWordId);
      if (start === undefined || end === undefined || start > end) continue;
      const span = words.slice(start, end + 1);
      if (
        !excerpt(proposal.title, span) ||
        !excerpt(proposal.hook, span) ||
        proposal.evidence.length < 2 ||
        new Set(proposal.evidence.map((item) => item.signal)).size !==
          proposal.evidence.length
      )
        continue;
      if (
        proposal.evidence.some(
          (item) =>
            item.wordIds.length === 0 ||
            item.wordIds.some((id, index) => {
              const position = positions.get(id);
              return (
                position === undefined ||
                position < start ||
                position > end ||
                (index > 0 &&
                  position !==
                    (positions.get(item.wordIds[index - 1]!) ?? -2) + 1)
              );
            }),
        )
      )
        continue;
      const cut = fitOwnerAiWindow(
        words[start]!,
        words[end]!,
        workspace.source.durationMs,
        inputs.aiDuration,
      );
      if (!cut) continue;
      const existing = byCut.get(key(cut));
      if (existing) {
        if (existing.rangeIds.length) existing.evidence ??= proposal;
        continue;
      }
      if (
        suggestions.length >= requestedCount ||
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
        continue;
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
    words,
    manual,
    suggestions,
    calls: { transcription: 1, selection: selected ? 1 : 0 },
  });
}
