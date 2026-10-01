# CL-003 — Build the canonical session and sample foundation

Status: Completed locally - second-review fixes verified; side-chat revalidation requested<br>
Milestone: M1 — deterministic sample story<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-001<br>
Blocks: CL-004, CL-005, CL-006<br>
Suggested commit: `CL-003: build the canonical sample session`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

**Later migration handoff (2026-10-01):** the verified fake reducer/projection
and fixtures remain unchanged. Source-of-truth section 0.9 and CL-005 now own
browser-local artifact authority/recovery, generation/capability/config migration
and protected process-local admission. Do not copy the older planned server
object/job assumptions into real mode or treat fake session recovery as proof
of OPFS/IndexedDB/provider-result recovery. Preserve the cleanup fence and
safe legacy projection migration while replacing only the necessary semantics.

Implement the single canonical frontend workflow reducer, allow-listed session
persistence and restore reconciliation, rights-safe deterministic sample data,
and fake operation/provider foundations needed for the no-cost signature path.

This packet keeps state authority and sample fixtures together because the
first real state machine must be exercised by valid production-shaped data,
while fixtures without legal transitions and restore behavior are inert test
data rather than a usable foundation.

## Portfolio value

Make the product's central promise demonstrable with no credentials or paid
calls while showing disciplined state modeling, adversarial restore handling,
grounded evidence, and honest sample provenance.

## Standalone implementation context

- One `ClippingSessionState` reducer is the only browser workflow authority.
  Routes, components, request hooks, and storage never mirror `stage`.
- Top-level stages run from `bootstrapping` and `intake` through upload,
  analysis, candidates, assembly, clip review, render, result, clear, expired, and
  fatal states. This ticket implements and tests the complete transition model
  even though later screens/actions arrive later.
- Persistence is a frontend-owned `ClippingSessionProjectionV1` in
  `sessionStorage`, capped at 256 KiB and reconciled against server evidence.
  Runtime handles and content-heavy data never enter it.
- The sample is purpose-recorded/rights-cleared before media enters deployment.
  Git may contain a lightweight poster and normalized synthetic/precomputed JSON
  fixtures; the long sample video belongs in a versioned private bucket later.
- Sample start produces deterministic candidates with no transcription, text
  model, active-speaker, or image call. It must be visibly sample/fake data in
  nonproduction and must not pretend AI ran for that visitor.

## Dependency evidence required

Confirm CL-001's contracts parse/build in both applications, fake/paid-disabled
composition is enforced, tests deny unexpected network, and the declared
frontend/contracts/backend dependency direction passes. Do not duplicate or
silently replace its schemas/configuration.

## Files and areas owned

- Frontend session reducer, events, selectors, provider, persistence schema,
  projection, and reconciliation tests.
- Source-controlled sample manifest/poster README and allowed lightweight
  assets.
- Backend/demo fixture modules, fake clock, fake operation sequences, and
  production-shaped sample analysis/assembly metadata.
- Shared synthetic fixtures under `tests/fixtures` for transcripts, candidates,
  active-speaker tracks, visual plans, assemblies, failures, and injection.
- `docs/operations/MEDIA_RIGHTS_RECORD.md` template/record without private
  contributor information or unapproved media.

## Scope boundaries

### In scope

- Full legal/illegal workflow transition table and nested async states.
- Safe restore for empty, valid, corrupt, oversized, stale, expired,
  unknown-version, and server-conflicting projections.
- Explicit effect ownership for storage, object URLs, polling, and future
  cleanup; runtime effects remain outside reducer/persistence.
- Normalized transcript and a deterministic three-candidate sample fixture plus
  no-candidate, invalid-reference, duplicate, invented-claim, prompt-injection,
  timeout, and provider-error variants.
- General candidate schemas accept zero to four reconciled candidates, target
  three strong choices, and never require weak padding.
- Purpose-recorded sample manifest fields for version, SHA/generation placeholders,
  provenance, analysis/assembly revisions, and every precomputed asset.
- Fake provider/job/storage call counters and deterministic clock behavior
  needed by later tickets.

### Out of scope

- Production landing/candidate UI (CL-004), live upload/storage (CL-005), real
  job/process code (CL-006), live adapters (CL-007 onward), automatic
  review/render UI, or
  cloud upload of the sample.
