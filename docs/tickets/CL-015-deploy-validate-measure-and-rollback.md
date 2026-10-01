# CL-015 — Deploy, validate, measure, and prove rollback

Status: Planned<br>
Milestone: M7 — deployment and controlled live evidence<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-014 repository audit, CL-004A provider readiness, and explicit owner authorization<br>
Blocks: Public release completion<br>
Suggested commit: `CL-015: deploy and validate ClipBuilder`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): this is the final ticket, after every local
implementation/quality/audit packet. It exclusively owns all GCloud account,
billing, project/API, IAM, bucket, registry, secrets, service/job setup, external
cloud verification and deployment. CL-004A owns non-GCloud setup guides; CL-012
audits them and CL-014 carries a named deferred-cloud checklist. Cloud evidence
is produced inside this packet, never a circular prerequisite for entering it.

Before any external step, author/review the complete dated owner-facing GCloud
walkthrough using current official docs: prerequisites and account security,
console navigation and equivalent content-safe CLI where needed, billing and
numeric advisory budget, chosen region, required APIs, least-privilege identities,
registry/image costs, private bucket settings, Secret Manager access, service/job
caps/retries/timeouts, unpaid verification, bounded live approval, troubleshooting,
kill switch, rollback and authorized teardown/residual charges. Keep identifiers
and secrets blank; do not output credentials or service-account JSON.

Deploy the exact audited ClipBuilder revision as immutable frontend and
backend/job images; prove private service/storage/IAM/lifecycle configuration;
run unpaid deployed probes first; execute only the owner-authorized bounded live
flow; reconcile behavior, provider/job call counts, cost, cleanup, public claims,
and settings; and demonstrate the recorded rollback/kill-switch path.

## Portfolio value

Convert the audited repository into a credible live portfolio artifact with
traceable revision/digests, bounded spend, honest external evidence, recoverable
operations, and no gap between the code story and the deployed system.

## Standalone implementation context

- Target architecture is one public Next.js Cloud Run service, one private
  Express Cloud Run service invoked by frontend identity, one private Cloud Run
  Job definition for `analyze|assemble|render`, one private temporary GCS bucket,
  Artifact Registry images deployed by digest, and Secret Manager values scoped
  to runtime identities.
- CL-015 may deploy only the exact CL-014-audited revision/build inputs. Any
  material source/config/image change requires the smallest relevant re-audit.
- Deployment begins fake and paid-disabled. Unpaid health/config/sample/clear
  probes and log inspection happen before any live flag is enabled.
- Live validation is rare evidence: one previously unused rights-approved short
  fixture, exactly the approved upload/analysis/assembly/render path,
  followed by usage/cost/output/cleanup reconciliation. Stop on duplicate call,
  unexpected retention/log content, setting drift, or material cost variance.
- A custom domain is not required for the first stable checkpoint; use managed
  `run.app` HTTPS first unless owner decisions explicitly say otherwise.

## Dependency evidence required

CL-014 must identify the exact auditable revision/build inputs, record a green
deterministic gate, and list no unresolved repository-owned release blocker.
Visual, rights, non-GCloud provider/privacy/retention and numerical spend/call
approval must have current evidence before their corresponding external phase.
An approved region/cloud setup action is needed before provisioning; bucket/IAM,
mechanism/runtime, unpaid probes and launch evidence are produced in the phases
below, not demanded before entry. A commit subject or template is insufficient.

## Files and areas owned

- Deployment/rollback/provider/storage/cost/release operations documents and
  sanitized release evidence.
- Container/build/deploy configuration corrections strictly required for the
  audited architecture, followed by re-audit as needed.
- No new product feature or speculative infrastructure.

## Scope boundaries

### In scope

- Re-checking current official provider model/pricing/data docs and owner
  dashboard settings before live use.
- Building/pushing two immutable image families (frontend; backend/job), recording
  exact digests/SHA, and deploying services/job with least-privilege identities.
- Verifying region, bucket public-access prevention/uniform access/CORS/lifecycle/
  soft-delete/versioning/IAM, Secret Manager scopes, Cloud Run min/max/
  concurrency/timeouts/task retries, and network/service authentication.
- Unpaid production health/config/sample/clear probes and content-safe log review.
- Explicitly bounded live flow, output inspection, call/usage/cost/cleanup
  evidence, kill-switch test, and digest-based rollback.

### Out of scope

- Kubernetes, Terraform, load balancer, external queue, deployment OIDC/CI-CD,
  multi-region failover, custom controller, production database, customer
  accounts, broad public beta, arbitrary stress testing, or unapproved custom
  domain purchase/configuration.
- Additional live retries/fixtures, 60-minute ceiling run, or public live upload
  unless separately authorized after the short flow evidence.

## Locked sequence and checkpoints

### Phase 0 - owner guide and cloud setup authorization

