# CL-014 — Audit the release candidate

Status: Planned<br>
Milestone: M6 — public-demo hardening and audit<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-013<br>
Blocks: CL-015<br>
Suggested commit: `CL-014: audit the ClipBuilder release candidate`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Reconcile every required ticket against code, evidence, Git history, current
documentation, and the source of truth; then perform one deliberate
behavior-preserving quality/efficiency pass across the entire first-party
codebase and run the complete deterministic pre-deployment gate on the exact
candidate revision.

This is the final code-and-evidence audit, not another feature, product redesign,
responsive matrix, provider smoke, or deployment attempt.

## Portfolio value

Produce a defensible release candidate whose behavior, architecture, privacy,
media lifecycle, quality, dependencies, rights, and ticket completion have been
checked as one system—not inferred from green commits or isolated feature tests.

## Standalone implementation context

- A ticket-named commit proves only that work occurred. Completion requires the
  packet's current acceptance/evidence plus inspection of actual implementation.
- Each earlier ticket may be classified only as complete, intentionally
  superseded, explicitly deferred, or blocked. Every supersession/deferral names
  an authoritative destination and owner-approved rationale; unchecked work
  stays unchecked.
- CL-013 owns the full UI/accessibility/performance matrix. Re-run only the
  smallest scenario required by an audit correction.
- Refactoring preserves the CL-013-accepted behavior. A functional difference
  is allowed only to fix a proven defect, with focused regression and updated
  authority/evidence.
- CL-015 may deploy only the exact candidate/digests audited here. Any material
  post-audit change invalidates the affected evidence.

## Dependency evidence required

CL-013 must provide the complete manual responsive/accessibility/performance
matrix and focused regressions, while CL-012 must provide the security/privacy/
spend ledger and external-checklist state. Inspect the actual implementation,
Git evidence, and every packet from CL-001 onward; a green dependency status is
not proof by itself.

## Files and areas owned

- `docs/operations/RELEASE_CANDIDATE_AUDIT.md` (or synchronized equivalent)
  containing ticket ledger, findings, candidate identity, commands/results,
  external blockers, and release decision.
- Minimal first-party code/tests/docs corrections for concrete findings.
- Ticket/index/parent reconciliation when evidence exposes a real mismatch.
- No provider/cloud/deployment mutation.

## Scope boundaries

### In scope

- Every prior ticket, dependency, acceptance item, implementation record,
  commit/diff, deferral, blocker, and owning document.
- Complete first-party architecture, duplication, responsibility, readability,
  lifecycle, performance, dependency, security/privacy, contract, state,
  provider-call, media/compiler, configuration, test-isolation, and dead-code
  review.
- Full deterministic format/lint/typecheck/unit/integration/fake E2E/build,
  dependency/security/container/license/secret/ignore/diff/status checks.
- Exact release candidate SHA/worktree status and immutable build input record.

### Out of scope

- Deployment, infrastructure/provider/dashboard changes, credential creation,
  paid/live calls, new features, speculative abstraction, visual redesign, or
  rewriting Git history.
- Repeating CL-013's entire manual matrix or external settings review when its
  current evidence remains valid.

## Audit checklist

### 1. Ticket, docs, and Git reconciliation

- [ ] Enumerate CL-001 through CL-013 plus any explicitly approved suffix
  packets in dependency order and locate their code/docs/evidence/commits.
- [ ] Compare every acceptance and focused-verification item with current code
  and evidence; do not rely on checklist marks or commit subjects alone.
- [ ] Reconcile parent source, ticket index, individual packets, READMEs,
  operations docs, environment examples, comments, and public claims.
- [ ] Produce one sanitized per-ticket ledger with status, evidence, checks,
  supersession/deferral destination, blockers, and remaining limits.

### 2. Architecture and authority

- [ ] Prove `frontend -> contracts <- backend`, browser-safe contracts, thin
  routes/use cases/ports/adapters, explicit composition, and no import-time side
  effects.
- [ ] Prove the canonical reducer/manifest are the sole workflow/edit authority
  and persistence is an allow-listed projection.
- [ ] Prove no database/general repository/durable queue/history/hidden session
  exists; temporary objects/markers/leases match the declared model.
- [ ] Reconcile shared contracts, HTTP routes, operation states, provider ports,
  job descriptors/stages, focus/visual tracks, render profile, and cleanup.

### 3. Whole-codebase quality and efficiency pass

- [ ] Review every first-party source/test/config/script/style/doc area for real
  duplication, oversized/mixed responsibility, unclear naming/data flow, wrong
  abstraction, unsafe cast/assertion, swallowed error, unhandled promise,
  stale flag/TODO, unused export/dependency/asset, dead/unreachable branch, and
  obsolete fixture/compatibility layer.
- [ ] Search for duplicate schemas/constants/components/styles/errors/loading/
  provider calls/transitions/reconciliation/render policies; consolidate only
  genuinely shared responsibilities.
- [ ] Review bundle/media imports, context size, repeated parsing/serialization,
  transcript/playback/render hot paths, and process/temp cleanup for structural
  waste without speculative caching/memoization.
