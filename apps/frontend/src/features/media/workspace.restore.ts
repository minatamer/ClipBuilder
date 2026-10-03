import type {
  ClippingSessionState,
  SessionIdentity,
} from "../session/session.types";
import type {
  WorkspaceRecord,
  RemoteCleanupObligation,
} from "./workspace.schema";
import { SAFE_ERROR_MESSAGES } from "@clipbuilder/contracts";

export function localSessionIdentity(record: WorkspaceRecord): SessionIdentity {
  return {
    sessionId: record.sessionId,
    mode: "upload",
    authority: "local",
    expiresAt: new Date(record.expiresAtMs).toISOString(),
    remaining: { analysisRetries: 0, renderAttempts: 0 },
  };
}

export function restoreLocalWorkspace(
  record: WorkspaceRecord | null,
  remoteCleanup: RemoteCleanupObligation | null = null,
): ClippingSessionState {
  if (remoteCleanup)
    return {
      stage: "clearing",
      previousStage: "cleanup-partial",
      cleanup: { status: "requesting" },
      diagnosticCode: null,
    };
  if (!record || record.status !== "ready" || !record.source)
    throw new Error("local-source-not-ready");
  const identity = localSessionIdentity(record);
  if (record.cloudAnalysis && record.cloudAnalysis.status !== "complete")
    return {
      stage: "analysis-failed",
      identity,
      failure: {
        code: "MODEL_OUTPUT_REJECTED",
        message: SAFE_ERROR_MESSAGES.MODEL_OUTPUT_REJECTED,
        retryable: false,
        requestId: `req_${"0".repeat(32)}`,
      },
      recovery: { media: record.source.media },
      diagnosticCode: null,
    };
  if (record.analysis)
    if (record.cloudAssembly) {
      const analysis = {
        analysisId: record.analysis.analysisId,
        revision: record.analysis.revision,
        bundle: record.analysis,
      };
      if (
        record.cloudAssembly.status === "complete" &&
        record.cloudAssembly.result
      )
        return {
          stage: "cloud-review",
          identity,
          analysis,
          result: record.cloudAssembly.result,
          diagnosticCode: null,
        };
      return {
        stage: "cloud-assembly-failed",
        identity,
        analysis,
        selectedId: record.cloudAssembly.candidateId,
        failure: {
          code: "MODEL_OUTPUT_REJECTED",
          message: SAFE_ERROR_MESSAGES.MODEL_OUTPUT_REJECTED,
          retryable: false,
          requestId: `req_${"0".repeat(32)}`,
        },
        diagnosticCode: null,
      };
    }
  if (record.analysis)
    return {
      stage:
        record.analysis.outcome === "candidates"
          ? "candidates"
          : "no-candidates",
      identity,
      analysis: {
        analysisId: record.analysis.analysisId,
        revision: record.analysis.revision,
        bundle: record.analysis,
      },
      selectedId: record.selectedId,
      diagnosticCode: null,
    };
  return {
    stage: "analysis-confirmation",
    identity,
    media: record.source.media,
    diagnosticCode: null,
  };
}
