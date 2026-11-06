# CL-243 — Align shared editor form controls

Status: Complete locally, 2026-11-06. Follows CL-241–242. Physical-device,
assistive-technology and unusual-font/zoom acceptance remain manual.

The owner reports uneven Caption Style controls: oversized selects, number and
color inputs at different heights and a small unstyled opacity slider. Fix the
shared form sizing so rows stay aligned across captions, text and related editor
forms, including tablet/phone layouts. Preserve contextual stable feedback,
selection/caret, values, validation and persistent footer actions.

## Scope and acceptance

- Diagnose actual stretched label/control geometry in the generated editor.
- Use shared tokens and form rules for consistent control height, top alignment,
  label spacing and range styling. Keep responsive columns readable without
  horizontal overflow or awkward exterior scrolling.
- Verify caption/text full and selected-range typography, invalid/corrected
  numeric controls and representative related forms at laptop/tablet/phone sizes.
- Retain shared scrollbars, local errors and normal motion. No new dependency,
  contract/composition/worker change or saved-clip mutation is needed.

## Execution and verification

Worktree contains prior CL-225–242 changes; preserve them. Scope is frontend CSS
and this packet/index, with a generated existing no-key browser fixture for actual
geometry checks. Run scoped formatting/types and relevant existing feedback tests;
do not add tests that merely assert CSS text. No Git staging/commit/push, ignored
configuration, provider call, download, cloud or deployment is authorized here.
No-key/fake fixtures verify layout only; real AI quality is separate.

## Findings and evidence

Generated current-source browser reproduction measured 64.17px selects versus
44–45.38px number/color controls. Grid-stretched labels distributed remaining
space between implicit rows, producing different control tops. Shared labels now
pack from the top, form grids align items at the start, and editor inputs/selects
use the existing 44px target with border-box sizing. Native range margins are
reset and ranges use the shared action color. Mixed-color hints share their
label heading rather than inserting another grid row.

- Actual caption and whole-title typography rows have identical tops and 44px
  control heights. Selected-word typography and mixed color hints also align.
- Empty font size and correction retain every measured field/preview rectangle;
  contextual feedback and validation remain intact. Discard preserves the fixture
  baseline without any applied edit.
- Browser widths 1280, 1024, 768, 390 and 320 have 44px controls and no horizontal
  page overflow. Related Filters, Focus and Hook controls use the same height.
  Media navigation remains usable; no media mutation was performed.
- Existing contextual-feedback and text-validation suites: 26 cases pass under
  hardcoded fake/no-key/paid-off isolation. Frontend types, scoped ESLint,
  formatting and final diff whitespace pass.
- Read-only validate pass reviewed the settled ticket changes, shared selectors,
  mixed label accessibility, responsive overrides, reserved feedback and retained
  validation/provider boundaries. No actionable findings remain.
- All three generated fixture servers closed with edits 0 and unexpected requests
  0. Generated tab closed, viewport reset, temporary helper removed. Normal owner
  app/services, source/base/edits/exports and ignored configuration are unchanged.

No real inference is needed for this UI correction. Real speaker quality is
tracked separately in CL-244. Nothing staged or committed; deviations: none.
