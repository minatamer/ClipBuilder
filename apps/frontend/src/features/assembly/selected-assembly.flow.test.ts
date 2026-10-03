import { describe, expect, it, vi } from "vitest";
import { runSelectedAssembly } from "./selected-assembly.flow";
import {
  groundedFixture,
  selectedAssemblyFixture,
} from "./selected-assembly.test-fixtures";
import { createSourceAnalysisApi } from "../source-analysis/source-analysis.api";
import type { BrowserWorkspace } from "../media/browser.workspace";
import type { WorkspaceRecord } from "../media/workspace.schema";
import {
  ContextualCard,
  FixedCaption,
  FIXED_LAYER_GEOMETRY,
} from "@clipbuilder/composition";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function fixture() {
  const source = groundedFixture(),
    result = await selectedAssemblyFixture(source);
  let assembly: WorkspaceRecord["cloudAssembly"] = null;
  const workspace: Pick<
    BrowserWorkspace,
    "snapshot" | "markCloudAssembly" | "storeSelectedAssembly"
  > = {
    get snapshot() {
      return {
        cloudAnalysis: { result: source },
        selectedId: result.candidateId,
        cloudAssembly: assembly,
      } as WorkspaceRecord;
    },
    markCloudAssembly: vi.fn(async (status) => {
      assembly = { status, candidateId: result.candidateId, result: null };
    }),
    storeSelectedAssembly: vi.fn(async (value) => {
      assembly = {
        status: "complete",
        candidateId: result.candidateId,
        result: value,
      };
    }),
  };
  const api = {
    session: vi.fn(async () => ({
      sessionId: source.binding.sessionId,
      csrfToken: "c".repeat(43),
      expiresAtMs: 7201000,
    })),
    assemble: vi.fn(async () => result),
  };
  const controller = new AbortController();
  const input = {
    workspace,
    api,
    signal: controller.signal,
    challenge: vi.fn(async () => "synthetic"),
    label: vi.fn(),
  };
  return { input, result, controller };
}
describe("atomic selected assembly browser preparation", () => {
  it("publishes one prepared result and blocks refresh/replay without another plan", async () => {
    const f = await fixture();
    expect(await runSelectedAssembly(f.input)).toEqual(f.result);
    expect(f.input.api.assemble).toHaveBeenCalledTimes(1);
    expect(f.input.challenge).toHaveBeenCalledWith(
      f.result.binding.sessionId,
      "visual-plan",
      expect.any(AbortSignal),
    );
    await expect(runSelectedAssembly(f.input)).rejects.toThrow("unavailable");
    expect(f.input.api.assemble).toHaveBeenCalledTimes(1);
  });
  it.each(["lost-response", "journal", "mismatched-result", "session"])(
    "keeps %s uncertain without retry",
    async (kind) => {
      const f = await fixture();
      if (kind === "lost-response")
        f.input.api.assemble.mockRejectedValue(new Error("synthetic"));
      if (kind === "journal")
        vi.mocked(f.input.workspace.storeSelectedAssembly).mockRejectedValue(
          new Error("synthetic"),
        );
      if (kind === "mismatched-result")
        f.input.api.assemble.mockResolvedValue({
          ...f.result,
          generation: "999",
        });
      if (kind === "session")
        f.input.api.session.mockResolvedValue({
          sessionId: "ses_" + "z".repeat(22),
          csrfToken: "c".repeat(43),
          expiresAtMs: 7201000,
        });
      await expect(runSelectedAssembly(f.input)).rejects.toThrow();
      expect(f.input.workspace.snapshot?.cloudAssembly?.status).toBe(
        "uncertain",
      );
      await expect(runSelectedAssembly(f.input)).rejects.toThrow("unavailable");
      expect(f.input.api.assemble).toHaveBeenCalledTimes(
        kind === "session" ? 0 : 1,
      );
    },
  );
  it("reserves before any call and abort fences late publication", async () => {
    const f = await fixture();
    vi.mocked(f.input.workspace.markCloudAssembly).mockRejectedValueOnce(
      new Error("synthetic"),
    );
    await expect(runSelectedAssembly(f.input)).rejects.toThrow();
    expect(f.input.api.session).toHaveBeenCalledTimes(0);
    let finish = () => {};
    f.input.api.assemble.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () => resolve(f.result);
        }),
    );
    const pending = runSelectedAssembly(f.input),
      rejection = expect(pending).rejects.toThrow();
    await vi.waitFor(() =>
      expect(f.input.api.assemble).toHaveBeenCalledTimes(1),
    );
    f.controller.abort();
    finish();
    await rejection;
    expect(f.input.workspace.storeSelectedAssembly).toHaveBeenCalledTimes(0);
  });
  it("restores CSRF in memory and validates assembly over the protected same-origin API", async () => {
    const f = await fixture();
    const transport = vi.fn(async () =>
      Response.json({
        sessionId: f.result.binding.sessionId,
        csrfToken: "c".repeat(43),
        expiresAtMs: 7201000,
      }),
    );
    const api = createSourceAnalysisApi(transport);
    await api.session(f.controller.signal);
    transport.mockResolvedValueOnce(Response.json(f.result));
    expect(
      await api.assemble(
        {
          analysis: groundedFixture(),
          candidateId: f.result.candidateId,
          turnstileToken: "synthetic",
        },
        f.controller.signal,
      ),
    ).toEqual(f.result);
    expect(transport).toHaveBeenLastCalledWith(
      "/api/analysis/assemble",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-CSRF-Token": "c".repeat(43) }),
      }),
    );
  });
  it("escapes literal card/caption content and keeps their fixed safe zones separate", () => {
    const card = {
      kind: "comparison" as const,
      startMs: 2000,
      endMs: 4000,
      title: "<literal>",
      lines: ["One", "Two"],
    };
    const html = renderToStaticMarkup(
      createElement(ContextualCard, { card, ms: 2500 }),
    );
    expect(html).toContain("&lt;literal&gt;");
    expect(html).toContain("flex-direction:row");
    const captions = renderToStaticMarkup(
      createElement(FixedCaption, {
        caption: {
          startMs: 0,
          endMs: 1000,
          text: "One Two",
          lines: ["One Two"],
          emphasisWordIndex: 1,
        },
      }),
    );
    expect(captions).toContain("#8de5c5");
    const wide = renderToStaticMarkup(
      createElement(FixedCaption, {
        caption: {
          startMs: 0,
          endMs: 1000,
          text: "W".repeat(80),
          lines: ["W".repeat(80)],
        },
      }),
    );
    expect(wide).toContain("font-size:24px");
    const two = renderToStaticMarkup(
      createElement(FixedCaption, {
        caption: {
          startMs: 0,
          endMs: 1000,
          text: `${"W".repeat(31)} ${"W".repeat(31)}`,
          lines: ["W".repeat(31), "W".repeat(31)],
        },
      }),
    );
    expect(two).toContain("font-size:30px");
    expect(
      FIXED_LAYER_GEOMETRY.card.top + FIXED_LAYER_GEOMETRY.card.height,
    ).toBeLessThan(
      1920 -
        FIXED_LAYER_GEOMETRY.caption.bottom -
        FIXED_LAYER_GEOMETRY.caption.maxHeight,
    );
  });
});
