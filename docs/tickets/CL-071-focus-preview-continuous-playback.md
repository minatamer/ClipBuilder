# CL-071 — Continuous playback while Focus is open

Status: implemented and locally validated; owner actual-clip confirmation remains
manual. Owner reports repeated seconds only with Focus open. Normal capabilities
confirm `synthetic-ai` on 2026-10-25.

Dependencies: implemented pending CL-068/069 focus controls and CL-070 export
quality correction. Preserve those and unrelated CL-067 work. This packet is a
frontend playback fix, not a new AI/framing/export policy.

## Scope and plan

1. Reproduce the Focus-specific interaction with actual synthetic browser video;
   measure decoded frame progress, corrective seeks and overview seeks during
   continuous playback. The existing proof checked gestures and paused capture,
   not sustained playback with Focus open.
2. Keep focus clock/readiness updates out of the parent that compiles the overlay
   and supplies Player inputs. Keep the source overview a stable editing still
   while playback runs; update it after pause/seek, rather than seeking a second
   decoder every playback frame. Keep live timeline indication and exact Capture.
3. Extend the current focus browser proof with playback across camera boundaries,
   pause/seek/Capture, unchanged source element and cleanup. Verify desktop and
   phone. No new controls, provider dispatch, dependency or media/export change.
4. Run focused browser/position checks, frontend/proof types, affected lint/format
   and a read-only validate/fix pass. Leave the owner session and app running.

## Acceptance

- [x] Synthetic decoded playback advances continuously across camera changes
      with no unsolicited backward jump or per-frame overview seek storm.
- [x] Player source element stays mounted; Focus clocks do not rebuild the
      surrounding editor/Player inputs on every video frame.
- [x] Pause, explicit seek, source-shot selection and exact Start/End Capture
      still work; gesture, Apply/Discard and responsive regressions pass.
- [x] All new listeners/callbacks are cleaned up on tab/clip/unmount changes;
      no polling, new logs containing media data or provider calls.
- [x] Focused checks and final validation pass. No ignored env reads, paid/cloud
      calls, owner-media fixtures, Git mutation or export-policy change.
- [ ] Owner confirms smooth playback of their actual clip; synthetic evidence
      cannot establish every real-device/real-media performance case.

Fake mode requires no API keys and plays real local video with synthetic AI
data. Real Gemini observations still require owner keys, live flags and approval;
they are not needed to fix or test browser playback. No local AI model is used.

## Execution and validation — 2026-10-25

The CL-069 Focus clock lived in ClipEditor: every frame update recompiled the
overlay and recreated Player inputs, while the source overview sought its own
video to the playhead repeatedly. The older shared composition's buffering fix
remains enabled; this was a new local-editor interaction with that playback path.
Earlier CL-069 coverage exercised paused gestures, exact seeking and Capture but
did not exercise sustained playback with Focus open.

The first generated-media reproduction observed 17 overview seeks and 3 decoded
backward jumps in a 2.6-second interval. A silent headless fixture also exposed an
initial programmatic-click AudioContext permission delay; the regression now
mutes that silent fixture so it measures video playback rather than that browser
permission delay. Production volume/autoplay settings are unchanged.

Changed files:

- `focus-preview-controls.tsx` owns Focus-only frame, playing and readiness state
  with the existing Player ref. Playback ticks no longer render ClipEditor or
  recreate its Player inputs. Exact capture reads and validates the actual
  displayed media/Player clock, including readiness after scrubbing.
- `clip-editor.tsx` mounts those controls only in Focus, preserving the same
  Player/source. Retry rebinds listeners without remounting Focus selection.
- `focus-editor.tsx` holds its source overview on the selected camera's source
  frame while playing. Pause/seek updates the editing still; live camera-row
  indication continues. No per-frame second-decoder seeks during playback.
- `test/local-focus-editor.proof.ts` measures real decoded frame timestamps,
  overview seeks, progress and source-element identity across camera boundaries
  at 1440x900, 390x844 and 320x568, then runs the existing editing regressions.
  Native frame callbacks and temporary property instrumentation are removed;
  finally cleanup closes its browser/server and owned synthetic scratch.
- Local workflow guide and ticket index record the behavior and evidence.

Actual verification:

- Final browser proof **passes, 46.07 seconds**: zero decoded backward jumps at
  each size; more than 35 decoded frames and 1.8 seconds of media progress in
  each 2.6-second playback interval; at most 4 overview seeks including play/
  pause transitions; the same main video element survives. Existing pointer/
  touch/keyboard, source-cut positions, real slider Capture, failed-preview
  retry, removal, Apply/Discard and saved-state checks pass. Twenty-five
  acknowledged synthetic edits; provider counts plan/image/render = 0/0/0.
- Existing position/editor-state checks: **12 tests in 2 files pass** using
  `scripts/local-test.config.ts --maxWorkers=1`. Both suites are fake/paid-off,
  network-blocked and disable env-file loading.
- Frontend and proof TypeScript, affected-file ESLint, Prettier and
  `git diff --check` pass. No broad suite or native export rerun is warranted:
  this packet changes neither contracts/composition nor worker/export code.
- Final normal `/start` returns 200 and capabilities report `synthetic-ai`.
  Frontend hot reload serves the fix; no stack restart or owner session/media/
  configuration change. Save any dirty edits before refreshing the owner tab.

Validate/fix review caught a retry-key remount that would reset Focus selection;
retry now changes the listener binding dependency instead. Capture readiness
also checks actual clock alignment, retaining synchronous capture guards.
The browser proof now waits for a visible settled footer before measuring it,
rather than measuring the transient layout between dirty-state updates.

Final read-only verdict: **Meets ticket; no actionable findings**. All local
acceptance rows are covered. Reviewed the actual Player integration, playing/
paused/source-shot behavior, retry/listener cleanup, capture clocks, bounds,
privacy, unchanged buffering, dependency direction and absence of extra timers,
provider calls or controls. No product-scope deviation. CL-067/068/069/070 pending
work is preserved; none of it is staged or committed by this packet. Actual
owner-media/device smoothness remains unverified until owner confirmation.
