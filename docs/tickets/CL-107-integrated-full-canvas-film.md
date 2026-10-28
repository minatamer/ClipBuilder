# CL-107 — integrated full-canvas film and action-only passages

Owner follow-up, 2026-10-28: prefer the result scene's integrated composition
over the repeated headline band above a framed application screenshot. Use
negative space inside the scene, purposeful camera framing, animated type and
passages with no headline. Text and important actions must remain clear of each
other. Continue recommended decisions under the owner's existing AFK direction.

## Authority and scope

Follow the source-of-truth landing direction and permanent motion policy.
CL-095–106 are implemented and unstaged; preserve them. This ticket supersedes
the fixed safe-header layout choice, retaining CL-106's shared-object handoffs,
stable close/open artwork, smooth cursor path, 24-second/eight-second timelines,
approved outer aspect, responsive poster, pause/recovery and no added track.
Exactly one packet; execute then read-only validate/fix until no findings.

## Composition and file allocation

- `film-choreography.ts`: full-canvas workspace, scene-specific copy rectangles
  and visibility windows, integrated opening/closing art and full-height build.
  Copy gives way before the next cursor action; building is an action-only
  passage. Preserve continuous shared-object projection and safe caption bounds.
- `film-camera.ts`: optional authored focus/anchor/lens framing for the film,
  keeping the existing filtered cursor path and bounded defaults. Review opens
  on its preview while copy occupies the left, then follows the cursor after
  that copy clears. No repeated arbitrary focus pulls or global scene zooms.
- `film-timeline.ts`: deliberate line breaks and selection-preview timing only;
  durations and product meaning remain unchanged.
- `product-film.tsx`: unframed full-canvas application scenes, blended scene-local
  contrast behind animated copy, varied placement and no headline in build or
  late action passages. No persistent artificial header band or full-scene wipe.
  Static soft cropping removes captured navigation/headings and blends artwork
  edges into the canvas; it does not reveal old/new scenes or mask narrative type.
- `film-identity.tsx`: blend the conversation into the full canvas with type
  beside the focal speakers; share the exact composition with the poster and
  keep close/open artwork unchanged at the loop. Preserve the existing result.
- `film-choreography.test.ts`, `film-camera.test.ts`, existing guarded
  `test/local-film.proof.ts`: verify full-canvas geometry, varied type placement,
  useful text-free intervals, copy/action clearance, lens/cursor bounds, exact
  seams, whole captions/type and responsive poster. Adapt obsolete fixed-header
  assertions to this explicit owner revision, without weakening safety checks.
- `test/local-landing.proof.ts` only if an assertion encodes the superseded
  composition; reuse its existing actual-app playback/responsive/recovery proof.
- Frontend film README, source-of-truth landing section and this packet/index:
  record the owner direction and evidence actually produced.

No new dependency, media capture, raster asset, provider/processing flow,
configuration, backend/worker/contract change or MP4 export. Existing official
assets and the normal app remain intact. No staging/commit/push/deployment.

## Checks and gates

Focused camera/choreography/page units; frontend/test types; affected lint/format
and whitespace. Guarded synthetic no-key/paid-off browser proofs with external
and processing requests blocked. Inspect phone, tall and landscape scenes,
copy entrance/exit, action-only passages and handoff triplets. Close owned test
browsers/listeners; retain healthy normal app/Studio services.

These landing visuals work with FAKE_MODE=true and no API keys. They do not
prove real processing or AI quality. Real AI needs provider keys/live flags,
applicable approvals and owner action. Personal visual/physical-device/rights/
real-AI/hosted/release acceptance stays owner-only.

## Status

Implemented and locally verified, 2026-10-28. CL-095–106 remain preserved and
unstaged. Owner personal visual/release acceptance is pending.

### Delivered composition

- The application workspace uses the full 1920-wide canvas at every responsive
  height, without the old reserved header band or bordered screenshot window.
  Static feathering removes captured navigation/headings; scene-local contrast
  blends behind copy rather than introducing a separate card or title strip.
