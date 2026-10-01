import {
  analysisBundleSchema,
  assemblyBundleSchema,
  compositionManifestSchema,
  mediaDescriptorSchema,
  operationStatusSchema,
  type CompositionManifestV1,
  type OperationStatusV1,
  type SafeError,
} from "@clipbuilder/contracts";

import type {
  ClipReviewSession,
  ClippingSessionState,
  SessionIdentity,
} from "./session.types";

const id = (prefix: string, character: string) =>
  `${prefix}_${character.repeat(22)}`;

export const identity: SessionIdentity = {
  sessionId: id("ses", "s"),
  mode: "sample",
  expiresAt: "2026-09-29T12:00:00.000Z",
  remaining: { analysisRetries: 1, renderAttempts: 1 },
};

export const media = mediaDescriptorSchema.parse({
  mediaId: id("med", "m"),
  objectGeneration: "1",
  container: "mp4",
  videoCodec: "h264",
  audioCodec: "aac",
  durationMs: 60_000,
  width: 1_920,
  height: 1_080,
  averageFrameRate: 30,
  rotationDegrees: 0,
  hasAudio: true,
  bytes: 10_000,
  orientation: "landscape",
});

export const manifest: CompositionManifestV1 = compositionManifestSchema.parse({
  version: 1,
  baseCandidateId: id("cand", "c"),
  analysisRevision: id("rev", "a"),
  assemblyRevision: id("rev", "b"),
  range: { startWordId: "w_000001", endWordId: "w_000030" },
  speakerFraming: {
    mode: "active-speaker",
    focusTrackId: id("trk", "f"),
    shotTrackId: id("trk", "s"),
    smoothingProfile: "editorial",
  },
  captions: { profile: "clean-emphasis" },
  visuals: { planRevision: id("rev", "v"), cues: [] },
  audio: { normalization: "speech-safe" },
});

export const analysis = analysisBundleSchema.parse({
  version: 1,
  analysisId: id("ana", "a"),
  revision: id("rev", "a"),
  media,
  transcript: {
    version: 1,
    revision: id("rev", "t"),
    language: "en",
    durationMs: 60_000,
    words: [
      {
        id: "w_000001",
        startMs: 0,
        endMs: 1_000,
        text: "Start",
        punctuatedText: "Start",
        speakerId: "spk_0",
        confidence: 0.99,
      },
      {
        id: "w_000002",
        startMs: 5_000,
        endMs: 6_000,
        text: "clear",
        punctuatedText: "clear",
        speakerId: "spk_0",
        confidence: 0.99,
      },
      {
        id: "w_000030",
        startMs: 12_000,
        endMs: 13_000,
        text: "payoff",
        punctuatedText: "payoff.",
        speakerId: "spk_0",
        confidence: 0.99,
      },
    ],
    utterances: [
      {
        id: "utt_000001",
        startWordId: "w_000001",
        endWordId: "w_000030",
        speakerId: "spk_0",
      },
    ],
    providerMetadata: {
      provider: "fake",
      modelConfigId: "frontend-fixture-v1",
      diarizationAvailable: true,
    },
  },
  candidates: [
    {
      version: 1,
      id: id("cand", "c"),
      rank: 1,
      startWordId: "w_000001",
      endWordId: "w_000030",
      title: "Start with a clear payoff",
      hook: "Start clear and preserve the payoff.",
      rationale: "The range is bounded by a direct opening and conclusion.",
      evidence: [
        {
          signal: "immediate-hook",
          wordIds: ["w_000001"],
          note: "The first word opens the thought directly.",
        },
        {
          signal: "clear-payoff",
          wordIds: ["w_000030"],
          note: "The final word marks the conclusion.",
        },
      ],
      caveats: [],
    },
  ],
  outcome: "candidates",
  warnings: [],
});

