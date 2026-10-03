# CL-010 file-level commit plan

The owner authorized immediate sequential staging and committing after a clean
validate pass. CL-010 validation pass 2 has no actionable local findings; all
five root gates pass (558 synthetic tests in 57 files). Live/cloud/paid/native
parity/device/release evidence remains deferred.

1. Stage the following whole files together.
2. Commit with subject: CL-010: connect immutable read-only clip preview
3. Verify the committed file list and clean worktree, then execute CL-011.

- apps/backend/README.md
- apps/backend/src/analysis/analysis.composition.ts
- apps/backend/src/app.ts
- apps/backend/src/assembly/selected-assembly.usecase.ts
- apps/backend/src/assembly/selected-focus.test.ts
- apps/backend/src/http/routes/analysis.route.ts
- apps/backend/src/media/preview-playback.ts
- apps/backend/src/media/renderer.cloudrun.ts
- apps/frontend/README.md
- apps/frontend/src/app/api/analysis/[action]/route.test.ts
- apps/frontend/src/app/api/analysis/[action]/route.ts
- apps/frontend/src/features/assembly/selected-assembly.flow.ts
- apps/frontend/src/features/media/browser.workspace.test.ts
- apps/frontend/src/features/media/browser.workspace.ts
- apps/frontend/src/features/media/workspace.restore.ts
- apps/frontend/src/features/sample/cloud-clip.review.tsx
- apps/frontend/src/features/sample/fixed-review.test.tsx
- apps/frontend/src/features/sample/fixed-review.ts
- apps/frontend/src/features/sample/portrait-player.tsx
- apps/frontend/src/features/sample/review-transcript.tsx
- apps/frontend/src/features/sample/sample.experience.tsx
- apps/frontend/src/features/session/session.reducer.ts
- apps/frontend/src/features/session/session.selectors.ts
- apps/frontend/src/features/session/session.types.ts
- apps/frontend/src/features/source-analysis/analysis-challenge.tsx
- apps/frontend/src/features/source-analysis/source-analysis.api.ts
- apps/renderer/README.md
- apps/renderer/src/app.ts
- apps/renderer/src/expiry/gcs-media-store.ts
- apps/renderer/src/expiry/media-sessions.ts
- apps/renderer/src/expiry/temporary-intent.ts
- apps/renderer/src/media/media-operations.ts
- apps/renderer/src/media/preview.test.ts
- apps/renderer/test/media-fixture.ts
- apps/renderer/test/memory-store.ts
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/operations/COST_MODEL.md
- docs/tickets/CL-010-COMMIT_PLAN.md
- docs/tickets/CL-010-deliver-automatic-clip-review.md
- docs/tickets/README.md
- packages/contracts/src/index.ts
- packages/contracts/src/media-preview.schema.test.ts
- packages/contracts/src/media-preview.schema.ts
