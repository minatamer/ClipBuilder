# CL-261 — Whole-file local commits and tomorrow's checklist

Status: packaged in six local commits, 2026-11-07. Plan recorded before staging;
final clean/tree/hash verification follows the documentation commit.

The owner explicitly requests a file-level plan, multiple ticket-prefixed commits,
staging and local commits for pending CL-247–260 work. This supersedes historical
no-Git handoff notes only for this local packaging. No push/history rewrite,
configuration/media mutation, service restart, provider action or deployment.

## Scope and acceptance

Baseline: `201f218`. Allocate each pending file exactly once as a whole file.
Preserve implementation bytes and their produced verification; no hunk staging,
temporary source rewrites, forced/broad adds or amendments. Shared files contain
several tickets, so acceptance applies to the complete series, not every
intermediate commit. The final documentation commit owns this plan and evidence.
Verify exact planned/staged/committed path sets, content hashes and final clean
worktree. Do not mark CL-255's original uncorrelated warning closed by packaging.

## Tomorrow's list and reminder

One reminder is scheduled for 2026-11-08 at 10:00 Africa/Cairo in this chat
(`clipbuilder-tomorrow-checklist`). It reminds, without automatically executing:

1. Test automatic addition of short/long Hook audio, clocks and 100% default gain
   when selected, and absence when unchecked — CL-262.
2. More general UI/UX testing in Codex mode — CL-262.
3. Add a tour matching the owner's other repos once the first editor fully loads
   — CL-263.
4. List Gemini/Codex differences to decide what to merge — CL-264.
5. One Gemini run before deciding whether to deploy — CL-265.

These are planned future tasks. Generated fake/no-key verification already covers
mechanics; actual Codex/Gemini quality needs normal runtime/account/key/live
flags/approvals. No real provider/model run or new tour implementation tonight.

## Whole-file allocation

94 whole files in six commits. Each path appears exactly once.

### 1. CL-250-253: retain gradual zoom through camera position cuts (6 files)

- `packages/contracts/local/camera-motion.ts`
- `packages/contracts/local/camera-motion.test.ts`
- `apps/frontend/src/features/local-editing/camera-zoom-default.ts`
- `apps/frontend/src/features/local-editing/camera-zoom-default.test.ts`
- `apps/frontend/src/features/local-editing/camera-motion-editor.tsx`
- `test/local-camera-motion.proof.ts`

### 2. CL-255-256: stabilize editor lifecycle and prepare smooth playback (18 files)

- `packages/contracts/src/browser-diagnostic.schema.ts`
- `packages/contracts/src/browser-diagnostic.schema.test.ts`
- `apps/frontend/src/features/diagnostics/browser-console.ts`
- `apps/frontend/src/features/diagnostics/browser-console.test.ts`
- `apps/frontend/src/features/diagnostics/editor-lifecycle.ts`
- `apps/frontend/src/features/diagnostics/editor-lifecycle.test.ts`
- `apps/frontend/src/features/local-editing/editor-preview-form.ts`
- `apps/frontend/src/features/local-editing/editor-preview-form.test.ts`
- `apps/frontend/src/features/local-editing/camera-preview-clock.ts`
- `apps/frontend/src/features/local-editing/camera-preview-clock.test.ts`
- `apps/frontend/src/features/local-editing/prepare-preview-audio.ts`
- `apps/frontend/src/features/local-editing/prepare-preview-audio.test.ts`
- `apps/frontend/src/features/local-editing/preview-images.tsx`
- `apps/frontend/src/features/local-editing/use-inspector-playback.ts`
- `apps/frontend/src/features/local-editing/audio-preview.tsx`
- `apps/frontend/src/features/local-editing/camera-preview-video.tsx`
- `apps/frontend/src/features/local-editing/use-editor-preview.ts`
- `apps/frontend/src/features/local-editing/focus-preview-controls.tsx`

### 3. CL-247-258: align shared controls and remove blue focus glow (12 files)

- `apps/frontend/src/app/global-error.tsx`
- `apps/frontend/src/app/page.module.css`
- `apps/frontend/src/features/product-film/product-film-hero.module.css`
- `apps/frontend/src/features/sample/sample.module.css`
- `apps/frontend/src/shared/ui/workflow.module.css`
- `apps/frontend/src/styles/tokens.css`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/clip-name-controls.module.css`
- `apps/frontend/src/features/local-editing/clip-name-controls.tsx`
- `apps/frontend/src/features/local-editing/clip-rail-preview.tsx`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/text-selection.tsx`

### 4. CL-249-260: integrate explicit Hook title and audio controls (11 files)

- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/hook-controls.tsx`
- `apps/frontend/src/features/local-editing/hook-controls.test.tsx`
- `apps/frontend/src/features/local-editing/hook-edit.ts`
- `apps/frontend/src/features/local-editing/hook-edit.test.ts`
- `apps/frontend/src/features/local-editing/hook-range-draft.ts`
- `apps/frontend/src/features/local-editing/hook-range-draft.test.ts`
- `apps/frontend/src/features/local-editing/hook-title-request.ts`
- `apps/frontend/src/features/local-editing/hook-title-progress.tsx`
- `test/owner-hook-title.test.ts`

### 5. CL-247-260: verify editor controls focus playback and persistence (21 files)

- `test/local-audio-editor.proof.ts`
- `test/local-camera-motion-editor.proof.ts`
- `test/local-camera-switch.proof.ts`
- `test/local-codex.proof.ts`
- `test/local-focus-editor.proof.ts`
- `test/local-head-motion-editor.proof.ts`
- `test/local-hook-editor.proof.ts`
- `test/local-responsive-editor.proof.ts`
- `test/local-visual-sync.proof.ts`
- `test/owner-controls-browser.ts`
- `test/owner-feedback-browser-fixture.ts`
- `test/owner-hook-browser-fixture.ts`
- `test/local-clip-rail-preview.proof.ts`
- `test/local-editor-playback.proof.ts`
- `test/local-editor-readiness.proof.ts`
- `test/local-editor-transitions.proof.ts`
- `test/local-editor-update-depth.proof.ts`
- `test/local-focus-style.proof.ts`
- `test/local-hook-audio.proof.ts`
- `test/local-hook-options.proof.ts`
- `test/local-playback-smoothness.proof.ts`

### 6. CL-247-265: record verification commit plan and next-day checklist (26 files)

- `AGENTS.md`
- `apps/backend/README.md`
- `apps/frontend/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/MEDIA_AUDIO.md`
- `docs/tickets/CL-162-ai-hook-risers.md`
- `docs/tickets/README.md`
- `docs/tickets/CL-247-content-sized-workflow-footer.md`
- `docs/tickets/CL-248-aligned-clip-card-title.md`
- `docs/tickets/CL-249-hook-title-progress-and-cancel.md`
- `docs/tickets/CL-250-camera-position-zoom-default-end.md`
- `docs/tickets/CL-251-motion-footer-actions.md`
- `docs/tickets/CL-252-clip-rename-focus-ring.md`
- `docs/tickets/CL-253-zoom-inspector-alignment.md`
- `docs/tickets/CL-254-camera-tab-name.md`
- `docs/tickets/CL-255-editor-update-depth-investigation.md`
- `docs/tickets/CL-256-smooth-editor-playback.md`
- `docs/tickets/CL-257-refreshed-clip-card-preview.md`
- `docs/tickets/CL-258-shared-focus-without-blue-glow.md`
- `docs/tickets/CL-259-hook-audio-length-and-default-volume.md`
- `docs/tickets/CL-260-explicit-hook-title-and-audio-options.md`
- `docs/tickets/CL-261-file-level-local-commits-and-next-day-checklist.md`
- `docs/tickets/CL-262-owner-hook-and-codex-ui-testing.md`
- `docs/tickets/CL-263-first-editor-guided-tour.md`
- `docs/tickets/CL-264-gemini-codex-behavior-comparison.md`
- `docs/tickets/CL-265-gemini-before-deployment-decision.md`

## Verification and commits

Preflight allocated all 94 paths exactly once, with an empty index and no
unexpected pending file. All 68 code files pass Prettier; Markdown follows the
repository's formatting exclusion. Whitespace and fixed credential/private-key
pattern checks are clear. Implementation file bytes retain their pre-packaging
hashes; staged and committed blob/path sets match each explicit group exactly.

The owning packets' already completed unit, generated HTTP/browser and
current-source native checks remain authoritative. CL-260's final 27-case gate,
fake-request/cancellation proof and full audio/export regression are recorded
there; CL-250/255–258 retain their detailed source/native/browser evidence.
No tests were relabeled as real AI or repeated merely to package the same bytes.
CL-255's original uncorrelated owner warning remains open, and future personal
Codex/Gemini quality, device/AT and release acceptance remain unchecked.

Completed whole-file commits:

- `09c4c91` — CL-250-253: retain gradual zoom through camera position cuts (6).
- `920720b` — CL-255-256: stabilize editor lifecycle and prepare smooth playback (18).
- `bfffe37` — CL-247-258: align shared controls and remove blue focus glow (12).
- `d139f25` — CL-249-260: integrate explicit Hook title and audio controls (11).
- `1319f63` — CL-247-260: verify editor controls focus playback and persistence (21).
- Sixth commit: CL-247-265: record verification commit plan and next-day checklist
  (26 documentation files, including this record).

After the sixth commit, verify exactly six commits since `201f218`, a clean
worktree/index, the complete 94-file series, unchanged working bytes, committed
blob hashes and whole-series whitespace. The final reply reports that result.
No push, configuration/media mutation, service restart, provider/model run,
cloud or deployment occurred. Reminder created and viewed through Codex's
automation tool; future tickets CL-262–265 remain planned. Task-owned packaging
helpers are removed after verification; ignored media/models/logs stay excluded.
