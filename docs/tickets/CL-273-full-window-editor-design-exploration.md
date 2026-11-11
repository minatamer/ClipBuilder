# CL-273 — Responsive workspace migration, autosave and action history

Status: complete — implemented and locally validated, 2026-11-10. The
inner-editor revision is included in the full CL-273 migration. Owner visual,
live-provider quality and release acceptance remain distinct.

## Resume follow-up — editor film toolbar captures, 2026-11-11

During CL-275 final review the four retained editor film frames still showed the
earlier left-side save pill/toolbar. Refresh only those fictional build/review/
render/result states in Codex against the current source, with silent generated
media and settled readiness. Keep the CL-274 Source/Moments captures and measured
editor geometry. No external-browser capture CLI, processing/provider request,
owner session edit or Voyagenda action. Record actual counters/hashes and gates
below after capture; this follows the existing tour/landing migration scope.

Completed in Codex: all four captures now show the current right-aligned saved
state/actions, without the old left save pill. Generated queued/rendering/ready
states use the same production frontend; no render request was made. Source and
editor geometry remain unchanged. Each asset is 1440×1000, normalized with PNG
edge padding only, and all 15 delivery hashes verify. The fixture reports zero
edits/unexpected requests and zero plan/image/render calls. Its tab/servers are
closed and temporary launcher removed. Normal ClipBuilder is left running for
owner review; no saved session, provider, configuration or Voyagenda change.

## Overnight handoff — owner stopped work, 2026-11-10

Feature work is stopped at the owner's request. Preserve the running normal app,
owner session/media, configuration and Voyagenda. No paid runs remain authorized.
The owner will manually review tomorrow; do not treat local checks as visual or
live-provider acceptance. Test media was audible during a scroll check; its tab
was immediately closed and all owned temporary fixture servers have exited.
Future agent browser checks must mute generated media before playback, without
changing the owner's application audio settings. Use only Codex's in-app browser.

The latest completed implementation is the Moments scroll correction below.
The owner subsequently requested a more thorough redesign of Add clips AND Your
clips; that new design is deliberately not implemented tonight. Continue from
[CL-274](CL-274-moments-and-your-clips-redesign.md) only after the owner resumes.
The glassy single-word caption reference is separately recorded in
[CL-275](CL-275-glass-one-word-caption-style.md); no style implementation or
texture research has been performed tonight. Both packets are planned work.

The owner expressly authorizes local whole-file staging and ticket-prefixed
commits for the completed changes and handoff documents; never push. Allocation:

1. Shared workspace chrome/workflow/loading components, privacy trigger and their
   directly associated spinner/workflow checks and fixture.
2. Local editor/intake/selection files and remaining editor regression proofs,
   including the generated entry/pane fixtures. Shared files stay in one commit;
   do not split a file into staged hunks to manufacture more commits.
3. Fictional product-film captures, asset hashes, measured targets/camera tests,
   capture script and frontend verification guide.
4. CL-273 evidence/source-of-truth handoff documentation.
5. CL-274/CL-275 planned packets and the canonical ticket index.

All existing CL-273 revisions remain in scope; no new product feature is being
implemented after the stop request. Final checks and commit receipts are recorded
below when actually complete. Resume with the owner review and new packets,
without reprocessing the saved 1:04–1:45 session or modifying its media.

Final pre-commit checks: 17 focused unit tests pass, frontend and test-source
TypeScript pass, ESLint passes for all 51 changed source/proof files, all changed
text files pass Prettier, all 15 delivery hashes verify and whitespace checks
pass. Read-only validation of the completed revisions and latest scroll fix finds
no actionable issue. Earlier native/browser/full-suite evidence remains recorded
in its owning sections; those historical checks were not all rerun tonight.
CL-274/275 have documentation only, with implementation and owner visual review
still pending. No push, paid processing, cloud action or normal service restart.

Completed whole-file code commits: `7649d49` (shared UI, 12 files), `8c4b8d8`
(editor/intake and proofs, 46 files), `ff49094` (film captures/framing, 15 files).
Documentation is committed separately under the ticket prefixes. The final
handoff is this section plus CL-274/275; no running test fixture needs resuming.

## Owner review revision — Moments scrolling, 2026-11-10

Status: complete locally; owner visual review remains pending. The owner reports
glitched scrolling on Choose your moments. Acceptance covers generated media at
small-laptop and narrow viewports, actual scroll owners, sticky containment and
wheel/keyboard behavior. Establish one clear page scroller, preserve
intentional bounded lists/editor panes, reachable actions, inputs, focus and
preview clocks. Check Source/Moments/opening/editor and long results without
paid work or owner-session changes. Preserve prior revisions, normal services,
media, provider/security boundaries and Voyagenda; no deployment action.

Reproduced at 1366×681: document range 305px while the inner workflow content
has overflow:auto/overscroll containment but zero scroll range. Wheel over that
content does nothing; wheel over the header moves the document to its bottom
and the preview above/behind the navbar. Bound the app shell to the viewport,
make the focusable main the single page scroller and leave its content visible.
Keep editor/bounded work areas constrained with their intentional pane scrollers.

Long-results acceptance also reproduced Jump to scrolling the list from 1426px
to 1279px while its sticky preview was already fully visible. Only reveal when
the video extends outside the main scrollport, using nearest smooth alignment;
retain seeking/playback/focus. Actual pointer acceptance keeps desktop at 1426px.
On phone, it reveals an offscreen preview from the bottom of the long list while
the document remains at zero. Locator-focus scrolling is not used as proof of
actual pointer behavior; real Codex clicks verify these two cases.

Implementation bounds the shared shell to 100dvh and gives focusable main one
page scroller with a stable gutter and a min-content floor for natural content.
The content wrapper no longer catches wheel input with a zero-range scroller.
Editor and explicitly bounded work areas retain their own pane scroll ownership.

Generated/no-key Codex acceptance at 1366×681, 1024×640, 768×900, 390×844 and
320×600 finds no document or horizontal range. Main ranges are respectively
305/346/432/377/582px; bottom actions remain reachable. Desktop sticky preview
stays below the 64px navbar; narrow columns stack naturally. Wheel works over
video, left blank space and the form. Home/End/PageUp/PageDown move main alone.
Inputs and preview clock survive scrolling. A 12-result list, narrow Source
upload, held opening at desktop/phone and editor layout also pass. Ready editor
geometry at 1440×1000 is byte-for-byte equal to its baseline; narrow editor
retains zero main/document range with intentional panel scrolling.

Six fictional workflow film stills and measured bounds/click centers are refreshed
for the stable scrollbar gutter. Captures are normalized to 1440×1000 PNG with
edge padding only; four editor stills are unaffected by this scroll revision.
All 15 delivery hashes verify. Seventeen focused tests pass (workflow, film
camera, positioning and visual-layer ordering). Temporary fixtures record zero
edits/unexpected requests and zero plan/image/render calls; the one held fake
analysis stream closes on navigation. All temporary fixture servers exited and
scratch launchers are removed. No real provider/download/upload, owner session,
normal-app restart, configuration or Voyagenda change. Layout works with
FAKE_MODE=true and no API keys; live-provider setup/flags/approvals are unchanged
and live quality remains untested. Frontend/test-source types, all changed-source
lint, formatting and whitespace checks pass; no actionable validation finding.

## Owner review revision — remove workflow progress row, 2026-11-10

Status: complete locally. Remove the redundant Source / Moments / Editor row from
the shared workflow header everywhere, without replacing it with another step
indicator. Retain page headings, internal stage/layout/readiness markers and
all existing navigation/actions. Remove unused row styles and update the old
accessibility assertion. Check Source/Moments spacing at desktop and phone,
using generated/no-key fixtures only. Refresh affected fictional demo stills
and measured targets if the removed row shifts their geometry. Preserve earlier
work, owner sessions, normal apps and Voyagenda; no paid/provider/Git action.

Removed the row's shared markup and `.stages` rules rather than hiding them.
The existing workflow test now checks retained data-stage/heading semantics and
the missing progress row. Codex verifies Source and Moments at 1440/768/320px:
one h1, zero progress rows, retained internal stages and no horizontal overflow.
Six fictional demo stills, media/card bounds and action targets are refreshed
for the shorter header; the four editor stills remain unchanged. PNG edge-padding
preserves captured pixels/coordinates. All 15 delivery hashes verify. Six workflow
tests and five film camera/coverage tests pass, along with frontend TypeScript,
focused lint, formatting and whitespace. Read-only validation found no remaining
actionable issue. Generated fixture: zero edits/unexpected requests and zero
plan/image/render calls; its fake analysis stream closes on navigation. No real
provider/download/upload, configuration, normal-app restart, owner-media change,
Voyagenda operation or Git mutation. The fixture and scratch launcher are cleaned
up. Screenshot outside Git: `cl273-no-progress-row.png` in the CL-273 visualization
directory. Layout works without API keys; live providers are unchanged/untested
and still require their existing setup and approvals. Owner visual review remains.

## Owner review revision — card-owned Source/Moments actions, 2026-11-10

Status: complete locally. Source and Moments must not put workflow CTAs in the top
navbar. Upload/YouTube cards own their bottom-right actions, including Continue,
Use/Download video, Change link, retry and cancel. Moments owns Find/Use clips,
Process clips and related navigation/recovery in its card footer. Keep secondary
actions before the rightmost primary action. Preserve form submission, disabled
guards, contextual feedback, progress, cancel/retry, input/tab retention and
local-only YouTube/hosted-upload boundaries. Editor actions keep their toolbar.
Verify startup, source stages and moment stages at desktop/tablet/phone using
generated/fake/no-key fixtures in Codex; no paid/download/provider action,
owner-session changes, app restart, Git mutation or Voyagenda operation.

The existing product film records Source/Moments buttons at their old navbar
coordinates. Refresh its affected fictional workflow stills, asset hashes and
measured Upload/Analyze/Process click targets using Codex captures; preserve
unaffected editor stills and never run the external-browser capture script.

Implementation: acquisition actions render directly in their existing source
footer instead of Workspace's navbar portal. Change link precedes the primary
action in both DOM and visual order. Upload and YouTube share a wrapping footer
row: note at left, controls at right, reserved contextual feedback above. Narrow
controls retain 44px height and keep the pair on one row at 320px. Experience
mounts its canonical action target inside the active Moments work area or the
editor toolbar, with no duplicated actions. Back to editor joins the Moments
footer. Opening/recovery has its own local target; startup failure returns to
that view so Retry remains reachable. WorkflowActions still owns callbacks and
supports inline, card-footer and editor-toolbar targets. Existing form IDs,
Capture controls, disabled/busy/selection guards and source/provider paths remain.

Codex generated/no-key acceptance covers local Upload and YouTube URL submission
(including Enter), saved-video Use/Change link, quality loading, Range, Download
and simulated open/download failures. Hidden Upload/YouTube switching retains
inputs. Every active Source action is inside its card, with no navbar workflow
controls. Settled valid/error/corrected fields and paired actions have identical
rectangles at 1440/768/320px; the initial responsive pass also covered 1024/390px.
Hosted fixture excludes YouTube and places its 44px upload button at the same
card bottom/right padding at desktop/tablet/phone widths. No real upload was sent.

Moments Add clips / Your clips swap Use/Find and Process in the work-area footer.
Removing all three fictional choices retains a disabled Process clips action.
At 1440/768/320px, Process stays right-aligned in that pane with no overflow or
navbar CTA. Back to editor restores the editor toolbar, with no stale Moments
footer. Simulated missing-session and startup failures expose their local Retry
controls; both recover normally, and session recovery retains Start new session.
Prepared editor/media, autosave and history behavior remain unchanged.

The six affected product-film stills (intake/preparation/source/analysis/candidates/
selected) now depict these controls. Captures use existing fictional artwork and
native generated media in Codex, normalized to 1440×1000 PNG with edge padding
only (no pixel scaling/cropping). Updated measured click centers: Upload 1156/843,
Analyze 1346/947, Process 1352/907. Other editor stills remain untouched. All 15
delivery hashes verify. Twenty existing focused tests pass (15 workflow/moment
tests plus five camera continuity/coverage tests). App and test-source TypeScript,
focused ESLint, Prettier and whitespace checks pass. Read-only validation found
no remaining actionable issue for this revision.

All fake clip fixtures report zero edits/unexpected requests and zero plan/image/
render calls. The first intake fixture records two lookups, one metadata request
and one deliberately failed fake import; none downloads from YouTube or invokes
providers. The held fictional analysis stream closes on navigation. No contracts,
worker, renderer, security, configuration or provider implementation changed.
Manual layout works without keys; real acquisition/AI still requires its existing
prerequisites/keys/live approvals and is untested here. No paid run, deployment,
normal-app restart, owner session/media change or Voyagenda operation. Nothing
staged or committed. Fixtures/listeners and scratch launchers are cleaned up.
Review screenshots outside Git: `cl273-source-card-actions.png` and
`cl273-moments-card-actions.png` in the CL-273 visualization directory. Owner
visual acceptance remains separate.

## Owner review revision — draggable visual layer stack, 2026-11-10

Status: complete locally. Replace Layer order's selected-item arrow toolbar with a
thumbnail stack that can be dragged into front/back order. Both Pictures and
Videos show the same complete mixed stack of added pictures/videos, including
items outside the current playback time. Do not include original footage,
captions, text or audio, whose placement is outside this visual stack. Preserve
independent Hook/main-clip scope rather than merging their separate edits.

