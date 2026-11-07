# CL-254 — Rename the main Focus tab to Camera

Status: Complete locally, 2026-11-07. Owner requests “Camera” for the main editor tab
currently named “Focus”. Dependency-ready; preserve pending CL-247–253 work.

## Scope and acceptance

- Change the main shared tab label to Camera, including its accessible name and
  associated panel heading. Retain the existing icon, styling and controls.
- Preserve internal setting IDs, saved data and camera/people/zoom/motion logic.
  The existing Camera sub-tab remains unchanged. No copy-wide replacement of
  keyboard focus, technical identifiers or unrelated actions.
- Verify the shared mapping and a generated editor surface. This copy-only
  change needs no new tests or provider calls. Fake/no-key behavior is sufficient;
  real AI retains its separate runtime/credentials/live/approval prerequisites.
- No owner clip edit, app restart, configuration, Git mutation or deployment.

## Verification

- Changed the one shared setting label from Focus to Camera. The existing
  accessible tab/panel association inherits it; internal `focus` IDs, icon,
  styling, persistence and all four sub-tabs are unchanged.
- Updated eight existing opt-in browser drivers' literal main-tab selectors and
  expectations to Camera. No new test or unrelated “Focus controls”/keyboard
  focus/technical identifier replacement. Their full proofs were not rerun for
  this label-only change.
- Actual generated editor in the Codex browser at 1280×800: main Camera selected,
  the associated Camera panel opens the existing Camera/People/Zoom/Motion
  controls, and no page overflow. Screenshot saved outside Git. Fixture closed
  cleanly with **zero edits, unexpected requests and plan/image/render calls**;
  agent tab closed and viewport reset. Normal app/session untouched.
- Frontend TypeScript, scoped Prettier and diff whitespace passed. Read-only
  review: **Meets ticket; no actionable findings**. Copy mapping and precise
  driver substitutions preserve all existing behavior. Broader pending work is
  excluded from this verdict. No real-provider or physical-device acceptance
  claimed; fake/no-key verification is sufficient for this rename.
- Source of truth, frontend guide and index updated. No restart, configuration,
  owner media/edit change, staging, commit or deployment. Deviations: none.
