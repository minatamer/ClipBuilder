# CL-288 — File-level local commit batch

Status: whole-file batch validated for authorized local commits, 2026-11-12.

## Owner request and boundaries

Prepare a file-level commit plan, stage and commit all pending work with ticket
prefixes. This authorizes local Git mutations only; do not push, change branches,
rewrite history or modify Voyagenda. Preserve running services, source media,
saved edits, private diagnostics and ignored configuration. No provider, paid,
cloud or deployment action is part of packaging.

## Whole-file allocation

The initial index was empty. Allocate all 63 pending paths exactly once,
plus this new record, for 64 files across four commits. CL-285 and
CL-286 share the editor panel and authority documentation, so their full files
remain together in a coherent implementation commit. No hunk splitting or
intermediate file rewrites. CL-287 is specification only, with no implementation.

### 1. `CL-284: record verified current-source Downloads cleanup`

1 whole file:

- `docs/tickets/CL-284-current-source-downloads-cleanup.md`

### 2. `CL-285 CL-286: refine processing, glass captions and autosave recovery`

60 whole files:

- `.dockerignore`
- `.gitignore`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/frontend/Dockerfile`
- `apps/frontend/README.md`
- `apps/frontend/feasibility/glass-material-frame.ts`
- `apps/frontend/package.json`
- `apps/frontend/scripts/delivery-assets.json`
- `apps/frontend/src/app/layout.tsx`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-connection.test.ts`
- `apps/frontend/src/features/local-editing/clip-connection.ts`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/contextual-feedback.test.tsx`
- `apps/frontend/src/features/local-editing/edit-history.test.ts`
- `apps/frontend/src/features/local-editing/edit-history.ts`
- `apps/frontend/src/features/local-editing/editor-save-conflict.module.css`
- `apps/frontend/src/features/local-editing/editor-save-conflict.tsx`
- `apps/frontend/src/features/local-editing/editor-save-tools.tsx`
- `apps/frontend/src/features/local-editing/editor-state.test.ts`
- `apps/frontend/src/features/local-editing/reconcile-editor-edit.test.ts`
- `apps/frontend/src/features/local-editing/reconcile-editor-edit.ts`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/styled-caption.test.tsx`
- `apps/frontend/src/features/local-editing/typography-fields.tsx`
- `apps/frontend/src/features/local-editing/typography-preset-picker.tsx`
- `apps/frontend/src/features/local-editing/use-editor-autosave.ts`
- `apps/frontend/src/shared/ui/processing-state.module.css`
- `apps/frontend/src/shared/ui/processing-state.tsx`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/overlay-page.tsx`
- `apps/renderer/local/prepared-overlay-scene.ts`
- `apps/renderer/local/rasterize-overlay.ts`
- `apps/renderer/local/refractive-scene.ts`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/tickets/CL-285-flat-editor-processing-surface.md`
- `docs/tickets/CL-286-manual-sounds-caption-material-and-save-recovery.md`
- `packages/composition/README.md`
- `packages/composition/fonts/League-Spartan-OFL.txt`
- `packages/composition/fonts/README.md`
- `packages/composition/fonts/league-spartan.woff2`
- `packages/composition/local/automatic-overlay.tsx`
- `packages/composition/local/caption-font.tsx`
- `packages/composition/local/geometric-font-metrics.ts`
- `packages/composition/local/glass-word.tsx`
- `packages/composition/local/styled-caption.tsx`
- `packages/composition/local/text-paint.ts`
- `packages/composition/package.json`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/text-style.ts`
- `packages/contracts/local/video-assets.ts`
- `scripts/copy-caption-fonts.d.mts`
- `scripts/copy-caption-fonts.mjs`
- `scripts/editing-worker-build.mjs`
- `scripts/local-media-build.mjs`
- `test/owner-controls-browser.ts`
- `test/owner-glass-scene.test.ts`
- `test/owner-hook-browser-fixture.ts`
- `test/release-artifact.test.ts`

### 3. `CL-287: specify editor-only black-bar framing`

1 whole file:

- `docs/tickets/CL-287-editor-black-bar-framing.md`

### 4. `CL-288: record whole-file commit plan and validation`

2 whole files:

- `docs/tickets/CL-288-file-level-local-commit-batch.md`
- `docs/tickets/README.md`

## Validation and completion record

The owning tickets retain the actual focused checks and remaining acceptance
boundaries. The implementation was already validated before this packaging task.
A final read-only review found no actionable issue in the pending allocation;
17 focused fake/no-network history/reconciliation cases pass again. Manual
controls and synthetic checks require no API keys; real AI keeps its runtime,
flags and approval requirements. Full normal optical MP4, Safari optical and
owner aesthetic acceptance remain unverified. No claim of real AI quality.

Before each commit, verify exact staged paths and blob identities, whitespace,
formatting and absence of credential/private artifacts. After the series, verify
all allocated files are committed exactly once, clean index/worktree, preserved
source bytes and no push. The final commit records the first three hashes and
its own descriptive subject without a self-referential hash.

## Packaging evidence and commit record

- All 64 allocated paths were present, with an initially empty index. Source,
  staged blob and path comparisons matched each completed whole-file group.
  Scoped formatting and credential/private-artifact pattern checks were clear.
- The first staged whitespace gate found one trailing space in the upstream
  license. Removed only that whitespace, documented the normalization and updated
  its exact release-asset hash. Refreshed the fixed generated copies. All 13
  release-artifact tests passed, including the unapproved/replaced asset guards.
  No font bytes, license terms or application behavior changed during packaging.
- No broad suite or browser/native export was rerun for unchanged implementation.
  The owning packets retain the actual prior evidence and manual acceptance gates.
  Final source hashes exclude only the deliberate documentation completion and
  three license-provenance/admission files updated by the correction above.
- `324a20f` — CL-284: record verified current-source Downloads cleanup (one file).
- `3905520` — CL-285 CL-286: refine processing, glass captions and autosave recovery
  (60 files, including the shared panel and both owning packets).
- `5f08f65` — CL-287: specify editor-only black-bar framing (one file).
- Final commit: CL-288: record whole-file commit plan and validation (two files:
  this record and the ticket index).

The final verification checks four commits since `938ee18`, exactly 64 distinct
allocated paths with no repeated file allocation, matching committed blobs and
working bytes, whitespace and a clean index/worktree. This task performs no push,
service restart, provider call, cloud/deployment or Voyagenda operation.
