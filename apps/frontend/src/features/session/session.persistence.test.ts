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
import {
  analysis,
  assembly,
  editorSession,
  editorState,
  failure,
  identity,
  media,
  operation,
} from "./session.test-fixtures";

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
  const projected = projectSessionState(editorState(), now);
  if (projected === null) throw new Error("Expected an editor projection.");
  return projected;
}

function evidence(overrides: Partial<SessionResponse> = {}): SessionResponse {
  return sessionResponseSchema.parse({
    sessionId: identity.sessionId,
    mode: identity.mode,
    accessState: "active" as const,
    expiresAt: identity.expiresAt,
    provenStage: "editor" as const,
    analysisId: analysis.analysisId,
    analysisRevision: analysis.revision,
    assemblyId: assembly.assemblyId,
    assemblyRevision: assembly.revision,
    renderId: null,
    outputAvailable: false,
    media,
    activeOperation: null,
    remaining: {
      analysisRetries: 1,
      assistantProposals: 3,
      renderAttempts: 1,
    },
    ...overrides,
  });
}

describe("allow-listed session projection", () => {
  it("round-trips a valid bounded projection", () => {
    const storage = new MemoryStorage();
    const value = projection();
    writeSessionProjection(storage, value);

    expect(readSessionProjection(storage, now)).toEqual({
      status: "valid",
      projection: value,
    });
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
    ];
    for (const key of sentinels) {
      expect(
        parseSessionProjection({ ...value, [key]: "sentinel" }),
      ).toBeNull();
    }

    const state = editorState() as typeof editorState extends () => infer T
      ? T & Record<string, unknown>
      : never;
    state.filename = "private-source.mp4";
    state.token = "secret";
    state.objectUrl = "blob:private";
    state.transcript = { words: ["private transcript sentinel"] };
    state.rationale = "private rationale sentinel";
    const projected = projectSessionState(state, now);
    const serialized = JSON.stringify(projected);
    expect(serialized).not.toContain("private-source");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("blob:private");
    expect(serialized).not.toContain("private transcript sentinel");
    expect(serialized).not.toContain("private rationale sentinel");
  });

  it("enforces the 256 KiB hard ceiling before storage", () => {
    const value = projection();
    value.editor!.manifest.headline.text = "x".repeat(
      MAX_SESSION_PROJECTION_BYTES,
    );
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
  it("restores valid editor evidence without content-heavy analysis", () => {
    const result = reconcileSessionProjection(
      projection(),
      evidence(),
      now,
      availability,
    );
    expect(result).toMatchObject({
      status: "restored",
      state: { stage: "editor", assembly: null },
    });
    if (result.status === "restored" && result.state.stage === "editor") {
      expect(result.state.analysis.bundle).toBeNull();
    }
  });

  it("discards stale, expired, missing, and conflicting server evidence", () => {
    const stale = {
      ...projection(),
      savedAt: "2026-09-29T09:00:00.000Z",
    };
    expect(
      reconcileSessionProjection(stale, evidence(), now, availability),
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
  });

  it("reconciles in-flight analysis, assembly, render, and upload rollback", () => {
    const analysisOperation = operation("analysis");
    const analysisState = {
      stage: "analyzing" as const,
      identity,
      operation: analysisOperation,
      lastKnown: { media },
      diagnosticCode: null,
    };
    const analysisProjection = projectSessionState(analysisState, now)!;
    expect(analysisProjection.operation).toEqual({
      operationId: analysisOperation.operationId,
    });
    expect(
      reconcileSessionProjection(
        analysisProjection,
        evidence({
          provenStage: "analyzing" as const,
          analysisId: null,
          analysisRevision: null,
          assemblyId: null,
          assemblyRevision: null,
          activeOperation: analysisOperation,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "restored", state: { stage: "analyzing" } });
    expect(
      reconcileSessionProjection(
        analysisProjection,
        evidence({
          provenStage: "analyzing" as const,
          analysisId: null,
          analysisRevision: null,
          assemblyId: null,
          assemblyRevision: null,
          activeOperation: null,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "server-conflict" });
    expect(
      reconcileSessionProjection(
        analysisProjection,
        evidence({
          provenStage: "candidates" as const,
          assemblyId: null,
          assemblyRevision: null,
          activeOperation: null,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "stale" });

    const assemblyOperation = operation("assembly");
    const assemblingState = {
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
    const assemblyProjection = projectSessionState(assemblingState, now)!;
    expect(
      reconcileSessionProjection(
        assemblyProjection,
        evidence({
          provenStage: "assembling" as const,
          assemblyId: null,
          assemblyRevision: null,
          activeOperation: assemblyOperation,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "restored", state: { stage: "assembling" } });

    const renderOperation = operation("render");
    const renderingState = {
      stage: "rendering" as const,
      identity,
      operation: renderOperation,
      lastKnown: {
        analysis: {
          analysisId: analysis.analysisId,
          revision: analysis.revision,
          bundle: analysis,
        },
        assembly,
        editor: editorSession(),
      },
      diagnosticCode: null,
    };
    const renderProjection = projectSessionState(renderingState, now)!;
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
          media: null,
        }),
        now,
        availability,
      ),
    ).toMatchObject({ status: "restored", state: { stage: "intake" } });
  });
});

describe("session effect ownership", () => {
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
