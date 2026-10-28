# CL-102 — smooth, purposeful landing-film tracking

Owner follow-up, 2026-10-28: the CL-099 camera is too jittery, fast and busy.
Track the mouse continuously, centering it where source bounds permit; remove
the bottom frame progress/loader overlay. Preserve readable text throughout
smooth, connected transitions instead of repeated cuts or plain fades.

## Dependency, authority and allocation

CL-095–101 are locally implemented and validated, with owner visual feedback
still active. Preserve all pending work and the healthy app. Follow the
source of truth's owner landing refinement decision, updated for this request.
Use the execute/validate loop on this packet only; no Git mutation or deployment.

- `film-camera.ts`: replace the oscillating eight-point zoom and repeated
  cursor fades with one continuous eased cursor path, longer useful travel,
  a modest monotone zoom and deterministic filtered camera follow. Center the
  pointer where possible; bounded framing must retain its click/label area and
  never reveal empty image edges. Hold the analysis screen steady.
- `product-film.tsx`: remove the added frame-bottom progress track. Remove
  entrance rotations, title masking and the review title's cross-frame flight.
  Keep headline/detail copy in a safe dedicated region outside the camera.
  Replace bright clipping wipes with a slow connected parallax handoff; time
  outgoing/incoming text separately so sentences never overlap or get sliced.
  Preserve the large demo frames and approved outer canvas. Useful UI close-ups
  may crop inactive page areas; active controls and narrative copy must remain
  whole. Do not modify actual app loading/progress controls or capture assets.
- `film-identity.tsx`: allow independent text timing for transitions while
  preserving the shared responsive poster. Remove gratuitous card rotation
  and idle scale oscillation. Optional props retain static poster defaults.
- `film-camera.test.ts`, `test/local-film.proof.ts`: update superseded camera
  expectations; sample every frame for speed/acceleration, coverage, pointer/
  label safety and continuous target travel. Seek all scene boundaries in the
  current-source isolated Player at landscape, tall and phone sizes, inspect
  text bounds/overlap, new transitions and absence of the added bottom track.
  Capture public synthetic evidence. Reuse the actual landing integration
  proof `test/local-landing.proof.ts` for normal loop/pause/poster/responsive
  behavior; fix its confirmed navigation-cancellation interception race while
  retaining strict external/mutation blocking and surfacing other failures.
- Source of truth, frontend film README and this ticket/index own the new
  direction and actual evidence. No other product behavior changes.

## Acceptance and checks

One useful tracking move per mouse journey; no zoom reversals or repeated
focus pulls. Cursor and camera share the same deterministic frame path. Motion
has eased starts/stops, bounded first/second differences and no jumps at action
boundaries. No added horizontal frame progress overlay. Narrative text is whole,
legible and separate from camera crops; active UI targets remain visible.
Connected transitions move gently and retain clean text with no bright wipe.
Keep the 24-second story, eight-second style study, silent autoplay/loop,
loading/fallback and poster geometry, with normal motion under all preferences.

Run focused film/page checks, frontend/test types, affected lint/format and
whitespace; inspect isolated scene/action/boundary captures and the guarded
actual landing proof. Review the settled scoped work read-only and fix
confirmed findings until no actionable findings remain. Close test browser/
listener in finally and preserve normal app/Studio processes.

These visuals are synthetic and API-free: FAKE_MODE=true needs no API keys.
Real AI processing still requires provider keys, enabled live flags, applicable
approvals and owner action. No paid/cloud/real-media test, secret read, asset
recapture/export, configuration change, staging/commit/push or deployment.
Owner visual/physical-device, rights, real-AI/hosted and release acceptance remain
unchecked by local proofs.

## Status

