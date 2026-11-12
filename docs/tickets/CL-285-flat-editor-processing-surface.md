# CL-285 — Flat editor processing surface

Status: implemented and locally verified, 2026-11-11. Owner visual review open.
Dependencies: shared ProcessingState/BrandedSpinner and the full-window editor.

## Owner request

The clip-processing area looks like an older rounded card nested inside the new
editor. Preserve its content and functionality while making its surface match
the editor's flat, full-window aesthetic. The screenshot is a visual reference.

## Scope and acceptance

- Give shared ProcessingState an explicit workspace layout for an already-owned
  canvas: no additional rounded border, card background or inset edge shadow.
  Fill the available editor area and preserve useful spacing, centered content
  and responsive scrolling when the viewport is too short.
- Use it for clip preparation/queued/rendering/canceling states in the editor.
  Preserve spinner, titles, stage details, real timings, accessible status,
  clip rail, readiness guards, cancellation and all existing actions. Intake and
  compact loading cards keep their deliberately contained treatment.
- Remove the obsolete card-height override rather than stacking another local
  style exception. Reuse shared tokens/components; no new request, timer or API.
- Check silent fake pending, nonready and ready transitions in Codex at laptop,
  short-window and narrow widths, with no clipped content or page overflow.
  Use existing relevant readiness/workflow checks, types, lint/format and a
  read-only validate pass. No implementation-mirroring decorative test needed.
- Preserve the owner's current processing/source/session, CL-284 documentation,
  normal app, files/configuration and Voyagenda. No paid/provider run, fullscreen,
  external browser, app restart, deployment or new Git mutation.

The layout and synthetic checks need no API keys with fake/paid-off transports.
Real processing retains all existing provider/runtime, flags and approval gates.

## Evidence

- Added the shared workspace layout, with transparent canvas, no border/radius/
  edge shadow, full available flex height and safe centered overflow scrolling.
  Clip processing selects it instead of a local class. Removed that obsolete
  height override. Four production files change; no processing/state/action,
  security, transport or provider logic changes. Other loading layouts retain
  their prior presentation. Source-of-truth guidance records this editor rule.
- Existing shared workflow, clip-readiness and stage suites pass: 13 cases.
  Frontend TypeScript, scoped ESLint, Prettier and whitespace checks pass. No
  markup-mirroring decorative test was added for this reversible layout change.
- Current-source Codex fixture uses generated silent media and fixed fictional
  progress. At 1440x900 the flat surface exactly fills its 1332x836 parent; its
  border/radius are zero, shadow none and background transparent. The spinner,
  five original stage rows, real-state semantics and supplied timings remain.
- Geometry checks at 1366x650, 1366x400, 768x600, 390x844 and 320x568 preserve
  parent height, all five rows and no horizontal page overflow. Only laptop
  proof is captured; no phone/tablet screenshots or fullscreen were used.
- At the short 336px-high workspace, its 394px content scrolls rather than clips.
  Tab focuses the scrollable region; PageDown moves 58px and reveals the last
  stage. Shared spinner sizing/motion and existing forced-colors rules remain.
- Queued keeps the same flat surface and mounts no videos/editor controls.
  Ready removes processing and restores normal editor tabs/timeline/actions,
  with paused decoded generated media. No processing/retry/cancel/export or edit
  was triggered. Final fixture counts are zero edits and unexpected requests.
- One fixture-only stage constant was corrected to the existing contract before
  browser verification; the initial fixture closed cleanly. No application
  schema or guard was weakened. Both owned hosts, generated scratch, helper,
  browser tab and viewport override are cleaned up. Normal app/owner processing,
  CL-284 documentation, source/media/configuration and Voyagenda are preserved.
- Read-only validate of this four-file implementation and integration against
  CL-285: meets ticket, no actionable findings. No live AI/native export or
  personal aesthetic acceptance is claimed. No paid action, staging, commit,
  push or deployment. Owner visual review remains open.
