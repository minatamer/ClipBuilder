# CL-228 — Camera-seeded filter ranges with timestamp Capture

Status: Complete locally, 2026-11-06. Dependencies: CL-207 Capture, CL-220 independent
Hook content and CL-224 unified editor collections are implemented. Preserve
the separate pending CL-225/227 implementation and CL-226 planning. No Git action.

## Owner request and UX decision

Extend Filters beyond a whole-occurrence setting. The owner wants camera
positions with timestamps and editable Start/End, including Capture beside
each endpoint, so a filter can cover the Hook or any chosen section. Keep the
layout coherent and verify actual desktop/phone controls before completion.

Use one compact chronological Filter timeline and one inspector. Initially its
rows are the existing camera positions, including visible [Hook] labels and
final-video timestamps. Selecting a row pauses/seeks its own occurrence and
prefills that range without modifying data. Original or the legacy saved filter
fills unedited ranges. An explicit filter range appears as its own row; remaining
unfiltered camera portions stay selectable. Do not append a second workflow or
force owners to visit Focus first. The list remains complete during playback.

The selected inspector keeps Start/End with inline Capture above the existing
Filter/Strength controls. Normal footer Apply/Discard saves/discards everything.
Reset filter affects only the selected range, setting it to Original. Start/End
may trim/extend beyond the initial camera position within its own occurrence.
Camera positions are starting points, not lasting links: later camera changes
do not silently retime an authored filter. A range spanning positions has one
row with its camera context; avoid duplicate editable copies.

## Data, clocks and compatibility

- Add one shared bounded optional `videoLooks` array of non-overlapping timed
  preset/strength ranges, using source-relative logical start/end frames. Keep
  the existing optional `videoLook` as the legacy whole-occurrence fallback.
  No IDs, arbitrary CSS, LUT, assets or new provider fields are needed.
- Start is inclusive; End is exclusive. Replacing/moving a range removes its old
  coverage, replaces only overlapping new coverage, and preserves left/right
  remainders of other ranges. Enforce finite ordered one-frame-or-longer bounds,
  a fixed 32-range budget and the clip/Hook window. Reject an over-budget edit
  without changing the acknowledged draft. Never stack two filters on a frame.
- Preserve independent Hook/main ranges through copy/range changes, Apply,
  Discard, save/recovery and export. Changing a Hook clips preserved ranges to
  its new window; newly covered portions inherit the matching source content.
  Legacy documents without ranges keep their exact whole-occurrence behavior.
- Display presentation timestamps and convert source/Hook/body offsets once.
  Reuse the shared settled-preview Capture guards. End Capture ends after the
  current frame. Invalid/busy/seeking/failed/wrong-occurrence capture changes
  nothing; invalid numeric drafts disable Apply without losing prior preview.
- Preview and native rendering resolve the same preset at the same source
  instant, including physical Hook rounding at non-30fps. Only source footage
  is filtered; captions, pictures and authored Text keep their own appearance.

## Allocation and verification

Allocate the owning video-look contracts/operations/compilation/Hook content,
backend edit application and public local agent projection as needed, frontend
timeline/inspector/state/shared Capture, shared preview and native look graph,
focused tests/generated native/browser evidence, owning guides/source of truth
and this ticket/index. Read pinned frontend guidance before implementation.

- Focused units: schema/bounds/overlap/splits/clear/fallback, camera-seeded rows
  and clocks, independent Hook copy/range changes, operations/API round-trip and
  legacy compatibility. Assert no provider/media call on filter edits.
- Actual generated editor in the Codex browser: select Hook/main camera ranges,
  choose/adjust filters, type/capture each endpoint, inspect live source-only
  effect, boundary transitions, Apply/reopen/Discard and invalid/capture guards.
  Inspect desktop, short laptop, 390px and 320px, including selected/dirty/error
  states, long rows, internal scroll, field alignment, keyboard and footer fit.
- Real worker HTTP/native proof with a current-source overlay: decode pixels
  before/inside/after ranges and across Hook/body at 24/29.97/30/60fps. Verify
  Original overrides, legacy fallback and unchanged overlay pixels/audio.
- Run focused tests, relevant no-Node/contracts/frontend/local/test types and
  scoped lint/format, then read-only validate/fix to no actionable findings.
  Rebuild/reload the owned normal backend/internal worker with verified lifecycle
  ownership, preserving the frontend and current owner state.

All checks use generated/fake/no-key/paid-off data with blocked external access;
manual timed filters and native exports require no AI or API keys. Real AI
preparation retains the configured Codex/local speech prerequisites or Gemini
API key/live flags/approvals. Do not trigger inference or patch/regenerate the
owner's current clip. No ignored env/configuration read/change, source download,
provider spend, cloud action, deployment, staging, commit or push.

## Evidence

