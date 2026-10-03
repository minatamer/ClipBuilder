# CL-011 file-level commit plan

Owner-authorized immediate whole-file staging and committing after clean validate
pass 2. Five root gates pass; 592 synthetic tests in 60 files. Native quality,
provider/cloud/paid/device/rights/release evidence remains deferred.

1. Stage all whole files listed below together.
2. Commit: CL-011: render and deliver the final clip
3. Verify the committed file list and clean worktree, then execute CL-012.

- .env.example
- apps/backend/README.md
- apps/backend/src/admission/processing.admission.ts
- apps/backend/src/analysis/analysis.composition.ts
- apps/backend/src/app.ts
- apps/backend/src/assembly/selected-focus.test.ts
- apps/backend/src/config/env.schema.ts
- apps/backend/src/config/loadConfig.test.ts
- apps/backend/src/config/loadConfig.ts
- apps/backend/src/http/routes/analysis.route.ts
- apps/backend/src/media/artifact-stream.ts
- apps/backend/src/media/output-delivery.ts
- apps/backend/src/media/preview-playback.ts
- apps/backend/src/media/renderer.cloudrun.ts
- apps/backend/src/render/final-render.usecase.ts
- apps/backend/test/environment.fixture.ts
- apps/frontend/README.md
- apps/frontend/src/app/api/analysis/[action]/route.test.ts
- apps/frontend/src/app/api/analysis/[action]/route.ts
- apps/frontend/src/features/media/browser.workspace.test.ts
- apps/frontend/src/features/media/browser.workspace.ts
- apps/frontend/src/features/media/workspace.restore.ts
- apps/frontend/src/features/media/workspace.schema.ts
- apps/frontend/src/features/render/final-render.flow.test.ts
- apps/frontend/src/features/render/final-render.flow.ts
- apps/frontend/src/features/render/output-playback.ts
- apps/frontend/src/features/sample/cloud-result.tsx
- apps/frontend/src/features/sample/portrait-player.tsx
- apps/frontend/src/features/sample/sample.experience.tsx
- apps/frontend/src/features/session/session.reducer.ts
- apps/frontend/src/features/session/session.selectors.ts
- apps/frontend/src/features/session/session.types.ts
- apps/frontend/src/features/source-analysis/analysis-challenge.tsx
- apps/frontend/src/features/source-analysis/source-analysis.api.ts
- apps/renderer/README.md
- apps/renderer/src/app.ts
- apps/renderer/src/composition/render-worker.ts
- apps/renderer/src/expiry/media-sessions.ts
- apps/renderer/src/media/inspection.ts
- apps/renderer/src/media/media-operations.ts
- apps/renderer/src/media/node-pipeline.ts
- apps/renderer/src/media/output-validation.test.ts
- apps/renderer/src/media/output.test.ts
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/operations/RENDER_PROFILE.md
- docs/tickets/CL-011-COMMIT_PLAN.md
- docs/tickets/CL-011-render-and-deliver-final-clip.md
- docs/tickets/README.md
- packages/contracts/src/admission.schema.ts
- packages/contracts/src/cloud-media.schema.ts
- packages/contracts/src/final-render.schema.ts
- packages/contracts/src/index.ts
- test/no-network.setup.ts
- test/pre-import-guard.fixture.ts
- test/pre-import-guard.test.ts
