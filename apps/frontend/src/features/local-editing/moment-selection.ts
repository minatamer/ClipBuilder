import {
  OWNER_FPS,
  type OwnerCut,
} from "../../../../../packages/contracts/local/policy.ts";
import type {
  OwnerAnalysis,
  OwnerMomentExport,
} from "../../../../../packages/contracts/local/selection.ts";

/** Retain every result for review; processing enforces its separate batch limit. */
export function defaultMomentSelection(
  analysis: OwnerAnalysis,
): OwnerMomentExport[] {
  return [
    ...new Set(
      [...analysis.manual, ...analysis.suggestions].map(({ id }) => id),
    ),
  ].map((momentId) => ({
    analysisId: analysis.id,
    momentId,
    policyRevision: analysis.inputs.policyRevision,
  }));
}

export function momentDuration(cut: OwnerCut): string {
  const seconds = Number(
    ((cut.endFrame - cut.startFrame) / OWNER_FPS).toFixed(2),
  );
  const minutes = Math.floor(seconds / 60);
  const remainder = Number((seconds - minutes * 60).toFixed(2));
  return [
    minutes ? `${minutes}m` : "",
    remainder || !minutes ? `${remainder}s` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
