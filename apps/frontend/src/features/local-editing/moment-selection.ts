import { OWNER_LIMITS } from "../../../../../packages/contracts/local/index.ts";
import type {
  OwnerAnalysis,
  OwnerMomentExport,
} from "../../../../../packages/contracts/local/selection.ts";

/** Manual requests take priority when all results exceed the processing limit. */
export function defaultMomentSelection(
  analysis: OwnerAnalysis,
): OwnerMomentExport[] {
  return [
    ...new Set(
      [...analysis.manual, ...analysis.suggestions].map(({ id }) => id),
    ),
  ]
    .slice(0, OWNER_LIMITS.clips)
    .map((momentId) => ({
      analysisId: analysis.id,
      momentId,
      policyRevision: analysis.inputs.policyRevision,
    }));
}
