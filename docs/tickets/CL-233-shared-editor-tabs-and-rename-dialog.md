# CL-233 — Shared editor tabs and compact clip naming

Status: Complete locally, 2026-11-06. Dependencies: CL-230/232 layout and the existing
CL-136/229 rename contract/control are implemented. Preserve other pending work.

## Owner request and UX

Use the rounded, single-row editor navigation shown in the reference for every
editor tab group, backed by a shared component/style rather than a Focus-only
layout. Keep six main settings in one row across all selected sections; narrow
groups can scroll horizontally without document overflow. Preserve keyboard
arrows/Home/End, roving focus, ARIA relationships and busy/dirty guards. Sub-tabs
use the same rounded treatment with compact sizing and ordinary scrolling.

Remove the dedicated clip-name heading row. Put a compact name/pencil control at
the top of each small clip card on the left (owner confirmed), ellipsize long
names, and open a design-system dialog that shows the full name for editing/
submission. The owner also explicitly requires this to work on phones and
tablets, including their horizontal clip strip. Preserve touch targets, horizontal
scroll access, truncation, dialog fit and full-name editing at all sizes.
Reuse the current rename endpoint/schema, optimistic expectedName guard, error
handling and metadata-only semantics. Keep the name separate from rendered title
text; no AI, regeneration or export is triggered. Full names must remain available
in the dialog and accessible labels. Cancel/Escape restores focus, pending saves
cannot duplicate or silently dismiss, errors retain the input, and dirty editing
continues to disable rename.

Allocate ControlTabs/main settings integration, compact naming placement/controls,
owning stylesheet/dialog styles and generated fixture support as needed, this
packet/index, frontend guide and source-of-truth decisions. No new dependency,
native/contract/provider change, owner clip mutation, ignored configuration or
Git action. Use execute/validate loops with generated/fake/paid-off media only.

## Acceptance

- Codex-browser generated editor: all six main settings use identical one-row
  navigation and shared sub-tab treatment; keyboard/disabled states, selected
  labels, 1440/1366/1024/390/320 fit, independent scrolling and footer retained.
- No separate name row. Compact name truncates visually without losing its full
  value; pencil has the shared circular target. No nested interactive controls,
  accidental clip selection, playback or rename dispatch on opening/cancel.
- Dialog full-name editing, long/Unicode/invalid/blank values, Cancel/Escape/focus,
  Enter submit, pending and failure/retry. Real generated rename HTTP/readback
  preserves clip edits/assets/output clocks and exact zero AI/render calls.
- Small relevant existing tests, frontend types, scoped lint/format/whitespace
  and read-only review. Do not add CSS-mirror tests. Close generated fixture/tabs
  and reset viewport; keep the normal app and owner media/config intact.

Prepared media supports these UI mechanics without API keys. Fresh real AI
retains its existing configured provider/runtime/live approvals. Owner visual,
physical-device and assistive-technology acceptance remain manual.

## Evidence

Main settings now use the same typed `ControlTabs` component as inspector
sub-tabs, with optional icons and one shared rounded-strip style. All six main
settings stay in one row; narrow strips scroll horizontally. Existing ARIA,
roving focus, Arrow/Home/End navigation and disabled guards remain.

Every clip card owns the compact name/pencil header, including horizontal touch
navigation. The former main name row is removed. The pencil and selection button
are siblings; there are no nested buttons. Only the active card's pencil joins
the keyboard tab order; keyboard clip selection makes other pencils reachable.
The full name remains in accessible descriptions, tooltips and the dialog.

Rename uses a token-styled native modal, full saved name, input and shared
Save/Cancel footer. Opening captures expectedName for optimistic concurrency.
Pending requests disable dismissal/duplicate submission; failure retains input
for an explicit retry, and conflict advises reopening. Only metadata changes.

- Codex in-app browser checked all six main sections at 1366x650: identical
  single-row geometry, shared sub-tab appearance, no outer settings/document
  overflow and visible workspace footer. At 1440x900, Camera/People/Zoom/Motion
  retain independent left/right scroll owners, no outer Focus overflow and
  static sub-tabs. Existing preview/player and dirty guards remain.
