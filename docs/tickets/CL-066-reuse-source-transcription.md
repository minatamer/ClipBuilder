# CL-066 — Reuse completed source transcription

Status: implemented and locally validated. Dependencies: implemented CL-060/061
analysis and shared host. Live quality/savings acceptance remains owner-manual.

Owner request — 2026-10-25: implement the transcription-reuse recommendation;
leave every other Gemini optimization and setting unchanged.

Commit handoff — 2026-10-25: this packet was initially numbered CL-064 in the
local working changes. CL-064 already belongs to the isolated quality audit;
CL-065 belongs to its security audit. Renumber this packet CL-066 and preserve
those existing audit identities. The owner now explicitly authorizes staging
and cohesive local commits of the current pending work; earlier no-Git statements
below record implementation-time scope. No push or deployment is authorized.

Authority: [permanent Gemini acceptance](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#permanent-gemini-acceptance-decision--2026-10-24)
and [shared hosted workflow](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#shared-uploadeditor-release-decision--2026-10-24).

Acceptance:

- Reuse successfully decoded source words across explicit analysis requests in
  one workspace, including changed ranges/count/duration and manual-only requests.
  Bind reuse to source fingerprint, source revision and AI mode. Keep selection
  fresh for each explicit request; report actual per-request provider call counts.
- Retain transcription before selection, so selection failure or cancellation
  does not require another transcription on explicit retry. Failed/undecodable
  transcription is not reusable. Keep existing critique-only quality checks and
  structural/resource guards; add no automatic provider retry.
- Seed reuse from an existing saved draft's completed analysis. New checkpoints
  remain session-local and follow workspace clear, expiry and shutdown cleanup;
  add no new durable store, cross-session cache or hosted retention.
- Preserve UI, models, prompts, token/thinking/video/image settings, provider
  budgets, saved media, configuration and unrelated pending changes. No usage
  telemetry, FFmpeg work, provider/cloud request, deployment or Git mutation.
- Verify exact fake transcription/selection counts, repeated/failed/canceled
  requests, identity/mode isolation, empty output, restored analysis and lifecycle
  cleanup. Run focused local tests, local/backend/test types, changed-file lint,
  format and read-only validate. Check the normal app stays reachable.

All agent tests use synthetic/fake, paid-off, network-blocked composition without
API keys or ignored env reads. Real transcription/selection still needs the
owner's configured key, live flags and deliberate owner testing; fake results
do not establish live quality or measured savings.

Owner follow-up — 2026-10-25: make reuse directly verifiable in content-free
logs and review transcript integrity thoroughly. Verify mutation isolation,
stale/rejected inputs, concurrent requests and actual HTTP cancellation, along
with the original reuse/restore/lifecycle checks. Keep other Gemini settings and
provider-spend restrictions unchanged.

## Implementation and verification — 2026-10-25

- `apps/backend/local/analysis.ts` accepts an optional workspace-owned transcript
  checkpoint. Fingerprint, source revision and mode must match before reuse.
  Existing structural/unique-ID validation and advisory quality critiques remain.
  A private words snapshot is retained before selection, including cancellation
  after completed transcription. The existing response reports transcription
  calls as zero on reuse; selection still runs for each explicit AI request.
- `apps/backend/local/server.ts` owns the bounded workspace map. Verified saved
  analysis seeds it on reopening; failed selection does not overwrite completed
  analysis or lose its new transcript. Clear, expiry, failed restore and shutdown
  release checkpoints alongside existing workspace state. No persistence schema,
  UI, provider adapter, model/prompt/setting, budget or native code changed.
- **89 tests in 7 files pass**, fake/paid-off/network-blocked:
  `analysis.test.ts`, `hosted-workflow.test.ts`, `draft-store.test.ts`,
  `workspace-drafts.test.ts`, `owner-local.test.ts`, `owner-editor.test.ts` and
  `owner-provider-host.test.ts`, using `scripts/local-test.config.ts` with two
  workers. Exact counts cover changed inputs/manual-only work, selection failure
  and abort, empty transcription, invalid/failed transcription, fingerprint/
  revision/mode isolation, clear/expiry and saved-draft reuse on a new host.
  Shared hosted admission/clip retry and temporary listener/file cleanup pass.
- Local, backend and test TypeScript checks, six changed-source ESLint checks,
  repository Prettier checks and `git diff --check` pass. Markdown follows the
  existing repository format and its normal Prettier exclusion. The first test
  attempt hit Windows sandbox temporary-transform file errors before running
  tests; the same deterministic suite passed outside the sandbox. No application
  behavior or provider/test safety flag was changed to work around that failure.
- Non-metered normal-app GET checks return **200** for backend health, `/start`
  and `/api/sample/config`. No native/contracts change required a worker rebuild;
  the normal development watcher loads the backend source. Owner configuration,
  saved media/drafts/exports and the running frontend were preserved.

Read-only validate: **Meets ticket — no actionable findings**. Reviewed this
unstaged packet's complete source/test/doc diff and the new ticket against its
acceptance, source binding, dispatch counts, abort ordering, saved restore,
cleanup, architecture and privacy. The earlier loader-dot change/CL-062 evidence
and deferred hosted-release checklist were excluded and preserved. No new schema,
dependency, debug logging, automatic retry or cross-session cache was introduced.

Deviations: none. Real Gemini quality, compatibility and measured bill savings
remain unverified; the owner must deliberately test with configured keys/live
flags and approvals. Native/browser rendering and cloud deployment were not
repeated for this analysis-only change. No API credits, provider/cloud request,
configuration change, deployment, staging or commit occurred.

## Owner integrity/logging follow-up — 2026-10-25

- Added the allowlisted backend analysis phase `transcription_reuse` and a
  content-free success message after the cached words pass existing structural
  checks and cancellation guards. The phase shares the `find_moments` request
  ID and existing bounded, non-fatal diagnostic sink. It contains no words,
  timings, source fingerprint, workspace ID, media path or filename. No contract,
  worker, provider setting or UI change was needed. The local workflow guide
  documents the new POST response and backend-log checks.
- Reviewed the complete source-to-cache-to-clip path: schema parsing copies the
  provider words, the checkpoint gets its own copy, each reuse parses a new
  working copy, and clip cues copy/rebase words without changing source clocks.
  Mutating provider buffers, returned result words, caption cues and even the
  selection adapter's working words during failure leaves the checkpoint
  unchanged. Repeated ranges produce correct clip-relative cues from the same
  complete source transcript.
- Regressions now exercise canceled/stale/out-of-source requests after a
  checkpoint exists, cancellation arriving with completed transcription, actual
  HTTP disconnect during selection, rejected concurrent analysis/clear, and
  explicit retry with exactly one total transcription. Failed reselection leaves
  the prior successful analysis intact. Saved-draft tests cover both same-mode
  reuse and changed-mode fresh transcription using injected fake adapters.
- Final verification: **102 tests in 8 local files plus 17 existing backend
  diagnostic tests pass (119 total)**. Local/backend/test TypeScript checks,
  changed-file ESLint and repository Prettier/whitespace checks pass. The log
  integration check verifies marker timing, request correlation, the managed
  diagnostic parser, absence of transcript/source content and exact provider
  counts. Existing diagnostic tests cover privacy, record bounds and sink failure.
- Read-only validate: **Meets ticket — no actionable findings** after the
  expanded integrity review. The new logger is the only added production
  behavior in this follow-up. Original settings/budgets and unrelated pending
  loader/release-document changes remain preserved. No native/browser render
  proof is claimed for this backend analysis/logging change.

Limits remain explicit: the original transcript's AI accuracy is unchanged;
reuse preserves it rather than repairing provider mistakes. New checkpoints
remain session-local; empty decoded output stays reusable under the existing
owner acceptance rule. No paid/provider/cloud test, deployment or Git mutation
occurred. Real-mode owner acceptance still requires configured keys/live flags
and deliberate owner action.
