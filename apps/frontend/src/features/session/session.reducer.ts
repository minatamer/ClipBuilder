import {
  analysisBundleSchema,
  assemblyBundleSchema,
  canObserveOperationState,
  isTerminalOperationState,
  operationStageOrdinal,
  operationStatusSchema,
  renderIdSchema,
  localArtifactReferenceSchema,
  mediaDescriptorSchema,
  uuidV4Schema,
  type AssemblyBundleV1,
  type OperationStatusV1,
} from "@clipbuilder/contracts";

import { selectAvailableActions, selectIsClearable } from "./session.selectors";
import type {
  ClipReviewSession,
  ClippingSessionEvent,
  ClippingSessionState,
  SessionDiagnosticCode,
} from "./session.types";

function reject(
  state: ClippingSessionState,
  diagnosticCode: SessionDiagnosticCode = "invalid-transition",
): ClippingSessionState {
  return { ...state, diagnosticCode };
}

function accept<T extends ClippingSessionState>(state: T): T {
  return { ...state, diagnosticCode: null };
}

function operationHasKind(
  operation: OperationStatusV1,
  kind: OperationStatusV1["kind"],
): boolean {
  return operation.kind === kind;
}

function operationProgresses(
  current: OperationStatusV1,
  next: OperationStatusV1,
): boolean {
  if (current.operationId !== next.operationId || current.kind !== next.kind) {
    return false;
  }
  if (isTerminalOperationState(current.state)) return false;
  const currentIndex = operationStageOrdinal(current.kind, current.stageCode);
  const nextIndex = operationStageOrdinal(next.kind, next.stageCode);
  return (
    operationStatusSchema.safeParse(next).success &&
    Date.parse(next.updatedAt) >= Date.parse(current.updatedAt) &&
    currentIndex >= 0 &&
    nextIndex >= currentIndex &&
    (nextIndex > currentIndex || current.stageCode === next.stageCode) &&
    canObserveOperationState(current.state, next.state)
  );
}

function acceptsTerminalEvent(
  operation: OperationStatusV1,
  operationId: string,
  kind: OperationStatusV1["kind"],
  terminalState: "succeeded" | "failed",
): boolean {
  return (
    operation.operationId === operationId &&
    operation.kind === kind &&
    canObserveOperationState(operation.state, terminalState)
  );
}

function resultRevisionMatches(
  operation: OperationStatusV1,
  revision: string,
): boolean {
  return (
    operation.resultRevision === null || operation.resultRevision === revision
  );
}

function snapshot(analysis: { analysisId: string; revision: string }) {
  return { ...analysis, bundle: null as null };
}

function createReview(assembly: AssemblyBundleV1): ClipReviewSession {
  return {
    selectedCandidateId: assembly.compositionManifest.baseCandidateId,
    selectedStartWordId: assembly.selectedStartWordId,
    selectedEndWordId: assembly.selectedEndWordId,
    assemblyReference: {
      assemblyId: assembly.assemblyId,
      revision: assembly.revision,
    },
    manifestReference: {
      manifestId: assembly.manifestId,
      manifestHash: assembly.manifestHash,
      analysisRevision: assembly.analysisRevision,
      assemblyRevision: assembly.revision,
    },
    playback: { status: "idle", currentTimeMs: 0 },
  };
}

