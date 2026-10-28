# CL-096 — taller responsive hero without the duplicate flow

Owner request: 2026-10-28. Remove the flow strip below the hero; How it works
already explains the flow. Use that space for a taller motion graphic.
Depends on locally validated CL-095; preserve its pending changes.

## Authority and scope

Follow [the current landing decision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#owner-landing-refinement-decision--2026-10-28).
Remove HeroFlow and exclusively used code/styles. Retain laptop copy-left/film-
right and naturally stacked phone layouts. Let film height respond to available
viewport height and column width, with bounds for short/tall screens. The actual
composition must fill the taller surface without stretching/cropping text or
adding black bars. Keep poster/fallback aligned with the player.

Own landing page/hero CSS, film surface/player sizing and responsive composition
placement. Reuse current tokens; no workflow/backend change or motion suppression.

## Acceptance and checks

- No hero flow strip or dead import/module/style remains.
- Film meaningfully uses the recovered height; no oversized blank hero gap.
- Check 320×568, 390×844, 768×1024, 1024×768, 1366×600/768,
  1440×900 and 1920×1080: readable copy, bounded frame, no horizontal overflow.
- Inspect loading, active and fallback geometry, including resize and orientation.
- Affected units/types/lint/format; read-only validate/fix until no findings.

API-free illustration works with FAKE_MODE=true and no keys; real processing
still requires provider keys/live flags/approvals and owner action. No Git
mutation, provider/cloud call, deploy or private media change. Personal visual
and release acceptance stay owner-only.

## Status

Implemented and locally validated, 2026-10-28, after CL-095 V95-1. Removed
HeroFlow and its CSS/import; the hero now has one content row. Bounded svh/cqw
sizing grows the desktop film, with natural 4:3 stacked layouts. ResizeObserver
updates the real Player canvas height; the fixed artwork stays undistorted over
a full-canvas ambient background. Poster edges blend into the same surface;
fallback size is stable. No native/shared media worker changes were needed.

Checks: 13 affected page/film units, frontend types and affected lint/format
passed. The actual fake/no-key browser proof passed on the final layout (36.09s)
with all eight specified viewport sizes, resize between stacked/split layouts,
full film playback, pause/resume, failure recovery and no-JS loading poster.
Inspected all eight hero captures plus desktop/phone poster and fallback PNGs.
A visible poster edge found during visual review was fixed and rechecked.
The canvas matches its surface and every tested page has no horizontal overflow.
Every POST/external request is blocked; zero processing/external attempts.

Read-only validate V96-1 reviewed the ticket, selected hero/page/player diff,
removed-module references, bounds, poster/fallback, resize observer cleanup and
browser evidence. Verdict: Meets ticket; No actionable findings. Coverage:
flow removal/taller responsive canvas/loading/fallback/geometry/checks Covered.
Owner personal visual/real device/rights/hosted/release acceptance Unverified.
No deviations, configuration/provider/cloud/Git mutation or deployment.
CL-095 changes remain pending and preserved.


## Final integration follow-up — V96-2

Final review extended the hero matrix to 1920x450. The viewport-height branch
could otherwise produce a canvas shorter than the original scene and crop its
heading. Added a column-relative 16:9 minimum height, allowing natural vertical
scroll on very short screens; ordinary screens retain the taller aspect.
The final 67.45s combined proof passes all nine sizes, including canvas/surface
parity, minimum scene height and no horizontal overflow. The new short-wide PNG
was inspected. Read-only V96-2: Meets ticket; No actionable findings. The earlier
poster and responsive findings remain resolved. Owner-only gates are unchanged.
