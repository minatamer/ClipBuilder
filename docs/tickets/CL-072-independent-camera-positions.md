# CL-072 — Independent camera positions with nested Advanced controls

Status: implemented and locally validated; owner visual acceptance remains
manual. Dependencies CL-068–071 are
implemented in the pending worktree; preserve them and unrelated CL-067 work.

## Owner decision and scope

Focus has Camera / People views. Advanced belongs inside Camera, scoped to the
selected person and position. Each timestamped position owns its own framing
and start/end; identical crops no longer imply linked positions. Keep automatic
observations and every original timeline row, source-shot boundaries, exact
Capture, Apply/Discard, saved revisions and the CL-071 playback correction.

Replace Split at playhead with Add position; retain the word position in UI.
Append the next number for the selected person, and renumber remaining positions
contiguously after deletion/reassignment. Labels are derived in timeline order;
no new persisted IDs, schemas or renderer policy are required.

Add position extends that person's chronological list: divide the last position
for that person into an earlier interval and a new independent later interval.
Use a settled preview frame if it is inside that last interval; otherwise use
its midpoint. Initialize the new position from that last framing, select it,
seek to its start and open Timing so its start/end can be changed or captured.
This keeps the existing complete, nonoverlapping camera coverage. At the shot
limit or a one-frame last interval, disable Add with a concise reason. Never
silently add another person's camera or create a zero-length interval.

## File plan

- `focus-positions.ts` and tests: one derived position per timeline row, dynamic
  per-person numbering, independent edits, bounded add-position helper. Reuse
  existing split/remove contracts internally, without exposing timeline jargon.
- `focus-editor.tsx`: Camera / People; nested Timing / Advanced under Camera;
  selected-position navigation, Add/Remove position, independent drag/numeric
  edits and no linked-scope UI. People retains exact-ID removal and no times.
- `style.css`: shared ControlTabs/tokens, two-column tab sets, existing footer
  and responsive geometry. No reduced-motion changes or new workflow actions.
- Existing browser/native proofs: nesting, independent settings/timing,
  add/delete/renumber/save/reopen, exact Capture and decoded MP4 parity. Preserve
  continuous-playback checks, pointer/touch/keyboard and cleanup.
- Source of truth, workflow/service guide, ticket/index: latest owner behavior
  and evidence actually produced. No environment, cloud, media-library or Git
  mutation; no backend restart because contracts/worker are unchanged.

## Acceptance

- [x] Advanced is reachable only inside Camera and edits the selected position.
      People has no timing/advanced controls. Tab navigation alone is not dirty.
- [x] Each row is an independent person position with its own camera settings
      and time range; matching framing never links edits or hides rows.
- [x] Add appends that person's next number; delete and reassignment renumber
      per person without changing another person's geometry or observations.
      Limits, one-frame intervals, no-person/custom framing and invalid times
      stay bounded; original complete timeline coverage is preserved.
- [x] Exact paused slider Capture, independent gestures/numeric edits,
      Apply/Discard/reset/retry, saved state and source-cut navigation pass.
- [x] Desktop/390/320 layout and keyboard/touch work; persistent footer remains
      reachable. Continuous playback retains zero synthetic decoded rewinds.
- [x] Actual synthetic native export reflects an added position's settings and
      time boundary; originals, preview cache, revision and cleanup pass.
- [x] Relevant unit/browser/native checks, types/lint/format and final read-only
      validation pass. No provider dispatch or content-bearing logs.
- [ ] Owner personal/real-media acceptance remains manual.

Fake mode supports the controls and real local exports without API keys, using
synthetic AI observations. Real Gemini observations require owner keys, enabled
live flags and approvals; no paid test is authorized or needed. No local AI
model or new service is introduced.

## Execution and evidence — 2026-10-25

Delivered the file plan above. Derived positions now map one-to-one to saved
camera rows; removed effective-crop grouping, linked edit scope and redundant
nearest-group navigation. There is no new persisted position identity or schema.
Camera's position selector navigates to that position's own range/settings.
Add position appends after the person's latest interval, opens Timing and seeks
to the new start; Remove position keeps full coverage and updates numbering.
The same behavior handles independent custom positions. Original observations,
automatic shots and source-cut metadata remain untouched by display derivation.

Actual checks:

- **14 tests in 2 files pass**: revised independent-position regressions plus
  existing editor state. Tests cover matching crops staying independent,
  per-person add/delete/reassignment numbering, unrelated geometry/observation
  preservation, chosen/default timestamps, custom positions, one-frame and
  maximum-position bounds, exact Capture and invalid boundaries.
- Current-source `test/local-focus-editor.proof.ts` **passes in 48.62 seconds**
  at 1440x900, 390x844 and 320x568. It checks nested Advanced and keyboard tabs;
  Add selecting the next number/Timing; independent edits; delete/renumber;
  source cuts and navigation; pointer/touch/cancel; exact slider Capture;
  per-person removal; Apply/Discard/reset, save failure/retry and reopen.
  Continuous playback has zero decoded backward jumps with the same source
  element, preserving CL-071. Twenty-five acknowledged synthetic edits and
  exact provider counts plan/image/render = 0/0/0 remain.
- `test/local-focus-native.proof.ts` **passes** with an actual added position
  created through the new helper, captured boundaries 29/44 and independent zoom.
  Decoded MP4 frames before/at/after boundaries and zoom, no added padding,
  original/cache integrity, revisions, cancellation and scratch cleanup pass.
  It builds its own current-source overlay in owned temporary scratch. This is
  API-free native rendering with generated media, not provider/real AI quality.
- Frontend and proof TypeScript, affected ESLint, Prettier and
  `git diff --check` pass. Test configs disable env loading and force fake/
  paid-off/network-blocked setup. No broad suite or export-quality rerun is
  needed: no contracts/composition/worker/export code changed in this packet.
- Synthetic desktop Camera, phone Advanced and 320px People captures under
  ignored `.local-build/evidence/cl072-*` were visually inspected: nested tabs,
  selected context, no horizontal overflow, readable labels and reachable footer.
  Existing pointer proofs confirm 44px targets and phone Capture controls.

Validation/fix: the first integration run retained an obsolete grouped-position
zoom expectation; it now asserts the independent position's actual value.
Final UI review found that an unused People candidate could otherwise keep its
name above another position's Camera form. Entering Camera now restores the
selected row's person without modifying the draft; browser coverage verifies
the context and navigation stays clean.

Final read-only verdict: **Meets ticket; no actionable findings**. Coverage:
nesting/selection, independent framing/timestamps, dynamic add/remove numbering,
legacy save/reset, complete camera coverage, source-shot scopes, CL-071 playback,
actual export, cleanup, dependency direction and privacy/spend are covered.
No product-scope deviation; owner personal/real-media acceptance is unverified.
Source-of-truth and narrow frontend/workflow guides record the superseding
owner decision. Healthy app/session and all prior pending work are preserved;
frontend hot reload serves these changes. Nothing staged, committed or deployed.
