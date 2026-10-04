import {
  analysisIdSchema,
  assemblyIdSchema,
  candidateIdSchema,
  manifestIdSchema,
  offsetDateTimeSchema,
  operationIdSchema,
  renderIdSchema,
  revisionIdSchema,
  sessionIdSchema,
  sha256DigestSchema,
  wordIdSchema,
} from "@clipbuilder/contracts";
import { z } from "zod";

import type { ClipReviewSession, ClippingSessionState } from "./session.types";

export const SESSION_PROJECTION_KEY = "clipbuilder.session.v1";
export const SESSION_CLEANUP_KEY = "clipbuilder.cleanup.v1";
export const SESSION_ABANDONED_KEY = "clipbuilder.abandoned.v1";
export const SESSION_PROJECTION_VERSION = 1 as const;
export const MAX_SESSION_PROJECTION_BYTES = 256 * 1024;
export const MAX_PROJECTION_AGE_MS = 30 * 60 * 1_000;

const STAGES = [
  "intake",
  "local-inspection",
  "local-preparing",
  "upload-authorizing",
  "uploading",
  "media-inspecting",
  "analysis-confirmation",
  "analyzing",
  "analysis-failed",
  "no-candidates",
  "candidates",
  "assembling",
  "assembly-failed",
  "clip-review",
  // Compatibility with saved sessions from the former separate confirmation.
  "render-confirmation",
  "rendering",
  "render-failed",
  "result",
  "cleanup-partial",
] as const;

export type PersistedStageHint = (typeof STAGES)[number];

const identitySchema = z
  .object({
    sessionId: sessionIdSchema,
    mode: z.enum(["sample", "upload"]),
  })
  .strict();

const analysisReferenceSchema = z
  .object({ analysisId: analysisIdSchema, revision: revisionIdSchema })
  .strict();

const selectionReferenceSchema = z
  .object({
    candidateId: candidateIdSchema,
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
  })
  .strict()
  .refine((selection) => selection.startWordId !== selection.endWordId, {
    path: ["endWordId"],
    message: "Selection range must be nonempty.",
  });

const assemblyReferenceSchema = z
  .object({ assemblyId: assemblyIdSchema, revision: revisionIdSchema })
  .strict();

const reviewReferenceSchema = z
  .object({
    assemblyReference: assemblyReferenceSchema,
    manifestReference: z
      .object({
        manifestId: manifestIdSchema,
        manifestHash: sha256DigestSchema,
        analysisRevision: revisionIdSchema,
        assemblyRevision: revisionIdSchema,
      })
      .strict(),
    playbackTimeMs: z.number().int().min(0),
  })
  .strict();

const resultReferenceSchema = z
  .object({ renderId: renderIdSchema, outputAvailable: z.literal(true) })
  .strict();

const forbiddenKeys = new Set([
  "blob",
  "cookie",
  "controller",
  "error",
  "filename",
  "grant",
  "listener",
  "media",
  "provider",
  "stack",
  "timer",
  "token",
  "track",
  "transcript",
  "url",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function containsForbiddenProjectionValue(value: unknown): boolean {
  if (typeof value === "string") {
    return /(?:https?:\/\/|blob:|data:|bearer\s)/iu.test(value);
  }
  if (Array.isArray(value)) return value.some(containsForbiddenProjectionValue);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, nested]) =>
      forbiddenKeys.has(key.toLowerCase()) ||
      containsForbiddenProjectionValue(nested),
  );
}

