# CL-006 file-level commit plan

Status: **Executed at the owner's request; the final checkpoint is this documentation commit.**
Prepared: 2026-10-02
Baseline: `129d8a7` — `CL-005: add and validate branded README thumbnail`
Scope: the 118 pending non-ignored files inspected at this baseline (54 modified,
64 new), plus this plan. All listed paths are relative to the repository root.
Canonical packet: [CL-006](../tickets/CL-006-build-media-job-and-speaker-feasibility.md).

The **10 commits** follow the order below. The split follows behavior and dependency
boundaries, with tests beside the behavior they verify. The current worktree
already passed 383 unit tests and the five root gates, plus the rights-confirmed
2:45 private cloud media checkpoint. At the owner's subsequent explicit request,
each file group was staged whole and committed directly. Intermediate snapshots
were not reconstructed or individually tested; the settled implementation's
existing checks remain the evidence. No source behavior changed during committing.

With fake AI and no Gemini key, the browser journey still supplies fixtures;
local/native and authorized private cloud media processing are real. Live Gemini
analysis and speaker quality need their later key/flags/rights/paid-transfer gates.
This plan does not implement CL-007 or CL-008.

| Order | Commit subject | Files changed |
| --- | --- | --- |
| 1 | `CL-006: retain bounded browser audio extraction` | 12 |
| 2 | `CL-006: extend the opt-in browser audio feasibility harness` | 6 |
| 3 | `CL-006: define source-bound edit and cloud media contracts` | 7 |
| 4 | `CL-006: establish Google configuration and shared composition` | 20 |
| 5 | `CL-006: add the isolated Node media pipeline` | 17 |
| 6 | `CL-006: fence temporary sessions and verify media cleanup` | 11 |
| 7 | `CL-006: expose the private renderer API and control adapter` | 6 |
| 8 | `CL-006: package and verify the Linux renderer image` | 8 |
| 9 | `CL-006: document migration decisions and cloud operations` | 11 |
| 10 | `CL-006: record completion and the next ticket handoff` | 21 |

The table records actual whole-file changes. The detailed path lists below retain
the original shared-file entries; files already committed in an earlier group
added no later diff. There are **119 distinct files**, including this record.

## Execution record

Commits completed before the final documentation checkpoint:

| Order | Commit | Subject |
| --- | --- | --- |
| 1 | `9993391` | `CL-006: retain bounded browser audio extraction` |
| 2 | `a514c0e` | `CL-006: extend the opt-in browser audio feasibility harness` |
| 3 | `375a556` | `CL-006: define source-bound edit and cloud media contracts` |
| 4 | `3c46ee5` | `CL-006: establish Google configuration and shared composition` |
| 5 | `6318d56` | `CL-006: add the isolated Node media pipeline` |
| 6 | `1cf9cf1` | `CL-006: fence temporary sessions and verify media cleanup` |
| 7 | `66478e9` | `CL-006: expose the private renderer API and control adapter` |
| 8 | `e8a3475` | `CL-006: package and verify the Linux renderer image` |
| 9 | `b7a8355` | `CL-006: document migration decisions and cloud operations` |
| 10 | This final documentation commit | `CL-006: record completion and the next ticket handoff` |

The owner's direct-staging instruction superseded the initially proposed
shared-file hunk/lockfile reconstruction. The final `pnpm-lock.yaml` and workspace
settings landed whole in commit 4; the renderer package manifest landed whole
in commit 5. Later repeated entries were unchanged. These intermediate commits
are file-group checkpoints; individual runnable snapshots are not claimed.

Only the exact planned paths were staged. No reset, checkout, dependency install,
lockfile regeneration, new cloud operation or push was performed. The relevant
verification notes below preserve the original plan; they do not claim tests
ran separately for every commit.

## 1. CL-006: retain bounded browser audio extraction

Preserve the useful browser worker audio slice: bounded extraction, downmix/resampling, Opus/PCM timing, progress, cancellation, source-client ownership and workspace cleanup. This is retained CL-006 work from the earlier browser phase, not a new final-export path.

Dependencies: Existing committed CL-005 browser intake and admission foundation.

Files:

```text
apps/frontend/src/features/media/browser.workspace.test.ts
apps/frontend/src/features/media/browser.workspace.ts
apps/frontend/src/features/media/source.client.test.ts
apps/frontend/src/features/media/source.client.ts
apps/frontend/src/features/media/source.protocol.ts
apps/frontend/src/features/media/source.worker.ts
apps/frontend/src/features/media/audio.extraction.test.ts
apps/frontend/src/features/media/audio.extraction.ts
apps/frontend/src/features/media/audio.profile.ts
apps/frontend/src/features/media/audio.protocol.ts
apps/frontend/src/features/media/audio.samples.test.ts
apps/frontend/src/features/media/audio.samples.ts
```

Verification when committing: Run the focused audio, source-client and workspace unit tests; frontend typecheck.

## 2. CL-006: extend the opt-in browser audio feasibility harness

Keep opt-in feasibility tooling separate from product code. Include the synthetic generator callback repair, actual production-module audio comparison, partial-write failure controls and harness route tests. The harness remains excluded from deployment.

Dependencies: Commit 1.

Files:

```text
apps/frontend/feasibility/browser-media/README.md
apps/frontend/feasibility/browser-media/index.html
apps/frontend/feasibility/browser-media/main.mjs
apps/frontend/feasibility/browser-media/server.mjs
apps/frontend/feasibility/browser-media/server.test.mjs
apps/frontend/feasibility/browser-media/worker.mjs
```

Verification when committing: Run the feasibility server/sync-access tests and lint. Use the recorded synthetic evidence; do not launch another real-media or paid test.

## 3. CL-006: define source-bound edit and cloud media contracts

Commit the canonical v2 edit/focus/caption/card schemas, source/object generation descriptors, admission/prepare/render/cancel contracts and Google provenance labels with their tests.

Dependencies: Existing contracts package.

Files:

```text
packages/contracts/src/index.ts
packages/contracts/src/transcript.schema.ts
packages/contracts/src/visual-plan.schema.ts
packages/contracts/src/cloud-media.schema.ts
packages/contracts/src/cloud-media.test.ts
packages/contracts/src/edit-plan.schema.ts
packages/contracts/src/edit-plan.test.ts
```

Verification when committing: Build/typecheck contracts and run its unit tests, including malformed ranges, source binding and output bounds.

## 4. CL-006: establish Google configuration and shared composition

Move server configuration/admission timeouts to Google; keep credentials blank and fake/paid/live defaults safe. Introduce the complete shared React composition and enforce the approved dependency directions. Keep all manifests and their lockfile snapshot aligned.

Dependencies: Commit 3; preserves the browser work in commits 1–2.

Files:

```text
.env.example
AGENTS.md
apps/backend/package.json
apps/backend/src/admission/admission.composition.ts
apps/backend/src/config/env.schema.ts
apps/backend/src/config/loadConfig.test.ts
apps/frontend/package.json
eslint.config.mjs
test/boundaries.test.ts
test/no-network.setup.ts
packages/composition/README.md
packages/composition/package.json
packages/composition/src/clip.composition.tsx
packages/composition/src/focus-layout.test.ts
packages/composition/src/focus-layout.ts
packages/composition/src/index.ts
packages/composition/tsconfig.json
packages/composition/vitest.config.ts
pnpm-workspace.yaml
pnpm-lock.yaml
```

Verification when committing: Run backend config/admission tests, composition tests/build, import-boundary tests and lint. Verify frozen installation against this commit's manifests.

## 5. CL-006: add the isolated Node media pipeline

Introduce the real renderer workspace with config parsing/tests, baked-tool paths, fixed SSR worker/composition, inspection, proxy/cut/output validation and owned native process cancellation. Include the opt-in local synthetic proof and bundle/browser preparation tools.

Dependencies: Commits 3–4.

Files:

```text
package.json
apps/renderer/.env.example
apps/renderer/package.json
apps/renderer/tsconfig.json
apps/renderer/vitest.config.ts
apps/renderer/src/config.ts
apps/renderer/src/config.test.ts
apps/renderer/src/composition/root.tsx
apps/renderer/src/composition/render-worker.ts
apps/renderer/src/media/media.failure.ts
apps/renderer/src/media/inspection.ts
apps/renderer/src/media/node-pipeline.ts
apps/renderer/src/media/process-runner.ts
apps/renderer/src/media/process-runner.test.ts
apps/renderer/scripts/build-bundle.ts
apps/renderer/scripts/prepare-browser.ts
apps/renderer/feasibility/node-media.ts
pnpm-lock.yaml
```

