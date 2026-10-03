# CL-014 file-level commit plan

Owner approved staging and commits through CL-015. Stage these whole files,
then make one commit.

1. Stage the files below.
2. Commit: `CL-014: audit the ClipBuilder release candidate`.
3. Verify files/clean worktree; continue CL-015 local preparation.

Validation: no actionable local findings. Offline frozen installation, all
five root gates and diff check pass, 624 synthetic tests in 64 files. Public
release, actual media/device/film/provider/cloud/rights/spend evidence is open.

Files:

- .github/workflows/quality.yml
- README.md
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/README.md
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/operations/CLOUD_RUN_RENDERER_SETUP.md
- docs/operations/RELEASE_CANDIDATE_AUDIT.md
- docs/tickets/CL-014-COMMIT_PLAN.md
- docs/tickets/CL-014-audit-release-candidate.md
- docs/tickets/README.md
- test/no-network.setup.ts
- test/pre-import-guard.fixture.ts
- test/pre-import-guard.test.ts
