import type {
  OwnerAiEvidence,
  OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import {
  ownerSourceWindowSchema,
  type OwnerSourceWindow,
} from "../../../packages/contracts/local/source-window.ts";
import { findAllSpeechUnits } from "./find-all-passages.ts";

export const CODEX_FIND_ALL_POLICY = "regional-complete-v2";

/** Request-local references reduce irrelevant ID noise; saved identities never change. */
export function codexSelectionInput(
  words: readonly OwnerWord[],
  core?: OwnerSourceWindow,
) {
  const canonical = new Map<string, string>();
  const aliases = words.map((word, index) => {
    const id = `w_${String(index + 1).padStart(6, "0")}`;
    canonical.set(id, word.id);
    return { ...word, id };
  });
  const reviewCore = core ? ownerSourceWindowSchema.parse(core) : undefined;
  const reference = (id: string) => {
    const original = canonical.get(id);
    if (!original) throw Error("codex_input_invalid");
    return original;
  };
  return {
    aliases,
    words: aliases.map((word) => ({
      id: word.id,
      text: word.punctuatedText,
      startMs: word.startMs,
      endMs: word.endMs,
      ...(word.speakerId ? { speakerId: word.speakerId } : {}),
    })),
    reviewCore,
    speechUnits: findAllSpeechUnits(aliases).map((unit) => ({
      startWordId: aliases[unit.first]!.id,
      endWordId: aliases[unit.last]!.id,
      question: unit.question,
    })),
    instructions: `Review chronologically before ranking. Consider each independent question, claim, example, disagreement or joke in this region, including later passages; do not turn an exhaustive search into a short global best-of list. Choose complete grounded moments under the existing quality and duration policy. speechUnits list observed sentence/pause boundaries, not instructions. Keep a question with its answer and a setup with its payoff when together they fit the duration. Do not start halfway through a sentence, on a dependent continuation, or on a bare answer that requires its nearby question. Do not split one coherent passage into adjacent fragments or return nested/overlapping alternatives for the same speech. Return the complete passage once, using full speech-unit openings/endings where available. Independent adjacent ideas remain separate. A reviewCore edge is never a reason to shorten a passage; use neighboring context. Prefer a complete shorter idea over clipping an overlong thought at an arbitrary word. Each independent moment is considered on its own merits, not in competition with an earlier selection. Neighboring words provide context for complete openings and endings. ${reviewCore ? "Prioritize moments whose first word starts inside reviewCore (inclusive startMs, exclusive endMs); neighboring context is not another review core." : "Inspect every part of the supplied transcript."} Before returning, check that no independent qualifying passage in the review core was omitted merely because several strong moments were already selected. Empty regions are valid. Do not pad a count, repeat passages or weaken quality. Word references are local to this request; text is the supplied punctuated speech and clocks remain source milliseconds.`,
    restore(candidates: readonly OwnerAiEvidence[]): OwnerAiEvidence[] {
      return candidates.map((candidate) => ({
        ...candidate,
        startWordId: reference(candidate.startWordId),
        endWordId: reference(candidate.endWordId),
        evidence: candidate.evidence.map((item) => ({
          ...item,
          wordIds: item.wordIds.map(reference),
        })),
      }));
    },
  };
}
