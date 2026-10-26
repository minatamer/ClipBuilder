# CL-083 — Shared dropdown arrow inset

Status: implemented and locally validated; owner personal visual acceptance
remains manual.

Owner request, 2026-10-26: dropdown arrows sit too close to the right field edge.
Give all shared editor/intake selects one reusable class with a consistent inset
and reserved text space. Cover caption, picture, focus and resolution selects in
local/hosted UI. Retain native select semantics, keyboard use, disabled/focus
states and 44px targets. Keep compact fields readable without overflow; native
forced-color rendering remains available. No new dependencies or UI flow.

Dependency: current shared editor/intake is implemented. Preserve pending
CL-080/081/082 code/docs and the owner's running caption-review session. Document
the owner's successful local caption action separately in CL-078; do not infer
other paid, hosted or export acceptance from it.

Use the existing feature stylesheet and a common select class. Remove the
resolution-only arrow implementation rather than layering two indicators. Keep
existing field colors, tokens and focus/disabled treatment; ensure mobile padding
cannot overwrite the arrow's reserved space. No backend/native/config change or
restart, paid action, Git mutation or deployment.

Verify affected lint/format/frontend types and inspect current-source synthetic
desktop/390/320 dropdowns, long selected text, focus/keyboard and disabled state.
Use existing synthetic controls/browser tooling; no new permanent test suite for
this styling-only change. Read-only final review should cover every select and
the responsive/forced-color cascade. Owner personal visual acceptance remains
manual. Fake editing needs no keys; real AI/caption paths retain their existing
provider keys, consent and applicable approval requirements.

## Evidence and final validation — 2026-10-26

All **13 selects** in `clip-editor.tsx`, `focus-editor.tsx` and
`acquisition-panel.tsx` use `select-control`, defined once in the existing shared
feature `style.css`. Token-colored CSS chevrons sit 0.875rem from the field edge;
2.5rem end padding reserves the arrow area. Compact rules adjust only start
padding. Resolution reuses the same class and no longer has a separate SVG/
positioning wrapper. Native select options/events, focus and disabled semantics
remain; forced colors restores native appearance. No backend/native reload.

- Frontend TypeScript, affected ESLint/Prettier and diff whitespace checks pass.
- Existing `test/local-focus-editor.proof.ts` passes in **65.20s**, using current
  source and synthetic replies/media. Local caption actions, editor gestures,
  saved-state controls, playback and responsive behavior retain their checks;
  no owner session, ignored environment file or paid/provider transport is used.
- A disposable current-source Workspace/WorkflowFrame preview uses the actual
  shared styles and selects at **1440/390/320**. Inspected all three synthetic
  screenshots under ignored `.local-build/evidence/cl083-selects-*.png`.
  No horizontal overflow; fields are at least 44px tall with 40px arrow clearance,
  visible focus and disabled treatment. Long animation/resolution values ellipsize
  before the arrow. Native ArrowDown changes the focused font value. Isolated
  forced-color emulation confirms native appearance and no background chevron.
  Metrics are in ignored `cl083-selects-review.json`; the preview's own browser,
  loopback server and OS-temporary bundle were closed/removed.
- Owner-reported local real Gemini caption acceptance is recorded narrowly in
  CL-078, including the distinction from key-free fictional captions. No other
  paid, hosted, export or credit-measurement acceptance was inferred.

Read-only settled-diff validation: **Meets ticket; no actionable findings**.
Covered every select, the mobile/forced-color cascade, text/arrow separation,
native interaction, removed one-off icon/import/styles and preserved option
bindings. No new control, listener, provider path, environment setting or motion
rule. Existing pending CL-080/081/082 work is preserved. No scope deviation,
staging, commit, provider call, deployment or cloud action. Owner personal visual
acceptance remains manual; no new permanent test suite was added.
