# CL-011 — Private cloud final rendering and download

## Current cloud-render packet — approved local execution, 2026-10-02

Status: locally complete; validate pass 2 has no actionable local findings. All five settled root gates and 592 synthetic tests in 60 files pass. Real-media, provider, cloud and owner gates remain deferred.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Confirm export invokes one authenticated standard Node Remotion renderer on our Cloud Run compute. Validate 1080×1920/30fps AVC/AAC 10–60s MP4/200-MiB cap and private range stream. Delete raw/proxies/assets immediately on validated output publication; output window ten minutes/session expiry. Download initiation is not completion; retry makes zero AI calls.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. The owner authorized local execute/validate loops and immediate file-level ticket-prefixed commits through CL-015 on 2026-10-03. No cloud provisioning, login, credential use, private upload, paid call, deployment or usage polling is authorized.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement and verify the locally buildable current packet.
- [x] Record local checks and all remaining rights/AI/cloud/license/device gates.

## Local execution evidence — 2026-10-03

Implemented a distinct render admission action (replacing the unused image action;
four actions total), signed frozen assembly verification, one renderer dispatch,
output metadata/generation verification and final receipt. Completed-output lookup
can restore a lost response only after a completed server action; uncertainty never
redispatches. Renderer publication deletes source/proxies before delivery and keeps
only the final generation. Output-info/content remain private; browser accesses
fixed cookie-protected output/download paths with bounded single Range streams.

Frontend journals pending/uncertain/complete final markers under the frozen source,
uses distinct rendering/result states, explicit Confirm export and indeterminate
real progress. Result uses the existing portrait/glass controls and Soon teasers.
Download is disabled until a decoded 1080 × 1920 frame/duration check; copy reports
request initiation only. Expiry, Clear and downloaded-copy limitations are explicit.
Native validation checks fixed MP4 profile/timing and representative decoded frames
and whole audio before publication. [Profile](../operations/RENDER_PROFILE.md).

Fake/no-key checks use synthetic providers, output bytes and storage/job transports;
no actual MP4 quality claim follows. Real providers require keys/live/data/paid
approvals; cloud compute/IAM/storage approval is separate. No local AI weights or
runtime are used. Native full-fixture/pixel/audio sync/parity/performance, device
playback/download, font/license/rights, numerical budget, actual image/cloud/release
and owner-only evidence remain unchecked under the owner's deferred-test decision.
These are handoff gates, not blockers to the next local packet.

Validation pass 1: Meets ticket with concerns for the locally buildable scope.
One Medium finding at backend preview/output `open`: Clear during a pending
metadata lookup could restore a stale access reference. Both independently added
gated regressions failed before the fix (returned ready after Clear). Rechecking
the signed completed-action receipt after metadata await makes both reject.
First-pass tests covered Clear after opening, not Clear during metadata lookup;
no finding was ignored. Pass 2 rechecks the complete tracked/untracked diff,
current packet, routes/composition, source/receipt/generation/range binding,
uncertainty, expiry/Clear cleanup, defaults, app boundaries and disclosures.
Verdict: Meets the locally buildable ticket. No actionable local findings.

Covered: explicit single render and zero-AI retries; private output publication
and source/proxy deletion; immutable result/journal/metadata restore; read-only
portrait result, decoded-frame download gate and truthful initiation; safe bounded
streams, cancel/expiry and resource cleanup; owning profile/config/service docs.
Unverified: the real-media/provider/cloud/owner evidence listed above.

