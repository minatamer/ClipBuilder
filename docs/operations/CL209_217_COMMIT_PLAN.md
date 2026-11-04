# CL-209-217 - File-level commit and push plan

Owner authorization: 2026-11-05, "file commit plan, multiple commits, stage
commit and push, i will review this work tomorrow." This authorizes staging,
local commits and a normal fast-forward push of this pending series to
`origin/main`. Earlier packet no-Git/unstaged notes describe their implementation
handoffs; this later instruction supersedes them for this Git task only.
Personal review is pending for 2026-11-06.

## Scope and allocation

Baseline: `8abe072270ba1e0a0cddd72be129d008c623c28e` on local `main`.
The configured GitHub remote's `main` was checked and matches that baseline.
Allocate all 97 pending paths plus this plan exactly once: 98 complete paths in
six commits. The deleted frontend tracker and its shared replacement belong to
the same commit. No partial staging, temporary source rewrites, broad add,
forced add, history rewrite or force-push.

Preserve ignored configuration, saved sources/drafts/exports, private diagnostics,
benchmark media/transcripts, model binaries, proof artifacts and the running app.
This packaging task does not restart the app or run processing, inference,
downloads or deployment. The existing push workflow performs quality checks;
it contains no deployment step. CI results remain separate from local evidence.

Several packets share complete files. Native speech and source-cut contracts
land first; the backend adapter then connects compact evidence, exhaustive
reconciliation and source-cut guidance. Shared backend manual-capacity changes
land with that adapter. The preview fix precedes selection UI. The entire shared
CSS file lands with timestamp controls, including inactive Motion styles used by
the following commit. The tracker move, steady-framing contracts, automatic
native follow, backend integration and Motion UI land together. Shared guides,
authority, ticket status and this execution record land last.

Each ticket's full behavior is reviewed against the final series. Prerequisite
commits are not separately claimed as complete feature acceptance.

## 1. CL-209-213: optimize local speech and source-cut preparation

Prepare the English-only Parakeet path, benchmark tooling and measured source-cut contracts/native evidence before backend consumption.

- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`
- `apps/renderer/local/entry.ts`
- `apps/renderer/local/parakeet-speech.test.ts`
- `apps/renderer/local/parakeet-speech.ts`
- `apps/renderer/local/source-scene-cuts.test.ts`
- `apps/renderer/local/source-scene-cuts.ts`
- `apps/renderer/src/media/process-runner.test.ts`
- `apps/renderer/src/media/process-runner.ts`
- `packages/contracts/local/codex-sampling.test.ts`
- `packages/contracts/local/codex-sampling.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/focus-cut-alignment.test.ts`
- `packages/contracts/local/focus-cut-alignment.ts`
- `scripts/local-discovery.mjs`
- `scripts/local-speech-tools.ts`
- `scripts/prepare-local-speech.mjs`
- `scripts/benchmark-local-speech.py`
- `scripts/benchmark-moonshine.py`
- `scripts/faster-speech-lock.json`
- `scripts/local-faster-speech.py`
- `scripts/prepare-faster-speech.py`
- `test/local-codex.proof.ts`
- `test/local-source-cuts.proof.ts`
- `test/owner-discovery.test.ts`
- `test/owner-speech-tools.test.ts`
- `docs/tickets/CL-209-local-speech-throughput-benchmark.md`
- `docs/research/LOCAL_ASR_PERFORMANCE_2026-11-04.md`

## 2. CL-210-214: reconcile Find all and expand local manual admission

Connect compact canonical evidence, exhaustive passage reconciliation, source-cut guidance and the shared local manual-capacity boundary.

- `apps/backend/local/analysis-chunks.ts`
- `apps/backend/local/analysis.test.ts`
- `apps/backend/local/analysis.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/long-analysis.test.ts`
- `apps/backend/local/long-analysis.ts`
- `apps/backend/local/server-capacity.test.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/codex-camera-cuts.test.ts`
- `apps/backend/local/codex-selection-input.test.ts`
- `apps/backend/local/codex-selection-input.ts`
- `apps/backend/local/find-all-passages.test.ts`
- `apps/backend/local/find-all-passages.ts`
- `packages/contracts/local/policy.ts`
- `packages/contracts/local/selection.ts`
- `test/local-find-all.proof.ts`
- `docs/tickets/CL-210-codex-find-all-consistency.md`
- `docs/tickets/CL-211-complete-nonoverlapping-find-all.md`
- `docs/tickets/CL-213-source-cut-accurate-codex-cameras.md`

## 3. CL-212: align preview camera crops with presented frames

Render camera crops from the decoded frame being presented and cover playback, seek, Hook, Motion and lifecycle behavior.

- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/camera-preview-video.tsx`
- `test/local-camera-switch.proof.ts`
- `test/local-focus-editor.proof.ts`
- `docs/tickets/CL-212-frame-aligned-preview-camera-cuts.md`

