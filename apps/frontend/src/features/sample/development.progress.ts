import {
  OPERATION_STAGE_ORDER,
  operationStageOrdinal,
  type OperationStatusV1,
} from "@clipbuilder/contracts";
import type {
  ClippingSessionEvent,
  ClippingSessionState,
} from "../session/session.types";
import type { SampleApi } from "./sample.api";
import { SampleApiFailure, sampleFailure } from "./sample.api";

export function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(new Error("Development preview stopped."));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

// Effects dispatch existing domain events; the reducer remains the stage authority.
export async function runDevelopmentStage(
  state: ClippingSessionState,
  api: SampleApi,
  dispatch: (event: ClippingSessionEvent) => void,
  signal: AbortSignal,
  delay = abortableDelay,
) {
  const send = (event: ClippingSessionEvent) => {
    if (!signal.aborted) dispatch(event);
  };
  if (signal.aborted) return;
  if (
    state.stage === "local-inspection" &&
    state.localSource.validation.status === "accepted"
  ) {
    send({ type: "UPLOAD_CONFIRMED", identity: await api.startUpload(signal) });
  } else if (state.stage === "upload-authorizing") {
    const result = await api.authorize(
      {
        declaredBytes: state.localSource.declaredBytes,
        declaredContentType: state.localSource.contentType,
        turnstileToken: "local-synthetic-fixture",
      },
      signal,
    );
    send({ type: "AUTHORIZED", uploadId: result.uploadId });
  } else if (
    state.stage === "uploading" &&
    state.upload.status === "requesting"
  ) {
    let bytes = state.upload.bytesSent;
    while (bytes < state.upload.totalBytes && !signal.aborted) {
      await delay(400, signal);
      bytes = Math.min(
        state.upload.totalBytes,
        bytes + Math.ceil(state.upload.totalBytes / 5),
      );
      send({ type: "UPLOAD_PROGRESS", bytesSent: bytes });
    }
    if (signal.aborted) return;
    send({
      type: "UPLOAD_COMPLETE",
      operation: await api.completeUpload(state.upload.uploadId, bytes, signal),
    });
  } else if (
    state.stage === "media-inspecting" ||
    state.stage === "analyzing" ||
    state.stage === "assembling" ||
    state.stage === "rendering"
  ) {
    let operation = state.operation;
    while (operation.state === "queued" || operation.state === "running") {
      await delay(operation.pollAfterMs, signal);
      if (signal.aborted) return;
      const next = await api.poll(operation.operationId, signal);
      if (next.kind !== operation.kind)
        throw new SampleApiFailure(sampleFailure());
      operation = next;
      send({ type: "STAGE_UPDATED", operation });
    }
    if (signal.aborted) return;
    const evidence = await api.evidence(state.identity.sessionId, signal);
    if (evidence === null) throw new SampleApiFailure(sampleFailure());
    if (operation.state === "failed" && operation.error !== null) {
      if (state.stage === "media-inspecting")
        send({ type: "MEDIA_REJECTED", failure: operation.error });
      if (state.stage === "analyzing")
        send({
          type: "ANALYSIS_FAILED",
          operationId: operation.operationId,
          failure: operation.error,
          remaining: evidence.remaining,
        });
      if (state.stage === "assembling")
        send({
          type: "ASSEMBLY_FAILED",
          operationId: operation.operationId,
          failure: operation.error,
        });
      if (state.stage === "rendering")
        send({
          type: "RENDER_FAILED",
          operationId: operation.operationId,
          failure: operation.error,
          remaining: evidence.remaining,
        });
      return;
    }
    if (operation.state !== "succeeded")
      throw new SampleApiFailure(sampleFailure());
    // Let proven 100% settle visually; cancellation still owns this delay.
    await delay(500, signal);
    if (signal.aborted) return;
    if (state.stage === "media-inspecting" && evidence.media !== null)
      send({ type: "MEDIA_ACCEPTED", media: evidence.media });
    else if (state.stage === "analyzing" && evidence.analysisId !== null)
      send({
        type: "ANALYSIS_SUCCEEDED",
        operationId: operation.operationId,
        analysis: await api.analysis(evidence.analysisId, signal),
      });
    else if (state.stage === "assembling" && evidence.assemblyId !== null)
      send({
        type: "ASSEMBLY_SUCCEEDED",
        operationId: operation.operationId,
        assembly: await api.assembly(evidence.assemblyId, signal),
      });
    else if (
      state.stage === "rendering" &&
      evidence.renderId !== null &&
      evidence.manifestHash !== null &&
      evidence.outputAvailable
    )
      send({
        type: "RENDER_SUCCEEDED",
        operationId: operation.operationId,
        manifestHash: evidence.manifestHash,
        renderId: evidence.renderId,
      });
    else throw new SampleApiFailure(sampleFailure());
  }
}

export async function confirmDevelopmentAnalysis(
  state: ClippingSessionState,
  api: SampleApi,
  dispatch: (event: ClippingSessionEvent) => void,
  signal: AbortSignal,
) {
  if (state.stage !== "analysis-confirmation" || signal.aborted) return;
  const operation = await api.analyze(state.media.mediaId, signal);
  if (!signal.aborted) dispatch({ type: "ANALYZE_CONFIRMED", operation });
}

export function developmentStageLabel(stageCode: string): string {
  const labels: Record<string, string> = {
    "media.inspecting": "Checking the video",
    "analysis.queued": "Preparing analysis",
    "analysis.extracting-audio": "Reading the conversation",
    "analysis.transcribing": "Extracting speech",
    "analysis.selecting-candidates": "Finding the best moments",
    "analysis.complete": "Moments prepared",
    "assembly.queued": "Preparing your clip",
    "assembly.detecting-active-speaker": "Following the speaker",
    "assembly.planning-visuals": "Planning contextual visuals",
    "assembly.creating-visual-assets": "Adding visuals",
    "assembly.compiling-preview-bundle": "Adding fixed captions",
    "assembly.complete": "Preview prepared",
    "render.queued": "Preparing export",
    "render.validating-manifest": "Checking the confirmed clip",
    "render.compiling-captions": "Composing captions",
    "render.encoding": "Encoding the vertical clip",
    "render.validating-output": "Checking export",
    "render.complete": "Export state prepared",
  };
  return labels[stageCode] ?? "Preparing the next step";
}

// Fake-only stage fractions preview the UI, not provider progress or an ETA.
export function developmentOperationFraction(
  operation: Pick<OperationStatusV1, "kind" | "state" | "stageCode">,
): number | undefined {
  const ordinal = operationStageOrdinal(operation.kind, operation.stageCode);
  if (ordinal < 0) return undefined;
  if (operation.state === "succeeded") return 1;
  if (operation.state === "queued") return 0;
  if (operation.state !== "running") return undefined;

  const lastOrdinal = OPERATION_STAGE_ORDER[operation.kind].length - 1;
  return lastOrdinal === 0 ? 0.5 : Math.min(0.99, ordinal / lastOrdinal);
}
