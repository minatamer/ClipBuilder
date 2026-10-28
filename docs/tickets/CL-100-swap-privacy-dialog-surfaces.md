# CL-100 — swap the Privacy dialog surface colors

Owner request: 2026-10-28 during CL-099 visual review. Swap the backgrounds of
the Privacy dialog's outer card and inner cards: brighter blue outside, darker
navy inside. This is an independent CSS-only follow-up; preserve all pending
CL-095-099 work and resume CL-099 verification afterward.

## Scope and file allocation

`apps/frontend/src/app/page.module.css` owns the outer dialog and inner lead,
disclosure grid and close control. Swap the existing gradient/material roles,
keeping shared tokens, spacing, disclosure copy, borders, dialog interactions,
motion and responsive geometry. Preserve reduced-transparency and forced-color
fallbacks. Apply to the shared Privacy component wherever it is used.

Update this ticket/index and the narrow owning privacy design decision. Add
desktop/phone Privacy captures to the existing guarded landing browser proof;
check Escape/focus return and visible/reachable close control. No new unit tests
for a palette-only edit. Affected format/diff checks and read-only validation
must pass; the final shared landing proof also checks retained work.

The dialog is API-free with FAKE_MODE=true and no keys. Real processing needs
provider keys/live flags/approvals and owner action. No Git mutation, provider/
cloud request, private media/configuration change, or deployment. Personal
visual/release acceptance remains owner-only.

## Status

Implemented and locally validated, 2026-10-28. The outer dialog now carries
the brighter blue gradient; inner lead/grid/close control reuse the previous
outer navy gradient through one scoped CSS property. Removed the now-redundant
inner backdrop saturation. Borders, spacing, copy, shared component behavior,
reduced-transparency and forced-color fallbacks remain.

The existing guarded actual landing proof passed (66.19s), including desktop
and 390px dialog captures, reachable 44px close control, Enter open,
Escape/focus return and retained landing behavior. Inspected both PNGs under
`.local-build/evidence/cl100-privacy-*`. Affected CSS formatting and whitespace
check pass; no new unit test was added for this palette-only change. All page
POST/external requests were blocked; zero processing/external attempts.

Read-only validation V100-1 reviewed this packet, the scoped CSS material swap,
fallback selectors and actual screenshots/keyboard evidence, excluding retained
CL-095-099 implementation. Verdict: Meets ticket; No actionable findings.
Local palette/responsive/keyboard coverage Covered; personal visual, physical
devices and release acceptance Unverified. No deviations, configuration/media/
provider/cloud/Git mutation or deployment. Resume CL-099 final verification.
