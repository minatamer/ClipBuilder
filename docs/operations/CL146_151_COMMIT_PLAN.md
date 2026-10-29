# CL-146–151 whole-file commit plan

Owner authorization, 2026-10-29: file the plan, stage and commit all current work
in multiple ticket-prefixed local commits for review tomorrow. Baseline 2c0064a,
branch main, empty index: 46 pending files. Commit this plan alone first, then
allocate every pending file exactly once below (47 distinct files including the
plan). No push, deployment, provider/cloud request or configuration change.
Preserve the healthy app, saved/retained media, private logs and ignored tooling.

These are dependent whole-file review commits. Shared Codex/schema/planning files
contain interwoven CL-149–151 changes and stay together; discovery/speech wiring
contains CL-146 plus CL-150 and stays with native/tooling work. The synthetic
integration proof follows both implementation groups. Existing validation applies
to the complete final tree; do not claim each intermediate commit independently
passed the full integration proof. No feature behavior changes during packaging.

## 1. CL-146: plan local fix and parity commits

- `docs/operations/CL146_151_COMMIT_PLAN.md`

## 2. CL-147: fix Codex launch and warning handling

- `apps/backend/local/codex-exec.ts`
- `apps/backend/local/codex-exec.test.ts`
- `apps/frontend/src/features/local-editing/codex-errors.ts`
- `apps/frontend/src/features/local-editing/codex-errors.test.ts`

## 3. CL-149: connect grounded titles and editor content

- `packages/contracts/local/clips.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/codex.test.ts`
- `packages/contracts/local/text-layers.ts`
- `packages/contracts/local/illustration.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-visual.ts`
- `apps/backend/local/codex-visual.test.ts`
- `apps/backend/local/planned-text.ts`
- `apps/backend/local/planned-text.test.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/server.ts`

## 4. CL-150: add speaker tools and temporal media inputs

- `apps/backend/local/runtime.ts`
- `apps/renderer/local/codex-media.ts`
- `apps/renderer/local/entry.ts`
- `apps/renderer/local/server.ts`
- `apps/renderer/local/speaker-turns.ts`
- `apps/renderer/local/speaker-turns.test.ts`
- `package.json`
- `scripts/local-discovery.mjs`
- `scripts/local-speech-tools.ts`
- `scripts/local-speaker-tools.ts`
- `scripts/prepare-local-speakers.mjs`
- `scripts/prepare-app-image.mjs`
- `test/app-image.test.ts`
- `test/owner-discovery.test.ts`

## 5. CL-151: verify Codex preview export and restore

- `test/local-codex.proof.ts`

## 6. CL-151: record fixes setup and validation evidence

- `apps/backend/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/operations/THIRD_PARTY_SOFTWARE.md`
- `docs/tickets/README.md`
- `docs/tickets/CL-146-codex-speech-discovery-startup.md`
- `docs/tickets/CL-147-codex-cli-launch-failure.md`
- `docs/tickets/CL-148-codex-result-protocol.md`
- `docs/tickets/CL-149-codex-moment-copy.md`
- `docs/tickets/CL-150-local-speaker-camera.md`
- `docs/tickets/CL-151-codex-editor-content.md`

## Verification and remaining gates

Reuse completed implementation evidence: 76 focused fake/no-key checks; separate
speaker/discovery and build-input checks; final 40.64-second synthetic browser/
native export/restore proof; local/frontend types, scoped lint, contracts build,
format and whitespace. Synthetic tests inject Codex/speech/diarization results;
they do not prove actual ASR, speaker/face, editorial or image quality. Prepared
local CPU tools/models are hash-verified and ignored, and real Codex uses saved
ChatGPT sign-in/allowance. Hosted/default Gemini still needs its normal keys,
live flags and approvals. No agent real-provider testing is part of packaging.

Before each commit, require an empty index, stage only that exact manifest,
compare staged filenames, reject binary/media/secret paths and credential-shaped
added text, and check whitespace plus absence of unstaged changes in that group.
After all commits, verify the baseline-to-HEAD file set equals this allocation,
six local commits exist, and index/worktree are clean. The closing documentation
commit records actual commit IDs in the ticket index. Earlier uncommitted/no-Git
handoff notes remain historical and are superseded by this explicit owner request.
Owner real-AI/diarization/camera/editorial/visual/listening/device/rights/clean-machine
and hosted/release acceptance remain open. Leave the normal application running.