- Committing a large or unapproved sample video, real transcript, contributor
  identity, signatures, private license copy, provider payload, or generated
  asset without recorded rights.
- A second route state machine, global store abstraction, durable backend
  session store, database, or generic fixture service.

## Implementation checklist

### 1. Canonical state and selectors

- [x] Implement every top-level state and legal event from the source-of-truth
  table as a strict discriminated union.
- [x] Reject invalid transitions without coercing forward; emit only a
  content-free development diagnostic code.
- [x] Derive stage title, available actions, blockers, current progress, and
  clearability through selectors rather than duplicate state.
- [x] Keep upload/playback/cleanup transient status in named nested
  discriminated states.

### 2. Safe persistence and restore

- [x] Persist only the allow-listed projection: content-free IDs/revisions,
  stage hint, selected candidate ID, immutable automatic-manifest ID/hash, and
  read-only preview playback time.
- [x] Exclude media/transcript/rationale copies, filenames, blobs, URLs,
  cookies/grants, provider/SDK objects, errors/stacks, Turnstile tokens,
  timers/listeners/controllers, and raw tracks/assets.
- [x] Enforce serialized size before parse, strict schema/version/expiry after
  parse, and server-evidence reconciliation before restore.
- [x] Clear projection and every locally owned effect on clear/expiry/fatal
  reconciliation.

### 3. Sample and adversarial fixtures

- [x] Define a valid normalized transcript with stable word IDs and immutable
  timing evidence.
- [x] Provide exactly three materially distinct ranges for the curated sample;
  enforce zero-to-four general bounds, grounded evidence/caveats, and no weak
  padding, numeric virality score, or invented quote.
- [x] Include one purpose-recorded story that can later demonstrate one-face,
  wide two-person, camera-cut, Earth/Moon, and exact-equation behavior without
  hard-coding those subjects into generic logic.
- [x] Provide valid precomputed shot/focus/visual/assembly shapes for sample
  mode and invalid variants for reconciliation tests.
- [x] Record sample media and every visual asset as pending until rights and
  redistribution approval exist; do not add unapproved binaries.

### 4. Deterministic fakes

- [x] Implement fake clock/IDs and production-shaped fake interfaces without
  network or credentials.
- [x] Count calls and reject unknown fixture keys instead of silently returning
  success.
- [x] Support abort, deterministic latency, monotonic operation stages,
  terminal immutability, and explicit failure fixtures.

## Contracts and state transitions

- `SAMPLE_SELECTED` enters a proven sample candidate/preparation state without
  paid work.
- Manual/live file selection remains in memory and does not enter persistence.
- Illegal examples—rendering without a server-proven manifest, browser manifest
  substitution, analyzing before inspection, or restoring a missing output—
  remain rejected.
- No editor state, proposal status/history, caption correction, or undo/redo
  state belongs in the reducer or persistence projection.
- Sample fixture objects parse through the same public schemas later used by
  backend responses and provider reconciliation.

## Privacy, rights, provider, and cost constraints

- Use only synthetic or explicitly approved purpose-recorded content. Never
  substitute arbitrary internet/media assets.
- The rights record may reference where private consent is held but must not
  commit signatures, addresses, account data, or other private evidence.
- No live adapter, credentials, remote storage, media upload, cloud job, or
  paid call belongs in this ticket.
- Fake sample state must be labeled honestly and cannot fall back from a live
  failure in production.

## Acceptance criteria

- [x] Every legal transition and representative illegal transition has focused
  reducer coverage.
- [x] Restore safely handles empty, valid, corrupt, oversized, stale,
  unknown-version, expired, and server-conflicting projections.
- [x] No forbidden runtime/content/capability value can serialize into session
  storage.
- [x] The three-candidate sample, one/four-boundary fixtures, and no-candidate
  fixture pass production schemas and deterministic grounding/reconciliation.
- [x] Invalid references, overlap/duplicates, invented claims, virality promise,
  and injection fixtures fail with safe rule evidence.
- [x] Fakes run with no network/credentials, honor abort/time, count calls, and
  never mask an unknown fixture.
- [x] Sample provenance/rights state is explicit; no unapproved large media or
  visual asset enters Git.

