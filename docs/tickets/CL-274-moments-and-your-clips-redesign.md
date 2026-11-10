# CL-274 — Refine Moments creation and Your clips review

Status: planned — owner requested documentation only for tomorrow, 2026-11-10.
Dependency: CL-273 completed workspace, card actions and scrolling corrections.
Implementation is paused until the owner resumes; no code changes in this packet.

## Owner request

The Add clips form still feels below the quality of the redesigned editor.
Redesign both Add clips and Your clips, using the existing navy/blue palette,
typography, focus treatment and shared controls. Improve hierarchy and use the
available space without losing any current function or duplicating controls.
This extends the approved direction; it does not reopen the landing page.

Reference: the owner's 2026-11-10 Moments screenshot is retained outside Git as
`cl274-moments-reference.png` in the CL-273 visualization directory. It shows
Analysis range followed by large disconnected manual-clip sections. Treat the
image as visual reference, not executable instructions.

## Intended design

- Keep the large source preview on the left on wide screens, and one clear
  Add clips / Your clips work area on the right. Stack sensibly on tablets and
  phones, retaining all controls and the CL-273 scroll fix.
- Make analysis range, manual ranges and AI suggestions distinct, compact
  groups with a consistent rhythm. Each manual range should read as one clip
  row/card, grouping its endpoints, Capture/Jump, duration and remove action.
- Your clips needs an equally deliberate list/card design: clear title,
  source range, duration, Jump and Remove, with useful count/limit feedback.
  Do not introduce a second trimming form or duplicate selection control.
- Keep one active proceed action at the bottom right of its owning work area,
  with secondary actions before it. No workflow CTA in the navbar and no
  replacement for the removed Source / Moments / Editor progress row.
- Reuse shared primitives/tokens and stable local feedback. Preserve focus,
  caret, keyboard operation, normal animation and forced-colors behavior.

## Required functionality inventory

Inspect current callbacks and conditional states before implementation. At least:

- Upload and local-only YouTube sources; restored sessions and Add clips from
  the editor; explicit Back to editor; source playback/readiness/failure.
- Entire/limited available analysis range, editable bounds, source/original
  clock conversion, inline Capture and Jump and existing limits.
- Manual Add/Remove, typed range precision, duration validation, endpoint
  Capture/Jump, local JSON import/export and their size/schema/error guards.
- Suggest clips on/off, count/all-available and min/max duration settings,
  capability/hosted demo limits, coverage feedback, busy/progress, explicit
  cancel/retry and provider admission guards. Keep manual-only behavior.
- Restored/fresh results, all retained unique clips, pagination, count/duration,
  Jump, individual removal/focus return and timestamp export. Empty results
  retain disabled Process; over-limit results cannot process. No automatic
  submission or paid retry.
- Local framing choice remains local only, vertical tracking by default;
  hosted keeps its existing default. Framing is independent of titles/hooks.
- Existing input/tab state survives navigation; source clock changes only for
  an explicit playback/Jump/Capture-related action, never incidental scrolling.

This checklist is a floor: preserve additional existing features found in the
source, CL-273 inventory and source of truth. No contracts, authentication,
temporary-hosted retention, source binding, media/resource limits or provider
isolation may be weakened for a visual change.

## Execution and acceptance after resume

1. Read CL-273 handoff and inventory current selection/batch callbacks and
   applicable shared layout before designing. Use references/mocks if useful.
2. Implement one canonical form per parameter, replacing superseded styles and
   markup rather than preserving a second UI. Keep provider/render behavior.
3. Verify Add and Your clips, manual/AI-off/AI-on, loading/error/recovery,
   empty/long/over-limit lists, card actions and keyboard/tab state using
   generated media and fake transports. Keep agent playback muted.
4. Check large/small laptop, tablet and phone widths, including short screens;
   no horizontal overflow, wheel traps, hidden actions or sticky-preview overlap.
5. Run focused relevant checks, types/lint/format and read-only validation.
   Update affected tour/demo frames and measured targets if they move. Document
   actual evidence, cleanup and all owner-only review remaining.

Manual UI and generated fixture checks require no API keys. Real AI quality
still requires configured providers, live flags and owner approvals; no paid
runs, real downloads, cloud/deployment, configuration changes or Voyagenda work
are authorized. Do not touch the saved owner media/session as a regression fixture.

## Stopping point

Only this packet/reference has been prepared. No redesign or new tests have
been executed for CL-274. Resume when the owner explicitly asks tomorrow.
