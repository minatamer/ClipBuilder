# CL-278–CL-283 — Authorized whole-file commit plan

Date: 2026-11-11. Scope: pending CL-276 portfolio follow-up, CL-168 observation,
and CL-278–CL-283 implementation/documentation after CL-277.
The owner explicitly authorized a file-level plan, staging and local
ticket-prefixed commits. Never push. Personal visual/editorial acceptance remains
owner-only. No Voyagenda, ignored configuration or owner-media change.

## Allocation and order

Stage exactly the paths listed below, once each, as complete files. Do not split
hunks, use blanket add, rewrite history or include ignored/private artifacts.
Shared files are allocated to one owning group; combined prefixes explain actual
cross-ticket dependencies. Backend range support and notebook integration share
server/receipt files, so they remain together. Shared local editor CSS also
contains the neighboring Moments/playback rules; it lands intact with the source
surfaces before their UI/behavior callers. The browser fixture likewise includes
later playback/portfolio controls and lands whole with range editing. The final
documentation commit records the integrated result. These are code organization
boundaries, not claims of independent visual acceptance.

### 1. CL-281/CL-283: persist analysis notebooks and protect range corrections

- `apps/backend/README.md`
- `apps/backend/local/analysis-chunks.ts`
- `apps/backend/local/analysis.ts`
- `apps/backend/local/runtime.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/analysis-notebook.test.ts`
- `apps/backend/local/analysis-notebook.ts`
- `apps/backend/local/moment-range.test.ts`
- `apps/backend/local/moment-range.ts`
- `packages/contracts/local/selection.ts`
- `docs/tickets/CL-283-local-analysis-notebook-and-editorial-reuse.md`

### 2. CL-278: share loading, media and busy-control presentation

- `apps/frontend/src/shared/ui/activity-indicator.module.css`
- `apps/frontend/src/shared/ui/activity-indicator.tsx`
- `apps/frontend/src/shared/ui/media-loading-overlay.module.css`
- `apps/frontend/src/shared/ui/media-loading-overlay.tsx`
- `apps/frontend/src/shared/ui/button.tsx`
- `apps/frontend/src/shared/ui/processing-state.module.css`
- `apps/frontend/src/shared/ui/processing-state.tsx`
- `apps/frontend/src/shared/ui/progress.tsx`
- `apps/frontend/src/shared/ui/video-thumbnail.module.css`
- `apps/frontend/src/shared/ui/video-thumbnail.tsx`
- `apps/frontend/src/shared/ui/workflow.module.css`
- `apps/frontend/src/shared/ui/workflow.test.tsx`

### 3. CL-278/CL-280: polish pending previews and preserve clip rail geometry

- `apps/frontend/src/features/local-editing/acquisition-panel.tsx`
- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/camera-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-name-controls.tsx`
- `apps/frontend/src/features/local-editing/codex-preparation-steps.module.css`
- `apps/frontend/src/features/local-editing/codex-preparation-steps.tsx`
- `apps/frontend/src/features/local-editing/editor-save-tools.tsx`
- `apps/frontend/src/features/local-editing/editor-workspace.css`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/head-selection-view.tsx`
- `apps/frontend/src/features/local-editing/hook-title-progress.tsx`
- `apps/frontend/src/features/local-editing/media-camera-controls.tsx`
- `apps/frontend/src/features/local-editing/picture-image-dialog.module.css`
- `apps/frontend/src/features/local-editing/picture-image-dialog.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/visual-media-controls.tsx`
- `apps/frontend/src/features/sample/candidate.review.tsx`
- `apps/frontend/src/features/sample/cloud-clip.review.tsx`
- `apps/frontend/src/features/sample/portrait-player.tsx`
- `apps/frontend/src/features/sample/processing-status.tsx`
- `apps/frontend/src/features/sample/result-preview.tsx`
- `apps/frontend/src/features/sample/sample.module.css`
- `apps/frontend/src/features/sample/workflow-recovery.tsx`
- `docs/tickets/CL-278-polished-shared-loading-states.md`
- `docs/tickets/CL-280-consistent-unprepared-clip-rail.md`

### 4. CL-279/CL-281: simplify Moments controls and edit reviewed ranges

