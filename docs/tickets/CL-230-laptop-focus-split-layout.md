# CL-230 — Laptop Focus preview and controls in two columns

Status: Separate-column scrolling revision complete locally, 2026-11-06. Earlier
layout revisions remain historical verified stages.
Owner visual acceptance remains pending. Dependencies: CL-217 selection view and CL-224
unified camera collections are implemented. Preserve separate CL-225–229 work.

## Owner request and layout

Latest owner revision: each laptop column must own its scrolling. Remove the
outer Focus-panel scroll that competes with the right inspector, and remove the
sticky Camera/People/Zoom/Motion tabs and their opaque backing. Keep the larger
source frame and positions together in one left scroll area; active tabs/controls
use one right scroll area, with no nested camera-list scrollbar. Scrolling either
column must leave the other column and workspace footer unchanged. Verify real
wheel/keyboard scrolling, non-sticky tab geometry, all Focus tabs, short laptops,
error/marking states, responsive draft preservation and shared scrollbar styling
using generated/fake/no-key media. Preserve owner clips and normal services.

Owner follow-up during verification: no editor section should have the awkward
outer/inner scrolling visible in the supplied Focus screenshots. Finish the
Focus column revision here, then audit all main editor sections under CL-232
for competing outer scrollbars. Keep intentional bounded collections and normal
single-flow narrow-screen scrolling; do not reduce the larger preview again.

Latest owner feedback (2026-11-06): the top preview/collection row is too short
relative to the lower inspector. Prioritize a usable source frame, accepting
scrolling to reach controls. Also assess a laptop alternative with the source
frame above the positions/people collection in the left column and the active
inspector in the right. Apply the chosen arrangement consistently across all
Focus tabs, preserving shared scrollbars, adaptive narrow layouts and persistent
footer actions. Record the chosen geometry and generated browser evidence here.

Try the suggested alternative: a generous source frame above the camera
collection on the left, active controls on the right. Keep the right inspector
sticky within the panel and independently scrollable; left content may need
panel scrolling on short displays, rather than reducing the frame to a tiny
thumbnail. Camera/People/Zoom/Motion share one geometry. Retain independent
collection scrolling, the shared scrollbar appearance and all footer actions.

Try a laptop layout that moves the Focus source frame left and puts camera
positions and controls on the right across Camera, People, Zoom and Motion.
Adapt each right-column inspector rather than squeezing the existing stack.
Keep narrower displays stacked and let the owner judge the new visual direction.

Enable two columns only at laptop viewport widths with sufficient actual Focus
panel width. Keep the numbered preview/context in the left column and sub-tabs,
camera collection and active inspector in the right. Limit the camera list's
height so controls are discoverable. People also shows the shared camera
collection above its person list, retaining the selected camera context.
Zoom's target preview sits left below its numbered context and stays visible
while scrolling its controls. During Motion head marking/tracking,
replace the numbered preview with its one interactive selection view on the left;
keep context, timing/Capture, optional head fields and progress on the right.
Expanded selection, bulk tracking and footer Track/Cancel/Apply/Discard remain.
Resize and tab changes must preserve edits, selected camera/occurrence and clocks.

Allocate the Focus panel container/Focus-editor layout, narrow Motion layout
hooks if needed, shared stylesheet, generated browser fixture, owning frontend
guide, source-of-truth layout decision, this ticket and index. Reuse existing
components/tokens; avoid new dependencies, provider/contract/native changes,
owner clip modifications, ignored config reads/changes or Git mutations.

## Verification

- Codex in-app browser, generated fake/no-key media: Camera/People/Zoom/Motion
  at laptop 1440/1366/1280 widths and a short viewport. Check 1024 and 390/320
  fallbacks, actual column bounds, list scroll, field/label fit and footer.
- Select Hook/body cameras, use existing keyboard/numbered positioning, change
  and Discard/Apply on generated data; selection and draft survive responsive
  resize. Check Capture guards, Zoom target, Motion mark/expand/Done/Cancel and
  synthetic tracking progress/footer. No real owner edit or tracking request.
- Focused existing Focus/Motion tests as applicable, scoped frontend/test types,
  lint/format, whitespace and read-only validate/fix. No tests mirroring CSS.
- Close generated tabs/listeners/scratch and reset viewport. Preserve normal
  services, saved media and provider settings. UI uses no AI/API keys; fresh AI
  preparation retains normal provider/runtime/live/approval gates. Owner visual,
  physical-device and real AI quality acceptance stay manual.

## Evidence

### Separate-column scrolling and ordinary tabs — 2026-11-06