Verification when committing: Run renderer config/process-runner tests, renderer/composition typecheck and build. Ordinary unit tests stay credential-free and network-blocked. Preserve the existing synthetic proof instead of repeating downloads/cloud work.

## 6. CL-006: fence temporary sessions and verify media cleanup

Keep the cleanup dependency closure together: encrypted unfinished-upload capabilities, generation/CAS journals, GCS storage, terminal/orphan expiry, bounded operation dispatch, scratch accounting, cleanup retry obligations and synthetic fixture ports. Include the final Linux lstat/ENOENT correction and its regressions here, rather than committing a known broken scanner first. This also captures the CL-005 temporary-media prerequisite delivered during CL-006.

Dependencies: Commits 3 and 5.

Files:

```text
apps/renderer/src/expiry/gcs-media-store.ts
apps/renderer/src/expiry/media-sessions.test.ts
apps/renderer/src/expiry/media-sessions.ts
apps/renderer/src/expiry/temporary-intent.ts
apps/renderer/src/expiry/upload-capability.ts
apps/renderer/test/media-fixture.ts
apps/renderer/test/memory-store.ts
apps/renderer/src/media/media-operations.ts
apps/renderer/src/media/media-operations.test.ts
apps/renderer/src/media/scratch-usage.ts
apps/renderer/src/media/scratch-usage.test.ts
```

Verification when committing: Run renderer lifecycle, media-operation and scratch regressions; assert exact injected call counts, retained cleanup obligations and fail-closed intake.

## 7. CL-006: expose the private renderer API and control adapter

Wire purpose-specific private authentication, health/admission/prepare/render/cancel/expiry routes and explicit service startup. Add the separate typed backend Cloud Run client, bounded responses and ID-token headers. The current browser journey still uses fixtures; this is not CL-007 live analysis integration.

Dependencies: Commits 4–6.

Files:

```text
apps/renderer/src/auth/caller-verifier.ts
apps/renderer/src/app.ts
apps/renderer/src/app.test.ts
apps/renderer/src/server.ts
apps/backend/src/media/renderer.cloudrun.ts
apps/backend/src/media/renderer.cloudrun.test.ts
apps/renderer/package.json
```

Verification when committing: Run renderer app/authentication tests and backend Cloud Run client tests; verify that importing modules performs no login/listening/provider work.

## 8. CL-006: package and verify the Linux renderer image

Commit only the final working Linux packaging: pinned Docker base, portable workspace deployment, allowlisted build context, tool hashes and versions, PNG/PCM synthetic Linux render/scratch/cancellation gate and Cloud Build limits. Keep generated bundles/tool records ignored. Do not reconstruct the failed rawvideo/BMP image versions as commits.

Dependencies: Commits 3–7.

Files:

```text
.gitignore
.prettierignore
apps/renderer/Dockerfile
apps/renderer/cloudbuild.yaml
apps/renderer/scripts/build-context.ts
apps/renderer/scripts/build-context.test.ts
apps/renderer/scripts/stage-tools.ts
apps/renderer/scripts/verify-linux-media.mjs
pnpm-workspace.yaml
pnpm-lock.yaml
```

Verification when committing: Run build-context tests and script syntax/lint. Confirm context exclusions and portable package metadata. The recorded successful immutable image is existing evidence; creating these commits does not authorize another cloud build/deploy.

## 9. CL-006: document migration decisions and cloud operations

Keep architecture, operational safeguards and preserved research together: Google/private renderer responsibilities, superseded browser/model options, provider/software readiness, exact build/media allowances, private rights attestation and setup/expiry instructions. These are documentation and evidence, not implementations of tickets 7–15.

Dependencies: Commit 8, so documented implementation and cloud evidence match the committed code.

Files:

```text
docs/architecture/BROWSER_OWNED_MEDIA.md
docs/operations/COST_MODEL.md
docs/operations/MEDIA_RIGHTS_RECORD.md
docs/operations/PROVIDER_SETUP.md
docs/operations/THIRD_PARTY_SOFTWARE.md
docs/architecture/DOCUMENTATION_REVIEW.md
docs/architecture/GEMINI_REMOTION_MIGRATION.md
docs/architecture/MIGRATION_FILE_INVENTORY.md
docs/operations/CLOUD_RUN_RENDERER_SETUP.md
docs/research/ACTIVE_SPEAKER_OPTIONS.md
docs/research/ARCHIVED_GEMINI_BROWSER_PLAN.md
```

