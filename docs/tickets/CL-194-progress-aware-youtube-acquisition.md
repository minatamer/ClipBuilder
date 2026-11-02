# CL-194 — Keep active local Codex acquisition alive and detect genuine stalls

Status: Complete for the authorized local fix and full 144p acceptance, 2026-11-02. Owner reports a
failed full long-video download and explicitly authorizes reasoned retries until
success, always at 144p to conserve internet quota. Diagnose/fix before each
attempt; no transcription, Codex/Gemini inference, higher-resolution test or
provider spend is authorized. Preserve existing startup follow-up changes,
configuration, retained sources/drafts/exports and private logs. No new Git
mutation or deployment is part of this request.

## Confirmed failure

Content-free normal logs show transfer completed, then prepare-acquisition was
canceled after 600,527 ms. That stage remuxes the master and fully decodes it for
media validation. A two-hour source at 1080p/VP9 can exceed the fixed ten-minute
worker deadline. The RPC also has an eleven-minute deadline. The adapter still
has a two-hour outer transfer timer despite a quota-free inner Codex process,
and its broker still counts against the bounded ten-GiB wire budget.
Do not treat a successful small/low-resolution download as proof of high-quality
long-video performance, or remove safety/media validation to make it pass.

## Changes and acceptance

- Local Codex acquisition only: replace total transfer/preparation deadlines
  with actual advancing byte/frame/media-time or output-write liveness. Keep
  explicit cancel, real idle detection, bounded metadata/probes/records,
  controlled concurrency, disk reserve, decoder/codec checks and owned cleanup.
  Repeated status lines/unchanged counters do not count as forward progress.
- Keep Gemini/hosted budgets unchanged; private trusted composition chooses the
  behavior, never browser/job/draft flags. Retain full decode validation and
  source quality. No automatic retry, format downgrade or whole-source fallback.
- Preserve safe distinctions between timeout, stall, cancel and native failure
  in diagnostics/actionable existing error slots. No media/title/URL/auth data
  in ordinary logs, tests or committed evidence.
- Test active work past historical deadlines, silent/frozen/spam progress,
  streamed output bounds, cancellation/process cleanup, metadata timeout,
  profile isolation, capacity and malformed input using synthetic/fake/no-key
  checks. Validate and rebuild/reload the owned worker before the real attempt.
- Use the owner-designated URL already recorded in CL-189. Query the actual
  offered 144p choice and bytes first. Run one explicit app acquisition at a
  time, recording aggregate transferred bytes/stages and success/failure only.
  Further attempts need a concrete diagnosis/fix and should reuse any safely
  retained completed source rather than redownload. Stop after ready success.
- The owner tests ASR/editorial/face quality later. API-free acquisition/native
  validation is not an AI test. Real Codex later needs local speech assets,
  ChatGPT login/allowance and normal live gates; Gemini remains excluded.

## Initial allocation

`scripts/local-discovery.mjs`, its tests and CL-185 documentation are unrelated
pre-existing unstaged startup fixes and must be preserved. This packet owns
`packages/contracts/local/acquisition-profile.ts`,
`packages/contracts/local/acquisition.ts`,
`apps/backend/local/yt-dlp-acquisition.ts`,
`apps/backend/local/acquisition-process.ts`,
`apps/backend/local/acquisition-egress.ts`,
`apps/backend/local/worker-port.ts`, `apps/backend/local/runtime.ts`,
`apps/renderer/local/server.ts`, `apps/renderer/local/acquisition-media.ts`,
`apps/renderer/local/media.ts`,
`apps/renderer/src/media/process-runner.ts`, focused existing/new tests,
`apps/frontend/src/features/local-editing/acquisition-panel.tsx`, the narrow
source-of-truth/workflow documentation, this ticket and the index. Refine exact
allocation from the settled diff. No ignored configuration or owner media is
an ordinary test input.

## Descriptor follow-up from first 144p attempt

One authorized 144p transfer completed (112,489,753 component bytes), then native
preparation rejected `acquisition_selection_changed`. Its selected HE-AAC
representation advertises a 22,050-Hz core rate; the old assertion accepts only
exactly that decoded rate. HE-AAC SBR may output twice the core rate. Add an
explicit HE-AAC marker derived solely from the frozen offered codec, require the
actual native HE-AAC profile, and admit only the exact or doubled rate within the
existing 48-kHz ceiling. Keep AAC-LC/Opus binding exact, channels/codecs unchanged,
stream-copy/full decode intact, and legacy descriptors readable. Tests reject
wrong profiles, unsignaled doubling, channel drift and other rate changes.
This is a source compatibility fix; no resampling or silent quality substitution.
Further real acquisition waits for these checks and a rebuilt worker. Preserve
only owned temporary debug copies during the retry to diagnose any later failure
without another transfer; remove those copies after success, keeping the saved
master. Never use real media in the automated synthetic suite.

