# CL-112 — once-only market-card shine and explicit independence

Owner follow-up, 2026-10-28: when scrolled into view, the three platform cards
should shine one by one as though hovered for about a second, without moving
the pointer. Play once. Remove side dots everywhere and explicitly state that
ClipBuilder is neither affiliated nor partnered with these platforms.

## Scope and allocation

Preserve CL-095–111, official logos, informational/non-navigating cards, their
roomier responsive layout, real hover and existing earnings/campaign caveats.

- New `campaign-wall.tsx`: small client enhancement around the existing server-
  rendered list. Observe each card and queue only mostly visible unplayed cards
  in document order. One card gets the visual hover state for one second; then
  it returns to rest and the next eligible card plays. Offscreen phone rows wait
  for their own entry. No replay on scroll/resize and no synthetic mouse events,
  link/button roles or tab stops. Defer starts while hidden; clean timer,
  observer, visibility listener and transient state on unmount.
- `page.tsx`: reuse existing card/logo markup as list children; explicit footer:
  ClipBuilder is not affiliated with or partnered with these platforms. Keep
  independent-platform, no-earnings-guarantee and campaign variability facts.
- `page.module.css`: share lift/straighten/glow/sheen rules between real hover
  and the transient state. One forward sheen pass, no backwards reset pass.
  Remove dot pseudo-element and obsolete responsive/forced-color overrides.
  Avoid stacking the generic section reveal on the now-enhanced card wall.
  Normal timing under every OS motion preference; no new reduced-motion gate.
- Existing `page.test.tsx` and guarded `test/local-market.proof.ts`: verify copy,
  loaded vectors/non-navigation, no dots, no offscreen/sliver activation,
  Whop→Clipster→Picsart single-card sequence without hover, actual sheen movement,
  one-second turns, no replay and phone eligibility. Retain all other market/time
  checks and inspect fresh public-only captures.
- Narrow source-of-truth market direction and this packet/index own evidence.

Focused page units, frontend/test types, affected lint/format/whitespace and
guarded fake/no-key browser proof; execute then read-only validate/fix to no
findings. No dependency, external asset, backend/worker/configuration, provider/
cloud, Git mutation or deployment. Preserve the running normal app.

These visuals work with FAKE_MODE=true/no API keys. Real AI still needs provider
keys/live flags/approvals and owner action. Personal visual/physical-device/
rights/real-AI/hosted/release acceptance remains owner-only.

## Status

Implemented and locally verified, 2026-10-28. Prior CL-095–111 work is preserved;
owner personal visual/release acceptance remains open.

### Actual evidence

- The server-rendered list is enhanced by one small client component. Each card
  must meet a 75% visibility threshold within navbar/bottom insets before joining
  the queue. Eligible cards play in document order, one at a time for 1000ms.
  Unplayed offscreen phone rows wait; completed cards do not replay on return or
  resize. Starts defer while the document is hidden. No pointer events, roles,
  controls, persistence or analytics were added.
- Real hover and the transient state share border/glow/straightening/surface
  treatment and a 0.8-second forward sheen. Rest resets the sheen offscreen
  without a reverse pass. The generic scroll reveal no longer double-animates
  the card wall; intro/disclaimer behavior and other sections remain intact.
- Removed the dotted pseudo-element and its now-unused phone/forced-color
  overrides. The footer explicitly says: “ClipBuilder is not affiliated with or
  partnered with these platforms.” Existing independent-platform, earnings and
  campaign-variability disclosures remain.
- **12 page units passed** (1.58s), including static list/logo semantics,
  non-navigation and the explicit disclosure. Frontend/test types, affected
  ESLint/Prettier and whitespace pass. No dependency, asset or configuration work.
- Guarded actual-app market/time proof: **passed, 30.12s**. It verifies no sliver/
  offscreen activation; Whop→Clipster→Picsart order without any hovered card;
  at most one active card; actual changing sheen values and roughly one-second
  turns; three completed states and no replay. On a fresh 320px visit, only Whop
  plays while the next rows are offscreen, then the remaining rows play when
  revealed. Real hover/click non-navigation, loaded logos, roomy responsive
  geometry, absent dot pseudo-elements, no-JS/forced colors and all existing time
  animation checks pass.
- Inspected fresh desktop/phone captures under ignored
  `.local-build/evidence/cl112-*`. Zero external/processing attempts; mutations
  blocked. The browser/pending interceptions close in finally. The component
  disconnects its observer/listener, clears its timer and removes transient
  decoration on cleanup. Healthy normal app services remain available.

### V112-final — read-only validation

TL;DR:

- Goal: a once-only, hover-like scroll entrance, no dots and explicit independence.
- Delivered: queued visible-card shine with no mouse simulation, retained real
  hover/non-navigation, removed dots and no-affiliation/no-partnership copy.
- Remaining: owner personal visual/physical-device acceptance.

**Verdict: Meets ticket. No actionable findings.** Reviewed the settled allocated
unstaged worktree over `b945401`, including the server/client list boundary,
queue/state/observer/timer lifecycle, CSS resets, copy, tests and owning docs.
Prior CL-095–111 changes are preserved and excluded except direct integration.

Coverage: **Covered** visible eligibility, sequence/duration, once-only behavior,
phone waiting, no mouse events/new interactions, shared real hover, forward-only
sheen, all-size dot removal, explicit affiliation/partnership wording, preserved
responsive/accessible/static content and cleanup. **Unverified** personal visual,
physical devices, rights, real-AI, hosted/cloud and release acceptance. These
visuals are API-free in FAKE_MODE=true/no keys; real AI still needs keys/live
flags/approvals and owner action.

Checks: evidence above plus dependency direction, stale selectors, unsafe casts,
duplicate brand data, debug code and cleanup. No full suite/build or unrelated
film/processing check was needed. Deviations: none. Nothing staged, committed,
pushed or deployed.
