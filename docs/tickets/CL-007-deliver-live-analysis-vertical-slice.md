# CL-007 — Deliver the live-analysis vertical slice

Status: Planned<br>
Milestone: M3 — live analysis<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-004 and CL-006<br>
Blocks: CL-008, CL-009, CL-012<br>
Suggested commit: `CL-007: deliver grounded live analysis`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

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
  confirmation. It produces a normalized transcript and exactly three valid
  candidates when possible; otherwise it returns an honest no-candidate/manual
  range state.
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
  reconciliation, three-candidate and no-candidate outcomes.
- Bounded category/audience/target-platform context; trend signals remain
  disabled unless separately approved.
- Refresh, hidden-page polling pause/resume, cancellation, timeout, provider
  failure, missing result, retry with transcript reuse, expiry, and clear.

### Out of scope

- Assembly/active-speaker work (CL-008), contextual visuals (CL-009), editor or
  edit assistant (CL-010), render (CL-011), public hardening/deployment, trend
  research, numeric virality scoring, provider fallback, or multilingual claim.
- Persisting raw provider responses/prompts, automatic repair calls, re-running
  transcription during candidate-only retry, or exposing provider names/errors
  in public UI.

## Implementation checklist

### 1. Transcription boundary

- [ ] Implement a port accepting only job-local audio, duration, `en`,
  diarization flag, request/deadline/signal context.
- [ ] Make fake and live shapes pass the same strict normalization; generate
  ordinal word/utterance IDs and enforce count/character/time/overlap bounds.
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
  only allowed retry, clear, sample, or manual-range recovery.
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

- [ ] Valid fixture analysis produces grounded distinct candidates through the
  exact API/UI path; no-candidate produces manual-range recovery.
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
feature into provider/UI follow-ups or absorb assembly/editor/render. No Git,
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
