# CL-006 — Build the media job and prove speaker feasibility

Status: Planned<br>
Milestone: M2 — private media foundation<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-003 and CL-005<br>
Blocks: CL-007 and CL-008<br>
Suggested commit: `CL-006: build the media job foundation`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Build the single safe media-job entry point, descriptor/progress/result
lifecycle, process and temporary-workspace foundation, authoritative ffprobe
inspection, audio extraction boundary, fake job runner, and a time-boxed
Light-ASD active-speaker feasibility spike on the exact intended sample and
deployment CPU profile.

The feasibility spike stays in this packet because it depends directly on the
same pinned container, process runner, media fixtures, cleanup, and resource
measurement. It is a real go/no-go gate, not a production feature split.

## Portfolio value

Prove the risky media/vision foundation before building live AI or automatic
clip-review work:
safe subprocesses, authoritative media limits, bounded asynchronous execution,
and evidence that the signature speaker-following claim is plausible on the
actual demo source and intended CPU.

## Standalone implementation context

- One backend/job image exposes one `media-job.ts` entry with only three
  source-controlled modes: `analyze`, `assemble`, or `render`. This ticket builds
  the common runtime and real inspection path; later tickets add remaining
  mode stages.
- A job receives only an opaque descriptor ID, reads one strict private
  descriptor, and never receives transcript, prompt, path, URL, secret, or user
  data through arguments/environment overrides.
- ffprobe/FFmpeg/Python use executable plus argument arrays, never shell
  strings. All paths are job-created inside one temp workspace.
- Progress is content-free, ordinal, monotonic, generation-guarded, and terminal
  writes are immutable. Cloud Run task retry remains zero.
- Active-speaker detection uses shot-local visible face geometry and
  audio-visual speaking evidence, never identity or diarization-to-face mapping.
- Light-ASD is the first spike target. Compare TalkNet only if Light-ASD misses
  the recorded focus/runtime target; do not replace the feature with public
  manual crop controls.

## Dependency evidence required

- CL-003 must provide schema-valid rights-statused media/transcript/focus
  fixtures and deterministic fake job timing.
- CL-005 must provide a validated private object reference/generation,
  operation ownership, cancel/clear, storage preconditions, and no-capability-
  leakage tests.

The exact sample benchmark additionally requires recorded rights approval; a
synthetic-only run cannot be relabeled as the release feasibility decision.

## Files and areas owned

- Backend `media-job.ts`, descriptor schema, progress writer, cancellation,
  cleanup, fake/Cloud Run job ports as authorized.
- Process runner, temp workspace, ffprobe parser, media inspection, and bounded
  audio extraction foundation.
- Pinned backend/job container definition and media binary/version record.
- Python vision spike entry/schema, pinned requirements, model/weights/license
  notices, benchmark script/report, and synthetic/purpose-recorded fixtures.
- Media/job integration tests and operations benchmark evidence.

## Scope boundaries

### In scope

- Strict descriptor modes/version/object references/generation/deadline/cancel
  marker/limit profile and rejection of unknown fields.
- Safe subprocess deadline, abort, signal, bounded stderr, output-size,
  network-protocol, and cleanup behavior.
- Authoritative media validation for supported MP4/WebM, H.264/VP8/VP9,
  AAC/Opus/Vorbis, one video and one usable audio stream, dimensions/pixels/fps,
  finite duration, rotation, DRM/external reference, and exact profile bounds.
- Media inspection operation and normalized `MediaDescriptor` result.
- Bounded mono speech extraction interface/fixture validation for CL-007.
- Fake job stages/status/cancel/expiry and API reconciliation of execution versus
  terminal evidence.
- Light-ASD/PySceneDetect/face tracking spike over one-face, wide two-person,
  and edited-camera sequences; runtime/memory/image-size/quality evidence.

### Out of scope

- Live transcription/candidate provider work (CL-007), production speaker-focus
  compiler (CL-008), visual planning/assets (CL-009), render compiler (CL-011),
  or cloud deployment/provisioning (CL-015).
- Public user fallback controls, identity recognition, face embeddings,
  protected/sensitive inference, persistent frame crops, multi-camera source
  selection, arbitrary Python/model execution, or platform retry.

## Implementation checklist

### 1. Job and process foundation

- [ ] Validate mode and descriptor before reading user objects or spawning work;
  never list the bucket to discover inputs.
- [ ] Implement direct-spawn process ownership with deadlines, abort/kill
  escalation, bounded pipes/stderr, safe error mapping, and `finally` cleanup.
- [ ] Disable unnecessary FFmpeg network protocols and reject model/user text in
  commands, paths, filter graphs, or environment overrides.
- [ ] Write monotonic progress and create-only/expected-generation terminal
  evidence; reconcile conflicting/missing platform evidence fail-closed.
- [ ] Check cancellation before/after each stage and clean subprocess/temp
  artifacts for success, failure, abort, timeout, and signal.

### 2. Authoritative inspection

- [ ] Parse ffprobe JSON through a bounded backend-only schema and normalize
  duration, codecs, streams, frame rate, rotation, dimensions, pixels, bytes,
  and orientation.
- [ ] Enforce 15 seconds–20 minutes AND ≤500 MiB public rules independently
  before any later provider call; owner profile remains separately gated.
- [ ] Reject missing audio, corruption, unsupported codec/container, multiple
  streams, DRM/external refs, nonfinite values, oversized geometry/fps, and
  wrong object generation.
- [ ] Delete rejected source/partial inspection artifacts best-effort and return
  only content-safe errors/evidence.

