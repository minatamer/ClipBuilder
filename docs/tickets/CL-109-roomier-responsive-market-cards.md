# CL-109 — roomier market cards on tablets and phones

Owner follow-up, 2026-10-28: the three platform cards feel constricted at tablet/
phone sizes. Preserve official logos, informational/non-navigating behavior,
decorative hover and the compact three-platform section. CL-095–108 remain
implemented and unstaged; preserve all unrelated landing/film/time-card work.

## Scope and allocation

- `apps/frontend/src/app/page.module.css`: retain the desktop row; enlarge
  tablet logos/labels, use two columns with the third card full-width below
  58rem, and full-width horizontal rows below 40rem. Give logos a generous,
  undistorted slot opposite readable labels. Flatten resting rotations where
  wide cards would clip, preserving hover lift, glow and sheen. No carousel,
  horizontal overflow, new controls, website links or extra marketing copy.
- Existing `test/local-market.proof.ts`: verify the new column/row layout,
  minimum usable logo room, complete labels, no clipping/overflow, loaded
  vectors, retained non-navigation/hover and surrounding time-section behavior.
  Inspect 320/390/639/640/768/1024 and desktop views, plus no-JS/forced colors.
- Narrow market source-of-truth decision and this packet/index own decisions
  and evidence. No page markup, asset, dependency, configuration, processing,
  worker/backend or film change is needed.

Run page units, affected types/lint/format/whitespace and the guarded synthetic
market browser proof. Execute then read-only validate/fix until no findings.
Keep the healthy app running. No Git mutation, provider/cloud call or deployment.

These static cards work in FAKE_MODE=true/no keys. Real processing still needs
keys/live flags/approvals and owner action. Personal visual, physical-device,
rights, real-AI, hosted and release acceptance remains open.

## Status

Implemented and locally verified, 2026-10-28. CSS-only product change; all prior
landing/film/time work is preserved. Personal visual acceptance remains open.

### Actual evidence

- Tablets gain larger vector logos and 10px-minimum category labels. Below 58rem,
  the grid uses two roomy cards with the third spanning the next row. Below
  40rem, all three become full-width horizontal rows, with labels beside logos,
  generous padding and no competing dotted decoration. Resting rotations flatten
  for the wider cards; decorative hover lift/glow/sheen remains.
- Existing page units: **12 passed** (1.57s). Frontend/test types, affected ESLint,
  Prettier and whitespace pass. No markup, asset, dependency or API change.
- Guarded actual-app market proof: **passed, 20.60s**. Desktop plus 1024, 768,
  640, 639, 390 and 320px checks cover expected columns, full-width third card,
  horizontal/stacked phone rows, at least 90px logo room, 10px labels, complete
  label ranges and no horizontal clipping/overflow. All three vectors load with
  contain fitting. Real hover still straightens/lifts; real clicks keep the URL
  unchanged; no card links, actions, Explore copy or tab stops return.
- Desktop, tablet and phone captures were visually inspected, including 320px
  label wrapping and the 768px two-plus-one layout. Forced-color and no-JS states
  and the existing time counter/clock/timeline checks pass. Synthetic captures
  remain ignored under `.local-build/evidence/cl109-*`.
- Zero external/processing requests; mutation requests are blocked. The owned
  browser closes and pending interceptions settle in finally. Normal app services
  remain running; no credentials, private media or configuration were accessed.

### V109-final — read-only validation

TL;DR:

- Goal: remove the cramped three-column phone/tablet presentation.
- Delivered: roomier responsive cards and readable logo/label slots, with hover
  and non-navigation retained.
- Remaining: owner personal visual/physical-device acceptance.

**Verdict: Meets ticket. No actionable findings.** Reviewed ticket-owned CSS,
browser-proof changes and owning docs in the unstaged worktree over `b945401`.
Prior CL-095–108 work is preserved and excluded from the verdict except direct
integration. Coverage: **Covered** tablet/phone layout, comfortable logo width,
whole labels, vector proportions, hover, non-navigation, responsive/forced-color/
no-JS states and cleanup. **Unverified** personal visual, physical devices, rights,
real AI, hosted/cloud and release acceptance. These cards remain API-free in
FAKE_MODE=true; real processing needs keys/live flags/approvals and owner action.

Checks: evidence above; inspected breakpoint ordering, minimum-width behavior,
overflow, unused/duplicate selectors, interaction semantics and unchanged asset
references. No full suite/build or unrelated film/processing checks were needed.
Deviations: none. Nothing staged, committed, pushed or deployed.
