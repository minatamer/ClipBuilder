import {
  analysisBundleSchema,
  assemblyBundleSchema,
  canOperationTransition,
  EDIT_LIMITS,
  editManifestSchema,
  isTerminalOperationState,
  renderIdSchema,
  type OperationStatusV1,
} from "@clipbuilder/contracts";

import { selectIsClearable } from "./session.selectors";
import type {
  ClippingSessionEvent,
  ClippingSessionState,
  EditorSession,
  SessionDiagnosticCode,
} from "./session.types";

const OPERATION_STAGE_ORDER: Readonly<
  Record<OperationStatusV1["kind"], string[]>
> = {
  "media-inspection": ["queued", "probe", "validate", "complete"],
  analysis: ["queued", "transcribe", "normalize", "candidates", "complete"],
  assembly: ["queued", "shots", "focus", "visuals", "complete"],
  render: ["queued", "compose", "encode", "validate", "complete"],
  cleanup: ["queued", "delete", "verify", "complete"],
};

function reject(
  state: ClippingSessionState,
  diagnosticCode: SessionDiagnosticCode = "invalid-transition",
): ClippingSessionState {
  return { ...state, diagnosticCode };
}

function accept<T extends ClippingSessionState>(state: T): T {
  return { ...state, diagnosticCode: null };
}

