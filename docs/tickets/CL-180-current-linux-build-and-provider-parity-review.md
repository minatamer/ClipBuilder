# CL-180 — current Linux builds and provider parity review

Owner instruction, 2026-10-31: build fresh Linux frontend/backend production
images and verify packaged upload/editor/export in fake mode without paid calls
or deployment. The subsequent owner request adds a read-only Codex/Gemini
comparison before one owner-run real Gemini test. Baseline is `fe6dd74`.

Status: local production builds and offline packaged checks complete. Provider
parity findings remain recommendations; live Gemini and public release are open.

Follow-up: [CL-181](CL-181-gemini-provider-parity.md) implements the three parity
recommendations, refreshes current Linux backend proof and switches local Gemini
under the next explicit owner instruction. This packet's comparison remains
historical baseline evidence; owner real Gemini/public acceptance stays open.

## Scope and boundaries

Depends on committed CL-168–179. Reuse the closed contexts from
`scripts/prepare-app-image.mjs`, the non-root offline image runtime probes and
`scripts/verify-hosted-editing-linux.mjs`. Use anonymous Docker configuration;
only public build dependencies may be downloaded. Runtime/proof containers have
no network, credentials, owner media/configuration or published ports. Preserve
the running Windows app/session, private logs and retained media.

Allow narrowly necessary synthetic proof wiring fixes only after reproduction;
record file allocation before editing. No product parity changes are requested
yet. No provider inference, real search/download, ignored environment access,
cloud inspection/change, registry submission, push, deployment or Git mutation.
Fresh local image builds are not public release acceptance.

## Acceptance and file allocation

- [x] Fresh closed Linux/amd64 production frontend and backend images build.
- [x] Their actual packaged non-root offline runtime probes pass.
- [x] Current-source synthetic hosted upload/editor/native MP4 export,
      cancellation/retry, quota and cleanup proof passes at the documented
      2-CPU/8-GiB and 5376-MiB scratch profile. State sample/capacity limits.
- [x] Verify container/process cleanup; preserve normal local app availability.
- [x] Record provider parity findings and owner-only live Gemini coverage.
- [x] Read-only validate and report exact artifacts/checks and remaining gates.

Initial owned files: this ticket, `docs/tickets/README.md`, and
`docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md`. Generated contexts,
bundles, synthetic fixtures and logs stay outside tracked source. No application
source edits or new dependencies are planned.

Confirmed proof allocation: `scripts/verify-hosted-editing-linux.mjs`. The
original current-source Linux run reaches the editor, then fails at its stale
Pictures top-level tab selector (8.06s). Update the proof to Media and explicitly
select Caption Style for its font edit. Keep all upload, render, decoder,
cancellation, reuse, quota and cleanup assertions. No application code changes.

Confirmed application allocation: `apps/renderer/local/clip-render.ts`. After
the selector repair the packaged export fails. The packaged FFmpeg 5.1.9 rejects
the explicit `overlay:ts_sync_mode=default` option introduced in CL-166; generated
color-frame reproduction exits 1 with that option and 0 with it omitted. Use
the implicit default supported by both pinned Linux and local Windows binaries;
preserve the native frame/art/audio clock, all codec/quality settings and bounds.
Rebuild the closed backend image, rerun Linux upload/export and current-source
visual/audio synchronization proof, then reload the normal internal worker
through verified lifecycle ownership. This supersedes the initial no-app-edit
plan only for the confirmed preflight failure, not provider parity changes.

## Provider comparison — read-only at baseline

Shared: broad search before fallback, common public raster retrieval, Find
visuals, visual timing/coverage and Pop cues, hook/title/edit/export behavior.
Find all is local-only for either provider. Codex's local CPU speech preparation,
temporal image sheets, CLI search execution and brand-blue progress checklist
are intentional differences; Gemini consumes audio/video through its API and
has an actual raster-generation fallback rather than Codex's local illustration.

Confirmed parity concerns for a separate owner decision:

