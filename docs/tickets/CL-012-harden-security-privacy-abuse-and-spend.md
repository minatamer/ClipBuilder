# CL-012 — Harden security, privacy, abuse, and spend

Status: Planned<br>
Milestone: M6 — public-demo hardening and audit<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004A, CL-007, CL-009, CL-010, and CL-011<br>
Blocks: CL-013<br>
Suggested commit: `CL-012: harden public demo controls`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): CL-004A already owns the complete non-GCloud
dashboard/key/privacy/budget and local-software guides. Audit and reconcile
those guides against the implemented adapters/controls and actual owner
evidence here; do not postpone the first setup walkthrough to this ticket.
All GCloud setup, applied settings and external cloud verification belong to
final CL-015. Prepare its cloud checklist here using source/config/fake tests,
but leave saved cloud settings, benchmarks and operational results unchecked.

Complete the cross-cutting public-demo security, privacy, rights, abuse,
capacity, retention, logging, configuration, dependency/container, and spend
controls after every metered route and media lifecycle exists. Correct findings
with focused regressions and produce owner-reviewable operations evidence.

## Portfolio value

Show that the polished AI/media flow is not merely functional: every expensive
or private boundary fails closed, public claims match reality, content never
leaks into telemetry, anonymous abuse is bounded honestly, and the sample path
can remain available when live work is disabled.

## Standalone implementation context

- Earlier tickets implement boundary-local controls. CL-012 traces the complete
  system and proves rejection order, call/job counts, cookie/capability safety,
  content-free logs/errors/metrics, retention/clear, CSP/proxy behavior, and
  kill-switch/capacity interaction across all routes.
- Anonymous controls are best-effort; there is no durable per-person quota or
  database. Public/operations text must not claim otherwise.
- Turnstile protects upload authorization, analysis, assembly, and render with
  action/hostname binding. Cheap validation/feature/admission checks
  occur before it; no rejected earlier condition may trigger paid/provider/job
  work.
- Provider settings, bucket/IAM/CORS/lifecycle, hard rate/spend limits, cloud
  budgets, model weights/licenses, and sample rights contain external evidence
  that code cannot invent or mark complete.

## Dependency evidence required

Confirm CL-007, CL-009, CL-010, and CL-011 each expose their final metered
routes, adapters/jobs, exact call-count tests, error/recovery paths, and cleanup
evidence. CL-005/CL-006 storage/job/grant/process foundations must also still
match those consumers. Missing feature-local protection reopens its owning
ticket; CL-012 owns cross-cutting proof and corrections, not shadow versions.

## Files and areas owned

- Security/admission/rate/capacity/Turnstile/CSP/headers/proxy/logging/metrics
  hardening across existing modules.
- Production configuration validation and feature/paid kill-switch matrix.
- Security/privacy/rights/retention/cost/provider/container operations docs and
  focused cross-cutting tests/scans.
- Minimal corrective refactors/tests for concrete findings; no redesign.

## Scope boundaries

### In scope

- Strict body/response/decompression/time/field bounds, request content type,
  Origin/Fetch Metadata, session/grant, CSRF, no-store/referrer/cookie/header,
  and same-origin proxy validation.
- Turnstile action/hostname/timeouts plus route/global short-window admission,
  one analysis/assembly/render capacity, API/job scale caps, provider budget
  circuit, atomic marker/lease, and cheapest-first rejection order.
- Typed allow-list logs/metrics and sentinel scanning for tokens, filenames,
  content, prompts, paths, URLs, raw IP/user-agent, provider payload/ID, and
  media/image frames.
- CSP report-only evaluation then narrowly enforced production policy for self,
  exact object/resumable origin, and Turnstile needs.
- Data inventory/rights/public copy, clear/expiry/lifecycle claims, no-identity
  active-speaker rules, generated-image restrictions, dependency/container/
  secret scans, and cost model.

### Out of scope

- User accounts/auth profiles, durable quota/identity ledger, paid WAF, broad
  analytics/session replay, moderation/legal policy, redesign, accessibility
  matrix (CL-013), final whole-codebase audit (CL-014), infrastructure creation
  or deployment (CL-015).
- Making external dashboard/bucket/provider changes without explicit approval
  or treating advisory budgets as hard caps.

## Implementation checklist

### 1. Route and browser security

- [ ] Audit every route for method/content type/body size, grant/source/CSRF,
  feature/paid gate, schema/domain bounds, allowance/replay, rate/capacity/
  budget, Turnstile, marker/lease, and provider/job in exact order.
- [ ] Verify secure host cookie attributes/key rotation and capability response
  no-store/no-referrer behavior; no secret appears in server-rendered HTML.
- [ ] Restrict proxy methods/headers/cookies/response headers and private backend
  origin/service identity to server-only composition.
- [ ] Implement/test HSTS, nosniff, referrer/permissions policy, frame/base/
  object restrictions, and CSP without broad wildcards/unsafe shortcuts.

### 2. Abuse, capacity, retries, and cost

- [ ] Bind Turnstile token to expected action/hostname and never log/persist it.
- [ ] Enforce per-session counters, atomic markers, one active source analysis/
  assembly, one global render, max instances/tasks, route windows, and kill
  switches.
- [ ] Prove provider SDK and Cloud Run task retries are zero; only low capped
  idempotent metadata/preconditioned infrastructure retries are allowed.
- [ ] Recalculate public and owner flow cost with current official prices,
  image calls, job resources, storage, and network; distinguish hard caps,
  app switches, capacity, and advisory alerts.

### 3. Privacy, rights, retention, and telemetry

