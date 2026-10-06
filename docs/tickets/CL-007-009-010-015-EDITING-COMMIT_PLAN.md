# CL-007 / CL-009 / CL-010 / CL-015 editing file-level commit plan

The owner explicitly authorized planning, staging and committing all current
unstaged work on 2026-10-06. This is local Git authorization; no push, deployment,
cloud change, paid test or new validate workflow is included.

Baseline: `60613d4ba20c5e2cebbaf3ce90bfe34ab8fc68b8` on `main`, with an empty index.
The inventory has 108 existing changed/new/deleted paths plus this plan:
109 whole files across three commits. No hunks are split.

Shared files combine several owner revisions. Keep the backend configuration,
picture admission, manifest/contract migration, signed visual descriptions,
composition/renderer consumers and their synthetic fixtures together. CL-007
owns permanent local saved-moments replay; CL-009 owns caption/framing/visual
quality and nonfatal critiques; CL-010 owns signed review descriptions and the
review experience; CL-015 owns environment-only configuration and its gates.
The complete stack is the already tested working revision. These whole-file
commits are one coordinated delivery, not separately verified release builds.

Private environment/settings, retained media, provider captures, generated assets,
launch records/logs, local QA output and build products stay ignored and outside
every commit. The removed runtime example/reader/schema are tracked deletions;
no private runtime file or environment contents are staged.

Verification carried forward from the settled implementation: root format, lint,
typecheck, unit and build gates pass; 1,199 synthetic tests in 95 files use
explicit fake/paid-off pre-import isolation, no API keys and no provider calls.
The verified backend restart preserved logs and frontend identity. Live visual
quality, the separate generated-image failure, matching private renderer rollout,
real devices/rights/spend and strict target-platform deployment remain open.
No local AI model/weights are added. Commit preparation does not repeat live or
browser/media simulation; stage checks verify exact paths and whitespace.

## 1. Shared editing pipeline and configuration

Message: `CL-007, CL-009, CL-010, CL-015: update editing pipeline and backend configuration`

Includes nonfatal Gemini-output handling; larger spoken-word captions; portrait opening/held-face fallback and hard cuts; Commons relevance/timing normalization and generated fallback; signed retained-picture notes; bounded diagnostics/admission; private renderer v3/inline raster compatibility; and environment-only real/paid-on defaults with paid-off precedence and fake-test isolation. Synthetic playback/render harness source is retained, not run. The no-deadline local replay and shared synthetic browser fixtures stay with their backend/config dependencies.

Stage exactly these 80 paths:

