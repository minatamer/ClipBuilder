# CL-213 — Source-cut-accurate local Codex cameras

Status: Complete locally, 2026-11-04. Dependency: implemented CL-212 playback
clock. Owner-device visual and new real Codex preparation acceptance are open.

## Owner request and confirmed gap

The owner still sees incorrect framing before it corrects, possibly half a
second after a source camera cut. Investigate actual source frames and saved
camera boundaries, not just Player/decoder clock agreement. The two supplied
stills alone do not establish timing. CL-212's generated clock proof remains
valid but does not establish correctness of the AI-authored camera plan.

Private read-only inspection of the reported existing clip confirms a measured
source transition fourteen 30-fps frames before its saved shot reset (467 ms).
There are no applied Zoom effects or Motion tracks on that clip. No new AI,
transcription, diarization, render or export was initiated. A separate private
copy, never the retained master or an ordinary automated fixture, is inspected
with installed FFmpeg only. Keep source frames, media paths, IDs, geometry,
words and exact source timestamps outside Git and normal logs.

## Scope and authority

- Measure bounded source hard-cut candidates locally at the same logical
  30-fps clock as the prepared preview. Preserve VFR/native export cadence and
  nonzero video starts; avoid decoding an entire preceding long source.
- Supply numeric measured boundaries to the existing single local Codex camera
  planning call and target existing contact-sheet slots around them. Do not
  expand image/call budgets, change ASR/diarization or use Gemini/fallback.
- Deterministically align only supported, nearby automatic shot-reset
  boundaries and their dependent observation/decision clocks. Keep geometry,
  anonymous identities, speaker evidence, manual framing, holds and Zoom/Motion
  semantics. Reject no usable AI output for editorial quality and never retry
  a provider. Unmatched/ambiguous candidates retain the plan rather than guess.
- Existing saved/applied camera plans are not silently migrated. Diagnose a
  no-inference repair for the reported existing clip without overwriting owner
  drafts, captions/assets/exports or starting processing. State exactly what is
  fixed for new preparation versus what remains in older saved plans.
  Owner confirmed no unsaved edits in Clip 1; its measured boundary repair is
  authorized within the existing fix request. Validate before applying and
  verify all unrelated state exactly afterward.
- Preserve all CL-209–212 unstaged work and ignored configuration. No staging,
  commit, push, cloud/deployment, downloads, real provider call or model change.
  Follow verified native-worker lifecycle after native/contract changes.

## Allocation and verification

- `apps/renderer/local/source-scene-cuts.ts` plus focused tests/native proof:
  admitted local FFmpeg, bounded output/time, source-relative cut clock.
- `apps/renderer/local/codex-media.ts`: attach measured boundaries to frame
  preparation; preserve existing frame scratch, cancellation and cleanup.
- `packages/contracts/local/codex.ts`, `codex-sampling.ts`, focused camera-cut
  alignment module/tests: shared bounded wire shape, finite sample allocation,
  conservative timing alignment. No new saved schema/migration.
- `apps/backend/local/codex-ai.ts` and tests: same-call prompt and automatic
  focus integration; legacy artifacts stay compatible and budgets unchanged.
- Native generated-media proof: known non-grid cuts, delayed and early plans,
  same-person geometry reset, separate speakers, unchanged manual edits,
  ambiguous/unmatched cuts, nonzero starts, nonzero clip offset/VFR where
  supported, seek bounds, cancellation and cleanup. Real media is not a fixture.
- Relevant unit/type/lint/format checks, separate settled read-only validation
  and fixes until no actionable findings. Reuse CL-212's unchanged browser
  clock evidence, rerun only if affected. Record every actual test result.
- Source of truth, local Codex architecture/renderer guide, packet/index own
  current behavior and evidence. Record owner real-device/provider-quality
  limits honestly. Fake/no-key checks prove plumbing and generated cut accuracy,
  not real AI associations. Installed Parakeet/local speech assets are unchanged.

