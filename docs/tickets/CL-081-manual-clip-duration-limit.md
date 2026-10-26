# CL-081 — Align new manual clips with the 60-second AI setting

Status: implemented and locally validated; owner visual/live acceptance remains
manual.

Owner confirmed on 2026-10-26: cap new manual clips at 60 seconds, matching the
AI duration setting, in fake, real local and hosted modes. Reject longer manual
requests before transcription/selection; do not silently trim or dispatch them.
Exactly 60 seconds remains valid; the existing one-second minimum remains.

Dependency: shared upload/selection workflow is implemented. CL-080 is complete
as an unstaged independent default-value change; preserve it while implementing
this packet. Source of truth owns this duration decision.

Use one shared requested-duration ceiling for manual request validation and the
existing AI settings. Validate in the frontend and shared backend use case/HTTP
boundary. Keep saved analysis and existing prepared/exported results readable:
the older 300-second media-resource allowance is not the new-input policy.
Keep usable provider results advisory under CL-060, including longer AI output.
No provider retry, new paid path, configuration change or content deletion.

Show an actionable manual range/submit error with the 60-second maximum. Add
focused boundary regressions to the existing analysis suite: exact limit,
one millisecond over, zero provider calls for rejection in both AI modes, and
readable legacy saved analysis with over-limit resubmission rejected. Adjust
the existing 75-second synthetic request fixture to a valid manual range.

Run affected analysis/server checks, frontend/local contract types, affected
lint/format and settled-diff validation. Rebuild/reload the normal backend's
internal worker with verified lifecycle ownership; preserve frontend and saved
files. Tests use synthetic/fake/paid-off/no-network composition and no ignored
configuration reads. Owner visual/live and hosted acceptance stay manual. No
Git mutation, provider calls, cloud changes, deployment or new model assets.

## Evidence and final validation — 2026-10-26

Shared `OWNER_MAX_REQUESTED_CLIP_MS` fixes the requested manual/AI setting
ceiling at 60 seconds. `ownerAnalysisRequestSchema` derives from the retained
input schema, adding the new manual request limit once. Frontend parsing, the
shared host POST boundary and `analyzeOwner` all use it. Retained analysis and
generic physical cut schemas remain compatible with older saved results and
CL-060's advisory AI-output acceptance. Range summaries and submission errors
state the manual limit; no new layout/action was added.

Changed implementation: `packages/contracts/local/policy.ts`,
`packages/contracts/local/selection.ts`, `apps/backend/local/analysis.ts`,
`apps/backend/local/server.ts`, `apps/backend/local/analysis.test.ts`, and the
shared frontend `selection-panel.tsx`. Owning source-of-truth/index updated;
existing CL-080 edits and its design-walkthrough opt-in are preserved.

The focused fake/paid-off/network-blocked command passed **98 tests in four
files**: analysis, owner-local routes, hosted workflow and manual time. New
regressions cover exactly 60 seconds, 60.001 seconds rejected before any
transcription/selection call in synthetic/provider-labeled injected modes, and
legacy 75-second saved inputs readable but rejected on new submission. Existing
advisory-result/reuse cases pass. An initial sandbox run could not read Vitest
temporary modules; the passing rerun used the same isolated configuration outside
the sandbox with one worker. No real provider transport was created.

Frontend TypeScript, no-ambient-Node local contracts, local workspace TypeScript,
affected ESLint/Prettier and whitespace checks pass. Read-only settled-diff
validation: **Meets ticket; no actionable findings**. Verified shared enforcement,
pre-dispatch rejection, restore compatibility, dependency direction, one schema/
ceiling, unchanged paid acceptance and absence of new lifecycle ownership.

Backend shutdown captured its live tree, sent the graceful console signal and
verified all owned descendants plus ports 4000/4200 absent through two checks.
Contracts rebuilt, and normal backend startup rebuilt the current worker/overlay.
Replacement backend PID 22944, worker 17728, supervisor 11732; frontend PID 17564
and supervisor 10400 preserved. Runtime record and content-safe logs are outside
Git under `C:/Users/minat/AppData/Local/Temp/clipbuilder-run-20261026/`.

Owner browser/responsive and real-provider acceptance remain unperformed; the
pre-existing broad intake proof limitation is recorded in CL-080. No new visual
acceptance is claimed. No environment/media changes, staging/commit, provider
calls, deployment or cloud checks. No scope deviation.
