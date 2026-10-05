# CL-007 — Temporary local sample replay and decoded thumbnails

Status: implementation and automated validation complete, 2026-10-05;
owner real-sample thumbnail/paid-assembly retest pending.
Depends on: completed CL-007 analysis, CL-016 retained preview, CL-009 assembly
and CL-010 review integration. Preserve all unrelated work and all diagnostics.

The owner requests saving the latest successful transcript/three candidates
privately, adding **Simulate find moments for sample** beside Use sample,
immediately displaying those choices without repeating Transcribe/selection,
and fixing thumbnail failures before/after choosing a moment. This packet
overrides the no-replay rule only for this explicit, temporary owner-local sample
test. No arbitrary source, hosted feature, production fallback, provider retry,
new deployment or Git action is authorized.

Authority: source-of-truth owner local sample replay decision; root privacy/
paid/manual-test rules; existing analysis/assembly signed-session boundaries.

## Plan and acceptance

1. Copy only validated analysis from the latest successful private capture to
   an owner-local OS-temp file outside Git. Preserve the original capture.
   Bind the cache to this workspace and the current pinned retained sample;
   validate bounded contracts, require exactly three candidates, and expire
   activation after six hours. No credentials, receipts or capabilities enter
   this file. Do not include real content in tests/docs/builds/public assets.
2. Explicit development/local/live composition exposes cache availability and
   bounded saved options through the existing protected same-origin transport.
   Fake/test/preview/production composition cannot read or activate the cache.
   Cache expiry, corruption, revision or retained-source mismatch fail closed.
   The CTA is absent unless this local capability is available and is explicitly
   labelled as saved analysis; it is absent from deployed/production composition.
3. Clicking the CTA opens the retained source and immediately presents cached
   choices/transcript through the existing workflow/journal. It dispatches zero
   Transcribe, selection, renderer or storage jobs. Persist the replay marker
   within the normal expiring browser workspace and preserve Clear/exit behavior.
4. On manual Proceed, prepare a fresh normal grant and disposable sample copy,
   inspect/bind the source, admit the candidate-analysis action using the normal
   challenge and sign the saved result in the current epoch. Do not reuse old
   receipts or weaken normal assembly verification. Then execute the ordinary
   selected assembly/preview path. Analysis AI calls are zero; cloud preparation
   still occurs. Old/uncertain/replayed actions cannot silently retry. No agent
   performs this paid/cloud processing test; the owner triggers it manually.
5. Gallery currently opens three native videos against a two-stream retained
   reader, retaining eager loads. Decode source frames serially, copy each frame
   to an in-memory canvas, release the decoder and reuse the frame in the side
   rail. Keep one selected player, candidate-start timing, cached metadata,
   loading/failure states, bounded queues and listener/source/frame cleanup.
   No server thumbnail job, stored real-media fixture, or cloud cap bypass.
6. Preserve full private provider output capture and existing diagnostics. Add
   content-free replay/thumbnail-stream failure details where needed. Verify
   fake exact zero analysis calls, normal downstream boundaries, hosted absence,
   cache/source/expiry/revision failures, browser refresh/clear and queue cleanup.
   Run focused checks then format, lint, typecheck, unit and build root gates;
   validate the settled packet and reload local services with verified ownership.

## Evidence and remaining gates

Private save completed: 1,168 words and three candidates, successful request
HTTP 200, current retained byte count matched, original capture unchanged.
Activation expires 2026-10-06 00:20:15 UTC (03:20:15 Cairo). The file is in
OS-temp `clipbuilder-runtime/private-sample-replay/sample.json`; its values are
excluded from Git, tests, ordinary logs and documentation.

`FAKE_MODE=true` with no keys verifies synthetic replay orchestration and frame
loading only. Real sample playback requires existing ADC/storage approval;
manual Proceed additionally requires existing provider keys, live assembly and
rights/transfer/spend approvals. No local AI model or weights are introduced.
Real provider output quality, framing/cards/captions/preview and final rendering
remain owner-only checks. Final rendering stays disabled at the assembly stage.

## Implementation and changed files

- Backend `analysis/sample-replay.ts` reads the one private cache only during
  explicit approved local development composition. It checks workspace, pinned
  sample identity/bytes, six-hour activation and exactly three candidates.
  `sample-replay.test.ts` covers excluded compositions and invalid metadata.
- `analysis.composition.ts`, `analysis.usecase.ts` and `http/routes/analysis.route.ts`
  expose saved options without processing, then use normal grant, challenge,
  disposable copy, inspection, admission and signed receipt on manual Proceed.
  Only this retained sample can use the replay path. Existing provider calls,
  reconciliation, cleanup and receipt verification remain the normal path.
  `analysis.test.ts` verifies zero analysis calls, fresh receipts, changed source
  rejection, one-use fencing and absent routes without an injected local cache.
- Backend `app.ts` exposes the optional local capability and correlates replay
  and retained-video requests. `analysis.diagnostics.ts` adds safe word/candidate
  counts and exact zero transcription/selection calls; retained stream failures
  now carry their normal request ID, phase/code and HTTP status. Full private
  provider captures remain, including `replayed_analysis` on fresh binding.
