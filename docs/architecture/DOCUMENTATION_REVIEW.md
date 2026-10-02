# Cloud migration documentation handoff

Status: **Owner-approved documentation and local corrections, 2026-10-02.**

The latest owner decision selects Gemini, our private standard Remotion
Node/Docker Cloud Run renderer, and private temporary GCS. Storage architecture
is already approved. [Migration plan](GEMINI_REMOTION_MIGRATION.md),
[file inventory](MIGRATION_FILE_INVENTORY.md), and
[later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md) are the concrete
review artifacts. Earlier conflicting mechanisms are explicitly superseded;
historical measurements and unrelated owner edits are preserved.

## Approval recorded and external decisions still needed

The owner approved renderer/shared-composition boundaries, resource/request
limits, upload transport, deletion/expiry/retry settings and truthful outage
retention limits. These choices no longer need documentation approval. At the later setup checkpoint, verify actual project
ID/region, billing/test ceiling, IAM, Remotion license/telemetry, source rights
and Google data-transfer/paid-call approval. The project display name alone
establishes none of these. Do not ask again whether temporary GCS is approved.

Fake/live AI and local/cloud compute are independent. Offline tests need no keys
or cloud; fake AI using Cloud Run still consumes cloud resources. No credentials,
cloud resources, private uploads, paid calls or Git mutation were performed for
this documentation pass. The documentation-only evidence below remains historical; current local code
and five-gate evidence are recorded separately in CL-006. Cloud quality is unproved.

## Final documentation corrections

The public README now describes temporary GCS upload, the Gemini proxy transfer,
private Node export and cleanup, while preserving the unfinished fake-product
status. It no longer assigns original/output ownership or final encoding to the
browser. The plan/index/CL-015/setup guide place bounded private infrastructure
at the first genuine cloud-dependent local test after minimum image/adapters and
private-access/cleanup/spend controls are ready; they do not require all later
features or CL-014 first. Complete public deployment retains its later release
audit and separate approval. The setup guide identifies the human developer's
service-account-scoped Token Creator grant before ADC impersonation, with both
placeholder CLI and dashboard instructions. Cleanup targets remain consistent:
proposed healthy 2h33m raw / 43m final output, including sweep execution; outages
can extend physical retention and close intake. Necessary local implementation resumed after the explicit owner approval.

## Exact documentation paths changed

This list records modified/new Markdown documents in the current workspace,
including earlier preserved evidence. Root AGENTS.md is an owner edit and is
excluded. Source/package changes made before the pause are outside this docs
handoff and are not approved or completed by it.

| Documentation path |
| --- |
| [apps/backend/README.md](../../apps/backend/README.md) |
| [apps/frontend/feasibility/browser-media/README.md](../../apps/frontend/feasibility/browser-media/README.md) |
| [apps/frontend/README.md](../../apps/frontend/README.md) |
| [docs/architecture/BROWSER_OWNED_MEDIA.md](BROWSER_OWNED_MEDIA.md) |
| [docs/architecture/DOCUMENTATION_REVIEW.md](DOCUMENTATION_REVIEW.md) |
| [docs/architecture/GEMINI_REMOTION_MIGRATION.md](GEMINI_REMOTION_MIGRATION.md) |
| [docs/architecture/MIGRATION_FILE_INVENTORY.md](MIGRATION_FILE_INVENTORY.md) |
| [docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md) |
| [docs/operations/CLOUD_RUN_RENDERER_SETUP.md](../operations/CLOUD_RUN_RENDERER_SETUP.md) |
| [docs/operations/COST_MODEL.md](../operations/COST_MODEL.md) |
| [docs/operations/MEDIA_RIGHTS_RECORD.md](../operations/MEDIA_RIGHTS_RECORD.md) |
| [docs/operations/PROVIDER_SETUP.md](../operations/PROVIDER_SETUP.md) |
| [docs/operations/THIRD_PARTY_SOFTWARE.md](../operations/THIRD_PARTY_SOFTWARE.md) |
| [docs/README.md](../README.md) |
| [docs/research/ACTIVE_SPEAKER_OPTIONS.md](../research/ACTIVE_SPEAKER_OPTIONS.md) |
| [docs/research/ARCHIVED_GEMINI_BROWSER_PLAN.md](../research/ARCHIVED_GEMINI_BROWSER_PLAN.md) |
| [docs/tickets/CL-004A-prepare-third-party-provider-readiness.md](../tickets/CL-004A-prepare-third-party-provider-readiness.md) |
| [docs/tickets/CL-005-implement-secure-upload-and-storage.md](../tickets/CL-005-implement-secure-upload-and-storage.md) |
| [docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md](../tickets/CL-006-build-media-job-and-speaker-feasibility.md) |
| [docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md](../tickets/CL-007-deliver-live-analysis-vertical-slice.md) |
| [docs/tickets/CL-008-productionize-active-speaker-assembly.md](../tickets/CL-008-productionize-active-speaker-assembly.md) |
| [docs/tickets/CL-009-build-contextual-visual-assembly.md](../tickets/CL-009-build-contextual-visual-assembly.md) |
| [docs/tickets/CL-010-deliver-automatic-clip-review.md](../tickets/CL-010-deliver-automatic-clip-review.md) |
| [docs/tickets/CL-011-render-and-deliver-final-clip.md](../tickets/CL-011-render-and-deliver-final-clip.md) |
| [docs/tickets/CL-012-harden-security-privacy-abuse-and-spend.md](../tickets/CL-012-harden-security-privacy-abuse-and-spend.md) |
| [docs/tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md](../tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md) |
| [docs/tickets/CL-014-audit-release-candidate.md](../tickets/CL-014-audit-release-candidate.md) |
| [docs/tickets/CL-015-deploy-validate-measure-and-rollback.md](../tickets/CL-015-deploy-validate-measure-and-rollback.md) |
| [docs/tickets/README.md](../tickets/README.md) |
| [packages/contracts/README.md](../../packages/contracts/README.md) |
| [README.md](../../README.md) |

## Historical documentation-only verification

Across 31 modified/new Markdown documents, 323 local link targets exist; history
blocks are balanced. Exactly one canonical CL-007 packet exists and
`git diff --check` passes. Nothing is staged. No code tests or provider/cloud
experiments were run during this pass. Cleanup bounds include the scheduler
interval, one retry and its three-minute execution budget: proposed healthy
2h33m raw / 43m final output; outages remain an explicit limitation.

Documentation/local-code approval has been granted;
cloud setup and live media tests require their separate later authorization.

## Current approved local execution

The CL-005 prerequisite and [CL-006 foundation](../tickets/CL-006-build-media-job-and-speaker-feasibility.md)
now pass all five root gates and 380 unit tests, plus synthetic Windows Node
render/proxy/audio/cancellation proof. This supersedes current pause/approval
claims from the documentation-only snapshot, while preserving its old evidence.
The initial topology remains frontend/control API local, one private media
renderer plus private temporary bucket/registry/IAM/expiry. The Windows host
has no Docker CLI; gcloud is not on PATH. The setup guide supplies an allowlisted
Cloud Build path and actual disabled env/auth/key-mount/expiry boundaries.
Linux/cloud/Gemini quality and public integration are still unchecked. No new
independent review, usage polling, cloud action, credentials, paid calls or Git
mutations were performed. No documentation approval is needed again.

Final documentation check: **34 changed/new Markdown documents** parse with
the installed Markdown formatter, **331 relative file-link targets** exist and
history fences balance. Current approval/pause status was reconciled; historical
pending decisions remain explicitly historical. `git diff --check` passes.
