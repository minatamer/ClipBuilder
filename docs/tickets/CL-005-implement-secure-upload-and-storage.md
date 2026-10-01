# CL-005 - Establish browser-owned media and protected admission

Status: Planned; feasibility-first, real/public enablement gated<br>
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
All implementation/spike/owner acceptance boxes below remain unchecked.

## Phase 1: feasibility before committing the implementation choice

- [ ] Pin proposed Mediabunny/runtime versions, inspect MPL-2.0 and any AAC WASM/
      FFmpeg build licenses, and obtain installation/download approval first.
- [ ] With approved synthetic local media, prove range preview, worker decode,
      incremental OPFS write/read/delete and a small portrait H.264/AAC
      encode/mux/reopen/playback validation. This is a spike, not CL-011.
- [ ] Before a feasibility go, exercise a generated 20-minute source near the
      500-MiB ceiling outside Git and exact independent limit boundaries;
      extract full audio and export a 60-second 1080x1920 H.264/AAC range with
      bounded queues/memory. Include cancellation, reload, background suspension
      and output validation. Agree measurable time/memory/responsiveness/sync
      thresholds first; actual device results remain pending until performed.
- [ ] Probe exact source/target codec configurations, not just API presence.
      Record unsupported platforms honestly; native AAC fallback is conditional.
- [ ] Demonstrate bounded queues/backpressure/resource closure; no whole-source
      ArrayBuffer/base64, full-source frame cache or hidden IDB video duplicate.
- [ ] Establish quota working-set formula from source + bounded audio/assets/
      output/scratch/reserve; exercise denial, eviction and mid-write failure.
- [ ] Compare a full-bound audio transport profile: 20min 16kHz mono 16-bit WAV
      is 38,400,000 bytes plus headers and exceeds HTTP/1 Cloud Run's 32-MiB cap.
      Prove end-to-end HTTP/2 or a quality-preserving compressed profile with
      actual duration/body validation; never silently add transcription calls.
- [ ] Record device/browser matrix, measurement procedure, licenses and explicit
      go/no-go. Synthetic tests cannot prove full-duration performance, physical
      phone thermals, transcription quality or active-speaker quality.
- [ ] Obtain owner decisions for local disk-retention disclosure, supported
      release devices/claims and no-shared-store paid deployment guarantees
      before those real/privacy/public paths are enabled.

No-go blocks downstream assumptions. A remote original-video upload, server
render fallback, silent WebM export or generic-crop substitute is not authorized.
Audio profile/hosting conclusions may remain conditional until CL-006/015 proof,
but the implementation must expose the unavailable state and name the gate.

## Phase 2: local workspace and intake

- [ ] Retain selected File in one runtime artifact owner; inspect container,
      actual supported tracks/duration/dimensions/rotation and byte limits.
      Filenames are neither persisted nor transmitted.
- [ ] Immediately preview via owned Blob URL, then stream one copy into OPFS
      when storage is supported and enough estimated working space exists.
- [ ] Implement bounded versioned IndexedDB journal; transaction completion,
      not individual request success, commits metadata. OPFS/IDB publication
      uses pending/ready status and orphan reconciliation, not pretend atomicity.
- [ ] Use opaque artifact IDs/epochs, one exclusive cross-tab mutation owner,
      stale-result fencing and content-safe errors. BroadcastChannel does not
      replace a lock. Fail closed for persisted mutation without reliable locking.
- [ ] Implement proposed two-hour logical expiry and active/next-open cleanup.
      Tab close cannot promise immediate physical deletion.
- [ ] Memory-only fallback proceeds only when the entire bounded source/output
      path is viable. Refresh asks re-selection plus validated source identity;
      wrong-source cached results are rejected. Otherwise fail before paid work.
- [ ] Clear/replacement/cancel fence new results, stop requests/workers, close
      codecs/frame/audio/file handles and URLs, delete all known artifacts and
      keep bounded content-free cleanup intent for partial deletion.
