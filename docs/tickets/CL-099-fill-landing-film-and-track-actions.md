# CL-099 — fill the approved film canvas and track the action

Owner request: 2026-10-28 follow-up to CL-095-098. The current outer aspect
ratio is approved. The film interior has too much empty space: enlarge demo
frames and typography, use more expressive text placement/transitions, and add
meaningful zooms that follow mouse movement and click targets.

## Authority and dependencies

Follow [the current film direction](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#owner-landing-refinement-decision--2026-10-28).
CL-095-098 are locally implemented/validated but remain unstaged. Preserve all
23 existing changed/new/deleted files and the normal fake-mode app. This request
supersedes CL-095's restrained no-close-up camera, while keeping clear context
and the 24-second story. Execute then read-only validate/fix to no findings.

## Implementation and file allocation

- `apps/frontend/src/features/product-film/film-camera.ts`: one pure shared
  cursor/action path and bounded camera transform. Zoom toward meaningful
  clicks; keep the cursor visible and never expose blank edges inside a frame.
- `product-film.tsx` in that directory: use the actual canvas height, enlarge
  frames to nearly full width, substantially increase headline type, vary
  placement and frame-driven entrances, and enlarge build/result illustrations.
  Keep text readable during zooms; avoid lingering outgoing scene text.
- `film-timeline.ts`: refine short scene copy as needed; retain 720-frame/30fps
  walkthrough and eight-second motion test.
- `film-camera.test.ts`: meaningful continuity, cursor visibility, crop bounds,
  zoom and duration regressions. Replace superseded gentle-push expectations.
- `test/local-film.proof.ts`: isolated current-source Player fixture with seek
  controls that exist only in test scratch; no application route or debug global.
  Inspect every scene and mouse tracking on tall/landscape/mobile canvases.
  Produce ignored scene/cursor/poster captures for visual review.
- `film-identity.tsx`, `product-film-poster.tsx`, `product-film-hero.tsx`,
  `product-film-player.tsx` and only the poster rule in
  `product-film-hero.module.css`: share a pure frame/height-driven opening scene
  with a static SVG/foreignObject loading poster. A fixed bitmap cannot match
  every responsive height; the shared code keeps the opening identical without
  another raster asset or dependency. Preserve existing authoring JPEG/hash.
- Update this packet, ticket index, current source-of-truth direction and
  frontend film guidance. Reuse the existing landing proof for final integration.

## Acceptance and verification

- Keep the approved outer aspect, hero geometry, navbar and process sequence.
- Demo frames fill roughly 90% or more of canvas width; typography/illustration
  is visibly larger, including phone. No fixed-height scene floating in a tall
  empty canvas. Intentional cropped UI close-ups retain explanatory context.
- Camera follows the same pointer model used to draw the cursor, eases between
  actions and remains bounded. Show click rings, focus sweeps and purposeful
  transitions; no random angle-only holds or unreadable title overlaps.
- Use Remotion frame time only; retain silent autoplay, loop, pause/resume,
  loading/fallback, and normal motion under every motion preference.
- Run focused film units, isolated synthetic browser checks and actual landing
  integration, frontend/test types, affected lint/format and diff check.
- Inspect scene/click/phone/short-wide/poster captures; read-only validate the
  settled scoped changes and fix confirmed findings until none remain.

These are API-free synthetic visuals. They work with FAKE_MODE=true and no
keys. Real processing remains owner-operated and needs configured provider
keys/live flags/approvals. No provider/cloud request, external asset, dependency
install, MP4 export, configuration/private media change, staging/commit, push
or deployment. Owner personal visual, rights and release acceptance remain open.

## Status

Implemented and locally validated, 2026-10-28. Screen scenes span 92.5% of
canvas width and use its actual height. Headlines are 140-180 design pixels;
opening/build/result artwork fills the available space. Shared cursor geometry
now drives cover-bounded pans/zooms, click ripples and focus highlights. Opaque
light wipes replace overlapping scene fades. The review title rises from its
lower entrance to leave the click target clear. The 24-second story and eight-
second motion test remain; the approved outer dimensions are unchanged.

The responsive loading poster shares the same explicit opening frame and height
through pure React/SVG artwork. Its code-native implementation needs no raster
regeneration or new asset/hash; existing authoring JPEG/delivery hashes remain
preserved. Imports have no environment/provider/media I/O. No worker rebuild is
needed for frontend-only film changes. CL-100's independent palette request was
completed before this packet's final verification resumed.

Verification found and fixed a cursor exiting the crop during zoom-out and
excessively fast second-target travel. The pure model now keeps the complete
pointer inside the frame with eased acceleration/deceleration and continuous
positions between actions. Visual review also found the review title covering
the click action on phone; it now lifts away, and a dedicated overlap regression
passes around the click. The pinned CDP type workaround was placed on its exact
calls and the fixture always closes its listener even if browser close fails.

Final checks: 15 focused page/process/film units, frontend types, test types,
affected ESLint/Prettier and whitespace pass. Both synthetic browser proofs
passed together (73.58s): isolated current-source scene/cursor/poster captures
and actual normal landing film/hero/navbar/process/Privacy integration. The
final harness cleanup/type correction was rechecked with the isolated proof
(8.15s). Inspected all scene types at 686x549, 304x228 and 960x540, cursor target
captures and review-click clearance, plus the normal desktop/phone landing and
Privacy captures. The normal app proof covers nine responsive sizes, full loop,
hidden/offscreen pause, recovery and keyboard behavior. No external or processing
requests were dispatched; fixtures/listeners/browser are closed in finally.

Read-only validate V99-final reviewed the settled packet scope and actual
normal/isolated execution, current source camera/cursor/crop/typography,
poster sharing, duration, imports/boundaries, cleanup, unused exports, retained
CL-095-100 changes and screenshots. Verdict: Meets ticket; No actionable findings.
Previously confirmed crop/travel/occlusion findings Resolved. All locally testable
acceptance Covered. Physical devices, personal visual/rights, actual hosted,
real provider quality and release acceptance Unverified. No scope/spend/Git/
provider/cloud/configuration/private-media/deployment deviation. All work remains
unstaged/uncommitted; no MP4 export or dependency change.
