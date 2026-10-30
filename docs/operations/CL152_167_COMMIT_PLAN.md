# CL-152–167 whole-file commit plan

Owner authorization, 2026-10-30: file a commit plan, then stage and commit all
current work in multiple ticket-prefixed local commits. No deployment or push.
Baseline `89e5b6bd22a904ee976c30cdf2d6f20f3e189e19`, branch `main`, empty index:
101 pending tracked/untracked files, plus this plan = 102 distinct paths.
Preserve the running normal app, owner configuration, private media, saved
projects/recovery, diagnostics and ignored tooling. No inference, downloads,
cloud, new feature work or environment changes are included.

Commit this plan alone first. Allocate every file whole, exactly once below.
These are dependent review commits: shared contracts, planners, editor and
integration proofs span several tickets and stay intact. Only the complete
final tree carries the recorded validation; individual intermediate commits
are not claimed to pass the complete integration proof. Earlier ticket notes
saying unstaged/uncommitted describe their historical handoffs and are superseded
by this explicit packaging authorization.

## 1. `CL-152-167: plan current-work commit packaging`

Commit this plan alone before staging implementation.

- `docs/operations/CL152_167_COMMIT_PLAN.md`

## 2. `CL-152-166: define sampling focus hook and visual clocks`

Shared sampling/placement/motion/audio/hook/title schemas, defaults and focused contract tests. Shared files contain multiple tickets and remain whole.

- `packages/contracts/local/assets.ts`
- `packages/contracts/local/audio.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/codex-sampling.test.ts`
- `packages/contracts/local/codex-sampling.ts`
- `packages/contracts/local/codex.test.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/diagnostics.ts`
- `packages/contracts/local/focus.test.ts`
- `packages/contracts/local/focus.ts`
- `packages/contracts/local/hook-sounds.ts`
- `packages/contracts/local/hook.test.ts`
- `packages/contracts/local/hook.ts`
- `packages/contracts/local/policy.ts`
- `packages/contracts/local/text-layers.ts`
- `packages/contracts/local/visual-clock.ts`
- `packages/contracts/local/visual-placement.test.ts`
- `packages/contracts/local/visual-placement.ts`

## 3. `CL-153: adapt Codex output schemas for the CLI`

CLI-only schema compatibility boundary and isolated fake-endpoint proof; preserve runtime schemas and login/provider isolation.

- `apps/backend/local/codex-exec.ts`
- `apps/backend/local/codex-schema.test.ts`
- `apps/backend/local/codex-schema.ts`
- `test/local-codex-cli.proof.ts`

## 4. `CL-152: sample frames around speaker changes`

Native temporal sampling reuses the existing image budget and synthetic media tests.

- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`

## 5. `CL-153-167: connect grounded planning and local session recovery`

Backend shared planning/coverage/title/visual policies, exact-subject image lookup, startup readiness and rolling recovery with their tests. These providers and host files are interwoven and stay together.

- `apps/backend/local/analysis.test.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/codex-composition.ts`
- `apps/backend/local/diagnostics.ts`
- `apps/backend/local/fake-clips.test.ts`
- `apps/backend/local/fake-clips.ts`
- `apps/backend/local/hook-suggestion-policy.ts`
- `apps/backend/local/planned-text.test.ts`
- `apps/backend/local/planned-text.ts`
- `apps/backend/local/planned-visuals.test.ts`
- `apps/backend/local/planned-visuals.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/runtime.ts`
- `apps/backend/local/server-recovery.test.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/session-recovery.test.ts`
- `apps/backend/local/session-recovery.ts`
- `apps/backend/local/workspace-drafts.ts`
- `apps/backend/src/assembly/commons-pictures.test.ts`
- `apps/backend/src/assembly/commons-pictures.ts`
- `apps/backend/src/assembly/gemini-pictures.test.ts`
- `apps/backend/src/assembly/gemini-pictures.ts`
- `apps/backend/src/assembly/visual-story-policy.ts`

## 6. `CL-162: add the selected hook riser recordings`

Intentional fixed catalogue recordings and digest/sample-clock checks; no private or generated owner media.

- `packages/composition/local/audio-sources.test.ts`
- `packages/composition/local/sound-recordings.ts`

## 7. `CL-158-166: update editor recovery hooks and media controls`

Footer recovery, section icons, Hook/riser behavior, audio intake, deliberate manual detachment and buffered visual preview; preserve owner configuration.

- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/audio-preview.tsx`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-connection.test.ts`
- `apps/frontend/src/features/local-editing/clip-connection.ts`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/experience.tsx`
- `apps/frontend/src/features/local-editing/hook-controls.tsx`
- `apps/frontend/src/features/local-editing/hook-edit.test.ts`
- `apps/frontend/src/features/local-editing/hook-edit.ts`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/youtube-audio-intake.tsx`

## 8. `CL-166: synchronize native visual and audio presentation`

Shared overlay/motion clock, native Hook/body raster branches and sample-exact cue scheduling within existing resource/quality bounds.

- `apps/renderer/local/audio-mix.ts`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/overlay-page.tsx`
- `apps/renderer/local/rasterize-overlay.ts`
- `packages/composition/local/automatic-overlay.tsx`
- `packages/composition/local/overlay-frame.ts`
- `packages/composition/local/visual-clock.test.ts`
- `packages/composition/local/visual-motion.ts`

