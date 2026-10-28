# CL-108 — correct film aspect from first paint

Owner follow-up, 2026-10-28: the film looks incorrectly proportioned immediately
after landing. Preserve the approved responsive outer size and CL-107 artwork.

## Scope and cause

The hero initializes compositionHeight to 1080. Its SVG poster therefore starts
as 16:9 inside the taller surface and letterboxes until ResizeObserver supplies
the actual height. Settled-layout browser checks missed this initial state.
CL-095–107 remain implemented, unstaged and preserved. Use execute/validate
locally; no Git mutation, provider/cloud request or deployment.

## File allocation and implementation

- `product-film-poster.tsx`, `film-identity.tsx`: render the shared opening
  primitives as CSS-responsive HTML. Width-based container units preserve
  artwork/type proportions; percentage height positions use the actual surface.
  No fixed-ratio SVG wrapper, stretching, cover-cropped text or duplicate artwork.
- `product-film-hero.tsx`: composition size starts unmeasured. Measure the actual
  surface before mounting Player, then keep its ResizeObserver updates and all
  existing visibility/asset/pause/recovery behavior. The CSS poster works before
  hydration and during delayed observer/player loading.
- `product-film-player.tsx`: use the same responsive loading poster.
- `product-film-hero.module.css`: preserve outer geometry; provide poster-only
  containment if needed, without altering normal motion behavior.
- New focused poster/hero browser tests in `test/local-film-initial.proof.ts`: verify
  server/no-JS output, delayed measurement, player mount gating, initial frames,
  responsive resize and poster-to-player geometry. Guard actual-app browser
  requests against providers/processing. Preserve owned normal app/Studio.
- Existing `test/local-film.proof.ts`: adapt only the poster's removed size prop;
  reuse actual landing integration for resize/pause/fallback regression checks.
- Frontend film README, source-of-truth landing section and this packet/index
  own the decision and actual evidence.

## Acceptance and checks

Correct full-surface geometry before JavaScript, while measurement/player loading
is delayed, at first player paint and after resize on phone/tall/landscape sizes.
Shared poster matches the settled opening without distorted speakers or clipped
copy. Keep outer dimensions stable. No unmeasured Player render. Cleanup every
test browser/listener/observer. Focused units, frontend/test types, affected lint,
format/whitespace and guarded first-paint + actual landing browser checks.

These synthetic landing visuals work with FAKE_MODE=true/no keys. Real AI needs
keys/live flags/applicable approvals and owner action; this check proves no AI
quality. Personal visual/physical-device/rights/real-AI/hosted/release acceptance
stays open. No new asset, dependency, worker/backend/contract or environment work.

## Status

Implemented and locally verified, 2026-10-28. Personal visual/release acceptance
remains open. CL-095–107 are preserved; all changes remain unstaged/uncommitted.

### Delivered fix and evidence

- Confirmed the public initial HTML used a 1920×1080 SVG/foreignObject inside
  the taller hero. The poster is now HTML/CSS using the same brand, headline and
  illustration primitives with container-width units and height-relative
  placement. Artwork remains proportional, without letterboxing or cover-cropped
  text. The poster owns its query container, independent of surrounding layout.
- Composition height starts null. A positive surface measurement enables the
  live player; ResizeObserver continues to handle later changes. Existing outer
  dimensions, asset checks, visibility, recovery and motion are unchanged.
- New guarded `test/local-film-initial.proof.ts` passed in **15.72s**. Actual
  server-rendered/no-JS poster checks pass at **1366×768, 390×844 and 1920×450**:
  full-surface poster/art, proportional square logo, expected type scaling and
  placement, and complete glyphs. The browser then holds surface measurement at
  zero while hydration/intersection effects run: the correct poster stays and no
  player mounts. Releasing the held observer mounts frame 25 with matching type/
  surface geometry. Phone resize retains that match. Desktop/phone screenshots
  were inspected; ignored synthetic evidence is `.local-build/evidence/cl108-*`.
- Existing actual landing integration passed in **78.29s**, covering the complete
  film loop, hidden/offscreen pause/resume, nine responsive viewports, navbar/
  process, keyboard, failed-asset fallback and no-JS poster states.
- **22 focused units passed** (camera/choreography/page, 3.96s). Frontend types,
  root test types, affected ESLint/Prettier and whitespace pass. The new proof's
  unneeded CDP type-suppression comment was removed after the first type check;
  test types then pass. No production change was needed for that correction.
- External/processing requests are blocked in the browser proofs; no provider
  call or private configuration/media access occurred. Owned browser resources
  close in finally; measurement observers disconnect on component cleanup.
  No native worker/backend change or rebuild was needed.

### V108-final — read-only validation

TL;DR:

- Goal: correct aspect from first paint through the poster/player handoff.
- Delivered: CSS-responsive shared poster and a measured-only player mount,
  verified before JavaScript and with delayed measurement.
- Remaining: personal visual, physical-device and release acceptance.

**Verdict: Meets ticket. No actionable findings.** Reviewed the ticket-owned
unstaged worktree over `b945401`: poster, shared primitives, hero/player, narrow
CSS/test changes and owning docs. Prior CL-095–107 changes are preserved and
excluded except direct integration.

Coverage: **Covered** server/no-JS/measurement-delayed/first-live/resize geometry,
whole type and proportional artwork, approved outer sizing, shared poster,
pause/recovery behavior and resource cleanup. **Unverified** owner personal
visual, physical-device, rights, real-AI, hosted/cloud and release acceptance.
Synthetic visuals work with FAKE_MODE=true/no keys; real AI still needs keys,
live flags, applicable approvals and owner action.

Checks: evidence above plus dependency direction, stale size props, unsafe
casts, debug output, duplicate artwork and timer/observer/request cleanup. No
full suite/build, provider/cloud action, MP4 export or Git mutation. Deviations:
none. The isolated film proof's poster API call was adapted; its unchanged motion
seeking was not rerun, while the actual-app complete loop did run.
