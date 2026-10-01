import { createHash } from "node:crypto";
import {
  assemblyBundleSchema,
  type AnalysisBundleV1,
} from "@clipbuilder/contracts";
import { SAMPLE_ASSEMBLY } from "./sampleAnalysis.js";

// Synthetic preview specification only; no recorded media or generated asset.
export function conversationAssembly(
  analysis: AnalysisBundleV1,
  candidateId: string,
  assemblyId: string,
) {
  const candidate = analysis.candidates.find((item) => item.id === candidateId);
  const start = analysis.transcript.words.find(
    (word) => word.id === candidate?.startWordId,
  );
  const end = analysis.transcript.words.find(
    (word) => word.id === candidate?.endWordId,
  );
  if (candidate === undefined || start === undefined || end === undefined)
    throw new Error("Invalid fixture selection.");
  const words = analysis.transcript.words
    .filter((word) => word.startMs >= start.startMs && word.endMs <= end.endMs)
    .slice(-8);
  const first = words[0];
  const last = words.at(-1);
  if (first === undefined || last === undefined)
    throw new Error("Invalid fixture quote.");
  const seed = SAMPLE_ASSEMBLY;
  const seedShot = seed.speakerFocus.shots[0];
  const seedFace = seed.speakerFocus.faceTracks[0];
  const seedFocus = seed.speakerFocus.focus[0];
  const seedRequest = seed.visualPlan.requests[0];
  const seedCue = seed.visualPlan.cues[0];
  const seedAsset = seed.assets[0];
  if (
    !seedShot ||
    !seedFace ||
    !seedFocus ||
    !seedRequest ||
    !seedCue ||
    !seedAsset
  )
    throw new Error("Invalid fixture specification.");
  const revision = `rev_${"d".repeat(22)}`;
  const quote = words.map((word) => word.punctuatedText).join(" ");
  const cue = {
    ...seedCue,
    startWordId: first.id,
    endWordId: last.id,
    rationale:
      "Reinforces the closing takeaway using the speaker's exact words.",
  };
  const visualPlan = {
    ...seed.visualPlan,
    revision,
    requests: [
      {
        ...seedRequest,
        kind: "quote-card",
        subjectWordIds: words.map((word) => word.id),
        factualBrief: "Exact prepared transcript quote.",
        imagePrompt: null,
        equationTex: null,
        exactText: quote,
      },
    ],
    cues: [cue],
    totalCoverageMs: last.endMs - first.startMs,
  };
  const manifest = {
    ...seed.compositionManifest,
    baseCandidateId: candidate.id,
    analysisRevision: analysis.revision,
    assemblyRevision: revision,
    range: { startWordId: start.id, endWordId: end.id },
    visuals: {
      planRevision: revision,
      cues: [
        {
          id: cue.id,
          startWordId: first.id,
          endWordId: last.id,
          rationale: cue.rationale,
          kind: "quote-card",
          assetId: seedAsset.id,
          layout: cue.layout,
          motion: cue.motion,
          transition: cue.transition,
        },
      ],
    },
  };
  return assemblyBundleSchema.parse({
    ...seed,
    assemblyId,
    revision,
    analysisRevision: analysis.revision,
    selectedStartWordId: start.id,
    selectedEndWordId: end.id,
    speakerFocus: {
      ...seed.speakerFocus,
      revision,
      detectorConfigId: "development-synthetic-focus-v1",
      shots: [{ ...seedShot, startMs: start.startMs, endMs: end.endMs }],
      faceTracks: [
        {
          ...seedFace,
          startMs: start.startMs,
          endMs: end.endMs,
          samples: seedFace.samples.map((sample) => ({
            ...sample,
            atMs: start.startMs,
          })),
        },
      ],
      focus: [{ ...seedFocus, startWordId: start.id, endWordId: end.id }],
    },
    visualPlan,
    assets: [{ ...seedAsset, source: "fake-fixture" }],
    manifestId: `man_${assemblyId.slice(4)}`,
    manifestHash: createHash("sha256")
      .update(JSON.stringify(manifest))
      .digest("hex"),
    compositionManifest: manifest,
  });
}
