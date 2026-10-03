# CL-005–CL-015 file-level commit plan

The owner authorized committing all current changes on 2026-10-03.
Baseline: `1c6e9bab483ac0d933b6fdfe7b41b32f1032e3cf`; the index is empty.
Stage the listed whole files and commit each group in order. No hunk splitting.
This plan covers **23 distinct files in four commits**, including itself and
the earlier owner-decision/source-preservation documentation. Paths are relative
to the repository root. Every commit subject starts with its ticket prefix.

| Order | Commit message | Files |
| --- | --- | ---: |
| 1 | `CL-005: remove obsolete browser output encoding gate` | 4 |
| 2 | `CL-007: enforce complete source quotation tokens` | 3 |
| 3 | `CL-010: commit candidate selection before assembly` | 7 |
| 4 | `CL-015: record release decisions and audit verification` | 9 |

## 1. CL-005: remove obsolete browser output encoding gate

Stage these whole files, then commit with the subject above:

- apps/frontend/src/features/media/source.worker.ts
- apps/frontend/src/features/media/source.worker.test.ts
- apps/frontend/README.md
- docs/tickets/CL-005-implement-secure-upload-and-storage.md

## 2. CL-007: enforce complete source quotation tokens

Stage these whole files, then commit with the subject above:

- apps/backend/src/analysis/analysis.reconciliation.ts
- apps/backend/src/analysis/analysis.test.ts
- docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md

## 3. CL-010: commit candidate selection before assembly

Stage these whole files, then commit with the subject above:

- apps/frontend/src/features/media/browser.workspace.ts
- apps/frontend/src/features/media/browser.workspace.test.ts
- apps/frontend/src/features/assembly/selected-assembly.flow.ts
- apps/frontend/src/features/assembly/selected-assembly.flow.test.ts
- apps/frontend/src/features/assembly/selected-assembly.test-fixtures.ts
- apps/frontend/src/features/sample/sample.experience.tsx
- docs/tickets/CL-010-deliver-automatic-clip-review.md

## 4. CL-015: record release decisions and audit verification

Stage these whole files, then commit with the subject above:

- AGENTS.md
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/operations/COST_MODEL.md
- docs/operations/LOCAL_RELEASE_PREPARATION.md
- docs/tickets/CL-015-deploy-validate-measure-and-rollback.md
- docs/tickets/README.md
- docs/tickets/CL-005-015-AUDIT-COMMIT_PLAN.md

## Verification and boundaries

The settled combined correction passed formatting, lint, type checking, the
production build, `git diff --check` and **665 synthetic tests in 66 files**.
[CL-010](CL-010-deliver-automatic-clip-review.md#settled-cross-ticket-verification-and-revalidation--2026-10-03)
records exact checks and final revalidation with no actionable findings.
Committing changes no application behavior and does not require repeating that
suite. Verify each staged/committed file inventory and an empty index/worktree
after the sequence. Intermediate snapshots are file-group checkpoints; the
combined verification is not claimed for each intermediate commit.

Only the explicit paths above are staged. Ignored owner media, private metadata,
environment files, generated outputs and runtime artifacts stay excluded.
The retained local master remains preserved. No push, cloud mutation, deployment,
provider request or paid operation is part of this plan.

With `FAKE_MODE=true` and no keys, fixture workflow and injected synthetic
verification work; fixture Download remains disabled. Live Gemini requires keys,
enabled live flags and rights/data/spend approvals. Real cloud compute has its
separate approval gate, and device/media/quality/release evidence remains open.
No local AI model or weights are implemented or verified. The Windows artifact's
26 external package links still leave its target-platform release gate open.
