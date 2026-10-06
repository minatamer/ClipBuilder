import {
  compositionManifestV3Schema,
  selectedAssemblyResultSchema,
  FIXED_COMPOSITION_POLICY,
  type GroundedAnalysisResult,
} from "@clipbuilder/contracts";
import { assemblyAnalysis as analysis } from "../session/session.test-fixtures";

export function groundedFixture(): GroundedAnalysisResult {
  return {
    binding: {
      sessionId: "ses_" + "c".repeat(22),
      sourceRevision: analysis.media.sourceRevision,
      fingerprint: "a".repeat(64),
    },
    generation: "12",
    analysis,
    receipt: "synthetic-source-receipt",
  };
}
export async function selectedAssemblyFixture(
  source = groundedFixture(),
  candidateId = source.analysis.candidates[0]!.id,
) {
  const candidate = source.analysis.candidates.find(
    (item) => item.id === candidateId,
  );
  if (!candidate) throw new Error("Synthetic candidate is missing.");
  const allWords = source.analysis.transcript.words;
  const words = allWords.slice(
    allWords.findIndex((word) => word.id === candidate.startWordId),
    allWords.findIndex((word) => word.id === candidate.endWordId) + 1,
  );
  const range = { startMs: words[0]!.startMs, endMs: words.at(-1)!.endMs };
  const media = source.analysis.media;
  const anchor = words.findIndex(
    (word) => word.startMs - range.startMs >= 2000,
  );
  const excerpt = words.slice(anchor, anchor + 3);
  if (anchor < 0 || excerpt.length < 3)
    throw new Error("Synthetic visual evidence is missing.");
  const manifest = compositionManifestV3Schema.parse({
    version: 3,
    source: {
      fingerprint: source.binding.fingerprint,
      durationMs: media.durationMs,
      width: media.width,
      height: media.height,
    },
    range,
    output: { width: 1080, height: 1920, fps: 30 },
    focus: [
      {
        mode: "wide",
        reason: "initial",
        startMs: 0,
        endMs: range.endMs - range.startMs,
      },
    ],
    cards: [
      {
        origin: "planner",
        startMs: excerpt[0]!.startMs - range.startMs,
        endMs:
          Math.max(excerpt[0]!.startMs + 1500, excerpt[2]!.endMs) -
          range.startMs,
        kind: "statement",
        title: excerpt[0]!.punctuatedText,
        lines: [
          excerpt
            .slice(1)
            .map((word) => word.punctuatedText)
            .join(" "),
        ],
      },
    ],
    captions: words.map((w) => ({
      startMs: w.startMs - range.startMs,
      endMs: w.endMs - range.startMs,
      text: w.punctuatedText,
      wordIds: [w.id],
      lines: [w.punctuatedText],
      wordCues: [
        {
          wordId: w.id,
          text: w.punctuatedText,
          startMs: w.startMs - range.startMs,
          endMs: w.endMs - range.startMs,
        },
      ],
    })),
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(manifest)),
  );
  return selectedAssemblyResultSchema.parse({
    version: 2,
    binding: source.binding,
    generation: source.generation,
    analysisRevision: source.analysis.revision,
    candidateId: candidate.id,
    policy: FIXED_COMPOSITION_POLICY.version,
    provider: "fake",
    words,
    cardEvidence: [
      {
        origin: "planner",
        anchorWordId: excerpt[0]!.id,
        titleWordIds: [excerpt[0]!.id],
        lineWordIds: [excerpt.slice(1).map((word) => word.id)],
      },
    ],
    manifest,
    manifestHash: Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(""),
    receipt: "synthetic-assembly-receipt",
  });
}
