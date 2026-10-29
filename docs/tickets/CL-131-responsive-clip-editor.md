# CL-131 — Responsive clip editor

Status: locally implemented and validated; owner acceptance open.
Depends on the completed shared editor and CL-129.

## Owner decision and scope

The owner requests a horizontal touch-scrollable clip strip immediately below
the review/edit title on phones and tablets, without a visible scrollbar. Keep
the desktop left rail. Give phones a full-width portrait preview followed by
the controls, and compact the footer into one row. Tablets retain a larger
preview beside one coherent controls panel; do not split settings across panels.
Preserve clip state/readiness, dirty Apply/Discard, keyboard access, preview
gestures, exports and all media/processing limits.

Allocate frontend clip navigation, local editor CSS and the existing experience
footer, a focused synthetic browser proof and owning product documentation.
No contract/native/AI changes, paid calls, cloud access, deployment or Git action.

## Verification and acceptance

- [x] Phone/tablet strip scrolls with touch, has no visible scrollbar, and keeps
      selection visible; horizontal arrows/Home/End and desktop Up/Down work.
- [x] Full-width phone preview precedes controls; tablet uses two columns;
      desktop rail remains. No horizontal document overflow or footer overlap.
- [x] Ready, dirty, processing and failure actions remain accessible, with
      compact phone footer and preserved dirty/readiness guards.
- [x] Current-source synthetic browser/pointer proofs and relevant checks pass;
      execute/validate has no actionable findings.

All checks use synthetic media with fake AI, paid disabled and no keys. Fake
results verify layout/local processing, not live AI quality. Real AI still
requires configured provider keys, live flags, approvals and owner action.
Owner personal visual/real-device/live-AI/hosted/release acceptance is unchecked.

## Produced evidence — 2026-10-29

- `corepack pnpm local:proof -- test/local-responsive-editor.proof.ts test/local-focus-editor.proof.ts`:
  two browser proofs pass. The new proof uses the actual experience, clip panel
  and footer with ten synthetic clips, a generated MP4 and fake API transport.
  It tests 320×568, 390×844, 430×932, 768×1024, 834×1194, 1024×768,
  1366×1024 with touch emulation, and 1440×900 with a desktop pointer. Native
  touch swipes move the strip; selected tabs reveal horizontally without a
  content jump; arrows/Home/End wrap with matching ARIA orientation and focus.
  Resize, Apply/Discard, disabled dirty tabs, queued/failed readiness and reset
  recovery (Escape/focus return) pass. One fake edit, one injected failed reset
  and zero unexpected requests; all provider call counters remain zero.
- The existing focus proof passes current-source pointer gestures, playback,
  captions/speakers, Hook, preview failure/retry and saved edits at desktop and
  phone sizes. Shared composition/native processing source is unchanged.
- Fourteen existing frontend editor-state/readiness tests pass. Frontend and
  repository test TypeScript checks, scoped ESLint/Prettier and diff whitespace
  checks pass. Checks used pinned pnpm/Node through the installed runtime.
- Inspected synthetic screenshots of ready preview, full Focus controls and
  dirty actions at phone/tablet/desktop sizes, plus reset recovery. Evidence is
  ignored under `.local-build/evidence/cl131-*.png`. No real media was opened.
- The normal running app's backend health, `/start` and `/api/sample/config`
  return 200 after the edits. No backend/worker restart is needed for this
  frontend-only change; existing app processes and configuration are preserved.

Validation found and fixed the phone frame's implicit minimum column width,
which clipped content/actions without creating document overflow. The frame
now has one shrinkable column and phone actions have concise visible labels
with their full accessible names. Failed-reset actions move into a dismissible
popover instead of widening the footer. The final focused review found no
actionable issue: requirements covered, listener/observer cleanup paired,
readiness/dirty guards preserved, no new schema/boundary/spend/motion changes.
No full production build, physical iOS/Safari test or hosted/real-AI acceptance
was performed. No staging, commit, push, deployment or cloud access occurred.

Changed files: `clip-batch-panel.tsx`, `clip-editor.tsx`, `experience.tsx`,
`session-controls.tsx` and `style.css` under
`apps/frontend/src/features/local-editing/`; `test/local-responsive-editor.proof.ts`;
`apps/frontend/README.md`; the source of truth, this packet and ticket index.

Final validate verdict: **Meets ticket — no actionable findings.** Layout,
navigation, touch/keyboard use, footer recovery, state guards and synthetic
verification are covered. Physical-device/owner acceptance remains unverified.
Review scope is these ten local files and their immediate shared UI/readiness
neighbors; verification is the checks above, with no broader audit or release
acceptance implied.

The owner subsequently authorized a file-level commit plan and local staging/
commits on 2026-10-29, before the separate Media/audio work. See the
[whole-file plan](../operations/CL131_132_COMMIT_PLAN.md). Release gates remain.