- [ ] Confirm CL-004A/CL-012 provider evidence and CL-014 repository audit;
  enumerate every deferred cloud gate and its original owning ticket.
- [ ] Prepare/update the full deployment/storage/secrets/budget/rollback guide
  with dated official links, exact console steps and safe CLI equivalents,
  expected outcome, permission/billing prerequisites and stop conditions.
- [ ] Obtain explicit approval for cloud account/billing/project creation or
  selection, region, API enablement, resource caps, advisory budget/recipients,
  funding and each external provisioning/deploy action. Never infer approval.
- [ ] Configure owner-approved numeric cloud alerts and resource ceilings before
  metered workloads; distinguish advisory alerts from enforced caps.

### Phase 1 — freeze and build the audited candidate

- [ ] Confirm CL-014 ledger, exact clean/auditable revision, current phase's owner
  gates and deferred-cloud checklist, and no material source/config drift.
- [ ] Re-run the release commands/scans required by the ledger and build the two
  immutable images with exact SHA labels and reproducible inputs.
- [ ] Scan images/dependencies/secrets/licenses, record digests and runtime binary/
  model/font revisions, and never bake secrets/local env/media into layers.

### Phase 2 — verify minimum cloud foundation

- [ ] Following the owner guide, create/configure only the authorized minimum
  project/APIs, regional registry, secrets, identities and private bucket. Verify
  least privilege, cost/resource ceilings and no service-account JSON keys.

- [ ] Verify approved project/region, Artifact Registry, Secret Manager, service
  identities and planned private API/job IAM without recording project/account
  IDs in public evidence. Verify deployed service/job bindings after Phase 3.
- [ ] Verify the private bucket's PAP, uniform access, Standard class, versioning,
  soft-delete decision, one-day lifecycle for temporary prefixes, explicit
  sample exclusion, exact-origin CORS, and no public/list permission.
- [ ] Upload/reference the rights-approved versioned sample by exact generation
  and SHA; never replace it in place.
- [ ] Complete CL-005's transferred GCS browser mechanism spike on approved
  synthetic/rights-safe media: exact-origin CORS, headers/start expiry, resumable
  chunks/restart, size/type/generation/range, cancel/partial deletion and no
  capability in logs/errors/persistence/screenshots. Failure blocks enablement.
- [ ] Return any mechanism/runtime/code correction to its owner and re-audit
  affected source/config/image inputs under CL-014 before continuing deployment.

### Phase 3 — deploy fake and paid-disabled

- [ ] Deploy private API and one job definition with `analyze|assemble|render`
  allow-list, zero task retries, bounded resources/timeouts/instances, and only
  required secret access.
- [ ] Deploy public frontend with server-only private API origin/audience and
  same-origin `/v1`; keep every live flag false and master paid switch false.
- [ ] Record Cloud Run revisions/digests/nonsecret config and verify the API is
  not public while frontend invocation works.

### Phase 4 — unpaid deployed checkpoint

- [ ] With the private job now provisioned, repeat CL-006/008's pinned speaker
  benchmark on actual Cloud Run CPU/RAM/time/storage settings using approved
  media; record deployment quality/runtime/memory go/no-go, not local inference.
- [ ] Prove CL-011's transferred job/output integrity, private preview/range/
  download, revocation and cleanup without AI calls. This checkpoint means zero
  paid provider calls, not free cloud compute/storage; obtain a bounded cloud
  execution approval. Re-audit any material correction before progressing.

- [ ] Run health/readiness/config, complete sample flow, refresh/recovery, clear,
  expiry, and kill-switch probes without provider calls.
- [ ] Verify headers/CSP/cookies/no-store/proxy, responsive critical path, sample
  asset integrity, content-safe logs/metrics, scale/capacity, and cleanup.
- [ ] Stop if revision/config/log/storage/IAM evidence diverges; correct and
  re-audit before live enablement.

### Phase 5 — bounded live validation and measurement

- [ ] Re-check current provider project/model/data/retention settings, Turnstile,
  hard rate/spend limits, cloud alerts, rights, and authorized call count.
- [ ] Enable only the exact approved flags, use one previously unused short
  synthetic/purpose-recorded fixture, and run one upload → inspect → analysis →
  assembly → read-only review/confirmation → one render → download → clear flow.
- [ ] Verify active speaker, contextual visual grounding/rhythm, caption/sync/
  output, exact provider/image/job counts, no hidden retry, logs, usage/cost,
  object deletion/revocation, and lifecycle backstop.
- [ ] Disable live flags immediately on duplicate/unexpected retention/content
  leak/claim/cost/cleanup deviation and preserve sanitized incident evidence.

### Phase 6 — rollback and release closure

- [ ] Prove master/per-feature kill switches stop new paid work while sample
  remains isolated.
- [ ] Roll back by recorded previous image digests/config snapshot—not rebuilding
  an old branch—and verify health/sample/session compatibility.