Display Front first and Back last with readable media names, thumbnails, timing,
selected state and a dedicated touch drag handle. A completed drag commits one
existing visual-order edit, preserving every cue property, selection and clock.
Cancel/no-op/disabled gestures submit nothing. Add keyboard pick/move/drop/cancel,
live status and focus retention. Clicking an item explicitly opens that item's
correct media tab/inspector. Keep thumbnail loading/error behavior shared.
Remove the old arrow UI rather than duplicate controls. Verify mixed media from
both tabs, real pointer and keyboard moves, cancel/edge/disabled behavior,
preview stack, autosave/Undo/Redo/reload and responsive sizing with synthetic
no-key media in Codex only. No paid/provider/cloud/Git action, owner media/session
changes, app restart or Voyagenda operation is included.

Implementation: new VisualLayers in `visual-layer-order.tsx` owns the scoped
mixed stack and its CSS module. It reverses the existing back-first array for
Front-first presentation, reuses MediaTimelineThumbnail for both media kinds
and retains finite thumbnail clocks during invalid input. Dedicated 44px handles
use pointer capture, insertion markers and bounded edge scrolling. Space/Enter
pick/drop, arrows/Home/End move, Escape/Tab cancel; status announcements remain
accessible without visible success-message clutter. Reorder commits only on drop,
keeps cue objects intact and restores handle focus. Busy or external-order changes
cancel the grab permanently; RAF cleanup follows drop/cancel/unmount. Disabled
controls and guards were inspected in source; no artificial busy UI run was added.
The existing VisualPresentation/VideoSourceControls remain in their original
module; its old arrow component/imports are removed. ClipEditor passes every
active-scope visual, correct presentation-clock offset and existing update path.
Mixed-list selection clears stale timeline selection, navigates to the actual
media type and shares repeat-click disclosure without seeking on toggles.

Actual generated-media Codex checks: Pictures and Videos each show the same three
mixed rows (two added videos, one picture), without original/caption/text/audio
rows. All three thumbnails load. A real pointer drag moves the back video to
Front, changing the large preview's DOM paint order to the exact reverse of the
stack. Source clocks stay identical. Keyboard moving the picture to Front retains
its selected ID and exact clocks (0.3/0.308333 seconds); handle focus follows it.
Escape and outside-stack pointer release cancel, and pick/drop at an existing
edge is a no-op. Repeat row selection closes/reopens without changing the clock;
cross-type selection opens Pictures from Videos. Autosave, Undo, Redo and reload
through actual fake HTTP edit/list boundaries preserve the expected order. The
first acceptance pass has exactly four writes (pointer, keyboard, Undo, Redo);
cancel/no-op/navigation add none. A fresh final-source pass has exactly two
writes for its pointer and keyboard moves, with no stuck grab or marker.

At 1440/1280/1024/768/390/320px all three rows fit without local/page overflow;
every visible row action/handle remains at least 44px. Thumbnails remain 42×34px
and timing stays readable even in the narrow desktop collection. Six responsive
checks include the selected inspector and phone Layers navigation. Touch handle
styling is present; physical touch hardware was not separately exercised.

15 focused tests pass: three new ordering invariants/operation-boundary checks
plus twelve existing editor-state tests. Application and test-source TypeScript,
focused ESLint, formatting and whitespace pass. Read-only validation found no
remaining actionable issue. No contract, renderer, worker, provider, security or
persistence implementation changed; export rendering was not rerun because it
consumes the same existing visual-order contract. Generated/fake/no-key checks
do not prove live provider output; real AI still requires its configured keys,
live flags and approvals. Local and hosted use this same manual UI. No paid runs,
deployment, app restart, owner source/session changes or Voyagenda operations.
Changes are unstaged/uncommitted. Generated fixture/listeners are closed and the
scratch launcher removed. Screenshot: `cl273-draggable-media-layers.png` in the
CL-273 visualization directory outside Git. Owner visual acceptance stays open.

## Owner review revision — toggle item inspectors, 2026-11-10

Status: complete locally. The owner requests that clicking the active picture again
dismiss its right inspector, consistently across comparable editor selections.
Apply one shared disclosure behavior to picture/video, text, caption, filter and
audio timeline items. A repeated active-item click closes the inspector; another
reopens it without reseeking or changing the draft. Different items select/open
normally. Reclaim the empty inspector column; on narrow screens return to Layers.
Keep forms mounted while hidden so partial input, validation and local form state
survive. Reflect visibility accessibly and clear the item's active appearance
while its inspector is closed. Dismissal must not write edits, reset playback,
remove media or invoke providers.

Audit distinctions: main clip/category navigation and explicit Home/preview/error
inspection must still reveal the target. Presets, tabs, Add/View/generation
actions and Camera's permanent source/settings or Hook workflow are not item
disclosures and must not toggle off. Audio library entries with no current
inspector must select/open on the first click, not count as a repeat dismissal.
Verify all shared timeline kinds, different-item/occurrence changes, keyboard,
pending guards, retained input/save/Undo and responsive no-key behavior in Codex.
Preserve owner session/media, normal apps, earlier edits and Voyagenda. No paid,
configuration, deployment or Git action is included.

Video acceptance found a related explicit-inspection defect: linked audio's
return action always navigates to Pictures, hiding the selected video's form.
Return to the linked visual's correct Pictures/Videos category and label the
context/action by its actual media kind. Verify return reveals the same target
without changing its clock or saving an edit.

Implementation: EditorInspectorLayout owns transient disclosure state, separately
from the retained edit target. Mounted inspector registration distinguishes an
actual selected form from Audio's fallback highlighted item/library. EditorTimeline
applies shared click/Enter/Space toggling, pressed/expanded/controls attributes
and clears visual selection while closed. Hidden forms remain mounted; an empty
timeline reveals creation controls. CSS reclaims the column, and narrow Layers
dismisses item properties. Hook's permanent pane switch is unchanged. An explicit
navigation request counter reopens the target even when its ID has not changed;
typing/autosave/playback do not trigger it. Linked audio now derives return tab
and accessible context/action labels from picture/video kind.

Codex-only generated-media acceptance: pictures, added videos, text, captions,
timed filters, original audio and added audio close/reopen correctly; changing
items opens normally. Enter/Space work. Picture timing's blank draft input and
sub-tab survive hiding. Picture toggle preserves exact video time (0.3 seconds)
and preview bounds. Main-category, Home and preview selection reopen; Audio's
first Original selection opens from its library. Preset controls stay open.
Add audio remains independent and Back to video reveals the original video with
loaded generated media. Hook's phone Layers/Properties switch stays usable.

At 1440/1024/768/390/320px, opened properties and collapsed full-width collections
fit without page overflow. Narrow Layers closes, then item selection reopens;
explicit caption navigation also reopens when no timeline key exists. Actual
fake edit transport verifies Add text, save, collapse, Undo to an empty list
(Add text remains reachable), then Redo/save. This uses three synthetic writes;
the independent responsive/navigation pass uses zero edits/unexpected requests,
zero plan/image/render calls and zero pending writes. The earlier preset check
uses one explicit synthetic write; toggling itself submits none.

24 unique existing timeline/clock, contextual-feedback and linked-audio tests
pass (22 + 9 with seven shared timeline tests). Frontend TypeScript, focused
ESLint, formatting and whitespace checks pass. Read-only validation found no
remaining actionable issue for this revision. No new contracts, worker, renderer,
provider, persistence or security boundary changed. Shared local/hosted manual
UI needs no keys; real AI still requires configured providers/live approvals
and is untested here. All generated fixtures/timers/listeners are closed and
scratch helpers removed. Owner source/media/session and Voyagenda are untouched;
no Git mutation, paid run or deployment. Screenshots retained outside Git:
`cl273-inspector-open.png` and `cl273-inspector-dismissed.png` in the CL-273
visualization directory. Owner visual acceptance remains separate.

## Owner review revision — integrated media-row actions, 2026-11-10

Status: complete locally. The owner requests Add audio and View inside each picture
row rather than detached below it. Use one framed media row with thumbnail,
name/time, timeline bar and a compact trailing action area. On wide collections
keep it on one row; narrow selected-media columns can put the same actions on
an internal second line. Preserve readable labels and 44px targets rather than
hiding actions on hover or squeezing metadata. Apply the shared visual-row
layout to added-video Add audio as well; retain View's existing picture-only
availability. Keep row selection and action buttons as siblings, never nested
interactive controls. Preserve occurrence/time mapping, selection indication,
pending guards, view pause/modal/focus, audio association and every callback.
Keep other timeline kinds unchanged. Verify wide/narrow/phone, selection and
both actions in Codex using generated/fake/no-key fixtures. No provider, owner
media/session, normal-app, Voyagenda or Git mutation is requested.

Action verification found an existing related handoff bug: selecting Audio while
a picture is selected still mounts that hidden picture panel's inspector portal.
On phones Add audio therefore lands in picture properties and hides its sound
library. Mount visual properties only for Pictures/Videos, so Audio's own form
or library owns the pane. Verify a single Add audio click exposes the correctly
linked library without manually switching Layers, then Back to picture.

Implementation/evidence: EditorTimeline marks visual entries as media rows and
keeps selected state on their shared frame. Selection and action buttons remain
siblings. The frame owns the border/background/timing bar; wide rows place the
music-icon Add audio and existing View at the right behind a quiet divider.
An inline-size container query moves them into an internal footer at 26rem and
below. Labels stay visible and actions keep 44px minimum height. Other timeline
kinds retain their original styling; videos use the same visual-row path and
retain their existing Add audio-only availability.

Codex verifies three rows at 1440/1024/768/390/320px: actions stay inside their
cards, metadata fits, bars remain at the card bottom, visible targets are at
least 44px, no interactive controls are nested and no page overflow occurs.
Wide rows measure about 62px high; the selected narrow column uses an internal
footer. View loads the protected generated image, pauses muted test playback,
retains a different selected row and returns focus to its trigger on close.
The related inspector guard now mounts picture/video properties only when their
own tab is active. On phone, Add audio from another selected picture opens the
sound library directly with the chosen Hook picture context, no stale picture
properties; Back to picture returns to the same picture. No sound was added or
generated and no owner clip was edited. Both fixture passes report zero edits,
unexpected requests, plan/image/render calls and pending writes.

Seven existing timeline/clock tests, frontend TypeScript, focused lint, formatting
and whitespace checks pass. No composition/worker/persistence contract changed;
manual controls work with no API keys locally and hosted, while real AI retains
normal keys/live flags/approvals. cl273-integrated-media-actions.png is outside
Git; Codex tab closed, viewport reset, fixtures/scratch/helper removed. Owner
session/media, normal apps, earlier changes and Voyagenda are preserved. No
staging/commit.

## Owner review revision — equal Looks preview sizes, 2026-11-10

Status: complete locally. The owner requests every Looks thumbnail match the larger
Black and white preview. The shared Button centers grid tracks; EditorChoiceGrid
never declares its content column. Its absolutely positioned thumbnail contents
therefore let that column shrink to label width, producing different image sizes.
Give choice cards one explicit flexible content column, and cap each Looks
preview at the same 5rem-wide 16:9 frame (approximately the existing largest
example), constrained to available width on small screens. Preserve aspect,
loading/failure sizing, filters/matrices/strength, radio keyboard behavior,
selection, timing and autosave. Audit the shared typography picker for sizing
regressions. Use Codex-only generated/no-key responsive checks. No provider,
owner-session/media, normal-service, Voyagenda or Git operation is requested.

Actual evidence: the shared choice card now has grid-template-columns:
minmax(0,1fr), and Looks frames use width:min(100%,5rem) with their existing
16:9 aspect. No provider, thumbnail service, color matrix or interaction logic
changed. Codex measured every loaded thumbnail and its image at exactly 80×45px
at 1440, 1024, 768, 390 and 320px, with no page overflow. All nine shared
typography samples still fit their cards on desktop and phone. Vivid → Right
selects/focuses Warm and acknowledges saving; Reset returns Original. The first
selection read accidentally found a hidden typography radio; scoped the check
to Filter and confirmed Warm correctly. Checks use generated/fake/no-key media,
with zero provider/render calls or unexpected requests. Formatting/whitespace
checks pass; no unit suite, lint/type rebuild or worker reload is needed for two
CSS declarations. Saved cl273-equal-looks.png outside Git; Codex tab closed,
viewport reset, fixture/scratch/helper removed. Owner clips, normal apps and
Voyagenda are untouched; changes remain unstaged/uncommitted. Real AI retains
its existing keys/live flags/approvals and was not exercised.

## Owner review revision — content-sized rename dialog, 2026-11-10

Status: complete locally. The owner reports excessive empty space below the name
field and requests dynamic sizing. The gap is the shared feedback component's
empty two-line reservation plus the surrounding grid gap. In Rename only,
render feedback when present instead of reserving an empty row. Keep the
existing natural dialog height, viewport cap and scrolling body: valid and
corrected states stay compact; validation/network feedback grows naturally.
Keep the scrolling body's gutter stable so reaching the viewport cap cannot
squeeze the field when feedback appears.
Preserve field width/height, readable wrapping, action-row layout, focus/caret,
pending/duplicate-submit/cancel guards, error association and rename transport.
This owner request intentionally makes the dialog height content-dependent;
do not change the shared stable-feedback default or other editor geometry.
Inspect valid/error/corrected/pending and constrained desktop/tablet/phone
states in Codex with fake/no-key rename calls, never the owner's clip. Preserve
normal services, earlier changes and Voyagenda; no paid/provider/Git action.