- `apps/frontend/src/features/local-editing/moment-selection.test.ts`
- `apps/frontend/src/features/local-editing/moment-selection.ts`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/features/local-editing/moment-range-dialog.module.css`
- `apps/frontend/src/features/local-editing/moment-range-dialog.tsx`
- `test/owner-hook-browser-fixture.ts`
- `eslint.config.mjs`
- `test/boundaries.test.ts`
- `docs/tickets/CL-279-tabbed-clip-creation-and-empty-results.md`
- `docs/tickets/CL-281-edit-reviewed-clip-timestamps.md`

### 5. CL-282: keep source playback feedback current and controls clear

- `apps/frontend/src/features/local-editing/experience.tsx`
- `apps/frontend/src/features/local-editing/manual-time.test.ts`
- `apps/frontend/src/features/local-editing/manual-time.ts`
- `apps/frontend/src/features/local-editing/source-playback.test.ts`
- `apps/frontend/src/features/local-editing/source-playback.ts`
- `docs/tickets/CL-282-source-playback-interruptions.md`

### 6. CL-276: prepare sharper laptop portfolio capture fixtures

- `apps/frontend/README.md`
- `apps/frontend/scripts/capture-workspace-film.mjs`
- `test/owner-marketing-fixture.ts`
- `docs/tickets/CL-276-landing-film-and-portfolio-captures.md`

### 7. CL-168: record owner-run long-video processing timings

- `docs/tickets/CL-168-local-codex-performance-and-progress.md`

### 8. CL-278/CL-283: record product rules and validated file-level commit plan

- `AGENTS.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/tickets/README.md`
- `docs/operations/CL-278-283-FILE-COMMIT-PLAN.md`

## Validation before staging

- Scope includes all 74 previously pending files, plus this plan; no path appears
  in more than one allocation. No staged changes existed at plan creation.
- Read-only review follows the validate skill against each owning ticket and
  its concrete acceptance evidence. Existing privacy/security/readiness guards,
  source clocks, cleanup and file ownership were checked. No actionable findings
  in this scoped review. Manual design and real-provider quality remain separate.
- Final focused fake/paid-off/no-key checks: 79 backend cases in five files and
  74 frontend cases in eight files pass. They cover archive/disk recovery,
  retained-speech range corrections, long-source recovery/capacity, playback
  races, manual clocks, selection, readiness and shared UI/capabilities.
- Contracts local, local integration, frontend and root fixture integration
  TypeScript checks pass. Scoped ESLint and Prettier pass for pending code;
  Markdown follows the repository's formatter exclusion and whitespace check.
- Windows sandbox temporary-module access and loopback EACCES prevented the first
  Vitest attempt. Normal-permission reruns passed without weakening application
  bounds, test configuration, fake/paid-off policy or network interception.
- All 31 root boundary tests pass: 184 focused tests pass in total. Marketing
  capture CLI syntax, whitespace, private-content and artifact-path checks pass.
  Only approved source/docs/test paths are allocated; no private transcript,
  media, secret/configuration or generated output is included. Staged path sets
  are checked before every commit. No full build is run over active dev output.
- No new browser session or paid flow is needed for this Git task. Prior isolated
  Codex visual evidence remains in the owning packets; the owner's current
  eight-range manual preview remains open. No provider call or app restart.

## Commit receipts

All final gates passed before staging. Each of the seven implementation/evidence
commits below was staged from an empty index, checked for an exact whole-file
path set and whitespace, committed locally, and confirmed by its resulting hash.
The final shared-documentation commit contains this plan, repository loading
guidance, the product rules and ticket index; find it by the eighth subject above.

| Commit | Files | Subject |
| --- | --- | --- |
| `7ba0ed843b18bf809d20acb26c98a8ec5ac90a6f` | 11 | CL-281/CL-283: persist analysis notebooks and protect range corrections |
| `b91feaaa2d2068919ddb7049831ba5edcc527ca7` | 12 | CL-278: share loading, media and busy-control presentation |
| `bf037f05295f8215de14ec3130aebc25fe38c545` | 27 | CL-278/CL-280: polish pending previews and preserve clip rail geometry |
| `c4ba66a33b778dc95d034efaa826022c3d355201` | 10 | CL-279/CL-281: simplify Moments controls and edit reviewed ranges |
| `f52b3d5e914c5b809310f65a294608bbae06765d` | 6 | CL-282: keep source playback feedback current and controls clear |
| `48f47d7926530986c658c23486c19b04bce49351` | 4 | CL-276: prepare sharper laptop portfolio capture fixtures |
| `968e8437cc5f3f3f9747c951a5d51a71ec8d3f26` | 1 | CL-168: record owner-run long-video processing timings |

No files outside this allocation are included. No push, provider action,
configuration change, app restart or Voyagenda action was performed. Real
transcripts, source/AI-result archives, screenshots, media and exports stay
outside Git. Owner visual/editorial acceptance remains open.
