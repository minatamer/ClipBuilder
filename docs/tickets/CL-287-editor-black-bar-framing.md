# CL-287 — Black-bar framing inside the editor

Status: implemented and synthetic checks passed, 2026-11-12. Owner visual and
full application export acceptance remain separate.
Dependency: current shared editor/preview/export contracts. Separate from CL-286.

## Free source-square revision — 2026-11-12

Implemented and locally verified. The owner rejects constraining the visible square inside a tall
portrait camera frame. In square mode show one actual square over the source;
drag it in either axis throughout the source image, bounded only by its own
edges. Keep its existing visible magnification, camera positions/Zoom/Pan/
tracking, fixed output bars and independent caption/text/media layers. Remove
the redundant portrait outline and separate vertical-only reposition workflow.
Full vertical retains its existing geometry. Manual square movement needs no
API keys or provider work.

Use the shared source-camera geometry directly for square preview and native
output, including saved legacy vertical offsets, occurrence isolation and
scene-backed Glass. Preserve draft/autosave/history and original source clocks.
Verify landscape/portrait source bounds, full-area drag and keyboard control,
native pixels/cadence/audio, saved reopen and toggle behavior using only silent
generated/fake/paid-off checks in Codex. Rebuild the current internal worker
after native changes without disturbing the frontend, owner media or Voyagenda.
The owner revoked the intervening commit request: no staging or commits unless
explicitly requested again.

The source square now uses the original image bounds directly. Its whole area
is the drag surface, with the existing selected-position badge and accessible
camera handle; arrow/Shift-arrow keys retain fine/coarse control. The tall
outline, nested visible-window guide, separate reposition surface and vertical
slider were removed. Existing camera centers and zoom are reused, including
legacy vertical offsets, so there is no new persistence format. Zoom/Pan target
previews, tracking windows and native camera sampling receive the same square
geometry. The native path crops the square from the original, scales it into
the central window and pads the existing output rather than translating an
already cropped portrait. Shared scene mattes still cover B-roll beneath
captions/text, including Glass.

Generated checks: 32 focused cases cover full source bounds in both axes,
landscape/portrait sources, legacy offsets, square Zoom/Pan interpolation,
unchanged vertical geometry, saved transport/Hook/body behavior and existing
camera regressions. The generated native proof passed at three output heights,
top/center/bottom source bands and four landscape corners, retaining cadence,
audio and fixed black regions. Local/frontend/browser-safe contract TypeScript
and scoped ESLint pass. Codex observed a square drag above the old portrait
limit, Undo/Redo, Shift-arrow adjustment and exact saved reload of the resulting
source rectangle. No provider calls or application export were triggered.

Final visual verification caught a generic pressed-button fill covering the
square; the shared camera surface now explicitly retains transparency. The final
Codex run confirms the single square outline, no old parent frame, no separate
vertical-only controls, live large-preview response and square Zoom targets.
At 390px the document stays 386px wide; keyboard focus and movement remain
usable, with a screenshot inspected in the normal browser. The laptop proof
has ready media and acknowledged saving. Four existing generated Glass-scene
mux cases pass, with square source framing included at 24 fps and no browser
renderer launched. Full normal browser-driven MP4 and owner aesthetic judgment
remain separate acceptance items.

Rebuilt contracts and the native media bundle. The normal backend watcher
reloaded its owned worker after the new bundle was written; the existing frontend
was preserved. Rolling recovery was present and seven owner clips were idle
before the build. Final health/start/config reads return 200; seven owner clips
remain idle, the frontend PID is unchanged, and the internal worker was created
after the rebuilt bundle. All fifteen temporary fixture ports have no listeners;
their three launch processes exited cleanly. Content-free runtime verification
was refreshed. Formatting/whitespace and final local type checks pass; the Git
index remains empty.
Read-only validation found no actionable issue in this scoped revision. No
provider calls, owner clip edits, ignored configuration changes, Voyagenda work,
staging, commits or push. Temporary fixture tabs/viewport overrides are cleared;
fixture shutdown removes their generated media.

## Original-video reframing revision — 2026-11-12

Historical implementation, superseded by the free source-square revision above.