- [ ] Preserve accepted product behavior; document rejected subjective churn.

### 4. Lifecycle, calls, privacy, and security

- [ ] Trace listeners/timers/observers/URLs/media/request controllers/uploads,
  cookies/capabilities, markers/leases, subprocesses/temp files/assets/output
  across success/failure/abort/timeout/cancel/refresh/clear/expiry.
- [ ] Prove one user action makes at most the documented provider/job/image
  operations; validation/auth/rate/budget/nonretryable failures never retry.
- [ ] Scan tracked files/history/diffs/fixtures/logs/screenshots/docs for secrets,
  content, signed URLs, account IDs, media/transcripts/prompts/outputs, raw paths,
  provider payloads, face artifacts, or unlicensed assets.
- [ ] Reconcile origin/CSRF/grant/CSP/headers/proxy/Turnstile/admission/spend/
  no-store/log allow-list and test isolation with actual code.

### 5. Findings and deterministic release gate

- [ ] Maintain finding ID, severity, affected ticket/guardrail, evidence,
  correction, focused regression, and disposition.
- [ ] Fix every material finding or leave it as an explicit deployment blocker;
  never weaken criteria to make the ledger green.
- [ ] Run pinned install/format/lint/all typechecks/all unit+integration+fake E2E/
  production builds on the exact final candidate.
- [ ] Run dependency vulnerability, unused dependency, architecture, duplicate/
  dead code, container/model license, tracked secret/media, ignore/example,
  `git diff --check`, and final status reviews.
- [ ] Prove the deterministic gate did not load ignored local env, contact live
  providers/cloud, request hardware/media permission, or consume credits.

## Acceptance criteria

- [ ] Every prior ticket has an evidence-backed classification with no
  unexplained unchecked acceptance item.
- [ ] Architecture, state, contracts, temporary-storage model, provider/job
  boundaries, preview/render parity, and cleanup match the source of truth.
- [ ] No known material dead/duplicate/obsolete code, unsafe diagnostic, content
  leak, lifecycle leak, duplicate paid operation, stale dependency, unlicensed
  artifact, or contradictory documentation remains.
- [ ] Every concrete quality/efficiency finding is fixed with focused regression
  or has an explicit evidence-based retained/blocking disposition.
- [ ] The complete deterministic gate and supported scans pass on the exact
  declared candidate with commands/versions/counts recorded.
- [ ] External rights/visual/provider/privacy/spend/cloud/manual items are
  truthfully complete or unchecked; none is inferred.
- [ ] CL-015 receives an exact auditable revision/build-input identity and no
  unresolved repository-owned release blocker.

## Focused verification

- [ ] Run the repository's pinned format, lint, typecheck, unit/integration,
  fake E2E, and production build commands.
- [ ] Run production+development dependency audit, container scan, model/font/
  asset license review, and record bounded exceptions rather than suppressing.
- [ ] Run architecture/import, duplicate/dead/unused, provider-call/retry,
  persistence/storage, log/content, secret/media, ignore/example, and test-
  isolation validation.
- [ ] Inspect `git status`, candidate history, `git diff`, `git diff --check`,
  tracked/ignored rules, and exact release diff without reading `.env.local`.
- [ ] Re-run only manual scenarios directly affected by audit corrections.

## Documentation updates

- Produce the final audit ledger with exact candidate identity, findings,
  corrections, deterministic commands/results, external blockers, and release
  disposition.
- Reconcile all public/agent/app/operations/ticket documentation with actual
  behavior.
- Update the source of truth and every affected packet together for any
  material behavior/architecture correction.

## Owner gates and external blockers

This ticket can certify repository-owned deterministic readiness only. Rights,
owner visual/manual approval, live provider behavior, external settings, cloud
configuration, cost, and deployment remain external evidence. If any required
item is missing, CL-015 remains blocked even when code gates pass.

## Privacy, provider, and cost constraints

Do not read ignored local secrets, call providers, run live/cloud workflows, or
include content/account IDs in the audit. Use fake mode and synthetic/approved
fixtures only.

## Commit boundary

Keep the audit, concrete behavior-preserving corrections, regressions, and
ledger together as `CL-014: audit the ClipBuilder release candidate`. Do not
absorb deployment/live validation. Do not stage, commit, push, rewrite history,
or mutate external systems without explicit authorization.

## Precision references

- [Repository and decision ownership](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#9-repository-and-decision-ownership)
- [Verification strategy and completion audit](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#20-verification-strategy)
- [Release acceptance checklist](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#23-release-acceptance-checklist)
- [Implementation-agent handoff](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#25-implementation-agent-handoff)
- [Definition of done](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#appendix-e--definition-of-done)

## Completion handoff

Report the ledger path, exact candidate identity, every finding/correction/
disposition, changed files, focused regressions, complete deterministic gate,
scans/audits, behavior-preservation evidence, and every remaining owner/external
blocker. State precisely what CL-015 may deploy.