export const noCandidateAnalysis = analysisBundleSchema.parse({
  ...analysis,
  revision: id("rev", "n"),
  transcript: { ...analysis.transcript, revision: id("rev", "n") },
  candidates: [],
  outcome: "no-strong-candidates",
});

export const assembly = assemblyBundleSchema.parse({
  version: 1,
  assemblyId: id("asm", "a"),
  revision: id("rev", "b"),
  analysisRevision: id("rev", "a"),
  selectedStartWordId: "w_000001",
  selectedEndWordId: "w_000030",
  speakerFocus: {
    version: 1,
    revision: id("rev", "f"),
    shots: [
      {
        id: id("shot", "s"),
        startMs: 0,
        endMs: 13_000,
        cutIn: "source-start",
      },
    ],
    faceTracks: [
      {
        id: id("face", "f"),
        shotId: id("shot", "s"),
        startMs: 0,
        endMs: 13_000,
        samples: [
          {
            atMs: 0,
            x: 0.25,
            y: 0.1,
            width: 0.5,
            height: 0.8,
            speakingProbability: 0.9,
          },
          {
            atMs: 13_000,
            x: 0.25,
            y: 0.1,
            width: 0.5,
            height: 0.8,
            speakingProbability: 0.9,
          },
        ],
      },
    ],
    focus: [
      {
        id: id("focus", "f"),
        shotId: id("shot", "s"),
        startWordId: "w_000001",
        endWordId: "w_000030",
        faceTrackId: id("face", "f"),
        cropCenterX: 0.5,
        cropCenterY: 0.5,
        transition: "hold",
      },
    ],
    detectorConfigId: "fake-detector-v1",
  },
  visualPlan: {
    version: 1,
    revision: id("rev", "v"),
    artDirection: "precision-cut-v1",
    requests: [],
    cues: [],
    totalCoverageMs: 0,
  },
  assets: [],
  manifestId: id("man", "m"),
  manifestHash: "2".repeat(64),
  compositionManifest: manifest,
});

export const failure: SafeError = {
  code: "INTERNAL_ERROR",
  message: "ClipBuilder could not complete the request.",
  retryable: true,
  requestId: `req_${"0".repeat(32)}`,
  ruleId: "fixture.failure",
};

export function operation(
  kind: OperationStatusV1["kind"],
  stageCode = kind === "media-inspection"
    ? "media.inspecting"
    : kind === "cleanup"
      ? "cleanup.cancelling"
      : `${kind}.queued`,
  character = "o",
): OperationStatusV1 {
  return operationStatusSchema.parse({
    operationId: id("op", character),
    kind,
    state: stageCode.endsWith(".queued") ? "queued" : "running",
    stageCode,
    startedAt: stageCode.endsWith(".queued")
      ? null
      : "2026-09-29T10:00:00.000Z",
    updatedAt: "2026-09-29T10:00:00.000Z",
    completedAt: null,
    pollAfterMs: 1_000,
    resultRevision: null,
    error: null,
  });
}

export function reviewSession(): ClipReviewSession {
  return {
    selectedCandidateId: manifest.baseCandidateId,
    selectedStartWordId: manifest.range.startWordId,
    selectedEndWordId: manifest.range.endWordId,
    assemblyReference: {
      assemblyId: assembly.assemblyId,
      revision: assembly.revision,
    },
    manifestReference: {
      manifestId: assembly.manifestId,
      manifestHash: assembly.manifestHash,
      analysisRevision: assembly.analysisRevision,
      assemblyRevision: assembly.revision,
    },
    playback: { status: "idle", currentTimeMs: 0 },
  };
}

export function reviewState(): Extract<
  ClippingSessionState,
  { stage: "clip-review" }
> {
  return {
    stage: "clip-review",
    identity,
    analysis: {
      analysisId: analysis.analysisId,
      revision: analysis.revision,
      bundle: analysis,
    },
    assembly,
    review: reviewSession(),
    diagnosticCode: null,
  };
}
