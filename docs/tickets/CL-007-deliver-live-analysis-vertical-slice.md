# CL-007 — Gemini grounded analysis and candidates

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local implementation, all five root gates and the actual fake browser workflow passed, 2026-10-03. The owner explicitly deferred the separate renderer rollout and paid/live AI checkpoint, and authorized continuing dependency-ready local packets one at a time. Live acceptance remains unchecked.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Implement bounded Google proxy upload/process/structured analysis/delete, grounded transcript/anonymous turns/candidates, signed provenance, existing UI result commit/recovery and injected exact-call failure tests.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement this current packet and verify its locally possible synthetic behavior after approval.
- [x] Record exact tests/manual states, cleanup and all remaining rights/AI/cloud/license/device gates.
- [x] Verify the actual `FAKE_MODE=true`, API-key-free browser workflow and clean up its temporary services.
- [ ] Controlled live analysis checkpoint: explicitly deferred by the owner; do not infer authorization from fake results or earlier CL-006 permission.

## Local execution evidence — 2026-10-03

Dependencies: clean worktree at `db58981`; CL-006 committed local/Linux/private
foundation and CL-004 reusable candidate UI were present. Current migration
authority supersedes the collapsed Deepgram/browser-audio/server-job mechanics.
No adjacent assembly/preview/export packet was implemented.

Implemented protected grant/restore/upload/run/clear routes; bounded same-origin
bridge and direct runtime-only private upload; atomic action reservations and
Turnstile hostname/action/session checks; checksum/generation/profile validation;
one Gemini source call; strict normalization/reconciliation; signed source/result
integrity receipt; explicit Google deletion/404 verification and proxy release;
browser confirmation, truthful transfer copy, pending/uncertain recovery and atomic
result commit into the existing read-only candidate UI.

Source analysis uses compact word/turn tuples, server ordinal IDs, anonymous
labels and null confidence. Public title/hook/evidence copy is extractive;
rationale/caveats are contiguous source quotations or fixed editorial statements. Candidate
word references/order/evidence/ranks/sentence boundaries/10–60s/overlap/claims/
quotes are deterministic. Exact word overlap tolerance: 250ms accepted, 251ms
rejected for fake and Google labels. No model repair, trend evidence or padding.

Two metered action nonces are consumed: legacy `transcription` now means upload
admission, and `candidate-analysis` means prepare/one source AI call. The migration
does not permit a second candidate-only call. SDK 2.25.0's file uploader revealed
independent retry/abort defects, so its documented REST Files start/finalize is
bounded directly; generation/get/delete keep the pinned SDK with one attempt and
bounded responses. Browser intake's former chained digest was incompatible with
renderer SHA-256; it now uses bounded incremental standard SHA-256. Older local
records fail source revalidation safely. These are ticket-local implementation
choices, with no product/privacy/architecture gate changes.

One verification deviation: root ESLint included six pre-existing errors in
Git-ignored CL-006 private helper scripts. `eslint.config.mjs` now excludes
`private/**`, matching the existing privacy/Git boundary. Those files were not
opened or modified. No dependency installation or version change was required.

Focused evidence covers: valid and no-candidate API results, exact upload/prepare/
generation/release counts, duplicate race, tampered receipt/source/generation,
CSRF/disabled spend/expiry, malformed/malicious/quote/claim/reference/turn/range/
timing responses, refusal, cancellation, 90-poll cap, SDK wire/no-retry/deletion
proof, failed deletion obligation, bounded ingress, journal failure, committed
refresh with no calls, uncertain recovery, clear fencing and SHA-256 padding/
chunk boundaries. Private proxy read verifies bytes/hash and removes owned scratch;
failed release fences the session until its existing scheduled cleanup retry.
Google cleanup is scoped to the owning session. Failed reservation-journal
writes dispatch zero actions and remain visible; cloud-cleanup failure still
deletes local media, reports partial cleanup and permits cleanup-only retry.

