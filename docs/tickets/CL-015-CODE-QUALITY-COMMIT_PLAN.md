# CL-015-prefixed code-quality file-level commit plan

Owner authorization — 2026-10-07: create this plan, then stage and commit the
completed code-quality audit/remediation and its clean follow-up validation. Use
`CL-015:` on every commit message, as explicitly requested. The audit remains
owned by CL-014; this prefix identifies the deployment-ticket checkpoint. The
index was empty on `main` at base revision
`452728c127ca123809df1a850ae6114256998537`.

Use the four whole-file commits below in order. No hunk splitting, branch
change, push, fetch/pull, history rewrite, provider/cloud action, app restart or
deployment is included.

## Candidate and verification

The exact 375-file source/config/test/build input SHA is
`b6e34464f21d02dd495b464f1c2fea106810d083af1192272f2b77fc7f1c97fd`, recorded in
the
[current input manifest](../operations/CODE_QUALITY_REMEDIATION_2026-10-07_INPUTS.json).
Source bytes and lockfile match the validated proposal. Format, lint, typecheck,
1,223 synthetic tests in 104 files and the isolated production build pass.
Follow-up validation has no new actionable local findings; see the
[walkthrough](../operations/CODE_QUALITY_VALIDATION_2026-10-07.md). These checks
were completed before staging; only documentation/bookkeeping changes afterward,
so no implementation retest is needed.

The frontend's connected changes stay in one commit because whole files mix
cleanup, audio retirement and diagnostic call sites. Separating those files
would introduce missing imports or transiently discard existing upload/preview
diagnostic fields. Backend lifecycle and fixture-only changes can stand alone.

Files below are exact repository-relative pathspecs, not directories/globs. M =
modified, A = added, D = deleted. Both ends of retained audio moves are listed;
Git may display them as renames. Total: **85 whole paths**.

## 1. harden admission deadlines and explicit startup

Commit subject: `CL-015: harden admission deadlines and explicit startup`

Admission cause/expiry fencing and explicit backend startup, with their fake
regressions.

| Whole file                                                | Action |
| --------------------------------------------------------- | ------ |
| `apps/backend/src/admission/processing.admission.test.ts` | M      |
| `apps/backend/src/admission/processing.admission.ts`      | M      |
| `apps/backend/src/server.test.ts`                         | A      |
| `apps/backend/src/server.ts`                              | M      |

This commit contains 4 whole paths.

## 2. isolate schema fixtures and preserve precise media timing

Commit subject:
`CL-015: isolate schema fixtures and preserve precise media timing`

Retired generation-schema support moves outside the production graph; renderer
timing characterization preserves the reason for retaining exact probes.

| Whole file                                               | Action |
| -------------------------------------------------------- | ------ |
| `apps/backend/src/analysis/analysis.provider-shape.ts`   | M      |
| `apps/backend/src/analysis/gemini.diagnostics.test.ts`   | M      |
| `apps/backend/src/analysis/transcribed-analysis.test.ts` | M      |
| `apps/backend/test/candidate-schema.fixture.ts`          | A      |
| `apps/renderer/src/media/source-inspection.test.ts`      | M      |

This commit contains 5 whole paths.

## 3. preserve frontend lifecycle and private diagnostics

Commit subject: `CL-015: preserve frontend lifecycle and private diagnostics`

Connected browser/backend diagnostic contracts, preserved private logging,
generic recovery, resource cleanup, CSP-safe worker/page initialization,
measured review work, obsolete audio/test-UI retirement, and executable
boundary/artifact guards.

