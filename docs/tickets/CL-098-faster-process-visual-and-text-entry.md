# CL-098 — faster How it works and left-to-right text entrance

Owner request: 2026-10-28. Keep the current illustrated card; move between steps
faster, and make adjacent copy enter left to right.
Depends on locally validated CL-097; preserve CL-095–097 pending changes.

## Authority and scope

Follow [the current landing decision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#owner-landing-refinement-decision--2026-10-28).
Shorten the 21.1-second Upload/Read/Cut cycle to about 12 seconds, retiming each
dependent upload/read/handoff/preview animation so it completes before the next
step. Keep the existing illustration, semantic steps and synchronized status.
Change adjacent text entrance to horizontal travel from left to its resting
position. Preserve no-JS content, visibility/foreground pause and timer cleanup.
Do not suppress animation under reduced-motion preferences.

## Acceptance and checks

- Faster complete cycle, ordered exclusive phases, no truncation/stale handoff.
- Copy visibly enters left to right; exit/visibility does not expose duplicate
  active text. Preserve natural phone layout and live-region behavior.
- Check a full real browser cycle, hidden/offscreen pause/re-entry and desktop/
  phone geometry, including animation intermediate states.
- Update existing timing regression meaningfully; affected types/lint/format;
  final landing integration and read-only validate/fix until no findings.

Illustration is API-free in fake/no-key mode. Real provider processing requires
keys/live flags/approvals and owner action. No provider/cloud/deploy/Git action.
Personal visual/release acceptance stays owner-only.

## Inspection clarification

The existing observer disconnects after first entrance and timers continue when
the section/tab is hidden. The scoped update will actually cancel phase timers
while offscreen/hidden and restart cleanly at Upload on return, with no repeated
live announcements. This is needed to avoid stale overlapping fast cycles.

## Status

Implemented and locally validated, 2026-10-28, after CL-097 V97-2. The cycle
is now 12 seconds: Upload 0-3s, Read 3-5.6s, handoff 5.6-6.4s, Cut 6.4-12s.
Upload completes at 2.55s; transcript lines finish 2.05s into Read; handoff is
650ms and the complete preview is 5.3s. Existing illustration/keyframes remain.
Copy enters from translateX(-1.15rem), with 440ms motion and 350ms fade.
Offscreen/hidden transitions clear all pending timers; re-entry starts cleanly
at Upload and suppresses repeated live announcements. Listener/observer/timer
cleanup stays owned by the component.

V98-1 visual review caught overlapping inactive step text during initial client
enhancement. Delayed visibility let SSR text linger during the entrance.
Inactive text now hides immediately while the incoming step still slides/fades.
The browser regression samples the cycle and permits at most one visible step;
zero opacity at an entrance's first frame remains a normal transition.

Final checks: 14 focused page/film/process units; frontend TypeScript; affected
ESLint/Prettier; test TypeScript; diff whitespace all pass. The final actual
Chrome integration proof passed (67.45s), covering CL-095-098 together. Measured
phase offsets from first visible sample: 2.972s Read, 5.570s handoff, 6.378s Cut,
11.975s new Upload (45ms polling plus capture overhead; not frame-exact). Upload/transcript/
preview each reached completion. Observed negative-to-zero text X motion with
zero Y movement, at most one visible text step, offscreen/hidden timer stop and
clean re-entry. Inspected all four process phase PNGs and the phone capture.
Every POST/external request was blocked; zero processing/external attempts;
the isolated browser closed in finally. No new provider/model is involved.

Read-only revalidation V98-2 reviewed the settled process/timing/CSS diff,
related client lifecycle, unit/browser regressions, retained CL-095-097 work and
final screenshots. Verdict: Meets ticket; No actionable findings. Initial
text-overlap finding Resolved. All local acceptance Covered; owner personal
visual, physical device, actual hosted, rights, real-AI and release acceptance
Unverified. No source/architecture/spend deviation; the inspection clarification
above records the pre-existing timer behavior actually corrected. No staging,
commit, configuration/provider/cloud change or deployment.
