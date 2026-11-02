import type { OwnerAnalysis } from "../../../../../packages/contracts/local/selection.ts";

export function AnalysisCoverageStatus({
  coverage,
}: {
  coverage: OwnerAnalysis["coverage"];
}) {
  if (!coverage || coverage.state === "complete") return null;
  const label =
    coverage.state === "canceled"
      ? "Analysis canceled"
      : coverage.completed === 0
        ? "Analysis failed"
        : "Partial results";
  return (
    <p role="status">
      {label}. {coverage.completed}/{coverage.planned} sections complete. Use
      Add clips to retry.
      {coverage.completed > 0 ? " Completed work is retained." : ""}
    </p>
  );
}