## 4. CL-214-215: expand timestamp imports and jump to manual endpoints

Complete local JSON import admission and add guarded Jump to actions beside manual Start/End Capture controls.

- `apps/frontend/src/features/local-editing/manual-time.test.ts`
- `apps/frontend/src/features/local-editing/manual-time.ts`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `packages/contracts/local/timestamp-exchange.test.ts`
- `packages/contracts/local/timestamp-exchange.ts`
- `test/local-timestamp-exchange.proof.ts`
- `docs/tickets/CL-200-local-timestamp-json-exchange.md`
- `docs/tickets/CL-214-larger-local-timestamp-imports.md`
- `docs/tickets/CL-215-manual-timestamp-jump-to.md`

## 5. CL-216-217: follow speakers locally and improve Motion controls

Atomically move the shared pixel tracker, add conditional automatic follow and steady framing, and connect the larger responsive Motion selection UI.

- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/renderer/local/clip-preview.ts`
- `apps/renderer/local/automatic-camera-follow.ts`
- `apps/renderer/local/camera-follow-pixels.test.ts`
- `apps/renderer/local/camera-follow-pixels.ts`
- `packages/composition/local/head-pixel-tracker.ts`
- `apps/frontend/src/features/local-editing/head-pixel-tracker.ts`
- `packages/contracts/local/camera-follow.ts`
- `packages/contracts/local/index.ts`
- `packages/contracts/local/camera-follow-plan.ts`
- `packages/contracts/local/camera-follow-window.test.ts`
- `packages/contracts/local/camera-follow-window.ts`
- `apps/frontend/src/features/local-editing/bulk-head-motion.ts`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/head-selection-view.tsx`
- `apps/frontend/src/features/local-editing/head-pixel-tracker.test.ts`
- `apps/frontend/src/features/local-editing/track-head-video.ts`
- `test/local-camera-motion.proof.ts`
- `test/local-head-motion-editor.proof.ts`
- `test/local-automatic-follow.proof.ts`
- `docs/tickets/CL-216-automatic-speaker-follow-and-steady-framing.md`
- `docs/tickets/CL-217-motion-editor-layout.md`

## 6. CL-209-217: record verification and file-level commit plan

Publish the current product/setup boundaries, attribution, ticket status and this complete allocation and execution record.