Owner-directed review findings were reproduced before correction: valid browser
and renderer duration/fps differences caused rejection; reordered source words
could invent rationale/caveat assertions; Clear could delete before a late Google
upload finished; and grant refusal left an uncleared workspace without a session.
Regression checks now pass. Decoded duration/fps are authoritative for analysis,
while the original intake descriptor remains available for source reinspection.
Google cleanup waits for upload settlement and shares verified deletion with
analysis finalization. The browser journals whether remote cleanup is required;
only a never-admitted record accepts a missing session as already clean.

Settled root evidence (all exit 0):

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
git diff --check
```

Unit totals: root 20, contracts 44, composition 2, backend 117, renderer 23,
frontend 231: **437 tests across 50 files**. The build completed all five packages
and generated `/start` plus `/api/analysis/[action]`. Synthetic state checks
verified valid/no-candidate success, failure/uncertainty, source/result mismatch,
refresh without redispatch, abort/clear fencing, local deletion despite remote
failure and exact failed-release retry.

Actual fake browser evidence: temporary documented build/start services on
127.0.0.1:4000 and localhost:3000 passed health, `/start` and sample config GETs.
An isolated environment used fake/off flags, no credentials and a loopback-only
network guard. Prepared synthetic input produced three candidates; selecting
the second, keyboard selection, transcript/notes, refresh restoration, Proceed,
fixed read-only review and simulated export all worked. MP4 download remained
disabled because no validated video exists. Desktop and 390×844 result views
were inspected; the phone view had no horizontal overflow. Start over, refresh
after reset and preview cancellation returned to intake. This is fixture UI
evidence, not real media, challenge or AI-quality proof.

An initial dev-server attempt was disrupted by rebuilding watched packages and
Next HMR failure; its guard blocked one non-loopback attempt. It was cleaned up
and replaced with settled build/start services. The successful run recorded zero
external attempts. All 16 owned stable-run processes were stopped by verified
PID/creation-time identity; repeated checks found zero owned survivors and zero
listeners on 3000/4000. Content-free logs/runtime records are Git-ignored under
`private/cl007-fake-check/`; no app remains running.

Boundary fixtures and fake/off pre-import network guards passed. Final diff checks
found no cross-app imports, Node/provider dependencies in contracts/browser code,
duplicate cross-boundary schemas, unsafe casts, debug logging or stale TODOs in
the new modules. Tests verified bounded response readers, deadline/listener
cleanup, checksum chunk memory, renderer scratch removal and cleanup fencing.
All verification commands returned; temporary app services were cleaned up.

`FAKE_MODE=true` and no keys still provide synthetic development results. All new
tests use synthetic injected transports, fake/off process environment and zero
external calls. They prove engineering behavior and the fixture UI, not AI quality or real upload/
challenge/clock/device readiness. No local AI model is required or claimed.

Remaining unchecked: new renderer image build/rollout; Gemini key/model access,
paid-project terms, new AI audiovisual-transfer rights/approval and numerical
AI/cloud/build budget; real transcript/anonymous-turn/candidate quality; actual
clock/codec/proxy parity, full maximum-envelope stress, responsive/keyboard/zoom/
reduced-motion challenge/upload/device matrix, live deletion and interruption
behavior; public sample/release rights, complete license/font/codec/telemetry
notices and public paid/deployment controls. Provider cleanup obligations are
process-local; crash/uncertain upload can rely on Google's separate 48h Files
expiry, not an unconditional deletion guarantee. Later CL-008–011 work remains.

Reviewable next checkpoint: [controlled analysis check](../operations/GROUNDED_ANALYSIS_CHECK.md).
The owner deferred this checkpoint. It proposes one build/private revision update and one source analysis, with no
automatic retry or resource creation; budget/rights/data/external authorization
are still owner-only. No secrets/real media were read and no ADC/provider/cloud
action, usage polling, new independent review agent, staging or commit was performed.
CL-008 local engineering is dependency-ready under the owner's latest direction;
its live speaker-quality evidence retains a separate gate.

### Changed files

Pass-2 owner revalidation found one additional local defect: a failed remote
Clear followed by successful local deletion erased the only journal evidence,
and reload lost the React ref that tracked cleanup. It was independently
reproduced as a failing injected workspace test before correction. A separate
strict `remote-cleanup` IndexedDB key contains only version, allow-missing and
cleanup status, survives media/result deletion, and restores a cleanup-only state.
New source preparation is blocked while it exists; only confirmed remote Clear
plus committed acknowledgement removes it. Admitted work never weakens the
missing-session rule. Failed obligation persistence still attempts physical
media deletion and preserves the existing source evidence/recovery fence;
metadata transactions drain before releasing workspace ownership. React-only
cleanup refs were removed. No identity, content, receipt or capability is stored
in the independent marker.

Focused recovery/journal/session checks passed **103 tests across six files**,
including repeated remote failure across reload, zero analysis calls, successful
cleanup-only acknowledgement, denied journal writes, acknowledgement failure,
transaction commit ordering and corrupt/content-bearing marker rejection.
This is injected fake/off recovery evidence; the actual live Clear/challenge/
browser sequence has not been rerun and remains at the deferred checkpoint.
The combined CL-007/008 final suite now contains 478 tests across 52 files.
All five root checks and `git diff --check` were rerun after this correction.
The first root unit attempt hit the existing 10-second ESLint boundary-test
timeout; an unchanged serial rerun passed that gate in 4.76 seconds, followed
by all package tests and the five-package build. No timeout was increased.

Pass-3 owner revalidation found a second cleanup edge: successful remote Clear
expired the cookie, then a failed local acknowledgement left a marker that
retried remote Clear after reload and could never recover from `SESSION_MISSING`.
The real browser API with synthetic session/204/401 responses independently
reproduced the failure before correction. Remote confirmation now commits as a
separate marker status before local acknowledgement; confirmed markers retry
only local deletion/acknowledgement, including after reload. Local deletion
failure retains this confirmation. Legacy markers default to pending, and a
missing session still cannot acknowledge unconfirmed admitted work. Confirmation
and deletion transactions share the owned write queue. No new analysis request
is dispatched. If confirmation itself cannot commit before reload, cleanup
remains conservatively pending rather than claiming unproved deletion.

Focused recovery/journal/session checks passed **108 tests across six files**.
The new recovery test uses the real client API, explicitly observes the expired
session response and then completes reload recovery without another remote call.
Additional regressions cover unconfirmed missing-session fencing, local deletion
failure after remote success, legacy/confirmed restoration and invalid status.
The settled combined CL-007/008 suite contains **483 tests across 52 files**;
all five required root gates and `git diff --check` pass. This evidence uses
synthetic responses with fake/off configuration and no keys. The actual live
Clear/challenge/browser sequence remains at the owner-deferred checkpoint.

Owner-directed validation pass 4 reported no actionable findings on the settled
CL-007 snapshot over `db58981`. All pass-1/pass-2/pass-3 findings remain resolved.
The reviewer reran `corepack pnpm --filter @clipbuilder/frontend test:unit
src/features/media/browser.workspace.test.ts`: **23 tests in one file passed**;
`git diff --check` also passed. This was a read-only local review with synthetic
fake/off tests, no credentials, provider/cloud calls, launches or Git mutations.
The reviewer did not rerun the full root gates or the earlier browser session;
their evidence remains recorded above. The verdict covers CL-007's authorized
local scope only, excludes CL-008-specific additions and retains every deferred
live, durability, rights, device and release limitation. In particular, failed
confirmation persistence before reload remains conservatively pending.

- Backend: `apps/backend/README.md`; `src/app.ts`;
  `src/admission/{admission.composition,processing.admission,turnstile.verifier,turnstile.verifier.test}.ts`;
  `src/config/{env.schema,loadConfig.test}.ts`; `src/media/renderer.cloudrun.ts`;
  `src/http/routes/analysis.route.ts`;
  `src/analysis/{analysis.composition,analysis.provider-shape,analysis.reconciliation,analysis.test,analysis.usecase,gemini.adapter}.ts`.
- Frontend: `apps/frontend/README.md`; `src/app/privacy-dialog.tsx`;
  `src/app/api/analysis/[action]/{route,route.test}.ts`;
  `src/features/media/{browser.workspace,browser.workspace.test,source.worker,source.checksum,source.checksum.test,workspace.restore,workspace.schema,workspace.journal,workspace.journal.test}.ts`;
  `src/features/session/session.provider.tsx`;
  `src/features/sample/sample.experience.tsx`;
  `src/features/source-analysis/analysis-challenge.tsx` and
  `{source-analysis.api,source-analysis.flow,source-analysis.flow.test}.ts`.
- Renderer: `apps/renderer/README.md`; `src/app.ts`;
  `src/expiry/media-sessions.ts`;
  `src/media/{inspection,media-operations,media-operations.test}.ts`;
  `test/media-fixture.ts`.
- Contracts: `packages/contracts/src/{api.schema,cloud-media.schema,grounded-analysis.schema,media.schema,index}.ts`.
- Documentation/configuration: `eslint.config.mjs`;
  `docs/operations/{COST_MODEL,PROVIDER_SETUP,GROUNDED_ANALYSIS_CHECK}.md`;
  this packet and `docs/tickets/README.md`;
  status updates in `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` and
  `docs/architecture/{GEMINI_REMOTION_MIGRATION,MIGRATION_FILE_INVENTORY}.md`.

Initial CL-007 Git state: 53 ticket-related modified/new files. After CL-008 and
the pass-2/pass-3 local corrections, the combined worktree has 71 modified/new files;
index empty, no commit.

## File-level commit plan

The [seven-step CL-007/CL-008 commit plan](CL-007-008-COMMIT_PLAN.md) lists exact
whole-file staging commands and ticket-prefixed commit messages for the current
combined worktree. It covers 72 distinct files including the plan itself.
The owner authorized sequential execution on 2026-10-03. Implementation groups
1–5 were staged whole and committed in order; this ticket is the step-6
documentation checkpoint. Final completion is recorded in
[CL-008](CL-008-productionize-active-speaker-assembly.md#commit-execution-record).
The earlier unstaged worktree counts describe the pre-commit verification snapshot.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned; browser-owned execution revision, external gates pending<br>
Milestone: M3 - protected analysis<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004, CL-004A, CL-005 admission foundation and CL-006 audio proof<br>
Suggested commit: `CL-007: validate protected browser-owned analysis`<br>
Parent: [source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

**Execution authority:** this current packet and the linked browser contract
supersede the server-media mechanics retained below as history. No GCS,
generation/capability/lease, native media job or cloud-render acceptance item
survives by being left unchecked in that history. Preserve unchanged product,
grounding/quality, rights, secret handling, fake/off test and dependency rules.
No Git, provider, paid, install or cloud action is authorized by this document.

## Objective and boundaries

Use local extracted audio and bounded protected requests to obtain a normalized
timestamped transcript and zero-to-four grounded candidates. Target three/four
strong moments near one minute without padding; the visitor chooses exactly
one contiguous 10-60s word range. Reuse CL-004's gallery, local source preview,
smooth selection layout, transcript and read-only notes.

No original-video upload, server media job, GCS analysis bundle or durable
provider-result store. Backend cannot read OPFS/IndexedDB. Public paid traffic
stays gated on the current process-local admission limitations; no cookie-only
quota/idempotency claim. Provider data/cost approval is separate from code.

## Current implementation checklist

- [ ] Implement a dedicated bounded same-origin binary-audio route/use case,
      separate from the fixture-only 8-KiB JSON proxy. Enforce actual received
      bytes/profile/duration, capacity/body deadlines and safe abort cleanup
      before transcription. Hosting transport proof remains CL-015.
- [ ] Submit one approved Deepgram pre-recorded binary audio request, never a
      user URL/callback/file-store workaround. Exact call budget <=1; SDK retry=0.
      Project opt-out/retention settings and rights/data consent stay explicit.
- [ ] Validate provider response, normalize word IDs/speaker labels/timestamps/
      finite bounds and discard raw data. Diarization labels are not real
      identity or active-speaker visual inference.
- [ ] Return normalized transcript and authenticated provenance receipt bound
      to session/revision/hash/expiry. Cache success in bounded browser journal;
      backend holds no durable transcript or payload-recovery repository.
- [ ] Candidate request validates receipt/bounded submitted transcript and
      approved token/schema limits; one foreground Structured Outputs call,
      store:false, no background polling or automatic paid retry.
- [ ] Reconcile all word references/order/ranges/reasons against real normalized
      transcript. Handle zero candidates honestly; do not synthesize success,
      fake trend evidence or pad count/duration.
- [ ] Integrate process-local atomic action reservation and boot-epoch grants.
      Conflicting replay/stale cookie/restart/capacity/uncertain result fail
      closed; no paid re-dispatch from refresh/remount/network retry.
- [ ] Candidate retry is a separately allowed explicit action with transcript
      reuse and zero additional transcription, not implicit recovery.
- [ ] Commit validated browser results before advancing UI. Unknown/lost remote
      payload is a visible failure/uncertain result, not seamless resumability.
- [ ] Resolve actual immutable ranges against local source identity; clamp
      player seek/end/reset and reject mismatched cached source/revisions.

## Verification and acceptance

Own backend transcription/candidate adapters, ports/use cases/routes and receipt
validation; frontend result hydration, analysis status and candidate integration;
shared schema additions only at cross-boundary ownership. No application import
reads env/media, listens, contacts providers or obtains credentials.

- [ ] Fake/injected tests assert exact zero calls on every rejected case and
      exact allowed transcription/candidate counts, including duplicate races.
- [ ] Corrupt receipts, malicious transcript text, oversized payload/token limits,
      provider timeout/disconnect, stale epoch and result-loss paths covered.
- [ ] Refresh of committed local success makes zero new calls; in-flight/lost
      work does not automatically retry. Clear fences late response publication.
- [ ] Existing UI/notes remain timestamp-grounded, responsive and read-only;
      source remains on device, no provider/raw content enters logs/errors/URLs.
- [ ] Run focused adapters/contracts/session/component/browser checks and all
      five root gates; document every rights/provider/privacy/spend/runtime gate
      still unchecked. Live checks require specific owner call/budget permission.

Update provider/retention/cost guides with actual adapter options and results.
Paid model availability, language quality and audio-profile transcription parity
are not proven by fake contracts. No speaker assembly/visuals/render here.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-007 — Deliver the live-analysis vertical slice

Status: Planned<br>
Milestone: M3 — live analysis<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004, CL-004A, and CL-006<br>
Blocks: CL-008, CL-009, CL-012<br>
Suggested commit: `CL-007: deliver grounded live analysis`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): [CL-004A](CL-004A-prepare-third-party-provider-readiness.md)
and [provider setup](../operations/PROVIDER_SETUP.md) own the dashboard/key/data/
budget walkthrough. Inspect its documentation handoff before implementation;
actual account readiness is needed only for separately authorized local provider
checks. Build/test adapters with fake ports/transports here, with no GCloud
setup or credentialed cloud execution. Full cloud flow proof stays final CL-015.
Update the exact Deepgram endpoint and model-improvement opt-out request policy
with fake request proof; do not invent an env flag or infer privacy from a key.

Latest owner clarification (2026-10-01): CL-004 owns the complete development-
only frontend preview and its reusable screens. This packet replaces the fake
adapter with its real implementation and proves integration, media, recovery,
privacy/rights/spend/readiness gates; it does not recreate the workflow UI.
Earlier restrictions on synthetic progress apply to real/public mode, not the
explicitly labelled local preview. Fake completion is not evidence for this
packet's unchecked acceptance. See the parent development-preview clarification.

Owner UI/content revision (2026-10-01): reuse CL-004's one changing workspace
and shared Progress. Show one known analysis-stage message, never invented
percentages or timed fake work. Prefer complete interesting moments near 60
seconds when earned, targeting three to four strong choices without padding;
zero-to-four/no-candidate validity remains. Internal pause/filler cuts are
deferred pending a separate ordered-segment contract revision, not authorized
in this contiguous-range ticket. Parent section 0.6 governs this revision.

Deliver one coherent upload-to-candidate-review analysis feature: audio
extraction integration, transcription port/fake/live adapter, candidate
selection port/fake/live adapter, deterministic reconciliation, analyze job and
API routes, progress/poll/cancel/refresh/retry behavior, candidate/no-candidate
UI, evaluations, and bounded live evidence when authorized.

This is intentionally one vertical-slice ticket. Splitting transcription,
candidate selection, orchestration, and UI would leave intermediate tickets
that cannot deliver or verify the feature and would repeat the same recovery,
idempotency, privacy, and call-count context.

## Portfolio value

Show the core AI judgment end-to-end: convert an owned conversation into
timestamp-grounded, explainable editorial choices while preserving provider
boundaries, one-call budgets, refresh recovery, and honest failure behavior.

## Standalone implementation context

- Analysis starts only after authoritative media inspection and explicit user
  confirmation. It produces zero to four grounded candidates, targeting three
  strong alternatives without padding; otherwise it returns an honest
  no-candidate state without a manual range path.
- Deepgram receives bounded extracted audio, not a user URL or video.
  Transcription normalizes words, times, punctuation, and optional diarization
  into stable IDs, then discards the raw response.
- OpenAI receives only the bounded normalized transcript/rubric/context. The
  Responses request uses strict Structured Outputs, `store: false`, no
  conversation state, no SDK retry, and at most one call.
- Transcript/user context is delimited untrusted data. Model output references
  word IDs; deterministic code derives time/duration, rejects invalid evidence,
  overlap, invented claims/quotes, virality promises, and injection.
- A manual candidate retry may reuse a valid stored normalized transcript and
  must not repeat transcription. No automatic provider repair/retry occurs.
- Fake/sample behavior remains deterministic and available without credentials.

## Dependency evidence required

- CL-004 must provide the reusable candidate/evidence/no-candidate experience
  and prove sample selection makes zero provider calls.
- CL-006 must provide passing inspection/extraction/job lifecycle, abort/
  timeout/cleanup, and authoritative media-limit evidence.

Use the existing schemas and progress model. A missing inspection or candidate
UI foundation blocks this ticket rather than being reimplemented inside it.

## Files and areas owned

- Transcription and candidate provider ports, fakes, live adapters,
  normalization, prompts/schemas, and provider contract tests.
- Analysis domain/reconciliation/use case, analyze job stages/result, routes for
  start/status/cancel/result, and operation recovery.
- Frontend analysis confirmation/progress/polling/failure/retry/no-candidate and
  live-result candidate integration.
- Candidate evaluation fixtures/graders and optional owner-controlled live
  analysis evidence.
- Provider setup/cost/privacy documentation for analysis.

## Scope boundaries

### In scope

- `POST /v1/analyses`, operation poll/cancel, `GET /v1/analyses/:analysisId`,
  and `GET /v1/session` evidence required for restore.
- Ordered named job stages from descriptor/audio extraction through transcript,
  selection, reconciliation, result, and complete.
- English v1 transcription with diarization requested but provider-declared
  unavailability tolerated; stable word/utterance/speaker labels.
- Candidate prompt boundary, strict provider-shape schema, deterministic
  reconciliation, one-to-four candidate bounds, the target-three outcome, and
  the no-candidate outcome.
- Bounded category/audience/target-platform context; trend signals remain
  disabled unless separately approved.
- Refresh, hidden-page polling pause/resume, cancellation, timeout, provider
  failure, missing result, retry with transcript reuse, expiry, and clear.

### Out of scope

- Assembly/active-speaker work (CL-008), contextual visuals (CL-009), automatic
  clip review/confirmation (CL-010), render (CL-011), public hardening/deployment, trend
  research, numeric virality scoring, provider fallback, or multilingual claim.
- Persisting raw provider responses/prompts, automatic repair calls, re-running
  transcription during candidate-only retry, or exposing provider names/errors
  in public UI.

## Implementation checklist

### 1. Transcription boundary

- [ ] Implement a port accepting only job-local audio, duration, `en`,
  diarization flag, request/deadline/signal context.
- [ ] Make fake and live shapes pass the same strict normalization; generate
  ordinal word/utterance IDs and enforce count/character/time bounds. Before
  accepting live output, define and record the numeric source-controlled word
  overlap tolerance, then test the exact tolerance and one millisecond beyond
  it against both fake and live-normalized shapes.
- [ ] Record only content-free minutes/model-config/call outcome; discard raw
  alternatives, tokens, provider IDs, and payload after normalization.
- [ ] Disable provider/SDK retries and propagate timeout/abort through extraction
  and adapter.

### 2. Candidate selection and reconciliation

- [ ] Build source-controlled role/policy/rubric/schema/delimited-input prompt
  and strict Structured Outputs request with `store: false`.
- [ ] Validate and resolve every word/evidence ID, derive boundaries/duration,
  enforce 10–60 seconds, check clean boundary/evidence/overlap/distribution, and
  assign server IDs/ranks.
- [ ] Reject invented quotes/facts, guaranteed performance, sensitive inference,
  duplicates, reversed/missing IDs, unsupported signals, and transcript/user
  instructions that attempt to change policy.
- [ ] Permit only whitespace/list dedupe repair; never invent/move/rewrite or
  make a second call.

### 3. Job/API/recovery

- [ ] Enforce inspection proof, feature/paid switches, bounds/source,
  allowance/capacity/budget, Turnstile, marker/lease, and job start in documented
  cheapest-first order.
- [ ] One analyze action makes at most one transcription and one candidate call;
  replay returns existing operation.
- [ ] Persist only normalized transcript/candidates/revisions when the privacy
  gate is approved; otherwise update recovery behavior/public copy explicitly.
- [ ] Encode failure evidence so manual candidate retry reuses transcript when
  valid and full retry never occurs invisibly.

### 4. Frontend experience

- [ ] Add explicit confirmation before paid analysis and explain limits/privacy.
- [ ] Show named ordered stages, elapsed time, source duration, restrained
  reduced-motion state, and no fake percentage.
- [ ] Poll at server interval with capped backoff; pause after hidden timeout;
  reconcile immediately on visibility/refresh without duplicate operations.
- [ ] Preserve source/transcript evidence accurately across failure; provide
  only the evidence-allowed retry, clear, or sample recovery.
- [ ] Feed the same CL-004 candidate/evidence UI with validated live results.

## Contracts and state transitions

- `analysis-confirmation -> analyzing -> candidates | no-candidates |
  analysis-failed`; cancellation stays requested until proven terminal.
- Operation success is insufficient until the analysis bundle is fetched and
  validated. Missing/invalid result becomes recoverable failure.
- `RETRY_ANALYSIS` is evidence-driven. Valid transcript reuse makes zero new
  transcription calls; a consumed provider action stays consumed when cost was
  incurred even if output was unusable.
- Candidate rank and duration are deterministic server outputs; model IDs/times
  are not trusted.

## Privacy, provider, and cost constraints

- No video, filename, object path, signed URL, grant/cookie, IP, identity, or raw
  provider payload enters either model request.
- Logs/result status contain counts, language, safe config ID, usage, and rule
  codes only—no transcript/prompt/rationale/title.
- Live calls require provider/privacy/spend approval, blank examples filled by
  the owner in ignored secret storage, current model/data-policy review, and an
  exact synthetic/purpose-recorded call budget.
- Default/local/CI remain fake, paid-disabled, network-denied, and assert call
  counts. Production never falls back from live to fake on failure.

## Acceptance criteria

- [ ] Valid fixture analysis produces one to four grounded distinct candidates
  through the exact API/UI path; no-candidate offers no editing fallback.
- [ ] Every reference resolves to existing words; range/evidence/overlap/rank
  and forbidden-claim rules pass deterministic evaluation.
- [ ] Injection, invented quote/fact, virality promise, duplicate, malformed,
  refusal, timeout, abort, rate/budget, and provider-error cases fail safely.
- [ ] One action produces at most one transcription and one candidate call;
  manual candidate retry with valid transcript increments only candidate count.
- [ ] Refresh/replay/cancel/expiry/clear create no duplicate job/provider call
  and preserve only evidence allowed by the recovery policy.
- [ ] Public errors/logs/storage contain no prohibited content or capability.
- [ ] Any controlled live check records exact call count, usage, cost, cleanup,
  config revision, and blockers without exposing content/account identifiers.

## Focused verification

- [ ] Run adapter shape/normalization/timeout/abort/error/call-count tests.
- [ ] Run candidate reconciliation and full deterministic evaluation matrix.
- [ ] Run API tests for start/replay/poll/cancel/success/no-candidate/failure/
  transcript-reuse/missing-result/expiry/clear.
- [ ] Run frontend progress/recovery/visibility/refresh/candidate integration and
  cleanup tests.
- [ ] Run fake-mode E2E upload-shaped analysis and refresh without network.
- [ ] Run a live short approved fixture only after explicit owner authorization;
  otherwise leave live checks unchecked.
- [ ] Run affected format/lint/typecheck/build, secret/content scans,
  `git diff --check`, and final status inspection.

## Documentation updates

- Update provider setup with current Deepgram/OpenAI project/data/retention,
  exact model/config, credentials-as-blank, and controlled live steps.
- Record candidate prompt/rubric/config revisions and content-free cost evidence.
- Update data-retention/recovery docs if normalized transcript storage is
  approved or rejected.
- Update parent/affected tickets before implementing any model, language,
  provider, retry, or retention change.

## Owner gates and external blockers

- Provider/privacy approval for Deepgram/OpenAI projects, current policies,
  region, normalized transcript retention, and public copy.
- Spend approval for exact hard limits, call count, and controlled live fixture.
- Explicit permission before any credentialed or paid call. Deterministic
  fake-mode implementation/evaluations may complete without it; live evidence
  remains unchecked.

## Commit boundary

Keep transcription, candidate selection, orchestration/recovery, and analysis UI
together as `CL-007: deliver grounded live analysis`. Do not split the same
feature into provider/UI follow-ups or absorb assembly/review/render. No Git,
credential, provider, or cloud mutation is authorized by this packet.

## Precision references

- [Analyze API and result contract](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#119-post-v1analyses)
- [Transcription and candidate providers](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#122-transcription-port)
- [Analysis pipeline stages](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#134-analysis-job-stages)
- [Paid-operation budgets and admission](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#17-paid-operations-timeouts-retries-concurrency-and-spend)
- [Candidate evaluations and API tests](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#207-candidate-selection-evaluations)

## Completion handoff

Report adapters/config revisions, prompt/reconciliation rules, route/job/stage
behavior, recovery/call-count evidence, UI states, changed files, exact checks,
live usage/cost/cleanup if authorized, and every provider/privacy/spend blocker.

</details>

</details>
