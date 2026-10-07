# CL-015 release-preparation commit plan — 2026-10-07

The owner reports the complete local paid upload-to-export flow working and explicitly authorizes this whole-file plan, staging and commits, followed by frontend/backend Cloud Run deployment. No push or branch/history rewrite is requested. Baseline: `444bf242ee697e5ec0aa2d671891a6a5b3fb7f34`; index initially empty.

The existing preparation source manifest matches 399 inputs. All five settled root gates passed with 1,239 synthetic tests in 108 files; exact Linux image/runtime/scan receipts remain in the preparation report. The owner paid walkthrough is human-reported evidence, not an agent-paid test or evidence of hosted/domain operation. The copied FFmpeg public-processing gate remains open. No ignored environment, secret, private media, capture, runtime log or temporary cloud record is included.

Stage and verify each exact whole-file group, commit in order, verify each committed inventory, then require an empty index and clean worktree. The combined snapshot is the validated preparation; follow-up hosted/domain corrections require their own checks and CL-015-prefixed commits.

## File-level groups

### 1. CL-015: prepare hosted identity transport and retire local analysis replay

- `apps/backend/.env.example`
- `apps/backend/src/analysis/analysis.composition.ts`
- `apps/backend/src/analysis/analysis.test.ts`
- `apps/backend/src/analysis/analysis.usecase.ts`
- `apps/backend/src/analysis/sample-replay.test.ts`
- `apps/backend/src/analysis/sample-replay.ts`
- `apps/backend/src/app.ts`
- `apps/backend/src/config/env.schema.ts`
- `apps/backend/src/config/loadConfig.ts`
- `apps/backend/src/http/frontend-caller.test.ts`
- `apps/backend/src/http/frontend-caller.ts`
- `apps/backend/src/http/routes/admission.route.ts`
- `apps/backend/src/http/routes/analysis.route.ts`
- `apps/backend/src/http/routes/session-exit.route.ts`
- `apps/backend/src/server.ts`
- `apps/frontend/.env.example`
- `apps/frontend/src/app/api/analysis/[action]/route.test.ts`
- `apps/frontend/src/app/api/analysis/[action]/route.ts`
- `apps/frontend/src/app/api/diagnostics/route.ts`
- `apps/frontend/src/app/api/sample/[...path]/route.ts`
- `apps/frontend/src/app/api/session/exit/route.ts`
- `apps/frontend/src/features/media/browser.workspace.test.ts`
- `apps/frontend/src/features/media/browser.workspace.ts`
- `apps/frontend/src/features/media/workspace.schema.ts`
- `apps/frontend/src/features/sample/sample.experience.tsx`
- `apps/frontend/src/features/source-analysis/sample-replay.flow.test.ts`
- `apps/frontend/src/features/source-analysis/sample-replay.flow.ts`
- `apps/frontend/src/features/source-analysis/session-start.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.api.ts`
- `apps/frontend/src/server/control-api.test.ts`
- `apps/frontend/src/server/control-api.ts`
- `packages/contracts/src/api.schema.ts`
- `packages/contracts/src/grounded-analysis.schema.ts`
- `test/deterministic.environment.ts`
- `test/pre-import-guard.fixture.ts`
- `test/pre-import-guard.test.ts`

### 2. CL-015: package verified Linux images and landing delivery assets

- `apps/backend/cloudbuild.yaml`
- `apps/backend/Dockerfile`
- `apps/backend/package.json`
- `apps/frontend/cloudbuild.yaml`
- `apps/frontend/Dockerfile`
- `apps/frontend/public/favicon.png`
- `apps/frontend/public/product-film/analysis.png`
- `apps/frontend/public/product-film/build.png`
- `apps/frontend/public/product-film/candidates.png`
- `apps/frontend/public/product-film/intake.png`
- `apps/frontend/public/product-film/opening.jpg`
- `apps/frontend/public/product-film/preparation.png`
- `apps/frontend/public/product-film/render.png`
- `apps/frontend/public/product-film/result.png`
- `apps/frontend/public/product-film/review.png`
- `apps/frontend/public/product-film/selected.png`
- `apps/frontend/public/product-film/source.png`
- `apps/frontend/scripts/delivery-assets.json`
- `apps/frontend/scripts/verify-release-artifact.ts`
- `apps/frontend/src/app/layout.tsx`
- `apps/frontend/src/app/robots.test.ts`
- `apps/frontend/src/app/robots.ts`
- `apps/frontend/src/features/product-film/film-timeline.ts`
- `apps/frontend/src/proxy.ts`
- `apps/renderer/cloudbuild.yaml`
- `apps/renderer/Dockerfile`
- `apps/renderer/scripts/build-context.ts`
- `apps/renderer/scripts/stage-tools.ts`
- `scripts/prepare-app-image.mjs`
- `scripts/verify-image-runtime.mjs`
- `test/app-image.test.ts`
- `test/release-artifact.test.ts`

### 3. CL-015: record release preparation and owner paid walkthrough

- `AGENTS.md`
- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/renderer/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07_EVIDENCE.json`
- `docs/operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07_INPUTS.json`
- `docs/operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07.md`
- `docs/operations/LOCAL_RELEASE_PREPARATION.md`
- `docs/operations/RELEASE_CANDIDATE_AUDIT.md`
- `docs/tickets/CL-007-local-sample-replay-and-thumbnails.md`
- `docs/tickets/CL-012-harden-security-privacy-abuse-and-spend.md`
- `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`
- `docs/tickets/README.md`
- `docs/tickets/CL-015-RELEASE-PREPARATION-COMMIT_PLAN.md`

## Execution evidence

Implementation commit identities are recorded before the final documentation commit. Its exact subject identifies the final commit, which cannot include its own hash. Deployment evidence and remaining owner-only gates are recorded separately.

- `0f63ad27f59dafbe8ef48b842de1528a87418da7` — CL-015: prepare hosted identity transport and retire local analysis replay (36 files; exact inventory verified).
- `27f47d70e8556f39b14fecc544debd6d3f1c31a1` — CL-015: package verified Linux images and landing delivery assets (32 files; exact inventory verified).
