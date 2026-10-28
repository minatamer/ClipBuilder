# CL-101 — compact campaign platforms and animated time example

Owner request: 2026-10-28. Replace the nine-platform landing wall with three
researched, recognizable platforms including Whop and genuine high-quality
logos. Keep the market section short, then add a separate count-up time-saving
hook inspired by the local ChoreoGraph landing. Preserve CL-095–100 work.

## Authority, dependency and scope

Dependency: CL-100 is implemented with clean local validation; no remaining
implementation dependency. This packet owns both adjacent landing sections,
their responsive CSS, local public logo assets/hash allowlist, page regression
checks and a guarded actual-browser proof. Follow the source of truth §1.7 public
claims and §18.6 component inventory, updated for this owner request. Existing
hero, film, navigation, process, Privacy and application behavior stay intact.

Use Whop, Clipster and Picsart from the original nine. The research below
supports a recognizable shortlist, not a comparable worldwide top-three ranking.
Do not put a popularity rank, earnings estimate, partnership or integration
claim in the UI. State simply that brands/creators fund paid clipping campaigns.
Use the actual official site SVG geometry, locally served, with no third-party
requests. Preserve aspect ratios and provide accessible linked platform names.
Remove the obsolete nine-card layout and imitation wordmark styles.

The separate section uses an explicitly labelled **illustrative goal**, not a
measured ClipBuilder result: a five-clip batch taking 60 minutes manually versus
a 45-minute target with ClipBuilder, giving 15 minutes / 25% back. Keep the
example/target qualification beside the comparison and say actual time varies.
Do not imply hours-long uploads, a guaranteed clip count or processing speed.
ChoreoGraph's `business-statistics.tsx` supplies the one-shot, scroll-triggered
1.8-second eased count-up reference. Use existing React/browser APIs, no new
dependency. Final numbers remain in server/no-JS markup and accessible text;
animated digits are aria-hidden. Clean up observer/frame on unmount; no motion
preference suppression.

## Research and logo provenance — 2026-10-28

