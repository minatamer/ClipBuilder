# CL-013 browser QA file-level commit plan

The owner authorized the fake-mode QA/fix/document follow-up and staging/commits
through CL-015. Stage whole files once, then commit; no hunk splitting.

1. Stage these files together:
   - apps/frontend/src/app/page.module.css
   - apps/frontend/src/features/sample/sample.module.css
   - apps/frontend/src/features/sample/clip.review.tsx
   - apps/frontend/src/features/sample/review-revision.test.tsx
   - docs/operations/EXPERIENCE_QUALITY_MATRIX.md
   - docs/tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md
   - docs/tickets/README.md
   - docs/tickets/CL-013-BROWSER-QA-COMMIT_PLAN.md
2. Commit: `CL-013: fix verified accessibility issues and record browser QA`.
3. Verify the commit's eight-file inventory and clean worktree.

The implementation adds three CSS minimum dimensions using the existing
44px target token and visible associated text for fake Download's prerequisite.
Fixture and recovery behavior was rechecked after rebuild;
live AI, real MP4, physical devices, full accessibility, film and release approvals
remain unverified. Ignored QA logs, launchers, screenshots and sentinels stay out
of the commit.

Final read-only validation reports no actionable findings for the follow-up.
All five settled root gates and `git diff --check` pass: 632 tests in 65 files.
Temporary QA browsers, both owned process trees and ports 3000/4000 are cleared.