## Evidence

Read-only diagnostic copy: 762 decoded frames; a strong source transition near
the reported moment precedes the saved camera reset by fourteen frames. A
separate FFmpeg scene pass confirms the same delay. Both passes remain private.
The preliminary grayscale frame-difference pass found nineteen strong changes;
FFmpeg scdet at threshold eight found fourteen and threshold four found
seventeen. These are detector sensitivity observations, not a claim that every
candidate is a true editorial cut. The original plan contains eighteen resets.
Confidence and ambiguity checks implemented below limit automatic alignment.
Python's optional NumPy was unavailable; the diagnostic used
the standard library and installed native tools instead, with no installation.

### Implemented behavior and checks

- The native scdet pass uses threshold four, 160×90 frames, the established
  source timebase and one-second preroll. It suppresses a one-frame flash with
  adjacent high difference. Output/time/candidate bounds are 2 MiB, 180 s and
  600; dense candidates are spread across the clip rather than truncated early.
  Source protocols, paths, admission and process ownership stay unchanged.
- Fresh frame artifacts optionally carry sorted numeric scene cuts. The same
  Codex call receives exact opening-frame guidance. Existing image slots share
  scene/speaker hints, with original counts and uniform coverage. No API/model
  call is added. Legacy artifacts remain accepted.
- Automatic timing alignment moves a unique nearby shot reset within thirty
  logical frames and equal observation/decision endpoints. Geometry and person
  IDs are unchanged; any manual plan, near tie, collision or intervening clock
  prevents a guessed correction. Saved plans are not automatically rewritten.
- Initial focused gate: **58 tests / five files, 6.75 s** for detector parsing,
  flash/dense evidence, bounded seeking/cancellation, early/late/same-person
  timing, manual/ambiguous/crossing preservation, sampling, frame preparation
  and existing Codex behavior. Additional same-call/legacy and existing focus/
  person tests: **35 tests / three files, 5.15 s**. Added artifact integration
  proving exact middle-panel timing and unchanged four-image budget: final
  frame-preparation suite **9 tests, 2.85 s**. Final camera integration adds an
  out-of-clip cut rejection before inference: **3 tests, 3.01 s**, with exactly
  one injected media request/zero inference for that rejection. Its scratch is
  separately owned and removed in finally. **95 distinct unit cases pass.**
- Native generated-media proof initially exposed a fixture floating-time
  boundary rounding to the next frame (3.92-s failed command). Source color
  transitions now use exact frame indices; no detector tolerance was loosened.
  It passed in 13.19 s, then the settled proof in **11.16 s** after cleanup
  factoring. Final review caught that a one-second clip offset still allowed
  zero preroll seek. The settled proof now uses a 1.5-second clip offset and
  actual 0.5-second native seek, including the nonzero container start; it passes
  in **6.89 s**. Five cases cover 24/30/60 fps, VFR and a three-second container
  start. Every detector boundary equals an independent
  full-source decode through the existing preview clock. Fourteen-frame-late
  synthetic camera timing becomes zero frames late. Generated evidence lives
  only in ignored `.local-build/evidence/cl213-source-cuts.json`.
- Local/test/contracts TypeScript and focused ESLint pass. Initial lint found
  unused destructured test clocks and a throw directly inside proof cleanup;
  both were corrected and affected checks rerun. The native process runner,
  browser clock, final crop geometry and export implementation are unchanged.
  CL-212 browser playback evidence is reused for that unchanged surface.
- Contracts build first encountered nested global pnpm 11.25 instead of pinned
  11.19. The already-installed runtime launcher shim resolved it; no install,
  lockfile/configuration change or package-manager policy bypass occurred.

### Existing-clip repair and runtime

