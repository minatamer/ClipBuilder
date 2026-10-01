import {
  analysisBundleSchema,
  operationStatusSchema,
  sessionResponseSchema,
  type OperationStatusV1,
} from "@clipbuilder/contracts";
import { describe, expect, it } from "vitest";

import { projectSessionState } from "./session.persistence";
import { reconcileSessionProjection } from "./session.reconciliation";
import { clippingSessionReducer } from "./session.reducer";
import { selectAvailableActions } from "./session.selectors";
import {
  analysis,
  assembly,
  failure,
  identity,
  media,
  operation,
  reviewState,
} from "./session.test-fixtures";
import type { ClippingSessionState } from "./session.types";

const now = new Date("2026-09-29T10:05:00.000Z");
const availability = { sample: true, upload: true };

function candidatesState(): Extract<
  ClippingSessionState,
  { stage: "candidates" }
> {
  return {
    stage: "candidates",
    identity,
    analysis: {
      analysisId: analysis.analysisId,
      revision: analysis.revision,
      bundle: analysis,
    },
    selectedId: analysis.candidates[0]!.id,
    diagnosticCode: null,
  };
}

function restore(
  state: ClippingSessionState,
  provenStage: "candidates" | "clip-review" | "media-inspected",
  renderAttempts = 1,
  activeOperation: OperationStatusV1 | null = null,
  analysisRetries = 0,
) {
  const projection = projectSessionState(state, now);
  if (projection === null) throw new Error("Expected a projection.");
  const result = reconcileSessionProjection(
    projection,
    sessionResponseSchema.parse({
      ...identity,
      accessState: "active",
      provenStage,
      media,
      activeOperation,
      analysisId: analysis.analysisId,
      analysisRevision: analysis.revision,
      assemblyId: provenStage === "clip-review" ? assembly.assemblyId : null,
      assemblyRevision:
        provenStage === "clip-review" ? assembly.revision : null,
      manifestId: provenStage === "clip-review" ? assembly.manifestId : null,
      manifestHash:
        provenStage === "clip-review" ? assembly.manifestHash : null,
      renderId: null,
      outputAvailable: false,
      remaining: { analysisRetries, renderAttempts },
    }),
    now,
    availability,
  );
  if (result.status !== "restored")
    throw new Error("Expected a restored session.");
  return result.state;
}

function assemblingState(): Extract<
  ClippingSessionState,
  { stage: "assembling" }
> {
  const state = clippingSessionReducer(candidatesState(), {
    type: "BUILD_SELECTED",
    operation: operation("assembly"),
    startWordId: assembly.selectedStartWordId,
    endWordId: assembly.selectedEndWordId,
  });
  if (state.stage !== "assembling")
    throw new Error("Expected an assembly operation.");
  return state;
}

function terminal(
  operation: OperationStatusV1,
  state: "succeeded" | "failed",
  revision = analysis.revision,
) {
  return operationStatusSchema.parse({
    ...operation,
    state,
    stageCode: `${operation.kind}.complete`,
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    completedAt: now.toISOString(),
    resultRevision: state === "succeeded" ? revision : null,
    error: state === "failed" ? failure : null,
  });
}

