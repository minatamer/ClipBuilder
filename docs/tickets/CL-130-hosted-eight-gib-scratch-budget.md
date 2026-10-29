# CL-130 — bounded hosted scratch for two CPUs / eight GiB

Owner request, 2026-10-29: target 2 CPUs / 8 GiB, reconcile scratch admission
without lowering clip quality or product limits, and test with fake AI and no
paid calls. The owner permits sensible demo file bounds; the existing public
500 MiB / 20-minute upload ceiling already supplies them. No deployment, cloud
mutation, provider processing or Git write is authorized by this packet.

Owner packaging follow-up, 2026-10-29: explicitly authorizes a whole-file plan,
local staging/commits for the current work, then a verified full app restart.
This supersedes only the original Git-write restriction above; no push,
deployment, configuration mutation or paid processing is included. See the
[seventeen-file allocation](../operations/CL130_COMMIT_PLAN.md).

## Authority and dependencies

Follow the source of truth's CL-125 resource evidence and permanent quality,
explicit retry, completed-work retention and hosted/local isolation decisions.
CL-125–129 are implemented and committed; starting worktree/index are clean at
`19ede71`. The four hosted baseline suites pass (13 tests). Their initial sandbox
run could not load Vitest temporary modules; the unchanged suites pass outside
the sandbox with the shared fake/paid-off/network-blocked setup.

The 12 GiB historical scratch ceiling cannot fit in 8 GiB RAM. It is an internal
resource allowance, not a promise to retain every combination of maximum-sized
exports. Keep the existing product bounds and capacity-error behavior: reject
work before dispatch when its admitted bytes will not fit, preserve completed
results, and never lower quality, prune history or retry automatically.

## Implementation checklist and whole-file allocation

- `packages/contracts/local/hosted-editing.ts`: fixed 5 GiB media scratch budget;
  preserve all source/clip/revision, rate, delivery and spend policies. Keep the
  existing 256 MiB filesystem free-space reserve.
- `apps/backend/local/hosted-capacity.ts` and its tests: validate a dedicated
  bounded 5.25 GiB tmpfs and at least 8 GiB cgroup memory before hosted worker
  startup. This leaves 2.75 GiB outside the volume. Check real retained allocation,
  remaining filesystem space and cgroup memory before admission; distinguish
  total projected bytes from additional bytes, deduplicate hardlinks and reject
  unsafe paths, invalid measurements, oversize budgets and insufficient room.
  Read only fixed cgroup files, never environment/credential files. Filesystem
  writes must fail at the volume bound rather than consuming the process reserve.
- `apps/backend/local/hosted-runtime.ts`: connect that policy to actual hosted
  startup/admission before spawning a worker or composing providers. Preserve
  fake/test/local gates and cleanup on startup failure.
- `apps/backend/local/clip-batch.ts` and its tests: count actual retained preview,
  output and asset bytes, reserve maximum bytes for missing previews and queued
  exports, and count the single overlay workspace once. Preserve all export
  history, twenty revisions, completed paid work and one-worker execution. Keep
  the local disk ceiling/reserve and all quality/format settings unchanged.
- `scripts/verify-hosted-editing-linux.mjs`: use the real capacity policy in the
  existing fake/provider-free packaged upload/editor/native/export/cancel/retry/
  quota/cleanup proof; add meaningful bounded-storage/memory regression evidence.
- `apps/backend/local/hosted-upload.ts`, its tests and `hosted-workflow.ts`:
  reserve a bounded source upload before creating/replacing staged files. A
  denied upload preserves the existing stage; completed sources still prohibit
  another source. Keep ordered chunking and the exact existing source ceiling.
- This packet, `docs/tickets/README.md`, the source of truth's narrow current
  decision, `docs/operations/HOSTED_NATIVE_BENCHMARK.md` and
  `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md`: describe the exact
  volume/memory contract, produced evidence, remaining maxima/owner gates and
  unapplied deployment settings. `apps/backend/README.md` documents the hosted
  mount requirement separately from normal local startup.

## Required verification

1. Focused capacity, batch, hosted upload/workflow/cleanup/runtime tests through
   the shared deterministic setup; prove queued work and retained history fit by
   bytes, low-memory/full-volume failure dispatches nothing, and retries retain
   existing output. Cover the existing maximum upload and three clip slots.
2. Backend/local/contract types, scoped lint/format and final diff/architecture/
   privacy/cleanup review. Validate read-only; fix confirmed findings and repeat
   until no actionable finding remains. No separate agent/chat is authorized.
3. Rebuild the current secret-free Linux backend/worker locally and run its
   network-disabled non-root native proof at 2 CPUs / 8 GiB, no swap, a 5376 MiB
   `/tmp` tmpfs and bounded shared/home memory. Verify exact native codec/quality/
   cadence settings, preserved source and media output, actual cgroup/volume
   bounds, cancellation/expiry cleanup and zero external/provider attempts.
   Verify the volume hard limit fails without OOM and preserves retained files.
4. Preserve normal frontend/local media/configuration. Rebuild/reload the normal
   backend's internal worker if shared contract/native integration requires it,
   using verified process ownership. Check health/start/config without paid work.

Fake mode supplies fictional AI data and real native encoding without API keys.
It cannot establish Gemini quality or exact cloud latency. Actual hosted mount,
CPU/background lifecycle, maximum media combinations and owner visual/rights/
real-AI acceptance remain deployment gates; provider keys/live approvals and
owner action are required for real AI. No local AI model/weights are introduced.

