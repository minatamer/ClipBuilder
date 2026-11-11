# CL-274 — Refine Moments creation and Your clips review

Status: implemented and locally validated, 2026-11-11. Owner visual acceptance
and live-provider quality remain separate.
Dependency: CL-273 completed workspace, card actions and scrolling corrections.
Dependency verified against the clean committed worktree. Use execute/validate
loops sequentially, then continue CL-275; no paid/provider runs or Voyagenda work.

## Implementation direction — 2026-11-11

Replace disconnected form separators with compact settings groups, numbered
manual-range cards, grouped endpoint actions and a deliberate empty state.
Review uses source-frame thumbnails from the shared bounded thumbnail service,
clear clip numbering, range/duration and trailing Jump/Remove. Keep one canonical
form per value and all current callbacks, precision and capability guards.
Tabs retain input without forcing an unnecessary page reveal. Final acceptance
uses generated silent media through Codex only; real-provider quality is untested.

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

The owner resumed this packet on 2026-11-11. Implementation and local acceptance
are complete; continue sequentially to CL-275. No normal service restart, owner
session/media change, paid processing, cloud/deployment or Voyagenda operation.

## Implementation and verification — 2026-11-11

- Replaced the old form separators/result rows in place. Manual range cards
  group their original fields and actions, with one shared feedback slot.
  Cards retain all existing callbacks, bounds, precision and disabled guards.
  Numbered source thumbnails use VideoThumbnail's loading/error/serial decoding
  and URL cleanup rather than introducing another decoder. AI settings share a
  wide row and stack by actual pane width. Empty manual/results states remain.
- Generated Codex checks cover manual and combined fresh fake POST results,
  Capture changing only Start, retained sub-second input, arrow-key tab changes,
  JSON export/import, input retention, failed response recovery and cancellation.
  Five analysis POSTs close normally/after cancellation; no real provider.
  Manual-only yields one clip; removing it retains disabled Process. Find all
  returns 13 generated choices and disables processing above the existing limit.
- At 1440×1000, 1366×681, 1024×640, 768×900, 390×844 and 320×600 both tabs fit
  without horizontal/document scrolling. Main owns page scrolling; desktop source
  remains below the navbar. Invalid/corrected manual input has identical field
  rectangles at all six widths. Footer actions remain reachable and result actions
  keep 44px targets. Scrolling preserves inputs and the source clock. Final compact
  default AI form fits at 1440×1000 without needing to scroll to Find moments.
- The hosted-shaped fake shared app passes 1440/768/320 widths: three result
  cards, no local-only Framing, Import JSON or Find all, and no YouTube intake.
  Endpoint Capture and card-owned Process remain available. No Gemini/cloud call.
- Five affected fictional film frames and measured click/card bounds are
  refreshed in Codex; source/editor geometry and the other film scenes remain.
  Captures use settled muted playback and PNG edge padding only. All 15 delivery
  hashes verify. The capture fixture supports explicit ready/failed/held fake
  responses and optional silent/hosted composition; production transports and
  source/provider/security contracts are unchanged. The normal capture command
  now requests silent fixture media too; its external-browser CLI was not run.
- 41 focused selection/clock/collection/workflow tests and five film camera/
  continuity tests pass. Frontend/test-source TypeScript and whitespace pass.
  Focused ESLint and Prettier checks pass for every changed source/fixture/film
  file. No full suite or historical external-browser proof was rerun.
  Read-only validation found no actionable functional/architecture finding.
  Editor tour targets are unaffected because it starts only in the ready editor.
- Local/hosted fixtures report zero edits/unexpected requests and zero plan/image/
  render calls. All owned servers exited and their scratch launcher was removed.
  Review captures outside Git: cl274-add-clips.png, cl274-your-clips.png and
  cl274-phone.png in the CL-273 visualization directory. The exported/imported
  timestamp JSON contains only generated ranges, not owner media/transcripts.

Works with FAKE_MODE=true and no keys. This is UI/transport evidence, not proof
of real AI quality; live prerequisites and approvals remain unchanged. Current
changes are unstaged/uncommitted for review; yesterday's commits remain intact.
