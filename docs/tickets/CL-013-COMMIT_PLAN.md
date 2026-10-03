# CL-013 file-level commit plan

Owner approved staging and commits through CL-015. Stage these whole files,
then make one commit; no hunk splitting.

1. Stage the files below.
2. Commit: `CL-013: complete the experience quality pass`.
3. Verify files and clean worktree; continue CL-014.

Local validation has no actionable findings. All five settled root gates and
`git diff --check` pass, 623 synthetic tests in 64 files. The manual quality
matrix, real media/device evidence and owner film/UI/rights gates remain open.

Files:

- apps/frontend/README.md
- apps/frontend/src/features/render/output-playback.test.ts
- apps/frontend/src/features/render/output-playback.ts
- apps/frontend/src/features/sample/candidate.review.tsx
- apps/frontend/src/features/sample/cloud-clip.review.tsx
- apps/frontend/src/features/sample/cloud-result.tsx
- apps/frontend/src/features/sample/fixed-review.test.tsx
- apps/frontend/src/features/sample/native-range-playback.test.ts
- apps/frontend/src/features/sample/native-range-playback.ts
- apps/frontend/src/features/sample/portrait-player.tsx
- apps/frontend/src/features/sample/review-transcript.tsx
- apps/frontend/src/features/sample/sample.experience.tsx
- apps/frontend/src/features/sample/sample.module.css
- apps/frontend/src/features/sample/use-range-playback.ts
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/operations/EXPERIENCE_QUALITY_MATRIX.md
- docs/tickets/CL-013-COMMIT_PLAN.md
- docs/tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md
- docs/tickets/README.md