## Focused verification

- [x] Run contracts plus frontend reducer/persistence/reconciliation tests.
- [x] Run fixture validation and fake call-count/abort/clock tests.
- [x] Inspect serialized projections for the forbidden-field sentinel matrix
  and enforce the 256 KiB limit.
- [x] Run affected lint/typecheck/build commands.
- [x] Scan tracked changes for real media/content, credentials, signed URLs,
  filenames, and provider payloads.
- [x] Run `git diff --check` and inspect status without staging or committing.

## Documentation updates

- Add the media-rights record with honest pending/approved fields.
- Document fixture revisions and how later packets may update them without
  replacing the sample in place.
- Update parent and affected tickets if sample rights, recovery privacy, or
  state behavior changes materially.

## Completion evidence — 2026-09-30

- The canonical reducer now follows candidates → assembly → read-only
  `clip-review` → render confirmation, with no editor, manual range, proposal,
  caption correction/style, history, undo, or redo state/events.
- The session projection contains only content-free identity, stage, operation,
  analysis, selected candidate/range, assembly, automatic-manifest ID/hash,
  playback time, and result references. It stores no manifest body or content.
- Restore compares the projected automatic-manifest ID and hash with
  `GET /v1/session` evidence before rebuilding clip review without restoring
  the content-heavy assembly body. The 2026-10-01 correction below preserves
  prior render failure and requires fresh server retry/allowance evidence
  rather than converting it into a new render confirmation.
- Coherent newer server evidence advances stale in-flight projections to the
  furthest safely representable candidates, assembly, clip-review, rendering,
  or result state without repeating work; server-behind or conflicting evidence
  still fails closed.
- Per-effect cleanup now stops and unregisters owned pollers, timers, or abort
  work exactly once, while registry-wide cleanup retains the same guarantee.
- Shared contracts accept zero to four candidates (target three), expose the
  fixed `clean-emphasis` automatic manifest, reject `manual` assembly selection,
  and accept only the server-proven manifest hash for render requests.
- The synthetic catalog validates zero, one, curated three, and maximum-four
  candidate outcomes, plus the selected candidate's immutable sample assembly.
- Verified from the repository root with `corepack pnpm format:check`,
  `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`,
  and `corepack pnpm build`; `git diff --check` passed and the change scan found
  no media binaries, credential patterns, or signed URLs.
- No Git action, provider call, credential use, cloud change, deployment, or
  paid operation was performed.

## Independent validation follow-up - 2026-10-01

The owner requested an independent recheck of nine findings against the current
worktree. The initial worktree was clean at `d4c6c2f`. Reviewed the root and
frontend instructions, this complete packet, its relevant requirements, and
the local history in `24534fc`, `af0b7d9`, `1af0794`, and `d4c6c2f`.
CL-001 dependency evidence includes nine passing boundary/pre-import tests,
contracts compilation, and both applications' no-emit typechecks. No later
production screen, HTTP adapter, job runtime, or provider was implemented.

Independent reproduction command (before implementation fixes):

```text
corepack pnpm exec node node_modules/vitest/vitest.mjs run --config apps/frontend/vitest.config.ts apps/frontend/src/features/session/session.regressions.test.ts apps/backend/src/demo/fakeFixtures.test.ts apps/backend/src/demo/sampleAnalysis.test.ts
```

Result: 14 failed and 14 passed tests across three files. All nine reported
behaviors reproduced using source-controlled synthetic data, top-level
fake/paid-disabled test composition, and the existing network guard. The
additional failures cover three operation kinds and both successful and failed
overlapping fake completion. The fixes are verified by new regression cases,
not solely by the pre-existing passing suite.

### 1. Restored candidates cannot continue

- Requirement: sections 4.6, 5.1, 5.6, and 20.3 require refresh-safe candidate
  selection from the normalized bundle without repeating analysis.
- Reproduction: project candidates, reconcile matching server IDs/revision,
  then attempt `ANALYSIS_SUCCEEDED`; the reducer rejects hydration and retains
  `bundle: null`. Selection/build remain unavailable.
- Root cause: `af0b7d9` intentionally excluded content from storage but provided
  no read-result event; `d4c6c2f` retained that gap.