export const clippingSessionProjectionV1Schema = z
  .object({
    version: z.literal(SESSION_PROJECTION_VERSION),
    savedAt: offsetDateTimeSchema,
    expiresAt: offsetDateTimeSchema,
    session: identitySchema,
    stageHint: z.enum(STAGES),
    analysis: analysisReferenceSchema.nullable(),
    selection: selectionReferenceSchema.nullable(),
    assembly: assemblyReferenceSchema.nullable(),
    operation: z.object({ operationId: operationIdSchema }).strict().nullable(),
    review: reviewReferenceSchema.nullable(),
    result: resultReferenceSchema.nullable(),
  })
  .strict()
  .superRefine((projection, context) => {
    if (containsForbiddenProjectionValue(projection)) {
      context.addIssue({
        code: "custom",
        message: "Projection contains a forbidden runtime or capability value.",
      });
    }
    if (
      projection.review !== null &&
      (projection.analysis === null ||
        projection.selection === null ||
        projection.assembly === null ||
        projection.review.assemblyReference.assemblyId !==
          projection.assembly.assemblyId ||
        projection.review.assemblyReference.revision !==
          projection.assembly.revision ||
        projection.review.manifestReference.analysisRevision !==
          projection.analysis.revision ||
        projection.review.manifestReference.assemblyRevision !==
          projection.assembly.revision)
    ) {
      context.addIssue({
        code: "custom",
        message: "Review evidence must match analysis and assembly references.",
        path: ["review"],
      });
    }
  });

export type ClippingSessionProjectionV1 = z.infer<
  typeof clippingSessionProjectionV1Schema
>;

export type SessionStoragePort = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type ProjectionReadResult =
  | { status: "empty" }
  | { status: "valid"; projection: ClippingSessionProjectionV1 }
  | { status: "corrupt" | "oversized" | "unknown-version" | "expired" };

export function parseSessionProjection(
  value: unknown,
): ClippingSessionProjectionV1 | null {
  const parsed = clippingSessionProjectionV1Schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function identityFromState(state: ClippingSessionState) {
  return "identity" in state ? state.identity : null;
}

function analysisFromState(state: ClippingSessionState) {
  if ("analysis" in state) return state.analysis;
  if ("lastKnown" in state && "analysis" in state.lastKnown) {
    return state.lastKnown.analysis;
  }
  if (state.stage === "result") {
    return {
      analysisId: state.clipSummary.analysisId,
      revision: state.clipSummary.analysisRevision,
      bundle: null,
    };
  }
  return null;
}

function reviewFromState(
  state: ClippingSessionState,
): ClipReviewSession | null {
  if ("review" in state) return state.review;
  if ("lastKnown" in state && "review" in state.lastKnown) {
    return state.lastKnown.review;
  }
  if (state.stage === "result") {
    return {
      selectedCandidateId: state.clipSummary.selectedCandidateId,
      selectedStartWordId: state.clipSummary.selectedStartWordId,
      selectedEndWordId: state.clipSummary.selectedEndWordId,
      assemblyReference: {
        assemblyId: state.clipSummary.assemblyId,
        revision: state.clipSummary.assemblyRevision,
      },
      manifestReference: {
        manifestId: state.clipSummary.manifestId,
        manifestHash: state.clipSummary.manifestHash,
        analysisRevision: state.clipSummary.analysisRevision,
        assemblyRevision: state.clipSummary.assemblyRevision,
      },
      playback: { status: "idle", currentTimeMs: 0 },
    };
  }
  return null;
}

function selectionFromState(
  state: ClippingSessionState,
  review: ClipReviewSession | null,
) {
  if (state.stage === "assembling") {
    return {
      candidateId: state.lastKnown.selectedId,
      startWordId: state.lastKnown.startWordId,
      endWordId: state.lastKnown.endWordId,
    };
  }
  if (state.stage === "assembly-failed") {
    return {
      candidateId: state.selectedId,
      startWordId: state.startWordId,
      endWordId: state.endWordId,
    };
  }
  if (
    state.stage === "candidates" &&
    state.selectedId !== null &&
    state.analysis.bundle !== null
  ) {
    const candidate = state.analysis.bundle.candidates.find(
      (item) => item.id === state.selectedId,
    );
    return candidate === undefined
      ? null
      : {
          candidateId: candidate.id,
          startWordId: candidate.startWordId,
          endWordId: candidate.endWordId,
        };
  }
  return review === null
    ? null
    : {
        candidateId: review.selectedCandidateId,
        startWordId: review.selectedStartWordId,
        endWordId: review.selectedEndWordId,
      };
}

export function projectSessionState(
  state: ClippingSessionState,
  now: Date,
): ClippingSessionProjectionV1 | null {
  const identity = identityFromState(state);
  if (
    identity === null ||
    state.stage === "clearing" ||
    state.stage === "fatal" ||
    state.stage === "expired"
  ) {
    return null;
  }

  const analysis = analysisFromState(state);
  const review = reviewFromState(state);
  const selection = selectionFromState(state, review);
  const operation =
    "operation" in state ? { operationId: state.operation.operationId } : null;
  const projection: ClippingSessionProjectionV1 = {
    version: 1,
    savedAt: now.toISOString(),
    expiresAt: identity.expiresAt,
    session: { sessionId: identity.sessionId, mode: identity.mode },
    stageHint: state.stage as PersistedStageHint,
    analysis:
      analysis === null
        ? null
        : { analysisId: analysis.analysisId, revision: analysis.revision },
    selection,
    assembly:
      review === null
        ? null
        : {
            assemblyId: review.assemblyReference.assemblyId,
            revision: review.assemblyReference.revision,
          },
    operation,
    review:
      review === null
        ? null
        : {
            assemblyReference: review.assemblyReference,
            manifestReference: review.manifestReference,
            playbackTimeMs: review.playback.currentTimeMs,
          },
    result:
      state.stage === "result"
        ? { renderId: state.result.renderId, outputAvailable: true }
        : null,
  };

  return clippingSessionProjectionV1Schema.safeParse(projection).success
    ? projection
    : null;
}

export function serializeSessionProjection(
  projection: ClippingSessionProjectionV1,
): string {
  const serialized = JSON.stringify(projection);
  if (
    new TextEncoder().encode(serialized).byteLength >
    MAX_SESSION_PROJECTION_BYTES
  ) {
    throw new Error("Session projection exceeds the storage limit.");
  }
  if (!clippingSessionProjectionV1Schema.safeParse(projection).success) {
    throw new Error("Session projection is not valid.");
  }
  return serialized;
}

export function readSessionProjection(
  storage: SessionStoragePort,
  now: Date,
): ProjectionReadResult {
  const serialized = storage.getItem(SESSION_PROJECTION_KEY);
  if (serialized === null) return { status: "empty" };
  if (
    new TextEncoder().encode(serialized).byteLength >
    MAX_SESSION_PROJECTION_BYTES
  ) {
    return { status: "oversized" };
  }

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    return { status: "corrupt" };
  }
  if (isRecord(value) && value.version !== SESSION_PROJECTION_VERSION) {
    return { status: "unknown-version" };
  }
  const projection = parseSessionProjection(value);
  if (projection === null) return { status: "corrupt" };
  if (Date.parse(projection.expiresAt) <= now.getTime()) {
    return { status: "expired" };
  }
  return { status: "valid", projection };
}