Added one labelled, keyboard-focusable left scroll region containing the source
and complete positions list. The right inspector owns its own scroll. The fixed
split grid fits the available panel height; the surrounding Focus panel has no
scroll extent. The left list has no nested scrollbar in the split. Tabs and
inspector use normal static positioning, with no sticky opaque tab backing.
The initial intrinsic-grid attempt compressed the preview track and overlapped
the list; explicit max-content rows correct that before final verification.

- Generated Codex-browser 1366×650: both columns are 269px high; left content
  1207px, right Camera content 532px. Right wheel moves only right 0→262px;
  left source bounds stay identical. Left wheel then moves only left 0→650px;
  right stays 262px. Focus panel remains 295/295px with scrollTop zero; workflow
  also has no scroll extent. Tabs move upward with right scroll and compute
  `position: static`; no floating dark strip remains. Shared gutters are 4px
  per column (right's extra pixel is its divider border).
- People and Zoom retain the same outer bounds; Zoom right End reaches 253px
  without moving the left preview. Motion marking uses the left source while
  right End reaches 91px; outer panel remains 295/295px. Invalid Zoom disables
  Apply and yields 233/233px outer bounds, with both columns ending at 539px,
  above the persistent footer. Discard restores the draft.
- 1440×900 screenshot `cl230-separate-column-scroll.jpg` is generated media
  outside Git. At 390×844 and 320×568 both columns stack naturally without
  independent vertical scroll or horizontal overflow; fields fit. Existing
  intentionally bounded narrow collections remain separate from outer scrolling.
- 24 focused Focus/Motion/timeline cases pass, as do frontend types and scoped
  lint/format. Read-only review finds no new schema/provider/native/state change,
  sticky Focus rule or duplicate scrollbar appearance. No CSS mirror tests.
  Normal app/owner data stay untouched. Fixture cleanup is recorded with CL-232,
  which reuses this generated instance for the owner's all-section follow-up.
  Nothing staged or committed. Owner device/visual acceptance remains manual;
  this layout requires no AI/API keys, and fresh AI retains existing approvals.

### Owner full-width controls revision — 2026-11-06

Keep only the preview and camera collection side by side. The owner finds the
remaining controls/actions too constrained in the right column: after the list,
the active editor and local actions must occupy a whole row beneath both
columns. Preserve a scrollable right collection and keep the preview visible
while the full-width lower controls scroll. Camera, People, Zoom and Motion use
the same arrangement. Apply/Discard and Track/Cancel remain in the persistent
workspace footer; do not duplicate those actions in a side column.

Revise the current Focus wrappers and scoped responsive CSS; retain shared
preview placement, selection/clocks, Capture and narrow stacked fallback.
Adapt the full-width Camera/Zoom/Motion fields to use the space. Verify actual
preview/list/lower-row bounds, independent scrolling, all tabs, local actions,
footer, error/marking/progress/expanded states and responsive draft preservation
with generated/fake/no-key media. Prior evidence below remains historical.

### Owner independent-scroll follow-up — 2026-11-06

The owner requests that the right column scroll independently while the left
video stays visible across every Focus tab. Replace the initial shared vertical
scroll with a bounded right inspector and a stable left preview column. Keep
Focus navigation/camera context reachable, keyboard/wheel scrolling, footer
actions and selection/dirty clocks intact. Zoom's target and Motion's selection
must also remain left while their controls scroll. Narrow screens retain a
single stacked workflow. Size previews to the actual remaining pane height.

Extend allocation to a shared preview-slot context and the owning Zoom/Motion
preview render sites if necessary; standalone views retain their inline
fallback. Any visual portal keeps React context and explicitly retains disabled
guards. Test each tab's scroll independently at laptop/short sizes, compare
left-frame bounds before/after, test keyboard/focus scrolling, Motion marking/
expansion/progress and Zoom target, and confirm responsive draft preservation.
Use generated/fake/no-key fixtures only. No owner clip modification, provider or
native work, app restart, configuration or Git mutation. Evidence below records
the initial trial; append follow-up results after verification.

### Initial trial implementation

Implemented a named inline-size container on the Focus panel, with two-column
CSS at viewport widths of at least 64rem and actual panel widths of at least
42rem. Preview/context sits left, tabs/collection/inspector right. No viewport
JavaScript, duplicate editor, reparenting portal, new dependencies or native/data
changes. CSS layout changes do not remount the player or editing state.

People now receives the existing shared camera timeline as well as its person
list. Zoom keeps the numbered context and places its target below it on the
left, sticky while controls scroll. Motion marking/tracking uses one left
head-selection view with right context, timing and inline Capture, two-column
optional head fields and progress. Error/status rows have separate positions.
Expanded selection and persistent footer actions retain their existing behavior.
The frontend guide and source of truth record the trial.

## Initial trial verification and review

- Codex in-app browser used the actual generated two-person editor. Split layout
  verified at 1440x900, 1366x768, short 1366x650 and 1280x800. Stacked fallback
  verified at 1024x768 (actual panel 671px, below the 672px threshold), 390x844
  and 320x568. No document horizontal overflow or fields outside the Focus panel.
  Camera list is complete, scrolls internally and remains selectable in all four
  sub-tabs. Long forms still scroll within the existing editor panel; this trial
  does not claim every control fits above the fold on a short laptop.
- Selected Hook/main rows through People, moved a numbered position by keyboard,
  switched Camera/Advanced and resized while dirty. Generated main Person 2
  changed from x=0.70 to 0.71 and survived resize/Apply. Readback confirms main
  0.71, independent Hook 0.70 and immutable base 0.70. Exactly one generated edit
  POST, zero unexpected requests and plan/image/render counts all zero.
- Added a generated Zoom, moved its target by keyboard, resized from split to
  1024/390 fallback and retained the 51.2% target. Discard restored it. Final
  laptop check confirms the complete sticky 150x267 target remains inside the
  scrolling panel while numeric controls are focused.
- Motion: marked by keyboard, expanded selection and confirmed Done; injected
  synthetic tracking displayed the shared progress and persistent Track/Cancel
  footer, then completed. No actual pixel tracker/provider was run. Bulk Motion
  showed its two-person plan/progress and cancelled cleanly. At 320px, invalid
  settled End Capture retained the existing 1s endpoint with an actionable
  message. Marking survived resize to the laptop split. Optional head fields and
  error states fit; final End input/Capture button bottom difference is 0px.
  Cancel restores the numbered source and normal navigation/footer.
- Generated screenshots outside Git: `cl230-camera-laptop.jpg`,
  `cl230-zoom-laptop.jpg`, `cl230-motion-laptop.jpg` in this chat's Codex
  visualizations directory. Final browser error log empty. Viewport reset and
  all generated tabs closed. Four sequential fixture instances had counts
  0/0/1/0 edit POSTs and zero unexpected requests each. Fixture ownership/tree
  cleanup verified; ports 64820/63591/57837/60127 released and owned scratch
  removed. Normal health and `/start` return 200; no normal service restarted.
- Final 24 existing tests pass across Focus positions, head selection, bulk
  Motion and editor timeline under the fake/paid-off/no-network configuration.
  Frontend and test types, scoped ESLint/Prettier and whitespace pass. No CSS
  mirror tests, broad suite, native build or new export proof was needed.

Read-only validation inspected this packet and the CL-230 container, layout,
People timeline and opt-in simulated-tracking fixture changes. Prior CL-225–229
changes were excluded. Browser review corrected Zoom's displaced target/scroll,
Motion Capture alignment and separated error rows before final verification.
Final verdict: **Meets ticket locally; no actionable findings**. Checked hidden
panels, breakpoint fallback, shared semantic controls, state/clock ownership,
normal motion, provider isolation and cleanup. No scope deviation.

Owner visual/physical-device acceptance remains manual: this is the requested
layout trial, not a recorded owner design approval. Prepared clips need no AI or
API keys for the UI. Fresh real preparation retains normal Codex/local-speech
or hosted Gemini/live/approval requirements; mocked tracking establishes no real
AI or head-follow quality. No owner clip/source/assets/exports/configuration were
modified; no inference, source download, cloud action, deployment or Git mutation.
Changes remain unstaged/uncommitted.

## Latest preview-size alternative results — 2026-11-06

Implemented the owner's suggested alternative: generous source preview above
the camera collection on the left, with active controls/local actions on the
right. The existing 64rem viewport/42rem actual-panel split threshold remains.
The source is no longer assigned a fraction of a short two-row viewport; short
laptops may scroll the left stack. The right inspector stays sticky within that
panel and scrolls independently. Its Camera/People/Zoom/Motion navigation stays
at the top, with scroll padding for focused controls below it. The camera list
retains bounded independent scrolling and shared scrollbar appearance.

Zoom places source and target side by side within the left preview area, rather
than pushing its target below the short viewport. Motion marking uses the larger
left region; expanded selection, progress and all workspace footer actions
remain. Narrow screens stack with normal scrolling and no alternate editor mount.
This supersedes the previous full-width lower-control row, per the latest owner
request. No clocks, native contracts, provider calls or saved owner edits change.

- Generated Codex-browser checks at 1440×900, 1366×650 and 1280×800: source frame
  is approximately 377×212, 404×227 and 350×196px respectively. The short-laptop
  frame previously shown by the owner was about 171×96px; actual new source
  geometry is substantially larger. At 1366, Camera inspector scroll 0→269px and
  People 0→68px leave the source and panel scroll unchanged. On a short display,
  reaching the left list may require the intended panel scroll.
- Zoom at 1366 has a 276×155 source and 116×206 target, both visible before and
  after right-inspector scroll 0→259px, with identical frame bounds and panel
  scroll zero. The first stacked-target attempt pushed its target offscreen;
  this was corrected before completion. Target x=50.7% survives desktop→1024→
  390→320→desktop resizing while dirty, and Discard restores it. At 1024 this
  generated panel has sufficient actual width to use the split; phones stack.
- At 1440, actual wheel input moves the camera list to scrollTop 772 while the
  right inspector and outer Focus panel remain at zero. Source preview and
  footer remain visible. Local Add/Remove, Camera timing/Capture, People positions,
  Zoom controls and Motion actions retain one owning section each.
- Motion keyboard head marking, expanded selection/Done and Cancel work. The
  dedicated injected `/motion.html` fixture shows shared progress and persistent
  Cancel tracking, completes into a local Motion draft, then Discard restores it.
  An earlier regular generated flat-pixel fixture exercised the existing
  actionable untrackable-region error; it proves no real follow quality. No
  real owner media, inference or provider dispatch was used.
- Empty Zoom magnification gives an actionable validation state, disables Apply,
  shrinks the panel/inspector below the banner and leaves the footer clear.
  At 390×844 and 320×568 no horizontal overflow; fields fit. The 390 People
  navigation/controls also fit and remain reachable through normal scrolling.
  Screenshot `cl230-preview-above-list.jpg` is generated media outside Git.
- 24 existing focused Focus positions, head selection, bulk Motion and editor
  timeline cases pass (13+11), with frontend types, scoped lint/format and
  whitespace checks. No CSS-mirror tests or native rebuild needed for this
  layout-only follow-up. Read-only validation checks grid/container sizing,
  sticky navigation/scroll ownership, hidden panels, fallback/state preservation,
  semantic fields/actions and the shared scrollbar rules: no actionable findings.
- Three sequential isolated fixture instances recorded zero edit POSTs and zero
  unexpected requests. Owned trees closed and ports 62491/51855/55801 released;
  final two-process tree absent through stabilization and scratch removed.
  Browser errors empty, viewport reset and tab closed. Normal health, `/start`
  and `/api/sample/config` return 200. No owner media/config changes or Git action.

Prepared clips need no AI/API keys for this layout. Fresh real AI still requires
the configured Codex/local-speech or hosted Gemini setup, live flags and approvals.
Owner visual/device acceptance of this alternative remains pending; generated
checks establish mechanics, not personal design approval or real AI taste.

## Independent-scroll follow-up results

Implemented one labelled, keyboard-focusable right inspector for all Focus tabs,
with native overflow scrolling and sticky Focus navigation. The laptop layout
uses the actual remaining grid/flex height, including after validation banners;
it no longer relies on scrolling the whole settings pane. Narrow layouts retain
one stacked flow. Left source/Zoom/head views fit the available height. Zoom's
source context and target share the left column when needed to fit short panes.

The shared `focus-preview-slot.tsx` keeps Zoom/head previews in that stable left
column without changing their React context. Standalone Zoom/head editors retain
inline fallback; resizing does not move their mount target. Explicit Zoom-target
disabled state now also includes Capture-in-progress, preserving the old native
fieldset guard after visual placement. Expanded selection retains its existing
viewport sizing. This supersedes the initial trial's CSS-only/no-portal detail;
no contracts, clocks, provider/native code or saved documents changed.

- Final Codex-browser short-laptop checks at 1366x650 show Camera right scroll
  0→388px, People 0→184px and Motion 164→287px with identical before/after left
  frame bounds and zero outer settings scroll. At 1366x768 an actual wheel
  scroll moves Zoom's inspector 30→426px with both left frames unchanged.
  Home/End, focusing off-screen inputs, the sticky tabs and footer remain usable.
- Split sizing also checked at 1440x900 and 1280x800; 1024x768 and 390x844/
  320x568 stack without horizontal overflow. Zoom's 51% target survives laptop→
  phone→laptop resize while dirty. Discard restores it. Switching to Captions
  restores its original panel layout. No owner data was used for these checks.
- A generated invalid Zoom initially exposed a height bug: its error banner
  pushed the fixed pane behind the footer. The corrected flex/grid height chain
  shrinks the previews/inspector, including the main portrait preview, to the
  remaining space. Final 1366x650 invalid-state bounds end above the 564px footer,
  retain an actionable error and disable Apply. No fixed pixel banner offset.
- Motion head marking stays left during right scrolling. Expanded selection,
  keyboard marking and Done work; invalid End Capture retains the 1s endpoint.
  Injected fake tracking shows progress, disables head controls and cancels
  cleanly through the footer. Mobile marking also works after resizing; no real
  pixel tracker, provider, inference or export was invoked. Actual follow quality
  and owner visual/physical-device acceptance remain manual.
- 24 existing focused Focus/Motion/timeline cases, frontend/test types and scoped
  ESLint/Prettier pass. No tests mirroring CSS, full suite or native build needed.
  Read-only validation inspected the final scoped implementation, context and
  disabled guards, hidden/fallback states, height bounds, state preservation and
  cleanup; **Meets ticket locally; no actionable findings**. Earlier CL-225–229
  changes and initial-trial evidence remain distinct from this follow-up.
- Generated screenshots `cl230-independent-scroll.jpg` and
  `cl230-scroll-zoom.jpg` are outside Git in this chat's visualizations directory.
  Browser error log empty, viewport reset and tabs closed. Both generated
  instances report zero edit POSTs and zero unexpected requests. Their ports
  63305/56828 are released; the final two-process owned tree is absent and scoped
  scratch removed. Normal health and `/start` return 200; app services, owner
  media/edits and configuration remain untouched. Nothing staged or committed.

Prepared clips need no AI/API keys for this layout. Fresh real AI processing
retains the existing Codex/local-speech or hosted Gemini/live/approval gates.

## Full-width controls revision results

Historical revision; superseded by the latest preview-size alternative below.

Split the Focus collection from the active inspector. The preview and scrollable
camera collection occupy the first row; all active fields and local actions now
span both columns in the lower row. The lower row scrolls independently, keeping
the preview/list visible. Main settings tabs use one laptop row to free vertical
space. Camera Start/End sit side by side with Capture, and Zoom's Start/Capture
uses a wider grid span. Motion's idle actions, timing/head fields and progress use
the full lower width. Apply/Discard and Track/Cancel remain in the existing footer.

- Generated actual editor checked in the Codex browser at 1440x900, 1280x800 and
  short 1366x650. At 1280, all four Focus tabs have a 713.9px lower inspector
  extending from the preview's left edge to the list's right edge, beneath both.
  The Add-position form occupies 695.9px inside that row; Add/Cancel restore the
  original controls without changing the clip.
- At 1440, lower Camera scrolling 0→74px leaves the preview/list bounds unchanged.
  A wheel scroll of the right camera list at 1280 moves only that list 0→83px;
  the full-width controls stay at scroll 0 with unchanged bounds. Footer actions
  remain below the whole editor. Generated local actions and footer buttons are
  present once in their existing workflows.
- People, an added Zoom and Motion marking all use the same lower row. Checked
  expanded head selection, keyboard marking, Done, injected synthetic tracking
  progress and Cancel. No actual pixel tracking or inference. Invalid Zoom at
  1366x650 reduces the lower row to 107px, retains scrolling and disabled Apply,
  and keeps its bottom above the 564px footer rather than covering actions.
- Stacked fallback checked at 1024x768, 390x844 and 320x568, without horizontal
  overflow. Zoom's 51% target survives laptop→phone resize; focused controls and
  Apply/Discard remain reachable, and Discard restores the draft. Prior clock,
  asset and provider behavior is untouched.
- 24 existing focused Focus/Motion/timeline tests, frontend type check, scoped
  ESLint/Prettier and whitespace pass. Read-only validation of this revision's
  Focus wrappers, responsive grid, hidden panels, action ownership, sizing and
  state/clock preservation found **no actionable findings; meets ticket locally**.
  No CSS mirror tests, native rebuild or broad suite needed.
- Screenshot `cl230-full-width-controls.jpg` is generated media only, outside
  Git in this chat's visualizations directory. Final browser error log empty;
  viewport reset and tab closed. The generated server reports zero edit POSTs
  and zero unexpected requests; owned process tree stopped, port 61211 released
  and scoped scratch removed. Normal health and `/start` return 200; owner clip,
  saved media, provider configuration and app services preserved. No staging,
  commit, provider/cloud action or deployment. Owner visual/device acceptance
  remains manual. Prepared clips require no AI/API keys for this layout.
