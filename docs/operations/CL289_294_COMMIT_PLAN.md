# CL-288 — CL-275–294 whole-file commit allocation

Owner authorization: 2026-11-12, local staging/commits only. Preserve main, the running app, media, ignored configuration and Voyagenda. No push, provider call, cloud action or deployment.

Baseline: `183065be4fe2d1b5c5837eadd84cb8b3d8167e02`; 111 pending paths plus the two packaging records, 113 distinct paths in 11 ordered commits. No hunk staging or temporary implementation rewrites. Shared files carry multiple ticket prefixes rather than splitting their contents. Dependencies land before their consumers.

Validation: settled owning packets reviewed with no actionable findings. Prior focused fake/no-key/native checks and Clip 6/4 authorized native-export evidence remain in their packets. The eight-case thumbnail/recovery group passed again during packaging; no broad suite or live AI rerun. Types, lint and native builds passed in execution. Hosted release, real-provider creative quality and personal aesthetic acceptance remain owner-only.

Before each commit verify the exact staged paths, planned normalized blobs, staged whitespace and text-only/private-artifact boundaries. Git staging/commits are performed outside the read-only validation phase, under the owner's explicit request.

## 1. CL-286/CL-287/CL-289/CL-291/CL-294: extend shared editing contracts

Keep whole shared contract files together: Glass/framing, manual-media flags, fresh visual schemas and trusted export deadlines. Existing saved data remains compatible.

15 whole files:

- `packages/contracts/local/assets.ts`
- `packages/contracts/local/black-bars.ts`
- `packages/contracts/local/camera-follow-window.ts`
- `packages/contracts/local/camera-follow.ts`
- `packages/contracts/local/camera-motion.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/codex.test.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/export-deadline.ts`
- `packages/contracts/local/focus.ts`
- `packages/contracts/local/hook-content.ts`
- `packages/contracts/local/visual-diagnostics.ts`
- `packages/contracts/src/contextual-picture.schema.ts`

## 2. CL-286/CL-287/CL-291/CL-294: align Glass, square crops and full-HD exports

Keep the shared composition, native crop/render implementation and generated proofs together. Includes strict backend edit transport and default-style evidence.

19 whole files:

- `apps/backend/local/black-bars.test.tsx`
- `apps/backend/local/edit-clip.ts`
- `apps/backend/local/media-bars.test.ts`
- `apps/renderer/local/black-bars.proof.ts`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/entry.ts`
- `apps/renderer/local/export-profile.test.ts`
- `apps/renderer/local/export-profile.ts`
- `apps/renderer/local/focus-filter.ts`
- `apps/renderer/local/refractive-scene.ts`
- `apps/renderer/local/server.ts`
- `docs/tickets/CL-275-glass-one-word-caption-style.md`
- `packages/composition/local/automatic-overlay.tsx`
- `packages/composition/local/glass-word.tsx`
- `packages/composition/local/overlay-frame.ts`
- `packages/composition/local/scene-mattes.tsx`
- `packages/composition/local/styled-caption.tsx`
- `test/local-glass-captions.proof.ts`
- `test/owner-glass-scene.test.ts`

## 3. CL-289/CL-294: admit expressive B-roll and cap automatic imagery

Use the existing bounded acquisition paths, reject unsuitable optional filler and stop after one usable automatic visual. Preserve manual media and provider safety gates.

12 whole files:

- `apps/backend/src/assembly/automatic-picture-admission.test.ts`
- `apps/backend/src/assembly/automatic-picture-admission.ts`
- `apps/backend/src/assembly/commons-pictures.ts`
- `apps/backend/src/assembly/contextual-pictures.test.ts`
- `apps/backend/src/assembly/contextual-pictures.ts`
- `apps/backend/src/assembly/gemini-image-search.test.ts`
- `apps/backend/src/assembly/gemini-pictures.ts`
- `apps/backend/src/assembly/gemini-search-response.ts`
- `apps/backend/src/assembly/gemini-selected-plan.ts`
- `apps/backend/src/assembly/picture-relevance.ts`
- `apps/backend/src/assembly/visual-story-policy.ts`
- `apps/backend/src/assembly/web-pictures.ts`

## 4. CL-289/CL-294: preserve visual refreshes and export lifecycle

Whole orchestration files combine visual preservation, local-only discovery, cancellation recovery and trusted worker/RPC deadline wiring. No automatic provider retries or deployment.

20 whole files:

- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/codex-visual.test.ts`
- `apps/backend/local/codex-visual.ts`
- `apps/backend/local/hosted-runtime.ts`
- `apps/backend/local/planned-visuals.test.ts`
- `apps/backend/local/planned-visuals.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/runtime.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/visual-discovery.ts`
- `apps/backend/local/worker-port.ts`
- `docs/tickets/CL-289-emotive-visual-selection-and-optional-admission.md`
- `scripts/local-discovery.mjs`
- `test/owner-discovery.test.ts`
- `test/owner-editor.test.ts`
- `test/owner-worker-progress.test.ts`

## 5. CL-286/CL-287/CL-291: refine caption, framing and media controls

Integrate movable square crops, caption material controls, layered-media navigation/removal and per-media matte override. The whole shared stylesheet also includes CL-290/CL-294 cleanup.

22 whole files:

- `apps/frontend/src/features/local-editing/black-bars.test.tsx`
- `apps/frontend/src/features/local-editing/camera-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/camera-preview-video.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/focus-positions.ts`
- `apps/frontend/src/features/local-editing/focus-preview-controls.tsx`
- `apps/frontend/src/features/local-editing/head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/media-bars.test.tsx`
- `apps/frontend/src/features/local-editing/scene-framing-picker.tsx`
- `apps/frontend/src/features/local-editing/scene-framing.module.css`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/styled-caption.test.tsx`
- `apps/frontend/src/features/local-editing/typography-fields.tsx`
- `apps/frontend/src/features/local-editing/typography-preset-picker.tsx`
- `apps/frontend/src/features/local-editing/visual-layer-order.module.css`
- `apps/frontend/src/features/local-editing/visual-layer-order.tsx`
- `apps/frontend/src/features/local-editing/visual-media-controls.tsx`
- `docs/tickets/CL-286-manual-sounds-caption-material-and-save-recovery.md`
- `docs/tickets/CL-287-editor-black-bar-framing.md`
- `docs/tickets/CL-291-media-layer-rows-preview-jump-and-bar-override.md`

## 6. CL-290: unify workspace reconnect and repair states

One shared recovery owner replaces duplicate retry clusters and retains editor state/focus across reconnect. Shared Button ref supports the existing keyboard repair flow.

7 whole files:

- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-connection.ts`
- `apps/frontend/src/features/local-editing/experience.tsx`
- `apps/frontend/src/shared/ui/button.tsx`
- `apps/frontend/src/shared/ui/connection-recovery.module.css`
- `apps/frontend/src/shared/ui/connection-recovery.tsx`
- `docs/tickets/CL-290-workspace-connection-recovery-design.md`

## 7. CL-294: recover clip rail and shared media thumbnails

Retry existing media reads with capped backoff and cleanup; no AI/export retry. The complete generated browser fixture also retains CL-290 connection-failure controls.

8 whole files:

- `apps/frontend/src/features/local-editing/clip-rail-preview.tsx`
- `apps/frontend/src/features/media/preview-recovery.test.ts`
- `apps/frontend/src/features/media/preview-recovery.ts`
- `apps/frontend/src/features/media/video-thumbnail.test.ts`
- `apps/frontend/src/features/media/video-thumbnail.ts`
- `apps/frontend/src/shared/ui/video-thumbnail.module.css`
- `apps/frontend/src/shared/ui/video-thumbnail.tsx`
- `test/owner-hook-browser-fixture.ts`

## 8. CL-276: refresh current-editor portfolio capture fixtures

Retain upload-only fictional/silent capture fixtures and the actual refreshed laptop evidence. Portfolio images and private generated outputs remain outside Git.

2 whole files:

- `docs/tickets/CL-276-landing-film-and-portfolio-captures.md`
- `test/owner-marketing-fixture.ts`

## 9. CL-283: record final approved editorial handoff

Record the final private timestamp/stitch handoff without committing source identity, transcript or real endpoints.

1 whole files:

- `docs/tickets/CL-283-local-analysis-notebook-and-editorial-reuse.md`

## 10. CL-292/CL-293: record export diagnosis and visual-policy decisions

Retain measured export diagnosis and the planning record adopted by CL-294. Hosted fifteen-minute approval supersedes the earlier ten-minute hold.

2 whole files:

- `docs/tickets/CL-292-export-latency-and-progress-diagnosis.md`
- `docs/tickets/CL-293-single-ai-visual-and-local-discovery.md`

## 11. CL-288/CL-294: record validated whole-file commit batch

Record owner authorization, exact whole-file allocation, validation and local commit receipts. Consolidate cross-ticket product/index documentation; no push.

5 whole files:

- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/CL289_294_COMMIT_PLAN.md`
- `docs/tickets/CL-288-file-level-local-commit-batch.md`
- `docs/tickets/CL-294-full-hd-export-and-ai-visual-bounds.md`
- `docs/tickets/README.md`

## Completion receipts

1. `0f3d819` — CL-286/CL-287/CL-289/CL-291/CL-294: extend shared editing contracts (15 files).
2. `be8a776` — CL-286/CL-287/CL-291/CL-294: align Glass, square crops and full-HD exports (19 files).
3. `9556369` — CL-289/CL-294: admit expressive B-roll and cap automatic imagery (12 files).
4. `1413a5b` — CL-289/CL-294: preserve visual refreshes and export lifecycle (20 files).
5. `e5ccd8d` — CL-286/CL-287/CL-291: refine caption, framing and media controls (22 files).
6. `820ac50` — CL-290: unify workspace reconnect and repair states (7 files).
7. `a3a25fb` — CL-294: recover clip rail and shared media thumbnails (8 files).
8. `f06dd66` — CL-276: refresh current-editor portfolio capture fixtures (2 files).
9. `858a614` — CL-283: record final approved editorial handoff (1 files).
10. `f8f764a` — CL-292/CL-293: record export diagnosis and visual-policy decisions (2 files).
11. Final: CL-288/CL-294: record validated whole-file commit batch (5 files).

The ten preceding commits passed exact path, planned blob and staged-whitespace checks. All 113 files are allocated once. Scoped formatting and ESLint passed; the credential-pattern/private-artifact check found no matches or media additions. Source blobs still match the pre-staging snapshot. The final commit records this ledger without a self-referential hash. After committing, require eleven commits since baseline, exactly the allocated paths/blobs, and a clean index/worktree. No push, service restart, provider call, cloud/deployment or Voyagenda operation.
