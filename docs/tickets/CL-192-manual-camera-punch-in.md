# CL-192 — Manual smooth camera punch-in and automatic return

Status: Authorized and queued, 2026-11-02. Owner AFK authorization lifts the
previous execution hold; use execute/validate/fix loops and local
ticket-prefixed commits without push. Depends on the existing independent
camera-position, Hook/presentation-clock and source-quality export features.
Coordinate with CL-184 and CL-187 before the final combined preview/export
proof.

## Owner request

Add an optional manual zoom effect in the existing camera settings. The owner
chooses a person's face or any visible subject in the vertical frame, the final
framing, and how long the camera takes to reach it. The effect returns to the
normal timestamped camera sequence automatically. AI must never create it.

## Proposed interaction

- Place a compact manual effect mode inside the existing Camera panel, alongside
  existing position editing. Use shared controls/tokens and one active settings
  view. Add/apply/discard actions follow the existing editor footer rules.
- Set the effect start from the preview playhead, choose a target framing with
  the actual scaled preview, and set the duration to reach that target. Show the
  resulting target timestamp so spatial target and arrival time are unambiguous.
  Allow precise numeric adjustment as well as drag/zoom and keyboard controls.
- A target is a constrained crop/point plus zoom, not necessarily a recognized
  person. Keep the vertical output aspect ratio and undistorted source geometry;
  clamp against real image bounds rather than stretch or reveal empty edges.
- Use a smooth deterministic ease into the target, a short documented default
  dwell, and a short smooth automatic return. Define exact defaults during
  implementation; additional hold/return controls are not required for the first
  version. Provide a clear effect end marker and remove/edit controls.
- Return to the baseline camera evaluated at the current playback timestamp, not
  a stale pre-effect position. The underlying camera schedule keeps advancing.
  Do not rewrite its independent positions or erase future cuts.
- Apply the effect to source-video framing. Captions, pictures, text, audio and
  their existing timing/positions remain independent. Preserve source detail for
  native export; a zoom cannot create extra face detail.

## Data, rendering and compatibility

Represent manual effects explicitly in browser-safe local contracts with stable
IDs, finite frame ranges, target geometry and transition durations. Use one
canonical frame-evaluated interpolation for preview and native output; avoid a
CSS-only animation that cannot render identically. Preserve native even-pixel
crop/aspect rules, including the CL-126 Linux scaler fix.

Define the effect's presentation-clock occurrence explicitly so selecting a
moment in the visible Hook or body does not accidentally add a duplicate effect
to the other occurrence. Test Hook insertion/removal and duration changes.
Resolve overlapping manual effects deterministically; the first implementation
may reject an overlapping edit with an actionable message rather than blend
ambiguous effects. Handle baseline camera cuts and end-of-clip return
explicitly, with no hidden retargeting to another face.

Manual effects survive Apply/Discard, reopen, source-preserving retry, save and
rolling recovery. Old drafts without effects retain their exact camera behavior.
Effects can only enter through explicit manual editing. Keep them out of
Codex/Gemini generation schemas and prompts; discard unsolicited generated
effect fields. No new inference, face detection, transcription or sound call.

## File allocation and verification plan

Contracts: existing camera/edit/overlay shapes, a narrowly named motion module
if needed, and focused tests. Frontend: existing camera panel, scaled preview
gestures and manual edit/persistence. Shared composition: canonical camera
interpolation. Native: current fixed focus filter/export path and Hook branches.
Backend: existing manual edit validation/restore only. Docs: source of truth,
owning guides, packet and index. Applications retain their approved dependency
directions; no arbitrary renderer/filter/command input.

Fake/no-key/paid-off tests cover target geometry, exact arrival/return frames,
underlying camera changes, short/end-bound effects, overlap validation,
Apply/Discard/undo if supported, legacy/restore and zero AI dispatches. Current
source synthetic native/browser proof must compare intermediate crops, aspect
and final baseline return at 24/25/29.97/30/60fps. Exercise real pointer
gestures and keyboard/numeric controls on desktop and phone, footer visibility
and saved state. Run scoped static checks, relevant tests and validate.
Rebuild/reload the normal worker through verified ownership only after
implementation is authorized.

## Capability and authorization boundary

The effect itself is manual and needs no provider API key or AI call. Fake mode
can verify it on synthetic prepared clips with installed native tools; real
exports still require the normal local/hosted render availability and applicable
approvals. Existing real clip preparation needs local Codex speech assets/login/
allowance or Gemini keys/live approvals; it is not required merely to test this
effect synthetically. Owner visual taste remains acceptance. Normal local runs
for this series must use Codex, as selected by the owner, with no Gemini
fallback. No implementation, live processing, configuration, restart, cloud,
deployment or Git mutation is authorized by this ticket creation.