- Fix: `ANALYSIS_REFRESHED` accepts a runtime-validated bundle only for the
  current session and server-proven analysis ID/revision. It restores candidate
  or honest no-candidate readiness, validates a failed assembly's locked range,
  and never starts an analysis operation. Selectors block unloaded candidates.
- Verification: `session.regressions.test.ts` covers restore -> hydrate ->
  select -> build, foreign/stale/invalid/duplicate reads, clear/expiry races,
  no-candidate hydration, and assembly-failure recovery. Persistence still
  excludes the transcript. Outcome: confirmed, fixed within CL-003.
- Integration boundary: later candidate/request hooks load the existing
  `GET /v1/analyses/:analysisId` result and dispatch this event through the
  provider's existing dispatch API. The provider still restores content-free
  session evidence; production fetching/UI is CL-004/CL-007 work.

### 2. Polling can miss job completion

- Requirement: sections 5.3, 10.9, 14.7, and Appendix A require monotonic polling
  and resuming the same execution even when intermediate writes are missed.
- Reproduction: a schema-valid queued snapshot followed by succeeded is
  rejected; queued terminal-result events also cannot complete the workflow.
- Root cause: the browser used CL-001's single-step server transition relation
  for observed snapshots. Existing fake fixtures labeled queued work running.
- Fix: contracts now separately expose `canObserveOperationState`, using
  reachable lifecycle states. The server's `canOperationTransition` remains
  single-step. The reducer checks operation identity/kind, schema, stage order,
  and timestamp monotonicity and rejects terminal rewrites. A local cancellation
  request is a transient intent flag, preserving schema-valid server snapshots.
- Verification: new tests cover polling and direct success/failure events for
  analysis, assembly, and render; skipped running; cancellation races; stale
  timestamps/IDs/kinds; branch regressions; and terminal rewrites. Contract tests
  still reject a direct server queued -> succeeded transition. Outcome:
  confirmed, fixed within CL-003.

### 3. Progress-code vocabulary disagrees with the specification

- Requirement: Appendix B and sections 13.4, 13.5, and 13.15 define canonical
  namespaced pipeline codes for each kind.
- Reproduction: `analysis.queued` -> `analysis.transcribing` parses but is
  rejected as non-monotonic by the old frontend-only short-code table.
- Root cause: `af0b7d9` introduced a second vocabulary, retained by `d4c6c2f`.
- Fix: contracts own one operation-stage order for media inspection, analysis,
  assembly, render, and cleanup. Optional media inspection follows section
  13.4; transcribing/reusing-transcript share an ordinal as alternative paths.
  Sample fakes and frontend fixtures use the canonical names; queued snapshots
  have `state: queued` and `startedAt: null`.
- Verification: tests accept namespaced progress, reject unknown/regressing
  codes and switching transcript branches, and traverse all three composed
  sample-operation fixtures with schema-valid, increasing shared ordinals.
  Each fixture starts exactly one operation and makes zero analysis, assembly,
  or storage-provider calls. Outcome: confirmed, fixed within CL-003.

### 4. Assembly failure actions omit recovery

- Requirement: sections 4.7 and 5.3 require bounded build retry or choosing
  another moment while preserving the analysis.
- Reproduction: `ASSEMBLY_FAILED` yields only `clear` despite legal
  `RETRY_ASSEMBLY` and `CHOOSE_ANOTHER` reducer events.
- Root cause: selectors never mapped the assembly-failed state to those events.
- Fix: add `retry-assembly` and `choose-another` actions. Retry requires loaded
  analysis and a reconciled retryable failure; the reducer uses the same
  readiness guard. Choosing another returns to candidates without paid work.
- Verification: new tests dispatch both advertised events and verify restored
  failure -> hydrate -> retry and choose-another -> hydrate paths. Outcome:
  confirmed, fixed within CL-003.
- Allowance ownership: `SessionResponse.remaining` has no assembly counter.
  `SafeError.retryable` must be reconciled by the later assembly API against
  its bounded allowance/idempotency evidence (section 11.18); this change does
  not invent a browser counter or claim backend admission enforcement exists.

### 5. Retry readiness is lost in selectors and restore

- Requirement: sections 4.9, 5.3, 11.6, 11.18, and Appendix A restrict recovery
  to reusable inputs, retryable failure evidence, and remaining allowance.
