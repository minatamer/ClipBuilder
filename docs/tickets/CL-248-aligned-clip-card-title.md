# CL-248 — Align clip-card title and status padding

Status: Complete locally after visual alignment follow-up, 2026-11-07. Follows CL-233 and the owner's preparing-card
screenshot; preserve the pending CL-247 footer fix.

The owner wants the clip title's horizontal padding to match the status text
below it, and allows a smaller pencil icon if necessary. Use the same shared
inset for each title/status presentation, including preparing/failed cards and
ready thumbnail cards across desktop/tablet/phone rail layouts. Preserve close
title/pencil spacing, long-name truncation, rename dialog and a usable touch
target. Reduce only the pencil glyph if space requires it, not its hit area.

## Acceptance

- One shared card inset drives the title and status/thumbnail content, with no
  screenshot-specific offsets. Account for ready and non-ready card variants.
- Keep the existing compact rail widths, minimum 44px rename target, ellipsis/full-name
  dialog and disabled/busy behavior. No new name row or editor layout change.
- Verify generated no-key preparing/failed/ready and long-name cards at laptop,
  tablet and phone widths; scoped formatting/lint and existing rename/feedback
  checks as needed. Record actual geometry and clean up fixture resources.

No owner clip/edit/configuration mutation, real AI/model/provider action, app
restart, Git action, cloud or deployment. This presentation works without API
keys or regeneration; real AI quality retains its normal runtime/live approvals.

## Initial inset correction and evidence

The header previously used a 4px inset, while non-ready status buttons used
13.6px and thumbnail/narrow variants used 6px. A first pass matching the wider
status inset exposed truncation of the ordinary “Clip 1” title in the 92px card.
The settled shared `--clip-card-inset` uses the existing compact 6px inset for
both header and status/thumbnail content. No wider rail or smaller text is needed.
Header end padding/extra gap are removed; the pencil glyph is 16px while its
shared 44×44px hit area remains unchanged. Existing centered ready-status text
retains its alignment inside the common padded content area.

- Generated current-source Codex-browser checks at 1280×720, 1024×768, 768×1024,
  390×844 and 320×700 cover preparing, failed, ready-thumbnail and long-name
  cards using actual ClipNameControls/Button/stage labels and shared rail CSS.
  Preparing/failed title and status text have identical X positions. Ready title
  and thumbnail edges match; all variants share exactly 6px content padding.
- All short titles remain fully visible, long titles retain ellipsis, pencil
  glyphs measure 16×16 and rename buttons 44×44. No horizontal page overflow;
  narrow cards remain in the scrollable horizontal rail rather than widening
  the page. Long-name rename opens on the 320px fixture with the complete name
  in its styled dialog; Cancel closes it and restores focus without a save.
- Scoped CSS/fixture Prettier, fixture ESLint and final diff whitespace pass.
  This is a CSS-only product change: no new implementation-mirroring unit test
  or repeated unrelated suite. CL-247's unchanged feedback logic/test evidence
  remains separate; its CSS and fixture additions are preserved in full.
- Settled read-only validate reviewed both padding consumers and responsive/
  thumbnail overrides, short/long names, icon sizing vs hit area, dialog/disabled
  behavior and the combined pending diff. No actionable finding in CL-248 scope.
  No contract, data/provider boundary, dependency, state or rename handler changed.
- Both generated fixture instances closed and their four listeners/processes
  are absent. The final instance recorded two fake analysis GETs; no rename save,
  owner request or real processing was triggered. Generated tabs closed, viewport
  reset and temporary helper removed. Screenshot/aggregate geometry remain
  outside Git. Normal app/services and owner work were preserved; no restart.

The frontend guide and ticket index record the adjustment. This works with
FAKE_MODE=true and no API keys, with no AI or regeneration needed. Real AI quality
still requires its configured runtime/provider, live flags and approvals; those
are unrelated to this layout fix. Physical devices, screen readers and unusual
font/zoom settings remain manual. Nothing staged or committed. Deviations: none.

## Owner visual follow-up — 2026-11-07

The owner now asks for the title/pencil arrangement and status-only cards to align
visually with the ready thumbnail, preserving its current position and aesthetics.
Treat the thumbnail's existing padded column as the alignment reference. Center
the visible title/pencil group and status-only text in that same column, with
close title/icon spacing, short-name readability and long-name truncation.
Keep thumbnail bounds unchanged. Retain a minimum 44px rename target, normal
dialog/focus/disabled behavior and all CL-247 feedback work. Verify actual
before/after thumbnail geometry and representative responsive cards using no-key
generated state; no owner media, provider action, restart or Git mutation.

The name and 16px pencil now form one centered shared Button with a 4px visual
gap. Its full column width and 44px height provide a generous rename target
without an off-center invisible icon box. The existing accessible label,
described name, disabled/tabIndex guards, dialog and focus return are retained.
Preparing/failed status text is centered in the same padded column; ready
thumbnail markup, padding, dimensions and placement are unchanged.

- Before/after generated geometry at 1280×720, 1024×768, 768×1024, 390×844 and
  320×700 proves identical thumbnail X/Y/width/height. Header visible-group and
  status centers match the column within 0.008px browser rounding. Short titles
  remain fully visible, long names truncate, glyphs stay 16px and rename targets
  measure 78×44 or 114×44 depending on the existing rail layout. No page overflow.
- At 320px, Enter on the long-name header opens the existing full-name dialog.
  Typing a temporary generated name and canceling leaves the name unchanged and
  returns focus to the Rename clip trigger. No rename save/request was made.
- Existing contextual-feedback tests: 15 pass under hard fake/no-key/paid-off
  isolation. Frontend types, scoped TSX ESLint, CSS/TSX Prettier and whitespace
  pass. The final read-only validate pass checks the compound button's semantics,
  normal Enter/Space behavior, disabled/focus/description guards, truncation,
  thumbnail bounds and preserved CL-247 changes; no actionable finding remains.
- Both follow-up fixtures closed with one fake analysis GET each; their four
  listeners and helper processes are absent. Generated tab closed, viewport reset
  and temporary helper removed; before/after aggregate and screenshot stay outside
  Git. No owner state, provider/model action, app restart or Git mutation.

This supersedes the initial left-edge arrangement while retaining the common
inset, compact rail and existing thumbnail position. Physical-device/AT/unusual
font/zoom acceptance remains manual; fake layout evidence makes no real-AI
quality claim. Nothing staged or committed.
