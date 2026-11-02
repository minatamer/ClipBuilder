import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { AnalysisCoverageStatus } from "./analysis-coverage-status";
import type { OwnerAnalysis } from "../../../../../packages/contracts/local/selection.ts";
const coverage: NonNullable<OwnerAnalysis["coverage"]> = {
  state: "partial",
  completed: 0,
  planned: 1,
  coveredThroughMs: 0,
  failure: "processing_unavailable",
};
const render = (value: OwnerAnalysis["coverage"]) =>
  renderToStaticMarkup(<AnalysisCoverageStatus coverage={value} />);
it("labels zero-section failure honestly and retains the explicit retry instruction", () => {
  const html = render(coverage);
  expect(html).toContain("Analysis failed");
  expect(html).toContain("0/1");
  expect(html).toContain("Use Add clips to retry");
  expect(html).not.toContain("Partial results");
  expect(html).not.toContain("Completed work is retained");
  expect(html).not.toContain("\uFFFD");
});
it("preserves acknowledged partial work and distinguishes cancellation", () => {
  const partial = render({
    ...coverage,
    completed: 1,
    planned: 3,
    coveredThroughMs: 480000,
  });
  expect(partial).toContain("Partial results");
  expect(partial).toContain("Completed work is retained");
  const canceled = render({ ...coverage, state: "canceled" });
  expect(canceled).toContain("Analysis canceled");
  expect(canceled).not.toContain("Analysis failed");
});
it("omits failure status for complete or legacy coverage", () => {
  expect(
    render({
      ...coverage,
      state: "complete",
      completed: 1,
      failure: undefined,
    }),
  ).toBe("");
  expect(render(undefined)).toBe("");
});
