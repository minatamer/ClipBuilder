# CL-118 — clean the analysis-to-moments background

Owner screenshot, 2026-10-28: analysis loading copy/bar remain behind the forming
moment cards. Preserve shared camera/card continuity, whole text, current aspect,
timelines and pending CL-114–117 changes over landing baseline `09fb914`.

## Scope and acceptance

- `film-choreography.ts` and `product-film.tsx`: clear captured analysis content
  before visible cards form on a clean workspace background. Never reintroduce
  the old analysis capture as the next shot's crossfade layer. Hand formed cards
  to the matching moment-list capture while retaining their exact geometry and
  smooth camera; no global wipe/slide, blank whole-scene cut or new loading track.
- Focused choreography tests and existing `test/local-film.proof.ts`: assert no
  visible loading capture while cards form or persist, dense frames around both
  sides of the seam, deterministic seeking and unchanged card/camera continuity.
  Inspect phone, tall and landscape start/middle/end captures; preserve existing
  copy/cursor/portrait/loop checks. Run focused units, frontend/test types,
  scoped lint/format/whitespace; execute/validate to no actionable findings.
- Frontend film guidance and this packet/index own evidence. No raster edit,
  new capture/dependency, backend/worker/contracts/configuration or processing
  change. Preserve normal app/Studio and owned-proof cleanup. No Git/deployment.

These are API-free synthetic visuals verified fake/paid-off with no keys or
external/processing request. Real AI still requires keys/live/owner approvals;
personal visual, physical-device, real/hosted/cloud/release gates remain open.

## Status

Implemented and locally verified, 2026-10-28. The old analysis capture remained
fully visible beneath the forming card overlays, then was also used as the
next shot's prior capture. Its loading copy/elapsed bar showed through the gaps.

`film-choreography.ts` now clears analysis opacity over the 0.4 seconds before
card formation. `product-film.tsx` supplies a clean workspace gradient, excludes
analysis from the next shot's prior capture and blends the matching moment-list
capture in as the formed card overlays leave. Camera/card geometry remains
continuous at the seam. The later candidate-to-selected capture blend retains
its separate timing; no loading/old capture reappears behind those cards.

Verification actually produced:

- New guarded DOM-opacity assertion at frame 236 reproduced the defect before
  the fix (analysis capture still visible). The same assertion passes afterward.
- Focused page/camera/choreography: 23 tests passed (1.60s), including every-frame
  content clearance and the unchanged exact card/camera seam at 239→240 for
  multiple canvas heights.
- Final current-source `test/local-film.proof.ts` passed (58.77s): dense samples
  at 198/204/210/216/222/228/234/239/240/246/252/258/264 around the handoff plus
  the existing scene/transition/loop/whole-text/cursor/portrait checks, at
  686×549, 304×228 and 960×540. Analysis opacity remains zero during card
  formation/list handoff. Frame 286 verifies the later selection still blends
  smoothly instead of hard-cutting. External/processing requests remain blocked;
  the owned browser/listener closes in `finally`.
- Inspected tall/phone/wide captures at formation start, partial/full cards and
  moment-list takeover under ignored `.local-build/evidence/cl118-*.png`; no
  loading text/bar remains between cards. An earlier proof passed (59.03s)
  before the final adjacent-selection timing refinement; the final pass above
  supersedes that snapshot.
- Frontend/test typechecks, affected ESLint/Prettier and whitespace passed.
  No raster capture/edit, dependency, backend/worker/contracts/configuration,
  provider request, full root suite/build or native rebuild was performed.

V118-final: **Meets ticket; No actionable findings.** Read-only review covers
the four allocated code/test files and owning README/packet/index over
`09fb914`, excluding preserved CL-114–117 work. Covered loading-content exit,
no stale prior capture, formed-card/list blend, deterministic seeking, exact
camera/card continuity, later selection blend, responsive visual states and
cleanup. Deviation: none. No generic full-scene wipe/slide or frame track added.

The visual fix works with fake/no-key synthetic inputs; no real AI/hosted quality
is inferred. Provider keys/live/owner approvals and personal visual, physical,
rights, cloud/hosted/release acceptance remain owner-only gates. Normal app and
Studio are preserved. Nothing staged/committed, pushed or deployed.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