export function writeSessionProjection(
  storage: SessionStoragePort,
  projection: ClippingSessionProjectionV1,
): void {
  storage.setItem(
    SESSION_PROJECTION_KEY,
    serializeSessionProjection(projection),
  );
}

export function clearSessionProjection(storage: SessionStoragePort): void {
  storage.removeItem(SESSION_PROJECTION_KEY);
}

export function isSessionCleanupRequired(storage: SessionStoragePort): boolean {
  // Unknown marker values also fail closed until cleanup is confirmed.
  return storage.getItem(SESSION_CLEANUP_KEY) !== null;
}

export function persistSessionState(
  storage: SessionStoragePort,
  state: ClippingSessionState,
  now: Date,
): void {
  if (state.stage === "clearing" || state.stage === "cleanup-partial") {
    storage.setItem(SESSION_CLEANUP_KEY, "required");
    clearSessionProjection(storage);
    return;
  }
  if (state.stage === "intake") storage.removeItem(SESSION_CLEANUP_KEY);
  if (shouldClearSessionProjectionForState(state)) {
    clearSessionProjection(storage);
    return;
  }
  if (state.stage === "fatal") return;
  const projection = projectSessionState(state, now);
  if (projection === null) clearSessionProjection(storage);
  else writeSessionProjection(storage, projection);
}

export function shouldClearSessionProjectionForState(
  state: ClippingSessionState,
): boolean {
  return (
    state.stage === "clearing" ||
    state.stage === "expired" ||
    (state.stage === "fatal" && !state.failure.retryable)
  );
}
