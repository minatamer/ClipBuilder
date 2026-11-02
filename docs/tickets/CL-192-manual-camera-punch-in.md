# CL-192 — Manual smooth camera punch-in and automatic return

Status: Implemented and validated, 2026-11-02. Owner AFK authorization lifts the
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

## Implemented behavior and verification — 2026-11-02

Manual Zoom is a third Focus tab, retaining the one-panel/editor-footer flow.
Add at playhead captures exactly one occurrence; numeric start is on
presentation time, while stored start is local to Hook/body. Target uses
normalized original source coordinates selected through the scaled portrait
viewport. Magnification is 1–8; smoothstep moves from the opening baseline crop
to the target. Defaults: 0.5-second approach, 0.3-second hold, 0.4-second return
and 0.1-second end margin. Approach duration remains editable to one logical
frame. Return samples the current baseline, including intervening cuts, and
never rewrites camera shots. Same-occurrence overlaps/duplicate IDs/invalid
clocks or geometry are rejected; up to sixty manual effects fit each finite
clip. This is separate from CL-190's unlimited total local Codex clip count.

Hook changes remove only Hook effects, with a visible notice; submitting the
same Hook preserves them. Resetting legacy framing with no automatic camera also
removes dependent zooms, restoring the original unframed behavior. Existing
framed camera resets retain independent effects. Old documents without effects
keep the exact old native filter path. Generated bases forbid effects; provider
schemas/prompts remain unchanged and cannot create them. Captions, pictures,
opening titles and audio remain separate from source-video cropping.

Current-source native proof rendered original generated pixels through the full
renderer at 24/25/30000÷1001/30/60 fps. Sixty Hook/body samples include
baseline, mid-approach, arrival, return and settled baseline. Maximum per-sample
mean RGB error against independently encoded expected crops was 1.40/255; output
frame counts/cadences/even geometry and unchanged source hashes passed. Owned
numeric graph files avoid Windows command-length limits. The admitted Windows
FFmpeg 9 file-loading option and packaged Linux 5 option differ; only Windows
execution was tested. The CL-126 `setsar=1` before frame-evaluated scale remains
intact. Temporary graphs/rasters/partial outputs are confined to owned scratch
cleanup.

- `vitest run --config scripts/local-test.config.ts --maxWorkers=4`: 929 cases,
  112 files passed in 77.03s. An earlier unrestricted run alongside browser work
  hit two contention timeouts; bounded concurrency passed both without changing
  production deadlines or retry policy.
- After the final legacy reset fix: focused camera contracts/editor state/API
  checks passed 25 cases/three files in 9.68s. Explicit drafts and rolling
  recovery restore effects with zero AI/native calls; failed export retries keep
  the edit and dispatch only the explicitly requested fake render.
- `local-camera-motion.proof.ts`: one full native proof, 39.92s, generated video
  and current-source overlay, no models/provider requests.
- `local-camera-motion-editor.proof.ts`: one real-control browser proof, 19.67s;
  mouse/touch drag, keyboard/numeric target, invalid inputs, independent body
  occurrence with Hook prefix, preview, Apply/Discard, reopen and remove across
  1440×900, 390×844 and 320×568. Screenshots inspected: footer visible and no
  horizontal overflow. Six explicit edit requests and zero AI/render calls.
- Contracts/local/frontend/test TypeScript, scoped ESLint/Prettier, whitespace
  and the normal worker/overlay build pass (final commands recorded below). No
  normal service was listening on 3000/4000/4200, so no process was replaced or
  app launched. No ignored environment was read/changed.

Execute/validate findings resolved: unchanged-Hook submissions clearing effects;
legacy reset leaving a zoom without a valid baseline; presentation capture's
fallback seeking the presentation time rather than source time; and FFmpeg 9's
removed legacy filter-file option. Final read-only validate: no actionable
findings on the settled ticket scope. Synthetic evidence proves mechanics, not
real face detail/taste or live provider readiness.

The old all-purpose `local-focus-editor.proof.ts` fixture carries a pre-CL-166
suggestion before ten seconds, which current policy correctly hides. Attempts to
extend it also exposed timing assumptions in that unrelated prelude. It was left
unchanged; the new focused current-source zoom proof tests the required
interaction directly. No production Hook policy was relaxed for a test.

Toolchain deviation remains the series' documented unavailable Corepack pnpm
11.19.0 bootstrap: use installed pinned package binaries directly, not the
mismatched installed pnpm fallback. No dependencies or lockfile changed. Native
and unit checks needed the approved Windows sandbox transform-cache fallback;
their hardcoded fake/paid-off/no-network setup remains before imports.

Unchecked owner-only gates: personal visual acceptance, real face/ASR/AI
quality, actual two-hour throughput, Linux native execution,
hosted/release/deployment. This manual effect itself adds no AI/key requirement.
Real preparation still needs the normal Codex login/allowance and local speech
assets; Gemini would need keys/live approvals and was neither used nor selected.
No real provider, YouTube, cloud, configuration, push or deployment action
occurred.

## Whole-file commit allocation

- `apps/backend/local/edit-clip.ts`
- `apps/frontend/README.md`
- `apps/frontend/src/features/local-editing/camera-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/editor-state.test.ts`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/focus-preview-controls.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/use-editor-preview.ts`
- `apps/renderer/README.md`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/export-profile.ts`
- `apps/renderer/local/focus-filter.ts`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/CL184_193_EXECUTION.md`
- `docs/tickets/CL-192-manual-camera-punch-in.md`
- `docs/tickets/README.md`
- `packages/contracts/local/camera-motion.test.ts`
- `packages/contracts/local/camera-motion.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `test/local-camera-motion-editor.proof.ts`
- `test/local-camera-motion.proof.ts`
- `test/owner-editor.test.ts`
