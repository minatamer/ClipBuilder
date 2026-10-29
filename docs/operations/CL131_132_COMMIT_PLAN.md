# CL-131/132 whole-file commit plan

Owner authorization, 2026-10-29: write the commit plan first, then stage and
commit all current validated work before planning/executing Media/audio.
Start on `main` at `9d729a4`, with an empty index and fourteen CL-131/132 paths.
This plan is the fifteenth path. Preserve the normal app, owner configuration,
media and logs. No push, cloud action, deployment or paid call is authorized.
New Media/audio implementation is outside this commit sequence.

These are dependent review commits; only their combined result carries the
recorded validation. Stage each file whole, once, under its exact allocation.

## 1. `CL-131: adapt clip editor and footer for touch screens`

- `apps/frontend/README.md`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/experience.tsx`
- `apps/frontend/src/features/local-editing/session-controls.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `test/local-responsive-editor.proof.ts`

Own responsive clip navigation, full-width phone/larger tablet previews,
compact footer/reset recovery, accessible short labels, and actual synthetic
touch/keyboard/state proofs. Preserve desktop, editing and export behavior.

## 2. `CL-132: prove hook camera and edit fidelity`

- `apps/frontend/src/features/local-editing/overlay-frame.test.tsx`
- `test/local-speaker-hook.proof.ts`
- `docs/tickets/CL-129-manual-hook-prefix.md`
- `docs/tickets/CL-132-hook-edit-fidelity.md`

Own stronger spatial camera/zoom/Y and repeated/body MP4 comparisons, shared
React edit-layer checks and their evidence. No production Hook fix was needed.

## 3. `CL-131: document responsive editor and hook verification`

- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/tickets/CL-131-responsive-clip-editor.md`
- `docs/tickets/README.md`
- `docs/operations/CL131_132_COMMIT_PLAN.md`

Own product authority, both ticket summaries, recorded checks and this plan.
Index is allocated here once because it covers both preceding groups.

## Preserved validation and packaging gate

CL-131: two current-source browser proofs, fourteen editor unit tests, frontend
and repository-test types, scoped lint/format and synthetic screenshot review
passed; normal health/start/config GETs returned 200. CL-132: two real native
MP4 proofs and four focused tests, types/lint/format passed. Final focused
validate for each reports no actionable findings. All media is synthetic,
fake/paid-off and API-free. Physical iOS/Safari, owner visual/real-media/live-AI,
actual hosted and release acceptance remain open. No broad production build
was run against the healthy dev app.

No behavior changed since these checks; packaging requires staged-name/content,
whitespace, private/generated-content and allocation review, not duplicate media
proofs. Reconcile fifteen unique paths and a clean index/worktree at the end.
Keep evidence screenshots outside Git. Do not include new research or audio code.

## Packaging record

| Group | Commit | Files |
| --- | --- | ---: |
| Responsive editor | `a597d41` | 7 |
| Hook edit fidelity | `085641b` | 4 |
| Product/ticket documentation and this plan | Final commit containing this plan | 4 |

All fifteen paths are allocated exactly once. The final group's staged review
and clean-worktree reconciliation follow this record. No push is included.