1. Gemini manual-only analysis still prepares/transcribes the full source;
   only Codex supplies `analysis.transcribeCut` for a bounded manual window.
2. Gemini initial preparation's `decodeOwnerVisualPlan` strips supplied
   alternate search briefs. The shared Find visuals decoder preserves them.
   Synthetic identical input produces one picture in each decoder, zero
   alternates in Gemini and one in Codex. Codex's decoder also has richer
   field/rule diagnostics and normalization than Gemini's initial decoder.
3. Gemini's framing prompt still asks for face/upper-body boxes and the first
   visible person. Codex explicitly requests tight head boxes and strong visual
   evidence for the opening speaker. Both use the same camera compiler; this
   is an instruction gap, not proof of a bad real Gemini crop.

Focused existing provider-adapter suites: 54 fake/no-network tests pass. First
sandbox attempt failed in its virtual temporary Vitest cache before tests ran;
the same suites pass outside that cache boundary. A standalone decoder probe
needed bundling and workspace package resolution; its final synthetic comparison
passes without provider/media/network work. No provider parity fixes were made.

Fake/no-key tests verify orchestration and native media mechanics, not live
Gemini grounding, editorial quality or physical-device acceptance. The owner
now intends one real Gemini run with the configured key, live flags and existing
approvals. It has not been performed by this ticket or by an agent.

## Linux execution evidence

Both allowlisted contexts were prepared afresh from baseline plus the documented
renderer compatibility fix. No ignored environment/configuration, real media,
private diagnostics, unit/proof test modules or authoring captures entered the production build
contexts. Anonymous Docker configuration used public build-software downloads
only. Docker was already running and is left running; no unrelated container
was touched. The Linux engine has 12 CPUs and 8,118,747,136 bytes physical memory.

| Artifact | Local image ID | Build | Offline runtime |
| --- | --- | --- | --- |
| Frontend | `sha256:82c020f1783c03a5b8216f1e5f3bb7d8e9e02167d3e5e8cda1c15c9540e32e24` | 96.48s | Pass, 1.87s |
| Backend with compatibility fix | `sha256:800b7992cadcd61282ccdd01a06b54cda948c1e51906e96d4063e4627ab4fbd6` | 52.19s | Pass, 2.27s |

The original backend build also completed (178.14s) and passed startup, but its
native export failed. Its image `sha256:b027c18d3b2649739996c8d875771bcb1e877b96098871979a23007f4f76cbfe`
is historical red evidence, not the candidate. The stale-selector failure and
subsequent 129.88s export failure were reproduced before the respective fixes.
The tiny packaged-FFmpeg reproduction reports `Option 'ts_sync_mode' not found`
with the explicit default and succeeds without it. No binary/model upgrade,
retry, quality/cadence or application resource-limit change was needed.

Current source was bundled into fresh proof/UI scratch, using the actual
packaged worker/overlay, FFmpeg and Chromium. All runtime/proof containers used
non-root, read-only root, no network, no published ports, 2 CPU, 8,589,934,592-byte
memory/no-swap caps, 5376-MiB `/tmp`, 256-MiB shared memory and bounded home.
Both actual app entry probes verify paid-off, zero AI calls/media sessions.

- **Packaged browser/native walkthrough passes, 34.28s:** 8,388,731-byte chunked
  disk upload and SHA-256 source binding; explicit fictional captions and an
  uploaded synthetic picture; caption font/position, picture position/motion,
  timed text, decoded monochrome filtering and H.264/AAC MP4 export. Explicit
  cancellation, retry with retained preparation, post-export demo quota,
  exit/expiry cleanup and source-height preservation pass.
