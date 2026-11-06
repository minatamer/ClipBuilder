# CL-242 — Align moments columns and repair results layout

Status: Complete locally, 2026-11-06. Physical-device/AT and hosted acceptance
remain manual. Follows implemented CL-241.

Owner reports mismatched source/progress column heights, clipped/scrolling
loading content and a malformed results view with large gaps, wrapped headings
and horizontal overflow. Align desktop columns, remove the redundant duration/
resolution line beneath the source video and repair results spacing/sizing.
Keep the source preview useful, its playback/Capture/Jump wiring intact, and
the relevant action in the persistent footer. Adapt tablets and phones.

## Scope and acceptance

- Desktop moments columns share their top/bottom bounds; loading is contained
  and source playback stays visible while the right side can scroll as needed.
  Short laptop windows remain usable with their footer accessible.
- Remove bottom source metadata and unnecessary empty feedback gaps. Results
  count/header/Export Timestamps/cards form a compact readable column; headings
  and controls cannot be squeezed by a feedback element. No horizontal overflow.
- Preserve CL-241 stable/contextual errors, result retention/removal/export,
  manual/AI inputs, cancellation, progress polling and source timing behavior.
  Shared scroll styling and animations remain. Stack naturally on narrow screens.
- Verify generated loading, one/many/long-title result states at laptop, short
  laptop, tablet and phone sizes using Codex browser, plus focused fake/no-key
  checks/types/lint/format and read-only validate/fix. Preserve the running app
  and any owner analysis; never trigger/cancel/retry real processing to test UI.

Allocation: moments experience/selection markup and CSS, narrowly required shared
processing sizing, generated fixture, frontend guide/source of truth/ticket/index.
No contracts/backend/native/provider changes, ignored configuration or saved
source/clip edits, paid/provider/ASR/download test, Git action, cloud or deployment.
This UI fix works with FAKE_MODE=true and no API keys; normal real processing
retains its configured runtime/provider, live flags and applicable approvals.

## Findings and correction

- The source card included both redundant metadata and an empty reserved error
  row. Remove the metadata; media feedback stays in a bounded local overlay.
  Source clocks, readiness, available-window guards and native controls are intact.
- ProcessingState used width 100% with content-box padding/borders, allowing it
  to exceed its column. The shared primitive now uses border-box sizing.
- The result header was a non-wrapping flex row containing a full-width feedback
  slot. It squeezed the heading/export control and contributed to overflow.
  Heading/actions now wrap as whole controls; feedback is an anchored, bounded
  callout. Optional informational result copy does not reserve an empty row.
- Desktop moments use a definite size container, a bounded minmax grid row and
  minimum-zero columns. Long results scroll inside the right column while the
  source remains stationary. An initial max-height-only draft still let the auto
  grid row grow to content height; explicit row/item bounds fixed that before
  acceptance. Natural one-result height is retained rather than enlarging the
  video to fill all available space. The source no longer uses a sticky offset
  that could hide its heading after scrolling.
- Results sections stack within the right column. Count spacing is explicit;
  Jump/Remove retain natural button widths instead of oversized equal-width
  actions. Shared scroll tokens and normal animations remain unchanged.

## Verification and validation

- Separate generated full-application fixture uses the normal experience,
  source player, selection/progress and footer with closed fake HTTP. One manual
  result, twelve mixed/manual/long-title results and an explicitly held synthetic
  analysis exercise the actual views. The displayed stage timings are invented
  fixture values, not a real speech/model benchmark.
- At 1280×900, one-result columns share a 345.36px height. A twelve-result list
  is bounded to 579px; its content scrolls within that height and the surrounding
  frame's scroll dimensions equal its client dimensions. Focusing the last
  result scrolls the right side to 1690px without moving the source rectangle.
  Twelve results keep Process disabled; removing two enables it at ten, without
  submitting processing. Long titles wrap inside their cards.
- Generated Preparing moments at 1280×720 has matching 345.36px source/progress
  bounds and zero outer scrolling. At 1280×600 both columns fit at 263.02px;
  all four progress rows and the footer remain within their bounds. Resizing
  from a scrolled phone view to desktop resets the outer scroll extent through
  the bounded desktop layout; the source heading stays visible.
- At 1024×768 the two columns align at 320.17px. At 768×1024, 390×844 and
  320×700 results stack naturally, headers/actions remain readable and the
  footer stays accessible. Page/frame/column horizontal scroll widths never
  exceed client widths. Phone loading fits its column, exposes all four stage
  rows through the normal workflow scroll and keeps Cancel visible.
- Forty-eight focused fake/no-key cases pass across moment selection, manual
  source-time behavior and contextual feedback. Frontend types, root local
  types, scoped ESLint, selected formatting and `git diff --check` pass. No new
  implementation-mirroring tests were added for this reversible layout change.
- Read-only validate reviewed CL-242's current experience/selection/shared
  processing styles and generated fixture against these requirements, excluding
  pre-existing CL-225–241 work. Checked size containment, row/column overflow,
  input/playback handlers, contextual feedback, responsive stacking, retained
  limits/actions, privacy/provider isolation and cleanup. No actionable findings
  remain after the long-list grid bound correction.
- Final fixture: edits 0, unexpected requests 0, synthetic analyses started 3
  and closed 3 through explicit test cancellation. Earlier sizing fixtures closed
  with edits/unexpected requests/analysis dispatches 0. All fixture listeners,
  generated media/build scratch, browser tab and temporary helper were cleaned;
  viewport override reset. Generated loading/results screenshots remain outside
  Git. Normal health, `/start` and config still return 200; no normal restart or
  owner processing/cancellation/retry was performed.

No source/clip patch, ignored configuration, provider call/spend, real ASR,
remote download, contracts/backend/native change, staging/commit/push, cloud or
deployment occurred. This is an immediate UI correction, not a regeneration or
AI-quality change. Real processing retains its existing setup and approvals.
Physical-device/touch/AT, unusual fonts/zoom and real hosted acceptance remain
manual. Scope deviations: none.