- Reproduction: rejected media offers analysis retry despite `recovery: null`;
  nonretryable render failure offers retry; refreshing failed render with zero
  server attempts converts it into clip review with a new confirmation action.
- Root cause: selectors ignored the recovery guards and reconciliation dropped
  failure stages and `remaining` evidence.
- Fix: keep the latest server analysis/render allowances in runtime identity,
  excluded from the persistence projection. Failure events carry fresh
  allowances; permitted retries/render confirmation reduce local readiness.
  Restore preserves failure states and requires matching-kind terminal server
  error evidence before offering retry. Missing evidence stays conservatively
  blocked. Review/confirmation cannot regain readiness with zero attempts.
- Verification: tests cover media rejection; nonretryable and exhausted
  analysis/render recovery; matching terminal failure with one permitted retry;
  absent/nonretryable/zero-allowance restore evidence; analysis and assembly
  failure restore; and exhausted review/confirmation after refresh. Storage
  contains neither remaining allowances nor errors. Outcome: the first repair
  was partial; the second review found an in-flight saved projection still
  rejected its correlated terminal failure. The follow-up below reproduces and
  fixes that case. No claim of backend paid-admission or live protection.

### 6. Playback stops recording after its first update

- Requirement: sections 4.8, 5.5, and 5.6 require continuous read-only playback
  and the latest persisted preview position.
- Reproduction: request at 0, update to 100, update to 200; the second update is
  rejected and position remains 100.
- Root cause: `d4c6c2f` accepted updates only from `requesting`, then set
  `succeeded` after the first one.
- Fix: updates, failure, and cancellation apply to requesting or succeeded
  playback. Valid position values are nonnegative integer milliseconds;
  backward seeks are allowed. Failure/cancellation/clear reject late updates.
- Verification: new tests follow 100 -> 200 -> 50 and inspect each projection;
  cover NaN/infinite/negative/fractional positions, post-success failure/cancel,
  and late events after clear. Outcome: confirmed, fixed within CL-003.

### 7. Overlapping fake advances rewrite terminal evidence

- Requirement: checklist 4 and section 14.7 require immutable terminal evidence
  and explicit abort/time behavior.
- Reproduction: start A at 0, B at 50; resolve A at 100 and B at 150. B changes
  completion/update timestamps and, for failure, the safe request identifier.
- Root cause: `af0b7d9` checked terminal state only before awaiting the clock.
- Fix: recheck terminal state after waiting and check abort before any write;
  later writers return the same frozen terminal object.
- Verification: new tests cover overlapping success/failure, abort before and
  after sleep resolution, and one surviving overlapping waiter. They assert
  identical terminal object identity, one operation start, and zero pending
  fake waits. Outcome: confirmed, fixed within CL-003.

### 8. Evidence-note performance promises escape fixture validation

- Requirement: section 12.6 explicitly includes evidence notes/rationale in
  deterministic forbidden-performance-claim checks.
- Reproduction: a synthetic candidate evidence note with a guaranteed-virality
  promise is accepted by `validateCandidateFixture`.
- Root cause: the initial validator checked only title/hook/rationale copy.
- Fix: include all evidence and caveat notes in the existing fixture claim
  check, retaining content-free rule evidence and the existing copy checks.
- Verification: new evidence-note mutation is rejected with
  `candidate.performance-claim`; valid sample/boundary fixtures and the
  existing adversarial matrix still pass their intended assertions. Outcome:
  confirmed, fixed within CL-003. This validates synthetic fixtures only; live
  provider reconciliation remains later-ticket work.

### 9. Successful system-clock waits retain abort listeners

- Requirement: root cleanup constraints and section 14.8 require a cleanup
  owner for every timer/listener on success and failure.
- Reproduction: two successful zero-delay sleeps on a reused signal add two
  listeners and remove none.
- Root cause: `once` removed the anonymous listener only if abort fired.
- Fix: name the abort handler and remove it on timer completion and abort;
  abort also clears the timer. Already-aborted signals allocate neither.
- Verification: new tests match each removed handler to the registered handler,
  reuse a signal, abort pending waits, exercise pre-abort and no-signal waits,
  and assert zero remaining fake timers. Outcome: confirmed, fixed within
  CL-003.

