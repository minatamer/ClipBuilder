# CL-120 — full-screen phone hero with restored branding

Owner request, 2026-10-28: phone landing should initially show the hero without
the next How it works section peeking in. Restore the omitted ClipBuilder hero
title/mark. Preserve tablet/laptop layout and the approved 4:3 stacked film.

## Scope and checks

- Phone rules in `page.module.css`: restore a 100svh minimum, show the existing
  hero wordmark and balance stacked copy/film in the available height. Compact
  brand/description spacing on shorter portrait phones. Keep natural min-content
  overflow on very short screens/enlarged text, rather than clipping or hiding
  the next section globally. No fixed canvas stretch or motion suppression.
- Existing `local-film-initial.proof.ts`: add initial/no-JS phone geometry checks
  at 320×568, 360×640, 390×600/844, 430×932 and a short-screen overflow case.
  Brand visible, no next-section peek, common phone content fits, readable film
  minimum aspect and no horizontal overflow. Preserve first-live poster/player
  alignment after resize. Inspect phone captures. Run relevant page units,
  guarded browser checks, scoped format/whitespace and test types if needed.
- Owning frontend guidance/source direction and packet/index document results;
  execute/read-only validate to no actionable findings. Preserve CL-114–119
  pending work over `09fb914`. No application/provider, assets, native/backend/
  contracts/configuration, Git mutation or deployment.

These landing checks are fake/no-key/paid-off; real AI still needs keys/live
flags/approvals. Personal visual, real device and hosted/release acceptance stay
owner-only. Existing normal app/Studio and proof cleanup remain intact.

## Status

Implemented and locally verified. Phone CSS now uses a 100svh hero minimum,
space-evenly stacked copy/film and the existing visible ClipBuilder mark/name.
Short portrait spacing keeps 320×568 and 390×600 content within the viewport.
The stacked film remains 4:3; tablet/laptop rules are unchanged. Shrinkable grid
tracks and wrapping brand/title lines allow enlarged hero copy to grow vertically.

Evidence on 2026-10-28:

- New phone assertion reproduced the original omitted wordmark before edits.
- Final guarded `local-film-initial.proof.ts` passed (14.08s): no-JS first-screen
  geometry at 320×568, 360×640, 390×600/844 and 430×932 confirms visible mark/name,
  hero minimum, next section below the fold, contained complete film and no
  horizontal page overflow. Very short 320×480 retains natural scrolling.
- A 200% hero-text check exposed intrinsic grid sizing that clipped the title;
  a minmax(0,1fr) track, shrinkable copy and wrapping fixed it. The hero title
  remains whole and its section grows/scrolls instead of clipping. This is a hero
  check, not an all-site enlarged-text audit.
- Existing no-JS desktop/short-wide, delayed measurement, first-live frame,
  phone resize, full-hero poster/player stacking and live intake checks pass in
  the same proof. Inspected settled short/tall phone and live intake captures in
  ignored `.local-build/evidence/cl108-nojs-*`, `cl116-live-intake-390.png` and
  `cl120-enlarged-320x480.png`. Test browser/interceptions close in `finally`.
- Twelve page units passed (1.49s); test types, scoped ESLint/Prettier and
  whitespace passed. No new test/full suite/backend/native rebuild was needed.
  All browser checks are guarded fake/no-key/paid-off, with processing/external
  requests blocked. Normal app/Studio remain running.

V120-final: **Meets ticket; No actionable findings.** Read-only scope is phone
hero CSS, the extended existing proof and owning frontend/source/packet/index
guidance over `09fb914`. Earlier CL-117 Privacy CSS deletion and other pending
CL-114–119 work are preserved/excluded. Covered viewport-first presentation,
restored branding, common-phone fit, very-short/enlarged hero scroll, unchanged
film aspect and desktop geometry. Deviation: none.

Owner personal visual/physical-device/rights/real-AI/cloud/hosted/release
acceptance remains open. Fake visuals require no keys; real AI retains its
key/live/approval gates. No private configuration/media access, provider/cloud
request, Git mutation, push or deployment. Work remains unstaged.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
