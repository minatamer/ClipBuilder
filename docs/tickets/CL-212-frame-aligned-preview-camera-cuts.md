# CL-212 — Frame-aligned preview camera cuts

Status: Complete locally, 2026-11-04. Depends on implemented CL-071/192/203/206.
Owner real-media/device visual acceptance remains unchecked.

Owner follow-up: [CL-213](CL-213-source-cut-accurate-codex-cameras.md) confirms a
separate late boundary in the saved Codex camera plan. This packet's decoded
clock proof does not prove that AI-authored shot timings match actual source
cuts; do not describe CL-212 alone as resolving that later finding.

## Owner request and evidence

During normal preview playback, camera changes sometimes show the correct person
with incorrect framing before correcting themselves, creating a stutter. Confirm
the behavior and fix its cause. The owner explicitly clarified normal playback,
not position-row navigation or an exported MP4.

The completed owner clips observed during diagnosis have no Zoom effects or
Motion paths. Their baseline focus plan uses immediate cuts. No CSS transition
applies to the preview video. Generated-media reproduction below confirmed that
the Player-driven crop lagged the decoded source frame. The owner's batch was
preparing additional clips at investigation start; it was left running and has
finished. Server/contracts dependencies were not changed.

## Scope and constraints

- Reproduce incorrect transitional framing using generated video and the real
  normal preview component. Measure actual decoded-frame timestamps and crop
  geometry across camera changes, rather than inferring a visual issue from
  static source alone.
- Correct confirmed preview timing/lifecycle defects. Preserve immediate camera
  cuts, source clocks, playback cadence, Hook/body independence, user framing,
  captions/audio/overlays, Zoom/Motion and deterministic native render geometry.
  Never mask the defect with a camera animation or reduced-motion behavior.
- Use an existing supported media-frame callback/lifecycle where suitable. Do
  not seek or remount the video every frame, rerender the whole editor on ticks,
  migrate saved focus plans or add a second decoder/canvas to normal playback.
- Preserve pauses, explicit seeks, Capture, loop/replay, clip/input changes,
  failed/retried media and cleanup on unmount. A browser missing a frame callback
  needs a safe bounded fallback; no stale callback may change another video.
- Existing owner media/state may be inspected privately and read-only. Keep its
  content/identifiers/geometry/source paths out of committed fixtures, screenshots
  and logs. Real media is not an automated fixture. Synthetic checks are fake,
  paid-off, no-key and network-blocked. No new real AI/render/export action,
  configuration change, cloud action, deployment or Git mutation.
- Keep existing unstaged CL-209–211 work intact. Operate only this packet.

## Acceptance and checks

1. Record a generated-media reproduction and confirmed root cause, with before
   and after decoded-clock/crop evidence from the actual preview path.
2. During sustained playback, the applied camera crop matches the presented
   source frame at cuts without a wrong intermediate position. Cover repeated
   switches, different viewport sizes and Hook/body mapping; preserve video
   identity/progress without backward jumps or repeated corrective seeks.
3. Verify seek/paused edits, lifecycle cleanup and current Zoom/Motion math.
   Native geometry must remain unchanged unless independently proven defective.
4. Run focused browser/native checks as required by the actual change, affected
   type/lint/format checks and a separate settled read-only validate pass. Fix
   actionable findings and revalidate until none remain. Record unverified owner
   real-device/visual acceptance honestly.
5. Leave the normal app healthy and owner work preserved. Prefer frontend hot
   reload for a frontend-only fix. If contracts/worker changes become necessary,
   wait for idle, preserve acknowledged state and use verified lifecycle restart.

## Whole-file allocation

- A focused preview video/camera clock module and tests if implemented.
- `apps/frontend/src/features/local-editing/clip-editor.tsx`: real preview wiring.
- `test/local-camera-switch.proof.ts` and relevant existing browser proofs:
  generated playback, geometry, seek/lifecycle evidence and safe cleanup.
- `test/local-focus-editor.proof.ts`: preserve the full editor regression while
  correcting its stale automatic-Hook fixture, four-tab expectations and media
  readiness waits to current behavior.
- `packages/contracts/local/camera-motion.ts`, `camera-follow.ts`, native focus
  code and their tests only if an independently reproduced shared defect needs
  them; do not expand scope based on suspicion alone.