- Responsive checks at 1024x768, 960x650, 768x1024, 390x844 and 320x568 retain
  the 9:16 preview, one main tab row, document fit and footer visibility.
  Narrow Focus panes stack. Phone End/Home reveals Hook/Captions and preserves
  focus/selection; overflowing strips use horizontal scroll without wrapping.
- Dialog checked at 1440x900, 1024x768, 768x1024, 390x844, 320x568, 844x390,
  568x320 and 320x320. The full 80-character name wraps; input/actions fit and
  targets remain at least 44px. Invalid 81-character input stays local with an
  actionable alert. In the short invalid state only the body scrolls, using the
  shared 4px scrollbar; Save/Cancel remain completely visible. Browser error log
  empty. Cancel/Close/Escape return focus to the pencil.
- Real generated HTTP rename/readback checked a Unicode name and blank Enter
  submission (restoring Clip 1). Simulated pending blocks Escape; injected 503
  retains the exact value and explicit retry succeeds. First fixture totals:
  **3 rename attempts / 2 accepted**, **0 edit requests**, **0 unexpected
  requests**, **0 plan/image/render calls**. A hash excluding only displayName
  proves all other clip/base/edit/assets/output data stayed unchanged. Two later
  layout-only fixtures each recorded all-zero requests/calls and identical data.
- Existing `test/local-responsive-editor.proof.ts` passes on the final source:
  ten viewport/touch configurations from 320x568 through 1440x900, real generated
  rename/download-name transport, clip keyboard/touch navigation, dirty states,
  readiness/failure/recovery and footer checks. Its rename selectors now target
  the selected card. The proof caught a stretched tablet preview wrapper; setting
  its desktop cross-axis alignment to start preserves its natural 9:16 height.
  The short-landscape dialog check caught clipped footer borders; content now
  scrolls within the body and its height accounts for the dialog border.
- Eleven focused existing name/timeline/Motion cases and the existing fake
  queued-clip rename case pass. Frontend and test-fixture TypeScript, scoped
  ESLint/Prettier and `git diff --check` pass. No CSS-mirror tests, new dependency,
  contract/native change or worker rebuild was required. The initial optional
  fixture-delay type error was corrected and type checking passed afterward.
- Read-only validate pass covers the settled packet code, new dialog stylesheet,
  generated fixture and narrow proof changes, docs and acceptance above:
  **Meets ticket locally; no actionable findings**. Covered: shared navigation,
  responsive card placement, dialog lifecycle/errors/concurrency, metadata-only
  transport, footer/scroll ownership and cleanup. Physical devices, owner visual
  preference and assistive technology remain unverified/manual. Earlier
  CL-225–232 changes and unrelated dirty work are preserved and excluded from
  this packet's verdict. No staging, commit or other Git mutation.
- Screenshots `cl233-desktop.jpg` and `cl233-phone-rename.jpg` are outside Git in
  this chat's Codex visualizations directory. Generated tabs closed and viewport
  reset. All three owned fixture trees exited, ports 57727/52892/58088 stayed
  released through stabilization, and verified OS-temp scratch/runtime records
  were removed. Normal backend health, frontend `/start` and `/api/sample/config`
  return 200. Owner app/media/edits/exports/configuration were untouched.

Prepared-media UI/rename works with FAKE_MODE=true and no API keys. These
generated checks do not prove live AI quality; fresh real preparation still
requires the configured provider/runtime, live flags and applicable approvals.

## Owner spacing follow-up — 2026-11-06

Status: Complete locally. The owner clarified that the horizontal gap between the
clip title and pencil is too large. Let short names take their natural width so
the pencil follows the text with the shared compact gap; retain long-name
ellipsis and the 44px circular touch target on desktop, tablet and phone.
Allocate only the name-control CSS module, this packet and index. Verify short
and long names in the generated Codex-browser fixture, dialog open/Cancel and
responsive fit; scoped format/diff review suffices for this small CSS change.
No new tests, providers, owner clip edits, service restart or Git mutation.

