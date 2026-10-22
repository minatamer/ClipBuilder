# CL-019 — Process several selected moments from one local source

Status: implemented and locally verified; owner authorized fake/synthetic implementation, validation loops
and ticket commits on 2026-10-22. No paid/provider/cloud/real YouTube calls.
Dependencies: CL-017 usable local source/runtime; CL-018 manual/AI range
identities; current CL-008/009/010/011 assembly, preview and output-validation
machinery.

## Objective and value

Select three or more manual/AI moments from one conversation and build an
automatic edit for every selected moment. Keep each clip independently
reviewable, editable later and exportable. The owner submits a bounded local
work list instead of repeating the entire upload/analysis flow for each clip.

## Proposed scope and ownership

Read the [research](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md). Own the
local frontend selection/progress/result list, backend per-clip orchestration
and admission, renderer local workload scheduling/lifecycle, and owner
contracts. Reuse one imported source and validated transcript. Do not convert
the public single-selection reducer, disposable cloud intent or four-operation
allowance into a batch service. No multi-source projects, distributed/durable
queue, background service, auto-publishing or combined montage.

Adopted scope: up to ten clips in one workspace, one heavy native worker (two
require later capacity evidence) and one active AI provider request. Original
planning proposal: at most two concurrent local
media jobs and one active AI provider request. Measure total renderer tab/thread
concurrency, CPU, RAM and scratch use; do not multiply per-render defaults by
job count without a global budget. Settled limits require synthetic capacity
evidence. All selected clips progress after one action; actual parallel
rendering is enabled only on a proven local resource profile. Report a
one-worker fallback honestly rather than calling it simultaneous rendering. The
owner can review one completed clip while other selected clips continue
processing.

## Contracts, state, cleanup and re-editability

One workspace/source owns a bounded ordered list of stable clip IDs. Each clip
binds source revision, range origin, assembly/edit revision, asset references,
render revision and output identity. States: selected → queued → preparing →
review-ready → rendering → ready, with per-clip failed/canceled outcomes.
Repeated submission of the same operation/revision is idempotent. A changed
revision creates a distinct explicit operation, not an automatic retry.

Each output is a separate MP4 with a neutral collision-safe name. Give each clip
its own preview/download/progress/cancel action and the work list a cancel-all.
One clip failing does not erase siblings or silently retry it. Completed clips
remain usable. Canceled queued work never dispatches; running work aborts and
drains owned children, network and temporary files before reporting
cancellation.

Retain the admitted local source/normalized selected material and editable
manifest for the workspace lifecycle, including after export. Source/master
cleanup is workspace-owned, not first-render-owned. Reference-count shared
artifacts; never delete a source/picture while a sibling or render snapshot uses
it. Export snapshots are immutable. A later edit marks the prior export stale
but keeps its saved file; generate a new revision on explicit export. Crash
recovery follows CL-017's retention choice and never silently replays paid work.

For an imported YouTube source, use the validated saved download from CL-023 as
the owner input. Later clips, fresh workspaces and application restarts reuse
that file rather than acquiring it again. Close/expiry removes derived scratch,
not the retained source in Downloads; editor-draft persistence remains separate.

## Provider and spend policy

For N distinct selected clips: at most one source transcription and one
discovery call per initial source run, then one selected-range planning call per
clip and at most three image-generation attempts per clip under the existing
visual policy. Reserve the whole action's upper bound before starting; show N
and the estimated operation bound to the owner. Discovery and manual ranges
share the transcript. No per-clip source retranscription, automatic retry,
unbounded image generation or borrowing public admission allowance.

Changing selection, reading results, reopening review, downloading and later
manual caption/picture changes make zero AI calls. Re-export uses deterministic
local compute. Provider/cloud approvals remain independent; this plan does not
increase paid budgets or authorize agent-paid acceptance. Default local media
jobs must never fall back to Cloud Run. Keep all telemetry content-free.

If a later planner, image or render operation fails, the saved source remains
reusable for siblings and future sessions. A fresh session may need a new
explicit AI analysis under the separate draft-retention policy, but it must not
reacquire the source. Source reuse and reuse of paid AI results are different
capabilities.

## Acceptance and verification

- [x] One synthetic source with two manual moments and one AI moment produces
      three distinct, correctly ranged/revision-bound edit bundles and MP4s.
- [x] Prove the selected one-worker fallback with overlapping queued work,
      bounded representative memory/scratch and continued UI review. Two
      simultaneously rendering jobs remain explicitly unverified.
- [x] One queued cancellation, one in-flight failure and one successful sibling
      have isolated outcomes, exact call counts and no source deletion race.
- [x] Duplicate actions, reload/reconnect, stale revisions, cancel-all and close
      dispatch no duplicate provider/render work and leave no owned
      process/scratch.
