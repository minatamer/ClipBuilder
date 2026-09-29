# CL-011 — Render and deliver the final clip

Status: Planned<br>
Milestone: M5 — final render and delivery<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-005 and CL-010<br>
Blocks: CL-012<br>
Suggested commit: `CL-011: render and deliver the final clip`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Deliver the complete confirmed-manifest-to-result feature: deterministic crop,
visual, caption, headline, audio, and FFmpeg compilation; one render operation;
output validation; result playback; short-lived download authorization;
failure/retry/refresh; and final clear/cleanup.

This packet combines compiler and orchestration/result because neither is a
user-complete or independently trustworthy feature. The boundary is one frozen
manifest entering a safe compiler and one validated downloadable MP4 leaving
the system.

## Portfolio value

Close the end-to-end proof with a real, inspectable artifact: the same edit the
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
- Model/user text never becomes a command, path, filter expression, font, URL,
  or arbitrary style. ASS and headline text are escaped and compiled from
  bounded normalized content.
- Speaker crop, visual timeline, caption grouping, safe zones, and headline/card
  rules must match CL-010 preview semantics.
- Output is downloadable only after ffprobe and bounded frame/audio checks pass.
  Invalid/partial output is deleted and never signed.

## Dependency evidence required

- CL-005 must provide private storage, generation-safe write/delete/signing,
  render marker/lease primitives, grant ownership, and complete clear behavior.
- CL-010 must provide the validated canonical manifest plus golden parity inputs
  for word times, captions, focus/crop, visuals, headline/cards, and history.

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
  full-frame/overlay/card visuals, always-on captions, bounded headline, and
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

- [ ] Resolve word IDs/times/caption corrections and build deterministic 2–7
  word caption groups with punctuation/pause/speaker rules and safe line bounds.
- [ ] Escape ASS overrides/braces/newlines and use bundled licensed fonts only.
- [ ] Convert validated focus segments into rotation-aware, clamped/even,
  headroom-safe 9:16 crop/scale/pad plans with cut/ease/hold semantics.
- [ ] Compile full-frame/PIP/lower-card visual timelines, fixed motion/
  transitions, and headline/cards so captions remain topmost.
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

- `editor -> render-confirmation -> rendering -> result | render-failed`;
  Back to edit consumes no allowance before confirmation.
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
- Owner/cloud authorization is required for actual Cloud Run/GCS render
  evidence; local synthetic fixtures remain default verification.

## Acceptance criteria

- [ ] A canonical manifest produces a playable 1080×1920 H.264/AAC MP4 within
  measured duration/sync/size/profile tolerances.
- [ ] One-face/wide/cut focus, full-frame and overlay/card visuals, captions,
  headline, safe zones, and audio match preview semantics and golden evidence.
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
  headline/card, audio-profile, and manifest-hash tests.
- [ ] Render synthetic/licensed fixtures and validate first/middle/final frames,
  sync, streams, duration, size, captions, focus, visuals, and metadata.
- [ ] Run process/output success/failure/abort/timeout/cancel/exact-cleanup tests.
- [ ] Run render/download API tests for validation, replay, conflict, one-output,
  invalid output, expiry, retry evidence, and clear partial deletion.
- [ ] Run frontend confirmation/progress/failure/result/download/clear/restore
  tests and manual phone/desktop playback.
- [ ] Run live/cloud render only with explicit authorization; otherwise record it
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
- Cloud/spend authorization before actual Cloud Run/GCS execution or public
  enablement. Deterministic local/fake implementation may complete first.

## Commit boundary

Keep compiler, job orchestration, output validation, result/download, and final
clear together as `CL-011: render and deliver the final clip`. Do not split the
same artifact lifecycle or absorb public hardening/deployment. No Git/cloud
action is authorized by this packet.

## Precision references

- [Render confirmation and result UX](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#68-render-confirmation-and-progress)
- [Render API and download authorization](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1116-post-v1renders)
- [Render compiler/profile/validation](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1312-deterministic-render-profile)
- [Cleanup ownership](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#148-cleanup-ownership)
- [Media unit/integration verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2010-media-unit-and-integration-tests)

## Completion handoff

Report the locked render profile, compiler/parity behavior, golden/rendered
fixture results, output validation, idempotency/allowance, result/download/
cleanup states, cloud/live evidence if authorized, changed files, exact checks,
and every rights/profile/cloud blocker.