Actual implementation/verification:

- Rename passes reserve=false to InlineFeedback. No message means no empty
  grid row; real feedback uses natural wrapping. The shared reservation default
  remains unchanged. Added a stable scrollbar gutter to Rename's body after
  checks exposed a 4px input-width change when a long name reaches the viewport
  cap. Existing dialog max-height, body scrolling and pinned actions are reused.
- Codex measured the compact desktop dialog at 480×263.77px, with a normal 16px
  gap from input to footer. Valid/error/corrected checks at 1440×900, 768×1024,
  390×844, 320×568 and 320×320 pass. Final current-source checks with an 80-character
  existing name also cover 390×320: feedback height adapts/restores, field width/
  height and the preview behind it stay stable, actions remain on one row, and
  all dialog bounds fit. Constrained bodies scroll without squeezing the input.
- Client validation stays associated with the field and clearing it removes the
  row. Saving disables the field/actions and Escape cannot dismiss pending work.
  An intentional fake rename failure stays editable; a second explicit save
  succeeds, and focus returns to Rename clip. Exactly two fake rename attempts,
  one successful rename, zero unexpected requests and zero plan/image/render
  calls. The final long-name/layout fixture adds zero rename requests. No owner
  clip was renamed and no new provider-quality/export acceptance is claimed.
- Existing contextual-feedback tests pass (15), including the unchanged shared
  reservation default. Focused lint, formatting and whitespace checks pass. No
  new unit suite, TypeScript rebuild or worker reload was needed for the boolean
  prop/CSS change. It works locally and hosted with no API keys; real AI keeps
  its existing provider flags/approvals and was not exercised.
- cl273-compact-rename.png is saved outside Git. Codex tab closed, viewport reset,
  both generated fixtures/listeners and their synthetic media scratch closed,
  helper removed. Normal services, owner session/media, previous edits and
  Voyagenda are untouched. No staging/commit.

## Owner review revision — visual position preset canvases, 2026-11-10

Status: complete locally. The owner requests designed empty vertical canvases that
show where preset positions place content, applied consistently to every
position-preset control. Audit identifies shared caption/authored-text presets
and duplicate picture/added-video presets. Replace their text-only buttons with
one reusable portrait-card picker: empty 9:16 frame, quiet composition guides,
the actual resulting box footprint, contextual text/picture/video mark, clear
label and selected check. Use existing navy/blue theme, typography, shared Button
and neutral focus. Keep all exact labels, default/quarter/center coordinates,
selection semantics, safe-bound fitting, manual fields, preview/autosave/Undo and
validation behavior. Do not turn Camera source-crop/zoom controls, text alignment,
layer ordering, fit/presentation or style presets into competing position forms.
Those are distinct controls and the audit must record them.

Previews use the same centeredOwnerBox result that a click applies; guard invalid
draft geometry from emitting invalid SVG coordinates without changing draft data.
Decorative SVG adds no focus target or accessible-name noise. Keep a responsive
grid and readable full labels; no fixed desktop-only canvas or duplicate picker.
Verify captions/text/pictures/videos, default/manual selection and resized boxes
through fake/no-key components and Codex-only responsive checks. Preserve owner
media/session, running apps, earlier work and Voyagenda; no provider/model/API
key, new paid run, configuration, deployment or Git action is needed.

Implementation and actual verification:

- Added one PositionPresets component and scoped stylesheet. Cards use shared
  Buttons, empty portrait frames, quiet composition guides and the exact fitted
  box. Abstract text strokes, picture outlines and a video play mark distinguish
  content without loading thumbnails or showing user media. Default and center
  retain their different actual coordinates. Selected checks are decorative;
  accessible labels/pressed state and native disabled/keyboard behavior remain.
- TextPositionFields supplies caption/authored-text geometry and keeps its
  manual fields and centered-alignment callback. ClipEditor now uses the same
  picker for pictures and added videos, with correctly named media groups.
  Removed the duplicate preset arrays/handlers, unused import and both obsolete
  global preset-layout rules. Hook captions/text and opening-title text share
  these same consumers. Audit found no other position presets; camera source
  cropping, authored focus paths, Zoom/Pan endpoints, text alignment, layers,
  fit/presentation and style presets are distinct and remain intact.
- The current shared components pass 13 click cases across all four kinds:
  miniatures exactly match applied boxes, horizontal/vertical centers and
  selected state. Twenty picker/viewport cases at 1440/1024/768/390/320px keep
  portrait aspect, full labels, valid touch targets and no extra focus targets
  or picker overflow. An initial gallery-level overflow flag came from its long
  synthetic JSON readout rather than the cards. Verified the actual editor
  separately at 1024/768/390/320px: no page overflow, all cards fit and manual
  fields remain available. The readout is fixture-only and is removed with it.
- In the real generated editor, caption/text Upper half and picture Center
  match the large preview to within rounding (0.25001/0.50001). Caption Lower
  half → Undo restores Upper half; Default positioning restores correctly.
  Reloaded the fake session and confirmed caption Default, text Upper half and
  picture Center survive acknowledged HTTP saves. Exactly six fake edit writes,
  zero unexpected requests, zero plan/image/render calls and no pending writes.
  The video picker is checked through the same shared component/callback, with
  its production integration reviewed; no new video decode/native export or
  provider-quality acceptance is claimed for this presentation-only change.
- Clearing manual width emits no NaN SVG coordinates and leaves the input
  editable; correcting it restores previews. A manual horizontal offset clears
  preset selection, and a disabled fieldset disables every preset. Existing
  placement tests retain their assertions using named buttons rather than the
  obsolete text-only markup. Added the incomplete-width regression. All 15
  focused selection/geometry units, frontend types, focused lint, formatting and
  whitespace checks pass. No composition, persistence or rendering contract
  changed; provider keys/live flags/approvals remain required for real AI.
- Codex inspected actual desktop and phone editor controls and all picker
  variants; cl273-visual-position-presets.png is outside Git. Review tab closed,
  viewport reset, in-memory gallery and generated editor listeners closed,
  synthetic media scratch and helper removed. Owner session/media, normal apps,
  prior uncommitted changes and Voyagenda are untouched. No staging or commit.

## Owner review revision — right-aligned workspace actions, 2026-11-10

Status: complete locally. The owner requests branding alone on the left and every
workspace control grouped on the right, with saved state first. Use one shared
right-aligned group in actual DOM order: saved state, Undo, Redo, the current
primary action, tour Help, Session options. Preserve source/Moments actions,
autosave/history/readiness, explicit Retry and menu/dialog behavior. Place the
status divider after it and anchor Retry beside its new location. On narrow
screens wrap the right group cleanly, preserving labels, touch targets and
keyboard order without duplicating controls or moving branding into the group.
Verify populated/empty action slots and all save states at desktop/tablet/phone
widths in Codex's in-app browser using fake/no-key components. Preserve owner
session/media, prior uncommitted edits, running services and Voyagenda. No paid,
configuration, deployment or Git action is requested.

Implementation/evidence: Workspace now owns one right-aligned controls group;
removed the old primary-action/session-menu auto-margin special cases. Moved
saved status before history in JSX rather than using visual-only CSS ordering.
Its divider now follows it and Retry anchors below its new location. Narrow
CSS lets the same group children participate in header wrapping, keeping the
brand left and controls right; this avoids an unnecessary third row at 390px.

Codex checked the final production components at 1440, 1024, 768, 390 and 320px
across saved/saving/invalid/failed/conflict (25 cases): status/history order,
right alignment, separate branding, readable copy, Retry anchor, no horizontal
overflow and identical per-size geometry all pass. Header height is 64px on
desktop/tablet, 107.375px at 390px and 155.375px at 320px. Twelve additional
Source/Moments/empty-slot cases preserve their correct primary action, right
alignment and absent editor history. Injected Undo/Redo callbacks and Retry
remain connected; these are synthetic UI callbacks, not owner edits or real
provider acceptance. Existing privacy/workflow units pass (18), frontend types,
focused lint, formatting and whitespace checks pass. No new behavior test suite,
worker rebuild or paid run was needed. Shared layout applies locally and hosted;
real AI retains its normal keys/live flags/approvals.

Saved cl273-right-aligned-toolbar.png outside Git. The Codex review tab is
closed, viewport reset, both in-memory fixture listeners closed and temporary
helper removed. Owner session/media, normal services, earlier uncommitted work
and Voyagenda are preserved. No staging/commit.

## Owner review revision — consistent session menu items, 2026-11-10

Status: complete locally. Privacy renders as a bordered secondary button while Start
over is a quiet menu item. The owner requests one consistent design. Use the
existing shared quiet Button variant for Privacy and optional Exit in the
workspace menu, matching Start over's typography, padding, target, radius,
hover and neutral keyboard focus. Preserve landing privacy styling, dialog
content, modal focus/Escape/close behavior and session actions. Inspect desktop
and phone in Codex's in-app browser using a generated no-key fixture; no owner
reset, processing, paid calls, Voyagenda changes or Git action.

Actual verification: PrivacyDialog accepts the existing quiet Button variant;
Workspace uses it for Privacy and optional Exit. Start over's wrapped button now
fills the same row width. Landing/default/secondary privacy triggers are
preserved. Codex's generated fixture confirms all three rows have identical
206×44px geometry, transparent background/border, 14px/650 font and padding at
desktop, with the same shared hover/focus rules. Phone (390×844) menu/dialog fit;
opening focuses the dialog heading, Close returns focus to Privacy, menu Escape
focuses Session options, and modal Escape dismisses correctly. No reset/Exit was
executed. Existing privacy/workflow units pass (18 tests), frontend TypeScript,
focused lint, formatting and whitespace checks pass. The screenshot
cl273-session-menu.png is outside Git; review tab/fixture/helper are closed and
viewport reset. Checks need no API keys and make no processing/provider call;
real AI retains its existing keys/live flags/approvals. Normal app/media/session
and Voyagenda are preserved; changes remain unstaged/uncommitted.

## Owner review revision — integrated save status, 2026-11-10

Status: complete locally. The owner rejects the green rounded Saved badge as out of
place in the editor toolbar and requests styling consistent with the theme,
colors and typography. Replace the oversized pill with quiet inline status,
the shared blue icon treatment and toolbar typography, separated from Undo/Redo
by a subtle divider. Preserve stable space across saved/saving/invalid/failure/
conflict states, accessible announcements, explicit Retry and all autosave/history
behavior. Keep phone/tablet labels readable without enlarging the toolbar or
moving its actions. Verify real shared UI in a synthetic no-key browser fixture
at desktop/tablet/phone widths and reuse existing autosave checks as appropriate.
Preserve all earlier uncommitted CL-273 changes, owner session/media and Voyagenda;
no provider, configuration, deployment or Git action is included.

Actual verification:

- Replaced the capsule border/green fill with an inline muted status, shared blue
  icon and a short neutral divider. Typography now uses the toolbar's inherited
  font at 14px/550 (13px on phones). Saving uses the existing spinner, while
  invalid/failure/conflict retain the shared danger color. Reserved width and
  height keep state changes from moving actions; Retry remains outside sizing
  flow. No JSX, callback, state, transport or persistence change was needed.
- The existing fake/paid-off autosave HTTP proof passed, covering acknowledgement,
  serial edits, Undo/Redo, invalid input, failure/Retry, conflict/reload and stable
  geometry across desktop/tablet/phone. Following a compact-spacing refinement,
  the final current CSS was checked entirely in Codex's in-app browser using the
  actual shared Workspace/EditorSaveTools components. All five states at 320,
  390, 768 and 1440px keep readable copy inside the reserved slot, with no page
  overflow and identical toolbar height within each size. Retry appears only in
  the failed state. The real generated editor was also inspected at desktop and
  phone widths. Screenshot cl273-save-status.png is retained outside Git.
- Formatting and whitespace checks pass. This CSS-only revision needs no new
  unit tests, TypeScript rebuild, worker reload, provider key or live processing.
  Shared styling applies locally and hosted. Real provider actions retain their
  existing keys/live flags/approvals and were not exercised. The isolated review
  fixtures/helpers are cleaned up; the normal app, owner session/media and
  Voyagenda are untouched. No staging or commit.

## Owner review revision — shared proportional branded spinner, 2026-11-10

Status: complete locally. The owner reports the logo obscuring the spinning ring on
Opening workspace and requests a dynamically sized shared component that avoids
this everywhere. Preserve prior uncommitted CL-273 revisions and owner media.

Confirmed cause: page CSS shrinks ProcessingState's visual container to 5rem,
while its logo remains 3.15rem with fixed internal bars and fixed floating travel.
The ring follows the container; the logo does not. Shrinking the container can
therefore put the logo/corners/motion over the ring.

Implement one shared branded-spinner visual with owned proportional geometry,
normal motion and a bounded logo animation envelope, separate from accessible
status/progress semantics. ProcessingState uses it for every branded loading
state. Callers choose a supported size rather than styling internal children;
remove the workspace/Moments overrides. Plain thumbnail/button spinners are
unbranded and retain their existing shared primitives/semantics.