- [ ] Export clip A, then edit/re-export A and render B; source remains usable,
      outputs remain distinct, and final workspace close removes only owned
      scratch. Deterministic re-export/source/cleanup portions pass; actual
      presentation editing is completed and rechecked in dependent CL-020/024.
- [x] AI/assembly/render failure never deletes or marks an intact saved source
      for download again; siblings and a new workspace reuse the same local
      input.
- [x] Unit/integration tests use synthetic fake/paid-off ports with exact
      transcription/discovery/planner/image/render counts and external network
      denied.
- [x] Run focused checks, synthetic native workload, root five gates and public
      artifact exclusion proof. Human A/V quality/concurrency responsiveness
      remain separately recorded manual checks.

## Documentation and remaining gates

Local workflow/render/composition guides, cost bounds, cleanup ownership,
source of truth and index are updated with actual implementation evidence.
`FAKE_MODE=true` and `PAID_DEMO_ENABLED=false` need no keys/ADC and produce
fictional transcript/plans/pictures with real local native MP4 encoding. No
live owner provider adapter or offline AI weights/runtime exists. Real AI
requires further adapter implementation, keys, live flags and applicable
rights/transfer/spend approval; paid testing is owner-only. Real quality,
maximum 4K/300-second capacity and two-worker responsiveness remain unchecked.
The owner authorized these local synthetic tests, hidden launches and commits;
no provider/cloud/deployment/real YouTube processing is authorized.

## Local execution and validation — 2026-10-22

- Stable per-clip base/source/analysis identities, one serial heavy worker,
  bounded operation receipts, whole-action disk reservation and independent
  immutable export revisions are connected to the owner UI/control/worker.
  Upper bound is N plans plus 3N picture attempts; this runtime makes zero
  actual AI calls. Read/review/re-export never reruns analysis or planning.
- Native proof creates three distinct 30/60/300-frame H.264/AAC portraits,
  validates clocks/frame counts/full decode, samples source-color transitions,
  picture/caption presence and absence, and re-exports without new fake AI work.
- Browser keyboard checks cover three selections, queued cancellation and
  explicit resume, review during sibling work, reload without reprocessing,
  playback and immutable prior download links. A real native child was observed
  before canceling an export: canceling → canceled, all three prior exports
  retained, sibling re-export ready, plan/image counts unchanged.
- Representative 180-sample owned process-tree profile on this 16 GiB/12 logical
  CPU Windows machine: peak RSS 846,688,256 bytes, 238 threads, 6.71 sampled CPU
  cores, 65,749,656 logical scratch bytes (hardlinks counted conservatively).
  This supports the one-worker fallback for the measured synthetic workload,
  not the maximum declared input or two parallel native renders.
- Validation found and fixed a preview video CSS sizing mismatch, delayed
  cancellation targeting a later job, and cancel-all racing admission. Checks
  cover unique operation IDs, frozen inputs and cancel-before-admission zero
  dispatch. Revalidation and final gate results follow below.
- Browser Clear removed disposable workspace data, protected shutdown returned
  204, and CIM creation-identity checks found zero owned processes/native
  survivors or 4100/4200 listeners after stabilization. Capability and scratch
  were removed; private runtime/launch logs, screenshots and resource report
  remain outside Git. Retained masters/captures were untouched.

Read-only revalidation pass: current combined unstaged implementation and new
files, no staged changes. TL;DR: the packet delivers independent bounded local
automatic edits, review/cancellation and immutable re-exports; interactive edits
belong to CL-020. Verdict: meets this packet's implementation scope, with no
actionable findings after the cancellation-admission fix. Covered: identities,
one-worker admission, exact budgets, duplicate/stale actions, failure/cancel
isolation, retained source, fixed shared preview/native overlays and cleanup.
Partial cross-packet criterion: change presentation then re-export (CL-020/024).
Unverified: real AI, maximum-size/two-worker capacity and owner A/V quality.
Inspected contracts, UI, host/use case, worker/RPC, native media/raster lifecycle,
build/lockfile changes and focused regression/proof code. Focused owner tests:
43 passed. Required final gates are recorded separately; this review does not
authorize live processing. Owner additionally requested a CL-017–019 real-mode
compatibility pass after this packet, before continuing to CL-020.

Final gates: `owner:test` 43/43; `owner:build` passes; `owner:proof` 3/3 native
proofs; root `format:check`, `lint`, `typecheck`, `test:unit` and `build` pass.
The root suite passes 1,299 tests across 115 files. Two existing frontend import
tests initially hit their 5-second limit while checks overlapped; rerunning the
unchanged suite after native work completed passed. No timeout was relaxed.
`owner:artifacts` passes over 1,490 built files plus Docker/compiler roots.
Windows standalone retains the existing 26 external package links and
`selfContained:false`; this is not a target Linux deployment proof. Generated
Next type-import noise was restored. No credentials, real media, paid/provider,
cloud or YouTube retrieval were used. No deviation beyond the explicitly adopted
one-worker fallback and the CL-020 cross-packet edit criterion.
