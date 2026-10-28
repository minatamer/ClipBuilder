# CL-104 — remove market-card navigation, retain hover

Owner follow-up, 2026-10-28. Remove Explore and its arrow from the three market
cards. Cards must not navigate to external websites; retain their brand styles,
logo geometry and decorative hover lift/shine. CL-103 is locally implemented;
preserve all other pending work and the normal app.

Scope: `page.tsx` removes platform URLs/anchors/actions and uses plain content;
`page.module.css` moves card layout/hover to noninteractive surfaces and removes
unused link/focus styles. Do not add dummy buttons, click handlers, pointer
cursors or tab stops. Keep accessible logo names. Update the existing page and
guarded market proof expectations plus this ticket/index and narrow current
source-of-truth direction. Verify no card links/actions/tab stops, clicking
leaves the URL unchanged, hover still moves/shines, and desktop/phone content
fits. Run focused checks, affected lint/format/types and read-only validation.

These informational cards work API-free in FAKE_MODE=true with no keys. Real
processing still requires keys/live flags/approvals and owner action. No paid/
cloud/private configuration/media/Git mutation or deployment. Owner personal
visual/rights/physical-device/hosted/live/release acceptance remains open.

## Status

Implemented and locally validated, 2026-10-28. Removed all three external URLs,
anchors, Explore labels and arrows. Cards are ordinary list content with named
logo images and no handlers, interactive roles or tab stops. Decorative hover
lift, straightening, glow and sheen now respond directly to the card/surface.
Removed obsolete link/arrow/focus styles and retained card dimensions, brand
colors, logo aspect ratios and responsive layout.

Changed files: page TSX/CSS, existing page regression test and guarded market
proof, this ticket/index and the narrow current source-of-truth direction.
Checks: 12 page tests pass (4.64s); frontend/test types, affected lint/format and
whitespace pass. Guarded actual browser proof passes (28.55s), verifying no
market links/actions/tab stops/Explore copy, unchanged URL after a real click,
hover straightening, loaded logos, desktop/laptop/tablet/320px/390px geometry,
forced colors, no-JS and retained time animation. Zero external/processing
attempts; mutations blocked and browser closes. Inspected fresh desktop capture
under ignored `.local-build/evidence/cl104-market-*`; prior work is preserved.

Read-only V104-final reviewed this scoped unstaged change, semantic markup,
actual click/hover behavior, dead selector removal, source direction and check
evidence. Verdict: Meets ticket; No actionable findings. Requested removal,
non-navigation, retained hover, accessible logo content and local checks:
Covered. Owner personal visual/physical-device/rights/real-AI/hosted/release:
Unverified/owner-only. Deviation: none. No keys are needed for these fake-mode
visuals; real processing retains its separate keys/live flags/approval gates.
Nothing staged, committed, pushed or deployed.
