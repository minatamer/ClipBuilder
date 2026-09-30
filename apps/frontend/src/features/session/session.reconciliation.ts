import {
  SAFE_ERROR_MESSAGES,
  type ErrorCode,
  type OperationStatusV1,
  type SafeError,
  type SessionResponse,
} from "@clipbuilder/contracts";

import { analysisSnapshotFromIds } from "./session.reducer";
import {
  MAX_PROJECTION_AGE_MS,
  type ClippingSessionProjectionV1,
  type PersistedStageHint,
} from "./session.persistence";
import type {
  ClipReviewSession,
  ClippingSessionState,
  SessionAvailability,
} from "./session.types";

export type ServerSessionEvidence = SessionResponse;

export type ReconciliationResult =
  | { status: "restored"; state: ClippingSessionState }
  | { status: "stale" | "expired" | "server-conflict"; failure: SafeError };

const SERVER_STAGE_ORDER: SessionResponse["provenStage"][] = [
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
];

const REQUIRED_SERVER_STAGE: Record<
  PersistedStageHint,
  SessionResponse["provenStage"]
> = {
  intake: "intake",
  "local-inspection": "intake",
  "upload-authorizing": "upload-authorized",
  uploading: "upload-authorized",
  "media-inspecting": "uploaded",
  "analysis-confirmation": "media-inspected",
  analyzing: "analyzing",
  "analysis-failed": "media-inspected",
  "no-candidates": "candidates",
  candidates: "candidates",
  assembling: "assembling",
  "assembly-failed": "candidates",
  "clip-review": "clip-review",
  "render-confirmation": "clip-review",
  rendering: "rendering",
  "render-failed": "clip-review",
  result: "result",
  "cleanup-partial": "intake",
};

const SERVER_RESUME_STAGE: Record<
  SessionResponse["provenStage"],
  PersistedStageHint
> = {
  intake: "intake",
  "upload-authorized": "intake",
  uploaded: "media-inspecting",
  "media-inspected": "analysis-confirmation",
  analyzing: "analyzing",
  candidates: "candidates",
  assembling: "assembling",
  "clip-review": "clip-review",
  rendering: "rendering",
  result: "result",
};

function safeFailure(code: ErrorCode, ruleId: string): SafeError {
  return {
    code,
    message: SAFE_ERROR_MESSAGES[code],
    retryable: false,
    requestId: `req_${"0".repeat(32)}`,
    ruleId,
  };
}

export function restoreEvidenceUnavailableFailure(): SafeError {
  return {
    ...safeFailure("INTERNAL_ERROR", "restore.evidence-unavailable"),
    retryable: true,
  };
}

function restoredReview(
  projection: ClippingSessionProjectionV1,
  evidence: ServerSessionEvidence,
): ClipReviewSession | null {
  if (
    projection.selection === null ||
    evidence.analysisRevision === null ||
    evidence.assemblyId === null ||
    evidence.assemblyRevision === null ||
    evidence.manifestId === null ||
    evidence.manifestHash === null
  ) {
    return null;
  }
  return {
    selectedCandidateId: projection.selection.candidateId,
    selectedStartWordId: projection.selection.startWordId,
    selectedEndWordId: projection.selection.endWordId,
    assemblyReference: {
      assemblyId: evidence.assemblyId,
      revision: evidence.assemblyRevision,
    },
    manifestReference: {
      manifestId: evidence.manifestId,
      manifestHash: evidence.manifestHash,
      analysisRevision: evidence.analysisRevision,
      assemblyRevision: evidence.assemblyRevision,
    },
    playback: {
      status: "succeeded",
      currentTimeMs: projection.review?.playbackTimeMs ?? 0,
    },
  };
}

function serverOperation(
  evidence: ServerSessionEvidence,
  kind: OperationStatusV1["kind"],
): OperationStatusV1 | null {
  return evidence.activeOperation?.kind === kind
    ? evidence.activeOperation
    : null;
}