Verification when committing: Parse changed Markdown and verify local links after commit 10 completes the documentation set. Preserve all remaining live AI, public rights/notices, maximum-envelope and release gates.

## 10. CL-006: record completion and the next ticket handoff

Close the current packet with measured private-test evidence and update public/package guides and the dependency queue. Keep the failed attempts as history; record the final digest, four media operations, five builds, output/audio/cancel/expiry results and later gates. Include this commit plan.

Dependencies: Commits 1–9.

Files:

```text
README.md
apps/backend/README.md
apps/frontend/README.md
docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
docs/README.md
docs/tickets/CL-004A-prepare-third-party-provider-readiness.md
docs/tickets/CL-005-implement-secure-upload-and-storage.md
docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md
docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md
docs/tickets/CL-008-productionize-active-speaker-assembly.md
docs/tickets/CL-009-build-contextual-visual-assembly.md
docs/tickets/CL-010-deliver-automatic-clip-review.md
docs/tickets/CL-011-render-and-deliver-final-clip.md
docs/tickets/CL-012-harden-security-privacy-abuse-and-spend.md
docs/tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md
docs/tickets/CL-014-audit-release-candidate.md
docs/tickets/CL-015-deploy-validate-measure-and-rollback.md
docs/tickets/README.md
packages/contracts/README.md
apps/renderer/README.md
docs/operations/CL_006_COMMIT_PLAN.md
```

Verification when committing: Run final diff/content checks, Markdown/link validation and the required five root gates. Confirm the exact staged paths and that no private/generated artifacts are included.

## Documentation reconciliation included in the final commit

A few owning guides described an earlier pre-cloud snapshot. Their current
statements were reconciled with completed CL-006 evidence; historical evidence
was preserved:

- `packages/contracts/README.md`: replace “pending/frozen” contract wording with
  the delivered strict v2/cloud schemas and implemented shared-package boundary.
- `apps/frontend/README.md`: distinguish the unfinished browser/control journey
  from the completed private renderer smoke; reflect confirmed private SSR
  license coverage without claiming complete release notices or live AI quality.
- `docs/README.md`: reflect completed private setup/test evidence while keeping
  new external actions and public deployment separately gated.
- `docs/tickets/CL-005-implement-secure-upload-and-storage.md`: link its temporary
  media prerequisite to the actual isolated GCS/resumable-cancel/IAM/independent
  expiry proof in CL-006; keep browser product integration and public release open.

These are status corrections, not new implementation work or a reason to reopen
the completed CL-006 foundation. Later ticket documents in commit 10 contain
migration/dependency updates only; their feature implementations remain pending.

## Exclusions and completion evidence

Keep ignored/private/runtime material out of every commit: `private/**`,
`.env.local`, credentials/ADC/service-account files, owner/project/account
identifiers, real media/transcripts, downloaded output/proxy, signed upload
capabilities, `.pnpm-store/**`, `node_modules/**`, compiled `dist/**`,
`apps/renderer/bundle/**`, tool records, screenshots and temporary build
contexts. Retired untracked model/browser-export experiments do not appear as
Git deletions; do not reintroduce them to manufacture a cleanup commit.

Commit the final working implementation. Failed build diagnoses belong in the
ticket's evidence, not in deliberately broken source snapshots.

The final documentation commit must preserve these distinctions:

- CL-006 foundation is complete; CL-007 is next and CL-008 depends on CL-007.
- Real 2:45 source, cloud proxy and a selected 10-second portrait MP4 were
  verified; the fixed captions/cards are synthetic test plans, not Gemini output.
- Output/proxy audio alignment, partial-upload cancel/replay, native Linux
  cancellation and accelerated independent expiry/deletion passed.
- Five builds and four cloud media operations were recorded, with zero AI calls.
- Original local source was preserved; test media/build contexts were removed.
- Billed charges were not checked. Private service/registry/storage/secret/
  scheduler resources remain retained; alerts are advisory.
- The 20-minute/500-MiB/60-second stress envelope, actual browser flow/phone
  playback, live grounding/speaker quality, public sample rights, complete
  notices/telemetry and public release remain separate gates.

The settled implementation already passed these five root gates:
`corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`,
`corepack pnpm build`, including 383 unit tests. Committing the existing source
did not require a new paid/cloud test. Documentation parsing, local-link checks,
diff checks and final Git cleanliness were verified for this Git checkpoint.
