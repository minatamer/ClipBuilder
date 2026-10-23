# CL-030 — Give the workflow navbar responsive vertical space

Status: implemented and visually verified with synthetic content; owner aesthetic
acceptance remains open. Dependency: implemented CL-029. Owner direction 2026-10-23.

Increase the normal workflow navbar's vertical breathing room around its brand
and Privacy/Exit actions. Scale padding across device widths and keep the workflow
panel within its existing viewport budget. Preserve the existing visual materials,
button targets, focus treatment and shared local/demo shell.

Verify phone, tablet, desktop and short-height layouts with the existing synthetic
browser proof and inspect captures. This CSS change works with fake AI and no API
keys; processing configuration and real-provider keys/flags/approvals are unchanged.
No media processing, provider calls, deployment, restart or Git action is needed.

## Evidence and review

The shared sample/workflow navbar now uses fluid 10–16px block padding instead
of fixed heights, with 8px padding for short desktop/tablet windows. Its calculated
height also sets the workflow panel's viewport budget, retaining the existing
outer margins, content scrolling, action sizing and visual materials.

- Existing synthetic intake browser proof passes in **7.14 seconds**, expanded
  to 1440×900, 1024×768, 768×1024, 390×844, 320×568 and 1440×600. Navbar controls
  have 9–15.39px measured clearance from its border, no horizontal overflow occurs,
  and the main panel remains inside every viewport. Existing 44px targets, 3px
  focus, two-column/stacked intake and zero-mutation checks still pass. The initial
  measurement accidentally included the closed dialog's invisible buttons; it
  was corrected to measure only controls with visible layout boxes.
- Root test TypeScript check, focused Prettier and `git diff --check` pass.
  No broad unit/build rerun is needed for this CSS-only runtime change.
- Synthetic desktop and phone captures were inspected; captures and metrics
  remain ignored under `.local-build/evidence/cl030-intake-*.png` and
  `cl030-layout.json`. The proof drains its listener/browser and reports no
  surviving owned processes. The normal running app and other app were untouched.
- Read-only review of this ticket's two CSS changes, proof extension and index
  finds **Meets ticket — No actionable findings**. Earlier CL-028/029 work remains
  unstaged in the same worktree and is outside this narrow review.

Physical-device/owner aesthetic acceptance remains unchecked. AI stays fake and
no keys are needed for the layout or verification; real-provider quality, keys,
live approvals, real downloads and media processing were not exercised.
