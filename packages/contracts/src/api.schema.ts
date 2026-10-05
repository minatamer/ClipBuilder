import { z } from "zod";

import {
  offsetDateTimeSchema,
  sha256DigestSchema,
  turnstileTokenSchema,
} from "./boundary-primitives.schema.js";
import { clipCandidateSchema } from "./candidate.schema.js";
import { OWNER_VALIDATION_LIMITS, PUBLIC_LIMITS } from "./constants.js";
import {
  analysisIdSchema,
  assemblyIdSchema,
  candidateIdSchema,
  manifestIdSchema,
  mediaIdSchema,
  renderIdSchema,
  revisionIdSchema,
  sessionIdSchema,
  uploadIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import {
  mediaDescriptorSchema,
  sourceContentTypeSchema,
} from "./media.schema.js";
import { operationStatusSchema } from "./operation.schema.js";
import {
  boundedPlainTextSchema,
  boundedTextWithoutUrlSchema,
} from "./text.schema.js";
import { transcriptBundleSchema } from "./transcript.schema.js";

export const healthResponseSchema = z
  .object({
    status: z.literal("ok"),
    service: z.literal("clipping-api"),
    version: boundedPlainTextSchema(80),
  })
  .strict();

export const publicConfigResponseSchema = z
  .object({
    processingSiteKey: z.string().min(1).max(500).optional(),
    mode: z.enum(["fake", "live"]),
    sampleEnabled: z.boolean(),
    retainedSampleEnabled: z.boolean().optional(),
    sampleReplayEnabled: z.boolean().optional(),
    localMediaEnabled: z.boolean(),
    liveAnalysisEnabled: z.boolean(),
    liveAssemblyEnabled: z.boolean(),
    liveRenderEnabled: z.boolean(),
    limits: z
      .object({
        sourceBytes: z
          .number()
          .int()
          .min(1)
          .max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
        sourceSeconds: z
          .number()
          .int()
          .min(1)
          .max(OWNER_VALIDATION_LIMITS.maxSourceSeconds),
        clipSecondsMin: z.literal(PUBLIC_LIMITS.minClipSeconds),
        clipSecondsMax: z
          .number()
          .int()
          .min(PUBLIC_LIMITS.minClipSeconds)
          .max(OWNER_VALIDATION_LIMITS.maxClipSeconds),
        candidateTarget: z.literal(PUBLIC_LIMITS.candidateTarget),
        candidateMax: z.literal(PUBLIC_LIMITS.maxCandidateCount),
        renders: z
          .number()
          .int()
          .min(0)
          .max(OWNER_VALIDATION_LIMITS.maxFinalRenders),
      })
      .strict()
      .refine((limits) => limits.clipSecondsMin <= limits.clipSecondsMax, {
        message: "Minimum clip duration must not exceed the maximum.",
        path: ["clipSecondsMin"],
      }),
    features: z
      .object({
        activeSpeakerFraming: z.boolean(),
        contextualVisuals: z.boolean(),
        trendSignals: z.boolean(),
        languages: z.array(boundedPlainTextSchema(16)).min(1).max(10),
      })
      .strict(),
    accessTtlSeconds: z.number().int().min(60).max(86_400),
    deletionCopyVersion: boundedPlainTextSchema(40),
  })
  .strict();

// Fixture-only workflow contracts; these never authorize real media upload or rendering.
export const startSessionRequestSchema = z
  .object({ mode: z.enum(["sample", "upload"]) })
  .strict();

export const startSessionResponseSchema = z
  .object({
    sessionId: sessionIdSchema,
    mode: z.enum(["sample", "upload"]),
    expiresAt: offsetDateTimeSchema,
    stage: z.enum(["intake", "candidates"]),
    sampleAnalysisId: analysisIdSchema.optional(),
  })
  .strict()
  .superRefine((response, context) => {
    const requiresAnalysis = response.mode === "sample";
    if (requiresAnalysis !== (response.sampleAnalysisId !== undefined)) {
      context.addIssue({
        code: "custom",
        message: "Only sample sessions require a sample analysis identifier.",
        path: ["sampleAnalysisId"],
      });
    }
    if (requiresAnalysis && response.stage !== "candidates") {
      context.addIssue({
        code: "custom",
        message: "Sample sessions begin at the candidate stage.",
        path: ["stage"],
      });
    }
    if (!requiresAnalysis && response.stage !== "intake") {
      context.addIssue({
        code: "custom",
        message: "Upload sessions begin at the intake stage.",
        path: ["stage"],
      });
    }
  });

export const sessionResponseSchema = z
  .object({
    sessionId: sessionIdSchema,
    mode: z.enum(["sample", "upload"]),
    expiresAt: offsetDateTimeSchema,
    accessState: z.enum(["active", "expired"]),
    provenStage: z.enum([
      "intake",
      "upload-authorized",
      "uploaded",
      "media-inspected",
      "analyzing",
      "candidates",
      "assembling",
      "clip-review",
      "rendering",
      "result",
    ]),
    media: mediaDescriptorSchema.nullable(),
    activeOperation: operationStatusSchema.nullable(),
    analysisId: analysisIdSchema.nullable(),
    analysisRevision: revisionIdSchema.nullable(),
    assemblyId: assemblyIdSchema.nullable(),
    assemblyRevision: revisionIdSchema.nullable(),
    manifestId: manifestIdSchema.nullable(),
    manifestHash: sha256DigestSchema.nullable(),
    renderId: renderIdSchema.nullable(),
    outputAvailable: z.boolean(),
    remaining: z
      .object({
        analysisRetries: z.number().int().min(0).max(1),
        renderAttempts: z
          .number()
          .int()
          .min(0)
          .max(OWNER_VALIDATION_LIMITS.maxFinalRenders),
      })
      .strict(),
  })
  .strict()
  .superRefine((session, context) => {
    const hasAssemblyId = session.assemblyId !== null;
    const hasAssemblyRevision = session.assemblyRevision !== null;
    const hasManifestId = session.manifestId !== null;
    const hasManifestHash = session.manifestHash !== null;
    const isPostAssembly = ["clip-review", "rendering", "result"].includes(
      session.provenStage,
    );

    if (hasAssemblyId !== hasAssemblyRevision) {
      context.addIssue({
        code: "custom",
        message: "Assembly evidence requires both identifier and revision.",
        path: [hasAssemblyId ? "assemblyRevision" : "assemblyId"],
      });
    }
    if (hasManifestId !== hasManifestHash) {
      context.addIssue({
        code: "custom",
        message: "Manifest evidence requires both identifier and hash.",
        path: [hasManifestId ? "manifestHash" : "manifestId"],
      });
    }
    if ((hasManifestId || hasManifestHash) && !hasAssemblyId) {
      context.addIssue({
        code: "custom",
        message: "Manifest evidence requires assembly evidence.",
        path: ["assemblyId"],
      });
    }
    if (isPostAssembly && (!hasAssemblyId || !hasAssemblyRevision)) {
      context.addIssue({
        code: "custom",
        message: "Post-assembly session stages require assembly evidence.",
        path: ["assemblyRevision"],
      });
    }
    if (isPostAssembly && (!hasManifestId || !hasManifestHash)) {
      context.addIssue({
        code: "custom",
        message: "Post-assembly session stages require manifest evidence.",
        path: ["manifestHash"],
      });
    }
    if (session.outputAvailable && session.renderId === null) {
      context.addIssue({
        code: "custom",
        message: "Available output requires a render identifier.",
        path: ["renderId"],
      });
    }
    if (
      session.provenStage === "result" &&
      (session.renderId === null || !session.outputAvailable)
    ) {
      context.addIssue({
        code: "custom",
        message: "Result stage requires an available rendered output.",
        path: ["outputAvailable"],
      });
    }
  });

export const uploadAuthorizeRequestSchema = z
  .object({
    declaredBytes: z
      .number()
      .int()
      .min(1)
      .max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
    declaredContentType: sourceContentTypeSchema,
    turnstileToken: turnstileTokenSchema,
  })
  .strict();

export const uploadCompleteRequestSchema = z
  .object({
    uploadId: uploadIdSchema,
    observedBytes: z
      .number()
      .int()
      .min(1)
      .max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
  })
  .strict();

// Local preview metadata only: deliberately no upload URL or storage protocol.
export const developmentUploadResponseSchema = z
  .object({
    uploadId: uploadIdSchema,
  })
  .strict();

export const analysisContextSchema = z
  .object({
    contentCategory: boundedTextWithoutUrlSchema(120).optional(),
    audience: boundedTextWithoutUrlSchema(120).optional(),
    targetPlatform: z.enum([
      "generic-vertical",
      "tiktok",
      "instagram-reels",
      "youtube-shorts",
    ]),
    trendSignals: z.array(boundedTextWithoutUrlSchema(160)).max(5).optional(),
  })
  .strict();

export const analysisRequestSchema = z
  .object({
    mediaId: mediaIdSchema,
    context: analysisContextSchema,
    turnstileToken: turnstileTokenSchema,
  })
  .strict();

export const analysisWarningSchema = z
  .object({
    code: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[A-Z][A-Z0-9_]*$/u),
    message: boundedPlainTextSchema(200),
  })
  .strict();