Changed the name's flex sizing from filling the row to natural width with
shrinking. Generated Codex-browser checks at 1440x900, 768x1024, 390x844 and
320x568 measure a 4px title-to-button gap and a 44x44 pencil target, with no
document overflow. Long synthetic names still ellipsize at desktop/phone sizes.
Dialog open/Cancel and focus return pass. Two fake rename requests exercised
long-name and Clip 1 fallback display; zero edits, unexpected requests or
plan/image/render calls. This is API-key-free styling, not real AI acceptance.

Scoped Prettier/diff checks and read-only review pass: no actionable findings.
No additional unit tests or broad suite needed for this one-property CSS change.
Screenshot `cl233-title-spacing.jpg` is outside Git in this chat's visualizations
directory. Viewport reset and working fixture tab closed; the failed optional
fixture-page tab is left to normal turn cleanup after browser policy blocked its
handle. Both generated process trees/scratch were cleaned; ports 64082/64137 are
released through stabilization. Normal app/media/configuration and prior work
are preserved. Nothing staged or committed; owner visual/device acceptance
remains manual.

## Owner rail sizing and taller preview follow-up — 2026-11-06

Status: Complete locally. Reduce the space between each card's name/pencil header and
thumbnail, shrink the clip navigation cards, and give the main clip preview more
room so it extends toward the persistent footer. Keep its 9:16 aspect ratio,
normal controls, accessible pencil target and name truncation. Desktop preview
sizing should use the actual available editor height rather than the old 16rem
width cap. Preserve usable inspector space, independent Focus scrolling, normal
error/readiness states and responsive horizontal phone/tablet navigation.

Allocate the editor stylesheet, this packet/index and narrow frontend/source-of-
truth layout notes. Verify generated desktop, short laptop, tablet and phone
layouts, card/header geometry, preview/footer fit, navigation and scroll owners.
Run the existing generated responsive proof and scoped format/diff review; no
new CSS-mirror tests, owner edits, providers, config, native restart or Git action.

Changed desktop rail tracks from 8rem to 6.5rem and horizontal cards from 10rem
to 8rem. Thumbnail top padding is 2px instead of 0.65rem, and the rail-to-preview
gap uses the shared 12px spacing. Desktop main preview tracks use the allocated
review height with at least 20rem reserved for the inspector; the existing final
remaining-height guard still handles editor notices. Content keeps the shared
8px footer gap. Phone/tablet stacking and normal 9:16 composition remain.

- Generated Codex-browser desktop 1440x900: cards are 96x219px and header-to-
  thumbnail gap is 2px. Main preview is 359.8x639.6px (previously 256x455.1px),
  ending 8px above the footer. Pencil remains 44x44 and Clip 1 fits its header.
- Checked 1366x650, 1366x500, 1920x1080 and 1024x768: aspect ratio preserved,
  preview ends 8px above the footer, no document/outer settings overflow and
  footer controls fit. At 768x1024 the bounded tablet layout retains inspector
  room; phone 390x844/320x568 retain natural workflow scrolling and 128px compact
  cards, full-width previews, touch targets and visible persistent actions.
- At 1440x900 all four Focus tabs retain independent auto-scrolling left/right
  columns with no competing outer scrollbar. Browser error log empty.
- Existing generated responsive proof passes all ten phone/tablet/desktop/touch
  configurations, including clip navigation, visible-only portrait players,
  rename transport, dirty/readiness/recovery and footer states. No new tests or
  unrelated suite needed. Scoped Prettier and whitespace checks pass. Read-only
  review of the changed layout rules and linked authority finds no actionable
  issue; earlier packet/other dirty work remains preserved.
- Screenshot `cl233-taller-preview.jpg` is outside Git in this chat's Codex
  visualizations directory. Generated fixture records zero edit/rename/unexpected
  requests and zero plan/image/render calls, with an unchanged clip hash. These
  no-key/fake/paid-off checks establish UI mechanics; fresh real AI still needs
  its configured provider/runtime/live flags and approvals. Owner physical-device
  and personal visual acceptance remain manual. No Git mutation or app restart.
  Viewport reset, generated tab closed, owned two-process tree and port 52222
  absent through stabilization, and verified temp scratch/runtime record removed.
  Normal backend health, `/start` and `/api/sample/config` return 200. Owner
  saved clips, sources, edits, exports and ignored configuration are preserved.