- [ ] Reconcile data inventory with actual browser/API/job/provider/storage/log
  paths, including transcripts, focus geometry, prompts, generated assets,
  manifests, outputs, and capabilities.
- [ ] Ensure sample/provided assets have recorded rights and public disclosure
  requires rights for video, voices, music, graphics, and export.
- [ ] Prove no sensitive/identity inference, embeddings, cross-session tracking,
  arbitrary image/web/stock source, or real-user fixture/screenshot exists.
- [ ] Verify clear, expiry, signed-capability renewal, lifecycle, partial delete,
  supersession, and incident copy are accurate—not “nothing stored” or instant
  deletion claims.
- [ ] Route logs/metrics/errors through typed allow-lists and run content/secret
  sentinel tests across serialized output.

### 4. Provider audit and final-cloud readiness record

- [ ] Audit [provider setup](../operations/PROVIDER_SETUP.md),
  [cost controls](../operations/COST_MODEL.md) and
  [software readiness](../operations/THIRD_PARTY_SOFTWARE.md) against current
  official docs, implemented requests and dated owner evidence. Recheck model
  access, privacy/retention/opt-out, scoped keys, actual hard limits versus alerts,
  rate limits, zero retries and rotation/shutdown; list every unresolved item.
- [ ] Prepare final CL-015 checklists for bucket PAP/IAM/CORS/lifecycle/soft
  delete/versioning, Secret Manager/runtime identities, Cloud Run caps/retries,
  target-runtime speaker proof, cloud render/cleanup and numeric cloud alerts.
  Do not create/configure/inspect real GCloud resources here.
- [ ] Keep account/project IDs, keys, object names, signed URLs, source content,
  and secret-bearing screenshots out of the record.
- [ ] Leave every dashboard/cloud/user-only item unchecked until evidenced by
  the owner; code/config shape is not external proof.

## Security and admission invariants

- Rejected method/body/session/gate/bounds/rate/capacity/budget conditions make
  zero Turnstile/provider/job calls as defined by the exact route order.
- An idempotent replay returns the existing operation; a conflicting payload
  fails and cannot create a second operation.
- Runtime configuration may lower limits, never exceed compiled/tested public
  ceilings. `test` rejects live mode; production live feature flags require the
  master paid switch plus valid dependencies.
- Sample mode remains available when live upload/providers/render are killed,
  unless the incident affects sample isolation itself.

## Acceptance criteria

- [ ] All metered routes pass rejection-order and exact call/job-count tests.
- [ ] Cookie/grant/source/CSRF/Turnstile/marker/lease/rate/capacity/budget and
  replay conflicts fail closed with source-controlled errors.
- [ ] CSP/headers/proxy/capability/caching behavior supports the real upload,
  preview, Turnstile, and download needs without broad exposure.
- [ ] Logs, metrics, errors, tests, fixtures, docs, and tracked artifacts contain
  no prohibited content, capability, credential, identity, or private path.
- [ ] Data inventory, rights, provider processing, retention, clear, lifecycle,
  and anonymous-control claims match actual code/infrastructure limitations.
- [ ] Current dependency/container/model-license/secret scans have no unresolved
  material release finding.
- [ ] Cost model and hard-limit/alert/kill-switch plan are owner-reviewable;
  external items remain explicitly checked or blocked.

## Focused verification

- [ ] Run full security/admission route matrix with fake call counters.
- [ ] Run grant/key rotation, CSP/header/proxy/cache/cookie/capability, object
  naming/generation, logging sentinel, and cleanup/retention tests.
- [ ] Run dependency vulnerability, secret, container/image, tracked-media,
  license/model, and forbidden-content scans supported by the repository.
- [ ] Exercise all kill-switch combinations and prove sample isolation.
- [ ] Review non-GCloud provider settings only with explicit provider
  authorization; do not infer them from code. Actual GCloud settings wait CL-015.
- [ ] Run repository format/lint/typecheck/unit/build/fake E2E as proportional
  regression evidence, plus `git diff --check` and status review.

## Documentation updates

- Audit/update the existing CL-004A provider setup, cost and software guides;
  complete data retention, media rights, local development, incident priorities
  and release-evidence template. Preserve explicit final CL-015 cloud deferrals.
- Update public README/copy only for actual implemented privacy/limit/claim
  changes; keep operations details out of marketing copy.
- Promote any material architecture/privacy/provider/cost/claim correction into
  the parent and affected tickets before completion.

## Owner gates and external blockers

External provider, Turnstile, bucket/IAM/CORS/lifecycle, region, model-license,
hard-limit/alert, rights, retention, and public-live decisions require explicit
owner evidence/authorization. This ticket must not mark them complete from code
alone or mutate those systems without permission.

## Commit boundary

Keep cross-cutting public security/privacy/abuse/spend corrections and their
evidence together as `CL-012: harden public demo controls`. Do not absorb the
responsive/accessibility pass, release audit, or deployment. No Git/provider/
cloud mutation is authorized by this packet alone.

## Precision references

- [Privacy, rights, safety, and security](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#15-privacy-rights-safety-and-security)
- [Configuration schema](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#16-configuration-and-environment-schema)
- [Paid operations, admission, and spend](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#17-paid-operations-timeouts-retries-concurrency-and-spend)
- [Security/admission verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#204-securityadmission-tests)
- [Incident priorities](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#217-incident-priorities)

## Completion handoff

Report every finding/correction, exact route order and call-count proof, header/
CSP/proxy/cookie behavior, data/log/retention/rights reconciliation, scans,
cost/control plan, changed files, commands, and a separate checked/blocked list
for every owner/provider/cloud item.
