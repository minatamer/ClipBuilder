# CL-266 — Manual clips turn off AI suggestions

Status: implemented and verified with generated/no-key checks, 2026-11-08.
Depends on the implemented shared manual/AI selection flow (CL-085/CL-172).

## Owner request and behavior

When a user adds a manual clip, automatically uncheck the AI-moments option
(currently labeled Suggest clips). A successful Add clip selects manual-only
mode locally and when hosted. Keep Suggest clips available for explicit opt-in
afterward, including a combined manual/AI request within existing limits.

Do not turn AI back on when rows are removed, override a later explicit opt-in
when timestamps are edited, alter restored choices or change the initial
default. Rejected/disabled additions leave the option alone. Timestamp import
already selects manual-only and retains that behavior. No automatic analysis
or processing is introduced.

## Scope and checks

Change the existing Add clip handler, remove its obsolete AI-count adjustment,
and reuse the current checkbox/validation/footer behavior. Preserve timestamp
input/capture, capacity limits, hosted gating and explicit submission. Record
the product decision in the source of truth and keep this packet indexed.

Use generated fake/no-key browser checks for local and hosted: AI on -> Add clip
turns it off; rechecking works; editing preserves that choice; another successful
add turns it off again; removal does not turn it on; rejected additions preserve
state. Verify submitted manualOnly and manual ranges through the HTTP boundary,
with no AI/processing request until the explicit footer action. Check desktop
and phone placement in the Codex browser. Run scoped lint, formatting, frontend
and test TypeScript plus the relevant selection regression and read-only review.

This interaction works with FAKE_MODE=true and no API keys. Real manual clip
preparation retains its normal native/runtime requirements; AI opt-in retains
provider setup, live flags and approvals. No provider call, ignored configuration
change, saved-media modification, service restart, cloud/deployment or Git action
is requested. Preserve the normal Codex app and pending CL-263 work.

## Implementation and evidence

- The existing successful Add clip path sets manualOnly=true after all rejection
  guards. Removed its obsolete hosted AI-count adjustment; explicit AI re-opt-in
  still uses the existing shared-slot limiter. Timestamp edits, removal, imports,
  startup and restored analyses keep their existing handlers and choices.
- Extended the existing hosted-limit browser proof rather than adding a new
  test suite. At 1366 and 390px, local and hosted cases verify default AI on,
  first/second manual adds opting out, explicit re-opt-in, timestamp edits retaining
  opt-in, invalid analysis-range additions preserving state, removal/empty-row
  opt-out, and no submission during those interactions. All eight explicit
  footer requests cross actual HTTP and match the shared request schema: four
  manualOnly=true and four re-opted-in manualOnly=false, with exact manual ranges.
  The fixture deliberately returns 503; this establishes request intent and
  explicit submission, not real analysis success or AI quality. No provider or
  processing implementation is invoked. Existing capacity/exhaustion checks
  pass in the same proof (8.95s).
- The related timestamp exchange/import/capture/Jump proof passes (15.95s).
  Its first run exposed an existing selector assumption: contextual error text
  changes a tab's textContent. Matching its accessible label as well resolves
  that test-only failure; no production timestamp behavior was changed.
- Frontend/root-test TypeScript and scoped ESLint pass. Codex-browser inspection
  confirms local desktop auto-opt-out, explicit recheck plus endpoint editing,
  and hosted phone auto-opt-out with Use clips replacing Find moments. Generated
  screenshots are retained outside Git. The temporary tab, viewport override,
  verified process tree, fixture scratch and helper are cleaned up. The normal
  app remains healthy (health/start 200) with exposed Codex setup ready.
- Read-only CL-266 review: the guard ordering, explicit opt-in, capacity checks,
  request semantics and existing defaults/restoration meet the packet, with no
  actionable findings. Pending CL-263 changes are preserved and excluded from
  this verdict. No deviations, staging or commits. Personal acceptance and real
  processing/AI quality are outside these generated/no-key UI checks.

## Authorized local packaging — 2026-11-08

The owner requests file-level staging/commits of the pending work while approving
the separate CL-263 tour. This packet's four whole files are allocated to
`CL-266: disable AI suggestions when adding manual clips`; the two shared
authority/index files are allocated to the final combined docs commit. The full
24-file allocation and before/after verification are owned by
[CL-263](CL-263-first-editor-guided-tour.md#owner-approval-and-whole-file-local-commit-plan--2026-11-08).
This packaging does not claim separate owner visual or live-processing acceptance
for CL-266 and authorizes no push, provider, configuration or deployment action.
