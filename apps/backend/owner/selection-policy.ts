import {
  OWNER_DEFAULT_AI_COUNT,
  OWNER_LIMITS,
} from "../../../packages/contracts/owner/policy.ts";
import { ownerAiCountSchema } from "../../../packages/contracts/owner/selection.ts";
import { candidateSelectionPolicy } from "../src/analysis/analysis.prompt.ts";

export function ownerSelectionPolicy(
  duration: { minMs: number; maxMs: number },
  requested = OWNER_DEFAULT_AI_COUNT,
) {
  const count = ownerAiCountSchema.parse(requested);
  const proposals = OWNER_LIMITS.ranges + count;
  return (
    candidateSelectionPolicy(duration, proposals, proposals, true) +
    `\nThe owner requests ${count} independent final AI moments. The bounded proposal pool above allows reconciliation to skip exact manual matches, overlap and invalid proposals while retaining up to ${count} additional moments. Supply only grounded strong proposals; fewer is valid when the source cannot support them. Never invent passages or change the requested duration to meet the count.`
  );
}
