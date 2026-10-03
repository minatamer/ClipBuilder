import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  selectedAssemblyFixture,
  groundedFixture,
} from "../assembly/selected-assembly.test-fixtures";
import { clippingSessionReducer } from "../session/session.reducer";
import type { ClippingSessionState } from "../session/session.types";
import { fixedReviewNotes, previewFrame } from "./fixed-review";
import { CloudClipReview } from "./cloud-clip.review";
const proof = groundedFixture(),
  analysis = proof.analysis;
function candidates(): ClippingSessionState {
  return {
    stage: "candidates",
    identity: {
      sessionId: "ses_" + "b".repeat(22),
      authority: "local",
      mode: "upload",
      expiresAt: new Date(7200000).toISOString(),
      remaining: { analysisRetries: 0, renderAttempts: 0 },
    },
    analysis: {
      analysisId: analysis.analysisId,
      revision: analysis.revision,
      bundle: analysis,
    },
    selectedId: analysis.candidates[0]!.id,
    diagnosticCode: null,
  };
}
describe("immutable cloud review", () => {
  it("opens only the selected frozen revision and rejects late publication after Clear", async () => {
    const result = await selectedAssemblyFixture();
    const pending = clippingSessionReducer(candidates(), {
      type: "CLOUD_ASSEMBLY_STARTED",
      candidateId: result.candidateId,
    });
    expect(pending.stage).toBe("cloud-assembling");
    expect(
      clippingSessionReducer(pending, {
        type: "CLOUD_ASSEMBLY_COMPLETED",
        result,
      }).stage,
    ).toBe("cloud-review");
    expect(
      clippingSessionReducer(pending, {
        type: "CLOUD_ASSEMBLY_COMPLETED",
        result: { ...result, analysisRevision: "rev_" + "d".repeat(22) },
      }).diagnosticCode,
    ).toBe("invalid-manifest");
    const cleared = clippingSessionReducer(pending, { type: "CLEAR" });
    expect(
      clippingSessionReducer(cleared, {
        type: "CLOUD_ASSEMBLY_COMPLETED",
        result,
      }).stage,
    ).toBe("clearing");
  });
  it("clamps source seeks to the clip's frame clock and rejects nonfinite positions", async () => {
    const result = await selectedAssemblyFixture(),
      { range } = result.manifest;
    expect(previewFrame(range.startMs, result)).toBe(0);
    expect(previewFrame(range.startMs + 1000, result)).toBe(30);
    expect(previewFrame(-1000, result)).toBe(0);
    expect(previewFrame(range.endMs + 1000, result)).toBe(
      Math.ceil(((range.endMs - range.startMs) * 30) / 1000) - 1,
    );
    expect(() => previewFrame(NaN, result)).toThrow();
    expect(() => previewFrame(Infinity, result)).toThrow();
  });
  it("reports only validated edits, keeps the existing layout and starts no work during SSR", async () => {
    const result = await selectedAssemblyFixture(),
      api = { session: vi.fn(), preview: vi.fn() };
    const notes = fixedReviewNotes(result);
    expect(notes.map((n) => n.body).join(" ")).not.toMatch(
      /normaliz|trend|remov|generate/i,
    );
    const html = renderToStaticMarkup(
      <CloudClipReview result={result} analysis={analysis} api={api} />,
    );
    expect(html).toContain("Read-only clip preview");
    expect(html).toContain("Opening the prepared clip");
    expect(html).toContain("Agentic Notes");
    expect(html).toContain("Transcript");
    expect(html).not.toMatch(/Download MP4|Trim|caption style/);
    expect(api.session).not.toHaveBeenCalled();
    expect(api.preview).not.toHaveBeenCalled();
  });
});
