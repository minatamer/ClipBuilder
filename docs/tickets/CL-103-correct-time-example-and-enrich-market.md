# CL-103 — correct the time comparison and enrich both landing sections

Owner correction, 2026-10-28: the intended comparison is a fraction **of** manual
time, not 25% less. Use a five-clip example of 60 minutes manually versus 10 with
ClipBuilder and round the percentage. Add time-related motion and make the
compact market card more interesting. Preserve CL-095–102 and the normal app.

## Authority and file allocation

CL-101/102 are locally implemented and validated; no implementation dependency
remains. This owner request supersedes only CL-101's illustrative arithmetic and
plain section presentation. Follow source of truth §1.7/§18.6 and its permanent
motion policy. Continue execute/validate locally, with no Git/deploy action.

- `time-savings.tsx` / `time-savings.module.css`: derive the comparison from
  60/10/5 constants: round(10/60×100) = 17% **of the time**, 50 minutes back,
  roughly 83% saved. Make the fraction-of-time framing primary. Keep prominent
  illustrative/target qualifications, accessible/static final values and actual
  time variability. Add a clock rewind, a timeline compressing to one sixth,
  countdown from 60 to 10 and a five-clip visual. One-shot viewport entrances
  remain smooth and coordinated, with observer/frame cleanup and no preference
  suppression. No-JS uses complete final values/artwork.
- `page.tsx` / `page.module.css`: retain exactly the three official local logos,
  links and market copy/disclosure. Give cards distinct brand-colored light,
  subtle stagger/tilt, campaign labels, film-strip details and polished hover/
  keyboard focus. Keep the section short and legible on phones. Decoration is
  not a live-campaign, affiliation, integration or earnings claim. No new logo
  assets, external fetches or public metrics.
- `page.test.tsx`, `test/local-market.proof.ts`: replace superseded arithmetic
  checks; verify fractional bar/ring geometry, intermediate and final animation
  states, no replay, normal keyboard links and forced-color/no-JS fallbacks at
  desktop/laptop/tablet/390px/320px. Reuse the proven guarded browser setup and
  handle cancelled request replies without masking active failures. Save fresh
  public-only captures for both sections and inspect them.
- This ticket/index and the narrow source-of-truth section own decisions and
  evidence. Preserve the film/navbar/process/Privacy and application flows.

## Checks and gates

Focused page tests, frontend/test types, affected lint/format and whitespace;
guarded fake/live-off browser check and visual inspection; read-only validation
through fix loops until no actionable findings. Check cleanup, no new dependency,
no additional claim, no clipping/overflow, official logos/aspects and preserved
responsive geometry. Personal visual/physical-device/rights/release acceptance
remains owner-only. No production export/build or live provider check required.

The time example is not a measured processing benchmark or guaranteed result.
Both sections work API-free with FAKE_MODE=true and no keys. Real AI processing
requires provider keys, enabled live flags, approvals and owner action. No
paid/cloud request, private media/config read/change, Git mutation or deployment.

## Status

Implemented and locally validated, 2026-10-28. The five-clip example now derives
all numbers from 60 manual / 10 target minutes: about 17% of the time, 50 minutes
back and approximately 83% saved. The misleading 25%-less / 45-minute example is
removed from the current UI and authority; historical CL-101 evidence remains.
The illustrative/target labels, actual-time qualification and accessible final
values stay explicit. No measured speed, yield or earnings claim was added.

One viewport observer and one 2.2-second animation frame loop coordinate the
clock winding back from 60 to 10 minutes, its full ring shrinking to one sixth,
the timeline compressing from 100% to one sixth, and the percentage rewinding
from 100% to 17%. The manual baseline stays at 60; all intermediate numbers
agree within rounding tolerance. Five small clip cards enter in sequence.
Server/no-JS markup and unsupported-observer fallback retain complete final
numbers/artwork. Observer disconnects after entry, pending frame cancels on
unmount and animations do not replay on scroll. No motion-preference suppression
or new dependency was introduced.

Market cards retain the same three official local logos and links. Warm Whop,
blue Clipster and purple Picsart light, campaign categories, subtle card stagger/
rotation, a fine grid and film-strip details replace the uniform presentation.
Hover/focus straightens and lifts a card with a moving sheen; keyboard outline
is inset so the card cannot clip it. Phone cards sit straight with compact
single-line Explore links. Disclosures and compact market height remain.

Changed files: `time-savings.tsx`, `time-savings.module.css`, `page.tsx`,
`page.module.css`, `page.test.tsx`, `test/local-market.proof.ts`, source of truth,
this packet and ticket index. Retained CL-095–102 work is preserved and outside
this verdict except the shared page/section integration. Logo files/hashes,
film, navbar, process, Privacy, backend and native-worker contracts are untouched.

Verification produced:

- 12 focused page/SSR tests pass (final run 1.77s), including rounded arithmetic,
  fraction-of-time wording, final no-JS numbers, three real logos, links and
  disclosure. Frontend and root test types pass on the settled changes.
- Affected ESLint/Prettier and whitespace checks pass; index remains empty.
- Final guarded actual-app browser proof passes (19.32s): 1366 desktop, 1024
  laptop, 768 tablet, 390 and 320 phone; all logos loaded/contained, compact
  market under 400px at desktop, no horizontal overflow or clipped copy, link
  Tab order, hover and visible keyboard focus. Clock transforms change through
  more than ten states, timeline has intermediate widths and ends at 1/6, and
  countdown/percentage remain coherent through their intermediate/final states.
  Fresh phone animation, no scroll replay, no-JS final values and forced-color
  market/time states pass. All external/mutation dispatches are blocked, with
  zero external or processing attempts. Browser and pending interception replies
  close/settle in finally; the normal app remains running.
- Inspected public-only desktop/phone comparison and market, hover/focus and
  forced-color PNGs under ignored `.local-build/evidence/cl103-*`, plus the
  number/clock/fill trace. Visual review caught an old unstyled footer span
  wrapping phone links; corrected it to the compact Explore/arrow design. The
  initial percent count-up was changed to a synchronized 100-to-17 countdown
  so the temporary numbers also agree with the timer. Forced-color comparison
  fills explicitly retain contrast. Final proof verifies those fixes.

Read-only V103-final reviewed this full packet's settled scoped worktree,
current authority/copy/arithmetic, actual animation path and cleanup, CSS and
responsive/hover/keyboard geometry, official asset reuse, SSR/no-JS/accessibility,
forced-color screenshots and check evidence. Verdict: **Meets ticket; No
actionable findings.** Correct example, coordinated time motion, distinctive
compact market, retained integrations and local safety/documentation: Covered.
Owner personal visual/physical-device/rights, measured provider performance,
real-AI/hosted/cloud and release acceptance: Unverified/owner-only. No production
build/export or paid/live test was required or run for this scoped change.

Deviations: none. Nothing staged, committed, pushed or deployed; no private
media/configuration access or change. Both sections work in FAKE_MODE=true
without keys. Real processing remains separately gated by provider keys, live
flags, approvals and owner action.
