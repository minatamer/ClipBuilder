# CL-056 — Fit the collapsed editor to available space

Status: implemented and validated. Dependency: validated CL-055, still unstaged.

Owner request — 2026-10-23: move editor content up and avoid default scrolling
when controls are collapsed; expanded content should scroll normally and sizing
must adapt to the device/window. Authority: source of truth, **Focused local
clip editing — 2026-10-23**.

Acceptance and implementation:

- Scope compact density to the local editor view. Preserve the existing navbar,
  intake/selection/public layouts, typography, touch targets and footer placement.
- Remove the empty clip heading's vertical gap and reduce excess editor gutters.
  Size the portrait preview from the actual available workflow content height,
  bounded by its existing comfortable maximum, without hardcoded viewport/header
  offsets or JavaScript resize listeners. Preserve 9:16 and full Player controls.
- The collapsed Caption Style and Position views fit at laptop/desktop sizes
  (1366×682, 1280×600, 1440×900), with preview and actions above the footer and no
  default content/page scrolling. Responsive reflow on narrow screens remains
  readable; genuinely long/expanded controls still scroll and remain reachable.
- Extend the existing generated-media browser proof to check measured vertical
  fit, viewport resizing without media reload, expanded-control scrolling and
  footer reachability. Retain left-rail, guide, readiness and drag checks.
- Run affected types/lint/format and fake/native browser proof, inspect compact
  screenshots and perform read-only validation. No new package, service, restart,
  Git action, environment change, paid/provider/cloud or real YouTube request.

Fake AI supports these controls and native media without API keys; its AI content
is synthetic. Real AI still requires provider keys, enabled live flags and the
applicable approvals. Owner/live-media/physical-device acceptance stays CL-025.
Preserve the completed uncommitted CL-054/055 changes.

Settled evidence — 2026-10-23:

- `LocalEditingExperience` marks only its editor view. Scoped CSS makes the
  existing frame content a size container, scales the portrait column from its
  actual height with an existing 16rem cap, removes the empty clip-heading gap
  and compacts panel/field gutters. The frame content keeps normal overflow;
  no new event listener, hidden overflow workaround, smaller text or touch target.
- Existing pinned/guarded fake-paid-off runner checks pass:
  `exec tsc --noEmit -p apps/frontend/tsconfig.json`,
  `exec tsc --noEmit -p tsconfig.tests.json`, scoped ESLint on `experience.tsx`
  and `owner-controls-browser.ts`, and Prettier on the changed sources/docs.
- `exec vitest run --silent --config scripts/local-proof.config.ts
  test/owner-batch.proof.ts`: **pass, 141.10s**. New browser assertions measure
  both Style and Position, with details closed, at **1366×682, 1280×600 and
  1440×900**. Content/page excess is at most one rounding pixel; preview and
  inspector remain above the footer, tab targets stay at least 44px, and resizing
  retains the identical video element. Screenshots at all six states are saved
  privately under ignored `.local-build/evidence/cl056-compact-*`; laptop Style
  screenshots were visually inspected and show full preview/controls/footer.
- At **960×600**, expanded position geometry creates real scrollable overflow;
  its final input can scroll above the still-visible footer without video reload.
  Prior 1440/390/320 responsive, vertical-rail, active-guide, loading/retry, dirty,
  mouse/touch drag and footer checks remain intact. Fresh upload/process/edit/
  apply/native export/download/full decode/reopen still passes. Exact fake counts
  remain **5 transcription / 4 selection / 5 plan / 5 image**, native peak **1**,
  owned survivors **0**, completed cleanup. No ignored environment file/provider
  access or processing against the owner's real session.

Read-only validate on this CL-056 addition over the completed CL-054/055
worktree: **Meets ticket; no actionable findings**. Covered: editor-only density,
actual-container preview sizing, collapsed vertical fit, accessible overflow,
resizing/media identity, existing interaction and cleanup boundaries. Reviewed
source, new measured browser assertions and docs against unchanged acceptance.
No requirements weakened. Prior pending work is preserved and excluded from this
addition's implementation claim; the index remains empty.

Changed: local `experience.tsx`/CSS, existing browser proof helper, local README,
source of truth and ticket/index. No broad suite or fresh build was needed for
this scoped CSS/layout correction. Physical/non-Chromium devices, owner real-media
acceptance and live providers remain unchecked in CL-025. No restart, configuration
change, new service/dependency or stage/commit/push. Deviations: none.
