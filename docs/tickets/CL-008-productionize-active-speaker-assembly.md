# CL-008 — Validated selected-range speaker focus

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local selected-range implementation and synthetic verification recorded, 2026-10-03. Native fixture proof remains unverified because the approved full fixture FFmpeg tool is unavailable locally. Renderer rollout and live human-labelled quality remain explicitly deferred by the owner.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

One bounded selected-range Google audiovisual plan; validate audible/visible association, boxes/rotation/cuts/source bounds and safe deterministic smoothing/wide fallback. Node physically cuts/proxies the validated range. Fake plans do not prove speaker quality.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement and verify the locally possible synthetic behavior after approval.
- [x] Record exact tests/manual states, cleanup and all remaining rights/AI/cloud/license/device gates.
- [ ] Run the saved native selected-proxy fixture check with an approved full fixture FFmpeg executable.
- [ ] Separately authorized renderer rollout and real human-labelled speaker quality; deferred by the owner.

## Local execution evidence — 2026-10-03

Dependency evidence: CL-006 private renderer/shared composition foundation and
CL-007 grounded result/receipt were present. The owner's latest direction
deferred new cloud/paid work, required the actual key-free fake workflow to pass
first, and authorized sequential dependency-ready local packets. CL-007's browser
workflow and four reproduced review corrections passed before this packet began.
Related CL-007 edits remain unstaged; no unrelated work was overwritten.

Implemented one authenticated private `/internal/select` operation. It accepts
only an admitted source binding/generation, opaque nonce and validated 10–60s
range. The full-source analysis proxy must already be released; selected range
is claimed once in the expiring private intent. Reinspection must match the
original decoded source. Node passes the actual range to FFmpeg, produces a
20fps upright AVC/AAC selected proxy bounded to 640×640/24 MiB, and validates
its duration. Reading/releasing uses the existing exact-generation proxy path;
failure/cancel removes artifacts through the existing terminal cleanup system.
No cloud image build or native/media invocation was performed here.

Backend `SelectedSpeakerFocus` verifies the CL-007 signed source result, derives
the candidate's immutable word boundaries and supplies only overlapping word
IDs/times/anonymous speaker labels for one selected-range call. The Google
adapter shares CL-007's bounded Files upload/poll/generate/verified-delete
lifecycle, including late-upload cleanup, and serializes explicit **5fps**
sampling with a strict speaker-plan schema. There is no second source analysis,
model repair, tools/search, image call or transcript store. Fake/test composition
is closed; live assembly needs live analysis and at least three protected action
reservations. The reserved action is `visual-plan`; CL-009 must extend this same
one-call boundary for contextual templates rather than dispatch another plan.
The public assembly feature remains disabled until its complete CL-009 bundle.

Plan validation requires upright display coordinates, at most 30 contiguous
shots/120 observations, bounded boxes/confidence and anonymous in-range word
evidence. Observations cannot cross a cut or overlap. Matched crops require
visible geometry, confidence >=0.85 and consistent audible speaker evidence;
overlap, unknown/offscreen/absent/ambiguous voices, low confidence, silence and
gaps use wide framing. Speaker changes shorter than 1000ms use wide. Continuous
shot motion is linearly interpolated at at most 0.25 normalized-center units/s;
camera cuts reset interpolation. Excess compiled segmentation falls back to
bounded wide shots. Shared preview/render geometry clamps all interpolated
upright landscape/portrait/square crops to the source. The signed result binds
session, source revision/fingerprint/generation, analysis revision, candidate,
range, focus policy, provider and final geometry; fake results are labelled fake.

Focused checks verified: safe/low-confidence/overlap/offscreen/absent/ambiguous
focus; missing/corrupt/out-of-range/wrong-speaker evidence, source duration,
geometry/cuts/coordinate-space/extra-field rejection; short turns, gap coverage,
bounded pan and cut reset; upright crop interpolation; exact selected generation,
unreleased proxy/out-of-source range rejection; one physical proxy argument,
one selected plan, zero new source AI; signed-result tampering/replay; Clear
with a late result; byte/checksum rejection before AI; release failure prevents
publication and cannot redispatch; SDK schema/sampling serialization and one
Files generation/deletion lifecycle. All data and transports were synthetic.
Unit cleanup checks remove owned scratch and exact proxy generations; no app
service, listener, native child or cloud resource was launched by this packet.

