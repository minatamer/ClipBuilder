# CL-133/134 whole-file packaging plan

Owner AFK authorization, 2026-10-29: finish caption-level speakers, document a
file commit plan, then stage/commit all previous Media/audio and caption work
before implementing local Codex integration. Start at `c8729c9`, empty index.
Commit this plan alone first. Preserve configuration, media, logs and healthy app.
No push, deployment, cloud access or paid/provider test is authorized.

Allocate every pending file whole exactly once below. These are dependent review
commits; their combined result carries validation. Finish CL-134 synthetic checks
and current-worker parity before committing implementation. CL-133 already has
70 focused unit checks, native/browser proofs, types/lint/format and validation.
No repeated media checks are needed unless the new shared caption logic affects
them. Record actual final evidence in the owning tickets before the last group.

## 1. CL-133: add bounded manual audio contracts and native processing

- `packages/contracts/local/audio.ts`
- `packages/contracts/local/audio.test.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/diagnostics.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/hosted-editing.ts`
- `packages/contracts/local/index.ts`
- `packages/composition/local/audio-synthesis.ts`
- `packages/composition/local/audio-synthesis.test.ts`
- `apps/renderer/local/audio-media.ts`
- `apps/renderer/local/audio-mix.ts`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/media.ts`
- `apps/renderer/local/server.ts`
- `apps/backend/local/agent-view.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/draft-store.test.ts`
- `apps/backend/local/draft-store.ts`
- `apps/backend/local/edit-clip.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/workspace-files.ts`
- `test/local-audio.proof.ts`

## 2. CL-133: add Media audio controls and synchronized previews

- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/audio-preview.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/proxy.ts`
- `test/owner-controls-browser.ts`
- `test/owner-hosted-editor.proof.ts`
- `test/local-audio-editor.proof.ts`

The shared stylesheet also carries CL-134's replacement of the obsolete per-word
speaker grid. Allocate it here once; the combined commits contain the full change.

## 3. CL-134: simplify attribution to one speaker per caption

- `packages/contracts/local/caption-speakers.ts`
- `packages/contracts/local/caption-speakers.test.ts`
- `packages/composition/local/overlay-frame.ts`
- `apps/frontend/src/features/local-editing/caption-speakers.tsx`
- `apps/frontend/src/features/local-editing/overlay-frame.test.tsx`
- `test/local-focus-editor.proof.ts`
- `test/local-speaker-hook.proof.ts`

## 4. CL-133: record Media audio and caption-level verification

- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/renderer/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/MEDIA_AUDIO.md`
- `docs/operations/LOCAL_WORKFLOW.md`
- `docs/tickets/CL-133-media-audio.md`
- `docs/tickets/CL-134-caption-level-speakers.md`
- `docs/tickets/README.md`

Reconcile 48 implementation/evidence paths plus this plan, with a clean worktree
and index before CL-135. Check staged names/content, whitespace, privacy and no
generated media/configuration. Then document and commit CL-135's own plan before
starting any Codex implementation. Real-AI, personal visual/listening, device,
media rights, hosted and release acceptance remain owner-only.