- `AGENTS.md`
- `README.md`
- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/renderer/README.md`
- `packages/composition/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/operations/THIRD_PARTY_SOFTWARE.md`
- `docs/tickets/README.md`
- `docs/operations/CL209_217_COMMIT_PLAN.md`

## Verification reused from implementation

The owning packets record the actual checks, their commands and limitations.
This Git-only handoff reuses that evidence; it does not claim a fresh full-suite
run or independent approval of live output.

- CL-209 records all 51 ASR benchmark attempts, measured word/timestamp checks,
  English-only scope and the chosen free local Parakeet Q8 path. The eight-minute
  sample took about 126-152 seconds versus 451 seconds for the prior Whisper
  comparison. Broader listening, fresh-machine and two-hour acceptance remain
  open. See the linked research report in commit 1.
- CL-210/211 record 151/178 focused checks, synthetic native/API/browser proofs,
  and the separately observed owner run recovering the missing passages.
  Repeatability, editorial quality and listening remain owner acceptance.
- CL-212 records 742 decoded frames and 72 switches with no wrong crops or
  rewinds in the generated preview proof. CL-213 records 95 focused cases and
  native clock/source-cut proofs; fresh real Codex camera quality remains open.
- CL-214 records 99 relevant unit cases and a 25-row synthetic import/explicit
  submission proof, including the deployed three-clip regression. CL-215 records
  24 timestamp cases plus desktop, phone, Android, hosted-shape and keyboard
  navigation proofs. Owner-file/device acceptance remains open.
- CL-216 records 110 distinct unit cases, full browser controls and generated
  native follow/export proofs. The 72-second generated late-shift case took
  18.389 seconds including preview, with an 8 ms cached read. Full five-minute
  planning/resource bounds have unit coverage; real five-minute quality and
  performance remain unverified. CL-217 records desktop, short-laptop and two
  phone layouts with tracking, expanded selection, touch/keyboard and restoration.
- Applicable contracts/local/native/frontend/test typechecks, scoped lint and
  formatting, current-source native overlays, contracts build and whitespace
  checks passed as recorded in the packets. Final settled validation reported no
  actionable local findings. Backend/worker reload preserved the existing source,
  saved clip and frontend.

Fake/no-key verification covers synthetic selection, import/navigation,
preview/Motion controls and generated local pixel tracking/export composition.
It does not prove provider quality. Real local ASR is API-free local AI and
requires its installed approved model/runtime assets, available and measured in
CL-209. Normal local provider work remains Codex with sign-in and existing live
gates; deployed provider work remains Gemini with real API credentials, enabled
live flags and applicable approvals. This handoff performs neither. Real-media,
device/visual, broader transcription, hosted/Linux, rights and release acceptance
remain open. Pushing is not deployment or release clearance.

## Packaging gates

Before staging: exact allocation, clean initial index, branch/remote identity,
text-only paths, no credential/model/media/private artifacts, and shared-file
dependency review. Hash the original pending files to prove packaging does not
change production, test or benchmark source bytes. Only this plan and the narrow
source-of-truth/index Git-handoff notices are edited during packaging.

For each commit: stage only the allocated complete paths (including deletion),
compare the actual index paths with the allocation, inspect staged statistics
and whitespace/content boundaries, verify staged blobs against the current
files, commit, then compare the committed path set with the allocation.

Before push: verify all six commits, final range allocation, source-byte
preservation, whitespace and a clean index/worktree; recheck remote main and use
a normal fast-forward push only. After push, compare the remote tip with local
HEAD. Record observed results; do not infer hosted/owner acceptance from Git or
CI.

## Execution record

The first five commits were created sequentially and their parent hashes,
subjects and raw path sets were verified immediately after each commit:

| Commit | Hash | Complete paths | Subject |
| --- | --- | --- | --- |
| 1 | `8a59833` | 28 | CL-209-213: optimize local speech and source-cut preparation |
| 2 | `409e583` | 20 | CL-210-214: reconcile Find all and expand local manual admission |
| 3 | `c35da78` | 5 | CL-212: align preview camera crops with presented frames |
| 4 | `494def1` | 10 | CL-214-215: expand timestamp imports and jump to manual endpoints |
| 5 | `0e95908` | 24 | CL-216-217: follow speakers locally and improve Motion controls |
| 6 | This record's commit | 11 | CL-209-217: record verification and file-level commit plan |

The initial index was empty. Allocation covered exactly 98 paths with no missing,
extra or duplicate assignments. All selected paths were UTF-8 text, without
symlinks, ignored files or credential signatures. The three broad private-path
scan matches were already in HEAD: two keyboard-navigation false positives and
an existing generic operation-template path. No private content was added by
packaging. The existing attributes normalize repository text to LF.

All five staged file sets and committed file sets match the plan. Every staged
blob matched its current file through Git's normal text conversion; staged
whitespace checks passed. Git recognizes the tracker move as a rename, so its
display says 23 files for commit 5 while its allocation contains 24 old/new paths.
The six-commit raw-path allocation intentionally counts both ends of that move.

After commit 5, raw hashes still matched the original inventory for production,
tests, benchmarks and all other original paths except the two documented
Git-handoff notices in the source of truth and ticket index. Only the eleven
allocated documentation paths remained pending, including this new plan.

The final documentation commit closes the recorded allocation. Its staged and
final-range checks, clean-worktree check, normal push and remote-tip comparison
are performed after this record is written. Push confirmation and the final hash
are reported in the final handoff; this file does not preclaim the remote result.
CI and owner review remain separate from these packaging checks.