## Evidence and status

Local implementation and validation complete without deployment/resource-setting
changes or provider calls. Scoped local packaging follows the owner grant and
linked plan above. The original 12-GiB aggregate scratch
allowance is the only reduced resource ceiling. Named product/source/clip/
revision/quality limits are unchanged. Large retained collections can exhaust
the finite aggregate budget; refusal preserves every completed file.

- **50 focused tests / six suites pass:** capacity validation, real hardlink
  accounting, cgroup v1/v2/missing/unbounded/wrong-volume rejection, runtime
  overhead, full-space/low-memory admission, upload boundary/retention, three
  clip slots and all twenty revision files in fake-port regression. An initial
  denied preparation dispatches exactly zero plan/image/native calls. Three
  queued exports reserve three outputs and only one overlay workspace.
- **Types/lint/format pass:** `tsc --noEmit -p tsconfig.local.json`,
  `tsc --noEmit -p packages/contracts/tsconfig.local.json`, scoped ESLint with
  zero warnings and Prettier for every changed code file. The production Linux
  build also compiles the backend/contracts/composition and current worker.
- **Actual final Linux proof passes:** local image
  `sha256:51e980e8ca3dc8a30db52ae062afcd84915c63f7ccf5c2a5bde6e195eda56b0a`,
  non-root, read-only root, network none, CPU cap 2, memory/no-swap cap
  8,589,934,592 bytes and `/tmp` tmpfs 5,637,144,576 bytes. The shared browser UI
  selects a real generated 524,288,000-byte file from disk, sends ordered chunks,
  verifies the source hash, edits captions/pictures/text/filter and downloads
  native MP4s. Cancellation, explicit retry reuse, demo quota, expiry/exit and
  owned-container cleanup pass. Counts: transcription 1, caption 1, selection 0,
  plan 1, generated image 0, inspection 1, preview 1 and final-render attempts 4
  (one canceled). External/provider attempts are zero; no keys are used.
- Observed container RAM peak is **1,989,685,248 bytes (about 1.85 GiB)**.
  This includes the test browser and generated upload fixture, rather than
  CL-125's native-only process set. Logical scratch peak is 1,052,365,775 bytes,
  including the fixture and uploaded copy; it is not a deduplicated physical
  maximum. Highest requested reservation is 3,074,500,242 bytes. Docker reports
  OOMKilled false and every memory-event counter, including OOM/kill, is zero.
- A separate **32-MiB** tmpfs refuses further writes with `ENOSPC` after
  33,550,336 bytes and preserves a retained synthetic file. This proves bounded
  write failure without deliberately filling the production-size volume on the
  owner's 7.56-GiB physical Docker VM. The real 5376-MiB volume size and actual
  cgroup contract are verified, but a full-8-GiB physical stress test is not
  claimed. Pure/adapter regressions cover production-size near-full budgets.
- The native sample is **four seconds of generated 160x90 video padded with a
  valid MP4 free box to the upload-byte ceiling**; exports are one second at
  52x90 with H.264/AAC and source-height preservation. This is not a full-duration
  4K or five-minute manual-cut proof. Existing native quality settings and local
  ceilings are unchanged; earlier benchmark evidence retains its own scope.
- Shared contracts rebuilt; verified backend supervisor/descendants stopped,
  ports stabilized empty, and the normal backend/current worker rebuilt and
  restarted with owner configuration unchanged. Health succeeds; the existing
  frontend PID 19384 is preserved. Private safe logs/runtime records live under
  the agent-owned OS-temp `clipbuilder-cl130-e34de710` folder, outside Git.
  Final GET health, `/`, `/start` and `/api/sample/config` all return 200 with
  mode `fake`. No proof containers remain; Docker Desktop was returned to its
  initially stopped state after confirming no unrelated containers were running.

Confirmed revisions: V130-01 found that non-workspace browser/runtime files were
missing from the projected ceiling. They now count as overhead, while only
workspace bytes offset projected demand. Pressure is read after the metadata
walk so a concurrently rendering worker cannot leave an old pressure snapshot.
Both changes are in the rebuilt final artifact. The first 500-MiB browser proof
failed because constructing an in-memory File exhausted Chromium's blob buffer;
disk selection fixes the fixture without weakening upload/hash/native checks.
The initial sandbox Vitest loader failure, script lint/format corrections and a
PowerShell JSON-date identity comparison were harness/lifecycle issues, not
passing runs; the corrected final checks and backend refresh pass.

V130-final: **Meets ticket; no actionable findings.** Read-only review covers all
sixteen changed/new whole files against this packet and the current resource
authority: actual-byte/pending-work integration, safe bounded startup, upload
admission, completed-output/retry retention, unchanged quality/count limits,
dependency direction, no debug/secret/provider leakage and cleanup. At that
pre-packaging snapshot the index was empty and all work unstaged/uncommitted.
The owner subsequently authorized the scoped local packaging sequence linked
above; validation and owner/release gates remain unchanged.

Remaining owner/release gates: actual Cloud Run mount/memory/background CPU and
lifecycle configuration, platform behavior, full-duration 4K/manual-cut and
maximum source/history combinations, owner real-AI/media/rights/visual/release
acceptance. These are not silently marked passed by synthetic evidence. Real
AI still requires keys/live flags/approvals and explicit owner testing. No local
model/weights or new storage service is introduced.
