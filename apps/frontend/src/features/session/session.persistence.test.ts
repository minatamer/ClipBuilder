import {
  sessionResponseSchema,
  type SessionResponse,
} from "@clipbuilder/contracts";
import { describe, expect, it, vi } from "vitest";

import { SessionEffectRegistry } from "./session.effects";
import {
  MAX_SESSION_PROJECTION_BYTES,
  SESSION_PROJECTION_KEY,
  clearSessionProjection,
  parseSessionProjection,
  projectSessionState,
  readSessionProjection,
  serializeSessionProjection,
  shouldClearSessionProjectionForState,
  writeSessionProjection,
  type ClippingSessionProjectionV1,
  type SessionStoragePort,
} from "./session.persistence";
import {
  reconcileSessionProjection,
  restoreEvidenceUnavailableFailure,
} from "./session.reconciliation";
import { clippingSessionReducer } from "./session.reducer";
import { selectAvailableActions, selectBlockers } from "./session.selectors";
import {
  analysis,
  assembly,
  failure,
  identity,
  media,
  operation,
  reviewSession,
  reviewState,
} from "./session.test-fixtures";
import {
  initialClippingSessionState,
  type ClippingSessionState,
} from "./session.types";

class MemoryStorage implements SessionStoragePort {
  readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const now = new Date("2026-09-29T10:05:00.000Z");
const availability = { sample: true, upload: true } as const;

function projection(): ClippingSessionProjectionV1 {
  const projected = projectSessionState(reviewState(), now);
  if (projected === null) throw new Error("Expected a clip-review projection.");
  return projected;
}

function evidence(overrides: Partial<SessionResponse> = {}): SessionResponse {
  return sessionResponseSchema.parse({
    sessionId: identity.sessionId,
    mode: identity.mode,
    accessState: "active" as const,
    expiresAt: identity.expiresAt,
    provenStage: "clip-review" as const,
    analysisId: analysis.analysisId,
    analysisRevision: analysis.revision,
    assemblyId: assembly.assemblyId,
    assemblyRevision: assembly.revision,
    manifestId: assembly.manifestId,
    manifestHash: assembly.manifestHash,
    renderId: null,
    outputAvailable: false,
    media,
    activeOperation: null,
    remaining: { analysisRetries: 1, renderAttempts: 1 },
    ...overrides,
  });
}

function inFlightFailure(kind: "analysis" | "assembly" | "render") {
  const queued = operation(kind);
  const snapshot = {
    analysisId: analysis.analysisId,
    revision: analysis.revision,
    bundle: analysis,
  };
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
        ? {
            stage: "assembling",
            identity,
            operation: queued,
            lastKnown: {
              analysis: snapshot,
              selectedId: analysis.candidates[0]!.id,
              startWordId: assembly.selectedStartWordId,
              endWordId: assembly.selectedEndWordId,
            },
            diagnosticCode: null,
          }
        : {
            stage: "rendering",
            identity,
            operation: queued,
            lastKnown: {
              analysis: snapshot,
              assembly,
              review: reviewSession(),
            },
            diagnosticCode: null,
          };
  const projected = projectSessionState(state, now);
  if (projected === null) throw new Error("Expected an in-flight projection.");
  return {
    projection: projected,
    evidence: evidence({
      provenStage:
        kind === "analysis"
          ? "media-inspected"
          : kind === "assembly"
            ? "candidates"
            : "clip-review",
      analysisId: kind === "analysis" ? null : analysis.analysisId,
      analysisRevision: kind === "analysis" ? null : analysis.revision,
      assemblyId: kind === "render" ? assembly.assemblyId : null,
      assemblyRevision: kind === "render" ? assembly.revision : null,
      manifestId: kind === "render" ? assembly.manifestId : null,
      manifestHash: kind === "render" ? assembly.manifestHash : null,
      activeOperation: {
        ...queued,
        state: "failed",
        stageCode: `${kind}.complete`,
        startedAt: now.toISOString(),
        updatedAt: now.toISOString(),
        completedAt: now.toISOString(),
        error: failure,
      },
    }),
  };
}

describe("allow-listed session projection", () => {
  it("round-trips content-free review references without a manifest body", () => {
    const storage = new MemoryStorage();
    const value = projection();
    writeSessionProjection(storage, value);

    expect(readSessionProjection(storage, now)).toEqual({
      status: "valid",
      projection: value,
    });
    const serialized = storage.getItem(SESSION_PROJECTION_KEY)!;
    expect(serialized).toContain(assembly.manifestHash);
    expect(serialized).not.toContain("clean-emphasis");
    expect(serialized).not.toContain("compositionManifest");
    clearSessionProjection(storage);
    expect(storage.getItem(SESSION_PROJECTION_KEY)).toBeNull();
  });

  it.each([
    ["empty", null, "empty"],
    ["corrupt", "{not-json", "corrupt"],
    [
      "unknown version",
      JSON.stringify({ ...projection(), version: 2 }),
      "unknown-version",
    ],
    [
      "expired",
      JSON.stringify({
        ...projection(),
        expiresAt: "2026-09-29T09:00:00.000Z",
      }),
      "expired",
    ],
    ["oversized", "x".repeat(MAX_SESSION_PROJECTION_BYTES + 1), "oversized"],
  ])("handles %s storage", (_name, serialized, expected) => {
    const storage = new MemoryStorage();
    if (serialized !== null)
      storage.setItem(SESSION_PROJECTION_KEY, serialized);
    expect(readSessionProjection(storage, now).status).toBe(expected);
  });

  it("rejects unknown fields and the forbidden sentinel matrix", () => {
    const value = projection();
    const sentinels = [
      "filename",
      "blob",
      "url",
      "cookie",
      "grant",
      "token",
      "provider",
      "stack",
      "controller",
      "timer",
      "listener",
      "track",
      "transcript",
      "media",
      "manifestBody",
    ];
    for (const key of sentinels) {
      expect(
        parseSessionProjection({ ...value, [key]: "sentinel" }),
      ).toBeNull();
    }

    const state = reviewState() as ReturnType<typeof reviewState> &
      Record<string, unknown>;
    state.filename = "private-source.mp4";
    state.token = "secret";
    state.objectUrl = "blob:private";
    state.transcript = { words: ["private transcript sentinel"] };
    state.rationale = "private rationale sentinel";
    const serialized = JSON.stringify(projectSessionState(state, now));
    expect(serialized).not.toContain("private-source");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("blob:private");
    expect(serialized).not.toContain("private transcript sentinel");
    expect(serialized).not.toContain("private rationale sentinel");
  });

  it("enforces the 256 KiB hard ceiling before schema parsing", () => {
    const value = projection() as ClippingSessionProjectionV1 & {
      oversized?: string;
    };
    value.oversized = "x".repeat(MAX_SESSION_PROJECTION_BYTES);
    expect(() => serializeSessionProjection(value)).toThrow(
      "Session projection exceeds the storage limit.",
    );
  });

  it("preserves a valid projection while restore evidence is unavailable", () => {
    const outage = restoreEvidenceUnavailableFailure();
    expect(outage).toMatchObject({
      code: "INTERNAL_ERROR",
      retryable: true,
      ruleId: "restore.evidence-unavailable",
    });
    expect(
      shouldClearSessionProjectionForState({
        stage: "fatal",
        failure: outage,
        diagnosticCode: null,
      }),
    ).toBe(false);
    expect(
      shouldClearSessionProjectionForState({
        stage: "fatal",
        failure: { ...failure, retryable: false },
        diagnosticCode: null,
      }),
    ).toBe(true);
  });
});

describe("restore reconciliation", () => {
  it.each(["analysis", "assembly", "render"] as const)(
    "restores %s failure after an in-flight save without clearing reusable state",
    (kind) => {
      const saved = inFlightFailure(kind);
      const storage = new MemoryStorage();
      const remove = vi.spyOn(storage, "removeItem");
      writeSessionProjection(storage, saved.projection);
      const read = readSessionProjection(storage, now);
      expect(read.status).toBe("valid");
      if (read.status !== "valid") throw new Error("Expected valid storage.");
      const result = reconcileSessionProjection(
        read.projection,
        saved.evidence,
        now,
        availability,
      );
      expect(result).toMatchObject({
        status: "restored",
        state: {
          stage: `${kind}-failed`,
          failure,
          identity: { remaining: saved.evidence.remaining },
        },
      });
      if (result.status !== "restored")
        throw new Error("Expected correlated failure recovery.");
      let restored = clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_VALID",
        state: result.state,
      });
      expect(shouldClearSessionProjectionForState(restored)).toBe(false);
      const recovered = projectSessionState(restored, now);
      if (recovered === null)
        throw new Error("Expected a recovery projection.");
      writeSessionProjection(storage, recovered);
      expect(remove).not.toHaveBeenCalled();
      expect(readSessionProjection(storage, now)).toEqual({
        status: "valid",
        projection: recovered,
      });
      expect(recovered).toMatchObject({
        stageHint: `${kind}-failed`,
        analysis: saved.projection.analysis,
        selection: saved.projection.selection,
        assembly: saved.projection.assembly,
        review: saved.projection.review,
      });
      const serialized = storage.getItem(SESSION_PROJECTION_KEY)!;
      for (const forbidden of ["remaining", "failure", "error", "transcript"])
        expect(serialized).not.toContain(`"${forbidden}"`);

      if (kind === "assembly") {
        expect(selectAvailableActions(restored)).toEqual([
          "choose-another",
          "clear",
        ]);
        restored = clippingSessionReducer(restored, {
          type: "ANALYSIS_REFRESHED",
          sessionId: identity.sessionId,
          analysis,
        });
      }
      expect(selectAvailableActions(restored)).toContain(`retry-${kind}`);
      const retried = clippingSessionReducer(
        restored,
        kind === "analysis"
          ? { type: "RETRY_ANALYSIS", operation: operation(kind) }
          : kind === "assembly"
            ? { type: "RETRY_ASSEMBLY", operation: operation(kind) }
            : { type: "RETRY_RENDER", operation: operation(kind) },
      );
      expect(retried).toMatchObject({
        stage:
          kind === "analysis"
            ? "analyzing"
            : kind === "assembly"
              ? "assembling"
              : "rendering",
        diagnosticCode: null,
      });
    },
  );