### First remediation verification record (historical)

- `corepack pnpm format:check` - passed.
- `corepack pnpm lint` - passed.
- `corepack pnpm typecheck` - passed, including contracts build, root test
  typecheck, and both applications.
- `corepack pnpm test:unit` - passed: 150 tests across 15 files (root 11,
  contracts 38, frontend 56, backend 45). Every owning regression file runs in
  this gate under the shared top-level fake/network guard.
- `corepack pnpm build` - passed for contracts, backend, and the frontend
  production build. Fake/paid-disabled/all-live-disabled values were installed
  explicitly for this build and Next telemetry was disabled; no values printed.
- `corepack pnpm exec node node_modules/vitest/vitest.mjs run --config vitest.config.ts test/boundaries.test.ts test/pre-import-guard.test.ts`
  - passed, nine dependency/pre-import guard tests before implementation edits;
  the full gate reran them successfully after edits.
- `corepack pnpm exec node node_modules/typescript/bin/tsc --noEmit --incremental false -p packages/contracts/tsconfig.json`
  - passed; equivalent focused commands for backend and frontend passed after
  rebuilding the published contracts declarations.
- `git diff --check` - passed. Final changed-path/content scan: 18 files,
  zero media/binary paths, credential markers, signed-capability markers, or
  unsafe-cast/debug/TODO markers. Reviewed dependency direction, shared stage
  ownership, existing effect cleanup, new clock cleanup, and terminal writes.
- Reducer/restore/manual-state scenarios were exercised deterministically in
  tests, including success/failure/polling/refresh/clear/expiry and playback
  positions. No browser or visual-state verification is claimed; production
  screens and playable media remain later packets.
- No dependency install, staged change, commit, branch/history mutation,
  credential use, provider/paid call, cloud change, deployment, or long-lived
  application launch occurred. All verification processes completed. Changes
  are unstaged: 17 modified tracked files and one new regression test file.
- Deviations: none in product/architecture/privacy/spend scope. The completed
  analysis read-result event and fresh failure allowance fields are explicit
  foundation integration contracts for later request hooks. Actual API loading,
  assembly admission, media playback, provider integration, and cloud execution
  are not claimed as implemented by this correction.

### Second independent recheck - 2026-10-01

The side chat independently revalidated findings 1, 2, 3, 4, 6, 7, 8, and 9
as resolved. Its verdict was **does not yet meet ticket**: finding 5 remains
partial because terminal failure after saving an in-flight projection is
rejected, and a custom abort reason can escape the post-wait abort guard.
The earlier 150-test/build record above is historical, not evidence that these
remaining cases pass. Completion was reopened before edits. Independent
reproduction, narrow repairs, focused regression coverage, and a fresh required
final gate are recorded below. No second-review success is inferred from the
first verification record.

The side review's fresh checks were 81 tests across six focused files, scoped
ESLint, all three no-emit TypeScript checks, and `git diff --check`. It did not
rerun the full unit/build gate. It made no edits or Git mutations. The eight
resolved findings and their evidence remain unchanged unless new evidence
contradicts them.

#### A. Finding 5: failure after saving an in-flight operation

- Requirement: sections 4.1, 5.3, 11.6, 11.18, and Appendix A make server
  operation status authoritative and preserve proven reusable inputs for
  evidence-based recovery. A correlated failure is not an identity conflict.
- Independent reproduction: save `analyzing`, `assembling`, or `rendering`;
  refresh with the same operation ID/kind now `failed`, matching artifact
  IDs/revisions, and predecessor `provenStage` (`media-inspected`, `candidates`,
  or `clip-review`). All three return `restore.server-conflict`, which makes
  the provider clear the projection and dispatch nonretryable fatal state.
  The earlier tests started from an already-saved failure and missed this race.
- Root cause: reconciliation compared the in-flight required stage to the
  last proven artifact stage before considering correlated terminal failure.
- Fix: recognize only a failed operation with a safe error and the persisted
  operation ID, correct kind, and exact predecessor stage. Analysis also
  requires reusable media evidence. Existing artifact identity/revision/hash,
  stale, expiry, and identity checks still apply. Restore the corresponding
  failure state using current server error/allowances rather than clearing
  it or admitting fresh work. No provider or persistence schema change.
