import { describe, expect, it, vi } from "vitest";
import { analysis, media } from "../session/session.test-fixtures";
import type { WorkspaceRecord } from "../media/workspace.schema";
import { openSampleReplay, prepareSampleReplay } from "./sample-replay.flow";
import { createSourceAnalysisApi } from "./source-analysis.api";

function fixture() {
  const result = {
    binding: {
      sessionId: "ses_" + "c".repeat(22),
      sourceRevision: media.sourceRevision,
      fingerprint: "a".repeat(64),
    },
    generation: "1",
    receipt: "synthetic",
    analysis,
  };
  const snapshot = {
    retainedSample: true,
    sampleReplayRevision: analysis.revision,
    cloudAnalysis: null,
  } as WorkspaceRecord;
  const workspace = {
    snapshot,
    prepareRetainedSample: vi.fn(),
    cacheSampleReplay: vi.fn(),
    markCloudAnalysis: vi.fn(async () => {}),
    storeGroundedAnalysis: vi.fn(async () => {}),
  };
  const api = {
    sampleReplayOptions: vi.fn(async () => analysis),
    grant: vi.fn(async () => ({
      sessionId: result.binding.sessionId,
      csrfToken: "c".repeat(43),
      expiresAtMs: 7201000,
    })),
    sample: vi.fn(async () => ({ generation: "1" })),
    sampleReplay: vi.fn(async () => result),
    analyze: vi.fn(),
    upload: vi.fn(),
    transfer: vi.fn(),
  };
  const controller = new AbortController();
  return {
    workspace,
    api,
    controller,
    signal: controller.signal,
    challenge: vi.fn<
      (
        sessionId: string,
        action: "transcription" | "candidate-analysis",
        signal: AbortSignal,
      ) => Promise<string>
    >(async () => "synthetic"),
    label: vi.fn(),
  };
}
describe("saved sample display and protected Proceed", () => {
  it("serializes only bounded revision/generation/challenge fields without resending cached transcript", async () => {
    const f = fixture();
    const transport = vi.fn<typeof fetch>(async (url, init) => {
      if (url === "/api/analysis/sample-replay-options") {
        expect(JSON.parse(String(init?.body))).toEqual({});
        return Response.json(analysis);
      }
      if (url === "/api/analysis/grant")
        return Response.json(await f.api.grant());
      expect(url).toBe("/api/analysis/sample-replay");
      expect(JSON.parse(String(init?.body))).toEqual({
        generation: "1",
        analysisRevision: analysis.revision,
        turnstileToken: "synthetic",
      });
      return Response.json(await f.api.sampleReplay());
    });
    const api = createSourceAnalysisApi(transport);
    expect(await api.sampleReplayOptions(f.signal)).toEqual(analysis);
    await api.grant(f.signal);
    await api.sampleReplay("1", analysis.revision, "synthetic", f.signal);
    expect(transport).toHaveBeenCalledTimes(3);
  });
  it("opens saved choices without grant, uploads or analysis", async () => {
    const f = fixture();
    await openSampleReplay(f);
    expect(f.api.sampleReplayOptions).toHaveBeenCalledOnce();
    expect(f.workspace.cacheSampleReplay).toHaveBeenCalledExactlyOnceWith(
      analysis,
    );
    expect(f.api.grant).not.toHaveBeenCalled();
    expect(f.api.sample).not.toHaveBeenCalled();
    expect(f.api.analyze).not.toHaveBeenCalled();
  });
  it("prepares the approved sample once and signs saved data before normal assembly", async () => {
    const f = fixture();
    await prepareSampleReplay(f);
    expect(f.api.grant).toHaveBeenCalledOnce();
    expect(f.api.sample).toHaveBeenCalledOnce();
    expect(f.api.sampleReplay).toHaveBeenCalledExactlyOnceWith(
      "1",
      analysis.revision,
      "synthetic",
      f.signal,
    );
    expect(f.challenge.mock.calls.map((call) => call[1])).toEqual([
      "transcription",
      "candidate-analysis",
    ]);
    expect(f.workspace.storeGroundedAnalysis).toHaveBeenCalledOnce();
    expect(f.api.analyze).not.toHaveBeenCalled();
    expect(f.api.upload).not.toHaveBeenCalled();
    expect(f.api.transfer).not.toHaveBeenCalled();
  });
  it("fences a lost replay result as uncertain and does not silently retry", async () => {
    const f = fixture();
    f.api.sampleReplay.mockRejectedValueOnce(new Error("synthetic"));
    await expect(prepareSampleReplay(f)).rejects.toThrow();
    expect(f.api.sampleReplay).toHaveBeenCalledOnce();
    expect(f.workspace.markCloudAnalysis).toHaveBeenLastCalledWith(
      "uncertain",
      true,
    );
    expect(f.workspace.storeGroundedAnalysis).not.toHaveBeenCalled();
  });
  it("refuses uploaded sources and stops after cancellation before source setup", async () => {
    const f = fixture();
    delete f.workspace.snapshot.retainedSample;
    await expect(prepareSampleReplay(f)).rejects.toThrow();
    expect(f.api.grant).not.toHaveBeenCalled();
    f.workspace.snapshot.retainedSample = true;
    f.api.sampleReplayOptions.mockImplementationOnce(async () => {
      f.controller.abort();
      return analysis;
    });
    await expect(openSampleReplay(f)).rejects.toThrow();
    expect(f.workspace.prepareRetainedSample).not.toHaveBeenCalled();
  });
});
