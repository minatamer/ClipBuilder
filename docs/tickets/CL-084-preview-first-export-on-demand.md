# CL-084 — Preview-first preparation and export on demand

Status: implemented and locally validated; no actionable findings.
Owner real-mode acceptance and any hosted release remain pending.

## Owner intent and authorization

Reduce unnecessary production video processing while retaining the current AI,
editing functionality and original-source MP4 quality. The owner approved the
research recommendation: prepare an editable live preview first and create a
finished MP4 only after an explicit Export action. The owner will test actual
paid/provider mode personally. This changes when the first export happens, not
the available editing features, AI output acceptance or final composition.

Local source/documentation edits, synthetic checks and execute/validate/fix loops
are authorized. G Cloud is off limits: no CLI/Console access, credential use,
cloud inspection/mutation, allocation changes, cloud builds, deployment or paid
provider requests. Resource recommendations below use repository evidence only;
any later cloud change needs the owner's explicit approval. Git staging/commit
approval for the preceding completed work does not authorize new Git mutations.

## Authority and dependencies

- `AGENTS.md`, including frontend instructions, privacy/network-blocked tests,
  verified local worker reload, design/footer/preview-readiness rules.
- [Source of truth](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md): CL-084 preview-first
  decision; CL-054 completed-state/preview gate; CL-060 advisory Gemini quality
  critiques; CL-061 shared local/hosted editor; CL-070 original-source output;
  CL-078 caption generation/word clocks; CL-079 alpha; CL-081 requested duration.
- CL-054/061/063/070/078/079/081/082/083 are implemented in the current source.
  Baseline `c0029df` has a clean index/worktree. Existing owner/hosted acceptance
  gaps are not prerequisites for synthetic implementation and are not waived.

## Baseline execution evidence and intended behavior

`OwnerClipBatch.pump` prepares AI plans/assets/base, then always calls native
`operation=clip`. `renderOwnerClip` creates a cached 1080x1920/30fps browser
playback MP4, rasterizes React overlays and encodes a final MP4 from the original.
The baseline editor required a completed output. Applying edits saves metadata;
exporting an edited revision performs another full render. Unchanged downloads
already reuse completed outputs.

Target: same AI preparation -> validated playback preview -> editable clip with
no output -> Apply/Discard as today -> explicit Export -> existing final renderer
-> Download. An unchanged initial clip can also be exported directly. There is
no automatic export after preparation, Apply, caption generation, navigation,
refresh, draft reopen or retry of failed preview preparation. Export failure can
be explicitly retried using retained AI work. No automatic provider retry.

## Scope and file-level implementation plan

1. **Shared native contract and readiness receipt.** Extend the existing fixed
   `packages/contracts/local/index.ts` job/result unions with a bounded
   clip-preview operation, clip/source/cut binding and measured frame/byte/time
   result. Add optional preview receipt to the existing clip schema for legacy
   saved-clip compatibility. A receipt alone never enables an active/failed clip.
   Do not introduce provider/env/Node dependencies into contracts.
2. **Extract existing preview preparation.** A renderer-owned `clip-preview.ts`
   owns the existing source/cut binding, hash-checked preview cache and byte bound.
   Reuse `ownerPreviewCut` without modifying FFmpeg options, clocks, resolution,
   codec or quality. Dispatch preview jobs in `apps/renderer/local/server.ts`.
   Final `clip-render.ts` retains the same final algorithm and may ensure/reuse
   the preview for legacy/direct jobs; preview-only jobs never launch Chromium,
   rasterize overlays or create final MP4s. Keep cancellation/partial-file cleanup.
3. **Separate batch preparation and export work.** `clip-batch.ts` queues explicit
   preparation versus final-render work. Retain all existing AI plan/image/focus
   behavior and paid-result reuse. Validate the preview receipt before publishing
   review-ready. Only explicit render/export or retry of an actual failed export
   creates an output revision. Retry after failed/canceled preparation must finish
   missing preparation/preview without invoking completed AI steps or exporting.
   Preserve single-worker ordering, cancellation, revision binding, capacity and
   unchanged-output/operation-id reuse. Distinguish preparation from export
   cleanup so a failed preview cannot delete a retained export.
4. **Existing editor/footer integration.** Update `clip-readiness.ts` to accept a
   validated preview-ready clip without a final output, preserving legacy clips
   with completed outputs. Keep queued/preparing/exporting/canceling/failed/
   canceled controls hidden. Retain initial native playback spinner/retry before
   settings, all current caption/picture/filter/focus controls and keyboard rail.
   Existing footer shows Export clip until a matching output exists, then
   Download clip. Dirty Apply/Discard remains authoritative. No new product UI,
   tutorial text, counters, animations, route bypass or separate AI mode.