- Verification: three new tests round-trip storage -> reconciliation ->
  `RESTORE_VALID` -> failure projection, assert no clearing and preserved
  references, exclude error/allowance/content fields, hydrate assembly's
  matching analysis, and dispatch each allowed retry. Six further table cases
  cover wrong/missing operation evidence, wrong kind, success/cancellation at
  the predecessor stage, older stages, missing media, conflicting analysis/
  assembly/manifest proof, stale/expired sessions, and exhausted/nonretryable
  recovery. Existing success-forward reconciliation tests still pass.
- Outcome: independently confirmed and fixed within CL-003. Focused and full
  required local checks pass; side-chat revalidation is requested separately.

#### B. Custom abort reasons escape after clock resolution

- Requirement: checklist 4 and sections 14.7/14.8 require deterministic abort
  behavior, content-safe failures, unchanged aborted operation records, exact
  fake call counts, and cleanup on every timing path.
- Independent reproduction: use synthetic string, Error, and object reasons.
  Abort before the wait resolves: controlled `AbortError`. Resolve the wait,
  then abort before the async continuation: the raw caller reason is thrown.
  Both paths leave the record unchanged and pending waits at zero.
- Root cause: post-wait `AbortSignal.throwIfAborted()` rethrows arbitrary
  `signal.reason`, unlike the clock's existing safe `abortError()` factory.
- Fix: reuse that factory for the post-wait aborted-signal check; do not read,
  stringify, or propagate the reason. The terminal recheck remains in place.
- Verification: three new custom-reason table cases each exercise before/after
  resolution, assert the same controlled Error name/message and not the reason,
  unchanged record before/after a further clock advance, exactly one operation
  start, zero pending waits, and matching listener removal after resolution.
- Outcome: independently confirmed and fixed within CL-003. Focused and full
  required local checks pass; side-chat revalidation is requested separately.

#### Independent reproduction and focused checks

- Before repair, the new tests alone produced six failures and 30 passes across
  two files: all three in-flight failure restores and all three post-resolution
  custom-reason cases failed. All fixtures are synthetic; the shared top-level
  fake/network guard was active.
- Reproduction command:
  `corepack pnpm exec node node_modules/vitest/vitest.mjs run --config apps/frontend/vitest.config.ts apps/frontend/src/features/session/session.persistence.test.ts apps/backend/src/demo/fakeFixtures.test.ts`.
  After the narrow fixes, all 36 tests passed, before the additional negative
  and readiness coverage was added.
- Focused command:
  `corepack pnpm exec node node_modules/vitest/vitest.mjs run --config apps/frontend/vitest.config.ts apps/frontend/src/features/session/session.regressions.test.ts apps/frontend/src/features/session/session.reducer.test.ts apps/frontend/src/features/session/session.persistence.test.ts apps/backend/src/demo/fakeFixtures.test.ts apps/backend/src/demo/sampleAnalysis.test.ts packages/contracts/src/contracts.test.ts`.
  Passed: 93 tests across six files, including the eight previously resolved
  findings. This is current local evidence, separate from the side chat's
  earlier 81-test result and the first remediation's historical 150-test gate.

#### Fresh final verification record

- `corepack pnpm format:check` - passed.
- `corepack pnpm lint` - passed.
- `corepack pnpm typecheck` - passed, including published contracts, root test
  types, backend, and frontend.
- `corepack pnpm test:unit` - passed: 162 tests across 15 files (root 11,
  contracts 38, frontend 65, backend 48), under the shared top-level fake/
  network guard. This reruns all prior findings and the new restore/abort cases.
- `corepack pnpm build` - passed for contracts/backend/frontend. Build used
  fake, paid-disabled, all-live-disabled composition and disabled Next telemetry;
  no environment values printed and no long-lived application started.
- `git diff --check` - passed after normalizing only the two edited ticket
  documents to repository LF line endings. Final change scan: 18 files, zero
  binary paths, credential/signed-capability markers, or unsafe-cast/debug/
  leftover task markers in source. No media/content or provider payload added.
