# CL-197–208 — File-level local commit plan

Owner authorization: 2026-11-03, “file commit plan, multiple commits, stage and
commit; will review this work tomorrow.” Local staging and commits are
authorized for this pending work. The packets' earlier no-Git/unstaged notes
describe their implementation handoffs; this later instruction supersedes them
for this Git task only. Do not push. Personal review is pending for 2026-11-04.

## Scope and allocation

The baseline is `438e0fe`. Allocate every current changed/untracked repository
file exactly once, including this plan: 83 complete files in six commits. No
partial staging, temporary source rewrites, history edits or broad `git add .`.
Preserve ignored configuration, saved sources/drafts/exports, private
diagnostics, proof artifacts and the running app. No processing, provider/model
call, download, cloud operation, deployment or app restart is part of this task.

Several packets share complete files. The contracts/backend commit includes clip
names/removal, camera paths, caption defaults and stable person reuse. The
renderer/tracker commit supplies local processing; the following editor commit
connects it and includes rail/naming/picture-viewer integration, Zoom/Motion
Capture and the corrected Motion default. The selection commit includes JSON
exchange and Analysis Capture; shared CSS already resides with the editor. Each
ticket's full feature is reviewed against the final series, rather than claiming
every prerequisite commit is a separately completed feature. Shared
authority/feature guides and this execution record go in the final commit.

## 1. CL-197: reuse saved-video validation after byte verification

- `apps/backend/local/source-acquisition.test.ts`
- `apps/backend/local/source-acquisition.ts`
- `apps/backend/local/source-library.test.ts`
- `apps/backend/local/source-library.ts`
- `test/owner-acquisition-api.test.ts`
- `test/owner-acquisition.proof.ts`
- `docs/tickets/CL-197-reuse-saved-source-validation.md`

## 2. CL-199-206: persist clip metadata, camera paths and speaker defaults

- `packages/contracts/local/camera-follow.test.ts`
- `packages/contracts/local/camera-follow.ts`
- `packages/contracts/local/camera-motion.ts`
- `packages/contracts/local/caption-speakers.test.ts`
- `packages/contracts/local/caption-speakers.ts`
- `packages/contracts/local/clip-name.test.ts`
- `packages/contracts/local/clip-name.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/collection-pages.ts`
- `packages/contracts/local/diagnostics.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/focus-people.test.ts`
- `packages/contracts/local/focus-people.ts`
- `packages/contracts/local/focus.ts`
- `packages/contracts/local/hosted-editing.ts`
- `packages/contracts/local/utf8.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/edit-clip.ts`
- `apps/backend/local/focus-planning-policy.ts`
- `apps/backend/local/server.ts`
- `apps/frontend/src/features/local-editing/styled-caption.test.tsx`
- `test/owner-editor.test.ts`
- `docs/tickets/CL-199-clip-display-names-and-download-filenames.md`
- `docs/tickets/CL-201-remove-canceled-clips.md`
- `docs/tickets/CL-204-caption-word-pop-speaker-highlight-defaults.md`
- `docs/tickets/CL-205-stable-automatic-person-reuse.md`

## 3. CL-203-206: track head motion locally and render camera paths

- `apps/frontend/src/features/local-editing/head-pixel-tracker.test.ts`
- `apps/frontend/src/features/local-editing/head-pixel-tracker.ts`
- `apps/frontend/src/features/local-editing/track-head-video.ts`
- `apps/frontend/src/features/local-editing/bulk-head-motion.test.ts`
- `apps/frontend/src/features/local-editing/bulk-head-motion.ts`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/focus-filter.ts`
- `apps/renderer/README.md`
- `test/local-camera-motion.proof.ts`
- `test/local-speaker-hook.proof.ts`

## 4. CL-198-208: restore clip previews and complete Motion editor controls

- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/experience.tsx`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/focus-preview-controls.tsx`
- `apps/frontend/src/features/local-editing/camera-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/bulk-head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-name-controls.tsx`
- `apps/frontend/src/features/local-editing/clip-rail-preview.tsx`
- `apps/frontend/src/features/local-editing/use-clip-entry.ts`
- `apps/frontend/src/features/local-editing/picture-image-dialog.module.css`
- `apps/frontend/src/features/local-editing/picture-image-dialog.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `test/local-responsive-editor.proof.ts`
- `test/local-head-motion-editor.proof.ts`
- `test/local-camera-motion-editor.proof.ts`
- `docs/tickets/CL-198-desktop-portrait-clip-rail-and-editor-transition.md`
- `docs/tickets/CL-202-large-editor-image-dialog.md`
- `docs/tickets/CL-203-manual-head-follow-camera-motion.md`
- `docs/tickets/CL-206-numbered-motion-previews-and-track-all-speakers.md`
- `docs/tickets/CL-208-motion-default-camera-end.md`

