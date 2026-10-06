import { describe, expect, it, vi } from "vitest";
import { analysis, media, identity } from "../session/session.test-fixtures";
import { clippingSessionReducer } from "../session/session.reducer";
import type {
  ClippingSessionEvent,
  ClippingSessionState,
} from "../session/session.types";
import type { BrowserWorkspace } from "../media/browser.workspace";
import { clearAnalysisMedia, runSourceAnalysis } from "./source-analysis.flow";
import {
  createSourceAnalysisApi,
  type SourceAnalysisApi,
} from "./source-analysis.api";
import { exitClippingSession } from "../session/session.exit";
import type { CloudUploadProgress } from "./cloud-upload";
import type {
  WorkspaceRecord,
  RemoteCleanupObligation,
} from "../media/workspace.schema";
import { parseWorkspaceRecord } from "../media/workspace.schema";
import { restoreLocalWorkspace } from "../media/workspace.restore";

function cleanupWorkspace() {
  let remoteCleanup: RemoteCleanupObligation | null = null;
  return {
    get remoteCleanup() {
      return remoteCleanup;
    },
    rememberRemoteCleanup: vi.fn(async (allowMissingSession = false) => {
      remoteCleanup = {
        version: 1,
        allowMissingSession,
        status: remoteCleanup?.status ?? "pending",
      };
    }),
    confirmRemoteCleanup: vi.fn(async () => {
      if (!remoteCleanup) throw new Error("missing-cleanup");
      remoteCleanup = { ...remoteCleanup, status: "confirmed" };
    }),
    completeRemoteCleanup: vi.fn(async () => {
      remoteCleanup = null;
    }),
    clear: vi.fn(async () => {}),
  };
}