The second full 144p transfer hit the separate duration check before merge.
A capped authenticated header-only probe confirmed the HE-AAC decoded rate and
roughly 125-ms audio/video end difference. Replace only the HE-AAC 100-ms timing
ceiling with two output audio packets plus one video frame (at least the previous
100 ms), checking the actual decoded rate. Larger drift remains rejected; no
trim, resampling, missing-tail acceptance or re-encoding is introduced. Both
component admission and final master inspection share this rule. The initial
private copy monitor missed the second attempt because a contracts build caused
a development-watcher restart and changed scratch roots. Finish builds before
startup and bind the next monitor to the current verified worker runtime.

## Settled local verification

- Final fake/no-key/paid-off/network-blocked gate: 197 tests in 14 files pass.
  Covers real child-process idle/spam/output bounds/cancel and descendants,
  authenticated egress, adapter timers/byte budgets, source library/state/HTTP,
  explicit cancel/reaping, native/RPC capacity isolation and hosted exclusions.
  HE-AAC core/output rate, profile, channel and clock drift checks use synthetic
  values, never the downloaded source as an automated fixture.
- Current-source native proof: the Codex NTSC/VP9/Opus stream-copy/full-decode
  case passes; two unrelated proof cases are deliberately not run. Invalid
  cadence/duration changes still reject with owned cleanup.
- Root `typecheck` passed after descriptor changes; final clock/test-only edits
  pass `tsc --noEmit -p tsconfig.local.json`. Scoped ESLint and Prettier pass;
  `git diff --check` passes. No dependency/tool/model/configuration change.
- Read-only validate checks the combined unstaged CL-194 changes against this
  packet. The conditional metadata deadlines preserve bounded profiles; no
  automatic retry, source-quality downgrade, schema escape, new provider call
  or content-bearing diagnostic is introduced. Local code has no actionable
  finding; full 144p real acceptance remains pending until recorded below.

### Final file allocation

Production: `packages/contracts/local/{acquisition-profile,acquisition,diagnostics}.ts`;
`apps/backend/local/{acquisition-egress,acquisition-process,yt-dlp-acquisition,youtube-formats,worker-port,runtime}.ts`;
`apps/renderer/local/{acquisition-audio,acquisition-media,media,server}.ts`;
`apps/renderer/src/media/{inspection,process-runner}.ts`;
`apps/frontend/src/features/local-editing/acquisition-panel.tsx`.
Tests: related backend acquisition/format/section-clock tests, new renderer
`acquisition-liveness.test.ts` and `acquisition-audio.test.ts`,
`test/owner-worker-progress.test.ts` and `test/owner-acquisition.proof.ts`.
Documentation: this packet, ticket index, source of truth, capacity inventory and
local workflow guide. The four CL-185 startup-follow-up files identified above
and its existing execution-ledger changes remain separate and preserved.
All changes remain unstaged/uncommitted; no push/deployment.

## Real 144p acceptance and final validation

The third reasoned full-source attempt reached `ready` through the normal
protected frontend acquisition API. It transferred 112,489,753 component bytes,
stream-copied/fully decoded the entire source and saved a ready 256-by-144 MP4
of 114,029,504 bytes and 7,978,437 ms. Polling observed ready after 110,934 ms.
It passed the previously failing descriptor/clock checks and the native full
validation path. Both temporary component copies were removed after publication.
Across the three full 144p attempts, application component totals sum to
337,469,259 bytes (about 322 MiB), excluding metadata, the bounded header probes,
TLS/request overhead and the owner's earlier 1080p attempt. There were no
transcription, inference, image, rendering, Gemini or cloud processing requests.
The only post-success network checks were local loopback GETs.

Final read-only validation found one output-bound issue: after a failed progress
record, later chunks could accumulate until the child exited. Execution now
clears the invalid buffer and discards subsequent stdout while reaping; the
seven process-liveness tests, scoped lint/format and local typecheck pass after
that fix. A final review of the settled CL-194 diff reports **no actionable
findings**, excluding the separately preserved CL-185 startup changes. No
requirements were removed. Source-quality and full decode validation remain.

The final current-source worker was rebuilt/reloaded using verified owned
lifecycle cleanup. The saved source survived reload and remained ready in the
catalog; a bounded 1,024-byte playback GET returned `206` with an MP4 header.
Backend health, frontend `/start` and `/api/sample/config` return `200`, and
capabilities confirm `aiProvider=codex` / `sourceMode=provider-source`. The
frontend was preserved throughout; normal configuration was never read or
changed. The final backend uses a process-local Codex selection.