- Upload/analysis type uses upper-left negative space; selection type occupies
  the opposite side. Review places type beside the large preview, then clears
  it before following the mouse to the footer. Lines arrive from the left with
  a short stagger. Purposeful authored framing retains the underlying mouse
  journey; review delays its visible cursor/action until the copy clears.
- Upload, analysis, selection and review each have a text-free action passage.
  The source-to-portrait build has no large headline and uses nearly the full
  height. The result keeps its established integrated side composition.
- Opening/closing artwork blends into the canvas beside its type, with more
  room around the focal speaker. The responsive SVG poster uses those same
  primitives. Exact close/open DOM artwork, pose, geometry and brand continuity
  and the typography-only loop remain verified.
- Frame review fixed a headline touching the speaker, competing captured
  headings and upload helper text covered by an oversized thumbnail. The upload
  handoff now lands on its icon before entering the source preview. Analysis
  uses a closer steady lens. Validation also removed obsolete header-viewport
  branches and duplicate portrait geometry; this cleanup preserves rendered
  geometry and was followed by the focused checks below.

### Actual checks and visual states

- Focused `film-choreography.test.ts`, `film-camera.test.ts` and `page.test.tsx`:
  **22 passed**, final **1.38s**. New checks cover varied copy positions,
  full-canvas workspace, deliberate quiet passages and optional editorial framing
  without changing the underlying mouse action. Existing every-frame bounds,
  captions, handoff and loop coverage remain.
- Frontend `typecheck`, root `tsc --noEmit -p tsconfig.tests.json`, affected
  ESLint/Prettier and whitespace checks pass. Frontend types and model lint were
  repeated after removing equivalent obsolete viewport branches.
- Guarded `test/local-film.proof.ts` and `test/local-landing.proof.ts`: both
  passed together in **120.65s** after the final visual refinements. The later
  model cleanup removes only identical rectangles/no-op branches; focused
  units/types/lint pass after it, without repeating unchanged browser behaviors.
- Isolated rendered film checks use **686×549, 304×228 and 960×540** surfaces:
  complete narrative/clip text, full-canvas screenshot geometry, varied copy and
  action-only intervals, pointer/copy clearance, dense transition samples,
  stable artwork/brand loop and shared poster. Phone/tall/landscape settled and
  transition captures were visually inspected, including opening, upload,
  analysis, selection and review. Ignored synthetic evidence:
  `.local-build/evidence/cl107-*.png`.
- The actual landing proof verifies the complete film loop, hidden/offscreen
  pause/resume, keyboard, nine responsive viewports, unchanged hero aspect,
  navbar/process behavior and asset-failure/no-JS poster states. External and
  processing requests remain blocked; test browsers/listeners close in `finally`.
  No processing, credentials, private media, cloud access or export was used.

### V107-final — read-only validation

TL;DR:

- Goal: integrate text/action on one canvas and vary the rhythm without losing
  readability or the approved transitions.
- Delivered: full-canvas product scenes, asymmetric animated type, camera-created
  negative space, text-free actions and blended opening/closing art.
- Uncertain: owner personal taste/acceptance and physical devices remain open.

**Verdict: Meets ticket. No actionable findings.** Reviewed the settled
ticket-owned unstaged worktree over `b945401`, including allocated code/tests,
poster/player integration and owning documentation. Prior CL-095–106 changes
are preserved and excluded from this verdict except their direct integration.

Coverage: **Covered** composition variety, copy/action clearance, full-height
build, camera/cursor continuity, quiet passages, whole type/captions, exact loop,
responsive poster/playback/recovery, cleanup and documentation. **Unverified**
owner personal visual, physical-device, rights, real-AI quality, hosted/cloud
and release acceptance. Local synthetic visuals remain API-free/no-key; real
AI still requires keys/live flags, applicable approvals and owner action.

Checks: evidence above; final inspection also checked dependency direction,
unnecessary old viewport branches, stale reveal/progress logic, unsafe casts,
debug output and cleanup. No full suite/build, real AI or release check was run.
Deviations: none. All work remains unstaged/uncommitted; no deployment.
