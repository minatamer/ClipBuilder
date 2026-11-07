# CL-250 — Hold manual zoom through its camera position

Status: Complete locally for camera-position hold, 2026-11-07. Depends on CL-192
Zoom and existing independent camera-position/Hook clocks. Owner visual and
physical-device acceptance remain separate. Preserve pending CL-247–252 work.

## Latest correction: hold until the next camera position — 2026-11-07

The owner explicitly means the selected camera position, not whole-video end.
Retract the wrongly scoped automatic-rewind change and its end-of-video proof.
Keep the target zoom after arrival until that timestamped position ends and the
next one starts, including existing implicit-return Zoom data. A completed
effect must not fall back to baseline while its camera position is still active.
Do not rewrite saved data; preserve timing controls and decode compatibility.
Explicit later Zoom/Motion work must still take over without reviving an old
held effect. Separate repeated positions even when the person/framing matches.

Inspect the shared sampler and preview clock, verify the last frames before a
cut and the first frames after it in body and Hook, and prevent preview sampling
ahead of the presented position or outside its occurrence. Test an early-arriving
zoom and legacy implicit-return data through actual synthetic playback and native
output, not only the end of a complete video. Record the requested correction and
fresh evidence here. Shared changes require current contracts/native builds and
verified idle/recovery worker reload, preserving frontend/owner data/config.
No inference/provider, owner clip patch, Git mutation or deployment.

### Camera-position implementation and verification

- Root cause: the shared sampler released a zoom at its serialized interval end,
  and legacy data blended back to baseline before the selected camera cut. Every
  manual effect now holds its target until its originating timestamped row ends.
  A newer Zoom starts from the held target in the same row; later Motion takes
  over without an old zoom reviving afterward. Identically framed repeated rows
  remain distinct. Serialized bounds/admission and legacy arrival interpolation
  stay intact; no saved document is rewritten.
- Preview used rounding that could select the next camera half a frame early.
  Its source-clock helper now floors the presented media frame with decoder
  precision tolerance and clamps to the active Hook/body source window. Main
  preview and native output retain one shared crop sampler. Removed the stale
  “Back at” inspector text; the whole-video Player override is retracted.
- Settled focused gate: **38 tests passed** across camera math, fractional/trim
  clocks, editor admission, defaults and last-valid-preview behavior. Frontend,
  test, local and contracts-without-Node TypeScript passed. Scoped ESLint,
  Prettier and diff whitespace checks passed. No full suite is claimed.
- Actual Codex-browser editor with generated media: both Hook and body kept the
  identical target at early arrival and the last frame before a cut; the next
  timestamp used the next row's framing. A second zoom also held through its
  final frame before the third row. Nine measured samples and a screenshot are
  outside Git. No edits, unexpected requests or plan/image/render calls.
- Current-source native proof passed **six scenarios and 107 pixel comparisons**
  at 24/25/29.97/30/60 fps, including early arrival held through the camera cut
  and an exact Hook tail. Original generated-source hashes and physical output
  dimensions/rates/counts stayed intact. Aggregate evidence remains in ignored
  `.local-build/evidence/cl192-native.json` and `cl250-native.json`.
- Decoded-frame proof passed five sustained-playback scenarios, including phone,
  Hook, Motion and this position hold: zero crop mismatches/rewinds and retained
  video identity. Ten additional fixed-target checks verify body/Hook last frame,
  next row, fractional pre-cut clock and clamped Hook tail. Seek/replay, paused
  edit, media replacement, callback fallback and cleanup also passed. A manual
  fractional-media probe initially left the decoder within Remotion's seek
  tolerance of the next sample; the harness now restores its paused Player clock
  before continuing. Product checks and exact crop assertions were retained.
- Rebuilt contracts and the normal native worker/current-source overlay. After
  current idle/recovery equality, stopped nine verified owned identities and
  confirmed both target ports released before replacement. New API/worker own
  4000/4200; health, `/start` and config return 200. Frontend identity remained
  unchanged. Source/base/edit/assets/outputs/revision/call hashes and canonical
  rolling recovery still match the pre-change baseline. Durable stdout/stderr
  growth and current backend diagnostics were verified without displaying logs.
- Validation R3: **Meets clarified ticket; no actionable findings**. Reviewed the
  active hold/cut policy, shared sampler/legacy schema, source-clock helper,
  inspector, focused tests and actual preview/native paths. Latest owner intent
  supersedes the earlier return-pulse and whole-video interpretations. Prior
  CL-247–249 and CL-251–252 work is excluded from this verdict and preserved.
  No dependency reversal, provider/content leakage, debug code or saved-clip
  workaround was introduced. Fixture/proof listeners and browser tabs closed;
  temporary viewport reset. No inference, configuration, owner-media edit, Git
  mutation or deployment. Manual Zoom works with fake mode and no API keys;
  real AI retains separate runtime/credentials/live/approval prerequisites.

Physical-device, owner taste, real AI and hosted acceptance remain unclaimed.
Earlier evidence below is historical wherever it conflicts with this correction.

## Retracted whole-video interpretation — 2026-11-07