- `AGENTS.md`
- `apps/backend/.env.example`
- `apps/backend/package.json`
- `apps/backend/runtime.example.json` (tracked deletion)
- `apps/backend/src/admission/processing.admission.test.ts`
- `apps/backend/src/admission/processing.admission.ts`
- `apps/backend/src/admission/turnstile.verifier.test.ts`
- `apps/backend/src/analysis/analysis.composition.ts`
- `apps/backend/src/analysis/analysis.diagnostics.test.ts`
- `apps/backend/src/analysis/analysis.diagnostics.ts`
- `apps/backend/src/analysis/analysis.test.ts`
- `apps/backend/src/analysis/analysis.validation-diagnostics.ts`
- `apps/backend/src/analysis/gemini.adapter.ts`
- `apps/backend/src/analysis/gemini.local-capture.test.ts`
- `apps/backend/src/analysis/sample-replay.test.ts`
- `apps/backend/src/analysis/sample-replay.ts`
- `apps/backend/src/analysis/transcribed-analysis.test.ts`
- `apps/backend/src/app.test.ts`
- `apps/backend/src/assembly/commons-pictures.test.ts`
- `apps/backend/src/assembly/commons-pictures.ts`
- `apps/backend/src/assembly/contextual-pictures.test.ts`
- `apps/backend/src/assembly/contextual-pictures.ts`
- `apps/backend/src/assembly/fixed-assembly.test.ts`
- `apps/backend/src/assembly/fixed-assembly.ts`
- `apps/backend/src/assembly/fixed-captions.ts`
- `apps/backend/src/assembly/gemini-pictures.test.ts`
- `apps/backend/src/assembly/gemini-pictures.ts`
- `apps/backend/src/assembly/gemini-selected-plan.ts`
- `apps/backend/src/assembly/picture-raster.ts`
- `apps/backend/src/assembly/picture-relevance.ts`
- `apps/backend/src/assembly/selected-assembly.usecase.ts`
- `apps/backend/src/assembly/selected-focus.test.ts`
- `apps/backend/src/assembly/speaker-focus.test.ts`
- `apps/backend/src/assembly/speaker-focus.ts`
- `apps/backend/src/composition.ts`
- `apps/backend/src/config/env.schema.ts`
- `apps/backend/src/config/loadConfig.test.ts`
- `apps/backend/src/config/loadConfig.ts`
- `apps/backend/src/config/runtime.local.ts` (tracked deletion)
- `apps/backend/src/config/runtime.schema.ts` (tracked deletion)
- `apps/backend/src/demo/developmentPreview.test.ts`
- `apps/backend/src/media/renderer.cloudrun.test.ts`
- `apps/backend/src/media/renderer.diagnostics.test.ts`
- `apps/backend/src/media/retained-sample.test.ts`
- `apps/backend/src/server.ts`
- `apps/backend/test/environment.fixture.ts`
- `apps/frontend/feasibility/edit-playback/browser.tsx`
- `apps/frontend/feasibility/edit-playback/run.mjs`
- `apps/frontend/src/features/assembly/selected-assembly.flow.test.ts`
- `apps/frontend/src/features/assembly/selected-assembly.test-fixtures.ts`
- `apps/frontend/src/features/media/browser.workspace.test.ts`
- `apps/frontend/src/features/session/session.test-fixtures.ts`
- `apps/renderer/feasibility/edit-render.ts`
- `apps/renderer/feasibility/node-media.ts`
- `apps/renderer/src/app.test.ts`
- `apps/renderer/src/app.ts`
- `apps/renderer/src/composition/inline-pictures.test.ts`
- `apps/renderer/src/composition/inline-pictures.ts`
- `apps/renderer/src/composition/render-worker.ts`
- `apps/renderer/src/composition/root.tsx`
- `apps/renderer/src/expiry/media-sessions.test.ts`
- `apps/renderer/src/media/node-pipeline.ts`
- `apps/renderer/src/media/output.test.ts`
- `packages/composition/src/clip.composition.tsx`
- `packages/composition/src/fixed-layers.tsx`
- `packages/composition/src/focus-layout.test.ts`
- `packages/composition/src/focus-layout.ts`
- `packages/composition/src/index.ts`
- `packages/contracts/src/cloud-media.schema.ts`
- `packages/contracts/src/contextual-picture.schema.ts`
- `packages/contracts/src/edit-plan.schema.ts`
- `packages/contracts/src/edit-plan.test.ts`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/selected-assembly.schema.ts`
- `packages/contracts/src/selected-focus.schema.ts`
- `packages/contracts/src/transcript.schema.ts`
- `pnpm-lock.yaml`
- `test/deterministic.environment.ts`
- `test/pre-import-guard.fixture.ts`
- `test/pre-import-guard.test.ts`

## 2. Review experience and playback

Message: `CL-009, CL-010: improve playback, slide navigation and edit notes`

Includes buffering-aware preview diagnostics, shared desktop/touch control auto-hide, design-system laptop slide arrows with native smooth scrolling, privacy disclosure, and readable edit summaries grounded in actual crop changes, retained picture descriptions and selected evidence. It consumes the preceding shared contracts; no editor or extra AI call is added.

Stage exactly these 11 paths:

- `apps/frontend/src/app/privacy-dialog.tsx`
- `apps/frontend/src/features/sample/clip-review-layout.tsx`
- `apps/frontend/src/features/sample/cloud-clip.review.tsx`
- `apps/frontend/src/features/sample/fixed-review.test.tsx`
- `apps/frontend/src/features/sample/fixed-review.ts`
- `apps/frontend/src/features/sample/playback-controls.test.ts`
- `apps/frontend/src/features/sample/playback-controls.ts`
- `apps/frontend/src/features/sample/portrait-player.tsx`
- `apps/frontend/src/features/sample/preview-playback.diagnostics.test.ts`
- `apps/frontend/src/features/sample/preview-playback.diagnostics.ts`
- `apps/frontend/src/features/sample/sample.module.css`

## 3. Owning documentation and execution evidence

Message: `CL-007, CL-009, CL-010, CL-015: document editing and configuration evidence`

Includes the source of truth, owning service/package guides, operations boundaries, ticket-local decisions/plans/results, index and this exact file inventory. Earlier verification records remain history, and real/cloud/manual acceptance is not inferred from synthetic checks.

Stage exactly these 18 paths:

- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/renderer/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/CLOUD_RUN_RENDERER_SETUP.md`
- `docs/operations/COST_MODEL.md`
- `docs/operations/GROUNDED_ANALYSIS_CHECK.md`
- `docs/operations/LOCAL_RELEASE_PREPARATION.md`
- `docs/operations/PROVIDER_SETUP.md`
- `docs/operations/RETAINED_SAMPLE_SETUP.md`
- `docs/operations/SECURITY_PRIVACY_CONTROLS.md`
- `docs/tickets/CL-007-009-010-015-EDITING-COMMIT_PLAN.md`
- `docs/tickets/CL-007-local-sample-replay-and-thumbnails.md`
- `docs/tickets/CL-009-build-contextual-visual-assembly.md`
- `docs/tickets/CL-010-deliver-automatic-clip-review.md`
- `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`
- `docs/tickets/README.md`
- `packages/composition/README.md`

## Execution

Approved for sequential execution. Before each commit, require its exact path
set in the index, check staged whitespace, and confirm the next worktree matches
the remaining inventory. Record implementation/UI commit IDs here before the
documentation commit; the documentation commit contains this plan. Finish with
an empty index and clean tracked/untracked status, preserving ignored private
assets and running apps.

Executed implementation/UI groups (exact planned paths and subjects verified):

- `e99a401e9478c0482bf31fcc388c63c697da5e9b` — CL-007, CL-009, CL-010, CL-015: update editing pipeline and backend configuration (80 files).
- `fbe8a6617cbd46c602c9621b1fbd17a03450e713` — CL-009, CL-010: improve playback, slide navigation and edit notes (11 files).

The final documentation group includes this record. Its commit ID is reported
after commit, rather than creating a self-referential document hash. The existing
1,199-test/five-gate evidence is unchanged; no code was edited during commit
preparation and no live provider or validate workflow ran.