- Source of truth, frontend workflow guide, this packet and index: owning
  behavior and produced evidence.

## Verification boundary

Fake/no-key checks can exercise the real browser decoder and camera math using
generated media. Real local ASR remains API-free with installed Parakeet, but is
irrelevant to this fix. No Codex/Gemini inference is needed; ordinary live AI
still requires owner login/keys, allowance, gates and approval. Owner real-media
visual acceptance is separate from generated playback correctness.

## Evidence

### Confirmed reproduction and fix

The real `Review` component, pinned Remotion Player and a generated seven-second
video reproduced the reported pattern. In 6.2 seconds of desktop playback, 186
decoded frames contained eighteen switches and **eighteen misframed frames**:
the decoder presented the new source frame while the Player-driven crop was
still one frame behind. There were zero decoded rewinds and the video element
did not remount, distinguishing crop timing from decoder stalls. Initial proof
failed as intended (24.93 s command / 23.16 s test).

`CameraPreviewVideo` uses the pinned supported `onVideoFrame` callback to apply
existing shared crop math against `metadata.mediaTime`. CSS geometry variables
change synchronously with presented frames; Player ticks cannot overwrite them.
No React per-frame state, corrective seek, new decoder/canvas, camera animation,
camera-plan migration or provider work. Hook/body occurrence offsets map once.
Paused edits and settled seeks keep the current element; a genuinely different
source gets a new video and clears old presented time. The fallback owns only
playback animation frames and settles media events; cleanup cancels callbacks
and listeners and cannot write to a replaced/detached video.

The initial wiring created fresh empty effect/track arrays on Player ticks,
re-registering the media callback. The regression still saw eighteen mismatches
(12.73 s). Stable empty defaults remove this churn; the focused reproduction
then passed in 14.37 s. The fallback also retains its latest sampled time so a
paused edit after playback does not revert to its initial frame.

### Expanded generated checks

The first Hook stress fixture did not serve byte ranges, causing non-seekable
fragment playback (28.44-s failed command). Corrected the test server to serve
206/Content-Range like the normal source route; no product route was weakened.
The driver observes newly mounted Hook/body videos and samples after that
frame's producers have run. The expanded pass took 38.50 s.

Final current-source camera proof passed in **37.17 s**, with React Strict Mode
enabled to match the normal Next app:
`corepack pnpm exec vitest run --config scripts/local-proof.config.ts test/local-camera-switch.proof.ts`.
Four cases: desktop 1440×900, phone 390×844, Hook/body transition and timed
Zoom/tracked Motion. **742 decoded frames, 72 camera switches, zero geometry
mismatches, zero backward jumps**, and more than six seconds of playback per
case. Every case checks crop x/y/width/height, source-clock mapping and stable
video identity per occurrence. Generated evidence is stored under ignored
`.local-build/evidence/cl212-camera-switch.json`.

Real browser lifecycle checks pass with and without video-frame callback
support: explicit seek, paused framing edit, replay, paused edit after playback,
genuine media replacement, frozen old-element geometry and unmount cleanup.
The unsupported-callback case verifies functioning bounded fallback/lifecycle;
it does not claim decoder-callback precision from a browser lacking that API.
All media here is generated, fake/paid-off/no-key and network-blocked.

The earlier expanded non-Strict pass took 35.89 s. Strict Mode exposed a test
oracle assumption: after a seek, `currentTime` can round to frame twenty while
the decoder has actually presented nineteen. The lifecycle observer now uses
independent presented-frame metadata when available, matching the requirement;
the fallback still uses the available media clock. The corrected Strict pass
took 34.40 s. Final proof cleanup also stops esbuild on failed builds and uses
nested cleanup so browser/server/scratch cleanup still runs after another close
fails; the final 37.17-s pass includes that change.

The unchanged camera Motion/follow/position semantics passed **18 tests across
three files in 3.93 s** with the local fake/no-network test config. Frontend and
test TypeScript and focused ESLint pass. Contracts, native crop/render code,
source geometry and the worker are unchanged; no native export rerun is needed
to validate a browser-clock-only fix.

### Broader editor regression