## 5. CL-200-207: exchange local timestamp lists and capture analysis endpoints

- `packages/contracts/local/timestamp-exchange.test.ts`
- `packages/contracts/local/timestamp-exchange.ts`
- `apps/frontend/src/features/local-editing/use-timestamp-exchange.ts`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `test/local-timestamp-exchange.proof.ts`
- `docs/tickets/CL-200-local-timestamp-json-exchange.md`
- `docs/tickets/CL-207-capture-every-editable-timestamp.md`

## 6. CL-197-208: record local verification and file-level commit plan

- `AGENTS.md`
- `apps/frontend/src/features/local-editing/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/operations/LOCAL_WORKFLOW.md`
- `docs/tickets/README.md`
- `docs/operations/CL197_208_COMMIT_PLAN.md`

## Recorded validation and remaining acceptance

Reuse the completed execute/validate evidence in CL-197–208 because this task
changes documentation and Git state only. Counts below overlap; do not sum them
as a fresh full-suite result.

- CL-197: 34 focused fake cases and generated native saved-source proof.
- CL-198–200: 114 combined fake cases, follow-ups and generated browser checks.
- CL-201: 63 fake batch/API cases, follow-up and desktop/phone states.
- CL-202: generated responsive picture dialog, image failure and focus checks.
- CL-203: 109 focused fake cases, generated browser/Hook checks and ninety
  native pixel comparisons. No API key or AI model is needed for local pixel
  tracking.
- CL-204: 150 focused fake cases, generated caption/Hook browser/native checks.
- CL-205: 174 focused fake identity/focus cases; no real provider dispatch.
- CL-206: 104 fake cases, generated desktop/phone/32-second tracking, manual
  Zoom regression and ninety native samples. Earlier verified worker reload
  preserved all nine owner clip hashes; this Git task does not repeat or alter
  them.
- CL-207: 32 focused cases and synthetic source/editor Capture browser checks.
- CL-208: eighteen synthetic boundary scenarios across three viewports, existing
  Zoom/Motion regressions and scoped frontend/test types, lint and formatting.

Each packet records a final read-only pass with no actionable findings within
its scope. Synthetic/fake/no-key/paid-off evidence proves mechanics; it does not
establish real speech/editorial/head/identity quality, owner personal visual or
physical-device approval, hosted/Linux acceptance, rights or release readiness.
New real AI preparation still requires its existing provider/runtime/live gates.
Do not mark the owner's review complete or retry any live flow to commit code.

For this task, verify exact file allocation, unchanged production/test bytes,
each staged file list/stat and whitespace, then the final range and clean
worktree. New plan Markdown uses explicit formatting; shared Markdown retains
its existing manually wrapped style. No new application checks are required
without a source change or new finding. Leave the healthy app and media alone.

## Execution record — 2026-11-03

The five implementation commits were created locally in the planned order:

- `0635027` — CL-197: reuse saved-video validation after byte verification; 7
  complete files.
- `cb954ab` — CL-199-206: persist clip metadata, camera paths and speaker
  defaults; 29 complete files.
- `8fa63fb` — CL-203-206: track head motion locally and render camera paths; 10
  complete files.
- `dcbd192` — CL-198-208: restore clip previews and complete Motion editor
  controls; 23 complete files.
- `4305860` — CL-200-207: exchange local timestamp lists and capture analysis
  endpoints; 7 complete files.

The 83-file allocation matched the worktree exactly, with no duplicates or
unallocated files. Each staged scope and whitespace check passed. SHA-256
comparison confirms all 63 production/test/style files retain their pre-task
bytes; no source or test changes were made while preparing commits. The
remaining seven documentation files belong to the sixth commit,
`CL-197-208: record local verification and file-level commit plan`, which
carries this record and the shared review handoff. Its hash is reported in the
chat because a commit cannot embed its own hash in its content.

Recorded synthetic/fake checks are reused, not rerun or relabelled as fresh
acceptance. Owner review remains pending for 2026-11-04. No provider call,
processing, media/configuration mutation, app restart, cloud action or push was
performed. Final range/allocation and clean-worktree verification follows the
documentation commit.
