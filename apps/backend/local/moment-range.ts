import { createHash } from "node:crypto";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";
import {
  OWNER_FPS,
  ownerCut,
  ownerMomentRangeRequestSchema,
  ownerReviewedMomentCut,
  type OwnerAnalysis,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import { ownerLocalCues } from "./analysis.ts";

/** Correct a result using retained speech only; provider/media ports are absent. */
export function editOwnerMomentRange(
  workspace: OwnerWorkspace,
  analysis: OwnerAnalysis,
  value: unknown,
  retainedSpeech?: readonly OwnerWord[],
): OwnerAnalysis {
  const request = ownerMomentRangeRequestSchema.parse(value);
  if (
    request.analysisId !== analysis.id ||
    request.sourceRevision !== workspace.revision ||
    analysis.inputs.sourceRevision !== workspace.revision ||
    request.policyRevision !== analysis.inputs.policyRevision
  )
    throw Error("stale_edit_revision");
  const cut = ownerCut(request.range, workspace.source.durationMs);
  const moments = [...analysis.manual, ...analysis.suggestions];
  const sameCut = (a: typeof cut, b: typeof cut) =>
    a.startFrame === b.startFrame && a.endFrame === b.endFrame;
  const original = moments.find((moment) => moment.id === request.momentId);
  // A lost successful response can safely be acknowledged once more.
  if (!original) {
    const accepted = moments.find(
      (moment) => moment.id === request.operationId,
    );
    if (accepted && sameCut(accepted.cut, cut)) return analysis;
    throw Error("stale_edit_revision");
  }
  if (!sameCut(original.cut, request.expectedCut))
    throw Error("stale_edit_revision");
  if (sameCut(original.cut, cut)) return analysis;
  if (moments.some((moment) => moment.id === request.operationId))
    throw Error("stale_edit_revision");
  ownerReviewedMomentCut(workspace.source, analysis, original, request.range);
  const cues =
    retainedSpeech || analysis.words.length
      ? ownerLocalCues(retainedSpeech ?? analysis.words, cut)
      : moments.flatMap((moment) => {
          if (
            moment.cut.endFrame <= cut.startFrame ||
            moment.cut.startFrame >= cut.endFrame
          )
            return [];
          const offset = (moment.cut.startFrame * 1000) / OWNER_FPS;
          return ownerLocalCues(
            moment.cues.map((word) => ({
              ...word,
              startMs: word.startMs + offset,
              endMs: word.endMs + offset,
            })),
            cut,
          );
        });
  const uniqueCues = [
    ...new Map(cues.map((word) => [word.id, word])).values(),
  ].sort((a, b) => a.startMs - b.startMs);
  const replacement = {
    ...original,
    id: request.operationId,
    cut,
    processingIdentity: createHash("sha256")
      .update(
        `${workspace.source.fingerprint}:${cut.startFrame}:${cut.endFrame}`,
      )
      .digest("hex"),
    cues: uniqueCues,
    ...(!analysis.words.length && analysis.coverage
      ? { speakersPrepared: false }
      : {}),
  };
  return {
    ...analysis,
    manual: analysis.manual.map((moment) =>
      moment.id === original.id ? replacement : moment,
    ),
    suggestions: analysis.suggestions.map((moment) =>
      moment.id === original.id ? replacement : moment,
    ),
  };
}