| Whole file                                                           | Action |
| -------------------------------------------------------------------- | ------ |
| `apps/backend/src/analysis/analysis.diagnostics.ts`                  | M      |
| `apps/backend/src/app.ts`                                            | M      |
| `apps/backend/src/http/routes/browser-diagnostic.route.test.ts`      | A      |
| `apps/backend/src/http/routes/browser-diagnostic.route.ts`           | A      |
| `apps/frontend/feasibility/browser-audio/README.md`                  | A      |
| `apps/frontend/feasibility/browser-audio/audio.extraction.test.ts`   | A      |
| `apps/frontend/feasibility/browser-audio/audio.extraction.ts`        | A      |
| `apps/frontend/feasibility/browser-audio/audio.profile.ts`           | A      |
| `apps/frontend/feasibility/browser-audio/audio.protocol.ts`          | A      |
| `apps/frontend/feasibility/browser-audio/audio.samples.test.ts`      | A      |
| `apps/frontend/feasibility/browser-audio/audio.samples.ts`           | A      |
| `apps/frontend/feasibility/browser-media/README.md`                  | M      |
| `apps/frontend/feasibility/browser-media/index.html`                 | D      |
| `apps/frontend/feasibility/browser-media/main.mjs`                   | D      |
| `apps/frontend/feasibility/browser-media/server.mjs`                 | D      |
| `apps/frontend/feasibility/browser-media/server.test.mjs`            | D      |
| `apps/frontend/feasibility/browser-media/worker.mjs`                 | D      |
| `apps/frontend/package.json`                                         | M      |
| `apps/frontend/scripts/verify-release-artifact.ts`                   | M      |
| `apps/frontend/src/app/api/diagnostics/route.test.ts`                | A      |
| `apps/frontend/src/app/api/diagnostics/route.ts`                     | A      |
| `apps/frontend/src/app/error.test.tsx`                               | A      |
| `apps/frontend/src/app/error.tsx`                                    | M      |
| `apps/frontend/src/app/global-error.tsx`                             | A      |
| `apps/frontend/src/browser-contract-validation.ts`                   | A      |
| `apps/frontend/src/features/diagnostics/browser-console.test.ts`     | A      |
| `apps/frontend/src/features/diagnostics/browser-console.ts`          | A      |
| `apps/frontend/src/features/diagnostics/browser.diagnostics.test.ts` | A      |
| `apps/frontend/src/features/diagnostics/browser.diagnostics.ts`      | A      |
| `apps/frontend/src/features/media/audio.extraction.test.ts`          | D      |
| `apps/frontend/src/features/media/audio.extraction.ts`               | D      |
| `apps/frontend/src/features/media/audio.profile.ts`                  | D      |
| `apps/frontend/src/features/media/audio.protocol.ts`                 | D      |
| `apps/frontend/src/features/media/audio.samples.test.ts`             | D      |
| `apps/frontend/src/features/media/audio.samples.ts`                  | D      |
| `apps/frontend/src/features/media/browser.workspace.test.ts`         | M      |
| `apps/frontend/src/features/media/browser.workspace.ts`              | M      |
| `apps/frontend/src/features/media/source.client.test.ts`             | M      |
| `apps/frontend/src/features/media/source.client.ts`                  | M      |
| `apps/frontend/src/features/media/source.protocol.ts`                | M      |
| `apps/frontend/src/features/media/source.worker.test.ts`             | M      |
| `apps/frontend/src/features/media/source.worker.ts`                  | M      |
| `apps/frontend/src/features/sample/cloud-clip.review.tsx`            | M      |
| `apps/frontend/src/features/sample/failure-message.ts`               | A      |
| `apps/frontend/src/features/sample/preview-playback.diagnostics.ts`  | M      |
| `apps/frontend/src/features/sample/sample.experience.tsx`            | M      |
| `apps/frontend/src/features/sample/workflow-recovery.test.tsx`       | A      |
| `apps/frontend/src/features/sample/workflow-recovery.tsx`            | A      |
| `apps/frontend/src/features/session/session.effects.test.ts`         | A      |
| `apps/frontend/src/features/session/session.effects.ts`              | M      |
| `apps/frontend/src/features/session/session.provider.tsx`            | M      |
| `apps/frontend/src/features/source-analysis/cloud-upload.test.ts`    | M      |
| `apps/frontend/src/features/source-analysis/cloud-upload.ts`         | M      |
| `apps/frontend/src/features/source-analysis/source-analysis.api.ts`  | M      |
| `apps/frontend/src/instrumentation-client.test.ts`                   | M      |
| `apps/frontend/src/instrumentation-client.ts`                        | M      |
| `eslint.config.mjs`                                                  | M      |
| `packages/contracts/src/browser-diagnostic.schema.test.ts`           | A      |
| `packages/contracts/src/browser-diagnostic.schema.ts`                | A      |
| `packages/contracts/src/index.ts`                                    | M      |
| `test/boundaries.test.ts`                                            | M      |
| `test/release-artifact.test.ts`                                      | M      |