  it.each(["analysis", "assembly", "render"] as const)(
    "does not relax %s failure correlation, artifact, stale, or expiry checks",
    (kind) => {
      const saved = inFlightFailure(kind);
      const failedOperation = saved.evidence.activeOperation;
      if (failedOperation === null)
        throw new Error("Expected failed evidence.");
      const conflicts: SessionResponse[] = [
        evidence({ ...saved.evidence, activeOperation: null }),
        evidence({ ...saved.evidence, activeOperation: operation(kind) }),
        evidence({
          ...saved.evidence,
          activeOperation: {
            ...failedOperation,
            operationId: `op_${"x".repeat(22)}`,
          },
        }),
        evidence({
          ...saved.evidence,
          activeOperation: {
            ...failedOperation,
            kind: kind === "analysis" ? "assembly" : "analysis",
          },
        }),
        evidence({
          ...saved.evidence,
          activeOperation: {
            ...failedOperation,
            state: "succeeded",
            resultRevision: analysis.revision,
            error: null,
          },
        }),
        evidence({
          ...saved.evidence,
          activeOperation: {
            ...failedOperation,
            state: "cancelled",
            error: null,
          },
        }),
        evidence({
          ...saved.evidence,
          provenStage:
            kind === "analysis"
              ? "uploaded"
              : kind === "assembly"
                ? "media-inspected"
                : "candidates",
        }),
      ];
      if (kind === "analysis") {
        conflicts.push(evidence({ ...saved.evidence, media: null }));
      } else {
        conflicts.push(
          evidence({ ...saved.evidence, analysisId: `ana_${"x".repeat(22)}` }),
          evidence({
            ...saved.evidence,
            analysisRevision: `rev_${"x".repeat(22)}`,
          }),
        );
      }
      if (kind === "render") {
        conflicts.push(
          evidence({ ...saved.evidence, assemblyId: `asm_${"x".repeat(22)}` }),
          evidence({
            ...saved.evidence,
            assemblyRevision: `rev_${"x".repeat(22)}`,
          }),
          evidence({ ...saved.evidence, manifestId: `man_${"x".repeat(22)}` }),
          evidence({ ...saved.evidence, manifestHash: "3".repeat(64) }),
        );
      }
      for (const conflicting of conflicts) {
        expect(
          reconcileSessionProjection(
            saved.projection,
            conflicting,
            now,
            availability,
          ),
        ).toMatchObject({
          status: "server-conflict",
          failure: { ruleId: "restore.server-conflict" },
        });
      }
      expect(
        reconcileSessionProjection(
          { ...saved.projection, operation: null },
          saved.evidence,
          now,
          availability,
        ).status,
      ).toBe("server-conflict");
      expect(
        reconcileSessionProjection(
          { ...saved.projection, savedAt: "2026-09-29T09:00:00.000Z" },
          saved.evidence,
          now,
          availability,
        ).status,
      ).toBe("stale");
      expect(
        reconcileSessionProjection(
          saved.projection,
          evidence({ ...saved.evidence, accessState: "expired" }),
          now,
          availability,
        ).status,
      ).toBe("expired");
    },
  );