describe("CL-003 independent validation regressions", () => {
  it("hydrates restored candidates before selecting and building without a new analysis", () => {
    const restored = restore(candidatesState(), "candidates");
    const hydrated = clippingSessionReducer(restored, {
      type: "ANALYSIS_REFRESHED",
      sessionId: identity.sessionId,
      analysis,
    });
    expect(hydrated).toMatchObject({
      diagnosticCode: null,
      analysis: { bundle: analysis },
    });
    const selected = clippingSessionReducer(hydrated, {
      type: "CANDIDATE_SELECTED",
      candidateId: analysis.candidates[0]!.id,
    });
    expect(
      clippingSessionReducer(selected, {
        type: "BUILD_SELECTED",
        operation: operation("assembly"),
        startWordId: assembly.selectedStartWordId,
        endWordId: assembly.selectedEndWordId,
      }).stage,
    ).toBe("assembling");
    expect(JSON.stringify(projectSessionState(hydrated, now))).not.toContain(
      "transcript",
    );
  });

  it("rejects foreign, stale, invalid, duplicate, and late analysis refreshes", () => {
    const restored = restore(candidatesState(), "candidates");
    for (const event of [
      {
        type: "ANALYSIS_REFRESHED" as const,
        sessionId: `ses_${"x".repeat(22)}`,
        analysis,
      },
      {
        type: "ANALYSIS_REFRESHED" as const,
        sessionId: identity.sessionId,
        analysis: { ...analysis, revision: `rev_${"x".repeat(22)}` },
      },
      {
        type: "ANALYSIS_REFRESHED" as const,
        sessionId: identity.sessionId,
        analysis: { ...analysis, analysisId: `ana_${"x".repeat(22)}` },
      },
      {
        type: "ANALYSIS_REFRESHED" as const,
        sessionId: identity.sessionId,
        analysis: { ...analysis, candidates: [] },
      },
    ])
      expect(clippingSessionReducer(restored, event).diagnosticCode).toBe(
        "invalid-transition",
      );
    const event = {
      type: "ANALYSIS_REFRESHED" as const,
      sessionId: identity.sessionId,
      analysis,
    };
    const hydrated = clippingSessionReducer(restored, event);
    expect(clippingSessionReducer(hydrated, event).diagnosticCode).toBe(
      "invalid-transition",
    );
    expect(
      clippingSessionReducer(
        clippingSessionReducer(restored, { type: "CLEAR" }),
        event,
      ).stage,
    ).toBe("clearing");
    expect(
      clippingSessionReducer(
        clippingSessionReducer(restored, { type: "SESSION_EXPIRED" }),
        event,
      ).stage,
    ).toBe("expired");
  });

  it("resolves a restored candidate hint to an honest no-candidate result", () => {
    const empty = analysisBundleSchema.parse({
      ...analysis,
      candidates: [],
      outcome: "no-strong-candidates",
    });
    const hydrated = clippingSessionReducer(
      restore(candidatesState(), "candidates"),
      {
        type: "ANALYSIS_REFRESHED",
        sessionId: identity.sessionId,
        analysis: empty,
      },
    );
    expect(hydrated.stage).toBe("no-candidates");
    expect(selectAvailableActions(hydrated)).toEqual(["clear"]);
  });

  it.each(["analysis", "assembly", "render"] as const)(
    "accepts skipped running observations for %s",
    (kind) => {
      const queued = operationStatusSchema.parse({
        ...operation(kind),
        state: "queued",
        startedAt: null,
      });
      let state: ClippingSessionState =
        kind === "analysis"
          ? {
              stage: "analyzing",
              identity,
              operation: queued,
              lastKnown: { media },
              diagnosticCode: null,
            }
          : kind === "assembly"
            ? { ...assemblingState(), operation: queued }
            : clippingSessionReducer(
                clippingSessionReducer(reviewState(), {
                  type: "RENDER_REVIEW",
                }),
                { type: "RENDER_CONFIRMED", operation: queued },
              );
      const succeeded = operationStatusSchema.parse({
        ...queued,
        state: "succeeded",
        stageCode: `${kind}.complete`,
        startedAt: now.toISOString(),
        updatedAt: now.toISOString(),
        completedAt: now.toISOString(),
        resultRevision:
          kind === "analysis" ? analysis.revision : assembly.revision,
      });
      state = clippingSessionReducer(state, {
        type: "STAGE_UPDATED",
        operation: succeeded,
      });
      expect(state.diagnosticCode).toBeNull();
      expect(state).toMatchObject({ operation: succeeded });
      state =
        kind === "analysis"
          ? clippingSessionReducer(state, {
              type: "ANALYSIS_SUCCEEDED",
              operationId: queued.operationId,
              analysis,
            })
          : kind === "assembly"
            ? clippingSessionReducer(state, {
                type: "ASSEMBLY_SUCCEEDED",
                operationId: queued.operationId,
                assembly,
              })
            : clippingSessionReducer(state, {
                type: "RENDER_SUCCEEDED",
                operationId: queued.operationId,
                manifestHash: assembly.manifestHash,
                renderId: `rnd_${"r".repeat(22)}`,
              });
      expect(state.stage).toBe(
        kind === "analysis"
          ? "candidates"
          : kind === "assembly"
            ? "clip-review"
            : "result",
      );
    },
  );

  it("accepts namespaced canonical analysis progress", () => {
    const state: ClippingSessionState = {
      stage: "analyzing",
      identity,
      operation: operation("analysis", "analysis.queued"),
      lastKnown: { media },
      diagnosticCode: null,
    };
    expect(
      clippingSessionReducer(state, {
        type: "STAGE_UPDATED",
        operation: operation("analysis", "analysis.transcribing"),
      }),
    ).toMatchObject({
      diagnosticCode: null,
      operation: { stageCode: "analysis.transcribing" },
    });
  });

  it.each(["analysis", "assembly", "render"] as const)(
    "accepts direct terminal result and failure events from queued %s",
    (kind) => {
      const queued = operation(kind);
      const state: ClippingSessionState =
        kind === "analysis"
          ? {
              stage: "analyzing",
              identity,
              operation: queued,
              lastKnown: { media },
              diagnosticCode: null,
            }
          : kind === "assembly"
            ? assemblingState()
            : clippingSessionReducer(
                clippingSessionReducer(reviewState(), {
                  type: "RENDER_REVIEW",
                }),
                { type: "RENDER_CONFIRMED", operation: queued },
              );
      const succeeded =
        kind === "analysis"
          ? clippingSessionReducer(state, {
              type: "ANALYSIS_SUCCEEDED",
              operationId: queued.operationId,
              analysis,
            })
          : kind === "assembly"
            ? clippingSessionReducer(state, {
                type: "ASSEMBLY_SUCCEEDED",
                operationId: queued.operationId,
                assembly,
              })
            : clippingSessionReducer(state, {
                type: "RENDER_SUCCEEDED",
                operationId: queued.operationId,
                manifestHash: assembly.manifestHash,
                renderId: `rnd_${"r".repeat(22)}`,
              });
      expect(succeeded.stage).toBe(
        kind === "analysis"
          ? "candidates"
          : kind === "assembly"
            ? "clip-review"
            : "result",
      );
      const observed = clippingSessionReducer(state, {
        type: "STAGE_UPDATED",
        operation: terminal(queued, "failed"),
      });
      expect(observed.diagnosticCode).toBeNull();
      const failed =
        kind === "analysis"
          ? clippingSessionReducer(observed, {
              type: "ANALYSIS_FAILED",
              operationId: queued.operationId,
              failure,
              remaining: identity.remaining,
            })
          : kind === "assembly"
            ? clippingSessionReducer(observed, {
                type: "ASSEMBLY_FAILED",
                operationId: queued.operationId,
                failure,
              })
            : clippingSessionReducer(observed, {
                type: "RENDER_FAILED",
                operationId: queued.operationId,
                failure,
                remaining: identity.remaining,
              });
      expect(failed.stage).toBe(`${kind}-failed`);
    },
  );

  it("keeps cancellation requests separate from server operation evidence", () => {
    const queued = operation("analysis");
    const state: ClippingSessionState = {
      stage: "analyzing",
      identity,
      operation: queued,
      lastKnown: { media },
      diagnosticCode: null,
    };
    const requested = clippingSessionReducer(state, {
      type: "CANCEL_REQUESTED",
    });
    expect(requested).toMatchObject({
      cancelRequested: true,
      operation: queued,
    });
    expect(selectAvailableActions(requested)).toEqual(["clear"]);
    expect(
      clippingSessionReducer(requested, {
        type: "ANALYSIS_SUCCEEDED",
        operationId: queued.operationId,
        analysis,
      }).stage,
    ).toBe("candidates");
  });

  it("rejects stale snapshots, identity changes, regressions, branch changes, and terminal rewrites", () => {
    const current = operation("analysis", "analysis.normalizing-transcript");
    const state: ClippingSessionState = {
      stage: "analyzing",
      identity,
      operation: current,
      lastKnown: { media },
      diagnosticCode: null,
    };
    for (const next of [
      operation("analysis", "analysis.transcribing"),
      { ...current, operationId: `op_${"x".repeat(22)}` },
      operation("render", "render.encoding"),
      { ...current, updatedAt: "2026-09-29T09:59:59.000Z" },
      operation("analysis", "unknown.stage"),
    ]) {
      expect(
        clippingSessionReducer(state, {
          type: "STAGE_UPDATED",
          operation: next,
        }).diagnosticCode,
      ).toBe("non-monotonic-progress");
    }
    const branch = {
      ...state,
      operation: operation("analysis", "analysis.transcribing"),
    };
    expect(
      clippingSessionReducer(branch, {
        type: "STAGE_UPDATED",
        operation: operation("analysis", "analysis.reusing-transcript"),
      }).diagnosticCode,
    ).toBe("non-monotonic-progress");
    const succeeded = clippingSessionReducer(state, {
      type: "STAGE_UPDATED",
      operation: terminal(current, "succeeded"),
    });
    expect(
      clippingSessionReducer(succeeded, {
        type: "STAGE_UPDATED",
        operation: terminal(current, "failed"),
      }).diagnosticCode,
    ).toBe("non-monotonic-progress");
    expect(
      clippingSessionReducer(succeeded, {
        type: "ANALYSIS_FAILED",
        operationId: current.operationId,
        failure,
        remaining: identity.remaining,
      }).diagnosticCode,
    ).toBe("invalid-transition");
  });

  it("exposes assembly recovery commands that dispatch legal events", () => {
    const failed = clippingSessionReducer(assemblingState(), {
      type: "ASSEMBLY_FAILED",
      operationId: operation("assembly").operationId,
      failure,
    });
    expect(selectAvailableActions(failed)).toEqual([
      "retry-assembly",
      "choose-another",
      "clear",
    ]);
    expect(
      clippingSessionReducer(failed, {
        type: "RETRY_ASSEMBLY",
        operation: operation("assembly", "assembly.queued", "n"),
      }).stage,
    ).toBe("assembling");
    expect(
      clippingSessionReducer(failed, { type: "CHOOSE_ANOTHER" }).stage,
    ).toBe("candidates");
  });

  it("does not advertise analysis retry after media rejection", () => {
    const rejected = clippingSessionReducer(
      {
        stage: "media-inspecting",
        identity,
        operation: operation("media-inspection"),
        diagnosticCode: null,
      },
      { type: "MEDIA_REJECTED", failure },
    );
    expect(selectAvailableActions(rejected)).toEqual(["clear"]);
  });

  it("does not advertise or accept a nonretryable render retry", () => {
    const failed: ClippingSessionState = {
      ...reviewState(),
      stage: "render-failed",
      failure: { ...failure, retryable: false },
    };
    expect(selectAvailableActions(failed)).toEqual(["clear"]);
    expect(
      clippingSessionReducer(failed, {
        type: "RETRY_RENDER",
        operation: operation("render"),
      }).diagnosticCode,
    ).toBe("invalid-transition");
  });

  it.each(["analysis", "render"] as const)(
    "blocks exhausted and nonretryable %s recovery",
    (kind) => {
      for (const retryable of [true, false]) {
        const blockedIdentity = {
          ...identity,
          remaining: { analysisRetries: 0, renderAttempts: 0 },
        };
        const state: ClippingSessionState =
          kind === "analysis"
            ? {
                stage: "analysis-failed",
                identity: blockedIdentity,
                failure: { ...failure, retryable },
                recovery: { media },
                diagnosticCode: null,
              }
            : {
                ...reviewState(),
                stage: "render-failed",
                identity: blockedIdentity,
                failure: { ...failure, retryable },
              };
        expect(selectAvailableActions(state)).toEqual(["clear"]);
        expect(
          clippingSessionReducer(
            state,
            kind === "analysis"
              ? { type: "RETRY_ANALYSIS", operation: operation(kind) }
              : { type: "RETRY_RENDER", operation: operation(kind) },
          ).diagnosticCode,
        ).toBe("invalid-transition");
      }
    },
  );

  it("does not regain render readiness on refresh with zero server allowance", () => {
    const failed: ClippingSessionState = {
      ...reviewState(),
      stage: "render-failed",
      failure: { ...failure, retryable: false },
    };
    const restored = restore(failed, "clip-review", 0);
    expect(selectAvailableActions(restored)).toEqual(["clear"]);
    expect(
      clippingSessionReducer(restored, { type: "RENDER_REVIEW" })
        .diagnosticCode,
    ).toBe("invalid-transition");
  });

  it("restores permitted render retries only from matching terminal server evidence", () => {
    const failed: ClippingSessionState = {
      ...reviewState(),
      stage: "render-failed",
      failure,
    };
    const serverFailure = terminal(operation("render"), "failed");
    const restored = restore(failed, "clip-review", 1, serverFailure);
    expect(restored.stage).toBe("render-failed");
    expect(selectAvailableActions(restored)).toEqual(["retry-render", "clear"]);
    const retry = clippingSessionReducer(restored, {
      type: "RETRY_RENDER",
      operation: operation("render", "render.queued", "n"),
    });
    expect(retry).toMatchObject({
      stage: "rendering",
      identity: { remaining: { renderAttempts: 0 } },
    });
    expect(projectSessionState(retry, now)).not.toHaveProperty("remaining");
    expect(projectSessionState(retry, now)?.session).not.toHaveProperty(
      "remaining",
    );
    expect(
      selectAvailableActions(restore(failed, "clip-review", 0, serverFailure)),
    ).toEqual(["clear"]);
    expect(
      selectAvailableActions(
        restore(failed, "clip-review", 1, {
          ...serverFailure,
          error: { ...failure, retryable: false },
        }),
      ),
    ).toEqual(["clear"]);
  });

  it("restores analysis and assembly failure recovery without turning them into fresh admissions", () => {
    const analysisFailure: ClippingSessionState = {
      stage: "analysis-failed",
      identity,
      failure,
      recovery: { media },
      diagnosticCode: null,
    };
    const restored = restore(
      analysisFailure,
      "media-inspected",
      1,
      terminal(operation("analysis"), "failed"),
      1,
    );
    expect(selectAvailableActions(restored)).toEqual([
      "retry-analysis",
      "clear",
    ]);
    expect(
      clippingSessionReducer(restored, {
        type: "RETRY_ANALYSIS",
        operation: operation("analysis", "analysis.queued", "n"),
      }),
    ).toMatchObject({
      stage: "analyzing",
      identity: { remaining: { analysisRetries: 0 } },
    });
    expect(
      selectAvailableActions(restore(analysisFailure, "media-inspected")),
    ).toEqual(["clear"]);
    const failed = clippingSessionReducer(assemblingState(), {
      type: "ASSEMBLY_FAILED",
      operationId: operation("assembly").operationId,
      failure,
    });
    const restoredAssembly = restore(
      failed,
      "candidates",
      1,
      terminal(operation("assembly"), "failed"),
    );
    expect(selectAvailableActions(restoredAssembly)).toEqual([
      "choose-another",
      "clear",
    ]);
    const hydrated = clippingSessionReducer(restoredAssembly, {
      type: "ANALYSIS_REFRESHED",
      sessionId: identity.sessionId,
      analysis,
    });
    expect(selectAvailableActions(hydrated)).toEqual([
      "retry-assembly",
      "choose-another",
      "clear",
    ]);
    expect(
      clippingSessionReducer(hydrated, {
        type: "RETRY_ASSEMBLY",
        operation: operation("assembly", "assembly.queued", "n"),
      }).stage,
    ).toBe("assembling");
    const other = clippingSessionReducer(restoredAssembly, {
      type: "CHOOSE_ANOTHER",
    });
    expect(
      clippingSessionReducer(other, {
        type: "ANALYSIS_REFRESHED",
        sessionId: identity.sessionId,
        analysis,
      }),
    ).toMatchObject({ stage: "candidates", selectedId: null });
  });

  it("keeps exhausted review and confirmation actions blocked after refresh", () => {
    const review = restore(reviewState(), "clip-review", 0);
    expect(selectAvailableActions(review)).toEqual(["clear"]);
    expect(
      clippingSessionReducer(review, { type: "RENDER_REVIEW" }).diagnosticCode,
    ).toBe("invalid-transition");
    const confirmation = restore(
      clippingSessionReducer(reviewState(), { type: "RENDER_REVIEW" }),
      "clip-review",
      0,
    );
    expect(selectAvailableActions(confirmation)).toEqual([
      "back-to-review",
      "clear",
    ]);
    expect(
      clippingSessionReducer(confirmation, {
        type: "RENDER_CONFIRMED",
        operation: operation("render"),
      }).diagnosticCode,
    ).toBe("invalid-transition");
  });

  it("keeps continuous playback updates and the latest persisted position", () => {
    let state = clippingSessionReducer(reviewState(), {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 0,
    });
    for (const currentTimeMs of [100, 200, 50]) {
      state = clippingSessionReducer(state, {
        type: "PLAYBACK_UPDATED",
        currentTimeMs,
      });
      expect(state.diagnosticCode).toBeNull();
      expect(projectSessionState(state, now)?.review?.playbackTimeMs).toBe(
        currentTimeMs,
      );
    }
  });

  it("handles playback failure, cancellation, invalid times, and stale timeupdates", () => {
    let state = clippingSessionReducer(reviewState(), {
      type: "PLAYBACK_REQUESTED",
      currentTimeMs: 0,
    });
    state = clippingSessionReducer(state, {
      type: "PLAYBACK_UPDATED",
      currentTimeMs: 100,
    });
    for (const currentTimeMs of [-1, NaN, Infinity, 1.5]) {
      expect(
        clippingSessionReducer(state, {
          type: "PLAYBACK_UPDATED",
          currentTimeMs,
        }).diagnosticCode,
      ).toBe("invalid-transition");
    }
    const failed = clippingSessionReducer(state, {
      type: "PLAYBACK_FAILED",
      failure,
    });
    expect(failed).toMatchObject({
      review: { playback: { status: "failed", currentTimeMs: 100 } },
    });
    expect(
      clippingSessionReducer(failed, {
        type: "PLAYBACK_UPDATED",
        currentTimeMs: 200,
      }).diagnosticCode,
    ).toBe("invalid-transition");
    const cancelled = clippingSessionReducer(state, {
      type: "PLAYBACK_CANCEL_REQUESTED",
    });
    expect(
      clippingSessionReducer(cancelled, {
        type: "PLAYBACK_UPDATED",
        currentTimeMs: 200,
      }).diagnosticCode,
    ).toBe("invalid-transition");
    const cleared = clippingSessionReducer(state, { type: "CLEAR" });
    expect(
      clippingSessionReducer(cleared, {
        type: "PLAYBACK_UPDATED",
        currentTimeMs: 200,
      }).stage,
    ).toBe("clearing");
  });
});
