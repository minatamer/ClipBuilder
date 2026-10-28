# CL-128–129 whole-file commit plan

Owner authorization, 2026-10-29: write a file-level plan, stage and commit the
speaker-caption and manual-Hook work locally for later owner review. Start at
`a95fbd781394bfb37aee092e0f0b15d6fad2a935` on `main`, with an empty index and
32 modified plus 10 new feature files. This plan is the 43rd allocated file.
No branch switch, push, deployment, cloud/provider action or media cleanup is
included. Preserve the normal app, ignored configuration and private media.

Both tickets passed their sequential execute/validate loops before packaging.
Shared editor/overlay/contract files contain both features, so keep whole files
and group by responsibility rather than manufacture partial feature versions.
The six commits form one dependent review sequence; only their combined result
has the recorded full feature validation, not six independent release points.

## Exact allocation, in order

### 1. `CL-128-129: define speaker styles and hook presentation clocks`

- `packages/contracts/local/caption-speakers.ts`
- `packages/contracts/local/caption-speakers.test.ts`
- `packages/contracts/local/hook.ts`
- `packages/contracts/local/hook.test.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/index.ts`
- `packages/composition/local/automatic-overlay.tsx`
- `packages/composition/local/overlay-frame.ts`
- `packages/composition/local/styled-caption.tsx`

Own bounded schemas, source/presentation clocks, caption speaker resolution,
hook caption trimming and shared frame-driven caption/color rendering.

### 2. `CL-128-129: persist edits and enforce hooked export durations`

- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/draft-store.ts`
- `apps/backend/local/draft-store.test.ts`
- `apps/backend/local/edit-clip.ts`
- `apps/backend/local/worker-port.ts`
- `test/owner-worker-progress.test.ts`

Own Apply/reset/save/restore, regenerated-caption overrides, historical export
compatibility and exact current worker/output duration binding.

### 3. `CL-129: export manual hooks with original media and native cadence`

- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/focus-filter.ts`
- `apps/renderer/local/overlay-page.tsx`
- `apps/renderer/local/rasterize-overlay.ts`

Own the single final encode, synchronized audio/video concat, independent camera
targets, repeated overlay raster frames and per-segment physical-frame rounding.

### 4. `CL-128: demonstrate speaker turns in explicit fake captions`

- `apps/backend/local/fake-analysis.ts`
- `apps/backend/local/fake-content.test.ts`
- `apps/backend/local/server.ts`

Own the explicit local-only fictional two-speaker caption action, including
short clips. Default fake clips remain caption-free; provider dispatch stays off.

### 5. `CL-128-129: add speaker controls and manual Hook inspector`

- `apps/frontend/src/features/local-editing/caption-speakers.tsx`
- `apps/frontend/src/features/local-editing/caption-text-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/editor-clock.ts`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/editor-state.test.ts`
- `apps/frontend/src/features/local-editing/hook-controls.tsx`
- `apps/frontend/src/features/local-editing/overlay-frame.test.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/use-editor-preview.ts`
- `apps/frontend/src/features/local-editing/README.md`

Own speaker palettes/word correction, manual timestamps/capture/preview,
source-time inspector seeks, dirty Apply/Discard and responsive control geometry.

### 6. `CL-128-129: record native browser proofs and review evidence`

- `test/local-focus-editor.proof.ts`
- `test/local-speaker-hook.proof.ts`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/tickets/README.md`
- `docs/tickets/CL-128-speaker-caption-colors.md`
- `docs/tickets/CL-129-manual-hook-prefix.md`
- `docs/operations/CL128_129_COMMIT_PLAN.md`

Own synthetic browser/native regression proofs, decisions, acceptance evidence,
remaining owner gates and this packaging record.

## Verification and staging discipline

Existing final implementation evidence is retained, not represented as newly
rerun during this documentation/Git-only packaging turn:

- 89 focused tests pass in nine files: caption-speakers, hook, editor-state,
  overlay-frame, styled-caption, clip-batch, draft-store, fake-content and
  owner-worker-progress.
- Current-source native MP4 proofs pass for captions, animated PNG/text,
  video/audio prefix/body order, camera/filter edits and 12/24/30/29.97 fps,
  including a one-logical-frame hook. Real media encoding is exercised with
  synthetic inputs; AI results are fictional and require no API keys.
- Browser proof passes at 1440×900, 390×844 and 320×568, including actual capture,
  save/reset/discard, pointer/keyboard controls, failure handling and footer fit.
- Full repository typecheck, final local typecheck, focused ESLint/formatting,
  whitespace checks and execute/validate reviews pass with no actionable findings.

Reconcile this allocation against the complete tracked/untracked inventory before
staging. Stage only explicit whole-file lists. For every commit, verify exact
staged paths and staged whitespace, inspect the staged change summary, and check
for credential material without printing matched values. Stop on any unexpected
path or Git failure. Keep generated screenshots, media, build outputs, runtime
records, logs and configuration outside the index. Confirm the final worktree
and index are clean and the six-commit file union matches this allocation.

Real AI still requires configured provider keys, enabled live flags and owner
approvals; fake proofs do not establish diarization quality. Owner visual,
real-media/AI, hosted and release acceptance remain unchecked.

## Execution record

The inventory reconciled exactly to all 43 allocated files. The first five
commits were created in order, each with an empty starting index, exact staged
path match, inspected summary, passing staged whitespace and credential-material
checks:

- `c6d2968`: eleven contract/shared-rendering files.
- `cae597f`: seven persistence/worker-binding files.
- `834b01c`: four native export files.
- `7405aca`: three explicit fake-caption files.
- `898b04c`: eleven editor/UI/guide files.
- This final documentation/proof commit: the seven files in group 6, including
  this plan. Its final hash and final worktree/index checks are reported in the
  handoff because a commit cannot contain its own final hash.

No implementation code changed during packaging. The recorded fake/no-key,
synthetic native and responsive browser evidence remains applicable. No provider
calls, cloud changes, push, deployment, configuration reads or retained-media
changes were made. Owner acceptance remains pending as described above.
