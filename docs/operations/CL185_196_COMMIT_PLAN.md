# CL-185 / CL-194–196 — File-level local commit plan

Owner authorization: 2026-11-03, “commit plan file level, multiple, ticket prefix,
stage and commit.” This supersedes the packets' earlier unstaged/uncommitted
handoff notes for these pending changes. Local staging/commits only; no push.
Real processing acceptance remains pending for the owner's next testing session.

Every changed/untracked repository file is allocated once below. Stage complete
files in order, inspect each staged diff, then commit with its ticket prefix.
Preserve ignored configuration, saved sources/drafts/exports, private diagnostics
and the running app. No real download, ASR, inference, cloud operation or restart
is part of this Git task.

Shared-file allocation: the complete process runner and its tests go in CL-194,
including the explicit ignored-stdout option needed by CL-196. The acquisition
liveness fixture's slow-device startup allowance goes there too. The complete
acquisition panel goes in CL-195, retaining CL-194's actionable timeout/stall
messages. Shared source-of-truth/workflow/index updates go in the final docs
commit. No partial staging or temporary source rewrites are needed.

## 1. CL-185: admit trusted capacity metadata during local startup

- `scripts/local-discovery.mjs`
- `test/owner-discovery.test.ts`
- `docs/tickets/CL-185-local-codex-capacity-policy.md`
- `docs/operations/CL184_193_EXECUTION.md`

## 2. CL-194: keep progressing source acquisition and inspection alive

- `apps/backend/local/acquisition-egress.test.ts`
- `apps/backend/local/acquisition-egress.ts`
- `apps/backend/local/acquisition-process.test.ts`
- `apps/backend/local/acquisition-process.ts`
- `apps/backend/local/runtime.ts`
- `apps/backend/local/section-clock.test.ts`
- `apps/backend/local/worker-port.ts`
- `apps/backend/local/youtube-formats.test.ts`
- `apps/backend/local/youtube-formats.ts`
- `apps/backend/local/yt-dlp-acquisition.test.ts`
- `apps/backend/local/yt-dlp-acquisition.ts`
- `apps/frontend/src/server/local-ai-request.test.ts`
- `apps/frontend/src/server/local-ai-request.ts`
- `apps/frontend/src/server/local-workflow.test.ts`
- `apps/frontend/src/server/local-workflow.ts`
- `apps/renderer/local/acquisition-audio.test.ts`
- `apps/renderer/local/acquisition-audio.ts`
- `apps/renderer/local/acquisition-liveness.test.ts`
- `apps/renderer/local/acquisition-media.ts`
- `apps/renderer/local/media.ts`
- `apps/renderer/local/server.ts`
- `apps/renderer/src/media/inspection.ts`
- `apps/renderer/src/media/process-runner.test.ts`
- `apps/renderer/src/media/process-runner.ts`
- `packages/contracts/local/acquisition-profile.ts`
- `packages/contracts/local/acquisition.ts`
- `packages/contracts/local/diagnostics.ts`
- `test/owner-acquisition.proof.ts`
- `test/owner-worker-progress.test.ts`
- `docs/operations/LOCAL_CODEX_CAPACITY.md`
- `docs/tickets/CL-194-progress-aware-youtube-acquisition.md`

## 3. CL-195: simplify audio selection and expose other video qualities

- `apps/backend/local/source-acquisition.test.ts`
- `apps/frontend/src/features/local-editing/acquisition-panel.tsx`
- `apps/frontend/src/features/local-editing/resolution-choices.test.ts`
- `apps/frontend/src/features/local-editing/resolution-choices.ts`
- `apps/frontend/src/features/local-editing/style.css`
- `test/local-intake-preview.proof.ts`
- `docs/tickets/CL-195-simplify-youtube-quality-selection.md`

## 4. CL-196: preserve file-backed speech output and settle failed analysis

- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`
- `apps/frontend/src/features/local-editing/analysis-coverage-status.test.tsx`
- `apps/frontend/src/features/local-editing/analysis-coverage-status.tsx`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `docs/tickets/CL-196-local-speech-console-output.md`

## 5. CL-194-196: record repair verification and file-level commit plan

- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/LOCAL_WORKFLOW.md`
- `docs/tickets/README.md`
- `docs/operations/CL185_196_COMMIT_PLAN.md`

## Validation and remaining acceptance

CL-185: 14 focused fake discovery/capacity cases and scoped types/lint pass.
CL-194: 197 focused fake cases and the current-source native acquisition proof
pass; the later saved-source transport repair has 44 targeted fake checks.
The authorized 144p acquisition reached saved/ready. CL-195: 17 frontend cases,
one fake retained-quality case and the generated desktop/phone browser proof
pass. CL-196: 55 focused fake checks, local/renderer/frontend no-emit types and
scoped lint/format pass; the normal worker was rebuilt/reloaded and recovery
confirmed the saved 1080p source and eight-minute Find all inputs. Each packet's
final read-only validation reports no actionable findings within its scope.
These checks use synthetic/fake/no-key/paid-off composition; they do not prove
real speech/editorial/face quality or hosted/Linux release readiness.

For this commit task, recheck allocation against Git status, staged file lists,
whitespace and documentation formatting. Reuse the recorded checks because no
production/test code is changed. Do not rerun processing to make a Git commit.
Owner's explicit eight-minute real ASR/Codex retry, resulting moment quality and
usage measurement remain unverified. The previous failed attempt dispatched
zero Codex inference calls; the rounded weekly meter stayed at 12%.

## Execution record — 2026-11-03

The four implementation commits were created locally in the planned order:

- `31f9090` — CL-185, four complete files.
- `ee2ded4` — CL-194, 31 complete files.
- `df9a68f` — CL-195, seven complete files.
- `83169a3` — CL-196, eight complete files.

The allocation matched all 54 pending files exactly, with no duplicates or
unallocated files. Each implementation commit's staged scope and whitespace
checks passed. Documentation formatting passes. No production/test code changed
during this Git task; the recorded tests were reused. The final documentation
commit owns this plan and the three shared owning documents listed above.
No push, processing, download, configuration change or app restart was run.