function projectionToState(
  projection: ClippingSessionProjectionV1,
  evidence: ServerSessionEvidence,
  availability: SessionAvailability,
  stageHint: PersistedStageHint = projection.stageHint,
): ClippingSessionState | null {
  const identity = {
    sessionId: evidence.sessionId,
    mode: evidence.mode,
    expiresAt: evidence.expiresAt,
  } as const;
  const analysis =
    evidence.analysisId === null || evidence.analysisRevision === null
      ? null
      : analysisSnapshotFromIds(evidence.analysisId, evidence.analysisRevision);
  const review = restoredReview(projection, evidence);

  switch (stageHint) {
    case "media-inspecting": {
      const operation = serverOperation(evidence, "media-inspection");
      return operation === null
        ? null
        : {
            stage: "media-inspecting",
            identity,
            operation,
            diagnosticCode: null,
          };
    }
    case "analysis-confirmation":
    case "analysis-failed":
      return evidence.media === null
        ? null
        : {
            stage: "analysis-confirmation",
            identity,
            media: evidence.media,
            diagnosticCode: null,
          };
    case "analyzing": {
      const operation = serverOperation(evidence, "analysis");
      return evidence.media === null || operation === null
        ? null
        : {
            stage: "analyzing",
            identity,
            operation,
            lastKnown: { media: evidence.media },
            diagnosticCode: null,
          };
    }
    case "no-candidates":
      return analysis === null
        ? null
        : {
            stage: "no-candidates",
            identity,
            analysis,
            diagnosticCode: null,
          };
    case "candidates":
    case "assembly-failed":
      return analysis === null
        ? null
        : {
            stage: "candidates",
            identity,
            analysis,
            selectedId: projection.selection?.candidateId ?? null,
            diagnosticCode: null,
          };
    case "assembling": {
      const operation = serverOperation(evidence, "assembly");
      return analysis === null ||
        projection.selection === null ||
        operation === null
        ? null
        : {
            stage: "assembling",
            identity,
            operation,
            lastKnown: {
              analysis,
              selectedId: projection.selection.candidateId,
              startWordId: projection.selection.startWordId,
              endWordId: projection.selection.endWordId,
            },
            diagnosticCode: null,
          };
    }
    case "clip-review":
    case "render-confirmation":
    case "render-failed":
      return analysis === null || review === null
        ? null
        : {
            stage:
              stageHint === "render-confirmation"
                ? "render-confirmation"
                : "clip-review",
            identity,
            analysis,
            assembly: null,
            review,
            diagnosticCode: null,
          };
    case "rendering": {
      const operation = serverOperation(evidence, "render");
      return analysis === null || review === null || operation === null
        ? null
        : {
            stage: "rendering",
            identity,
            operation,
            lastKnown: { analysis, assembly: null, review },
            diagnosticCode: null,
          };
    }
    case "result":
      return evidence.renderId === null ||
        !evidence.outputAvailable ||
        analysis === null ||
        review === null
        ? null
        : {
            stage: "result",
            identity,
            result: {
              renderId: evidence.renderId,
              outputAvailable: true,
            },
            clipSummary: {
              analysisId: analysis.analysisId,
              analysisRevision: analysis.revision,
              assemblyId: review.assemblyReference.assemblyId,
              assemblyRevision: review.assemblyReference.revision,
              manifestId: review.manifestReference.manifestId,
              manifestHash: review.manifestReference.manifestHash,
              selectedCandidateId: review.selectedCandidateId,
              selectedStartWordId: review.selectedStartWordId,
              selectedEndWordId: review.selectedEndWordId,
            },
            diagnosticCode: null,
          };
    default:
      return {
        stage: "intake",
        availability,
        diagnosticCode: null,
      };
  }
}

export function reconcileSessionProjection(
  projection: ClippingSessionProjectionV1,
  evidence: ServerSessionEvidence | null,
  now: Date,
  availability: SessionAvailability,
): ReconciliationResult {
  if (now.getTime() - Date.parse(projection.savedAt) > MAX_PROJECTION_AGE_MS) {
    return {
      status: "stale",
      failure: safeFailure("SESSION_INVALID", "restore.projection-stale"),
    };
  }
  if (
    evidence?.accessState === "expired" ||
    Date.parse(projection.expiresAt) <= now.getTime()
  ) {
    return {
      status: "expired",
      failure: safeFailure("SESSION_EXPIRED", "restore.session-expired"),
    };
  }
  if (
    evidence === null ||
    evidence.sessionId !== projection.session.sessionId ||
    evidence.mode !== projection.session.mode ||
    evidence.expiresAt !== projection.expiresAt
  ) {
    return {
      status: "server-conflict",
      failure: safeFailure("SESSION_INVALID", "restore.identity-conflict"),
    };
  }

  const evidenceStage = SERVER_STAGE_ORDER.indexOf(evidence.provenStage);
  const projectedStage = SERVER_STAGE_ORDER.indexOf(
    REQUIRED_SERVER_STAGE[projection.stageHint],
  );
  const idConflict =
    (projection.analysis !== null &&
      (projection.analysis.analysisId !== evidence.analysisId ||
        projection.analysis.revision !== evidence.analysisRevision)) ||
    (projection.assembly !== null &&
      (projection.assembly.assemblyId !== evidence.assemblyId ||
        projection.assembly.revision !== evidence.assemblyRevision)) ||
    (projection.review !== null &&
      (projection.review.manifestReference.manifestId !== evidence.manifestId ||
        projection.review.manifestReference.manifestHash !==
          evidence.manifestHash)) ||
    (projection.result !== null &&
      (projection.result.renderId !== evidence.renderId ||
        !evidence.outputAvailable)) ||
    (projection.operation !== null &&
      evidence.activeOperation !== null &&
      projection.operation.operationId !==
        evidence.activeOperation.operationId);

  if (projectedStage > evidenceStage || idConflict) {
    return {
      status: "server-conflict",
      failure: safeFailure("STALE_REVISION", "restore.server-conflict"),
    };
  }

  const stageHint =
    projectedStage < evidenceStage
      ? SERVER_RESUME_STAGE[evidence.provenStage]
      : projection.stageHint;
  const state = projectionToState(
    projection,
    evidence,
    availability,
    stageHint,
  );
  return state === null
    ? {
        status: "server-conflict",
        failure: safeFailure(
          "SESSION_INVALID",
          "restore.incomplete-projection",
        ),
      }
    : { status: "restored", state };
}