The private repair first demonstrated two affected adjacent segments, unchanged
camera geometry and an exact measured reset. Owner confirmed no unsaved draft.
The first apply guard stopped before any edit because development source reload
had rebound the recovered workspace. Read-only comparison then established the
same source fingerprint, clip ID/base hash/revision and exact focus/edit. The
repair was rebound only after those checks, validated through the existing
`validate` route and applied through `edit`. It changed only focus clocks and
the required edit revision/state. All ten other clips are byte-equivalent JSON;
Clip 1 base/assets/audio assets/outputs/provider call counts are unchanged.
No AI, ASR, render or export action was dispatched.

The normal backend's owned supervisor/watcher/descendant tree was captured and
verified absent after scoped shutdown and stabilization. The frontend stayed
running. Normal startup rebuilt the native worker from current source and
loaded owner configuration without reading it. Backend/worker bind 4000/4200;
local startup is not authorization for provider processing.

Post-restart verification confirms every acknowledged clip equals its exact
post-repair JSON. Ten remain review-ready and Clip 1 is at its validated edit
revision. The same source and all eleven clips survive, with no active batch.
Backend health, `/start` and sample configuration return 200. Exposed provider
capabilities remain Codex ready/cloud false. The worker bundle is newer than
the detector source; the frontend listener was preserved. Runtime identities
and separate safe stdout/stderr paths are recorded outside Git.

One snapshot command used sandbox TEMP rather than the owner TEMP location and
accidentally copied six source duplicates to the repository root, plus a service
README over the public README. Removed only the six hash-verified duplicates
and restored the public README with the pending English-only scope preserved.
No app/media/configuration was affected. This housekeeping correction is a
recorded deviation; no unrelated source change is claimed as ticket work.

### Settled validation and limits

Verdict: **Meets ticket; no actionable findings.** Reviewed twelve settled
source/test files against the private pre-ticket snapshot and this packet.
Earlier CL-209–212 source changes are excluded from this delta. No source/test
edit occurred during the final read-only pass; hashes are retained privately.
Final formatting normalized two test chains only; that whitespace-only diff
was re-reviewed and all twelve files pass Prettier. The final read-only handoff
confirms the repaired focus still equals the validated payload, all eleven
clips remain, the source byte-range request returns 206 and the index is empty.

- Covered: private source/plan diagnosis, distinct preview-clock versus
  authored-boundary causes, same-call measured guidance and finite sampling.
- Covered: generated real native decode/seek clock parity, early/late and
  same-person geometry resets, unchanged IDs/boxes, manual/speech/ambiguous/
  unmatched/crossing preservation and tolerant legacy artifact behavior.
- Covered: source/clip bounds, no inference on invalid cut evidence, fixed
  process/output/time bounds, abort propagation, owned scratch cleanup, no
  extra provider request/retry/fallback, browser-safe contracts and unchanged
  native geometry/ASR/diarization. No duplicated schema or new dependency,
  debug output, unsafe cast or ignored configuration read was introduced.
- Covered: focused units, native proof, local/test/contracts TypeScript,
  focused ESLint/Prettier, contracts build, whitespace checks, current worker
  reload and exact acknowledged-state recovery. A full unrelated suite/build,
  live provider test and new final export were not required or performed.
- Covered: Clip 1's validated focus-only repair; ten other clips and every
  other panel/base/asset/output/call count were preserved. Existing saved
  plans are not silently migrated or bulk repaired on detector candidates.
- Unverified: fresh real Codex associations/geometry quality, subjective
  playback on the owner's actual device, low-contrast cuts/fades/fast motion,
  Linux/hosted and release/cloud acceptance. Sampled reasoning plus a scene
  detector does not establish continuous perfect face tracking.

The reported boundary is repaired without regeneration. The rest of existing
saved camera plans remain intact; new preparation uses measured cut guidance.
The normal local app is left healthy. No staging/commit/push or configuration,
model, provider fallback, cloud/deployment action occurred. Private diagnostic
records and the separate inspection copy remain owner-local for review.
