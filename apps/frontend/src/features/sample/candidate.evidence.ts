import type { AnalysisBundleV1, ClipCandidateV1 } from "@clipbuilder/contracts";

export function candidateRange(
  analysis: AnalysisBundleV1,
  candidate: ClipCandidateV1,
) {
  const start = analysis.transcript.words.find(
    (word) => word.id === candidate.startWordId,
  );
  const end = analysis.transcript.words.find(
    (word) => word.id === candidate.endWordId,
  );
  if (start === undefined || end === undefined)
    throw new Error("Candidate references are unavailable.");
  return {
    startMs: start.startMs,
    endMs: end.endMs,
    durationMs: end.endMs - start.startMs,
  };
}

export function evidenceWords(
  analysis: AnalysisBundleV1,
  wordIds: readonly string[],
) {
  return wordIds.map((id) => {
    const word = analysis.transcript.words.find((item) => item.id === id);
    if (word === undefined)
      throw new Error("Evidence references are unavailable.");
    return word;
  });
}

export function timecode(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1_000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export const signalLabels = {
  "immediate-hook": "Direct opening",
  "clear-payoff": "Clear payoff",
  "self-contained": "Complete idea",
  specific: "Specific detail",
  "human-energy": "Human energy",
  "appropriate-length": "Appropriate length",
  "visual-feasibility": "Visual potential",
  "clean-boundaries": "Clean boundaries",
} as const;