Verify actual rendered ring/logo clearance over animation phases, supported and
constrained widths, desktop/phone, enlarged root text and zoom. Include the old
fixed-logo failure as a negative regression. Preserve indeterminate/measured
progress, forced-colors readability and the permanent normal-motion rule. Use
synthetic/no-key checks and Codex screenshots, with no real processing, owner
session edits, ignored configuration, Voyagenda operation or new Git action.

Implementation and actual verification:

- Extracted BrandedSpinner with standard/compact sizes and proportional logo,
  glyph, SVG ring and floating travel. Its full logo rectangle remains inside
  the inner ring throughout the animation; SVG stacking also protects the ring
  from logo shadows. ProcessingState keeps accessible status and measured
  progress ownership and supplies this one visual at every branded call site.
- Opening workspace now requests compact size explicitly. Removed both internal
  child-size overrides and the obsolete fixed-logo/ring CSS and keyframes from
  ProcessingState. Audited all BrandMark/ProcessingState consumers: the other
  marks are static header/landing branding; plain spinners have no central logo.
- A generated in-memory browser fixture renders the real production components,
  workspace theme and local page CSS. The geometry proof sweeps nine animation
  phases at four viewports (320/390/768/1440px), four text/zoom combinations
  (12/16/24/32px root text, up to 200% zoom), both size variants and six
  constrained parent widths (48–160px). It verifies ring stacking, running
  animations, status/progress semantics and forced-colors geometry/readability.
  Restoring the old 3.15rem logo fails the same clearance assertion, as expected.
  The initial test counted Progress's additional status as a loading label;
  corrected the selector to the six actual status paragraphs. Production status
  behavior was already correct.
- Shared workflow units pass (6 tests). Frontend/test-source TypeScript, focused
  lint, formatting and whitespace checks pass. The focused final proof passes
  with fake/paid-off network-blocked composition and no ignored env reads.
  Earlier CL-273 full-suite/build evidence remains valid; this change touches no
  composition, media, worker, provider, persistence or security contract.
- Codex browser inspected compact and standard loading visuals at 390×844 and
  1440×900. Saved cl273-branded-spinner.png outside Git. The first fixture launch
  was sandbox-isolated; its browser navigation timed out. Relaunched only that
  synthetic fixture with normal approved local access. The successful review
  tab is closed and viewport reset; the unmarked failed temporary tab expires
  normally. Fixture processes/helpers are removed after review. Owner app,
  saved session/media and Voyagenda remain untouched. No paid run or Git action.

## Owner review revision — consistent inspector ownership, 2026-11-10

Status: complete locally. The owner reports Captions → Text displaying editable words
in the left collection while its Text sub-tab sits above an empty right pane.
They request text editing on the right and an audit for the same inconsistency
across all editor tabs/sub-tabs. This extends CL-273; preserve the earlier
uncommitted restoration/intake revision and all owner sessions/media.

Confirmed cause: Captions Text deliberately portals CaptionTextEditor through
EditorCollection and passes a collection-primary layout exception, suppressing
the caption timeline. Remove that exception and obsolete shared layout support.
Keep the caption timeline on the left for all caption sub-tabs; words, speakers,
style, position and empty/generation states belong to the right inspector.

Audit every EditorInspectorLayout/EditorCollection consumer and the Camera split:
collection navigation, library/acquisition and collection-order actions remain
on the left; the active form stays with its owning sub-tabs on the right. Camera
keeps its intended source canvas and settings split. Preserve every callback,
word ID/time, Hook/body clock, validation, autosave, Undo and keyboard behavior.
Narrow screens use the same canonical form under Properties, never a left-only
text editor with an empty right pane.

Verify generated/no-key browser pane ownership across sections/sub-tabs,
caption correction → acknowledged save → Undo, timeline selection/preview and
desktop/tablet/phone navigation. Use focused checks, not another paid run or
owner-clip mutation. No new Git action or Voyagenda operation is requested.

Implementation/audit evidence:

- Caption text now renders directly inside the same right-hand inspector as its
  Text sub-tab. The chronological caption timeline remains on the left for all
  caption sub-tabs. Empty/Hook-copy/generation states also use that inspector.
  Removed paneRequest, data-primary and the collection-primary CSS exception,
  instead of adding another placement override.
- Audited every shared inspector/collection portal and all section/sub-tab
  render paths. The other misplaced form was the local YouTube audio intake;
  it now uses the right inspector. Its own pending/Back cancellation behavior is
  preserved, without disabling the whole wrapper. Text content/style/timing/
  position, filters, picture/video properties, audio mixing/trim, Hook range/
  options/title status and Camera settings already use their intended settings
  panes. Collection navigation/library/upload/order actions and Camera's visual
  source picker remain intentionally separate from active editing forms.
  EditorCollection now has only the Hook suggestion/action consumer, with an
  explicit ownership comment. No second word editor or stale layout flag remains.
- The new generated HTTP/browser pane proof passes caption Style/Position/Text/
  Speakers, independent Text sub-tabs, Filters, picture sub-tabs, Audio tracks/
  import, original Camera sub-tabs and Hook. It verifies no visible editable
  input/select/textarea leaks into a collection. Caption correction saves
  through the actual edit transport and Undo restores it: exactly two fake edit
  requests, zero plan/image/render calls and zero unexpected requests.
- At 1440×900, 1024×768 and 390×844, words remain in the canonical inspector;
  narrow Layers contains only the timeline and Properties restores the form.
  The full existing nine-size/seven-section responsive layout proof also passes.
  The expanded Camera check explicitly selects Original video rather than
  mistaking a retained picture target's different sub-tabs for a failure.
- Focused feedback/timeline/Hook units pass: 23 tests across three files. Frontend
  and test-source TypeScript, focused lint, formatting and whitespace checks pass.
  Prior broad restoration/security/build evidence is retained; no composition,
  worker, provider or persisted contract changed. Another paid/native-owner run
  or unchanged demo-film capture would add no evidence for this presentation fix.
- Codex inspected the actual generated desktop and phone caption forms and the
  YouTube audio form/Back action. cl273-caption-text-right.png is saved outside
  Git. The review tab/fixture are closed and viewport reset; owner media/session
  and Voyagenda are untouched. The temporary helper is removed. No upload,
  YouTube download, paid processing or Git action was performed.

Final scoped validate: meets this owner revision, no actionable findings. All
checks are synthetic/no-key mechanics; normal real-provider keys/runtime/live
flags and approval gates remain unchanged. This revision and the earlier
restoration/intake follow-up remain unstaged/uncommitted for owner review.

## Owner review revision — direct restoration and intake quality, 2026-11-10

Status: complete locally; owner visual acceptance remains open. The owner reports a saved clip flashing through Connecting
under Source, Loading moments, restored moment cards and a full-page Loading
preview before Editor. They request a coherent return to the existing clip and
verification that Source/Moments meet the redesigned workspace quality.

Confirmed cause: Experience initially assumes Moments, mounts the source player
and selection workflow before the batch's first clip snapshot, and the batch
reports its initial empty placeholder list as if it were an acknowledged empty
collection. ClipEditor then replaces its entire layout with a second oversized
processing card while media decodes. These are separate asynchronous boundaries,
not new processing work, but the stage changes misrepresent session state.

Implement and verify:

- An unresolved destination uses one neutral workspace-opening surface, with no
  Source/Moments breadcrumb or controls. Only the first acknowledged clip list
  determines Editor versus Moments. Preserve reconnect/missing/retry actions,
  bounded polling, abort cleanup and local/hosted security boundaries.
- Saved/draft/recovered clips enter Editor directly. Do not mount the original
  source preview or Moments analysis reader until Moments is actually visited.
  Preserve their inputs/player state across later Add/Back navigation.
- Media readiness belongs inside the real editor preview. Keep the editor/rail/
  canonical work area geometry visible while loading, block interactions until
  ready, preserve explicit failure/retry and tour readiness, and remove the
  full-workspace Loading preview replacement. Never fake instant readiness.
- Refine Source/Moments presentation to the same flatter, grouped professional
  workspace family: clear source-method navigation, coherent intake state slots,
  generous preview, purposeful editing/review panes and compact clip rows. Keep
  every acquisition, timestamp/Capture, manual/AI, exchange, framing and explicit
  processing function. No duplicate range controls or new paid features.
- Use generated no-key HTTP/browser fixtures with deliberately held workspace,
  clip-list and media responses. Assert no Source/Moments flash for restored
  clips, no unnecessary full-source/analysis requests, correct empty-session
  destination, reachable failure/retry, Add/Back preservation and stable editor
  geometry. Inspect desktop/tablet/phone layouts and refresh affected film stills.

This request authorizes the revision and synthetic/paid-off checks only. Preserve
the owner's open saved project, all media/exports, normal services and Voyagenda.
No paid processing, ignored configuration change, deployment or new Git action
is inferred from the earlier completed commit authorization.

Produced revision evidence:

- Experience now has an explicit unresolved destination. The batch notifies it
  only after an acknowledged clip snapshot, never its initial empty placeholder.
  Source/breadcrumbs and Moments cannot flash before a restored Editor. Genuine
  empty intake/selection and missing/retry paths remain distinct. No route,
  persisted schema, cached private destination hint or extra bootstrap request
  was introduced. Source/selection mount on the first deliberate Moments visit
  and remain mounted thereafter, preserving inputs and paused playback.
- Clip decoding now uses a small spinner inside the actual preview canvas. The
  rail, tabs and existing Home/properties layout remain painted with unchanged
  geometry; inert/readiness guards block interaction until ready. Error/retry,
  compact transport space and tour readiness remain. Existing proof consumers
  now wait for the real data-loading readiness condition rather than hidden
  panels; optional historical proofs are not claimed as newly executed.
- Source has compact method tabs, aligned headings, coherent upload/drop and
  acquisition state slots with quieter borders. Moments has a generous preview,
  flatter Add/Your clips navigation, grouped controls, compact review rows and
  one Framing control beside the results. The control remains owned by the
  batch through a portal; hosted still excludes this local choice. Timestamp
  Capture/jump/exchange, manual/AI choices and explicit submission are retained.
  Loading existing analysis is a local compact status; actual AI preparation
  keeps its real progress/steps.
- New generated HTTP entry proof passes held workspace/clip/media boundaries:
  observed stages are exactly opening then Editor; zero whole-source/analysis
  reads occur before explicit Add. Preview/canvas/panel rectangles are identical
  before/after media release on desktop and phone. Add/Back preserves typed
  timestamps without another analysis read. A 410 stays neutral with explicit
  retry and no automatic request; recovery works. Empty sessions select Source
  or Moments correctly. Fake plan/image/render and edit counts remain zero.
- A first fixture recovery attempt exposed a cacheable synthetic 410 response;
  its no-store header now matches the actual protected server/bridge policy.
  A first input-preservation attempt had clicked hidden still-restoring controls;
  the proof now waits for genuine selection readiness. Neither fix weakens app
  guards or substitutes saved owner data.
- Responsive editor matrix, tour and final integrated product-film proofs pass.
  Codex inspected current-source Source/Moments at desktop, tablet and phone,
  invalid/corrected manual time feedback, and held/released editor preview.
  Screenshots cl273-source-refined.png, cl273-moments-refined.png and
  cl273-preview-local-loading.png remain outside Git. The viewport is reset and
  temporary review tab is closed; the owner's real tab/session was not used.
- Final frontend gate passes **750/750 tests in 97 files** with bounded worker
  concurrency. An earlier concurrent run had two timeout-sensitive cases and a
  stale demo cursor coordinate assertion; all focused reruns and the settled
  complete suite pass without widening timeouts. Current measured film targets,
  preview/card regions, ten fictional stills and integrity hashes are updated.
- Repository lint, frontend/test type checks, isolated production workflow build
  and strict self-contained artifact verification pass. The existing dynamic
  local-discovery tracing warning remains. The final demo coordinate/still
  alignment is additionally covered by the full frontend and integrated film
  gates. No ignored environment, external package links or private assets enter
  the closed build. Final repository formatting/diff checks and both closed
  image-input cases pass. Review fixtures and temporary helpers are removed;
  only the original 3000/4000/4200 listeners remain with unchanged PIDs, and all
  three content-free readiness GETs return 200. Nothing is staged or committed
  for this follow-up.

Scoped validate against f636e1f: no actionable finding remains for restoration,
Source/Moments presentation, feature/security preservation, lifecycle cleanup
or readiness. These are synthetic/no-key mechanics checks; they do not measure
real AI quality. Normal provider/runtime/live-approval requirements are unchanged.
No paid run, native render of owner media, configuration change, deployment,
Voyagenda operation or Git mutation was performed for this revision.

## Owner review revision — inner editors and toolbar, 2026-11-10

The owner approves the larger workspace but finds Captions, Text, Filters,
Media, Camera, Hook and their sub-tabs too close to the old forms. Generate
additional built-in image references, then improve their hierarchy, density and
use of the available space while preserving every F01–F32/S01–S15 requirement.
Remove the File button/menu presentation and improve the bland save indicator.
Session reset/recovery/privacy/exit capabilities must remain reachable through
compact, clearly named actions; removing File cannot remove those functions.

Implementation guidelines for this revision:

- Use one coherent inner-editor family: a compact context header, a purposeful
  collection/navigation pane and a larger active work area. Give typography,
  crop picking, word editing and layer timing enough room. Avoid repeated nested
  rounded fieldsets, giant pill sub-tabs and unexplained empty gaps.