  it.each(["analysis", "assembly", "render"] as const)(
    "restores %s failure without regaining disallowed retry readiness",
    (kind) => {
      const saved = inFlightFailure(kind);
      const failedOperation = saved.evidence.activeOperation;
      if (failedOperation === null)
        throw new Error("Expected failed evidence.");
      for (const { retryable, remaining } of [
        {
          retryable: true,
          remaining: { analysisRetries: 0, renderAttempts: 0 },
        },
        { retryable: false, remaining: identity.remaining },
        {
          retryable: false,
          remaining: { analysisRetries: 0, renderAttempts: 0 },
        },
      ]) {
        const result = reconcileSessionProjection(
          saved.projection,
          evidence({
            ...saved.evidence,
            activeOperation: {
              ...failedOperation,
              error: { ...failure, retryable },
            },
            remaining,
          }),
          now,
          availability,
        );
        expect(result).toMatchObject({
          status: "restored",
          state: { stage: `${kind}-failed` },
        });
        if (result.status !== "restored")
          throw new Error("Expected restored failure.");
        const restored =
          kind === "assembly"
            ? clippingSessionReducer(result.state, {
                type: "ANALYSIS_REFRESHED",
                sessionId: identity.sessionId,
                analysis,
              })
            : result.state;
        if (kind === "assembly" && retryable) {
          expect(selectAvailableActions(restored)).toContain("retry-assembly");
          continue;
        }
        expect(selectAvailableActions(restored)).not.toContain(`retry-${kind}`);
        expect(
          clippingSessionReducer(
            restored,
            kind === "analysis"
              ? { type: "RETRY_ANALYSIS", operation: operation(kind) }
              : kind === "assembly"
                ? { type: "RETRY_ASSEMBLY", operation: operation(kind) }
                : { type: "RETRY_RENDER", operation: operation(kind) },
          ).diagnosticCode,
        ).toBe("invalid-transition");
      }
    },
  );

