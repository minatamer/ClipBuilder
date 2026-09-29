import { z } from "zod";

import { assemblyBundleSchema } from "./assembly.schema.js";
import {
  offsetDateTimeSchema,
  turnstileTokenSchema,
} from "./boundary-primitives.schema.js";
import { clipCandidateSchema } from "./candidate.schema.js";
import { OWNER_VALIDATION_LIMITS, PUBLIC_LIMITS } from "./constants.js";
import { editManifestSchema, editProposalSchema } from "./editor.schema.js";
import {
  analysisIdSchema,
  assemblyIdSchema,
  candidateIdSchema,
  mediaIdSchema,
  renderIdSchema,
  revisionIdSchema,
  sessionIdSchema,
  uploadIdSchema,
  visualAssetIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import { mediaDescriptorSchema } from "./media.schema.js";
import { operationStatusSchema } from "./operation.schema.js";
import {
  boundedPlainTextSchema,
  boundedTextWithoutUrlSchema,
} from "./text.schema.js";
import { transcriptBundleSchema } from "./transcript.schema.js";

const capabilityUrlSchema = z.url().max(4_096);

export const healthResponseSchema = z
  .object({
    status: z.literal("ok"),
    service: z.literal("clipping-api"),
    version: boundedPlainTextSchema(80),
  })
  .strict();

export const publicConfigResponseSchema = z
  .object({
    mode: z.enum(["fake", "live"]),
    sampleEnabled: z.boolean(),
    liveUploadEnabled: z.boolean(),
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
        candidateCount: z
          .number()
          .int()
          .min(1)
          .max(OWNER_VALIDATION_LIMITS.candidateCount),
        assistantProposals: z
          .number()
          .int()
          .min(0)
          .max(OWNER_VALIDATION_LIMITS.maxAssistantProposals),
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
        activeSpeakerFraming: z.literal(true),
        contextualVisuals: z.boolean(),
        trendSignals: z.boolean(),
        languages: z.array(boundedPlainTextSchema(16)).min(1).max(10),
      })
      .strict(),
    accessTtlSeconds: z.number().int().min(60).max(86_400),
    deletionCopyVersion: boundedPlainTextSchema(40),
  })
  .strict();

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
      "editor",
      "rendering",
      "result",
    ]),
    media: mediaDescriptorSchema.nullable(),
    activeOperation: operationStatusSchema.nullable(),
    analysisId: analysisIdSchema.nullable(),
    analysisRevision: revisionIdSchema.nullable(),
    assemblyId: assemblyIdSchema.nullable(),
    assemblyRevision: revisionIdSchema.nullable(),
    renderId: renderIdSchema.nullable(),
    outputAvailable: z.boolean(),
    remaining: z
      .object({
        analysisRetries: z.number().int().min(0).max(1),
        assistantProposals: z
          .number()
          .int()
          .min(0)
          .max(OWNER_VALIDATION_LIMITS.maxAssistantProposals),
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
    if (session.assemblyRevision !== null && session.assemblyId === null) {
      context.addIssue({
        code: "custom",
        message: "An assembly revision requires an assembly identifier.",
        path: ["assemblyId"],
      });
    }
    if (
      ["editor", "rendering", "result"].includes(session.provenStage) &&
      (session.assemblyId === null || session.assemblyRevision === null)
    ) {
      context.addIssue({
        code: "custom",
        message: "Post-assembly session stages require assembly evidence.",
        path: ["assemblyRevision"],
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
    declaredContentType: z.enum(["video/mp4", "video/webm"]),
    turnstileToken: turnstileTokenSchema,
  })
  .strict();

export const uploadAuthorizeResponseSchema = z
  .object({
    uploadId: uploadIdSchema,
    protocol: z.literal("gcs-resumable"),
    uploadUrl: capabilityUrlSchema,
    expiresAt: offsetDateTimeSchema,
    requiredHeaders: z.record(
      z.string().min(1).max(100),
      z.string().max(1_000),
    ),
    maxBytes: z
      .number()
      .int()
      .min(1)
      .max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
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
      .max(OWNER_VALIDATION_LIMITS.candidateCount),
    outcome: z.enum(["candidates", "no-strong-candidates"]),
    warnings: z.array(analysisWarningSchema).max(10),
  })
  .strict()
  .superRefine((bundle, context) => {
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

    const expectedRanks = bundle.candidates.map(
      (_candidate, index) => index + 1,
    );
    if (
      [...ranks]
        .sort((left, right) => left - right)
        .some((rank, index) => rank !== expectedRanks[index])
    ) {
      context.addIssue({
        code: "custom",
        message: "Analysis candidate ranks must be contiguous from one.",
        path: ["candidates"],
      });
    }

    const wordIndexes = new Map(
      bundle.transcript.words.map((word, index) => [word.id, index]),
    );
    const resolvedCandidateRanges: Array<{
      candidateIndex: number;
      startMs: number;
      endMs: number;
    }> = [];
    bundle.candidates.forEach((candidate, candidateIndex) => {
      const startIndex = wordIndexes.get(candidate.startWordId);
      const endIndex = wordIndexes.get(candidate.endWordId);
      const evidenceIndexes = candidate.evidence.flatMap((evidence) =>
        evidence.wordIds.map((wordId) => wordIndexes.get(wordId)),
      );
      const hasMissingReference =
        startIndex === undefined ||
        endIndex === undefined ||
        evidenceIndexes.some((index) => index === undefined);

      if (
        hasMissingReference ||
        startIndex === undefined ||
        endIndex === undefined
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Candidate ranges and evidence must reference transcript words.",
          path: ["candidates", candidateIndex],
        });
        return;
      }

      if (startIndex >= endIndex) {
        context.addIssue({
          code: "custom",
          message: "Candidate transcript range must be ordered.",
          path: ["candidates", candidateIndex, "endWordId"],
        });
        return;
      }

      if (
        evidenceIndexes.some(
          (index) =>
            index === undefined || index < startIndex || index > endIndex,
        )
      ) {
        context.addIssue({
          code: "custom",
          message: "Candidate evidence must remain inside its candidate range.",
          path: ["candidates", candidateIndex, "evidence"],
        });
      }

      const startWord = bundle.transcript.words[startIndex];
      const endWord = bundle.transcript.words[endIndex];
      if (startWord === undefined || endWord === undefined) {
        return;
      }

      const durationMs = endWord.endMs - startWord.startMs;
      if (
        durationMs < PUBLIC_LIMITS.minClipSeconds * 1_000 ||
        durationMs > PUBLIC_LIMITS.maxClipSeconds * 1_000
      ) {
        context.addIssue({
          code: "custom",
          message: "Candidate duration must remain within 10 to 60 seconds.",
          path: ["candidates", candidateIndex],
        });
      }

      resolvedCandidateRanges.push({
        candidateIndex,
        startMs: startWord.startMs,
        endMs: endWord.endMs,
      });
    });

    resolvedCandidateRanges.forEach((candidate, index) => {
      resolvedCandidateRanges.slice(index + 1).forEach((otherCandidate) => {
        const overlapMs = Math.max(
          0,
          Math.min(candidate.endMs, otherCandidate.endMs) -
            Math.max(candidate.startMs, otherCandidate.startMs),
        );
        const shorterDurationMs = Math.min(
          candidate.endMs - candidate.startMs,
          otherCandidate.endMs - otherCandidate.startMs,
        );
        if (overlapMs * 100 > shorterDurationMs * 35) {
          context.addIssue({
            code: "custom",
            message:
              "Candidate overlap cannot exceed 35 percent of the shorter range.",
            path: ["candidates", otherCandidate.candidateIndex],
          });
        }
      });
    });

    if (
      Math.abs(bundle.media.durationMs - bundle.transcript.durationMs) > 250
    ) {
      context.addIssue({
        code: "custom",
        message: "Media and transcript durations exceed the allowed tolerance.",
        path: ["transcript", "durationMs"],
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
        candidateId: z.union([candidateIdSchema, z.literal("manual")]),
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

export const assemblyResultResponseSchema = z
  .object({
    assembly: assemblyBundleSchema,
    preview: z
      .object({
        sourceUrl: capabilityUrlSchema,
        assetUrls: z.record(visualAssetIdSchema, capabilityUrlSchema),
        expiresAt: offsetDateTimeSchema,
      })
      .strict(),
  })
  .strict();

export const editorProposalResponseSchema = z
  .object({
    proposal: editProposalSchema,
    proposedManifest: editManifestSchema,
    diff: z
      .array(
        z
          .object({
            field: z.enum([
              "range",
              "duration",
              "captions",
              "headline",
              "visuals",
            ]),
            before: boundedPlainTextSchema(240),
            after: boundedPlainTextSchema(240),
          })
          .strict(),
      )
      .max(10),
  })
  .strict();

export const renderRequestSchema = z
  .object({
    analysisId: analysisIdSchema,
    assemblyId: assemblyIdSchema,
    manifest: editManifestSchema,
    turnstileToken: turnstileTokenSchema,
  })
  .strict();

export const renderStartResponseSchema = z
  .object({
    renderId: renderIdSchema,
    operation: operationStatusSchema,
  })
  .strict();

export const downloadAuthorizeRequestSchema = z
  .object({ renderId: renderIdSchema })
  .strict();

export const downloadAuthorizeResponseSchema = z
  .object({
    downloadUrl: capabilityUrlSchema,
    expiresAt: offsetDateTimeSchema,
    suggestedFilename: z.literal("clipping-demo-export.mp4"),
    bytes: z.number().int().min(1).max(OWNER_VALIDATION_LIMITS.maxOutputBytes),
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