- [Whop Content Rewards listing](https://whop.com/content-rewards/): public
  Whop listing reports 2.5M joined (broad listing membership, not active clippers).
  [Content Rewards about](https://b4e0vdqv6zgqeqj4pfgm.apps.whop.com/about)
  reports 400K+ posting creators and says campaigns remain accessible inside
  Whop, while Content Rewards is now independently operated. Do not attribute
  its company or all its metrics to Whop. Logo: first full logo SVG in the
  official [Whop homepage](https://whop.com/) header, viewBox `0 0 119 26`.
- [Clipster](https://www.clipster.com/): 460K+ creators, $10M+ paid and 2,850+
  campaigns, all self-reported. Its campaign examples explicitly include
  clipping. Logo: official header's icon and wordmark SVG paths combined in
  their original coordinate system, viewBox `0 0 96.56 22.42`.
- [Picsart](https://picsart.io/): 150M+ monthly active users across its editing
  products, not clipping participants. Its [clipping program](https://picsart.com/earn/clipping/)
  offers approved paid campaigns. Logo: that official page's header SVG,
  viewBox `0 0 104 24`.
- [Clipping.io](https://www.clipping.io/) reports $1.5M+ paid, a lower stated
  payout milestone than Clipster. Other original names offered less useful
  comparable first-party scale evidence. These metrics are different measures;
  this selection is editorial and does not establish a definitive ranking.

Extract only SVG shapes/definitions, remove app classes and testing attributes,
resolve CSS color variables/currentColor to the official light monochrome
presentation, preserve paths, reject scripts/foreignObject/external references.
Record final hashes in the delivery manifest. This is nominative platform
identification, not evidence of logo licensing or owner release acceptance.

## Verification and gates

- Focused page SSR checks: exactly three real local logos, official links,
  disclosure, separate explicit illustrative arithmetic and accessible finals.
- Frontend/test types, affected ESLint/Prettier and whitespace checks; verify
  local SVG safety, geometry and public-asset manifest hashes.
- Guarded loopback browser proof refuses a live configuration, blocks every
  mutation/external request; inspect desktop/tablet/320px/390px layouts, all
  logos loaded and undistorted, intermediate/final count-up values and no
  replay, keyboard links and no-JS final values. Save public-only captures.
- Read-only validate/fix loop until no actionable findings on this packet.

All landing behavior works with FAKE_MODE=true and no keys. The example is not
a provider benchmark. Real AI processing needs keys, live flags, applicable
approvals and owner action; agents do not trigger it. No private media/config
change, Git mutation, provider/cloud request or deployment. Owner personal
visual/physical-device, trademark/rights and release acceptance remain open.

## Status

Implemented and locally validated, 2026-10-28. The market section is one
compact three-logo row (361px high at 1366px), with accessible official links,
local vector geometry and concise campaign/disclosure copy. Removed old nine
card geometry, faux-brand selectors, metric/callout and redundant Back to top
control; the sticky home link remains. A separate responsive section presents
the labelled five-clip goal with 1.8-second one-shot 25/60/45 count-ups, a
60-to-45-minute bar comparison, static accessible/no-JS final values and proper
observer/frame cleanup. No new dependency or provider interaction.

Changed files: `page.tsx`, `page.module.css`, `page.test.tsx`, new
`time-savings.tsx` / `time-savings.module.css`, three `public/platforms/*.svg`,
`delivery-assets.json`, new `test/local-market.proof.ts`, this ticket/index and
the two narrow source-of-truth sections. Retained CL-095–100 changes are outside
this validation scope except shared page integration.

Checks produced:

- 12 focused page/SSR tests pass (final run 1.61s); frontend typecheck passes.
- Root test typecheck passes, including the new guarded browser proof. Iteration
  caught tuple indexing and pinned CDP compatibility annotation placement in
  that proof; both were corrected before final success.
- Affected ESLint and Prettier pass; whitespace diff check passes.
- All 15 delivery assets match exact SHA-256 allowlist values, excluding the
  separate local generated film captures as the existing verifier does. All
  three new SVGs parse as inert shape/definition elements with intact viewBoxes,
  no scripts/foreignObject/handlers/external references or unresolved CSS colors.
- Final actual-app browser proof passes (16.51s): 1366 desktop, 1024 laptop,
  768 tablet, 390 and 320 phone layouts; loaded/contained logos, no horizontal
  overflow, link Tab order, intermediate/final counters on desktop and fresh
  phone load, no replay, no-JS finals and readable forced-color campaign cards.
  All mutation/external dispatches blocked, zero processing/external attempts.
  Public-only PNGs and count trace are under ignored `.local-build/evidence/`
  with `cl101-*` names; desktop and phone market/comparison plus forced-color
  captures were visually inspected. Temporary browser is closed.

Read-only V101-final reviewed the packet, current scoped worktree, asset
geometry/provenance and hashes, source-of-truth changes, actual page integration,
responsive screenshots, animation lifecycle/accessibility and check evidence.
Verdict: **Meets ticket; No actionable findings.** An inherited forced-color
caption contrast issue was caught during implementation and fixed/verified;
redundant mobile grid override was removed. Market/logos, explicit example and
arithmetic, animation, responsive/keyboard/no-JS and local gates: Covered.
Personal visual/physical-device, trademark/rights, measured performance,
real-AI/hosted and release acceptance: Unverified/owner-only. No full production
build or hosted/paid test was run for this scoped landing change.

Selection is a researched shortlist because source audience measures are not
comparable; no definitive popularity ranking is claimed. The performance hook
uses the owner's illustrative example rather than an invented measured result.
No other deviations. Nothing staged, committed, pushed or deployed; existing
normal fake-mode services, configuration and private media remain preserved.
