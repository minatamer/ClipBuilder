# CL-129 — manual edited hook prefix

Owner request, 2026-10-28; depends on completed CL-128. Add a Hook tab with
start/end timestamps and capture-current-time controls. Manually duplicate a
bounded segment from inside the selected clip at its front, then play the full
original clip normally. No AI selection/generation or provider calls.

## Decisions and scope

Select source-relative clip times, not an arbitrary timeline. One optional
hook of 1 frame–10 seconds, contained inside the existing clip. Keep the full
original body; total presentation duration is original plus hook. Preserve
captions (trim hook caption words at its boundaries), corrected speaker colors,
text, pictures/motion, focus, filters and audio through both occurrences. The
normal occurrence remains intact. Preview, MP4 clocks, player duration, capture,
seek and persisted edits must agree. Native encoding reads original source
pixels at the existing resolution/cadence/quality, with one final encode.
Keep native time/spend/job/clip-count bounds and local/hosted permissions.
Reset/remove restores the normal clip. Reuse dirty Apply/Discard and footer.

Allocate contracts hook schema/presentation clock and edit compilation/operations;
shared overlay frame selection; frontend editor/Hook controls/player timing;
renderer clip video/audio concat and projected focus; worker result duration
validation; focused unit/UI/native tests, source of truth/index and feature guide.
Read exact neighboring modules before implementation. Do not introduce a general
timeline, multiple sources, AI hook generation or a second quality-lowering encode.

## Verification

Test hook edges/fractional timestamps, source containment/10-second maximum,
unchanged normal body, caption clipping and speaker overrides, picture/text/
focus/filter timing, persistence/reset/dirty state and stale/resource failures.
Use synthetic distinguishable video/audio segments to prove prefix then full
body in a real MP4 at native cadence; test actual desktop/phone UI captures,
keyboard use and current-source preview/export parity in fake mode with no keys.
Rebuild/reload the current normal worker through owned lifecycle. Execute /
validate until no actionable findings; record real-AI/visual/release gates as
owner-only. No paid/cloud/deploy/push or ignored configuration/media access.

## Acceptance

- [x] Manual Hook controls, capture/preview, reset and save/restore work.
- [x] Video/audio and edited overlays repeat correctly before the full body.
- [x] Fake-mode UI and native timing/quality proofs pass with no provider calls.
- [x] Clean validation and documentation; owner-only gates explicitly recorded.

Evidence, 2026-10-28–29:

- 89 tests passed across hook/caption-speakers contracts, editor-state,
  overlay-frame, styled-caption, clip-batch, draft-store, fake-content and
  owner-worker-progress.
  Coverage includes one-frame/10-second bounds, containment, partial-word trim,
  source/presentation clocks, three color roles, unchanged body, animated picture
  timing, stale/unknown input, save/restore/reset and exact worker duration binding.
- Current-source `local-speaker-hook.proof.ts` passes both native MP4 tests.
  Actual exported pixels verify speaker red/blue, a repeated green animated PNG
  and yellow text, with neither picture nor text leaking into the ordinary
  earlier body. A second synthetic source verifies prefix/body red/blue order,
  440/880 Hz audio order, camera/filter edits, native height/frame counts, and
  12/24/30/30000÷1001 cadence, including a one-logical-frame hook. Source pixels go
  through one final CRF-18 encode; source-preview media is never encoded again.
- The one-frame test found video-only concat could drop the prefix. Fixed by
  joining its audio/video together before native cadence conversion. Camera
  filter instances are named separately so commands cannot affect the other
  decoder. Native clocks retain the established physical-frame quantization.
- A final minimum-cadence proof found that a sub-native-frame hook at 12 fps
  could still round away. Export now counts physical frames separately for the
  prefix and full body, and aligns each segment's audio to that physical span.
  This preserves both occurrences and all body frames at the source cadence.
  Total encoded duration may differ from the logical editor clock by less than
  one native frame, within the existing 100 ms validation tolerance; no bound
  or quality check was weakened. All four cadence proofs pass after this fix.
- `local-focus-editor.proof.ts` passes at 1440×900, 390×844 and 320×568.
  It exercises real Hook controls, body-clock focus seek, decoded-video capture,
  preview, Apply/Discard, invalid bounds and remove, plus speaker controls and
  existing pointer/focus/playback/error behavior. Exactly 37 edit requests and
  zero AI/provider/plan/image/render dispatches. Native processing is separately
  real in the two MP4 proofs; AI content remains fictional and key-free.
- Inspected synthetic screenshots in `.local-build/evidence/cl128-speakers-*.png`
  and `cl129-hook-*.png`; controls and persistent footer fit, long phone panels
  scroll. These are agent visual checks, not owner acceptance.
- Full `corepack pnpm typecheck`, focused ESLint, formatting and Git whitespace
  checks pass. Final validate reviews the combined unstaged ticket scope against
  contracts, apply/compile/generation, browser clock, native mux/raster, worker
  replies and draft relations: no actionable findings. Historical exports keep
  their bounded old lengths; current exports must match their current hook.
- Rebuilt contracts and normal worker through verified backend tree shutdown,
  stabilization and hidden normal startup. Final API 9940 / worker 12844 healthy;
  frontend 14992 preserved. `/v1/health`, `/start` and `/api/sample/config` return
  200. Logs remain outside Git in OS temp, runtime folder
  `clipbuilder-run-20261028-074554ad`, `backend-cl129-final.stdout.log` and
  `backend-cl129-final.stderr.log`.

Implementation uses each source-time camera filter before trimming its hook
occurrence, avoiding a second projected camera plan. This preserves the intended
source framing. No other scope deviations. No provider calls, cloud changes,
deployment or push was made during implementation. Packaging authorization and
local commits are recorded in
[the file-level commit plan](../operations/CL128_129_COMMIT_PLAN.md).

Status: implemented and locally validated with no actionable findings. Owner
visual acceptance, real-media/diarization with configured provider keys/live
flags/approvals, hosted release validation and deployment remain unchecked.

Final validate pass (2026-10-29), combined unstaged scope from `a95fbd7`:
the minimum-cadence and short fake-caption findings are resolved with passing
regressions. Rechecked source/word bindings, physical-frame bounds, source-time
inspector seeks, native cleanup and old/new save compatibility. No actionable
findings. Local types/lint and both native proofs pass after the last native
change; desktop/phone proof passes after the final UI change. Git whitespace
check passes; the pre-packaging snapshot had 32 modified and 10 new ticket-owned
files. The owner subsequently authorized the file-level plan and local commits
on 2026-10-29; review/acceptance gates remain unchanged.

Owner follow-up, 2026-10-29: [CL-132](CL-132-hook-edit-fidelity.md) specifically
rechecks that a captured Hook retains current manual/automatic camera framing
and every timestamped edit. No production defect found. Native spatial targets
and landmarks now prove crop/zoom/Y in both occurrences, including a camera
change inside the Hook; richer shared React checks cover timed text, motion
and speaker styling. Two native proofs and four focused tests pass without
keys/provider calls. Owner fake-mode visual acceptance remains open.
