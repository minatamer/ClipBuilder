import { describe, expect, it } from "vitest";

import {
  OWNER_VALIDATION_LIMITS,
  PUBLIC_LIMITS,
  SAFE_ERROR_MESSAGES,
  analysisContextSchema,
  analysisBundleSchema,
  assemblyRequestSchema,
  canOperationTransition,
  canObserveOperationState,
  isSourceWithinLimitProfile,
  mediaDescriptorSchema,
  operationStatusSchema,
  publicConfigResponseSchema,
  renderRequestSchema,
  safeErrorSchema,
  sessionResponseSchema,
  transcriptBundleSchema,
  uploadAuthorizeRequestSchema,
} from "./index.js";

const opaqueId = (prefix: string) => `${prefix}_${"a".repeat(22)}`;

const validMedia = {
  mediaId: opaqueId("med"),
  sourceRevision: opaqueId("rev"),
  container: "mp4",
  videoCodec: "h264",
  audioCodec: "aac",
  durationMs: 60_000,
  width: 1_920,
  height: 1_080,
  averageFrameRate: 30,
  rotationDegrees: 0,
  hasAudio: true,
  bytes: 20_000_000,
  orientation: "landscape",
} as const;

const validOperation = {
  operationId: opaqueId("op"),
  kind: "analysis",
  state: "running",
  stageCode: "analysis.normalizing-transcript",
  startedAt: "2026-09-29T10:00:00.000Z",
  updatedAt: "2026-09-29T10:00:01.000Z",
  completedAt: null,
  pollAfterMs: 2_000,
  resultRevision: null,
  error: null,
} as const;

describe("compiled limits", () => {
  it("keeps public byte and duration ceilings independent and inclusive", () => {
    expect(PUBLIC_LIMITS.maxSourceBytes).toBe(524_288_000);
    expect(PUBLIC_LIMITS.maxSourceSeconds).toBe(1_200);
    expect(PUBLIC_LIMITS.minSourceSeconds).toBe(15);
    expect(PUBLIC_LIMITS.minClipSeconds).toBe(10);
    expect(PUBLIC_LIMITS.maxClipSeconds).toBe(60);

    expect(
      isSourceWithinLimitProfile(
        {
          bytes: PUBLIC_LIMITS.maxSourceBytes,
          durationMs: PUBLIC_LIMITS.maxSourceSeconds * 1_000,
        },
        "public",
      ),
    ).toBe(true);
    expect(
      isSourceWithinLimitProfile(
        {
          bytes: PUBLIC_LIMITS.maxSourceBytes + 1,
          durationMs: PUBLIC_LIMITS.minSourceSeconds * 1_000,
        },
        "public",
      ),
    ).toBe(false);
    expect(
      isSourceWithinLimitProfile(
        {
          bytes: 1,
          durationMs: PUBLIC_LIMITS.maxSourceSeconds * 1_000 + 1,
        },
        "public",
      ),
    ).toBe(false);
  });

  it("keeps validation limits separate from the public promise", () => {
    expect(OWNER_VALIDATION_LIMITS.maxSourceBytes).toBeGreaterThan(
      PUBLIC_LIMITS.maxSourceBytes,
    );
    expect(
      isSourceWithinLimitProfile(
        {
          bytes: PUBLIC_LIMITS.maxSourceBytes + 1,
          durationMs: 60_000,
        },
        "validation",
      ),
    ).toBe(true);
  });
});