- [ ] Preserve the legacy cleanup-marker compatibility until safe migration is
      proved. Never clear unrelated origin storage or erase an existing user's
      dirty work.

Measured copy progress is local preparation, not a fictional network upload.
Provider-wait progress remains elapsed/indeterminate; fake mode alone can show
its simulated percentages. No valid download is implemented by this ticket.

## Phase 3: protected-admission foundation without a store

- [ ] Use short-lived authenticated HttpOnly/Secure/SameSite grants bound to an
      issuing process boot epoch; validate expiry/version/key/size/origin/CSRF.
- [ ] Atomically reserve an action in a bounded process-local ledger before any
      asynchronous paid dispatch. Include action kind, nonce, request digest,
      expiry and terminal/uncertain tombstone; never content in logs/URLs.
- [ ] Keep reservations through grant expiry. Refuse capacity overflow rather
      than evicting replay protection. Restart invalidates old grants.
- [ ] Validate current grant/action, actual bounded input, rate/capacity/budget
      and action-bound Turnstile before spend; cheapest-first rejection.
- [ ] Set exact adapter call budgets and automatic retry=0. Lost/disconnected/
      timed-out paid results consume the action; do not refund/resubmit blindly.
- [ ] Prepare integrity-receipt/provenance contracts for normalized later
      provider results; a receipt is not an atomic ledger or trust in browser
      source metadata. No provider integration or live verification here.
- [ ] Prove concurrency, conflicting replay, stale cookie, restart, timeout,
      cancel and partial-clear outcomes with injected fake clocks/transports.
- [ ] State process-lifetime-only guarantees. No cross-replica exactly-once,
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
- CL-012/013/014: controls/privacy audit, physical-device/visual/accessibility/film
  quality and exact repository release audit.
- CL-015: actual hosting/proxy/audio transport, restart/rollout/rate/capacity/
  cost guarantees and authorized deployment/provider validation. No GCS CORS,
  bucket lifecycle, Cloud Run media jobs or server render gate survives.

## Acceptance and focused verification

- [ ] Original video remains local, candidate playback uses actual immutable
      ranges and no transcript is shown before preview selection.
- [ ] All declared source bounds and unsupported-format/capability failures
      happen before a paid request; no limit or output-format drift.
- [ ] Incremental OPFS/IDB publication, refresh, quota/eviction/private mode,
      two tabs, wrong-source selection and expired/corrupt versions are covered.
- [ ] Fake upload/build/render still complete without File reads or external
      calls; real mode has no fake fallback or premature download.
- [ ] Cleanup ownership covers every request/worker/listener/timer/handle/
      frame/audio/URL/temporary artifact; partial intent survives restore.
- [ ] Admission replay/races/stale grants/restart and uncertainty are fail-closed
      within precisely documented process-local guarantees.
- [ ] Rejected intake/admission assert transcription/text/image counts exactly
      zero; no cloud/job adapter is called or created.
- [ ] Shared schemas/config/session fixtures migrate together; contracts remain
      browser-safe and cross-app/Node negative boundary tests still pass.
- [ ] Named feasibility results, license/rights/device/owner decisions and
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

Add real-browser synthetic storage/range/codec tests and manual desktop/tablet/
phone/short-height states appropriate to the implemented foundation. Unit
mocks or responsive viewport emulation do not replace actual device codec/
performance proof. Check secret/content leakage, dead/debug code, duplicate
schemas/flags, dependency direction, cleanup and `git diff --check`.

## Completion and commit boundary

Report changed files, exact commands/manual states, dependency versions/licenses,
measured feasibility results, truthful storage/admission/recovery guarantees,
deviations and every remaining owner/rights/visual/device/provider/paid/hosting
item. Update evidence only for checks actually performed. This packet is not
complete because the old fake gate passed or because the plan is documented.

Keep local-media foundation and its necessary contracts/state/config/admission
migration together; do not absorb full downstream pipelines. Suggested subject:
`CL-005: establish and validate browser-owned media`. Separate authorization
is required for staging/commit/push and every external or paid action.