Settled checks: `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`,
`build`, and `git diff --check` pass; 592 synthetic tests in 60 files (root 20/3,
contracts 58/5, composition 3/1, backend 190/13, renderer 45/10, frontend 276/28).
Focused final delivery/config: 41 backend checks; renderer output/profile 14;
frontend final flow 9 and workspace/bridge 38. Validate itself is read-only and
uses inspected evidence; no full suite is run inside that phase.
No app service, external request, credential access, install or deployment occurred.
Transient injected loopback listeners and owned scratch/streams clean up in tests.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned; browser-owned execution revision, external gates pending<br>
Milestone: M5 - local export and delivery<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-005 full-bound encode feasibility and CL-010 shared compositor proof<br>
Suggested commit: `CL-011: validate and deliver browser-owned MP4 export`<br>
Parent: [source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

**Execution authority:** this current packet and the linked browser contract
supersede the server-media mechanics retained below as history. No GCS,
generation/capability/lease, native media job or cloud-render acceptance item
survives by being left unchecked in that history. Preserve unchanged product,
grounding/quality, rights, secret handling, fake/off test and dependency rules.
No Git, provider, paid, install or cloud action is authorized by this document.

## Objective and boundaries

Productionize the early proved local export path: the one explicitly confirmed
immutable manifest becomes one validated 1080x1920 H.264/AAC MP4 owned by the
browser. No backend FFmpeg compiler/job, GCS output, signed download capability
or cloud-render proof. CL-005 must already have tested a 60s portrait export
from a full-bound synthetic source; do not postpone core feasibility here.

Keep direct Confirm export, shared single-card progress/review/result UI,
central video without surrounding noise, local Download MP4 and inert disabled
Soon social teasers. No OAuth/publishing, output editor, arbitrary manifest,
format/profile picker or real-mode fake success.

## Current implementation checklist

- [ ] Freeze selected range/source identity/manifest revision/hash at explicit
      confirmation; never start on mount, hydration or returning to review.
- [ ] Re-probe actual H.264/AAC encoder configurations and required local assets/
      fonts. Use the proved worker/WebCodecs/Mediabunny pipeline and only
      approved/pinned fallback codec code; not broad ffmpeg.wasm by default.
- [ ] Decode with bounded pre-roll and exact timestamp mapping, invoke the
      CL-010 shared compositor and fixed caption/visual/focus policy, preserve
      source audio/timing and enforce source/output frame/pixel/resource bounds.
- [ ] Encode with bounded queues/backpressure, close every sample/frame/audio
      resource and flush codecs. Mux via offset-correct stream writes to OPFS;
      no blindly concatenated MP4 chunks or full-source RAM copy.
- [ ] Report measured phase progress for processed samples/frames, then explicit
      mux/final validation; elapsed/indeterminate when unknown, never fake ETA.
      Finish 100% only after validated success.
- [ ] Validate bytes/container/codecs/1080x1920/duration10-60s/audio presence/
      finite samples/A-V sync and caption/focus/visual frame parity. Reopen/play
      final output before enabling Download MP4. Do not silently deliver WebM.
- [ ] Publish one ready final artifact only after complete output; journal
      partial writes and clean crash/cancel/quota failures. Failures cannot
      download a truncated file.
- [ ] Define approved failed-local-encode retry policy using the same immutable
      manifest, with zero AI rework and no additional final artifact/history.
      A browser UI limit does not enforce hostile-client download counts.
- [ ] Blob URL/download lifecycle and generic filename disclose no source name;
      revoked handles/URLs and downloaded visitor copies have distinct ownership.
      Clear cannot delete copies already saved by the visitor.
- [ ] Test duplicate confirmation, wrong source/manifest, stale workers,
      canceled/backgrounded/reloaded encode, quota/GPU/codec failure, mux flush
      failure, validation rejection and explicit same-manifest recovery.
- [ ] Re-run full-bound source/60s output performance and memory in the measured
      desktop browser, plus responsive viewport checks; record measured
      quality/time/sync against agreed thresholds.

## Verification, gates and handoff

Fake/injected tests assert zero provider/job starts for render/preview/download/
clear, plus exact local attempt/ready-artifact counts. Unit/browser media tests
must inspect actual synthetic MP4 codecs/audio/dimensions/duration/sampled pixels,
not only an .mp4 filename. Actual fixture rights/fonts/device/codec/license
gates remain separate; no secret or real media/content enters Git/evidence.

Run focused compositor/encode/mux/session/flow tests and all five root gates.
Record versions, output-validation/performance/cancel/cleanup proof, files,
commands/manual states and remaining owner/rights/visual/runtime gates.
CL-015 validates deployed runtime/model/static headers and real client output,
not a remote render job or bucket lifecycle. No extra AI/provider call is
authorized merely to validate local export.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-011 — Render and deliver the final clip

Status: Planned<br>
Milestone: M5 — final render and delivery<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-005 and CL-010<br>
Blocks: CL-012<br>
Suggested commit: `CL-011: render and deliver the final clip`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): implement and prove the render/output/
download lifecycle locally with approved fixtures and fake storage/job transports.
Use the [software guide](../operations/THIRD_PARTY_SOFTWARE.md); no GCloud setup,
credential use, Cloud Run job or GCS execution occurs here. Actual cloud render,
storage/range/download/cleanup evidence is transferred to final CL-015 and stays
unchecked. Local MP4 output is local proof, not deployed-flow proof.

