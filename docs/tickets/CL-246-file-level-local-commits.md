# CL-246 — Whole-file local commit packaging

Status: Packaged in seven local commits, 2026-11-07. Owner will test on 2026-11-08.

The owner requests file-level staging and multiple local commits for all pending
CL-225–245 work. This later authorization supersedes historical no-Git handoff
notes only for local staging/commits. No push, history rewrite, provider action,
configuration change, app restart, saved-media edit or deployment is authorized.

## Scope and acceptance

Baseline: `7fa49155cf16556bd39a3833ad3d89752ec461be`. Allocate 154 existing pending files plus
this packet exactly once: 155 whole files in seven commits. Use explicit
path lists and preserve implementation bytes; no hunk staging, temporary source
rewrites, forced/broad adds or amendment of earlier commits. Several shared files
contain multiple ticket changes, so acceptance applies to the completed series,
not each intermediate commit. Keep the running app and ignored assets intact.

Existing ticket evidence remains authoritative: generated/fake/no-key checks
establish UI, schemas, transport and native rendering; CL-244 separately records
authorized real API-free local-model evidence. This packaging makes no new live
AI quality claim. Owner visual/fresh-generation, broader-corpus, physical-device,
assistive-technology and hosted/release checks remain as recorded in each packet.

## Whole-file allocation

### 1. CL-226-228: add title typography and timed filter composition

- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/video-look.test.tsx`
- `apps/renderer/local/video-look.ts`
- `packages/composition/local/styled-text-layer.tsx`
- `packages/composition/local/text-layer.tsx`
- `packages/contracts/local/agent.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/diagnostics.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/hook-content.ts`
- `packages/contracts/local/hook-title.ts`
- `packages/contracts/local/hosted-editing.ts`
- `packages/contracts/local/runtime.ts`
- `packages/contracts/local/text-layers.ts`
- `packages/contracts/local/text-ranges.test.ts`
- `packages/contracts/local/text-ranges.ts`
- `packages/contracts/local/text-style.ts`
- `packages/contracts/local/video-look.test.ts`
- `packages/contracts/local/video-look.ts`
- `packages/contracts/local/visual-placement.test.ts`
- `packages/contracts/local/visual-placement.ts`

### 2. CL-234-240: integrate Hook titles and preserve caption attribution

- `apps/backend/local/agent-view.ts`
- `apps/backend/local/analysis.test.ts`
- `apps/backend/local/analysis.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/codex-exec.test.ts`
- `apps/backend/local/codex-exec.ts`
- `apps/backend/local/codex-schema.test.ts`
- `apps/backend/local/codex-schema.ts`
- `apps/backend/local/edit-clip.ts`
- `apps/backend/local/fake-clips.ts`
- `apps/backend/local/hook-title-planner.ts`
- `apps/backend/local/planned-text.test.ts`
- `apps/backend/local/planned-text.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/speaker-word-labels.ts`
- `apps/backend/local/timed-filters.test.ts`
- `apps/frontend/src/server/local-ai-request.ts`
- `test/owner-caption-speaker.test.ts`
- `test/owner-hook-title.test.ts`
- `test/owner-provider-host.test.ts`

### 3. CL-234: persist bounded content-safe backend diagnostics

- `apps/backend/local/diagnostic-log.test.ts`
- `apps/backend/local/diagnostic-log.ts`
- `apps/backend/src/server.ts`

### 4. CL-237-241: share stable contextual feedback primitives

- `apps/frontend/src/app/error.tsx`
- `apps/frontend/src/app/global-error.tsx`
- `apps/frontend/src/app/not-found.tsx`
- `apps/frontend/src/app/view-failure.module.css`
- `apps/frontend/src/shared/ui/inline-feedback.module.css`
- `apps/frontend/src/shared/ui/inline-feedback.tsx`

### 5. CL-225-243: refine responsive editors and contextual controls

- `apps/frontend/src/features/local-editing/acquisition-panel.tsx`
- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/camera-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/caption-speakers.test.tsx`
- `apps/frontend/src/features/local-editing/caption-speakers.tsx`
- `apps/frontend/src/features/local-editing/caption-text-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-name-controls.module.css`
- `apps/frontend/src/features/local-editing/clip-name-controls.tsx`
- `apps/frontend/src/features/local-editing/contextual-feedback.test.tsx`
- `apps/frontend/src/features/local-editing/control-tabs.tsx`
- `apps/frontend/src/features/local-editing/demo-limit-toast.tsx`
- `apps/frontend/src/features/local-editing/editor-state.test.ts`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/editor-timeline.test.tsx`
- `apps/frontend/src/features/local-editing/editor-timeline.ts`
- `apps/frontend/src/features/local-editing/editor-timeline.tsx`
- `apps/frontend/src/features/local-editing/experience.tsx`
- `apps/frontend/src/features/local-editing/filter-inspector.tsx`
- `apps/frontend/src/features/local-editing/filter-ranges.ts`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/focus-preview-slot.tsx`
- `apps/frontend/src/features/local-editing/head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/head-selection-view.tsx`
- `apps/frontend/src/features/local-editing/hook-title-request.ts`
- `apps/frontend/src/features/local-editing/picture-timing.tsx`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/features/local-editing/session-controls.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/text-inspector.tsx`
- `apps/frontend/src/features/local-editing/text-layers.test.tsx`
- `apps/frontend/src/features/local-editing/text-selection.tsx`
- `apps/frontend/src/features/local-editing/text-validation.test.tsx`
- `apps/frontend/src/features/local-editing/text-validation.ts`
- `apps/frontend/src/features/local-editing/thumbnail-framing.test.ts`
- `apps/frontend/src/features/local-editing/thumbnail-framing.ts`
- `apps/frontend/src/features/local-editing/typography-fields.tsx`
- `apps/frontend/src/features/local-editing/workflow-actions.tsx`
- `apps/frontend/src/features/local-editing/youtube-audio-intake.tsx`
- `apps/frontend/src/features/local-editing/youtube-preview.tsx`
- `apps/frontend/src/shared/ui/processing-state.module.css`
- `test/local-audio-editor.proof.ts`
- `test/local-picture-size.proof.ts`
- `test/local-responsive-editor.proof.ts`
- `test/local-timed-filters.proof.ts`
- `test/local-title-styling.proof.ts`
- `test/owner-demo-limits.proof.ts`
- `test/owner-feedback-browser-fixture.ts`
- `test/owner-hook-browser-fixture.ts`
- `test/owner-hosted-editor.proof.ts`

### 6. CL-244-245: correct generic speaker turns and restore Word pop

- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`
- `apps/renderer/local/entry.ts`
- `apps/renderer/local/sherpa-onnx-node.d.ts`
- `apps/renderer/local/speaker-windows.test.ts`
- `apps/renderer/local/speaker-windows.ts`
- `apps/renderer/local/window-speaker-cli.ts`
- `package.json`
- `packages/contracts/local/caption-speakers.test.ts`
- `pnpm-lock.yaml`
- `scripts/local-discovery.mjs`
- `scripts/local-media-build.mjs`
- `scripts/local-speaker-tools.ts`
- `scripts/prepare-local-speakers.mjs`
- `test/local-codex.proof.ts`
- `test/local-speaker-hook.proof.ts`
- `test/owner-discovery.test.ts`