- Reviewed operation/artifact correlation, conservative server-behind rejection,
  forward-success reconciliation, unchanged dependency direction/persistence
  schema, shared abort-error reuse, terminal immutability, and waiter/listener
  cleanup. Deterministic state tests exercise the provider's reconciliation/
  dispatch/persistence primitives; no mounted-provider or browser/media test
  is claimed. All verification processes completed.
- This round changed only `session.reconciliation.ts`,
  `session.persistence.test.ts`, `fakeClock.ts`, `fakeFixtures.ts`,
  `fakeFixtures.test.ts`, this packet, and the index. The earlier eight resolved
  findings and all existing local edits were preserved. The complete changed
  file list follows; 17 tracked files are modified and one test is untracked.
- No dependency install, staged change, commit, branch/history mutation,
  credential use, provider/paid call, cloud mutation, deployment, or launch.
  Deviations: none in product/architecture/privacy/spend scope. Actual HTTP
  loading, browser/media verification, live adapters, paid admission, rights,
  visual approval, retention approval, cloud/deployment/release remain at their
  unchanged later-packet/owner gates below.
- Findings 1, 2, 3, 4, 6, 7, 8, and 9 remain resolved with the prior evidence;
  finding 5 and new issue B are now fixed and locally verified. Completion
  notice and a request for independent revalidation go to the same side chat
  under the human owner's explicit messaging authorization. Its next verdict
  is not yet claimed as produced by these local checks.

### Changed files

- `apps/frontend/src/features/session/session.types.ts`
- `apps/frontend/src/features/session/session.reducer.ts`
- `apps/frontend/src/features/session/session.selectors.ts`
- `apps/frontend/src/features/session/session.reconciliation.ts`
- `apps/frontend/src/features/session/session.test-fixtures.ts`
- `apps/frontend/src/features/session/session.reducer.test.ts`
- `apps/frontend/src/features/session/session.persistence.test.ts`
- `apps/frontend/src/features/session/session.regressions.test.ts` (new)
- `packages/contracts/src/operation.schema.ts`
- `packages/contracts/src/contracts.test.ts`
- `apps/backend/src/demo/fakeClock.ts`
- `apps/backend/src/demo/fakeFixtures.ts`
- `apps/backend/src/demo/fakeFixtures.test.ts`
- `apps/backend/src/demo/sampleAnalysis.ts`
- `apps/backend/src/demo/sampleAnalysis.test.ts`
- `apps/backend/src/demo/sampleFakes.ts`
- `docs/tickets/CL-003-build-canonical-session-and-sample-foundation.md`
- `docs/tickets/README.md`

## Owner gates and external blockers

The deterministic structure may complete without sample-media approval. Actual
sample video/poster/visual binaries and deployment remain blocked on the rights
gate. Mark that evidence unchecked rather than treating synthetic fixture data
as redistribution permission.

Still unchecked: owner approval for source video/poster/visual binaries and
their rights records; CL-002 visual approval; actual browser/media playback and
render/download output verification in later packets; approved normalized
analysis retention before live storage (source-of-truth section 14.4);
credential/provider/paid validation; cloud resources, upload, deployment, and
release checks. None is inferred from deterministic fixture validity or local
build success. These gates do not block CL-003's synthetic structure.

## Commit boundary

Keep CL-003 limited to canonical workflow state, safe persistence, fixtures,
and fakes in `CL-003: build the canonical sample session`. Do not absorb
production screens, upload, providers, media processing, or cloud work. No Git
action is authorized by this packet.

## Precision references

- [Canonical workflow and state transitions](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#5-canonical-workflow-and-state-transitions)
- [Shared transcript/candidate/assembly contracts](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#10-shared-contract-vocabulary-and-exact-limits)
- [Versioned sample asset and retention](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#143-versioned-sample-asset)
- [Rights and content rules](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#153-rights-and-content-rules)
- [Reducer and persistence verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#203-reducer-and-persistence-tests)
- [Synthetic/licensed fixture matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#206-syntheticlicensed-media-fixture-matrix)

## Completion handoff

Report state/event coverage, persistence allow/deny fields, restore cases,
fixture revisions, fake behavior and call counts, sample-rights status, changed
files, exact checks, and every blocked external artifact. Do not call the sample
rights-cleared unless the owner approved recorded evidence.