- Retain the exact existing sections/sub-tabs and all conditional controls,
  callbacks, keyboard behavior, source/display/Hook clock rules and validation.
  Group related controls with readable small section headings/dividers. A new
  presentation must replace its old equivalent, never duplicate its parameter.
- Keep deliberate touch targets and stable contextual feedback. Do not obtain
  density by shrinking inputs below usable targets, hiding errors or removing
  advanced functionality. Collapse panes deliberately on tablet/phone.
- Save status is a compact inline status with meaningful icon, toolbar typography
  and gentle color transition: acknowledged, saving, check edits, failed/conflict.
  Preserve exact honest state, explicit Retry/Reload and unchanged toolbar/
  preview geometry. No fake success timer or new provider work.
- Image references are design aids outside Git; generated text/layout cannot
  silently redefine a function. Preserve the approved full-window outer shell,
  clip rail, large left preview, brand palette and no-bottom-bar rule.

Git authorization: the owner explicitly requests staging and committing **all
CL-273 changes at whole-file level once validation is clean**. This includes the
existing unstaged shell migration plus this review revision. Inspect the final
allocation, exclude unrelated/private/generated scratch, stage explicit whole
paths, make a local CL-273 commit and never push. No paid test, deployment,
configuration change, owner session/media edit or Voyagenda operation is added.

### Inner-editor implementation and verification

Three built-in image-generation boards were generated before implementing this
revision: Captions/Text, Filters/Media and Camera/Hook. Images and exact prompts
remain outside Git in the Codex visualization directory as cl273-inner-1.png,
cl273-inner-2.png, cl273-inner-3.png and CL-273-inner-editor-prompts.md. They
retain the approved shell/identity. Invented image controls (extra looks/fonts,
caption search and new camera modes) were deliberately excluded from code.

- The six inner sections share compact scope headings, purposeful collections,
  wide canonical properties, flatter grouped controls and lighter sub-tabs.
  Captions/Text retain all style, word, speaker, placement and timing controls.
  One shared keyboard radio grid replaces the existing preset dropdowns:
  exactly nine typography presets and five timed looks. Filter samples use the
  shared thumbnail cache and the actual look layer; no duplicate decoder or
  parameter is introduced. Native colour pickers gain readable hex swatches.
- Media retains acquisition, timing, fit, placement, source trims and audio;
  order actions use labelled shared icon buttons. Camera retains its visual
  crop/endpoint picker, target selector, Zoom/Pan/Face tracking/Transitions and
  Capture. Hook groups its independent range and explicit optional title/audio
  controls. All domain callbacks and availability/validation guards remain.
- File is removed. The far-right Session options ellipsis retains reset,
  recovery, privacy and applicable Exit, including Escape/focus handling. The
  inline save status uses a real state icon/tint and fixed geometry for acknowledged,
  pending, invalid, failed and conflicting edits, with explicit Retry/Reload.
- The full frontend suite passes **750/750 tests in 97 files**. A legacy
  typography-feedback fixture previously spread an absent optional caption
  style; it now starts from the canonical Clean preset before injecting only
  the invalid number under test. Validation assertions are unchanged.
- Generated HTTP autosave proof passes all prior race/conflict/invalid/history
  checks plus nine-preset availability, preset save/Undo without geometry loss,
  and a Warm look saved through the real edit route. Plan/image/render counts
  remain zero. Responsive layout and Hook-options proofs pass after the main
  revision. Final responsive layout and integrated film proofs also pass after
  the final swatch/text-toolbar and measured action-coordinate changes.
- Codex browser inspected Captions, Text, Filters, Media, Camera and Hook,
  picture selection/crop controls, keyboard preset switching, Undo and genuine
  saving/saved states. Phone presets retain all choices in a horizontally
  scrolling grid; End moves focus/selection to the last preset. Session options
  remains reachable on phone and Escape closes it. Tablet uses pane switching.
  Screenshots cl273-inner-desktop.png, cl273-inner-phone.png and
  cl273-inner-tablet.png remain outside Git. The fixture/tab are closed and the
  viewport override reset; the owner session was not used.
- Recaptured all ten controlled product-film images from current synthetic UI,
  refreshed their integrity hashes and measured action coordinates. No provider
  request, owner media, normal app mutation or download click was used.
- Current-source production Next/Turbopack build and strict release-artifact
  verification pass in a closed temporary context: 1,825 files, zero external
  package links, self-contained artifact. The existing local-discovery tracing
  warning remains, with no weakened guard or ignored configuration included.

Final revision gate: repository lint, repository formatting, frontend and test
TypeScript checks, the 750-test frontend suite, extended HTTP autosave proof,
responsive layout proof, Hook-options proof and integrated product-film proof
pass. Earlier current-source native B-roll, hosted-security/boundary and tour
evidence remains applicable because their transports/contracts/composition and
tour targets were retained. No historical optional proof or real-provider
quality is implied. Final scoped validate against baseline e046579 and the
combined CL-273 worktree finds **no actionable findings**: all F01–F32/S01–S15
requirements are covered with the explicit owner-only boundaries below.

The old source/editor footer, Apply/Discard, duplicate layer/preset controls and
File menu presentation are removed from runtime source. Existing domain modules
remain where they own real functionality; no alternate legacy UI is retained.
New code uses existing shared primitives/tokens, bounded cached thumbnails and
explicit lifecycle cleanup. No ignored configuration, private media, keys,
provider resources or new dependencies are included. Only the ten original
fictional product-film stills are tracked bitmap updates. Temporary build/UI
helpers are removed after their owned fixture/context cleanup. Normal ClipBuilder
services remain running; Voyagenda was not touched. Whole-file allocation below
is the authorized local commit scope; the handoff reports its resulting hash.

The owner requests completion of the entire responsive migration with focused
execute/validate/fix loops, exhaustive feature/security parity and removal of
the superseded UI. Responsive/intake/selection references were generated
before implementation and are retained outside Git. Earlier design-only
holds in historical sections are superseded by this explicit instruction.
Depends on the implemented shared
workflow and CL-271/CL-272 functionality at commit e046579.

## Current execution contract — approved AFK migration, 2026-11-10

The owner approves the design direction and explicitly authorizes implementation
to completion without questions. First generate/source the additional reference
pictures, then document the full packet, implement and validate in bounded loops.
Every existing feature, including small/conditional operations, and every
security/spend/privacy guard must survive. A similar screenshot is insufficient.
New features must be documented, implemented and verified before claiming them.
No speculative product expansion is necessary beyond Home, responsive workspace,
validated autosave and bounded Undo/Redo already requested. Initial design-only
holds below are historical and superseded. Local whole-file Git authorization
is recorded above; deployment/paid-provider actions remain outside this
authorization. Preserve owner media, sessions and Voyagenda.

### References completed before implementation

Four additional built-in image-generation references are generated/inspected and
saved outside Git alongside the approved three-screen family:
cl273-intake-reference.png, cl273-moments-reference.png,
cl273-tablet-reference.png, cl273-phone-reference.png. Their exact prompts are in
CL-273-responsive-workflow-prompts.md in the Codex visualization directory.
These are inspiration, not executable specs. Do not implement the selection
image's idle spinner, apparent combined analysis/process action or extraneous
text. Preserve the real two-stage explicit analysis/processing contract. The
phone image is a scroll composition, not proof that all controls fit one screen.

### Non-redundancy and UX rules

1. One canonical editing location for each parameter. Home/timeline/cards select
   and navigate to it; they do not instantiate competing editors for that field.
2. Source trim chooses admitted source frames. Display timing places a cue on
   the clip clock. Camera-effect timing bounds an effect inside that cue. Hook
   selects an independent lead-in. Acquisition Range limits downloaded source.
   Preserve all five semantics with clear scope; do not merge them or repeat
   identical Start/End controls in collection, timeline and inspector.
3. One selected clip/layer/occurrence/clock drives preview, Home and inspector.
   Navigating or selecting never edits, generates, applies or exports by itself.
4. Use the existing six semantic sections plus Home. Media owns acquisition,
   placement, trim and gain; Camera owns crop/Zoom/Pan/marked-head tracking and
   transitions. Preserve existing sub-tabs and target availability.
5. One useful action area in the compact top bar. No bottom editor navbar,
   Step 3 enclosing frame, manual Apply/Discard cycle, redundant success prose,
   fake progress, decorative project title or duplicated primary submission.
   Intake cards may retain local coherent actions without a second page footer.
6. Keep exact current brand mark, tokens, neutral inset keyboard focus, timestamp
   Capture, fixed contextual feedback space and normal motion. Do not add a new
   framework/design dependency or a second local/hosted editor implementation.
7. Desktop uses remaining viewport height with independent purposeful panes;
   phone uses natural document scroll and horizontal tabs/clip strip. Tablet and
   compact laptops collapse the inspector/layout deliberately, never scale text
   down to make four unusable columns. All controls remain reachable.

### Feature inventory and required parity evidence

The prior map below remains binding. Before removing a legacy surface, migrate
every callback/validation state reachable from it, not just its happy-path label.
Inspect the owning source/fixtures and record produced evidence in the ledger.

| ID | Current behavior to preserve | Owning boundary / migration check |
| --- | --- | --- |
| F01 | Local MP4/file/drop and saved-reference open, same picker acceptance/reset, busy/error/cancel/readiness | experience/open-local-file; generated upload and reopen |
| F02 | Hosted bounded chunk upload, actual acknowledged progress, Turnstile/session admission | hosted-upload/analysis-challenge; no bypass or extra provider dispatch |
| F03 | Local YouTube link validation/metadata/offer images, quality choice, saved variants, open/download/range, cancellation/retry/status restore | acquisition-panel/source-acquisition; hosted exclusion |
| F04 | Retained source playback, available-window constraints, correctly shaped thumbnails, load/error/seeking state | source preview/manual-time |
| F05 | Manual Add clips with single-endpoint Capture, valid duration/bounds, manual disables Suggest clips with explicit opt-back-in | selection-panel/selection-bounds |
| F06 | AI analysis range/count/duration/all gates, explicit challenge/action, cancellation/retry and preserved results | analysis request/progress transport |
| F07 | Timestamp import/export, roundtrip, Jump to source, all retained manual/AI results, removal/empty/count bounds | timestamp exchange/selection results |
| F08 | Local-only tracked/fit choice, tracked default, hosted API normalization, all saved legacy defaults | runtime-capabilities/server |
| F09 | Clip paging/keyboard tabs/rename/remove, state labels and preview readiness, Add more clips and return | clip-batch/clip-name-controls |
| F10 | Native source preview with real controls/clocks/fullscreen, exact frame sampling, gesture scale and safe bounds | Review/player/composition unchanged |
| F11 | Caption preset/font/color/outline/background/layout/animation/position, speakers/palettes and actual word corrections | caption-controls/text/style and saved edit schema |
| F12 | Caption generation confirmed paid/local path, fake generation local-only, attempts/empty/error/retry | existing explicit generation transport; autosave never calls it |
| F13 | Multiple manual/opening/Hook texts, selection/content/style/emphasis/range, Capture, drag/resize/delete | text-controls/edit and preview sessions |
| F14 | Full-clip and timed filters/looks, source-only effects and Hook independence | filter controls/timeline |
| F15 | Picture upload/find/replace/delete, source preview, local/hosted availability and shared thumbnail loading/failure | visual discovery/admitted assets |
| F16 | Added video upload/normalization/source trim/display bounds, muted default, optional gain/mixing, exact clocks | video assets/cue edit/worker unchanged |
| F17 | Shared picture/video order, separate timing/geometry, fit/contain/cover/full-frame/inset and overlapping decoder bounds | existing visual-order and contracts |
| F18 | Original camera positions/people/custom/reset/Capture, visual crop picker and named target | focus preview/control modules |
| F19 | Original/picture/video Zoom and Pan, target-specific transitions, endpoint selection, inspection-to-playback return | camera inspector/media-camera modules |
| F20 | Marked-head Face tracking original/added video, seed/follow window/progress/lost/cancel/reset and path binding | browser tracker/saved path unchanged |
| F21 | Original speech volume, real curated cue/music/uploaded audio, audition/stop/import, timing/source trim/gain/loop/anchors/delete | audio controls/preview/import/mixer |
| F22 | Suggested/manual Hook, incomplete End guard, title/audio independent off-by-default opt-ins, title preview/failure/retry/limits | Hook controls/requests/independent Hook edits |
| F23 | Hook/body captions/text/visual/audio/camera/filter independence and one offset mapping, selective errors/selection | occurrence adapters/timeline |
| F24 | Invalid transient input retains last valid paint; contextual stable errors, capture guards, pending/stale revision protection | editor form and validation |
| F25 | Local named drafts/output references/source retention and two-hour rolling recovery; hosted temporary isolation | existing draft/recovery/session stores |
| F26 | Export coherent revision, queue/preparing/exporting/cancel/retry state, MP4 naming/download, exact preview/render parity | clip-batch/render routes/worker/composition |
| F27 | Explicit Start over/clear confirmation, session recovery retry, lost/disconnected state and privacy dialog | session-controls/connection |
| F28 | Tour first-ready welcome/skip/replay/Escape/focus return and seen reset on explicit Start over | editor-tour retargeted to new shell |
| F29 | All relevant controls on large/small laptop, tablet landscape/portrait, phone portrait/landscape with touch/keyboard | generated browser matrix and Codex inspection |
| F30 | Home combined layer/camera/effect/audio overview, Hook mapping, row selection opens canonical inspector | new presentation over existing immutable timings |
| F31 | Validated autosave, acknowledgement/failure/retry/flush, navigation/export/recovery coherence without AI/render spend | new state coordinator over existing edit HTTP |
| F32 | Multi-action Undo/Redo, meaningful gesture/typing grouping, per-clip scope and bounded memory; no duplicated generation | new history domain tests + real edit transport |

