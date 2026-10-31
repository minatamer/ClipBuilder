# CL-168 — local Codex performance and measured preparation progress

Status: complete locally; fake/static/browser/native checks and read-only
validation pass. Owner real before/after performance/quality acceptance is open.
Dependencies: CL-135, CL-150, CL-152–167 implemented; initial worktree clean.

## Owner request and diagnosis

Investigate the seven-minute manual-clip wait; add content-free stage timings,
improve unnecessary/sequential local Codex work, and show small stage subtitles
with running spinners and brand-blue completion ticks beneath the preparation
title. This is local Codex only; Gemini keeps its current behavior.

Existing safe runtime records show one speech-input job took 453565 ms and its
manual analysis took 453647 ms. It completed before any selection/planning
inference. Code currently transcribes/diarizes the entire source even for a
manual-only range, then runs diarization and Whisper sequentially. No evidence
yet separates their individual real costs. Frame sampling also starts one
bounded FFmpeg process per temporal panel; do not claim that caused this wait.

## Plan and acceptance

1. Add an optional Codex-only cut-transcription port. Manual-only analysis uses
   the smallest continuous source window covering its ranges when it fits the
   existing five-minute native cut bound (far-apart rows keep full-source work);
   one selected minute processes that minute, preserving source-relative words, clip-relative
   cues and anonymous speaker consistency across multiple selected ranges.
   AI suggestions still require the full source. Persist explicit partial
   transcript coverage through analysis, saved drafts and automatic recovery;
   never reuse partial words as a full-source transcript. Reuse a verified full
   transcript or a partial transcript covering the requested manual window.
   Empty manual-only input dispatches nothing. Legacy analyses remain readable.
2. Share the extracted WAV between independent ASR/diarization. On machines with
   at least six available CPU threads, run their existing four/two-thread native
   jobs concurrently; otherwise preserve sequential execution. Keep one media
   job, bounded native concurrency, existing models/quality/timeouts and no
   inference retries. On either failure/cancellation, abort and reap the sibling
   before deleting scratch. Do not parallelize provider calls or enlarge frame,
   image, storage or provider budgets.
3. Extend existing authenticated worker progress polling with bounded Codex
   snapshots. Measure inspection, audio extraction, transcription, speakers,
   frames, inference and image retrieval at their real boundaries. Emit only
   fixed operation names, outcomes, durations and existing opaque correlations;
   no words, media paths, prompts, native output, source clocks or credentials.
   Diagnostic failures cannot change processing. Keep GET polling read-only,
   bounded, abortable and isolated by the existing workspace/session bridge.
4. Show observed stages directly beneath the existing preparation title for
   local Codex analysis and clip planning. Running stages spin; completed stages
   get brand-blue ticks; pending/failed/canceled are truthful. Use shared
   ProcessingState/tokens, compact responsive geometry and existing footer
   actions. No estimated progress, simulated completions, provider counters or
   Gemini changes. Include later picture/preview states from existing clip data.
5. Fake/injected regressions cover manual/full-source/partial-cache/restore
   clocks and exact dispatch counts; CPU-bound concurrency ordering, sibling
   failure/cancel cleanup; authenticated progress and diagnostic redaction;
   synthetic browser desktop/phone stages, ticks/spinners and footer visibility.
   Run focused tests, relevant types/lint/format and current-source native/browser
   proof, then read-only validate. Rebuild/reload normal backend/worker only
   while owner work is idle, preserving frontend/config/media/recovery.

## Whole-file allocation

- Contracts: selection.ts (coverage), new codex-progress.ts (bounded snapshots),
  diagnostics.ts (fixed timing names), focused contract tests.
- Backend: analysis.ts/tests (scoped port/cache), codex-ai.ts/tests (source clocks,
  measured stages), new codex-progress.ts (transient progress), server.ts and
  worker-port.ts/tests (authenticated progress and restore coverage).
- Renderer: codex-media.ts/tests (measured extraction/ASR/speakers/frames and
  bounded concurrency), server.ts (progress transport and safe timing sink).
- Frontend: ProcessingState/CSS (subtitle slot), new Codex progress view/poller,
  selection-panel.tsx, clip-batch-panel.tsx, bridge allowlist if required.
- Proofs/docs: focused synthetic integration/native/browser proof, this ticket,
  index, source of truth and LOCAL_CODEX_AI architecture.

## Gates and remaining acceptance

All agent checks are synthetic/fake/paid-off/network-blocked and load no ignored
environment. Real ASR/diarization/Codex processing and real before/after timing
remain the owner's explicit manual action. Local CPU assets are already installed;
fake tests inject their outputs without keys or models. Real Codex requires those
tools, saved ChatGPT sign-in/allowance, enabled local gates and owner action; no
Gemini/API-key fallback. No configuration change, provider spend, downloads,
cloud, deployment, staging or commits. Preserve existing owner work and private
logs. No claimed universal runtime or live quality improvement from fake timings.

## Implementation and evidence — 2026-10-31

