import { describe, expect, it } from "vitest";

import {
  selectAvailableActions,
  selectBlockers,
  selectIsClearable,
  selectProgress,
  selectStageTitle,
} from "./session.selectors";
import { clippingSessionReducer } from "./session.reducer";
import {
  analysis,
  assembly,
  failure,
  identity,
  media,
  noCandidateAnalysis,
  operation,
  reviewState,
} from "./session.test-fixtures";
import {
  initialClippingSessionState,
  type ClippingSessionState,
} from "./session.types";

const availability = { sample: true, upload: true } as const;

describe("canonical clipping-session reducer", () => {
  it("runs the deterministic sample through immutable review, render, result, and clear", () => {
    let state = clippingSessionReducer(initialClippingSessionState, {
      type: "RESTORE_EMPTY",
      availability,
    });
    state = clippingSessionReducer(state, {
      type: "SAMPLE_SELECTED",
      identity,
      analysis,
    });
    state = clippingSessionReducer(state, {
      type: "CANDIDATE_SELECTED",
      candidateId: analysis.candidates[0]!.id,
    });
    state = clippingSessionReducer(state, {
      type: "BUILD_SELECTED",
      operation: operation("assembly"),
      startWordId: "w_000001",
      endWordId: "w_000030",
    });
    state = clippingSessionReducer(state, {
      type: "ASSEMBLY_SUCCEEDED",
      operationId: operation("assembly").operationId,
      assembly,
    });
    expect(state).toMatchObject({
      stage: "clip-review",
      review: {
        manifestReference: { manifestHash: assembly.manifestHash },
      },
    });

    state = clippingSessionReducer(state, {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 500,
    });
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_UPDATED",
      currentTimeMs: 2_000,
    });
    expect(
      state.stage === "clip-review" && state.review.playback.currentTimeMs,
    ).toBe(2_000);

    expect(selectAvailableActions(state)).toEqual(["confirm-render", "clear"]);
    state = clippingSessionReducer(state, {
      type: "RENDER_CONFIRMED",
      operation: operation("render", "render.queued", "r"),
    });
    state = clippingSessionReducer(state, {
      type: "RENDER_FAILED",
      operationId: operation("render", "render.queued", "r").operationId,
      failure,
      remaining: identity.remaining,
    });
    expect(state.stage).toBe("render-failed");
    state = clippingSessionReducer(state, {
      type: "RETRY_RENDER",
      operation: operation("render", "render.queued", "t"),
    });
    state = clippingSessionReducer(state, {
      type: "RENDER_SUCCEEDED",
      operationId: operation("render", "render.queued", "t").operationId,
      manifestHash: assembly.manifestHash,
      renderId: `rnd_${"r".repeat(22)}`,
    });
    expect(state).toMatchObject({
      stage: "result",
      clipSummary: { manifestHash: assembly.manifestHash },
    });
    expect(selectProgress(state)).toBe(100);

    state = clippingSessionReducer(state, { type: "CLEAR" });
    state = clippingSessionReducer(state, {
      type: "CLEAR_SUCCEEDED",
      availability,
    });
    expect(state.stage).toBe("intake");
  });

  it("covers upload, inspection, analysis retry, and the honest no-candidate terminal", () => {
    let state = clippingSessionReducer(initialClippingSessionState, {
      type: "RESTORE_EMPTY",
      availability,
    });
    state = clippingSessionReducer(state, {
      type: "FILE_SELECTED",
      localSource: {
        sourceId: "local-1",
        declaredBytes: 1_000,
        contentType: "video/mp4",
        validation: { status: "accepted" },
      },
    });
    state = clippingSessionReducer(state, {
      type: "UPLOAD_CONFIRMED",
      identity: { ...identity, mode: "upload" },
    });
    state = clippingSessionReducer(state, {
      type: "AUTHORIZED",
      uploadId: `upl_${"u".repeat(22)}`,
    });
    state = clippingSessionReducer(state, {
      type: "UPLOAD_PROGRESS",
      bytesSent: 500,
    });
    state = clippingSessionReducer(state, {
      type: "UPLOAD_COMPLETE",
      operation: operation("media-inspection"),
    });
    state = clippingSessionReducer(state, {
      type: "STAGE_UPDATED",
      operation: operation("media-inspection", "media.inspecting"),
    });
    state = clippingSessionReducer(state, { type: "MEDIA_ACCEPTED", media });
    state = clippingSessionReducer(state, {
      type: "ANALYZE_CONFIRMED",
      operation: operation("analysis"),
    });
    state = clippingSessionReducer(state, {
      type: "ANALYSIS_FAILED",
      operationId: operation("analysis").operationId,
      failure,
      remaining: identity.remaining,
    });
    state = clippingSessionReducer(state, {
      type: "RETRY_ANALYSIS",
      operation: operation("analysis", "analysis.queued", "z"),
    });
    state = clippingSessionReducer(state, {
      type: "ANALYSIS_SUCCEEDED",
      operationId: operation("analysis", "analysis.queued", "z").operationId,
      analysis: noCandidateAnalysis,
    });
    expect(state.stage).toBe("no-candidates");
    expect(selectAvailableActions(state)).toEqual(["clear"]);
  });

  it("preserves selected analysis across bounded assembly retry and choose-another", () => {
    const assemblyOperation = operation("assembly");
    let state: ClippingSessionState = {
      stage: "assembling" as const,
      identity,
      operation: assemblyOperation,
      lastKnown: {
        analysis: {
          analysisId: analysis.analysisId,
          revision: analysis.revision,
          bundle: analysis,
        },
        selectedId: analysis.candidates[0]!.id,
        startWordId: "w_000001",
        endWordId: "w_000030",
      },
      diagnosticCode: null,
    };
    state = clippingSessionReducer(state, {
      type: "ASSEMBLY_FAILED",
      operationId: assemblyOperation.operationId,
      failure,
    });
    state = clippingSessionReducer(state, {
      type: "RETRY_ASSEMBLY",
      operation: operation("assembly", "assembly.queued", "y"),
    });
    state = clippingSessionReducer(state, {
      type: "ASSEMBLY_FAILED",
      operationId: operation("assembly", "assembly.queued", "y").operationId,
      failure,
    });
    state = clippingSessionReducer(state, { type: "CHOOSE_ANOTHER" });
    expect(state).toMatchObject({ stage: "candidates", selectedId: null });
  });

  it("rejects illegal transitions, stale operations, and manifest substitution", () => {
    const intake = clippingSessionReducer(initialClippingSessionState, {
      type: "RESTORE_EMPTY",
      availability,
    });
    expect(
      clippingSessionReducer(intake, {
        type: "RENDER_CONFIRMED",
        operation: operation("render"),
      }),
    ).toMatchObject({
      stage: "intake",
      diagnosticCode: "invalid-transition",
    });

    const uploading = clippingSessionReducer(
      {
        stage: "uploading",
        identity,
        localSource: {
          sourceId: "local-1",
          declaredBytes: 100,
          contentType: "video/mp4",
          validation: { status: "accepted" },
        },
        upload: {
          status: "requesting",
          uploadId: `upl_${"u".repeat(22)}`,
          bytesSent: 50,
          totalBytes: 100,
        },
        diagnosticCode: null,
      },
      { type: "UPLOAD_PROGRESS", bytesSent: 10 },
    );
    expect(uploading.diagnosticCode).toBe("non-monotonic-progress");

    const rendering = clippingSessionReducer(reviewState(), {
      type: "RENDER_CONFIRMED",
      operation: operation("render", "render.queued", "r"),
    });
    expect(
      clippingSessionReducer(rendering, {
        type: "RENDER_SUCCEEDED",
        operationId: operation("render", "render.queued", "r").operationId,
        manifestHash: "3".repeat(64),
        renderId: `rnd_${"r".repeat(22)}`,
      }),
    ).toMatchObject({
      stage: "rendering",
      diagnosticCode: "invalid-manifest",
    });
  });

  it("covers restore, nested playback failure, expiry, and partial cleanup", () => {
    expect(
      clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_VALID",
        state: reviewState(),
      }).stage,
    ).toBe("clip-review");
    expect(
      clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_EXPIRED",
        localStatePresent: true,
      }),
    ).toMatchObject({ stage: "expired", localStatePresent: true });

    let state = clippingSessionReducer(reviewState(), {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 1_500,
    });
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_FAILED",
      failure,
    });
    expect(state.stage === "clip-review" && state.review.playback.status).toBe(
      "failed",
    );
    state = clippingSessionReducer(reviewState(), { type: "SESSION_EXPIRED" });
    expect(state.stage).toBe("expired");

    state = clippingSessionReducer(reviewState(), { type: "CLEAR" });
    state = clippingSessionReducer(state, {
      type: "CLEAR_PARTIAL",
      failure,
    });
    expect(state).toMatchObject({
      stage: "cleanup-partial",
      cleanup: { status: "failed" },
    });
  });

  it("covers the remaining legal validation, cancellation, and progress transitions", () => {
    const localSource = {
      sourceId: "local-1",
      declaredBytes: 100,
      contentType: "video/mp4" as const,
      validation: { status: "pending" as const },
    };
    let state: ClippingSessionState = clippingSessionReducer(
      {
        stage: "local-inspection",
        localSource,
        diagnosticCode: null,
      },
      { type: "LOCAL_REJECTED", reasonCode: "duration" },
    );
    expect(state).toMatchObject({
      stage: "local-inspection",
      localSource: { validation: { status: "rejected" } },
    });

    state = clippingSessionReducer(
      {
        stage: "upload-authorizing",
        identity,
        localSource: {
          ...localSource,
          validation: { status: "accepted" },
        },
        diagnosticCode: null,
      },
      { type: "AUTHORIZATION_FAILED", failure },
    );
    expect(state.stage).toBe("local-inspection");

    state = clippingSessionReducer(
      {
        stage: "uploading",
        identity,
        localSource: {
          ...localSource,
          validation: { status: "accepted" },
        },
        upload: {
          status: "requesting",
          uploadId: `upl_${"u".repeat(22)}`,
          bytesSent: 10,
          totalBytes: 100,
        },
        diagnosticCode: null,
      },
      { type: "CANCEL_REQUESTED" },
    );
    expect(state).toMatchObject({
      stage: "clearing",
      previousStage: "uploading",
    });

    state = clippingSessionReducer(
      {
        stage: "media-inspecting",
        identity,
        operation: operation("media-inspection"),
        diagnosticCode: null,
      },
      { type: "MEDIA_REJECTED", failure },
    );
    expect(state).toMatchObject({ stage: "analysis-failed", recovery: null });

    state = clippingSessionReducer(
      {
        stage: "analyzing",
        identity,
        operation: operation("analysis"),
        lastKnown: { media },
        diagnosticCode: null,
      },
      { type: "CANCEL_REQUESTED" },
    );
    expect(state).toMatchObject({
      stage: "analyzing",
      cancelRequested: true,
    });

    state = clippingSessionReducer(
      {
        stage: "analyzing",
        identity,
        operation: operation("analysis"),
        lastKnown: { media },
        diagnosticCode: null,
      },
      {
        type: "ANALYSIS_SUCCEEDED",
        operationId: operation("analysis").operationId,
        analysis,
      },
    );
    expect(state.stage).toBe("candidates");

    const assemblyOperation = operation("assembly");
    state = clippingSessionReducer(
      {
        stage: "assembling",
        identity,
        operation: assemblyOperation,
        lastKnown: {
          analysis: {
            analysisId: analysis.analysisId,
            revision: analysis.revision,
            bundle: analysis,
          },
          selectedId: analysis.candidates[0]!.id,
          startWordId: "w_000001",
          endWordId: "w_000030",
        },
        diagnosticCode: null,
      },
      {
        type: "STAGE_UPDATED",
        operation: operation("assembly", "assembly.detecting-shots"),
      },
    );
    expect(state).toMatchObject({
      stage: "assembling",
      operation: { stageCode: "assembly.detecting-shots" },
    });

    state = clippingSessionReducer(reviewState(), {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 250,
    });
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_CANCEL_REQUESTED",
    });
    expect(state.stage === "clip-review" && state.review.playback.status).toBe(
      "cancel-requested",
    );

    let rendering = clippingSessionReducer(reviewState(), {
      type: "RENDER_CONFIRMED",
      operation: operation("render"),
    });
    rendering = clippingSessionReducer(rendering, {
      type: "STAGE_UPDATED",
      operation: operation("render", "render.compiling-plan"),
    });
    expect(rendering).toMatchObject({
      stage: "rendering",
      operation: { stageCode: "render.compiling-plan" },
    });
  });

  it("derives read-only labels, actions, blockers, progress, and clearability", () => {
    const state = { ...reviewState(), assembly: null };
    expect(selectStageTitle(state)).toBe("Review the automatic clip");
    expect(selectAvailableActions(state)).toEqual(["clear"]);
    expect(selectBlockers(state)).toEqual([]);
    expect(selectProgress(state)).toBe(75);
    expect(selectIsClearable(state)).toBe(true);
    expect(JSON.stringify(state)).not.toMatch(
      /proposal|undo|redo|headline|captionCorrection/iu,
    );
  });

  it("preserves retryable restore state and exposes an explicit retry", () => {
    const offline = clippingSessionReducer(initialClippingSessionState, {
      type: "RESTORE_FATAL",
      failure,
    });
    expect(selectAvailableActions(offline)).toEqual(["retry-restore", "clear"]);
    expect(
      clippingSessionReducer(offline, { type: "RETRY_RESTORE" }).stage,
    ).toBe("bootstrapping");
  });

  it("confirms directly once and rejects missing bundles, wrong jobs and exhausted allowance", () => {
    const review = reviewState();
    const confirmation = {
      type: "RENDER_CONFIRMED",
      operation: operation("render"),
    } as const;
    const rendering = clippingSessionReducer(review, confirmation);
    expect(rendering).toMatchObject({
      stage: "rendering",
      identity: { remaining: { renderAttempts: 0 } },
      lastKnown: { review: review.review, assembly: review.assembly },
      diagnosticCode: null,
    });
    expect(clippingSessionReducer(rendering, confirmation)).toMatchObject({
      stage: "rendering",
      identity: { remaining: { renderAttempts: 0 } },
      diagnosticCode: "invalid-transition",
    });
    for (const blocked of [
      { ...review, assembly: null },
      { ...review, analysis: { ...review.analysis, bundle: null } },
      {
        ...review,
        identity: {
          ...identity,
          remaining: { ...identity.remaining, renderAttempts: 0 },
        },
      },
    ]) {
      expect(selectAvailableActions(blocked)).toEqual(["clear"]);
      expect(clippingSessionReducer(blocked, confirmation)).toMatchObject({
        stage: "clip-review",
        diagnosticCode: "invalid-transition",
      });
    }
    expect(
      clippingSessionReducer(review, {
        type: "RENDER_CONFIRMED",
        operation: operation("assembly"),
      }),
    ).toMatchObject({
      stage: "clip-review",
      diagnosticCode: "invalid-transition",
    });
  });
});
