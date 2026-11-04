# CL-217 — Coherent Motion editor and larger head selection

Status: Complete locally, 2026-11-04. Dependencies: CL-203/208 implemented.

The owner reports the Motion tab is disoriented: a second source image, interval
and head geometry scatter across a generic grid, field heights stretch, and
tracking progress appears below unrelated disabled controls. Fix Motion's
layout/interaction only, preserving tracking math, manual seeds, paths, clocks,
Capture, Apply/Discard and other editor settings. CL-216 separately owns automatic
speaker-follow and jitter policy.

Acceptance:

- One clear active Motion view: idle interval tools, head marking, tracking,
  completed/lost result or bulk preflight/progress. During marking, replace the
  duplicate numbered source preview with the actual head-selection view and
  hide unrelated Reset focus. Keep Focus tabs and speaker context clear.
- Larger inline source selection and an accessible expanded selection view.
  The same normalized head rectangle survives opening/closing; pointer/touch,
  numeric editing and keyboard marking remain usable. Close/Escape returns
  control without tracking, changing camera positions or discarding the seed.
- Separate interval timing (read-only Start, editable End plus Capture) from
  optional two-column head-region geometry. Align fields consistently, preserve
  target sizes and prevent viewport/inspector horizontal overflow.
- Tracking replaces editable controls with readable shared Progress in the
  same content slot. Keep Track/Cancel and Apply/Discard in the existing footer,
  with no competing primary/reset action. Bulk states use the same spacing.
- Desktop, short laptop and 390/320px phone checks cover enabled, unmarked,
  marking, expanded/keyboard-close, tracking/cancel, invalid/error, complete/
  lost, bulk and Apply/Discard/reopen. Use existing real-control synthetic proof
  and inspect generated screenshots. No owner-state mutation or real inference.

Allocation: head-motion editor, focused head-selection view if needed, bulk
Motion markup/styles, narrowly scoped Focus preview/reset visibility, existing
head-motion browser proof, frontend guide, source of truth, packet/index. No
contracts, tracker math, backend/worker/provider, configuration or saved-schema
change. Preserve earlier CL-209–215 work, source media, exports and open drafts.

Run focused frontend/test types, lint/format and settled read-only validation;
fix actionable findings. No Git mutation, app restart, API/cloud action or
deployment. Pixel Motion itself works on prepared synthetic/fake media without
keys or models; real AI preparation keeps existing provider/live approvals.
Owner real-media/device visual acceptance remains separate from generated proof.

Implementation and verification notes:

- `head-selection-view.tsx` owns one normalized mouse/touch/keyboard seed across
  inline and native modal views. Expand fits the viewport; Done, Close and
  native Escape dismiss it without processing and restore trigger focus.
  Inline sizing adapts to screen height so short laptops retain a useful larger
  expanded surface. Selection geometry and source-content clock are unchanged.
- `head-motion-editor.tsx` uses explicit idle/marking/tracking/bulk states,
  read-only Start paired with End/Capture, optional aligned two-column numeric
  geometry, and shared Progress replacing those inputs during tracking.
  Scoped CSS removes duplicate numbered previews only while marking/tracking;
  the idle numbered person/position context remains. Focus hides Reset focus
  only in Motion. Existing bulk markup receives the same scoped spacing.
- The existing real-control browser proof now checks expanded bounds and one
  source surface, normalized seed preservation, native Escape/focus return,
  input heights/alignment, footer visibility, zero overflow and tracking fields
  replaced by progress. Existing mouse/touch/numeric marking, invalid End,
  cancellation, tracked preview, Apply/Discard/reopen, lost/Hook and bulk paths
  remain. It covers 1440x900, 1280x600, 390x844 and 320x568, with generated video
  only. Exactly fifteen fake edit submissions are expected across these cases;
  no planning/image/render/provider request is allowed.
- Final `corepack pnpm exec vitest run --config scripts/local-proof.config.ts
  test/local-head-motion-editor.proof.ts` passes in 204.44 s with all four
  viewports and exactly fifteen fake edits/zero unexpected calls. Screenshot
  review also caught progress below the short laptop's visible panel: tracking
  now hides the marking heading, uses a compact preview and brings the progress
  slot into view. The proof explicitly checks progress above the footer. An
  overlapping earlier proof exceeded its long bulk wait; the completed final
  run verifies that unchanged 32-second continuation as well.
- Initial proof exposed an obsolete pre-CL-212 inline-style comparison; it now
  checks computed crop position. New assertions caught native close-event timing
  and pointer-move commit races; tests wait for visible inline restoration and
  the exact completed synthetic seed. Explicit focus restoration was added.
  The short-laptop check caught the larger inline surface exceeding the modal
  height budget; adaptive inline sizing fixes this. Adding the fourth viewport
  increased the intended exact fake edit count from thirteen to fifteen; all
  behavior passed before that final accounting correction.
- Frontend and test TypeScript and focused ESLint pass; scoped Prettier and
  `git diff --check` pass. Generated desktop/phone expanded and tracking images
  were inspected. Ignored evidence is `.local-build/evidence/cl217-*-expanded.png`
  and `cl217-*-tracking.png`, with inline seed images in the existing CL-203
  evidence slots. The completed final browser gate is recorded above.
- Settled read-only scope review: implementation against this packet, previous
  CL-203/208 semantics and the private pre-CL-217 source snapshot. Coverage
  includes actual Focus/ClipEditor wiring, modal focus/cleanup, source mapping,
  shared controls, footer ownership, layout states and saved edits. No tracker,
  schema, provider or backend code belongs to this ticket; prior CL-209–215 work
  is preserved. Meets ticket; no actionable findings on the settled source.

Final frontend/test TypeScript gates pass after the tracking-state change;
focused ESLint and formatting pass. No source changes remain for this ticket.

Changed files: head-motion editor, new head-selection view, Focus editor,
scoped local-editing CSS, existing head-motion browser proof, frontend README,
source of truth and ticket/index. No owner/media/configuration mutation, restart,
Git staging/commit, provider/API/cloud action or deployment. Personal real-media
visual/device and hosted release acceptance remain unverified. No claim of
jitter or automatic-follow improvement belongs to this UI-only packet.