5. **Draft/restore and compatibility.** `draft-store.ts` must save, verify and
   reopen preview-only clips with zero outputs; reject a declared completed
   preview whose file is missing or whose recorded byte count is inconsistent.
   Keep existing saved exports, legacy clips and alpha assets readable without
   AI/native dispatch. Preserve retained sources and private diagnostics.
6. **Meaningful regression/proof updates.** Update existing batch, readiness,
   contract/native-worker, editor/draft and hosted-shaped tests/proofs for the
   explicit-export boundary. Existing final-render proofs must explicitly request
   export rather than silently relying on eager processing. Extend an existing
   browser/native proof with nonempty captions, pictures and focus to verify the
   intended real-mode-shaped behavior through actual native rendering.
7. **Owning documentation.** Update the source of truth, narrow backend/frontend
   guides and hosted release preparation/index with delivered behavior, exact
   evidence, this packet's owner test checklist and unapplied resource proposals.

## Acceptance and failure cases

- Fresh synthetic and provider-shaped preparations keep expected AI call counts,
  validated playback and identical base/edit/asset inputs, with **zero final
  render calls and zero output revisions** until explicit export.
- One explicit first export produces one native final render and one output,
  from the original with the current source-resolution/frame-rate profile. No
  transcription, selection, plan or image calls are repeated by export/retry.
- Apply/Discard, caption text/generation, alpha pictures/timing/motion, filters,
  camera/people focus, navigation and reopened preview-only drafts still work.
- Existing matching downloads do not encode again. Conflicting/stale requests,
  busy clips, bounded revisions/capacity and idempotent operation receipts retain
  their protection. No need for the first export to have prior outputs.
- Bad/failed/canceled preview remains unavailable for editing; explicit retry
  reuses completed paid work. Failed/canceled exports preserve prepared previews,
  edits, assets and earlier outputs and retry only the requested render stage.
- Preparation-only batches can be closed/discarded without a final render.
  Session cancellation/expiry/exit removes only owned temporary work. No new
  listeners/timers, cross-instance session assumptions or retained-media deletion.
- Inspect actual desktop/390/320 loading, preview failure/retry, ready-without-
  output, dirty, exporting, export failure/retry and download footer states.

## Verification and execute/validate loop

Start with affected batch/readiness/draft/native contract unit checks and types;
fix implementation against those results. Then run the local unit suite once,
affected frontend/backend/local/test/no-ambient-Node contract type checks,
affected lint/format and whitespace checks. Run the existing current-source
browser/native editor proof (synthetic media, nonempty injected captions/pictures
and framing), a preview-only native receipt proof and explicit first-export /
failure-retry paths. Proofs compile current-source worker/overlay in owned scratch.
Use all existing hardcoded test/fake/paid-off/no-network protections; no ignored
env reads, real media, provider credentials, cloud resource or runtime downloads.

Perform read-only validate on the settled ticket diff, independently verify/fix
any actionable findings with execute, rerun only affected checks, and validate
again until no actionable findings remain. Record exact checks, limitations and
scope. Do not invent successful provider, Linux maximum-load or cloud acceptance.
Rebuild contracts/worker and reload only the normal backend with verified owned
lifecycle; preserve frontend/config/media. Leave the normal app ready for the
owner's manual review, without changing fake/live switches.

## Cost interpretation and resource review (proposal only)

For four clips edited once then exported, final render count changes 8 -> 4.
Four unchanged clips exported remain 4 -> 4. Four prepared clips never exported
change 4 -> 0. AI/input/proxy/preview work remains. This removes actual native
overlay/encode work; these counts are not measured total CPU or dollar savings.

The hosted release guide proposes 4 vCPU/16 GiB, always-allocated CPU, min zero /
max one instance; it explicitly records that allocation as unapplied. The worker
uses background work and ephemeral scratch in the API instance. A 12 GiB scratch
ceiling plus processing memory motivates 16 GiB; the old tiny proof (~930 MiB)
does not establish production maximum capacity. Removing one render does not
remove the peak memory requirement for the remaining final render. Do not lower
RAM/CPU or flip request-only billing on this evidence.

Owner approval candidates after measurement: (a) stop unnecessary hosted idle
polling while stable/backgrounded, retaining mutations/status/expiry; (b) assess
a smaller bounded workload and allocation using current Linux maximum-load
proofs; (c) only if idle billing dominates, separately design a lightweight API
and request-scoped processing with protected temporary-media handoff/cleanup.
No new service, queue, bucket, billing setting or allocation is part of CL-084.
Do not overbuild the demo or imply the proposed source configuration is live.

Seeking, direct-original browser playback, proxy resolution changes, WebCodecs,
GPU/hardware encoding, Remotion upgrades and renderer replacement are deferred
independent optimizations. Keeping native media commands unchanged protects this
ticket's quality/functionality comparison.

## Owner real-mode acceptance (unchecked)

