# CL-058 — Diagnose failures throughout the local workflow

Status: implemented and validated. Dependency: completed CL-027 local runtime and CL-057.

Owner request — 2026-10-24: fix the silent Find moments failure, anticipate the
same gaps in subsequent local operations, and restart only the normal backend
in its existing real mode so the owner can retry manually.

Authority: source of truth, **Same application, local editing extension** and
**15.7 Logging allow-list**. One packet; no UI, provider policy or budget changes.

Acceptance:

- Connect local Gemini transport, transcription/selection, planning and image
  diagnostics to an explicit content-safe sink and active request context.
  Never enable private provider-body capture through this path.
- Record bounded operation names, correlation IDs, timings, completion/failure,
  allowlisted error/rule/system codes and structural validation diagnostics.
  Cover native RPC/worker execution, background preparation/render, input and
  revision rejection, draft saving, stream failures, cleanup and startup stages.
  Keep successful read/progress polling quiet and make sink failure inert.
- Preserve generic browser errors, exact dispatch counts, cancellation, cleanup,
  provider gates and dependency directions. Never log media, filenames, paths,
  prompts, payloads, credentials, arbitrary exception messages or stacks.
- Add synthetic regressions for representative native/provider/schema/batch/
  persistence/cleanup errors, correlation, bounded logging and sentinel privacy.
  Run affected tests, local/backend/renderer types, lint and format; review the
  settled diff with validate. Update owning guides and actual ticket evidence.
- Restart only the backend and its managed worker with verified ownership,
  cleanup and readiness. Preserve frontend, saved media/configuration/logs.
  Use normal real-mode configuration; no agent-run provider request or retry.

Fake mode needs no API keys and supports synthetic diagnostic verification plus
native local processing. Real Gemini needs the owner's key and enabled approvals;
actual provider acceptance stays owner-manual. No offline model is introduced.
No Git mutation, ignored env read, real acquisition, cloud action or paid test.

Evidence — 2026-10-24:

- Explicit `LocalDiagnostics` owns bounded local operation records and an
  existing `AnalysisDiagnostics` instance with no private capture enabled.
  The normal runtime passes it through host/provider/native RPC composition.
  Provider transport, Transcribe, candidate generation/validation, planning and
  images now share active request context and the safe sink. Background clip
  work and autosave own independent correlated operations after HTTP completion.
- The shared local contract owns one strict diagnostic record/error allowlist.
  Native jobs log start/terminal events and a generated job ID also present in
  the backend RPC span. Sink exceptions do not alter responses, dispatches or
  cleanup. Successful read/progress polls stay quiet. Per root operation:
  at most 128 local records (sixteen reserved failure slots), plus the existing
  256 provider records. Unknown exception text is discarded, with safe class,
  system/exit/signal codes and structural validation retained when available.
- Host rejection/stream/expiry errors, source acquisition background failure,
  failed derived-output cleanup, draft save, provider cleanup and backend/worker
  startup/shutdown now retain failure evidence. Native subprocess stderr uses
  only a 32 KiB in-memory classification tail; safe causes preserve fixed
  codec/filter/stream/input/disk/memory categories and exit status through source
  inspection. No raw stderr, stack, payload, media path or environment is logged.
- Full local suite: `corepack pnpm exec vitest run --silent --maxWorkers=2
  --config scripts/local-test.config.ts` — **47 files / 483 tests pass**.
  The initial unrestricted run had seven existing short-deadline failures under
  parallel load and one new host test using the wrong endpoint. Corrected the
  test endpoint; the bounded-concurrency run passes without weakening deadlines.
- Shared renderer process-runner **3 tests pass**, source inspection **4 pass**;
  backend analysis diagnostics/local mount **19 pass**. After final safe-detail
  additions, local provider/diagnostics **29 pass**; after the reviewed synchronous
  spawn-span correction, diagnostics **6 pass**. Tests force synthetic/fake,
  paid-off and network interception before imports. Privacy sentinels, actual
  host/native failure responses, broken sinks, log bounds, concurrent correlation,
  persistence, background failure and exact injected call counts are covered.
- Local/contracts/backend/renderer types, scoped ESLint, all changed-file
  Prettier and `git diff --check` pass. Read-only validate reviewed the settled
  tracked/untracked diff against this packet, including inert composition,
  boundary directions, cancellation/resource cleanup, private capture exclusion,
  generic browser responses and unchanged provider budgets. **Meets ticket;
  no actionable findings.** Review corrected an async spawn-span ordering race
  before restart; spawning remains synchronous so error handlers attach promptly.
- Only the backend was restarted with its normal saved real-mode configuration.
  Verified the owned old tree absent and 4000/4200 released before relaunch;
  hidden launcher control was unavailable, so verified tree cleanup was forced.
  Normal startup rebuilt current worker/overlay. New supervisor **25712**, backend
  **24116** on 4000, worker **27000** on 4200. Frontend **6684** on 3000 unchanged.
  Health, `/start`, safe config and local capabilities return **200**;
  **live / provider-ai / planning available / cloud false**. New startup/tool/
  worker-identity/readiness/discovery diagnostic records were inspected in the
  actual replacement log. Runtime/records/logs are outside Git in OS temp.

The original owner request failed with HTTP 400 after 93 seconds; its cause is
unrecoverable from the old logs. New diagnostics do not establish a cause
retroactively. Actual Gemini retry, provider quality and full owner-media/native
export acceptance remain owner-manual and unchecked. No API key is needed for
the synthetic fake tests; real processing retains key/live/approval requirements.
No agent-run paid/provider/acquisition/cloud request, ignored env read, frontend
restart, deployment or Git mutation. All code/docs remain unstaged/uncommitted.
Deviation: the bounded-concurrency rerun and corrected test endpoint above; no
product, UI, configuration, media retention, dispatch or retry-policy change.
