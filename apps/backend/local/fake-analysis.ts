import { OWNER_LIMITS } from "../../../packages/contracts/local/index.ts";
import { OWNER_DEFAULT_AI_COUNT } from "../../../packages/contracts/local/policy.ts";
import { normalizeCandidateSelection } from "../src/analysis/analysis.provider-shape.ts";
import type { OwnerAnalysisPorts } from "./analysis.ts";

const conversation = [
  {
    speakerId: "spk_0",
    text: "When you look at Earth from far away, what stands out first?",
  },
  {
    speakerId: "spk_1",
    text: "The oceans. They connect places that feel completely separate when we are standing on the ground.",
  },
  {
    speakerId: "spk_0",
    text: "So a different perspective can change the question we ask?",
  },
  {
    speakerId: "spk_1",
    text: "Exactly. Instead of asking how big a problem is, try asking which small part you can improve today.",
  },
  {
    speakerId: "spk_0",
    text: "Give me an example that someone could actually try.",
  },
  {
    speakerId: "spk_1",
    text: "Take a walk without your phone. Notice one thing you usually miss, then tell a friend why it caught your attention.",
  },
  {
    speakerId: "spk_0",
    text: "I like that. Curiosity begins with paying attention, rather than having all the answers.",
  },
  {
    speakerId: "spk_1",
    text: "And a good conversation works the same way. Leave space, listen carefully, and let the next question surprise you.",
  },
].flatMap((turn) =>
  turn.text.split(" ").map((text) => ({ text, speakerId: turn.speakerId })),
);

/** Deliberately fictional words: this adapter never reads or transcribes source audio. */
export const fakeOwnerAnalysis: OwnerAnalysisPorts = {
  mode: "synthetic-ai",
  async transcribe(workspace, signal) {
    signal.throwIfAborted();
    return Array.from(
      { length: Math.ceil(workspace.source.durationMs / 500) },
      (_, index) => ({
        id: `w_${String(index + 1).padStart(6, "0")}`,
        startMs: index * 500,
        endMs: Math.min(workspace.source.durationMs, (index + 1) * 500),
        text: conversation[index % conversation.length]!.text.replace(
          /[.,?!]/g,
          "",
        ),
        punctuatedText: conversation[index % conversation.length]!.text,
        speakerId: conversation[index % conversation.length]!.speakerId,
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
    const duration = Math.max(policy.minMs, Math.min(30_000, policy.maxMs));
    const candidates = [];
    for (let index = 0; index < OWNER_LIMITS.ranges + requestedCount; index++) {
      const start = words.findIndex((word) => word.startMs >= index * duration),
        end = words.findLastIndex(
          (word) => word.endMs <= (index + 1) * duration,
        );
      if (!words[start] || !words[end]) break;
      candidates.push(
        ...normalizeCandidateSelection(
          {
            candidates: [
              {
                startWordId: words[start].id,
                endWordId: words[end].id,
                titleWordIds: words
                  .slice(start, Math.min(end + 1, start + 6))
                  .map((word) => word.id),
                hookWordIds: words
                  .slice(start, Math.min(end + 1, start + 10))
                  .map((word) => word.id),
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
