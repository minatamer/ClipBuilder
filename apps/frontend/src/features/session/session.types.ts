import type {
  AnalysisBundleV1,
  AssemblyBundleV1,
  MediaDescriptor,
  OperationStatusV1,
  SafeError,
} from "@clipbuilder/contracts";

export type SessionDiagnosticCode =
  "invalid-transition" | "non-monotonic-progress" | "invalid-manifest";

export type SessionAvailability = {
  sample: boolean;
  upload: boolean;
};

export type SessionIdentity = {
  sessionId: string;
  mode: "sample" | "upload";
  expiresAt: string;
};

export type LocalSourceSummary = {
  sourceId: string;
  declaredBytes: number;
  contentType: "video/mp4" | "video/webm";
  validation:
    | { status: "pending" }
    | { status: "accepted" }
    | { status: "rejected"; reasonCode: "type" | "size" | "duration" };
};

export type UploadState =
  | { status: "idle" }
  | {
      status: "requesting";
      uploadId: string;
      bytesSent: number;
      totalBytes: number;
    }
  | { status: "succeeded"; uploadId: string }
  | { status: "failed"; failure: SafeError }
  | { status: "cancel-requested"; uploadId: string };

export type PlaybackState =
  | { status: "idle"; currentTimeMs: 0 }
  | {
      status: "requesting" | "succeeded" | "cancel-requested";
      currentTimeMs: number;
    }
  | { status: "failed"; currentTimeMs: number; failure: SafeError };

export type CleanupState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "succeeded" }
  | { status: "failed"; failure: SafeError }
  | { status: "cancel-requested" };

export type ClipReviewSession = {
  selectedCandidateId: string;
  selectedStartWordId: string;
  selectedEndWordId: string;
  assemblyReference: { assemblyId: string; revision: string };
  manifestReference: {
    manifestId: string;
    manifestHash: string;
    analysisRevision: string;
    assemblyRevision: string;
  };
  playback: PlaybackState;
};

export type AnalysisSnapshot = {
  analysisId: string;
  revision: string;
  bundle: AnalysisBundleV1 | null;
};

type SessionStage =
  | { stage: "bootstrapping" }
  | { stage: "intake"; availability: SessionAvailability }
  | { stage: "local-inspection"; localSource: LocalSourceSummary }
  | {
      stage: "upload-authorizing";
      identity: SessionIdentity;
      localSource: LocalSourceSummary;
    }
  | {
      stage: "uploading";
      identity: SessionIdentity;
      localSource: LocalSourceSummary;
      upload: UploadState;
    }
  | {
      stage: "media-inspecting";
      identity: SessionIdentity;
      operation: OperationStatusV1;
    }
  | {
      stage: "analysis-confirmation";
      identity: SessionIdentity;
      media: MediaDescriptor;
    }
  | {
      stage: "analyzing";
      identity: SessionIdentity;
      operation: OperationStatusV1;
      lastKnown: { media: MediaDescriptor };
    }
  | {
      stage: "analysis-failed";
      identity: SessionIdentity;
      failure: SafeError;
      recovery: { media: MediaDescriptor } | null;
    }
  | {
      stage: "no-candidates";
      identity: SessionIdentity;
      analysis: AnalysisSnapshot;
    }
  | {
      stage: "candidates";
      identity: SessionIdentity;
      analysis: AnalysisSnapshot;
      selectedId: string | null;
    }
  | {
      stage: "assembling";
      identity: SessionIdentity;
      operation: OperationStatusV1;
      lastKnown: {
        analysis: AnalysisSnapshot;
        selectedId: string;
        startWordId: string;
        endWordId: string;
      };
    }
  | {
      stage: "assembly-failed";
      identity: SessionIdentity;
      analysis: AnalysisSnapshot;
      selectedId: string;
      startWordId: string;
      endWordId: string;
      failure: SafeError;
    }
  | {
      stage: "clip-review";
      identity: SessionIdentity;
      analysis: AnalysisSnapshot;
      assembly: AssemblyBundleV1 | null;
      review: ClipReviewSession;
    }
  | {
      stage: "render-confirmation";
      identity: SessionIdentity;
      analysis: AnalysisSnapshot;
      assembly: AssemblyBundleV1 | null;
      review: ClipReviewSession;
    }
  | {
      stage: "rendering";
      identity: SessionIdentity;
      operation: OperationStatusV1;
      lastKnown: {
        analysis: AnalysisSnapshot;
        assembly: AssemblyBundleV1 | null;
        review: ClipReviewSession;
      };
    }
  | {
      stage: "render-failed";
      identity: SessionIdentity;
      analysis: AnalysisSnapshot;
      assembly: AssemblyBundleV1 | null;
      review: ClipReviewSession;
      failure: SafeError;
    }
  | {
      stage: "result";
      identity: SessionIdentity;
      result: { renderId: string; outputAvailable: true };
      clipSummary: {
        analysisId: string;
        analysisRevision: string;
        assemblyId: string;
        assemblyRevision: string;
        manifestId: string;
        manifestHash: string;
        selectedCandidateId: string;
        selectedStartWordId: string;
        selectedEndWordId: string;
      };
    }
  | {
      stage: "clearing";
      previousStage: string;
      cleanup: CleanupState;
    }
  | {
      stage: "cleanup-partial";
      failure: SafeError;
      cleanup: CleanupState;
    }
  | { stage: "expired"; localStatePresent: boolean }
  | { stage: "fatal"; failure: SafeError };

