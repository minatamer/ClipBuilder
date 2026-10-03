# CL-013 / CL-016 UI and source-flow file-level commit plan

On 2026-10-03 the owner explicitly authorized documenting the next session and
staging/committing all pending work sequentially. Baseline:
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1` on `main`, with an empty index.
This plan covers 49 whole files, including this plan. Stage only each listed
group, commit it, verify its exact file inventory, then proceed to the next group.
No hunk splitting, push or external/cloud/provider action is included.

The frontend UI and source-preview changes share whole files and imports, so
they are committed together after the retained-source transport. The final
commit records decisions, evidence and the
[next-session checklist](../operations/LOCAL_RELEASE_PREPARATION.md#owner-next-session-checklist--planned-2026-10-04).
Ignored credentials, retained media, QA captures, runtime records and build
artifacts remain outside the plan.

## 1. Stage 11 files, then commit

Message: `CL-016: add protected retained sample transport`

- `.env.example`
- `apps/backend/README.md`
- `apps/backend/src/app.ts`
- `apps/backend/src/config/env.schema.ts`
- `apps/backend/src/http/routes/retained-sample.route.ts`
- `apps/backend/src/media/retained-sample.gcs.ts`
- `apps/backend/src/media/retained-sample.test.ts`
- `apps/backend/src/media/retained-sample.ts`
- `apps/frontend/src/app/api/analysis/[action]/route.test.ts`
- `apps/frontend/src/app/api/analysis/[action]/route.ts`
- `packages/contracts/src/api.schema.ts`

## 2. Stage 28 files, then commit

Message: `CL-013: refine branded workflow and source preview`

- `apps/frontend/src/app/page.module.css`
- `apps/frontend/src/app/page.test.tsx`
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/src/app/privacy-dialog.tsx`
- `apps/frontend/src/app/process-narrative.tsx`
- `apps/frontend/src/app/start/page.tsx`
- `apps/frontend/src/features/sample/candidate.review.tsx`
- `apps/frontend/src/features/sample/clip-delivery.tsx`
- `apps/frontend/src/features/sample/clip-review-layout.tsx`
- `apps/frontend/src/features/sample/clip.review.tsx`
- `apps/frontend/src/features/sample/cloud-clip.review.tsx`
- `apps/frontend/src/features/sample/cloud-result.tsx`
- `apps/frontend/src/features/sample/development.progress.test.tsx`
- `apps/frontend/src/features/sample/development.progress.ts`
- `apps/frontend/src/features/sample/portrait-player.tsx`
- `apps/frontend/src/features/sample/result-preview.tsx`
- `apps/frontend/src/features/sample/review-revision.test.tsx`
- `apps/frontend/src/features/sample/retained-sample.input.test.ts`
- `apps/frontend/src/features/sample/retained-sample.input.ts`
- `apps/frontend/src/features/sample/sample.experience.tsx`
- `apps/frontend/src/features/sample/sample.module.css`
- `apps/frontend/src/features/sample/source-preview.test.tsx`
- `apps/frontend/src/features/sample/source-preview.tsx`
- `apps/frontend/src/features/sample/use-moment-layout.ts`
- `apps/frontend/src/shared/ui/brand-mark.module.css`
- `apps/frontend/src/shared/ui/brand-mark.tsx`
- `apps/frontend/src/shared/ui/workflow.module.css`
- `apps/frontend/src/styles/tokens.css`

## 3. Stage 10 files, then commit

Message: `CL-013: document UX checkpoint and next-session testing`

- `apps/frontend/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/EXPERIENCE_QUALITY_MATRIX.md`
- `docs/operations/LOCAL_RELEASE_PREPARATION.md`
- `docs/operations/RETAINED_SAMPLE_SETUP.md`
- `docs/tickets/CL-013-WORKFLOW-DESIGN-PLAN.md`
- `docs/tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md`
- `docs/tickets/CL-016-source-preview-and-retained-sample.md`
- `docs/tickets/README.md`
- `docs/tickets/CL-013-016-UI-COMMIT_PLAN.md`

## Verification and handoff

The settled code passed `corepack pnpm format:check`, `lint`, `typecheck`,
`test:unit` and `build`: 680 synthetic tests in 69 files. The owning packets
record the focused tests and emulated browser states; actual source/AI/cloud,
physical-device/accessibility, film and public release evidence remain open.
Documentation-only handoff changes require a fresh diff/format check, not a new
provider test. Check each staged diff and inventory before its commit, then
verify all three committed inventories and an empty index/clean worktree.

Current `FAKE_MODE=true` supports labelled synthetic previews/results without
keys and produces no downloadable MP4. Actual sample playback requires protected
storage/ADC; Gemini and cloud rendering retain separate configuration, live,
rights/transfer and approved spend gates. No local AI weights/runtime are available
or verified. Tomorrow's testing checklist records those prerequisites without
claiming they are already complete.
