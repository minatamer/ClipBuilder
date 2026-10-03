# CL-009 file-level commit plan

Owner authorized immediate sequential staging/committing after a clean validate pass.
CL-009 validation pass 2: no actionable local findings; five root gates passed.

1. Stage the complete files below with git add -A -- and the listed paths.
2. Commit: CL-009: freeze grounded contextual assembly
3. Verify the commit file list and a clean worktree, then execute CL-010.

No partial-file staging, push, fetch, branch switch, provider/cloud action or deployment.

Whole-file scope (deleted old names included for rename detection):

- apps/backend/README.md
- apps/backend/src/analysis/analysis.composition.ts
- apps/backend/src/app.ts
- apps/backend/src/assembly/fixed-assembly.test.ts
- apps/backend/src/assembly/fixed-assembly.ts
- apps/backend/src/assembly/fixed-captions.ts
- apps/backend/src/assembly/gemini-selected-plan.ts
- apps/backend/src/assembly/gemini-speaker-focus.ts
- apps/backend/src/assembly/selected-assembly.usecase.ts
- apps/backend/src/assembly/selected-focus.test.ts
- apps/backend/src/assembly/selected-focus.usecase.ts
- apps/backend/src/http/routes/analysis.route.ts
- apps/frontend/README.md
- apps/frontend/src/app/api/analysis/[action]/route.test.ts
- apps/frontend/src/app/api/analysis/[action]/route.ts
- apps/frontend/src/features/assembly/selected-assembly.flow.test.ts
- apps/frontend/src/features/assembly/selected-assembly.flow.ts
- apps/frontend/src/features/assembly/selected-assembly.test-fixtures.ts
- apps/frontend/src/features/media/browser.workspace.test.ts
- apps/frontend/src/features/media/browser.workspace.ts
- apps/frontend/src/features/media/workspace.schema.ts
- apps/frontend/src/features/source-analysis/source-analysis.api.ts
- apps/frontend/src/features/source-analysis/source-analysis.flow.ts
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/operations/COST_MODEL.md
- docs/operations/THIRD_PARTY_SOFTWARE.md
- docs/tickets/CL-009-build-contextual-visual-assembly.md
- docs/tickets/CL-009-COMMIT_PLAN.md
- docs/tickets/README.md
- packages/composition/README.md
- packages/composition/src/clip.composition.tsx
- packages/composition/src/fixed-layers.tsx
- packages/composition/src/index.ts
- packages/contracts/src/edit-plan.schema.ts
- packages/contracts/src/index.ts
- packages/contracts/src/selected-assembly.schema.ts