describe("strict boundary schemas", () => {
  it("accepts MP4 and rejects WebM descriptors and upload declarations", () => {
    expect(mediaDescriptorSchema.safeParse(validMedia).success).toBe(true);
    expect(
      mediaDescriptorSchema.safeParse({ ...validMedia, container: "webm" })
        .success,
    ).toBe(false);
    const upload = {
      declaredBytes: 8192,
      declaredContentType: "video/mp4",
      turnstileToken: "local-synthetic-fixture",
    };
    expect(uploadAuthorizeRequestSchema.safeParse(upload).success).toBe(true);
    expect(
      uploadAuthorizeRequestSchema.safeParse({
        ...upload,
        declaredContentType: "video/webm",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown keys, non-finite values, and inconsistent orientation", () => {
    expect(
      mediaDescriptorSchema.safeParse({ ...validMedia, unexpected: true })
        .success,
    ).toBe(false);
    expect(
      mediaDescriptorSchema.safeParse({
        ...validMedia,
        averageFrameRate: Number.NaN,
      }).success,
    ).toBe(false);
    expect(
      mediaDescriptorSchema.safeParse({
        ...validMedia,
        orientation: "portrait",
      }).success,
    ).toBe(false);
  });

  it("normalizes text and rejects controls, bidi overrides, and URLs", () => {
    expect(
      analysisContextSchema.parse({
        contentCategory: "  Cafe\u0301 science  ",
        targetPlatform: "generic-vertical",
      }).contentCategory,
    ).toBe("Café science");
    expect(
      analysisContextSchema.safeParse({
        audience: "unsafe\u202Etext",
        targetPlatform: "generic-vertical",
      }).success,
    ).toBe(false);
    expect(
      analysisContextSchema.safeParse({
        audience: "visit https://example.com",
        targetPlatform: "generic-vertical",
      }).success,
    ).toBe(false);
  });

  it("accepts transcript references outside the normalized word set", () => {
    const result = transcriptBundleSchema.safeParse({
      version: 1,
      revision: opaqueId("rev"),
      language: "en",
      durationMs: 20_000,
      words: [
        {
          id: "w_000001",
          startMs: 0,
          endMs: 500,
          text: "Safe",
          punctuatedText: "Safe.",
          speakerId: "spk_0",
          confidence: 0.99,
        },
      ],
      utterances: [
        {
          id: "utt_000001",
          startWordId: "w_000001",
          endWordId: "w_999999",
          speakerId: "spk_0",
        },
      ],
      providerMetadata: {
        provider: "fake",
        modelConfigId: "fixture-v1",
        diarizationAvailable: true,
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts candidate ranges or evidence outside the transcript", () => {
    const transcript = {
      version: 1,
      revision: opaqueId("rev"),
      language: "en",
      durationMs: 20_000,
      words: [
        {
          id: "w_000001",
          startMs: 0,
          endMs: 500,
          text: "First",
          punctuatedText: "First",
          speakerId: "spk_0",
          confidence: 0.99,
        },
        {
          id: "w_000002",
          startMs: 500,
          endMs: 1_000,
          text: "second",
          punctuatedText: "second.",
          speakerId: "spk_0",
          confidence: 0.99,
        },
      ],
      utterances: [],
      providerMetadata: {
        provider: "fake",
        modelConfigId: "fixture-v1",
        diarizationAvailable: true,
      },
    } as const;

    const result = analysisBundleSchema.safeParse({
      version: 1,
      analysisId: opaqueId("ana"),
      revision: opaqueId("rev"),
      media: { ...validMedia, durationMs: 20_000 },
      transcript,
      candidates: [
        {
          version: 1,
          id: opaqueId("cand"),
          rank: 1,
          startWordId: "w_000001",
          endWordId: "w_000002",
          title: "A bounded candidate",
          hook: "A grounded hook",
          rationale: "The candidate has a clear setup and payoff.",
          evidence: [
            {
              signal: "immediate-hook",
              wordIds: ["w_999999"],
              note: "Invalid outside reference",
            },
            {
              signal: "clear-payoff",
              wordIds: ["w_000002"],
              note: "Grounded ending",
            },
          ],
          caveats: [],
        },
      ],
      outcome: "candidates",
      warnings: [],
    });

    expect(result.success).toBe(true);
  });

  it("exposes zero-to-four candidate limits and accepts only hash-bound automatic renders", () => {
    const config = publicConfigResponseSchema.parse({
      mode: "fake",
      sampleEnabled: true,
      localMediaEnabled: false,
      liveAnalysisEnabled: false,
      liveAssemblyEnabled: false,
      liveRenderEnabled: false,
      limits: {
        sourceBytes: PUBLIC_LIMITS.maxSourceBytes,
        sourceSeconds: PUBLIC_LIMITS.maxSourceSeconds,
        clipSecondsMin: PUBLIC_LIMITS.minClipSeconds,
        clipSecondsMax: PUBLIC_LIMITS.maxClipSeconds,
        candidateTarget: 3,
        candidateMax: 4,
        renders: 1,
      },
      features: {
        activeSpeakerFraming: true,
        contextualVisuals: true,
        trendSignals: false,
        languages: ["en"],
      },
      accessTtlSeconds: 7_200,
      deletionCopyVersion: "v1",
    });
    expect(config.limits).toMatchObject({
      candidateTarget: 3,
      candidateMax: 4,
    });

    const automaticRequest = {
      analysisId: opaqueId("ana"),
      assemblyId: opaqueId("asm"),
      manifestHash: "a".repeat(64),
      turnstileToken: "fixture-token",
    };
    expect(renderRequestSchema.safeParse(automaticRequest).success).toBe(true);
    expect(
      renderRequestSchema.safeParse({
        ...automaticRequest,
        manifest: { browserAuthored: true },
      }).success,
    ).toBe(false);
    expect(
      assemblyRequestSchema.safeParse({
        analysisId: opaqueId("ana"),
        selection: {
          candidateId: "manual",
          startWordId: "w_000001",
          endWordId: "w_000002",
        },
        turnstileToken: "fixture-token",
      }).success,
    ).toBe(false);
  });
});

describe("safe errors and operation lifecycle", () => {
  it("publishes assembly-aware session evidence for reconciliation", () => {
    const session = sessionResponseSchema.parse({
      sessionId: opaqueId("ses"),
      mode: "sample",
      expiresAt: "2026-09-29T11:00:00.000Z",
      accessState: "active",
      provenStage: "clip-review",
      media: validMedia,
      activeOperation: null,
      analysisId: opaqueId("ana"),
      analysisRevision: opaqueId("rev"),
      assemblyId: opaqueId("asm"),
      assemblyRevision: opaqueId("rev"),
      manifestId: opaqueId("man"),
      manifestHash: "a".repeat(64),
      renderId: null,
      outputAvailable: false,
      remaining: {
        analysisRetries: 1,
        renderAttempts: 1,
      },
    });

    expect(session).toMatchObject({
      provenStage: "clip-review",
      assemblyId: opaqueId("asm"),
      manifestId: opaqueId("man"),
    });
    expect(
      sessionResponseSchema.safeParse({ ...session, assemblyRevision: null })
        .success,
    ).toBe(false);
    expect(
      sessionResponseSchema.safeParse({ ...session, manifestId: null }).success,
    ).toBe(false);
    expect(
      sessionResponseSchema.safeParse({ ...session, manifestHash: null })
        .success,
    ).toBe(false);
    expect(
      sessionResponseSchema.safeParse({
        ...session,
        provenStage: "assembling",
        assemblyId: null,
        assemblyRevision: null,
        manifestId: opaqueId("man"),
        manifestHash: "a".repeat(64),
      }).success,
    ).toBe(false);
    expect(
      sessionResponseSchema.safeParse({
        ...session,
        provenStage: "result",
        renderId: null,
        outputAvailable: false,
      }).success,
    ).toBe(false);
    expect(
      sessionResponseSchema.safeParse({
        ...session,
        provenStage: "result",
        renderId: opaqueId("rnd"),
        outputAvailable: true,
      }).success,
    ).toBe(true);
  });

  it("never accepts a reflected message for a public error code", () => {
    const base = {
      code: "INVALID_REQUEST",
      retryable: false,
      requestId: `req_${"a".repeat(32)}`,
    } as const;

    expect(
      safeErrorSchema.safeParse({
        ...base,
        message: SAFE_ERROR_MESSAGES.INVALID_REQUEST,
      }).success,
    ).toBe(true);
    expect(
      safeErrorSchema.safeParse({
        ...base,
        message: "The invalid user value was reflected here.",
      }).success,
    ).toBe(false);
  });

  it("enforces terminal fields and legal transitions", () => {
    expect(operationStatusSchema.safeParse(validOperation).success).toBe(true);
    expect(
      operationStatusSchema.safeParse({
        ...validOperation,
        state: "succeeded",
        completedAt: "2026-09-29T10:00:02.000Z",
      }).success,
    ).toBe(false);
    expect(canOperationTransition("queued", "running")).toBe(true);
    expect(canOperationTransition("succeeded", "running")).toBe(false);
    expect(canOperationTransition("queued", "succeeded")).toBe(false);
  });

  it("distinguishes skipped polling observations from server lifecycle transitions", () => {
    expect(canObserveOperationState("queued", "succeeded")).toBe(true);
    expect(canObserveOperationState("cancel-requested", "succeeded")).toBe(
      true,
    );
    expect(canObserveOperationState("running", "queued")).toBe(false);
    expect(canObserveOperationState("cancel-requested", "running")).toBe(false);
    for (const terminal of [
      "succeeded",
      "failed",
      "cancelled",
      "expired",
    ] as const) {
      expect(canObserveOperationState(terminal, terminal)).toBe(true);
      expect(canObserveOperationState(terminal, "running")).toBe(false);
      for (const next of [
        "succeeded",
        "failed",
        "cancelled",
        "expired",
      ] as const) {
        if (terminal !== next)
          expect(canObserveOperationState(terminal, next)).toBe(false);
      }
    }
  });
});