- [ ] Restore the approved release state only if authorized; otherwise leave
  live flags off after validation.
- [ ] Complete the release record with public URL, timestamp, SHA/digests/
  revisions, settings review dates, tests, probes, live count, cost, output,
  cleanup, known issues, approvals, and rollback target.

## Privacy, provider, and cost constraints

- Never place secrets in commands, logs, docs, screenshots, image layers, or
  environment examples. Use Secret Manager and runtime identities.
- Release evidence omits account/project IDs, object names, signed URLs,
  transcripts/prompts/media/outputs, provider request IDs, tokens, and secret-
  bearing screenshots.
- Run only the exact authorized live operations. No automatic retries, provider
  fallbacks, stress/load generation, second render, or 60-minute validation.
- Public claims must match measured active-speaker, visual, retention, language,
  upload, and render state. If live upload remains unapproved, deploy sample-only.

## Acceptance criteria

### Technical deployment checkpoint

- [ ] Complete owner GCloud setup guide exists and all actual account/billing/
  API/IAM/resource/budget actions are explicitly authorized and evidenced.
- [ ] Transferred CL-005 mechanism, CL-006/008 target-runtime and CL-011 cloud
  render/storage/delivery/cleanup gates pass; none are inferred from local tests.

- [ ] Exact audited SHA maps to recorded immutable frontend/backend-job digests
  and deployed revisions with no material drift.
- [ ] API/job/bucket stay private; frontend service identity and least-privilege
  runtime identities are proven.
- [ ] Bucket PAP/IAM/CORS/lifecycle/soft-delete/versioning/sample generation and
  Cloud Run caps/retries/timeouts match operations records.
- [ ] Paid/live-disabled health/config/sample/clear probes pass and logs/metrics
  contain no forbidden content or capability.

### Release acceptance after controlled live evidence

- [ ] Exactly authorized provider/image/job operations ran with expected usage,
  cost, latency, output validation, and zero hidden retry/duplication.
- [ ] Speaker framing, visual beats/cards, fixed captions, preview/export
  parity, result/download, and clear meet the source-of-truth release checklist.
- [ ] Source/transcript/assets/output/control objects are deleted/revoked or
  truthfully recorded as pending lifecycle cleanup; no public access exists.
- [ ] Hard provider limits, app kill switches, capacity caps, and advisory cloud
  alerts are distinguished and evidenced.
- [ ] Kill switch and digest rollback are proven; the release record names the
  current and prior targets and all remaining issues/unchecked items.

## Focused verification

- [ ] Re-run exact CL-014 release gate on the frozen candidate before build.
- [ ] Inspect image provenance/layers/digests, deployed nonsecret config,
  service/IAM/bucket/job settings, and production headers/logs.
- [ ] Run unpaid probes first and record provider call counts at zero.
- [ ] Run only the explicitly authorized live flow and reconcile provider/cloud
  usage and billed/estimated cost with the plan.
- [ ] Validate output media and complete cleanup/revocation checks.
- [ ] Exercise kill switch and rollback, then record final state.
- [ ] Inspect local Git status/diff; do not imply deployment changes were
  committed unless the user separately authorized the commit.

## Documentation updates

- Complete deployment, rollback, provider setup, data retention, cost model,
  media rights, render profile, incident, and release-evidence records.
- Update public README with the live URL and only measured public claims after
  the owner approves release.
- Update parent and affected tickets for any externally discovered behavior or
  configuration change, and re-audit the affected scope.

## Owner gates and external blockers

All external work requires explicit authorization and owner-provided access:
cloud project/region/IAM/bucket, provider/Turnstile/Secret Manager settings,
sample rights, spend caps/alerts, live call count, public upload/render/language/
retention decisions, launch approval, and any custom domain. Missing evidence
blocks the corresponding phase; it is never inferred or bypassed.

## Commit boundary

Keep deployment configuration/evidence and only strictly required re-audited
corrections together as `CL-015: deploy and validate ClipBuilder`. Do not add
new product features or speculative infrastructure. This packet does not itself
authorize staging, committing, pushing, purchases, provider mutations, cloud
changes, deployment, public launch, or paid calls; each requires the user's
explicit instruction at execution time.

## Precision references

- [Owner-controlled live validation](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2015-owner-controlled-live-validation)
- [Deployment and operations](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#21-deployment-and-operations)
- [Release acceptance checklist](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#23-release-acceptance-checklist)
- [Owner decisions still required](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#24-owner-decisions-still-required)
- [Definition of done](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#appendix-e--definition-of-done)

## Completion handoff

Report the exact audited SHA/image digests/deployed revisions, cloud/storage/
IAM/job settings, unpaid probes, authorized live operation counts and measured
usage/cost, output/cleanup evidence, public URL/state, kill-switch and rollback
proof, documentation paths, local changed files/Git state, and every remaining
owner/external blocker. Never include a secret or content-bearing identifier.
