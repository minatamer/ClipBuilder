# CL-015 release-preparation commit plan — 2026-10-07

The owner reports the complete local paid upload-to-export flow working and explicitly authorizes this whole-file plan, staging and commits, followed by frontend/backend Cloud Run deployment. No push or branch/history rewrite is requested. Baseline: `444bf242ee697e5ec0aa2d671891a6a5b3fb7f34`; index initially empty.

The existing preparation source manifest matches 399 inputs. All five settled root gates passed with 1,239 synthetic tests in 108 files; exact Linux image/runtime/scan receipts remain in the preparation report. The owner paid walkthrough is human-reported evidence, not an agent-paid test or evidence of hosted/domain operation. The copied FFmpeg public-processing gate remains open. No ignored environment, secret, private media, capture, runtime log or temporary cloud record is included.

Stage and verify each exact whole-file group, commit in order, verify each committed inventory, then require an empty index and clean worktree. The combined snapshot is the validated preparation; follow-up hosted/domain corrections require their own checks and CL-015-prefixed commits.

## File-level groups

### Domain attachment correction follow-up

Under the continuing owner-authorized deployment/commit instruction, prepare
`CL-015: correct the confirmed public domain and preserve exact origin checks`:

- `packages/contracts/src/public-site.ts`
- `apps/backend/src/http/frontend-caller.test.ts`
- `apps/frontend/src/server/control-api.test.ts`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md`
- `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`
- `docs/tickets/CL-015-RELEASE-PREPARATION-COMMIT_PLAN.md`

Verify the corrected exact host, rejection of the earlier spelling and other
hosts/protocols/ports, and unchanged localhost behavior before staging. This
source correction does not claim DNS/TLS or corrected image rollout complete.

The group passes contracts build, 16 focused fake/no-key origin regressions and
root format/lint/typecheck. A settled read-only review finds no actionable local
issue. The exact seven-file inventory is committed under the subject above;
Google's verified mapping and its pending DNS/TLS are recorded in the guide.

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
- `669363f6d231f435aff73380d2f8c3f168837888` — CL-015: record release preparation and owner paid walkthrough (15 files; exact inventory verified).

## Deployment follow-up whole-file groups

These necessary hosted/domain/native corrections follow the owner deployment instruction. Format, lint, typecheck and 1,244 fake/off tests in 109 files pass. Linux build/runtime/scan evidence passes before rollout; the isolated Windows build cannot follow dependency junctions outside Turbopack root and is not claimed as passing.

### 4. CL-015: allow the owner production domain with exact origin checks

- `apps/backend/src/config/env.schema.ts`
- `apps/backend/src/http/frontend-caller.test.ts`
- `apps/frontend/.env.example`
- `apps/frontend/src/server/control-api.test.ts`
- `apps/frontend/src/server/control-api.ts`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/public-site.ts`

### 5. CL-015: isolate uploaded media from bundled native codec vulnerabilities

- `apps/renderer/Dockerfile`
- `apps/renderer/scripts/stage-tools.ts`
- `apps/renderer/scripts/verify-linux-media.mjs`
- `apps/renderer/src/composition/render-worker.ts`
- `apps/renderer/src/composition/source-boundary.test.ts`
- `apps/renderer/src/composition/source-boundary.ts`
- `apps/renderer/src/config.test.ts`
- `apps/renderer/src/config.ts`
- `scripts/verify-image-runtime.mjs`

### 6. CL-015: preserve exact public origin checks behind Cloud Run

The first deployed configuration GET returned a generic 400 before backend dispatch. Next standalone constructs `request.url` using its container bind address. Resolve hosted origin from the exact configured public Host and HTTPS proxy marker; ignore forwarded-host substitutions and retain declared Origin/CSRF checks. Local request origins stay fixed. The Linux offline proof now exercises this production proxy case and rejects a foreign Host.

- `apps/frontend/src/app/api/analysis/[action]/route.ts`
- `apps/frontend/src/app/api/diagnostics/route.ts`
- `apps/frontend/src/app/api/sample/[...path]/route.test.ts`
- `apps/frontend/src/app/api/sample/[...path]/route.ts`
- `apps/frontend/src/app/api/session/exit/route.ts`
- `apps/frontend/src/server/control-api.test.ts`
- `apps/frontend/src/server/control-api.ts`
- `scripts/verify-image-runtime.mjs`

### 7. CL-015: enforce supported codecs before native media probing

Keep all existing supported video/audio codecs and the MP4-only, two-stream product boundary. Apply their single contract-owned allowlist to native probing and decode inputs before an unsupported decoder can open. Repeat the Linux synthetic audio/export/cancel proof and image scan; do not interpret unfixed scanner entries as patched binaries.

- `apps/renderer/src/media/inspection.ts`
- `apps/renderer/src/media/node-pipeline.ts`
- `apps/renderer/src/media/source-inspection.test.ts`

### 8. CL-015: send exact proxy host headers in the Linux runtime proof

The first corrected frontend Linux build compiled but its offline acceptance failed because Node fetch rewrites the custom Host to the loopback URL authority. A short synthetic loopback check reproduced this. Use native HTTP for the two configuration checks so the valid/foreign Host cases reach Next with the intended headers. Keep the failed receipt; no failed image is deployed.

- `scripts/verify-image-runtime.mjs`

### 9. CL-015: document hosted deployment domain setup and release evidence

- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/renderer/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07_EVIDENCE.json`
- `docs/operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07_INPUTS.json`
- `docs/operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md`
- `docs/operations/RELEASE_CANDIDATE_AUDIT.md`
- `docs/tickets/CL-012-harden-security-privacy-abuse-and-spend.md`
- `docs/tickets/CL-015-RELEASE-PREPARATION-COMMIT_PLAN.md`
- `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`
- `docs/tickets/README.md`

Owning service guides, security/release ledger and structured source/image receipts are updated with actual results and listed exactly before this documentation commit. No private identifier, secret value or real content is staged.
- `3dd7b32f0c385435fd63757f5b40d139853dd659` — CL-015: allow the owner production domain with exact origin checks (7 files; exact inventory verified).
- `9f222c54ef462a5eb4fea5d278e5d3e7158659ec` — CL-015: isolate uploaded media from bundled native codec vulnerabilities (9 files; exact inventory verified).
- `a36db6a66283008200f2fb72739aa004338c7fb0` — CL-015: preserve exact public origin checks behind Cloud Run (8 files; exact inventory verified).
- `8a4b6f71e9776e2e91a710646db1db97bde936c8` — CL-015: enforce supported codecs before native media probing (3 files; exact inventory verified).
- `08592e3325b9cc94c1e7f7e62ee6d75d1ad987ba` — CL-015: send exact proxy host headers in the Linux runtime proof (1 file; exact inventory verified).