Latest owner clarification (2026-10-01): CL-004 owns the complete development-
only frontend preview and its reusable screens. This packet replaces the fake
adapter with its real implementation and proves integration, media, recovery,
privacy/rights/spend/readiness gates; it does not recreate the workflow UI.
Earlier restrictions on synthetic progress apply to real/public mode, not the
explicitly labelled local preview. Fake completion is not evidence for this
packet's unchecked acceptance. See the parent development-preview clarification.

Owner UI revision (2026-10-01): render/result/download stay inside CL-004's
single changing workspace with shared tokens/progress/buttons/footer. Stage
messages must reflect operation evidence, and completion requires validated
output, never a timer-based fake success. Keep one render confirmation and
download, no editing controls. Parent section 0.6 governs layout continuity;
provider/cloud/spend/rights/release gates remain unchanged.

Deliver the complete confirmed-manifest-to-result feature: deterministic crop,
visual, fixed-caption, audio, and FFmpeg compilation; one render operation;
output validation; result playback; short-lived download authorization;
failure/retry/refresh; and final clear/cleanup.

This packet combines compiler and orchestration/result because neither is a
user-complete or independently trustworthy feature. The boundary is one frozen
manifest entering a safe compiler and one validated downloadable MP4 leaving
the system.

## Portfolio value

Close the end-to-end proof with a real, inspectable artifact: the same composition the
visitor previewed becomes a content-safe 1080×1920 H.264/AAC MP4, validated
before delivery and cleaned up with the source session.

## Standalone implementation context

- Render freezes a canonical manifest hash bound to analysis/assembly revisions
  and renderer version. Public mode allows one successful final output per
  session unless the owner changes the proposed render-count decision.
- The compiler receives only job-local paths, validated media/transcript/
  captions/focus/visual assets/manifest, and source-controlled profile/tokens.
  It returns argument arrays and a content-free plan; it never executes FFmpeg,
  reads environment/storage/HTTP, or calls AI.
- Model text never becomes a command, path, filter expression, font, URL,
  or arbitrary style. ASS text is escaped and compiled from bounded normalized content.
- Speaker crop, visual timeline, fixed caption grouping, safe zones, and card
  rules must match CL-010 preview semantics.
- Output is downloadable only after ffprobe and bounded frame/audio checks pass.
  Invalid/partial output is deleted and never signed.

## Dependency evidence required

- CL-005 must provide private storage, generation-safe write/delete/signing,
  render marker/lease primitives, grant ownership, and complete clear behavior.
- CL-010 must provide the validated immutable automatic manifest/hash plus
  golden parity inputs for word times, fixed captions, focus/crop, visuals, and
  cards.

Any semantic preview/compiler mismatch reopens the shared CL-010 boundary; it
must not be patched with a render-only interpretation.

## Files and areas owned

- Crop, ASS, visual timeline, filter graph, render-plan/argument compiler,
  output validator, and render golden fixtures/frames.
- `render` job stages and render/download use cases/routes/leases/markers.
- Frontend render confirmation/progress/failure/result/download/clear experience.
- Render profile, output validation, cost, and operations documentation.

