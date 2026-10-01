import type {
  ClippingSessionState,
  SessionIdentity,
} from "../session/session.types";
import type { WorkspaceRecord } from "./workspace.schema";

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
  record: WorkspaceRecord,
): ClippingSessionState {
  if (record.status !== "ready" || !record.source)
    throw new Error("local-source-not-ready");
  const identity = localSessionIdentity(record);
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
