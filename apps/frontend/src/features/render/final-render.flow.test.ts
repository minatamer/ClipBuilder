import { describe, expect, it, vi } from "vitest";
import { finalRenderResultSchema } from "@clipbuilder/contracts";
import type { BrowserWorkspace } from "../media/browser.workspace";
import type { WorkspaceRecord } from "../media/workspace.schema";
import { selectedAssemblyFixture } from "../assembly/selected-assembly.test-fixtures";
import { runFinalRender } from "./final-render.flow";
import { isDecodedOutput } from "./output-playback";
import { clippingSessionReducer } from "../session/session.reducer";
import { identity } from "../session/session.test-fixtures";
import { createSourceAnalysisApi } from "../source-analysis/source-analysis.api";
async function fixture() {
  const assembly = await selectedAssemblyFixture(),
    result = finalRenderResultSchema.parse({
      version: 1,
      binding: assembly.binding,
      manifestHash: assembly.manifestHash,
      output: {
        artifactId: "00000000-0000-4000-8000-000000000001",
        generation: "4",
        bytes: 1024,
        checksum: "c".repeat(64),
      },
      expiresAtMs: 601000,
      receipt: "synthetic-output",
    });
  let cloudRender: WorkspaceRecord["cloudRender"] = null;
  const workspace: Pick<
    BrowserWorkspace,
    "snapshot" | "markCloudRender" | "storeFinalRender"
  > = {
    get snapshot() {
      return {
        cloudAssembly: { result: assembly },
        cloudRender,
      } as WorkspaceRecord;
    },
    markCloudRender: vi.fn(async (status) => {
      cloudRender = { status, result: null };
    }),
    storeFinalRender: vi.fn(async (value) => {
      cloudRender = { status: "complete", result: value };
    }),
  };
  const controller = new AbortController(),
    api = {
      session: vi.fn(async () => ({
        sessionId: assembly.binding.sessionId,
        csrfToken: "c".repeat(43),
        expiresAtMs: 7201000,
      })),
      render: vi.fn(async () => result),
    };
  return {
    assembly,
    result,
    controller,
    input: {
      workspace,
      api,
      signal: controller.signal,
      challenge: vi.fn(async () => "synthetic"),
      label: vi.fn(),
    },
  };
}
describe("explicit one-shot final export", () => {
  it("reserves and exports once, while replay performs no job", async () => {
    const f = await fixture();
    expect(await runFinalRender(f.input)).toEqual(f.result);
    await expect(runFinalRender(f.input)).rejects.toThrow();
    expect(f.input.api.render).toHaveBeenCalledTimes(1);
    expect(f.input.challenge).toHaveBeenCalledWith(
      f.assembly.binding.sessionId,
      "render",
      expect.any(AbortSignal),
    );
  });
  it.each(["lost-response", "journal", "mismatch", "session"])(
    "consumes %s uncertainty without automatic retry",
    async (kind) => {
      const f = await fixture();
      if (kind === "lost-response")
        f.input.api.render.mockRejectedValue(new Error());
      if (kind === "journal")
        vi.mocked(f.input.workspace.storeFinalRender).mockRejectedValue(
          new Error(),
        );
      if (kind === "mismatch")
        f.input.api.render.mockResolvedValue({
          ...f.result,
          manifestHash: "e".repeat(64),
        });
      if (kind === "session")
        f.input.api.session.mockResolvedValue({
          sessionId: "ses_" + "d".repeat(22),
          csrfToken: "c".repeat(43),
          expiresAtMs: 7201000,
        });
      await expect(runFinalRender(f.input)).rejects.toThrow();
      expect(f.input.workspace.snapshot?.cloudRender?.status).toBe("uncertain");
      await expect(runFinalRender(f.input)).rejects.toThrow();
      expect(f.input.api.render).toHaveBeenCalledTimes(
        kind === "session" ? 0 : 1,
      );
    },
  );
  it("Clear fences late results before local publication", async () => {
    const f = await fixture();
    f.input.api.render.mockImplementation(async () => {
      f.controller.abort();
      return f.result;
    });
    await expect(runFinalRender(f.input)).rejects.toThrow();
    expect(f.input.workspace.storeFinalRender).toHaveBeenCalledTimes(0);
  });
  it("rejects mismatched and late reducer results while accepting explicit completed-output recovery", async () => {
    const f = await fixture(),
      review = {
        stage: "cloud-review" as const,
        identity: { ...identity, authority: "local" as const },
        analysis: {
          analysisId: "synthetic",
          revision: f.assembly.analysisRevision,
          bundle: null,
        },
        result: f.assembly,
        diagnosticCode: null,
      };
    const started = clippingSessionReducer(review, {
      type: "CLOUD_RENDER_STARTED",
    });
    expect(
      clippingSessionReducer(started, {
        type: "CLOUD_RENDER_COMPLETED",
        result: { ...f.result, manifestHash: "e".repeat(64) },
      }).stage,
    ).toBe("cloud-rendering");
    expect(
      clippingSessionReducer(started, {
        type: "CLOUD_RENDER_COMPLETED",
        result: f.result,
      }).stage,
    ).toBe("cloud-result");
    const clearing = clippingSessionReducer(started, { type: "CLEAR" });
    expect(
      clippingSessionReducer(clearing, {
        type: "CLOUD_RENDER_COMPLETED",
        result: f.result,
      }).stage,
    ).toBe("clearing");
  });
  it("restores and opens output through protected metadata requests, never render dispatch", async () => {
    const f = await fixture(),
      transport = vi.fn(async (_input: RequestInfo | URL) => {
        void _input;
        return Response.json({
          sessionId: f.assembly.binding.sessionId,
          csrfToken: "c".repeat(43),
          expiresAtMs: 7201000,
        });
      }),
      api = createSourceAnalysisApi(transport);
    await api.session(f.controller.signal);
    transport.mockResolvedValueOnce(Response.json(f.result));
    expect(await api.renderResult(f.assembly, f.controller.signal)).toEqual(
      f.result,
    );
    transport.mockResolvedValueOnce(
      Response.json({ ready: true, expiresAtMs: f.result.expiresAtMs }),
    );
    await api.output(f.result, f.controller.signal);
    expect(transport.mock.calls.map((call) => String(call[0]))).toEqual([
      "/api/analysis/session",
      "/api/analysis/render-result",
      "/api/analysis/output",
    ]);
  });
  it("requires a decoded portrait frame and exact duration before download", () => {
    const frame = {
      readyState: 2,
      videoWidth: 1080,
      videoHeight: 1920,
      duration: 10,
    };
    expect(isDecodedOutput(frame, 10000)).toBe(true);
    for (const value of [
      { ...frame, readyState: 1 },
      { ...frame, videoWidth: 640 },
      { ...frame, duration: NaN },
      { ...frame, duration: 9 },
    ])
      expect(isDecodedOutput(value, 10000)).toBe(false);
  });
});