export type ClippingSessionState = SessionStage & {
  diagnosticCode: SessionDiagnosticCode | null;
};

export type ClippingSessionEvent =
  | { type: "RESTORE_EMPTY"; availability: SessionAvailability }
  | { type: "RESTORE_VALID"; state: ClippingSessionState }
  | { type: "RESTORE_EXPIRED"; localStatePresent: boolean }
  | { type: "RESTORE_FATAL"; failure: SafeError }
  | { type: "RETRY_RESTORE" }
  | {
      type: "SAMPLE_SELECTED";
      identity: SessionIdentity;
      analysis: AnalysisBundleV1;
    }
  | { type: "FILE_SELECTED"; localSource: LocalSourceSummary }
  | { type: "LOCAL_REJECTED"; reasonCode: "type" | "size" | "duration" }
  | { type: "UPLOAD_CONFIRMED"; identity: SessionIdentity }
  | { type: "AUTHORIZED"; uploadId: string }
  | { type: "AUTHORIZATION_FAILED"; failure: SafeError }
  | { type: "UPLOAD_PROGRESS"; bytesSent: number }
  | { type: "UPLOAD_COMPLETE"; operation: OperationStatusV1 }
  | { type: "MEDIA_ACCEPTED"; media: MediaDescriptor }
  | { type: "MEDIA_REJECTED"; failure: SafeError }
  | { type: "ANALYZE_CONFIRMED"; operation: OperationStatusV1 }
  | { type: "STAGE_UPDATED"; operation: OperationStatusV1 }
  | {
      type: "ANALYSIS_SUCCEEDED";
      operationId: string;
      analysis: AnalysisBundleV1;
    }
  | { type: "ANALYSIS_FAILED"; operationId: string; failure: SafeError }
  | { type: "RETRY_ANALYSIS"; operation: OperationStatusV1 }
  | { type: "CANCEL_REQUESTED" }
  | { type: "CANDIDATE_SELECTED"; candidateId: string }
  | {
      type: "BUILD_SELECTED";
      operation: OperationStatusV1;
      startWordId: string;
      endWordId: string;
    }
  | {
      type: "ASSEMBLY_SUCCEEDED";
      operationId: string;
      assembly: AssemblyBundleV1;
    }
  | { type: "ASSEMBLY_FAILED"; operationId: string; failure: SafeError }
  | { type: "RETRY_ASSEMBLY"; operation: OperationStatusV1 }
  | { type: "CHOOSE_ANOTHER" }
  | { type: "PLAYBACK_REQUESTED"; currentTimeMs: number }
  | { type: "PLAYBACK_UPDATED"; currentTimeMs: number }
  | { type: "PLAYBACK_FAILED"; failure: SafeError }
  | { type: "PLAYBACK_CANCEL_REQUESTED" }
  | { type: "RENDER_REVIEW" }
  | { type: "BACK_TO_REVIEW" }
  | { type: "RENDER_CONFIRMED"; operation: OperationStatusV1 }
  | {
      type: "RENDER_SUCCEEDED";
      operationId: string;
      manifestHash: string;
      renderId: string;
    }
  | { type: "RENDER_FAILED"; operationId: string; failure: SafeError }
  | { type: "RETRY_RENDER"; operation: OperationStatusV1 }
  | { type: "CLEAR" }
  | { type: "CLEAR_SUCCEEDED"; availability: SessionAvailability }
  | { type: "CLEAR_PARTIAL"; failure: SafeError }
  | { type: "SESSION_EXPIRED" };

export const initialClippingSessionState: ClippingSessionState = {
  stage: "bootstrapping",
  diagnosticCode: null,
};
