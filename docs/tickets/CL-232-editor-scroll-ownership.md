# CL-232 — Consistent editor scroll ownership

Status: Complete locally after CL-230's separate-column revision, 2026-11-06.

The owner requests that no editor section show the awkward competing outside
scrollbar seen around Focus. Audit Captions, Text, Filters, Media (pictures and
audio), Focus (Camera/People/Zoom/Motion) and Hook. Remove redundant outer
scrolling without clipping controls or shrinking usable previews. Preserve
intentional bounded collections, the shared scrollbar appearance and persistent
footer actions. Narrow screens may retain one natural workflow scroll.

Allocate the owning layout styles/wrappers as confirmed by actual geometry,
frontend guide/source of truth as needed, this ticket and index. Preserve all
other pending work, normal services, owner media and ignored configuration.
No provider, native, clock, persistence, Git or deployment work is authorized.

Verify actual scroll extents, wheel/keyboard ownership, footer and control
visibility at normal/short laptop and 390/320 widths in the Codex browser with
generated/fake/paid-off/no-key media. Exercise long lists and dirty/validation
states. Apply the smallest justified format/lint/type checks and read-only
review; do not write tests that mirror CSS. UI mechanics need no API keys;
fresh real preparation retains existing provider/runtime/live approvals.

## Evidence

Confirmed inspection findings: Captions/Text/Filters/Media scrolled their outer
`.editor-panels` wrapper. Move scrolling into each active section and use the
shared remaining-height flex/grid chain so validation banners cannot add an
outer scroll. Preserve intentionally bounded collections. A 500px-high browser
also exposed the shared frame's 27rem minimum forcing the editor document to
530px; override that minimum only for the active editor so the footer fits and
no separate page scrollbar appears. Intake/shared frame defaults remain intact.

Implemented one fixed settings wrapper with a grid row for navigation and a
bounded active section below it. Scroll belongs to the active section, rather
than the surrounding settings wrapper. The existing remaining-height editor
chain now applies to every desktop section, including banner/dirty states.
Focus retains its two independent columns when split and one scrollable section
when stacked at intermediate widths. Focus required an explicit narrow fallback
rule during verification so its content was not clipped by the fixed wrapper.
Active-section keyboard outlines paint inward and remain visible.

## Verification and review

- Generated Codex browser: all six main settings at 1366×650 and 1366×500;
  Media Pictures (selected) and Audio (long sound library) inspected separately.
  Settings wrapper and workflow have no scroll extent on desktop; active
  sections scroll as needed. The 500px document is now exactly 500px, with the
  footer at y414–483, across all six sections. No horizontal overflow. At 650,
  the footer remains y564–633. Hook shows a section scrollbar only when needed.
- Captions keyboard End moves only its active section to 360px, leaving settings
  navigation at the same y193.4 and wrapper/workflow at scrollTop zero. Audio End
  reaches 597px without moving its wrapper or workflow. Caption/filter bounded
  lists retain the owner-requested compact height and their shared scrollbars.
- Invalid Text font size disables Apply, retains the actionable validation state,
  and shrinks the active pane to 185px instead of adding outer scrolling. Its
  wrapper remains 296/296px and workflow 423/423px; footer is unobstructed.
  Discard restores the generated draft, with no saved edit POST.
- All six settings also inspected at 960×650, 1024×768, 390×844 and 320×568.
  Final 960 Focus End reaches scrollTop 910 in its 173px pane, while the wrapper
  stays 284/284px at zero and the document stays 650px. On phones the active
  panels expand naturally inside one workflow scroll; document height equals
  viewport height, fields fit, and footers stay within the viewport. Resizing
  and section changes preserve existing editor state and scroll access.
- CL-230's final split still has one left and one right owner, no outer Focus
  extent and ordinary non-sticky tabs. Screenshot `cl230-separate-column-scroll.jpg`
  updated from the final source; `cl232-section-scroll.jpg` records the normal
  section path. Both use generated media and live outside Git. Browser errors
  empty, viewport reset and the generated tab closed.
- 24 existing focused Focus/Motion/timeline cases pass, with frontend types,
  scoped ESLint/Prettier and `git diff --check`. No CSS-mirror tests, unrelated
  broad suite or native rebuild needed. Read-only review checks remaining-height
  ownership, hidden/loading/stacked paths, minimum-frame scope, focus outlines,
  footer placement, shared styling, state/provider boundaries and cleanup:
  **Meets ticket locally; no actionable findings**. No source outside the owning
  layout stylesheet/wrapper and docs was changed for these revisions.
- Five sequential generated instances recorded zero edit POSTs and unexpected
  requests; ports 51487/52843/62598/50198/53011 were released. Final owned
  two-process tree absent through stabilization; scratch and runtime record
  removed. Normal backend health, frontend `/start` and `/api/sample/config`
  return 200. Normal services, owner saved media/edits and configuration remain
  untouched; nothing staged/committed. Prior ticket changes are preserved.

These UI mechanics work with generated/fake/paid-off media and no API keys.
Fresh real preparation retains configured Codex/local-speech or hosted Gemini
setup, live flags and approvals. No live AI/processing/cloud action occurred.
Owner visual/device/assistive-technology acceptance remains manual; generated
checks do not establish real AI or physical-device quality.