Required settled root gate evidence:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
git diff --check
```

All six commands returned exit 0. Final totals: root 20, contracts 44,
composition 3, backend 146, renderer 27 and frontend 243: **483 tests across
52 files**. All five packages built, including the unchanged `/start` and
same-origin analysis routes. Boundary fixtures/pre-import fake/off network
interception passed. Final inspection found no cross-app imports, unsafe casts,
provider/Node dependencies in contracts/shared composition, duplicated schemas,
debug logging, TODOs or leaked real content/credentials in this packet.
This combined total includes the subsequent CL-007 pass-2/pass-3 Clear/reload corrections.
The earlier focused source-analysis/selected-focus/config suite passed 71 tests;
additional checksum/release-failure regressions are included in the final suite.

Changed files: new backend `src/assembly/{speaker-focus,gemini-speaker-focus,
selected-focus.usecase,speaker-focus.test,selected-focus.test}.ts`; shared
`selected-focus.schema.ts`; existing `cloud-media.schema.ts`, `edit-plan.schema.ts`,
`constants.ts`, `index.ts`; backend Google/renderer adapters and config schema/test;
renderer app, private intent/session lifecycle, media operations/test and Node
pipeline; shared composition/focus layout/test; native fixture harness
`apps/renderer/feasibility/selected-proxy.ts`; backend/renderer guides and ticket/
parent status records. No dependency version, external resource or Git action changed.

`FAKE_MODE=true` without API keys still runs the verified fixture browser journey
and these injected speaker-plan engineering checks. No local AI model, weights
or quality inference is used. The native harness is API-free and AI-free, but
requires an approved full fixture FFmpeg solely to synthesize/decode its test
video/tone; production proxy processing uses the pinned Remotion binaries.
The tool was absent from PATH, repository-private tooling, WinGet packages and
the bundled runtime. No replacement was downloaded or installed.

Unchecked: actual native selected-proxy clock/audio/rotation/VFR proof; new
renderer image rollout, real Gemini key/live flags, specific AI-transfer rights,
paid-project terms and numerical budget; independently human-labelled quality
across one/multiple speakers, listener motion, brief turns, overlap, camera cuts,
offscreen/absent/ambiguous people; full-size/resource/scratch/runtime envelope;
actual device/video/sync/accessibility matrix, licensing/notices and public
release gates. Supplying a key or fixture tool alone does not complete those
checks. Later contextual assembly/preview/output integration remains CL-009–011.
Google cleanup is process-local with separate provider expiry as a crash fallback.

Deviation: the native fixture check was prepared but not executed because its
approved fixture executable was unavailable; no fake result substitutes for it.
At the end of verification, all changes were available for review, unstaged and
uncommitted. The owner subsequently authorized the sequential commits below.

## File-level commit plan

The [seven-step CL-007/CL-008 commit plan](CL-007-008-COMMIT_PLAN.md) records
whole-file staging and sequential commits. Shared files land once in the earlier
CL-007 groups; dedicated speaker-focus modules land in step 5 and this ticket's
evidence in step 7. Every subject starts with `CL-007:` or `CL-008:`. The owner
authorized execution on 2026-10-03; the live/native/deployment gates above remain
unchecked.

## Commit execution record

The seven planned groups were staged as whole files and committed sequentially
at the owner's request, starting from `db58981`. This ticket is the final
documentation commit. The sequence covers 72 distinct non-ignored files,
including the commit plan; the index was empty before execution.

| Order | Commit | Subject |
| --- | --- | --- |
| 1 | `86505c5` | `CL-007: define grounded analysis and focus contracts` |
| 2 | `542bd36` | `CL-007: extend private analysis and selected proxy operations` |
| 3 | `e15ba9d` | `CL-007: implement protected grounded source analysis` |
| 4 | `b02c2e3` | `CL-007: integrate browser analysis and recoverable cleanup` |
| 5 | `80e585d` | `CL-008: implement validated selected-range speaker focus` |
| 6 | `a0eaaf3` | `CL-007: document source analysis and local verification` |
| 7 | This final documentation commit | `CL-008: record selected-focus verification and remaining gates` |

Each staged group was checked against the exact planned paths before committing.
Only execution records changed during the sequence; application behavior and
the settled 483-test/five-root-gate evidence are unchanged. Intermediate commits
were not reconstructed or separately tested. No push, branch switch, history
rewrite, provider/cloud action or new test/service launch was performed. Fake
fixture behavior works without keys; live keys/flags/rights/spend, native fixture
proof and the other external checks above remain separately gated.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned; browser-owned execution revision, external gates pending<br>
Milestone: M4 - local speaker assembly<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-006 explicit browser feasibility go and CL-007<br>
Suggested commit: `CL-008: validate browser active-speaker framing`<br>
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

Compile one chosen candidate's locally decoded audio/video into a bounded,
validated scene/face/active-speaker focus track. The model, preprocessing,
runtime and quality gates must be the exact CL-006 browser go choice, not the
old Python Light-ASD bridge or server job. No original or selected video/frames
leave the device under this architecture.

Active-speaker framing is required. A face/landmark detector or generic center
crop is not equivalent; do not add crop controls or silently weaken the claim.
No visual-plan generation, final renderer, editor or paid API in this packet.

## Current checklist and acceptance

- [ ] Decode only the immutable selected 10-60s range plus bounded context/
      keyframe pre-roll. Preserve normalized rotation, VFR/source times, audio
      offsets, shot boundaries and word-range provenance.
- [ ] Produce bounded face tracks and synchronized audio/face tensors using
      the proved model. Handle overlap/listener motion/no face/off-screen voice
      with deterministic documented focus policy, not inferred identity.
- [ ] Emit strict focus points/crop bounds/speaker evidence, with smoothing,
      hysteresis and shot-cut resets; no executable model output or raw tensors
      escape adapters. Store the track in browser-owned validated assembly data.
- [ ] Bind track/notes to source identity, candidate range, model version and
      manifest revision; reject stale worker results after selection/clear.
- [ ] Bound multi-face tensors, queues, scratch/model caches and time; abort/
      suspend/resume policy and frame/codec/worker cleanup are explicit.
- [ ] Test crop safety, empty/invalid track, jitter, speaker switches, scene cuts,
      rotation/VFR/audio offset and golden model/focus evidence.
- [ ] Run the agreed CL-006 quality/runtime/memory matrix on approved actual
      media in the measured browser runtime. Quantization/detector/window
      changes reopen parity proof.
- [ ] Fake/injected tests assert zero transcription/text/image calls. Run
      focused contracts/worker/browser tests and all five root gates.
- [ ] Report exact versions/hashes/licenses/rights, measured states and pending
      phone/tablet/model/deployed-delivery gates; no mock-only go verdict.

Own frontend selected-range framing worker and deterministic focus compiler,
shared focus schemas as needed, tests and read-only timestamped framing notes.
Respect dependency direction and local artifact cleanup. Use the existing card
and progress presentation; actual phase work or elapsed/indeterminate activity,
never fabricated real-mode percentage/ETA. CL-015 checks client/model hosting
delivery, not cloud media compute. A core regression blocks downstream assembly.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-008 — Productionize active-speaker assembly

Status: Planned<br>
Milestone: M4 — automatic AI first cut and review<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-006 explicit local feasibility go decision and CL-007<br>
Blocks: CL-009 and CL-010<br>
Suggested commit: `CL-008: productionize active-speaker framing`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): use CL-006's rights-approved local/container
go decision and the [software guide](../operations/THIRD_PARTY_SOFTWARE.md).
Do not require or run GCloud setup/benchmarks here. CL-015 owns actual Cloud Run
resource/performance proof as the final release gate; local results must remain
labelled local, and a later cloud no-go blocks launch pending correction/re-audit.

Turn the approved feasibility result into the production selected-range
active-speaker pipeline: scene cuts, bounded face tracking, Light-ASD inference,
deterministic smoothing/hysteresis, normalized `SpeakerFocusTrackV1`, crop-plan
preview math, operation stages, fixtures/evaluations, and cleanup.

## Portfolio value

Deliver the signature visual proof that ClipBuilder follows whoever is actually
speaking across close-ups, wide two-person shots, and edited camera cuts—without
identity recognition or simplistic manual crop presets.

## Standalone implementation context

- Active-speaker work runs once over the selected padded 10–60 second range,
  never over every candidate or the whole source.
- PySceneDetect defines shot boundaries. Face tracks are shot-local and reset at
  every hard/adaptive cut. At most four visible faces are processed per shot.
- Light-ASD combines synchronized audio and visible mouth motion. Deterministic
  post-processing owns thresholds, minimum hold, turn hysteresis, max crop
  velocity, cut resets, and low-confidence held focus.
- Public output is geometry/time/focus only. No names, embeddings, identity,
  protected traits, emotion, personality, or cross-upload comparison exist.
- The public read-only preview will reference a validated focus/shot track; it will not
  expose raw confidence/boxes or public left/right/center controls.
- If CL-006 did not record a go decision on the exact model/sample/runtime,
  stop—this ticket cannot silently choose another model or weaken the claim.

## Dependency evidence required

- CL-006 must record the explicit Light-ASD go decision, exact code/weights/
  licenses, target CPU/container benchmark, and clean process/media lifecycle.
- CL-007 must provide a validated selected transcript/range, analysis revision,
  assembly operation boundary, and idempotent selected-range orchestration.

Fake focus tracks or a local-only unapproved benchmark do not satisfy the
feasibility dependency.

## Files and areas owned

- Production shot detection, active-speaker runner, schema bridge, focus-track
  compiler/smoother, crop geometry shared with preview/render, and tests.
- `assemble` job stages from selected-range read through focus smoothing,
  stopping before visual planning owned by CL-009.
- Assembly start/result contracts/use-case fields required for the focus track.
- Owner-only evaluation visualizer/evidence kept separate from public UI.
- Pinned vision/model/container documentation updates.

## Scope boundaries

### In scope

- Download/extract selected padded window through known private object refs.
- Shot normalization, rotation-aware face tracks, Light-ASD JSON bridge,
  weights-hash verification, deterministic focus segments, and 9:16 crop-center
  planning.
- One-face, wide alternating-speaker, listener nod, sub-second interjection,
  overlap/offscreen speech, dark/light footage, rotated source, and multi-shot
  evaluation fixtures.
- Abort/timeout/cancel/progress/cleanup and safe failure evidence.
- Browser preview fixture/component support sufficient to inspect the focus
  path without shipping raw debug data.

### Out of scope

- Visual planning/assets (CL-009), automatic clip review (CL-010), FFmpeg final
  crop compilation/render (CL-011), a generalized manual framing editor, identity or
  biometric analysis, alternate public model fallback, or whole-source
  inference.

## Implementation checklist

- [ ] Verify the exact approved model/code/weights hashes and licenses before
  job execution; fail closed on mismatch.
- [ ] Detect/normalize shot boundaries and ensure face tracks cannot cross them.
- [ ] Run bounded visible-face detection/tracking and the strict Light-ASD
  subprocess with synchronized selected audio/video only.
- [ ] Convert noisy frame scores into ordered nonoverlapping focus segments with
  source-controlled enter/exit thresholds, hold, hysteresis, and cut resets.
- [ ] Compute normalized crop centers/headroom/safe-zone behavior, bound pan
  speed/acceleration inside a shot, and use cut/reset across camera changes.
- [ ] Cover every podcast-footage interval with valid focus or a deterministic
  held-crop rule; do not invent a manual recovery workflow.
- [ ] Emit only validated `SpeakerFocusTrackV1` with revision/config IDs and
  content-free aggregate evaluation metadata.
- [ ] Delete frame crops, face intermediates, selected temp media, subprocess
  output, and failed partial tracks in all terminal paths.

## Contracts and state transitions

- `POST /v1/assemblies` eventually starts one job after validating the selected
  word range, revision, feature gates, allowance, Turnstile, idempotency, and
  capacity. CL-008 supplies the focus portion; CL-009 completes bundle creation.
- Focus segments reference existing shots/face tracks, lie inside selected
  padded time, are ordered/nonoverlapping, use `[0,1]` finite geometry, and
  contain no identity label.
- `assembly.detecting-shots -> tracking-faces -> detecting-active-speaker ->
  smoothing-speaker-focus` is monotonic and content-free.
- Failure remains `assembly-failed`; the user may retry if evidence permits or
  choose another candidate. The app does not open a manual crop fallback editor.

## Privacy, provider, and cost constraints

- This is local media compute, not an LLM call. It must not contact a face,
  identity, analytics, or remote vision provider.
- Source/frame/audio artifacts remain job-local/private and are never logged,
  persisted beyond documented bounded geometry, or committed.
- One assembly action creates at most one active-speaker pass. Cloud Run task
  retries and hidden process retries are zero.
- Live execution requires the approved rights-safe sample and measured CPU/time
  budget; deterministic fake focus tracks cover ordinary CI.

## Acceptance criteria

- [ ] One-face sections keep the visible speaking face framed with correct
  headroom and no unnecessary motion.
- [ ] Wide alternating-speaker sections follow the audible speaker; listener
  nods/mouth motion and short interjections do not cause distracting switches.
- [ ] Hard camera cuts reset tracking/crop without animated pan across the cut;
  continuous-shot changes ease within bounded velocity.
- [ ] Every track/segment/box/timestamp/reference validates and produces a legal
  9:16 crop for landscape/portrait/square/rotated fixtures.
- [ ] Runtime/memory/container/model evidence stays inside the CL-006-approved
  public profile on the exact target; regressions block completion.
- [ ] Abort/timeout/cancel/failure leave no frame crop, embedding, temp media,
  subprocess, or partial valid result.
- [ ] Public API/UI contains no raw boxes/probabilities/identity/debug artifacts.

## Focused verification

- [ ] Run shot/track schema, smoothing/hysteresis, crop geometry, rotation, and
  safe-zone unit/golden tests.
- [ ] Run Python bridge/weights-hash/timeout/abort/malformed-output/cleanup tests.
- [ ] Run the complete active-speaker fixture evaluation matrix and compare to
  the recorded CL-006 baseline.
- [ ] Manually inspect the rights-approved purpose-recorded sample at one-face,
  wide, overlap, listener-motion, and camera-cut points.
- [ ] Assert one assembly action triggers one processor pass and zero text/image
  provider calls in this ticket's boundary.
- [ ] Run affected lint/typecheck/build/container checks, `git diff --check`, and
  final status inspection.

## Documentation updates

- Update model/weights/license and benchmark records with the production config
  revision and regression results.
- Document focus/crop thresholds as versioned source-controlled profiles and
  owner-only evaluation method.
- Update parent/affected tickets before changing model, claim, resource profile,
  retention, or public fallback behavior.

## Owner gates and external blockers

- Requires CL-006's explicit Light-ASD go decision and rights approval for the
  exact sample.
- Any new model download/local target-profile benchmark requires appropriate
  explicit authorization. Actual cloud execution/benchmark is final CL-015 only.
- A failed production regression reopens the feasibility/architecture decision;
  it cannot be marked complete with only fake tracks.

## Commit boundary

Keep CL-008 focused on production active-speaker focus-track assembly in
`CL-008: productionize active-speaker framing`. Contextual visuals remain the
immediately following CL-009; automatic review and render remain CL-010/CL-011. Do not
perform unauthorized Git/cloud actions.

## Precision references

- [Speaker-focus contracts](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#108-speaker-focus-and-visual-plan-contracts)
- [Active-speaker processor](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#128-active-speaker-processor)
- [AI-directed speaker-framing pipeline](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#137-ai-directed-speaker-framing-pipeline)
- [Speaker-focus crop compiler](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#138-speaker-focus-crop-compiler)
- [Active-speaker evaluations](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#208-active-speaker-and-contextual-visual-evaluations)

## Completion handoff

Report the selected model/profile, shot/face/focus/crop behavior, exact sample
evaluation, baseline/regression runtime and memory, one-pass proof, cleanup and
privacy evidence, changed files, exact checks, and any reopened gate.

</details>

</details>
