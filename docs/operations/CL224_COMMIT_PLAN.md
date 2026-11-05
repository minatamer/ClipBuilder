# CL-224 - File-level local commit plan

Owner authorization: 2026-11-05, "file level commit stage and commit and i will
review tomorrow." Stage complete files and create local CL-224 commits. Owner
review remains pending for 2026-11-06. No push was requested; do not push this
series. The earlier no-Git/unstaged packet notes describe implementation handoff
and are superseded by this later instruction for local packaging only.

## Scope and ordering

Baseline: `b5463b53d18865152b7cf4b616c34ee57cde5689` on local `main`.
Allocate all 33 pending files plus this plan exactly once: 34 complete files in
three commits. Use explicit whole-file path lists, without partial staging,
temporary source rewrites, broad/forced adds or history changes. Preserve source
implementation bytes, ignored configuration, saved clips/assets/exports, private
proof artifacts and the running app. Packaging needs no app restart, inference,
processing, deployment or additional browser session.

Shared editor files cover the integrated timeline, activity notifications,
clock mapping, camera/Motion selection, picture/audio linkage and layout. Keep
that implementation and its focused units together, then update the generated
browser proof definitions/shared fixture, then land authority, guides and this
record. Acceptance applies to the complete series; intermediate commits are
not separately claimed as complete ticket acceptance.

## 1. CL-224: unify editor timelines and repair Motion controls

- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/bulk-head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/caption-text-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/editor-clock.ts`
- `apps/frontend/src/features/local-editing/editor-timeline.test.tsx`
- `apps/frontend/src/features/local-editing/editor-timeline.ts`
- `apps/frontend/src/features/local-editing/editor-timeline.tsx`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/focus-preview-controls.tsx`
- `apps/frontend/src/features/local-editing/head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/head-motion-selection.test.ts`
- `apps/frontend/src/features/local-editing/head-motion-selection.ts`
- `apps/frontend/src/features/local-editing/head-selection-view.tsx`
- `apps/frontend/src/features/local-editing/hook-controls.tsx`
- `apps/frontend/src/features/local-editing/picture-audio.test.ts`
- `apps/frontend/src/features/local-editing/picture-audio.ts`
- `apps/frontend/src/features/local-editing/picture-image-dialog.tsx`
- `apps/frontend/src/features/local-editing/picture-timing.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/text-inspector.tsx`

## 2. CL-224: update generated editor regression proofs

- `test/local-audio-editor.proof.ts`
- `test/local-codex.proof.ts`
- `test/local-head-motion-editor.proof.ts`
- `test/local-hook-editor.proof.ts`
- `test/local-responsive-editor.proof.ts`
- `test/owner-hook-browser-fixture.ts`

## 3. CL-224: document verification and file-level commit plan

- `AGENTS.md`
- `apps/frontend/README.md`
- `apps/frontend/src/features/local-editing/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/tickets/CL-224-unified-editor-timeline-and-motion-layout.md`
- `docs/tickets/README.md`
- `docs/operations/CL224_COMMIT_PLAN.md`

## Verification retained

The CL-224 packet records 57 focused fake/no-key cases in ten files (1.90 s),
local/no-Node contracts and frontend/test types, scoped ESLint/Prettier and
whitespace. Codex-browser checks cover the reproduced activity feedback defect,
combined independent collections, saved synthetic edits, exact Capture clocks,
picture-linked sound movement, camera selection and responsive editor layouts
at 1440/390/320. Synthetic tracking-state checks remain distinct from actual
local pixel-tracking failure handling. Updated headless proof definitions were
not launched during that pass; native/worker/composition code is unchanged.

Preserve the distinction between generated verification and real AI quality.
Owner creative/physical-device/real-provider and hosted release acceptance are
still open. These editor changes need no keys or regeneration on prepared clips;
real generation keeps its normal provider/runtime/live approvals. Deployment
remains cancelled. The normal app remains running; generated fixtures are clean.

For packaging, check exact allocation, text/privacy scan, unchanged implementation
bytes, staged whitespace and committed paths. Verify three local commits and a
clean worktree. No new unit/native/paid test or remote CI result is claimed.
