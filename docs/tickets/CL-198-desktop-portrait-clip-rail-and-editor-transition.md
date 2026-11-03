# CL-198 — Restore desktop portrait clip cards and editor entry motion

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Owner personal visual acceptance remains open. The batch
was confirmed idle with five review-ready and four canceled clips before edits.

## Owner request

On laptop/desktop, restore a small vertical video preview for each completed
clip in the left rail, with its clip label centered above it. Selecting a ready
clip should visibly carry that preview into the editor. Keep compact phone/
tablet navigation where a portrait rail would crowd the editor. Queued clips
keep honest queue/progress states until a usable prepared preview exists.

Dependencies: existing CL-054 readiness/desktop rail, CL-084 prepared-preview
receipts, CL-131 phone/tablet geometry and CL-190 paged collections. CL-199 can
later supply custom display names; preserve Clip N fallback until then.

Authority:
[focused local editing](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#focused-local-clip-editing--2026-10-23),
the permanent motion/design/interaction rules in AGENTS.md and the owner's
[current planning request](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#planned-clip-navigation-and-naming--2026-11-03).

## Safety and execution gate

- The earlier documentation-only hold is lifted by the owner's explicit
  instruction after cancellation. Preserve services, ignored configuration,
  CL-197 changes, all nine clip records and owner media. Never retry canceled
  clips or trigger real processing during implementation.
- Browser reconnection to an already accepted queue on the same live backend
  differs from backend restart. Restart recovery preserves acknowledged data but
  marks queued/in-flight jobs canceled; explicit retry is required. Do not
  promise automatic queue continuation after a backend/watcher/worker reload.
- After implementation is requested, wait for the real batch to become idle
  before touching the normal app. Use isolated synthetic/fake/paid-off/no-key
  verification; no real inference, download or owner-media fixture. No Git or
  cloud/deployment action is authorized by this request.

## Acceptance

1. On laptop/desktop, each ready clip has an actual prepared portrait-media
   preview in the left rail. Center its display name above the frame; default to
   Clip N. Keep status, selection and keyboard focus legible. Long labels
   wrap/truncate accessibly without distorting the 9:16 frame or rail geometry.
2. Preserve completed-state/preview readiness. Queued, preparing, exporting,
   failed and canceled clips never show stale playable media or editing controls
   as if their current operation succeeded. Keep the active processing state and
   anchored footer in the same content slot.
3. Selecting a ready card animates its portrait into the editor preview using
   the actual rail/editor geometry, then hands off cleanly to usable playback.
   Reuse existing motion primitives/tokens. Preserve aspect ratio, pointer and
   keyboard navigation, dirty Apply/Discard guards and selected clip identity.
   No provider/native/export job may be caused by navigation or the animation.
4. Handle rapid switching, scroll/resize, loading/error and unmount without
   stale overlays, flashing the wrong clip, lost focus or orphaned timers,
   animations, observers, requests, players or object URLs. Never suppress app
   motion based on OS/browser reduced-motion preferences.
5. Keep phone/tablet navigation compact and the main preview usable. Verify
   representative laptop, desktop, short desktop, tablet and 320/390px phone
   states, including ready/loading/queued/failure and footer visibility.
6. Bound player/decoder usage across large paged collections. Use existing
   prepared media, pause/release offscreen/inactive previews and keep rail
   previews muted. Do not create an always-playing heavy player per retained
   clip, introduce a new render queue or generate new AI/media merely for cards.
7. Prove navigation/refresh reconnect with fake in-flight jobs does not cancel
   an accepted server batch or repeat provider work. Separate backend-restart
   recovery evidence: completed work survives, interrupted work needs explicit
   retry. Owner visual acceptance remains unchecked until personally reviewed.

## Initial allocation and verification

Likely frontend owners: `clip-batch-panel.tsx`, clip readiness/player
primitives, local editing styles and focused component/browser proofs. Inspect
existing transition work before introducing another animation mechanism. Shared
contracts or backend work require a concrete need and an idle normal batch.

Tests will use synthetic/fake/no-key inputs and assert zero extra metered/native
calls for navigation. Real clip preparation continues to require the configured
provider and normal live gates; Codex uses sign-in/allowance and prepared local
speech assets. Existing real queued work is neither a fixture nor acceptance for
this UI. No real processing is performed by this packet.

## Implementation and execute/validate evidence

Desktop cards reuse the existing Review composition and prepared clip source,
including current crop/overlays and muted hover playback. IntersectionObserver
mounts only visible rail players; phone/tablet do not mount them. Labels center
above 9:16 frames. The actual editor preview uses the existing token-timed FLIP
pattern from the selected card after media readiness; resize/scroll/unmount and
new selections cancel it. Existing dirty guards, keyboard navigation, footer and
completed-state gates are retained. No backend/shared contract changed.

Sixteen focused fake readiness/reconnect/recovery cases pass. The
generated-media responsive browser proof passes at 320, 390, 430, 768, 834,
1024, 1366-touch and 1440 desktop, including bounded portrait players, actual
editor animation, keyboard/dirty guards, ready/queued/failed states and anchored
footer. Synthetic desktop/phone screenshots were visually inspected. Frontend
no-emit types and scoped lint pass. Review corrected installed Player API
bindings, React compiler ref/memoization compatibility and narrow grid-track
sizing before the clean pass. Final read-only diff review: no actionable
findings. Existing synthetic reconnect/recovery tests prove interrupted work
requires retry without invoking the owner's queue. Later CL-199 consumes the
same rail and repeats its proof.

Changed owners: clip batch panel, editor Review/ready callback, new rail-preview
component and entry-motion hook, local CSS, responsive proof and owning docs. No
provider calls, owner media tests, environment changes, staging or commits.
Owner visual/real-media acceptance and hosted/Linux release remain unchecked.
