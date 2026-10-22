# CL-019 — Process several selected moments from one local source

Status: queued; owner authorized fake/synthetic implementation, validation loops
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

Initial proposal: up to ten clips in one workspace, at most two concurrent local
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

- [ ] One synthetic source with two manual moments and one AI moment produces
      three distinct, correctly ranged/revision-bound edit bundles and MP4s.
- [ ] Prove the selected concurrency limit with a synthetic workload; exercise
      two overlapping active jobs, bounded memory/scratch and continued UI
      review.
- [ ] One queued cancellation, one in-flight failure and one successful sibling
      have isolated outcomes, exact call counts and no source deletion race.
- [ ] Duplicate actions, reload/reconnect, stale revisions, cancel-all and close
      dispatch no duplicate provider/render work and leave no owned
      process/scratch.
- [ ] Export clip A, then edit/re-export A and render B; source remains usable,
      outputs remain distinct, and final workspace close removes only owned
      scratch.
- [ ] AI/assembly/render failure never deletes or marks an intact saved source
      for download again; siblings and a new workspace reuse the same local
      input.
- [ ] Unit/integration tests use synthetic fake/paid-off ports with exact
      transcription/discovery/planner/image/render counts and external network
      denied.
- [ ] Run focused checks, synthetic native workload, root five gates and public
      artifact exclusion proof. Human A/V quality/concurrency responsiveness
      remain separately recorded manual checks.

## Documentation and remaining gates

Update local workflow/render guides, cost bounds, cleanup ownership, source of
truth and index. Current `FAKE_MODE=true` needs no keys and shows synthetic
single-clip results; multi-clip behavior is planned. Future native synthetic
exports can be API-free; real AI editing needs keys, enabled live flags and
rights/transfer/ spend approval with owner-only paid testing. No offline AI
weights/runtime are available. Capacity and real multi-clip quality remain
unchecked; no Git, installation, launch, provider, cloud or deployment action is
authorized today.