- [ ] Owner chooses normal real mode using existing configuration/approvals;
      agent does not change switches or trigger paid actions.
- [ ] Owned/licensed source -> AI moments -> selected clips -> AI captions,
      framing and contextual pictures appear in a playable editor before export.
- [ ] Unchanged clip: Export then Download works. Edited clip: captions/word
      corrections, transparent/manual pictures, timing/motion, filters and camera
      focus behave as before; Apply/Discard and source-quality MP4 match preview.
- [ ] Preparation/export failure and explicit retry reuse completed AI work;
      no unexpected duplicate paid requests. Preview-only draft reopens locally.
- [ ] Owner judges real AI quality, visual/audio fidelity, perceived latency and
      actual spend. No synthetic result is real-provider acceptance.
- [ ] Future owner-approved hosted release: current-feature Linux image proof,
      maximum workload/capacity, actual identity/Turnstile/session/cleanup and
      measured Cloud Run billed CPU/GiB time; cloud settings remain unchanged now.

Suggested future commit subject: `CL-084: prepare editable previews before explicit export`.
This is not staging/commit authorization.

## Implementation and verification evidence — 2026-10-26

- Added fixed `clip-preview` job/result and optional measured preview receipt;
  the worker extracts the existing cache/binding/hash/byte checks into
  `apps/renderer/local/clip-preview.ts`. FFmpeg options, source/output clocks,
  preview profile and final crop/filter/overlay/encoding commands are unchanged.
  Normal provider inputs, AI plans/images/focus and provider acceptance are
  unchanged. There is no new dependency, runtime setting or cloud route.
- Batch work explicitly distinguishes preparation from export. Successful
  preparation publishes review-ready, preview bytes and zero final outputs;
  initial `calls.render` stays zero. Native preview retry does not repeat AI or
  export. First export and failed-export retry retain the exact prepared base,
  edits and assets. Only export work can remove its failed output artifact.
- Existing footer/controller logic already supports Export without a latest
  output. The readiness helper now admits measured previews while retaining all
  active/failed/canceled and initial decode gates and legacy output-backed clips.
  Draft validation binds a declared preview to actual saved raw bytes and base
  frame count; preview-only drafts round-trip with no exports. Agent and HTTP
  legacy export checks explicitly request their initial render now.
- Focused initial gate: **60 tests pass** across batch/readiness/drafts/hosted
  workflow/provider compatibility/editor API. They include bad operation/frame/
  duration/oversized preview receipts, no export before preview, first-export
  failure/retry, cancellation, completed-plan/image reuse and zero-output drafts.
- Full local unit run initially passed **575/576**: the remaining older provider
  test submitted a 300-second manual range despite CL-081's 60-second ceiling.
  Corrected that fixture to 60 seconds without altering production behavior;
  **28 provider/worker-diagnostic checks pass**, and the editor API's **6 tests**
  pass with its properly hoisted nonempty-caption fixture. Final gate below.
- `test/owner-handoff.proof.ts`: **2 native proofs pass**. A real FFmpeg preview
  succeeds with no Chromium/bundle configuration; cache reuse preserves mtime,
  rebound cuts and changed bytes fail. Injected Gemini-shaped transport + real
  native provider inputs preserve nonempty captions/generated pictures/focus;
  receipts stop at clip-preview and no final/art files exist before export.
  Explicit first export/re-export reuse preview mtime and AI call counts.
- `test/owner-hosted-editor.proof.ts`: passes in **39.28s**. Actual shared upload,
  preview-first editor, caption confirmation/failure/retry/text clocks,
  transparent/half-alpha pictures, Capture boundary/seek/buffer/error/busy guards,
  Apply and native MP4 blending/timing all pass. It asserts zero final jobs
  throughout pre-export edits, then exactly one final job. Desktop/390/320
  screenshots/geometry include empty, consent, text, pictures, queued/preparing/
  exporting/canceling, failed/canceled and initial decode states. Inspected
  ignored `cl084-empty-1440.png`, `cl084-text-320.png` and
  `cl062-rendering-390.png`: visible footer, readable controls, no overflow.
- `test/local-focus-editor.proof.ts` passes on current source, retaining pointer,
  playback, keyboard, Apply/Discard and responsive focus coverage.
- `test/owner-batch.proof.ts` passes in **116.72s**: three independent measured
  previews with zero outputs, explicit exports, real decoded caption/picture/
  monochrome pixels, immutable output history, saved restore, agent edits/export/
  cancellation, offline reopen and fresh manual retry through browser controls.
  Current-source overlay compilation and owned scratch/teardown are retained.

