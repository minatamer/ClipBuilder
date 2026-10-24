import { ownerWordsSchema } from "../../../packages/contracts/local/selection.ts";
import type { LocalDiagnostics } from "./diagnostics.ts";

/** Retain decoded provider words exactly; timing critique never gates acceptance. */
export function retainOwnerTranscript(
  value: unknown,
  durationMs: number,
  diagnostics: LocalDiagnostics,
) {
  const words = ownerWordsSchema.parse(value);
  const ids = new Set<string>();
  let outOfOrderWords = 0,
    previous = -1;
  let nonpositiveWords = 0,
    outsideMediaWords = 0;
  for (const word of words) {
    if (ids.has(word.id)) throw new Error("invalid_owner_transcript");
    ids.add(word.id);
    if (word.endMs <= word.startMs) {
      nonpositiveWords++;
    }
    if (word.startMs >= durationMs || word.endMs > durationMs) {
      outsideMediaWords++;
    }
    if (word.startMs < previous) outOfOrderWords++;
    previous = word.startMs;
  }
  if (nonpositiveWords || outsideMediaWords || outOfOrderWords)
    diagnostics.critique("transcript_validate");
  diagnostics.transcriptTiming({
    returnedWords: words.length,
    acceptedWords: words.length,
    nonpositiveWords,
    outsideMediaWords,
    reorderedWords: 0,
    outOfOrderWords,
  });
  return words;
}