This commit contains 62 whole paths.

## 4. document code audit, validation and release handoff

Commit subject: `CL-015: document code audit, validation and release handoff`

Audit/plan/input manifests, current and historical evidence, owning
guides/constraints, ticket reconciliation, Git authorization and this file-level
plan.

| Whole file                                                        | Action |
| ----------------------------------------------------------------- | ------ |
| `AGENTS.md`                                                       | M      |
| `apps/frontend/README.md`                                         | M      |
| `docs/operations/CODE_QUALITY_AUDIT_2026-10-07.md`                | A      |
| `docs/operations/CODE_QUALITY_AUDIT_2026-10-07_INPUTS.json`       | A      |
| `docs/operations/CODE_QUALITY_REMEDIATION_2026-10-07.md`          | A      |
| `docs/operations/CODE_QUALITY_REMEDIATION_2026-10-07_INPUTS.json` | A      |
| `docs/operations/CODE_QUALITY_REMEDIATION_PLAN_2026-10-07.md`     | A      |
| `docs/operations/CODE_QUALITY_VALIDATION_2026-10-07.md`           | A      |
| `docs/operations/LOCAL_RELEASE_PREPARATION.md`                    | M      |
| `docs/operations/RELEASE_CANDIDATE_AUDIT.md`                      | M      |
| `docs/tickets/CL-014-audit-release-candidate.md`                  | M      |
| `docs/tickets/CL-015-CODE-QUALITY-COMMIT_PLAN.md`                 | A      |
| `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`     | M      |
| `docs/tickets/README.md`                                          | M      |

This commit contains 14 whole paths.

## Execution procedure and evidence

Before each commit, stage only its listed paths and compare the exact staged
name set with its inventory using rename detection disabled. Run
`git diff --cached --check`, inspect the staged summary and confirm no ignored
or unplanned input is present. Create the exact `CL-015:` subject, then verify
the committed whole-path inventory and an empty index before the next group.
Record implementation commit identities below before staging commit 4. Its own
identity is available in Git history under the exact final subject. After all
four commits, verify a clean worktree and unchanged source/lockfile hashes.

- Commit 1: `b4a16600c27584dfb8f4abd9dbbd12a05c23d30b`; exact 4-path inventory
  and empty index verified.
- Commit 2: `ff73cfe59a8a8a9bb01b41f16cb36d6ff5f2c10f`; exact 5-path inventory
  and empty index verified.
- Commit 3: `e0cf3e13d6a72b40949989ebd0099039c7cdf047`; exact 62-path inventory
  and empty index verified.
- Commit 4: final documentation subject above; final verification follows
  execution.

## Exclusions and remaining gates

No ignored local environment, credentials, retained/private source, original
capture, saved replay, generated motion pixels, output videos, dependency/build
output or private test/backend/process logs is staged, read, removed or altered.
The lockfile has no change. All private logs remain available outside Git.

`FAKE_MODE=true` without keys supports labelled fixture/injected checks; fixture
Download is disabled. Real analysis/assembly/render requires the owner-managed
provider and private storage/renderer, enabled live flags and applicable
rights/transfer/spend/cloud approvals. Paid testing remains owner-only; no local
AI weights/runtime were added. Strict self-contained target packaging,
STRIDE/current external scans, owner manual/device/rights/quality acceptance,
hosted operations, replay release cleanup and deployment remain open. Git
approval does not mark those gates passed.