- Manual-only Codex uses one bounded continuous cut instead of unconditional
  full-source speech work. Cut words move to the source clock once; normal moment
  clipping produces local cues. Multiple nearby rows share speaker labeling;
  far-apart rows keep the existing full-source path. Full-cache reuse, covered
  partial reuse, uncovered-window invalidation, full-source discovery after
  partial restore and zero work for empty manual input are verified.
- Optional `transcriptCut` survives canonical analysis parsing, draft storage and
  automatic recovery. Both restore paths seed the cache with that coverage.
  Old saved full-source analyses keep their meaning. Existing full-source results
  can be reused immediately; this ticket does not discard acknowledged work.
- Native speech consumers share the extracted WAV. A fixed CPU-availability gate
  permits only the existing four/two-thread pair to overlap. Sequential fallback,
  simultaneous admission, failure/caller abort, primary-error preservation and
  waiting for the sibling before cleanup pass injected regressions. No models,
  quality, timeouts, selection/planning call counts or media/image limits changed.
- Authenticated worker polling carries bounded observed stages; completed native
  receipts retain exact durations across missed polls. Local workspace progress
  rejects missing authentication and other workspaces; hosted does not expose it.
  Native/backend timing records use fixed schemas and never serialize private
  native output, paths, model values or arbitrary errors. Picture timing is
  separate; existing clip-preview/clip records cover native preview/export.
- Actual selection and clip controls show running stages. The isolated visual
  proof inspects blue ticks, spinner animation, pending states, unmount polling
  cleanup and footer/width bounds at 1440×900, 390×844 and 320×568. Synthetic
  screenshots were visually reviewed; proof fixture now uses the normal global
  border-box rule and waits for painting after resize. No owner-media screenshot
  was captured. Gemini has neither scoped transcription nor this checklist.

Checks (installed cached pinned pnpm 11.19.0; no package installation):

- `pnpm exec vitest run --config scripts/local-test.config.ts` with exactly
  `apps/backend/local/analysis.test.ts`, `codex-ai.test.ts`,
  `codex-progress.test.ts`, `session-recovery.test.ts`, `diagnostics.test.ts`,
  `apps/renderer/local/codex-media.test.ts`, `codex-speech.test.ts`,
  `packages/contracts/local/codex.test.ts`, `test/owner-worker-progress.test.ts`:
  **95 tests / nine files pass**. No real speech model or provider was invoked.
- `pnpm exec vitest run --config scripts/local-proof.config.ts
  test/local-codex-progress.proof.ts test/local-codex.proof.ts`: two cases pass
  together in 79.87s. Current-source native worker/overlay, actual Player/controls,
  authenticated stage progression, exact injected calls, native export, edits,
  saved restore and automatic recovery pass. Explicit synthetic model delays
  permit observing progress; these timings are not a performance benchmark.
- Final compact UI proof rerun passes in 3.49s after fixture paint stabilization.
- `pnpm local:typecheck`, frontend package `typecheck`, root-test
  `tsc --noEmit -p tsconfig.tests.json`, scoped ESLint, scoped Prettier and
  `pnpm build:contracts` pass. `git diff --check` passes. Source and contract
  dependency directions, receipt/artifact bounds, diagnostics, compatibility and
  listener/process/timer/URL/scratch cleanup were reviewed.

Read-only validate: **Meets ticket locally; no actionable findings**. Reviewed
only this CL-168 worktree; initial index/worktree were clean. Fixed a transient
development regression that enlarged the unrelated acquisition progress sample
bound; its original 128-byte bound and cancellation tests now pass. Native
sibling aborts are classified using their actual combined signal. No automatic
provider retry, reduced-motion suppression, configuration or hosted change.

Verification environment deviation: Windows sandbox Vitest workers could not
read their temporary transform cache. Focused tests/proofs ran outside the
sandbox with the same hardcoded fake/paid-off/credential-clearing/network-blocked
setup. No safety switch or owner configuration was changed. ESLint initially
reported an ignored CSS file; final lint targets TypeScript, with CSS checked by
Prettier/browser proof.

## Normal runtime refresh

Verified the completed owner operation and idle batch, captured all eight owned
backend/watcher/worker identities, stopped that tree and verified stabilization
with no survivors/orphans or 4000/4200 listeners. Frontend PID 4968 on 3000 was
preserved, alongside saved/recovery/retained media and private logs. Normal
backend startup rebuilt current-source worker/overlay with owner-managed config.
New supervisor 23840, API PID 22660/4000 and internal worker PID 10880/4200 belong
to the verified replacement tree. Health, `/start` and `/api/sample/config`
return 200. No analysis/render request was made by the agent.

Content-free process record and logs outside Git:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl168-app-a8015ec40f6a478b861c5bbd28a28791\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl168-app-a8015ec40f6a478b861c5bbd28a28791\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl168-app-a8015ec40f6a478b861c5bbd28a28791\backend.stderr.log`
- Native stage timings: `C:\Users\minat\AppData\Local\Temp\clipbuilder-local-runtime-CSSzs7\worker.stderr.log`

Real stage-by-stage before/after timing, ASR/anonymous speaker/camera quality and
physical-device listening remain owner-manual. Hosted/release/cloud acceptance
is outside this ticket. No provider calls, downloads, Git staging/commits, push
or deployment. Changed files remain available for owner review.
