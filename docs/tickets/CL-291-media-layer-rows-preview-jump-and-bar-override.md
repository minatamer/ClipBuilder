# CL-291 — Media layer rows, preview jump and per-media bar override

Status: implemented and locally verified, 2026-11-12. Dependencies: shared CL-271 media controls,
CL-273 inspector, mixed layer ordering and CL-287 black-bar framing are present.
Preserve all other pending packets and the owner's current saved clips.

## Owner requests

The Layer order row looks visually inconsistent: the grip appears as a separate
filled block and the information/actions need a cleaner compact hierarchy.
Improve its design and provide a CTA that jumps the main editor preview to the
media timestamp. The owner clarifies this is a preview seek. Also add an
individual picture/video checkbox to ignore the black bars.
The follow-up asks that Remove media be visible. Move the existing placement
removal into a persistent top action row in the selected picture/video inspector,
visible from Image/Video, Timing and Position, without duplicate removal actions.

## Intended behavior and acceptance

- One coherent row surface with a quiet drag handle, consistent thumbnail,
  readable label/time and independent Jump to action. Keep the mixed picture/
  video stack, front/back order, selection/repeat-click dismissal, keyboard
  pick/move/drop/cancel and existing touch targets. Do not duplicate a trim form.
- Jump to pauses the main preview and seeks to the exact media start in the
  active Hook/body occurrence, converting the clock once. Repeated jumps still
  seek when that layer is already selected or its inspector is closed. Preserve
  timings, geometry, order, draft/history and other layers. Busy/unready/invalid
  preview states cannot jump or start processing. Work for pictures and videos.
- Add a per-placement Ignore black bars checkbox to media Image/Video settings.
  Default off, including absent old-draft values. Checked media may paint over
  black bars; unchecked media remains restricted to the central window when
  bars are enabled. Bars off ignores the flag but remembers it. Do not move or
  resize media implicitly, change clocks/audio or add AI requests.
- Persist the strict optional flag through edit/compile, autosave, Undo/Redo,
  saved drafts/recovery and independent Hook/body scopes. Keep normal media
  ordering even when bypassing bars; captions/text remain above all visuals.
  Preview/native output and scene-backed Glass must use the same clipping.
- Reuse shared Button/thumbnail/feedback primitives, product tokens and neutral
  inset focus. Check laptop and narrow/phone geometry, keyboard/focus, pending
  thumbnails, real pointer ordering and exact settled preview clocks. Keep
  loading/recovery distinct without empty async placeholders.

Implement row/jump first, then the per-media flag and rendering. Use meaningful
focused fake/no-key checks and silent generated Codex fixtures; no real AI,
searches, source downloads or owner-session edits. Rebuild/reload current native
code if changed, using verified ClipBuilder lifecycle ownership and preserving
the frontend/recovery, ignored configuration and Voyagenda. No staging, commits,
push, deployment or new dependencies. The previous seven live visual refreshes
are complete and their allowance approval is consumed.

## Implementation and actual verification

Layer rows use one restrained surface instead of a filled grip block. Their
44px handles, thumbnails, labels and independent Jump to buttons retain the
front-to-back mixed stack and keyboard/pointer interactions. Compact rows show
the start while their tooltip and primary timeline retain the full range. Jump
uses the existing occurrence mapper once with the exact cue start and pauses;
it reveals the appropriate inspector without using repeat-click dismissal.

Remove picture/video is now a single top inspector action on every media sub-tab.
Removal prefers another item of the same type, or switches category to the
remaining media; it does not delete uploaded assets or seek incidentally.
The checkbox belongs with presentation controls, before their reserved feedback
slot. Its strict optional cue boolean defaults off. The existing upsert/compiler,
draft/history and scoped Hook machinery carry it without a second schema.

The shared renderer paints original-video mattes before media. Each visual has
a full-canvas clip wrapper when bars apply, retaining per-media motion/fit inside
it and preserving the original mixed order. Opted-out media skips the wrapper's
clip; captions/text paint afterward. Frame-cache identity includes the flag.
This same tree runs in preview and native overlay/scene-backed Glass output.

Fifteen focused cases pass across cue transport/reopen/Hook independence,
schema rejection, shared paint order/cache identity, existing bar framing,
reorder operations and media motion. Local/frontend/browser-safe contract types
and scoped ESLint pass. Codex's silent generated fixture verified exact video
jumps at presentation 0.5s in Hook and 3.5s in body (source clock 1.5s), paused
playback, repeated jumps after inspector dismissal, and saved reload of a Hook
picture override while body flags remained off. Jump/disclosure operations did
not submit media edits. Pointer and keyboard reorder, Undo/Redo, Remove from
Timing/Position, cross-category fallback and restoring both removed types passed.

Actual screenshot pixels at the same top-bar point change from black [0,0,0]
to video [253,253,0] when the video override is enabled; the center still shows
the video. Pending source-frame captures were allowed to settle before assessing
mixed layering. Laptop and 390px checks retain visible/touch-sized actions and
a 386px document width. The checkbox is inline and Remove remains available;
synthetic laptop proof is outside Git. No owner-session or saved-media edit.

Rebuilt current contracts/native bundle for the shared schema/tree. Full normal
browser-driven MP4 and actual touch hardware remain owner acceptance; no external
or headless browser, real inference, download, app export, configuration change,
Voyagenda operation or Git staging/commit/push. Temporary fixtures use hardcoded
fake/paid-off transports and zero plan/image/render requests.

Final verification: all scoped Prettier checks and repository diff whitespace
checks pass; the Git index remains empty. Settled mixed-layer screenshot pixels
show the opted-out picture over the bar [218,107,61] while the overlapping video
remains above it inside the square [253,253,0]. The final silent laptop capture
shows the inline checkbox, permanent Remove action and both Jump to controls.
The fixture was closed, its generated media and one-off launcher removed, and
all eight current/earlier fixture ports verified without listeners. The Codex
viewport override was reset and the normal owner tab preserved. Health, /start
and /api/sample/config return 200. The original frontend process remains in
place and the internal worker runs the rebuilt bundle. No Voyagenda changes.