Implemented the shared optional timed-look schema, edit operation, compilation,
Hook copying, numeric agent projection and native graph. The frontend uses one
camera-seeded list and inspector, shared settled Capture and normal dirty-state
operations. Legacy fallback and explicit Original remain distinct. The owning
frontend guide and local-workflow guide describe the feature. No new dependency,
provider field, arbitrary renderer input or extra AI request was introduced.

- 55 focused cases pass across `packages/contracts/local/video-look.test.ts`,
  backend `timed-filters.test.ts`, frontend `editor-timeline.test.tsx` and
  `editor-state.test.ts`, renderer `video-look.test.tsx`, and existing
  `test/owner-hook-content.test.ts` / `test/owner-editor.test.ts`. They cover
  invalid/overlapping/budget ranges, splitting/moving, camera rows/clocks,
  legacy/Original fallback, Hook inheritance, numeric agent projection and
  Apply/Discard operation transport. Filter edits retain zero provider/media
  calls and unchanged immutable bases.
- `test/local-timed-filters.proof.ts`: four generated real-worker HTTP/native
  exports pass at 24, 30000/1001, 30 and 60 fps. Each decodes 14 frames before,
  at and after boundaries across independent Hook/body branches. Mono, explicit
  Original and legacy Warm match; green sibling picture pixels remain green.
  Encoded frame counts, bounded audio duration and non-silent synthetic tone
  pass. Each proof builds a current-source overlay into isolated scratch, then
  closes the worker and removes its owned temporary files. No old worker bundle
  or owner media is used as proof.
- Codex in-app browser: the actual generated editor passes at 1440x900,
  1366x650, 390x844 and 320x568. Checked selecting Hook/main cameras, filter
  changes, custom ranges spanning positions, both Capture endpoints in both
  occurrences, wrong-occurrence Capture disabled, invalid ranges disabling
  Apply, reset scoped to the selection, Apply/reload, Discard, keyboard focus,
  long labels, internal scrolling, field alignment, footer and horizontal fit.
  Capture remains beside each input on phones. Main presentation 2–4s saved
  source frames 0–60; Hook presentation 0–1s saved source frames 30–60.
  First fixture: exactly one edit POST and zero unexpected requests. Refined
  responsive fixture: zero edit POSTs and zero unexpected requests. Both
  temporary servers/processes closed, ports released, browser tabs closed and
  viewport reset. No browser console errors in the final fixture.
- Generated screenshots are outside Git in the current Codex visualizations
  directory: `cl228-desktop.jpg` and `cl228-phone.jpg`. They show synthetic
  source/graphics only. No owner content was captured for this packet.
- No-Node local contracts, local runtime, tests and frontend type checks pass;
  contracts build passes. Scoped ESLint and TS/TSX/CSS formatting pass. Whitespace
  check passes. Default full suites/build and real-provider/device acceptance
  were not run; this packet uses the focused gates above.

## Validation and local reload

Read-only validation reviewed the CL-228 worktree against this packet, excluding
the earlier CL-225/226/227 changes. Initial findings were independently fixed:
new Hook portions now inherit the body's legacy fallback as well as explicit
ranges; over-budget Hook changes retain the draft with an actionable error;
clearing a legacy fallback through edit operations preserves retained timed
ranges. Regression cases pass. Final verdict: **Meets ticket; no actionable
findings** within this generated/local scope. Shared schema ownership,
dependency direction, fixed renderer inputs, no provider dispatch, cleanup and
absence of new content-bearing logs were inspected.

Verified backend supervisor 17276 and eleven owned processes stopped; ports
4000/4200 remained free through stabilization before replacement. Rebuilt
contracts and launched the normal backend command with unchanged owner-managed
configuration; startup rebuilt its internal worker. Replacement supervisor
18876 owns backend 13020 on 4000 and worker 10944 on 4200. Frontend supervisor
9512/listener 3496 on 3000 was preserved. Health, `/start` and
`/api/sample/config` return 200. Exposed capabilities remain Codex/ready,
local-speech, local media available and cloud false. No processing was submitted.

Content-free canonical hashes match before/after reload for the current source,
base, edit, assets and outputs; one inactive clip remains. This is stronger
preservation evidence than CL-227's historical aggregate check, without
retroactively changing that packet's claim. Backend content-safe logs are
`C:\Users\minat\AppData\Local\Temp\clipbuilder-run-20261106-a04f4d7a75cc4fdb9b68db394a80decd\backend-cl228.stdout.log`
and the adjacent `backend-cl228.stderr.log`; ownership and aggregate hashes stay
in that private runtime directory, outside Git.

Owner visual/physical-device acceptance remains manual. Existing prepared clips
can use timed filters without regeneration, AI or API keys. Any future fresh AI
preparation retains normal Codex/local-speech or hosted Gemini setup/live/approval
requirements; generated checks establish no real-AI editorial-quality claim.
No source download, inference, ignored configuration change, cloud/deployment,
owner saved-clip modification, staging, commit or push occurred.