### Security and integrity invariants

| ID | Must remain enforced |
| --- | --- |
| S01 | Same-origin frontend bridges, protected local token binding, hosted cookie/CSRF/origin/session ownership; no new unauthenticated media/save route. |
| S02 | Hosted session/IP/abuse/challenge/usage/attempt/resource bounds and expiry; no durable hosted library or hidden YouTube route. |
| S03 | No ignored env/credential reads/changes, no browser provider/backend secrets, no private paths/transcripts/media in Git/errors/normal logs. |
| S04 | Fake/paid-off before test imports, envDir false, injected transport and external network blocking; zero real provider/YouTube/cloud requests. |
| S05 | Explicit user generation only, no automatic provider retries/fallbacks; saved inference reused and never repeated by autosave/Undo/Redo/tour. |
| S06 | Schema validation, immutable asset IDs/hashes, revision/base/source/occurrence binding and idempotent operation receipts preserved. |
| S07 | Video/image/audio format/pixel/byte/duration/overlap limits and normalized assets; no arbitrary path/command/composition or remote asset entry. |
| S08 | Hook/cue/effect source/display timing bounds, incomplete range guards, single settled Capture clock and decoder limits remain. |
| S09 | Saved owner media/exports/masters/private diagnostics never deleted as cleanup; history stores edit values, not source-byte copies. |
| S10 | No accidental clearing on unmount/refresh/history; pending save cannot overwrite later typing or a newer acknowledged revision. |
| S11 | Request/listener/timer/RAF/decoder/object-URL/worker cleanup and bounded history; no duplicate polling or hidden old mounted workflow. |
| S12 | Frontend/contracts/composition/backend/renderer dependency directions; contract schemas stay shared and browser-safe. |
| S13 | Plain text stays escaped; no untrusted HTML or executable rendered values, no transcript in browser URLs/storage keys/log output. |
| S14 | Readiness gates preserve queued/exporting controls and existing explicit cancel/retry. Export is disabled during invalid/unacknowledged state. |
| S15 | Native/current-source parity and fake provider call counts; no obsolete build overlay used as evidence for changed composition. |

### Autosave/history implementation decisions

- Keep current saved edit format and protected edit endpoint. Autosave is a
  debounced valid edit request, not a native render or provider action. Do not
  permit invalid/incomplete form state to cross that transport.
- Serialize saves; acknowledge the submitted snapshot and rebase later local
  edits to its new revision instead of overwriting them. No loop/retry on failure;
  show a stable explicit Retry near save status. Stale-server conflicts preserve
  input and require deliberate recovery rather than forced overwrite.
- Export, clip switching, source navigation and explicit external actions must
  not race an unsaved edit. Keep a short pending flush/guard and beforeunload
  protection; show truthful Saving/Saved/Needs attention states.
- Record bounded immutable edit snapshots per clip; group continuous gestures
  and rapid field typing, clear Redo only after a new user edit, ignore duplicate
  states and navigation. History revision fields rebase on acknowledgement.
- Native input Undo remains available while typing; editor history shortcuts
  avoid hijacking text caret/input editing. Toolbar Undo/Redo is explicit.
- Incomplete Hook range input also belongs to in-memory action history. Undo/
  Redo must restore its exact null endpoint without popping an unrelated edit,
  inventing an End or sending incomplete state through autosave. History owns a
  transient snapshot envelope; the saved edit contract remains unchanged.
- Responsive review found the built-in portrait player's transport wraps at
  phone/short landscape sizes. Compact layouts use one full-width transport
  beside the scaled canvas, preserving play/pause, mute/volume, seek and
  fullscreen. Fullscreen retains the normal player controls. Clock updates stay
  within the transport; they must not rerender the whole editor on every frame.
- Preserve history across section navigation and clip changes in the current
  workspace. Persist acknowledged edit values through existing recovery; history
  itself may be session-memory bounded, documented rather than promising reload
  history. No private edit copy in general localStorage.
- Uploaded/generated asset additions and provider results are retained through
  existing stores; undo changes placement/edit values without deleting bytes or
  rerunning requests. Non-edit workflow actions remain explicit.

### Migration phases and verification budget

| Phase | Deliverable | Gate / status |
| --- | --- | --- |
| A | Approved desktop + additional intake/selection/tablet/phone references; inventory and current decisions | Complete; images are static inspiration only. |
| B | Shared full-window shell/top actions, responsive layout; migrate source/selection; remove Step 3 form/frame usage | Complete; generated responsive regression and Codex inspection passed. |
| C | Editor canonical panes/Home overview/selection; retain every existing control handler and ownership | Complete; inventory review, navigation and real crop/placement gestures passed. |
| D | Validated autosave + bounded history; coherent export/navigation/recovery | Complete; serial/failure/race/conflict/two-clip/partial-Hook transport checks passed. |
| E | Tour and product-demo/landing alignment to actual finished workspace; no stale visible Apply/Discard workflow | Complete locally; tour, integrated film and motion checks passed; fictional delivery stills updated. |
| F | Cleanup/migration ledger, focused regressions/types/lint/build, generated HTTP/native representative flows and responsive/Codex review | Complete locally; coverage ledger below records evidence and limits. |

Work sequentially in this packet; no delegation is implied. Run focused checks
after meaningful slices, never after every cosmetic edit. Reuse passing native/
provider/security evidence where its boundary is unchanged. New autosave/history
needs actual HTTP and revision/failure/race checks; pixel/control/range changes
need current-source generated browser/native evidence. Final checks include
lint/type/build and the smallest relevant unit groups, not endless repeated
full suites or paid acceptance. Record failures and fix their causes.

Responsive acceptance dimensions: 1920x1080 and 1440x900, compact 1280x720 and
1366x600, tablet 1024x768 and 768x1024, phone 390x844 and 320x568 plus landscape.
Use representative settled valid/error/corrected/pending states and real pointer
or touch gestures. Check no horizontal document overflow, readable previews,
reachable primary/cancel actions, keyboard tabs/focus and stable feedback.
Observe playback/seek/drag/timeline responsiveness and absence of duplicate
requests/update loops; do not invent a universal FPS claim from static captures.

### Removal, code quality and completion ledger

No parallel legacy/new editor, compatibility toggle, hidden old footer, duplicate
form or dead CSS fallback may remain at completion. Reuse domain/controller code
where sound, rewrite presentation at its owner and extract named responsibilities
where needed. Delete superseded modules/selectors once their consumers migrate,
within the same slice; preserve unrelated reusable security/domain modules.
Update selector-dependent tests and demo/tour consumers instead of retaining
dead UI for them. Search for imports, selectors, visible old action strings and
obsolete workflows; delete only verified orphaned code, never real saved data.

Every F/S row must finish Covered with actual evidence or an explicit owner-only
external quality/release boundary. A missing local capability is a failure to
finish, not a deferred nice-to-have. Final validate covers feature preservation,
redundant controls, responsiveness, autosave/history races, security/privacy,
dependency direction, render clocks, cleanup and dead legacy code. Personal
visual preference and live-provider quality remain owner-only; no paid test is
necessary for this migration. Record final changed files/checks/limits/Git status
here. Never claim completion merely because images or documentation are done.

### Execution evidence — shell/history and inspector slices

The shared Workspace/WorkflowFrame now use compact full-window chrome with File,
history/save status, context actions and tour replay. The old outer frame/footer
rendering and its editor layout rules are replaced, not hidden beside a second
workflow. Clip navigation owns Add. Home derives existing text/caption/visual/
camera/effect/filter/audio intervals, including independent Hook/body mapping;
playhead paint subscribes directly without rerendering all controls per frame.

Added bounded workspace-owned edit history (50 states per clip, 8 MiB aggregate)
and debounced edit-only autosave. Saves serialize, preserve newer in-flight
typing, retain uncertain-operation receipts for explicit retry and gate export/
navigation. No generation or native render is dispatched by a save. Native input
Undo is preserved while typing; toolbar/history shortcuts address editor actions.
These mechanics still require failure/race/gesture/recovery acceptance; they are
not marked complete from a positive check alone.

Frontend TypeScript and contracts build passed at this slice. A generated Codex
browser check confirmed Home/top actions, caption edit 64→70, acknowledged Undo
70→64, section navigation and Redo 64→70; exactly three HTTP edit requests and
zero unexpected fixture requests. The current preview and controls stayed loaded.
No owner clip was used. Screenshot cl273-shell-first-pass.jpg is outside Git.
The fixture/tab/server/scratch were closed. The first real browser bundle caught
a .ts/.tsx basename ambiguity; its import now explicitly selects the timeline
model. Review also found the remaining Media collection/properties stack too
crowded; separating canonical panes is the next slice. No clean final validation
or overall completion is claimed yet.

The next slice moved Text, Captions, Filters, Media/Audio and Hook properties
into shared canonical inspector slots. Wide screens show collection + inspector;
narrow workbenches switch Layers/Properties rather than burying a second full
form below the list. Camera retains its dedicated source-frame/inspector pairing.
The duplicate Media layer selector was removed; the visual list remains the
selector, with front/back controls and a read-only stack position. Pictures and
Videos filter their own lists. Clip-strip previews remain visible on tablets.
Home includes shared-helper thumbnails and effect/target/tab navigation. Source
intake uses one Upload/YouTube path at a time; no remote player was invented.

The generated HTTP autosave regression passes delayed-save serialization,
later typing, section navigation + grouped Undo/Redo, response-lost idempotent
retry, invalid-input suppression, Undo during a save, conflict/no-auto-retry and
explicit reload. It caught/fixed polling blocking an uncertain receipt retry,
and conflict reset at unchanged revision. Provider plan/image/render counts stay
zero, with zero unexpected requests and no pending edit responses on cleanup.
Frontend types passed after the shared inspector changes. A Codex browser review
at 1280×720, 768×1024 and 390×844 identified the buried tablet properties and an
unpositioned hidden file input extending document bounds; both were corrected
in source and still await a rebuilt visual pass. No owner media/session, normal
service configuration, paid service or Voyagenda was changed.

Further evidence: `local-workspace-layout.proof.ts` passes all seven sections at
1920×1080, 1440×900, 1280×720, 1366×600, 1024×768, 768×1024, 390×844,
320×568 and 844×390. It checks preview/panel/header bounds, field width, document
overflow and absence of legacy Apply/Discard/footer UI, with zero edit/unexpected
requests. Narrow layouts keep playback visible above an independently scrolling
inspector, or beside it in landscape; header height follows actual wrapping.

`local-editor-tour.proof.ts` passes readiness, initial welcome, replay, every
section including Home and Audio, resize, skip/back/done, animation continuity,
focus trapping/return, dirty guard/Undo, reset/rearm and missing-target recovery
with zero work requests. Its edge spotlight was corrected for the full-width
toolbar. `local-broll.proof.ts` passes a fresh generated HTTP/native pipeline:
multiple videos/transparent pictures, full-frame/inset, zoom/pan/tracking paths,
independent audio levels/default mute, native export checks and hashed draft
reopen without new AI. The current-source overlay is built into owned scratch.

The old normal-app/sample capture script was replaced with an isolated fake-only
authoring command. Ten current-workspace stills use original fictional artwork;
settled native source playback avoids idle loading captures. They replace the
ten controlled delivery PNGs with corresponding delivery hashes; the capture
index and authoring folder remain excluded. This is local provisional review,
not deployment or personal release approval. The film's cursor/card/preview
bounds now describe Jump to and top-toolbar actions; motion units pass all
eleven continuity/coverage/choreography checks. Initial abrupt corner panning
was fixed by easing between bounded camera endpoints and fading an offscreen
travelling pointer rather than snapping the camera. The old workspace-only
styles were removed from the shared sample stylesheet, and migrated action-slot
props/classes no longer carry footer ownership names.

## Owner revision: one coherent workspace, autosave and Undo — 2026-11-10

### Final migration review and evidence — 2026-11-10

All existing editor/source callbacks and domain guards were retained while their
presentation moved to the shared workspace. The following coverage is local
implementation/mechanics evidence, not a claim about real-provider output
quality or personal design acceptance.

