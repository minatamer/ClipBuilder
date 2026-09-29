import { assemblyBundleSchema } from "@clipbuilder/contracts";
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
  editorState,
  failure,
  identity,
  manifest,
  media,
  noCandidateAnalysis,
  operation,
  proposal,
} from "./session.test-fixtures";
import { initialClippingSessionState } from "./session.types";

const availability = { sample: true, upload: true } as const;

describe("canonical clipping-session reducer", () => {
  it("runs the deterministic sample through candidates, editor, render, result, and clear", () => {
    let state = clippingSessionReducer(initialClippingSessionState, {
      type: "RESTORE_EMPTY",
      availability,
    });
    state = clippingSessionReducer(state, {
      type: "SAMPLE_SELECTED",
      identity,
      analysis,
    });
    expect(state.stage).toBe("candidates");

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
    expect(state.stage).toBe("assembling");
    state = clippingSessionReducer(state, {
      type: "ASSEMBLY_SUCCEEDED",
      operationId: operation("assembly").operationId,
      assembly,
    });
    expect(state.stage).toBe("editor");

    const revisionOne = { ...manifest, revision: 1 };
    state = clippingSessionReducer(state, {
      type: "MANUAL_EDIT",
      manifest: revisionOne,
    });
    state = clippingSessionReducer(state, { type: "UNDO" });
    expect(state.stage === "editor" && state.editor.manifest.revision).toBe(0);
    state = clippingSessionReducer(state, { type: "REDO" });
    expect(state.stage === "editor" && state.editor.manifest.revision).toBe(1);

    state = clippingSessionReducer(state, {
      type: "AI_PROPOSAL_REQUESTED",
      requestId: `req_${"1".repeat(32)}`,
      baseRevision: 1,
    });
    state = clippingSessionReducer(state, {
      type: "AI_PROPOSAL_RECEIVED",
      proposal: proposal(1),
      proposedManifest: { ...revisionOne, revision: 2 },
      changedFields: ["headline", "headline"],
    });
    state = clippingSessionReducer(state, { type: "APPLY_PROPOSAL" });
    expect(state.stage === "editor" && state.editor.manifest.revision).toBe(2);

    state = clippingSessionReducer(state, { type: "RENDER_REVIEW" });
    state = clippingSessionReducer(state, {
      type: "RENDER_CONFIRMED",
      operation: operation("render", "queued", "r"),
    });
    state = clippingSessionReducer(state, {
      type: "RENDER_FAILED",
      operationId: operation("render", "queued", "r").operationId,
      failure,
    });
    expect(state.stage).toBe("render-failed");
    state = clippingSessionReducer(state, {
      type: "RETRY_RENDER",
      operation: operation("render", "queued", "t"),
    });
    state = clippingSessionReducer(state, {
      type: "RENDER_SUCCEEDED",
      operationId: operation("render", "queued", "t").operationId,
      manifestRevision: 2,
      renderId: `rnd_${"r".repeat(22)}`,
    });
    expect(state.stage).toBe("result");
    expect(selectProgress(state)).toBe(100);

    state = clippingSessionReducer(state, { type: "CLEAR" });
    expect(state).toMatchObject({ stage: "clearing", previousStage: "result" });
    state = clippingSessionReducer(state, {
      type: "CLEAR_SUCCEEDED",
      availability,
    });
    expect(state.stage).toBe("intake");
  });

  it("covers upload, inspection, analysis, retry, no-candidate, and assembly recovery", () => {
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
      operation: operation("media-inspection", "probe"),
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
    });
    state = clippingSessionReducer(state, {
      type: "RETRY_ANALYSIS",
      operation: operation("analysis", "queued", "z"),
    });
    state = clippingSessionReducer(state, {
      type: "ANALYSIS_SUCCEEDED",
      operationId: operation("analysis", "queued", "z").operationId,
      analysis: noCandidateAnalysis,
    });
    expect(state.stage).toBe("no-candidates");
    state = clippingSessionReducer(state, {
      type: "MANUAL_RANGE_VALID",
      operation: operation("assembly"),
      startWordId: "w_000001",
      endWordId: "w_000030",
    });
    state = clippingSessionReducer(state, {
      type: "ASSEMBLY_FAILED",
      operationId: operation("assembly").operationId,
      failure,
    });
    state = clippingSessionReducer(state, {
      type: "RETRY_ASSEMBLY",
      operation: operation("assembly", "queued", "y"),
    });
    state = clippingSessionReducer(state, {
      type: "ASSEMBLY_FAILED",
      operationId: operation("assembly", "queued", "y").operationId,
      failure,
    });
    state = clippingSessionReducer(state, { type: "CHOOSE_ANOTHER" });
    expect(state.stage).toBe("candidates");
  });

  it("ignores illegal transitions and diagnoses only content-free codes", () => {
    const intake = clippingSessionReducer(initialClippingSessionState, {
      type: "RESTORE_EMPTY",
      availability,
    });
    const illegal = clippingSessionReducer(intake, {
      type: "RENDER_CONFIRMED",
      operation: operation("render"),
    });
    expect(illegal).toMatchObject({
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

    let editor = editorState();
    editor = clippingSessionReducer(editor, {
      type: "AI_PROPOSAL_REQUESTED",
      requestId: `req_${"1".repeat(32)}`,
      baseRevision: 2,
    });
    expect(editor.diagnosticCode).toBe("stale-proposal");

    const restoredCandidates = {
      stage: "candidates" as const,
      identity,
      analysis: {
        analysisId: analysis.analysisId,
        revision: analysis.revision,
        bundle: null,
      },
      selectedId: null,
      diagnosticCode: null,
    };
    const unprovenSelection = clippingSessionReducer(restoredCandidates, {
      type: "CANDIDATE_SELECTED",
      candidateId: analysis.candidates[0]!.id,
    });
    expect(unprovenSelection).toMatchObject({
      stage: "candidates",
      selectedId: null,
      diagnosticCode: "invalid-transition",
    });

    let hydratedCandidates = clippingSessionReducer(
      {
        ...restoredCandidates,
        analysis: { ...restoredCandidates.analysis, bundle: analysis },
      },
      {
        type: "CANDIDATE_SELECTED",
        candidateId: analysis.candidates[0]!.id,
      },
    );
    hydratedCandidates = clippingSessionReducer(hydratedCandidates, {
      type: "BUILD_SELECTED",
      operation: operation("assembly"),
      startWordId: "w_000002",
      endWordId: "w_000029",
    });
    expect(hydratedCandidates).toMatchObject({
      stage: "candidates",
      diagnosticCode: "invalid-transition",
    });
  });

  it("rejects stale terminal results and mismatched assembly evidence", () => {
    const analysisOperation = operation("analysis", "queued", "a");
    const analyzing = {
      stage: "analyzing" as const,
      identity,
      operation: analysisOperation,
      lastKnown: { media },
      diagnosticCode: null,
    };
    expect(
      clippingSessionReducer(analyzing, {
        type: "ANALYSIS_SUCCEEDED",
        operationId: operation("analysis", "queued", "x").operationId,
        analysis,
      }),
    ).toMatchObject({
      stage: "analyzing",
      diagnosticCode: "invalid-transition",
    });

    const assemblyOperation = operation("assembly", "queued", "a");
    const assembling = {
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
    const mismatchedAssembly = assemblyBundleSchema.parse({
      ...assembly,
      selectedStartWordId: "w_000002",
      initialManifest: {
        ...assembly.initialManifest,
        range: {
          startWordId: "w_000002",
          endWordId: "w_000030",
        },
      },
    });
    expect(
      clippingSessionReducer(assembling, {
        type: "ASSEMBLY_SUCCEEDED",
        operationId: assemblyOperation.operationId,
        assembly: mismatchedAssembly,
      }),
    ).toMatchObject({
      stage: "assembling",
      diagnosticCode: "invalid-transition",
    });

    let rendering = clippingSessionReducer(editorState(), {
      type: "RENDER_REVIEW",
    });
    rendering = clippingSessionReducer(rendering, {
      type: "RENDER_CONFIRMED",
      operation: operation("render", "queued", "r"),
    });
    expect(
      clippingSessionReducer(rendering, {
        type: "RENDER_SUCCEEDED",
        operationId: operation("render", "queued", "x").operationId,
        manifestRevision: 0,
        renderId: `rnd_${"r".repeat(22)}`,
      }),
    ).toMatchObject({
      stage: "rendering",
      diagnosticCode: "invalid-transition",
    });
    expect(
      clippingSessionReducer(rendering, {
        type: "RENDER_SUCCEEDED",
        operationId: operation("render", "queued", "r").operationId,
        manifestRevision: 1,
        renderId: `rnd_${"r".repeat(22)}`,
      }),
    ).toMatchObject({
      stage: "rendering",
      diagnosticCode: "invalid-transition",
    });
  });

  it("caps manifest history and clears redo after a branch edit", () => {
    let state = editorState();
    for (let revision = 1; revision <= 22; revision += 1) {
      state = clippingSessionReducer(state, {
        type: "MANUAL_EDIT",
        manifest: { ...manifest, revision },
      });
    }
    expect(state.stage === "editor" && state.editor.past).toHaveLength(20);
    state = clippingSessionReducer(state, { type: "UNDO" });
    expect(state.stage === "editor" && state.editor.future).toHaveLength(1);
    state = clippingSessionReducer(state, {
      type: "MANUAL_EDIT",
      manifest: { ...manifest, revision: 23 },
    });
    expect(state.stage === "editor" && state.editor.future).toEqual([]);
  });

  it("covers restore, cancellation, nested async, back, expiry, and partial cleanup edges", () => {
    expect(
      clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_VALID",
        state: editorState(),
      }).stage,
    ).toBe("editor");
    expect(
      clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_EXPIRED",
        localStatePresent: true,
      }),
    ).toMatchObject({ stage: "expired", localStatePresent: true });
    expect(
      clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_FATAL",
        failure,
      }).stage,
    ).toBe("fatal");

    let state = clippingSessionReducer(
      {
        stage: "local-inspection",
        localSource: {
          sourceId: "local-1",
          declaredBytes: 100,
          contentType: "video/mp4",
          validation: { status: "pending" },
        },
        diagnosticCode: null,
      },
      { type: "LOCAL_REJECTED", reasonCode: "duration" },
    );
    expect(
      state.stage === "local-inspection" && state.localSource.validation,
    ).toEqual({ status: "rejected", reasonCode: "duration" });

    state = clippingSessionReducer(
      {
        stage: "upload-authorizing",
        identity,
        localSource: {
          sourceId: "local-1",
          declaredBytes: 100,
          contentType: "video/mp4",
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
          sourceId: "local-1",
          declaredBytes: 100,
          contentType: "video/mp4",
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
      cleanup: { status: "requesting" },
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
    expect(state.stage === "analyzing" && state.operation.state).toBe(
      "cancel-requested",
    );

    state = editorState();
    state = clippingSessionReducer(state, {
      type: "AI_PROPOSAL_REQUESTED",
      requestId: `req_${"2".repeat(32)}`,
      baseRevision: 0,
    });
    expect(
      clippingSessionReducer(state, { type: "RENDER_REVIEW" }),
    ).toMatchObject({
      stage: "editor",
      diagnosticCode: "invalid-transition",
    });
    expect(selectAvailableActions(state)).not.toContain("review-render");
    state = clippingSessionReducer(state, {
      type: "AI_PROPOSAL_CANCEL_REQUESTED",
    });
    expect(state.stage === "editor" && state.editor.proposal.status).toBe(
      "cancel-requested",
    );

    expect(
      clippingSessionReducer(state, { type: "RENDER_REVIEW" }),
    ).toMatchObject({
      stage: "editor",
      diagnosticCode: "invalid-transition",
    });
    expect(selectAvailableActions(state)).not.toContain("review-render");

    state = clippingSessionReducer(editorState(), {
      type: "AI_PROPOSAL_REQUESTED",
      requestId: `req_${"3".repeat(32)}`,
      baseRevision: 0,
    });
    state = clippingSessionReducer(state, {
      type: "AI_PROPOSAL_FAILED",
      failure,
    });
    expect(state.stage === "editor" && state.editor.proposal.status).toBe(
      "failed",
    );

    state = clippingSessionReducer(editorState(), {
      type: "AI_PROPOSAL_REQUESTED",
      requestId: `req_${"4".repeat(32)}`,
      baseRevision: 0,
    });
    state = clippingSessionReducer(state, {
      type: "AI_PROPOSAL_RECEIVED",
      proposal: proposal(0),
      proposedManifest: { ...manifest, revision: 1 },
      changedFields: ["headline"],
    });
    state = clippingSessionReducer(state, { type: "DISMISS_PROPOSAL" });
    expect(state.stage === "editor" && state.editor.proposal.status).toBe(
      "idle",
    );

    state = editorState();
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 1_500,
      panel: "captions",
    });
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_FAILED",
      failure,
    });
    expect(state.stage === "editor" && state.editor.playback.status).toBe(
      "failed",
    );
    state = clippingSessionReducer(editorState(), {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 500,
      panel: "transcript",
    });
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_UPDATED",
      currentTimeMs: 2_000,
      panel: "captions",
    });
    expect(state.stage === "editor" && state.editor.playback).toMatchObject({
      status: "succeeded",
      currentTimeMs: 2_000,
      panel: "captions",
    });
    state = clippingSessionReducer(editorState(), {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 1_500,
      panel: "visuals",
    });
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_CANCEL_REQUESTED",
    });
    expect(state.stage === "editor" && state.editor.playback.status).toBe(
      "cancel-requested",
    );

    state = clippingSessionReducer(editorState(), { type: "RENDER_REVIEW" });
    state = clippingSessionReducer(state, { type: "BACK_TO_EDIT" });
    expect(state.stage).toBe("editor");
    state = clippingSessionReducer(state, { type: "SESSION_EXPIRED" });
    expect(state.stage).toBe("expired");

    state = clippingSessionReducer(editorState(), { type: "CLEAR" });
    state = clippingSessionReducer(state, {
      type: "CLEAR_PARTIAL",
      failure,
    });
    expect(state).toMatchObject({
      stage: "cleanup-partial",
      cleanup: { status: "failed" },
    });
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

  it("derives labels, actions, blockers, progress, and clearability", () => {
    const state = {
      ...editorState(),
      assembly: null,
    };
    expect(selectStageTitle(state)).toBe("Refine the clip");
    expect(selectAvailableActions(state)).toEqual([
      "edit",
      "review-render",
      "clear",
    ]);
    expect(selectBlockers(state)).toEqual(["assembly-refresh-required"]);
    expect(selectProgress(state)).toBe(75);
    expect(selectIsClearable(state)).toBe(true);
  });
});