export const analysisBundleSchema = z
  .object({
    version: z.literal(1),
    analysisId: analysisIdSchema,
    revision: revisionIdSchema,
    media: mediaDescriptorSchema,
    transcript: transcriptBundleSchema,
    candidates: z
      .array(clipCandidateSchema)
      .max(OWNER_VALIDATION_LIMITS.maxCandidateCount),
    outcome: z.enum(["candidates", "no-strong-candidates"]),
    warnings: z.array(analysisWarningSchema).max(10),
  })
  .strict()
  .superRefine((bundle, context) => {
    // Server-owned envelope consistency, independent of model output quality.
    if ((bundle.outcome === "candidates") !== bundle.candidates.length > 0) {
      context.addIssue({
        code: "custom",
        message: "The analysis outcome must match candidate availability.",
        path: ["outcome"],
      });
    }
    const ids = bundle.candidates.map((candidate) => candidate.id);
    const ranks = bundle.candidates.map((candidate) => candidate.rank);
    if (
      new Set(ids).size !== ids.length ||
      new Set(ranks).size !== ranks.length
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Analysis candidates must have distinct identifiers and ranks.",
        path: ["candidates"],
      });
    }
    if (
      [...ranks].sort((a, b) => a - b).some((rank, index) => rank !== index + 1)
    ) {
      context.addIssue({
        code: "custom",
        message: "Analysis candidate ranks must be contiguous from one.",
        path: ["candidates"],
      });
    }
  });