Implemented and locally validated, 2026-10-28. The camera now shares a
continuous quintic-eased cursor path, with longer action journeys, a single
1.10–1.22 zoom and a seek-safe 25-sample symmetric follow filter. Pointer/control
bounds retain 120 source pixels on either side and 60/52 above/below. The camera
centers the pointer where source coverage permits; edge actions remain bounded
rather than zooming excessively to force exact centering. Analysis holds steady.
Cursor opacity no longer restarts at each click. Every-frame motion checks bound
camera travel below 36 design pixels/frame and acceleration below 4 pixels/frame²
across four relevant viewport heights; the tested maximum was about 32 and 3.2.

Removed the film-added six-pixel bottom progress overlay and analysis sweep.
Application-native loading/playback indicators inside the unchanged synthetic
captures remain. Screen/review headlines share a dedicated safe top region;
headline masks, flying review copy, card entrance rotations and idle zoom
oscillation are gone. Separate art/copy layers let a 0.75-second eased panel
reveal open from the center with 32-pixel parallax while whole headlines change
with nonoverlapping timing. This includes the close-to-opening loop seam.
Short UI-state blends retain continuous camera position between source captures.
The shared poster uses the same complete opening scene; approved canvas, large
frames, 24-second story and eight-second study remain.

Changed files: `film-camera.ts`, `film-camera.test.ts`, `product-film.tsx`,
`film-identity.tsx`, `test/local-film.proof.ts`, `test/local-landing.proof.ts`,
frontend README, source of truth, this packet/index. Earlier CL-095–101 work is
preserved and excluded from this verdict except shared film/page integration.

Verification:

- 16 focused film/page tests pass (final run 1.53s). They cover full-frame camera
  speed/acceleration, monotone bounded zoom, control/pointer coverage, continuous
  action travel, feasible centering, steady analysis, duration and retained page.
- Frontend and root test types pass, including separate art/copy props, shared
  poster and both guarded browser proofs. Affected ESLint/Prettier and whitespace
  checks pass. No new dependency, asset/hash, schema or runtime configuration.
- Both final browser proofs pass together (107.96s), with no unhandled errors.
  The isolated current-source Player checks 686×549, 304×228 and 960×540, all
  scenes, 20-frame sampling plus every scene/loop boundary at offsets 0/1/3/6/
  9/12/18/23 and the last frame. DOM text ranges stay inside the canvas, narrative
  copy has no mask ancestor and at most one visible headline. Added track count
  is zero. Action/click clearance and poster captures pass.
- The actual normal landing proof covers nine viewport sizes, full playback/
  loop, offscreen/hidden pause/resume, loading/fallback/no-JS poster and retained
  navbar/process/Privacy keyboard/animation behavior. Fake/live-off guard passes;
  external and processing attempts remain zero and page mutations are blocked.
- Inspected fresh `cl102-*` scene, phone, click, transition and poster PNGs under
  ignored `.local-build/evidence/`. An intermediate all-layer crossfade ghosted
  UI text; the final separate-copy/opaque-panel handoff resolves it. An initial
  combined run passed assertions but failed on a cancelled Chrome interception
  reply. The guard now handles the confirmed invalid-interception cancellation,
  tracks/settles pending replies, surfaces other active failures and closes its
  browser. The clean combined rerun verifies the correction. Isolated listener
  and browser close in finally; normal app and Studio are preserved.

Read-only V102-final reviewed this complete packet's scoped unstaged work,
current camera and action math, separate art/copy execution, actual bitmap
boundaries, text-range/transition evidence, poster integration, unchanged
capture assets, duration, motion preference policy, cleanup and documentation.
Verdict: **Meets ticket; No actionable findings.** Coverage: camera continuity,
bounds/centering, no added track, whole narrative/active controls, connected
transitions/loop, responsive/poster/playback, local safety and documentation:
Covered. Personal visual/physical-device, rights, real-AI quality, hosted/cloud
and release acceptance: Unverified/owner-only. No production export/build or
paid/cloud test was run for this frontend-only film edit. No backend/native
worker contract changed, so no worker rebuild is required.

Deviations: none. Nothing staged, committed, pushed or deployed. No private
media/configuration access or changes. API-free fake-mode visuals work without
keys; real provider processing remains separately gated by keys/live flags,
approvals and owner action.
