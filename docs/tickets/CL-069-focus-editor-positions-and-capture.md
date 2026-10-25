# CL-069 — Clear person positions and playback-based camera editing

Status: implemented; focused synthetic verification and final read-only validation pass. Owner real-AI/personal visual acceptance remains manual.
Execution authorization — 2026-10-25: implement this editor packet and repeat
focused validate/fix passes until no actionable findings remain. Afterwards,
execute the separately scoped CL-070 export-quality correction. No Git action,
paid testing, cloud change or deployment is authorized. Earlier planning-only
statements below are historical, not a new execution gate.
Owner approval — 2026-10-25: write this plan, use **position** throughout the
editor, and preserve automatic framing. The owner previously requested discussion
before execution; this packet does not claim implementation authorization or
completed checks. No restart, configuration change or Git mutation is required
to prepare it.

Dependencies: the implemented CL-068 focus contracts, editor, saved edits and
native export, including its explicit per-person removal follow-up. These are
currently pending working changes; preserve them and unrelated CL-067 intake
work. Implement this one packet against that baseline when execution is requested.

Authority: [owner focus-editor decision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#focus-editor-position-ux-decision--2026-10-25),
the existing shared editor/footer/readiness decisions, CL-060's nonfatal AI
quality policy, and CL-068's source clocks, bounds and render geometry.

## Problem and intended result

People currently exposes observation intervals and editable appearance times.
Those are implementation data, while the owner wants to select a person and
visually correct their framing. Detection rectangles overlap the actual portrait
crop. Camera rows identify a person but do not distinguish their different
positions. Precise numeric controls dominate the default view, and camera
boundaries require typing rather than capturing the left preview's playhead.

Keep all existing automatic camera segments. Present their distinct positions
clearly, make positioning visual, and make timing edits use playback. This is an
editor correction, not another automatic-framing policy or provider stage.

## Owner-approved scope and non-goals

- Use **position**, never the earlier proposed terminology, in UI labels,
  accessible names and new instructions. A position is framing: center and zoom
  within a particular source shot, not a physical camera or a verified identity.
- Preserve Gemini prompts, sampling, models, approvals, provider call counts,
  compiler switches/holds and every returned/compiled camera change. Do not
  deduplicate the timeline, smooth motion, suppress small differences or change
  framing because a person appears stationary. Labels may share a position;
  timeline rows must remain separate.
- A person can have several positions over time. Keep source-shot boundaries
  separate and do not promise identity matching across source cuts: the current
  AI contract only maintains anonymous IDs within a source shot.
- No extra detector, angle/scene matcher, tracking model, API call, automatic
  retry, new storage service, arbitrary timeline or renderer input.
- Keep per-row Remove person, custom framing, split/remove camera change,
  reset, Apply/Discard, source binding and immutable export revisions.

`FAKE_MODE=true` with no API keys already supports synthetic people/camera
tracks, manual edits, saved state and real local exports. The planned UX will
use the same path. Fake people are placeholders and do not prove live detection
or identity quality. Real observations still require the owner's Gemini key,
enabled live/paid flags and applicable approvals; no agent paid test is allowed.
No local AI model or weights are needed or introduced.

## UX specification

Use the existing Focus settings slot with three keyboard-accessible sub-tabs:
**Camera / People / Advanced**. Camera is the default. Tabs replace the same
panel, preserve selection and dirty state, and never submit or trigger analysis.
Keep the existing left vertical preview and persistent workspace footer.

### Camera — who is shown and when

1. Keep every camera segment in chronological order, with its existing span.
   Label a row, for example, `Person 2 · Position 1` and `0:08.000–0:14.500`.
   A later use of that same position keeps Position 1; a genuinely different
   crop or another source shot gets its own position number. Custom/unassigned
   camera segments remain clearly labeled Custom position.
2. Selecting a row pauses/seeks the left preview to its start. Keep that edit
   selection stable while the owner scrubs the playback slider across other
   rows. Distinguish the playback-active row from the edit-selected row; do not
   silently redirect Capture or a removal to whichever row is playing now.
3. Keep Focus on person/position selectors, Start/End with Capture, Split at
   playhead and Remove change. No zoom or X/Y percentage fields in this view.
   Remove change is distinct from the per-person Remove CTA in People.
4. Camera positioning edits affect the selected change only. After Split,
   editing the new right-hand change can create a different position for the
   same person without changing the earlier framing. Keep person association
   when its manual position moves; do not rename every drag Custom position.

### People — visual positioning without appearance times

1. Keep Add person and the existing per-person list/Remove buttons. Remove
   appearance selectors, presence timelines, Appears at, Leaves at, Add
   appearance and Remove appearance from the UI. Retain their underlying AI
   observations and timestamps as data; hiding controls must not destroy them.
2. Selecting a person highlights that row and selects their current/last chosen
   position. If that position is not under the playhead, navigate to a real use
   of it, preferring the nearest use. Show a compact Position 1 / Position 2
   selector only when the person has several positions. No timestamp entry here.
3. In the source overview, remove face/body detection rectangles. Show small
   numbered square handles at camera-crop centers and exactly one blue portrait
   outline for the selected position. The selected person's number is centered
   inside that outline. Only relevant handles for the current source shot are
   shown; do not carry an old source shot's geometry into the new view.
4. Dragging the selected number moves the camera outline immediately and keeps
   the person association. Arrow keys provide the same positioning operation.
   Preserve the pointer's grab offset, clamp to shared effective crop bounds,
   and support touch/pointer cancellation without a jump or stuck drag.
5. People edits apply to repeated uses of that same person/position within its
   known source shot, leaving other positions and source shots unchanged. Show
   the concise scope `Same position` when editing repeated uses; Camera edits
   show `This change`. Never silently apply across all positions of a person.
6. A detected person with no camera use remains in the list. Selection alone
   cannot rewrite the timeline. Show a concise Not used state and an explicit
   Use here action to assign that person to the selected camera change using
   their observation-based position, then allow the same position editing.
   Add person retains the current bounded manual creation/assignment behavior.

### Advanced — precise selected-framing controls

Move Zoom, Horizontal (%) and Vertical (%) here, with the current numeric
bounds/validation. Numeric playhead navigation can also live here; scrubbing
remains available without opening Advanced. Keep the selected person/position
and visible edit scope from the originating Camera or People selection. Moving
between tabs alone must not change framing, edit scope, timing or playback.
Pointer/keyboard positioning remains available without opening Advanced.

### Capture Start/End from the left preview

- Reuse the manual clip selection's shared Button/Clock Capture presentation.
  Read the actual Remotion Player frame, not the source-overview video's clock,
  stale React state or the manual-selection helper's whole-second formatting.
  The existing `capturePreviewTime` helper intentionally floors seconds and
  should remain unchanged for its existing consumer.
- Pause playback, capture a settled displayed frame and target the explicitly
  selected camera change. Disable capture when the preview is unavailable,
  failed, pending or seeking; never invent a time when no displayed frame is
  confirmed. Keep old values on an unavailable/invalid capture.
- Start captures displayed frame F. End captures F + 1, so the paused frame is
  included in the half-open interval. Give the end button the accessible title
  End after current frame. Show enough fractional precision to round-trip the
  actual 30 fps frame; do not round a capture to a whole second.
- Keep the first start at 0 and final end at clip.frames locked. Moving an inner
  boundary updates the adjacent interval atomically, preserving complete
  positive coverage. A capture cannot cross the neighbor's other boundary;
  report a concise actionable error rather than silently choosing another time.
  Typed invalid drafts retain the existing visible-error/disabled-Apply behavior.
- Split uses the same settled frame and the current bounds/maximum-shot rule.
  Selecting or scrubbing the preview does not itself mark the edit dirty.

## Implementation approach and file-level plan

Prefer a frontend-only change, using existing persisted focus shots as the
authoritative camera data. No new cross-boundary schema, durable position IDs,
provider output field or native rendering branch is planned.

1. Add `apps/frontend/src/features/local-editing/focus-positions.ts` and its
   focused unit tests. Derive position labels and their member camera rows from
   person ID, known source-shot interval and exact shared rendered crop geometry
   (`ownerFocusCrop`). Number positions per person in first-use order. Source
   shot intervals come only from existing decoded `shotStart` decisions, with
   clip start as the fallback; do not infer extra cuts.
   - Identical effective crop geometry can reuse a label within that scope,
     while every camera row/timestamp remains intact. Do not add a subjective
     jitter threshold or mutate raw observations/decisions for presentation.
   - Snapshot the selected members at gesture start, then update their numeric
     framing atomically. Do not reselect new members halfway through a drag as
     grouping keys change. Recompute derived labels after the edit; labels are
     display ordinals, not new persistent identities.
   - Single-change edits update only the selected row; same-position edits
     update only that group's uses. No silent operation crosses a source cut.
2. Refactor `focus-editor.tsx` around explicit selected change/person/position
   and edit scope, independent of playback frame. Connect derived labels,
   People selectors, numbered handles, Camera Capture and Advanced controls.
   Preserve exact-ID person removal, custom crop preservation and reset.
3. In `clip-editor.tsx`, expose a small current-player capture/readiness callback
   to FocusEditor. Reuse the existing frame clock/listeners, pause/seek handling
   and failure/pending gates. Detach any added listener on setting/clip/unmount
   transitions. Do not introduce another playback controller or polling timer.
4. Adjust `style.css` using shared tokens/Button/ControlTabs. Inspect the selected
   outline, handles, list labels and same-slot Camera/People/Advanced content at
   1440x900, 390x844 and 320x568. Keep controls reachable, 44px targets, visible
   Apply/Discard footer and no horizontal overflow or motion suppression.
5. Extend `test/local-focus-editor.proof.ts` for the full real editor path.
   Reuse `test/local-focus-native.proof.ts` for saved position/timing export
   parity, adding only necessary synthetic cases. Update `LOCAL_WORKFLOW.md`
   after behavior exists, plus frontend guide only if its controls/verification
   summary needs revision. Finish ticket/index evidence and read-only validate.

Original AI observations/decisions and the automatic base stay intact; manual
camera changes use the existing edit.focus operation, dirty detection, protected
save and revision snapshot. Selecting tabs/rows or deriving labels must leave
the serialized edit unchanged. Old drafts without focus retain the current
compatibility path. Reopening derives the same labels from unchanged saved
geometry/timing; removing a person keeps their camera crops as custom framing.

If implementation proves a contract/worker change necessary, revise this packet
first rather than silently widening a frontend task. Follow native parity and
verified backend lifecycle rules if such an adopted change is made. No routine
restart is needed for this documentation-only plan.

## Acceptance and verification — local evidence below

- [x] Every existing camera segment remains represented and ordered; multiple
      positions for one person are distinguishable, repeat uses share a label,
      and source cuts retain separate scopes. No automatic output is changed.
- [x] People contains no appearance/time editors. Add/select/per-row Remove,
      multiple-position navigation and unused-person handling work without
      selecting or removing the wrong person or changing the timeline on select.
- [x] One crop outline and centered numbered handle replace detection boxes.
      Actual pointer, touch-shaped pointer and arrow-key edits work at all three
      viewport sizes; same-position versus single-change edits are isolated.
- [x] Precise Zoom/X/Y fields appear only in Advanced; tab changes preserve
      selection/scope/draft and leave the serialized edit unchanged.
- [x] Scrub then Capture targets the selected change even across a playback
      boundary. Verify non-whole-second frames, seek completion, end inclusion,
      first/final locks, invalid neighbor boundaries and unavailable preview.
- [x] Split/remove, exact contiguous coverage, bounds, legacy drafts,
      Apply/Discard/reset, failed save/retry, reopening, pending/failed preview
      and existing per-person removal regressions still work.
- [x] Applied position and captured timing appear in the protected saved edit
      and real local MP4. Decode generated-media frames before/at/after changed
      boundaries and another source-shot position; leave unrelated uses, audio
      clocks, original/automatic data and cached source bytes unchanged.
- [x] Exact fake plan/image/render-provider counts remain zero during manual
      UI editing. Local native export is distinguished from a paid provider job.
      No new content logs, raw provider captures or media fixtures are added.
- [x] Focused position/editor tests and browser/native proofs pass under the
      existing fake/paid-off/network-blocked setup with envDir:false and no
      ignored environment reads. All proof browsers/listeners/scratch close.
- [x] Frontend/proof TypeScript, affected-file ESLint/Prettier and
      `git diff --check` pass; read-only validate reports the settled scope.
      No blanket whole-suite rerun unless new failures/changes justify it.
- [ ] Owner personal visual/live-AI acceptance remains explicitly unverified;
      fake tests do not prove real AI quality. No paid/cloud/deploy/push action.

## Planning handoff — 2026-10-25

Plan grounded in current focus contracts/compiler, FocusEditor/ClipEditor,
existing Capture controls, fake/browser/native test composition and shared
footer/navigation primitives. Implementation checks above have not run for this
packet. Only the packet, source-of-truth decision and ticket index are changed
while planning; running services, pending implementation, saved media and
configuration are preserved. Do not mark this ticket implemented from the
earlier CL-068 evidence.

## Execution and validate record — 2026-10-25

Implemented the planned frontend-only correction. `focus-positions.ts` derives
display labels/membership without rewriting automatic data or timeline rows.
FocusEditor uses explicit edit selection, per-source-shot positions, small
centered drag handles, People without appearance fields, Camera timing/Capture
and Advanced numeric controls. ClipEditor captures the actual settled Player
frame, with preview seeking/error/readiness guards and cleaned-up listeners.
Existing edit.focus, revision/save/restore and native rendering contracts remain.

Evidence actually produced:

- **12 checks in 2 files pass**: new position/group/source-scope/capture/clamp
  regressions plus existing editor-state compatibility, with
  `scripts/local-test.config.ts --maxWorkers=1`. Fake/paid-off/no-network setup;
  no ignored env loading. Initial sandbox transform-cache failure was rerun
  using explicit unsandboxed execution, without an application workaround.
- Current-source `test/local-focus-editor.proof.ts` passes at 1440x900,
  390x844 and 320x568 (final run 32.26 seconds). Real CDP mouse and touch,
  grab-offset/no-initial-jump, cancellation, keyboard, same-position/single-change
  isolation, position labels, unused person/Use here, Add/row Remove, Advanced
  visibility, pending/error/retry, Apply/Discard/reset and reopen pass. Every
  original row remains represented; original observations and source-cut
  positions are unchanged. Twenty-five acknowledged synthetic edits, with exact
  provider counts plan/image/render = 0/0/0.
- Scrubbing the actual playback slider across a row boundary keeps the edit
  selection. Start captures frame 29 and End captures the settled slider frame
  plus one, including the paused end frame correctly; locked endpoints,
  invalid neighbor capture, seeking and failed-preview/retry states pass.
  Numeric crop geometry in actual browser preview matches shared native values.
- `test/local-focus-native.proof.ts` now uses the same capture/edit helpers to
  create boundaries 29/44 and zoom, then exports actual generated media through
  the current worker function. Decoded before/at/after boundary pixels, source/
  cache integrity, revision export and cancellation/scratch cleanup pass. This
  proves framing/timing parity. CL-070 separately verifies original-detail
  retention in the corrected final pipeline.
- Desktop/390/320 Camera, People, Advanced and Capture captures were inspected
  under ignored `.local-build/evidence/cl069-*`. Exactly one portrait outline,
  no detection rectangles/extra selected-button box, visible persistent footer,
  reachable Capture/Remove, 44px targets and no horizontal overflow are checked.
- Frontend/proof TypeScript, affected-file ESLint, Prettier and `git diff --check`
  pass. No broad suite was run. The current app's verified listeners remain
  3000/4000/4200; health, /start and /api/sample/config return 200 outside the
  sandbox. No normal-app processing request or owner-file change. CL-070 later
  rebuilds/reloads only the backend/internal worker using verified ownership.

Validate pass 1: **Meets ticket with concerns**. Visual inspection found inherited
pressed-button styling around the handle; scope review found that entering
People from Camera could retain single-change gesture scope. Exact-ID removal
selection also needed a derived fallback after Discard. Verified and fixed these
within execute. The proof's premature save-read and preview-remount waits were
fixed in the proof, not attributed to product persistence failure.

Validate pass 2 on settled source: **Meets ticket; no actionable findings**.
Checked all acceptance rows, actual UI integration, capture clocks, grouped
versus single-change edits, bounds, saved/automatic separation, dependency
direction, privacy/spend, pending/errors, cleanup, stale declarations and tokens.
CL-067 and the prior CL-068 implementation are preserved; CL-070's export
detail correction remains a separate packet/verdict. No provider/compiler/schema
change or extra service/dependency. No product-scope deviation; tabs preserve
selection/scope on navigation, with People/Camera gesture scope chosen at the
actual edit. Source data is never rewritten merely to derive a position label.

Final interaction review and validation: a still-valid stale person ID after
Discard could highlight a different person from the restored selected row;
selection now derives from that row, preserving explicit unused-person preview.
The scope label now derives from the active Camera/People view before any
gesture, while Advanced remembers the last edit scope. Regression proof passes
for Discard highlighting, multiple-position navigation/source cuts and actual
playback-slider Capture at all three sizes. Final read-only pass on this settled
snapshot: **Meets ticket; no actionable findings**. No behavior outside the
approved editor correction was added.

All work remains unstaged/uncommitted. Owner personal/real-Gemini visual quality
acceptance and hosted Linux/release acceptance remain unchecked. Fake controls
and API-free native processing do not prove live AI quality.
