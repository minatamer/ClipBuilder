# CL-110 — visible-only time entrance and larger clock

Owner follow-up, 2026-10-28: the time animation must wait until scrolled into
view; remove the Illustrative goal badge and enlarge the clock. Preserve all
CL-095–109 pending work and the existing 60/10/5 example, arithmetic and one-shot
animation. No Git mutation, provider/cloud call or deployment.

## Cause and allocation

The old observer checked isIntersecting without checking its requested ratio,
so a first sliver could begin the animation before the metric was visible.

- `time-savings.tsx`: observe the number/clock block and require 75% visibility
  within a viewport inset for the navbar/bottom edge. Enhanced pending values,
  clock and bar remain at the coherent starting pose until then. Start once,
  including when returning from a hidden tab; retain cleanup/no replay and
  accessible/no-JS final values. Remove the visible badge and that phrase from
  the accessible label; retain what-if/Example/Target wording and its existing
  accessible non-measured qualification. Do not restore the removed footnote.
- `time-savings.module.css`: visibly enlarge the clock at desktop/tablet/phone
  sizes, keep 100% pending numbers and the clock clear of each other, and remove
  obsolete badge selectors. Retain normal motion under every OS preference.
- Existing `page.test.tsx` and guarded `test/local-market.proof.ts`: verify no
  badge, correct accessibility/static values, no pre-entry/partial-entry/hidden-
  tab animation, visible intermediate/final motion, no replay, larger clock and
  no collisions at 320/390/tablet/desktop sizes. Preserve market checks.
- Narrow source-of-truth direction and this packet/index own decisions/evidence.

Focused page units, frontend/test types, affected lint/format/whitespace and the
guarded fake/no-key browser proof; inspect current captures. Execute then
read-only validate/fix to no findings. Close browser resources, observers,
listeners and animation frames; keep the normal app healthy.

These visuals work with FAKE_MODE=true/no keys. Real AI still needs provider
keys/live flags/approvals and owner action. Personal visual/physical-device/
rights/real-AI/hosted/release acceptance remains open. No new claim, dependency,
asset, configuration or backend/worker change.

## Status

Implemented and locally verified, 2026-10-28. Prior CL-095–109 work remains
preserved; owner personal visual/release acceptance is still pending.

### Actual evidence

- The observer now watches the metric/clock block with an explicit 75% ratio
  check and fixed 80px top/48px bottom viewport insets. A card sliver no longer
  starts anything. Enhanced values hold at 100% / 60 / 60 with full ring/bar until
  entry, then share the same 2.2-second progress toward 17% / 60 / 10. The manual
  baseline stays fixed. Visibility-change handling defers a hidden-tab start;
  returning to a visible eligible block starts once. Re-entry does not replay.
- Removed the visible badge, its dead CSS and the exact phrase from the
  accessible label. What-if/Example/Target framing and the existing accessible
  non-measured qualification remain; the removed visible footnote stays absent.
- Clock width grows to 9–12rem on desktop, up to 12rem on tablet and at least
  7.5rem on phones. Browser inspection found the initial 100% only 0.9px from
  the clock at 320px; the smallest-screen number was adjusted from 4.3 to 4rem.
  Final checks verify at least 4px clearance even at that starting value.
- **12 page units passed** (1.80s), including removed-badge/accessibility/static
  arithmetic checks. Frontend/test types, affected ESLint, Prettier and whitespace
  pass. No dependency, asset, backend/worker or configuration change.
- Guarded actual-app market/time proof: **passed, 22.33s**. Explicit checks hold
  numbers and progress at their starting values with only a card sliver/25% of
  the metric visible and while the document is hidden. Visible entry produces
  intermediate numbers, clock movement and bar compression, final coherent
  arithmetic and no replay. The larger clock/number separation passes desktop,
  1024/768/640/639/390/320px plus the smallest pending 100% state. Existing market
  layout, real hover/non-navigation, no-JS and forced-color checks pass.
- Desktop/phone captures were visually inspected. Synthetic captures/traces
  remain ignored under `.local-build/evidence/cl110-*`. No-JS retains complete
  final values/artwork. Zero external/processing requests; mutation requests
  stay blocked. The test browser/pending interceptions close in finally; the
  component cleans up its observer, visibility listener and animation frame.

### V110-final — read-only validation

TL;DR:

- Goal: wait for visible entry, remove the badge and enlarge the clock.
- Delivered: explicit metric visibility gating, coherent pending pose, hidden-tab
  deferral, one-shot motion and a larger clock without number collisions.
- Remaining: owner personal visual/physical-device acceptance.

**Verdict: Meets ticket. No actionable findings.** Reviewed allocated TSX/CSS,
page/browser test changes and owning docs in the unstaged worktree over `b945401`.
Prior CL-095–109 changes are preserved and excluded except direct integration.

Coverage: **Covered** partial/offscreen/hidden entry, visible animation, no replay,
badge removal, larger responsive clock, pending/final geometry, accessible/no-JS
values, retained example arithmetic, normal motion and resource cleanup.
**Unverified** owner personal visual, physical devices, rights, real-AI quality,
hosted/cloud and release acceptance. These visuals remain API-free/no-key in
FAKE_MODE=true; real AI needs keys/live flags/approvals and owner action.

Checks: evidence above; inspected observer threshold semantics, viewport insets,
font/clock bounds, obsolete badge selectors, static fallback, stale flags, debug
output and cleanup. No full suite/build or unrelated film/processing check was
needed. Deviations: none. Nothing staged, committed, pushed or deployed.
