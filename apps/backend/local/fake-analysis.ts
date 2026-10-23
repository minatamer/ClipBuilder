import { OWNER_LIMITS } from "../../../packages/contracts/local/index.ts";
import { OWNER_DEFAULT_AI_COUNT } from "../../../packages/contracts/local/policy.ts";
import { normalizeCandidateSelection } from "../src/analysis/analysis.provider-shape.ts";
import type { OwnerAnalysisPorts } from "./analysis.ts";

/** Deliberately fictional words: this adapter never reads or transcribes source audio. */
export const fakeOwnerAnalysis: OwnerAnalysisPorts = {
  mode: "synthetic-ai",
  async transcribe(workspace, signal) {
    signal.throwIfAborted();
    return Array.from(
      { length: Math.floor(workspace.source.durationMs / 1000) },
      (_, index) => ({
        id: `w_${String(index + 1).padStart(6, "0")}`,
        startMs: index * 1000,
        endMs: Math.min(workspace.source.durationMs, index * 1000 + 800),
        text: "Synthetic",
        punctuatedText: "Synthetic",
        speakerId: null,
        confidence: 1,
      }),
    );
  },
  async select(
    words,
    policy,
    signal,
    _instructions,
    requestedCount = OWNER_DEFAULT_AI_COUNT,
  ) {
    signal.throwIfAborted();
    const seconds =
      Math.max(policy.minMs, Math.min(30_000, policy.maxMs)) / 1000;
    const candidates = [];
    for (let index = 0; index < OWNER_LIMITS.ranges + requestedCount; index++) {
      const start = Math.ceil(index * seconds),
        end = Math.min(words.length - 1, Math.ceil((index + 1) * seconds) - 1);
      if (!words[start] || !words[end]) break;
      candidates.push(
        ...normalizeCandidateSelection(
          {
            candidates: [
              {
                startWordId: words[start].id,
                endWordId: words[end].id,
                titleWordIds: [words[start].id],
                hookWordIds: [words[start].id],
                evidence: [
                  { signal: "immediate-hook", wordIds: [words[start].id] },
                  { signal: "clear-payoff", wordIds: [words[end].id] },
                ],
                caveats: [],
              },
            ],
          },
          [...words],
        ).candidates,
      );
    }
    return candidates;
  },
};