Implemented with scoped synthetic verification. The owner likes the bars and requests control of which original
video area is visible inside their fixed window, directly inside the editor.
Provide a contextual Reposition video mode with direct vertical dragging in the
large preview, a keyboard/touch-friendly fine-position slider and Recenter.
The bars stay fixed; original-video content moves. Existing horizontal camera
framing remains available. Do not move captions, authored text or placed B-roll,
or change their timestamps/layers, source clocks or existing camera paths.

Persist a bounded optional vertical window position with centered old-draft
default. The centered result must match the current bars. Keep the setting when
bars are toggled off, ignoring it until re-enabled. Support independent Hook/body
edits, autosave, Undo/Redo and saved reopen. Use one integer/even-pixel geometry
helper for preview and native source crop/pad, including scene-backed Glass;
no preview-only transform. Keep the original video filled within the square
viewport at every permitted offset; no new empty strip from translating beyond
the original portrait canvas. Repositioning is manual and needs no API keys.

Verify actual pointer/keyboard interaction and live preview, bounds/reset/off,
saved roundtrip/history, Hook/body isolation, original audio/camera/B-roll
preservation and native generated pixel composition. Use only silent synthetic/
fake/no-key material and Codex's normal browser. Preserve the owner's seven clips,
other pending packets, ignored configuration and Voyagenda. No paid run or Git
mutation. Full normal browser-driven export remains a separate owner gate.

Implementation: Camera → Original video → Canvas framing shows an adjacent
vertical-position slider and Recenter only when bars are enabled. Reposition in
preview pauses playback and, only if necessary, seeks into the edited occurrence.
It focuses a keyboard/pointer surface over the fixed square window. Dragging
moves original-video content in the same direction; arrows/Shift-arrows provide
fine/coarse adjustment, Home/End reach bounds, and Escape returns focus to the
command. Recenter restores 50% and focuses the slider. A non-interactive visible-
window guide inside the existing source-camera crop shows the same subsection.
Wide controls share a row with the illustrated choices; narrow controls stack.

The strict optional blackBarPosition value is 0–1, absent meaning centered 0.5.
Existing black-bars edit operations accept an optional position, preserving old
clients and remembered positions when toggled off. The compiler, scoped Hook/body
copy, autosave, history equality and explicit reset operations retain it. One
shared helper maps the bounded window to original-video translation. Only the
original video moves; camera paths, B-roll, authored text, captions and audio
are preserved. Native source pad/crop applies the same offset at the actual
export height with bounded even-pixel rounding. Centered and disabled framing
add no native source filter. It never forces output to 1080×1920. Both Hook and
body use it, including the existing prepared-scene Glass path.

Actual checks: 31 focused contract/editor/reconciliation/native-scene cases
passed. The generated matte/FFmpeg proof passed, checking top/center/bottom at
native 180, 720 and 1920 heights, fixed black regions, expected source-band pixels,
center/off no-op, existing cadence and silent audio. The first native draft used
fixed dimensions; review caught and corrected it before refreshing the owner's
worker. Contract build, browser-only contract types, local/frontend TypeScript,
scoped ESLint, formatting and whitespace passed. No new dependency or provider.

Codex checked a real pointer drag from 50% to 89% with immediate settled source
translation -328px and unchanged matte rectangles. One Undo restored 50%; Redo,
keyboard bounds, reset, saved reload at 100%, off/on retention, Escape focus and
deliberate keyboard-mode entry passed. Synthetic server state retained body 50%
while Hook changed to 100%, with zero unexpected requests. At 390px the document
width was 386px, controls stacked and the 44px slider remained keyboard-usable.
Temporary sizing was reset. Normal-window laptop screenshots are outside Git;
the source-window guide and main preview were observed at matching y=840 and
translation -420px. Actual touch hardware remains owner acceptance; pointer
capture/cancel and touch-action:none preserve the shared gesture mechanism.

Rebuilt current-source contracts/native bundle. During final readiness the
existing backend watcher was alive without listeners; rebuilding and touching
its normal entry point restored backend/worker readiness. No cause is inferred
for that transient listener loss. Recovery was verified before the refresh;
all seven owner clips remain, processing is idle and the frontend identity is
unchanged. Final health/start/config/capability reads returned 200, with seven
clips retained and no active processing. Content-free runtime metadata records
the refreshed backend/worker and preserved frontend identities.
Temporary generated fixtures/tabs/listeners are cleaned. Read-only validation
found no actionable issue in this revision. Full normal browser-driven MP4 and
owner visual acceptance remain distinct. No paid run, owner edit, ignored config,
deployment, staging/commit/push or Voyagenda operation.