export function clippingSessionReducer(
  state: ClippingSessionState,
  event: ClippingSessionEvent,
): ClippingSessionState {
  if (event.type === "SESSION_EXPIRED" && state.stage !== "clearing") {
    return accept({
      stage: "expired",
      localStatePresent: state.stage !== "bootstrapping",
      diagnosticCode: null,
    });
  }

  if (event.type === "CLEAR" && selectIsClearable(state)) {
    return accept({
      stage: "clearing",
      previousStage: state.stage,
      cleanup: { status: "requesting" },
      diagnosticCode: null,
    });
  }

  if (event.type === "ANALYSIS_REFRESHED") {
    if (
      state.stage !== "candidates" &&
      state.stage !== "no-candidates" &&
      state.stage !== "assembly-failed"
    )
      return reject(state);
    const parsed = analysisBundleSchema.safeParse(event.analysis);
    if (
      !parsed.success ||
      event.sessionId !== state.identity.sessionId ||
      parsed.data.analysisId !== state.analysis.analysisId ||
      parsed.data.revision !== state.analysis.revision ||
      state.analysis.bundle !== null
    )
      return reject(state);
    const analysis = { ...state.analysis, bundle: parsed.data };
    if (state.stage === "assembly-failed") {
      const selected = parsed.data.candidates.find(
        (candidate) => candidate.id === state.selectedId,
      );
      if (
        selected?.startWordId !== state.startWordId ||
        selected.endWordId !== state.endWordId
      )
        return reject(state);
      return accept({ ...state, analysis });
    }
    if (parsed.data.outcome === "no-strong-candidates") {
      return accept({
        stage: "no-candidates",
        identity: state.identity,
        analysis,
        diagnosticCode: null,
      });
    }
    const selectedId =
      state.stage === "candidates" &&
      parsed.data.candidates.some(
        (candidate) => candidate.id === state.selectedId,
      )
        ? state.selectedId
        : null;
    return accept({
      stage: "candidates",
      identity: state.identity,
      analysis,
      selectedId,
      diagnosticCode: null,
    });
  }

  if (event.type === "REVIEW_BUNDLES_REFRESHED") {
    if (state.stage !== "clip-review" && state.stage !== "render-failed")
      return reject(state);
    const analysis = analysisBundleSchema.safeParse(event.analysis);
    const assembly = assemblyBundleSchema.safeParse(event.assembly);
    if (!analysis.success || !assembly.success)
      return reject(state, "invalid-manifest");
    const candidate = analysis.data.candidates.find(
      (item) => item.id === state.review.selectedCandidateId,
    );
    if (
      analysis.data.analysisId !== state.analysis.analysisId ||
      analysis.data.revision !== state.analysis.revision ||
      assembly.data.assemblyId !== state.review.assemblyReference.assemblyId ||
      assembly.data.revision !== state.review.assemblyReference.revision ||
      assembly.data.manifestId !== state.review.manifestReference.manifestId ||
      assembly.data.manifestHash !==
        state.review.manifestReference.manifestHash ||
      assembly.data.analysisRevision !== analysis.data.revision ||
      assembly.data.compositionManifest.baseCandidateId !== candidate?.id ||
      assembly.data.selectedStartWordId !== candidate?.startWordId ||
      assembly.data.selectedEndWordId !== candidate?.endWordId ||
      assembly.data.selectedStartWordId !== state.review.selectedStartWordId ||
      assembly.data.selectedEndWordId !== state.review.selectedEndWordId
    )
      return reject(state, "invalid-manifest");
    return accept({
      ...state,
      analysis: { ...state.analysis, bundle: analysis.data },
      assembly: assembly.data,
    });
  }

  switch (state.stage) {
    case "bootstrapping":
      if (event.type === "RESTORE_EMPTY") {
        return accept({
          stage: "intake",
          availability: event.availability,
          diagnosticCode: null,
        });
      }
      if (event.type === "RESTORE_VALID") return accept(event.state);
      if (event.type === "RESTORE_EXPIRED") {
        return accept({
          stage: "expired",
          localStatePresent: event.localStatePresent,
          diagnosticCode: null,
        });
      }
      if (event.type === "RESTORE_FATAL") {
        return accept({
          stage: "fatal",
          failure: event.failure,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "intake":
      if (
        event.type === "LOCAL_PREPARATION_STARTED" &&
        state.availability.upload &&
        event.identity.authority === "local" &&
        uuidV4Schema.safeParse(event.epoch).success &&
        localArtifactReferenceSchema.safeParse(event.artifact).success
      ) {
        return accept({
          stage: "local-preparing",
          identity: event.identity,
          epoch: event.epoch,
          artifact: event.artifact,
          copiedBytes: 0,
          diagnosticCode: null,
        });
      }
      if (event.type === "FILE_SELECTED" && state.availability.upload) {
        return accept({
          stage: "local-inspection",
          localSource: event.localSource,
          diagnosticCode: null,
        });
      }
      if (event.type === "SAMPLE_SELECTED" && state.availability.sample) {
        const parsed = analysisBundleSchema.safeParse(event.analysis);
        if (!parsed.success) return reject(state);
        const analysis = {
          analysisId: parsed.data.analysisId,
          revision: parsed.data.revision,
          bundle: parsed.data,
        };
        return parsed.data.outcome === "candidates"
          ? accept({
              stage: "candidates",
              identity: event.identity,
              analysis,
              selectedId: null,
              diagnosticCode: null,
            })
          : accept({
              stage: "no-candidates",
              identity: event.identity,
              analysis,
              diagnosticCode: null,
            });
      }
      return reject(state);

    case "local-preparing":
      if (
        event.type === "LOCAL_COPY_PROGRESS" &&
        event.epoch === state.epoch &&
        Number.isSafeInteger(event.bytes) &&
        event.bytes >= state.copiedBytes &&
        event.bytes <= state.artifact.bytes
      )
        return accept({ ...state, copiedBytes: event.bytes });
      if (
        event.type === "LOCAL_SOURCE_READY" &&
        event.epoch === state.epoch &&
        mediaDescriptorSchema.safeParse(event.media).success &&
        event.media.sourceRevision === state.artifact.sourceRevision &&
        event.media.bytes === state.artifact.bytes
      )
        return accept({
          stage: "analysis-confirmation",
          identity: state.identity,
          media: event.media,
          diagnosticCode: null,
        });
      if (event.type === "LOCAL_SOURCE_FAILED" && event.epoch === state.epoch)
        return accept({
          stage: "fatal",
          failure: event.failure,
          diagnosticCode: null,
        });
      return reject(state);

    case "local-inspection":
      if (event.type === "LOCAL_REJECTED") {
        return accept({
          ...state,
          localSource: {
            ...state.localSource,
            validation: { status: "rejected", reasonCode: event.reasonCode },
          },
        });
      }
      if (
        event.type === "UPLOAD_CONFIRMED" &&
        state.localSource.validation.status === "accepted"
      ) {
        return accept({
          stage: "upload-authorizing",
          identity: event.identity,
          localSource: state.localSource,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "upload-authorizing":
      if (event.type === "AUTHORIZED") {
        return accept({
          stage: "uploading",
          identity: state.identity,
          localSource: state.localSource,
          upload: {
            status: "requesting",
            uploadId: event.uploadId,
            bytesSent: 0,
            totalBytes: state.localSource.declaredBytes,
          },
          diagnosticCode: null,
        });
      }
      if (event.type === "AUTHORIZATION_FAILED") {
        return accept({
          stage: "local-inspection",
          localSource: state.localSource,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "uploading":
      if (
        event.type === "UPLOAD_PROGRESS" &&
        state.upload.status === "requesting"
      ) {
        if (
          event.bytesSent < state.upload.bytesSent ||
          event.bytesSent > state.upload.totalBytes
        ) {
          return reject(state, "non-monotonic-progress");
        }
        return accept({
          ...state,
          upload: { ...state.upload, bytesSent: event.bytesSent },
        });
      }
      if (
        event.type === "UPLOAD_COMPLETE" &&
        operationHasKind(event.operation, "media-inspection")
      ) {
        return accept({
          stage: "media-inspecting",
          identity: state.identity,
          operation: event.operation,
          diagnosticCode: null,
        });
      }
      if (event.type === "CANCEL_REQUESTED") {
        return accept({
          stage: "clearing",
          previousStage: "uploading",
          cleanup: { status: "requesting" },
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "media-inspecting":
      if (event.type === "STAGE_UPDATED") {
        return operationProgresses(state.operation, event.operation)
          ? accept({ ...state, operation: event.operation })
          : reject(state, "non-monotonic-progress");
      }
      if (event.type === "MEDIA_ACCEPTED") {
        return accept({
          stage: "analysis-confirmation",
          identity: state.identity,
          media: event.media,
          diagnosticCode: null,
        });
      }
      if (event.type === "MEDIA_REJECTED") {
        return accept({
          stage: "analysis-failed",
          identity: state.identity,
          failure: event.failure,
          recovery: null,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "analysis-confirmation":
      if (
        event.type === "ANALYZE_CONFIRMED" &&
        operationHasKind(event.operation, "analysis")
      ) {
        return accept({
          stage: "analyzing",
          identity: state.identity,
          operation: event.operation,
          lastKnown: { media: state.media },
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "analyzing":
      if (event.type === "STAGE_UPDATED") {
        return operationProgresses(state.operation, event.operation)
          ? accept({ ...state, operation: event.operation })
          : reject(state, "non-monotonic-progress");
      }
      if (
        event.type === "CANCEL_REQUESTED" &&
        !isTerminalOperationState(state.operation.state)
      ) {
        return accept({
          ...state,
          cancelRequested: true,
        });
      }
      if (event.type === "ANALYSIS_SUCCEEDED") {
        const parsed = analysisBundleSchema.safeParse(event.analysis);
        if (
          !acceptsTerminalEvent(
            state.operation,
            event.operationId,
            "analysis",
            "succeeded",
          ) ||
          !parsed.success ||
          !resultRevisionMatches(state.operation, parsed.data.revision) ||
          parsed.data.media.mediaId !== state.lastKnown.media.mediaId ||
          parsed.data.media.sourceRevision !==
            state.lastKnown.media.sourceRevision
        ) {
          return reject(state);
        }
        const analysis = {
          analysisId: parsed.data.analysisId,
          revision: parsed.data.revision,
          bundle: parsed.data,
        };
        return parsed.data.outcome === "candidates"
          ? accept({
              stage: "candidates",
              identity: state.identity,
              analysis,
              selectedId: null,
              diagnosticCode: null,
            })
          : accept({
              stage: "no-candidates",
              identity: state.identity,
              analysis,
              diagnosticCode: null,
            });
      }
      if (
        event.type === "ANALYSIS_FAILED" &&
        acceptsTerminalEvent(
          state.operation,
          event.operationId,
          "analysis",
          "failed",
        )
      ) {
        return accept({
          stage: "analysis-failed",
          identity: { ...state.identity, remaining: event.remaining },
          failure: event.failure,
          recovery: state.lastKnown,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "analysis-failed":
      if (
        event.type === "RETRY_ANALYSIS" &&
        selectAvailableActions(state).includes("retry-analysis") &&
        state.recovery !== null &&
        operationHasKind(event.operation, "analysis")
      ) {
        return accept({
          stage: "analyzing",
          identity: {
            ...state.identity,
            remaining: {
              ...state.identity.remaining,
              analysisRetries: state.identity.remaining.analysisRetries - 1,
            },
          },
          operation: event.operation,
          lastKnown: state.recovery,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "no-candidates":
      return reject(state);

    case "candidates":
      if (event.type === "CANDIDATE_PREVIEW_CLOSED")
        return accept({ ...state, selectedId: null });
      if (event.type === "CANDIDATE_SELECTED") {
        if (
          state.analysis.bundle === null ||
          !state.analysis.bundle.candidates.some(
            (candidate) => candidate.id === event.candidateId,
          )
        ) {
          return reject(state);
        }
        return accept({ ...state, selectedId: event.candidateId });
      }
      if (
        event.type === "BUILD_SELECTED" &&
        state.selectedId !== null &&
        state.analysis.bundle !== null &&
        operationHasKind(event.operation, "assembly")
      ) {
        const candidate = state.analysis.bundle.candidates.find(
          (item) => item.id === state.selectedId,
        );
        if (
          candidate === undefined ||
          candidate.startWordId !== event.startWordId ||
          candidate.endWordId !== event.endWordId
        ) {
          return reject(state);
        }
        return accept({
          stage: "assembling",
          identity: state.identity,
          operation: event.operation,
          lastKnown: {
            analysis: state.analysis,
            selectedId: state.selectedId,
            startWordId: candidate.startWordId,
            endWordId: candidate.endWordId,
          },
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "assembling":
      if (event.type === "STAGE_UPDATED") {
        return operationProgresses(state.operation, event.operation)
          ? accept({ ...state, operation: event.operation })
          : reject(state, "non-monotonic-progress");
      }
      if (event.type === "ASSEMBLY_SUCCEEDED") {
        const parsed = assemblyBundleSchema.safeParse(event.assembly);
        if (
          !acceptsTerminalEvent(
            state.operation,
            event.operationId,
            "assembly",
            "succeeded",
          ) ||
          !parsed.success ||
          !resultRevisionMatches(state.operation, parsed.data.revision) ||
          parsed.data.analysisRevision !== state.lastKnown.analysis.revision ||
          parsed.data.selectedStartWordId !== state.lastKnown.startWordId ||
          parsed.data.selectedEndWordId !== state.lastKnown.endWordId ||
          parsed.data.compositionManifest.baseCandidateId !==
            state.lastKnown.selectedId
        ) {
          return reject(
            state,
            parsed.success ? "invalid-transition" : "invalid-manifest",
          );
        }
        return accept({
          stage: "clip-review",
          identity: state.identity,
          analysis: state.lastKnown.analysis,
          assembly: parsed.data,
          review: createReview(parsed.data),
          diagnosticCode: null,
        });
      }
      if (
        event.type === "ASSEMBLY_FAILED" &&
        acceptsTerminalEvent(
          state.operation,
          event.operationId,
          "assembly",
          "failed",
        )
      ) {
        return accept({
          stage: "assembly-failed",
          identity: state.identity,
          analysis: state.lastKnown.analysis,
          selectedId: state.lastKnown.selectedId,
          startWordId: state.lastKnown.startWordId,
          endWordId: state.lastKnown.endWordId,
          failure: event.failure,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "assembly-failed":
      if (
        event.type === "RETRY_ASSEMBLY" &&
        selectAvailableActions(state).includes("retry-assembly") &&
        operationHasKind(event.operation, "assembly")
      ) {
        return accept({
          stage: "assembling",
          identity: state.identity,
          operation: event.operation,
          lastKnown: {
            analysis: state.analysis,
            selectedId: state.selectedId,
            startWordId: state.startWordId,
            endWordId: state.endWordId,
          },
          diagnosticCode: null,
        });
      }
      if (event.type === "CHOOSE_ANOTHER") {
        return accept({
          stage: "candidates",
          identity: state.identity,
          analysis: state.analysis,
          selectedId: null,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "clip-review":
      if (
        event.type === "PLAYBACK_REQUESTED" &&
        Number.isInteger(event.currentTimeMs) &&
        event.currentTimeMs >= 0
      ) {
        return accept({
          ...state,
          review: {
            ...state.review,
            playback: {
              status: "requesting",
              currentTimeMs: event.currentTimeMs,
            },
          },
        });
      }
      if (
        event.type === "PLAYBACK_UPDATED" &&
        (state.review.playback.status === "requesting" ||
          state.review.playback.status === "succeeded") &&
        Number.isInteger(event.currentTimeMs) &&
        event.currentTimeMs >= 0
      ) {
        return accept({
          ...state,
          review: {
            ...state.review,
            playback: {
              status: "succeeded",
              currentTimeMs: event.currentTimeMs,
            },
          },
        });
      }
      if (
        event.type === "PLAYBACK_FAILED" &&
        (state.review.playback.status === "requesting" ||
          state.review.playback.status === "succeeded")
      ) {
        return accept({
          ...state,
          review: {
            ...state.review,
            playback: {
              status: "failed",
              currentTimeMs: state.review.playback.currentTimeMs,
              failure: event.failure,
            },
          },
        });
      }
      if (
        event.type === "PLAYBACK_CANCEL_REQUESTED" &&
        (state.review.playback.status === "requesting" ||
          state.review.playback.status === "succeeded")
      ) {
        return accept({
          ...state,
          review: {
            ...state.review,
            playback: {
              status: "cancel-requested",
              currentTimeMs: state.review.playback.currentTimeMs,
            },
          },
        });
      }
      if (
        event.type === "RENDER_CONFIRMED" &&
        selectAvailableActions(state).includes("confirm-render") &&
        operationHasKind(event.operation, "render")
      ) {
        return accept({
          stage: "rendering",
          identity: {
            ...state.identity,
            remaining: {
              ...state.identity.remaining,
              renderAttempts: state.identity.remaining.renderAttempts - 1,
            },
          },
          operation: event.operation,
          lastKnown: {
            analysis: state.analysis,
            assembly: state.assembly,
            review: state.review,
          },
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "rendering":
      if (event.type === "STAGE_UPDATED") {
        return operationProgresses(state.operation, event.operation)
          ? accept({ ...state, operation: event.operation })
          : reject(state, "non-monotonic-progress");
      }
      if (event.type === "RENDER_SUCCEEDED") {
        if (
          !acceptsTerminalEvent(
            state.operation,
            event.operationId,
            "render",
            "succeeded",
          ) ||
          event.manifestHash !==
            state.lastKnown.review.manifestReference.manifestHash ||
          !renderIdSchema.safeParse(event.renderId).success
        ) {
          return reject(state, "invalid-manifest");
        }
        return accept({
          stage: "result",
          identity: state.identity,
          result: { renderId: event.renderId, outputAvailable: true },
          clipSummary: {
            analysisId: state.lastKnown.analysis.analysisId,
            analysisRevision: state.lastKnown.analysis.revision,
            assemblyId: state.lastKnown.review.assemblyReference.assemblyId,
            assemblyRevision: state.lastKnown.review.assemblyReference.revision,
            manifestId: state.lastKnown.review.manifestReference.manifestId,
            manifestHash: state.lastKnown.review.manifestReference.manifestHash,
            selectedCandidateId: state.lastKnown.review.selectedCandidateId,
            selectedStartWordId: state.lastKnown.review.selectedStartWordId,
            selectedEndWordId: state.lastKnown.review.selectedEndWordId,
          },
          diagnosticCode: null,
        });
      }
      if (
        event.type === "RENDER_FAILED" &&
        acceptsTerminalEvent(
          state.operation,
          event.operationId,
          "render",
          "failed",
        )
      ) {
        return accept({
          stage: "render-failed",
          identity: { ...state.identity, remaining: event.remaining },
          analysis: state.lastKnown.analysis,
          assembly: state.lastKnown.assembly,
          review: state.lastKnown.review,
          failure: event.failure,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "render-failed":
      if (
        event.type === "RETRY_RENDER" &&
        selectAvailableActions(state).includes("retry-render") &&
        operationHasKind(event.operation, "render")
      ) {
        return accept({
          stage: "rendering",
          identity: {
            ...state.identity,
            remaining: {
              ...state.identity.remaining,
              renderAttempts: state.identity.remaining.renderAttempts - 1,
            },
          },
          operation: event.operation,
          lastKnown: {
            analysis: state.analysis,
            assembly: state.assembly,
            review: state.review,
          },
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "clearing":
      if (event.type === "CLEAR_SUCCEEDED") {
        return accept({
          stage: "intake",
          availability: event.availability,
          diagnosticCode: null,
        });
      }
      if (event.type === "CLEAR_PARTIAL") {
        return accept({
          stage: "cleanup-partial",
          failure: event.failure,
          cleanup: { status: "failed", failure: event.failure },
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "cleanup-partial":
    case "expired":
    case "result":
      return reject(state);

    case "fatal":
      if (event.type === "RETRY_RESTORE" && state.failure.retryable) {
        return accept({ stage: "bootstrapping", diagnosticCode: null });
      }
      return reject(state);
  }
}

export function analysisSnapshotFromIds(analysisId: string, revision: string) {
  return snapshot({ analysisId, revision });
}