- Contracts `api.schema.ts` and `grounded-analysis.schema.ts` own the optional
  availability field and strict generation/revision/challenge request. Existing
  analysis/result contracts are reused; clients cannot upload replacement data.
- Frontend `source-analysis/sample-replay.flow.ts`, its test and
  `source-analysis.api.ts` display saved analysis immediately and defer protected
  cloud preparation until manual Proceed. `media/browser.workspace.ts`, its test
  and `workspace.schema.ts` retain the expiring marker, selection and cleanup.
  Pending/uncertain refresh never automatically dispatches. A synthetic check
  verifies normal assembly and reducer completion after a fresh source revision.
- `sample/sample.experience.tsx` adds the requested CTA beside Use sample and
  labels saved analysis. `app/api/analysis/[action]/route.ts` and its test deny
  both replay endpoints outside development before any upstream work. Backend
  fake/test/preview/production composition cannot read the private cache.
- `sample/use-moment-thumbnails.ts`, `moment-thumbnail.ts`, its test,
  `candidate.review.tsx`, its test and `sample.test.tsx` replace simultaneous
  thumbnail videos with a sequential decoder and bounded in-memory canvases.
  The side rail reuses those frames; one selected player remains. Abort, timeout,
  source replacement and unmount release timers/listeners/video/canvas memory.
- Root `AGENTS.md`, the source of truth, frontend/backend service guides and
  ticket index record this narrow owner exception. No renderer implementation,
  cloud resource, deployment, credential, operating switch or Git action changed
  in this packet. Unrelated earlier work is preserved.

## Final verification and scoped validation

All required commands pass on the settled implementation:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

The full deterministic suite passes **1,013 tests in 86 files**. All checks use
synthetic data; provider dispatch assertions cover exact zero analysis calls.
The production build passes its release-artifact check. An old assertion for
three gallery videos was corrected to three canvases/one selected player.
No paid or real-cloud E2E test was performed.

Synthetic browser proof used the actual CandidateReview against an owner-local
HTTP range server capped at two concurrent reads. All three canvases became
ready; different start times showed different decoded colors. Both side-rail
frames remained ready with one selected player, including rapid selection after
remount. The new path produced **zero capacity rejections**; the legacy parallel
decoder reproduced **two** rejections. Reader concurrency never exceeded two.
Both temporary tabs, server PID 16324 and its console helper were stopped;
port 4317 and its temporary synthetic assets are cleared. Content-free evidence:
OS-temp `clipbuilder-runtime/sample-replay-check-20261005/verification.json`.
The earlier restricted FFmpeg fixture attempt could not decode rawvideo; the
browser generated a synthetic WebM instead. No tool download or real media was
used to work around that fixture limitation.

Scoped validate pass: **Meets ticket; no actionable findings**. Reviewed the
current unstaged packet files and relevant untracked modules/tests; staged scope
is empty. Earlier transcription/model, renderer, security and UI work outside
this packet is excluded. Covered: private save, local/hosted gates, zero-analysis
display, protected downstream binding, selection/refresh/clear fencing,
serialized frame loading, diagnostics preservation and dependency direction.
Real sample/provider quality remains unverified by these synthetic checks.

Local watcher reload verified: backend supervisor 11188 owns API PID 10812 on
127.0.0.1:4000; frontend PID 20712 remains on 127.0.0.1:3000. No previously
recorded backend identity remains outside that watcher tree. Health, `/start`
and `/api/sample/config` return 200; replay/analysis/assembly are enabled and
final rendering is disabled. The actual intake CTA was observed in the browser
without clicking it. Contracts were rebuilt and generated Next development type
references restored after production build.

Content-free runtime records/logs remain outside Git:

```text
OS-temp/clipbuilder-runtime/restart-backend-assembly-20261005-180915/backend.runtime.json
OS-temp/clipbuilder-runtime/restart-backend-assembly-20261005-180915/backend.stdout.log
OS-temp/clipbuilder-runtime/restart-backend-assembly-20261005-180915/backend.stderr.log
OS-temp/clipbuilder-runtime/run-20261005-120045/frontend.runtime.json
OS-temp/clipbuilder-runtime/run-20261005-120045/frontend.stdout.log
OS-temp/clipbuilder-runtime/run-20261005-120045/frontend.stderr.log
```

## Owner retest and remaining gates

Exit the previous workflow, refresh `http://localhost:3000/start`, click
**Simulate find moments for sample**, and inspect the three thumbnails/choices.
Choose one, then manually Proceed to test ordinary paid assembly/preview. No
Transcribe or Flash candidate-selection request is sent by this path. Fresh
sample-copy/inspection and downstream assembly still require the existing ADC,
keys, live flags and rights/transfer/spend approvals and can consume credits.

Still unchecked: real retained-source thumbnail loading on the owner's browser,
real framing/visual/caption/provider quality, private assembly/preview success,
and final render/download. Owner rights and configured credentials are not
independently audited. No local AI runtime/weights are introduced. Original full
provider captures and the saved transcript/choices are preserved privately; the
existing full-output capture permit remains independent and expires at
2026-10-05 20:06:58 UTC (23:06:58 Cairo). Replay activation ends at the time above;
expiry does not erase the owner-private saved analysis.