Final listeners: frontend PID 18732 on 3000 (supervisor 10136), backend PID 14392
on 4000 (supervisor 21800), internal worker PID 13416 on 4200. Exact creation
identities and owned descendants are in the private content-free runtime record:
`C:\Users\minat\AppData\Local\Temp\clipbuilder-app-run-55dd964223934f0fa8cdf865f24ef253\runtime.json`.
Backend logs: the same directory's `backend-cl194-final.stdout.log` and
`backend-cl194-final.stderr.log`. Frontend logs: `frontend.stdout.log` and
`frontend.stderr.log` there. Worker logs:
`C:\Users\minat\AppData\Local\Temp\clipbuilder-local-runtime-VOih7G\worker.stdout.log`
and `worker.stderr.log`. Private helper/probe files stay outside Git; no helper,
probe, test process or temporary component-copy timer remains running.

Remaining owner acceptance: high-resolution/full-source performance, real ASR,
editorial/face quality, rendered exports, personal browser/device presentation
and hosted/Linux release. None is claimed by the 144p acceptance. Fake mode
continues to work with synthetic inputs and no keys; later real Codex AI still
needs prepared local assets, ChatGPT allowance/login and enabled applicable
gates. No new model/download, provider spend, deployment, staging, commit or push.
Deviation: added the measured HE-AAC compatibility/packet-clock repair required
for the requested 144p test, with narrow profile/clock regression coverage. No
silent audio conversion, format downgrade or whole-source/automatic retry.

## Slow-device assurance follow-up — 2026-11-02

The owner confirms slow internet/device time is acceptable and asks to verify
that advancing work does not time out. A read-only audit confirms the local
Codex transfer, native preparation and worker RPC have no total deadline. The
background import returns 202, so the proxy's per-request timer cannot cancel
the whole acquisition. Existing idle detection and metadata/probe bounds remain.
Twenty-seven directly relevant fake progress/deadline/cancel checks pass again.

One separate reachable gap was found: POST sources/open synchronously validates
a saved master using a normal fetch at the frontend bridge. That client's
implicit response-header deadline can expire while valid native inspection is
still progressing; the bridge also retains its thirty-minute overall timer.
Use the existing fixed private JSON CPU-work transport only when trusted local
Codex/long-source capabilities confirm this source-opening request. Clear that
request's overall timer, preserve explicit abort and native progress guards,
keep Gemini/hosted routing/budgets unchanged, and admit only exact sources/open.
Additional allocation: frontend server `local-workflow.ts`,
`local-workflow.test.ts`, `local-ai-request.ts`, `local-ai-request.test.ts` and
narrow owning docs. No backend/worker/configuration edits or restart, real
source request, inference, download or Git mutation for this follow-up.

Follow-up result: **complete, no actionable findings** after read-only validation
of the four frontend server/test changes. Trusted local Codex sources/open now
uses the existing native JSON transport and loses the overall request timer;
Gemini continues its prior fetch/timer path and hosted acquisition stays excluded.
Explicit browser abort still cancels native work; bounded JSON/private headers
and exact-route admission remain. The transport was renamed fetchLocalWork to
reflect native validation and AI consumers; all imports/mocks are updated.

Verification: 17 frontend transport/proxy tests pass, including a simulated
three-hour saved-source wait, trusted-provider isolation, fixed loopback routing,
request/response bounds and cancellation. The 27 existing acquisition progress,
RPC/native deadline and child cleanup tests pass again (44 targeted fake tests
for this follow-up). Frontend tsc --noEmit, scoped ESLint, Prettier and diff checks
pass. Checks load no env files, use no API keys and make no external requests.
No backend/worker change/rebuild/restart, real acquisition or AI call occurred.
Normal Next development compilation serves the new frontend route. High-quality
owner media acceptance remains separate; advancing work has no total deadline,
while metadata/probe/health and true no-progress guards remain finite.

## Local Git authorization — 2026-11-03

The owner now authorizes whole-file planning, staging and ticket-prefixed local
commits under the [file-level commit plan](../operations/CL185_196_COMMIT_PLAN.md).
Earlier no-Git/unstaged statements describe the original repair request. The
complete shared runner/tests include CL-196's ignored-stdout prerequisite; the
shared acquisition panel belongs to CL-195 and keeps this ticket's error text.
No new download, processing, restart or push is part of this Git task. Real ASR,
moment/face quality and owner release acceptance remain unchecked.
