import {
  TEMPORARY_MEDIA_LIMITS,
  type OperationStatusV1,
} from "@clipbuilder/contracts";
import type { BrowserWorkspace } from "../media/browser.workspace";
import type { ClippingSessionEvent } from "../session/session.types";
import { SampleApiFailure, sampleFailure } from "../sample/sample.api";
import type { SourceAnalysisApi } from "./source-analysis.api";

export async function runSourceAnalysis(input: {
  workspace: Pick<
    BrowserWorkspace,
    "snapshot" | "sourceFile" | "markCloudAnalysis" | "storeGroundedAnalysis"
  >;
  api: SourceAnalysisApi;
  challenge(
    sessionId: string,
    action: "transcription" | "candidate-analysis",
    signal: AbortSignal,
  ): Promise<string>;
  signal: AbortSignal;
  event(event: ClippingSessionEvent): void;
  label(value: string): void;
}) {
  const { workspace, api } = input,
    source = workspace.snapshot?.source,
    file = workspace.sourceFile;
  if (!source || !file || workspace.snapshot?.cloudAnalysis)
    throw new Error("source-analysis-unavailable");
  const controller = new AbortController(),
    abort = () => controller.abort();
  input.signal.addEventListener("abort", abort, { once: true });
  if (input.signal.aborted) abort();
  const timer = setTimeout(abort, TEMPORARY_MEDIA_LIMITS.workDeadlineMs);
  const signal = controller.signal;
  const operationId = `op_${btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")}`;
  const startedAt = new Date().toISOString();
  const operation: OperationStatusV1 = {
    operationId,
    kind: "analysis",
    state: "running",
    stageCode: "analysis.reading-descriptor",
    startedAt,
    updatedAt: startedAt,
    completedAt: null,
    pollAfterMs: 1000,
    resultRevision: null,
    error: null,
  };
  let started = false;
  let cleanupRequired = false;
  try {
    signal.throwIfAborted();
    await workspace.markCloudAnalysis("pending", false);
    input.event({ type: "ANALYZE_CONFIRMED", operation });
    started = true;
    input.label("Verifying processing access");
    const grant = await api.grant(signal);
    cleanupRequired = true;
    await workspace.markCloudAnalysis("pending", true);
    const uploadToken = await input.challenge(
      grant.sessionId,
      "transcription",
      signal,
    );
    input.label("Uploading video to temporary private storage");
    const admitted = await api.upload(
      {
        media: source.media,
        fingerprint: source.fingerprint,
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
        turnstileToken: uploadToken,
      },
      signal,
    );
    const generation = await api.transfer(
      admitted.uploadUrl,
      file.slice(
        0,
        file.size,
        source.media.container === "mp4" ? "video/mp4" : "video/webm",
      ),
      signal,
    );
    const token = await input.challenge(
      grant.sessionId,
      "candidate-analysis",
      signal,
    );
    input.label("Preparing the proxy and finding grounded moments");
    const result = await api.analyze(generation, token, signal);
    signal.throwIfAborted();
    if (result.binding.sessionId !== grant.sessionId)
      throw new Error("source-analysis-mismatch");
    await workspace.storeGroundedAnalysis(result);
    signal.throwIfAborted();
    const completedAt = new Date().toISOString();
    input.event({
      type: "STAGE_UPDATED",
      operation: {
        ...operation,
        state: "succeeded",
        stageCode: "analysis.complete",
        completedAt,
        updatedAt: completedAt,
        resultRevision: result.analysis.revision,
      },
    });
    input.event({
      type: "ANALYSIS_SUCCEEDED",
      operationId,
      analysis: result.analysis,
    });
  } catch (error) {
    if (!started) throw error;
    if (!input.signal.aborted) {
      // A journal failure is also uncertain: this action must never be re-dispatched.
      await workspace
        .markCloudAnalysis("uncertain", cleanupRequired)
        .catch(() => undefined);
      const failure =
        error instanceof SampleApiFailure ? error.failure : sampleFailure();
      const completedAt = new Date().toISOString();
      input.event({
        type: "STAGE_UPDATED",
        operation: {
          ...operation,
          state: "failed",
          completedAt,
          updatedAt: completedAt,
          error: failure,
        },
      });
      input.event({
        type: "ANALYSIS_FAILED",
        operationId,
        failure,
        remaining: { analysisRetries: 0, renderAttempts: 0 },
      });
    }
  } finally {
    clearTimeout(timer);
    input.signal.removeEventListener("abort", abort);
  }
}

export async function clearAnalysisMedia(input: {
  workspace: Pick<
    BrowserWorkspace,
    | "clear"
    | "remoteCleanup"
    | "rememberRemoteCleanup"
    | "confirmRemoteCleanup"
    | "completeRemoteCleanup"
  >;
  api: Pick<SourceAnalysisApi, "clear">;
  cloudPending: boolean;
  allowMissingSession?: boolean;
  signal: AbortSignal;
}) {
  const needsRemoteClear =
    input.workspace.remoteCleanup?.status !== "confirmed" &&
    (input.cloudPending || input.workspace.remoteCleanup !== null);
  if (needsRemoteClear) {
    await input.workspace
      .rememberRemoteCleanup(
        input.allowMissingSession ??
          input.workspace.remoteCleanup?.allowMissingSession ??
          false,
      )
      .catch(() => undefined);
  }
  const [cloud, local] = await Promise.allSettled([
    needsRemoteClear
      ? (async () => {
          await input.api.clear(
            input.signal,
            input.workspace.remoteCleanup?.allowMissingSession,
          );
          // Persist the server's acknowledgement independently of local deletion.
          // The processing cookie may already be expired by the successful Clear.
          await input.workspace.confirmRemoteCleanup();
        })()
      : Promise.resolve(),
    input.workspace.clear(),
  ]);
  let acknowledged = true;
  if (
    input.workspace.remoteCleanup?.status === "confirmed" &&
    local.status === "fulfilled"
  ) {
    try {
      await input.workspace.completeRemoteCleanup();
    } catch {
      acknowledged = false;
    }
  }
  return {
    cloudPending: input.workspace.remoteCleanup?.status === "pending",
    complete:
      cloud.status === "fulfilled" &&
      local.status === "fulfilled" &&
      acknowledged,
  };
}
