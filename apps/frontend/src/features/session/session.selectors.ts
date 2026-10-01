import type { ClippingSessionState } from "./session.types";

export type SessionAction =
  | "select-sample"
  | "select-file"
  | "retry-restore"
  | "confirm-upload"
  | "cancel"
  | "confirm-analysis"
  | "retry-analysis"
  | "select-candidate"
  | "build-selection"
  | "retry-assembly"
  | "choose-another"
  | "review-render"
  | "back-to-review"
  | "confirm-render"
  | "retry-render"
  | "clear";

const STAGE_TITLES: Record<ClippingSessionState["stage"], string> = {
  bootstrapping: "Restoring session",
  intake: "Choose a source",
  "local-inspection": "Review local video",
  "upload-authorizing": "Preparing upload",
  uploading: "Uploading video",
  "media-inspecting": "Inspecting media",
  "analysis-confirmation": "Ready to analyze",
  analyzing: "Finding strong moments",
  "analysis-failed": "Analysis needs attention",
  "no-candidates": "No strong moment found",
  candidates: "Choose a candidate",
  assembling: "Building the first cut",
  "assembly-failed": "First cut needs attention",
  "clip-review": "Review the automatic clip",
  "render-confirmation": "Confirm the final render",
  rendering: "Rendering the clip",
  "render-failed": "Render needs attention",
  result: "Your clip is ready",
  clearing: "Clearing session data",
  "cleanup-partial": "Cleanup needs attention",
  expired: "Session expired",
  fatal: "Session unavailable",
};

const PROGRESS: Record<ClippingSessionState["stage"], number> = {
  bootstrapping: 0,
  intake: 0,
  "local-inspection": 5,
  "upload-authorizing": 10,
  uploading: 15,
  "media-inspecting": 25,
  "analysis-confirmation": 30,
  analyzing: 40,
  "analysis-failed": 40,
  "no-candidates": 50,
  candidates: 50,
  assembling: 60,
  "assembly-failed": 60,
  "clip-review": 75,
  "render-confirmation": 80,
  rendering: 90,
  "render-failed": 90,
  result: 100,
  clearing: 0,
  "cleanup-partial": 0,
  expired: 0,
  fatal: 0,
};

export function selectStageTitle(state: ClippingSessionState): string {
  return STAGE_TITLES[state.stage];
}

export function selectProgress(state: ClippingSessionState): number {
  return PROGRESS[state.stage];
}

export function selectIsClearable(state: ClippingSessionState): boolean {
  return !["bootstrapping", "intake", "clearing"].includes(state.stage);
}

export function selectBlockers(state: ClippingSessionState): string[] {
  if (
    (state.stage === "candidates" ||
      state.stage === "no-candidates" ||
      state.stage === "assembly-failed") &&
    state.analysis.bundle === null
  ) {
    return ["analysis-refresh-required"];
  }
  if (state.stage === "candidates" && state.selectedId === null) {
    return ["candidate-selection-required"];
  }
  if (
    (state.stage === "clip-review" ||
      state.stage === "render-confirmation" ||
      state.stage === "render-failed") &&
    state.identity.remaining.renderAttempts === 0
  ) {
    return ["render-allowance-exhausted"];
  }
  return [];
}

export function selectAvailableActions(
  state: ClippingSessionState,
): SessionAction[] {
  const clear = selectIsClearable(state) ? (["clear"] as const) : [];

  switch (state.stage) {
    case "intake":
      return [
        ...(state.availability.sample ? (["select-sample"] as const) : []),
        ...(state.availability.upload ? (["select-file"] as const) : []),
      ];
    case "local-inspection":
      return ["confirm-upload", ...clear];
    case "uploading":
      return ["cancel", ...clear];
    case "analyzing":
      return [
        ...(!state.cancelRequested &&
        (state.operation.state === "queued" ||
          state.operation.state === "running")
          ? (["cancel"] as const)
          : []),
        ...clear,
      ];
    case "analysis-confirmation":
      return ["confirm-analysis", ...clear];
    case "analysis-failed":
      return [
        ...(state.recovery !== null &&
        state.failure.retryable &&
        state.identity.remaining.analysisRetries > 0
          ? (["retry-analysis"] as const)
          : []),
        ...clear,
      ];
    case "candidates":
      return [
        ...(state.analysis.bundle !== null
          ? (["select-candidate"] as const)
          : []),
        ...(state.selectedId !== null && state.analysis.bundle !== null
          ? (["build-selection"] as const)
          : []),
        ...clear,
      ];
    case "assembly-failed":
      return [
        ...(state.failure.retryable && state.analysis.bundle !== null
          ? (["retry-assembly"] as const)
          : []),
        "choose-another",
        ...clear,
      ];
    case "clip-review":
      return [
        ...(state.identity.remaining.renderAttempts > 0
          ? (["review-render"] as const)
          : []),
        ...clear,
      ];
    case "render-confirmation":
      return [
        "back-to-review",
        ...(state.identity.remaining.renderAttempts > 0
          ? (["confirm-render"] as const)
          : []),
        ...clear,
      ];
    case "render-failed":
      return [
        ...(state.failure.retryable &&
        state.identity.remaining.renderAttempts > 0
          ? (["retry-render"] as const)
          : []),
        ...clear,
      ];
    case "fatal":
      return [
        ...(state.failure.retryable ? (["retry-restore"] as const) : []),
        ...clear,
      ];
    default:
      return [...clear];
  }
}