function operationProgresses(
  current: OperationStatusV1,
  next: OperationStatusV1,
): boolean {
  if (current.operationId !== next.operationId || current.kind !== next.kind) {
    return false;
  }
  if (isTerminalOperationState(current.state)) {
    return false;
  }
  const order = OPERATION_STAGE_ORDER[current.kind];
  const currentIndex = order.indexOf(current.stageCode);
  const nextIndex = order.indexOf(next.stageCode);
  const stateProgresses =
    current.state === next.state ||
    canOperationTransition(current.state, next.state);
  return currentIndex >= 0 && nextIndex >= currentIndex && stateProgresses;
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
    (operation.state === terminalState ||
      canOperationTransition(operation.state, terminalState))
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

function snapshot(analysis: { analysisId: string; revision: string }): {
  analysisId: string;
  revision: string;
  bundle: null;
} {
  return { ...analysis, bundle: null };
}

function createEditor(
  manifest: EditorSession["manifest"],
  assemblyReference: EditorSession["assemblyReference"],
): EditorSession {
  return {
    assemblyReference,
    manifest,
    past: [],
    future: [],
    proposal: { status: "idle" },
    playback: { status: "idle", currentTimeMs: 0, panel: "transcript" },
  };
}

function commitManifest(
  editor: EditorSession,
  manifest: EditorSession["manifest"],
): EditorSession {
  return {
    ...editor,
    manifest,
    past: [...editor.past, editor.manifest].slice(
      -EDIT_LIMITS.maxHistoryRevisions,
    ),
    future: [],
    proposal: { status: "idle" },
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

  switch (state.stage) {
    case "bootstrapping":
      if (event.type === "RESTORE_EMPTY") {
        return accept({
          stage: "intake",
          availability: event.availability,
          diagnosticCode: null,
        });
      }
      if (event.type === "RESTORE_VALID") {
        return accept(event.state);
      }
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
      if (event.type === "FILE_SELECTED" && state.availability.upload) {
        return accept({
          stage: "local-inspection",
          localSource: event.localSource,
          diagnosticCode: null,
        });
      }
      if (event.type === "SAMPLE_SELECTED" && state.availability.sample) {
        const analysis = {
          analysisId: event.analysis.analysisId,
          revision: event.analysis.revision,
          bundle: event.analysis,
        };
        return accept({
          stage:
            event.analysis.outcome === "candidates"
              ? "candidates"
              : "no-candidates",
          identity: event.identity,
          analysis,
          ...(event.analysis.outcome === "candidates"
            ? { selectedId: null }
            : {}),
          diagnosticCode: null,
        } as ClippingSessionState);
      }
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
      if (event.type === "UPLOAD_COMPLETE") {
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
      if (event.type === "ANALYZE_CONFIRMED") {
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
      if (event.type === "CANCEL_REQUESTED") {
        return accept({
          ...state,
          operation: { ...state.operation, state: "cancel-requested" },
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
          parsed.data.media.objectGeneration !==
            state.lastKnown.media.objectGeneration
        ) {
          return reject(state);
        }
        const bundle = parsed.data;
        const analysis = {
          analysisId: bundle.analysisId,
          revision: bundle.revision,
          bundle,
        };
        return accept({
          stage:
            bundle.outcome === "candidates" ? "candidates" : "no-candidates",
          identity: state.identity,
          analysis,
          ...(event.analysis.outcome === "candidates"
            ? { selectedId: null }
            : {}),
          diagnosticCode: null,
        } as ClippingSessionState);
      }
      if (event.type === "ANALYSIS_FAILED") {
        if (
          !acceptsTerminalEvent(
            state.operation,
            event.operationId,
            "analysis",
            "failed",
          )
        ) {
          return reject(state);
        }
        return accept({
          stage: "analysis-failed",
          identity: state.identity,
          failure: event.failure,
          recovery: state.lastKnown,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "analysis-failed":
      if (event.type === "RETRY_ANALYSIS" && state.recovery !== null) {
        return accept({
          stage: "analyzing",
          identity: state.identity,
          operation: event.operation,
          lastKnown: state.recovery,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "no-candidates":
      if (event.type === "MANUAL_RANGE_VALID") {
        return accept({
          stage: "assembling",
          identity: state.identity,
          operation: event.operation,
          lastKnown: {
            analysis: state.analysis,
            selectedId: "manual",
            startWordId: event.startWordId,
            endWordId: event.endWordId,
          },
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "candidates":
      if (event.type === "CANDIDATE_SELECTED") {
        if (state.analysis.bundle === null) {
          return reject(state);
        }
        if (
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
        state.analysis.bundle !== null
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
          parsed.data.initialManifest.baseCandidateId !==
            state.lastKnown.selectedId
        ) {
          return reject(state);
        }
        const assembly = parsed.data;
        return accept({
          stage: "editor",
          identity: state.identity,
          analysis: state.lastKnown.analysis,
          assembly,
          editor: createEditor(assembly.initialManifest, {
            assemblyId: assembly.assemblyId,
            revision: assembly.revision,
          }),
          diagnosticCode: null,
        });
      }
      if (event.type === "ASSEMBLY_FAILED") {
        if (
          !acceptsTerminalEvent(
            state.operation,
            event.operationId,
            "assembly",
            "failed",
          )
        ) {
          return reject(state);
        }
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
      if (event.type === "RETRY_ASSEMBLY") {
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

    case "editor":
      if (event.type === "MANUAL_EDIT") {
        if (!editManifestSchema.safeParse(event.manifest).success) {
          return reject(state, "invalid-manifest");
        }
        return accept({
          ...state,
          editor: commitManifest(state.editor, event.manifest),
        });
      }
      if (event.type === "AI_PROPOSAL_REQUESTED") {
        if (event.baseRevision !== state.editor.manifest.revision) {
          return reject(state, "stale-proposal");
        }
        return accept({
          ...state,
          editor: {
            ...state.editor,
            proposal: {
              status: "requesting",
              requestId: event.requestId,
              baseRevision: event.baseRevision,
            },
          },
        });
      }
      if (event.type === "AI_PROPOSAL_RECEIVED") {
        if (
          state.editor.proposal.status !== "requesting" ||
          event.proposal.baseRevision !== state.editor.manifest.revision ||
          !editManifestSchema.safeParse(event.proposedManifest).success
        ) {
          return reject(state, "stale-proposal");
        }
        return accept({
          ...state,
          editor: {
            ...state.editor,
            proposal: {
              status: "succeeded",
              proposal: event.proposal,
              proposedManifest: event.proposedManifest,
              changedFields: [...new Set(event.changedFields)].slice(0, 10),
            },
          },
        });
      }
      if (event.type === "AI_PROPOSAL_FAILED") {
        return state.editor.proposal.status === "requesting"
          ? accept({
              ...state,
              editor: {
                ...state.editor,
                proposal: { status: "failed", failure: event.failure },
              },
            })
          : reject(state);
      }
      if (event.type === "AI_PROPOSAL_CANCEL_REQUESTED") {
        return state.editor.proposal.status === "requesting"
          ? accept({
              ...state,
              editor: {
                ...state.editor,
                proposal: {
                  status: "cancel-requested",
                  requestId: state.editor.proposal.requestId,
                },
              },
            })
          : reject(state);
      }
      if (event.type === "APPLY_PROPOSAL") {
        if (
          state.editor.proposal.status !== "succeeded" ||
          state.editor.proposal.proposal.baseRevision !==
            state.editor.manifest.revision
        ) {
          return reject(state, "stale-proposal");
        }
        return accept({
          ...state,
          editor: commitManifest(
            state.editor,
            state.editor.proposal.proposedManifest,
          ),
        });
      }
      if (event.type === "DISMISS_PROPOSAL") {
        return accept({
          ...state,
          editor: { ...state.editor, proposal: { status: "idle" } },
        });
      }
      if (event.type === "UNDO" && state.editor.past.length > 0) {
        const previous = state.editor.past.at(-1);
        if (previous === undefined) return reject(state);
        return accept({
          ...state,
          editor: {
            ...state.editor,
            manifest: previous,
            past: state.editor.past.slice(0, -1),
            future: [state.editor.manifest, ...state.editor.future].slice(
              0,
              EDIT_LIMITS.maxHistoryRevisions,
            ),
            proposal: { status: "idle" },
          },
        });
      }
      if (event.type === "REDO" && state.editor.future.length > 0) {
        const next = state.editor.future[0];
        if (next === undefined) return reject(state);
        return accept({
          ...state,
          editor: {
            ...state.editor,
            manifest: next,
            past: [...state.editor.past, state.editor.manifest].slice(
              -EDIT_LIMITS.maxHistoryRevisions,
            ),
            future: state.editor.future.slice(1),
            proposal: { status: "idle" },
          },
        });
      }
      if (event.type === "PLAYBACK_REQUESTED") {
        return accept({
          ...state,
          editor: {
            ...state.editor,
            playback: {
              status: "requesting",
              currentTimeMs: Math.max(0, Math.floor(event.currentTimeMs)),
              panel: event.panel,
            },
          },
        });
      }
      if (event.type === "PLAYBACK_UPDATED") {
        return accept({
          ...state,
          editor: {
            ...state.editor,
            playback: {
              status: "succeeded",
              currentTimeMs: Math.max(0, Math.floor(event.currentTimeMs)),
              panel: event.panel,
            },
          },
        });
      }
      if (event.type === "PLAYBACK_FAILED") {
        return state.editor.playback.status === "requesting"
          ? accept({
              ...state,
              editor: {
                ...state.editor,
                playback: {
                  status: "failed",
                  currentTimeMs: state.editor.playback.currentTimeMs,
                  panel: state.editor.playback.panel,
                  failure: event.failure,
                },
              },
            })
          : reject(state);
      }
      if (event.type === "PLAYBACK_CANCEL_REQUESTED") {
        return state.editor.playback.status === "requesting"
          ? accept({
              ...state,
              editor: {
                ...state.editor,
                playback: {
                  status: "cancel-requested",
                  currentTimeMs: state.editor.playback.currentTimeMs,
                  panel: state.editor.playback.panel,
                },
              },
            })
          : reject(state);
      }
      if (event.type === "RENDER_REVIEW") {
        if (
          state.editor.proposal.status === "requesting" ||
          state.editor.proposal.status === "cancel-requested"
        ) {
          return reject(state);
        }
        return accept({
          ...state,
          stage: "render-confirmation",
        });
      }
      return reject(state);

    case "render-confirmation":
      if (event.type === "BACK_TO_EDIT") {
        return accept({ ...state, stage: "editor" });
      }
      if (event.type === "RENDER_CONFIRMED") {
        return accept({
          stage: "rendering",
          identity: state.identity,
          operation: event.operation,
          lastKnown: {
            analysis: state.analysis,
            assembly: state.assembly,
            editor: state.editor,
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
          event.manifestRevision !== state.lastKnown.editor.manifest.revision ||
          !renderIdSchema.safeParse(event.renderId).success
        ) {
          return reject(state);
        }
        return accept({
          stage: "result",
          identity: state.identity,
          result: { renderId: event.renderId, outputAvailable: true },
          editorSummary: { revision: state.lastKnown.editor.manifest.revision },
          diagnosticCode: null,
        });
      }
      if (event.type === "RENDER_FAILED") {
        if (
          !acceptsTerminalEvent(
            state.operation,
            event.operationId,
            "render",
            "failed",
          )
        ) {
          return reject(state);
        }
        return accept({
          stage: "render-failed",
          identity: state.identity,
          analysis: state.lastKnown.analysis,
          assembly: state.lastKnown.assembly,
          editor: state.lastKnown.editor,
          failure: event.failure,
          diagnosticCode: null,
        });
      }
      return reject(state);

    case "render-failed":
      if (event.type === "RETRY_RENDER") {
        return accept({
          stage: "rendering",
          identity: state.identity,
          operation: event.operation,
          lastKnown: {
            analysis: state.analysis,
            assembly: state.assembly,
            editor: state.editor,
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
        return accept({
          stage: "bootstrapping",
          diagnosticCode: null,
        });
      }
      return reject(state);
  }
}

export function analysisSnapshotFromIds(analysisId: string, revision: string) {
  return snapshot({ analysisId, revision });
}