Owner follow-up (2026-11-12): could not find the promised option. It had only
been documented, not implemented. Implement it now in the shared editor without
processing or changing the owner's saved clips. Complete before CL-289.

## Owner request

Provide an editor option for the normal vertical clip that adds black bars at
the top and bottom, leaving a centered, almost-square viewing area like the
attached reference. Keep this inside the editor, not in intake, clip selection
or the pre-processing tracking/framing choice. The attachment is a visual
reference; its text/UI is not an instruction.

## Intended behavior

- Keep the exported canvas at 9:16, with its normal dimensions, cadence and audio.
  This is a framing treatment inside that canvas, not a different output ratio.
- Use one explicit Black bars option for the original clip in Camera/framing,
  available in the shared local and hosted editor. Default off.
- Initial planned preset: centered 1:1 viewing window; on a 1080×1920 canvas,
  opaque black mattes are 420px above and below the 1080×1080 window. The owner's
  description is approximate, so visual acceptance must confirm this proportion.
- Mask the existing visual scene instead of changing source timestamps, camera
  targets, pan/zoom/tracking paths or source aspect ratio. No AI regeneration.
- Scene pictures/videos obey the same matte. Captions and authored text retain
  their existing upper layers and independent positioning; bars do not silently
  delete or reset any content. Keep the camera target/selection affordances usable.
- Save the choice through autosave, Undo/Redo, explicit draft reopen and recovery,
  with an absent old-draft property decoding as off.
- Reuse one shared geometry/material helper in preview and native export. Cover
  Hook/body inheritance and independent edits deliberately; no preview-only mask.

## Implementation/validation plan

1. Add a bounded strict authored framing property and backward-compatible default.
2. Add the single contextual editor control, without duplicating the outside
   tracking/framing selector or introducing another workflow.
3. Compose scene mattes below captions/text and above all scene visuals in both
   shared preview and native paths, including scene-backed Glass rendering.
4. Verify on/off edges, source/camera continuity, multiple B-roll layers, captions,
   Glass, Hook/body, native frame dimensions/cadence, audio and saved-state parity.
5. Verify selected-frame handles, keyboard/touch, desktop/short/phone layout and
   stable save/feedback geometry. Keep all existing features and security gates.

Manual bars and generated-media verification require no API keys. Use synthetic,
silent, fake/paid-off checks in Codex only. This ticket does not authorize paid
processing, source downloads, cloud/deployment, configuration changes or Git
mutation. Real AI retains its existing prerequisites/approvals. No implementation
or acceptance result is claimed by creating this packet.

## Execution and validation — 2026-11-12

Camera → Original video → Canvas framing has illustrated Full vertical / Black
bars · Square window choices. This does not duplicate the intake framing choice.
The strict optional boolean defaults to off when absent; the shared edit request,
compiler, occurrence copy, history comparison and autosave operations retain it.
New Hook copies inherit the current body choice, then remain independently
editable. Existing independent Hook settings are preserved. Geometry lives once
in contracts; the shared scene-matte component paints after scene visuals and
before captions/text, including the scene-backed Glass path. Native capture uses
that same tree; no camera, clock, output-profile or audio algorithm changed.

Checks: two new framing tests plus 16 existing state/overlay cases passed. Strict
type rejection, absent/false equivalence, edit operation, JSON reopen, Hook/body
independence, base/manual media/audio preservation and paint order were covered.
Browser-safe contracts, local and frontend TypeScript and scoped ESLint passed.
One generated FFmpeg proof rasterized the actual shared matte SVG: exact alpha
boundaries at rows 419/420 and 1499/1500, 1080×1920 output, 24 fps / 12 frames,
audio stream preserved, black top/bottom and unchanged red center. No browser
process, external media, provider or API keys were used by that proof.

Codex's silent synthetic editor showed real source/B-roll masking, text above
bars, autosave, Undo/Redo and saved reload. At 390px, radio arrow-key selection
worked and document width remained within the viewport. Temporary responsive
override was reset. Laptop proof screenshots remain outside Git. No owner saved
clip, source or export was edited. Full normal-app browser-driven MP4 export,
Safari and owner judgment of square proportions remain unverified.

Read-only validation of the scoped settled diff found no actionable issue.
CL-286 styling and the pre-existing CL-283 editorial notes are separate work.
