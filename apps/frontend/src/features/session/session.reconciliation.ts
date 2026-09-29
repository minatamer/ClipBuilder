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
  ClippingSessionState,
  EditorSession,
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
  "editor",
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
  editor: "editor",
  "render-confirmation": "editor",
  rendering: "rendering",
  "render-failed": "editor",
  result: "result",
  "cleanup-partial": "intake",
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

function restoredEditor(
  projection: ClippingSessionProjectionV1,
): EditorSession | null {
  if (projection.editor === null) return null;
  return {
    assemblyReference: projection.editor.assemblyReference,
    manifest: projection.editor.manifest,
    past: projection.editor.past,
    future: projection.editor.future,
    proposal: { status: "idle" },
    playback: {
      status: "succeeded",
      currentTimeMs: projection.editor.playback.currentTimeMs,
      panel: projection.editor.playback.panel,
    },
  };
}

function serverOperation(
  evidence: ServerSessionEvidence,
  kind: OperationStatusV1["kind"],
): OperationStatusV1 | null {
  if (evidence.activeOperation?.kind === kind) return evidence.activeOperation;
  return null;
}

function projectionToState(
  projection: ClippingSessionProjectionV1,
  evidence: ServerSessionEvidence,
  availability: SessionAvailability,
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
  const editor = restoredEditor(projection);

  switch (projection.stageHint) {
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
    case "editor":
    case "render-confirmation":
    case "render-failed":
      return analysis === null || editor === null
        ? null
        : {
            stage:
              projection.stageHint === "render-confirmation"
                ? "render-confirmation"
                : "editor",
            identity,
            analysis,
            assembly: null,
            editor,
            diagnosticCode: null,
          };
    case "rendering": {
      const operation = serverOperation(evidence, "render");
      return analysis === null || editor === null || operation === null
        ? null
        : {
            stage: "rendering",
            identity,
            operation,
            lastKnown: { analysis, assembly: null, editor },
            diagnosticCode: null,
          };
    }
    case "result":
      return projection.result === null
        ? null
        : {
            stage: "result",
            identity,
            result: projection.result,
            editorSummary: {
              revision: projection.editor?.manifest.revision ?? 0,
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
    (projection.result !== null &&
      (projection.result.renderId !== evidence.renderId ||
        !evidence.outputAvailable)) ||
    (projection.operation !== null &&
      evidence.activeOperation !== null &&
      projection.operation.operationId !==
        evidence.activeOperation.operationId);

  if (projectedStage < evidenceStage) {
    return {
      status: "stale",
      failure: safeFailure("STALE_REVISION", "restore.server-ahead"),
    };
  }

  if (projectedStage > evidenceStage || idConflict) {
    return {
      status: "server-conflict",
      failure: safeFailure("STALE_REVISION", "restore.server-conflict"),
    };
  }

  const state = projectionToState(projection, evidence, availability);
  if (state === null) {
    return {
      status: "server-conflict",
      failure: safeFailure("SESSION_INVALID", "restore.incomplete-projection"),
    };
  }
  return { status: "restored", state };
}