export const cancelOperationRequestSchema = z
  .object({ reason: z.literal("user-request") })
  .strict();

export const assemblyRequestSchema = z
  .object({
    analysisId: analysisIdSchema,
    selection: z
      .object({
        candidateId: candidateIdSchema,
        startWordId: wordIdSchema,
        endWordId: wordIdSchema,
      })
      .strict()
      .refine((selection) => selection.startWordId !== selection.endWordId, {
        message: "Assembly selection must contain more than one word boundary.",
        path: ["endWordId"],
      }),
    turnstileToken: turnstileTokenSchema,
  })
  .strict();

export const assemblyStartResponseSchema = z
  .object({
    assemblyId: assemblyIdSchema,
    operation: operationStatusSchema,
  })
  .strict();

export const renderRequestSchema = z
  .object({
    analysisId: analysisIdSchema,
    assemblyId: assemblyIdSchema,
    manifestHash: sha256DigestSchema,
    turnstileToken: turnstileTokenSchema,
  })
  .strict();

export const renderStartResponseSchema = z
  .object({
    renderId: renderIdSchema,
    operation: operationStatusSchema,
  })
  .strict();

const deletionClassSchema = z.enum([
  "source",
  "analysis",
  "manifest",
  "output",
  "control",
]);

export const clearSessionResponseSchema = z
  .object({
    status: z.enum(["cleared", "partially-cleared", "scheduled-for-deletion"]),
    deletedClasses: z.array(deletionClassSchema).max(5),
    pendingClasses: z.array(deletionClassSchema).max(5),
    message: boundedPlainTextSchema(200),
  })
  .strict();

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type PublicConfigResponse = z.infer<typeof publicConfigResponseSchema>;
export type StartSessionRequest = z.infer<typeof startSessionRequestSchema>;
export type StartSessionResponse = z.infer<typeof startSessionResponseSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type AnalysisBundleV1 = z.infer<typeof analysisBundleSchema>;
export type AssemblyRequest = z.infer<typeof assemblyRequestSchema>;
export type RenderRequest = z.infer<typeof renderRequestSchema>;
export type UploadAuthorizeRequest = z.infer<
  typeof uploadAuthorizeRequestSchema
>;
