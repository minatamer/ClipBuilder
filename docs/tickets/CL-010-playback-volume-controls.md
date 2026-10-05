# CL-010 — Playback volume levels

Owner follow-up, 2026-10-05. Dependency: the existing shared player and read-only
clip review are implemented. Scope: one bounded frontend correction.

## Plan and acceptance

- Clicking the shared speaker button opens a labelled 0–100% volume slider.
  Support pointer/touch, keyboard steps, Escape and outside-click dismissal;
  keep playback controls visible while adjusting volume.
- Apply the selected level to source playback, selected moment playback,
  Remotion edited preview and final MP4 playback. Zero is silent. Synthetic
  fake-mode players expose the same controls without real audio.
- Remove the owner's highlighted export explanation below the cloud preview.
  Keep export actions and other workflow notices.
- Playback volume changes only browser listening. Preserve exported audio,
  backend diagnostics, private output captures, processing and configuration.
- Update existing focused verification and run the five settled root gates.
  Use synthetic fake/off checks with no API keys or cloud/provider dispatches.
  Real media/device listening and paid flow testing remain owner-only.

## Evidence

Implemented in the shared `PortraitPlayer`, native `useRangePlayback` and all
source/candidate/fake-review/Remotion/final-output callers. The speaker opens a
percentage slider, zero silences playback, positive levels restore audio, and
keyboard focus/open state keeps the controls visible. Escape returns focus to
the speaker; blur/outside-pointer dismissal and effect cleanup remove the popup
listener. Native and Remotion volume listeners are removed on unmount. The
owner's highlighted cloud-review paragraph is removed. The frontend guide now
describes playback levels; backend logs/captures and exported audio are untouched.

Focused verification: **52 tests in five files** passed. All five root gates
(`corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`, `build`) passed;
the unit gate has **1,039 tests in 88 files**. The first combined run timed out
in the unrelated renderer build-context test under concurrent check load; a
settled full unit rerun passed without changes to that test or its timeout.

An isolated browser harness used existing components, synthetic silent WAV
bytes and injected metadata-only API ports. Pointer disclosure and keyboard
levels verified native source volume 40%, native moment zero/muted and
100%/unmuted, and Remotion zero/muted and 50%/unmuted. Fake review reached 30%
without real audio. Escape and outside-click dismissal passed. Metadata call
counts remained two session reads, one preview read and one output read across
volume changes; zero processing/provider/cloud calls. The harness tab, all test
listeners and temporary source/bundle directory were removed.

Scoped read-only validation found no actionable issues in the new volume/popup
wiring, caller coverage, paragraph removal, boundaries, teardown or documentation.
Unrelated existing worktree changes were excluded from this follow-up verdict.

Still unverified: real device/touch/screen-reader listening and actual final MP4
playback. The browser harness's audio-only fixture cannot satisfy the existing
1080×1920 output decode gate, so final controls were checked by static markup,
typechecking and the shared native controller rather than a final-video browser
run. Fake/no-key checks prove local behavior, not paid AI/render quality. The
owner's existing paid/cloud workflow needs its real provider keys, live flags
and separate approvals. No local AI model/weights are needed for volume.

No deployment, paid processing, secret access or Git mutation was performed.
The existing frontend dev server serves the changes: `/start` and
`/api/sample/config` return 200, as does backend `/v1/health`. No app restart
or owner configuration change was needed; the generated type references were
restored to their pre-build dev paths.
