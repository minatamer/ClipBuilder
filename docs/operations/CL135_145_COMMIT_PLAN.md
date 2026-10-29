# CL-135–145 whole-file commit plan

Owner authorization 2026-10-29: file a commit plan, stage and commit the current
work in multiple local commits, then explain how to activate Codex. Start at
`04450d6` with an empty index and 111 pending implementation/evidence files.
Commit this plan alone first. No push, deployment, provider inference, cloud
access, ignored configuration edit or automatic real-mode activation is requested.
Preserve the healthy app, owner media/private logs and existing configuration.

These are dependent whole-file review commits; combined validation applies to
the final tree. Interwoven CL-135–145 files are allocated exactly once, rather
than reconstructing historical versions or splitting fragile hunks. Backend/
shared files own provider isolation, speech/URL ports, Hook suggestions, fixed
recordings and the native cut correction; frontend integration follows those
contracts. Packaging/proofs follow the complete UI. Owning docs close the series.

## 1. CL-135-145: plan current-work commit packaging

- `docs/operations/CL135_145_COMMIT_PLAN.md`

## 2. CL-135-145: add isolated Codex and media runtime

- `apps/backend/.env.example`
- `apps/backend/local/acquisition-port.ts`
- `apps/backend/local/caption-provider-composition.test.ts`
- `apps/backend/local/caption-provider-composition.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/codex-artifact.test.ts`
- `apps/backend/local/codex-composition.test.ts`
- `apps/backend/local/codex-composition.ts`
- `apps/backend/local/codex-exec.test.ts`
- `apps/backend/local/codex-exec.ts`
- `apps/backend/local/edit-clip.ts`
- `apps/backend/local/fake-clips.ts`
- `apps/backend/local/fake-content.test.ts`
- `apps/backend/local/hook-suggestion-policy.ts`
- `apps/backend/local/hosted-workflow.test.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/provider-readiness.test.ts`
- `apps/backend/local/provider-readiness.ts`
- `apps/backend/local/runtime.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/worker-port.ts`
- `apps/backend/local/workspace-files.ts`
- `apps/backend/local/youtube-audio.ts`
- `apps/backend/local/yt-dlp-acquisition.test.ts`
- `apps/backend/local/yt-dlp-acquisition.ts`
- `apps/backend/src/config/env.schema.ts`
- `apps/backend/src/config/loadConfig.test.ts`
- `apps/backend/src/config/loadConfig.ts`
- `apps/renderer/local/audio-mix.ts`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`
- `apps/renderer/local/entry.ts`
- `apps/renderer/local/media.ts`
- `apps/renderer/local/server.ts`
- `packages/composition/local/audio-sources.test.ts`
- `packages/composition/local/audio-sources.ts`
- `packages/composition/local/audio-synthesis.test.ts`
- `packages/composition/local/audio-synthesis.ts`
- `packages/composition/local/sound-recordings.ts`
- `packages/contracts/local/audio.test.ts`
- `packages/contracts/local/audio.ts`
- `packages/contracts/local/caption-generation.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/codex.test.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/diagnostics.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/hook.test.ts`
- `packages/contracts/local/hook.ts`
- `packages/contracts/local/index.ts`
- `packages/contracts/local/runtime.ts`
- `packages/contracts/local/youtube-audio.test.ts`
- `packages/contracts/local/youtube-audio.ts`
- `scripts/local-speech-tools.ts`
- `scripts/prepare-local-speech.mjs`
- `test/deterministic.environment.ts`

## 3. CL-135-145: connect provider audio and stable hook controls

- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/audio-preview.tsx`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/codex-errors.test.ts`
- `apps/frontend/src/features/local-editing/codex-errors.ts`
- `apps/frontend/src/features/local-editing/control-tabs.tsx`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/focus-preview-controls.tsx`
- `apps/frontend/src/features/local-editing/hook-controls.tsx`
- `apps/frontend/src/features/local-editing/picture-timing.tsx`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/use-editor-preview.ts`
- `apps/frontend/src/features/local-editing/youtube-audio-intake.tsx`
- `apps/frontend/src/server/local-ai-request.test.ts`
- `apps/frontend/src/server/local-ai-request.ts`
- `apps/frontend/src/server/local-workflow.test.ts`
- `apps/frontend/src/server/local-workflow.ts`
- `package.json`
- `scripts/prepare-app-image.mjs`
- `test/app-image.test.ts`
- `test/local-audio-editor.proof.ts`
- `test/local-audio.proof.ts`
- `test/local-codex.proof.ts`
- `test/local-focus-editor.proof.ts`
- `test/local-speaker-hook.proof.ts`
- `test/owner-hosted-editor.proof.ts`

## 4. CL-135-145: record local integration validation and setup

- `AGENTS.md`
- `apps/backend/README.md`
- `apps/backend/local/README.md`
- `apps/frontend/README.md`
- `apps/frontend/src/features/local-editing/README.md`
- `apps/renderer/local/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/architecture/MEDIA_AUDIO.md`
- `docs/operations/LOCAL_WORKFLOW.md`
- `docs/operations/THIRD_PARTY_SOFTWARE.md`
- `docs/tickets/CL-135-local-codex-provider.md`
- `docs/tickets/CL-136-optional-ai-hook-suggestion.md`
- `docs/tickets/CL-137-explicit-ai-provider-switch.md`
- `docs/tickets/CL-138-visual-start-sounds-and-audio-layers.md`
- `docs/tickets/CL-139-local-youtube-audio-import.md`
- `docs/tickets/CL-140-stable-hook-capture-and-suggestion-playback.md`
- `docs/tickets/CL-141-audible-added-audio-preview.md`
- `docs/tickets/CL-142-researched-recorded-sound-library.md`
- `docs/tickets/CL-143-discord-notification-sound.md`
- `docs/tickets/CL-144-remove-provider-status-copy.md`
- `docs/tickets/CL-145-clean-hook-cut-and-retire-sator.md`
- `docs/tickets/README.md`

## Gates and remaining owner checks

Before staging, reconcile every allocated path and reject secrets, ignored env,
private media, generated runtime/build files or unrelated changes. Stage each
explicit whole-file list, check exact staged names and whitespace, then commit
with its listed subject. Verify no unexpected additions between groups and a
clean final worktree/index, with all four new commits based on 04450d6.

Preserve the completed ticket evidence: fake/injected Codex/provider isolation
and speech checks, synthetic Media/Hook browser/native proofs, packaging and
scoped types/lint/format/review gates. CL-145 most recently passed nine focused
checks, two final browser proofs, five native cut cases and current worker parity.
Run a focused offline Codex/provider regression set and final packaging/preflight
checks for this handoff; do not repeat paid/live/media checks or build over the
healthy frontend. Record only actual results in the final documentation group.

Fake editing/playback/export needs no API keys. Actual Codex moment/camera
inference needs saved ChatGPT CLI login, prepared local speech tools and owner
real/master settings. Authentication, real ASR/AI quality, allowance, listening/
physical devices, hosted and release acceptance remain owner-only and unverified.
Selecting Codex never falls back to Gemini; activation instructions are guidance,
not authorization to alter the owner's switches or invoke inference.
