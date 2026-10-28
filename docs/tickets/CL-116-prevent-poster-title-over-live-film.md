# CL-116 — prevent the poster title painting over the live film

Owner screenshot, 2026-10-28: the opening “A conversation / A complete idea”
title overlaps the intake scene's “Bring the conversation” title. Preserve the
approved film choreography/aspect, first-paint poster, pause/recovery and local
CL-114/115 work. The landing baseline is visual commit `09fb914`.

## Scope and checks

- Diagnose the actual hero's poster/player paint order. Keep a complete SSR/
  no-JS/loading poster, but contain its internal title/brand z-indices below the
  opaque live player. No text removal, scene redesign or timing workaround.
- Allocate `product-film-hero.tsx` / `product-film-hero.module.css` only as needed
  for explicit isolated sibling layers. Existing `test/local-film-initial.proof.ts`
  must check the full hero's painted poster/title order (not merely descendants
  of `[data-film-frame]`), including live intake on desktop/phone and first paint.
- Reproduce with a failing browser assertion before the fix, then inspect
  desktop/phone captures. Run scoped units, frontend/test types, lint/format and
  whitespace; execute/read-only validate to no actionable findings. Keep all
  owned test listeners/browsers/observers/timers cleaned up.
- Update owning frontend film guidance and this packet/index for actual evidence.
  No backend/contract/worker/configuration, media asset or provider flow change;
  no Git mutation or deployment. Personal visual/release acceptance remains open.

These synthetic landing visuals work with FAKE_MODE=true and no keys. Browser
checks block external/processing requests. Real AI still requires provider keys,
live flags and applicable approvals; no real/hosted/paid readiness is claimed.

## Status

Implemented and locally verified, 2026-10-28. The persistent poster's headline
and brand z-indices escaped into the hero's shared paint order above the scaled
Remotion player. Isolated composition tests excluded that sibling poster, so
their one-headline checks missed the actual-app defect.

`product-film-hero.module.css` now isolates the surface/poster stacking contexts,
with the poster at layer zero. `product-film-hero.tsx` wraps the measured dynamic
player in an isolated absolute layer one. Empty/loading player content leaves
the poster available; the live opaque composition covers its complete title and
brand. No frame/timeline/camera/copy/aspect or asset was changed.

Actual evidence:

- Added a full-hero `elementFromPoint` assertion at the opening poster's title.
  Before the fix it failed: the poster letter was the top painted element even
  with a live frame. After the fix it passes at first live paint, phone resize,
  and actual intake playback at desktop/phone sizes.
- Guarded `test/local-film-initial.proof.ts` passed (10.06s): no-JS poster at
  1366×768, 390×844 and 1920×450; delayed/zero first measurement; matching first
  live frame; proportional phone resize; full-hero painted title order and
  intake. Inspected `.local-build/evidence/cl116-live-intake-{1366,390}.png`.
  The overlapping opening words/brand are absent from the live intake captures.
- Guarded actual landing playback/recovery proof passed (72.35s), retaining
  loop, hidden/offscreen pause/resume, responsive layout, error fallback and
  no-JS recovery. External and processing requests were blocked; expected
  diagnostics attempts were blocked. Owned browser/interception resources close
  in `finally`; normal app/Studio services remain running.
- Page/choreography/camera units: 22 tests passed (3.23s). Frontend and test
  typechecks, affected ESLint/Prettier and whitespace checks passed. No backend/
  contract/worker change or native rebuild was required. No broad suite/build,
  provider/cloud check or export ran.

V116-final: **Meets ticket; No actionable findings.** Read-only scope covers the
two hero files, enhanced actual-app proof and owning film guidance/packet/index
over `09fb914`. Covered the reproduced paint-order bug, complete SSR/loading
poster, live intake at desktop/phone sizes, unchanged choreography/geometry,
pause/recovery and cleanup. Pending CL-114/115 usage/environment changes remain
preserved and excluded. Deviation: none.

Fake/no-key synthetic checks verify the visual fix, not real AI or hosted
readiness. Owner personal visual/physical-device/rights/real-AI/cloud/release
acceptance remains open. No private media/configuration access, Git mutation,
provider/cloud request or deployment; this fix remains unstaged.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