## Scope boundaries

### In scope

- Deterministic 1080×1920 composition from focus track, podcast footage,
  full-frame/overlay/card visuals, always-on fixed captions, and
  speech-safe audio.
- FFmpeg direct spawn with pinned binaries, protocols, fonts, filter/token
  compilation, abort/timeout/cancel, and exact temp cleanup.
- Proposed measured profile baseline: H.264 `yuv420p`, square pixels, 30 fps,
  `libx264 medium` CRF 20, AAC 160 kbps/48 kHz, faststart—locked only after
  fixture benchmark.
- Render confirmation facts/rights/one-render/retention; named progress; result
  playback/facts/summary; explicit download click and clear.
- Output validation for streams, dimensions, frame rate, duration/sync, bytes,
  representative frames/captions/visual intervals/audio, metadata, generation.

### Out of scope

- AI/media re-analysis, model calls, arbitrary renderer settings, music/audio
  mixing, color grading, user fonts, remote protocols/assets, direct social
  publishing, multiple export variants, automatic render retry, or deployment.
- Changing preview semantics to fit FFmpeg. Any semantic mismatch is fixed in
  the shared parity boundary and reflected in CL-010/parent docs.

## Implementation checklist

### 1. Deterministic compiler

- [ ] Resolve immutable provider word IDs/times and build deterministic 2–7
  word caption groups with punctuation/pause/speaker rules and safe line bounds.
- [ ] Escape ASS overrides/braces/newlines and use bundled licensed fonts only.
- [ ] Convert validated focus segments into rotation-aware, clamped/even,
  headroom-safe 9:16 crop/scale/pad plans with cut/ease/hold semantics.
- [ ] Compile full-frame/PIP/lower-card visual timelines, fixed motion/
  transitions, and cards so captions remain topmost.
- [ ] Apply a measured speech-safe normalization profile with no external audio.
- [ ] Produce argument arrays/logical plan only; no shell, remote protocols,
  model strings, private path logs, or environment-dependent behavior.

### 2. Job, idempotency, and output validation

- [ ] Revalidate all revisions/references/features/allowance/capacity/Turnstile,
  freeze the manifest hash, create one marker/lease, and start/reuse one job.
- [ ] Check cancellation before/after every named stage and terminate FFmpeg
  safely on confirmed cancel/timeout.
- [ ] Validate one H.264 video + one AAC audio stream, 1080×1920, square pixels,
  expected fps/duration/bytes, decoded first/middle/final frames, audio presence,
  cue intervals, captions, and forbidden metadata before upload/success.
- [ ] Delete partial/invalid output and all temp/ASS/assets; upload only a new
  generation bound to the operation.
- [ ] Replays with same key/hash return the same operation; different manifest
  after successful public output fails `RENDER_LIMIT_REACHED`.

### 3. Confirmation, progress, result, and clear

- [ ] Show exact output duration/profile, one-render limit, retention deadline,
  rights reminder, and descriptive `Render N-second clip` action.
- [ ] Show named stages and elapsed time without fake percentage; leaving the
  page does not cancel an already-running job.
- [ ] Preserve source/manifest on failure and allow only evidence/allowance-based
  manual retry.
- [ ] Place result video first on phone, primary Download, content-safe facts and
  summary, and clear confirmation with safe default focus on Keep media.
- [ ] Issue download URL only on fresh user click for a valid active session;
  keep it memory-only, 5-minute target, content-safe filename/metadata.
- [ ] Clear source, analysis, assembly assets, manifest descriptor, output,
  operations/markers/leases, browser projection, URLs/listeners/timers, and
  report partial asynchronous cleanup honestly.

## Contracts and state transitions

- `clip-review -> render-confirmation -> rendering -> result | render-failed`;
  Back to review consumes no allowance before confirmation.
- `RENDER_CONFIRMED` atomically consumes the permitted attempt after validation.
  Successful output changes public allowance; an invalid output is never result.
