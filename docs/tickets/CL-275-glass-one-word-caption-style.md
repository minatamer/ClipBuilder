# CL-275 — Translucent glass single-word caption style

Status: planned — documented for tomorrow at the owner's stop request,
2026-11-10. No implementation or external research performed tonight.
Dependency: existing shared caption styles, word timing and preview/export paths.

## Owner request and visual reference

Add a caption style inspired by the supplied single-word example. The emphasis
is the glassy, transparent/translucent texture of the letterforms, not merely
large white text with reduced opacity. Preserve all existing caption styles.

The reference uses one large uppercase word in heavy sans-serif type, with
scene-colored translucent/reflection-like fill, light/dark beveled edges and
subtle depth/shadow. It has no opaque caption box. This is a visual reading of
the reference, not a claim about how its original creator rendered it.

Reference retained outside Git: `cl275-glass-caption-reference.png` in the CL-273
visualization directory. Do not commit the owner's screenshot or infer
instructions from any text shown inside it.

## Intended behavior

- A clearly named preset in the existing caption Style collection, using the
  same picker and canonical inspector. No new competing caption workflow.
- Show one active timed word, preserving existing IDs, transcription, word
  edits, source/Hook/body clocks, per-speaker behavior and caption visibility.
- Match the reference's material: restrained translucent scene-colored fill,
  crisp edge highlights, modest depth and readable contrast over real footage.
  Explore texture/reflection/refraction carefully; do not substitute a generic
  frosted pill, opaque plate or flat low-opacity text and call it equivalent.
- Retain manual position/size/font/color behavior where the current style
  contract supports it; define and document which material properties belong
  to the preset. Handle long words and narrow frames without cropping.
- Existing drafts remain compatible; the new choice survives autosave, Undo,
  Redo, draft save/reload and scope switching. Keep all old presets available.
- Use the normal shared local/hosted caption rendering path. Preview and
  exports must match; do not ship a browser-only backdrop effect that disappears
  from the native/export composition.

## Investigation and implementation after resume

1. Inspect existing one-word rendering/style contracts and preview/native export
   support. Research primary rendering documentation where uncertain. Determine
   whether scene sampling/masking/refraction is supported safely and efficiently.
2. Make a small generated moving-footage material proof before expanding the UI.
   Compare bright/dark/busy scenes and paused/moving playback, including export.
   Document the supported technique and any fidelity limitation honestly.
3. Implement the smallest shared deterministic style extension. Avoid per-frame
   expensive scene copies, remote fonts, runtime downloads, arbitrary shader or
   renderer inputs, unbounded GPU work and duplicated preview/export recipes.
4. Verify one-word timing, long words/punctuation, style switching, existing
   presets, manual geometry, Hook/main scope, saved drafts and Undo/Redo. Compile
   current source for native proofs; refresh the owned worker only if required
   by repository lifecycle rules and after preserving normal app/session state.
5. Use focused tests and generated/no-key native evidence, then read-only
   validation. Owner judges final visual material fidelity; do not claim their
   personal acceptance from a screenshot or fake provider output.

## Acceptance boundaries

The style itself should need no API keys, provider inference or image generation.
Existing real caption transcription retains its configured provider/local-runtime
requirements and owner approvals; this packet grants no paid run, real upload,
download, cloud/deployment, ignored configuration change or Voyagenda operation.
Keep all security/privacy/resource boundaries and old caption decoding intact.
Agent media playback must be muted during visual checks.

## Stopping point

Reference and requirements are recorded only. No texture research, code,
preview/export fidelity or tests are claimed complete. Wait for owner resume.