| Inventory | Result and produced evidence |
| --- | --- |
| F01–F04 | Covered: source tabs use the existing upload/drop/open/acquisition controllers, native source preview and shared thumbnails. File acceptance, hosted admission, quality/range/cancel/retry and saved-reference paths remain. Generated intake/selection were inspected in Codex; the isolated film captures the actual current source states. No real YouTube download was run. |
| F05–F08 | Covered: manual/AI selection remains two explicit stages with retained Add clips / Your clips, Capture, exchange, Jump to, bounds/count and local-only framing controls. Existing form handlers and contracts are unchanged; top actions replace only their mounting location. Hosted workflow tests pass, including forced tracked framing and local-path exclusion. |
| F09–F10 | Covered: clip rail, rename/paging/keyboard/readiness/Add and native Player retained. Responsive rail orientation matches its CSS breakpoint. Codex exercised scaled picture/crop dragging, ordinary playback, seek/mute and fullscreen entry/return; the generated browser proof verifies the settled native fullscreen transport and preserved clock. |
| F11–F14 | Covered: captions/style/position/text/speakers, all text/style/emphasis/timing controls and filters retain their owning modules and callbacks. Canonical collection/inspector portals replace duplicate pickers. Full frontend suite now passes 750/750 after the inner-editor revision; Home/timeline/history/workflow/Hook and shared-thumbnail checks are included. |
| F15–F17 | Covered: picture/video/audio upload, discovery, delete, shared loading thumbnails, source/display ranges, fit/presentation, layer order and per-video audio retain their existing transports and schemas. Fresh generated HTTP/native B-roll proof passes multiple videos plus transparent pictures, inset/full-frame, zoom/pan/tracking paths, default mute and independent mix. No owner media was edited. |
| F18–F20 | Covered: original and added-media Camera keep their source picker, matching selection/clock/crop, Zoom/Pan/Face tracking/Transitions and all existing local tracker controls. Home effect rows target the correct occurrence/media/effect. Units check partial tracking windows and source offsets. Codex exercised picture Zoom and crop dragging; current-source native B-roll verifies saved numeric paths/export. Real-head tracking quality remains owner review. |
| F21–F23 | Covered: audio library/import/audition/mixing and independent Hook/body domains are retained. Updated Hook-options HTTP proof passes explicit independent title/audio choices, cancellation, range guards, custom volume 47, Undo restoration and reload. Exactly four fake title requests and three cancellations; no real inference. |
| F24 | Covered: last valid paint remains during invalid input; contextual errors and Capture guards stay intact. Export/download stays mounted but disabled during unacknowledged/invalid edits. Save-failure Retry and conflict recovery are anchored outside toolbar sizing. HTTP proof compares unchanged toolbar/preview/panel rectangles across saved/failed/conflict states at 1440, 768, 390 and 320 widths. Codex inspected empty/corrected font input on phone. |
| F25–F26 | Covered: protected revision-bound edit route and existing local draft/recovery stores remain authoritative; hosted remains temporary. Generated native B-roll saves/reopens a hashed draft without new AI and checks actual exported pixels/audio. Export still requires a coherent acknowledged edit and remains explicit. No recovery/draft/output format migration was added. |
| F27–F28 | Covered: Session options retains privacy/reset/recovery after removal of File; a new client guard prevents reset racing unacknowledged edits, with zero DELETE on the pending-save regression. Updated tour passes ready/loading/held media, welcome/replay, all sections, keyboard/focus, resize, skip/back/done, dirty Undo, Start over/rearm and missing-target cases. |
| F29 | Covered: seven sections pass at 1920×1080, 1440×900, 1280×720, 1366×600, 1024×768, 768×1024, 390×844, 320×568 and 844×390. No document overflow or legacy footer; preview, controls, toolbar and input bounds remain reachable. Compact transport avoids wrapped portrait controls, with one play/mute/seek/volume/fullscreen surface. Fullscreen checks use the root layout viewport, accounting for the shared stable scrollbar gutter. |
| F30 | Covered: Home projects existing text/caption/visual/camera/effect/filter/audio intervals; it introduces no competing range editor. Player clock paints the playhead directly. Row selection navigates the existing inspector; source/display/Hook offsets remain mapped once. |
| F31–F32 | Covered: generated two-clip HTTP proof passes serialized delayed saves, later typing, uncertain receipt retry with identical operation/body, invalid suppression, Undo during a save, conflict/no-auto-retry, explicit reload, cross-section/cross-clip Undo/Redo and incomplete Hook endpoints. History units cover grouping, bounds, changed base, removed clips and immutable snapshots. Provider plan/image/render counts remain zero. |

Security review:

| Invariants | Result |
| --- | --- |
| S01–S02 | Covered: no new route/admission/authentication mechanism. Twenty existing hosted workflow tests pass for admission, exact origin, isolated assets, export, expiry, capacity and local YouTube/library/agent exclusion. |
| S03–S04 | Covered: no ignored configuration/credential/media reads or changes. All tests install deterministic fake/paid-off configuration before imports, with no env loading. Closed app-image tests exclude secrets, tests and authoring inputs. New capture authoring blocks non-loopback browser requests and uses original fictional artwork. |
| S05–S06 | Covered: autosave/history contain edit values and use existing validated revision/base/idempotency contracts only. Provider work remains explicit; no automatic retry/fallback/render. Fake title and edit counts are asserted. |
| S07–S08 | Covered: existing normalization, asset IDs/hashes, media/resource/overlap bounds, source/display/Hook clocks, incomplete range guards and single-endpoint Capture are retained. Native B-roll and timeline/Hook regression checks pass. |
| S09–S11 | Covered: owner sources, drafts, exports, masters and diagnostics preserved; no normal service was restarted. History is bounded and memory-only. New subscriptions/timers/controllers have cleanup; fixture scratch and closed build context use validated owned paths. Pending reset cannot clear client edits. |
| S12–S13 | Covered: executable boundary/release checks pass (40 cases), lint passes, contracts remain browser-safe. Only Home was added to the diagnostic section enum. No untrusted HTML/remote composition/path/command or browser secret is introduced. |
| S14–S15 | Covered: queued/exporting/invalid/stale/pending gates remain. Native proof compiles the current overlay into its own scratch and checks actual preview/export/draft results. Composition/worker production code is unchanged, so no normal worker reload was needed. |

Cleanup and verification record:

- Edited the existing shell/source/editor files in place; removed old bounded
  workspace/footer and corresponding layout CSS, the obsolete capture command,
  duplicate Media selector and obsolete compact clip-width rule. No legacy
  editor toggle, hidden footer or second mounted workflow remains. Runtime
  source search finds no Apply changes/Discard changes/Step N of 3 action UI.
- Preserved existing control/domain modules; extracted named inspector slots,
  Home projection, autosave coordinator, bounded history and compact playback
  responsibilities. No new dependency or configuration switch was added.
- Updated the tour, current proof consumers, shared workflow tests and product
  film. Historical opt-in proofs tied to earlier tickets were not all rerun;
  they are not claimed as new acceptance. New canonical browser proofs cover
  the changed shell/save/history contracts without restoring obsolete UI.
- Full repository lint passed after resolving the new inspector effect warning;
  focused lint passed after the final playback/save changes. Frontend/backend/
  renderer/shared/test/local type checks passed. Formatting and diff whitespace
  checks pass. Full frontend suite initially passed 746/748; corrected thumbnail
  assertions and the isolated request timeout test pass on focused reruns.
- Production Next/Turbopack build and strict self-contained release-artifact
  verification pass in a closed temporary context, with zero external package
  links. Existing local-discovery dynamic tracing warning remains; the closed
  image contains no ignored secrets/tests/media and artifact checks pass.
- The first build-verifier attempt hit its 30-second tool timeout under load;
  a bounded 120-second verification completed. No source/configuration bypass
  or weakened artifact rule was used. Global pnpm mismatch was avoided by the
  pinned Corepack toolchain, without changing owner settings.
- Additional gate repairs are test-only: contract text-range fixtures now stay
  inside their allowed boundary; hosted export mock jobs parse the shared schema;
  the native video error callback carries its explicit React event type.
- Final Codex screenshots are outside Git beside the references:
  cl273-final-desktop.png, cl273-final-camera.png and
  cl273-final-phone-validation.png. They use generated fixture media. Ten actual
  current-workspace film screenshots use original fictional conversation art.
- Final responsive review also removed the obsolete compact clip-width rule so
  names remain readable, and replaced heading-to-top scrolling with an explicit
  stage reset to the document top. The Moments heading remains below the sticky
  toolbar; Add/Back preserves inputs and pauses hidden source playback. The
  generated phone navigation regression passes. Final review fixtures report
  zero unexpected requests and are closed; the Codex viewport is reset and its
  temporary tab is closed. Additional intake/Moments/tablet/phone screenshots
  are retained beside the three principal views.

Final validate disposition: the combined unstaged CL-273 worktree was reviewed
against F01–F32/S01–S15 and the owner revisions. Identified autosave receipt,
conflict reset, partial-Hook Undo, click grouping, compact transport, stable
export/error geometry and stage-heading issues were corrected and rechecked.
No remaining actionable implementation finding was identified in this scoped
pass. This does not certify every historical optional UI proof or live-provider
quality. No deployment is included; the later owner revision authorizes the
whole-file local commit after clean validation.

No paid clip run, real AI/YouTube/cloud request, deployment, model install or
Voyagenda operation was performed. API-free manual editing and these synthetic
checks do not establish live AI quality. Fresh real processing still requires
the normal provider/runtime/assets, enabled live flags and applicable approvals.
Personal visual/live-provider/hosted release acceptance remains owner-only.
This earlier pass preceded the inner-editor revision and its Git authorization;
the final whole-file disposition below owns the current completion state.

The owner likes the large left preview, far-left clip list, existing category
tabs and additional right inspector. They reject the bottom action/navigation
bar, the fictional project-title text in the header, and inconsistent layouts
between the first three mockups. The requested replacement is three states of
ONE shared layout: Home, Media and Camera. This supersedes the earlier four-image
set and its Apply/Discard footer proposal. The ungenerated workflow board is
deferred; the initial three generated images remain historical explorations.

- Keep one compact top app bar: existing logo/ClipBuilder name, File and View,
  history Undo/Redo controls, a quiet truthful autosave state, Export and Help
  that reopens the tour. Avoid invented project/source titles, slogans, redundant
  menus and low-value buttons. Put Add clips in the clip rail, not a footer.
- Keep the far-left clip rail, large left 9:16 playback and seven category tabs
  in fixed positions: Home, Captions, Text, Filters, Media, Camera, Hook.
  Preserve the added right inspector. Only the selected work area/inspector
  content changes between pictures. Use the SAME fictional media, source,
  preview timestamp, selected clip, type, spacing and column widths throughout.
- Home presents the combined bounded layer timeline and layer overview for
  this clip and is the initial fully ready editor view: original footage,
  camera positions/cuts, Zoom/Pan/tracking spans,
  captions, titles, pictures/videos and audio. Existing camera intervals can be
  represented without offering arbitrary source cutting or montage editing.
  Selecting a layer/effect must connect its row, preview selection, timestamp
  and corresponding tab/inspector. Hook/body timing remains mapped once.
- Replace explicit normal Apply/Discard and repeated Save with automatically
  saved valid edits and reversible action history in the future implementation.
  Reuse the existing edit validation, revision/admission and persistence paths;
  rolling recovery alone is not this new autosave/history feature. Invalid or
  incomplete typed values stay local, preserve the last valid saved preview and
  show contextual feedback. Saving/failure/retry states stay beside save status,
  without stealing column width or creating a bottom bar. Export must use a
  coherent acknowledged revision and block contextually when not ready.
- Undo walks back successive user edits; Redo restores undone edits. Coalesce
  a continuous drag/resize or typing gesture into a meaningful action. Scope
  history per clip, preserve it during tab switches, and bound its memory;
  decide reload persistence in the implementation packet. Preview navigation
  is not a media edit. Undo must not repeat/refund a paid generation, delete
  retained source/output media or silently rerun processing. Restoring a retained
  result/state should reuse it. No new inference/export is triggered by autosave.
- Respect local/hosted retention: local safe recovery/draft compatibility stays;
  hosted autosave is temporary session state, not a durable account/library.
  Keep all pre-existing AI/manual controls and local-only framing/YouTube gates.

The owner also explicitly requires later updates to the tour, product motion
graphics/demo film and landing so they depict the selected editor and revised
workflow truthfully. Record these as dependent follow-up work once the layout
and autosave/history behavior are approved; do not implement or regenerate the
landing/film now. This revises the earlier blanket landing exclusion for planning
purposes only. A later packet must define desktop/tablet/phone behavior, keyboard
history shortcuts/focus, save failures, cancellation and provider boundaries.

Acceptance for this round: exactly three generated coherent Home/Media/Camera
screens; no bottom action/navigation bar, Apply, Discard or mandatory Save draft;
no project-title/slogan in the top bar; all seven tabs and the same inspector
geometry; Home combined layer/camera/audio timing; useful top actions and quiet
autosave/Undo. Mockups illustrate intended new behavior and do not claim that
autosave/history or the new shell already works. No application/provider calls,
paid clip run, source mutation, Voyagenda change or Git mutation.

## Owner request

The owner is satisfied with the current AI/manual functionality but rejects the
editor's constrained Step 3 card/template. Explore a dedicated editor that uses
the application window, keeps a large playback preview on the left, and makes
better use of the remaining space. Preserve ClipBuilder's design identity and
every current capability. Intake, moment selection and export may be refined to
support this transition; the landing page is outside scope.

Start by generating several high-fidelity pictures with Codex's built-in image
generation. Take inspiration from known approachable editors and competitors.
Use their interaction/layout principles rather than reproducing their branding
or expanding ClipBuilder into a general editing suite. The owner reviews images
before any implementation ticket or source-of-truth layout replacement.

## Existing identity and proposed direction

Source: apps/frontend/src/styles/tokens.css. Keep the system-ui / Segoe UI sans
stack, Consolas-style timecodes, navy #07142f and raised navy #0b2459, restrained
blue #3157d5 / #78afff, white text, subtle translucent surfaces and thin borders.
Use flatter workspace divisions and quieter gradients within this identity;
improve hierarchy, alignment and density rather than introducing a new theme.
Keep neutral inset keyboard focus, normal motion, stable contextual feedback,
readable labels and current shared primitives as future implementation guards.

