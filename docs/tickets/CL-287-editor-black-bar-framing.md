# CL-287 — Black-bar framing inside the editor

Status: documented at the owner's request, 2026-11-11; queued, not implemented.
Dependency: current shared editor/preview/export contracts. Separate from CL-286.

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
