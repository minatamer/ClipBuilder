# CL-206 — Numbered Zoom/Motion previews and tracking all speakers

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Owner real-head/visual and hosted/Linux acceptance open.

## Owner request and authority

Keep the numbered source/camera frame from Camera and People visible in Zoom and
Motion so the owner can identify each person. Add a single local action to
prepare head-follow Motion for all speaker camera intervals instead of manually
marking every interval. Document, execute and validate. Dependencies CL-203
manual Motion and CL-205 stable automatic person IDs are locally implemented.
Preserve all existing CL-197–205 work, saved clips/assets/outputs, configuration
and normal Codex app. No real AI, downloads, cloud, deployment or Git mutation.

Source-of-truth authority: shared numbered focus controls, anchored processing
footers, explicit Apply/Discard, manual Motion clocks/bounds and stable person
reuse. Bulk scope is the current clip's complete body and Hook, not other clips
or automatic tracking during preparation. Anonymous existing head boxes seed
classical local pixel tracking; no face recognition, new model or inference.

## Acceptance and decisions

- One numbered source preview stays visible in all four Focus tabs. In Zoom/
  Motion it follows the current source clock (including Hook mapping) and shows
  the relevant person/camera without accidental camera-position edits. Selecting
  a numbered person stays consistent with Motion's person selector. Manual seed
  editing keeps a clear source frame and person context. Mouse, touch, keyboard,
  loading, desktop and narrow footer geometry remain usable.
- Motion offers Add to all speakers; the anchored footer's explicit Track all
  performs the work. Preflight describes eligible intervals and exclusions. Use
  current person's latest covering head observation at each camera start, split
  at camera boundaries and the existing thirty-second limit, and never carry
  tracking across a hard cut. Continue adjacent chunks of the same shot from the
  last successful tracked center. Hook/body clocks stay independent.
- Preserve existing Motion and Zoom; process uncovered ranges only. Do not guess
  a head from a custom/null camera, absent observation or invalid head box.
  Report skipped/short/unseeded ranges and lost/failed intervals clearly. Never
  switch/reacquire another person after loss or automatically retry an interval.
- Keep the existing twenty-path and thirty-second finite limits. Preflight
  refuses a plan that cannot fit all eligible intervals before decoding, rather
  than silently truncating it. Optional predecessor links keep adjacent chunks
  continuous in preview/export without changing those bounds or existing manual
  paths. Preserve the chain's original vertical anchor and ease only at its
  outer edges; forbid links across camera cuts/occurrences/people or failed
  paths. Explicit replacement/removal detaches followers safely.
- Run one local sampler at a time, with total progress, current person/interval
  and an enabled scoped Cancel. Accumulate results privately; cancellation or
  unmount discards only this run's new results. Existing paths are unchanged.
  Successful/partial usable paths enter the ordinary dirty draft once at the end
  for preview and explicit Apply/Discard. Saved/recovery/native exports use
  existing validated numeric paths, with zero re-tracking or provider work.
- Validate interval planning, overlaps/bounds, clocks/chunking, seed choice,
  capacity, sequential execution, progress, failures/loss/cancel/cleanup and
  unchanged inputs with fake injected tracking. Exercise real generated-video
  tracking through editor controls at desktop/phone, numbered previews/person
  selection, Hook/body, cancellation, Apply/Discard/reopen and zero processing
  calls. Reuse existing manual Motion/Zoom proofs and relevant unit/static
  gates. Read-only validate/fix until no actionable findings. Shared
  continuation math requires a current-source native proof and verified idle
  worker rebuild/reload, preserving the frontend and comparing complete
  content-free owner clip hashes.

## Evidence and gates

Implemented surfaces:

- `focus-editor.tsx` keeps the numbered source view in all four tabs, follows
  source time in Zoom/Motion and prevents position edits there. Person selection
  and `focus-preview-controls.tsx` share the real presentation/source clock.
- New `bulk-head-motion.ts` plans uncovered seeded camera intervals, excludes
  existing Motion/Zoom, preflights capacity, tracks serially with weighted total
  progress and commits results atomically. New `bulk-head-motion-editor.tsx`
  supplies preflight/progress/current person and anchored Track all/Cancel.
  `head-motion-editor.tsx` integrates it with existing Apply/Discard,
  cancellation, draft guards and preview selection. Numbered context seeks to
  each active tracking interval, including independent Hook/body occurrences.