The editor is a dedicated workspace, separate from the Step 1/2 form shell. A
compact app header, left clip navigation, large left playback, contextual work
area/inspector and a bounded layer-timing view should use the available window.
Camera retains a visual source crop picker and the exact composed playback.
Controls remain grouped consistently; not every control must be simultaneously
visible. The latest owner revision moves editor actions to the top bar and
replaces the original footer/Apply/Discard proposal with autosave and history.

## Competitor research, checked 2026-11-10

- [Descript layout controls](https://help.descript.com/hc/en-us/articles/37508206076429-Manage-the-editor-layout-with-the-View-menu):
  panel visibility, scene-editor placement and an expandable/collapsible timeline.
  Adapt progressive disclosure and usable preview area; do not add text-to-cut.
- [CapCut desktop workflow](https://www.capcut.com/resource/how-to-use-capcut-on-pc):
  clear media, preview, contextual editing and export stages. Adapt selection-to-
  inspector continuity and familiar layer timing; do not import its extra tools.
- [Adobe Express layer timing](https://www.adobe.com/learn/express/web/adjust-video-timing):
  selecting a layer reveals its timing and properties. Adapt the direct link
  between preview selection, layer row, clock and active inspector.

These are original design proposals informed by those sources, not copied
screens, a benchmark, or a claim that visual mockups prove usability.

## Capability preservation map

| Area | Required access and invariants in any later redesign |
| --- | --- |
| Intake | Upload/drop, local YouTube quality/range/download, source previews and thumbnails, local source/draft recovery, progress/cancel/retry; hosted stays upload-only and temporary. |
| Choose moments | Source playback, manual Start/End with Capture, Add clip, Suggest clips opt-in/count/duration and existing bounds, timestamp import/export, Add clips / Your clips, retained cards, rename/remove and Jump to source; explicit processing only. |
| Framing | Local-only Vertical framing (9:16) / No tracking · Fit original; tracked default and enforced hosted tracked processing. |
| AI-first editing | Prepared camera/captions/visuals/Hook/title remain the starting point. Existing explicit generation/discovery, availability and retry gates remain; no chat or automatic new inference. |
| Captions | Style/presets, placement, animation, word text corrections and speaker colors/assignment; independent Hook/body ownership and existing caption generation gates. |
| Text | Opening/Hook titles and manual text layers, style/emphasis, timing, positioning/resizing and deletion. |
| Filters | Existing timed look/filter controls with selected target and Hook/body scope. |
| Media | Pictures/Videos/Audio upload/delete, real thumbnail/loading/failure states, layer ordering/visibility intervals, position/size, contain/cover/full-frame/inset, independent source/display trims and Capture, picture audio and per-video mute/volume. |
| Camera | Explicit original/picture/video target, matching named selection and clock in every preview; visual crop/endpoint picking; original camera/people, Zoom, Pan, Face tracking and transitions with existing applicable target rules. Motion/effects stay here, not in Media. |
| Audio | Original volume, uploaded/cue/music options, timing, trim, gain/mute/loop where supported, actual audition and its existing availability rules. |
| Hook | Suggested/manual range and Capture, incomplete-range guards, independent lead-in/body edits, explicit title/audio opt-ins, title preview/failure/retry without automatic Hook application. |
| Preview and persistence | Playback/seek/fullscreen, actual scaled gestures, selected layer/crop inspection and timestamp synchronization, local drafts/rolling recovery and reopen, preserved sources/edits/exports; preview/export match. The new owner direction replaces explicit Apply/Discard with validated autosave and action-history Undo/Redo. |
| Export and workflow | Prepared/queued/exporting readiness, honest indeterminate vs measured progress, cancel/explicit retry, MP4/download and existing output naming, Add more clips, session menu/Start over and tour/help. |

The timing view represents existing bounded layers/effects within one selected
clip. It must not imply arbitrary source cutting/reordering, merging clips,
multi-video montages, new aspect-ratio outputs, direct publishing, cloud storage,
collaboration/accounts, arbitrary keyframes or unsupported export settings.
Manual Pan and marked-head Face tracking remain distinct.

## Initial requested image set (superseded by the owner revision above)

1. **Studio / Media:** recommended full-window workspace, large left composed
   playback, clip navigation, Pictures/Videos/Audio, selected-layer properties and
   bounded timing. Show independent picture/video layers and mute/volume.
2. **Review / Captions:** alternative, calmer layout with large left playback,
   readable word corrections/transcript and contextual caption styling; retain
   access to the same six main sections and timing without a complex NLE toolbar.
3. **Camera detail:** show the recommended workspace with Video 1 selected,
   source crop picker, separate Zoom / Pan / Face tracking / Transitions access,
   corresponding big-preview crop/clock and Apply/Discard action state.
4. **Workflow continuity:** supporting concept board for source intake, moment
   selection and an export state. Keep AI-first/manual paths discoverable and
   editor mode visually distinct from intake. Export uses supported MP4 behavior.

Use fictional conversation text/media and synthetic sample thumbnails only.
Generate with the built-in tool, without API keys, application provider calls or
paid clip processing. These are static mockups: no functionality, responsiveness,
AI output quality or preview/export parity is proven by image generation.

Keep images outside Git in the owner's Codex visualization directory and show
them inline. Record final prompts, source inspiration, coverage/tradeoffs and
actual output paths here. Review the images for left-preview placement, identity,
hierarchy, readable controls, missing functions and unsupported affordances.
If generated text or controls are imperfect, identify that instead of treating
them as an implementation specification. Existing fake/no-key mechanics and
real processing's provider/runtime/live-approval requirements remain unchanged.

## Round 2 outputs and review — 2026-11-10

Generated exactly three final Home/Media/Camera images with the built-in Codex
image-generation tool. Home is the master screenshot; Media was generated as an
edit of Home and Camera as an edit of Media, locking the common shell. The top
bar, far-left clip list/Add, large left playback, fictional footage/mug/title/
caption, 18s clock, seven tab positions and right inspector boundaries match
across the set. All three omit the bottom action/navigation bar, project-title
header, Apply/Discard and manual Save draft. The Home image shows bounded camera
positions/effects, visual layers and audio timing; Media retains separate layout/
volume/trim controls; Camera retains distinct Pan and Face tracking with crop
pickers and matching selected-media timing. This is a static visual review only.

Final files and exact prompt set are retained outside Git in the Codex
visualization directory; absolute links are delivered in chat:

- cl273-r2-home.png
- cl273-r2-media.png
- cl273-r2-camera.png
- CL-273-round-2-prompts.md

Generated details are illustrative: reuse the actual existing brand mark in
implementation; row labels, footage, sample timing and icon shapes are not a
new data contract. The original-video foundation remains fixed/read-only even
where the Media image draws generic reorder arrows. Do not implement those
arrows for the original source. Crop diagrams are not mathematical evidence of
preview/export agreement. Saved/Undo buttons depict requested future behavior,
not working autosave/history. Tour, product motion/demo film and landing revision
are explicitly recorded as dependent future work. Intake/selection/export and
responsive, loading/error/keyboard states still need a later approved design pass.

Only documentation and external mockup artifacts changed. No app/code/config,
owner media, running service, provider processing, paid clip run, model install,
deployment or Voyagenda work. Documentation formatting/diff checks are the
applicable verification; runtime tests would not validate these static proposals.
No staging/commit is included. Owner direction/implementation approval remains
open; all current AI/manual capability preservation requirements stay binding.

## Scope boundaries

No app code/configuration or running service changes, no owner clip/media edits,
no new paid processing, model/runtime installation, deployment, push or Git
mutation is part of this request. Preserve the running app and Voyagenda. A later
owner-selected direction needs explicit implementation work, responsive and
keyboard/feedback states, component reuse and regression acceptance against the
capability map before replacing the current authoritative layout.

## Original whole-file commit allocation — f636e1f

Every path below belongs to CL-273; no hunk staging or unrelated work is included.
The removed capture script is included as a whole-file deletion. No push.

```text
apps/backend/local/hosted-workflow.test.ts
apps/frontend/README.md
apps/frontend/package.json
apps/frontend/public/product-film/analysis.png
apps/frontend/public/product-film/build.png
apps/frontend/public/product-film/candidates.png
apps/frontend/public/product-film/intake.png
apps/frontend/public/product-film/preparation.png
apps/frontend/public/product-film/render.png
apps/frontend/public/product-film/result.png
apps/frontend/public/product-film/review.png
apps/frontend/public/product-film/selected.png
apps/frontend/public/product-film/source.png
apps/frontend/scripts/capture-product-film.mjs
apps/frontend/scripts/capture-workspace-film.mjs
apps/frontend/scripts/delivery-assets.json
apps/frontend/src/features/local-editing/README.md
apps/frontend/src/features/local-editing/acquisition-panel.tsx
apps/frontend/src/features/local-editing/audio-inspector.tsx
apps/frontend/src/features/local-editing/bulk-head-motion-editor.tsx
apps/frontend/src/features/local-editing/camera-motion-editor.tsx
apps/frontend/src/features/local-editing/camera-preview-video.tsx
apps/frontend/src/features/local-editing/caption-text-editor.tsx
apps/frontend/src/features/local-editing/clip-batch-panel.tsx
apps/frontend/src/features/local-editing/clip-editor.tsx
apps/frontend/src/features/local-editing/compact-editor-playback.tsx
apps/frontend/src/features/local-editing/contextual-feedback.test.tsx
apps/frontend/src/features/local-editing/edit-history.test.ts
apps/frontend/src/features/local-editing/edit-history.ts
apps/frontend/src/features/local-editing/editor-camera-request.ts
apps/frontend/src/features/local-editing/editor-choice-grid.tsx
apps/frontend/src/features/local-editing/editor-color-control.tsx
apps/frontend/src/features/local-editing/editor-controls.css
apps/frontend/src/features/local-editing/editor-inspector-layout.tsx
apps/frontend/src/features/local-editing/editor-overview.tsx
apps/frontend/src/features/local-editing/editor-preview-form.ts
apps/frontend/src/features/local-editing/editor-save-tools.tsx
apps/frontend/src/features/local-editing/editor-sections.ts
apps/frontend/src/features/local-editing/editor-timeline.test.tsx
apps/frontend/src/features/local-editing/editor-timeline.ts
apps/frontend/src/features/local-editing/editor-tour-layout.ts
apps/frontend/src/features/local-editing/editor-tour-preference.ts
apps/frontend/src/features/local-editing/editor-tour.tsx
apps/frontend/src/features/local-editing/editor-workspace.css
apps/frontend/src/features/local-editing/experience.tsx
apps/frontend/src/features/local-editing/filter-inspector.tsx
apps/frontend/src/features/local-editing/focus-editor.tsx
apps/frontend/src/features/local-editing/focus-preview-controls.tsx
apps/frontend/src/features/local-editing/head-motion-editor.tsx
apps/frontend/src/features/local-editing/hook-controls.test.tsx
apps/frontend/src/features/local-editing/hook-controls.tsx
apps/frontend/src/features/local-editing/hook-title-progress.tsx
apps/frontend/src/features/local-editing/media-camera-controls.tsx
apps/frontend/src/features/local-editing/media-face-tracking.tsx
apps/frontend/src/features/local-editing/selection-panel.tsx
apps/frontend/src/features/local-editing/style.css
apps/frontend/src/features/local-editing/text-inspector.tsx
apps/frontend/src/features/local-editing/typography-fields.tsx
apps/frontend/src/features/local-editing/typography-preset-picker.tsx
apps/frontend/src/features/local-editing/use-editor-autosave.ts
apps/frontend/src/features/local-editing/visual-media-controls.tsx
apps/frontend/src/features/local-editing/workflow-actions.tsx
apps/frontend/src/features/product-film/film-camera.test.ts
apps/frontend/src/features/product-film/film-camera.ts
apps/frontend/src/features/product-film/film-choreography.ts
apps/frontend/src/features/product-film/film-timeline.ts
apps/frontend/src/features/product-film/film-workspace.ts
apps/frontend/src/features/product-film/product-film.tsx
apps/frontend/src/features/sample/sample.module.css
apps/frontend/src/features/sample/sample.test.tsx
apps/frontend/src/shared/ui/workflow-frame.tsx
apps/frontend/src/shared/ui/workflow.module.css
apps/frontend/src/shared/ui/workflow.test.tsx
apps/frontend/src/shared/ui/workspace.module.css
apps/frontend/src/shared/ui/workspace.tsx
docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
docs/tickets/CL-273-full-window-editor-design-exploration.md
docs/tickets/README.md
packages/contracts/local/text-ranges.test.ts
packages/contracts/src/browser-diagnostic.schema.ts
test/app-image.test.ts
test/local-camera-motion-editor.proof.ts
test/local-editor-autosave.proof.ts
test/local-editor-tour.proof.ts
test/local-focus-editor.proof.ts
test/local-head-motion-editor.proof.ts
test/local-hook-options.proof.ts
test/local-timestamp-exchange.proof.ts
test/local-workspace-layout.proof.ts
test/owner-broll-browser-fixture.ts
test/owner-controls-browser.ts
test/owner-feedback-browser-fixture.ts
test/owner-hook-browser-fixture.ts
test/owner-media-camera-acceptance.ts
```