The existing Focus proof initially stopped at `suggestion_ready` (28.92 s): its
four-second fixture suggested an automatic Hook at 0.5 seconds, which current
CL-200 policy deliberately excludes before ten seconds. This is independently
established by `decodeOwnerHookSuggestion`, not caused by camera timing.
The fixture now has fourteen seconds with advice at 10.5–12.5 seconds; manual
short Hook checks remain intact. Its source/camera coverage and scrubber mapping
follow the longer fixture. The body Capture step seeks to a valid eleven-second
body position rather than capturing an endpoint before the new Hook start.
All existing suggestion/Capture/pointer/Apply/Discard assertions are retained.
The first revised run exposed a test tab-mount race (19.39 s); it now waits for
the actual Focus panel and rebound Hook controls before advancing. The old
two-tab assertions now cover Camera/People/Zoom/Motion, with End selecting
Motion. No assertions or product policy were removed.

The original preview, substituted only into the isolated browser bundle, passed
the revised full fixture in 79.46 s. Its temporary substitution was restored;
no baseline override remains. Intermittent Hook checks had allowed only 3.12 s
for both seeking/decoding to 10.5 s and playing a two-second prefix. The test now
observes the actual transition within a bounded 7.8-s polling window and stops
when it crosses. Prepared-body identity/readiness, control-toggle limits and
unchanged Hook values remain asserted.

Final current-source full editor proof passed in **71.54 s**:
`corepack pnpm exec vitest run --config scripts/local-proof.config.ts test/local-focus-editor.proof.ts`.
It covers desktop 1440×900, phone 390×844 and narrow 320×568 controls, playback,
pointer/keyboard edits, Apply/Discard, explicit seeks/scrubbing, Hook/body
readiness and Capture clocks, failed preview/retry, capture guards, responsive
footers and restored state. It retains forty-three explicit synthetic edits,
one fictional-caption request and exactly zero plan/image/render calls.

### Settled read-only validation

Verdict: **Meets ticket; no actionable findings.** Reviewed the CL-212 unstaged
delta only, against the private pre-ticket source snapshot and current packet;
existing CL-209–211 work is excluded. No changes were made during this pass.

- Covered: measured reproduction and presented-clock integration in normal
  `Review`; unchanged shared crop math, immediate cuts and Hook/body offsets.
- Covered: repeated switches, desktop/phone, Zoom/Motion, stable media identity,
  progress, paused edits, seek/replay, source replacement and stale-node cleanup.
- Covered: existing controls/Capture/error/retry regression, owned listener/
  animation cleanup, failed-proof cleanup and no per-frame React state/seek or
  camera-triggered remount. No duplicate schema, new dependency, unsafe cast,
  debug output, real media fixture or ignored configuration read was introduced.
- Covered: frontend TypeScript, test TypeScript, focused ESLint for both modules
  and proofs, focused Prettier and `git diff --check`; all pass. The eighteen
  shared semantics tests and both browser proofs above pass. A full unrelated
  suite/build and native export rerun were unnecessary for this browser-only
  clock change.
- Covered: hashes confirm shared focus/Motion/follow, native focus filter,
  Focus editor and existing preview-control clock equal the pre-ticket files.
  No worker rebuild/restart was required. Read-only health checks return 200 for
  backend health, `/start` and sample config. Exposed capabilities remain Codex
  ready/cloud false; the same workspace has eleven review-ready clips and no
  active batch. No backend interruption or new AI/render/export was initiated.
- Unverified: subjective playback on the owner's actual media/device, real
  provider quality, hosted/browser-fallback frame precision and release/cloud
  acceptance. These are not claimed by generated no-key checks.

Deviations: existing proof fixtures needed current-policy/readiness corrections
to run their full regression. Product scope and verification restrictions are
unchanged. No staging, commit or other Git mutation; index remains empty.

### Owner work and limits

The normal backend remained running throughout. The already-started owner batch
progressed from queued/preparing states to **eleven ready clips, zero failures**;
it was never canceled or restarted. Only read-only state/progress queries were
made; no new AI/render/export was initiated by the agent. Owner media was never
an automated fixture or screenshot. Existing saved geometry/edits/assets and all
pending CL-209–211 work are preserved.

Real owner/device visual acceptance remains unverified. No configuration change,
provider fallback, cloud action, staging/commit, push or deployment.