Harness fixes required to exercise current behavior: standard `vi.mock` hoisting
replaces an unrecognized alias so caption fixtures are actually nonempty;
legacy batch expectations now reflect CL-066's one transcription per source and
CL-070's source-sized filled portrait rather than old letterbox pixels. Pixel
checks normalize the display canvas, sample actual caption intervals and compare
plain video backgrounds; picture/caption/filter assertions remain. The browser
proof now waits for enabled Export after Apply acknowledgment, preventing a test
click on the transient disabled action; a cleared bounded diagnostic timer makes
future export stalls actionable. No application encoding/quality was changed to
make a proof pass.

Windows sandbox temporary-file sharing/atomic renames prevented normal Vitest
execution. Checks ran through the explicit unsandboxed tool permission with the
same fake/paid-off/no-network setup. A workspace-temp experiment was discarded;
test storage remains outside Git. Corepack's sandbox cache was also unavailable;
the normal cached pinned package manager built contracts/current worker outside
the sandbox with Corepack networking disabled. No package download was needed.

Normal backend-only reload captured ten owned identities, stopped/drained the
supervisor/tree and verified ports 4000/4200 released through two stabilization
checks. New supervisor **26824**, backend **5728**, worker **28636** are ready;
frontend **17564** / supervisor **10400** remained running. Health, `/start`,
`/api/sample/config` and local capabilities GETs return **200**. The existing
configuration now reports `provider-ai`; no switch/configuration was changed or
paid action triggered. Content-free runtime ownership and separate backend logs
remain under OS temp `clipbuilder-run-20261026` (`runtime.json`,
`cl084-backend-shutdown.json`, `backend-20261026-124159.*.log`).

Current owner real-mode walkthrough, personal visual/audio/AI acceptance,
current-feature Linux packaged image/maximum capacity, actual hosted identity/
Turnstile/lifecycle and billed cost comparison remain unchecked. The Linux probe
source was updated to request its first export explicitly, but no Docker image,
cloud build or deployment was run. Smaller resource profiles, seeking, idle
polling and all cloud changes remain separate proposals. No staging or commit.

## Final gate and read-only validate result

Final settled local unit gate: **576/576 tests in 57 files pass** (44.01s).
Existing dependency/contract negative gate: **27/27 pass**, including no ambient
Node globals and allowed published/local contract directions. All **five**
relevant synthetic native/browser proof cases pass: provider handoff/preview
cache (final rerun 2/2 in 24.35s), hosted editor (1/1), focus editor (1/1), and
multi-clip/draft/agent/fresh-flow proof (1/1). Affected ESLint/Prettier, local,
test, backend, frontend and no-ambient-Node contracts TypeScript checks pass.
Contracts and current native worker/overlay builds pass. Diff whitespace and
planned text/path/credential-shape checks pass; the index remains empty.

Read-only validation scope: combined CL-084 unstaged/untracked diff against
baseline `c0029df`, full packet/owning decisions, current native/HTTP/provider and
draft call sites, footer readiness and final-render argument preservation.

**TL;DR:** preview preparation now stops before full rendering; explicit export
retains the current source-quality renderer and completed AI work. Owner paid
acceptance and hosted/cost gates remain open exactly as planned.

**Verdict: Meets ticket. No actionable findings.**

| Requirement | Coverage |
| --- | --- |
| Measured preview first, zero initial final-render jobs/outputs in both AI metadata modes | Covered by unit, provider-shaped native and hosted browser proofs. |
| Same AI preparation, caption clocks, assets/focus and explicit retry reuse | Covered; no provider adapter/prompt/config change, exact injected call counts preserved. |
| Explicit first export and immutable matching downloads/history | Covered by native/API/agent proofs; final renderer and FFmpeg options remain unchanged. |
| Editor controls, Apply/Discard, playback/preview failure, responsive/footer and active-state gates | Covered by existing browser/native proofs and inspected synthetic screenshots. |
| Preview-only and legacy saved-clip compatibility, source/hash/frame/byte bounds | Covered by draft/readiness/native cache tests and saved restore/reopen proofs. |
| Failure/cancel/expiry/owned cleanup, privacy and dependency direction | Covered by existing local tests/proofs, boundary negatives and settled diff inspection. |
| Repository-only resource proposal, no G Cloud or external processing | Covered; no credentials, cloud CLI/Console/API, allocation change or paid call. |
| Actual Gemini/real-media quality, personal visual/audio acceptance and paid cost | Unverified, owner-only checklist above. |
| Current-feature packaged Linux maximum workload, hosted auth/lifecycle and billed savings | Unverified; deferred release/cost gates, no cloud access authorized. |

No application scope deviation. Seeking/idle polling/resource changes remain
separate proposals. Test compatibility corrections above were necessary to run
the existing regression against already-implemented CL-066/070/078/081 behavior;
none changes the app's modes, AI acceptance or encoding quality. The failed proof's
identified synthetic workspace and workspace-temp experiment were cleaned after
verifying its old listener absent. Current successful proofs drain owned browser,
server, worker and scratch resources. Normal owner services remain running.