  it("restores server-proven review references and resumes the render flow", () => {
    const result = reconcileSessionProjection(
      projection(),
      evidence(),
      now,
      availability,
    );
    expect(result).toMatchObject({
      status: "restored",
      state: { stage: "clip-review", assembly: null },
    });
    if (result.status === "restored" && result.state.stage === "clip-review") {
      expect(result.state.analysis.bundle).toBeNull();
      expect(result.state.review.manifestReference.manifestHash).toBe(
        assembly.manifestHash,
      );
      expect(selectAvailableActions(result.state)).toContain("review-render");
      expect(selectBlockers(result.state)).toEqual([]);

      const restored = clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_VALID",
        state: result.state,
      });
      expect(
        clippingSessionReducer(restored, { type: "RENDER_REVIEW" }).stage,
      ).toBe("render-confirmation");
    }
  });

  it("keeps restored render failure blocked without server retry evidence", () => {
    const review = reviewState();
    if (review.stage !== "clip-review") {
      throw new Error("Expected the review fixture to be at clip review.");
    }
    const failedState: ClippingSessionState = {
      ...review,
      stage: "render-failed",
      failure,
    };
    const failedProjection = projectSessionState(failedState, now);
    if (failedProjection === null) {
      throw new Error("Expected a render-failed projection.");
    }

    const result = reconcileSessionProjection(
      failedProjection,
      evidence(),
      now,
      availability,
    );
    expect(result).toMatchObject({
      status: "restored",
      state: { stage: "render-failed", assembly: null },
    });
    if (result.status === "restored") {
      const restored = clippingSessionReducer(initialClippingSessionState, {
        type: "RESTORE_VALID",
        state: result.state,
      });
      expect(selectAvailableActions(restored)).toEqual(["clear"]);
      expect(
        clippingSessionReducer(restored, { type: "RENDER_REVIEW" })
          .diagnosticCode,
      ).toBe("invalid-transition");
    }
  });

  it("discards stale, expired, missing, and conflicting server evidence", () => {
    expect(
      reconcileSessionProjection(
        { ...projection(), savedAt: "2026-09-29T09:00:00.000Z" },
        evidence(),
        now,
        availability,
      ),
    ).toMatchObject({ status: "stale" });
    expect(
      reconcileSessionProjection(
        projection(),
        evidence({ accessState: "expired" as const }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "expired" });
    expect(
      reconcileSessionProjection(projection(), null, now, availability),
    ).toMatchObject({ status: "server-conflict" });
    expect(
      reconcileSessionProjection(
        projection(),
        evidence({ assemblyRevision: `rev_${"x".repeat(22)}` }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "server-conflict" });
    expect(
      reconcileSessionProjection(
        projection(),
        evidence({ manifestId: `man_${"x".repeat(22)}` }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "server-conflict" });
    expect(
      reconcileSessionProjection(
        projection(),
        evidence({ manifestHash: "3".repeat(64) }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "server-conflict" });

    const candidateProjection = projectSessionState(
      {
        stage: "candidates",
        identity,
        analysis: {
          analysisId: analysis.analysisId,
          revision: analysis.revision,
          bundle: analysis,
        },
        selectedId: null,
        diagnosticCode: null,
      },
      now,
    )!;
    expect(
      reconcileSessionProjection(
        candidateProjection,
        evidence({
          provenStage: "analyzing",
          assemblyId: null,
          assemblyRevision: null,
          manifestId: null,
          manifestHash: null,
          activeOperation: operation("analysis", "analysis.queued", "b"),
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "server-conflict" });
  });

  it("reconciles in-flight analysis, assembly, render, and upload rollback", () => {
    const analysisOperation = operation("analysis");
    const analysisProjection = projectSessionState(
      {
        stage: "analyzing",
        identity,
        operation: analysisOperation,
        lastKnown: { media },
        diagnosticCode: null,
      },
      now,
    )!;
    expect(
      reconcileSessionProjection(
        analysisProjection,
        evidence({
          provenStage: "analyzing" as const,
          analysisId: null,
          analysisRevision: null,
          assemblyId: null,
          assemblyRevision: null,
          manifestId: null,
          manifestHash: null,
          activeOperation: analysisOperation,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "restored", state: { stage: "analyzing" } });
    const completedAnalysis = reconcileSessionProjection(
      analysisProjection,
      evidence({
        provenStage: "candidates",
        assemblyId: null,
        assemblyRevision: null,
        manifestId: null,
        manifestHash: null,
        activeOperation: null,
      }),
      now,
      availability,
    );
    expect(completedAnalysis).toMatchObject({
      status: "restored",
      state: {
        stage: "candidates",
        analysis: { bundle: null },
      },
    });
    if (
      completedAnalysis.status === "restored" &&
      completedAnalysis.state.stage === "candidates"
    ) {
      expect(selectBlockers(completedAnalysis.state)).toEqual([
        "analysis-refresh-required",
      ]);
    }

    const assemblyOperation = operation("assembly");
    const assemblyProjection = projectSessionState(
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
      now,
    )!;
    expect(
      reconcileSessionProjection(
        assemblyProjection,
        evidence({
          provenStage: "assembling" as const,
          assemblyId: null,
          assemblyRevision: null,
          manifestId: null,
          manifestHash: null,
          activeOperation: assemblyOperation,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "restored", state: { stage: "assembling" } });
    const completedAssembly = reconcileSessionProjection(
      assemblyProjection,
      evidence({ activeOperation: null }),
      now,
      availability,
    );
    expect(completedAssembly).toMatchObject({
      status: "restored",
      state: {
        stage: "clip-review",
        assembly: null,
        review: {
          manifestReference: { manifestHash: assembly.manifestHash },
        },
      },
    });
    if (
      completedAssembly.status === "restored" &&
      completedAssembly.state.stage === "clip-review"
    ) {
      expect(selectAvailableActions(completedAssembly.state)).toContain(
        "review-render",
      );
    }

    const renderOperation = operation("render");
    const renderProjection = projectSessionState(
      {
        stage: "rendering",
        identity,
        operation: renderOperation,
        lastKnown: {
          analysis: {
            analysisId: analysis.analysisId,
            revision: analysis.revision,
            bundle: analysis,
          },
          assembly,
          review: reviewSession(),
        },
        diagnosticCode: null,
      },
      now,
    )!;
    expect(
      reconcileSessionProjection(
        renderProjection,
        evidence({
          provenStage: "rendering" as const,
          activeOperation: renderOperation,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "restored", state: { stage: "rendering" } });
    const serverRenderId = `rnd_${"s".repeat(22)}`;
    const completedRender = reconcileSessionProjection(
      renderProjection,
      evidence({
        provenStage: "result",
        activeOperation: null,
        renderId: serverRenderId,
        outputAvailable: true,
      }),
      now,
      availability,
    );
    expect(completedRender).toMatchObject({
      status: "restored",
      state: {
        stage: "result",
        result: { renderId: serverRenderId, outputAvailable: true },
        clipSummary: { manifestHash: assembly.manifestHash },
      },
    });

    const uploadingProjection = projectSessionState(
      {
        stage: "uploading",
        identity: { ...identity, mode: "upload" },
        localSource: {
          sourceId: "local-only",
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
      now,
    )!;
    expect(
      reconcileSessionProjection(
        uploadingProjection,
        evidence({
          mode: "upload" as const,
          provenStage: "upload-authorized" as const,
          analysisId: null,
          analysisRevision: null,
          assemblyId: null,
          assemblyRevision: null,
          manifestId: null,
          manifestHash: null,
          media: null,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "restored", state: { stage: "intake" } });
  });
});

describe("session effect ownership", () => {
  it("stops and unregisters an effect exactly once through its cleanup", () => {
    const stop = vi.fn();
    const effects = new SessionEffectRegistry();
    const cleanup = effects.registerStopper(stop);

    cleanup();
    cleanup();
    effects.clear();

    expect(stop).toHaveBeenCalledOnce();
    expect(effects.ownedEffectCount).toBe(0);
  });

  it("clears object URLs and registered polling/abort cleanup", () => {
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const stop = vi.fn();
    const effects = new SessionEffectRegistry();
    effects.registerObjectUrl("blob:fixture");
    effects.registerStopper(stop);
    expect(effects.ownedEffectCount).toBe(2);

    effects.clear();
    expect(stop).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith("blob:fixture");
    expect(effects.ownedEffectCount).toBe(0);
  });
});
