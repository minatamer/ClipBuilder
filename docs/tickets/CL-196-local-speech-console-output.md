# CL-196 — File-backed local transcription must survive verbose console output

Status: Implemented and locally validated, 2026-11-02; explicit owner real retry
pending. Owner started an eight-minute Find all calibration, then reported a
0/1 partial-results failure. No agent retry of real ASR or Codex inference.

## Confirmed evidence

Native inspection/audio extraction succeeded. Local transcription failed after
403,885 ms with native_stdout_limit (the generic 65,536-byte capture ceiling),
not a time limit. The Whisper invocation writes the actual transcript to its
fixed JSON file, but its word-level console output was unnecessarily captured.
No Codex inference was dispatched. The rounded, account-wide weekly meter was
12% before and after; that meter alone cannot attribute usage to this app.
The overall request returned partial coverage with zero completed sections,
while transient progress still displayed running transcription. The review
status also contains an invalid replacement character and calls this Partial
results even though no section completed.

## Requirements and allocation

- Add an explicit ignored-stdout mode to renderer media/process-runner.ts.
  File-backed Whisper uses it; ordinary stdout capture stays bounded and all
  existing acquisition progress, stderr-tail, exit/error/abort/reaping behavior
  remains. Do not enlarge an unbounded transcript console buffer, weaken actual
  JSON/word/media admission, change models/timestamps or capture/log real text.
- codex-media.ts retains the same local ASR job, model, flags and bounded JSON
  file checks. Verify a noisy synthetic child can write its JSON result and
  finish rather than be killed at 64 KiB. Actual CPU speed/ASR quality remains
  owner acceptance; tests use synthetic/fake/no-key/paid-off/network guards.
- Backend codex-ai.ts settles a native-input failure's active progress step as
  failed/canceled; pending selection stays unexecuted. Verify zero inference
  calls, cleanup and no implicit retry.
- Selection review distinguishes failed zero-section work from useful partial
  results and cancellation, removing the malformed separator. Use one small
  analysis-coverage-status component in the same frontend feature and focused
  rendering tests; preserve the existing Add clips explicit retry/footer flow.
- Tests: process-runner.test.ts, local/codex-media.test.ts, codex-ai.test.ts,
  codex-speech/acquisition-liveness regression tests, and the new status test.
  Keep unrelated CL-185/194/195 work and shared prior runner changes intact.
- Update this ticket/index, source of truth and local workflow. Rebuild/reload
  only the owned backend/internal worker after checks; preserve frontend,
  acknowledged recovery, saved 144p/1080p sources, exports, logs and config.
  No automatic retry, model/inference/download run, staging/commit/push or cloud.

## Implemented and verified

The process runner can discard stdout directly at spawn. Only file-backed local
Whisper opts in; its model, invocation flags, word clocks and bounded JSON result
remain unchanged. A synthetic Node speech child emits approximately 2.8 MB of
console text while writing the expected transcript JSON. Both the runner and
the native-input route complete without retaining that console text. Native
nonzero exit, cancellation, ordinary capture and acquisition liveness remain
covered. Backend native-input failures settle running steps while leaving
unexecuted selection pending. The review status now distinguishes failure,
cancellation and retained partial work, without the invalid separator.

Final fake/no-key/paid-off checks:

- `corepack pnpm exec vitest run --config scripts/local-test.config.ts apps/backend/local/codex-ai.test.ts apps/renderer/local/codex-media.test.ts apps/renderer/local/codex-speech.test.ts apps/renderer/local/acquisition-liveness.test.ts --maxWorkers=1`: 38 tests pass.
- `corepack pnpm --filter @clipbuilder/renderer exec vitest run src/media/process-runner.test.ts --maxWorkers=1`: 5 tests pass.
- `corepack pnpm --filter @clipbuilder/frontend exec vitest run src/features/local-editing/analysis-coverage-status.test.tsx src/features/local-editing/runtime-capabilities.test.tsx --maxWorkers=1`: 12 tests pass.
- No-emit TypeScript checks pass for `tsconfig.local.json`, renderer and frontend.
  Scoped ESLint, Prettier and `git diff --check` pass.

One synthetic faststart liveness fixture needed a two-second startup allowance
on this slow Windows device instead of 600 ms; its three-second sequence still
exceeds that idle allowance and proves advancing work survives. Production
limits were not changed by that fixture adjustment. The initial validation also
found that marking a pending step on native failure could incorrectly mark
selection failed; only running steps are now settled, with an already-failed
native progress regression. Final read-only validation of this ticket's settled
unstaged/untracked changes: Meets ticket; no actionable findings. Existing
CL-185/194/195 changes were preserved and excluded from this verdict.

## Normal worker reload and recovery

After the checks, verified and stopped the old backend supervisor/descendant
tree, confirmed its ports clear, then launched the normal hidden backend with
the process-local Codex provider selection. Canonical startup rebuilt its
current-source internal worker/overlay. The existing frontend stayed running;
configuration and saved media were not read or changed. Verified listeners:
frontend PID 18732 / 3000, backend PID 3792 / 4000, worker PID 23328 / 4200;
backend supervisor PID 20212. Health, `/start` and `/api/sample/config` returned
200. Capabilities report Codex ready. Recovery retained the 1080p source and
the original 0–480,000 ms Find all inputs plus the failed result.

Content-safe runtime ownership record and separate logs remain outside Git:
`C:\Users\minat\AppData\Local\Temp\clipbuilder-app-run-55dd964223934f0fa8cdf865f24ef253\runtime.json`,
`backend-cl196.stdout.log` and `backend-cl196.stderr.log` in that same directory.
The completed read-only monitoring helper is no longer running. No redownload,
real transcription, model download, inference, staging/commit/push or cloud
action was performed for this repair.

Remaining owner-only checks: explicitly retry the same eight-minute Find all,
confirm real local ASR completes and assess subsequent Codex moment quality and
allowance usage. Synthetic output proves the repaired process/file boundary,
not real speech quality, device throughput or full two-hour processing.

## Local Git authorization — 2026-11-03

The owner now authorizes whole-file planning, staging and ticket-prefixed local
commits under the [file-level commit plan](../operations/CL185_196_COMMIT_PLAN.md).
The earlier no-Git repair scope is superseded for this handoff. The shared runner
prerequisite is allocated to CL-194; this commit connects file-backed speech and
the failed-analysis progress/status paths. No new processing, restart or push
is part of this Git task. The owner deferred the explicit real eight-minute
retry to their next testing session; it remains unverified.