An earlier response misread the requested boundary as natural end-of-video and
introduced a Player rewind override plus a whole-video proof. Both are removed.
Those measurements did not establish the requested camera-position behavior;
current acceptance is the direct camera-cut evidence above. Normal whole-video
playback behavior remains unchanged.

## Latest owner correction — 2026-11-07

The earlier interpretation below is superseded: **reach** the target at the
selected camera position's end, gradually across its remaining duration. Set
“Reach target in” to that remaining time and default “Target zoom” to exactly
1.5×. New defaults have no hold/return pulse. Existing authored effects remain
compatible. The last visible frame reaches the target; the next camera position
uses its own framing. Hook/body and selected timestamped row bounds still apply.

Editing Zoom must immediately redraw the main preview and target inspector
without remounting media, jumping between Hook/body, reverting to saved output
or leaving stale geometry while paused/playing/seeking. Inspect the real preview
path and add focused regressions for the actual cause. Preserve invalid-draft
guards, caret and contextual feedback, independent occurrence settings and all
owner media. Verify fresh defaults, live edits, real fake HTTP save/reload and
current-source native parity with synthetic/no-key/paid-off composition; rebuild
and reload the normal worker only after idle/recovery checks. No real AI action,
ignored configuration, owner clip patch, Git mutation or deployment.

### Correction implementation and evidence

- Creation now sets `zoomFrames` to the full remaining selected-row occurrence,
  `target.zoom` to exactly 1.5, and hold/return to zero. The shared sampler reaches
  that target on the last visible logical frame. Legacy 12-frame returns and
  their interpolation stay exact; arbitrary return lengths remain rejected.
  A shorter manually edited arrival holds its target for the remaining authored
  interval. No owner clip is migrated or patched.
- Confirmed preview cause: invalid intermediate numeric drafts fell back to the
  original saved overlay. Form transitions now retain the latest valid compiled
  draft, bound to the original/source, while preserving invalid typed values and
  Apply guards. The target inspector receives that same valid effect, including
  safe target-frame seeking; its final sample avoids seeking to media EOF.
- **55 focused fake/no-key tests passed** across creation, exact gradual arrival,
  old pulses, variable holds, short spans, independent clocks, stable invalid
  preview/correction/discard/source binding, edit admission and Motion isolation.
  Frontend/test/local/contracts-without-Node type checks passed. Contracts and
  normal native worker/overlay builds passed. Scoped lint/format/diff checks passed.
- Actual Codex-browser editor with generated media: Hook defaults to 2s/1.5×,
  body position to 3s/1.5×; both have zero hold/return after two real HTTP edits
  and reload. Magnification, arrival duration and target X edits immediately
  change the paused main preview without seeking; edits during playback keep it
  playing. Empty duration/magnification retain identical main framing and disable
  Apply; correction redraws immediately. Final visible body frame shows the exact
  1.5× crop. No plan/image/render calls or unexpected requests occurred.
- At 1440×900, 768×1024 and 390×844, valid/error/corrected input states retained
  field widths/footer geometry and had no page overflow. Desktop/tablet footer
  stayed 77px, phone 69px. Agent tabs/viewport overrides and generated fixture
  listeners were cleaned up; screenshots remain outside Git.
- Current-source native proof passed six scenarios and 107 pixel comparisons,
  including the corrected gradual body/camera boundary and Hook-tail case;
  original source hashes and physical output clocks/counts remained intact.
  The separate decoded-frame preview proof also passed: sustained playback,
  same video identity, no mismatches/rewinds, paused edits, seek/replay, source
  replacement, frame-callback fallback and cleanup. These are synthetic proofs,
  not real AI processing or owner-media acceptance.
- Rebuilt/reloaded only the normal backend/worker through verified owned-tree
  shutdown, clear ports and replacement readiness. Frontend stayed running.
  Health, `/start` and config return 200; durable log growth and the current
  diagnostics directory were verified in the private runtime record. Idle
  source/base/edit/assets/outputs/revision/call hashes still match the baseline
  and canonical paged rolling recovery. No configuration/provider/Git action.
- Validation R2: **Meets corrected ticket; no actionable implementation findings**.
  Shared schema/sampler own timing once; frontend owns defaults and provisional
  preview state. Prior CL-247–249 work is preserved and excluded from the verdict.
  Physical-device, owner taste, live AI and hosted acceptance remain unclaimed.
  Manual Zoom/edit checks work with fake mode and no API keys; real AI retains
  its separate runtime/credentials, enabled live flags and approval requirements.

## Historical implementation — superseded pulse interpretation

The prior implementation/evidence below describes the superseded pulse default.

The owner wants a newly added Zoom effect to finish when the selected camera
position ends. The existing fixed short pulse returns early, independently of
the selected row. Keep the normal default entry speed and return, extending the
target hold to that position's boundary. This is a creation default; do not rewrite
existing zooms or silently retime an effect when a position/duration is edited.

## Scope and acceptance

- Derive the new effect's end from the selected timestamped camera row, clipped
  to its actual Hook/body occurrence. Use the actual settled playhead for Start;
  do not confuse repeated people/positions or apply Hook/body offsets twice.