function fixture(sample = false) {
  let record: WorkspaceRecord = parseWorkspaceRecord({
    version: 1,
    sessionId: identity.sessionId,
    epoch: "00000000-0000-4000-8000-000000000001",
    admittedAtMs: 1000,
    expiresAtMs: 7201000,
    status: "ready",
    artifacts: [
      {
        artifactId: "loc_" + "a".repeat(22),
        sourceRevision: media.sourceRevision,
        bytes: media.bytes,
      },
    ],
    source: {
      artifact: {
        artifactId: "loc_" + "a".repeat(22),
        sourceRevision: media.sourceRevision,
        bytes: media.bytes,
      },
      media,
      fingerprint: "a".repeat(64),
    },
    analysis: null,
    assembly: null,
    selectedId: null,
  });
  if (sample)
    record = parseWorkspaceRecord({
      ...record,
      retainedSample: true,
      source: null,
      artifacts: [],
    });
  const result = {
    binding: {
      sessionId: "ses_" + "c".repeat(22),
      sourceRevision: media.sourceRevision,
      fingerprint: record.source?.fingerprint ?? "a".repeat(64),
    },
    generation: "12",
    analysis,
    receipt: "synthetic-integrity-receipt",
  };
  let state: ClippingSessionState = restoreLocalWorkspace(record);
  const events: ClippingSessionEvent[] = [];
  const workspace: Pick<
    BrowserWorkspace,
    "snapshot" | "sourceFile" | "markCloudAnalysis" | "storeGroundedAnalysis"
  > = {
    get snapshot() {
      return record;
    },
    sourceFile: sample
      ? null
      : new Blob([new Uint8Array(media.bytes)], { type: "video/mp4" }),
    markCloudAnalysis: vi.fn(async (status, cleanupRequired = true) => {
      record = parseWorkspaceRecord({
        ...record,
        cloudAnalysis: { status, result: null, cleanupRequired },
      });
    }),
    storeGroundedAnalysis: vi.fn(async (value) => {
      record = parseWorkspaceRecord({
        ...record,
        analysis: value.analysis,
        cloudAnalysis: { status: "complete", result: value },
      });
    }),
  };
  const api = {
    grant: vi.fn(async () => ({
      sessionId: result.binding.sessionId,
      csrfToken: "c".repeat(43),
      expiresAtMs: 7201000,
    })),
    upload: vi.fn(async () => ({
      uploadUrl:
        "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic",
      expiresAtMs: 7201000,
    })),
    transfer: vi.fn<SourceAnalysisApi["transfer"]>(async () => "12"),
    sample: vi.fn(async () => ({ generation: "12" })),
    analyze: vi.fn(async () => result),
    clear: vi.fn(async () => {}),
  };
  const challenge = vi.fn(async () => "synthetic"),
    controller = new AbortController();
  const input = {
    workspace,
    api,
    challenge,
    signal: controller.signal,
    label: vi.fn(),
    event: (event: ClippingSessionEvent) => {
      events.push(event);
      state = clippingSessionReducer(state, event);
    },
  };
  return {
    input,
    api,
    result,
    workspace,
    controller,
    events,
    state: () => state,
    record: () => record,
  };
}
describe("confirmed browser source analysis", () => {
  it("a real transfer with invalid completion metadata dispatches no analysis and retains cleanup", async () => {
    const f = fixture();
    f.api.upload.mockResolvedValueOnce({
      uploadUrl:
        "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic",
      expiresAtMs: Date.now() + 600_000,
    });
    const transport = vi.fn<typeof fetch>(async () =>
      Response.json({ generation: "12", size: String(media.bytes + 1) }),
    );
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    try {
      await runSourceAnalysis({
        ...f.input,
        api: {
          ...f.api,
          transfer: createSourceAnalysisApi(transport).transfer,
        },
      });
      expect(transport).toHaveBeenCalledOnce();
      expect(f.api.analyze).toHaveBeenCalledTimes(0);
      expect(f.state().stage).toBe("analysis-failed");
      expect(f.record().cloudAnalysis).toMatchObject({
        status: "uncertain",
        cleanupRequired: true,
      });
    } finally {
      log.mockRestore();
    }
  });
  it("does not dispatch analysis if verification returns late after upload cancellation", async () => {
    const f = fixture();
    f.input.challenge.mockImplementationOnce(async () => "synthetic");
    f.input.challenge.mockImplementationOnce(async () => {
      f.controller.abort();
      return "synthetic";
    });
    await runSourceAnalysis(f.input);
    expect(f.api.transfer).toHaveBeenCalledOnce();
    expect(f.api.transfer.mock.calls[0]?.[4]).toMatch(/^op_[A-Za-z0-9_-]{22}$/);
    expect(f.api.analyze).toHaveBeenCalledTimes(0);
    expect(f.workspace.storeGroundedAnalysis).toHaveBeenCalledTimes(0);
  });
  it("ends the measured upload phase before analysis and fences late progress", async () => {
    const f = fixture();
    const uploadProgress = vi.fn();
    let lateProgress: ((value: CloudUploadProgress) => void) | undefined;
    f.api.transfer.mockImplementationOnce(
      async (admitted, file, _signal, progress) => {
        expect(admitted).toEqual(await f.api.upload.mock.results[0]?.value);
        lateProgress = progress;
        progress?.({ confirmedBytes: 0, totalBytes: file.size });
        progress?.({ confirmedBytes: file.size, totalBytes: file.size });
        expect(f.api.analyze).toHaveBeenCalledTimes(0);
        return "12";
      },
    );
    f.api.analyze.mockImplementationOnce(async () => {
      expect(uploadProgress.mock.calls.at(-1)?.[0]).toBeNull();
      return f.result;
    });
    await runSourceAnalysis({ ...f.input, uploadProgress });
    const count = uploadProgress.mock.calls.length;
    lateProgress?.({ confirmedBytes: 1, totalBytes: 1 });
    expect(uploadProgress).toHaveBeenCalledTimes(count);
    expect(f.api.upload).toHaveBeenCalledOnce();
    expect(f.api.transfer).toHaveBeenCalledOnce();
    expect(f.api.analyze).toHaveBeenCalledOnce();
    expect(JSON.stringify(f.record())).not.toContain("confirmedBytes");
  });
  it.each(["partial", "complete"])(
    "Exit at the %s upload boundary stops analysis and preserves deletion recovery",
    async (phase) => {
      const f = fixture();
      const local = cleanupWorkspace();
      const navigate = vi.fn();
      f.api.clear.mockRejectedValueOnce(new Error("pending-deletion"));
      const cleanup = () =>
        clearAnalysisMedia({
          workspace: local,
          api: f.api,
          cloudPending: true,
          signal: new AbortController().signal,
        });
      let exit: Promise<void> | undefined;
      const uploadProgress = vi.fn((value: CloudUploadProgress | null) => {
        if (value && value.confirmedBytes > 0) {
          exit = exitClippingSession({
            storage: null,
            stop: () => f.controller.abort(),
            cleanup: async () => {
              await cleanup();
            },
            navigate,
            transport: vi.fn(async () => new Response(null, { status: 204 })),
          });
        }
      });
      f.api.transfer.mockImplementationOnce(
        async (_admitted, file, _signal, progress) => {
          progress?.({
            confirmedBytes:
              phase === "partial"
                ? Math.max(1, Math.floor(file.size / 2))
                : file.size,
            totalBytes: file.size,
          });
          progress?.({ confirmedBytes: file.size, totalBytes: file.size });
          return "12";
        },
      );
      await runSourceAnalysis({ ...f.input, uploadProgress });
      await exit;
      await vi.waitFor(() =>
        expect(local.remoteCleanup?.status).toBe("pending"),
      );
      expect(navigate).toHaveBeenCalledOnce();
      expect(f.api.analyze).toHaveBeenCalledTimes(0);
      expect(f.input.challenge).toHaveBeenCalledTimes(1);
      expect(f.workspace.storeGroundedAnalysis).toHaveBeenCalledTimes(0);
      expect(uploadProgress).toHaveBeenCalledOnce();
      expect(f.record().cloudAnalysis?.cleanupRequired).toBe(true);
      expect(await cleanup()).toEqual({
        complete: true,
        cloudPending: false,
        localComplete: true,
      });
      expect(f.api.clear).toHaveBeenCalledTimes(2);
      expect(local.remoteCleanup).toBeNull();
    },
  );
  it.each(["grant", "transfer"] as const)(
    "keeps one analysis lifetime while %s is deferred and never dispatches AI early",
    async (phase) => {
      const f = fixture();
      let release = () => {};
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      if (phase === "grant")
        f.api.grant.mockImplementationOnce(async () => {
          await held;
          return {
            sessionId: f.result.binding.sessionId,
            csrfToken: "c".repeat(43),
            expiresAtMs: 7201000,
          };
        });
      else
        f.api.transfer.mockImplementationOnce(async () => {
          await held;
          return "12";
        });
      const pending = runSourceAnalysis(f.input);
      await vi.waitFor(() => expect(f.api[phase]).toHaveBeenCalledOnce());
      expect(f.state().stage).toBe("analyzing");
      expect(
        f.events.filter((event) => event.type === "ANALYZE_CONFIRMED"),
      ).toHaveLength(1);
      expect(f.api.analyze).not.toHaveBeenCalled();
      release();
      await pending;
      expect(f.api.grant).toHaveBeenCalledOnce();
      expect(f.api.upload).toHaveBeenCalledOnce();
      expect(f.api.transfer).toHaveBeenCalledOnce();
      expect(f.api.analyze).toHaveBeenCalledOnce();
      expect(f.state().stage).toBe("candidates");
      expect(
        f.events.filter((event) => event.type === "ANALYZE_CONFIRMED"),
      ).toHaveLength(1);
    },
  );
  it("uses the server sample copy only after confirmation, without browser download or upload", async () => {
    const f = fixture(true);
    expect(f.state()).toMatchObject({
      stage: "analysis-confirmation",
      media: null,
      identity: { mode: "sample" },
    });
    expect(f.workspace.sourceFile).toBeNull();
    expect(f.api.grant).not.toHaveBeenCalled();
    expect(f.api.sample).not.toHaveBeenCalled();
    await runSourceAnalysis(f.input);
    expect(f.state().stage).toBe("candidates");
    expect(f.api.grant).toHaveBeenCalledOnce();
    expect(f.api.sample).toHaveBeenCalledExactlyOnceWith(
      {
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
        turnstileToken: "synthetic",
      },
      expect.any(AbortSignal),
    );
    expect(f.api.upload).not.toHaveBeenCalled();
    expect(f.api.transfer).not.toHaveBeenCalled();
    expect(f.api.analyze).toHaveBeenCalledOnce();
    expect(restoreLocalWorkspace(f.record()).stage).toBe("candidates");
    await expect(runSourceAnalysis(f.input)).rejects.toThrow("unavailable");
    expect(f.api.sample).toHaveBeenCalledOnce();
  });

  it("fences a failed sample copy across refresh without starting analysis or retrying", async () => {
    const f = fixture(true);
    f.api.sample.mockRejectedValueOnce(new Error("synthetic-copy-failure"));
    await runSourceAnalysis(f.input);
    expect(f.state().stage).toBe("analysis-failed");
    expect(restoreLocalWorkspace(f.record()).stage).toBe("analysis-failed");
    expect(f.api.sample).toHaveBeenCalledOnce();
    expect(f.api.analyze).not.toHaveBeenCalled();
    await expect(runSourceAnalysis(f.input)).rejects.toThrow("unavailable");
  });

  it("saves the result before advancing the existing reducer, and committed refresh makes zero new calls", async () => {
    const f = fixture();
    await runSourceAnalysis(f.input);
    expect(f.state().stage).toBe("candidates");
    expect(f.record().cloudAnalysis?.status).toBe("complete");
    expect(f.workspace.markCloudAnalysis).toHaveBeenCalledWith(
      "pending",
      false,
    );
    expect(f.workspace.storeGroundedAnalysis).toHaveBeenCalledOnce();
    expect(f.api.grant).toHaveBeenCalledOnce();
    expect(f.api.upload).toHaveBeenCalledOnce();
    expect(f.api.transfer).toHaveBeenCalledOnce();
    expect(f.api.analyze).toHaveBeenCalledOnce();
    expect(restoreLocalWorkspace(f.record()).stage).toBe("candidates");
    await expect(runSourceAnalysis(f.input)).rejects.toThrow("unavailable");
    expect(f.api.analyze).toHaveBeenCalledOnce();
  });
  it("a failed journal commit stays uncertain and cannot trigger another paid request", async () => {
    const f = fixture();
    vi.mocked(f.workspace.storeGroundedAnalysis).mockRejectedValueOnce(
      new Error("journal-failure"),
    );
    await runSourceAnalysis(f.input);
    expect(f.state().stage).toBe("analysis-failed");
    expect(f.record().cloudAnalysis?.status).toBe("uncertain");
    expect(f.record().analysis).toBeNull();
    await expect(runSourceAnalysis(f.input)).rejects.toThrow("unavailable");
    expect(f.api.analyze).toHaveBeenCalledOnce();
  });
  it("a failed reservation journal is visible and dispatches no upload or provider action", async () => {
    const f = fixture();
    vi.mocked(f.workspace.markCloudAnalysis).mockRejectedValueOnce(
      new Error("journal-failure"),
    );
    await expect(runSourceAnalysis(f.input)).rejects.toThrow("journal-failure");
    expect(f.state().stage).toBe("analysis-confirmation");
    expect(f.events).toHaveLength(0);
    expect(f.api.grant).toHaveBeenCalledTimes(0);
    expect(f.api.upload).toHaveBeenCalledTimes(0);
    expect(f.api.analyze).toHaveBeenCalledTimes(0);
  });
  it("remote cleanup failure still deletes local media and retries cleanup without AI", async () => {
    const f = fixture();
    f.api.clear.mockRejectedValueOnce(new Error("cleanup-pending"));
    const local = cleanupWorkspace();
    const input = {
      workspace: local,
      api: f.api,
      cloudPending: true,
      signal: f.controller.signal,
    };
    expect(await clearAnalysisMedia(input)).toEqual({
      complete: false,
      cloudPending: true,
      localComplete: true,
    });
    expect(local.clear).toHaveBeenCalledOnce();
    expect(await clearAnalysisMedia(input)).toEqual({
      complete: true,
      cloudPending: false,
      localComplete: true,
    });
    expect(f.api.clear).toHaveBeenCalledTimes(2);
    expect(f.api.analyze).toHaveBeenCalledTimes(0);
  });
  it("a refused grant with no session can clear without creating a remote cleanup obligation", async () => {
    const f = fixture();
    const missing = {
      code: "SESSION_MISSING",
      message: "No active session was found.",
      retryable: false,
      requestId: `req_${"0".repeat(32)}`,
    };
    const refused = {
      ...missing,
      code: "RATE_LIMITED",
      message: "Too many requests. Try again later.",
    };
    const transport = vi.fn(async () =>
      Response.json({ error: refused }, { status: 429 }),
    );
    const api = createSourceAnalysisApi(transport);
    await runSourceAnalysis({ ...f.input, api });
    expect(f.state().stage).toBe("analysis-failed");
    transport.mockResolvedValueOnce(
      Response.json({ error: missing }, { status: 401 }),
    );
    const local = cleanupWorkspace();
    expect(
      await clearAnalysisMedia({
        workspace: local,
        api,
        signal: f.controller.signal,
        cloudPending: true,
        allowMissingSession: !f.record().cloudAnalysis?.cleanupRequired,
      }),
    ).toEqual({ complete: true, cloudPending: false, localComplete: true });
    expect(local.clear).toHaveBeenCalledOnce();
    expect(transport).toHaveBeenCalledTimes(2);
    expect(f.api.upload).toHaveBeenCalledTimes(0);
    expect(f.api.analyze).toHaveBeenCalledTimes(0);
  });
  it("clear/unmount abort rejects a late response without caching or advancing candidates", async () => {
    const f = fixture();
    let finish = () => {};
    f.api.analyze.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () => resolve(f.result);
        }),
    );
    const pending = runSourceAnalysis(f.input);
    await vi.waitFor(() => expect(f.api.analyze).toHaveBeenCalledOnce());
    f.controller.abort();
    finish();
    await pending;
    expect(f.workspace.storeGroundedAnalysis).toHaveBeenCalledTimes(0);
    expect(f.events.some((e) => e.type === "ANALYSIS_SUCCEEDED")).toBe(false);
  });
  it("validates the API response and rejects raw provider errors without content leakage", async () => {
    const transport = vi.fn(async () =>
      Response.json(
        { error: { message: "synthetic-private" } },
        { status: 500 },
      ),
    );
    const api = createSourceAnalysisApi(transport);
    await expect(api.grant(new AbortController().signal)).rejects.toThrow(
      "ClipBuilder could not complete the request.",
    );
    expect(transport).toHaveBeenCalledOnce();
    transport.mockResolvedValueOnce(
      Response.json({ ...fixture().result, analysis: { malicious: true } }),
    );
    await expect(
      api.analyze("12", "synthetic", new AbortController().signal),
    ).rejects.toThrow("ClipBuilder could not complete the request.");
    expect(transport).toHaveBeenCalledTimes(2);
  });
});