- Refresh/replay reconciles the same operation/output and never starts a new
  job. Expired session cannot renew download authorization.
- Clear remains legal from render/result and clears the cookie even when remote
  deletion is partial.

## Privacy, provider, and cost constraints

- Render uses no AI provider. Turnstile/job/storage may cost, so flags,
  capacity, idempotency, max instances/tasks, and one-render allowance remain
  enforced.
- Output/source private paths, filename, manifest text, captions, transcript,
  assets, full FFmpeg command, URLs, and media never enter logs/metrics/errors.
- Suggested filename is constant/content-safe. Output metadata contains no
  source title/filename/author/comment.
- Final CL-015 with explicit owner/cloud authorization owns actual Cloud Run/GCS
  render evidence; local synthetic fixtures remain default verification.

## Acceptance criteria

- [ ] A canonical manifest produces a playable 1080×1920 H.264/AAC MP4 within
  measured duration/sync/size/profile tolerances.
- [ ] One-face/wide/cut focus, full-frame and overlay/card visuals, captions,
  safe zones, and audio match preview semantics and golden evidence.
- [ ] Compiler uses arrays/source-controlled values only; no shell, remote
  protocol, arbitrary path/filter/font/style, or model/provider call exists.
- [ ] One confirmation starts at most one render; replay/refresh is idempotent;
  failed/partial/unvalidated outputs are never downloadable.
- [ ] Result/download uses a short-lived memory-only capability and constant
  filename with safe metadata.
- [ ] Failure/retry/cancel/clear/expiry clean up all local/remote artifacts and
  report partial cleanup honestly.

## Focused verification

- [ ] Run caption/ASS escaping, crop, visual timeline, filter/argument golden,
  card, audio-profile, and manifest-hash tests.
- [ ] Render synthetic/licensed fixtures and validate first/middle/final frames,
  sync, streams, duration, size, captions, focus, visuals, and metadata.
- [ ] Run process/output success/failure/abort/timeout/cancel/exact-cleanup tests.
- [ ] Run render/download API tests for validation, replay, conflict, one-output,
  invalid output, expiry, retry evidence, and clear partial deletion.
- [ ] Run frontend confirmation/progress/failure/result/download/clear/restore
  tests and responsive phone/desktop viewport playback.
- [ ] Transfer actual cloud render verification to final CL-015; record it
  unchecked.
- [ ] Run affected lint/typecheck/build/container checks, scans,
  `git diff --check`, and status inspection.

## Documentation updates

- Add/update `RENDER_PROFILE.md`, render/development setup, licensed fonts,
  pinned binary versions, measured profile, validation tolerances, and cleanup.
- Update cost/release evidence templates for job seconds, output bytes, network,
  validation, and cleanup.
- Synchronize parent/CL-010 if preview/render semantics or profile decisions
  change.

## Owner gates and external blockers

- Owner approval of one public successful render per session and the measured
  render profile.
- Rights gate for any non-synthetic rendered evidence.
- Final CL-015 cloud/spend authorization before actual Cloud Run/GCS execution
  or public enablement. Deterministic local/fake implementation may complete first.

## Commit boundary

Keep compiler, job orchestration, output validation, result/download, and final
clear together as `CL-011: render and deliver the final clip`. Do not split the
same artifact lifecycle or absorb public hardening/deployment. No Git/cloud
action is authorized by this packet.

## Precision references

- [Render confirmation and result UX](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#68-render-confirmation-and-progress)
- [Historical render API](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1115-post-v1renders)
- [Render compiler/profile/validation](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1312-deterministic-render-profile)
- [Cleanup ownership](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#148-cleanup-ownership)
- [Media unit/integration verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2010-media-unit-and-integration-tests)

## Completion handoff

Report the locked render profile, compiler/parity behavior, golden/rendered
fixture results, output validation, idempotency/allowance, result/download/
cleanup states, cloud/live evidence if authorized, changed files, exact checks,
and every rights/profile/cloud blocker.

</details>

</details>
