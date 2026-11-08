# CL-267 — Hosted Hook titles enabled; Find visuals disabled

Status: implemented; scoped fake/no-key verification and read-only validation
complete, 2026-11-08. Not deployed; real Gemini acceptance remains separate.
Depends on implemented hosted editor/Hook-title opt-in and CL-264's capability
review. The owner's decision is to keep manual Find visuals unavailable when
deployed, but enable AI Hook-title generation there.

## Behavior and scope

- Advertise Hook-title availability from explicit hosted composition, enabling
  the existing Generate title opt-in/controls without a new route or frontend
  mode. Missing title providers remain unavailable; no generation on startup.
- Route each new title request through the existing per-session/runtime and
  durable provider-operation charge before inference. Preserve operation-ID
  receipt reuse, clip/revision/range guards, cancellation and explicit retry.
- Keep visualDiscovery false for hosted UI and reject explicit hosted Find
  visuals requests before work. Automatic initial clip visuals, editing/uploaded
  pictures and local Find visuals remain available under their current gates.
- Preserve authentication, same-origin/CSRF, three-clip/cooldown/resource limits,
  provider isolation, normal Codex app/configuration and saved media. No provider
  call, deployment, cloud change or Git action is authorized by this fix.

## File plan and verification

Hosted workflow/composition, existing hosted unit/browser tests and narrow owning
docs own the change. No browser contract shape, native job or normal local worker
composition needs to change. Record the decision in the source of truth and
update CL-264's previously observed wiring gap and the ticket index.

Use injected fake/no-key/paid-off transports through actual hosted HTTP/cookie/
CSRF boundaries. Verify the two capability flags, title success and explicit
opt-in, one provider reservation per new request, zero additional reservation on
receipt replay, failure/budget/ledger rejection before inference, and no title
call during capability reads or clip startup. Hosted visual requests must fail
with zero provider/native work, including owner exemption. Run the existing
hosted editor/browser proof and relevant Hook regressions, scoped types/lint/
format, then read-only review. No real Gemini quality or live-deployment check.

The UI and request mechanics work with fake injected providers and no API keys.
Real deployed titles require the existing Gemini key/live approvals and hosted
readiness; this source fix does not deploy or enable those operational gates.

## Implementation and verification — 2026-11-08

- `hosted-runtime.ts` explicitly enables Hook titles in its existing ready Gemini
  composition. `hosted-workflow.ts` advertises that flag, defaults unconfigured
  title availability off and guards title dispatch accordingly. Every new title
  reserves a provider operation before inference; an abort after ledger waiting
  cannot dispatch. Existing title receipts, revisions and attempt limits remain.
- Hosted visualDiscovery is explicitly false and manual `/visuals` POSTs return
  404 before session/provider/native work, including owner exemptions. Initial
  automatic picture planning/search/generation remains composed and metered;
  authenticated unit preparation still produces its synthetic initial picture.
- Existing frontend capability propagation and Hook controls need no changes.
  No new application route, local composition/native contract change, normal app
  restart, configuration edit or saved-media mutation was needed.
- The existing hosted proof had stale picture-button selectors and a timing
  pixel probe intersecting changing caption glyphs. It now uses current picture
  timeline buttons and samples inside the picture above the caption. Loading
  overrides live in the initial fetch wrapper because the poller captures fetch
  on mount. These are synthetic harness corrections, not product changes or
  weakened assertions. Temporary diagnostics were removed.

Passed checks, with hardcoded fake/paid-off environment, no env-file loading and
network interception:

- Hosted workflow: 19 cases. Covers capability reads/startup with zero title
  work; explicit success, invalid range/stale revision, identical receipt replay,
  ordinary/exempt visual rejection, runtime budget exhaustion, ledger failure
  before inference, and provider failure without automatic retry. One additional
  provider charge per fresh title; no extra charge/call for receipt replay.
- Hosted readiness and clip-batch regressions: 60 cases. Existing title planner,
  debounce/cancellation/revision guards and real-host HTTP/Apply: seven cases.
  Total focused unit cases: 86.
- Existing generated-media hosted editor proof: passed end to end. Actual
  same-origin cookie/CSRF HTTP enables an initially unchecked title choice,
  returns one visible synthetic title on opt-in and supports Discard. Find
  visuals remains disabled; no extra transcription, picture plan/image or native
  job starts for the title. Fresh compiled overlay/native export and loading/
  failure/cancel/preview-readiness checks pass. A native preparation run failed
  while type/lint checks overlapped; the final isolated run passed in 32 seconds.
- Existing Hook-options browser proof: passed, including cancellation, Apply/
  Discard, reload and desktop/tablet/phone controls. Both browser proofs use
  generated fixtures and isolated browsers, preserving the owner's running app.
- Local and test TypeScript checks, scoped ESLint/Prettier and Git whitespace
  checks passed. Read-only validation of CL-267's unstaged production/test/docs
  scope found no actionable issues: capability wiring, provider isolation,
  resource/authentication boundaries and cleanup remain intact. CL-264's earlier
  comparison expansion is separate context; only its follow-up decision changed
  here. No staging or commit was performed.

These checks establish fake/no-key mechanics, not real Gemini title quality or
live hosted readiness. Real titles still require Gemini credentials, enabled
live flags, approvals and normal hosted readiness. No provider/cloud request,
deployment or real processing was performed.

The owner's subsequent explicit staging/commit request is allocated in
[CL-268's whole-file plan](CL-268-local-gemini-source-duration.md#owner-authorized-whole-file-commit-plan--2026-11-08).
Its first group contains all five CL-267 files; shared authority/index docs are
committed in the final documentation group. No extra provider action/deployment.

Commit gate: 272 cases passed across twelve focused fake/no-key suites covering
both pending features and shared clip/Hook regressions. All 23 allocated files
pass Prettier; changed TypeScript passes ESLint, contracts/local/test TypeScript
and Git whitespace checks. The first sandboxed Vitest attempt failed on missing
temporary module-cache files before running any tests; an explicitly escalated
run passed. Production/test source is unchanged from the recorded native/browser
proofs, which were reused without another real pipeline or paid request.