- **Maximum upload-byte variant passes, 50.76s:** 524,288,000-byte disk-selected
  synthetic upload through the same editor/export/cleanup flow. Peak sampled
  container RAM 1,964,023,808 bytes (about 1.83 GiB), logical scratch
  1,052,364,726 bytes, largest reservation 3,074,499,193 bytes. OOMKilled false;
  every memory-event counter is zero. Verified scratch volume 5,637,144,576 bytes.
  A separate 32-MiB tmpfs returns ENOSPC after 33,550,336 bytes and preserves a
  retained synthetic file. No completed app media was pruned.
- Each walkthrough has exact fake counts: transcription 1, caption request 1,
  AI moment selection 0, plan 1, generated image 0, inspection 1, preview 1 and
  final-native attempts 4 (one deliberately canceled). External attempts 0.
  Native encoding is real; provider responses are fictional injected results.
- **Current-source Windows visual/audio proof: 2 tests pass.** Decoded image and
  sound onsets remain synchronized at 24/25/29.97/30/60fps, including a Hook
  beginning within an image. Delayed/missing image preview behavior also passes.
  Its fresh overlay is independent of the normal app's ignored build.
- Local TypeScript (`tsc --noEmit -p tsconfig.local.json`), scoped ESLint with
  zero warnings, Prettier and whitespace checks pass. Production image builds
  compile current backend/contracts/composition/frontend/worker artifacts.

The fixture is four seconds of generated 160x90 video; the larger upload uses a
valid MP4 free box. Native exports are one second at 52x90, not full-duration
4K, maximum manual-cut duration or every maximum retained-history combination.
The Docker VM's physical RAM is smaller than its configured 8-GiB container cap;
no full-memory stress or exact cloud latency/cost claim is made.

## Preservation, validation and remaining gates

Before the normal worker refresh, verified the owner workspace idle and captured
the backend supervisor/watcher/descendant creation identities. Graceful/tree-aware
shutdown plus identity-checked survivor cleanup and stabilization released
4000/4200. The frontend PID 4968/3000 was preserved. Normal backend startup rebuilt
contracts/current worker using unchanged owner configuration. New supervisor
23944, API 9704/4000 and worker 7980/4200 belong to the recorded tree. Health,
`/start` and `/api/sample/config` return 200. Recovery retains the same one idle
validated-revision clip, 14 assets, two visuals and two audio cues. No normal
processing action was invoked. All CL-180 proof containers are removed.

Read-only validate: **Meets Linux verification scope; no actionable findings in
the compatibility/proof fixes.** Reviewed the exact renderer/proof diff, owning
allocation, current image/proof identities, frame/audio evidence, fake/network
boundaries, immutable quality settings, privacy and process/container cleanup.
The three provider parity concerns above remain explicitly open rather than
being counted as fixed. The read-only review changed no implementation.

Evidence records/logs, outside Git:

- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl180-linux-1a4d30f4cca74f089be0d217892821e5/`
- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl180-app-e519a016c14a41da92d97cf7f820cae3/backend.runtime.json`
- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl180-app-e519a016c14a41da92d97cf7f820cae3/backend.stdout.log`
- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl180-app-e519a016c14a41da92d97cf7f820cae3/backend.stderr.log`

Deviations: the confirmed FFmpeg compatibility fix and stale synthetic selectors
were necessary to complete the authorized preflight. No provider parity change,
provider switch, paid call, cloud inspection/change, stage/commit/push, registry
submission or deployment occurred. Scoped changes remain unstaged for review.

The owner intends one real Gemini session. Existing key/live/transfer/image/master
approvals and deliberate owner action are still needed. Grounded image search,
actual AI editorial/visual/framing quality and physical-device acceptance remain
unverified. Actual hosted resource/mount/background-CPU/lifecycle/capacity/cost
confirmation, authorized source packaging/push and rollout remain separate.

## Subsequent packaging authorization

CL-183 records the owner's subsequent whole-file plan, authorized local staging/
commits and fresh current-source Linux builds/offline packaged checks. Historical
uncommitted/older-image statements above retain their original handoff meaning.
The latest aggregate artifact evidence is in CL-183 and release preparation;
no new provider call, cloud action, push or deployment is part of packaging.
