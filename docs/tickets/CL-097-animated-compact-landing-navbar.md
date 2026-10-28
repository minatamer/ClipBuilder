# CL-097 — smoothly compact landing navigation after the hero

Owner request: 2026-10-28. On laptop/desktop, animate the sticky navbar into a
smaller form once past the hero: logo left, Privacy and Get Started.
Depends on locally validated CL-096; preserve CL-095/096 pending changes.

## Authority and scope

Follow [the current landing decision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#owner-landing-refinement-decision--2026-10-28).
Keep the full header over the hero. After its boundary passes, smoothly animate
the pill width/height/spacing and outgoing How it works/name content; keep logo,
Privacy and CTA stable and usable. Reverse smoothly on return. Preserve phone
navigation, sticky behavior, glass tokens, anchor navigation and Privacy dialog.
Use a small landing-only client boundary with cleaned-up observers/listeners;
SSR/no-JS starts with usable full navigation. Do not alter workspace navigation.

## Acceptance and checks

- Observe hero geometry rather than a guessed scroll offset; handle resize,
  direct anchor arrival, scroll restoration and repeated boundary crossings.
- Actual browser proof samples intermediate transition geometry and reverse;
  inspect full/compact laptop and short-screen states, plus unaffected phone.
- Hidden links must not retain keyboard focus or pointer interaction. Preserve
  44px targets, logo accessible name, Privacy open/Escape/focus return and CTA.
- Affected units/types/lint/format; read-only validate/fix until no findings.
- Retain normal animation under all motion preferences per owner CL-039.

API-free landing works in fake/no-key mode. Live processing still needs keys,
enabled flags, approvals and owner action. No provider/cloud/Git/deploy changes.
Owner personal visual and release acceptance remain open.

## Status

Implemented and locally validated, 2026-10-28, following CL-096 V96-1.
LandingHeader observes the actual hero boundary at desktop widths. The glass
pill transitions width/height/padding/gap/position over 650ms; outgoing name/link
content collapses/fades/slides over 520ms. Logo, Privacy and CTA remain stable.
Phone/tablet navigation remains full. SSR/no-JS provides full navigation.
Hidden How it works is inert and aria-hidden; focus moves to home if necessary.
Observer, media and pageshow listeners are removed on cleanup.

V97-1 found one Medium boundary issue: using <= 0 could leave the header compact
when slowly returning exactly to the hero edge, because IntersectionObserver
counts edge contact as intersecting. Independently reproduced with +1/0/-1 px
browser steps, then fixed with strict < 0. The same regression now passes.
The initial keyboard harness also needed a complete Enter event; the real
Privacy button behavior was preserved.

Checks: 11 page units, frontend types, affected lint/format and the final actual
Chrome integration proof (44.03s) pass. Sampled intermediate widths forward and
reverse, verified 44px targets, inert/focus handoff, Tab to Privacy, Enter open,
Escape/focus return, Tab to CTA, direct anchor arrival, simulated persisted
pageshow, exact boundary crossings and phone/short-laptop resize. Inspected
compact/phone/short-laptop screenshots. Full no-JS header also captured. Every
POST was blocked; zero processing/external attempts; isolated browser closed.

Read-only revalidation V97-2 reviewed the settled header/CSS/page changes,
regression, responsive evidence, listener cleanup and retained CL-095/096 work.
Verdict: Meets ticket; No actionable findings. Prior boundary finding Resolved;
all local acceptance Covered. Physical devices, actual BFCache across browser
implementations and owner personal visual/rights/release acceptance Unverified.
No deviations, backend/configuration/provider/cloud/Git mutation or deployment.
