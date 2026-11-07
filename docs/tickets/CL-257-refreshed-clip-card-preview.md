# CL-257 — Restore clip-card previews after refresh

Status: Complete locally, 2026-11-07. Frontend correction verified with
generated media; owner physical-device acceptance remains separate.

Owner reports that the small clip preview in the left rail is blank after a
browser refresh while the main edited preview loads. Find and fix the generic
reload/lifecycle cause; preserve clip name/status alignment and editor geometry.
Preserve all pending CL-247–256 changes and existing source/base/edits/exports.

## Acceptance

- Reproduce with a generated fake/no-key editor, including a fresh page load
  and actual reload. Determine whether visibility, initial paused decoding,
  protected assets, buffering or lifecycle cleanup causes the blank card.
- Visible editable desktop cards show a decoded edited preview without hover
  or user Play. Hover playback and leaving/offscreen cleanup still work; hidden
  cards avoid unnecessary media work. Errors remain local and layout stays stable.
- Verify reload and transitions at laptop/tablet/phone widths, respecting the
  existing compact horizontal rail on smaller screens. No layout redesign.
- Run focused browser checks plus relevant TypeScript/lint/format checks. Use
  Codex browser for acceptance. Fixtures include real fake HTTP media transport;
  zero provider/model calls, ignored config reads or owner-clip mutation.
- Record actual evidence here and link the index. No Git mutation, deployment,
  source regeneration or normal service restart is authorized or required.

## Evidence

These checks run with FAKE_MODE=true and no API keys;
they verify playback/UI mechanics, not live AI quality. Real provider processing
retains its separate runtime/key/live-flag/approval requirements and is unnecessary.

Initial findings: the standalone and real Next fake editor paint on ordinary
reloads at three laptop dimensions. The normal Codex browser has a separate
empty session, so no owner session was edited or treated as a fixture. The rail
component initially mounts nothing and relies solely on an asynchronous
IntersectionObserver notification. Verify a deferred first-notification case
explicitly; initialize from actual layout and recheck container show/resize,
while retaining lazy offscreen cleanup. This is a generic lifecycle correction,
not a claim that the owner's unavailable callback trace was captured.

## Implemented correction and verification

- The deferred-initial-notification experiment reproduced a visible, empty rail
  (zero mounted video elements) while the main preview worked. Aggregate before
  evidence is retained outside Git. Ordinary fake reloads did not fail; this
  proves the visibility-gate failure mode, not a captured owner-browser trace.
- The component now measures clipped visible area during layout, before paint,
  and rechecks when the card/rail changes size or becomes visible. Viewport-based
  intersection observation retains scroll/offscreen release. Both observers
  disconnect on unmount and late callbacks cannot update a disposed component.
  No timer, selected-card special case, always-mounted player or media mutation.
- Final real Next development proof passed with every API request redirected to
  generated fake HTTP media: initial load and actual cache-bypassing browser
  reload at 1280×720, 1342×586 and 1440×900. All six checks decoded a teal video
  pixel instead of the blank navy card, retained edited overlays, remained paused
  at the correct Hook source time and needed no hover/Play. The first rail
  intersection notification was suppressed throughout this failure-case proof.
- Hover advanced the decoded clock; leaving paused. Add more clips/Back to editor
  disposed/recreated the rail player. Scrolling the whole rail offscreen released
  it and returning recreated it. Actual reloads at 834×1194 and 390×844 retained
  compact horizontal navigation, zero rail players and no horizontal overflow.
  Zero edits, unexpected/external requests and plan/image/render calls.
- Codex browser independently verified initial load and real reload at the short
  laptop size: decoded paused video, correct source time and no overflow. Tablet
  and phone layouts retained zero rail players and compact navigation. Zero
  React/browser errors; only the existing Remotion license notice appeared.
  Generated screenshot/aggregate evidence remain outside Git. Agent tabs closed,
  viewport reset, helper exited cleanly and exact generated scratch was removed.
- Frontend and root-test TypeScript, scoped ESLint, Prettier and whitespace checks
  passed. Browser test functions use the repository's isolated compiled driver;
  Node test compilation gains no browser globals. The public reload CDP command
  has narrow test-only typing and its load listener/deadline always release.

## Validate and limits

Read-only scoped review: no actionable findings. Covered — visible initial
paint, reload, hidden-view return, hover/pause, offscreen release, compact device
layouts, real fake media transport and cleanup. Unverified — the precise lost
notification/timing in the owner's original browser and physical-device/hosted
acceptance. No real AI quality is claimed or needed: processing still needs its
normal runtime/key/live/approval prerequisites.

Changed owners: clip-rail-preview.tsx, its generated browser proof, this packet,
the index and narrow frontend/source-of-truth notes. Preserve all CL-247–256
changes. No contracts/native worker/config change or normal app restart needed;
no saved clip/source/base/edit/export, provider call or Git mutation.
