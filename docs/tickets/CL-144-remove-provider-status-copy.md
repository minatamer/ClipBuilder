# CL-144 — remove unsolicited provider status copy

Status: implemented and locally validated. Plan recorded before code,
dependency-ready after CL-143.
Owner correction 2026-10-29: remove the Fake mode / Real AI selection status
shown under the intake heading and stop adding this kind of implementation
text to the product flow. Remove the matching always-visible Codex explanation
from AI moments as well. Keep ordinary action labels and actionable errors.

Whole-file allocation: frontend local-editing `experience.tsx` removes the
intake provider-status block; `selection-panel.tsx` removes the passive provider
explanation. Update the existing `test/local-codex.proof.ts` intake assertion,
which currently requires that rejected label. Source of truth and index record
the owner's UI decision. No provider, configuration, schema, CSS or worker change.
Preserve prior uncommitted work; no staging, commit, deployment or paid calls.

Validate frontend types and scoped lint/format, inspect the running intake after
HMR and review the narrow removal. No new test for a reversible copy deletion;
do not rerun unrelated native export/inference proofs. Fake-mode controls still
work without API keys. Real AI retains its selected provider's existing setup,
live gates and owner approvals; no inference is exercised by this change.

- [x] Passive mode/provider copy removed; actionable errors retained.
- [x] Scoped static checks, running intake inspection and review complete.

## Evidence — 2026-10-29

Removed the entire passive intake status branch from experience.tsx and the
matching Codex plan/transmission paragraph from selection-panel.tsx. The existing
Codex browser proof no longer requires the rejected intake label. No provider
checks, dispatches, errors, configuration or CSS were changed. The source of
truth records the owner's decision to keep this operational copy out of flows.

Frontend typecheck, scoped ESLint, Prettier and diff checks pass. Targeted search
finds none of the removed label strings or stale provider_label assertion in
frontend/proof source. Existing normal in-app localhost:3000/start intake was
inspected after Next HMR: heading, upload card, YouTube form and Continue remain,
with no mode/provider status text. No reload, form submission or media request
was needed. No native/backend restart for this frontend-only removal.

Scoped read-only review at HEAD 04450d6: Meets ticket; no actionable findings.
Coverage includes both passive text blocks, the obsolete proof expectation,
unchanged actionable provider errors and the owning UI rule. Prior CL-135–143
work remains intact and excluded from this narrow verdict. No new test or native
proof run for this reversible copy removal. No paid/cloud/inference call,
staging, commit or deployment. Deviations: none. Real-AI, hosted, physical-device
and personal release acceptance remain untested and are not claimed.