- `camera-follow.ts` admits optional bounded predecessor links with matching
  person/source/clock/focus/complete predecessor, rejects cuts at joins and
  retains one vertical anchor with easing only at chain ends. Explicit removal/
  replacement detaches direct followers safely. Old unlinked paths are
  unchanged; native rendering uses the same math and existing graph path.
- Owning source of truth, frontend feature README, renderer guide and index.
  Existing CL-197–205 edits remain intact. Nothing staged or committed.

Produced checks:

- **104 fake/no-key/paid-off cases across eight files passed** as the final
  focused gate in 9.80 seconds: bulk planner/executor, pixel tracker, editor
  state, focus positions, shared camera-follow/motion, backend batch and
  owner-editor API tests. Covers exact Hook clocks, camera/chunk boundaries,
  seed selection, short/unseeded/custom/covered ranges, capacity before
  sampling, unchanged input, serial progress, cancellation, loss/failure without
  retry, continuous joins, safe detach, legacy paths and explicit save/rolling
  recovery/render/retry reuse of linked paths. Boundary review shrinks a
  continuation seed about the same tracked center rather than recentering a head
  near the source edge; its regression passes. A region too small to track stops
  safely.
- **Generated editor browser proof passed in 167.40 seconds** on the settled
  preview/progress wiring. Desktop/390px/320px exercise actual numbered previews
  in Zoom/Motion, source-person selector agreement without dirty camera edits,
  mouse/touch/keyboard seeding, local tracking, responsive footers, scoped
  cancel, Apply/Discard/reopen, loss, Hook/body, preserved existing Motion/Zoom
  and fully-covered preflight. During bulk work both person numbers were
  observed matching the progress/current-camera frame. A real encoded
  **32-second** generated head motion produces two linked chunks, saves them and
  restores the link on reopen. Exactly thirteen fake edit submissions and zero
  unexpected, provider or render requests. The independent manual Zoom browser
  proof also passes. No owner footage is a fixture.
- Desktop/phone generated numbered previews under
  `.local-build/evidence/cl206-{1440,390,320}-numbered.png` were inspected.
  Harness fixes wait for cancellation's normal footer before navigation and use
  an unescaped numeric label matcher inside injected JavaScript. React review
  replaced effect-driven selection synchronization/render callbacks with
  controlled preview state and event handlers; lint has no warnings.
- **Current-source native proof passes ninety comparisons** at
  24/25/30000÷1001/30/60 fps, including linked body chunks and Hook/Zoom.
  Maximum mean RGB error is 2.034/255, with source hashes/frame
  clocks/profiles/cleanup intact and zero providers. Evidence:
  `.local-build/evidence/cl203-native.json`.
- Strict contracts/local/frontend/test types, scoped ESLint/Prettier and
  `git diff --check` pass. Final read-only validate reviewed ticket coverage,
  real wiring, identity/clock/bounds, immutability, cleanup and dependency
  direction: **Meets ticket; no actionable findings**.
- Rebuilt the normal idle worker/overlay after the final continuation guard,
  verifying launcher creation times, descendants/orphans, released listeners and
  new ownership. Nine owned old processes were cleaned on the final reload;
  frontend remained running. Supervisor **20396**, backend **23352** on 4000 and
  worker **20676** on 4200 are ready; health, `/start`, sample config and
  capabilities return 200 with Codex selected/ready. Complete content-free
  hashes match for all nine clips before/after, including
  edits/assets/outputs/counters; batch is idle. Recovery metadata initially
  exceeded a short read timeout; the protected read settled before shutdown and
  the normal bounded recovery wait was used afterward. No processing or owner
  clip edit was triggered. Safe records are outside Git in
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-app-run-b66aacfb063d46f691ce1eb67999dd9b/`:
  `clip-preservation-cl206-final-{before,after}.json`, `runtime.json`,
  `backend-cl206-final.stdout.log` and `backend-cl206-final.stderr.log`.

Scope adjustment: initial frontend-only expectation was revised to add optional
shared predecessor metadata and rebuild the worker, because isolated chunk
easing/vertical anchors would otherwise create a visible dip at thirty seconds.
The packet/source of truth now document this; old manual paths and existing
bounds remain. No new model/dependency, ignored configuration read/change, real
AI, media acquisition, cloud, deployment, delegation or Git action.

Fake plans and generated/local pixel tracking need no API keys, login, new
weights or AI calls. Preparing new real Codex/Gemini clips retains existing
provider setup/live approvals. Starting bulk tracking is always an owner action;
agents verify generated media only. Difficult real-head/identity/visual quality,
physical-device, Linux/hosted/release acceptance remain owner-only.