### 7. CL-225-246: record decisions, verification and file-level commits

- `AGENTS.md`
- `apps/backend/README.md`
- `apps/frontend/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/operations/LOCAL_WORKFLOW.md`
- `docs/operations/THIRD_PARTY_SOFTWARE.md`
- `docs/tickets/CL-225-bounded-caption-list.md`
- `docs/tickets/CL-226-hook-title-inline-typography.md`
- `docs/tickets/CL-227-readable-ai-picture-size.md`
- `docs/tickets/CL-228-camera-seeded-timed-filters.md`
- `docs/tickets/CL-229-circular-clip-rename-button.md`
- `docs/tickets/CL-230-laptop-focus-split-layout.md`
- `docs/tickets/CL-231-shared-scrollbar-consistency.md`
- `docs/tickets/CL-232-editor-scroll-ownership.md`
- `docs/tickets/CL-233-shared-editor-tabs-and-rename-dialog.md`
- `docs/tickets/CL-234-fresh-clip-processing-failure.md`
- `docs/tickets/CL-235-intake-thumbnail-letterboxing.md`
- `docs/tickets/CL-236-textarea-caret-stability.md`
- `docs/tickets/CL-237-contextual-editor-errors.md`
- `docs/tickets/CL-238-app-wide-contextual-feedback.md`
- `docs/tickets/CL-239-manual-hook-ai-titles.md`
- `docs/tickets/CL-240-speaker-caption-attribution-and-colors.md`
- `docs/tickets/CL-241-stable-contextual-feedback-layout.md`
- `docs/tickets/CL-242-moments-column-and-results-layout.md`
- `docs/tickets/CL-243-editor-form-control-alignment.md`
- `docs/tickets/CL-244-speaker-detection-range-regression.md`
- `docs/tickets/CL-245-default-word-pop-speaker-backgrounds.md`
- `docs/tickets/CL-246-file-level-local-commits.md`
- `docs/tickets/README.md`
- `packages/composition/README.md`

## Packaging evidence

All allocated source files match their pre-packaging Git blob hashes. Whole-file
Prettier checks pass for all 124 code/configuration files; the repository
explicitly excludes its 31 Markdown files from formatting. Whitespace checks
pass across the series. Existing ticket test evidence was reused
without new provider/model calls or repeated native/browser runs. Each explicit
staged path set and committed path set matches its planned allocation exactly.
The final documentation commit contains this record and the linked ticket index.

- `999c1d1` — CL-226-228: add title typography and timed filter composition (22 files).
- `dc4919f` — CL-234-240: integrate Hook titles and preserve caption attribution (25 files).
- `c51149a` — CL-234: persist bounded content-safe backend diagnostics (3 files).
- `148e9d2` — CL-237-241: share stable contextual feedback primitives (6 files).
- `6cff4bf` — CL-225-243: refine responsive editors and contextual controls (51 files).
- `99b22c8` — CL-244-245: correct generic speaker turns and restore Word pop (17 files).

No push, environment/media mutation or service restart. Final clean status and
seven-commit count are checked after the documentation commit; personal testing
remains with the owner for 2026-11-08. Ignored model/media/log/build artifacts
remain excluded. Task-owned packaging helpers are removed after verification.
