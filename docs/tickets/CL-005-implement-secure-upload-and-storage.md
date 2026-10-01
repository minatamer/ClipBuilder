# CL-005 - Establish browser-owned media and protected admission

Status: Local foundation independently revalidated; remaining feasibility/release gates open<br>
Milestone: M2 - browser-owned media foundation<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-001, CL-003, CL-004 and CL-004A's documentation handoff<br>
Blocks: CL-006, CL-007, CL-011<br>
Suggested commit: `CL-005: establish and validate browser-owned media`<br>
Parent plan: [source of truth](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Current technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Ticket index: [README.md](README.md)

## Objective and owner decision

Original video, transcript/candidates, assembly assets and final output belong
to one disposable browser workspace. No application database or cloud object
storage service: this is not the former GCS-backed database-free design.
The old secure resumable upload/storage packet is withdrawn, not completed or
deferred to deployment. Keep the filename stable for existing references;
the new title/scope govern execution.

Implement real local intake, browser storage/lifecycle and actual immutable
candidate-range playback using CL-004's existing single-card UI. Establish
protected request-admission foundations and migrate the legacy contracts,
state/recovery and configuration that would otherwise force a server-media job.
Do not implement transcription, full active-speaker processing, contextual
assembly or final production export early. First prove that the recommended
browser pipeline can meet its essential media/storage/transport boundaries.

This planning revision authorizes no code, package/model installation, media
inspection, paid call, cloud mutation, Git action or deployment by itself.
Execution requires the owner's separate request for this packet. Fake/off
foundations may proceed independently; external proof stays gated.

## Product and architecture invariants

- One owned/licensed MP4 or WebM, 15 seconds through 20 minutes AND <=500 MiB
  publicly; one chosen contiguous 10-60s clip. Do not lower those ceilings or
  add internal filler cuts without an explicit source-of-truth revision.
- Preserve one changing responsive card, design-system primitives, smooth
  selection/layout motion, portrait video priority and glass inline controls.
  No re-created screens/editor; no app-level animation suppression restored.
- Original video and final output never reach the application backend.
  Backend AI receives only disclosed bounded audio/text in later tickets.
- OPFS owns large binaries, IndexedDB bounded normalized records; File/Blob,
  handles, controllers, workers and URLs are runtime-owned. No video/base64 in
  sessionStorage/localStorage, no durable history and no duplicated IDB source.
- The backend cannot open browser storage. No Python Light-ASD, native ffprobe
  or server FFmpeg path is presumed retained. Browser active-speaker quality is
  a CL-006 gate, not solved by face landmarks.
- Keep `FAKE_MODE=true`, derived `PROVIDER_MODE=fake`,
  `PAID_DEMO_ENABLED=false`, and all live flags false in defaults/tests.
  Real composition never falls back to synthetic success.
- 1080x1920 H.264/AAC is the existing output target; code presence is not proof
  of actual encode/mux/playback or universal browser/device support.

## Dependency evidence

Read the current source of truth section 0.9 and linked architecture contract,
then inspect actual code. CL-004's development preview is locally verified at
`c4f226b`, with documentation at `2efee17`; the pre-change root gate passed
249 tests. This is historical fake-baseline evidence, not browser-media proof.

Reuse the canonical reducer, session effect ownership, immutable review
bundles, range reconciliation and design system. The fake session's bounded Map
and fixture cookie are not production admission or distributed coordination.
CL-004A supplies provider/cost/software guides, not actual account approvals.

### Documentation-pass evidence (2026-10-01)

This pass changed only 25 Markdown files: source of truth, browser research/
architecture contract, CL-003/004 migration handoffs, CL-004A/005-015 packets and
index, documentation index, provider/cost/software guides, and root/frontend/
backend/demo READMEs. Application source, environment example, dependencies and
lockfile were not changed. Nothing was staged/committed and no provider/paid/
cloud action, media/model download or benchmark was performed. Public upstream
source/docs were read for research; no ignored secret file was inspected.

Read-only verification: repository-installed Prettier Markdown AST parsing of
all 25 changed/new documents; 188 relative file targets and 100 heading anchors
resolved, with no missing links or unmatched historical details fences.
`corepack pnpm format:check` and `git diff --check` passed. The repository
intentionally ignores Markdown in Prettier, so the format gate is not a Markdown
formatting claim. No application tests were rerun for this docs-only pass;
the earlier 249-test baseline above is not new media verification.
All implementation/spike/owner acceptance boxes remained unchecked in that
documentation pass. The execution evidence below is separate.

### Phase-1 execution evidence (2026-10-01)

The owner separately requested execution and approved the proposed exact
Mediabunny installation and synthetic full-bound local benchmark with "go for
it." Approved benchmark targets: full audio extraction <=5 minutes, 60-second
portrait encode <=2 minutes, additional memory <=512 MiB and A/V drift <=80 ms.
This did not authorize real visitor media, providers, paid/cloud actions,
deployment, Git mutation, local retention or universal device claims.

Installed frontend-only `mediabunny@1.61.0`; Node `v22.23.2`, pnpm `11.19.0`.
MPL-2.0 inspected against upstream
`0f91fe768e7ee42703f15e2b8845551b0f1028b3` and the installed manifest/license.
Its type dependencies `@types/dom-webcodecs@0.1.13` and
`@types/dom-mediacapture-transform@0.1.12` declare MIT. No native stack, AAC
WASM, model/weights or private media was installed/read. Preserve required
notices/source availability before distribution; fallback codec licensing is
still conditional. No third-party code was modified.

Reproducible synthetic-only harness:
`apps/frontend/feasibility/browser-media/`; command and measurement procedure
in its [README](../../apps/frontend/feasibility/browser-media/README.md).
It is not mounted in `/start`. A GET-only loopback server delivers the pinned
bundle, worker and page with harness-only COOP/COEP/CSP. There is no upload,
provider, production intake, IDB journal or final download endpoint. Tests
cover fixed routes, bundle resolution, traversal/non-allowlisted rejection and
no POST. Seven harness tests passed; the exact command
`corepack pnpm --filter @clipbuilder/frontend test:unit -- feasibility/browser-media/server.test.mjs`
ran all 13 frontend files / 139 tests in this pnpm invocation, not only that
file. `corepack pnpm --filter @clipbuilder/contracts test:unit` passed 38 tests,
including independent exact 500-MiB/20-minute acceptance and +1-byte/+1-ms
rejections. Those are schema boundaries, not additional giant media fixtures.

Measured platform: Windows laptop, Intel Core i7-10810U @1.10GHz, 12 logical
processors, 16,760,946,688 bytes physical RAM; Codex in-app Chromium runtime UA
`Chrome/154.0.0.0`. The UA is reduced; no exact patch or independent Chrome
browser claim is inferred. Secure context, OPFS, worker WebCodecs, Web Locks
and the exact native H.264/AAC encoder configurations were supported. Probed
portrait AVC `avc1.420028`, 1080x1920, 30fps, 4Mbps and AAC `mp4a.40.2`,
48kHz mono, 128kbps; actual encoding/mux/worker decode/native playback followed.
The full generated source encoded as AVC `avc1.64001f`, 1280x720, 30fps,
3.3Mbps CBR with 48kHz mono AAC. No claim is made for other profiles/devices.

| Actual local observation | Result |
| --- | --- |
| Small portrait, then fresh repository-harness smoke run | 2-second H.264/AAC; 116,213 bytes; encode 1,100.545 ms initially / 873.935 ms smoke; native playback and refresh/reopen verified |
| Generated full source | 1,200 seconds; 514,629,785 bytes (490.789 MiB); 36,000 frames; generation 137,381.12 ms; 491 writes, maximum 1 MiB |
| Full-source audio extraction | 7,512.04 ms; 10,244,799-byte mono Opus/WebM under the spike's 16-MiB cap; 21 writes, maximum 1 MiB |
| Audio reopen/decode | Container duration 1,200 s; 57,600,856 decoded frames at Opus' 48-kHz clock, 1,200.017833 s including trailing codec padding |
| Selected [600,660] portrait transcode | 16,858.465 ms initially / 20,984.895 ms repeat; 1080x1920, 30fps, H.264/AAC; 33 writes, maximum 1 MiB |
| Exact presentation-duration remux | 162.625 ms initially / 154.595 ms repeat; 33,144,580 bytes; worker/container and native HTML duration exactly 60 s; actual playback verified |
| Decoded flash/tone sync | 0.208333 ms drift at 1, 30 and 59 seconds |
| Whole-source incremental copy/reopen/delete | 903.835 ms; matching 514,629,785 bytes / 1,200 s; maximum File-stream read chunk 2 MiB |
| Actual source range playback | Started near 600.250345 s, paused exactly at 660 s after end-seek; range was not manually changed |
| Two-tab exclusive mutation | Second copy waited 5,548.93 ms while the first held the Web Lock; copied only after release, then deleted its copy |
| Injected quota-style mid-write failure | 4,194,304 committed bytes before failure; reader/handle closed and partial copy deleted |
| Conversion cancellation | Partial portrait deleted, input/handle closed, valid source retained; no completed file published |
| Explicit deletion and missing-artifact reopen | Owned OPFS folder absent after player release; reopen failed rather than creating playback; empty retry folder removed again |

AAC padding initially produced a 60.010667-second MP4. The spike remux uses the
library's encoded packet API to bound final packet **presentation durations**,
preserving the full source selection, priming packet and encoded bytes, not
shortening the chosen conversation or hand-editing MP4 boxes. Decoded trailing
AAC samples may still contain codec padding; do not conflate them with the
bounded container presentation. CL-011 must preserve and regression-test this
timing behavior before product download. A decoded sample chunk timestamp
difference of 9.333 ms is not sync evidence; the actual flash/tone comparisons
above are the sync measurement. Synthetic tones do not prove speech/STT quality.

Browser memory sampling: 5,376,682-byte baseline, 52,041,813-byte sampled maximum
during the full run. Independent 250-ms process sampling over 180.25 seconds /
685 samples observed aggregate Chrome/Codex private-memory delta 191,381,504
bytes and working-set delta 210,972,672 bytes. This includes unrelated process
activity and is not an isolated GPU/native peak measurement. Observations are
below 512 MiB; a universal/strict isolated-peak pass is **not** claimed. A 50-ms
main-thread heartbeat had maximum foreground gaps around 79 ms and no long
tasks on the primary run; the second-tab run recorded one 64-ms long task.
Background visibility entries at reload do not prove OS suspension recovery.

Working-set preflight proposal, derived from existing public/assembly caps:
source + bounded compressed audio (16 MiB provisional) + at most 3x15-MiB assets
+ final output (200 MiB) + scratch (one 200-MiB remux output + 8-MiB I/O)
+ reserve max(64 MiB, 10% subtotal). At the public source ceiling this is
1,117,677,159 bytes (about 1.04 GiB); the spike's 1.3-GB estimated-free check
is conservative for this proposal. Estimates are not reservations; actual
write denial still needs cleanup. The runtime reported 10-GiB origin quota.
The portrait spike uses a smaller 64-MiB cap, not a changed public output cap.
Production scratch/image/audio profiles may require revisiting this formula.

**Verdict:** conditional go for the native worker/Mediabunny media route on the
measured Windows Chromium laptop; no-go for declaring the entire feasibility
gate, production persistence, universal device support or public paid release
complete. Committed/default/test fake/off composition and product UI are
unchanged in that spike slice. Phase 2/3 were not implemented at that checkpoint;
the subsequent execution record below supersedes that implementation status.

Remaining proof at this checkpoint: private-mode storage, real quota
denial/automatic eviction, OS/browser freeze, isolated resource-pressure
performance, journal/epoch/recovery/expiry
and admission. Local compressed audio is promising, but speech quality,
actual received-body/duration validation and deployed transport remain
CL-006/007/015 gates; no transcription call occurred.

Owner decision approved on 2026-10-01, explicitly relayed from the side chat
with the owner's response "i approve it, send validation notes too": one
non-renewing workspace with two-hour logical
expiry from source admission, best-effort storage, Clear/replacement cleanup,
active/next-open deletion and explicit disk-survival disclosure. This does not
limit processing to two hours or promise deletion on close. Partial cleanup
intent survives. No durable-storage permission/history is approved.
Supported release claims and anonymous paid
deployment safeguards also remain unapproved. Rights/visual/accessibility/
provider/privacy/spend/cloud evidence is not supplied by this synthetic spike.
Both temporary servers and all test tabs were stopped/closed; OPFS media and
measurement records were explicitly removed. No Git action was performed.

Final gate for this partial feasibility slice: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`
(256 tests: 11 root, 38 contracts, 68 backend, 139 frontend) and
`corepack pnpm build` all passed. `git diff --check` passed. Boundary-negative
fixtures and deterministic no-network setup remain passing. Markdown is ignored
by the format command; it is not Markdown formatting evidence. This gate does
not complete CL-005 or any unperformed storage/provider/owner check.
Separate Markdown AST parsing passed for the five changed/new owning documents.

### Phase-2/3 execution and independent recheck (2026-10-01)

The owner requested a thorough independent recheck of every side-chat finding,
fixes for confirmed issues, documentation and another validation handoff.
No Git mutation, provider, cloud, paid call, deployment or real visitor media was
authorized or performed. The first 256-test gate above was a spike checkpoint,
not evidence that the later local foundation was complete.

| Reported finding | Independent result, repair and evidence |
| --- | --- |
| Journal opening Promise/type mismatch and missing sync-access-handle type | Confirmed after rebuilding contracts and running fresh frontend TypeScript. Opening is now explicitly `Promise<IDBDatabase>`; worker-only sync access uses a structural capability guard. IDB tests prove request-success is not commit, transaction abort fails, late/blocked/version-changed opens close, and unknown/corrupt records are rejected. OPFS tests cover failed open/truncate/write/flush/validation, bounded partial writes and cancellation. |
| Additional source-nullability/export errors | Not reproduced after rebuilding published contract declarations. No cast or nullable-source workaround was added to suppress stale-build diagnostics. Contracts are rebuilt in the final typecheck/build chain. |
| Media/persistence code existed without canonical UI integration | Confirmed. Local mode now creates one runtime artifact owner in the existing provider; the same reducer models local preparation/actual copied bytes, then source-ready. The existing card, glass player, selection motion and candidate details are reused. Recovery bypasses fake server evidence and revalidates actual OPFS bytes/descriptor; no automatic provider call occurs. |
| Protected admission and legacy config migration missing | Confirmed. Added bounded process-local boot-bound grants/action reservations/receipts with injected fake transport tests. Removed GCS/native executable/model/job/upload/render config and signed media capability response assumptions; migrated shared source revision/public capability schemas, fixtures, tests and pre-import guards together. |

Additional correctness repairs found during that recheck:

- Cleanup fences worker results synchronously before I/O; pending/ready metadata
  is not presented as atomic with OPFS. Consumer release precedes URL revocation.
  All copy-handle acquisition/write/finalization paths close/delete partial work.
  Analogous feasibility-harness output/handle setup paths now have outer ownership
  guards, including failure before codec/output construction completes.
- A denied sessionStorage marker write cannot skip worker stop or media deletion;
  IDB's clearing record is an independent fence. IDB denial retains the legacy
  marker. If both stores refuse writes and physical deletion also fails, durable
  cleanup intent cannot be guaranteed: the UI requires staying open/retrying, not
  a claim of confirmed deletion. No unrelated origin stores are cleared.
- A lease completing after disposal is explicitly released. Another tab cannot
  clear the active owner's workspace. Content-free BroadcastChannel release
  notifications only request re-acquisition through Web Locks; they are not
  authority. Missing notifications do not permit mutation without a lock.
- Ready-source recovery compares the full normalized descriptor and a bounded
  `sha256-chain-v1` identity: 1-MiB chunks hashed separately, then chained from
  an all-zero 32-byte seed. It is not a plain whole-file SHA-256. No filename,
  original binary, Blob URL, controller or worker enters the journal/reducer.
  The version-1 journal implicitly fixes this algorithm; an algorithm change
  requires migration/versioning. Source mismatch, future admission time, expired
  record and corrupt version fail closed; stale cached analysis cannot inherit
  a changed descriptor. Assembly fields, when present, bind the selected exact
  word endpoints and analysis revision; no real assembly is produced/restored
  to a synthetic final review in this ticket.
- Native playback follows the actual HTML video clock, clamps seeks and pauses
  at the immutable source end. Exact end events no longer re-seek indefinitely.
  Native frame callbacks/listeners/thumbnail consumers close before URL release;
  fake-only timers never drive actual media. Pending source preview reads its
  actual metadata duration instead of displaying the public ceiling as duration.
- Cached local selection/closing is journaled without delaying selection motion.
  Local analysis/build/render never dispatch to the synthetic adapter. No final
  download or simulated real success is exposed. Real privacy copy discloses
  fixed expiry, eviction and disk survival, instead of claiming no File reads.
- Grant keyrings are canonical 32-byte base64url keys, bounded to four, with the
  active key validated during explicit composition. Retired true upload/render
  flags and public protected/paid composition are rejected. JSON consent errors
  map to safe 400 responses. Clock rollback during abuse verification is checked
  again before spend. Tests force new grant/budget gates off at module load.

Implemented ownership and limits:

- `apps/frontend/src/features/media` owns runtime File/URL, worker protocol,
  actual capability/track inspection, 1-MiB OPFS source writes, quota formula,
  versioned <=8-MiB IDB journal and one fixed two-hour workspace. At most eight
  opaque artifact references are allowed. Actual fingerprint/codec buffers are
  bounded; there is no whole-source ArrayBuffer/base64 or IDB video duplicate.
  Source admission enforces inclusive 15s..20min AND <=500 MiB before paid work.
- Native portrait H.264/AAC configuration plus actual small encode/mux/decode
  are probed before local readiness. OPFS, IDB, reliable Web Locks or codec
  denial blocks readiness. A memory fallback is deliberately not enabled
  because the complete fallback output path is not proved; this follows the
  ticket's fail-before-paid-work branch rather than narrowing public limits.
- `apps/backend/src/admission` reserves four one-use action slots per grant,
  exact-origin/CSRF authentication, bounded rate/capacity/process-dispatch budget,
  and nonce/request-digest terminal/uncertain tombstones through expiry. Capacity
  never evicts live replay protection. Underlying transport retains its active
  slot until it settles even after abort. Adapter contract is exactly one call
  and zero automatic retries; lost content is not stored/replayed/refunded.
- Default grant flag and dispatch budget are off/zero. Even explicitly enabled
  local foundation composition uses a rejecting abuse port and no paid provider
  adapter. Secure host-only grant routes do not trust forwarded protocol headers.
  Actual same-origin audio/provider transport belongs to CL-007/015. Receipt
  integrity is not authorization, durable coordination or proof of unseen source.

Fresh local synthetic browser evidence, separate from the full-bound spike:

- On the measured Windows in-app Chromium runtime, generated a 20-second
  H.264/AAC fixture and selected it through the actual drop handler. Existing
  local owner performed probe/inspection/fingerprint/copy/journal publication;
  the canonical card showed actual native 1280x720 playback, 20.010667s duration,
  and a truthful unavailable-analysis state. No original reached the backend.
- Refresh reopened/decoded the committed source and returned paused source
  preview with no synthetic analysis or download. A second tab was refused
  without deleting the source; after the first closed, Reconnect acquired the
  lock and recovered the same file. Clear followed by refresh returned empty
  intake. Fixed TTL/corrupt/clock/quota/partial-state cases additionally have
  deterministic injected tests; these are not actual eviction/private-mode proof.
- The actual shared player ran immutable [5s,18s] from the generated source:
  observed 5.278157s while playing, then paused at exactly 18s. This validates
  playback binding, not real candidate AI or a completed cut/compositor.
- Desktop/default, 1024x600 short laptop, 768x1024 tablet and 390x844 phone
  viewport checks preserved the bounded central portrait/glass controls and no
  horizontal overflow (effective DOM widths 1020/764/386 include scrollbar width).
  These are responsive viewport checks under the owner's demo verification scope.
  Real-mode privacy dialog was checked. Visual owner approval, screen reader,
  full 200% zoom/forced-colors and motion accessibility remain unchecked.
- Product-path proof used a temporary synthetic-only config-injected route
  with the real `SampleExperience`, not an alternate workflow or deployed
  backend/provider E2E. That route was removed before the final build. The
  pre-existing port-4000 process served stale public config, so normal `/start`
  readiness on that process is not claimed. Owner app listeners were preserved;
  no origin/config/port workaround is shipped. The opt-in 4185 spike server was
  stopped, agent test tabs closed, viewport reset, and synthetic OPFS/measurement
  artifacts explicitly cleaned. Proof screenshots outside Git contain only
  generated test media.

Final root verification after code settled: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`
(311 tests: 11 root, 38 contracts, 85 backend, 177 frontend) and
`corepack pnpm build` all passed. Contract/browser negative boundaries and
pre-import network interception passed. Production routes contain no temporary
proof route. `git diff --check` passed. Markdown is excluded by the format gate;
repository-installed Markdown AST parsing passed for all 21 changed/new
documents after the owner-directed verification-policy cleanup.

Owner verification decision (2026-10-01): automated checks, measured
desktop-browser behavior and responsive viewport emulation are the demo gate.
No hardware certification or cross-engine matrix is required. Keep capability
probes, explicit unsupported states and truthful limits on public claims.

Remaining unchecked observations are private-mode/actual eviction/freeze/resource
pressure, owner
release/support/visual/accessibility decisions, MPL distribution notices,
rights/provider-transfer/privacy/spend approval and deployed transport/restart/
rollout guarantees. No universal support, public paid enablement or CL-006 work
is inferred. Concurrent owner-authored startup/README/AGENTS edits were preserved
and are not claimed as this implementation's changes. Nothing staged/committed.
Revalidation was requested in the same human-authorized side chat after this
settled handoff; no independent verdict is inferred from sending the request.

### R3 cross-tab disposal correction (2026-10-01)

The side chat's newly reported early Web Lock release was independently
confirmed. `BrowserWorkspace.dispose()` aborts its lifetime before draining the
worker, queued writes and an already-started clear. The lock adapter had kept
an acquisition abort listener that released the granted lease at that first
abort. Generation fencing prevented publication, but did not serialize already
started storage work against another tab.

`workspace.lock.ts` now detaches acquisition cancellation as soon as a lease
is granted. The owner explicitly releases that idempotent lease only after its
existing worker-stop/write/clear waits and journal closure. Pending or refused
acquisition still aborts and closes its advisory channel; a late callback after
cancellation returns without retaining a lock. Release notifications cannot
precede draining merely because the lifetime signal was aborted.

Five focused regressions were added in `workspace.lock.test.ts` and
`browser.workspace.test.ts`. They exercise the actual lock adapter with delayed
worker stop, an in-flight journal write and an already-started clear transaction;
another acquisition remains refused until disposal drains and closes the journal.
They also cover abort after grant, abort before/during acquisition, late callback
cleanup and idempotent release/notification. Temporarily restoring the old abort
path caused three new regressions to fail; restoring the repair passed all
18 tests across these two files. No app restart, real media, provider, paid,
cloud or Git action was needed.

The settled correction passed all five root gates: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`
(316 tests: 11 root, 38 contracts, 85 backend, 182 frontend) and
`corepack pnpm build`. `git diff --check` and ticket Markdown AST parsing passed.
This supersedes the earlier 311-test gate for the current implementation.
The R3 finding is independently resolved by the R4 pass below. This correction
does not grant release approval or close the remaining feasibility observations.

### R4 independent revalidation (2026-10-01)

The same human-authorized side chat reviewed the settled unstaged/untracked
implementation and owning documentation. Its combined changed-file fingerprint
`E2B9E598B04B502CE993A0A7D980CB777ECDF9BCC0C2C52099C4ECA6C2D50BC1`
was stable at review start/end; the staged index was empty. Unrelated
owner-authored startup/AGENTS/root README work was excluded from its verdict.

Verdict: **Meets ticket with concerns** for the implemented local foundation;
**No actionable findings**. The reviewer independently resolved R3 after
inspecting acquisition cancellation, explicit idempotent release, disposal
draining and journal closure. Previous typing, integration, admission/config and
resource-closure dispositions remained resolved; stale-contract diagnostics
remained retracted rather than suppressed.

The reviewer independently ran
`corepack pnpm --filter @clipbuilder/frontend exec node ../../node_modules/vitest/vitest.mjs run src/features/media/workspace.lock.test.ts src/features/media/browser.workspace.test.ts`:
2 files / 18 tests passed. The 316-test root gate, synthetic-browser observations
and old-path mutation check remain main-chat execution evidence, not new side-chat
full-suite/browser reruns. No file, index, configuration, app-process, provider,
paid, cloud or later-ticket mutation occurred in that review.

The implementation-validation loop is clean on that snapshot. Local foundation
verification is not whole-packet completion: actual storage/lifecycle/resource-
pressure observations, final audio/deployed transport and owner/license/rights/
visual/accessibility/privacy/spend/release decisions remain open as recorded.
No staging, commit, CL-006 execution or public paid approval is inferred.

## Phase 1: feasibility before committing the implementation choice

- [x] Pin proposed Mediabunny/runtime versions, inspect MPL-2.0 and any AAC WASM/
      FFmpeg build licenses, and obtain installation/download approval first.
- [x] With approved synthetic local media, prove range preview, worker decode,
      incremental OPFS write/read/delete and a small portrait H.264/AAC
      encode/mux/reopen/playback validation. This is a spike, not CL-011.
- [ ] Before a feasibility go, exercise a generated 20-minute source near the
      500-MiB ceiling outside Git and exact independent limit boundaries;
      extract full audio and export a 60-second 1080x1920 H.264/AAC range with
      bounded queues/memory. Include cancellation, reload, background suspension
      and output validation. Agree measurable time/memory/responsiveness/sync
      thresholds first; unperformed storage/lifecycle observations remain open.
- [x] Probe exact source/target codec configurations, not just API presence.
      Record unsupported platforms honestly; native AAC fallback is conditional.
- [x] Demonstrate bounded queues/backpressure/resource closure; no whole-source
      ArrayBuffer/base64, full-source frame cache or hidden IDB video duplicate.
- [ ] Establish quota working-set formula from source + bounded audio/assets/
      output/scratch/reserve; exercise denial, eviction and mid-write failure.
- [ ] Compare a full-bound audio transport profile: 20min 16kHz mono 16-bit WAV
      is 38,400,000 bytes plus headers and exceeds HTTP/1 Cloud Run's 32-MiB cap.
      Prove end-to-end HTTP/2 or a quality-preserving compressed profile with
      actual duration/body validation; never silently add transcription calls.
- [x] Record measured desktop-browser environment, procedure, licenses and
      explicit conditional go/no-go. Small synthetic tests alone cannot prove
      full-duration performance, transcription quality or active-speaker quality.
- [ ] Obtain owner decisions for local disk-retention disclosure, supported
      release claims and no-shared-store paid deployment guarantees
      before those real/privacy/public paths are enabled.

No-go blocks downstream assumptions. A remote original-video upload, server
render fallback, silent WebM export or generic-crop substitute is not authorized.
Audio profile/hosting conclusions may remain conditional until CL-006/015 proof,
but the implementation must expose the unavailable state and name the gate.

## Phase 2: local workspace and intake

- [x] Retain selected File in one runtime artifact owner; inspect container,
      actual supported tracks/duration/dimensions/rotation and byte limits.
      Filenames are neither persisted nor transmitted.
- [x] Immediately preview via owned Blob URL, then stream one copy into OPFS
      when storage is supported and enough estimated working space exists.
- [x] Implement bounded versioned IndexedDB journal; transaction completion,
      not individual request success, commits metadata. OPFS/IDB publication
      uses pending/ready status and orphan reconciliation, not pretend atomicity.
- [x] Use opaque artifact IDs/epochs, one exclusive cross-tab mutation owner,
      stale-result fencing and content-safe errors. BroadcastChannel does not
      replace a lock. Fail closed for persisted mutation without reliable locking.
- [x] Implement owner-approved two-hour logical expiry and active/next-open cleanup.
      Tab close cannot promise immediate physical deletion.
- [x] Memory-only fallback proceeds only when the entire bounded source/output
      path is viable. Refresh asks re-selection plus validated source identity;
      wrong-source cached results are rejected. Otherwise fail before paid work.
- [x] Clear/replacement/cancel fence new results, stop requests/workers, close
      codecs/frame/audio/file handles and URLs, delete all known artifacts and
      keep bounded content-free cleanup intent for partial deletion.
- [x] Preserve the legacy cleanup-marker compatibility until safe migration is
      proved. Never clear unrelated origin storage or erase an existing user's
      dirty work.

Measured copy progress is local preparation, not a fictional network upload.
Provider-wait progress remains elapsed/indeterminate; fake mode alone can show
its simulated percentages. No valid download is implemented by this ticket.

## Phase 3: protected-admission foundation without a store

- [x] Use short-lived authenticated HttpOnly/Secure/SameSite grants bound to an
      issuing process boot epoch; validate expiry/version/key/size/origin/CSRF.
- [x] Atomically reserve an action in a bounded process-local ledger before any
      asynchronous paid dispatch. Include action kind, nonce, request digest,
      expiry and terminal/uncertain tombstone; never content in logs/URLs.
- [x] Keep reservations through grant expiry. Refuse capacity overflow rather
      than evicting replay protection. Restart invalidates old grants.
- [x] Validate current grant/action, actual bounded input, rate/capacity/budget
      and action-bound Turnstile before spend; cheapest-first rejection.
- [x] Set exact adapter call budgets and automatic retry=0. Lost/disconnected/
      timed-out paid results consume the action; do not refund/resubmit blindly.
- [x] Prepare integrity-receipt/provenance contracts for normalized later
      provider results; a receipt is not an atomic ledger or trust in browser
      source metadata. No provider integration or live verification here.
- [x] Prove concurrency, conflicting replay, stale cookie, restart, timeout,
      cancel and partial-clear outcomes with injected fake clocks/transports.
- [x] State process-lifetime-only guarantees. No cross-replica exactly-once,
      durable monthly/per-person counters or lost-content recovery is claimed.
      Public paid mode stays off until owner-approved safeguards are evidenced.

No DB/Redis/object-store exception is inferred. A single configured instance or
encrypted cookie cannot be presented as distributed atomic coordination.

## File-level migration and fix plan

Inspection identified real mismatches to repair **during CL-005**, not this
documentation pass. Add modules only when their first implementation arrives;
paths for new modules below are proposed owning areas, not scaffolding.

| Existing files / new owning area | CL-005 change and verification |
| --- | --- |
| `packages/contracts/src/media.schema.ts` and `contracts.test.ts` | Replace GCS-only `objectGeneration` with validated local source identity/revision semantics; preserve exact bounds/rotation/codec checks. Never import File/OPFS/Node/application types into contracts. |
| `packages/contracts/src/api.schema.ts`, `operation.schema.ts`, `assembly.schema.ts`, `index.ts`, contract boundary tests | Separate local artifact availability from backend admission/provenance; retire future signed upload/playback/download and server-job assumptions. Define only foundation contracts now, provider endpoints when their ticket arrives. Migrate synthetic fixtures atomically where necessary. |
| `apps/frontend/src/features/session/session.types.ts`, `session.reducer.ts`, `session.selectors.ts` and reducer/regression tests | Model local intake/preparation and local artifact references in the existing machine. No second workflow; distinguish local work from protected remote actions. Keep one selection and direct Confirm export; migrate upload/render stage hints deliberately. |
| `session.persistence.ts`, `session.reconciliation.ts`, `session.provider.tsx`, `session.effects.ts` and persistence/lifecycle tests | Keep content-free legacy sessionStorage projection/cleanup bridge; add validated IDB/OPFS artifact hydration. Browser artifacts become review/recovery authority, not mandatory backend-owned bundles. Old fake projections remain safely recoverable or explicitly cleared; no auto-spend on restore. |
| Proposed frontend media feature: local artifact owner, workspace journal, OPFS adapter, capability probes and worker protocol | Narrow named responsibilities, one cleanup owner; versioning/quota/epoch/partial-write tests and browser integration proof. No general utils/services bucket or empty future render tree. |
| `apps/frontend/src/features/sample/development.input.ts`, `sample.experience.tsx`, `sample.api.ts`, `development.progress.ts` and tests | Introduce real local media adapter alongside explicitly fake behavior; current fake path discards selected File and reads none. Do not silently make fake mode transmit media. Derive config/capability gates without duplicate constants. |
| `portrait-player.tsx`, `use-range-playback.ts`, `candidate.review.tsx`, `candidate.evidence.ts` and review tests | Supply locally owned source playback and immutable range clamp/end/reset; retain glass controls and layout motion. Fake placeholder playback remains clearly synthetic. No real final-review/download claim until later pipeline. |
| `apps/frontend/src/app/api/sample/[...path]/route.ts` and tests | Keep the fixture-only 8-KiB JSON/5-second route scoped to fake development. Never turn it into an unbounded audio/file proxy. Design a separate bounded same-origin transport foundation if required; actual audio endpoint is CL-007. |
| `apps/backend/src/config/env.schema.ts`, `loadConfig.ts`, `loadConfig.test.ts`, root `.env.example` | Remove media-feature dependency on `GCP_PROJECT_ID/GCP_REGION/TEMP_MEDIA_BUCKET/MEDIA_JOB_NAME`; migrate server FFmpeg/Python/weights/storage/job config and legacy upload/render feature meaning. Keep later hosting config private and independent. Examples, schemas, tests and public capability semantics change together; no ignored env file read. |
| `apps/backend/src/app.ts`, HTTP composition and proposed admission/grant modules | Compose fake/protected boundaries explicitly, no listen/provider effect on import. Fixture Map/cookie remain fake-only, not production grant. Introduce no GCS adapter, cloud media job or persistent result store. |
| `apps/backend/src/demo/sampleSession.ts`, `sampleAnalysis.ts`, `sampleManifest.ts`, frontend `session.test-fixtures.ts`, fake operations and associated tests | Preserve deterministic baseline/call counts; migrate actual generation/capability/state fields together with shared schemas and reducer identity comparison, not unrelated fixture prose. |
| Frontend/backend package READMEs, root README, source of truth, ops guides | Document implemented local capability/persistence/admission guarantees and unchecked downstream gates; update exact new commands/versions only when they exist. |
| Package manifests and `pnpm-lock.yaml` | Add only approved proven dependencies at their owning workspace; no native stack retained merely because old planned schema named it. Re-run dependency direction and license inventory. |

Current state is not a bug in the fake demo: it deliberately simulates media.
The mismatch is a migration requirement for real mode, not permission to rewrite
all prior modules or claim the new architecture already runs.

## Downstream ownership

- CL-006: production incremental audio extraction and browser audio/visual
  active-speaker feasibility; no native backend media job.
- CL-007: protected bounded transcription/grounded selection requests, receipts,
  browser-cached results and real candidate integration, subject to paid consent.
- CL-008: production selected-range speaker/focus worker using CL-006 go proof.
- CL-009: protected visual planning/images; locally owned cards/assets/manifest.
- CL-010: shared-compositor read-only preview parity with transcript/edit notes.
- CL-011: complete local H.264/AAC MP4 encoding/mux/validation/download.
- CL-012/013/014: controls/privacy audit, responsive/visual/accessibility/film
  quality and exact repository release audit.
- CL-015: actual hosting/proxy/audio transport, restart/rollout/rate/capacity/
  cost guarantees and authorized deployment/provider validation. No GCS CORS,
  bucket lifecycle, Cloud Run media jobs or server render gate survives.

## Acceptance and focused verification

- [x] Original video remains local, candidate playback uses actual immutable
      ranges and no transcript is shown before preview selection.
- [x] All declared source bounds and unsupported-format/capability failures
      happen before a paid request; no limit or output-format drift.
- [ ] Incremental OPFS/IDB publication, refresh, quota/eviction/private mode,
      two tabs, wrong-source selection and expired/corrupt versions are covered.
- [x] Fake upload/build/render still complete without File reads or external
      calls; real mode has no fake fallback or premature download.
- [x] Cleanup ownership covers every request/worker/listener/timer/handle/
      frame/audio/URL/temporary artifact; partial intent survives restore within
      the documented storage-availability limits.
- [x] Admission replay/races/stale grants/restart and uncertainty are fail-closed
      within precisely documented process-local guarantees.
- [x] Rejected intake/admission assert transcription/text/image counts exactly
      zero; no cloud/job adapter is called or created.
- [x] Shared schemas/config/session fixtures migrate together; contracts remain
      browser-safe and cross-app/Node negative boundary tests still pass.
- [ ] Named feasibility results, license/rights/owner decisions and
      unresolved audio/provider/hosting gates are recorded, not inferred.

Run focused contracts/config/session/media/admission/flow tests while iterating.
Final gate after changes settle:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

Add real-browser synthetic storage/range/codec tests and responsive desktop/tablet/
phone/short-height viewport states appropriate to the implemented foundation.
Use the measured desktop runtime for full-bound codec/performance proof.
Check secret/content leakage, dead/debug code, duplicate
schemas/flags, dependency direction, cleanup and `git diff --check`.

## Completion and commit boundary

Report changed files, exact commands/manual states, dependency versions/licenses,
measured feasibility results, truthful storage/admission/recovery guarantees,
deviations and every remaining owner/rights/visual/runtime/provider/paid/hosting
item. Update evidence only for checks actually performed. This packet is not
complete because the old fake gate passed or because the plan is documented.

Keep local-media foundation and its necessary contracts/state/config/admission
migration together; do not absorb full downstream pipelines. Suggested subject:
`CL-005: establish and validate browser-owned media`. Separate authorization
is required for staging/commit/push and every external or paid action.