## 9. `CL-152-167: verify synthetic editor export and recovery flows`

Current-source synthetic native/browser integration, catalogue audio, delayed/missing images, five-cadence decoded onset checks and recovery/save/export fixtures.

- `test/local-audio-editor.proof.ts`
- `test/local-audio.proof.ts`
- `test/local-codex.proof.ts`
- `test/local-visual-sync.proof.ts`
- `test/owner-content-fixture.ts`

## 10. `CL-152-167: record decisions validation and commit evidence`

Product authority, owner recovery instruction, focused architecture/workflow guides, sixteen ticket packets and index. Closing index records actual earlier commit IDs; final commit is self-identifying in history.

- `AGENTS.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/architecture/MEDIA_AUDIO.md`
- `docs/operations/LOCAL_WORKFLOW.md`
- `docs/tickets/CL-152-codex-speaker-change-sampling.md`
- `docs/tickets/CL-153-real-codex-clip-acceptance.md`
- `docs/tickets/CL-154-opening-focus-and-face-safe-visuals.md`
- `docs/tickets/CL-155-default-two-clips.md`
- `docs/tickets/CL-156-ai-picture-duration-and-gaps.md`
- `docs/tickets/CL-157-ai-opening-text.md`
- `docs/tickets/CL-158-session-recovery-and-reconnect.md`
- `docs/tickets/CL-159-visual-motion-and-variety.md`
- `docs/tickets/CL-160-editor-section-icons.md`
- `docs/tickets/CL-161-audio-intake-card-actions.md`
- `docs/tickets/CL-162-ai-hook-risers.md`
- `docs/tickets/CL-163-later-ai-hook-suggestions.md`
- `docs/tickets/CL-164-visual-coverage-and-search-fallbacks.md`
- `docs/tickets/CL-165-creative-opening-title-hooks.md`
- `docs/tickets/CL-166-visual-accent-synchronization.md`
- `docs/tickets/CL-167-script-grounded-attention-visuals.md`
- `docs/tickets/README.md`

## Packaging checks and preserved validation

Reuse the settled ticket evidence; packaging changes no feature behavior.
CL-166: focused motion/audio/batch tests; decoded MP4/audio onset equality at
24/25/29.97/30/60fps; actual Player delayed/missing-image check; native catalogue
and editor/save/export proofs. CL-167: 96 fake local cases, 67 mocked picture
cases and three current-source native/browser/isolated-CLI cases (100.99s).
Contract/local/backend/frontend/root-test types, scoped lint/format and whitespace
pass. Earlier packets retain their own exact evidence, including the separately
approved, exhausted CL-153 one-real-clip acceptance. No real provider call is
authorized or needed for this commit packaging.

Fake/no-key/paid-off evidence proves mechanics, not live editorial taste, speech/
face quality, actual search hit rate, physical devices or hosted/release quality.
Normal real Codex still requires installed local CPU tools and saved ChatGPT
sign-in/allowance; hosted/default Gemini retains its keys/live flags/approvals.
Owner acceptance gates remain open. Preserve the healthy 3000/4000/4200 stack.

Before every commit: require an empty index; stage only its exact manifest;
compare staged names and working content; check whitespace and credential-shaped
added text without printing matches. Admit only the reviewed source/docs paths.
Fixed catalogue FLAC data in sound-recordings.ts is intentional source data;
no ignored configuration, private/generated owner media, runtime logs or binaries
belong in this series. Existing proofs verify catalogue hashes/sample clocks.

After all commits: reconcile baseline-to-HEAD names with all 102 allocated paths,
verify ten ticket-prefixed commits and an empty index/worktree, then report commit
IDs. No push or deployment. Closing index records actual packaging outcomes.
