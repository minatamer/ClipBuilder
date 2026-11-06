# CL-229 — Circular clip rename button

Status: Complete locally, 2026-11-06. Dependency: existing shared IconButton and clip
name controls are implemented. Preserve the separate CL-225–228 work.

## Owner feedback and scope

The pencil beside the clip title looks unnecessarily tall and should be a
circle. It currently inherits the normal button minimum height while a local
padding override leaves its width much narrower. Use the shared IconButton's
equal width/height, centered icon, quiet appearance and existing target token.
Remove the conflicting padding override. Keep the title vertically aligned and
preserve rename behavior, accessible name, tooltip, focus, disabled state and
responsive fit. No provider, contract, native worker or owner data change.

Allocate only `clip-name-controls.tsx`, its narrow rule in `style.css`, this
packet and the ticket index. Generated/fake/no-key browser checks at desktop and
phone must verify circular geometry, title alignment, keyboard focus, open/
Cancel/Escape and disabled behavior. Run scoped format/lint and inspect the diff;
do not add tests that only restate styling. Owner visual acceptance remains
manual. No AI/API keys are needed; real AI generation keeps its existing setup
and approvals. Preserve the running app and all owner media/configuration.
No Git mutation, provider call or deployment.

## Evidence

Replaced the text Button/manual pencil with the shared IconButton and removed
the local padding override. No shared primitive or rename request logic changed.

- Generated actual editor checked in the Codex in-app browser at 1440x900 and
  320x568. The button is 44x44 with the existing circular radius, centered icon
  and title-center difference below 0.01px in both views. No horizontal overflow
  on phone. Retains the existing touch target rather than narrowing it.
- Enter opens the focused name input; Cancel and Escape close it and restore
  focus to Rename clip. Accessible label/tooltip remain Rename clip. A generated
  pending filter edit disables rename; Discard restores it. No rename, Apply,
  AI or export request was submitted. Fixture counts: zero edit requests and
  zero unexpected requests; final browser error log empty.
- Scoped Prettier and ESLint pass. Read-only validation of the two code changes
  against this packet found no actionable issue; existing CL-225–228 CSS and
  other worktree changes excluded from the verdict. No new unit tests or broad
  suites were needed for this small reversible visual change. No source-of-truth
  or native-worker change/reload was required.
- Generated screenshot: `cl229-rename.jpg` under this chat's Codex visualizations
  directory, outside Git. Browser tab closed, viewport reset, temporary fixture
  process stopped, port 59123 released and verified owned scratch removed.
  Normal app/frontend/backend, owner media, names, edits and configuration were
  untouched. Nothing staged or committed. Owner visual acceptance remains manual.
