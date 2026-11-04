import { createHash } from "node:crypto";
import {
  OWNER_FPS,
  type OwnerAiEvidence,
  type OwnerAnalysisInputs,
  type OwnerCut,
  type OwnerMoment,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import { ownerLocalCues } from "./analysis.ts";

const PAUSE_MS = 800;
const CONTINUATION_MS = 750;
const QUESTION_CONTEXT_MS = 20_000;
const terminal = (word: OwnerWord) =>
  /[.!?]["'”’)\]]*$/u.test(word.punctuatedText);
const question = (word: OwnerWord) =>
  /\?["'”’)\]]*$/u.test(word.punctuatedText);
const dependent = (word: OwnerWord) =>
  /^(and|but|because|so|which|that|this|these|those|it|its|they|their|therefore|however|instead|also|then)$/iu.test(
    word.text.replace(/^["'“‘]+|[.,:;!?"'”’]+$/gu, ""),
  );
const speakerBreak = (left: OwnerWord, right: OwnerWord) =>
  !!left.speakerId && !!right.speakerId && left.speakerId !== right.speakerId;

/** Speech observations, not a semantic segmentation claim. Edge units may be partial. */
export function findAllSpeechUnits(words: readonly OwnerWord[]) {
  const units: { first: number; last: number; question: boolean }[] = [];
  let first = 0;
  for (let index = 0; index < words.length; index++) {
    const word = words[index]!,
      next = words[index + 1];
    if (
      !next ||
      terminal(word) ||
      next.startMs - word.endMs >= PAUSE_MS ||
      speakerBreak(word, next)
    ) {
      units.push({ first, last: index, question: question(word) });
      first = index + 1;
    }
  }
  return units;
}

/** Admissible proposals expand only; overlong ideas are never silently truncated. */
export function completeFindAllPassages(
  words: readonly OwnerWord[],
  proposals: readonly OwnerAiEvidence[],
  duration: OwnerAnalysisInputs["aiDuration"],
  excluded: readonly OwnerCut[],
  retainOriginal = false,
): OwnerAiEvidence[] {
  const units = findAllSpeechUnits(words);
  const positions = new Map(words.map((word, index) => [word.id, index]));
  const unitAt = new Map<number, number>();
  units.forEach((unit, index) => {
    for (let at = unit.first; at <= unit.last; at++) unitAt.set(at, index);
  });
  return proposals.flatMap((proposal) => {
    const a = positions.get(proposal.startWordId),
      b = positions.get(proposal.endWordId);
    if (a === undefined || b === undefined) return [proposal];
    const first = Math.min(a, b),
      last = Math.max(a, b);
    if (
      Math.ceil((words[last]!.endMs * OWNER_FPS) / 1000) -
        Math.floor((words[first]!.startMs * OWNER_FPS) / 1000) >
      Math.floor((duration.maxMs * OWNER_FPS) / 1000)
    )
      return [];
    let startUnit = unitAt.get(first)!;
    const endUnit = unitAt.get(last)!;
    const originalStartUnit = startUnit;
    // A dependent opening can include its immediately preceding utterance.
    // Known speaker changes and pauses prevent pronouns from joining unrelated turns.
    if (startUnit > 0) {
      const unit = units[startUnit]!,
        previous = units[startUnit - 1]!;
      const left = words[previous.last]!,
        right = words[unit.first]!;
      if (
        dependent(right) &&
        right.startMs - left.endMs <= CONTINUATION_MS &&
        !speakerBreak(left, right) &&
        words[first]!.startMs - words[previous.first]!.startMs <=
          QUESTION_CONTEXT_MS
      )
        startUnit--;
    }
    // Keep a nearby question with its answer, including later sentences in that answer.
    for (let index = originalStartUnit - 1; index >= 0; index--) {
      const unit = units[index]!,
        next = units[index + 1]!;
      if (
        words[first]!.startMs - words[unit.last]!.endMs > QUESTION_CONTEXT_MS ||
        words[next.first]!.startMs - words[unit.last]!.endMs >= PAUSE_MS
      )
        break;
      if (unit.question) {
        startUnit = Math.min(startUnit, index);
        break;
      }
      if (speakerBreak(words[unit.last]!, words[next.first]!)) break;
    }
    const opening = units[startUnit]!,
      ending = units[endUnit]!;
    // A context edge in a long unpunctuated unit is not an observed boundary.
    const completeOpening =
      opening.last < words.length - 1 || terminal(words[opening.last]!);
    const left =
      opening.first > 0 ||
      (completeOpening &&
        words[opening.last]!.endMs - words[opening.first]!.startMs <=
          duration.maxMs)
        ? opening.first
        : first;
    const right =
      ending.last < words.length - 1 || terminal(words[ending.last]!)
        ? ending.last
        : last;
    const options = [
      [left, right],
      [left, last],
      [first, right],
    ];
    const admissible = options
      .filter(([start, end]) => {
        const startFrame = Math.floor(
          (words[start!]!.startMs * OWNER_FPS) / 1000,
        );
        const endFrame = Math.ceil((words[end!]!.endMs * OWNER_FPS) / 1000);
        return (
          endFrame - startFrame <=
            Math.floor((duration.maxMs * OWNER_FPS) / 1000) &&
          !excluded.some(
            (cut) => startFrame < cut.endFrame && endFrame > cut.startFrame,
          )
        );
      })
      .sort(
        ([a, b], [c, d]) =>
          words[d!]!.endMs -
          words[c!]!.startMs -
          (words[b!]!.endMs - words[a!]!.startMs),
      );
    const chosen = admissible[0];
    const expanded = chosen
      ? {
          ...proposal,
          startWordId: words[chosen[0]!]!.id,
          endWordId: words[chosen[1]!]!.id,
        }
      : proposal;
    return retainOriginal &&
      (expanded.startWordId !== proposal.startWordId ||
        expanded.endWordId !== proposal.endWordId)
      ? [expanded, proposal]
      : [expanded];
  });
}

const span = (item: OwnerMoment) => item.cut.endFrame - item.cut.startFrame;
const order = (a: OwnerMoment, b: OwnerMoment) =>
  a.cut.startFrame - b.cut.startFrame ||
  b.cut.endFrame - a.cut.endFrame ||
  JSON.stringify(a.evidence).localeCompare(JSON.stringify(b.evidence));

function mergeMoments(
  left: OwnerMoment,
  right: OwnerMoment,
  fingerprint: string,
): OwnerMoment {
  const cut = {
    startFrame: Math.min(left.cut.startFrame, right.cut.startFrame),
    endFrame: Math.max(left.cut.endFrame, right.cut.endFrame),
  };
  const byId = new Map<string, OwnerWord>();
  for (const item of [left, right])
    for (const cue of item.cues) {
      const word = {
        ...cue,
        startMs: Math.round(
          cue.startMs + (item.cut.startFrame * 1000) / OWNER_FPS,
        ),
        endMs: Math.round(cue.endMs + (item.cut.startFrame * 1000) / OWNER_FPS),
      };
      const previous = byId.get(word.id);
      byId.set(
        word.id,
        previous
          ? {
              ...previous,
              startMs: Math.min(previous.startMs, word.startMs),
              endMs: Math.max(previous.endMs, word.endMs),
            }
          : word,
      );
    }
  const words = [...byId.values()].sort(
    (a, b) =>
      a.startMs - b.startMs || a.endMs - b.endMs || a.id.localeCompare(b.id),
  );
  const preferred = [left, right].sort(
    (a, b) => span(b) - span(a) || order(a, b),
  )[0]!;
  return {
    ...preferred,
    cut,
    processingIdentity: createHash("sha256")
      .update(`${fingerprint}:${cut.startFrame}:${cut.endFrame}`)
      .digest("hex"),
    evidence:
      preferred.evidence && words.length
        ? {
            ...preferred.evidence,
            startWordId: words[0]!.id,
            endWordId: words.at(-1)!.id,
          }
        : preferred.evidence,
    cues: ownerLocalCues(words, cut),
    ...(left.speakersPrepared === false || right.speakersPrepared === false
      ? { speakersPrepared: false }
      : {}),
  };
}

/** Whole admissible alternatives only: never trim one cut to fit another. */
export function reconcileFindAllPassages(
  proposals: readonly OwnerMoment[],
  fingerprint: string,
  duration: OwnerAnalysisInputs["aiDuration"],
  excluded: readonly OwnerCut[] = [],
  anchors?: readonly OwnerCut[],
): OwnerMoment[] {
  const sorted = proposals
    .filter(
      (item) =>
        span(item) >= Math.ceil((duration.minMs * OWNER_FPS) / 1000) &&
        span(item) <= Math.floor((duration.maxMs * OWNER_FPS) / 1000) &&
        !excluded.some(
          (cut) =>
            item.cut.startFrame < cut.endFrame &&
            item.cut.endFrame > cut.startFrame,
        ),
    )
    .sort(order);
  const alternatives = [...sorted];
  let group: OwnerMoment | undefined;
  let groupIds = new Set<string>();
  for (const item of sorted) {
    const shared = item.cues.some((word) => groupIds.has(word.id));
    const end = Math.max(group?.cut.endFrame ?? 0, item.cut.endFrame);
    if (
      group &&
      item.cut.startFrame < group.cut.endFrame &&
      shared &&
      end - group.cut.startFrame <=
        Math.floor((duration.maxMs * OWNER_FPS) / 1000)
    ) {
      group = mergeMoments(group, item, fingerprint);
      alternatives.push(group);
      for (const word of item.cues) groupIds.add(word.id);
    } else {
      group = item;
      groupIds = new Set(item.cues.map((word) => word.id));
    }
  }
  const unique = new Map<string, OwnerMoment>();
  for (const item of alternatives.sort(order)) {
    const key = `${item.cut.startFrame}:${item.cut.endFrame}`;
    if (!unique.has(key)) unique.set(key, item);
  }
  const items = [...unique.values()].sort(
    (a, b) => a.cut.endFrame - b.cut.endFrame || order(a, b),
  );
  const covered: OwnerCut[] = [];
  for (const anchor of [...(anchors ?? sorted.map((item) => item.cut))].sort(
    (a, b) => a.startFrame - b.startFrame || a.endFrame - b.endFrame,
  )) {
    const previous = covered.at(-1);
    if (previous && anchor.startFrame <= previous.endFrame)
      previous.endFrame = Math.max(previous.endFrame, anchor.endFrame);
    else covered.push({ ...anchor });
  }
  const prefix = [0];
  for (const cut of covered)
    prefix.push(prefix.at(-1)! + cut.endFrame - cut.startFrame);
  const coverageAt = (frame: number) => {
    let low = 0,
      high = covered.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (covered[mid]!.endFrame <= frame) low = mid + 1;
      else high = mid;
    }
    return (
      prefix[low]! +
      (covered[low] ? Math.max(0, frame - covered[low]!.startFrame) : 0)
    );
  };
  // Preserve model-selected speech first; added context must never outscore it.
  // Then prefer fewer cuts and fuller context. O(n log n) time / O(n) memory.
  const prior: number[] = [],
    scores = [0],
    counts = [0],
    contexts = [0],
    takes: boolean[] = [];
  items.forEach((item, index) => {
    let low = 0,
      high = index;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (items[mid]!.cut.endFrame <= item.cut.startFrame) low = mid + 1;
      else high = mid;
    }
    prior.push(low);
    const take =
        scores[low]! +
        coverageAt(item.cut.endFrame) -
        coverageAt(item.cut.startFrame),
      count = counts[low]! + 1,
      context = contexts[low]! + span(item);
    const chosen =
      take > scores[index]! ||
      (take === scores[index] &&
        (count < counts[index]! ||
          (count === counts[index] && context > contexts[index]!)));
    takes.push(chosen);
    scores.push(chosen ? take : scores[index]!);
    counts.push(chosen ? count : counts[index]!);
    contexts.push(chosen ? context : contexts[index]!);
  });
  const result: OwnerMoment[] = [];
  for (let at = items.length; at > 0;) {
    if (takes[at - 1]) {
      result.push(items[at - 1]!);
      at = prior[at - 1]!;
    } else at--;
  }
  return result.reverse();
}
