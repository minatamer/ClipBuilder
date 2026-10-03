import {
  compositionManifestV2Schema,
  selectedAssemblyResultSchema,
  FIXED_COMPOSITION_POLICY,
  type GroundedAnalysisResult,
} from "@clipbuilder/contracts";
import { analysis } from "../session/session.test-fixtures";

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
  const manifest = compositionManifestV2Schema.parse({
    version: 2,
    source: {
      fingerprint: source.binding.fingerprint,
      durationMs: media.durationMs,
      width: media.width,
      height: media.height,
    },
    range,
    output: { width: 1080, height: 1920, fps: 30 },
    focus: [{ mode: "wide", startMs: 0, endMs: range.endMs - range.startMs }],
    cards: [],
    captions: words.map((w) => ({
      startMs: w.startMs - range.startMs,
      endMs: w.endMs - range.startMs,
      text: w.punctuatedText,
      wordIds: [w.id],
      lines: [w.punctuatedText],
      emphasisWordIndex: 0,
    })),
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(manifest)),
  );
  return selectedAssemblyResultSchema.parse({
    version: 1,
    binding: source.binding,
    generation: source.generation,
    analysisRevision: source.analysis.revision,
    candidateId: candidate.id,
    policy: FIXED_COMPOSITION_POLICY.version,
    provider: "fake",
    words,
    cardEvidence: [],
    manifest,
    manifestHash: Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(""),
    receipt: "synthetic-assembly-receipt",
  });
}