- Preserve normal entry duration when space allows, shorten entry only for a
  short remaining interval and finish the fixed return at the position end.
  A too-short interval, out-of-position playhead, invalid/busy capture or overlap
  must leave existing effects unchanged with concise local feedback.
- Admit bounded variable holds while retaining legacy fixed-hold documents.
  Manual zooms can finish exactly at an occurrence boundary; the old 0.1s extra
  tail requirement is superseded for that manual endpoint. Existing bounds,
  non-overlap, Motion isolation, smooth interpolation and return-to-camera math
  remain. No new editable timestamp is introduced; Start Capture still changes
  only its own endpoint and existing manual timing controls remain authoritative.
- Verify selected-row creation, repeated positions, body/Hook mapping, occurrence
  tails, short spans, existing edit preservation and no-provider call counts using
  synthetic tests, actual generated UI and current-source native output. Rebuild
  contracts/native bundles and reload the normal backend/worker through verified
  ownership only after safe recovery/idle checks, preserving frontend and work.

Allocation: shared effect timing schema/fit, focused frontend default helper and
selection wiring, existing focused tests/proofs, owning docs and ticket index.
No real inference/model/download test, ignored configuration, owner clip patch,
Git action, cloud or deployment. Fake/no-key proofs establish timing/transport/
rendering mechanics; actual AI quality and physical-device/hosted acceptance
retain their separate provider/runtime/live/approval prerequisites.

## Implementation and verification

- The frontend creation helper intersects the selected shot with its actual
  Hook/body source window and maps the settled presentation frame once. It keeps
  the 15-frame entry when possible, assigns the remaining hold and finishes the
  12-frame return at that window's end. Only the new effect is appended.
- The shared schema admits integer holds from zero through the existing finite
  clip bound. Exact occurrence-end fits are admitted; Zoom/Zoom and Zoom/Motion
  non-overlap and all target/resource bounds remain. Legacy nine-frame holds
  decode unchanged. The separate Motion planner's three-frame handoff stays.
- Final focused fake/no-key unit gate: **51 tests passed** across default timing,
  selected/repeated positions, Hook/body offsets and tails, short/invalid spans,
  legacy/variable holds, edit admission, camera-follow and bulk-Motion isolation.
  Frontend, test, local and contracts-without-Node type checks passed; contracts
  and the normal native worker/overlay build passed. Scoped lint passed.
- Actual generated editor in the Codex browser: created and applied a Hook zoom
  ending at 2s, a body zoom ending at 5s and the final body zoom ending at 6s.
  Three real loopback HTTP edit submissions retained holds of 33/63/3 frames;
  reload retained all three and zero plan/image/render calls. Duplicate creation
  preserved existing effects. At 1440×900, 768×1024 and 390×844 there was no page
  overflow; valid/error/corrected feedback kept field widths and footer geometry
  identical (77px desktop/tablet, 69px phone). The isolated fixture was closed.
- Current-source native output: **six scenarios, 107 pixel comparisons passed**,
  covering legacy 24/25/29.97/30/60fps plus the new selected-position/body-cut and
  exact Hook-tail defaults. Maximum mean pixel difference 2.034, below 4.5; source
  hashes unchanged, output clocks/counts correct, zero providers. Aggregate
  evidence: ignored `.local-build/evidence/cl250-native.json`. An initial native
  attempt stopped at generated-source packet-clock inspection; a separate bounded
  synthetic reproduction passed at all five rates, and the subsequent full proof
  passed. No media inspector/product workaround was introduced.
- Normal backend/worker reloaded after current contracts/native builds, verified
  idle state and canonical paged rolling-recovery equality. Verified old tree and
  both ports clear before replacement. Graceful shutdown left the launcher alive;
  its first forced cleanup hit a Windows console-handle error, then exact-identity
  hidden tree cleanup completed. Replacement API/worker own 4000/4200, health and
  frontend `/start`/config return 200, frontend process preserved. Post-reload
  source/base/edit/asset/output/revision/call hashes match the original workspace
  and durable recovery. No owner clip was patched or regenerated.

The broader opt-in `local-camera-motion-editor.proof.ts` is **not passed**: its
older driver assumes source-clock inputs, initially selected body content and
cross-occurrence enabled Capture. A temporary driver correction reached Motion's
locked-navigation capture phase and timed out there. Those experimental driver
edits were removed; this packet does not change Motion/navigation or weaken its
guards. The scoped actual Codex-browser transport/geometry checks above establish
the new-default acceptance; the broader legacy Capture harness needs separate
maintenance and is not claimed as coverage.

Closing validation: reviewed the CL-250 diff and new helper against every scoped
requirement; no actionable implementation findings. Shared contracts own the one
timing schema, the frontend owns creation defaults, and composition/native output
reuse the existing crop sampler. No dead hold-default constant, debug output,
provider/content leakage or dependency reversal was added. CL-247–249 changes
were excluded from this verdict and preserved.

Physical-device, owner visual and hosted acceptance remain unclaimed. New manual Zoom timing works
with fake mode and no API keys; real AI still requires its configured runtime or
provider credentials, live flags and applicable approvals. No provider action,
configuration change, staging, commit, push or deployment.