### 3. Fake job lifecycle and extraction boundary

- [ ] Implement deterministic stage sequences, injected clock, idempotent
  status/cancel, terminal immutability, expiry, and missing-result cases.
- [ ] Define extraction to one bounded job-local mono speech file; check output
  size, no-usable-audio behavior, abort, and cleanup without provider use.
- [ ] Keep raw ffprobe/process/provider output out of browser responses,
  persistent result objects, and logs.

### 4. Active-speaker feasibility gate

- [ ] Pin exact PySceneDetect, detector/tracker, Light-ASD code/weights hash,
  Python/PyTorch dependencies, licenses, and reproducible container inputs.
- [ ] Reset tracking at shot boundaries; bound four faces/shot; exchange strict
  JSON; store no embeddings or names; delete frame crops/intermediates.
- [ ] Measure one-face, wide alternating-speaker, listener nod/mouth motion,
  short overlap, and edited-camera transitions from the exact proposed sample.
- [ ] Record focus correctness, visible flicker/switch behavior, runtime, peak
  memory, container size, CPU profile, failures, and manual review method.
- [ ] Issue explicit Light-ASD go/no-go. Compare TalkNet only if the first result
  fails the target and owner approves the bounded comparison.

## Contracts and operation behavior

- `POST /v1/uploads/complete` owns one `media-inspection` operation that becomes
  accepted only after object metadata and authoritative ffprobe proof both pass.
- Content-free operation status may be queued/running/cancel-requested/
  succeeded/failed/cancelled/expired; stage never regresses and terminal status
  cannot be overwritten.
- Completed execution without a terminal result is `RESULT_NOT_FOUND`; a valid
  terminal result wins; conflicting evidence blocks paid retry.
- The spike may emit owner-only evaluation artifacts, but production contracts
  eventually retain only bounded shot/face/focus geometry—not identities or
  raw crops.

## Privacy, provider, and cost constraints

- Run the feasibility work only on synthetic or explicitly rights-approved
  purpose-recorded media. Do not copy private media into Git or logs.
- Do not make Deepgram, OpenAI, image-model, or Turnstile calls.
- Weights and code licenses/hashes are release evidence; do not download or
  accept unknown model artifacts without recording source and terms.
- The intended Cloud Run CPU/profile benchmark may require authorized cloud or
  equivalent controlled runtime. Local-only numbers cannot be relabeled as
  deployment evidence.

## Acceptance criteria

- [ ] Supported/corrupt/missing-audio/unsupported/bounds/generation cases produce
  correct `MediaDescriptor` or safe failure before provider calls.
- [ ] Process abort, timeout, signal, output cap, and every failure path leave no
  child process, temp workspace, audio, frame crop, or partial output.
- [ ] Progress is monotonic/immutable and execution/result reconciliation is
  deterministic.
- [ ] The exact model revision, dependency lock, weights hash, license notices,
  container/runtime inputs, and benchmark methodology are recorded.
- [ ] One-face, wide two-person, listener-motion, overlap, and camera-cut sample
  sections receive an explicit usable/not-usable result with runtime/memory.
- [ ] A go decision states why CL-008 may productionize Light-ASD; a no-go stops
  CL-008 and names the owner-approved comparison or architecture change needed.

## Focused verification

- [ ] Run descriptor/progress/cancellation/job-reconciliation tests.
- [ ] Run process runner and temp-workspace success/failure/abort/timeout/signal
  tests and assert exact cleanup.
- [ ] Run ffprobe/inspection/extraction fixture matrix with provider call counts
  at zero.
- [ ] Build the pinned job/container image and record binary/model versions and
  scan results when tooling is available.
- [ ] Run the speaker benchmark only with approved media/model/network/cloud
  access; otherwise leave that gate unchecked and do not start CL-008.
- [ ] Run affected lint/typecheck/build, Python/schema checks, `git diff --check`,
  and final status inspection.

## Documentation updates

- Add/update local media-job development, render/media binary profile,
  active-speaker model notices, and benchmark report.
- Record sample/media rights references without embedding private consent or
  content.
- Promote a no-go, alternative model, resource change, or job-architecture
  change into the parent and downstream packets before further implementation.

## Owner gates and external blockers

- Rights gate for the exact purpose-recorded sample.
- Model/license/download and network authorization for Light-ASD assets.
- Owner approval for intended deployment-profile benchmarking or TalkNet
  comparison.
- The packet can complete job/inspection/fake foundations without live cloud;
  CL-008 remains blocked until the feasibility go decision exists.

## Commit boundary

Keep the job/process/inspection foundation and its directly dependent
feasibility gate together as `CL-006: build the media job foundation`. Do not
absorb transcription, production assembly, contextual visuals, render, or
deployment. No Git/cloud/provider action is implied.

## Precision references

- [Job descriptor and dependency rules](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#87-job-descriptor)
- [Active-speaker processor](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#128-active-speaker-processor)
- [Process safety, inspection, and extraction](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#13-media-analysis-assembly-and-render-pipeline)
- [Cloud Run job lifecycle](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#146-cloud-run-job-configuration)
- [Media fixture/evaluation strategy](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#206-syntheticlicensed-media-fixture-matrix)

## Completion handoff

Report the job/descriptor/process architecture, media acceptance matrix,
cleanup evidence, fake lifecycle, pinned binaries/model/weights/licenses,
benchmark inputs and results, go/no-go decision, changed files, exact commands,
and every rights/network/cloud blocker.
