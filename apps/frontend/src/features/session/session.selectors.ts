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
  | "edit"
  | "review-render"
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
  "no-candidates": "Choose a moment manually",
  candidates: "Choose a candidate",
  assembling: "Building the first cut",
  "assembly-failed": "First cut needs attention",
  editor: "Refine the clip",
  "render-confirmation": "Review before rendering",
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
  editor: 75,
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
    (state.stage === "candidates" || state.stage === "no-candidates") &&
    state.analysis.bundle === null
  ) {
    return ["analysis-refresh-required"];
  }
  if (
    (state.stage === "editor" || state.stage === "render-confirmation") &&
    state.assembly === null
  ) {
    return ["assembly-refresh-required"];
  }
  if (state.stage === "candidates" && state.selectedId === null) {
    return ["candidate-selection-required"];
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
    case "analyzing":
    case "assembling":
    case "rendering":
      return ["cancel", ...clear];
    case "analysis-confirmation":
      return ["confirm-analysis", ...clear];
    case "analysis-failed":
      return ["retry-analysis", ...clear];
    case "no-candidates":
      return ["build-selection", ...clear];
    case "candidates":
      return ["select-candidate", "build-selection", ...clear];
    case "editor":
      return [
        "edit",
        ...(!["requesting", "cancel-requested"].includes(
          state.editor.proposal.status,
        )
          ? (["review-render"] as const)
          : []),
        ...clear,
      ];
    case "render-confirmation":
      return ["edit", "confirm-render", ...clear];
    case "render-failed":
      return ["retry-render", ...clear];
    case "fatal":
      return [
        ...(state.failure.retryable ? (["retry-restore"] as const) : []),
        ...clear,
      ];
    default:
      return [...clear];
  }
}
