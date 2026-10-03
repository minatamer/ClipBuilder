# CL-015 file-level commit plan

Owner approved staging and commits through CL-015. Stage these whole files,
then make one commit.

1. Stage the files below.
2. Commit: `CL-015: prepare gated release verification`.
3. Verify the committed files and clean worktree; stop at the authorized local endpoint.

Validation: no actionable local findings. All five root gates and diff check
pass, 632 synthetic tests in 65 files. Local artifact inventory passes; strict
release verification correctly rejects 26 external Windows package links.
Target-platform image, public deployment, actual media/device/film/provider/
cloud/rights/spend and operational rollback acceptance remain unchecked.
Fake/no-key results are synthetic; real processing needs keys/live approvals
and independently approved cloud compute. No local AI weights are used.

Files:

- README.md
- apps/frontend/README.md
- apps/frontend/package.json
- apps/frontend/scripts/verify-release-artifact.ts
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/README.md
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/operations/LOCAL_RELEASE_PREPARATION.md
- docs/operations/RELEASE_CANDIDATE_AUDIT.md
- docs/tickets/CL-015-COMMIT_PLAN.md
- docs/tickets/CL-015-deploy-validate-measure-and-rollback.md
- docs/tickets/README.md
- test/release-artifact.test.ts
