# CL-012 file-level commit plan

Owner approved staging and commits through CL-015. Stage these whole files,
then make one commit; no hunk splitting or additional Git action.

1. Stage the files below.
2. Commit: `CL-012: harden public demo controls`.
3. Verify the committed file list and clean worktree; continue CL-013.

Validation pass 2: no actionable local findings. Five settled root gates and
`git diff --check` pass, 616 synthetic tests in 63 files. Real cloud/provider,
media/device, rights/license and owner release gates remain deferred.

Files:

- apps/backend/README.md
- apps/backend/src/app.test.ts
- apps/backend/src/app.ts
- apps/backend/src/assembly/selected-focus.test.ts
- apps/backend/src/http/routes/analysis.route.ts
- apps/backend/src/media/artifact-stream.test.ts
- apps/backend/src/media/artifact-stream.ts
- apps/backend/src/media/output-delivery.ts
- apps/backend/src/media/preview-playback.ts
- apps/frontend/README.md
- apps/frontend/src/app/api/analysis/[action]/route.test.ts
- apps/frontend/src/app/api/analysis/[action]/route.ts
- apps/frontend/src/app/layout.tsx
- apps/frontend/src/app/page.test.tsx
- apps/frontend/src/app/privacy-dialog.tsx
- apps/frontend/src/features/sample/sample.experience.tsx
- apps/frontend/src/proxy.test.ts
- apps/frontend/src/proxy.ts
- apps/renderer/README.md
- apps/renderer/src/app.test.ts
- apps/renderer/src/app.ts
- apps/renderer/src/expiry/disposable-storage.test.ts
- apps/renderer/src/expiry/gcs-media-store.ts
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/architecture/GEMINI_REMOTION_MIGRATION.md
- docs/architecture/MIGRATION_FILE_INVENTORY.md
- docs/operations/COST_MODEL.md
- docs/operations/SECURITY_PRIVACY_CONTROLS.md
- docs/tickets/CL-012-COMMIT_PLAN.md
- docs/tickets/CL-012-harden-security-privacy-abuse-and-spend.md
- docs/tickets/README.md
